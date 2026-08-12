/**
 * Signal feature extraction. Every function works ONLY on samples that really
 * arrived from the ESP32. When there is not enough real signal, the feature is
 * `null` — it is never estimated, interpolated or invented.
 */

export interface EcgFeatures {
  /** Number of ECG samples used. */
  sampleCount: number;
  samplingHz: number | null;
  /** Detected R peaks. */
  beatCount: number;
  heartRate: number | null;
  /** Standard deviation of RR intervals, ms. */
  sdnn: number | null;
  /** Root mean square of successive RR differences, ms. */
  rmssd: number | null;
  /** Share of successive RR differences > 50 ms, 0..1. */
  pnn50: number | null;
  /** Fraction of beats whose RR deviates > 20% from the median, 0..1 (ectopy/irregularity). */
  irregularity: number | null;
  /** Mean R-wave amplitude in ADC counts (low voltage marker). */
  qrsAmplitude: number | null;
  /** Mean QRS duration estimate, ms. */
  qrsDuration: number | null;
  /** Mean ST-segment level relative to the PQ baseline, ADC counts (+ elevation / − depression). */
  stDeviation: number | null;
}

export interface VitalStats {
  mean: number | null;
  min: number | null;
  max: number | null;
  sd: number | null;
  count: number;
}

export function stats(values: number[]): VitalStats {
  const clean = values.filter((v) => Number.isFinite(v));
  if (clean.length === 0) return { mean: null, min: null, max: null, sd: null, count: 0 };
  const mean = clean.reduce((a, b) => a + b, 0) / clean.length;
  const variance = clean.reduce((a, b) => a + (b - mean) ** 2, 0) / clean.length;
  return {
    mean,
    min: Math.min(...clean),
    max: Math.max(...clean),
    sd: Math.sqrt(variance),
    count: clean.length,
  };
}

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 1) return sorted[mid] as number;
  return (((sorted[mid - 1] as number) + (sorted[mid] as number)) / 2);
}

const EMPTY_ECG: EcgFeatures = {
  sampleCount: 0,
  samplingHz: null,
  beatCount: 0,
  heartRate: null,
  sdnn: null,
  rmssd: null,
  pnn50: null,
  irregularity: null,
  qrsAmplitude: null,
  qrsDuration: null,
  stDeviation: null,
};

/**
 * Pan-Tompkins-style R peak detection, simplified for the AD8232 analog stream:
 * derivative -> squaring -> moving-window integration -> adaptive threshold.
 */
