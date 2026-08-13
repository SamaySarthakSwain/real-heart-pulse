import { describe, expect, it } from "vitest";
import { extractEcgFeatures } from "./features";
import { analyseRisk } from "./heartRisk";

/** Synthetic ECG used ONLY to test the maths — never used as app data. */
function syntheticEcg(seconds: number, bpm: number, fs = 250) {
  const values: number[] = [];
  const times: number[] = [];
  const period = 60 / bpm;
  const n = Math.round(seconds * fs);
  for (let i = 0; i < n; i++) {
    const t = i / fs;
    const phase = (t % period) / period;
    const r = Math.exp(-(((phase - 0.2) / 0.012) ** 2)) * 800;
    values.push(2048 + r);
    times.push(i * (1000 / fs));
  }
  return { values, times };
}

describe("extractEcgFeatures", () => {
  it("recovers the heart rate from a clean beat train", () => {
    const { values, times } = syntheticEcg(20, 72);
    const f = extractEcgFeatures(values, times);
    expect(f.beatCount).toBeGreaterThan(15);
    expect(f.heartRate).toBeGreaterThan(66);
    expect(f.heartRate).toBeLessThan(78);
  });

  it("returns nulls instead of guesses when there is no signal", () => {
    const f = extractEcgFeatures([], []);
    expect(f.heartRate).toBeNull();
    expect(f.sdnn).toBeNull();
    expect(f.beatCount).toBe(0);
  });
});

describe("analyseRisk", () => {
  it("refuses to score without real data", () => {
    const a = analyseRisk({
      ecgValues: [],
      ecgTimes: [],
      bpmValues: [],
      spo2Values: [],
      temperatureValues: [],
      motionValues: [],
    });
    expect(a.hasEnoughData).toBe(false);
    expect(a.confidence).toBe(0);
  });

  it("raises heart-failure risk when SpO2 is low", () => {
    const { values, times } = syntheticEcg(30, 72);
    const base = {
      ecgValues: values,
      ecgTimes: times,
      bpmValues: [72, 73, 72],
      temperatureValues: [36.8],
      motionValues: [1.0, 1.01, 0.99],
    };
    const healthy = analyseRisk({ ...base, spo2Values: [98, 98, 97] });
    const hypoxic = analyseRisk({ ...base, spo2Values: [88, 87, 89] });
    const pick = (a: typeof healthy) =>
      a.conditions.find((c) => c.id === "heartFailure")!.probability;
    expect(pick(hypoxic)).toBeGreaterThan(pick(healthy));
    expect(healthy.hasEnoughData).toBe(true);
    expect(healthy.confidence).toBeGreaterThan(50);
  });
});