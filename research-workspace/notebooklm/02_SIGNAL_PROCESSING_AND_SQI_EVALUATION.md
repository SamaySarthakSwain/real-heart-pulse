# Ear to Heart: Signal Processing and Real-Time SQI Evaluation
**Source Category:** Edge Signal Conditioning, Filtering, and Quality Indexing
**Grounding Project:** Ear to Heart

## 1. Digital Filtering Cascade
Raw biopotentials are conditioned in real-time across three processing stages:
1. **Zero-Phase Bandpass Filter:** A 4th-order Butterworth IIR bandpass filter operating between 0.5 Hz and 40 Hz isolates electrophysiological frequencies. Bidirectional forward-backward filtering ensures zero phase shift, preventing artificial latency or distortion in the QRS complex and ST segment.
2. **Narrowband Notch Filter:** A 2nd-order IIR notch filter centered at 50 Hz or 60 Hz with quality factor Q = 30 suppresses continuous powerline interference while preserving adjacent cardiac spectral content.
3. **Morphological Baseline Wander Removal:** Dual mathematical morphology operators isolate low-frequency drift without attenuating wide T-waves. A 200 ms structuring element removes the P-QRS complex, while a 600 ms element removes the T-wave. Subtracting the resulting drift signal eliminates respiratory baseline sway.

## 2. Real-Time Composite Signal Quality Indices (SQI)
To prevent motion-corrupted signals from generating false alarms, each 2-second telemetry buffer undergoes multi-parametric quality verification before inference:
- **Sample Kurtosis (K_SQI):** Measures signal amplitude peakedness. Normal QRS complexes produce leptokurtic distributions (kurtosis greater than 5.0), whereas motion artifacts and electrode displacement yield mesokurtic noise (kurtosis near 3.0).
- **QRS Spectral Power Ratio (P_SQI):** Computes the fraction of spectral power concentrated in the ventricular depolarization band (5 to 15 Hz) relative to the total cardiac passband (1 to 40 Hz). Ratios above 0.50 indicate clean electrophysiological content.
- **Template Correlation (b_SQI):** Cross-correlates segmented beats against a running exponential moving average template. Correlation coefficients above 0.70 confirm recurring physiological morphology.

Composite formula:
`SQI_ECG = 0.35 * I(K_SQI >= 5.0) + 0.35 * I(P_SQI >= 0.50) + 0.30 * b_SQI`
Buffers scoring below 0.65 are flagged as uninterpretable, suppressing diagnostic outputs and instructing the patient to inspect sensor contact.

## 3. Optical Signal Validation
The optical PPG stream is validated in parallel:
- **Perfusion Index (PI):** Ratio of pulsatile peak-to-peak AC amplitude to non-pulsatile DC baseline, expressed as a percentage. Tracks capillary blood flow; frames requiring PI at or above 0.15%.
- **Systolic Waveform Skewness:** Positive skewness confirms regular pulsatile arterial filling.
- **Cross-Modal Co-Registration:** R-peak detections from the ECG channel are matched against systolic foot onsets in the PPG channel to compute Pulse Transit Time (PTT). Mismatched beats signal localized motion disruption.
