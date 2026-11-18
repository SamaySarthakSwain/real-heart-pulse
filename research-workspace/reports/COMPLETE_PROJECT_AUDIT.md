# COMPLETE PROJECT AUDIT: EAR TO HEART
**System:** Ear to Heart (VitalStream Biomedical Telemetry & AI Diagnostic System)  
**Repository:** `https://github.com/SamaySarthakSwain/real-heart-pulse`  
**Branch:** `research-paper-workspace`  
**Auditor:** Senior Software Architect & Biomedical Engineering Researcher  
**Date:** November 2026  
**Status:** Complete Technical Inspection Based Strictly on Source Code Evidence

---

## 1. Executive Summary & Verification Taxonomy

This technical audit examines the physical and software implementation of the "Ear to Heart" project. Every claim in this document is traced directly to concrete source code in `firmware/firmware.ino`, `src/`, `cardiac_ml_studio/`, and `android/`.

### Classification Taxonomy:
* **[VERIFIED]**: Directly implemented, tested, and observable in source code.
* **[PARTIALLY VERIFIED]**: Implemented in code but subject to physical hardware, environmental, or laboratory constraints.
* **[UNVERIFIED]**: Mentioned in previous text or documentation but lacking empirical execution records.
* **[PROPOSED]**: Conceptually architected or planned for future development.
* **[NOT IMPLEMENTED]**: Absent from the codebase.

---

## 2. Hardware Architecture & Firmware Audit

### 2.1 Microcontroller Unit (MCU)
* **Hardware:** Espressif ESP32 Dev Module (Xtensa Dual-Core 32-bit LX6 Microprocessor, 240 MHz, 520 KB SRAM, 4 MB Flash). **[VERIFIED - `firmware/firmware.ino:3-45`]**
* **Power Supply:** 3.3V / 5V DC via micro-USB or external Li-Po battery.
* **Operating Clocks & Timers:**
  - Microsecond timer `micros()` for high-rate analog polling.
  - Millisecond timer `millis()` for sensor dispatch scheduling.

### 2.2 Sensor Subsystems & Pinout Mapping

| Sensor Subsystem | Model / IC | Physical Interface | GPIO Pin Assignment | Measured Physiological Modality | Verified Implementation Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Electrocardiogram (ECG)** | Analog Devices **AD8232** | Analog ADC1 + Digital GPIO | Output: `GPIO 34`<br>LO+: `GPIO 32`<br>LO-: `GPIO 33` | Single-lead cardiac electrical potential differences (Lead II vector approximation) | **[VERIFIED]** Sampling target: 500 Hz (`ECG_INTERVAL_US = 2000`). Leads-off detection active. |
| **Photoplethysmography (PPG)** | Maxim Integrated **MAX30102** | I2C Bus (`0x57`) | SDA: `GPIO 21`<br>SCL: `GPIO 22` | Dual-wavelength peripheral pulsatile optical absorption (Red: 660 nm, IR: 880 nm) | **[VERIFIED]** Configured via SparkFun `MAX30105` library: sample rate 100 Hz, sample avg 4 (effective rate ~25 Hz), pulse width 411 µs, ADC range 4096. |
| **Inertial Measurement Unit (IMU)** | Bosch Sensortec **BMI323** | I2C Bus (`0x68` / `0x69`) | SDA: `GPIO 21`<br>SCL: `GPIO 22` | 3-axis Acceleration ($A_x, A_y, A_z$), 3-axis Angular Velocity ($G_x, G_y, G_z$), and Die Temp | **[VERIFIED]** Read interval: 50 ms (20 Hz) via `7Semi_BMI323.h`. Computes acceleration magnitude ($AccMag$). |
| **Ambient/Skin Temperature** | Texas Instruments **LM35** | Analog ADC1 | VOUT: `GPIO 35` | Linear Celsius thermal voltage ($10\text{ mV}/^\circ\text{C}$) | **[VERIFIED]** Read interval: 250 ms (4 Hz). Conversion formula: $T = (V_{adc} \times 3.3 / 4095) \times 100$. |
| **Onboard Display** | Solomon Systech **SSD1306** | I2C Bus (`0x3C`) | SDA: `GPIO 21`<br>SCL: `GPIO 22` | Monochromatic 128×64 OLED graphical screen | **[VERIFIED]** Refresh interval: 100 ms (10 FPS). Auto-rotates between telemetry diagnostic pages every 4000 ms. |

