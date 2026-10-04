import os
import wfdb
import numpy as np
import pandas as pd
import json
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import TensorDataset, DataLoader
from sklearn.metrics import (accuracy_score, precision_score, recall_score, 
                             f1_score, roc_auc_score, average_precision_score, confusion_matrix)
from tqdm import tqdm
import warnings
warnings.filterwarnings('ignore')

# ---------------------------------------------------------
# STEP 12: DEEP LEARNING ARCHITECTURE (1D-CNN)
# ---------------------------------------------------------
class ECG_1D_CNN(nn.Module):
    def __init__(self, num_classes=5):
        super(ECG_1D_CNN, self).__init__()
        # Input: (Batch, 12 channels, 1000 samples)
        self.features = nn.Sequential(
            nn.Conv1d(12, 64, kernel_size=7, stride=2, padding=3),
            nn.BatchNorm1d(64),
            nn.ReLU(),
            nn.MaxPool1d(kernel_size=3, stride=2, padding=1),
            
            nn.Conv1d(64, 128, kernel_size=5, stride=1, padding=2),
            nn.BatchNorm1d(128),
            nn.ReLU(),
            nn.MaxPool1d(kernel_size=3, stride=2, padding=1),
            
            nn.Conv1d(128, 256, kernel_size=3, stride=1, padding=1),
            nn.BatchNorm1d(256),
            nn.ReLU(),
            
            nn.Conv1d(256, 256, kernel_size=3, stride=1, padding=1),
            nn.BatchNorm1d(256),
            nn.ReLU(),
            nn.MaxPool1d(kernel_size=3, stride=2, padding=1)
        )
        self.global_pool = nn.AdaptiveAvgPool1d(1)
        self.classifier = nn.Sequential(
            nn.Linear(256, 128),
            nn.ReLU(),
            nn.Dropout(0.5),
            nn.Linear(128, num_classes)
        )

    def forward(self, x):
        x = self.features(x)
        x = self.global_pool(x).squeeze(-1)
        x = self.classifier(x)
        return x

# ---------------------------------------------------------
# STEP 5: SIGNAL PROCESSING (LOADER)
# ---------------------------------------------------------
def load_and_preprocess_signals(df, base_path):
    print("Loading and preprocessing raw WFDB signals... This will take a moment.")
    signals = []
    
    # Use tqdm to show progress
    for filename in tqdm(df['filename_hr'], desc="Loading Waveforms"):
        filepath = os.path.join(base_path, filename)
        # read the WFDB file
        sig, meta = wfdb.rdsamp(filepath)
        
        # Transpose to (Channels, Length) -> (12, 1000)
        sig = sig.T 
        
        # Normalization: Zero Mean, Unit Variance per channel
        # This handles baseline wander and amplitude differences
        mean = np.mean(sig, axis=1, keepdims=True)
        std = np.std(sig, axis=1, keepdims=True)
        std[std == 0] = 1e-6 # prevent division by zero
        sig = (sig - mean) / std
        
        signals.append(sig)
        
    return np.array(signals, dtype=np.float32)

