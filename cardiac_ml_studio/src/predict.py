import os
import sys
import json
import numpy as np
import pandas as pd
import torch
import joblib

# Fix Windows stdout
try:
    sys.stdout.reconfigure(encoding='utf-8')
except Exception:
    pass

from sensor_sqi_engine import BiomedicalSensorSQIEngine
from ecg_gradcam import ECG1DGradCAM
from train_dl_pipeline import ECG_1D_CNN
from train_sota_ecg_dl import SOTA_SE_ResNet_GRU
from train_sota_heart_failure import engineer_clinical_features

class CardiacMLPredictor:
    """
    Hospital-grade unified inference engine for the 'Ear-to-Heart' biomedical system:
    1. Hardware Sensor Preprocessing & Signal Quality Index (SQI) validation.
    2. Deep Learning ECG Waveform Multi-Label Diagnosis (PTB-XL 5 Superclasses).
    3. 1D Grad-CAM Explainable Clinical Waveform Attribution.
    4. SOTA Tabular Heart Failure Stacking Classifier.
    """
    def __init__(self):
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        self.sqi_engine = BiomedicalSensorSQIEngine(sampling_rate=100)
        
        self.classes = ['NORM', 'MI', 'STTC', 'CD', 'HYP']
        self.class_descriptions = {
            'NORM': 'Normal Cardiac Rhythm & Waveform',
            'MI': 'Myocardial Infarction / Acute Ischemia',
            'STTC': 'ST-T Wave Pathology (Ischemia/Strain)',
            'CD': 'Conduction Disturbance (Bundle Branch Block)',
            'HYP': 'Ventricular Hypertrophy'
        }
        
        self.load_deep_learning_model()
        self.load_tabular_stacking_model()
        
    def load_deep_learning_model(self):
        base_dir = os.path.dirname(os.path.abspath(__file__))
        sota_path = os.path.join(base_dir, '..', 'models', 'sota_se_resnet_gru.pt')
        cnn_path = os.path.join(base_dir, '..', 'models', 'best_1d_cnn.pt')
        
        if os.path.exists(sota_path):
            try:
                self.dl_model = SOTA_SE_ResNet_GRU(in_channels=12, num_classes=5).to(self.device)
                self.dl_model.load_state_dict(torch.load(sota_path, map_location=self.device))
                self.dl_model.eval()
                # Target stage3 for Grad-CAM
                self.gradcam = ECG1DGradCAM(self.dl_model, self.dl_model.stage3)
                self.dl_model_type = "SOTA_SE_ResNet_GRU"
                print("[+] Loaded SOTA SE-ResNet-1D + BiGRU deep learning model.")
                return
            except Exception as e:
                print(f"[!] SOTA model load note: {e}")
                
        if os.path.exists(cnn_path):
            self.dl_model = ECG_1D_CNN(num_classes=5).to(self.device)
            self.dl_model.load_state_dict(torch.load(cnn_path, map_location=self.device))
            self.dl_model.eval()
            self.gradcam = ECG1DGradCAM(self.dl_model, self.dl_model.features[9])
            self.dl_model_type = "1D_CNN_Baseline"
            print("[+] Loaded 1D-CNN deep learning model.")
        else:
            print("[!] Warning: No pretrained PyTorch checkpoint found.")
            self.dl_model = None

    def load_tabular_stacking_model(self):
        base_dir = os.path.dirname(os.path.abspath(__file__))
        stacking_path = os.path.join(base_dir, '..', 'models', 'heart_failure_sota_stacking.joblib')
        scaler_path = os.path.join(base_dir, '..', 'models', 'heart_failure_sota_scaler.joblib')
        encoders_path = os.path.join(base_dir, '..', 'models', 'heart_failure_sota_encoders.joblib')
        features_path = os.path.join(base_dir, '..', 'models', 'heart_failure_sota_features.json')
        
        if os.path.exists(stacking_path) and os.path.exists(scaler_path):
            try:
                self.tabular_stacker = joblib.load(stacking_path)
                self.tabular_scaler = joblib.load(scaler_path)
                self.tabular_encoders = joblib.load(encoders_path)
                with open(features_path, 'r') as f:
                    self.tabular_features = json.load(f)["optimal_features"]
                print("[+] Loaded SOTA Stacking Heart Failure Tabular Classifier.")
                return
            except Exception as e:
                print(f"[!] Tabular model load note: {e}")
                
        self.tabular_stacker = None

    def predict_ecg_sensor_stream(self, raw_waveform, ppg_data=None, reported_spo2=98.0, explain=True):
        """
        Executes end-to-end pipeline on real hardware sensor telemetry:
        1. SQI Validation (rejects loose electrode / heavy motion).
        2. Normalization & Waveform Diagnostic Inference.
        3. Grad-CAM 1D Attribution heatmap.
        """
        sig = np.array(raw_waveform, dtype=np.float32)
        lead_to_evaluate = sig[0] if sig.ndim > 1 else sig
        
        # Step 1: Hardware SQI Validation Gate
        sqi_report = self.sqi_engine.evaluate_sensor_signal(lead_to_evaluate, ppg_data, reported_spo2)
        if not sqi_report["can_proceed_to_ml"]:
            return {
                "status": "SIGNAL_QUALITY_REJECTED",
                "sqi_assessment": sqi_report,
                "message": sqi_report["message"],
                "detailed_analysis": []
            }
            
        # Step 2: Prepare tensor
        if sig.shape == (1, 1000) or len(sig.shape) == 1:
            sig = np.repeat(sig.reshape(1, 1000), 12, axis=0)
            
        mean = np.mean(sig, axis=1, keepdims=True)
        std = np.std(sig, axis=1, keepdims=True)
        std[std == 0] = 1e-6
        sig_norm = (sig - mean) / std
        
        tensor_sig = torch.tensor(sig_norm).unsqueeze(0).to(self.device)
        
        # Step 3: Deep Learning Diagnostic Inference
        with torch.no_grad():
            outputs = self.dl_model(tensor_sig)
            probs = torch.sigmoid(outputs).cpu().numpy()[0]
            
        primary_idx = int(np.argmax(probs))
        primary_condition = self.classes[primary_idx]
        
        # Step 4: 1D Grad-CAM Explainability
        attribution_map = []
        if explain and self.gradcam:
            try:
                heatmap = self.gradcam.generate_heatmap(tensor_sig, primary_idx)
                attribution_map = heatmap.tolist()
            except Exception as e:
                print(f"[!] Grad-CAM note: {e}")
                
        results = []
        for i, cls_name in enumerate(self.classes):
            results.append({
                "class": cls_name,
                "description": self.class_descriptions[cls_name],
                "probability": float(probs[i]),
                "detected": bool(probs[i] > 0.5)
            })
            
        return {
            "status": "ANALYSIS_COMPLETE",
            "model_architecture": self.dl_model_type,
            "sqi_assessment": sqi_report,
            "primary_diagnosis": self.class_descriptions[primary_condition],
            "primary_confidence": float(probs[primary_idx]),
            "detailed_analysis": results,
            "gradcam_1d_attribution": attribution_map,
            "gradcam_attribution": attribution_map
        }

    def predict_tabular_vitals(self, patient_dict):
        """
        Runs SOTA Stacking Classifier on clinical vitals.
        """
        if self.tabular_stacker is None:
            return {"error": "Tabular model not initialized."}
            
        df = pd.DataFrame([patient_dict])
        df_eng = engineer_clinical_features(df)
        
        # Encode
        for col, le in self.tabular_encoders.items():
            if col in df_eng.columns:
                val = df_eng[col].iloc[0]
                if val in le.classes_:
                    df_eng[col] = le.transform([val])[0]
                else:
                    df_eng[col] = 0
                    
        df_eng['ST_Chest_Interaction'] = df_eng['ST_Slope'] * df_eng['ChestPainType']
        
        # Keep optimal features
        X_sub = df_eng[self.tabular_features]
        X_scaled = self.tabular_scaler.transform(X_sub)
        
        prob = float(self.tabular_stacker.predict_proba(X_scaled)[:, 1][0])
        pred = int(prob >= 0.5)
        
        return {
            "heart_disease_risk_probability": round(prob, 4),
            "predicted_condition": "High Risk of Heart Disease" if pred == 1 else "Normal / Low Risk",
            "features_used": self.tabular_features
        }

if __name__ == '__main__':
    print("Testing Unified Cardiac ML Predictor...")
    predictor = CardiacMLPredictor()
    dummy_trace = np.random.randn(1, 1000).tolist()
    # Should flag noisy/random trace via SQI
    res = predictor.predict_ecg_sensor_stream(dummy_trace)
    print("Inference on Random Noise (SQI Gated):", res["status"], res["message"])
