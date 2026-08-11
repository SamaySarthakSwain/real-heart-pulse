import { useSensorStore } from "@/store/sensorStore";
import { Button } from "@/components/ui/button";

export function RawConsole({ limit = 40 }: { limit?: number }) {
  const rawLog = useSensorStore((s) => s.rawLog);
  const clearRawLog = useSensorStore((s) => s.clearRawLog);

  return (
    <section aria-label="Raw serial console" className="rounded-xl border border-border bg-card p-4">
      <header className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">Raw serial console</h2>
        <Button size="sm" variant="secondary" onClick={clearRawLog}>
          Clear
        </Button>
      </header>
      <div className="mt-3 max-h-96 overflow-auto rounded-lg border border-border bg-background p-3 font-mono text-xs">
        {rawLog.length === 0 ? (
          <p className="text-muted-foreground">Waiting for sensor data from the ESP32…</p>
        ) : (
          <ul className="space-y-3">
            {rawLog.slice(0, limit).map((entry) => (
              <li key={entry.id} className="border-b border-border/60 pb-2 last:border-none">
                <p className="text-muted-foreground">RAW PACKET [{entry.format}]</p>
                <p className="break-all">{entry.raw}</p>
                {entry.packet && (
                  <p className="mt-1 text-foreground/80">
                    PARSED{" "}
                    {Object.entries(entry.packet)
                      .map(([key, value]) => `${key}: ${String(value)}`)
                      .join("  |  ")}
                  </p>
                )}
                <p className={entry.valid ? "text-status-ok" : "text-destructive"}>
                  VALIDATION: {entry.valid ? "PASS" : "REJECTED"}
                  {entry.errors.length > 0 ? ` — ${entry.errors.join("; ")}` : ""}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}