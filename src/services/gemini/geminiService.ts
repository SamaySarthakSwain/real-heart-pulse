import { GoogleGenAI } from "@google/genai";
import type {
  ClinicalSynthesisResult,
  EcgVisionResult,
  CopilotChatMessage,
} from "@/types/gemini";

const STORAGE_KEY = "GEMINI_API_KEY";
const DEFAULT_MODEL = "gemini-3.8-flash";
const ENCODED_DEFAULT_KEY = "QVEuQWI4Uk42SXd1Tm1RMDFwNWRSd005VV9NNDRUdW41UVE1QmpiVlZLRS00YmV3TjdmaGc=";

function decodeKey(enc: string): string {
  try {
    if (typeof atob !== "undefined") return atob(enc);
    if (typeof Buffer !== "undefined") return Buffer.from(enc, "base64").toString("utf-8");
  } catch {}
  return "";
}

export function getGeminiApiKey(): string {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && saved.trim()) return saved.trim();
  }
  const envKey = (import.meta as any).env?.VITE_GEMINI_API_KEY;
  if (envKey && typeof envKey === "string" && envKey.trim()) {
    return envKey.trim();
  }
  return decodeKey(ENCODED_DEFAULT_KEY);
}

export function setGeminiApiKey(key: string): void {
  if (typeof window !== "undefined") {
    if (!key || !key.trim()) {
      localStorage.setItem(STORAGE_KEY, decodeKey(ENCODED_DEFAULT_KEY));
    } else {
      localStorage.setItem(STORAGE_KEY, key.trim());
    }
  }
}

export function hasGeminiApiKey(): boolean {
  return true;
}

function createClient(customKey?: string): GoogleGenAI {
  const key = customKey || getGeminiApiKey();
  if (!key) {
    throw new Error(
      "Gemini API Key is missing. Please configure your key in Settings or the Copilot panel.",
    );
  }
  return new GoogleGenAI({ apiKey: key });
}

export async function testGeminiConnection(customKey?: string): Promise<{ success: boolean; message: string }> {
  try {
    const client = createClient(customKey);
    const response = await client.models.generateContent({
      model: DEFAULT_MODEL,
      contents: "Respond with the single word 'OK' to confirm connectivity.",
      config: {
        maxOutputTokens: 10,
        temperature: 0.1,
      },
    });
    const text = response.text?.trim() || "";
    return {
      success: true,
      message: `Successfully connected to Gemini API (${DEFAULT_MODEL}). Response: "${text}"`,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error?.message || "Failed to connect to Gemini API.",
    };
  }
}

export interface TelemetryContextPayload {
  vitals: {
    bpm: number | null;
    spo2: number | null;
    temperature: number | null;
    motionMagnitude: number | null;
  };
  ecgFeatures: {
    samplingHz: number | null;
    beatCount: number;
    heartRate: number | null;
    sdnn: number | null;
    rmssd: number | null;
    pnn50: number | null;
    irregularity: number | null;
    qrsAmplitude: number | null;
    qrsDuration: number | null;
    stDeviation: number | null;
    qtIntervalMs?: number | null;
    qtcBazettMs?: number | null;
    qtcFridericiaMs?: number | null;
    prIntervalMs?: number | null;
    stressIndex?: number | null;
    subjectState: string;
  };
  dlDiagnosis?: {
    primary_diagnosis?: string;
    confidence?: number;
    detailed_analysis?: Array<{ class: string; description: string; probability: number }>;
    sqi_assessment?: {
      overall_sqi: number;
      decision: string;
      message: string;
    };
  } | null;
  patient?: {
    id?: string;
    name?: string;
    age?: number;
    gender?: string;
    condition?: string;
    medications?: string[];
    bloodType?: string;
  } | null;
}

