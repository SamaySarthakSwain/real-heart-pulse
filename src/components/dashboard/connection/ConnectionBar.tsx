import { useSensorStore } from "@/store/sensorStore";
import { StatusPill, type PillTone } from "@/components/dashboard/StatusPill";
import { Button } from "@/components/ui/button";
import { isWebSerialSupported } from "@/services/serial/serialTransport";
import { useEffect, useState } from "react";

function useAge(time: number | null) {
  const [, tick] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => tick((n) => n + 1), 250);
    return () => window.clearInterval(id);
  }, []);
  return time === null ? null : Date.now() - time;
}

export function ConnectionBar() {
  const state = useSensorStore();
  const age = useAge(state.lastPacketTime);
  const [supported, setSupported] = useState(true);

  useEffect(() => setSupported(isWebSerialSupported()), []);

  const linkTone: PillTone =
    state.connectionState === "CONNECTED" ? "ok" : state.connectionState === "ERROR" ? "error" : "idle";
  const receiving = state.connectionState === "CONNECTED" && state.dataState === "RECEIVING" && (age ?? 9999) < 2000;
  const dataTone: PillTone = receiving ? "ok" : state.connectionState === "CONNECTED" ? "warn" : "idle";

  return (
    <section
      aria-label="Connection status"
      className="rounded-xl border border-border bg-card p-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
          <div>
            <p className="text-xs text-muted-foreground">ESP32 link</p>
            <StatusPill tone={linkTone}>{state.connectionState}</StatusPill>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Sensor data</p>
            <StatusPill tone={dataTone}>
              {state.connectionState !== "CONNECTED"
                ? "NOT RECEIVING"
                : receiving
                  ? "RECEIVING DATA"
                  : "NO DATA"}
            </StatusPill>
          </div>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-1 font-mono text-xs sm:grid-cols-4">
            <div>
              <dt className="text-muted-foreground">Transport</dt>
              <dd>{state.transportType === "serial" ? "USB Serial" : "Wi-Fi WebSocket"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Baud</dt>
              <dd>{state.settings.baudRate}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Packets</dt>
              <dd>{state.packetsReceived.toLocaleString()}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Last packet</dt>
              <dd>{age === null ? "never" : `${age} ms ago`}</dd>
            </div>
          </dl>
        </div>
        <div className="flex gap-2">
          {state.connectionState === "CONNECTED" ? (
            <Button variant="destructive" onClick={() => void state.disconnect()}>
              Disconnect
            </Button>
          ) : (
            <Button onClick={() => void state.connect()} disabled={state.connectionState === "CONNECTING"}>
              {state.connectionState === "CONNECTING" ? "Connecting…" : "Connect ESP32"}
            </Button>
          )}
        </div>
      </div>
      {!supported && state.settings.transportType === "serial" && (
        <p role="alert" className="mt-3 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          Web Serial is not supported by this browser. Please use a supported Chromium-based browser such as Google
          Chrome or Microsoft Edge on desktop.
        </p>
      )}
      {state.lastError && (
        <p role="alert" className="mt-3 rounded-md border border-destructive/40 bg-destructive/10 p-3 font-mono text-xs text-destructive">
          {state.lastError}
        </p>
      )}
      {state.connectionState === "CONNECTED" && state.packetsReceived === 0 && (
        <p className="mt-3 rounded-md border border-status-warn/40 bg-status-warn/10 p-3 text-sm text-status-warn">
          ESP32 connected, but no valid sensor packets have been received. Check the baud rate and that the firmware is
          printing sensor data.
        </p>
      )}
    </section>
  );
}