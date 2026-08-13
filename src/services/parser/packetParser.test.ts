import { describe, expect, it } from "vitest";
import { parseLine, DEFAULT_PARSER_OPTIONS } from "./packetParser";
import { validatePacket } from "../validation/sensorValidator";
import { toCSV, toJSON } from "../export/exporters";
import { RingBuffer } from "../../utils/buffers";

const noScale = { ...DEFAULT_PARSER_OPTIONS, plotterScaleBpm: 1, plotterScaleSpo2: 1 };

describe("packet parser", () => {
  it("parses JSON packets", () => {
    const result = parseLine('{"timestamp":123456,"ecg":2048,"ppgIR":52341,"ppgRed":48213,"bpm":76,"spo2":98}', noScale);
    expect(result.format).toBe("json");
    expect(result.packet).toEqual({ timestamp: 123456, ecg: 2048, ppgIR: 52341, ppgRed: 48213, bpm: 76, spo2: 98 });
  });

  it("parses CSV packets", () => {
    const result = parseLine("1234,2048,52341,48213,76,98", noScale);
    expect(result.packet).toEqual({ timestamp: 1234, ecg: 2048, ppgIR: 52341, ppgRed: 48213, bpm: 76, spo2: 98 });
  });

  it("parses the MAX30102 raw-values firmware line", () => {
    const result = parseLine("IR=52341\tRED=48213", noScale);
    expect(result.packet).toEqual({ ppgIR: 52341, ppgRed: 48213 });
  });

  it("parses the SpO2 firmware plotter line and rescales BPM/SpO2", () => {
    const result = parseLine("IR_Signal:120, Threshold:80, Beat:0, BPM:38, SpO2:49");
    expect(result.packet?.bpm).toBe(76);
    expect(result.packet?.spo2).toBe(98);
    expect(result.packet?.beat).toBe(false);
  });

  it("does not invent missing fields", () => {
    const result = parseLine('{"ecg":2048}', noScale);
    expect(result.packet).toEqual({ ecg: 2048 });
    expect(result.packet?.bpm).toBeUndefined();
  });

  it("rejects malformed and status lines", () => {
    expect(parseLine("{oops", noScale).packet).toBeUndefined();
    expect(parseLine("Waiting for finger...", noScale).packet).toBeUndefined();
    expect(parseLine("", noScale).packet).toBeUndefined();
    expect(parseLine("1,2,3", noScale).error).toBeTruthy();
  });

  it("rejects non numeric values", () => {
    expect(parseLine("BPM:abc", noScale).packet).toBeUndefined();
  });
});

describe("validator", () => {
  it("accepts plausible packets", () => {
    expect(validatePacket({ bpm: 76, spo2: 98 }).ok).toBe(true);
  });

  it("drops out-of-range values instead of clamping", () => {
    const result = validatePacket({ bpm: 900, spo2: 97 });
    expect(result.packet?.bpm).toBeUndefined();
    expect(result.packet?.spo2).toBe(97);
    expect(result.errors.length).toBe(1);
  });

  it("rejects packets with no usable measurement", () => {
    expect(validatePacket({ timestamp: 1 }).ok).toBe(false);
    expect(validatePacket({ bpm: Number.NaN }).ok).toBe(false);
    expect(validatePacket(undefined).ok).toBe(false);
  });
});

describe("ring buffer", () => {
  it("stays bounded and keeps the newest samples", () => {
    const buffer = new RingBuffer(3);
    [1, 2, 3, 4].forEach((v, i) => buffer.push(v, i));
    expect(buffer.size).toBe(3);
    expect(buffer.toArray()).toEqual([2, 3, 4]);
    buffer.resize(2);
    expect(buffer.toArray()).toEqual([3, 4]);
    buffer.clear();
    expect(buffer.size).toBe(0);
  });
});

describe("export", () => {
  const rows = [{ t: 1, ecg: 2048, bpm: 76 }, { t: 2, ppgIR: 52341 }];

  it("writes empty cells for missing measurements", () => {
    expect(toCSV(rows).split("\n")).toEqual([
      "timestamp,ecg,ppgIR,ppgRed,bpm,spo2,signalQuality,temperature,accelX,accelY,accelZ,gyroX,gyroY,gyroZ",
      "1,2048,,,76,,,,,,,,,",
      "2,,52341,,,,,,,,,,,",
    ]);
  });

  it("writes null for missing measurements in JSON", () => {
    const parsed = JSON.parse(toJSON(rows));
    expect(parsed.samples[0].spo2).toBeNull();
    expect(parsed.samples[0].ecg).toBe(2048);
  });
});