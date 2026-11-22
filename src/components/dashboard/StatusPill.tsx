import { cn } from "@/lib/utils";

export type PillTone = "ok" | "warn" | "error" | "idle";

const tones: Record<PillTone, { pill: string; dot: string; pulse: boolean }> = {
  ok: {
    pill: "border-status-ok/30 bg-status-ok/10 text-status-ok shadow-sm shadow-status-ok/10",
    dot: "bg-status-ok",
    pulse: true,
  },
  warn: {
    pill: "border-status-warn/35 bg-status-warn/10 text-status-warn shadow-sm shadow-status-warn/10",
    dot: "bg-status-warn",
    pulse: false,
  },
  error: {
    pill: "border-destructive/40 bg-destructive/10 text-destructive shadow-sm shadow-destructive/10",
    dot: "bg-destructive",
    pulse: false,
  },
  idle: {
    pill: "border-border bg-muted/70 text-muted-foreground",
    dot: "bg-muted-foreground/60",
    pulse: false,
  },
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
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5",
        "font-mono text-[10px] font-semibold tracking-widest uppercase",
        "transition-all duration-300 backdrop-blur-sm",
        pill,
        className,
      )}
      style={{ boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.12)" }}
    >
      <span
        aria-hidden
        className={cn("size-1.5 rounded-full flex-shrink-0", dot, pulse && "animate-pulse-dot")}
      />
      {children}
    </span>
  );
}
