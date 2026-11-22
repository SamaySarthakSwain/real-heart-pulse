export type ClinicalUrgency = "ROUTINE" | "ATTENTION_NEEDED" | "URGENT" | "CRITICAL";

export interface PathologyInsight {
  marker: string;
  finding: string;
  clinicalSignificance: string;
  recommendation: string;
}

export interface DifferentialDiagnosis {
  condition: string;
  likelihood: "Low" | "Moderate" | "High";
  rationale: string;
}

export interface ClinicalSynthesisResult {
  summary: string;
  urgency: ClinicalUrgency;
  urgencyReason: string;
  hemodynamicStatus: {
    rhythm: string;
    perfusion: string;
    autonomicTone: string;
  };
  pathologyInsights: PathologyInsight[];
  differentialDiagnoses: DifferentialDiagnosis[];
  questionsForPhysician: string[];
  emergencyRedFlags: string[];
  timestamp: string;
  modelUsed: string;
}

export interface EcgVisionResult {
  rhythmClassification: string;
  estimatedRateBpm: string | number;
  pWaveMorphology: string;
  prIntervalMs: string;
  qrsDurationMs: string;
  qrsMorphology: string;
  stSegmentAnalysis: string;
  tWaveMorphology: string;
  arrhythmiaDetected: boolean;
  arrhythmiaDetails: string;
  imageQualityScore: string;
  clinicalImpression: string;
  physicianRecommendations: string[];
  modelUsed: string;
}

export interface CopilotChatMessage {
  id: string;
  role: "user" | "model";
  text: string;
  timestamp: number;
}
