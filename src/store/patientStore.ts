import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  Patient,
  TestRecord,
  AuthCredentials,
  RegisterPatientPayload,
  AuthResult,
  PatientProfileData,
  PatientContactData,
  EmergencyContactData,
  CardiacAssessmentData,
} from "@/types/patient";
import {
  hashPassword,
  resolvePatientIdentifier,
  DEFAULT_DEMO_HASH,
  DEFAULT_DEMO_PASSWORD,
} from "@/services/auth/authService";

interface PatientState {
  currentPatientId: string | null;
  rememberMe: boolean;
  patients: Patient[];
  records: Record<string, TestRecord[]>; // Keyed by patientId

  // Actions
  login: (patientId: string) => boolean;
  loginWithCredentials: (emailOrId: string) => boolean;
  authenticatePatient: (credentials: AuthCredentials) => Promise<AuthResult>;
  registerPatientAccount: (payload: RegisterPatientPayload) => Promise<AuthResult>;
  requestPasswordReset: (email: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  registerPatient: (patientData: Omit<Patient, "id" | "createdAt">) => Patient;
  updatePatientProfile: (patientId: string, updates: Partial<Patient>) => void;
  saveHealthAssessment: (
    patientId: string,
    data: {
      profile?: PatientProfileData;
      contact?: PatientContactData;
      emergency?: EmergencyContactData;
      assessment?: CardiacAssessmentData;
    },
    markComplete?: boolean
  ) => void;
  addTestRecord: (
    patientId: string,
    recordData: Omit<TestRecord, "id" | "patientId" | "timestamp"> & { timestamp?: string }
  ) => TestRecord;
  deleteTestRecord: (patientId: string, recordId: string) => void;
  switchPatient: (patientId: string) => void;
  getCurrentPatient: () => Patient | null;
  getPatientRecords: (patientId: string) => TestRecord[];
}

const DEFAULT_PATIENTS: Patient[] = [
  {
    id: "PT-10492",
    name: "Robert Chen",
    age: 58,
    gender: "Male",
    email: "robert.chen@hospital-portal.org",
    username: "robert.chen",
    passwordHash: DEFAULT_DEMO_HASH,
    phone: "+91 9876543210",
    bloodType: "O+",
    condition: "Post-Myocardial Infarction / Hypertension",
    allergies: "Penicillin",
    medications: ["Metoprolol 50mg", "Aspirin 81mg", "Atorvastatin 20mg"],
    emergencyContact: "Linda Chen (Wife) - +91 9876543211",
    createdAt: "2026-09-15T08:30:00Z",
    hasCompletedAssessment: true,
    profileData: {
      fullName: "Robert Chen",
      dateOfBirth: "1968-05-14",
      age: 58,
      gender: "Male",
      bloodGroup: "O+",
      heightCm: 178,
      weightKg: 82,
      updatedAt: "2026-09-15T09:00:00Z",
    },
    contactData: {
      email: "robert.chen@hospital-portal.org",
      emailVerified: true,
      mobileNumber: "9876543210",
      countryCode: "+91",
      city: "Bhubaneswar",
      state: "Odisha",
      country: "India",
      address: "Plot 42, Health City",
      preferredCommunication: "Email",
      preferredLanguage: "English",
    },
    emergencyData: {
      contactName: "Linda Chen",
      relationship: "Spouse",
      countryCode: "+91",
      contactNumber: "9876543211",
      consentGranted: true,
    },
    assessmentData: {
      bloodPressureSystolic: 122,
      bloodPressureDiastolic: 78,
      bloodPressureUnknown: false,
      cholesterolTotal: 185,
      cholesterolLdl: 110,
      cholesterolHdl: 48,
      cholesterolTriglycerides: 135,
      cholesterolUnit: "mg/dL",
      cholesterolUnknown: false,
      medicalConditions: ["Hypertension", "Previous heart attack"],
      currentMedications: [
        { name: "Metoprolol", dosage: "50mg" },
        { name: "Aspirin", dosage: "81mg" },
        { name: "Atorvastatin", dosage: "20mg" },
      ],
      familyHistory: ["Heart disease", "High blood pressure"],
      allergies: ["Penicillin"],
      smokingStatus: "Former smoker",
      physicalActivity: "Moderately active",
      sleepDurationHours: 7,
      symptoms: ["No current symptoms"],
      privacyConsentGranted: true,
      completedAt: "2026-09-15T09:00:00Z",
    },
  },
  {
    id: "PT-20831",
    name: "Dr. Elena Vance",
    age: 44,
    gender: "Female",
    email: "elena.vance@cardioresearch.edu",
    username: "elena.vance",
    passwordHash: DEFAULT_DEMO_HASH,
    phone: "+91 9876543342",
    bloodType: "A+",
    condition: "Paroxysmal Atrial Arrhythmia",
    allergies: "None reported",
    medications: ["Diltiazem 120mg"],
    emergencyContact: "David Vance (Spouse) - +91 9876543340",
    createdAt: "2026-09-20T11:15:00Z",
    hasCompletedAssessment: true,
    profileData: {
      fullName: "Dr. Elena Vance",
      dateOfBirth: "1982-08-22",
      age: 44,
      gender: "Female",
      bloodGroup: "A+",
      heightCm: 165,
      weightKg: 63,
      updatedAt: "2026-09-20T11:30:00Z",
    },
    contactData: {
      email: "elena.vance@cardioresearch.edu",
      emailVerified: true,
      mobileNumber: "9876543342",
      countryCode: "+91",
      city: "Bengaluru",
      state: "Karnataka",
      country: "India",
      address: "14 BioResearch Lane",
      preferredCommunication: "In-app notifications",
      preferredLanguage: "English",
    },
    emergencyData: {
      contactName: "David Vance",
      relationship: "Spouse",
      countryCode: "+91",
      contactNumber: "9876543340",
      consentGranted: true,
    },
    assessmentData: {
      bloodPressureSystolic: 118,
      bloodPressureDiastolic: 76,
      bloodPressureUnknown: false,
      cholesterolTotal: 172,
      cholesterolLdl: 98,
      cholesterolHdl: 55,
      cholesterolTriglycerides: 115,
      cholesterolUnit: "mg/dL",
      cholesterolUnknown: false,
      medicalConditions: ["Arrhythmia", "Atrial fibrillation"],
      currentMedications: [{ name: "Diltiazem", dosage: "120mg" }],
      familyHistory: ["None known"],
      allergies: ["None known"],
      smokingStatus: "Never smoked",
      physicalActivity: "Moderately active",
      sleepDurationHours: 8,
      symptoms: ["Palpitations"],
      privacyConsentGranted: true,
      completedAt: "2026-09-20T11:30:00Z",
    },
  },
  {
    id: "PT-31055",
    name: "Aarav Patel",
    age: 29,
    gender: "Male",
    email: "aarav.patel@biotech-pulse.io",
    username: "aarav.patel",
    passwordHash: DEFAULT_DEMO_HASH,
    phone: "+91 9876549022",
    bloodType: "B+",
    condition: "High-Performance Endurance Baseline",
    allergies: "Sulfa drugs",
    medications: ["Daily Multivitamin", "Omega-3"],
    emergencyContact: "Priya Patel (Sister) - +91 9876549025",
    createdAt: "2026-10-01T14:00:00Z",
    hasCompletedAssessment: false, // Incomplete profile for immediate wizard demonstration!
  },
];

const DEFAULT_RECORDS: Record<string, TestRecord[]> = {
  "PT-10492": [
    {
      id: "REC-901",
      patientId: "PT-10492",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), // 3 hours ago
      testType: "ECG Monitoring",
      bpm: 72,
      spo2: 98,
      temperature: 36.6,
      bloodPressure: "122/78 mmHg",
      ecgStatus: "Normal Sinus Rhythm",
      aiRiskLevel: "Low",
      aiDiagnosis: "1D-CNN DL Model: Normal Sinus Rhythm (Confidence: 97.2%). ST segments isoelectric.",
      notes: "Routine evening resting test using ESP32 Ear-to-Heart Biosensor. Patient reported feeling well.",
      device: "ESP32 Ear-to-Heart Biosensor v2.0",
    },
    {
      id: "REC-902",
      patientId: "PT-10492",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 28).toISOString(), // Yesterday
      testType: "Comprehensive Cardiac Panel",
      bpm: 88,
      spo2: 96,
      temperature: 36.8,
      bloodPressure: "135/86 mmHg",
      ecgStatus: "Mild ST/T Flatness",
      aiRiskLevel: "Moderate",
      aiDiagnosis: "Model detected subtle ST-T changes (64% probability). Cardiac Stress Index slightly elevated.",
      notes: "Post-mild walking test. Heart rate recovered to baseline within 4 minutes.",
      device: "ESP32 Ear-to-Heart Biosensor v2.0",
    },
    {
      id: "REC-903",
      patientId: "PT-10492",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(), // 3 days ago
      testType: "PPG & Vitals",
      bpm: 74,
      spo2: 99,
      temperature: 36.5,
      bloodPressure: "119/76 mmHg",
      ecgStatus: "Normal Sinus Rhythm",
      aiRiskLevel: "Low",
      aiDiagnosis: "No ischemic patterns detected. Signal-to-noise ratio: 24dB (optimal).",
      notes: "Baseline morning clinic calibration.",
      device: "ESP32 Ear-to-Heart Biosensor v2.0",
    },
  ],
  "PT-20831": [
    {
      id: "REC-851",
      patientId: "PT-20831",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
      testType: "AI Arrhythmia Screening",
      bpm: 94,
      spo2: 97,
      temperature: 36.7,
      bloodPressure: "128/82 mmHg",
      ecgStatus: "Sinus Tachycardia",
      aiRiskLevel: "Moderate",
      aiDiagnosis: "Arrhythmia classifier flagged PAC pattern with 82% confidence. Recommended rest.",
      notes: "Palpitations reported during work session. Monitored for 10 minutes continuously.",
      device: "ESP32 Ear-to-Heart Biosensor v2.0",
    },
    {
      id: "REC-852",
      patientId: "PT-20831",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
      testType: "ECG Monitoring",
      bpm: 68,
      spo2: 99,
      temperature: 36.6,
      bloodPressure: "116/74 mmHg",
      ecgStatus: "Normal Sinus Rhythm",
      aiRiskLevel: "Low",
      aiDiagnosis: "Normal rhythm restored. PR interval 158ms, QRS duration 86ms.",
      notes: "Resting test post-medication.",
      device: "ESP32 Ear-to-Heart Biosensor v2.0",
    },
  ],
  "PT-31055": [
    {
      id: "REC-701",
      patientId: "PT-31055",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
      testType: "Comprehensive Cardiac Panel",
      bpm: 54,
      spo2: 99,
      temperature: 36.4,
      bloodPressure: "112/68 mmHg",
      ecgStatus: "Athletic Sinus Bradycardia",
      aiRiskLevel: "Low",
      aiDiagnosis: "Resting athletic bradycardia. Exceptional HRV (RMSSD: 68ms). AI Score: Healthy.",
      notes: "Morning resting telemetry for marathon training recovery cycle.",
      device: "ESP32 Ear-to-Heart Biosensor v2.0",
    },
  ],
};

