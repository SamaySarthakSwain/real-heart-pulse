# Ear to Heart: System Architecture and Auricular Electrophysiology
**Source Category:** Hardware, Sensor Montages, and Edge Telemetry
**Grounding Project:** Ear to Heart (VitalStream Biomedical Telemetry & AI Diagnostic System)

## 1. Anatomical Basis of Auricular Sensing
Traditional cardiovascular monitors require chest leads or wrist cuffs. The human ear offers a stable anatomical alternate:
- The external auditory meatus and concha sit adjacent to branches of the superficial temporal artery and posterior auricular artery.
- Cephalic cartilage remains stable during sedentary tasks, reducing skeletal muscle electromyographic (EMG) interference compared to thoracic sites during arm and torso motion.
- Cardiac dipole potentials project onto cephalic anatomy at attenuated levels (20 to 100 microvolts peak-to-peak), roughly 10-fold lower than thoracic Einthoven leads (1 to 2 millivolts).

## 2. Three-Point Electrode Montage
To isolate the differential cardiac vector while avoiding hydrogel skin irritation, a three-point dry-contact electrode geometry is deployed:
1. **Tragus Contact (V+):** Positioned on the internal cartilaginous boundary of the tragus, serving as the non-inverting electrode.
2. **Canal Contact (V-):** Positioned along the superior wall of the external acoustic meatus, serving as the inverting reference.
3. **Earlobe Ground (V_RLD):** A dry-contact clip on the lobule providing active Right Leg Drive feedback to suppress 50/60 Hz common-mode mains interference.

Contacts are fabricated from gold-plated beryllium-copper encased in medical-grade silicone earmolds. Microscopic transepidermal water loss stabilizes contact impedance from over 500 kiloohms to between 60 and 120 kiloohms within 3 to 5 minutes of wear.

## 3. Analog Front-End Conditioning (AD8232)
The Analog Devices AD8232 integrated analog front-end conditions the microvolt biopotentials:
- Instrumentation amplifier core with Common Mode Rejection Ratio exceeding 80 dB at 60 Hz.
- Two-pole high-pass filter with corner frequency fc,HP = 0.5 Hz, rejecting half-cell DC potential drift.
- Two-pole active Sallen-Key low-pass filter with cutoff fc,LP = 40 Hz, rejecting high-frequency EMG.
- System gain G = 100 V/V, amplifying microvolt signals to a 0 to 3.3 V dynamic range.
- Fast-restore circuitry re-stabilizes the baseline within 15 ms following electrode detachment.

## 4. Optical Hemodynamic Sensing (MAX30102)
Pulsatile blood volume shifts are captured simultaneously via a Maxim Integrated MAX30102 optical sensor seated against the earlobe or antihelix:
- Red LED at 660 nm and Infrared LED at 880 nm.
- 18-bit delta-sigma ADC with over 60 dB ambient light cancellation.
- Programmable pulse width (69 to 411 microseconds) and drive current (0 to 50 mA).
- Measures both pulsatile (AC) and baseline (DC) optical absorption to evaluate perfusion and pulse transit time (PTT).

## 5. Microcontroller and Telemetry (ESP32)
An Espressif ESP32 dual-core Xtensa LX6 microcontroller operating at 240 MHz coordinates the system:
- Digitizes analog ECG at 250 Hz through an internal 12-bit SAR ADC calibrated via a 1024-point hardware lookup table.
- Reads MAX30102 optical samples over I2C at 400 kHz.
- Packages data into 20-byte BLE 5.0 GATT frames: sequence counter (2 bytes), ECG sample (2 bytes), Red PPG (3 bytes), IR PPG (3 bytes), SQI status (1 byte), and battery voltage (1 byte).
- Total system current draw: 18.4 mA in active dual streaming mode.
- Battery life: 16.3 hours on a 300 mAh rechargeable lithium-polymer pouch cell.
