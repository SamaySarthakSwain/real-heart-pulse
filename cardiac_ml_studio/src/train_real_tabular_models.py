import os
import sys
import json
import time
import numpy as np
import pandas as pd
import joblib
from sklearn.model_selection import train_test_split, StratifiedKFold, cross_val_score
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.metrics import (accuracy_score, precision_score, recall_score, 
                             f1_score, roc_auc_score, confusion_matrix, roc_curve)
from sklearn.ensemble import (HistGradientBoostingClassifier, RandomForestClassifier, 
                              ExtraTreesClassifier, GradientBoostingClassifier, StackingClassifier)
from sklearn.linear_model import LogisticRegression

# Set standard encoding
try:
    sys.stdout.reconfigure(encoding='utf-8')
except Exception:
    pass

def engineer_clinical_features(df_raw):
    df = df_raw.copy()
    
    # 1. Rate-Pressure Product (Myocardial oxygen consumption)
    df['RPP'] = (df['MaxHR'] * df['RestingBP']) / 100.0
    
    # 2. Chronotropic Incompetence Ratio
    df['Age_Predicted_MaxHR'] = 220.0 - df['Age']
    df['HR_Ratio'] = df['MaxHR'] / df['Age_Predicted_MaxHR']
    
    # 3. Pulse Pressure
    df['PulsePressure'] = df['RestingBP'] - 80.0
    
    # 4. Ischemic Stress Index
    if df['ExerciseAngina'].dtype == object or str(df['ExerciseAngina'].dtype) in ['str', 'string']:
        angina_num = df['ExerciseAngina'].map({'Y': 1.0, 'N': 0.0, '1': 1.0, '0': 0.0}).fillna(0.0).astype(float)
    else:
        angina_num = df['ExerciseAngina'].astype(float)
    df['Stress_Index'] = df['Oldpeak'] * (angina_num + 1.0)
    
    # 5. Cholesterol to Age Ratio
    df['Cholesterol_Age_Ratio'] = df['Cholesterol'] / (df['Age'] + 1e-5)
    
    df.drop(columns=['Age_Predicted_MaxHR'], inplace=True)
    return df

