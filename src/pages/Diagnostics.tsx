import { useSensorStore } from "@/store/sensorStore";
import { RawConsole } from "@/components/dashboard/diagnostics/RawConsole";
import { PipelineFlow } from "@/components/dashboard/diagnostics/PipelineFlow";
import { HardwareTest } from "@/components/dashboard/diagnostics/HardwareTest";
import { MedicalDisclaimer } from "@/components/dashboard/MedicalDisclaimer";

export function Diagnostics() {
  const s = useSensorStore();
  const stats: Array<[string, string]> = [
    ["Packets received", s.packetsReceived.toLocaleString()],
    ["Packets processed", s.packetsProcessed.toLocaleString()],
    ["Packets rejected", s.packetsRejected.toLocaleString()],
    ["Packets/sec", String(s.packetsPerSecond)],
    ["Malformed packets", s.malformedPacketCount.toLocaleString()],
    ["Validation errors", s.validationErrorCount.toLocaleString()],
    ["ECG samples", s.ecgSamples.toLocaleString()],
    ["PPG samples", s.ppgSamples.toLocaleString()],
    ["BPM updates", s.bpmUpdates.toLocaleString()],
    ["SpO₂ updates", s.spo2Updates.toLocaleString()],
    ["ECG sample rate", `${s.ecgSampleRate} Hz`],
    ["PPG sample rate", `${s.ppgSampleRate} Hz`],
    ["Inter-packet latency", s.latencyMs === null ? "--" : `${s.latencyMs} ms`],
    ["Last packet", s.lastPacketTime ? new Date(s.lastPacketTime).toLocaleTimeString() : "--"],
  ];

  return (
    <div className="space-y-4">
      <section className="rounded-xl border border-border bg-card p-4">
        <h1 className="text-lg font-semibold">Diagnostics</h1>
        <dl className="mt-3 grid gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {stats.map(([label, value]) => (
            <div key={label} className="rounded-lg border border-border bg-background p-3">
              <dt className="text-xs text-muted-foreground">{label}</dt>
              <dd className="font-mono text-lg tabular-nums">{value}</dd>
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