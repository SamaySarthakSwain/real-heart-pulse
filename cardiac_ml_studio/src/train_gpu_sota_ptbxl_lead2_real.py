import os
import sys
import time
import json
import numpy as np
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import Dataset, DataLoader
from sklearn.metrics import (roc_auc_score, average_precision_score, 
                             f1_score, precision_score, recall_score, 
                             confusion_matrix, brier_score_loss)

# Fix Windows stdout
try:
    sys.stdout.reconfigure(encoding='utf-8')
except Exception:
    pass

# =========================================================================
# 1. NATIVE SINGLE-LEAD (LEAD II) SE-RESNET-1D + BIGRU ARCHITECTURE
# =========================================================================

class SqueezeExcitation1D(nn.Module):
    """
    Squeeze-and-Excitation (SE) Block for 1D Physiological Waveforms.
    Dynamically weights feature channels based on global waveform context.
    """
    def __init__(self, channels, reduction=16):
        super().__init__()
        reduced_ch = max(4, channels // reduction)
        self.fc = nn.Sequential(
            nn.AdaptiveAvgPool1d(1),
            nn.Flatten(),
            nn.Linear(channels, reduced_ch),
            nn.ReLU(inplace=True),
            nn.Linear(reduced_ch, channels),
            nn.Sigmoid()
        )
        
    def forward(self, x):
        b, c, _ = x.shape
        w = self.fc(x).view(b, c, 1)
        return x * w

class ResidualBlock1D(nn.Module):
    """
    1D Residual Block with SE Channel Attention and skip-connection downsampling.
    """
    def __init__(self, in_channels, out_channels, stride=1, kernel_size=7):
        super().__init__()
        padding = (kernel_size - 1) // 2
        self.conv1 = nn.Conv1d(in_channels, out_channels, kernel_size, stride=stride, padding=padding, bias=False)
        self.bn1 = nn.BatchNorm1d(out_channels)
        self.relu = nn.ReLU(inplace=True)
        
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
        out = self.relu(self.bn1(self.conv1(x)))
        out = self.bn2(self.conv2(out))
        out = self.se(out)
        out += res
        return self.relu(out)

class SingleLead_SE_ResNet_GRU(nn.Module):
    """
    Native Single-Lead (Lead II) SE-ResNet-1D + BiGRU Multi-Label Diagnostic Model.
    Accepts (Batch, 1, 1000) Lead-II signals from AD8232 or PhysioNet PTB-XL.
    """
    def __init__(self, in_channels=1, num_classes=5):
        super().__init__()
        self.in_channels = in_channels
        self.stem = nn.Sequential(
            nn.Conv1d(in_channels, 64, kernel_size=15, stride=4, padding=7, bias=False),
            nn.BatchNorm1d(64),
            nn.ReLU(inplace=True)
        )
        
        self.stage1 = ResidualBlock1D(64, 64, stride=1, kernel_size=7)
        self.stage2 = ResidualBlock1D(64, 128, stride=2, kernel_size=7)
        self.stage3 = ResidualBlock1D(128, 256, stride=2, kernel_size=5)
        
        self.gru = nn.GRU(
            input_size=256,
            hidden_size=128,
            num_layers=1,
            batch_first=True,
            bidirectional=True
        )
        
        self.global_pool = nn.AdaptiveAvgPool1d(1)
        
        self.classifier = nn.Sequential(
            nn.Linear(256 + 256, 128),
            nn.ReLU(inplace=True),
            nn.Dropout(0.3),
            nn.Linear(128, num_classes)
        )
        
    def forward(self, x):
        # x: (B, 1, 1000)
        feat = self.stem(x)          # -> (B, 64, 250)
        feat = self.stage1(feat)     # -> (B, 64, 250)
        feat = self.stage2(feat)     # -> (B, 128, 125)
        feat = self.stage3(feat)     # -> (B, 256, 63)
        
        # Spatial morphology representation
        pooled_res = self.global_pool(feat).squeeze(-1) # (B, 256)
        
        # Temporal rhythm representation
        gru_in = feat.transpose(1, 2) # (B, 63, 256)
        gru_out, _ = self.gru(gru_in) # (B, 63, 256)
        pooled_gru = torch.mean(gru_out, dim=1) # (B, 256)
        
        # Joint fused representation
        combined = torch.cat([pooled_res, pooled_gru], dim=-1) # (B, 512)
        logits = self.classifier(combined)
        return logits

# =========================================================================
# 2. MULTI-LABEL FOCAL LOSS (SOLVES MINORITY HYPERTROPHY COLLAPSE)
# =========================================================================

class MultiLabelFocalLoss(nn.Module):
    """
    Multi-Label Focal Loss for biosignals:
    FL(p_t) = -alpha_t * (1 - p_t)^gamma * log(p_t)
    Down-weights easy samples (gamma=2.0) and forces gradient
    descent to focus on subtle pathologies (Hypertrophy, ST-T depression).
    """
    def __init__(self, gamma=2.0, alpha=0.35):
        super().__init__()
        self.gamma = gamma
        self.alpha = alpha
        
    def forward(self, logits, targets):
        probs = torch.sigmoid(logits)
        bce = nn.functional.binary_cross_entropy_with_logits(logits, targets, reduction='none')
        p_t = probs * targets + (1.0 - probs) * (1.0 - targets)
        focal_weight = (1.0 - p_t) ** self.gamma
        alpha_t = self.alpha * targets + (1.0 - self.alpha) * (1.0 - targets)
        loss = alpha_t * focal_weight * bce
        return loss.mean()

# =========================================================================
# 3. DATASET CLASS WITH AUGMENTATION
# =========================================================================

class RealPTBXLECGDataset(Dataset):
    def __init__(self, signals, labels, is_train=True):
        self.signals = torch.tensor(signals, dtype=torch.float32)
        self.labels = torch.tensor(labels, dtype=torch.float32)
        self.is_train = is_train
        
    def __len__(self):
        return len(self.signals)
        
    def __getitem__(self, idx):
        sig = self.signals[idx].clone() # (1, 1000)
        
        # Z-score normalize
        mean = torch.mean(sig)
        std = torch.std(sig)
        if std > 1e-5:
            sig = (sig - mean) / std
            
        if self.is_train:
            # 1. Subtle baseline wander (respiration 0.15 - 0.35 Hz)
            if np.random.rand() > 0.50:
                t = torch.linspace(0, 10, sig.shape[1])
                phase = np.random.uniform(0, 2*np.pi)
                freq = np.random.uniform(0.15, 0.35)
                amp = np.random.uniform(0.05, 0.15)
                wander = amp * torch.sin(2 * np.pi * freq * t + phase)
                sig = sig + wander.unsqueeze(0)
                
            # 2. EMG noise
            if np.random.rand() > 0.50:
                noise = torch.randn_like(sig) * np.random.uniform(0.01, 0.03)
                sig = sig + noise
                
            # 3. Small amplitude gain variation
            if np.random.rand() > 0.40:
                gain = np.random.uniform(0.90, 1.15)
                sig = sig * gain
                
        return sig, self.labels[idx]

# =========================================================================
# 4. TRAINING ROUTINE ON REAL PTB-XL
# =========================================================================

def train_real_ptbxl_model():
    total_start_time = time.time()
    base_dir = os.path.dirname(os.path.abspath(__file__))
    data_dir = os.path.join(base_dir, '..', 'data')
    models_dir = os.path.join(base_dir, '..', 'models')
    results_dir = os.path.join(base_dir, '..', 'results')
    os.makedirs(models_dir, exist_ok=True)
    os.makedirs(results_dir, exist_ok=True)
    
    npz_path = os.path.join(data_dir, 'ptbxl_lead2_all_21799.npz')
    if not os.path.exists(npz_path):
        raise FileNotFoundError(f"Missing {npz_path}. Run process_ptbxl_zip_to_npz.py first!")
        
    data = np.load(npz_path)
    signals = data['signals']
    labels = data['labels']
    folds = data['folds']
    classes = data['classes'].tolist()
    
    print("=================================================================")
    print("  TRAINING SOTA SE-RESNET-1D + BIGRU ON 100% REAL PTB-XL COHORT  ")
    print(f"  Total Authentic Records: {len(signals):,} | Classes: {classes}")
    print("=================================================================")
    
    # Official PhysioNet Partition:
    # Folds 1-8: Train (17,441 records)
    # Fold 9: Validation (2,183 records)
    # Fold 10: Test (2,198 records)
    train_idx = np.where(folds <= 8)[0]
    val_idx = np.where(folds == 9)[0]
    test_idx = np.where(folds == 10)[0]
    
    print(f"[+] Train Set: {len(train_idx):,} records (Folds 1-8)")
    print(f"[+] Val Set:   {len(val_idx):,} records (Fold 9)")
    print(f"[+] Test Set:  {len(test_idx):,} records (Fold 10)")
    
    device = torch.device('cuda:0' if torch.cuda.is_available() else 'cpu')
    print(f"[+] Compute Hardware: {device} ({torch.cuda.get_device_name(0) if torch.cuda.is_available() else 'CPU'})")
    
    batch_size = 64
    train_loader = DataLoader(
        RealPTBXLECGDataset(signals[train_idx], labels[train_idx], is_train=True),
        batch_size=batch_size, shuffle=True, pin_memory=True, num_workers=0
    )
    val_loader = DataLoader(
        RealPTBXLECGDataset(signals[val_idx], labels[val_idx], is_train=False),
        batch_size=batch_size, shuffle=False, pin_memory=True, num_workers=0
    )
    test_loader = DataLoader(
        RealPTBXLECGDataset(signals[test_idx], labels[test_idx], is_train=False),
        batch_size=batch_size, shuffle=False, pin_memory=True, num_workers=0
    )
    
    model = SingleLead_SE_ResNet_GRU(in_channels=1, num_classes=5).to(device)
    criterion = MultiLabelFocalLoss(gamma=2.0, alpha=0.35)
    optimizer = optim.AdamW(model.parameters(), lr=5e-4, weight_decay=1e-3)
    epochs = 15
    scheduler = optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=epochs, eta_min=1e-5)
    scaler = torch.amp.GradScaler('cuda') if device.type == 'cuda' else None
    
    best_val_loss = float('inf')
    best_weights_path = os.path.join(models_dir, 'sota_single_lead_se_resnet_gru.pt')
    
    print(f"\n[+] Starting Deep Learning Training ({epochs} Epochs on RTX 2050 GPU)...")
    
    for epoch in range(1, epochs + 1):
        t0 = time.time()
        model.train()
        train_loss = 0.0
        
        for bx, by in train_loader:
            bx, by = bx.to(device), by.to(device)
            optimizer.zero_grad()
            
            if scaler:
                with torch.amp.autocast('cuda'):
                    logits = model(bx)
                    loss = criterion(logits, by)
                scaler.scale(loss).backward()
                scaler.unscale_(optimizer)
                torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)
                scaler.step(optimizer)
                scaler.update()
            else:
                logits = model(bx)
                loss = criterion(logits, by)
                loss.backward()
                torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)
                optimizer.step()
                
            train_loss += loss.item() * len(bx)
            
        scheduler.step()
        train_loss /= len(train_idx)
        
        # Validation
        model.eval()
        val_loss = 0.0
        val_preds, val_targets = [], []
        with torch.no_grad():
            for bx, by in val_loader:
                bx, by = bx.to(device), by.to(device)
                if scaler:
                    with torch.amp.autocast('cuda'):
                        logits = model(bx)
                        loss = criterion(logits, by)
                else:
                    logits = model(bx)
                    loss = criterion(logits, by)
                val_loss += loss.item() * len(bx)
                probs = torch.sigmoid(logits)
                val_preds.append(probs.cpu().numpy())
                val_targets.append(by.cpu().numpy())
                
        val_loss /= len(val_idx)
        val_preds = np.vstack(val_preds)
        val_targets = np.vstack(val_targets)
        val_auc = roc_auc_score(val_targets, val_preds, average='macro')
        
        elapsed = time.time() - t0
        print(f"  Epoch [{epoch:02d}/{epochs:02d}] ({elapsed:.1f}s) | Train Loss: {train_loss:.4f} | Val Loss: {val_loss:.4f} | Val Macro-AUC: {val_auc:.4f}")
        
        if val_loss < best_val_loss:
            best_val_loss = val_loss
            torch.save(model.state_dict(), best_weights_path)
            
    print(f"\n[✓] Training complete. Best weights saved to: {best_weights_path}")
    
    # Evaluate on Unseen Test Set (Fold 10)
    print("\n=================================================================")
    print("  EVALUATING ON UNSEEN PTB-XL FOLD 10 (2,198 REAL PATIENT ECGs)   ")
    print("=================================================================")
    model.load_state_dict(torch.load(best_weights_path, map_location=device))
    model.eval()
    
    test_preds, test_targets = [], []
    with torch.no_grad():
        for bx, by in test_loader:
            bx, by = bx.to(device), by.to(device)
            with torch.amp.autocast('cuda') if scaler else torch.no_grad():
                logits = model(bx)
            probs = torch.sigmoid(logits)
            test_preds.append(probs.cpu().numpy())
            test_targets.append(by.cpu().numpy())
            
    test_preds = np.vstack(test_preds)
    test_targets = np.vstack(test_targets)
    
    # Optimize threshold per class on validation set, evaluate on test set
    metrics_report = {}
    optimal_thresholds = {}
    
    for c_idx, c_name in enumerate(classes):
        y_true = test_targets[:, c_idx]
        y_prob = test_preds[:, c_idx]
        
        # Grid search threshold on validation set
        y_val_t = val_targets[:, c_idx]
        y_val_p = val_preds[:, c_idx]
        best_th = 0.50
        best_f1 = 0.0
        for th in np.arange(0.20, 0.70, 0.02):
            score = f1_score(y_val_t, (y_val_p >= th).astype(int), zero_division=0)
            if score > best_f1:
                best_f1 = score
                best_th = round(float(th), 2)
                
        optimal_thresholds[c_name] = best_th
        y_pred = (y_prob >= best_th).astype(int)
        
        roc_auc = float(roc_auc_score(y_true, y_prob))
        pr_auc = float(average_precision_score(y_true, y_prob))
        f1 = float(f1_score(y_true, y_pred, zero_division=0))
        sens = float(recall_score(y_true, y_pred, zero_division=0))
        spec = float(confusion_matrix(y_true, y_pred).ravel()[0] / (confusion_matrix(y_true, y_pred).ravel()[0] + confusion_matrix(y_true, y_pred).ravel()[1])) if len(confusion_matrix(y_true, y_pred).ravel()) == 4 else 0.0
        tn, fp, fn, tp = confusion_matrix(y_true, y_pred).ravel()
        
        metrics_report[c_name] = {
            "ROC-AUC": round(roc_auc, 4),
            "PR-AUC": round(pr_auc, 4),
            "Optimal_Threshold": best_th,
            "F1": round(f1, 4),
            "Sensitivity": round(sens, 4),
            "Specificity": round(spec, 4),
            "True_Positives": int(tp),
            "False_Negatives": int(fn),
            "True_Negatives": int(tn),
            "False_Positives": int(fp)
        }
        
        print(f"  Class {c_name:5s} | ROC-AUC: {roc_auc:.4f} | PR-AUC: {pr_auc:.4f} | F1: {f1:.4f} | Sens: {sens:.4f} | Spec: {spec:.4f} (Th={best_th})")
        
    macro_roc = float(np.mean([m["ROC-AUC"] for m in metrics_report.values()]))
    macro_pr = float(np.mean([m["PR-AUC"] for m in metrics_report.values()]))
    macro_f1 = float(np.mean([m["F1"] for m in metrics_report.values()]))
    
    print("-----------------------------------------------------------------")
    print(f"  AUTHENTIC PTB-XL TEST BENCHMARK: Macro ROC-AUC: {macro_roc:.4f} | Macro PR-AUC: {macro_pr:.4f} | Macro F1: {macro_f1:.4f}")
    print("=================================================================")
    
    # Save optimal thresholds & test metrics
    th_path = os.path.join(models_dir, 'single_lead_optimal_thresholds.json')
    with open(th_path, 'w', encoding='utf-8') as f:
        json.dump(optimal_thresholds, f, indent=2)
        
    out_results_path = os.path.join(results_dir, 'sota_single_lead_real_ptbxl_metrics.json')
    with open(out_results_path, 'w', encoding='utf-8') as f:
        json.dump(metrics_report, f, indent=2)
        
    print(f"[✓] Saved thresholds to: {th_path}")
    print(f"[✓] Saved test metrics to: {out_results_path}")
    print(f"[✓] Entire PTB-XL Real Deep Learning Pipeline finished in {time.time()-total_start_time:.1f}s")
    return metrics_report

if __name__ == '__main__':
    train_real_ptbxl_model()
