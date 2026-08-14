import { cn } from "@/lib/utils";

export type PillTone = "ok" | "warn" | "error" | "idle";

const tones: Record<PillTone, { pill: string; dot: string; pulse: boolean }> = {
  ok:   { pill: "border-status-ok/35 bg-status-ok/10 text-status-ok",     dot: "bg-status-ok",    pulse: true  },
  warn: { pill: "border-status-warn/35 bg-status-warn/10 text-status-warn", dot: "bg-status-warn",  pulse: false },
  error:{ pill: "border-destructive/45 bg-destructive/10 text-destructive", dot: "bg-destructive",  pulse: false },
  idle: { pill: "border-border bg-muted/60 text-muted-foreground",          dot: "bg-muted-foreground/60", pulse: false },
};

export function StatusPill({
  tone,
  children,
  className,
}: {
  tone: PillTone;
  children: React.ReactNode;
  className?: string;
}) {
  const { pill, dot, pulse } = tones[tone];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1",
        "font-mono text-[10px] font-semibold tracking-widest uppercase",
        "transition-colors duration-300",
        pill,
        className,
      )}
    >
      <span
        aria-hidden
        className={cn(
          "size-1.5 rounded-full flex-shrink-0",
          dot,
          pulse && "animate-pulse-dot",
        )}
      />
      {children}
    </span>
  );
}