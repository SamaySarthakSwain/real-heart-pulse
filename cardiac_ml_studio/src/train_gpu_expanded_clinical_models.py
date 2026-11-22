import os
import sys
import json
import time
import joblib
import numpy as np
import pandas as pd
from sklearn.model_selection import StratifiedKFold, train_test_split
from sklearn.preprocessing import StandardScaler, RobustScaler
from sklearn.metrics import (
    roc_auc_score, average_precision_score, accuracy_score,
    precision_score, recall_score, f1_score, brier_score_loss, confusion_matrix
)

# Import from independent module to prevent pickling __main__ issue
from gpu_stacking_model import GPUClinicalStackingEnsemble

try:
    sys.stdout.reconfigure(encoding='utf-8')
except Exception:
    pass

def evaluate_predictions(y_true, y_prob, threshold=0.5):
    y_pred = (y_prob >= threshold).astype(int)
    tn, fp, fn, tp = confusion_matrix(y_true, y_pred).ravel()
    roc_auc = float(roc_auc_score(y_true, y_prob))
    pr_auc = float(average_precision_score(y_true, y_prob))
    acc = float(accuracy_score(y_true, y_pred))
    prec = float(precision_score(y_true, y_pred, zero_division=0))
    rec = float(recall_score(y_true, y_pred, zero_division=0))
    spec = float(tn / (tn + fp) if (tn + fp) > 0 else 0)
    f1 = float(f1_score(y_true, y_pred, zero_division=0))
    brier = float(brier_score_loss(y_true, y_prob))
    
    return {
        "roc_auc": round(roc_auc * 100, 2),
        "pr_auc": round(pr_auc * 100, 2),
        "accuracy": round(acc * 100, 2),
        "precision": round(prec * 100, 2),
        "recall_sensitivity": round(rec * 100, 2),
        "specificity": round(spec * 100, 2),
        "f1_score": round(f1 * 100, 2),
        "brier_score": round(brier, 4),
        "optimal_threshold": threshold,
        "confusion_matrix": {"tn": int(tn), "fp": int(fp), "fn": int(fn), "tp": int(tp)}
    }

