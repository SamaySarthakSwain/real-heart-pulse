import type { ConnectionState, Transport, TransportEvents } from "@/types/sensor";

/**
 * Future Wi-Fi path: ESP32 -> Wi-Fi -> WebSocket -> browser.
 * Emits the exact same complete-line events as SerialTransport, so the parser,
 * validator, store and dashboard need no changes when Wi-Fi is enabled.
 */
export class WebSocketTransport implements Transport {
  readonly type = "websocket" as const;

  private socket: WebSocket | null = null;
  private buffer = "";
  private connected = false;

  constructor(
    private events: TransportEvents,
    private url: string,
  ) {}

  isConnected() {
    return this.connected;
  }

  deviceName() {
    return this.connected ? this.url : null;
  }

  private setState(state: ConnectionState, detail?: string) {
    this.events.onConnectionChange(state, detail);
  }

  async connect(): Promise<void> {
    if (!this.url) {
      this.events.onError("No WebSocket URL configured for the ESP32 (Settings > Communication).");
      this.setState("ERROR", "missing url");
      return;
    }
    this.setState("CONNECTING");
    await new Promise<void>((resolve) => {
      try {
        this.socket = new WebSocket(this.url);
      } catch (error) {
        this.events.onError(`WebSocket connection failed: ${String(error)}`);
        this.setState("ERROR");
        resolve();
        return;
      }
      this.socket.onopen = () => {
        this.connected = true;
        this.setState("CONNECTED", this.url);
        resolve();
      };
      this.socket.onmessage = (event) => {
        this.buffer += typeof event.data === "string" ? event.data : "";
        const lines = this.buffer.split(/\r?\n/);
        this.buffer = lines.pop() ?? "";
        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed !== "") this.events.onData(trimmed);
        }
      };
      this.socket.onerror = () => {
        this.events.onError("WebSocket error while talking to the ESP32.");
        this.setState("ERROR");
      };
      this.socket.onclose = () => {
        this.connected = false;
        this.setState("DISCONNECTED", "WebSocket closed");
        resolve();
      };
    });
  }

  async disconnect(): Promise<void> {
    this.socket?.close();
    this.socket = null;
    this.connected = false;
    this.setState("DISCONNECTED", "Disconnected by user");
  }
}