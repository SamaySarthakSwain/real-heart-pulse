import os
import sys
import json
import time
import numpy as np
import pandas as pd
import joblib

# Fix stdout encoding for Windows
try:
    sys.stdout.reconfigure(encoding='utf-8')
except Exception:
    pass

from sklearn.model_selection import StratifiedKFold, train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.metrics import (accuracy_score, precision_score, recall_score, 
                             f1_score, roc_auc_score, average_precision_score, 
                             brier_score_loss, confusion_matrix)
from sklearn.ensemble import RandomForestClassifier, HistGradientBoostingClassifier, ExtraTreesClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.calibration import CalibratedClassifierCV

# GPU Accelerated Classifiers
import xgboost as xgb
import lightgbm as lgb
import catboost as cb

from gpu_stacking_model import GPUMultiLearnerStackingClassifier, engineer_clinical_features

print("=================================================================")
print("  SOTA GPU-ACCELERATED MULTIMODAL CARDIAC TABULAR PIPELINE       ")
print("  Hardware: NVIDIA GeForce RTX 2050 (Ampere)                     ")
print("  Frameworks: XGBoost (CUDA) + CatBoost (GPU) + LightGBM + RF    ")
print("=================================================================")

def run_training_pipeline():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    data_dir = os.path.join(base_dir, '..', 'data')
    models_dir = os.path.join(base_dir, '..', 'models')
    results_dir = os.path.join(base_dir, '..', 'results')
    os.makedirs(models_dir, exist_ok=True)
    os.makedirs(results_dir, exist_ok=True)
    
    t_start = time.time()
    
    # -------------------------------------------------------------------------
    # 1. TRAIN HEART FAILURE SOTA STACKING CLASSIFIER
    # -------------------------------------------------------------------------
    print("\n[+] 1. Building Real Multicenter Heart Failure Stacking Classifier...")
    hf_path = os.path.join(data_dir, 'heart_failure', 'heart.csv')
    df_raw = pd.read_csv(hf_path)
    df_eng = engineer_clinical_features(df_raw)
    
    # Categorical Encoding
    cat_cols = df_eng.select_dtypes(exclude=[np.number]).columns.tolist()
    encoders = {}
    for col in cat_cols:
        le = LabelEncoder()
        df_eng[col] = le.fit_transform(df_eng[col])
        encoders[col] = le
        
    df_eng['ST_Chest_Interaction'] = df_eng['ST_Slope'] * df_eng['ChestPainType']
    
    X = df_eng.drop(columns=['HeartDisease'])
    y = df_eng['HeartDisease'].values
    features = list(X.columns)
    
    X_tr_df, X_te_df, y_tr, y_te = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )
    print(f"    Cohort Split: Train={len(X_tr_df)} patients, Test={len(X_te_df)} patients")
    
    # Feature scaling
    scaler = StandardScaler()
    X_tr_scaled = scaler.fit_transform(X_tr_df)
    X_te_scaled = scaler.transform(X_te_df)
    
    # Fit GPU Stacking Model
    stacking_model = GPUMultiLearnerStackingClassifier(use_gpu=True)
    stacking_model.fit(X_tr_scaled, y_tr)
    
    # Evaluate on held-out test cohort
    y_pred_probs = stacking_model.predict_proba_raw(X_te_scaled)
    y_pred = stacking_model.predict(X_te_scaled)
    
    test_acc = accuracy_score(y_te, y_pred)
    test_auc = roc_auc_score(y_te, y_pred_probs)
    test_pr_auc = average_precision_score(y_te, y_pred_probs)
    test_f1 = f1_score(y_te, y_pred)
    test_recall = recall_score(y_te, y_pred)
    test_precision = precision_score(y_te, y_pred)
    test_brier = brier_score_loss(y_te, y_pred_probs)
    cm = confusion_matrix(y_te, y_pred).tolist()
    
    print("\n  ===============================================================")
  
    print(f"  HEART FAILURE SOTA TEST BENCHMARK RESULTS:")
    print(f"    * ROC-AUC Score:      {test_auc*100:.2f}%")
    print(f"    * PR-AUC Score:       {test_pr_auc*100:.2f}%")
    print(f"    * Clinical F1-Score:  {test_f1*100:.2f}%")
    print(f"    * Sensitivity/Recall: {test_recall*100:.2f}%")
    print(f"    * Precision:          {test_precision*100:.2f}%")
    print(f"    * Accuracy:           {test_acc*100:.2f}%")
    print(f"    * Brier Score Loss:   {test_brier:.4f}")
    print(f"    * Confusion Matrix:   TN={cm[0][0]}, FP={cm[0][1]}, FN={cm[1][0]}, TP={cm[1][1]}")
    print("  ===============================================================")
    
    # Save artifacts
    hf_save_path = os.path.join(models_dir, 'heart_failure_sota_stacking.joblib')
    scaler_save_path = os.path.join(models_dir, 'heart_failure_sota_scaler.joblib')
    encoders_save_path = os.path.join(models_dir, 'heart_failure_sota_encoders.joblib')
    features_save_path = os.path.join(models_dir, 'heart_failure_sota_features.json')
    
    joblib.dump(stacking_model, hf_save_path)
    joblib.dump(scaler, scaler_save_path)
    joblib.dump(encoders, encoders_save_path)
    with open(features_save_path, 'w') as f:
        json.dump({"optimal_features": features, "features": features}, f, indent=2)
        
    metrics_report = {
        'model_name': 'GPU-Accelerated Multimodal Stacking Classifier (XGBoost + CatBoost + LightGBM + RF)',
        'hardware_acceleration': 'NVIDIA GeForce RTX 2050 CUDA',
        'cohort_patients': len(df_raw),
        'test_patients': len(X_te_df),
        'accuracy': round(test_acc, 4),
        'roc_auc': round(test_auc, 4),
        'pr_auc': round(test_pr_auc, 4),
        'f1_score': round(test_f1, 4),
        'sensitivity_recall': round(test_recall, 4),
        'precision': round(test_precision, 4),
        'brier_loss': round(test_brier, 4),
        'optimal_threshold': round(stacking_model.optimal_threshold, 3),
        'confusion_matrix': cm
    }
    with open(os.path.join(results_dir, 'heart_failure_sota_metrics.json'), 'w') as f:
        json.dump(metrics_report, f, indent=2)
        
    print(f"\n[✓] Saved Heart Failure Stacking Model: {hf_save_path}")
    
    # -------------------------------------------------------------------------
    # 2. TRAIN REAL ISCHEMIA & CAD MODEL (UCI MULTICENTER COHORT)
    # -------------------------------------------------------------------------
    print("\n[+] 2. Training Real UCI 4-Center Ischemia / CAD Model...")
    isch_path = os.path.join(data_dir, 'ischemia', 'ischemia_dataset.csv')
    df_isch = pd.read_csv(isch_path)
    X_isch = df_isch.drop(columns=['Target']).values
    y_isch = df_isch['Target'].values
    
    X_isch_tr, X_isch_te, y_isch_tr, y_isch_te = train_test_split(
        X_isch, y_isch, test_size=0.20, random_state=42, stratify=y_isch
    )
    scaler_isch = StandardScaler()
    X_isch_tr_sc = scaler_isch.fit_transform(X_isch_tr)
    X_isch_te_sc = scaler_isch.transform(X_isch_te)
    
    clf_isch = xgb.XGBClassifier(
        n_estimators=250, max_depth=4, learning_rate=0.03,
        device='cuda', eval_metric='logloss', random_state=42
    )
    clf_isch.fit(X_isch_tr_sc, y_isch_tr)
    isch_auc = roc_auc_score(y_isch_te, clf_isch.predict_proba(X_isch_te_sc)[:, 1])
    isch_f1 = f1_score(y_isch_te, clf_isch.predict(X_isch_te_sc))
    print(f"  [✓] Real Ischemia Model: AUC={isch_auc*100:.2f}%, F1={isch_f1*100:.2f}% (CUDA Accelerated)")
    
    joblib.dump(clf_isch, os.path.join(models_dir, 'ischemia_xgboost.joblib'))
    joblib.dump(scaler_isch, os.path.join(models_dir, 'ischemia_scaler.joblib'))
    
    # -------------------------------------------------------------------------
    # 3. TRAIN GROUNDED AMYLOIDOSIS MODEL (MAYO CLINIC CRITERIA)
    # -------------------------------------------------------------------------
    print("\n[+] 3. Training Clinically Grounded Infiltrative Amyloidosis Model...")
    amy_path = os.path.join(data_dir, 'amyloidosis', 'amyloidosis_dataset.csv')
    df_amy = pd.read_csv(amy_path)
    X_amy = df_amy.drop(columns=['Target']).values
    y_amy = df_amy['Target'].values
    
    X_amy_tr, X_amy_te, y_amy_tr, y_amy_te = train_test_split(
        X_amy, y_amy, test_size=0.20, random_state=42, stratify=y_amy
    )
    scaler_amy = StandardScaler()
    X_amy_tr_sc = scaler_amy.fit_transform(X_amy_tr)
    X_amy_te_sc = scaler_amy.transform(X_amy_te)
    
    clf_amy = cb.CatBoostClassifier(
        iterations=300, depth=5, learning_rate=0.03,
        task_type='GPU', verbose=0, random_state=42
    )
    clf_amy.fit(X_amy_tr_sc, y_amy_tr)
    amy_auc = roc_auc_score(y_amy_te, clf_amy.predict_proba(X_amy_te_sc)[:, 1])
    amy_f1 = f1_score(y_amy_te, clf_amy.predict(X_amy_te_sc))
    print(f"  [✓] Grounded Amyloidosis Model: AUC={amy_auc*100:.2f}%, F1={amy_f1*100:.2f}% (CatBoost GPU)")
    
    joblib.dump(clf_amy, os.path.join(models_dir, 'amyloidosis_xgboost.joblib'))
    joblib.dump(scaler_amy, os.path.join(models_dir, 'amyloidosis_scaler.joblib'))
    
    # -------------------------------------------------------------------------
    # 4. TRAIN GROUNDED FIBROSIS / SCAR MODEL (EMIDEC CMR CRITERIA)
    # -------------------------------------------------------------------------
    print("\n[+] 4. Training Clinically Grounded Fibrosis / Myocardial Scar Model...")
    fib_path = os.path.join(data_dir, 'fibrosis', 'fibrosis_dataset.csv')
    df_fib = pd.read_csv(fib_path)
    X_fib = df_fib.drop(columns=['Target']).values
    y_fib = df_fib['Target'].values
    
    X_fib_tr, X_fib_te, y_fib_tr, y_fib_te = train_test_split(
        X_fib, y_fib, test_size=0.20, random_state=42, stratify=y_fib
    )
    scaler_fib = StandardScaler()
    X_fib_tr_sc = scaler_fib.fit_transform(X_fib_tr)
    X_fib_te_sc = scaler_fib.transform(X_fib_te)
    
    clf_fib = xgb.XGBClassifier(
        n_estimators=250, max_depth=4, learning_rate=0.03,
        device='cuda', eval_metric='logloss', random_state=42
    )
    clf_fib.fit(X_fib_tr_sc, y_fib_tr)
    fib_auc = roc_auc_score(y_fib_te, clf_fib.predict_proba(X_fib_te_sc)[:, 1])
    fib_f1 = f1_score(y_fib_te, clf_fib.predict(X_fib_te_sc))
    print(f"  [✓] Grounded Fibrosis Model: AUC={fib_auc*100:.2f}%, F1={fib_f1*100:.2f}% (CUDA Accelerated)")
    
    joblib.dump(clf_fib, os.path.join(models_dir, 'fibrosis_xgboost.joblib'))
    joblib.dump(scaler_fib, os.path.join(models_dir, 'fibrosis_scaler.joblib'))
    
    print(f"\n=================================================================")
    print(f"  ALL SOTA TABULAR CLINICAL MODELS TRAINED & SAVED IN {time.time()-t_start:.1f}s")
    print(f"=================================================================")

if __name__ == '__main__':
    run_training_pipeline()
