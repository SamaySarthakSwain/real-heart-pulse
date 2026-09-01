import os
import json
import joblib
import pandas as pd
from sklearn.model_selection import StratifiedKFold, cross_val_predict
from sklearn.ensemble import RandomForestClassifier
from xgboost import XGBClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score, confusion_matrix
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline

def ensure_dir(path):
    if not os.path.exists(path):
        os.makedirs(path)

def train_and_evaluate(disease_name, data_path, model_path):
    print(f"--- Training Model for: {disease_name.upper()} ---")
    
    if not os.path.exists(data_path):
        print(f"Error: Dataset {data_path} not found.")
        return None
    
    df = pd.read_csv(data_path)
    X = df.drop(columns=['Target'])
    y = df['Target']
    
    # We use an XGBoost classifier which handles non-linearities and interactions well.
    # We wrap it in a pipeline with a StandardScaler.
    model = Pipeline([
        ('scaler', StandardScaler()),
        ('classifier', XGBClassifier(
            n_estimators=150, 
            max_depth=5, 
            learning_rate=0.05, 
            subsample=0.8,
            use_label_encoder=False,
            eval_metric='logloss',
            random_state=42
        ))
    ])
    
    # 5-Fold Stratified Cross Validation
    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    
    print("Performing 5-Fold Cross Validation...")
    y_pred = cross_val_predict(model, X, y, cv=cv)
    y_proba = cross_val_predict(model, X, y, cv=cv, method='predict_proba')[:, 1]
    
    # Calculate metrics
    acc = accuracy_score(y, y_pred)
    prec = precision_score(y, y_pred)
    rec = recall_score(y, y_pred)
    f1 = f1_score(y, y_pred)
    auc = roc_auc_score(y, y_proba)
    cm = confusion_matrix(y, y_pred).tolist()
    
    print(f"Validation Accuracy : {acc*100:.2f}%")
    print(f"Validation ROC-AUC  : {auc:.4f}")
    print(f"Validation F1-Score : {f1:.4f}\n")
    
    # Train final model on all data
    model.fit(X, y)
    
    # Save model
    ensure_dir(os.path.dirname(model_path))
    joblib.dump(model, model_path)
    print(f"[+] Final model saved to: {model_path}\n")
    
    return {
        "accuracy": acc,
        "precision": prec,
        "recall": rec,
        "f1_score": f1,
        "roc_auc": auc,
        "confusion_matrix": cm
    }

if __name__ == '__main__':
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    results = {}
    
    # 1. Ischemia
    res_ischemia = train_and_evaluate(
        "Ischemia", 
        "../data/ischemia/ischemia_dataset.csv", 
        "../models/ischemia_xgboost.joblib"
    )
    if res_ischemia: results["Ischemia"] = res_ischemia
    
    # 2. Amyloidosis
    res_amyloidosis = train_and_evaluate(
        "Amyloidosis", 
        "../data/amyloidosis/amyloidosis_dataset.csv", 
        "../models/amyloidosis_xgboost.joblib"
    )
    if res_amyloidosis: results["Amyloidosis"] = res_amyloidosis
    
    # 3. Fibrosis
    res_fibrosis = train_and_evaluate(
        "Fibrosis", 
        "../data/fibrosis/fibrosis_dataset.csv", 
        "../models/fibrosis_xgboost.joblib"
    )
    if res_fibrosis: results["Fibrosis"] = res_fibrosis
    
    # Save report
    report_path = "../results/metrics_report.json"
    ensure_dir(os.path.dirname(report_path))
    with open(report_path, "w") as f:
        json.dump(results, f, indent=4)
        
    print(f"[+] All models trained. Full metrics report saved to {report_path}")
