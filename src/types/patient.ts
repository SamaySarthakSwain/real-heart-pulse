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
  dateOfBirth?: string | undefined; // YYYY-MM-DD
  age?: number | undefined;
  gender: PatientGender;
  bloodGroup: BloodGroup | string;
  heightCm?: number | undefined;
  weightKg?: number | undefined;
  profilePhoto?: string | undefined; // base64 or URL
  updatedAt?: string | undefined;
}

export interface PatientContactData {
  email: string;
  emailVerified: boolean;
  mobileNumber: string;
  countryCode: string;
  alternateNumber?: string | undefined;
  alternateCountryCode?: string | undefined;
  address?: string | undefined;
  city?: string | undefined;
  state?: string | undefined;
  postalCode?: string | undefined;
  country: string;
  preferredCommunication: "Email" | "SMS" | "Phone call" | "In-app notifications";
  preferredLanguage: "English" | "Hindi" | "Odia" | "Other";
}

export interface EmergencyContactData {
  contactName: string;
  relationship: string;
  countryCode: string;
  contactNumber: string;
  alternateNumber?: string | undefined;
  consentGranted: boolean;
}

export interface MedicationItem {
  name: string;
  dosage?: string | undefined;
}

export interface CardiacAssessmentData {
  // Blood Pressure
  bloodPressureSystolic?: number | undefined;
  bloodPressureDiastolic?: number | undefined;
  bloodPressureUnknown: boolean;

  // Cholesterol
  cholesterolTotal?: number | undefined;
  cholesterolLdl?: number | undefined;
  cholesterolHdl?: number | undefined;
  cholesterolTriglycerides?: number | undefined;
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
  sleepDurationHours?: number | undefined;

  // Symptoms & Wearable
  symptoms: string[];
  symptomsOther?: string | undefined;
  emergencyWarningAcknowledged?: boolean | undefined;

  wearableData?: {
    connected: boolean;
    heartRate?: number | null | undefined;
    ppgStatus?: string | null | undefined;
    hrv?: number | null | undefined;
    spo2?: number | null | undefined;
    temperature?: number | null | undefined;
    signalQuality?: number | null | undefined;
    capturedAt?: string | null | undefined;
  } | undefined;

  privacyConsentGranted: boolean;
  completedAt?: string | undefined;
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: PatientGender;
  email: string;
  username?: string | undefined;
  passwordHash?: string | undefined;
  phone?: string | undefined;
  bloodType?: string | undefined;
  condition?: string | undefined;
  allergies?: string | undefined;
  medications?: string[] | undefined;
  emergencyContact?: string | undefined;
  avatarUrl?: string | undefined;
  createdAt: string;

  // Assessment tracking & structured records
  hasCompletedAssessment: boolean;
  profileData?: PatientProfileData | undefined;
  contactData?: PatientContactData | undefined;
  emergencyData?: EmergencyContactData | undefined;
  assessmentData?: CardiacAssessmentData | undefined;
}

export interface AuthCredentials {
  identifier: string; // email, username, or patient ID
  password: string;
  rememberMe?: boolean | undefined;
}

export interface RegisterPatientPayload {
  name: string;
  email: string;
  username: string;
  password: string;
  patientId?: string | undefined; // Optional provider-issued patient ID
}

export interface AuthResult {
  success: boolean;
  error?: string | undefined;
  patient?: Patient | undefined;
}

export interface TestRecord {
  id: string;
  patientId: string;
  timestamp: string; // ISO format
  testType: "ECG Monitoring" | "PPG & Vitals" | "AI Arrhythmia Screening" | "Comprehensive Cardiac Panel";
  bpm: number;
  spo2: number;
  temperature?: number | undefined;
  bloodPressure?: string | undefined;
  ecgStatus?: string | undefined;
  aiRiskLevel?: RiskLevel | undefined;
  aiDiagnosis?: string | undefined;
  notes?: string | undefined;
  device?: string | undefined;
}
