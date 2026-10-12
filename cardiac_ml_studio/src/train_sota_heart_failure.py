import os
import sys
import json
import time
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import joblib
import warnings
warnings.filterwarnings('ignore')

# Fix Windows stdout encoding for all terminals
try:
    sys.stdout.reconfigure(encoding='utf-8')
except Exception:
    pass

from sklearn.model_selection import train_test_split, StratifiedKFold, cross_val_score
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.metrics import (accuracy_score, precision_score, recall_score, 
                             f1_score, roc_auc_score, confusion_matrix, roc_curve, auc)
from sklearn.ensemble import RandomForestClassifier, StackingClassifier
from sklearn.linear_model import LogisticRegression
from xgboost import XGBClassifier
from catboost import CatBoostClassifier
from lightgbm import LGBMClassifier
import shap

# Set plotting style
plt.style.use('seaborn-v0_8-whitegrid' if 'seaborn-v0_8-whitegrid' in plt.style.available else 'default')
plt.rcParams['font.sans-serif'] = 'DejaVu Sans'
plt.rcParams['font.family'] = 'sans-serif'
plt.rcParams['figure.dpi'] = 300

def engineer_clinical_features(df_raw):
    """
    Applies cardiology domain formulas to clinical vitals and biomarkers:
    1. Rate-Pressure Product (RPP): MaxHR * RestingBP / 100
    2. Age-Adjusted HR Ratio: MaxHR / (220 - Age)
    3. Pulse Pressure: RestingBP - 80
    4. Ischemic Stress Index: Oldpeak * (ExerciseAngina + 1)
    5. Cholesterol-to-Age Ratio: Cholesterol / (Age + 1e-5)
    6. ST_Slope x ChestPain Interaction
    """
    df = df_raw.copy()
    
    # 1. RPP (Myocardial oxygen consumption)
    df['RPP'] = (df['MaxHR'] * df['RestingBP']) / 100.0
    
    # 2. Chronotropic Incompetence Ratio
    df['Age_Predicted_MaxHR'] = 220.0 - df['Age']
    df['HR_Ratio'] = df['MaxHR'] / df['Age_Predicted_MaxHR']
    
    # 3. Pulse Pressure
    df['PulsePressure'] = df['RestingBP'] - 80.0
    
    # 4. Ischemic Stress Index
    angina_num = df['ExerciseAngina'].map({'Y': 1, 'N': 0}) if df['ExerciseAngina'].dtype == object else df['ExerciseAngina']
    df['Stress_Index'] = df['Oldpeak'] * (angina_num + 1.0)
    
    # 5. Cholesterol to Age Ratio
    df['Cholesterol_Age_Ratio'] = df['Cholesterol'] / (df['Age'] + 1e-5)
    
    # Clean temporary helper columns
    df.drop(columns=['Age_Predicted_MaxHR'], inplace=True)
    
    return df

