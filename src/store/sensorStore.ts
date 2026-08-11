import { create } from "zustand";
import { RingBuffer } from "@/utils/buffers";
import {
  DEFAULT_PARSER_OPTIONS,
  parseLine,
  type ParserOptions,
} from "@/services/parser/packetParser";
import { validatePacket } from "@/services/validation/sensorValidator";
import { SerialTransport, isWebSerialSupported } from "@/services/serial/serialTransport";
import { WebSocketTransport } from "@/services/websocket/websocketTransport";
import type {
  ConnectionState,
  DataState,
  SensorPacket,
  Transport,
  TransportType,
} from "@/types/sensor";

export interface RawLogEntry {
  id: number;
  receivedAt: number;
  raw: string;
  format: string;
  packet?: SensorPacket | undefined;
  valid: boolean;
  errors: string[];
}

export interface SessionRow {
  t: number;
  ecg?: number | undefined;
  ppgIR?: number | undefined;
  ppgRed?: number | undefined;
  bpm?: number | undefined;
  spo2?: number | undefined;
  signalQuality?: number | undefined;
}

export interface Settings {
  transportType: TransportType;
  baudRate: number;
  websocketUrl: string;
  timeWindowSeconds: number;
  ecgBufferSize: number;
  ppgBufferSize: number;
  vitalsBufferSize: number;
  rawConsoleEnabled: boolean;
  parser: ParserOptions;
}

export const DEFAULT_SETTINGS: Settings = {
  transportType: "serial",
  baudRate: 115200,
  websocketUrl: "",
  timeWindowSeconds: 6,
  ecgBufferSize: 5000,
  ppgBufferSize: 2500,
  vitalsBufferSize: 300,
  rawConsoleEnabled: true,
  parser: { ...DEFAULT_PARSER_OPTIONS },
};

/** Waveform data lives outside React state — charts read it in requestAnimationFrame. */
export const buffers = {
  ecg: new RingBuffer(DEFAULT_SETTINGS.ecgBufferSize),
  ppgIR: new RingBuffer(DEFAULT_SETTINGS.ppgBufferSize),
  ppgRed: new RingBuffer(DEFAULT_SETTINGS.ppgBufferSize),
  ppgWave: new RingBuffer(DEFAULT_SETTINGS.ppgBufferSize),
  bpm: new RingBuffer(DEFAULT_SETTINGS.vitalsBufferSize),
  spo2: new RingBuffer(DEFAULT_SETTINGS.vitalsBufferSize),
};

export const sessionRows: SessionRow[] = [];
const MAX_SESSION_ROWS = 500_000;

interface Counters {
  packetsReceived: number;
  packetsProcessed: number;
  packetsRejected: number;
  malformedPacketCount: number;
  validationErrorCount: number;
  ecgSamples: number;
  ppgSamples: number;
  bpmUpdates: number;
  spo2Updates: number;
}

export interface SensorState extends Counters {
  settings: Settings;
  connectionState: ConnectionState;
  connectionDetail: string | null;
  transportType: TransportType;
  deviceName: string | null;
  lastError: string | null;
  dataState: DataState;
  lastPacketTime: number | null;
  lastValidPacket: SensorPacket | null;
  latencyMs: number | null;
  packetsPerSecond: number;
  ecgSampleRate: number;
  ppgSampleRate: number;
  bpm: number | null;
  spo2: number | null;
  ecgCurrent: number | null;
  ppgIRCurrent: number | null;
  ppgRedCurrent: number | null;
  signalQuality: number | null;
  lastEcgTime: number | null;
  lastPpgTime: number | null;
  lastBpmTime: number | null;
  lastSpo2Time: number | null;
  rawLog: RawLogEntry[];
  paused: boolean;
  recording: boolean;
  recordingStartedAt: number | null;
  recordedRows: number;

  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  ingestLine: (line: string) => void;
  setSettings: (patch: Partial<Settings>) => void;
  setPaused: (paused: boolean) => void;
  clearWaveforms: () => void;
  startSession: () => void;
  stopSession: () => void;
  clearSession: () => void;
  clearRawLog: () => void;
  resetStats: () => void;
}

