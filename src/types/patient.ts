export type PatientGender = "Male" | "Female" | "Other";

export type RiskLevel = "Low" | "Moderate" | "High" | "Critical";

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: PatientGender;
  email: string;
  phone?: string;
  bloodType?: string;
  condition?: string;
  allergies?: string;
  medications?: string[];
  emergencyContact?: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface TestRecord {
  id: string;
  patientId: string;
  timestamp: string; // ISO format
  testType: "ECG Monitoring" | "PPG & Vitals" | "AI Arrhythmia Screening" | "Comprehensive Cardiac Panel";
  bpm: number;
  spo2: number;
  temperature?: number;
  bloodPressure?: string;
  ecgStatus?: string;
  aiRiskLevel?: RiskLevel;
  aiDiagnosis?: string;
  notes?: string;
  device?: string;
}
