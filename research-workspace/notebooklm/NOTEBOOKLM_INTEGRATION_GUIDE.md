# Google NotebookLM Integration Guide: Ear to Heart Research Suite

This directory contains grounded source files formatted specifically for **Google NotebookLM** (https://notebooklm.google.com).

## 1. How to Ingest into NotebookLM (1-Click Workflow)
1. Go to **[Google NotebookLM](https://notebooklm.google.com)** and create a new notebook titled:
   `Ear to Heart: Auricular Cardiac Telemetry & Deep Diagnostic System`
2. Click **Add Sources** -> select **Upload from Computer** (or drag and drop).
3. Select the following 6 markdown files from this directory:
   - `01_SYSTEM_ARCHITECTURE_AND_AURICULAR_ELECTROPHYSIOLOGY.md`
   - `02_SIGNAL_PROCESSING_AND_SQI_EVALUATION.md`
   - `03_DEEP_LEARNING_PTBXL_SINGLE_LEAD_BENCHMARKS.md`
   - `04_PHYSIONET_ARRHYTHMIA_AND_113K_CLINICAL_STACKING.md`
   - `05_EXPLAINABILITY_GRADCAM_AND_CONFORMAL_UNCERTAINTY.md`
   - `06_VERIFIED_LITERATURE_ANCHORS_AND_CLAIM_LEDGER.md`
4. Also attach the compiled manuscript PDF:
   - `real-heart-pulse-main/Ear_to_Heart_SOTA_Research_Paper.pdf`

## 2. Recommended NotebookLM Prompt Prompts for Faculty Evidence
- **Audit Hypertrophy Resolution:**
  *"Explain how the Ear to Heart project resolved the 12-channel cloning flaw and quote the exact empirical numbers on PTB-XL Hypertrophy sensitivity."*
- **Verify Real vs. Synthetic Datasets:**
  *"List the authentic clinical datasets used in this project, their patient sample sizes, and their empirical ROC-AUC scores."*
- **Explain Hardware & Telemetry:**
  *"Summarize the three-point auricular electrode montage, AD8232 analog front-end corner frequencies, and the ESP32 BLE 5.0 battery budget."*
- **Generate Faculty Briefing Audio Overview:**
  *Click 'Audio Overview' (Deep Dive) in NotebookLM to generate an interactive podcast discussion of the paper grounded entirely in these verified sources.*
