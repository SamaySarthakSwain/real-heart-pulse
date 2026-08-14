import { useSensorStore } from "@/store/sensorStore";
import { StatusPill, type PillTone } from "@/components/dashboard/StatusPill";
import { cn } from "@/lib/utils";

export function PipelineFlow() {
  const s = useSensorStore();
  const connected  = s.connectionState === "CONNECTED";
  const receiving  = connected && s.packetsReceived > 0;
  const parsing    = s.packetsProcessed > 0;
  const validating = s.packetsProcessed > 0;
  const stored     = s.lastValidPacket !== null;

  const stage = (
    label: string,
    icon: string,
    ok: boolean,
    errored = false,
  ): [string, string, string, PillTone] => [
    label,
    icon,
    errored ? "ERROR" : ok ? "ACTIVE" : "WAITING",
    errored ? "error" : ok ? "ok" : "idle",
  ];

  const stages = [
    stage("ESP32",   "🔧", connected, s.connectionState === "ERROR"),
    stage(s.transportType === "serial" ? "Serial" : "WebSocket", "📡", receiving),
    stage("Parser",    "🔍", parsing,    s.malformedPacketCount > 0 && !parsing),
    stage("Validator", "✅", validating, s.packetsRejected > 0 && !validating),
    stage("Sensor Store", "💾", stored),
    stage("Dashboard", "📊", stored),
  ];

  return (
    <section
      aria-label="Live data flow"
      className="rounded-2xl border bg-card p-5 transition-all duration-300 hover:shadow-lg"
    >
      <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
        <span className="text-base">🔄</span> Live Data Flow
      </h2>
      <ol className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {stages.map(([label, icon, text, tone], i) => (
          <li
            key={label}
            className={cn(
              "flex items-center justify-between rounded-xl border px-4 py-3",
              "transition-all duration-300 hover:shadow-sm",
              tone === "ok"
                ? "border-status-ok/25 bg-status-ok/5"
                : tone === "error"
                ? "border-destructive/25 bg-destructive/5"
                : "border-border bg-background",
            )}
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <span className="flex items-center gap-2 text-sm font-medium">
              <span className="text-base leading-none">{icon}</span>
              {label}
            </span>
            <StatusPill tone={tone}>{text}</StatusPill>
          </li>
        ))}
      </ol>
    </section>
  );
}