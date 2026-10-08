## Automatic ML Model & Dataset Summary Maintenance

Whenever any work is performed on machine learning models or datasets in this project, you **MUST ALWAYS** automatically update `ML model Summary.md`.

### Required Trigger Actions:
1. **New Model Training or Hyperparameter Tuning:**
   - Append or update the model entry under `## 🤖 Machine Learning Models Summary`.
   - Document: Concept/Architecture, problem definition, preprocessing steps, hyperparameter settings, validation strategy, and status.
   - Record quantitative metrics: Accuracy, ROC-AUC, PR-AUC, F1-Score, Precision, and Recall.
   - Add the output model file/weights under `## 💾 Model Weights & Artifacts Storage Registry` with its exact size and location (`cardiac_ml_studio/models/...`).

2. **New Dataset Addition or Modification:**
   - Update the `## 📊 Datasets Summary` table.
   - Include: Dataset name, source/type, sample count, on-disk storage size (in KB/MB/GB), exact storage path (`cardiac_ml_studio/data/...`), and medical diagnostic purpose.

3. **Automation Tooling:**
   - Python scripts can import and call `update_summary_registry` from `cardiac_ml_studio/src/summary_updater.py` or directly update the markdown file upon pipeline completion.