def run_sota_heart_failure_pipeline():
    start_time = time.time()
    print("=================================================================")
    print("   SOTA CARDIAC ENSEMBLE PIPELINE (RF + XGB + CATBOOST + LIGHTGBM) ")
    print("=================================================================")
    
    base_dir = os.path.dirname(os.path.abspath(__file__))
    data_path = os.path.join(base_dir, '..', 'data', 'heart_failure', 'heart.csv')
    models_dir = os.path.join(base_dir, '..', 'models')
    results_dir = os.path.join(base_dir, '..', 'results', 'sota_tabular')
    figures_dir = os.path.join(base_dir, '..', 'results', 'sota_figures')
    os.makedirs(models_dir, exist_ok=True)
    os.makedirs(results_dir, exist_ok=True)
    os.makedirs(figures_dir, exist_ok=True)
    
    print(f"\n[+] Loading data from: {data_path}")
    df_raw = pd.read_csv(data_path)
    df_raw.drop_duplicates(inplace=True)
    df_raw.dropna(inplace=True)
    print(f"[+] Loaded {len(df_raw)} patient records.")
    
    # Step 1: Feature Engineering
    print("\n[+] Applying Cardiology Mathematical Feature Engineering...")
    df_engineered = engineer_clinical_features(df_raw)
    
    # Encode categorical columns
    categorical_cols = df_engineered.select_dtypes(exclude=[np.number]).columns.tolist()
    encoders = {}
    for col in categorical_cols:
        le = LabelEncoder()
        df_engineered[col] = le.fit_transform(df_engineered[col])
        encoders[col] = le
        
    # Feature Interaction
    df_engineered['ST_Chest_Interaction'] = df_engineered['ST_Slope'] * df_engineered['ChestPainType']
    
    X_full = df_engineered.drop(columns=['HeartDisease'])
    y = df_engineered['HeartDisease']
    all_feature_names = list(X_full.columns)
    print(f"[+] Total candidate features: {len(all_feature_names)} features:")
    print("   ", all_feature_names)
    
    # Step 2: Stratified Partitioning (80/20 train/test holdout)
    X_train_raw, X_test_raw, y_train, y_test = train_test_split(
        X_full, y, test_size=0.20, random_state=42, stratify=y
    )
    print(f"\n[+] Cohort Split: Training={len(X_train_raw)} patients, Holdout Test={len(X_test_raw)} patients")
    
    # Step 3: Optimal Feature Selection (Inspired by IEEE Access Paper)
    print("\n[+] Performing Feature Importance Pruning & Optimization...")
    # Initial ranking using Random Forest & CatBoost
    rf_ranker = RandomForestClassifier(n_estimators=150, max_depth=6, random_state=42)
    rf_ranker.fit(X_train_raw, y_train)
    importances = pd.Series(rf_ranker.feature_importances_, index=all_feature_names).sort_values(ascending=False)
    sorted_features = list(importances.index)
    
    print(" -> Feature Importances Ranking:")
    for rank, (feat, val) in enumerate(importances.items(), 1):
        print(f"    {rank:2d}. {feat:25s}: {val:.4f}")
        
    # Evaluate subsets from k=7 to k=len(sorted_features) using 5-fold CV on Train set only (no data leakage)
    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    best_k = len(sorted_features)
    best_cv_score = 0.0
    
    print("\n -> Evaluating Feature Subset Performance (5-Fold CV on Training Data):")
    for k in range(7, len(sorted_features) + 1):
        sub_feats = sorted_features[:k]
        sub_X_train = X_train_raw[sub_feats]
        scaler_temp = StandardScaler()
        sub_X_scaled = scaler_temp.fit_transform(sub_X_train)
        
        clf_eval = RandomForestClassifier(n_estimators=100, max_depth=6, random_state=42)
        scores = cross_val_score(clf_eval, sub_X_scaled, y_train, cv=cv, scoring='accuracy')
        mean_score = scores.mean()
        print(f"    Sub-features k={k:2d}: CV Accuracy = {mean_score*100:.2f}%")
        if mean_score > best_cv_score:
            best_cv_score = mean_score
            best_k = k
            
    optimal_features = sorted_features[:best_k]
    print(f"\n[+] Optimal Selected Subset: {best_k} features (CV Acc: {best_cv_score*100:.2f}%):")
    print("   ", optimal_features)
    
    # Prune train and test sets to optimal features
    X_train = X_train_raw[optimal_features]
    X_test = X_test_raw[optimal_features]
    
    # Scaling
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    # Step 4: Train Individual High-End Classifiers
    print("\n[+] Training Individual Tuned Classifiers on Optimal Features...")
    
    models = {
        "Random Forest": RandomForestClassifier(
            n_estimators=300, max_depth=8, min_samples_split=4, 
            class_weight='balanced', random_state=42, n_jobs=-1
        ),
        "XGBoost": XGBClassifier(
            n_estimators=200, max_depth=4, learning_rate=0.03, 
            subsample=0.85, colsample_bytree=0.85, eval_metric='logloss', 
            random_state=42, n_jobs=-1
        ),
        "CatBoost": CatBoostClassifier(
            iterations=300, depth=4, learning_rate=0.04, 
            l2_leaf_reg=3, verbose=0, random_state=42
        ),
        "LightGBM": LGBMClassifier(
            n_estimators=200, max_depth=4, learning_rate=0.03, 
            num_leaves=15, subsample=0.85, random_state=42, verbose=-1, n_jobs=-1
        )
    }
    
    model_evaluations = {}
    
    for name, clf in models.items():
        t0 = time.time()
        clf.fit(X_train_scaled, y_train)
        preds = clf.predict(X_test_scaled)
        probs = clf.predict_proba(X_test_scaled)[:, 1]
        
        acc = accuracy_score(y_test, preds)
        prec = precision_score(y_test, preds)
        rec = recall_score(y_test, preds)
        f1 = f1_score(y_test, preds)
        auc_score = roc_auc_score(y_test, probs)
        
        elapsed = time.time() - t0
        print(f" -> {name:15s} | Acc: {acc*100:.2f}% | AUC: {auc_score:.4f} | F1: {f1:.4f} | Rec: {rec*100:.2f}% (Trained in {elapsed:.2f}s)")
        
        model_evaluations[name] = {
            "model": clf,
            "accuracy": float(acc),
            "precision": float(prec),
            "recall": float(rec),
            "f1_score": float(f1),
            "roc_auc": float(auc_score),
            "probs": probs
        }
        
    # Step 5: Multi-Model Stacking Classifier (Super Learner)
    print("\n[+] Building Stacking Meta-Learner (RF + XGB + CatBoost + LightGBM)...")
    estimators = [
        ('rf', models["Random Forest"]),
        ('xgb', models["XGBoost"]),
        ('cat', models["CatBoost"]),
        ('lgb', models["LightGBM"])
    ]
    
    stacking_clf = StackingClassifier(
        estimators=estimators,
        final_estimator=LogisticRegression(C=1.0, penalty='l2', solver='lbfgs', max_iter=500),
        cv=5,
        n_jobs=-1
    )
    
    stacking_clf.fit(X_train_scaled, y_train)
    stack_preds = stacking_clf.predict(X_test_scaled)
    stack_probs = stacking_clf.predict_proba(X_test_scaled)[:, 1]
    
    stack_acc = accuracy_score(y_test, stack_preds)
    stack_prec = precision_score(y_test, stack_preds)
    stack_rec = recall_score(y_test, stack_preds)
    stack_f1 = f1_score(y_test, stack_preds)
    stack_auc = roc_auc_score(y_test, stack_probs)
    stack_cm = confusion_matrix(y_test, stack_preds)
    
    print("\n=======================================================")
    print("   [TARGET METRICS] SOTA STACKING ENSEMBLE TEST PERFORMANCE:")
    print(f"   Accuracy  : {stack_acc*100:.2f}% (Previous baseline was 90.22%)")
    print(f"   ROC-AUC   : {stack_auc:.4f} (Previous baseline was 0.9369)")
    print(f"   F1-Score  : {stack_f1:.4f}")
    print(f"   Precision : {stack_prec*100:.2f}%")
    print(f"   Recall    : {stack_rec*100:.2f}%")
    print("=======================================================")
    
    model_evaluations["SOTA Stacking"] = {
        "model": stacking_clf,
        "accuracy": float(stack_acc),
        "precision": float(stack_prec),
        "recall": float(stack_rec),
        "f1_score": float(stack_f1),
        "roc_auc": float(stack_auc),
        "probs": stack_probs,
        "confusion_matrix": stack_cm.tolist()
    }
    
    # Step 6: Explainability with SHAP
    print("\n[+] Computing SHAP Explainability Values...")
    try:
        tree_explainer = shap.TreeExplainer(models["CatBoost"])
        shap_values = tree_explainer.shap_values(X_test_scaled)
        
        plt.figure(figsize=(10, 6))
        shap.summary_plot(shap_values, X_test_scaled, feature_names=optimal_features, show=False)
        plt.title("SHAP Feature Attribution: Clinical Drivers of Heart Failure Risk", fontsize=13, fontweight='bold', pad=15)
        shap_path = os.path.join(figures_dir, 'fig2_shap_clinical_importance.png')
        plt.savefig(shap_path, bbox_inches='tight', dpi=300)
        plt.close()
        print(f"[+] Saved SHAP summary plot: {shap_path}")
    except Exception as e:
        print(f"[!] Note on SHAP generation: {e}")
        
    # Step 7: Generate Benchmark Graphs
    print("\n[+] Generating SOTA Benchmark Visualizations...")
    
    # 1. ROC Curves
    plt.figure(figsize=(8, 6.5))
    colors = {
        "Random Forest": "#2b5c8f",
        "XGBoost": "#e76f51",
        "CatBoost": "#2a9d8f",
        "LightGBM": "#e9c46a",
        "SOTA Stacking": "#d62828"
    }
    
    for name, data in model_evaluations.items():
        fpr, tpr, _ = roc_curve(y_test, data["probs"])
        score = data["roc_auc"]
        lw = 2.5 if name == "SOTA Stacking" else 1.5
        ls = '-' if name == "SOTA Stacking" else '--'
        plt.plot(fpr, tpr, label=f"{name} (AUC = {score:.4f})", color=colors.get(name, '#333'), linewidth=lw, linestyle=ls)
        
    plt.plot([0, 1], [0, 1], 'k:', alpha=0.5, label='Random Chance (AUC = 0.50)')
    plt.xlim([-0.02, 1.02])
    plt.ylim([-0.02, 1.04])
    plt.xlabel('False Positive Rate (1 - Specificity)', fontweight='bold')
    plt.ylabel('True Positive Rate (Sensitivity)', fontweight='bold')
    plt.title('Receiver Operating Characteristic (ROC): Stacking vs. Component Models', fontweight='bold', pad=12)
    plt.legend(loc='lower right', frameon=True, facecolor='white', framealpha=0.95)
    plt.grid(True, linestyle='--', alpha=0.4)
    roc_fig_path = os.path.join(figures_dir, 'fig1_sota_roc_curves.png')
    plt.savefig(roc_fig_path, dpi=300, bbox_inches='tight')
    plt.close()
    print(f"[+] Saved ROC curves: {roc_fig_path}")
    
    # 2. Confusion Matrix Heatmap
    plt.figure(figsize=(6, 5))
    sns.heatmap(stack_cm, annot=True, fmt='d', cmap='Blues', cbar=False,
                xticklabels=['Healthy (0)', 'Heart Disease (1)'],
                yticklabels=['Healthy (0)', 'Heart Disease (1)'])
    plt.title(f'SOTA Stacking Confusion Matrix (Acc: {stack_acc*100:.1f}%)', fontweight='bold', pad=12)
    plt.xlabel('Predicted Class', fontweight='bold')
    plt.ylabel('Ground Truth Class', fontweight='bold')
    cm_path = os.path.join(figures_dir, 'fig1b_sota_confusion_matrix.png')
    plt.savefig(cm_path, dpi=300, bbox_inches='tight')
    plt.close()
    print(f"[+] Saved Confusion Matrix: {cm_path}")
    
    # Step 8: Save Model Weights and Preprocessing Artifacts
    best_model_path = os.path.join(models_dir, 'heart_failure_sota_stacking.joblib')
    scaler_path = os.path.join(models_dir, 'heart_failure_sota_scaler.joblib')
    encoders_path = os.path.join(models_dir, 'heart_failure_sota_encoders.joblib')
    feature_config_path = os.path.join(models_dir, 'heart_failure_sota_features.json')
    
    joblib.dump(stacking_clf, best_model_path)
    joblib.dump(scaler, scaler_path)
    joblib.dump(encoders, encoders_path)
    with open(feature_config_path, 'w') as f:
        json.dump({"optimal_features": optimal_features}, f, indent=4)
        
    print(f"\n[+] Serialized SOTA Model to: {best_model_path}")
    
    # Save Metrics JSON
    export_metrics = {
        name: {
            "accuracy": d["accuracy"],
            "roc_auc": d["roc_auc"],
            "f1_score": d["f1_score"],
            "precision": d["precision"],
            "recall": d["recall"]
        } for name, d in model_evaluations.items()
    }
    metrics_json_path = os.path.join(results_dir, 'sota_tabular_metrics.json')
    with open(metrics_json_path, 'w') as f:
        json.dump(export_metrics, f, indent=4)
        
    # Update central ML model Summary.md
    try:
        from summary_updater import update_summary_registry
        update_summary_registry(
            model_name="SOTA Heart Failure Stacking Super Learner (RF + XGB + CatBoost + LightGBM)",
            architecture="5-Fold Stacking Ensemble with Logistic Regression Meta-Learner, Domain Feature Engineering & Pruning",
            dataset_name="Heart Failure Prediction (Kaggle Multi-Cohort, 918 patients)",
            metrics={"Accuracy": stack_acc, "ROC-AUC": stack_auc, "F1-Score": stack_f1, "Precision": stack_prec, "Recall": stack_rec},
            model_artifact_path=best_model_path,
            additional_notes=f"Optimal {best_k}-feature pruned domain model with SHAP explanations, saved to models/heart_failure_sota_stacking.joblib"
        )
    except Exception as e:
        print(f"Summary update note: {e}")
        
    total_elapsed = time.time() - start_time
    print(f"[+] SOTA Tabular Pipeline completed in {total_elapsed:.1f}s.")
    return export_metrics

if __name__ == '__main__':
    run_sota_heart_failure_pipeline()
