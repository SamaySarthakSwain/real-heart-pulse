import { cn } from "@/lib/utils";
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
  icon?: React.ReactNode;
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
  icon,
}: Props) {
  const hasValue = value !== null && Number.isFinite(value);
  const isLive = tone === "ok";

  return (
    <section
      className={cn(
        "relative rounded-2xl p-5 overflow-hidden",
        "border bg-card",
        "transition-all duration-300",
        "hover:shadow-xl hover:-translate-y-0.5",
        isLive && "hover:shadow-primary/10 hover:border-primary/30",
      )}
      style={{
        boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.12), 0 4px 18px rgba(0, 0, 0, 0.04)",
      }}
    >
      {/* Subtle clean-tech gradient glow in top-right corner */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-8 -right-8 h-24 w-24 rounded-full opacity-10 blur-2xl bg-primary"
      />

      {/* Header row */}
      <header className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          {icon && <span className="text-xl leading-none">{icon}</span>}
          <h3 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase font-mono">
            {label}
          </h3>
        </div>
        <StatusPill tone={tone}>{statusText}</StatusPill>
      </header>

      {/* Value */}
      <p
        className={cn(
          "mt-4 font-mono text-4xl font-bold tabular-nums leading-none tracking-tight",
          "transition-colors duration-500",
          hasValue ? accentClass : "text-muted-foreground/35",
          hasValue && isLive && "drop-shadow-sm",
        )}
      >
        {hasValue ? (value as number).toFixed(decimals) : "——"}
        {hasValue && unit ? (
          <span className="ml-2 text-base font-medium text-muted-foreground">{unit}</span>
        ) : null}
      </p>

      {/* Footnote / waiting */}
      <p className="mt-3 text-xs text-muted-foreground/75 leading-snug">
        {hasValue ? (footnote ?? "From ESP32 sensor telemetry") : waitingText}
      </p>

      {/* Live pulse bar at bottom */}
      {isLive && (
        <div
          aria-hidden
          className="absolute bottom-0 left-0 h-[2px] w-full rounded-full"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, #00B496 50%, transparent 100%)",
          }}
        />
      )}
    </section>
  );
}