export function extractEcgFeatures(values: number[], times: number[]): EcgFeatures {
  const n = values.length;
  if (n < 200 || times.length !== n) return { ...EMPTY_ECG, sampleCount: n };

  const durationMs = (times[n - 1] as number) - (times[0] as number);
  if (!(durationMs > 1000)) return { ...EMPTY_ECG, sampleCount: n };
  const fs = ((n - 1) / durationMs) * 1000;

  // 1. Derivative + squaring
  const squared = new Float64Array(n);
  for (let i = 2; i < n - 2; i++) {
    const d =
      (2 * (values[i + 2] as number) +
        (values[i + 1] as number) -
        (values[i - 1] as number) -
        2 * (values[i - 2] as number)) /
      8;
    squared[i] = d * d;
  }

  // 2. Moving-window integration (~120 ms)
  const win = Math.max(3, Math.round(fs * 0.12));
  const integrated = new Float64Array(n);
  let running = 0;
  for (let i = 0; i < n; i++) {
    running += squared[i] as number;
    if (i >= win) running -= squared[i - win] as number;
    integrated[i] = running / Math.min(i + 1, win);
  }

  // 3. Adaptive threshold
  let sum = 0;
  let peak = 0;
  for (let i = 0; i < n; i++) {
    sum += integrated[i] as number;
    if ((integrated[i] as number) > peak) peak = integrated[i] as number;
  }
  const mean = sum / n;
  const threshold = mean + 0.35 * (peak - mean);
  if (!(threshold > 0)) return { ...EMPTY_ECG, sampleCount: n, samplingHz: fs };

  // 4. Peak picking with a 200 ms refractory period
  const refractory = Math.max(1, Math.round(fs * 0.2));
  const peaks: number[] = [];
  let i = 1;
  while (i < n - 1) {
    if ((integrated[i] as number) > threshold) {
      let best = i;
      let j = i;
      while (j < n && (integrated[j] as number) > threshold) {
        if ((integrated[j] as number) > (integrated[best] as number)) best = j;
        j++;
      }
      // Refine to the true R apex in the raw signal within ±60 ms.
      const span = Math.max(2, Math.round(fs * 0.06));
      let apex = best;
      for (let k = Math.max(0, best - span); k <= Math.min(n - 1, best + span); k++) {
        if ((values[k] as number) > (values[apex] as number)) apex = k;
      }
      if (peaks.length === 0 || apex - (peaks[peaks.length - 1] as number) > refractory) peaks.push(apex);
      i = j + refractory;
    } else {
      i++;
    }
  }

  if (peaks.length < 3) {
    return { ...EMPTY_ECG, sampleCount: n, samplingHz: fs, beatCount: peaks.length };
  }

  // 5. RR intervals and HRV
  const rr: number[] = [];
  for (let k = 1; k < peaks.length; k++) {
    const dt = (times[peaks[k] as number] as number) - (times[peaks[k - 1] as number] as number);
    if (dt > 240 && dt < 3000) rr.push(dt);
  }
  if (rr.length < 2) {
    return { ...EMPTY_ECG, sampleCount: n, samplingHz: fs, beatCount: peaks.length };
  }

  const rrMean = rr.reduce((a, b) => a + b, 0) / rr.length;
  const sdnn = Math.sqrt(rr.reduce((a, b) => a + (b - rrMean) ** 2, 0) / rr.length);
  const diffs = rr.slice(1).map((v, idx) => v - (rr[idx] as number));
  const rmssd = Math.sqrt(diffs.reduce((a, b) => a + b * b, 0) / diffs.length);
  const pnn50 = diffs.filter((d) => Math.abs(d) > 50).length / diffs.length;
  const rrMedian = median(rr);
  const irregularity = rr.filter((v) => Math.abs(v - rrMedian) / rrMedian > 0.2).length / rr.length;

  // 6. Morphology: QRS amplitude, QRS width, ST level vs PQ baseline
  const amplitudes: number[] = [];
  const widths: number[] = [];
  const stLevels: number[] = [];
  const pqOffset = Math.round(fs * 0.06); // 60 ms before R
  const stOffset = Math.round(fs * 0.08); // J+80 ms after R
  for (const p of peaks) {
    const from = Math.max(0, p - Math.round(fs * 0.1));
    const to = Math.min(n - 1, p + Math.round(fs * 0.1));
    let low = values[from] as number;
    for (let k = from; k <= to; k++) if ((values[k] as number) < low) low = values[k] as number;
    const amp = (values[p] as number) - low;
    if (amp > 0) amplitudes.push(amp);

    // QRS width: samples around R above 25% of the peak amplitude.
    const cut = low + 0.25 * amp;
    let left = p;
    while (left > from && (values[left] as number) > cut) left--;
    let right = p;
    while (right < to && (values[right] as number) > cut) right++;
    widths.push(((right - left) / fs) * 1000);

    const baselineIndex = p - pqOffset;
    const stIndex = p + stOffset;
    if (baselineIndex >= 0 && stIndex < n && amp > 0) {
      stLevels.push(((values[stIndex] as number) - (values[baselineIndex] as number)) / amp);
    }
  }

  const ampStats = stats(amplitudes);
  const widthStats = stats(widths);
  const stStats = stats(stLevels);

  return {
    sampleCount: n,
    samplingHz: fs,
    beatCount: peaks.length,
    heartRate: 60000 / rrMean,
    sdnn,
    rmssd,
    pnn50,
    irregularity,
    qrsAmplitude: ampStats.mean,
    qrsDuration: widthStats.mean,
    // Normalised to the R amplitude so it is comparable across gain settings.
    stDeviation: stStats.mean,
  };
}