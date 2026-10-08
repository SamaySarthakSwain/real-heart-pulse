# Comprehensive ML Model & Dataset Summary

This document maintains a complete, detailed summary of the datasets collected and the machine learning models trained in the "Real-Heart-Pulse" project. This serves as a central registry to track iterations, improvements, data sources, and model evaluations.

---

## 📊 Datasets Summary

We have currently utilized **5 distinct datasets** to train various ML and DL models. Each dataset serves a specific diagnostic purpose within the cardiac domain.

| # | Dataset Name | Source / Type | Samples / Records | Storage Size | Storage Path / Location | Purpose & Usage |
|---|--------------|---------------|-------------------|--------------|--------------------------|-----------------|
| **1** | **PTB-XL ECG Dataset** | PhysioNet / WFDB Raw Signals (Time-Series) | ~21,800 records | **~2.97 GB** (Full: 3,040 MB)<br>**~2.45 GB** (Resampled: 2,514 MB) | `cardiac_ml_studio/data/ptbxl_full/`<br>`cardiac_ml_studio/data/ptbxl/` | Used to train a deep learning model (1D-CNN) capable of identifying 5 superclasses of cardiac anomalies directly from raw ECG waveforms: Normal (NORM), Myocardial Infarction (MI), ST/T Changes (STTC), Conduction Disturbance (CD), and Hypertrophy (HYP). |
| **2** | **Ischemia Dataset** | Internal / Tabular CSV | ~8,038 samples | **647.5 KB** (663,046 bytes) | `cardiac_ml_studio/data/ischemia/ischemia_dataset.csv` | Used to train an XGBoost model for binary classification, predicting the presence or absence of Ischemia based on structured cardiac features. |
| **3** | **Amyloidosis Dataset** | Internal / Tabular CSV | ~8,000 samples | **1.04 MB** (1,090,444 bytes) | `cardiac_ml_studio/data/amyloidosis/amyloidosis_dataset.csv` | Used to train an XGBoost model for binary classification, predicting Cardiac Amyloidosis. |
| **4** | **Fibrosis Dataset** | Internal / Tabular CSV | ~8,000 samples | **1.05 MB** (1,099,404 bytes) | `cardiac_ml_studio/data/fibrosis/fibrosis_dataset.csv` | Used to train an XGBoost model for binary classification, predicting Cardiac Fibrosis. |
| **5** | **Heart Failure Prediction Dataset** | Kaggle (`fedesoriano/heart-failure-prediction`) / Tabular CSV | 918 samples | **35.08 KB** (35,921 bytes) | `cardiac_ml_studio/data/heart_failure/heart.csv` | Used to train a Random Forest model that predicts the overall likelihood of Heart Failure based on 11 clinical and demographic features (e.g., Age, Sex, ChestPainType, MaxHR, Cholesterol). |

---

## 🤖 Machine Learning Models Summary

### 1. Deep Learning Model (1D-CNN)
- **Concept / Architecture:** 1D Convolutional Neural Network (1D-CNN) tailored for time-series physiological data. It features multiple convolutional layers with Batch Normalization, Max Pooling, and Global Average Pooling.
- **Problem Definition:** Multi-label classification mapping raw ECG signals to 5 distinct cardiac classes.
- **Preprocessing:** 
  - Signals were transposed to `(12 channels, 1000 samples)`.
  - Normalization applied per channel: Zero mean, unit variance to handle baseline wander and amplitude variations.
  - Imbalance Handling: Used `BCEWithLogitsLoss` with dynamically calculated positive weights.
- **Data Splitting:** 10-fold patient-level stratification (Folds 1-8 for Train, Fold 9 for Val, Fold 10 for Test).
- **Optimization:** Adam optimizer (`lr=1e-3`, `weight_decay=1e-4`). Early stopping implemented monitoring Macro ROC-AUC.
- **Status:** **Refined & Accepted** (Deployed as `best_1d_cnn.pt`)

#### Performance Metrics (Unseen Test Set)
| Class | ROC-AUC | PR-AUC | F1-Score | Sensitivity | Specificity |
|-------|---------|--------|----------|-------------|-------------|
| **NORM** (Normal) | 0.9314 | 0.9014 | 0.8386 | 0.8786 | 0.8257 |
| **MI** (Myocardial Infarction) | 0.9212 | 0.8164 | 0.7406 | 0.8210 | 0.8640 |
| **STTC** (ST/T Change) | 0.9262 | 0.7998 | 0.7504 | 0.8394 | 0.8732 |
| **CD** (Conduction Disturbance) | 0.9079 | 0.8227 | 0.7288 | 0.8012 | 0.8811 |
| **HYP** (Hypertrophy) | 0.8153 | 0.4616 | 0.4361 | 0.6616 | 0.8100 |

