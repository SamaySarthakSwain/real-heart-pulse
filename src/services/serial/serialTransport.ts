import type { ConnectionState, Transport, TransportEvents } from "@/types/sensor";

export interface SerialOptions {
  baudRate: number;
}

export function isWebSerialSupported(): boolean {
  return typeof navigator !== "undefined" && "serial" in navigator;
}

/**
 * ESP32 -> USB -> browser transport.
 * Handles chunked reads, partial packets, CR/LF, and disconnects.
 * Emits complete text lines only; parsing happens downstream.
 */
export class SerialTransport implements Transport {
  readonly type = "serial" as const;

  private port: SerialPort | null = null;
  private reader: ReadableStreamDefaultReader<Uint8Array> | null = null;
  private buffer = "";
  private connected = false;
  private closing = false;
  private name: string | null = null;

  constructor(
    private events: TransportEvents,
    private options: SerialOptions,
  ) {}

  setOptions(options: SerialOptions) {
    this.options = options;
  }

  isConnected() {
    return this.connected;
  }

  deviceName() {
    return this.name;
  }

  private setState(state: ConnectionState, detail?: string) {
    this.events.onConnectionChange(state, detail);
  }

  async connect(): Promise<void> {
    if (!isWebSerialSupported()) {
      this.setState("ERROR", "unsupported");
      this.events.onError(
        "Web Serial is not supported by this browser. Please use a supported Chromium-based browser such as Google Chrome or Microsoft Edge on desktop.",
      );
      return;
    }
    this.setState("CONNECTING");
    try {
      this.port = await navigator.serial.requestPort();
      await this.port.open({ baudRate: this.options.baudRate });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.port = null;
      this.setState("ERROR", message);
      if (/No port selected/i.test(message)) {
        this.events.onError("No serial port was selected. Click Connect ESP32 and pick the ESP32 COM port.");
      } else if (/denied|permission/i.test(message)) {
        this.events.onError("Serial permission denied. Allow access to the ESP32 port and try again.");
      } else if (/open|busy|access/i.test(message)) {
        this.events.onError(
          `Could not open the serial port: ${message}. Close the Arduino Serial Monitor or any other program using the port.`,
        );
      } else {
        this.events.onError(`Serial connection failed: ${message}`);
      }
      return;
    }

    this.connected = true;
    this.closing = false;
    this.buffer = "";
    const info = this.port?.getInfo?.();
    this.name = info?.usbVendorId
      ? `USB device ${info.usbVendorId.toString(16)}:${(info.usbProductId ?? 0).toString(16)}`
      : "Serial device";
    this.setState("CONNECTED", this.name);
    void this.readLoop();
  }

  private async readLoop() {
    const decoder = new TextDecoder();
    while (this.port?.readable && !this.closing) {
      this.reader = this.port.readable.getReader();
      try {
        while (true) {
          const { value, done } = await this.reader.read();
          if (done) break;
          if (!value) continue;
          this.buffer += decoder.decode(value, { stream: true });
          // One read may contain a partial packet, or several packets.
          const lines = this.buffer.split(/\r?\n/);
          this.buffer = lines.pop() ?? "";
          if (this.buffer.length > 8192) this.buffer = ""; // runaway line guard
          for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed !== "") this.events.onData(trimmed);
          }
        }
      } catch (error) {
        if (!this.closing) {
          const message = error instanceof Error ? error.message : String(error);
          this.events.onError(`Serial read error: ${message}`);
          this.setState("ERROR", message);
        }
        break;
      } finally {
        try {
          this.reader?.releaseLock();
        } catch {
          /* already released */
        }
        this.reader = null;
      }
    }
    if (!this.closing) await this.teardown("ESP32 disconnected");
  }

  private async teardown(reason: string) {
    this.connected = false;
    try {
      await this.port?.close();
    } catch {
      /* port may already be gone */
    }
    this.port = null;
    this.name = null;
    this.setState("DISCONNECTED", reason);
  }

  async disconnect(): Promise<void> {
    this.closing = true;
    try {
      await this.reader?.cancel();
    } catch {
      /* ignore */
    }
    await this.teardown("Disconnected by user");
  }
}