# ---------------------------------------------------------
# MAIN PIPELINE
# ---------------------------------------------------------
def main():
    print("========================================")
    print("   STARTING DEEP LEARNING PIPELINE")
    print("========================================")
    
    data_dir = '../data/ptbxl_full/ptb-xl-a-large-publicly-available-electrocardiography-dataset-1.0.1'
    metadata_path = os.path.join(data_dir, 'cleaned_metadata.csv')
    
    if not os.path.exists(metadata_path):
        print("Error: cleaned_metadata.csv not found. Run step3_leakage_and_clean.py first.")
        return
        
    df = pd.read_csv(metadata_path)
    all_classes = ['NORM', 'MI', 'STTC', 'CD', 'HYP']
    
    # 1. Splitting based on strict Patient-Level folds (Step 3, 9, 14)
    train_df = df[df['strat_fold'] <= 8]
    val_df = df[df['strat_fold'] == 9]
    test_df = df[df['strat_fold'] == 10]
    
    # 2. Load Signals
    X_train = load_and_preprocess_signals(train_df, data_dir)
    y_train = train_df[all_classes].values.astype(np.float32)
    
    X_val = load_and_preprocess_signals(val_df, data_dir)
    y_val = val_df[all_classes].values.astype(np.float32)
    
    X_test = load_and_preprocess_signals(test_df, data_dir)
    y_test = test_df[all_classes].values.astype(np.float32)
    
    # 3. Handle Imbalance (Step 11)
    # Calculate positive weight = negative_count / positive_count
    pos_weights = []
    for i in range(len(all_classes)):
        pos_count = y_train[:, i].sum()
        neg_count = len(y_train) - pos_count
        pos_weights.append(neg_count / (pos_count + 1e-6))
    
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    print(f"\n[+] Using Device: {device}")
    
    pos_weights_tensor = torch.tensor(pos_weights, dtype=torch.float32).to(device)
    criterion = nn.BCEWithLogitsLoss(pos_weight=pos_weights_tensor)
    
    # 4. DataLoaders
    batch_size = 64
    train_dataset = TensorDataset(torch.tensor(X_train), torch.tensor(y_train))
    val_dataset = TensorDataset(torch.tensor(X_val), torch.tensor(y_val))
    test_dataset = TensorDataset(torch.tensor(X_test), torch.tensor(y_test))
    
    train_loader = DataLoader(train_dataset, batch_size=batch_size, shuffle=True)
    val_loader = DataLoader(val_dataset, batch_size=batch_size, shuffle=False)
    test_loader = DataLoader(test_dataset, batch_size=batch_size, shuffle=False)
    
    # 5. Model Setup
    model = ECG_1D_CNN(num_classes=5).to(device)
    optimizer = optim.Adam(model.parameters(), lr=1e-3, weight_decay=1e-4)
    
    # 6. Training Loop (Step 12)
    epochs = 15
    best_val_auc = 0.0
    
    print("\n[+] Starting Training...")
    for epoch in range(epochs):
        model.train()
        train_loss = 0.0
        for inputs, targets in train_loader:
            inputs, targets = inputs.to(device), targets.to(device)
            optimizer.zero_grad()
            outputs = model(inputs)
            loss = criterion(outputs, targets)
            loss.backward()
            optimizer.step()
            train_loss += loss.item() * inputs.size(0)
            
        train_loss /= len(train_loader.dataset)
        
        # Validation
        model.eval()
        val_loss = 0.0
        val_preds, val_targs = [], []
        with torch.no_grad():
            for inputs, targets in val_loader:
                inputs, targets = inputs.to(device), targets.to(device)
                outputs = model(inputs)
                loss = criterion(outputs, targets)
                val_loss += loss.item() * inputs.size(0)
                
                probs = torch.sigmoid(outputs).cpu().numpy()
                val_preds.append(probs)
                val_targs.append(targets.cpu().numpy())
                
        val_loss /= len(val_loader.dataset)
        val_preds = np.vstack(val_preds)
        val_targs = np.vstack(val_targs)
        
        # Macro ROC-AUC for early stopping
        val_auc = roc_auc_score(val_targs, val_preds, average='macro')
        
        print(f"Epoch [{epoch+1}/{epochs}] | Train Loss: {train_loss:.4f} | Val Loss: {val_loss:.4f} | Val AUC: {val_auc:.4f}")
        
        # Save best model
        if val_auc > best_val_auc:
            best_val_auc = val_auc
            torch.save(model.state_dict(), '../models/best_1d_cnn.pt')
            
    # ---------------------------------------------------------
    # STEP 14, 15: FINAL UNSEEN TEST EVALUATION
    # ---------------------------------------------------------
    print("\n========================================")
    print("   STEP 14 & 15 — UNSEEN TEST EVALUATION")
    print("========================================")
    
    model.load_state_dict(torch.load('../models/best_1d_cnn.pt'))
    model.eval()
    
    test_preds, test_targs = [], []
    with torch.no_grad():
        for inputs, targets in test_loader:
            inputs, targets = inputs.to(device), targets.to(device)
            probs = torch.sigmoid(model(inputs)).cpu().numpy()
            test_preds.append(probs)
            test_targs.append(targets.cpu().numpy())
            
    test_preds = np.vstack(test_preds)
    test_targs = np.vstack(test_targs)
    
    # Binarize predictions at 0.5 threshold
    test_preds_bin = (test_preds > 0.5).astype(int)
    
    results = {}
    print(f"{'Class':<6} | {'AUC':<7} | {'PR-AUC':<7} | {'F1':<7} | {'Sens':<7} | {'Spec':<7}")
    print("-" * 55)
    
    for i, cls in enumerate(all_classes):
        auc = roc_auc_score(test_targs[:, i], test_preds[:, i])
        pr_auc = average_precision_score(test_targs[:, i], test_preds[:, i])
        f1 = f1_score(test_targs[:, i], test_preds_bin[:, i])
        
        tn, fp, fn, tp = confusion_matrix(test_targs[:, i], test_preds_bin[:, i]).ravel()
        sens = tp / (tp + fn + 1e-6)
        spec = tn / (tn + fp + 1e-6)
        
        results[cls] = {
            "ROC-AUC": auc, "PR-AUC": pr_auc, "F1": f1,
            "Sensitivity": sens, "Specificity": spec
        }
        
        print(f"{cls:<6} | {auc:.4f}  | {pr_auc:.4f}  | {f1:.4f}  | {sens:.4f}  | {spec:.4f}")
        
    macro_auc = roc_auc_score(test_targs, test_preds, average='macro')
    print(f"\nMACRO AVERAGE ROC-AUC: {macro_auc:.4f}")
    
    # ---------------------------------------------------------
    # STEP 22: SAVE EVERYTHING
    # ---------------------------------------------------------
    os.makedirs('../results', exist_ok=True)
    with open('../results/deep_learning_metrics.json', 'w') as f:
        json.dump(results, f, indent=4)
        
    print("[+] Model saved to cardiac_ml_studio/models/best_1d_cnn.pt")
    print("[+] Evaluation metrics saved to cardiac_ml_studio/results/deep_learning_metrics.json")
    print("Pipeline Execution Complete.")

if __name__ == '__main__':
    # Force single thread for deterministic dataloading on CPU (optional)
    torch.set_num_threads(4) 
    main()
