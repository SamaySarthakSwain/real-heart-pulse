import { useSensorStore } from "@/store/sensorStore";
import { StatusPill, type PillTone } from "@/components/dashboard/StatusPill";

export function HardwareTest() {
  const s = useSensorStore();

  const checks: Array<[string, boolean, boolean]> = [
    ["ESP32", s.connectionState === "CONNECTED", s.connectionState === "ERROR"],
    ["Serial", s.connectionState === "CONNECTED" && s.transportType === "serial", false],
    ["Packets", s.packetsReceived > 0, false],
    ["Parsing", s.packetsProcessed > 0, s.packetsReceived > 0 && s.packetsProcessed === 0],
    ["ECG", s.ecgSamples > 0, false],
    ["PPG IR", s.ppgIRCurrent !== null, false],
    ["PPG RED", s.ppgRedCurrent !== null, false],
    ["BPM", s.bpmUpdates > 0, false],
    ["SpO2", s.spo2Updates > 0, false],
    ["LM35 temp", s.temperatureUpdates > 0, false],
    ["BMI323 IMU", s.imuUpdates > 0, false],
  ];

  return (
    <section aria-label="Hardware connection test" className="rounded-xl border border-border bg-card p-4">
      <h2 className="text-sm font-semibold">Test hardware connection</h2>
      <p className="mt-1 text-xs text-muted-foreground">
        A check only passes once real data of that kind has actually arrived from the ESP32.
      </p>
      <ul className="mt-3 space-y-1.5 font-mono text-sm">
        {checks.map(([label, pass, failed]) => {
          const tone: PillTone = failed ? "error" : pass ? "ok" : "idle";
          return (
            <li key={label} className="flex items-center justify-between gap-3">
              <span>{label}</span>
              <span aria-hidden className="flex-1 border-b border-dotted border-border" />
              <StatusPill tone={tone}>{failed ? "FAIL" : pass ? "PASS" : "WAITING"}</StatusPill>
            </li>
          );
        })}
      </ul>
    </section>
  );
}