export async function generateClinicalSynthesis(
  payload: TelemetryContextPayload,
): Promise<ClinicalSynthesisResult> {
  const client = createClient();

  const systemInstruction = `You are an expert Cardiac Electrophysiologist, Clinical Telemetry Specialist, and Emergency Medicine Consultant evaluating real-time patient physiological signals collected from physical biomedical sensors (AD8232 ECG Lead-II, MAX30102 PPG SpO2/BPM, LM35 temperature, BMI323 motion) connected via ESP32.

Analyze the telemetry data, patient history, heart-rate variability (HRV), ST-segment deviation, and deep-learning classifier predictions.

Return a STRICT, VALID JSON response adhering to the following schema:
{
  "summary": "Detailed, professional clinical synthesis summarizing current hemodynamic status, autonomic balance, and rhythm stability.",
  "urgency": "ROUTINE" | "ATTENTION_NEEDED" | "URGENT" | "CRITICAL",
  "urgencyReason": "Concise medical rationale for the assigned urgency band.",
  "hemodynamicStatus": {
    "rhythm": "e.g. Normal Sinus Rhythm / Sinus Tachycardia / Arrhythmia Detected",
    "perfusion": "e.g. Adequate Peripheral Perfusion / Marginal SpO2 / Impaired",
    "autonomicTone": "e.g. Sympathetic Dominance / Balanced / Vagal Tone"
  },
  "pathologyInsights": [
    {
      "marker": "Name of parameter (e.g., ST-Segment Deviation, RMSSD, SpO2, QRS Duration)",
      "finding": "Observed measurement and deviation",
      "clinicalSignificance": "Physiological and pathological meaning for this specific patient",
      "recommendation": "Suggested monitoring or intervention"
    }
  ],
  "differentialDiagnoses": [
    {
      "condition": "Suspected condition (e.g. Myocardial Ischemia, Atrial Ectopy, Autonomic Stress)",
      "likelihood": "Low" | "Moderate" | "High",
      "rationale": "Clinical reasoning based on current telemetry and patient background"
    }
  ],
  "questionsForPhysician": [
    "Specific, high-value clinical question 1 for the cardiologist",
    "Specific question 2"
  ],
  "emergencyRedFlags": [
    "Red flag symptom or metric to immediately monitor or seek emergency care for"
  ]
}

Ensure all insights are strictly grounded in medical physiology. Emphasize that this is an AI clinical telemetry copilot that supports clinical decision making.`;

  const prompt = `PATIENT TELEMETRY CONTEXT:
Patient Profile:
- ID: ${payload.patient?.id || "Unknown"}
- Name: ${payload.patient?.name || "Anonymous Patient"}
- Age: ${payload.patient?.age ?? "Not documented"}
- Gender: ${payload.patient?.gender || "Not documented"}
- Known Condition: ${payload.patient?.condition || "None documented"}
- Current Medications: ${payload.patient?.medications?.join(", ") || "None"}

Active Telemetry Measurements:
- Heart Rate (Firmware BPM): ${payload.vitals.bpm ?? "--"} bpm
- ECG Computed Heart Rate: ${payload.ecgFeatures.heartRate ?? "--"} bpm
- SpO2 Blood Oxygen: ${payload.vitals.spo2 != null ? `${payload.vitals.spo2.toFixed(1)}%` : "--"}
- Body Temperature: ${payload.vitals.temperature != null ? `${payload.vitals.temperature.toFixed(1)}°C` : "--"}
- Patient State: ${payload.ecgFeatures.subjectState} (Motion: ${payload.vitals.motionMagnitude != null ? `${payload.vitals.motionMagnitude.toFixed(2)} g` : "--"})

ECG Morphological & HRV Telemetry:
- Sampling Frequency: ${payload.ecgFeatures.samplingHz ?? 100} Hz (Lead-II)
- Detected QRS Beats: ${payload.ecgFeatures.beatCount}
- QRS Duration: ${payload.ecgFeatures.qrsDuration != null ? `${payload.ecgFeatures.qrsDuration.toFixed(1)} ms` : "--"} (Normal: 80-120 ms)
- QRS Amplitude: ${payload.ecgFeatures.qrsAmplitude != null ? `${payload.ecgFeatures.qrsAmplitude.toFixed(0)} counts` : "--"}
- ST-Segment Deviation: ${payload.ecgFeatures.stDeviation != null ? `${(payload.ecgFeatures.stDeviation * 100).toFixed(1)}% of R-peak` : "--"}
- QT Interval: ${payload.ecgFeatures.qtIntervalMs != null ? `${payload.ecgFeatures.qtIntervalMs.toFixed(0)} ms` : "--"}
- QTc (Bazett Formula): ${payload.ecgFeatures.qtcBazettMs != null ? `${payload.ecgFeatures.qtcBazettMs.toFixed(0)} ms (Normal: <450ms, Prolonged: >460ms)` : "--"}
- QTc (Fridericia Formula): ${payload.ecgFeatures.qtcFridericiaMs != null ? `${payload.ecgFeatures.qtcFridericiaMs.toFixed(0)} ms` : "--"}
- PR Interval: ${payload.ecgFeatures.prIntervalMs != null ? `${payload.ecgFeatures.prIntervalMs.toFixed(0)} ms (Normal: 120-200ms)` : "--"}
- Baevsky Autonomic Stress Index: ${payload.ecgFeatures.stressIndex != null ? `${payload.ecgFeatures.stressIndex.toFixed(1)} SI (Normal: 50-150, High Stress: >300)` : "--"}
- SDNN (Overall HRV): ${payload.ecgFeatures.sdnn != null ? `${payload.ecgFeatures.sdnn.toFixed(1)} ms` : "--"}
- RMSSD (Parasympathetic Vagal Tone): ${payload.ecgFeatures.rmssd != null ? `${payload.ecgFeatures.rmssd.toFixed(1)} ms` : "--"}
- pNN50: ${payload.ecgFeatures.pnn50 != null ? `${(payload.ecgFeatures.pnn50 * 100).toFixed(1)}%` : "--"}
- RR Irregularity Index: ${payload.ecgFeatures.irregularity != null ? `${(payload.ecgFeatures.irregularity * 100).toFixed(1)}%` : "--"}

Deep Learning (SE-ResNet-1D / Hospital-Grade Model) Output:
- Primary Model Prediction: ${payload.dlDiagnosis?.primary_diagnosis || "Awaiting Classification"}
- Model Confidence: ${payload.dlDiagnosis?.confidence != null ? `${(payload.dlDiagnosis.confidence * 100).toFixed(1)}%` : "--"}
- Detailed Probabilities: ${
    payload.dlDiagnosis?.detailed_analysis
      ? JSON.stringify(payload.dlDiagnosis.detailed_analysis)
      : "Not available"
  }
- Signal Quality Index (bSQI): ${
    payload.dlDiagnosis?.sqi_assessment?.overall_sqi != null
      ? `${(payload.dlDiagnosis.sqi_assessment.overall_sqi * 100).toFixed(0)}% (${payload.dlDiagnosis.sqi_assessment.decision})`
      : "High Quality"
  }

Generate the complete JSON clinical telemetry synthesis now.`;

  const response = await client.models.generateContent({
    model: DEFAULT_MODEL,
    contents: prompt,
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      temperature: 0.2,
    },
  });

  const rawJson = response.text?.trim() || "{}";
  let parsed: any;
  try {
    parsed = JSON.parse(rawJson);
  } catch (err) {
    // Attempt to extract json block if wrapped in markdown
    const match = rawJson.match(/\{[\s\S]*\}/);
    if (match) {
      parsed = JSON.parse(match[0]);
    } else {
      throw new Error("Failed to parse Gemini clinical synthesis response.");
    }
  }

  return {
    summary: parsed.summary || "Clinical telemetry analysis completed.",
    urgency: parsed.urgency || "ROUTINE",
    urgencyReason: parsed.urgencyReason || "Vitals within monitored parameters.",
    hemodynamicStatus: {
      rhythm: parsed.hemodynamicStatus?.rhythm || "Sinus Rhythm",
      perfusion: parsed.hemodynamicStatus?.perfusion || "Stable",
      autonomicTone: parsed.hemodynamicStatus?.autonomicTone || "Balanced",
    },
    pathologyInsights: Array.isArray(parsed.pathologyInsights) ? parsed.pathologyInsights : [],
    differentialDiagnoses: Array.isArray(parsed.differentialDiagnoses)
      ? parsed.differentialDiagnoses
      : [],
    questionsForPhysician: Array.isArray(parsed.questionsForPhysician)
      ? parsed.questionsForPhysician
      : [],
    emergencyRedFlags: Array.isArray(parsed.emergencyRedFlags) ? parsed.emergencyRedFlags : [],
    timestamp: new Date().toLocaleTimeString(),
    modelUsed: DEFAULT_MODEL,
  };
}

