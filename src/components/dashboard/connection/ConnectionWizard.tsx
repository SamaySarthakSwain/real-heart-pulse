import { useSensorStore } from "@/store/sensorStore";
import { StatusPill, type PillTone } from "@/components/dashboard/StatusPill";
import { Button } from "@/components/ui/button";

export function ConnectionWizard() {
  const s = useSensorStore();
  const steps: Array<[string, boolean]> = [
    [s.settings.transportType === "serial" ? "Choose USB Serial" : "Choose Wi-Fi WebSocket", true],
    ["Connect ESP32", s.connectionState === "CONNECTED"],
    ["Detect incoming data", s.packetsReceived > 0],
    ["Validate packets", s.packetsProcessed > 0],
    ["Detect ECG", s.ecgSamples > 0],
    ["Detect PPG", s.ppgSamples > 0 || s.ppgRedCurrent !== null],
    ["Start monitoring", s.packetsProcessed > 0 && (s.ecgSamples > 0 || s.ppgSamples > 0)],
  ];

  return (
    <section aria-label="Device connection wizard" className="rounded-xl border border-border bg-card p-4">
      <header className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold">Device connection wizard</h2>
        {s.connectionState !== "CONNECTED" && (
          <Button size="sm" onClick={() => void s.connect()}>
            Connect ESP32
          </Button>
        )}
      </header>
      <ol className="mt-3 space-y-2">
        {steps.map(([label, done], index) => {
          const tone: PillTone = done ? "ok" : "idle";
          return (
            <li key={label} className="flex items-center justify-between rounded-lg border border-border bg-background px-3 py-2">
              <span className="text-sm">
                <span className="mr-2 font-mono text-xs text-muted-foreground">STEP {index + 1}</span>
                {label}
              </span>
              <StatusPill tone={tone}>{done ? "DONE" : "WAITING"}</StatusPill>
            </li>
          );
        })}
      </ol>
    </section>
  );
}