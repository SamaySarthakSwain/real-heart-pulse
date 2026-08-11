import { StatusPill, type PillTone } from "@/components/dashboard/StatusPill";

interface Props {
  label: string;
  value: number | null;
  unit?: string;
  decimals?: number;
  waitingText: string;
  statusText: string;
  tone: PillTone;
  footnote?: string;
  accentClass?: string;
}

/** Shows "--" whenever the hardware has not delivered this measurement. */
export function MetricCard({
  label,
  value,
  unit,
  decimals = 0,
  waitingText,
  statusText,
  tone,
  footnote,
  accentClass = "text-foreground",
}: Props) {
  const hasValue = value !== null && Number.isFinite(value);
  return (
    <section className="rounded-xl border border-border bg-card p-4">
      <header className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-medium text-muted-foreground">{label}</h3>
        <StatusPill tone={tone}>{statusText}</StatusPill>
      </header>
      <p className={`mt-3 font-mono text-4xl font-bold tabular-nums ${hasValue ? accentClass : "text-muted-foreground"}`}>
        {hasValue ? (value as number).toFixed(decimals) : "--"}
        {hasValue && unit ? <span className="ml-1 text-lg font-medium">{unit}</span> : null}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">{hasValue ? (footnote ?? "From ESP32 sensor data") : waitingText}</p>
    </section>
  );
}