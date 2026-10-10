import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Patient, TestRecord } from "@/types/patient";

interface PatientState {
  currentPatientId: string | null;
  patients: Patient[];
  records: Record<string, TestRecord[]>; // Keyed by patientId

  // Actions
  login: (patientId: string) => boolean;
  loginWithCredentials: (emailOrId: string) => boolean;
  logout: () => void;
  registerPatient: (patientData: Omit<Patient, "id" | "createdAt">) => Patient;
  updatePatientProfile: (patientId: string, updates: Partial<Patient>) => void;
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
    phone: "+1 (555) 234-8910",
    bloodType: "O+",
    condition: "Post-Myocardial Infarction / Hypertension",
    allergies: "Penicillin",
    medications: ["Metoprolol 50mg", "Aspirin 81mg", "Atorvastatin 20mg"],
    emergencyContact: "Linda Chen (Wife) - +1 (555) 234-8911",
    createdAt: "2026-09-15T08:30:00Z",
  },
  {
    id: "PT-20831",
    name: "Dr. Elena Vance",
    age: 44,
    gender: "Female",
    email: "elena.vance@cardioresearch.edu",
    phone: "+1 (555) 871-3342",
    bloodType: "A+",
    condition: "Paroxysmal Atrial Arrhythmia",
    allergies: "None reported",
    medications: ["Diltiazem 120mg"],
    emergencyContact: "David Vance (Spouse) - +1 (555) 871-3340",
    createdAt: "2026-09-20T11:15:00Z",
  },
  {
    id: "PT-31055",
    name: "Aarav Patel",
    age: 29,
    gender: "Male",
    email: "aarav.patel@biotech-pulse.io",
    phone: "+1 (555) 412-9022",
    bloodType: "B+",
    condition: "High-Performance Endurance Baseline",
    allergies: "Sulfa drugs",
    medications: ["Daily Multivitamin", "Omega-3"],
    emergencyContact: "Priya Patel (Sister) - +1 (555) 412-9025",
    createdAt: "2026-10-01T14:00:00Z",
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
