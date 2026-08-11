import { cn } from "@/lib/utils";

export type PillTone = "ok" | "warn" | "error" | "idle";

const tones: Record<PillTone, string> = {
  ok: "border-status-ok/40 bg-status-ok/10 text-status-ok",
  warn: "border-status-warn/40 bg-status-warn/10 text-status-warn",
  error: "border-destructive/50 bg-destructive/10 text-destructive",
  idle: "border-border bg-muted text-muted-foreground",
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
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-xs font-semibold tracking-wide uppercase",
        tones[tone],
        className,
      )}
    >
      <span aria-hidden className="size-1.5 rounded-full bg-current" />
      {children}
    </span>
  );
}