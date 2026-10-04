import os
import torch
import numpy as np
from train_dl_pipeline import ECG_1D_CNN

class CardiacMLPredictor:
    def __init__(self):
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        self.model = ECG_1D_CNN(num_classes=5).to(self.device)
        self.classes = ['NORM', 'MI', 'STTC', 'CD', 'HYP']
        self.class_descriptions = {
            'NORM': 'Normal ECG',
            'MI': 'Myocardial Infarction / Ischemia',
            'STTC': 'ST/T Change',
            'CD': 'Conduction Disturbance',
            'HYP': 'Hypertrophy'
        }
        self.load_model()
        
    def load_model(self):
        model_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), '../models/best_1d_cnn.pt')
        try:
            self.model.load_state_dict(torch.load(model_path, map_location=self.device))
            self.model.eval()
            print("Deep Learning model loaded successfully.")
        except Exception as e:
            print(f"Error loading PyTorch model: {e}")
            print("Ensure train_dl_pipeline.py has finished successfully.")
            
    def predict_ecg(self, waveform_data):
        """
        waveform_data: A 2D list/array of shape (12, 1000) representing 12-lead ECG over 10 seconds (100Hz).
        """
        # Convert to numpy and enforce shape
        sig = np.array(waveform_data, dtype=np.float32)
        
        if sig.shape == (1, 1000) or len(sig.shape) == 1:
            if len(sig.shape) == 1:
                sig = sig.reshape(1, 1000)
            # ESP32 usually provides a single lead. For this prototype, duplicate it to 12 channels.
            sig = np.repeat(sig, 12, axis=0)
            
        if sig.shape != (12, 1000):
            raise ValueError(f"Expected waveform shape (12, 1000) or (1, 1000), but got {sig.shape}")
            
        # Normalization (identical to Step 5)
        mean = np.mean(sig, axis=1, keepdims=True)
        std = np.std(sig, axis=1, keepdims=True)
        std[std == 0] = 1e-6
        sig = (sig - mean) / std
        
        # Add batch dimension: (1, 12, 1000)
        tensor_sig = torch.tensor(sig).unsqueeze(0).to(self.device)
        
        with torch.no_grad():
            outputs = self.model(tensor_sig)
            probs = torch.sigmoid(outputs).cpu().numpy()[0]
            
        # Format results
        results = []
        for i, cls_name in enumerate(self.classes):
            is_detected = bool(probs[i] > 0.5)
            results.append({
                "class": cls_name,
                "description": self.class_descriptions[cls_name],
                "probability": float(probs[i]),
                "detected": is_detected
            })
            
        # Identify Primary Condition (Highest probability)
        primary_idx = np.argmax(probs)
        primary_condition = self.classes[primary_idx]
        
        return {
            "primary_diagnosis": self.class_descriptions[primary_condition],
            "confidence": float(probs[primary_idx]),
            "detailed_analysis": results
        }

if __name__ == "__main__":
    predictor = CardiacMLPredictor()
    
    print("\n--- Testing ECG Deep Learning Prediction ---")
    # Generate a dummy 12x1000 random waveform to test
    dummy_waveform = np.random.randn(12, 1000).tolist()
    print(predictor.predict_ecg(dummy_waveform))
