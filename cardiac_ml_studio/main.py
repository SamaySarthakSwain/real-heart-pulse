from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List
import sys
import os

# Add src folder to path so we can import the predictor
sys.path.append(os.path.join(os.path.dirname(__file__), "src"))
from predict import CardiacMLPredictor

app = FastAPI(title="Ear-to-Heart AI API", version="2.0")

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load DL model globally at startup
try:
    predictor = CardiacMLPredictor()
except Exception as e:
    print(f"Failed to load predictor: {e}")

class RawWaveformFeatures(BaseModel):
    # Expects 12 leads, each containing 1000 float data points
    signals: List[List[float]] = Field(
        ..., 
        description="12-lead ECG waveform array. Shape must be strictly (12, 1000)"
    )

@app.get("/")
def read_root():
    return {"message": "Ear-to-Heart AI Pipeline is Active."}

@app.post("/predict/ecg")
def predict_raw_ecg(features: RawWaveformFeatures):
    try:
        if len(features.signals) not in [1, 12]:
            raise HTTPException(status_code=400, detail="Must provide exactly 1 or 12 leads.")
        if len(features.signals[0]) != 1000:
            raise HTTPException(status_code=400, detail="Each lead must contain exactly 1000 samples (10 seconds at 100Hz).")
            
        result = predictor.predict_ecg(features.signals)
        return result
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Note: to run locally: uvicorn main:app --reload
