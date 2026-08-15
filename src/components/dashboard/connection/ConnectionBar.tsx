import { useSensorStore } from "@/store/sensorStore";
import { StatusPill, type PillTone } from "@/components/dashboard/StatusPill";
import { Button } from "@/components/ui/button";
import { isWebSerialSupported } from "@/services/serial/serialTransport";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

function useAge(time: number | null) {
  const [, tick] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => tick((n) => n + 1), 250);
    return () => window.clearInterval(id);
  }, []);
  return time === null ? null : Date.now() - time;
}

/* Animated signal strength bars */
function SignalBars({ active }: { active: boolean }) {
  return (
    <div className="flex items-end gap-[3px] h-5" aria-hidden>
      {[3, 5, 7, 9].map((h, i) => (
        <span
          key={i}
          style={{ height: `${h * 2}px`, transitionDelay: `${i * 60}ms` }}
          className={cn(
            "w-1.5 rounded-sm transition-all duration-500",
            active
              ? "bg-status-ok"
              : i === 0
              ? "bg-muted-foreground/40"
              : "bg-muted-foreground/15",
          )}
        />
      ))}
    </div>
  );
}

export function ConnectionBar() {
  const state = useSensorStore();
  const age = useAge(state.lastPacketTime);
  const [supported, setSupported] = useState(true);

  useEffect(() => setSupported(isWebSerialSupported()), []);

  const connected = state.connectionState === "CONNECTED";
  const receiving =
    connected && state.dataState === "RECEIVING" && (age ?? 9999) < 2000;

  const linkTone: PillTone =
    state.connectionState === "CONNECTED"
      ? "ok"
      : state.connectionState === "ERROR"
      ? "error"
      : "idle";

  const dataTone: PillTone = receiving
    ? "ok"
    : connected
    ? "warn"
    : "idle";

  return (
    <section
      aria-label="Connection status"
      className={cn(
        "rounded-2xl border p-5 transition-all duration-300",
        "bg-card hover:shadow-lg",
        connected && receiving && "border-status-ok/25 shadow-status-ok/5",
        !connected && "border-border",
      )}
    >
      {/* Top row: status + connect button */}
      <div className="flex flex-wrap items-center justify-between gap-4">

        {/* Left: signal bars + status pills + connection metadata */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">

          {/* Signal indicator */}
          <div className="flex items-center gap-3">
            <SignalBars active={receiving} />
            <div>
              <p className="text-[10px] font-semibold tracking-widest text-muted-foreground uppercase mb-1">
                ESP32 Link
              </p>
              <StatusPill tone={linkTone}>{state.connectionState}</StatusPill>
            </div>
          </div>

          {/* Data stream */}
          <div>
            <p className="text-[10px] font-semibold tracking-widest text-muted-foreground uppercase mb-1">
              Sensor Data
            </p>
            <StatusPill tone={dataTone}>
              {state.connectionState !== "CONNECTED"
                ? "NOT RECEIVING"
                : receiving
                ? "RECEIVING DATA"
                : "NO DATA"}
            </StatusPill>
          </div>

          {/* Compact stats grid */}
          <dl className="grid grid-cols-2 gap-x-5 gap-y-1.5 sm:grid-cols-4 font-mono text-xs">
            {[
              ["Transport", state.transportType === "serial" ? "USB Serial" : "Wi-Fi WS"],
              ["Baud", state.settings.baudRate.toLocaleString()],
              ["Packets", state.packetsReceived.toLocaleString()],
              ["Last pkt", age === null ? "never" : `${age} ms ago`],
            ].map(([dt, dd]) => (
              <div key={String(dt)}>
                <dt className="text-muted-foreground text-[10px] tracking-wide uppercase">{dt}</dt>
                <dd className="text-foreground font-medium mt-0.5">{dd}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Connect / Disconnect button */}
        <div className="flex items-center gap-3">
          {!connected && (
            <select
              className="h-10 rounded-xl border border-input bg-background px-3 text-sm transition-colors hover:border-ring focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30"
              value={state.settings.transportType}
              onChange={(e) => state.setSettings({ transportType: e.target.value as "serial" | "websocket" })}
            >
              <option value="serial">USB Serial</option>
              <option value="websocket">Wi-Fi WS</option>
            </select>
          )}
          {connected ? (
            <Button
              variant="destructive"
              className="rounded-xl font-semibold shadow-sm hover:shadow-md transition-all"
              onClick={() => void state.disconnect()}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-2 h-4 w-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728A9 9 0 0 1 5.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
              Disconnect
            </Button>
          ) : (
            <Button
              onClick={() => void state.connect()}
              disabled={state.connectionState === "CONNECTING"}
              className="rounded-xl font-semibold shadow-sm hover:shadow-md transition-all hover:scale-105"
            >
              {state.connectionState === "CONNECTING" ? (
                <>
                  <svg className="mr-2 h-4 w-4 animate-spin-slow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" d="M12 3a9 9 0 1 0 9 9" />
                  </svg>
                  Connecting…
                </>
              ) : (
                <>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-2 h-4 w-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
                  </svg>
                  Connect ESP32
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Alert banners */}
      {!supported && state.settings.transportType === "serial" && (
        <div role="alert" className="mt-4 flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/8 p-3.5 text-sm text-destructive">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mt-0.5 h-4 w-4 flex-shrink-0">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
          </svg>
          Web Serial is not supported by this browser. Please use Chrome or Edge on desktop.
        </div>
      )}

      {state.lastError && (
        <div role="alert" className="mt-4 flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/8 p-3.5 font-mono text-xs text-destructive">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mt-0.5 h-4 w-4 flex-shrink-0">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
          </svg>
          {state.lastError}
        </div>
      )}

      {connected && state.packetsReceived === 0 && (
        <div className="mt-4 flex items-start gap-3 rounded-xl border border-status-warn/30 bg-status-warn/8 p-3.5 text-sm text-status-warn">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mt-0.5 h-4 w-4 flex-shrink-0">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
          </svg>
          ESP32 connected, but no valid sensor packets received. Check baud rate and firmware output.
        </div>
      )}
    </section>
  );
}