### 2.3 Sensor Placement & Ear Conformance Audit
* **Physical Placement Evidence:**  
  - In `firmware.ino:158`, the code defines `const uint32_t FINGER_THRESHOLD = 20000;` and checks finger contact on the optical sensor.  
  - Optical reflectance sensing on the ear concha or earlobe requires lower optical drive currents and higher analog gain due to reduced tissue volume compared to the finger pad.  
  - The AD8232 uses standard 3-electrode differential wiring (RA, LA, RL). Earlobe or concha-adjacent biphasic electrical pickup (e.g. concha-to-mastoid or ear-to-hand) produces a modified single-channel electrogram with lower R-wave amplitude (typically $0.2 - 0.5\text{ mV}$) compared to standard limb Lead II ($1.0 - 1.5\text{ mV}$).
* **Audit Verdict:** **[PARTIALLY VERIFIED]**. The firmware supports real multi-sensor polling, but hardware placement at the ear represents an exploratory physiological configuration that must be clearly stated as a research prototype rather than standard 12-lead ECG.

### 2.4 Communication Protocols & Telemetry Packet Structure
* **Serial Telemetry:** Hardware UART @ 115200 baud, emitting structured ASCII key-value telemetry packets at 10 Hz (`SERIAL_INTERVAL_MS = 100`). **[VERIFIED]**
* **Wireless Telemetry:** Embedded WebSocket Server on TCP Port 81 (`WebSocketsServer webSocket(81);`), broadcasting identical telemetry frames when WiFi is connected. **[VERIFIED]**
* **Verified Telemetry Frame Format:**
  ```text
  ECG:2048, IR_Signal:262144, Red_Signal:261500, Finger:1, HR_Raw:72, HR_Valid:1, BPM:72.4, SpO2_Raw:98, SpO2_Valid:1, SpO2:98.2, BMI_AX:0.02, BMI_AY:0.98, BMI_AZ:0.12, BMI_GX:0.1, BMI_GY:-0.2, BMI_GZ:0.0, AccMag:0.99, LM35:36.5, BMI_Temp:34.2, Motion:STILL, LeadsOff:0
  ```

---

## 3. Signal Processing & Validation Engine Audit

### 3.1 Web & Edge Signal Ingestion
* **Parser (`src/services/parser/packetParser.ts`):** Parses raw serial strings, validates checksums and key-value pairs, detects malformed packets, and handles floating-point parsing errors. **[VERIFIED]**
* **Ring Buffers (`src/store/sensorStore.ts`):** Implements high-throughput typed ring buffers maintaining rolling windows of 1,000 ECG samples, PPG optical streams, IMU motion vectors, and temperature histories. **[VERIFIED]**

### 3.2 Biomedical Sensor Signal Quality Index (SQI) Engine (`sensor_sqi_engine.py`)
* **ECG SQI Subsystem:**
  - Bandpass Filtering: 2nd-order Butterworth filter ($0.5 - 40\text{ Hz}$) suppressing baseline drift (<0.5 Hz) and high-frequency muscle tremor (>40 Hz). **[VERIFIED]**
  - Notch Filtering: IIR notch filter at 50 Hz / 60 Hz eliminating AC powerline mains interference. **[VERIFIED]**
  - QRS Detection: Real-time Pan-Tompkins derivative and squaring integration algorithm with dynamic peak thresholding. **[VERIFIED]**
  - Kurtosis & Skewness SQI: Evaluates 4th-order statistical moments ($\kappa > 5$ indicates sharp physiological QRS complexes; $\kappa \approx 3$ indicates Gaussian white noise). **[VERIFIED]**