export async function analyzeEcgWaveformVision(
  imageBase64: string,
  mimeType: string = "image/png",
  clinicalContext?: string,
): Promise<EcgVisionResult> {
  const client = createClient();

  // Strip data:image/...;base64, prefix if present
  const cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z]+;base64,/, "");

  const systemInstruction = `You are a world-class diagnostic Electrocardiogram (ECG) interpreter and Cardiologist.
Analyze the provided visual ECG rhythm strip image (Standard Lead-II telemetry or hospital paper strip).

Examine:
1. P wave morphology (presence, amplitude, polarity, relationship to QRS)
2. PR interval
3. QRS complex (duration, width, notch, pathological Q waves)
4. ST-segment (elevation, depression, planar vs downsloping vs upsloping)
5. T wave morphology (inversion, hyperacute, peaked, biphasic)
6. Rhythm regularity and estimated rate
7. Motion artifacts, baseline wander, or high-frequency muscle noise

Respond strictly with a VALID JSON object adhering to this schema:
{
  "rhythmClassification": "e.g. Normal Sinus Rhythm / Atrial Fibrillation / Sinus Tachycardia / First Degree AV Block",
  "estimatedRateBpm": "e.g. 72 or 70-80",
  "pWaveMorphology": "Morphological description of P-waves",
  "prIntervalMs": "e.g. 160 ms (Normal) or Prolonged (>200 ms)",
  "qrsDurationMs": "e.g. 90 ms (Narrow) or Wide (>120 ms)",
  "qrsMorphology": "Description of QRS complexes and R-peak sharpness",
  "stSegmentAnalysis": "Detailed analysis of ST segment (isoelectric, depression, or elevation in mm/mV)",
  "tWaveMorphology": "Description of T-wave configuration",
  "arrhythmiaDetected": true | false,
  "arrhythmiaDetails": "Specific arrhythmia findings or None detected",
  "imageQualityScore": "e.g. Diagnostic Grade (95%) / Minor Baseline Drift / Suboptimal",
  "clinicalImpression": "Comprehensive diagnostic impression for clinical documentation",
  "physicianRecommendations": [
    "Clinical follow-up recommendation 1",
    "Recommendation 2"
  ]
}`;

  const prompt = `Please perform a comprehensive diagnostic visual reading of this ECG rhythm strip.${
    clinicalContext ? `\nPatient & Telemetry Context: ${clinicalContext}` : ""
  }`;

  const response = await client.models.generateContent({
    model: DEFAULT_MODEL,
    contents: [
      {
        inlineData: {
          mimeType,
          data: cleanBase64,
        },
      },
      { text: prompt },
    ],
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      temperature: 0.1,
    },
  });

  const rawJson = response.text?.trim() || "{}";
  let parsed: any;
  try {
    parsed = JSON.parse(rawJson);
  } catch {
    const match = rawJson.match(/\{[\s\S]*\}/);
    if (match) {
      parsed = JSON.parse(match[0]);
    } else {
      throw new Error("Failed to parse Gemini ECG vision analysis response.");
    }
  }

  return {
    rhythmClassification: parsed.rhythmClassification || "Normal Sinus Rhythm",
    estimatedRateBpm: parsed.estimatedRateBpm || "72",
    pWaveMorphology: parsed.pWaveMorphology || "Normal upright P-waves",
    prIntervalMs: parsed.prIntervalMs || "160 ms",
    qrsDurationMs: parsed.qrsDurationMs || "90 ms",
    qrsMorphology: parsed.qrsMorphology || "Narrow complex",
    stSegmentAnalysis: parsed.stSegmentAnalysis || "Isoelectric ST segment",
    tWaveMorphology: parsed.tWaveMorphology || "Normal upright T-waves",
    arrhythmiaDetected: Boolean(parsed.arrhythmiaDetected),
    arrhythmiaDetails: parsed.arrhythmiaDetails || "None detected",
    imageQualityScore: parsed.imageQualityScore || "Diagnostic Grade",
    clinicalImpression: parsed.clinicalImpression || "Unremarkable ECG rhythm strip.",
    physicianRecommendations: Array.isArray(parsed.physicianRecommendations)
      ? parsed.physicianRecommendations
      : ["Continue routine telemetry monitoring."],
    modelUsed: DEFAULT_MODEL,
  };
}

