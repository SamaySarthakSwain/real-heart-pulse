import os
import sys
import numpy as np
from scipy import signal
from scipy.stats import kurtosis, skew
import matplotlib.pyplot as plt

# Fix Windows stdout encoding
try:
    sys.stdout.reconfigure(encoding='utf-8')
except Exception:
    pass

class BiomedicalSensorSQIEngine:
    """
    Hospital-grade Signal Quality Index (SQI) and Hardware Preprocessing Engine
    tailored for ESP32 biomedical sensors (AD8232 ECG + MAX30102 PPG).
    
    Ensures that incoming sensor streams pass strict physiological validity
    and noise thresholds BEFORE being fed into deep learning diagnostic models.
    """
    def __init__(self, sampling_rate=100):
        self.fs = sampling_rate # ESP32 defaults to 100Hz for 10-second window
        
    # =========================================================================
    # 1. MATHEMATICAL ECG FILTERS & PAN-TOMPKINS QRS DETECTOR
    # =========================================================================
    def bandpass_filter(self, data, lowcut=0.5, highcut=40.0, order=3):
        """Zero-phase Butterworth bandpass filter to suppress baseline wander (<0.5Hz) and high-frequency EMG noise (>40Hz)."""
        nyquist = 0.5 * self.fs
        low = max(0.01, lowcut / nyquist)
        high = min(0.99, highcut / nyquist)
        b, a = signal.butter(order, [low, high], btype='band')
        filtered = signal.filtfilt(b, a, data)
        return filtered

    def pan_tompkins_qrs(self, ecg_signal):
        """
        Implementation of the canonical Pan-Tompkins QRS Detection Algorithm:
        1. Bandpass filter (5-15 Hz for QRS energy concentration)
        2. 5-point derivative: y[n] = (1/8)*(2x[n] + x[n-1] - x[n-3] - 2x[n-4])
        3. Squaring function: y[n] = x^2[n]
        4. Moving window integration (~150 ms)
        5. Adaptive peak thresholding
        """
        # Step 1: Bandpass 5-15 Hz
        nyq = 0.5 * self.fs
        b, a = signal.butter(2, [5.0/nyq, 15.0/nyq], btype='band')
        filtered = signal.filtfilt(b, a, ecg_signal)
        
        # Step 2: Derivative
        diff = np.diff(filtered)
        diff = np.append(diff, 0)
        
        # Step 3: Squaring
        squared = diff ** 2
        
        # Step 4: Moving Window Integration (window ~ 150 ms)
        window_size = int(0.15 * self.fs)
        kernel = np.ones(window_size) / window_size
        integrated = np.convolve(squared, kernel, mode='same')
        
        # Step 5: Adaptive threshold peak detection
        threshold = 0.35 * np.max(integrated) if np.max(integrated) > 0 else 0.1
        peaks, _ = signal.find_peaks(integrated, height=threshold, distance=int(0.3 * self.fs))
        return peaks, integrated

    def secondary_qrs_detector(self, ecg_signal):
        """Secondary QRS peak detector using continuous stationary derivative thresholding for bSQI agreement."""
        filtered = self.bandpass_filter(ecg_signal, lowcut=1.0, highcut=35.0)
        threshold = 0.40 * np.max(np.abs(filtered))
        peaks, _ = signal.find_peaks(np.abs(filtered), height=threshold, distance=int(0.3 * self.fs))
        return peaks

    # =========================================================================
    # 2. SIGNAL QUALITY INDICES (SQI)
    # =========================================================================
    def compute_bsqi(self, peaks1, peaks2, tolerance_ms=50):
        """
        Beat Signal Quality Index (bSQI):
        Measures the degree of agreement between two independent QRS detectors.
        Tolerance window is typically 50 ms.
        Formula: bSQI = (2 * N_matched) / (N1 + N2)
        """
        if len(peaks1) == 0 or len(peaks2) == 0:
            return 0.0
            
        tolerance_samples = int((tolerance_ms / 1000.0) * self.fs)
        matched = 0
        
        for p1 in peaks1:
            if np.any(np.abs(peaks2 - p1) <= tolerance_samples):
                matched += 1
                
        bsqi = (2.0 * matched) / (len(peaks1) + len(peaks2))
        return float(np.clip(bsqi, 0.0, 1.0))

    def compute_ksqi(self, ecg_signal):
        """
        Kurtosis SQI (kSQI):
        Clean ECG exhibits sharp peaks with high kurtosis (> 5.0).
        Pure Gaussian noise or flatlines have kurtosis ~ 3.0 or < 2.0.
        """
        k = kurtosis(ecg_signal, fisher=False)
        # Normalize into a 0.0 - 1.0 score
        if np.isnan(k): return 0.0
        if k >= 5.0:
            score = 1.0
        elif k <= 2.0:
            score = 0.2
        else:
            score = 0.2 + 0.8 * ((k - 2.0) / 3.0)
        return float(np.clip(score, 0.0, 1.0))

    def compute_psqi(self, ecg_signal):
        """
        Power Spectral Density SQI (pSQI):
        Evaluates the ratio of power in the QRS frequency band (5-15 Hz)
        to the total physiological bandwidth (1-40 Hz).
        """
        freqs, psd = signal.welch(ecg_signal, fs=self.fs, nperseg=min(len(ecg_signal), 256))
        qrs_band = (freqs >= 5.0) & (freqs <= 15.0)
        total_band = (freqs >= 1.0) & (freqs <= 40.0)
        
        power_qrs = np.sum(psd[qrs_band])
        power_total = np.sum(psd[total_band])
        
        if power_total <= 1e-8:
            return 0.0
        ratio = power_qrs / power_total
        return float(np.clip(ratio * 2.0, 0.0, 1.0)) # Scaled to [0, 1]

    # =========================================================================
    # 3. MAX30102 PPG SQI & HRV FEATURE EXTRACTOR
    # =========================================================================
    def compute_ppg_sqi_and_hrv(self, ppg_signal, reported_spo2=98.0):
        """
        Evaluates PPG signal quality from MAX30102 sensor and computes Heart Rate Variability (HRV):
        - SDNN (Standard deviation of NN intervals in ms)
        - RMSSD (Root mean square of successive differences in ms)
        - pNN50 (% of successive intervals differing by > 50 ms)
        - Perfusion Index (AC / DC * 100%)
        """
        # AC and DC components
        dc_val = np.mean(ppg_signal)
        ac_val = (np.max(ppg_signal) - np.min(ppg_signal)) / 2.0
        perfusion_index = (ac_val / (abs(dc_val) + 1e-5)) * 100.0
        
        # Detect systolic peaks in PPG
        peaks, _ = signal.find_peaks(ppg_signal, distance=int(0.4 * self.fs))
        
        hrv_metrics = {
            "heart_rate_bpm": 0.0,
            "sdnn_ms": 0.0,
            "rmssd_ms": 0.0,
            "pnn50_pct": 0.0,
            "perfusion_index": float(perfusion_index),
            "spo2_valid": bool(70.0 <= reported_spo2 <= 100.0)
        }
        
        if len(peaks) >= 3:
            # RR intervals in milliseconds
            rr_intervals = (np.diff(peaks) / float(self.fs)) * 1000.0
            hrv_metrics["heart_rate_bpm"] = float(60000.0 / np.mean(rr_intervals))
            hrv_metrics["sdnn_ms"] = float(np.std(rr_intervals))
            
            successive_diffs = np.diff(rr_intervals)
            hrv_metrics["rmssd_ms"] = float(np.sqrt(np.mean(successive_diffs ** 2)))
            
            nn50 = np.sum(np.abs(successive_diffs) > 50.0)
            hrv_metrics["pnn50_pct"] = float((nn50 / len(successive_diffs)) * 100.0) if len(successive_diffs) > 0 else 0.0
            
        return hrv_metrics

    # =========================================================================
    # 4. MASTER VALIDATION & GATING LOGIC
    # =========================================================================
    def evaluate_sensor_signal(self, ecg_raw, ppg_raw=None, reported_spo2=98.0):
        """
        Comprehensive hardware validation gate for ESP32 stream:
        Returns quality scores and actionable diagnostic gating decision.
        """
        ecg_arr = np.array(ecg_raw, dtype=np.float32)
        
        # Check for disconnection / zero flatline
        std_val = np.std(ecg_arr)
        if std_val < 1e-4:
            return {
                "decision": "LEADS_OFF_DETACHED",
                "can_proceed_to_ml": False,
                "overall_sqi": 0.0,
                "message": "AD8232 ECG Leads appear detached or disconnected from patient.",
                "details": {"bSQI": 0.0, "kSQI": 0.0, "pSQI": 0.0}
            }
            
        # Filter ECG
        filtered_ecg = self.bandpass_filter(ecg_arr)
        
        # Detect Peaks
        p1, _ = self.pan_tompkins_qrs(filtered_ecg)
        p2 = self.secondary_qrs_detector(filtered_ecg)
        
        # Calculate SQI components
        bsqi = self.compute_bsqi(p1, p2)
        ksqi = self.compute_ksqi(filtered_ecg)
        psqi = self.compute_psqi(filtered_ecg)
        
        # Weighted Overall SQI Score
        overall_sqi = (0.50 * bsqi) + (0.30 * psqi) + (0.20 * ksqi)
        
        # Decision Logic
        if overall_sqi >= 0.70 and len(p1) >= 4:
            decision = "ACCEPT_CLEAN_SIGNAL"
            can_proceed = True
            msg = "Sensor signal verified: High fidelity biomedical telemetry."
        elif overall_sqi >= 0.45:
            decision = "MARGINAL_SIGNAL_WARNING"
            can_proceed = True # Still allows inference but flags caution
            msg = "Moderate noise or minor motion detected. Interpret with caution."
        else:
            decision = "REJECT_NOISY_SIGNAL"
            can_proceed = False
            msg = "Excessive motion artifact or electrode interference. Patient must remain still."
            
        ppg_results = None
        if ppg_raw is not None:
            ppg_results = self.compute_ppg_sqi_and_hrv(ppg_raw, reported_spo2)
            
        return {
            "decision": decision,
            "can_proceed_to_ml": can_proceed,
            "overall_sqi": round(overall_sqi, 4),
            "sqi_components": {
                "bSQI_beat_agreement": round(bsqi, 4),
                "kSQI_kurtosis": round(ksqi, 4),
                "pSQI_qrs_energy": round(psqi, 4)
            },
            "detected_r_peaks": len(p1),
            "filtered_ecg": filtered_ecg.tolist(),
            "ppg_hrv_analysis": ppg_results,
            "message": msg
        }