const emptyCounters: Counters = {
  packetsReceived: 0,
  packetsProcessed: 0,
  packetsRejected: 0,
  malformedPacketCount: 0,
  validationErrorCount: 0,
  ecgSamples: 0,
  ppgSamples: 0,
  bpmUpdates: 0,
  spo2Updates: 0,
};

let transport: Transport | null = null;
let rawId = 0;
const recentPacketTimes: number[] = [];
const recentEcgTimes: number[] = [];
const recentPpgTimes: number[] = [];

function rate(times: number[], now: number) {
  while (times.length > 0 && now - (times[0] as number) > 1000) times.shift();
  return times.length;
}

export const useSensorStore = create<SensorState>((set, get) => ({
  ...emptyCounters,
  settings: { ...DEFAULT_SETTINGS },
  connectionState: "DISCONNECTED",
  connectionDetail: null,
  transportType: "serial",
  deviceName: null,
  lastError: null,
  dataState: "NO_DATA",
  lastPacketTime: null,
  lastValidPacket: null,
  latencyMs: null,
  packetsPerSecond: 0,
  ecgSampleRate: 0,
  ppgSampleRate: 0,
  bpm: null,
  spo2: null,
  ecgCurrent: null,
  ppgIRCurrent: null,
  ppgRedCurrent: null,
  signalQuality: null,
  lastEcgTime: null,
  lastPpgTime: null,
  lastBpmTime: null,
  lastSpo2Time: null,
  rawLog: [],
  paused: false,
  recording: false,
  recordingStartedAt: null,
  recordedRows: 0,

  connect: async () => {
    if (transport?.isConnected()) return;
    const { settings } = get();
    const events = {
      onData: (line: string) => get().ingestLine(line),
      onError: (message: string) => set({ lastError: message }),
      onConnectionChange: (state: ConnectionState, detail?: string) => {
        set({
          connectionState: state,
          connectionDetail: detail ?? null,
          deviceName: transport?.deviceName() ?? null,
        });
        if (state === "DISCONNECTED" || state === "ERROR") {
          // Hard stop: no values are carried forward or invented after a drop.
          set({
            dataState: "NO_DATA",
            bpm: null,
            spo2: null,
            ecgCurrent: null,
            ppgIRCurrent: null,
            ppgRedCurrent: null,
            signalQuality: null,
            packetsPerSecond: 0,
            ecgSampleRate: 0,
            ppgSampleRate: 0,
            latencyMs: null,
          });
        }
      },
    };

    if (settings.transportType === "serial") {
      if (!isWebSerialSupported()) {
        set({
          lastError:
            "Web Serial is not supported by this browser. Please use a supported Chromium-based browser such as Google Chrome or Microsoft Edge on desktop.",
          connectionState: "ERROR",
        });
        return;
      }
      transport = new SerialTransport(events, { baudRate: settings.baudRate });
    } else {
      transport = new WebSocketTransport(events, settings.websocketUrl);
    }
    set({ lastError: null, transportType: settings.transportType });
    await transport.connect();
  },

  disconnect: async () => {
    await transport?.disconnect();
    transport = null;
  },

  ingestLine: (line: string) => {
    const state = get();
    if (state.paused) return;
    const now = Date.now();
    const result = parseLine(line, state.settings.parser);
    const validation = result.packet
      ? validatePacket(result.packet)
      : { ok: false, errors: [result.error ?? "Unparseable line"], packet: undefined };

    const patch: Partial<SensorState> = {
      packetsReceived: state.packetsReceived + 1,
      lastPacketTime: now,
      dataState: "RECEIVING",
      latencyMs: state.lastPacketTime ? now - state.lastPacketTime : null,
    };

    if (state.settings.rawConsoleEnabled) {
      const entry: RawLogEntry = {
        id: rawId++,
        receivedAt: now,
        raw: result.raw,
        format: result.format,
        packet: validation.packet,
        valid: validation.ok,
        errors: validation.errors,
      };
      patch.rawLog = [entry, ...state.rawLog].slice(0, 200);
    }

    if (!validation.ok || !validation.packet) {
      patch.packetsRejected = state.packetsRejected + 1;
      if (!result.packet) patch.malformedPacketCount = state.malformedPacketCount + 1;
      else patch.validationErrorCount = state.validationErrorCount + 1;
      set(patch);
      return;
    }

    const packet = validation.packet;
    patch.packetsProcessed = state.packetsProcessed + 1;
    patch.lastValidPacket = packet;
    if (validation.errors.length > 0) {
      patch.validationErrorCount = state.validationErrorCount + validation.errors.length;
    }

    recentPacketTimes.push(now);
    patch.packetsPerSecond = rate(recentPacketTimes, now);

    if (packet.ecg !== undefined) {
      buffers.ecg.push(packet.ecg, now);
      recentEcgTimes.push(now);
      patch.ecgCurrent = packet.ecg;
      patch.ecgSamples = state.ecgSamples + 1;
      patch.ecgSampleRate = rate(recentEcgTimes, now);
      patch.lastEcgTime = now;
    }
    if (packet.ppgIR !== undefined) {
      buffers.ppgIR.push(packet.ppgIR, now);
      recentPpgTimes.push(now);
      patch.ppgIRCurrent = packet.ppgIR;
      patch.ppgSamples = state.ppgSamples + 1;
      patch.ppgSampleRate = rate(recentPpgTimes, now);
      patch.lastPpgTime = now;
    }
    if (packet.ppgRed !== undefined) {
      buffers.ppgRed.push(packet.ppgRed, now);
      patch.ppgRedCurrent = packet.ppgRed;
      patch.lastPpgTime = now;
    }
    if (packet.ppgWave !== undefined) {
      buffers.ppgWave.push(packet.ppgWave, now);
      patch.lastPpgTime = now;
    }
    if (packet.bpm !== undefined) {
      buffers.bpm.push(packet.bpm, now);
      patch.bpm = packet.bpm;
      patch.bpmUpdates = state.bpmUpdates + 1;
      patch.lastBpmTime = now;
    }
    if (packet.spo2 !== undefined) {
      buffers.spo2.push(packet.spo2, now);
      patch.spo2 = packet.spo2;
      patch.spo2Updates = state.spo2Updates + 1;
      patch.lastSpo2Time = now;
    }
    if (packet.signalQuality !== undefined) patch.signalQuality = packet.signalQuality;

    if (state.recording && sessionRows.length < MAX_SESSION_ROWS) {
      sessionRows.push({
        t: packet.timestamp ?? now,
        ecg: packet.ecg,
        ppgIR: packet.ppgIR,
        ppgRed: packet.ppgRed,
        bpm: packet.bpm,
        spo2: packet.spo2,
        signalQuality: packet.signalQuality,
      });
      patch.recordedRows = sessionRows.length;
    }

    set(patch);
  },

  setSettings: (patch) => {
    const settings = { ...get().settings, ...patch, parser: { ...get().settings.parser, ...(patch.parser ?? {}) } };
    if (patch.ecgBufferSize) buffers.ecg.resize(patch.ecgBufferSize);
    if (patch.ppgBufferSize) {
      buffers.ppgIR.resize(patch.ppgBufferSize);
      buffers.ppgRed.resize(patch.ppgBufferSize);
      buffers.ppgWave.resize(patch.ppgBufferSize);
    }
    if (patch.vitalsBufferSize) {
      buffers.bpm.resize(patch.vitalsBufferSize);
      buffers.spo2.resize(patch.vitalsBufferSize);
    }
    set({ settings });
  },

  setPaused: (paused) => set({ paused }),

  clearWaveforms: () => {
    Object.values(buffers).forEach((b) => b.clear());
    set({ ecgCurrent: null, ppgIRCurrent: null, ppgRedCurrent: null });
  },

  startSession: () => {
    sessionRows.length = 0;
    set({ recording: true, recordingStartedAt: Date.now(), recordedRows: 0 });
  },

  stopSession: () => set({ recording: false }),

  clearSession: () => {
    sessionRows.length = 0;
    set({ recordedRows: 0, recordingStartedAt: null });
  },

  clearRawLog: () => set({ rawLog: [] }),

  resetStats: () => set({ ...emptyCounters }),
}));

/** Marks the stream stale when no packet has arrived recently. */
if (typeof window !== "undefined") {
  window.setInterval(() => {
    const s = useSensorStore.getState();
    if (s.connectionState !== "CONNECTED") return;
    if (!s.lastPacketTime) return;
    const age = Date.now() - s.lastPacketTime;
    if (age > 2000 && s.dataState !== "STALE") useSensorStore.setState({ dataState: "STALE" });
  }, 500);
}