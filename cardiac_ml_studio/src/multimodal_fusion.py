import os
import sys
import numpy as np
import torch
import torch.nn as nn
from sklearn.preprocessing import StandardScaler

# Fix Windows stdout
try:
    sys.stdout.reconfigure(encoding='utf-8')
except Exception:
    pass

class MultimodalCardiacFusionModel(nn.Module):
    """
    Multimodal Cross-Attention Cardiac Fusion Network:
    Fuses continuous biomedical sensor telemetry (AD8232 ECG waveforms + MAX30102 PPG vitals)
    with patient clinical demographics and risk factors into a unified diagnostic assessment.
    """
    def __init__(self, ecg_channels=12, tabular_dim=16, latent_dim=128, num_classes=5):
        super().__init__()
        
        # 1. ECG Physiological Waveform Encoder (1D Convolutional Stem + ResNet Stage)
        self.ecg_encoder = nn.Sequential(
            nn.Conv1d(ecg_channels, 64, kernel_size=15, stride=2, padding=7, bias=False),
            nn.BatchNorm1d(64),
            nn.ReLU(inplace=True),
            nn.MaxPool1d(kernel_size=3, stride=2, padding=1),
            
            nn.Conv1d(64, 128, kernel_size=7, stride=2, padding=3, bias=False),
            nn.BatchNorm1d(128),
            nn.ReLU(inplace=True),
            nn.AdaptiveAvgPool1d(1)
        )
        self.ecg_proj = nn.Linear(128, latent_dim)
        
        # 2. Patient Clinical & Telemetry Vitals Encoder (Dense Projection)
        self.vitals_encoder = nn.Sequential(
            nn.Linear(tabular_dim, 64),
            nn.BatchNorm1d(64),
            nn.ReLU(inplace=True),
            nn.Linear(64, latent_dim),
            nn.BatchNorm1d(latent_dim),
            nn.ReLU(inplace=True)
        )
        
        # 3. Gated Cross-Attention Fusion Unit
        self.gate_fc = nn.Sequential(
            nn.Linear(latent_dim * 2, latent_dim),
            nn.Sigmoid()
        )
        
        self.fusion_norm = nn.LayerNorm(latent_dim)
        
        # 4. Multi-Task Diagnostic Classifier Head
        self.classifier = nn.Sequential(
            nn.Linear(latent_dim, 64),
            nn.ReLU(inplace=True),
            nn.Dropout(0.3),
            nn.Linear(64, num_classes)
        )
        
        # Binary Global Heart Failure Risk Score Head
        self.risk_head = nn.Sequential(
            nn.Linear(latent_dim, 32),
            nn.ReLU(inplace=True),
            nn.Linear(32, 1)
        )
        
    def forward(self, ecg_waveforms, clinical_vitals):
        """
        ecg_waveforms: (Batch, 12, 1000) - continuous electrical sensor voltages
        clinical_vitals: (Batch, 16) - patient demographics, vitals (SpO2, BP, HR, etc.)
        """
        # Encode ECG
        ecg_feat = self.ecg_encoder(ecg_waveforms).squeeze(-1) # (Batch, 128)
        h_ecg = self.ecg_proj(ecg_feat)                         # (Batch, latent_dim)
        
        # Encode Clinical Vitals
        h_vitals = self.vitals_encoder(clinical_vitals)         # (Batch, latent_dim)
        
        # Gated Cross-Modal Fusion
        combined = torch.cat([h_ecg, h_vitals], dim=-1)         # (Batch, latent_dim * 2)
        gate = self.gate_fc(combined)                           # (Batch, latent_dim)
        
        # Gated Information Flow: allows model to lean on ECG or Vitals adaptively
        fused = gate * h_ecg + (1.0 - gate) * h_vitals
        fused = self.fusion_norm(fused)
        
        # Multi-label diagnostic classification
        logits_classes = self.classifier(fused)
        # Binary cardiac failure risk probability logit
        logit_risk = self.risk_head(fused)
        
        return logits_classes, logit_risk

