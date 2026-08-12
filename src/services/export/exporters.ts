import type { SessionRow } from "@/store/sensorStore";

const COLUMNS = [
  "timestamp",
  "ecg",
  "ppgIR",
  "ppgRed",
  "bpm",
  "spo2",
  "signalQuality",
  "temperature",
  "accelX",
  "accelY",
  "accelZ",
  "gyroX",
  "gyroY",
  "gyroZ",
] as const;

const cell = (value: number | undefined) => (value === undefined ? "" : String(value));

/** CSV of real recorded values only. Missing measurements stay empty — never zero-filled. */
export function toCSV(rows: SessionRow[]): string {
  const lines = [COLUMNS.join(",")];
  for (const row of rows) {
    lines.push(
      [
        String(row.t),
        cell(row.ecg),
        cell(row.ppgIR),
        cell(row.ppgRed),
        cell(row.bpm),
        cell(row.spo2),
        cell(row.signalQuality),
        cell(row.temperature),
        cell(row.accelX),
        cell(row.accelY),
        cell(row.accelZ),
        cell(row.gyroX),
        cell(row.gyroY),
        cell(row.gyroZ),
      ].join(","),
    );
  }
  return lines.join("\n");
}

export function toJSON(rows: SessionRow[]): string {
  return JSON.stringify(
    {
      source: "ESP32 hardware capture",
      exportedAt: new Date().toISOString(),
      sampleCount: rows.length,
      samples: rows.map((row) => ({
        timestamp: row.t,
        ecg: row.ecg ?? null,
        ppgIR: row.ppgIR ?? null,
        ppgRed: row.ppgRed ?? null,
        bpm: row.bpm ?? null,
        spo2: row.spo2 ?? null,
        signalQuality: row.signalQuality ?? null,
        temperature: row.temperature ?? null,
        accelX: row.accelX ?? null,
        accelY: row.accelY ?? null,
        accelZ: row.accelZ ?? null,
        gyroX: row.gyroX ?? null,
        gyroY: row.gyroY ?? null,
        gyroZ: row.gyroZ ?? null,
      })),
    },
    null,
    2,
  );
}

export function downloadFile(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}