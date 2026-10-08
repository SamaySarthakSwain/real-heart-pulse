import os
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score, classification_report, confusion_matrix
import joblib
import json
import warnings
warnings.filterwarnings('ignore')

def main():
    print("--- Heart Failure Prediction ML Pipeline ---")
    
    # 1. Problem Definition
    print("1. Problem Definition: Predict heart failure (HeartDisease) based on clinical and demographic features.")
    
    # 2. Data Collection
    data_path = '../data/heart_failure/heart.csv'
    print(f"2. Data Collection: Loading data from {data_path}")
    df = pd.read_csv(data_path)
    
    # 3. Data Understanding
    print("3. Data Understanding:")
    print(df.info())
    
    # 4. Data Cleaning
    print("4. Data Cleaning: Handling missing values and duplicates.")
    df.drop_duplicates(inplace=True)
    df.dropna(inplace=True) # Assume no complex imputation needed for this clean dataset
    
    # 5. Exploratory Data Analysis (EDA)
    print("5. Exploratory Data Analysis (EDA): Saving plots to results/heart_failure_eda")
    eda_dir = '../results/heart_failure_eda'
    os.makedirs(eda_dir, exist_ok=True)
    
    plt.figure(figsize=(8,6))
    sns.countplot(x='HeartDisease', data=df)
    plt.title('Heart Disease Target Distribution')
    plt.savefig(f'{eda_dir}/target_dist.png')
    plt.close()
    
    numeric_cols = df.select_dtypes(include=[np.number]).columns
    plt.figure(figsize=(10,8))
    sns.heatmap(df[numeric_cols].corr(), annot=True, cmap='coolwarm')
    plt.title('Correlation Matrix')
    plt.savefig(f'{eda_dir}/corr_matrix.png')
    plt.close()
    
    # 6 & 7. Data Preprocessing & Feature Engineering
    print("6 & 7. Data Preprocessing & Feature Engineering: Encoding categorical variables.")
    categorical_cols = df.select_dtypes(exclude=[np.number]).columns
    encoders = {}
    for col in categorical_cols:
        le = LabelEncoder()
        df[col] = le.fit_transform(df[col])
        encoders[col] = le
    
    # 8. Feature Selection
    print("8. Feature Selection: Using all available features for baseline.")
    X = df.drop(columns=['HeartDisease'])
    y = df['HeartDisease']
    
    # 9. Data Splitting
    print("9. Data Splitting: 80/20 train-test split.")
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    
    # Data Scaling (part of preprocessing)
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    # 10. Data Augmentation (Skipped for tabular data)
    
    # 11 & 12 & 13. Model Selection, Architecture & Baseline
    print("11-13. Model Selection & Baseline: Random Forest Classifier")
    baseline_model = RandomForestClassifier(random_state=42)
    
    # 14. Model Training & 15. Hyperparameter Tuning
    print("14 & 15. Model Training and Hyperparameter Tuning (GridSearchCV)")
    param_grid = {
        'n_estimators': [100, 200],
        'max_depth': [5, 10, None],
        'min_samples_split': [2, 5]
    }
    grid_search = GridSearchCV(baseline_model, param_grid, cv=5, scoring='f1', n_jobs=-1)
    grid_search.fit(X_train_scaled, y_train)
    
    best_model = grid_search.best_estimator_
    print(f"Best parameters: {grid_search.best_params_}")
    
    # 16 & 17. Validation and Model Evaluation
    print("16 & 17. Validation & Model Evaluation")
    y_pred = best_model.predict(X_test_scaled)
    y_proba = best_model.predict_proba(X_test_scaled)[:, 1]
    
    acc = accuracy_score(y_test, y_pred)
    prec = precision_score(y_test, y_pred)
    rec = recall_score(y_test, y_pred)
    f1 = f1_score(y_test, y_pred)
    auc = roc_auc_score(y_test, y_proba)
    
    print(f"Accuracy: {acc:.4f}, Precision: {prec:.4f}, Recall: {rec:.4f}, F1: {f1:.4f}, AUC: {auc:.4f}")
    
    # 18. Error Analysis & 19. Ablation & 20. Optimization
    print("18-20. Error Analysis & Optimization: Confusion Matrix generated.")
    cm = confusion_matrix(y_test, y_pred)
    plt.figure(figsize=(6,4))
    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues')
    plt.title('Confusion Matrix')
    plt.xlabel('Predicted')
    plt.ylabel('Actual')
    plt.savefig(f'{eda_dir}/confusion_matrix.png')
    plt.close()
    
    # 21. Final Testing
    print("21. Final Testing: Completed via test set evaluation.")
    
    # 22. Model Explainability / Interpretability
    print("22. Model Explainability: Feature Importance")
    importances = best_model.feature_importances_
    feat_imp = pd.Series(importances, index=X.columns).sort_values(ascending=False)
    plt.figure(figsize=(10,6))
    feat_imp.plot(kind='bar')
    plt.title('Feature Importances')
    plt.savefig(f'{eda_dir}/feature_importance.png')
    plt.close()
    
    # 23. Model Saving / Serialization
    print("23. Model Saving / Serialization")
    model_path = '../models/heart_failure_rf.joblib'
    scaler_path = '../models/heart_failure_scaler.joblib'
    os.makedirs('../models', exist_ok=True)
    joblib.dump(best_model, model_path)
    joblib.dump(scaler, scaler_path)
    print(f"Saved to {model_path}")
    
    # 24. Deployment & 25. Monitoring & Maintenance
    print("24 & 25. Deployment and Monitoring: Model is ready for inference API integration.")
    
    # Save metrics to JSON
    results = {
        "HeartFailure": {
            "accuracy": float(acc),
            "precision": float(prec),
            "recall": float(rec),
            "f1_score": float(f1),
            "roc_auc": float(auc),
            "confusion_matrix": cm.tolist()
        }
    }
    
    metrics_path = '../results/heart_failure_metrics.json'
    with open(metrics_path, 'w') as f:
        json.dump(results, f, indent=4)
        
    print(f"Metrics saved to {metrics_path}")
    
    # Automatically ensure ML model Summary.md is kept up-to-date
    try:
        from summary_updater import update_summary_registry
        update_summary_registry(
            model_name="Heart Failure Prediction Model (Random Forest)",
            architecture="RandomForestClassifier with GridSearchCV hyperparameter tuning",
            dataset_name="Heart Failure Prediction (Kaggle)",
            metrics={"Accuracy": acc, "ROC-AUC": auc, "F1-Score": f1, "Precision": prec, "Recall": rec},
            model_artifact_path=model_path,
            additional_notes="EDA plots, confusion matrix, and feature importances stored in results/heart_failure_eda"
        )
    except Exception as e:
        print(f"Summary update note: {e}")

    print("Pipeline Complete.")

if __name__ == '__main__':
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    main()
