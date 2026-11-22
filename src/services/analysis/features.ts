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
  /** Mean QT interval estimate, ms. */
  qtIntervalMs: number | null;
  /** Bazett's rate-corrected QT interval (QT / sqrt(RR_sec)), ms. */
  qtcBazettMs: number | null;
  /** Fridericia's rate-corrected QT interval (QT / cbrt(RR_sec)), ms. */
  qtcFridericiaMs: number | null;
  /** Mean PR interval estimate, ms (normal 120-200 ms). */
  prIntervalMs: number | null;
  /** Baevsky Autonomic Stress Index (sympathovagal balance index). */
  stressIndex: number | null;
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
  return ((sorted[mid - 1] as number) + (sorted[mid] as number)) / 2;
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
  qtIntervalMs: null,
  qtcBazettMs: null,
  qtcFridericiaMs: null,
  prIntervalMs: null,
  stressIndex: null,
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
      if (peaks.length === 0 || apex - (peaks[peaks.length - 1] as number) > refractory)
        peaks.push(apex);
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

  // 7. SOTA Electrophysiological Biomarkers: QT, QTc, PR, & Baevsky Stress Index
  const rrSec = rrMean / 1000;
  let meanQtMs: number | null = null;
  let qtcBazett: number | null = null;
  let qtcFridericia: number | null = null;
  let meanPrMs: number | null = null;
  let stressIndex: number | null = null;

  if (peaks.length >= 3 && rrSec > 0.25 && rrSec < 2.5) {
    const qtList: number[] = [];
    const prList: number[] = [];

    for (const p of peaks) {
      // QT: From Q-wave onset (~30ms before R) to T-wave end (~250-450ms after R)
      const qOnset = Math.max(0, p - Math.round(fs * 0.035));
      const tSearchEnd = Math.min(n - 1, p + Math.round(fs * Math.min(0.48, rrSec * 0.55)));
      
      // Find T wave apex between +120ms and +350ms
      let tApex = p + Math.round(fs * 0.18);
      let tMaxVal = -Infinity;
      const tSearchStart = Math.min(n - 1, p + Math.round(fs * 0.10));
      for (let k = tSearchStart; k < tSearchEnd; k++) {
        const val = values[k] as number;
        if (val > tMaxVal) {
          tMaxVal = val;
          tApex = k;
        }
      }

      // T wave end (tangent/inflection return to baseline)
      let tEnd = tApex;
      const baselineVal = values[qOnset] as number;
      for (let k = tApex; k < tSearchEnd; k++) {
        if (Math.abs((values[k] as number) - baselineVal) < 0.15 * Math.abs(tMaxVal - baselineVal)) {
          tEnd = k;
          break;
        }
      }
      const beatQt = ((tEnd - qOnset) / fs) * 1000;
      if (beatQt >= 220 && beatQt <= 600) {
        qtList.push(beatQt);
      }

      // PR interval: P-wave onset (~160ms before R) to Q onset
      const pSearchStart = Math.max(0, p - Math.round(fs * 0.22));
      const pSearchEnd = Math.max(0, p - Math.round(fs * 0.06));
      let pApex = pSearchStart;
      let pMaxVal = -Infinity;
      for (let k = pSearchStart; k < pSearchEnd; k++) {
        const val = values[k] as number;
        if (val > pMaxVal) {
          pMaxVal = val;
          pApex = k;
        }
      }
      const beatPr = ((qOnset - (pApex - Math.round(fs * 0.03))) / fs) * 1000;
      if (beatPr >= 90 && beatPr <= 320) {
        prList.push(beatPr);
      }
    }

    if (qtList.length > 0) {
      meanQtMs = qtList.reduce((a, b) => a + b, 0) / qtList.length;
      qtcBazett = meanQtMs / Math.sqrt(rrSec);
      qtcFridericia = meanQtMs / Math.cbrt(rrSec);
    }

    if (prList.length > 0) {
      meanPrMs = prList.reduce((a, b) => a + b, 0) / prList.length;
    }

    // Baevsky Stress Index: SI = AMo / (2 * Mo * MxDMn)
    if (rr.length >= 5) {
      const minRR = Math.min(...rr) / 1000;
      const maxRR = Math.max(...rr) / 1000;
      const mxDMn = Math.max(0.04, maxRR - minRR); // Variation range in seconds
      
      // Modal bin (50 ms resolution)
      const binWidth = 50;
      const binCounts: Record<number, number> = {};
      for (const val of rr) {
        const b = Math.round(val / binWidth) * binWidth;
        binCounts[b] = (binCounts[b] || 0) + 1;
      }
      let maxCount = 0;
      let modeBin = rrMean;
      for (const [bStr, count] of Object.entries(binCounts)) {
        if (count > maxCount) {
          maxCount = count;
          modeBin = Number(bStr);
        }
      }
      const mo = modeBin / 1000; // Mode in seconds
      const aMo = (maxCount / rr.length) * 100; // Amplitude of mode in %
      stressIndex = aMo / (2 * mo * mxDMn);
    }
  }

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
    qtIntervalMs: meanQtMs,
    qtcBazettMs: qtcBazett,
    qtcFridericiaMs: qtcFridericia,
    prIntervalMs: meanPrMs,
    stressIndex: stressIndex,
  };
}
