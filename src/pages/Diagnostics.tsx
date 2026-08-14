import { useSensorStore } from "@/store/sensorStore";
import { RawConsole } from "@/components/dashboard/diagnostics/RawConsole";
import { PipelineFlow } from "@/components/dashboard/diagnostics/PipelineFlow";
import { HardwareTest } from "@/components/dashboard/diagnostics/HardwareTest";
import { MedicalDisclaimer } from "@/components/dashboard/MedicalDisclaimer";

export function Diagnostics() {
  const s = useSensorStore();
  const stats: Array<[string, string, string]> = [
    ["Packets received",     s.packetsReceived.toLocaleString(),    "📦"],
    ["Packets processed",    s.packetsProcessed.toLocaleString(),   "✅"],
    ["Packets rejected",     s.packetsRejected.toLocaleString(),    "❌"],
    ["Packets/sec",          String(s.packetsPerSecond),            "⚡"],
    ["Malformed packets",    s.malformedPacketCount.toLocaleString(),"⚠️"],
    ["Validation errors",    s.validationErrorCount.toLocaleString(),"🔍"],
    ["ECG samples",          s.ecgSamples.toLocaleString(),         "📈"],
    ["PPG samples",          s.ppgSamples.toLocaleString(),         "🔴"],
    ["BPM updates",          s.bpmUpdates.toLocaleString(),         "💓"],
    ["SpO₂ updates",         s.spo2Updates.toLocaleString(),        "🩸"],
    ["ECG sample rate",      `${s.ecgSampleRate} Hz`,               "📡"],
    ["PPG sample rate",      `${s.ppgSampleRate} Hz`,               "📡"],
    ["Inter-packet latency", s.latencyMs === null ? "——" : `${s.latencyMs} ms`, "⏱"],
    ["Last packet",          s.lastPacketTime ? new Date(s.lastPacketTime).toLocaleTimeString() : "——", "🕐"],
  ];

  return (
    <div className="space-y-5 animate-fade-in">
      <section className="rounded-2xl border bg-card p-5">
        <div className="flex items-start gap-3 mb-5">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary text-xl">
            🛠
          </div>
          <div>
            <h1 className="text-lg font-semibold text-foreground">Diagnostics</h1>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Live pipeline statistics from the ESP32 data stream.
            </p>
          </div>
        </div>

        <dl className="grid gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {stats.map(([label, value, icon]) => (
            <div
              key={label}
              className="rounded-xl border border-border bg-background p-3.5 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
            >
              <dt className="flex items-center gap-1.5 text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
                <span className="text-sm leading-none">{icon}</span>
                {label}
              </dt>
              <dd className="mt-2 font-mono text-lg font-bold tabular-nums">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <PipelineFlow />
      <HardwareTest />
      <RawConsole />
      <MedicalDisclaimer />
    </div>
  );
}