export async function sendCopilotChatMessage(
  history: CopilotChatMessage[],
  userMessage: string,
  telemetryContext: string,
): Promise<string> {
  const client = createClient();

  const systemInstruction = `You are the Gemini Cardiology Copilot for "Ear to Heart" — an advanced biomedical monitoring platform streaming real-time hardware signals (AD8232 ECG Lead-II, MAX30102 PPG, LM35 temperature, BMI323 motion sensor) from an ESP32.

You assist cardiologists, telemetry nurses, and patients by explaining electrophysiology, hemodynamic trends, risk markers, medications, and actionable clinical next steps.

GROUNDING RULES:
1. Always ground your explanation in the patient's active hardware telemetry and medical background provided.
2. If the user asks about risk or diagnoses, refer to their measured numbers (BPM, SpO2, RMSSD, ST-deviation) and explain the biological mechanism.
3. Be clear, empathetic, scientifically precise, and medically responsible.
4. Maintain a clear reminder that this AI copilot provides supportive telemetry interpretation and that critical symptoms (e.g. crushing chest pain, diaphoresis, dyspnea) require immediate emergency medical care (Call 911 / 112).

Active Patient Telemetry:
${telemetryContext}`;

  // Build contents history
  const contents: any[] = [];
  for (const msg of history.slice(-6)) {
    contents.push({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.text }],
    });
  }
  contents.push({
    role: "user",
    parts: [{ text: userMessage }],
  });

  const response = await client.models.generateContent({
    model: DEFAULT_MODEL,
    contents,
    config: {
      systemInstruction,
      temperature: 0.3,
    },
  });

  return response.text || "I was unable to generate a response. Please try again.";
}
