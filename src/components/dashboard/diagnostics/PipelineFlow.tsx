import { useSensorStore } from "@/store/sensorStore";
import { StatusPill, type PillTone } from "@/components/dashboard/StatusPill";

export function PipelineFlow() {
  const s = useSensorStore();
  const connected = s.connectionState === "CONNECTED";
  const receiving = connected && s.packetsReceived > 0;
  const parsing = s.packetsProcessed > 0;
  const validating = s.packetsProcessed > 0;
  const stored = s.lastValidPacket !== null;

  const stage = (label: string, ok: boolean, errored = false): [string, string, PillTone] => [
    label,
    errored ? "ERROR" : ok ? "CONNECTED" : "WAITING",
    errored ? "error" : ok ? "ok" : "idle",
  ];

  const stages = [
    stage("ESP32", connected, s.connectionState === "ERROR"),
    stage(s.transportType === "serial" ? "Serial" : "WebSocket", receiving),
    stage("Parser", parsing, s.malformedPacketCount > 0 && !parsing),
    stage("Validator", validating, s.packetsRejected > 0 && !validating),
    stage("Sensor store", stored),
    stage("Dashboard", stored),
  ];

  return (
    <section aria-label="Live data flow" className="rounded-xl border border-border bg-card p-4">
      <h2 className="text-sm font-semibold">Live data flow</h2>
      <ol className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {stages.map(([label, text, tone]) => (
          <li key={label} className="flex items-center justify-between rounded-lg border border-border bg-background px-3 py-2">
            <span className="text-sm">{label}</span>
            <StatusPill tone={tone}>{text}</StatusPill>
          </li>
        ))}
      </ol>
    </section>
  );
}