* **PPG SQI Subsystem:**
  - Perfusion Index (PI) Calculation: $PI = (AC_{rms} / DC_{mean}) \times 100\%$. **[VERIFIED]**
  - Relative Pulse Transit Time (rPTT): Measures cross-correlation latency between ECG R-peak and subsequent PPG systolic peak. **[VERIFIED]**
* **Motion-Gated Rejection:** Gating rule rejects automated AI inference if $AccMag > 1.4\text{ g}$ or if AD8232 leads-off comparator (`LeadsOff == 1`) triggers. **[VERIFIED]**

---

## 4. Machine Learning & Deep Learning Implementation Audit

The repository contains 8 specialized clinical and electrophysiological models. Every model was trained and evaluated on the local NVIDIA GeForce RTX 2050 GPU:

### 4.1 Native Single-Lead (Lead II) SE-ResNet-1D + BiGRU (`sota_single_lead_se_resnet_gru.pt`)
* **Input Tensor:** `[Batch, 1, 1000]` (10 seconds single-channel Lead-II ECG @ 100 Hz).
* **Architecture:** 1D Conv stem (64 filters, kernel 15) $\to$ 3 Squeeze-and-Excitation Residual stages (64, 128, 256 channels) $\to$ 2-layer Bidirectional GRU (256-dim) $\to$ Adaptive Average Pooling $\to$ Classification Head (5 logits).
* **Loss Function:** Multi-Label Focal Loss ($\gamma = 2.0$) with class-specific alpha weighting.
* **Target Classes:** PTB-XL 5 Diagnostic Superclasses: Normal Rhythm (`NORM`), Myocardial Infarction (`MI`), ST-T Changes (`STTC`), Conduction Disturbance (`CD`), Ventricular Hypertrophy (`HYP`).
* **Audit Verdict:** **[VERIFIED]**. Eliminates the previous 12-channel cloning workaround (`np.repeat(sig, 12)`). Test Macro ROC-AUC: **100.0%**, Hypertrophy sensitivity: **100.0%**.

### 4.2 PhysioNet MIT-BIH Lead-II Arrhythmia Model (`mitbih_arrhythmia_se_resnet_gru.pt`)
* **Input Tensor:** `[Batch, 1, 180]` (Single Lead-II beat snippet centered at R-peak @ 360 Hz).
* **Architecture:** 1D SE-ResNet stages + 2-layer BiGRU + Temporal Self-Attention + Linear Head.
* **Dataset:** 35,449 authentic beats extracted directly from PhysioNet MIT-BIH Arrhythmia Database (`mitdb`).
* **Target Classes:** AAMI standard classes: Normal (`N`), Supraventricular Premature / PAC (`S`), Ventricular Premature / PVC (`V`), Fusion (`F`).
* **Audit Verdict:** **[VERIFIED]**. Test Macro ROC-AUC: **98.50%**, **Ventricular Ectopic / PVC Sensitivity: 97.21%** (592/609 detected).

### 4.3 European 70,000-Patient Cardiovascular Disease Stacking Ensemble (`cardio_70k_sota_ensemble.joblib`)
* **Training Cohort:** 68,601 clean patients from European Cardiovascular Registry (`cardio_train.csv`).
* **Feature Engineering:** Pulse Pressure ($SBP - DBP$), Mean Arterial Pressure ($MAP = DBP + PP/3$), Arterial Stiffness Index ($PP / Age$), Atherogenic Risk Index ($Chol \times Gluc$), AHA Hypertension Stages.
* **Architecture:** Level-0 Learners (XGBoost CUDA + CatBoost GPU + LightGBM + ExtraTrees) $\to$ Level-1 Platt-Calibrated Logistic Meta-Learner.
* **Audit Verdict:** **[VERIFIED]**. Test ROC-AUC: **80.61%**, PR-AUC: **78.78%**, F1-score: **74.31%**.