class MultimodalPredictor:
    """
    Inference controller for end-to-end multimodal predictions.
    Accepts raw sensor waveforms from ESP32 alongside patient history.
    """
    def __init__(self, model_path=None):
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        self.model = MultimodalCardiacFusionModel(ecg_channels=12, tabular_dim=16, latent_dim=128, num_classes=5).to(self.device)
        self.classes = ['NORM', 'MI', 'STTC', 'CD', 'HYP']
        self.class_descriptions = {
            'NORM': 'Normal Cardiac Physiology',
            'MI': 'Myocardial Infarction / Ischemia Risk',
            'STTC': 'ST-T Wave Morphological Pathology',
            'CD': 'Conduction Disturbance / Block',
            'HYP': 'Ventricular Hypertrophy'
        }
        if model_path and os.path.exists(model_path):
            self.model.load_state_dict(torch.load(model_path, map_location=self.device))
        self.model.eval()

    def predict_multimodal(self, ecg_12x1000, clinical_vitals_dict):
        """
        Runs fused inference across continuous sensor telemetry and patient biomarkers.
        """
        # Convert ECG to tensor
        sig = np.array(ecg_12x1000, dtype=np.float32)
        if sig.shape == (1, 1000) or len(sig.shape) == 1:
            sig = np.repeat(sig.reshape(1, 1000), 12, axis=0)
            
        mean = np.mean(sig, axis=1, keepdims=True)
        std = np.std(sig, axis=1, keepdims=True)
        std[std == 0] = 1e-6
        sig = (sig - mean) / std
        
        tensor_ecg = torch.tensor(sig).unsqueeze(0).to(self.device)
        
        # Vectorize vitals (default baseline values if missing)
        vitals_vec = np.array([
            clinical_vitals_dict.get('Age', 55.0),
            clinical_vitals_dict.get('Sex', 1.0),
            clinical_vitals_dict.get('ChestPainType', 1.0),
            clinical_vitals_dict.get('RestingBP', 130.0),
            clinical_vitals_dict.get('Cholesterol', 220.0),
            clinical_vitals_dict.get('FastingBS', 0.0),
            clinical_vitals_dict.get('RestingECG', 0.0),
            clinical_vitals_dict.get('MaxHR', 140.0),
            clinical_vitals_dict.get('ExerciseAngina', 0.0),
            clinical_vitals_dict.get('Oldpeak', 1.0),
            clinical_vitals_dict.get('ST_Slope', 1.0),
            clinical_vitals_dict.get('RPP', 182.0),
            clinical_vitals_dict.get('HR_Ratio', 0.84),
            clinical_vitals_dict.get('PulsePressure', 50.0),
            clinical_vitals_dict.get('Stress_Index', 1.0),
            clinical_vitals_dict.get('SpO2', 98.0)
        ], dtype=np.float32)
        
        tensor_vitals = torch.tensor(vitals_vec).unsqueeze(0).to(self.device)
        
        with torch.no_grad():
            logits_cls, logit_risk = self.model(tensor_ecg, tensor_vitals)
            probs_cls = torch.sigmoid(logits_cls).cpu().numpy()[0]
            prob_risk = float(torch.sigmoid(logit_risk).cpu().numpy()[0][0])
            
        detailed = []
        for i, cls_name in enumerate(self.classes):
            detailed.append({
                "class": cls_name,
                "description": self.class_descriptions[cls_name],
                "probability": float(probs_cls[i]),
                "detected": bool(probs_cls[i] > 0.5)
            })
            
        return {
            "multimodal_heart_failure_risk": round(prob_risk, 4),
            "risk_tier": "High Risk" if prob_risk > 0.6 else ("Moderate Risk" if prob_risk > 0.3 else "Low Risk"),
            "pathology_analysis": detailed
        }

if __name__ == '__main__':
    print("Testing Multimodal Cardiac Fusion Module...")
    predictor = MultimodalPredictor()
    dummy_ecg = np.random.randn(12, 1000).tolist()
    dummy_vitals = {"Age": 62, "RestingBP": 145, "MaxHR": 110, "SpO2": 95, "Oldpeak": 2.5}
    res = predictor.predict_multimodal(dummy_ecg, dummy_vitals)
    print("Inference Result:", res)
