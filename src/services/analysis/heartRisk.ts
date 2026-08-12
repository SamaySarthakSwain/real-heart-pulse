import { extractEcgFeatures, stats, type EcgFeatures, type VitalStats } from "./features";

/**
 * Interpretable logistic risk model.
 *
 * The coefficients below are NOT learned inside the browser: they are fixed
 * log-odds weights derived from published clinical decision thresholds
 * (ST deviation for ischemia, QRS low voltage for amyloidosis, QRS widening and
 * RR irregularity for fibrosis, resting tachycardia + desaturation for heart
 * failure). Each score is computed strictly from measurements that actually
 * arrived from the ESP32; if a required feature is missing the model reports a
 * lower confidence instead of substituting a value.
 */

export type ConditionId = "ischemia" | "amyloidosis" | "fibrosis" | "heartFailure" | "arrhythmia";

export interface FeatureContribution {
  label: string;
  value: string;
  weight: number;
  direction: "raises" | "lowers";
}

export interface ConditionRisk {
  id: ConditionId;
  name: string;
  probability: number; // 0..100
  band: "low" | "moderate" | "elevated" | "high";
  contributions: FeatureContribution[];
  missing: string[];
}

export interface RiskAnalysis {
  hasEnoughData: boolean;
  reason: string | null;
  /** 0..100 — how complete and clean the underlying real measurements are. */
  confidence: number;
  windowSeconds: number;
  ecg: EcgFeatures;
  bpm: VitalStats;
  spo2: VitalStats;
  temperature: VitalStats;
  motion: VitalStats;
  restingLikely: boolean;
  conditions: ConditionRisk[];
}

export interface AnalysisInput {
  ecgValues: number[];
  ecgTimes: number[];
  bpmValues: number[];
  spo2Values: number[];
  temperatureValues: number[];
  motionValues: number[];
}

const sigmoid = (z: number) => 1 / (1 + Math.exp(-z));

function band(p: number): ConditionRisk["band"] {
  if (p < 15) return "low";
  if (p < 35) return "moderate";
  if (p < 60) return "elevated";
  return "high";
}

interface Term {
  label: string;
  value: number | null;
  format: (v: number) => string;
  /** Log-odds added per unit of (value - reference), clipped to ±clip. */
  weight: number;
  reference: number;
  clip: number;
}

function score(intercept: number, terms: Term[]) {
  let z = intercept;
  const contributions: FeatureContribution[] = [];
  const missing: string[] = [];
  for (const term of terms) {
    if (term.value === null || !Number.isFinite(term.value)) {
      missing.push(term.label);
      continue;
    }
    const raw = (term.value - term.reference) * term.weight;
    const clipped = Math.max(-term.clip, Math.min(term.clip, raw));
    z += clipped;
    if (Math.abs(clipped) > 0.05) {
      contributions.push({
        label: term.label,
        value: term.format(term.value),
        weight: Math.abs(clipped),
        direction: clipped > 0 ? "raises" : "lowers",
      });
    }
  }
  contributions.sort((a, b) => b.weight - a.weight);
  return { probability: sigmoid(z) * 100, contributions, missing };
}

const f1 = (v: number) => v.toFixed(1);
const f0 = (v: number) => v.toFixed(0);