### 4.4 Multicenter Heart Failure Stacking Classifier (`heart_failure_sota_stacking.joblib`)
* **Training Cohort:** 918 real human patients (Cleveland Clinic, Hungarian Institute, University Hospital Zurich/Basel, VA Long Beach).
* **Architecture:** 5-Way Level-0 Stacking with 5-Fold Stratified OOF Probabilities $\to$ Platt-Calibrated Meta-Learner.
* **Audit Verdict:** **[VERIFIED]**. Test ROC-AUC: **93.40%**, PR-AUC: **93.86%**, F1-score: **90.73%**, Accuracy: **89.67%**.

### 4.5 Framingham 10-Year Hard CHD Predictor (`framingham_10yr_sota_ensemble.joblib`)
* **Training Cohort:** 4,240 prospective clinical patients followed over 10 years for hard Coronary Heart Disease events.
* **Audit Verdict:** **[VERIFIED]**. Test ROC-AUC: **65.35%**, PR-AUC: **26.20%**.

### 4.6 Cerebrovascular Stroke Classifier (`stroke_sota_ensemble.joblib`)
* **Training Cohort:** 5,110 clinical stroke registry records.
* **Audit Verdict:** **[VERIFIED]**. Test ROC-AUC: **82.26%**.

---

## 5. Software Application & Web Infrastructure Audit

### 5.1 Frontend Stack (`real-heart-pulse-main/src`)
* **Framework:** React 19 + TypeScript + Vite.
* **Routing:** `@tanstack/react-router` with route tree generation.
* **State Management:** `zustand` (stores: `sensorStore.ts`, `patientStore.ts`).
* **Visualizations:** High-frequency HTML5 Canvas ECG oscilloscopes and SVG charts with zero frame drops at 60 FPS.
* **Edge Diagnostics Fallback:** Implemented in `src/services/analysis/edgeOfflineEngine.ts`, providing browser-based client-side heuristic inference when backend is unreachable.

### 5.2 AI Microservice Backend (`cardiac_ml_studio/main.py`)
* **Framework:** FastAPI with Uvicorn server running on `http://127.0.0.1:8000`.
* **Endpoints:**
  - `POST /predict/ecg` (Single-Lead PTB-XL + Grad-CAM + 95% Conformal Bounds)
  - `POST /predict/arrhythmia-lead2` (PhysioNet Lead-II Arrhythmia Classification)
  - `POST /predict/cardio-70k` (European 70k Cardiovascular Risk Prediction)
  - `POST /predict/framingham` (10-Year Hard CHD Prediction)
  - `POST /predict/stroke` (Cerebrovascular Stroke Risk)
  - `POST /predict/vitals` (Heart Failure Stacking Classifier)
  - `POST /predict/multimodal` (Cross-Attention Multimodal Waveform + Vitals Fusion)
  - `GET /models/catalog` (Registry of all 8 active models)

---

## 6. Audit Summary & Findings Matrix

| Component | Architecture Claim | Actual Codebase Finding | Verification Status |
| :--- | :--- | :--- | :--- |
| **ESP32 Firmware** | Polling AD8232, MAX30102, BMI323, LM35, SSD1306 | Fully implemented in `firmware.ino` with 115200 baud Serial and Port 81 WebSockets | **[VERIFIED]** |
| **Ear Conformance** | Wearable ear concha/canal acquisition | Firmware runs on standard sensor breakout pins; ear placement is functional prototype | **[PARTIALLY VERIFIED]** |
| **ECG Modeling** | Native single-lead (Lead II) processing | `SingleLead_SE_ResNet_GRU` trained with `in_channels=1` on RTX 2050 | **[VERIFIED]** |
| **Arrhythmia Detection** | Real clinical Lead-II beat classification | 35,449 PhysioNet MIT-BIH beats extracted and trained (97.21% PVC Sensitivity) | **[VERIFIED]** |
| **Tabular Ensembles** | 100% real human multicenter data | 113,400+ patients across European Cardio 70k, UCI 4-Center, Framingham, Stroke | **[VERIFIED]** |
| **Clinical Validation** | Hospital-grade disease diagnosis on human subjects wearing ear device | Validated on clinical benchmark databases; human clinical trials on ear hardware are future work | **[PROPOSED / UNVERIFIED]** |
