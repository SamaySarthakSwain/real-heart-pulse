/**
 * Normalized sensor packet. Every field is optional on purpose:
 * a packet only carries what the firmware actually printed.
 * Missing field === no data. Never fill in a substitute value.
 */
export interface SensorPacket {
  timestamp?: number;
  ecg?: number;
  ecgLeadOff?: boolean;
  ppgIR?: number;
  ppgRed?: number;
  ppgWave?: number;
  bpm?: number;
  spo2?: number;
  signalQuality?: number;
  beat?: boolean;
  threshold?: number;
  /** LM35 body/skin temperature in degrees Celsius. */
  temperature?: number;
  /** BMI323 accelerometer, g. */
  accelX?: number;
  accelY?: number;
  accelZ?: number;
  /** BMI323 gyroscope, degrees per second. */
  gyroX?: number;
  gyroY?: number;
  gyroZ?: number;
}

export type PacketFormat = "json" | "csv" | "labeled" | "keyvalue" | "unknown";

export interface ParseResult {
  raw: string;
  format: PacketFormat;
  packet?: SensorPacket;
  error?: string;
}

export interface ValidationResult {
  ok: boolean;
  packet?: SensorPacket;
  errors: string[];
}

export type ConnectionState =
  | "DISCONNECTED"
  | "CONNECTING"
  | "CONNECTED"
  | "ERROR";

export type DataState = "NO_DATA" | "RECEIVING" | "STALE";

export type TransportType = "serial" | "websocket";

export interface TransportEvents {
  onData: (line: string) => void;
  onError: (message: string) => void;
  onConnectionChange: (state: ConnectionState, detail?: string) => void;
}

export interface Transport {
  readonly type: TransportType;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  isConnected(): boolean;
  deviceName(): string | null;
}