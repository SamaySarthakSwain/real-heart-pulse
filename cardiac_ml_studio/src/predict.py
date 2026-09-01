import os
import joblib
import pandas as pd
import warnings

warnings.filterwarnings('ignore')

class CardiacMLPredictor:
    def __init__(self):
        self.models = {}
        self.load_models()
        
    def load_models(self):
        model_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), '../models')
        
        try:
            self.models['ischemia'] = joblib.load(os.path.join(model_dir, 'ischemia_xgboost.joblib'))
            self.models['amyloidosis'] = joblib.load(os.path.join(model_dir, 'amyloidosis_xgboost.joblib'))
            self.models['fibrosis'] = joblib.load(os.path.join(model_dir, 'fibrosis_xgboost.joblib'))
            print("Models loaded successfully.")
        except Exception as e:
            print(f"Error loading models: {e}")
            print("Please run train_all.py first to generate the models.")
            
    def predict_ischemia(self, features):
        """
        Features expected (dict): Age, Sex, ChestPainType, RestingBP, Cholesterol, FastingBS, 
                                  MaxHR, ExerciseAngina, ST_Depression, ST_Slope, NumVesselsFluoroscopy
        """
        df = pd.DataFrame([features])
        prob = self.models['ischemia'].predict_proba(df)[0][1]
        pred = self.models['ischemia'].predict(df)[0]
        return {"prediction": int(pred), "probability": float(prob), "diagnosis": "Ischemic Heart Disease" if pred == 1 else "Normal"}

    def predict_amyloidosis(self, features):
        """
        Features expected (dict): Age, RelativeWallThickness, ApicalSparingRatio, LowVoltageMassRatio,
                                  NT_proBNP, Troponin_T, E_e_ratio, LVEF, MyocardialContractionFraction
        """
        df = pd.DataFrame([features])
        prob = self.models['amyloidosis'].predict_proba(df)[0][1]
        pred = self.models['amyloidosis'].predict(df)[0]
        return {"prediction": int(pred), "probability": float(prob), "diagnosis": "Cardiac Amyloidosis" if pred == 1 else "Normal"}
        
    def predict_fibrosis(self, features):
        """
        Features expected (dict): ExtracellularVolume_ECV, Native_T1, PostContrast_T1, LGE_Scar_Percent,
                                  TransmuralExtent, LVEDVI, LVMI, GlobalLongitudinalStrain
        """
        df = pd.DataFrame([features])
        prob = self.models['fibrosis'].predict_proba(df)[0][1]
        pred = self.models['fibrosis'].predict(df)[0]
        return {"prediction": int(pred), "probability": float(prob), "diagnosis": "Myocardial Fibrosis" if pred == 1 else "Normal"}

if __name__ == "__main__":
    predictor = CardiacMLPredictor()
    
    # 1. Test Ischemia Prediction
    print("\n--- Testing Ischemia Prediction ---")
    ischemia_sample = {
        'Age': 65, 'Sex': 1, 'ChestPainType': 3, 'RestingBP': 145, 'Cholesterol': 280,
        'FastingBS': 1, 'MaxHR': 110, 'ExerciseAngina': 1, 'ST_Depression': 2.5,
        'ST_Slope': 1, 'NumVesselsFluoroscopy': 2
    }
    print("Input:", ischemia_sample)
    print("Result:", predictor.predict_ischemia(ischemia_sample))
    
    # 2. Test Amyloidosis Prediction
    print("\n--- Testing Amyloidosis Prediction ---")
    amyloid_sample = {
        'Age': 78, 'RelativeWallThickness': 0.65, 'ApicalSparingRatio': 1.2, 
        'LowVoltageMassRatio': 0.1, 'NT_proBNP': 4500, 'Troponin_T': 65, 
        'E_e_ratio': 18, 'LVEF': 45, 'MyocardialContractionFraction': 25
    }
    print("Input:", amyloid_sample)
    print("Result:", predictor.predict_amyloidosis(amyloid_sample))

    # 3. Test Fibrosis Prediction
    print("\n--- Testing Fibrosis Prediction ---")
    fibrosis_sample = {
        'ExtracellularVolume_ECV': 35.5, 'Native_T1': 1120, 'PostContrast_T1': 350, 
        'LGE_Scar_Percent': 15.0, 'TransmuralExtent': 45.0, 'LVEDVI': 120.0, 
        'LVMI': 95.0, 'GlobalLongitudinalStrain': -11.5
    }
    print("Input:", fibrosis_sample)
    print("Result:", predictor.predict_fibrosis(fibrosis_sample))
