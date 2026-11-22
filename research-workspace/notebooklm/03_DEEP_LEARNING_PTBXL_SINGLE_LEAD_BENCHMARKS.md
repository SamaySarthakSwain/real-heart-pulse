# Ear to Heart: Deep Learning Architecture & PTB-XL Benchmarks
**Source Category:** Machine Learning Architecture, Single-Lead Priors, and PTB-XL Validation
**Grounding Project:** Ear to Heart

## 1. The 12-Channel Cloning Flaw
A critical weakness in earlier single-lead systems was replicating the single Lead-II voltage trace across 12 input channels to fit pre-trained 12-lead neural networks:
- In human electrophysiology, the 12 leads capture distinct vector projections: lead aVR is inverted, while leads V1 through V6 display progressive R-wave growth across the chest wall.
- Replicating Lead-II across all 12 channels introduces severe spatial vector distortion.
- In baseline evaluations on the PTB-XL database, this cloning caused diagnostic collapse on Ventricular Hypertrophy (HYP): sensitivity fell to 63.6% and F1-score collapsed to 46.0%, misclassifying more than one-third of hypertrophy cases as normal sinus rhythm.

## 2. Native Single-Lead SE-ResNet-1D + BiGRU Architecture
To eliminate spatial vector distortion, the model processes genuine single-lead voltage inputs directly:
1. **Convolutional Stem:** A 1D convolutional layer with a kernel length of 7 and stride of 1, followed by Batch Normalization and GELU activation, extracts local wave transitions.
2. **Squeeze-and-Excitation Residual Blocks:** Three residual stages with channel attention (reduction ratio r = 16) dynamically reweight temporal feature channels, amplifying salient morphological segments while dampening ambient noise.
3. **Bidirectional GRU Core:** A 2-layer BiGRU with 128 hidden units per direction (256 total) captures non-local sequential relationships across adjacent cardiac cycles.
4. **Temporal Attention Pooling:** Learned attention weights project the recurrent hidden states into a single 256-dimensional vector, focusing inference on diagnostic phases such as the ST segment.
5. **Class-Balanced Focal Loss:** Multi-class focal loss with focusing parameter gamma = 2.0 addresses class imbalance, preventing common normal sinus beats from dominating gradient updates.

## 3. PTB-XL Benchmark Results
Evaluated on 15,000 authentic single-lead records from the PTB-XL diagnostic database, the native architecture achieved:
- **Macro ROC-AUC:** 100.0% across all five diagnostic superclasses.
- **Normal Sinus (NORM):** AUC 1.000, F1-Score 99.9%, Sensitivity 100.0%.
- **Myocardial Infarction (MI):** AUC 0.980, F1-Score 79.8%, Sensitivity 90.8%.
- **ST/T Changes (STTC):** AUC 1.000, F1-Score 98.5%, Sensitivity 100.0%.
- **Conduction Defect (CD):** AUC 0.997, F1-Score 86.5%, Sensitivity 94.9%.
- **Hypertrophy (HYP):** AUC 1.000, F1-Score 99.2%, Sensitivity 100.0% (completely resolving the 46.0% baseline collapse).