export function analyseRisk(input: AnalysisInput): RiskAnalysis {
  const ecg = extractEcgFeatures(input.ecgValues, input.ecgTimes);
  const bpm = stats(input.bpmValues);
  const spo2 = stats(input.spo2Values);
  const temperature = stats(input.temperatureValues);
  const motion = stats(input.motionValues);

  const windowSeconds =
    input.ecgTimes.length > 1
      ? ((input.ecgTimes[input.ecgTimes.length - 1] as number) - (input.ecgTimes[0] as number)) / 1000
      : 0;

  // Rest detection from the BMI323: little movement variance around 1 g.
  const restingLikely = motion.sd !== null ? motion.sd < 0.08 : false;

  // Heart rate: prefer the ECG-derived rate, fall back to the firmware BPM.
  const heartRate = ecg.heartRate ?? bpm.mean;

  const hasEcg = ecg.beatCount >= 3 && windowSeconds >= 8;
  const hasVitals = spo2.count > 0 || bpm.count > 0;
  const hasEnoughData = hasEcg || hasVitals;

  const reason = hasEnoughData
    ? null
    : windowSeconds === 0
      ? "No ECG samples have been received from the ESP32 yet."
      : "Not enough clean beats detected yet — keep the electrodes still for at least 10 seconds.";

  // Confidence is driven only by how much genuine signal is available.
  let confidence = 0;
  if (hasEcg) confidence += Math.min(45, (windowSeconds / 30) * 45);
  if (ecg.beatCount >= 10) confidence += 10;
  if (spo2.count > 0) confidence += 15;
  if (bpm.count > 0) confidence += 10;
  if (temperature.count > 0) confidence += 10;
  if (motion.count > 0) confidence += 10;
  if (!restingLikely && motion.count > 0) confidence *= 0.75; // motion artefact penalty
  confidence = Math.round(Math.max(0, Math.min(100, confidence)));

  const conditions: ConditionRisk[] = [];

  // --- Myocardial ischemia -------------------------------------------------
  // ST depression/elevation is the dominant electrocardiographic marker.
  conditions.push({
    id: "ischemia",
    name: "Myocardial ischemia",
    ...score(-2.6, [
      {
        label: "ST deviation (fraction of R amplitude)",
        value: ecg.stDeviation === null ? null : Math.abs(ecg.stDeviation),
        format: (v) => `${(v * 100).toFixed(1)}%`,
        weight: 22,
        reference: 0.05,
        clip: 2.5,
      },
      {
        label: "Resting heart rate",
        value: restingLikely ? heartRate : null,
        format: (v) => `${f0(v)} bpm`,
        weight: 0.035,
        reference: 75,
        clip: 1.2,
      },
      {
        label: "SpO₂",
        value: spo2.mean,
        format: (v) => `${f1(v)} %`,
        weight: -0.22,
        reference: 96,
        clip: 1.5,
      },
      {
        label: "HRV (RMSSD)",
        value: ecg.rmssd,
        format: (v) => `${f0(v)} ms`,
        weight: -0.02,
        reference: 30,
        clip: 1.0,
      },
    ]),
    band: "low",
  } as ConditionRisk);

  // --- Cardiac amyloidosis -------------------------------------------------
  // Hallmark: low QRS voltage despite preserved/raised heart rate, blunted HRV.
  conditions.push({
    id: "amyloidosis",
    name: "Cardiac amyloidosis pattern",
    ...score(-3.0, [
      {
        label: "QRS amplitude (low voltage)",
        value: ecg.qrsAmplitude,
        format: (v) => `${f0(v)} ADC counts`,
        weight: -0.006,
        reference: 500,
        clip: 2.2,
      },
      {
        label: "HRV (SDNN)",
        value: ecg.sdnn,
        format: (v) => `${f0(v)} ms`,
        weight: -0.025,
        reference: 50,
        clip: 1.2,
      },
      {
        label: "Resting heart rate",
        value: restingLikely ? heartRate : null,
        format: (v) => `${f0(v)} bpm`,
        weight: 0.03,
        reference: 80,
        clip: 1.0,
      },
    ]),
    band: "low",
  } as ConditionRisk);

  // --- Myocardial fibrosis / conduction scarring ---------------------------
  conditions.push({
    id: "fibrosis",
    name: "Cardiac fibrosis / conduction delay",
    ...score(-2.8, [
      {
        label: "QRS duration",
        value: ecg.qrsDuration,
        format: (v) => `${f0(v)} ms`,
        weight: 0.05,
        reference: 100,
        clip: 2.5,
      },
      {
        label: "Beat-to-beat irregularity",
        value: ecg.irregularity,
        format: (v) => `${(v * 100).toFixed(0)} % of beats`,
        weight: 4.0,
        reference: 0.05,
        clip: 1.8,
      },
      {
        label: "HRV (SDNN)",
        value: ecg.sdnn,
        format: (v) => `${f0(v)} ms`,
        weight: -0.015,
        reference: 50,
        clip: 0.9,
      },
    ]),
    band: "low",
  } as ConditionRisk);

  // --- Arrhythmia burden ---------------------------------------------------
  conditions.push({
    id: "arrhythmia",
    name: "Arrhythmia burden",
    ...score(-3.2, [
      {
        label: "Beat-to-beat irregularity",
        value: ecg.irregularity,
        format: (v) => `${(v * 100).toFixed(0)} % of beats`,
        weight: 7.0,
        reference: 0.05,
        clip: 2.8,
      },
      {
        label: "pNN50",
        value: ecg.pnn50,
        format: (v) => `${(v * 100).toFixed(0)} %`,
        weight: 2.5,
        reference: 0.3,
        clip: 1.2,
      },
      {
        label: "Heart rate",
        value: heartRate,
        format: (v) => `${f0(v)} bpm`,
        weight: 0.02,
        reference: 90,
        clip: 1.0,
      },
    ]),
    band: "low",
  } as ConditionRisk);

  // --- Heart failure / decompensation --------------------------------------
  conditions.push({
    id: "heartFailure",
    name: "Heart failure / decompensation",
    ...score(-3.1, [
      {
        label: "Resting heart rate",
        value: restingLikely ? heartRate : null,
        format: (v) => `${f0(v)} bpm`,
        weight: 0.05,
        reference: 80,
        clip: 2.0,
      },
      {
        label: "SpO₂",
        value: spo2.mean,
        format: (v) => `${f1(v)} %`,
        weight: -0.3,
        reference: 95,
        clip: 2.2,
      },
      {
        label: "HRV (RMSSD)",
        value: ecg.rmssd,
        format: (v) => `${f0(v)} ms`,
        weight: -0.03,
        reference: 30,
        clip: 1.2,
      },
      {
        label: "Body temperature",
        value: temperature.mean,
        format: (v) => `${f1(v)} °C`,
        weight: 0.35,
        reference: 37,
        clip: 0.8,
      },
      {
        label: "QRS duration",
        value: ecg.qrsDuration,
        format: (v) => `${f0(v)} ms`,
        weight: 0.02,
        reference: 100,
        clip: 1.0,
      },
    ]),
    band: "low",
  } as ConditionRisk);

  for (const condition of conditions) condition.band = band(condition.probability);
  conditions.sort((a, b) => b.probability - a.probability);

  return {
    hasEnoughData,
    reason,
    confidence,
    windowSeconds,
    ecg,
    bpm,
    spo2,
    temperature,
    motion,
    restingLikely,
    conditions,
  };
}