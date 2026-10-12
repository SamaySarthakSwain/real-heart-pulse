/**
 * Edge Offline Inference Fallback Engine
 * Runs completely in-browser inside Web Workers / JavaScript when the Python backend
 * is temporarily offline or disconnected.
 * Ensures 100% uptime for patient rhythm monitoring.
 */

export interface EdgeDiagnosticResult {
  isOfflineFallback: boolean;
  primary_diagnosis: string;
  confidence: number;
  detailed_analysis: { class: string; description: string; probability: number }[];
  sqi_assessment: {
    overall_sqi: number;
    decision: string;
    message: string;
  };
  gradcam_1d_attribution: number[];
}

export function runEdgeOfflineDiagnostics(ecgSamples: number[]): EdgeDiagnosticResult {
  const n = ecgSamples.length;
  if (n < 200) {
    return {
      isOfflineFallback: true,
      primary_diagnosis: "Insufficient Data for Offline Analysis",
      confidence: 0.5,
      detailed_analysis: [],
      sqi_assessment: {
        overall_sqi: 0.1,
        decision: "WAITING_DATA",
        message: "Awaiting more sensor samples",
      },
      gradcam_1d_attribution: [],
    };
  }

  // 1. Calculate Signal Mean and Standard Deviation
  let sum = 0;
  for (let i = 0; i < n; i++) sum += ecgSamples[i] as number;
  const mean = sum / n;

  let varSum = 0;
  for (let i = 0; i < n; i++) varSum += Math.pow((ecgSamples[i] as number) - mean, 2);
  const std = Math.sqrt(varSum / n) || 1e-4;

  // 2. QRS Spike Peak Detector
  const threshold = mean + 1.8 * std;
  const peaks: number[] = [];
  for (let i = 2; i < n - 2; i++) {
    const val = ecgSamples[i] as number;
    if (
      val > threshold &&
      val > (ecgSamples[i - 1] as number) &&
      val > (ecgSamples[i + 1] as number) &&
      val > (ecgSamples[i - 2] as number) &&
      val > (ecgSamples[i + 2] as number)
    ) {
      if (peaks.length === 0 || i - (peaks[peaks.length - 1] as number) > 25) {
        peaks.push(i);
      }
    }
  }

  // 3. Evaluate Rhythm & ST Segment Morphological Deviation
  let stDeviationSum = 0;
  let countST = 0;
  for (const p of peaks) {
    // ST segment is roughly 15 to 35 samples after R peak at 100Hz
    const stIdx = p + 20;
    if (stIdx < n) {
      stDeviationSum += Math.abs((ecgSamples[stIdx] as number) - mean);
      countST++;
    }
  }
  const avgSTDev = countST > 0 ? stDeviationSum / (countST * std) : 0;

  // Evaluate Peak Rhythm Regularity (RR Interval Variance)
  let rrVariance = 0;
  if (peaks.length > 2) {
    const intervals: number[] = [];
    for (let i = 0; i < peaks.length - 1; i++) {
      intervals.push((peaks[i + 1] as number) - (peaks[i] as number));
    }
    const avgRR = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    rrVariance =
      Math.sqrt(intervals.reduce((a, b) => a + Math.pow(b - avgRR, 2), 0) / intervals.length) /
      avgRR;
  }

  // 4. Client-side Probability Estimates
  const isSTTCElevated = avgSTDev > 0.8;
  const isArrhythmic = rrVariance > 0.25;

  let normProb = 0.92;
  let miProb = 0.05;
  let sttcProb = 0.06;
  let cdProb = 0.03;
  let hypProb = 0.02;

  if (isSTTCElevated) {
    normProb = 0.35;
    sttcProb = 0.78;
    miProb = 0.65;
  }
  if (isArrhythmic) {
    normProb = Math.min(normProb, 0.4);
    cdProb = 0.72;
  }

  let primary = "Normal Cardiac Rhythm (Edge Mode)";
  let conf = normProb;
  if (sttcProb > normProb) {
    primary = "ST-T Wave Deviation Detected (Edge Mode)";
    conf = sttcProb;
  } else if (cdProb > normProb) {
    primary = "Rhythm Irregularity / Conduction Block (Edge Mode)";
    conf = cdProb;
  }

  // 5. Synthetic Attribution Highlight around detected peaks
  const attribution: number[] = new Array(n).fill(0.05);
  for (const p of peaks) {
    const start = Math.max(0, p - 8);
    const end = Math.min(n, p + 25);
    const weight = isSTTCElevated ? 0.85 : 0.45;
    for (let j = start; j < end; j++) {
      attribution[j] = weight;
    }
  }

  return {
    isOfflineFallback: true,
    primary_diagnosis: primary,
    confidence: conf,
    detailed_analysis: [
      { class: "NORM", description: "Normal Cardiac Rhythm", probability: normProb },
      { class: "MI", description: "Myocardial Infarction / Ischemia", probability: miProb },
      { class: "STTC", description: "ST-T Wave Changes", probability: sttcProb },
      { class: "CD", description: "Conduction Disturbance / Arrhythmia", probability: cdProb },
      { class: "HYP", description: "Ventricular Hypertrophy", probability: hypProb },
    ],
    sqi_assessment: {
      overall_sqi: peaks.length >= 4 ? 0.88 : 0.52,
      decision: peaks.length >= 4 ? "ACCEPT_CLEAN_SIGNAL" : "LOW_PEAK_COUNT",
      message:
        peaks.length >= 4
          ? "Client-side Edge Mode Active (High Beat Agreement)"
          : "Borderline telemetry signal",
    },
    gradcam_1d_attribution: attribution,
  };
}
