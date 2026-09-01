from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import sys
import os

# Add src folder to path so we can import the predictor
sys.path.append(os.path.join(os.path.dirname(__file__), "src"))
from predict import CardiacMLPredictor

app = FastAPI(title="Cardiac ML Studio API", version="1.0")

# Enable CORS so your Vercel frontend can call this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins (change to your Vercel URL in production)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load models globally at startup
try:
    predictor = CardiacMLPredictor()
except Exception as e:
    print(f"Failed to load predictor: {e}")

class IschemiaFeatures(BaseModel):
    Age: float
    Sex: int
    ChestPainType: int
    RestingBP: float
    Cholesterol: float
    FastingBS: int
    MaxHR: float
    ExerciseAngina: int
    ST_Depression: float
    ST_Slope: int
    NumVesselsFluoroscopy: int

class AmyloidosisFeatures(BaseModel):
    Age: float
    RelativeWallThickness: float
    ApicalSparingRatio: float
    LowVoltageMassRatio: float
    NT_proBNP: float
    Troponin_T: float
    E_e_ratio: float
    LVEF: float
    MyocardialContractionFraction: float

class FibrosisFeatures(BaseModel):
    ExtracellularVolume_ECV: float
    Native_T1: float
    PostContrast_T1: float
    LGE_Scar_Percent: float
    TransmuralExtent: float
    LVEDVI: float
    LVMI: float
    GlobalLongitudinalStrain: float

@app.get("/")
def read_root():
    return {"message": "Cardiac ML Studio API is running!"}

@app.post("/predict/ischemia")
def predict_ischemia(features: IschemiaFeatures):
    try:
        result = predictor.predict_ischemia(features.model_dump())
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/predict/amyloidosis")
def predict_amyloidosis(features: AmyloidosisFeatures):
    try:
        result = predictor.predict_amyloidosis(features.model_dump())
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/predict/fibrosis")
def predict_fibrosis(features: FibrosisFeatures):
    try:
        result = predictor.predict_fibrosis(features.model_dump())
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Note: to run locally: uvicorn main:app --reload