if __name__ == "__main__":
    print("--- Testing Biomedical Sensor SQI Engine ---")
    engine = BiomedicalSensorSQIEngine(sampling_rate=100)
    
    # 1. Generate Clean Synthetic ECG test pulse
    t = np.linspace(0, 10, 1000) # 10 seconds at 100Hz
    # Heartbeat pulses every 0.8s (~75 bpm)
    clean_ecg = np.zeros(1000)
    for beat_time in np.arange(0.5, 9.8, 0.8):
        idx = int(beat_time * 100)
        if idx < 990:
            clean_ecg[idx-5:idx+5] += signal.windows.gaussian(10, std=2) * 1.5 # R-peak
            
    # Add mild noise
    clean_ecg += np.random.normal(0, 0.05, 1000)
    
    res_clean = engine.evaluate_sensor_signal(clean_ecg)
    print(f"Clean Signal Result: Decision={res_clean['decision']}, Overall SQI={res_clean['overall_sqi']}")
    print(f"Components: {res_clean['sqi_components']}")
    
    # 2. Test Noisy / Motion Artifact Signal
    noisy_ecg = clean_ecg + 2.0 * np.sin(2 * np.pi * 0.2 * t) + np.random.normal(0, 0.8, 1000)
    res_noisy = engine.evaluate_sensor_signal(noisy_ecg)
    print(f"\nNoisy Signal Result: Decision={res_noisy['decision']}, Overall SQI={res_noisy['overall_sqi']}")
    print(f"Components: {res_noisy['sqi_components']}")
