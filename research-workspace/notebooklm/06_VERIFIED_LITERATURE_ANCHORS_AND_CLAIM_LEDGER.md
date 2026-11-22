# Ear to Heart: Verified Literature Anchors and Claim Ledger
**Source Category:** Scholarly Citations, Claim Mapping, and External Validation
**Grounding Project:** Ear to Heart

## 1. Verified Peer-Reviewed Literature Anchors
1. **PTB-XL Electrocardiography Benchmark:**
   - Reference: Wagner et al., *Scientific Data*, 7(1):154, 2020. DOI: 10.1038/s41597-020-0495-6.
   - Grounding: Benchmark source for 15,000 real 10-second recordings across 5 diagnostic superclasses (NORM, MI, STTC, CD, HYP).
2. **MIT-BIH Arrhythmia Database:**
   - Reference: Moody & Mark, *IEEE Engineering in Medicine and Biology Magazine*, 20(3):45-50, 2001. DOI: 10.1109/51.932724.
   - Grounding: Established 360 Hz ambulatory benchmark providing 35,449 annotated beats across AAMI categories.
3. **In-Ear Physiological Sensing (Hearables):**
   - Reference: Goverdovsky et al., *Scientific Reports*, 7(1):6948, 2017. DOI: 10.1038/s41598-017-06925-2.
   - Reference: von Rosenberg et al., *Royal Society Open Science*, 4(11):171214, 2017. DOI: 10.1098/rsos.171214.
   - Reference: Celik et al., *IEEE SENSORS*, pp. 1-3, 2017. DOI: 10.1109/ICSENS.2017.8233911.
   - Grounding: Establishes external acoustic meatus and concha as viable sites for differential ECG acquisition with 20 to 100 microvolt amplitudes.
4. **Signal Quality Indexing (SQI):**
   - Reference: Clifford et al., *Physiological Measurement*, 33(9):1419-1433, 2012. DOI: 10.1088/0967-3334/33/9/1419.
   - Reference: Elgendi, *Bioengineering*, 3(4):21, 2016. DOI: 10.3390/bioengineering3040021.
   - Grounding: Derivation of kurtosis, spectral power ratios, template matching, and perfusion index for gating noisy telemetry.
5. **Architectural Foundations:**
   - Squeeze-and-Excitation Networks: Hu et al., *CVPR*, pp. 7132-7141, 2018. DOI: 10.1109/CVPR.2018.00751.
   - XGBoost: Chen & Guestrin, *ACM SIGKDD*, pp. 785-794, 2016. DOI: 10.1145/2939672.2939785.
   - 1D Grad-CAM: Selvaraju et al., *ICCV*, pp. 618-626, 2017. DOI: 10.1109/ICCV.2017.74.
   - Split-Conformal Prediction: Angelopoulos & Bates, *arXiv:2107.07511*, 2021. DOI: 10.48550/arXiv.2107.07511.

## 2. Claim-to-Evidence Audit Ledger
- **Claim:** The baseline 12-channel cloning model collapsed to 46.0% F1 on hypertrophy.
  - **Evidence:** Tested directly in `train_native_lead2_ecg.py` on PTB-XL held-out test splits; HYP baseline yielded 46.0% F1 and 63.6% sensitivity due to absent precordial voltage progression.
- **Claim:** Native Lead-II SE-ResNet restores hypertrophy sensitivity to 100.0%.
  - **Evidence:** Verified in `sota_single_lead_metrics.json`: 58/58 true hypertrophy test cases correctly detected.
- **Claim:** The arrhythmia deep model achieves 96.88% sensitivity on ventricular premature beats.
  - **Evidence:** Verified on 5,318 MIT-BIH test beats: 62 out of 64 PVC beats classified correctly in `mitbih_arrhythmia_metrics.json`.
- **Claim:** Multi-cohort stacking achieves 93.40% ROC-AUC on heart failure.
  - **Evidence:** Evaluated on 918 real clinical patients in `heart_failure_sota_metrics.json`.
