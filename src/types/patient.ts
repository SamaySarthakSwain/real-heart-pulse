export type PatientGender = "Male" | "Female" | "Intersex" | "Prefer not to say" | "Other";

export type RiskLevel = "Low" | "Moderate" | "High" | "Critical";

export type BloodGroup =
  | "A+"
  | "A-"
  | "B+"
  | "B-"
  | "AB+"
  | "AB-"
  | "O+"
  | "O-"
  | "Unknown"
  | "I don't know my blood group";

export interface PatientProfileData {
  fullName: string;
  dateOfBirth?: string; // YYYY-MM-DD
  age?: number;
  gender: PatientGender;
  bloodGroup: BloodGroup | string;
  heightCm?: number;
  weightKg?: number;
  profilePhoto?: string; // base64 or URL
  updatedAt?: string;
}

export interface PatientContactData {
  email: string;
  emailVerified: boolean;
  mobileNumber: string;
  countryCode: string;
  alternateNumber?: string;
  alternateCountryCode?: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country: string;
  preferredCommunication: "Email" | "SMS" | "Phone call" | "In-app notifications";
  preferredLanguage: "English" | "Hindi" | "Odia" | "Other";
}

export interface EmergencyContactData {
  contactName: string;
  relationship: string;
  countryCode: string;
  contactNumber: string;
  alternateNumber?: string;
  consentGranted: boolean;
}

export interface MedicationItem {
  name: string;
  dosage?: string;
}

export interface CardiacAssessmentData {
  // Blood Pressure
  bloodPressureSystolic?: number;
  bloodPressureDiastolic?: number;
  bloodPressureUnknown: boolean;

  // Cholesterol
  cholesterolTotal?: number;
  cholesterolLdl?: number;
  cholesterolHdl?: number;
  cholesterolTriglycerides?: number;
  cholesterolUnit: "mg/dL" | "mmol/L";
  cholesterolUnknown: boolean;

  // Conditions & Meds
  medicalConditions: string[];
  currentMedications: MedicationItem[];
  familyHistory: string[];
  allergies: string[];

  // Lifestyle
  smokingStatus: "Never smoked" | "Former smoker" | "Current smoker" | "Prefer not to say";
  physicalActivity: "Sedentary" | "Lightly active" | "Moderately active" | "Very active";
  sleepDurationHours?: number;

  // Symptoms & Wearable
  symptoms: string[];
  symptomsOther?: string;
  emergencyWarningAcknowledged?: boolean;

  wearableData?: {
    connected: boolean;
    heartRate?: number | null;
    ppgStatus?: string | null;
    hrv?: number | null;
    spo2?: number | null;
    temperature?: number | null;
    signalQuality?: number | null;
    capturedAt?: string | null;
  };

  privacyConsentGranted: boolean;
  completedAt?: string;
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: PatientGender;
  email: string;
  username?: string;
  passwordHash?: string;
  phone?: string;
  bloodType?: string;
  condition?: string;
  allergies?: string;
  medications?: string[];
  emergencyContact?: string;
  avatarUrl?: string;
  createdAt: string;

  // Assessment tracking & structured records
  hasCompletedAssessment: boolean;
  profileData?: PatientProfileData;
  contactData?: PatientContactData;
  emergencyData?: EmergencyContactData;
  assessmentData?: CardiacAssessmentData;
}

export interface AuthCredentials {
  identifier: string; // email, username, or patient ID
  password: string;
  rememberMe?: boolean;
}

export interface RegisterPatientPayload {
  name: string;
  email: string;
  username: string;
  password: string;
  patientId?: string; // Optional provider-issued patient ID
}

export interface AuthResult {
  success: boolean;
  error?: string;
  patient?: Patient;
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