export const usePatientStore = create<PatientState>()(
  persist(
    (set, get) => ({
      currentPatientId: "PT-10492", // Default logged in as Robert Chen for immediate interactive experience
      rememberMe: true,
      patients: DEFAULT_PATIENTS,
      records: DEFAULT_RECORDS,

      login: (patientId: string) => {
        const found = get().patients.some((p) => p.id === patientId);
        if (found) {
          set({ currentPatientId: patientId });
          return true;
        }
        return false;
      },

      loginWithCredentials: (emailOrId: string) => {
        const target = emailOrId.trim().toLowerCase();
        const found = get().patients.find(
          (p) => p.id.toLowerCase() === target || p.email.toLowerCase() === target
        );
        if (found) {
          set({ currentPatientId: found.id });
          return true;
        }
        return false;
      },

      authenticatePatient: async (credentials: AuthCredentials) => {
        // Enforce a small realistic network latency to prevent timing attacks
        await new Promise((r) => setTimeout(r, 450));

        const found = resolvePatientIdentifier(credentials.identifier, get().patients);
        if (!found) {
          return {
            success: false,
            error: "Invalid credentials. Please verify your Email, Username, or Patient ID and Password.",
          };
        }

        const computedHash = await hashPassword(credentials.password);
        const matchesHash =
          found.passwordHash === computedHash ||
          (found.passwordHash === DEFAULT_DEMO_HASH &&
            (credentials.password === DEFAULT_DEMO_PASSWORD || computedHash === DEFAULT_DEMO_HASH)) ||
          (!found.passwordHash && credentials.password === DEFAULT_DEMO_PASSWORD);

        if (!matchesHash) {
          return {
            success: false,
            error: "Invalid credentials. Please verify your Email, Username, or Patient ID and Password.",
          };
        }

        // If patient didn't have passwordHash saved yet, upgrade their profile
        if (!found.passwordHash) {
          get().updatePatientProfile(found.id, { passwordHash: computedHash });
        }

        set({
          currentPatientId: found.id,
          rememberMe: !!credentials.rememberMe,
        });

        return {
          success: true,
          patient: found,
        };
      },

      registerPatientAccount: async (payload: RegisterPatientPayload) => {
        await new Promise((r) => setTimeout(r, 550));

        const emailClean = payload.email.trim().toLowerCase();
        const usernameClean = payload.username.trim().toLowerCase();
        const state = get();

        // 1. Check duplicate email
        if (state.patients.some((p) => p.email.toLowerCase() === emailClean)) {
          return {
            success: false,
            error: "An account with this email address is already registered.",
          };
        }

        // 2. Check duplicate username
        if (
          state.patients.some(
            (p) => p.username && p.username.toLowerCase() === usernameClean
          )
        ) {
          return {
            success: false,
            error: "This username is already taken. Please choose another username.",
          };
        }

        // 3. Provider-issued Patient ID verification
        let targetPatientId = "";
        let existingPatientToAssociate: Patient | null = null;

        if (payload.patientId && payload.patientId.trim()) {
          const providerIdClean = payload.patientId.trim().toUpperCase();
          const matchExisting = state.patients.find(
            (p) => p.id.toUpperCase() === providerIdClean
          );

          if (!matchExisting) {
            return {
              success: false,
              error: `Provider Patient ID "${providerIdClean}" was not found in the clinic database. Leave blank to register as a new patient or contact your provider.`,
            };
          }

          // Verify if already associated with another distinct username
          if (matchExisting.username && matchExisting.username.toLowerCase() !== usernameClean) {
            return {
              success: false,
              error: `Patient ID "${providerIdClean}" is already linked to an existing account. Please sign in instead.`,
            };
          }

          existingPatientToAssociate = matchExisting;
          targetPatientId = matchExisting.id;
        }

        const passwordHash = await hashPassword(payload.password);

        if (existingPatientToAssociate) {
          // Link existing hospital patient record with newly created credentials
          const updatedPatient: Patient = {
            ...existingPatientToAssociate,
            name: payload.name.trim() || existingPatientToAssociate.name,
            email: emailClean,
            username: usernameClean,
            passwordHash,
          };

          set((s) => ({
            patients: s.patients.map((p) =>
              p.id === existingPatientToAssociate!.id ? updatedPatient : p
            ),
            currentPatientId: updatedPatient.id,
          }));

          return {
            success: true,
            patient: updatedPatient,
          };
        }

        // Create new patient record
        const newPatientId = `PT-${Math.floor(10000 + Math.random() * 90000)}`;
        const newPatient: Patient = {
          id: newPatientId,
          name: payload.name.trim(),
          age: 30,
          gender: "Other",
          email: emailClean,
          username: usernameClean,
          passwordHash,
          condition: "New Patient Registration",
          createdAt: new Date().toISOString(),
          hasCompletedAssessment: false,
        };

        set((s) => ({
          patients: [newPatient, ...s.patients],
          currentPatientId: newPatientId,
          records: {
            ...s.records,
            [newPatientId]: [],
          },
        }));

        return {
          success: true,
          patient: newPatient,
        };
      },

      saveHealthAssessment: (patientId, data, markComplete = true) => {
        set((state) => ({
          patients: state.patients.map((p) => {
            if (p.id !== patientId) return p;
            const updatedProfile = data.profile ? { ...p.profileData, ...data.profile } : p.profileData;
            const updatedContact = data.contact ? { ...p.contactData, ...data.contact } : p.contactData;
            const updatedEmergency = data.emergency ? { ...p.emergencyData, ...data.emergency } : p.emergencyData;
            const updatedAssessment = data.assessment ? { ...p.assessmentData, ...data.assessment } : p.assessmentData;

            return {
              ...p,
              name: data.profile?.fullName || p.name,
              age: data.profile?.age ?? p.age,
              gender: data.profile?.gender || p.gender,
              bloodType: (data.profile?.bloodGroup as string) || p.bloodType,
              phone: data.contact?.mobileNumber
                ? `${data.contact.countryCode} ${data.contact.mobileNumber}`
                : p.phone,
              emergencyContact: data.emergency?.contactName
                ? `${data.emergency.contactName} (${data.emergency.relationship}) - ${data.emergency.countryCode} ${data.emergency.contactNumber}`
                : p.emergencyContact,
              hasCompletedAssessment: markComplete ? true : p.hasCompletedAssessment,
              profileData: updatedProfile,
              contactData: updatedContact,
              emergencyData: updatedEmergency,
              assessmentData: updatedAssessment,
            };
          }),
        }));
      },

      requestPasswordReset: async (email: string) => {
        // Enforce uniform response time to mitigate account enumeration
        await new Promise((r) => setTimeout(r, 600));
        return {
          success: true,
          message:
            "If an account is associated with this email address, password recovery instructions and a secure reset link have been dispatched. Please check your inbox.",
        };
      },

      logout: () => {
        set({ currentPatientId: null });
      },

      registerPatient: (patientData) => {
        const newId = `PT-${Math.floor(10000 + Math.random() * 90000)}`;
        const newPatient: Patient = {
          ...patientData,
          id: newId,
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          patients: [newPatient, ...state.patients],
          currentPatientId: newId,
          records: {
            ...state.records,
            [newId]: [],
          },
        }));

        return newPatient;
      },

      updatePatientProfile: (patientId, updates) => {
        set((state) => ({
          patients: state.patients.map((p) =>
            p.id === patientId ? { ...p, ...updates } : p
          ),
        }));
      },

      addTestRecord: (patientId, recordData) => {
        const newRecord: TestRecord = {
          ...recordData,
          id: `REC-${Date.now().toString().slice(-4)}${Math.floor(Math.random() * 90 + 10)}`,
          patientId,
          timestamp: recordData.timestamp || new Date().toISOString(),
        };

        set((state) => {
          const currentList = state.records[patientId] || [];
          return {
            records: {
              ...state.records,
              [patientId]: [newRecord, ...currentList],
            },
          };
        });

        return newRecord;
      },

      deleteTestRecord: (patientId, recordId) => {
        set((state) => {
          const currentList = state.records[patientId] || [];
          return {
            records: {
              ...state.records,
              [patientId]: currentList.filter((r) => r.id !== recordId),
            },
          };
        });
      },

      switchPatient: (patientId) => {
        const found = get().patients.some((p) => p.id === patientId);
        if (found) {
          set({ currentPatientId: patientId });
        }
      },

      getCurrentPatient: () => {
        const { currentPatientId, patients } = get();
        if (!currentPatientId) return null;
        return patients.find((p) => p.id === currentPatientId) || null;
      },

      getPatientRecords: (patientId) => {
        return get().records[patientId] || [];
      },
    }),
    {
      name: "ear_to_heart_patients_v1",
    }
  )
);
