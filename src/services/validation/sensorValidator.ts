import type { SensorPacket, ValidationResult } from "@/types/sensor";

/** Physiologically / electrically plausible ranges for the referenced hardware. */
export const RANGES = {
  ecg: { min: 0, max: 4095 }, // ESP32 12-bit ADC (AD8232 analog out)
  ppgIR: { min: 0, max: 524287 }, // MAX30102 18-bit FIFO
  ppgRed: { min: 0, max: 524287 },
  ppgWave: { min: -524287, max: 524287 },
  bpm: { min: 20, max: 250 },
  spo2: { min: 50, max: 100 },
  signalQuality: { min: 0, max: 100 },
} as const;

type RangedField = keyof typeof RANGES;

/**
 * Validates a parsed packet. Out-of-range numeric fields are dropped
 * (never clamped into a plausible-looking fake value) and reported.
 */
export function validatePacket(packet: SensorPacket | undefined): ValidationResult {
  const errors: string[] = [];
  if (!packet || typeof packet !== "object") {
    return { ok: false, errors: ["Packet is not an object"] };
  }

  const clean: SensorPacket = {};

  if (packet.timestamp !== undefined) {
    if (typeof packet.timestamp === "number" && Number.isFinite(packet.timestamp) && packet.timestamp >= 0) {
      clean.timestamp = packet.timestamp;
    } else {
      errors.push("timestamp is not a finite non-negative number");
    }
  }

  for (const field of Object.keys(RANGES) as RangedField[]) {
    const value = packet[field];
    if (value === undefined) continue;
    if (typeof value !== "number" || !Number.isFinite(value)) {
      errors.push(`${field} is not a finite number`);
      continue;
    }
    const { min, max } = RANGES[field];
    if (value < min || value > max) {
      errors.push(`${field}=${value} is outside the plausible range ${min}..${max}`);
      continue;
    }
    (clean as Record<string, number>)[field] = value;
  }

  if (packet.beat !== undefined) {
    if (typeof packet.beat === "boolean") clean.beat = packet.beat;
    else errors.push("beat is not a boolean");
  }
  if (packet.ecgLeadOff !== undefined) {
    if (typeof packet.ecgLeadOff === "boolean") clean.ecgLeadOff = packet.ecgLeadOff;
    else errors.push("ecgLeadOff is not a boolean");
  }
  if (packet.threshold !== undefined) {
    if (typeof packet.threshold === "number" && Number.isFinite(packet.threshold)) {
      clean.threshold = packet.threshold;
    } else {
      errors.push("threshold is not a finite number");
    }
  }

  const measured = Object.keys(clean).filter((k) => k !== "timestamp");
  if (measured.length === 0) {
    return { ok: false, errors: errors.length ? errors : ["Packet contained no usable measurements"] };
  }

  return { ok: true, packet: clean, errors };
}