import type { ParseResult, PacketFormat, SensorPacket } from "@/types/sensor";

export interface ParserOptions {
  /**
   * The AikyaNova SpO2 firmware prints `BPM:` and `SpO2:` divided by 2 so both
   * fit the Arduino Serial Plotter scale. Multiply back by this factor.
   * Set to 1 if your firmware prints true values.
   */
  plotterScaleBpm: number;
  plotterScaleSpo2: number;
  /** Column names for headerless numeric CSV lines. */
  csvColumns: string[];
}

export const DEFAULT_PARSER_OPTIONS: ParserOptions = {
  plotterScaleBpm: 1,
  plotterScaleSpo2: 1,
  csvColumns: ["timestamp", "ecg", "ppgIR", "ppgRed", "bpm", "spo2"],
};

/** Firmware label / JSON key -> normalized SensorPacket field. */
const FIELD_ALIASES: Record<string, keyof SensorPacket> = {
  timestamp: "timestamp",
  time: "timestamp",
  ts: "timestamp",
  millis: "timestamp",
  ecg: "ecg",
  ecg_signal: "ecg",
  ad8232: "ecg",
  ir: "ppgIR",
  ir_signal: "ppgIR",
  irvalue: "ppgIR",
  ppgir: "ppgIR",
  red: "ppgRed",
  red_signal: "ppgRed",
  redvalue: "ppgRed",
  ppgred: "ppgRed",
  signal: "ppgWave",
  wave: "ppgWave",
  ppg: "ppgWave",
  bpm: "bpm",
  heartrate: "bpm",
  hr: "bpm",
  spo2: "spo2",
  sp02: "spo2",
  oxygen: "spo2",
  threshold: "threshold",
  thresh: "threshold",
  beat: "beat",
  beatmarker: "beat",
  quality: "signalQuality",
  signalquality: "signalQuality",
  leadoff: "ecgLeadOff",
  lo: "ecgLeadOff",
  temp: "temperature",
  temperature: "temperature",
  tempc: "temperature",
  lm35: "temperature",
  bodytemp: "temperature",
  bmi_temp: "temperature",
  ax: "accelX",
  accelx: "accelX",
  accx: "accelX",
  ay: "accelY",
  accely: "accelY",
  accy: "accelY",
  az: "accelZ",
  accelz: "accelZ",
  accz: "accelZ",
  bmi_ax: "accelX",
  bmi_ay: "accelY",
  bmi_az: "accelZ",
  gx: "gyroX",
  gyrox: "gyroX",
  gy: "gyroY",
  gyroy: "gyroY",
  gz: "gyroZ",
  gyroz: "gyroZ",
  bmi_gx: "gyroX",
  bmi_gy: "gyroY",
  bmi_gz: "gyroZ",
};

const normalizeKey = (key: string) =>
  key.trim().toLowerCase().replace(/[\s\-]+/g, "_").replace(/_+$/g, "");

function toNumber(value: unknown): number | undefined {
  if (typeof value === "number") return Number.isFinite(value) ? value : undefined;
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  if (trimmed === "") return undefined;
  const n = Number(trimmed);
  return Number.isFinite(n) ? n : undefined;
}

function assign(
  packet: SensorPacket,
  rawKey: string,
  rawValue: unknown,
  options: ParserOptions,
): boolean {
  const field = FIELD_ALIASES[normalizeKey(rawKey)];
  if (!field) return false;
  if (field === "beat") {
    const n = toNumber(rawValue);
    if (n === undefined) return false;
    packet.beat = n > 0;
    return true;
  }
  if (field === "ecgLeadOff") {
    const n = toNumber(rawValue);
    if (n === undefined) return false;
    packet.ecgLeadOff = n > 0;
    return true;
  }
  const n = toNumber(rawValue);
  if (n === undefined) return false;
  if (field === "bpm") packet.bpm = n * options.plotterScaleBpm;
  else if (field === "spo2") packet.spo2 = n * options.plotterScaleSpo2;
  else (packet as Record<string, number>)[field] = n;
  return true;
}

function hasData(packet: SensorPacket): boolean {
  return Object.keys(packet).length > 0;
}

function fail(raw: string, format: PacketFormat, error: string): ParseResult {
  return { raw, format, error };
}

/**
 * Parse a single complete line coming from the ESP32.
 * Returns a normalized packet, or an error for status text / malformed lines.
 * Never fabricates a field that was not present in the line.
 */
export function parseLine(
  line: string,
  options: ParserOptions = DEFAULT_PARSER_OPTIONS,
): ParseResult {
  const raw = line.replace(/\r/g, "").trim();
  if (raw === "") return fail(line, "unknown", "Empty line");

  // 1. JSON
  if (raw.startsWith("{")) {
    try {
      const obj = JSON.parse(raw) as Record<string, unknown>;
      const packet: SensorPacket = {};
      for (const [key, value] of Object.entries(obj)) assign(packet, key, value, options);
      if (!hasData(packet)) return fail(raw, "json", "No recognized sensor fields");
      return { raw, format: "json", packet };
    } catch {
      return fail(raw, "json", "Malformed JSON");
    }
  }

  // 2. Labeled pairs: "IR_Signal:123, Threshold:4, BPM:38, SpO2:49"
  //    or key=value pairs: "IR=52341\tRED=48213"
  if (/[:=]/.test(raw)) {
    const tokens = raw.split(/[,;\t]+/);
    const packet: SensorPacket = {};
    let recognized = 0;
    let pairs = 0;
    for (const token of tokens) {
      const match = token.match(/^\s*([A-Za-z_0-9 \-]+)\s*[:=]\s*(-?[0-9.eE+]+)\s*$/);
      if (!match) continue;
      pairs += 1;
      if (assign(packet, match[1] ?? "", match[2] ?? "", options)) recognized += 1;
    }
    if (pairs === 0) return fail(raw, "unknown", "Status text, not a data packet");
    if (recognized === 0) return fail(raw, "labeled", "No recognized sensor fields");
    return { raw, format: raw.includes(":") ? "labeled" : "keyvalue", packet };
  }

  // 3. Numeric CSV
  const parts = raw.split(",").map((p) => p.trim());
  if (parts.length > 1 && parts.every((p) => p !== "" && Number.isFinite(Number(p)))) {
    if (parts.length !== options.csvColumns.length) {
      return fail(
        raw,
        "csv",
        `CSV column count ${parts.length} does not match configured layout (${options.csvColumns.join(",")})`,
      );
    }
    const packet: SensorPacket = {};
    parts.forEach((value, index) => assign(packet, options.csvColumns[index] ?? "", value, options));
    if (!hasData(packet)) return fail(raw, "csv", "No recognized sensor fields");
    return { raw, format: "csv", packet };
  }

  return fail(raw, "unknown", "Unrecognized line (firmware status text?)");
}