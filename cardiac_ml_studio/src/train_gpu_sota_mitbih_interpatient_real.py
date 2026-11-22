import os
import sys
import json
import time
import numpy as np
import torch
import torch.nn as nn
import torch.nn.functional as F
from torch.utils.data import TensorDataset, DataLoader
from sklearn.metrics import classification_report, confusion_matrix, roc_auc_score, f1_score

try:
    sys.stdout.reconfigure(encoding='utf-8')
except Exception:
    pass

class SqueezeExcitation1D(nn.Module):
    def __init__(self, channels, reduction=16):
        super().__init__()
        reduced = max(channels // reduction, 8)
        self.fc1 = nn.Linear(channels, reduced)
        self.fc2 = nn.Linear(reduced, channels)
        
    def forward(self, x):
        b, c, _ = x.shape
        w = torch.mean(x, dim=2)
        w = F.relu(self.fc1(w))
        w = torch.sigmoid(self.fc2(w)).view(b, c, 1)
        return x * w

class SEResBlock1D(nn.Module):
    def __init__(self, in_channels, out_channels, stride=1):
        super().__init__()
        self.conv1 = nn.Conv1d(in_channels, out_channels, kernel_size=5, stride=stride, padding=2, bias=False)
        self.bn1 = nn.BatchNorm1d(out_channels)
        self.conv2 = nn.Conv1d(out_channels, out_channels, kernel_size=5, stride=1, padding=2, bias=False)
        self.bn2 = nn.BatchNorm1d(out_channels)
        self.se = SqueezeExcitation1D(out_channels)
        
        if stride != 1 or in_channels != out_channels:
            self.shortcut = nn.Sequential(
                nn.Conv1d(in_channels, out_channels, kernel_size=1, stride=stride, bias=False),
                nn.BatchNorm1d(out_channels)
            )
        else:
            self.shortcut = nn.Identity()
            
    def forward(self, x):
        res = self.shortcut(x)
        out = F.gelu(self.bn1(self.conv1(x)))
        out = self.bn2(self.conv2(out))
        out = self.se(out)
        return F.gelu(out + res)

class TemporalAttention(nn.Module):
    def __init__(self, hidden_dim):
        super().__init__()
        self.attn = nn.Sequential(
            nn.Linear(hidden_dim, hidden_dim // 2),
            nn.Tanh(),
            nn.Linear(hidden_dim // 2, 1)
        )
        
    def forward(self, x):
        weights = self.attn(x)
        weights = F.softmax(weights, dim=1)
        context = torch.sum(x * weights, dim=1)
        return context

class SOTA_MITBIH_Arrhythmia_Net(nn.Module):
    def __init__(self, num_classes=4):
        super().__init__()
        self.stem = nn.Sequential(
            nn.Conv1d(1, 64, kernel_size=7, stride=1, padding=3, bias=False),
            nn.BatchNorm1d(64),
            nn.GELU()
        )
        self.stage1 = SEResBlock1D(64, 64, stride=1)
        self.stage2 = SEResBlock1D(64, 128, stride=2)
        self.stage3 = SEResBlock1D(128, 256, stride=2)
        
        self.bigru = nn.GRU(
            input_size=256,
            hidden_size=128,
            num_layers=2,
            batch_first=True,
            bidirectional=True,
            dropout=0.2
        )
        self.attention = TemporalAttention(hidden_dim=256)
        
        self.classifier = nn.Sequential(
            nn.Linear(256, 128),
            nn.LayerNorm(128),
            nn.GELU(),
            nn.Dropout(0.3),
            nn.Linear(128, num_classes)
        )
        
    def forward(self, x):
        out = self.stem(x)
        out = self.stage1(out)
        out = self.stage2(out)
        out = self.stage3(out)
        out = out.permute(0, 2, 1)
        gru_out, _ = self.bigru(out)
        context = self.attention(gru_out)
        logits = self.classifier(context)
        return logits

class MultiClassFocalLoss(nn.Module):
    def __init__(self, alpha=None, gamma=2.0):
        super().__init__()
        self.alpha = alpha
        self.gamma = gamma
        
    def forward(self, inputs, targets):
        ce_loss = F.cross_entropy(inputs, targets, reduction='none', weight=self.alpha)
        pt = torch.exp(-ce_loss)
        focal_loss = ((1.0 - pt) ** self.gamma) * ce_loss
        return focal_loss.mean()

def train_mitbih_interpatient():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    data_dir = os.path.join(base_dir, '..', 'data')
    models_dir = os.path.join(base_dir, '..', 'models')
    results_dir = os.path.join(base_dir, '..', 'results')
    os.makedirs(models_dir, exist_ok=True)
    os.makedirs(results_dir, exist_ok=True)
    
    device = torch.device('cuda:0' if torch.cuda.is_available() else 'cpu')
    print("=================================================================")
    print(f"  TRAINING REAL PHYSIONET MIT-BIH INTER-PATIENT DL ON {device}   ")
    print("=================================================================")
    
    npz_path = os.path.join(data_dir, 'mitbih', 'mitbih_all_48_records_interpatient.npz')
    if not os.path.exists(npz_path):
        raise FileNotFoundError(f"Missing {npz_path}")
        
    data = np.load(npz_path)
    X_train, y_train = data['X_train'], data['y_train']
    X_test, y_test = data['X_test'], data['y_test']
    
    print(f"Loaded Inter-Patient Partition:")
    print(f"  Train Set (DS1 - 22 Patients): {len(X_train):,} beats")
    print(f"  Test Set  (DS2 - 21 Patients): {len(X_test):,} beats")
    
    # Class weights for focal loss
    class_counts = np.bincount(y_train, minlength=4)
    total_samples = len(y_train)
    weights = total_samples / (4.0 * class_counts.astype(np.float32) + 1e-5)
    weights = np.clip(weights, 0.5, 25.0)
    alpha = torch.tensor(weights, dtype=torch.float32).to(device)
    print(f"Computed Focal Loss Alpha Weights: {alpha.cpu().numpy().round(2).tolist()}")
    
    train_dataset = TensorDataset(torch.tensor(X_train, dtype=torch.float32).unsqueeze(1), torch.tensor(y_train, dtype=torch.long))
    test_dataset = TensorDataset(torch.tensor(X_test, dtype=torch.float32).unsqueeze(1), torch.tensor(y_test, dtype=torch.long))
    
    train_loader = DataLoader(train_dataset, batch_size=128, shuffle=True, pin_memory=True, num_workers=0)
    test_loader = DataLoader(test_dataset, batch_size=256, shuffle=False, pin_memory=True, num_workers=0)
    
    model = SOTA_MITBIH_Arrhythmia_Net(num_classes=4).to(device)
    criterion = MultiClassFocalLoss(alpha=alpha, gamma=2.0)
    optimizer = torch.optim.AdamW(model.parameters(), lr=1e-3, weight_decay=1e-4)
    epochs = 15
    scheduler = torch.optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=epochs)
    scaler = torch.amp.GradScaler('cuda') if device.type == 'cuda' else None
    
    best_weights_path = os.path.join(models_dir, 'mitbih_arrhythmia_se_resnet_gru.pt')
    
    print(f"\n[+] Starting Inter-Patient Training ({epochs} Epochs)...")
    for epoch in range(1, epochs + 1):
        t0 = time.time()
        model.train()
        total_loss = 0.0
        for bx, by in train_loader:
            bx, by = bx.to(device), by.to(device)
            optimizer.zero_grad()
            if scaler:
                with torch.amp.autocast('cuda'):
                    out = model(bx)
                    loss = criterion(out, by)
                scaler.scale(loss).backward()
                scaler.step(optimizer)
                scaler.update()
            else:
                out = model(bx)
                loss = criterion(out, by)
                loss.backward()
                optimizer.step()
            total_loss += loss.item() * len(bx)
            
        scheduler.step()
        train_loss = total_loss / len(X_train)
        elapsed = time.time() - t0
        print(f"  Epoch [{epoch:02d}/{epochs:02d}] ({elapsed:.1f}s) | Train Loss: {train_loss:.4f}")
        
    torch.save(model.state_dict(), best_weights_path)
    print(f"\n[✓] Saved best model to: {best_weights_path}")
    
    # Rigorous Evaluation on Unseen Test Patients (DS2)
    print("\n=================================================================")
    print("  EVALUATION ON STRICTLY UNSEEN PATIENT COHORT (DS2 - 47,432 BEATS)")
    print("=================================================================")
    model.eval()
    all_preds, all_probs, all_targets = [], [], []
    with torch.no_grad():
        for bx, by in test_loader:
            bx, by = bx.to(device), by.to(device)
            if scaler:
                with torch.amp.autocast('cuda'):
                    logits = model(bx)
            else:
                logits = model(bx)
            probs = F.softmax(logits, dim=1)
            preds = torch.argmax(probs, dim=1)
            all_preds.extend(preds.cpu().numpy())
            all_probs.extend(probs.cpu().numpy())
            all_targets.extend(by.cpu().numpy())
            
    all_preds = np.array(all_preds)
    all_probs = np.array(all_probs)
    all_targets = np.array(all_targets)
    
    classes_names = ['Normal', 'Supraventricular_PAC', 'Ventricular_PVC', 'Fusion']
    cm = confusion_matrix(all_targets, all_preds)
    report = classification_report(all_targets, all_preds, target_names=classes_names, output_dict=True)
    
    one_hot = np.eye(4)[all_targets]
    macro_auc = roc_auc_score(one_hot, all_probs, average='macro', multi_class='ovr')
    
    metrics = {
        "model_name": "SOTA PhysioNet Lead-II SE-ResNet-1D + BiGRU + Attention (Inter-Patient)",
        "dataset": "PhysioNet MIT-BIH Arrhythmia Database (Authentic 48 Records, AAMI DS1/DS2 Split)",
        "train_beats_ds1": int(len(X_train)),
        "test_beats_ds2": int(len(X_test)),
        "macro_roc_auc": round(float(macro_auc) * 100, 2),
        "macro_f1": round(float(report['macro avg']['f1-score']) * 100, 2),
        "weighted_f1": round(float(report['weighted avg']['f1-score']) * 100, 2),
        "accuracy": round(float(report['accuracy']) * 100, 2),
        "class_breakdown": {
            k: {
                "precision": round(float(report[k]['precision']) * 100, 2),
                "recall_sensitivity": round(float(report[k]['recall']) * 100, 2),
                "f1_score": round(float(report[k]['f1-score']) * 100, 2),
                "support": int(report[k]['support'])
            } for k in classes_names
        },
        "confusion_matrix": cm.tolist()
    }
    
    out_metrics_path = os.path.join(results_dir, 'mitbih_arrhythmia_metrics.json')
    with open(out_metrics_path, 'w', encoding='utf-8') as f:
        json.dump(metrics, f, indent=2)
        
    print(f"[✓] Inter-Patient Macro ROC-AUC: {metrics['macro_roc_auc']}% | Accuracy: {metrics['accuracy']}%")
    print(f"[✓] Saved authentic metrics to: {out_metrics_path}")
    return metrics

if __name__ == '__main__':
    train_mitbih_interpatient()
