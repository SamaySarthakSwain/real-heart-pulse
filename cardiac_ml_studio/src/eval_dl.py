import os
import torch
import numpy as np
import pandas as pd
import json
from sklearn.metrics import (accuracy_score, precision_score, recall_score, 
                             f1_score, roc_auc_score, average_precision_score, confusion_matrix)
from torch.utils.data import TensorDataset, DataLoader
from train_dl_pipeline import ECG_1D_CNN, load_and_preprocess_signals

def evaluate():
    data_dir = '../data/ptbxl_full/ptb-xl-a-large-publicly-available-electrocardiography-dataset-1.0.1'
    metadata_path = os.path.join(data_dir, 'cleaned_metadata.csv')
    df = pd.read_csv(metadata_path)
    all_classes = ['NORM', 'MI', 'STTC', 'CD', 'HYP']
    
    test_df = df[df['strat_fold'] == 10]
    X_test = load_and_preprocess_signals(test_df, data_dir)
    y_test = test_df[all_classes].values.astype(np.float32)
    
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    model = ECG_1D_CNN(num_classes=5).to(device)
    model.load_state_dict(torch.load('../models/best_1d_cnn.pt'))
    model.eval()
    
    test_dataset = TensorDataset(torch.tensor(X_test), torch.tensor(y_test))
    test_loader = DataLoader(test_dataset, batch_size=64, shuffle=False)
    
    test_preds, test_targs = [], []
    with torch.no_grad():
        for inputs, targets in test_loader:
            inputs, targets = inputs.to(device), targets.to(device)
            probs = torch.sigmoid(model(inputs)).cpu().numpy()
            test_preds.append(probs)
            test_targs.append(targets.cpu().numpy())
            
    test_preds = np.vstack(test_preds)
    test_targs = np.vstack(test_targs)
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
            "ROC-AUC": float(auc), "PR-AUC": float(pr_auc), "F1": float(f1),
            "Sensitivity": float(sens), "Specificity": float(spec)
        }
        
        print(f"{cls:<6} | {auc:.4f}  | {pr_auc:.4f}  | {f1:.4f}  | {sens:.4f}  | {spec:.4f}")
        
    macro_auc = roc_auc_score(test_targs, test_preds, average='macro')
    print(f"\nMACRO AVERAGE ROC-AUC: {macro_auc:.4f}")
    
    os.makedirs('../results', exist_ok=True)
    with open('../results/deep_learning_metrics.json', 'w') as f:
        json.dump(results, f, indent=4)
        
if __name__ == "__main__":
    evaluate()
