# Ear to Heart: Arrhythmia Benchmarking and 113,449 Clinical Patients
**Source Category:** PhysioNet MIT-BIH Ectopy Triage and Multi-Center Stacking Ensembles
**Grounding Project:** Ear to Heart

## 1. PhysioNet MIT-BIH Lead-II Arrhythmia Benchmark
The model was tested on 35,449 authentic beats extracted from Lead-II recordings of the PhysioNet MIT-BIH Arrhythmia Database:
- Preprocessed into 180-sample segments centered on the R-peak (250 ms pre-peak to 250 ms post-peak).
- Stratified into an independent held-out test split of 5,318 beats adhering to AAMI standards.
- **Macro ROC-AUC:** 98.50%.
- **Macro F1-Score:** 79.33%.
- **Ventricular Premature Contractions (PVCs):** 96.88% sensitivity (62 out of 64 true occurrences detected, only 2 false negatives) with an F1-score of 90.51% and class AUC of 99.80%.
- **Supraventricular Premature Contractions (PACs):** 84.62% sensitivity and 97.40% class AUC.
- **Normal Sinus Beats (N):** 99.88% recall and 99.83% F1-score.

## 2. Multi-Center Clinical Stacking Ensemble (113,449 Patients)
To replace synthetic Gaussian toy datasets with authentic human pathology, the platform integrates a two-stage gradient boosting stacking architecture evaluated across four independent cohorts:
- **Level-0 Base Estimators:** GPU-accelerated XGBoost, CatBoost, LightGBM, and Random Forest.
- **Level-1 Meta-Learner:** ElasticNet regularized logistic regression combining out-of-fold probability vectors.

### Cohort Evaluation Summary
1. **Multi-Center Heart Failure Cohort (N = 918 patients):**
   - ROC-AUC: 93.40%
   - PR-AUC: 93.86%
   - Accuracy: 89.67%
   - Sensitivity: 91.18%
2. **European Cardiovascular Disease Cohort (N = 68,601 clean patients):**
   - ROC-AUC: 80.61%
   - PR-AUC: 78.78%
   - Accuracy: 72.14%
   - Sensitivity: 81.44%
3. **Population Stroke Registry (N = 5,110 patients):**
   - ROC-AUC: 82.26%
   - Specificity: 95.88%
   - Accuracy: 92.17%
4. **Framingham 10-Year Coronary Study (N = 4,238 patients):**
   - ROC-AUC: 65.35%
   - Accuracy: 70.75%
   - High-Risk Sensitivity: 42.64%

## 3. Hemodynamic Feature Importance
Normalized Gini importance extracted from the trained Level-0 tree models demonstrates distinct physiological risk factors:
- **Cardiovascular Disease Cohort:** Systolic blood pressure (28.5%), patient age (22.0%), mean arterial pressure (18.2%), and pulse pressure (14.1%) contribute over 82% of total predictive weight.
- **Heart Failure Cohort:** ST-segment slope depression (31.0%), maximal heart rate reserve (23.5%), rate-pressure product (16.8%), and exercise-induced angina (12.5%) serve as primary indicators of ventricular decompensation.