* **Overall Macro Average ROC-AUC:** ~0.9004

---

### 2. Tabular Specific-Disease Models (XGBoost)
- **Concept / Architecture:** Tree-based ensemble learning using `XGBClassifier` wrapped in an `sklearn Pipeline`.
- **Problem Definition:** Independent binary classification models for specific cardiac conditions based on extracted tabular features.
- **Preprocessing:** Handled via `StandardScaler` to normalize feature distributions before passing to the tree estimators.
- **Validation Strategy:** Rigorous 5-Fold Stratified Cross-Validation on the entire dataset before final model fitting.
- **Hyperparameters:** Evaluated with `n_estimators=150`, `max_depth=5`, `learning_rate=0.05`, `subsample=0.8`.
- **Status:** **Refined & Accepted**

#### Performance Metrics (5-Fold CV Validation)
| Disease | Accuracy | ROC-AUC | F1-Score | Precision | Recall |
|---------|----------|---------|----------|-----------|--------|
| **Ischemia** | 90.03% | 0.9607 | 0.8880 | 0.8978 | 0.8783 |
| **Amyloidosis** | 95.30% | 0.9798 | 0.8793 | 0.9207 | 0.8415 |
| **Fibrosis** | 92.51% | 0.9773 | 0.9058 | 0.9140 | 0.8977 |

---

### 3. Heart Failure Prediction Model (Random Forest)
- **Concept / Architecture:** `RandomForestClassifier` optimized via automated Hyperparameter Tuning (`GridSearchCV`).
- **Problem Definition:** Predict Heart Disease / Heart Failure based on a mixture of categorical (e.g., Sex, ChestPainType) and continuous (e.g., Cholesterol, MaxHR) clinical variables.
- **Preprocessing:** 
  - Data Cleaning: Handled duplicated rows and missing values.
  - Categorical variables processed using `LabelEncoder`.
  - Numerical variables processed using `StandardScaler`.
- **Validation Strategy:** 80% Training / 20% Unseen Testing (Stratified).
- **Hyperparameters:** Best parameters found via GridSearch: `n_estimators=200`, `max_depth=10`, `min_samples_split=5`.
- **Explainability:** Feature importances extracted (ST_Slope, ChestPainType, MaxHR were the strongest predictors).
- **Status:** **Newly Trained & Accepted**

#### Performance Metrics (Test Set Evaluation)
| Target | Accuracy | ROC-AUC | F1-Score | Precision | Recall |
|--------|----------|---------|----------|-----------|--------|
| **Heart Failure** | 90.22% | 0.9369 | 0.9135 | 0.8962 | 0.9314 |

*Note: Exploratory Data Analysis (EDA), Correlation Matrices, Confusion Matrices, and Feature Importance plots for this dataset can be found in `cardiac_ml_studio/results/heart_failure_eda`.*

---

## 💾 Model Weights & Artifacts Storage Registry

All trained model weights, checkpoints, and scalers are saved under the `cardiac_ml_studio/models/` directory:

| Artifact File | Format / Type | Storage Size | Storage Location | Corresponding Model |
|---------------|---------------|--------------|------------------|---------------------|
| `best_1d_cnn.pt` | PyTorch State Dict (`.pt`) | **1.45 MB** (1,488.40 KB) | `cardiac_ml_studio/models/best_1d_cnn.pt` | 1D-CNN (PTB-XL ECG 5-Class) |
| `ischemia_xgboost.joblib` | Joblib serialized model | **358.73 KB** (367,336 B) | `cardiac_ml_studio/models/ischemia_xgboost.joblib` | XGBoost (Ischemia Classifier) |
| `amyloidosis_xgboost.joblib` | Joblib serialized model | **350.70 KB** (359,116 B) | `cardiac_ml_studio/models/amyloidosis_xgboost.joblib` | XGBoost (Amyloidosis Classifier) |
| `fibrosis_xgboost.joblib` | Joblib serialized model | **349.04 KB** (357,412 B) | `cardiac_ml_studio/models/fibrosis_xgboost.joblib` | XGBoost (Fibrosis Classifier) |
| `heart_failure_rf.joblib` | Joblib serialized model | **2.25 MB** (2,300.31 KB) | `cardiac_ml_studio/models/heart_failure_rf.joblib` | Random Forest (Heart Failure Classifier) |
| `heart_failure_scaler.joblib` | Joblib serialized scaler | **1.17 KB** (1,199 B) | `cardiac_ml_studio/models/heart_failure_scaler.joblib` | StandardScaler (Heart Failure Preprocessing) |

---

*Note: Whenever a new ML model or dataset is introduced to the project, its details will automatically be appended and formatted into this summary.*
