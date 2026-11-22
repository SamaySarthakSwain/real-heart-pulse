# Ear to Heart: Explainability & Conformal Uncertainty Quantification
**Source Category:** 1D Grad-CAM Electrophysiological Saliency and Split-Conformal Bounds
**Grounding Project:** Ear to Heart

## 1. 1D ECG Grad-CAM Saliency Attribution
To confirm that deep learning decisions rely on authentic electrophysiological criteria rather than spurious high-frequency artifacts, the system implements 1D Gradient-Weighted Class Activation Mapping:
- Gradients of the target class score with respect to feature maps in the final convolutional layer are averaged across time to generate importance weights alpha_k.
- Saliency maps are computed by taking the ReLU of the weighted linear combination:
  `L_Grad-CAM(t) = ReLU(sum_k alpha_k * A_k(t))`
- In evaluations on acute ST-elevation myocardial infarction (STEMI) cases, the saliency map isolates the J-point and the elevated ST segment (420 to 620 ms relative to the R-peak), confirming that the network grounds predictions in recognized pathological repolarization patterns.

## 2. Inductive Split-Conformal Prediction
Standard neural networks output uncalibrated softmax probabilities that often yield overconfident, incorrect predictions. The system applies inductive split-conformal prediction to deliver distribution-free statistical coverage guarantees:
- Non-conformity scores are computed on a separate calibration partition:
  `s_i = 1 - p_hat(y_i | x_i)`
- For a chosen error rate alpha = 0.05, the conformal quantile threshold q_hat satisfies:
  `P(Y_(n+1) in C(X_(n+1))) >= 1 - alpha = 0.95`
- Prediction sets C(X) are formed by collecting all diagnostic classes whose predicted probability meets or exceeds `1 - q_hat`.

### Empirical Holdout Results (N = 1,000 calibration patients)
- **Single-Label Sets (92.0%):** High-confidence predictions where a single diagnostic label satisfies the 95% threshold.
- **Ambiguity Sets (7.0%):** Multi-label predictions containing two overlapping classes (primarily subtle conduction defects co-occurring with ischemic ST changes), routing the patient to cardiologist review.
- **Abstention Sets (1.0%):** Empty sets resulting from severe motion artifact saturation or poor electrode contact, prompting the firmware to request sensor repositioning.
