from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import sys
import os
import json

# Add src folder to path
sys.path.append(os.path.join(os.path.dirname(__file__), "src"))
from predict import CardiacMLPredictor
from multimodal_fusion import MultimodalPredictor
from conformal_uncertainty import ConformalUncertaintyGuardrail
from patient_history_service import PatientTelemetryHistoryService

app = FastAPI(
    title="Ear-to-Heart AI Intelligence API", 
    version="4.0",
    description="Hospital-grade Cardiac AI engine featuring SE-ResNet-1D, Pan-Tompkins SQI Gating, 1D Grad-CAM, MongoDB Cloud History, and 95% Conformal Prediction."
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global model predictors & services
try:
    cardiac_predictor = CardiacMLPredictor()
    multimodal_predictor = MultimodalPredictor()
    conformal_guardrail = ConformalUncertaintyGuardrail(alpha=0.05)
    history_service = PatientTelemetryHistoryService()
    print("[+] All Cardiac ML/DL Predictors, Conformal Guardrails, and MongoDB Services loaded successfully.")
except Exception as e:
    print(f"[!] Initialization warning: {e}")
    cardiac_predictor = None
    multimodal_predictor = None
    conformal_guardrail = None
    history_service = None

# -----------------------------------------------------------------------------
# SCHEMAS
# -----------------------------------------------------------------------------
class RawWaveformRequest(BaseModel):
    signals: List[List[float]] = Field(
        ..., 
        description="ECG waveform array from AD8232 / 12-lead. Shape (1, 1000) or (12, 1000)."
    )
    ppg_signal: Optional[List[float]] = Field(
        None, 
        description="Optional MAX30102 PPG waveform stream for HRV & perfusion index."
    )
    reported_spo2: Optional[float] = Field(
        98.0, 
        description="Reported SpO2 reading from MAX30102 sensor (70-100%)."
    )
    patient_id: Optional[str] = Field("default_patient", example="PATIENT-001")

class ClinicalVitalsRequest(BaseModel):
    Age: float = Field(..., example=55.0)
    Sex: str = Field(..., example="M")
    ChestPainType: str = Field(..., example="ASY")
    RestingBP: float = Field(..., example=135.0)
    Cholesterol: float = Field(..., example=240.0)
    FastingBS: int = Field(..., example=0)
    RestingECG: str = Field(..., example="Normal")
    MaxHR: float = Field(..., example=140.0)
    ExerciseAngina: str = Field(..., example="Y")
    Oldpeak: float = Field(..., example=1.5)
    ST_Slope: str = Field(..., example="Flat")
    patient_id: Optional[str] = Field("default_patient", example="PATIENT-001")

class MultimodalRequest(BaseModel):
    signals: List[List[float]]
    vitals: Dict[str, Any]
    patient_id: Optional[str] = Field("default_patient", example="PATIENT-001")

# -----------------------------------------------------------------------------
# ENDPOINTS
# -----------------------------------------------------------------------------
@app.get("/")
def read_root():
    return {
        "status": "ONLINE",
        "system": "Ear-to-Heart SOTA Multimodal Cardiac Pipeline",
        "version": "4.0 (Hospital-Grade)",
        "features": [
            "Hardware Sensor SQI Validation Gate (AD8232 + MAX30102)",
            "Deep Learning SE-ResNet-1D + BiGRU Multi-Label Classifier",
            "1D Grad-CAM Explainable Pathology Waveform Attribution",
            "SOTA Stacking Tabular Classifier (RF + XGB + CatBoost + LightGBM)",
            "Gated Cross-Attention Multimodal Telemetry Fusion",
            "95% Conformal Prediction Bounds for Uncertainty Quantification",
            "Longitudinal Patient History with MongoDB Cloud Synchronization"
        ]
    }

@app.post("/predict/ecg")
def predict_raw_ecg(req: RawWaveformRequest):
    if not cardiac_predictor:
        raise HTTPException(status_code=500, detail="Cardiac Predictor not loaded.")
    try:
        if len(req.signals) not in [1, 12]:
            raise HTTPException(status_code=400, detail="Must provide exactly 1 lead (AD8232) or 12 leads.")
        if len(req.signals[0]) != 1000:
            raise HTTPException(status_code=400, detail="Each lead must contain 1000 samples (10s @ 100Hz).")
            
        result = cardiac_predictor.predict_ecg_sensor_stream(
            raw_waveform=req.signals,
            ppg_data=req.ppg_signal,
            reported_spo2=req.reported_spo2 or 98.0
        )
        
        # 1. Conformal Uncertainty Guardrail (95% statistical coverage)
        if conformal_guardrail and result.get("detailed_analysis"):
            probs = [c["probability"] for c in result["detailed_analysis"]]
            sqi = result.get("sqi_assessment", {}).get("overall_sqi", 0.95)
            conformal_report = conformal_guardrail.evaluate_with_guarantee(probs, sqi_score=sqi)
            result["conformal_uncertainty"] = conformal_report
            
        # 2. Automated MongoDB Telemetry Persistence
        if history_service and result.get("status") == "ANALYSIS_COMPLETE":
            try:
                bpm_val = 72.0
                sqi_data = result.get("sqi_assessment")
                if isinstance(sqi_data, dict):
                    ppg_hrv = sqi_data.get("ppg_hrv_analysis")
                    if isinstance(ppg_hrv, dict) and ppg_hrv.get("heart_rate_bpm") is not None:
                        bpm_val = float(ppg_hrv.get("heart_rate_bpm"))

                hf_risk = 0.15
                if conformal_guardrail and "detailed_analysis" in result:
                    for det in result["detailed_analysis"]:
                        if det.get("class") in ["STTC", "MI"]:
                            hf_risk = max(hf_risk, det.get("probability", 0.15))

                history_service.save_session({
                    "patient_id": req.patient_id or "default_patient",
                    "bpm": bpm_val,
                    "spo2": req.reported_spo2 or 98.0,
                    "primary_condition": result.get("primary_diagnosis"),
                    "confidence": result.get("primary_confidence"),
                    "heart_failure_risk": hf_risk,
                    "sqi_assessment": result.get("sqi_assessment", {}),
                    "conformal_certainty": result.get("conformal_uncertainty", {}).get("certainty_level")
                })
            except Exception as ex:
                print(f"[!] Background history sync note: {ex}")
                
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/predict/vitals")
def predict_vitals(req: ClinicalVitalsRequest):
    if not cardiac_predictor:
        raise HTTPException(status_code=500, detail="Predictor not initialized.")
    try:
        patient_dict = req.dict()
        res = cardiac_predictor.predict_tabular_vitals(patient_dict)
        
        # Sync to MongoDB
        if history_service:
            history_service.save_session({
                "patient_id": req.patient_id or "default_patient",
                "resting_bp": req.RestingBP,
                "primary_condition": res.get("predicted_condition"),
                "confidence": res.get("heart_disease_risk_probability"),
                "heart_failure_risk": res.get("heart_disease_risk_probability")
            })
            
        return res
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/predict/multimodal")
def predict_multimodal_endpoint(req: MultimodalRequest):
    if not multimodal_predictor:
        raise HTTPException(status_code=500, detail="Multimodal predictor not initialized.")
    try:
        res = multimodal_predictor.predict_multimodal(req.signals, req.vitals)
        
        # Sync to MongoDB
        if history_service:
            history_service.save_session({
                "patient_id": req.patient_id or "default_patient",
                "primary_condition": res.get("risk_tier"),
                "confidence": res.get("multimodal_heart_failure_risk"),
                "heart_failure_risk": res.get("multimodal_heart_failure_risk")
            })
            
        return res
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/patient/history/{patient_id}")
def get_patient_history(patient_id: str):
    """
    Retrieves longitudinal risk trend timeline directly from MongoDB.
    """
    if not history_service:
        raise HTTPException(status_code=500, detail="History service not initialized.")
    try:
        return history_service.get_patient_trajectory(patient_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/metrics/sota")
def get_sota_metrics():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    tab_metrics_path = os.path.join(base_dir, "results", "sota_tabular", "sota_tabular_metrics.json")
    dl_metrics_path = os.path.join(base_dir, "results", "sota_deep_learning_metrics.json")
    
    out = {}
    if os.path.exists(tab_metrics_path):
        with open(tab_metrics_path, 'r') as f:
            out["tabular_benchmarks"] = json.load(f)
    if os.path.exists(dl_metrics_path):
        with open(dl_metrics_path, 'r') as f:
            out["deep_learning_benchmarks"] = json.load(f)
            
    return out
