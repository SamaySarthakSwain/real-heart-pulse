import os
import sys
import json
import time
from datetime import datetime, timezone

# Fix stdout encoding
try:
    sys.stdout.reconfigure(encoding='utf-8')
except Exception:
    pass

class PatientTelemetryHistoryService:
    """
    Longitudinal Patient History & Telemetry Storage Service.
    Seamlessly synchronizes patient sensor sessions to MongoDB
    with an automatic local JSON database fallback for offline robustness.
    """
    def __init__(self, mongo_uri=None):
        self.mongo_uri = mongo_uri or os.environ.get("MONGO_URI", "mongodb://localhost:27017")
        self.db_name = "ear_to_heart"
        self.collection_name = "telemetry_sessions"
        
        base_dir = os.path.dirname(os.path.abspath(__file__))
        self.fallback_file = os.path.join(base_dir, '..', 'data', 'patient_history.json')
        os.makedirs(os.path.dirname(self.fallback_file), exist_ok=True)
        
        self.mongo_client = None
        self.db = None
        self._init_mongo()

    def _init_mongo(self):
        try:
            from pymongo import MongoClient
            self.mongo_client = MongoClient(self.mongo_uri, serverSelectionTimeoutMS=1000)
            # Ping to verify
            self.mongo_client.admin.command('ping')
            self.db = self.mongo_client[self.db_name]
            print(f"[+] Connected to MongoDB at: {self.mongo_uri}")
        except Exception as e:
            # Fallback to local structured JSON persistence
            self.mongo_client = None
            self.db = None
            print(f"[*] MongoDB offline ({e}). Operating in Local JSON Sync mode: {self.fallback_file}")

    def save_session(self, session_data):
        """
        Stores an assessment or 10-second telemetry session.
        """
        record = {
            "session_id": session_data.get("session_id", f"SESSION-{int(time.time()*1000)}"),
            "patient_id": session_data.get("patient_id", "default_patient"),
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "vitals": {
                "bpm": session_data.get("bpm"),
                "spo2": session_data.get("spo2"),
                "temperature": session_data.get("temperature"),
                "resting_bp": session_data.get("resting_bp")
            },
            "sqi_assessment": session_data.get("sqi_assessment", {}),
            "ai_diagnosis": {
                "primary_condition": session_data.get("primary_condition"),
                "confidence": session_data.get("confidence"),
                "heart_failure_risk": session_data.get("heart_failure_risk"),
                "conformal_certainty": session_data.get("conformal_certainty")
            }
        }
        
        # 1. Try MongoDB
        if self.db is not None:
            try:
                self.db[self.collection_name].insert_one(record.copy())
                return {"status": "SAVED_MONGO", "session_id": record["session_id"]}
            except Exception as e:
                print(f"[!] Mongo write error: {e}")
                
        # 2. Local Fallback Persistence
        existing = []
        if os.path.exists(self.fallback_file):
            try:
                with open(self.fallback_file, 'r', encoding='utf-8') as f:
                    existing = json.load(f)
            except Exception:
                existing = []
                
        existing.append(record)
        with open(self.fallback_file, 'w', encoding='utf-8') as f:
            json.dump(existing, f, indent=2)
            
        return {"status": "SAVED_LOCAL_DB", "session_id": record["session_id"]}

    def get_patient_trajectory(self, patient_id="default_patient"):
        """
        Retrieves the historical risk trajectory and vital trends for longitudinal analytics.
        """
        records = []
        if self.db is not None:
            try:
                cursor = self.db[self.collection_name].find({"patient_id": patient_id}).sort("timestamp", 1)
                for doc in cursor:
                    doc["_id"] = str(doc["_id"])
                    records.append(doc)
            except Exception:
                pass
                
        if not records and os.path.exists(self.fallback_file):
            try:
                with open(self.fallback_file, 'r', encoding='utf-8') as f:
                    all_records = json.load(f)
                    records = [r for r in all_records if r.get("patient_id") == patient_id]
            except Exception:
                records = []
                
        # Calculate risk trend
        timeline = []
        for r in records:
            risk = r.get("ai_diagnosis", {}).get("heart_failure_risk", 0.0) or 0.0
            timeline.append({
                "timestamp": r.get("timestamp"),
                "risk_percent": round(risk * 100, 1),
                "bpm": r.get("vitals", {}).get("bpm"),
                "spo2": r.get("vitals", {}).get("spo2"),
                "condition": r.get("ai_diagnosis", {}).get("primary_condition")
            })
            
        return {
            "patient_id": patient_id,
            "total_recorded_sessions": len(records),
            "longitudinal_timeline": timeline
        }

if __name__ == '__main__':
    service = PatientTelemetryHistoryService()
    # Save a test session
    res = service.save_session({
        "patient_id": "PATIENT-001",
        "bpm": 74,
        "spo2": 98.5,
        "temperature": 36.8,
        "primary_condition": "Normal Sinus Rhythm",
        "confidence": 0.985,
        "heart_failure_risk": 0.14
    })
    print("Session Save Result:", res)
    traj = service.get_patient_trajectory("PATIENT-001")
    print(f"Trajectory retrieved: {traj['total_recorded_sessions']} sessions.")