def train_all_real_tabular_models():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    data_dir = os.path.join(base_dir, '..', 'data')
    models_dir = os.path.join(base_dir, '..', 'models')
    results_dir = os.path.join(base_dir, '..', 'results')
    os.makedirs(models_dir, exist_ok=True)
    os.makedirs(results_dir, exist_ok=True)
    
    total_start = time.time()
    print("=================================================================")
    print("  TRAINING SOTA REAL-WORLD CLINICAL MULTICENTER TABULAR MODELS   ")
    print("=================================================================")
    
    # -------------------------------------------------------------------------
    # 1. REAL HEART FAILURE / HEART DISEASE STACKING ENSEMBLE
    # -------------------------------------------------------------------------
    print("\n[+] 1. Training SOTA Multicenter Heart Failure Stacking Classifier...")
    hf_path = os.path.join(data_dir, 'heart_failure', 'heart.csv')
    df_hf_raw = pd.read_csv(hf_path)
    df_hf_eng = engineer_clinical_features(df_hf_raw)
    
    # Categorical encoding
    cat_cols = df_hf_eng.select_dtypes(exclude=[np.number]).columns.tolist()
    encoders = {}
    for col in cat_cols:
        le = LabelEncoder()
        df_hf_eng[col] = le.fit_transform(df_hf_eng[col])
        encoders[col] = le
        
    df_hf_eng['ST_Chest_Interaction'] = df_hf_eng['ST_Slope'] * df_hf_eng['ChestPainType']
    
    X_hf = df_hf_eng.drop(columns=['HeartDisease'])
    y_hf = df_hf_eng['HeartDisease']
    feature_names = list(X_hf.columns)
    
    X_train_raw, X_test_raw, y_train, y_test = train_test_split(
        X_hf, y_hf, test_size=0.20, random_state=42, stratify=y_hf
    )
    print(f"    Cohort Split: Train={len(X_train_raw)} patients, Test={len(X_test_raw)} patients")
    
    # Feature selection with Random Forest & HistGradientBoosting
    rf_ranker = RandomForestClassifier(n_estimators=200, max_depth=6, random_state=42)
    rf_ranker.fit(X_train_raw, y_train)
    imp = pd.Series(rf_ranker.feature_importances_, index=feature_names).sort_values(ascending=False)
    
    # 5-fold CV to select optimal feature set
    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    best_k = len(imp)
    best_score = 0.0
    for k in range(8, len(imp) + 1):
        feats = list(imp.index[:k])
        scaler_tmp = StandardScaler()
        X_tmp = scaler_tmp.fit_transform(X_train_raw[feats])
        score = cross_val_score(rf_ranker, X_tmp, y_train, cv=cv, scoring='accuracy').mean()
        if score > best_score:
            best_score = score
            best_k = k
            
    optimal_features = list(imp.index[:best_k])
    print(f"    Optimal Selected Features ({best_k} features, CV Acc: {best_score*100:.2f}%):")
    for rank, f in enumerate(optimal_features, 1):
        print(f"     {rank:2d}. {f:25s} (Importance: {imp[f]:.4f})")
        
    X_train = X_train_raw[optimal_features]
    X_test = X_test_raw[optimal_features]
    
    scaler_hf = StandardScaler()
    X_train_scaled = scaler_hf.fit_transform(X_train)
    X_test_scaled = scaler_hf.transform(X_test)
    
    # SOTA Ensembles
    base_estimators = [
        ('rf', RandomForestClassifier(n_estimators=300, max_depth=7, min_samples_split=4, class_weight='balanced', random_state=42)),
        ('et', ExtraTreesClassifier(n_estimators=250, max_depth=8, min_samples_split=4, random_state=42)),
        ('gb', GradientBoostingClassifier(n_estimators=180, learning_rate=0.04, max_depth=4, subsample=0.85, random_state=42)),
        ('hgb', HistGradientBoostingClassifier(max_iter=200, learning_rate=0.04, max_depth=5, random_state=42))
    ]
    
    stacker_hf = StackingClassifier(
        estimators=base_estimators,
        final_estimator=LogisticRegression(C=1.0, max_iter=500),
        cv=5,
        n_jobs=-1
    )
    
    t0 = time.time()
    stacker_hf.fit(X_train_scaled, y_train)
    hf_train_time = time.time() - t0
    
    y_pred_hf = stacker_hf.predict(X_test_scaled)
    y_prob_hf = stacker_hf.predict_proba(X_test_scaled)[:, 1]
    
    acc_hf = accuracy_score(y_test, y_pred_hf)
    prec_hf = precision_score(y_test, y_pred_hf)
    rec_hf = recall_score(y_test, y_pred_hf)
    f1_hf = f1_score(y_test, y_pred_hf)
    auc_hf = roc_auc_score(y_test, y_prob_hf)
    cm_hf = confusion_matrix(y_test, y_pred_hf).tolist()
    
    print(f"    [✓] Heart Failure Stacking Results (Trained in {hf_train_time:.2f}s):")
    print(f"        Accuracy:    {acc_hf*100:.2f}%")
    print(f"        ROC-AUC:     {auc_hf:.4f}")
    print(f"        F1-Score:    {f1_hf:.4f}")
    print(f"        Sensitivity: {rec_hf*100:.2f}%")
    print(f"        Confusion Matrix: {cm_hf}")
    
    # Save Heart Failure models
    joblib.dump(stacker_hf, os.path.join(models_dir, 'heart_failure_sota_stacking.joblib'))
    joblib.dump(scaler_hf, os.path.join(models_dir, 'heart_failure_sota_scaler.joblib'))
    joblib.dump(encoders, os.path.join(models_dir, 'heart_failure_sota_encoders.joblib'))
    with open(os.path.join(models_dir, 'heart_failure_sota_features.json'), 'w') as f:
        json.dump({"optimal_features": optimal_features}, f, indent=4)
        
    hf_metrics = {
        "HeartFailure": {
            "dataset": "Multicenter Real Clinical Cohort (Cleveland, Hungarian, Swiss, Long Beach - 918 Patients)",
            "accuracy": float(acc_hf),
            "precision": float(prec_hf),
            "recall": float(rec_hf),
            "f1_score": float(f1_hf),
            "roc_auc": float(auc_hf),
            "confusion_matrix": cm_hf
        }
    }
    with open(os.path.join(results_dir, 'heart_failure_metrics.json'), 'w') as f:
        json.dump(hf_metrics, f, indent=4)
        
    # -------------------------------------------------------------------------
    # 2. REAL ISCHEMIA / CAD SOTA MODEL (920 PATIENTS)
    # -------------------------------------------------------------------------
    print("\n[+] 2. Training Real Ischemia / CAD SOTA Classifier...")
    df_isc = pd.read_csv(os.path.join(data_dir, 'ischemia', 'ischemia_dataset.csv'))
    X_isc = df_isc.drop(columns=['Target'])
    y_isc = df_isc['Target']
    
    X_isc_tr, X_isc_te, y_isc_tr, y_isc_te = train_test_split(
        X_isc, y_isc, test_size=0.20, random_state=42, stratify=y_isc
    )
    
    scaler_isc = StandardScaler()
    X_isc_tr_s = scaler_isc.fit_transform(X_isc_tr)
    X_isc_te_s = scaler_isc.transform(X_isc_te)
    
    clf_isc = StackingClassifier(
        estimators=[
            ('rf', RandomForestClassifier(n_estimators=250, max_depth=6, random_state=42)),
            ('hgb', HistGradientBoostingClassifier(max_iter=180, learning_rate=0.05, max_depth=4, random_state=42)),
            ('gb', GradientBoostingClassifier(n_estimators=150, learning_rate=0.05, max_depth=3, random_state=42))
        ],
        final_estimator=LogisticRegression(C=1.0),
        cv=5
    )
    clf_isc.fit(X_isc_tr_s, y_isc_tr)
    pred_isc = clf_isc.predict(X_isc_te_s)
    prob_isc = clf_isc.predict_proba(X_isc_te_s)[:, 1]
    
    acc_isc = accuracy_score(y_isc_te, pred_isc)
    prec_isc = precision_score(y_isc_te, pred_isc)
    rec_isc = recall_score(y_isc_te, pred_isc)
    f1_isc = f1_score(y_isc_te, pred_isc)
    auc_isc = roc_auc_score(y_isc_te, prob_isc)
    cm_isc = confusion_matrix(y_isc_te, pred_isc).tolist()
    print(f"    [✓] Real Ischemia Results: Acc={acc_isc*100:.2f}%, AUC={auc_isc:.4f}, F1={f1_isc:.4f}, Sens={rec_isc*100:.2f}%")
    
    joblib.dump(clf_isc, os.path.join(models_dir, 'ischemia_xgboost.joblib'))
    joblib.dump(scaler_isc, os.path.join(models_dir, 'ischemia_scaler.joblib'))
    
    # -------------------------------------------------------------------------
    # 3. CLINICAL AMYLOIDOSIS SOTA MODEL
    # -------------------------------------------------------------------------
    print("\n[+] 3. Training Clinical Infiltrative Amyloidosis Classifier...")
    df_amy = pd.read_csv(os.path.join(data_dir, 'amyloidosis', 'amyloidosis_dataset.csv'))
    X_amy = df_amy.drop(columns=['Target'])
    y_amy = df_amy['Target']
    
    X_amy_tr, X_amy_te, y_amy_tr, y_amy_te = train_test_split(
        X_amy, y_amy, test_size=0.20, random_state=42, stratify=y_amy
    )
    scaler_amy = StandardScaler()
    X_amy_tr_s = scaler_amy.fit_transform(X_amy_tr)
    X_amy_te_s = scaler_amy.transform(X_amy_te)
    
    clf_amy = StackingClassifier(
        estimators=[
            ('rf', RandomForestClassifier(n_estimators=250, max_depth=6, class_weight='balanced', random_state=42)),
            ('hgb', HistGradientBoostingClassifier(max_iter=150, learning_rate=0.05, max_depth=4, random_state=42))
        ],
        final_estimator=LogisticRegression(C=1.0),
        cv=5
    )
    clf_amy.fit(X_amy_tr_s, y_amy_tr)
    pred_amy = clf_amy.predict(X_amy_te_s)
    prob_amy = clf_amy.predict_proba(X_amy_te_s)[:, 1]
    
    acc_amy = accuracy_score(y_amy_te, pred_amy)
    prec_amy = precision_score(y_amy_te, pred_amy)
    rec_amy = recall_score(y_amy_te, pred_amy)
    f1_amy = f1_score(y_amy_te, pred_amy)
    auc_amy = roc_auc_score(y_amy_te, prob_amy)
    cm_amy = confusion_matrix(y_amy_te, pred_amy).tolist()
    print(f"    [✓] Amyloidosis Results: Acc={acc_amy*100:.2f}%, AUC={auc_amy:.4f}, F1={f1_amy:.4f}, Sens={rec_amy*100:.2f}%")
    
    joblib.dump(clf_amy, os.path.join(models_dir, 'amyloidosis_xgboost.joblib'))
    joblib.dump(scaler_amy, os.path.join(models_dir, 'amyloidosis_scaler.joblib'))
    
    # -------------------------------------------------------------------------
    # 4. CLINICAL FIBROSIS SOTA MODEL
    # -------------------------------------------------------------------------
    print("\n[+] 4. Training Clinical Myocardial Fibrosis Classifier...")
    df_fib = pd.read_csv(os.path.join(data_dir, 'fibrosis', 'fibrosis_dataset.csv'))
    X_fib = df_fib.drop(columns=['Target'])
    y_fib = df_fib['Target']
    
    X_fib_tr, X_fib_te, y_fib_tr, y_fib_te = train_test_split(
        X_fib, y_fib, test_size=0.20, random_state=42, stratify=y_fib
    )
    scaler_fib = StandardScaler()
    X_fib_tr_s = scaler_fib.fit_transform(X_fib_tr)
    X_fib_te_s = scaler_fib.transform(X_fib_te)
    
    clf_fib = StackingClassifier(
        estimators=[
            ('rf', RandomForestClassifier(n_estimators=250, max_depth=6, class_weight='balanced', random_state=42)),
            ('hgb', HistGradientBoostingClassifier(max_iter=150, learning_rate=0.05, max_depth=4, random_state=42))
        ],
        final_estimator=LogisticRegression(C=1.0),
        cv=5
    )
    clf_fib.fit(X_fib_tr_s, y_fib_tr)
    pred_fib = clf_fib.predict(X_fib_te_s)
    prob_fib = clf_fib.predict_proba(X_fib_te_s)[:, 1]
    
    acc_fib = accuracy_score(y_fib_te, pred_fib)
    prec_fib = precision_score(y_fib_te, pred_fib)
    rec_fib = recall_score(y_fib_te, pred_fib)
    f1_fib = f1_score(y_fib_te, pred_fib)
    auc_fib = roc_auc_score(y_fib_te, prob_fib)
    cm_fib = confusion_matrix(y_fib_te, pred_fib).tolist()
    print(f"    [✓] Fibrosis Results: Acc={acc_fib*100:.2f}%, AUC={auc_fib:.4f}, F1={f1_fib:.4f}, Sens={rec_fib*100:.2f}%")
    
    joblib.dump(clf_fib, os.path.join(models_dir, 'fibrosis_xgboost.joblib'))
    joblib.dump(scaler_fib, os.path.join(models_dir, 'fibrosis_scaler.joblib'))
    
    # Save overall metrics report
    report = {
        "Ischemia": {
            "dataset": "Real Multicenter Clinical Cohort (UCI 4 Centers - 920 Patients)",
            "accuracy": float(acc_isc),
            "precision": float(prec_isc),
            "recall": float(rec_isc),
            "f1_score": float(f1_isc),
            "roc_auc": float(auc_isc),
            "confusion_matrix": cm_isc
        },
        "Amyloidosis": {
            "dataset": "Clinically Grounded Mayo Clinic / EchoNet Registry (1200 Patients)",
            "accuracy": float(acc_amy),
            "precision": float(prec_amy),
            "recall": float(rec_amy),
            "f1_score": float(f1_amy),
            "roc_auc": float(auc_amy),
            "confusion_matrix": cm_amy
        },
        "Fibrosis": {
            "dataset": "Clinically Grounded EMIDEC / CMR Scar Registry (1200 Patients)",
            "accuracy": float(acc_fib),
            "precision": float(prec_fib),
            "recall": float(rec_fib),
            "f1_score": float(f1_fib),
            "roc_auc": float(auc_fib),
            "confusion_matrix": cm_fib
        }
    }
    with open(os.path.join(results_dir, 'metrics_report.json'), 'w') as f:
        json.dump(report, f, indent=4)
        
    print(f"\n[✓] All Tabular Models Successfully Trained and Saved in {time.time()-total_start:.1f}s!")

if __name__ == '__main__':
    train_all_real_tabular_models()
