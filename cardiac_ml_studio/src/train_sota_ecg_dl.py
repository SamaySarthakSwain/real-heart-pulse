import os
import sys
import time
import json
import numpy as np
import pandas as pd
import wfdb
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import Dataset, DataLoader
from sklearn.metrics import roc_auc_score, average_precision_score, f1_score, precision_score, recall_score
from tqdm import tqdm
import warnings
warnings.filterwarnings('ignore')

# Fix stdout encoding for Windows
try:
    sys.stdout.reconfigure(encoding='utf-8')
except Exception:
    pass

# Optimize CPU parallelism
num_threads = min(8, os.cpu_count() or 4)
torch.set_num_threads(num_threads)

# =========================================================================
# 1. HOSPITAL-GRADE ARCHITECTURE: SE-RESNET-1D + BIDIRECTIONAL GRU
# =========================================================================

class SqueezeExcitation1D(nn.Module):
    """
    Squeeze-and-Excitation (SE) Attention Block for 1D Physiological Waveforms.
    Dynamically re-weights the physiological relevance of each ECG lead / channel.
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
    1D Residual Block with Squeeze-and-Excitation Channel Attention
    and projection skip-connections for downsampling.
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
        
        # Shortcut connection
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

class SOTA_SE_ResNet_GRU(nn.Module):
    """
    State-of-the-Art Hybrid Deep Learning Model for Continuous Biomedical ECG Streams:
    - 1D ResNet with SE Channel Attention captures fine morphological wave details (P, QRS, T, ST).
    - Bi-directional GRU captures macroscopic cardiac rhythm, arrhythmia, and temporal dynamics.
    - Global Adaptive Pooling + Dropout + Linear Classification Head.
    """
    def __init__(self, in_channels=12, num_classes=5):
        super().__init__()
        # Initial receptive field
        self.stem = nn.Sequential(
            nn.Conv1d(in_channels, 64, kernel_size=15, stride=2, padding=7, bias=False),
            nn.BatchNorm1d(64),
            nn.ReLU(inplace=True),
            nn.MaxPool1d(kernel_size=3, stride=2, padding=1)
        )
        
        # Multi-scale Residual stages
        self.stage1 = ResidualBlock1D(64, 64, stride=1)
        self.stage2 = ResidualBlock1D(64, 128, stride=2)
        self.stage3 = ResidualBlock1D(128, 256, stride=2)
        
        # Bi-directional GRU temporal rhythm aggregator
        self.gru = nn.GRU(
            input_size=256,
            hidden_size=128,
            num_layers=1,
            batch_first=True,
            bidirectional=True
        )
        
        self.global_pool = nn.AdaptiveAvgPool1d(1)
        
        self.classifier = nn.Sequential(
            nn.Linear(256 + 256, 128), # ResNet pooled features + BiGRU output
            nn.ReLU(inplace=True),
            nn.Dropout(0.4),
            nn.Linear(128, num_classes)
        )
        
    def forward(self, x):
        # x shape: (B, 12, 1000)
        feat = self.stem(x)          # -> (B, 64, 250)
        feat = self.stage1(feat)     # -> (B, 64, 250)
        feat = self.stage2(feat)     # -> (B, 128, 125)
        feat = self.stage3(feat)     # -> (B, 256, 63)
        
        # Residual pooling branch
        pooled_res = self.global_pool(feat).squeeze(-1) # (B, 256)
        
        # BiGRU branch: transpose to (B, Time, Channels)
        gru_in = feat.transpose(1, 2) # (B, 63, 256)
        gru_out, _ = self.gru(gru_in) # (B, 63, 256)
        pooled_gru = torch.mean(gru_out, dim=1) # (B, 256)
        
        # Concatenate spatial morphology and temporal rhythm
        combined = torch.cat([pooled_res, pooled_gru], dim=-1) # (B, 512)
        logits = self.classifier(combined)
        return logits

# =========================================================================
# 2. SENSOR-SPECIFIC DATA AUGMENTATION FOR HARDWARE REALISM
# =========================================================================

class SensorECGDataset(Dataset):
    """
    Dataset wrapper with real-time physiological augmentations simulating
    AD8232 ESP32 sensor hardware conditions:
    - Baseline respiration wander
    - Motion jitter
    - Random lead dropout
    """
    def __init__(self, signals, labels, is_train=True):
        self.signals = torch.tensor(signals, dtype=torch.float32)
        self.labels = torch.tensor(labels, dtype=torch.float32)
        self.is_train = is_train
        
    def __len__(self):
        return len(self.signals)
        
    def __getitem__(self, idx):
        sig = self.signals[idx].clone() # Shape: (12, 1000)
        
        if self.is_train:
            # 1. Baseline wander simulation (low-frequency drift 0.2 Hz)
            if np.random.rand() > 0.5:
                t = torch.linspace(0, 10, sig.shape[1])
                wander = 0.3 * torch.sin(2 * np.pi * 0.2 * t + np.random.uniform(0, 2*np.pi))
                sig = sig + wander.unsqueeze(0)
                
            # 2. High-frequency muscle tremor noise
            if np.random.rand() > 0.5:
                noise = torch.randn_like(sig) * 0.05
                sig = sig + noise
                
            # 3. Single-Lead / Lead-dropout simulation (e.g. AD8232 only reading Lead I)
            if np.random.rand() > 0.7:
                # Mask 1 to 3 random channels
                mask_idx = np.random.choice(12, size=2, replace=False)
                sig[mask_idx] = 0.0
                
        return sig, self.labels[idx]

# =========================================================================
# 3. TRAINING & EVALUATION LOOP WITH LIVE TIMING / ETA
# =========================================================================

def train_sota_ecg_pipeline():
    total_start_time = time.time()
    print("=================================================================")
    print("   SOTA DEEP LEARNING ECG PIPELINE (SE-ResNet-1D + Bi-GRU)      ")
    print("=================================================================")
    
    base_dir = os.path.dirname(os.path.abspath(__file__))
    data_dir = os.path.join(base_dir, '..', 'data', 'ptbxl_full', 'ptb-xl-a-large-publicly-available-electrocardiography-dataset-1.0.1')
    metadata_path = os.path.join(data_dir, 'cleaned_metadata.csv')
    models_dir = os.path.join(base_dir, '..', 'models')
    results_dir = os.path.join(base_dir, '..', 'results')
    os.makedirs(models_dir, exist_ok=True)
    os.makedirs(results_dir, exist_ok=True)
    
    if not os.path.exists(metadata_path):
        print(f"Error: {metadata_path} not found.")
        return
        
    df = pd.read_csv(metadata_path)
    all_classes = ['NORM', 'MI', 'STTC', 'CD', 'HYP']
    print(f"[+] Loaded metadata with {len(df)} records. Diagnostic Superclasses: {all_classes}")
    
    # Stratified partition
    # To ensure high training speed and optimal CPU execution, take representative stratified patient cohort
    train_df = df[df['strat_fold'] <= 8].sample(n=min(3200, len(df[df['strat_fold'] <= 8])), random_state=42)
    val_df = df[df['strat_fold'] == 9].sample(n=min(600, len(df[df['strat_fold'] == 9])), random_state=42)
    test_df = df[df['strat_fold'] == 10].sample(n=min(600, len(df[df['strat_fold'] == 10])), random_state=42)
    
    print(f"[+] Fast High-Fidelity Cohort: Train={len(train_df)}, Val={len(val_df)}, Test={len(test_df)}")
    
    def load_signals(sub_df):
        sigs = []
        for fn in sub_df['filename_hr']:
            fp = os.path.join(data_dir, fn)
            s, _ = wfdb.rdsamp(fp)
            s = s.T # (12, 1000)
            mean = np.mean(s, axis=1, keepdims=True)
            std = np.std(s, axis=1, keepdims=True)
            std[std == 0] = 1e-6
            s = (s - mean) / std
            sigs.append(s)
        return np.array(sigs, dtype=np.float32)

    print("\n[+] Loading & Preprocessing Waveforms...")
    t0 = time.time()
    X_train = load_signals(train_df)
    y_train = train_df[all_classes].values.astype(np.float32)
    
    X_val = load_signals(val_df)
    y_val = val_df[all_classes].values.astype(np.float32)
    
    X_test = load_signals(test_df)
    y_test = test_df[all_classes].values.astype(np.float32)
    print(f"[+] Loaded {len(X_train) + len(X_val) + len(X_test)} ECG waveforms in {time.time()-t0:.1f}s.")
    
    # Class positive weights for multi-label loss
    pos_weights = []
    for i in range(len(all_classes)):
        pos_cnt = y_train[:, i].sum()
        neg_cnt = len(y_train) - pos_cnt
        pos_weights.append(neg_cnt / (pos_cnt + 1e-5))
    pos_weights_t = torch.tensor(pos_weights, dtype=torch.float32)
    
    # Datasets and Loaders
    batch_size = 64
    train_ds = SensorECGDataset(X_train, y_train, is_train=True)
    val_ds = SensorECGDataset(X_val, y_val, is_train=False)
    test_ds = SensorECGDataset(X_test, y_test, is_train=False)
    
    train_loader = DataLoader(train_ds, batch_size=batch_size, shuffle=True)
    val_loader = DataLoader(val_ds, batch_size=batch_size, shuffle=False)
    test_loader = DataLoader(test_ds, batch_size=batch_size, shuffle=False)
    
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    print(f"[+] Target Computation Device: {device} (Thread count: {num_threads})")
    
    model = SOTA_SE_ResNet_GRU(in_channels=12, num_classes=5).to(device)
    criterion = nn.BCEWithLogitsLoss(pos_weight=pos_weights_t.to(device))
    optimizer = optim.AdamW(model.parameters(), lr=1.5e-3, weight_decay=1e-3)
    scheduler = optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=12)
    
    epochs = 12
    best_val_auc = 0.0
    best_model_path = os.path.join(models_dir, 'sota_se_resnet_gru.pt')
    
    print("\n[+] Commencing High-End Training Loop with Live Timing & ETA Updates...")
    epoch_times = []
    
    for epoch in range(1, epochs + 1):
        epoch_start = time.time()
        model.train()
        train_loss = 0.0
        
        for inputs, targets in train_loader:
            inputs, targets = inputs.to(device), targets.to(device)
            optimizer.zero_grad()
            outputs = model(inputs)
            loss = criterion(outputs, targets)
            loss.backward()
            torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=2.0)
            optimizer.step()
            train_loss += loss.item() * len(inputs)
            
        scheduler.step()
        train_loss /= len(train_loader.dataset)
        
        # Validation
        model.eval()
        val_probs, val_true = [], []
        with torch.no_grad():
            for inputs, targets in val_loader:
                inputs = inputs.to(device)
                outputs = model(inputs)
                probs = torch.sigmoid(outputs).cpu().numpy()
                val_probs.append(probs)
                val_true.append(targets.numpy())
                
        val_probs = np.vstack(val_probs)
        val_true = np.vstack(val_true)
        
        # Calculate macro ROC-AUC
        aucs = [roc_auc_score(val_true[:, i], val_probs[:, i]) for i in range(5)]
        mean_val_auc = float(np.mean(aucs))
        
        epoch_time = time.time() - epoch_start
        epoch_times.append(epoch_time)
        avg_epoch_time = np.mean(epoch_times)
        remaining_epochs = epochs - epoch
        eta_seconds = remaining_epochs * avg_epoch_time
        eta_str = f"{int(eta_seconds // 60)}m {int(eta_seconds % 60):02d}s" if remaining_epochs > 0 else "0m 00s (Finished)"
        
        # Checkpointing
        if mean_val_auc > best_val_auc:
            best_val_auc = mean_val_auc
            torch.save(model.state_dict(), best_model_path)
            saved_flag = " [* BEST CHECKPOINT SAVED]"
        else:
            saved_flag = ""
            
        print(f" -> Epoch [{epoch:2d}/{epochs:2d}] | Train Loss: {train_loss:.4f} | Val ROC-AUC: {mean_val_auc:.4f} | Time: {epoch_time:.1f}s | ETA: {eta_str}{saved_flag}")
        
    print(f"\n[+] Training Complete. Loading best model for Test Cohort Evaluation...")
    model.load_state_dict(torch.load(best_model_path, map_location=device))
    model.eval()
    
    test_probs, test_true = [], []
    with torch.no_grad():
        for inputs, targets in test_loader:
            inputs = inputs.to(device)
            outputs = model(inputs)
            probs = torch.sigmoid(outputs).cpu().numpy()
            test_probs.append(probs)
            test_true.append(targets.numpy())
            
    test_probs = np.vstack(test_probs)
    test_true = np.vstack(test_true)
    
    # Compute Final Test Metrics
    test_results = {}
    print("\n=======================================================")
    print("   [FINAL UNSEEN TEST EVALUATION: SE-ResNet-1D + BiGRU]")
    print("=======================================================")
    for i, cls_name in enumerate(all_classes):
        auc_val = float(roc_auc_score(test_true[:, i], test_probs[:, i]))
        prauc_val = float(average_precision_score(test_true[:, i], test_probs[:, i]))
        pred_bin = (test_probs[:, i] >= 0.5).astype(int)
        f1_val = float(f1_score(test_true[:, i], pred_bin, zero_division=0))
        sens_val = float(recall_score(test_true[:, i], pred_bin, zero_division=0))
        spec_val = float(recall_score(1 - test_true[:, i], 1 - pred_bin, zero_division=0))
        
        test_results[cls_name] = {
            "ROC-AUC": auc_val,
            "PR-AUC": prauc_val,
            "F1": f1_val,
            "Sensitivity": sens_val,
            "Specificity": spec_val
        }
        print(f" -> Class: {cls_name:5s} | ROC-AUC: {auc_val:.4f} | PR-AUC: {prauc_val:.4f} | F1: {f1_val:.4f} | Sens: {sens_val*100:.1f}% | Spec: {spec_val*100:.1f}%")
        
    macro_auc = np.mean([v["ROC-AUC"] for v in test_results.values()])
    print(f"\n[+] Overall Macro Average ROC-AUC: {macro_auc:.4f}")
    print(f"=======================================================")
    
    # Save SOTA DL Metrics JSON
    dl_metrics_path = os.path.join(results_dir, 'sota_deep_learning_metrics.json')
    with open(dl_metrics_path, 'w') as f:
        json.dump(test_results, f, indent=4)
        
    # Update central ML model Summary.md
    try:
        from summary_updater import update_summary_registry
        update_summary_registry(
            model_name="Hospital-Grade SOTA ECG Model (SE-ResNet-1D + Bi-directional GRU)",
            architecture="1D Residual Convolutional Network with Squeeze-and-Excitation Lead Attention and Bidirectional GRU Rhythm Aggregation",
            dataset_name="PTB-XL ECG Diagnostic Database (Multi-Label 5 Superclasses)",
            metrics={"Macro ROC-AUC": macro_auc, "MI ROC-AUC": test_results["MI"]["ROC-AUC"], "STTC ROC-AUC": test_results["STTC"]["ROC-AUC"], "NORM ROC-AUC": test_results["NORM"]["ROC-AUC"]},
            model_artifact_path=best_model_path,
            additional_notes="Features lead-dropout and baseline wander sensor augmentations. Serialized to models/sota_se_resnet_gru.pt"
        )
    except Exception as e:
        print(f"Summary update note: {e}")
        
    print(f"\n[+] Pipeline completed in {(time.time() - total_start_time)/60:.1f} minutes.")
    return test_results

if __name__ == "__main__":
    train_sota_ecg_pipeline()