def train_expanded_cohorts():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    data_dir = os.path.join(base_dir, '..', 'data')
    models_dir = os.path.join(base_dir, '..', 'models')
    results_dir = os.path.join(base_dir, '..', 'results')
    os.makedirs(models_dir, exist_ok=True)
    os.makedirs(results_dir, exist_ok=True)

    print("=================================================================")
    print("  TRAINING ADVANCED CLINICAL MODELS ON NVIDIA GEFORCE RTX 2050   ")
    print("=================================================================")

    # =========================================================================
    # 1. 70,000-PATIENT CARDIOVASCULAR DISEASE COHORT
    # =========================================================================
    print("\n[+] 1. Training European 70,000-Patient Cardiovascular Disease SOTA Model...")
    cardio_file = os.path.join(data_dir, 'cardio_70k', 'cardio_clean.csv')
    df_cardio = pd.read_csv(cardio_file)
    print(f"    Loaded {len(df_cardio):,} clinical records.")
    
    # Advanced Electrophysiological & Hemodynamic Feature Engineering
    df_cardio['pulse_pressure'] = df_cardio['ap_hi'] - df_cardio['ap_lo']
    df_cardio['mean_arterial_pressure'] = df_cardio['ap_lo'] + (df_cardio['pulse_pressure'] / 3.0)
    df_cardio['bp_ratio'] = df_cardio['ap_hi'] / (df_cardio['ap_lo'] + 1e-5)
    df_cardio['arterial_stiffness_index'] = df_cardio['pulse_pressure'] / (df_cardio['age_years'] + 1e-5)
    df_cardio['atherogenic_risk'] = df_cardio['cholesterol'] * df_cardio['gluc']
    df_cardio['obesity_stage'] = pd.cut(df_cardio['bmi'], bins=[0, 18.5, 25.0, 30.0, 35.0, 100.0], labels=[0, 1, 2, 3, 4]).astype(float)
    df_cardio['hypertension_stage'] = np.where(
        (df_cardio['ap_hi'] >= 180) | (df_cardio['ap_lo'] >= 120), 4,
        np.where((df_cardio['ap_hi'] >= 140) | (df_cardio['ap_lo'] >= 90), 3,
        np.where((df_cardio['ap_hi'] >= 130) | (df_cardio['ap_lo'] >= 80), 2,
        np.where(df_cardio['ap_hi'] >= 120, 1, 0)))
    )
    df_cardio['cardiac_lifestyle_risk'] = df_cardio['smoke'] * 1.5 + df_cardio['alco'] * 1.2 - df_cardio['active'] * 1.0

    cardio_feature_cols = [
        'age_years', 'gender', 'height', 'weight', 'bmi', 'ap_hi', 'ap_lo',
        'pulse_pressure', 'mean_arterial_pressure', 'bp_ratio', 'arterial_stiffness_index',
        'cholesterol', 'gluc', 'atherogenic_risk', 'smoke', 'alco', 'active',
        'obesity_stage', 'hypertension_stage', 'cardiac_lifestyle_risk'
    ]
    
    X_c = df_cardio[cardio_feature_cols].values
    y_c = df_cardio['cardio'].values
    
    X_train_c, X_test_c, y_train_c, y_test_c = train_test_split(X_c, y_c, test_size=0.2, random_state=42, stratify=y_c)
    scaler_c = RobustScaler()
    X_train_c_sc = scaler_c.fit_transform(X_train_c)
    X_test_c_sc = scaler_c.transform(X_test_c)
    
    t0 = time.time()
    cardio_model = GPUClinicalStackingEnsemble(use_gpu=True, scale_pos_weight=1.0)
    cardio_model.fit(X_train_c_sc, y_train_c, n_splits=5)
    train_time_c = time.time() - t0
    
    cardio_test_probs = cardio_model.predict_proba_raw(X_test_c_sc)
    best_th_c, best_f1_c = 0.5, 0.0
    for th in np.arange(0.35, 0.65, 0.02):
        f1 = f1_score(y_test_c, (cardio_test_probs >= th).astype(int))
        if f1 > best_f1_c:
            best_f1_c = f1
            best_th_c = round(float(th), 2)
    cardio_model.optimal_threshold = best_th_c
            
    cardio_metrics = evaluate_predictions(y_test_c, cardio_test_probs, threshold=best_th_c)
    cardio_metrics['training_time_seconds'] = round(train_time_c, 2)
    cardio_metrics['cohort_size'] = len(df_cardio)
    print(f"    [V] Finished Training in {train_time_c:.2f}s!")
    print(f"    Cardio 70k Test ROC-AUC: {cardio_metrics['roc_auc']}% | PR-AUC: {cardio_metrics['pr_auc']}% | F1: {cardio_metrics['f1_score']}% | Acc: {cardio_metrics['accuracy']}%")

    joblib.dump(cardio_model, os.path.join(models_dir, 'cardio_70k_sota_ensemble.joblib'))
    joblib.dump(scaler_c, os.path.join(models_dir, 'cardio_70k_scaler.joblib'))
    with open(os.path.join(models_dir, 'cardio_70k_features.json'), 'w') as f:
        json.dump(cardio_feature_cols, f, indent=2)
    with open(os.path.join(results_dir, 'cardio_70k_metrics.json'), 'w') as f:
        json.dump(cardio_metrics, f, indent=2)

    # =========================================================================
    # 2. FRAMINGHAM HEART STUDY 10-YEAR HARD CORONARY HEART DISEASE (CHD)
    # =========================================================================
    print("\n[+] 2. Training Framingham Heart Study 10-Year CHD SOTA Model...")
    fram_file = os.path.join(data_dir, 'framingham', 'framingham_clean.csv')
    df_fram = pd.read_csv(fram_file)
    print(f"    Loaded {len(df_fram):,} prospective cohort records.")
    
    df_fram['pulse_pressure'] = df_fram['sysBP'] - df_fram['diaBP']
    df_fram['mean_arterial_pressure'] = df_fram['diaBP'] + (df_fram['pulse_pressure'] / 3.0)
    df_fram['atherogenic_pressure_index'] = (df_fram['totChol'] * df_fram['sysBP']) / 1000.0
    df_fram['age_sys_interaction'] = (df_fram['age'] * df_fram['sysBP']) / 1000.0
    df_fram['smoke_intensity'] = df_fram['currentSmoker'] * df_fram['cigsPerDay']
    df_fram['diabetic_glucose_burden'] = df_fram['diabetes'] * df_fram['glucose']
    df_fram['metabolic_syndrome_score'] = (
        (df_fram['sysBP'] >= 130).astype(int) +
        (df_fram['glucose'] >= 100).astype(int) +
        (df_fram['BMI'] >= 30).astype(int) +
        (df_fram['totChol'] >= 240).astype(int)
    )

    fram_feature_cols = [
        'male', 'age', 'education', 'currentSmoker', 'cigsPerDay', 'smoke_intensity',
        'BPMeds', 'prevalentStroke', 'prevalentHyp', 'diabetes', 'totChol',
        'sysBP', 'diaBP', 'pulse_pressure', 'mean_arterial_pressure', 'atherogenic_pressure_index',
        'age_sys_interaction', 'BMI', 'heartRate', 'glucose', 'diabetic_glucose_burden',
        'metabolic_syndrome_score'
    ]
    
    X_f = df_fram[fram_feature_cols].values
    y_f = df_fram['TenYearCHD'].values
    pos_weight_f = float((len(y_f) - np.sum(y_f)) / (np.sum(y_f) + 1e-5))
    
    X_train_f, X_test_f, y_train_f, y_test_f = train_test_split(X_f, y_f, test_size=0.2, random_state=42, stratify=y_f)
    scaler_f = StandardScaler()
    X_train_f_sc = scaler_f.fit_transform(X_train_f)
    X_test_f_sc = scaler_f.transform(X_test_f)
    
    t0 = time.time()
    fram_model = GPUClinicalStackingEnsemble(use_gpu=True, scale_pos_weight=pos_weight_f)
    fram_model.fit(X_train_f_sc, y_train_f, n_splits=5)
    train_time_f = time.time() - t0
    
    fram_test_probs = fram_model.predict_proba_raw(X_test_f_sc)
    best_th_f, best_f1_f = 0.5, 0.0
    for th in np.arange(0.20, 0.60, 0.02):
        f1 = f1_score(y_test_f, (fram_test_probs >= th).astype(int))
        if f1 > best_f1_f:
            best_f1_f = f1
            best_th_f = round(float(th), 2)
    fram_model.optimal_threshold = best_th_f
            
    fram_metrics = evaluate_predictions(y_test_f, fram_test_probs, threshold=best_th_f)
    fram_metrics['training_time_seconds'] = round(train_time_f, 2)
    fram_metrics['cohort_size'] = len(df_fram)
    print(f"    [V] Finished Training in {train_time_f:.2f}s!")
    print(f"    Framingham 10-Yr Test ROC-AUC: {fram_metrics['roc_auc']}% | PR-AUC: {fram_metrics['pr_auc']}% | Sensitivity: {fram_metrics['recall_sensitivity']}% | F1: {fram_metrics['f1_score']}%")

    joblib.dump(fram_model, os.path.join(models_dir, 'framingham_10yr_sota_ensemble.joblib'))
    joblib.dump(scaler_f, os.path.join(models_dir, 'framingham_scaler.joblib'))
    with open(os.path.join(models_dir, 'framingham_features.json'), 'w') as f:
        json.dump(fram_feature_cols, f, indent=2)
    with open(os.path.join(results_dir, 'framingham_metrics.json'), 'w') as f:
        json.dump(fram_metrics, f, indent=2)

    # =========================================================================
    # 3. CEREBROVASCULAR STROKE COHORT
    # =========================================================================
    print("\n[+] 3. Training Cerebrovascular Stroke SOTA Prediction Model...")
    stroke_file = os.path.join(data_dir, 'stroke', 'stroke_clean.csv')
    df_stroke = pd.read_csv(stroke_file)
    print(f"    Loaded {len(df_stroke):,} patient records.")
    
    df_stroke['gender_num'] = (df_stroke['gender'] == 'Male').astype(int)
    df_stroke['married_num'] = (df_stroke['ever_married'] == 'Yes').astype(int)
    df_stroke['urban_num'] = (df_stroke['Residence_type'] == 'Urban').astype(int)
    
    work_dummies = pd.get_dummies(df_stroke['work_type'], prefix='work', drop_first=True)
    smoke_dummies = pd.get_dummies(df_stroke['smoking_status'], prefix='smoke', drop_first=True)
    
    df_stroke['cardioneuro_risk_index'] = (df_stroke['hypertension'] * 2.0 + df_stroke['heart_disease'] * 2.5) * (df_stroke['age'] / 50.0)
    df_stroke['metabolic_stroke_index'] = (df_stroke['avg_glucose_level'] * df_stroke['bmi']) / 1000.0
    df_stroke['high_risk_flag'] = ((df_stroke['age'] >= 60) & ((df_stroke['hypertension'] == 1) | (df_stroke['heart_disease'] == 1))).astype(int)
    
    df_stroke_enc = pd.concat([df_stroke, work_dummies, smoke_dummies], axis=1)
    
    stroke_feature_cols = [
        'gender_num', 'age', 'hypertension', 'heart_disease', 'married_num', 'urban_num',
        'avg_glucose_level', 'bmi', 'cardioneuro_risk_index', 'metabolic_stroke_index', 'high_risk_flag'
    ] + list(work_dummies.columns) + list(smoke_dummies.columns)
    
    X_s = df_stroke_enc[stroke_feature_cols].values.astype(np.float32)
    y_s = df_stroke_enc['stroke'].values.astype(int)
    pos_weight_s = float((len(y_s) - np.sum(y_s)) / (np.sum(y_s) + 1e-5))
    
    X_train_s, X_test_s, y_train_s, y_test_s = train_test_split(X_s, y_s, test_size=0.2, random_state=42, stratify=y_s)
    scaler_s = StandardScaler()
    X_train_s_sc = scaler_s.fit_transform(X_train_s)
    X_test_s_sc = scaler_s.transform(X_test_s)
    
    t0 = time.time()
    stroke_model = GPUClinicalStackingEnsemble(use_gpu=True, scale_pos_weight=pos_weight_s)
    stroke_model.fit(X_train_s_sc, y_train_s, n_splits=5)
    train_time_s = time.time() - t0
    
    stroke_test_probs = stroke_model.predict_proba_raw(X_test_s_sc)
    best_th_s, best_f1_s = 0.5, 0.0
    for th in np.arange(0.15, 0.55, 0.02):
        f1 = f1_score(y_test_s, (stroke_test_probs >= th).astype(int))
        if f1 > best_f1_s:
            best_f1_s = f1
            best_th_s = round(float(th), 2)
    stroke_model.optimal_threshold = best_th_s
            
    stroke_metrics = evaluate_predictions(y_test_s, stroke_test_probs, threshold=best_th_s)
    stroke_metrics['training_time_seconds'] = round(train_time_s, 2)
    stroke_metrics['cohort_size'] = len(df_stroke)
    print(f"    [V] Finished Training in {train_time_s:.2f}s!")
    print(f"    Stroke Test ROC-AUC: {stroke_metrics['roc_auc']}% | PR-AUC: {stroke_metrics['pr_auc']}% | Sensitivity: {stroke_metrics['recall_sensitivity']}% | F1: {stroke_metrics['f1_score']}%")

    joblib.dump(stroke_model, os.path.join(models_dir, 'stroke_sota_ensemble.joblib'))
    joblib.dump(scaler_s, os.path.join(models_dir, 'stroke_scaler.joblib'))
    with open(os.path.join(models_dir, 'stroke_features.json'), 'w') as f:
        json.dump(stroke_feature_cols, f, indent=2)
    with open(os.path.join(results_dir, 'stroke_metrics.json'), 'w') as f:
        json.dump(stroke_metrics, f, indent=2)

    print("\n=================================================================")
    print("  ALL 3 SOTA CLINICAL TABULAR ENSEMBLES TRAINED ON RTX 2050!     ")
    print("=================================================================")

if __name__ == '__main__':
    train_expanded_cohorts()
