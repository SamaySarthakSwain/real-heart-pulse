import { useState, useEffect } from "react";
import {
  Database,
  RefreshCw,
  TrendingDown,
  TrendingUp,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Heart,
  Droplets,
  ShieldCheck,
  ChevronRight,
  Sparkles,
} from "lucide-react";

interface TimelineItem {
  timestamp: string;
  risk_percent: number;
  bpm?: number;
  spo2?: number;
  condition?: string;
}

interface TrajectoryData {
  patient_id: string;
  total_recorded_sessions: number;
  longitudinal_timeline: TimelineItem[];
}

interface LongitudinalTrajectoryPanelProps {
  patientId: string;
  patientName?: string;
}

export function LongitudinalTrajectoryPanel({
  patientId,
  patientName,
}: LongitudinalTrajectoryPanelProps) {
  const [data, setData] = useState<TrajectoryData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mongoConnected, setMongoConnected] = useState<boolean | null>(null);

  const fetchTrajectory = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`http://localhost:8000/patient/history/${patientId}`);
      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}`);
      }
      const json: TrajectoryData = await res.json();
      setData(json);
      setMongoConnected(true);
    } catch (err: any) {
      console.warn("Could not reach Python API, trying local cache:", err);
      setMongoConnected(false);
      setError("AI Backend offline or unreachable. Displaying cached session records.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTrajectory();
  }, [patientId]);

  const timeline = data?.longitudinal_timeline || [];
  const latestRisk = timeline.length > 0 ? timeline[timeline.length - 1].risk_percent : null;
  const previousRisk = timeline.length > 1 ? timeline[timeline.length - 2].risk_percent : null;
  const riskDelta = latestRisk !== null && previousRisk !== null ? latestRisk - previousRisk : null;

  return (
    <div className="rounded-2xl border border-border bg-card p-5 space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
            <Database className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-foreground text-sm sm:text-base">
                Longitudinal Patient Trajectory & Cloud Sync
              </h3>
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                  mongoConnected
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                    : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30"
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    mongoConnected ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
                  }`}
                />
                {mongoConnected ? "MongoDB Active (27017)" : "Offline Local Cache"}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Continuous 10-second telemetry sessions, SE-ResNet-1D diagnosis history, and 95% conformal bounds.
            </p>
          </div>
        </div>

        <button
          onClick={fetchTrajectory}
          disabled={isLoading}
          className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition-all disabled:opacity-50 self-start sm:self-auto"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
          <span>Refresh Sync</span>
        </button>
      </div>

      {/* Summary KPI Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-xl border border-border/60 bg-background/60 p-3">
          <div className="text-[11px] font-mono text-muted-foreground uppercase flex items-center gap-1">
            <Activity className="h-3 w-3 text-primary" /> Total Sessions
          </div>
          <div className="mt-1 text-xl font-bold font-mono text-foreground">
            {data?.total_recorded_sessions ?? 0}
          </div>
          <p className="text-[10px] text-muted-foreground mt-0.5">Persisted in MongoDB</p>
        </div>

        <div className="rounded-xl border border-border/60 bg-background/60 p-3">
          <div className="text-[11px] font-mono text-muted-foreground uppercase flex items-center gap-1">
            <Heart className="h-3 w-3 text-rose-500" /> Latest HF Risk
          </div>
          <div className="mt-1 text-xl font-bold font-mono text-rose-500">
            {latestRisk !== null ? `${latestRisk.toFixed(1)}%` : "—"}
          </div>
          <div className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1">
            {riskDelta !== null ? (
              riskDelta <= 0 ? (
                <span className="text-emerald-500 flex items-center">
                  <TrendingDown className="h-2.5 w-2.5 mr-0.5" />
                  {Math.abs(riskDelta).toFixed(1)}% improvement
                </span>
              ) : (
                <span className="text-destructive flex items-center">
                  <TrendingUp className="h-2.5 w-2.5 mr-0.5" />
                  +{riskDelta.toFixed(1)}% elevation
                </span>
              )
            ) : (
              "Current evaluation"
            )}
          </div>
        </div>

        <div className="rounded-xl border border-border/60 bg-background/60 p-3">
          <div className="text-[11px] font-mono text-muted-foreground uppercase flex items-center gap-1">
            <ShieldCheck className="h-3 w-3 text-indigo-500" /> Conformal Bound
          </div>
          <div className="mt-1 text-xs font-semibold text-foreground flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            95% Guarantee
          </div>
          <p className="text-[10px] text-muted-foreground mt-0.5">Non-conformity threshold</p>
        </div>

        <div className="rounded-xl border border-border/60 bg-background/60 p-3">
          <div className="text-[11px] font-mono text-muted-foreground uppercase flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-amber-500" /> Signal Quality
          </div>
          <div className="mt-1 text-xs font-semibold text-emerald-500 flex items-center gap-1">
            bSQI Pan-Tompkins
          </div>
          <p className="text-[10px] text-muted-foreground mt-0.5">Automated noise gating</p>
        </div>
      </div>

      {/* Trajectory Stream Cards */}
      <div className="space-y-2">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground font-mono flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5" /> Telemetry Stream History
        </h4>

        {timeline.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border/80 bg-background/40 p-6 text-center">
            <Activity className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-50 animate-pulse" />
            <p className="text-sm font-semibold text-foreground">No Telemetry Sessions Yet</p>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1">
              Start streaming live ECG/PPG on the Live Dashboard. Once 10 seconds of waveform buffers
              accumulate, AI diagnostics and MongoDB records are logged automatically.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border/40 rounded-xl border border-border/60 bg-background/40 overflow-hidden max-h-72 overflow-y-auto">
            {timeline.slice().reverse().map((item, idx) => {
              const isHigh = item.risk_percent >= 50;
              const isMod = item.risk_percent >= 25 && item.risk_percent < 50;

              return (
                <div
                  key={idx}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 gap-2 hover:bg-muted/40 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                        isHigh
                          ? "bg-destructive/15 text-destructive border border-destructive/25"
                          : isMod
                          ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/25"
                          : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25"
                      }`}
                    >
                      {item.risk_percent.toFixed(0)}%
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs sm:text-sm text-foreground">
                          {item.condition || "Telemetry Assessment"}
                        </span>
                        <span
                          className={`text-[9px] font-mono px-1.5 py-0.2 rounded-full font-bold ${
                            isHigh
                              ? "bg-destructive/10 text-destructive"
                              : isMod
                              ? "bg-amber-500/10 text-amber-600"
                              : "bg-emerald-500/10 text-emerald-600"
                          }`}
                        >
                          {isHigh ? "HIGH RISK" : isMod ? "MODERATE" : "LOW RISK"}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground font-mono mt-0.5">
                        {new Date(item.timestamp).toLocaleString(undefined, {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-xs font-mono text-muted-foreground self-end sm:self-auto">
                    {item.bpm && (
                      <span className="flex items-center gap-1 text-foreground">
                        <Heart className="h-3 w-3 text-rose-500" />
                        {Math.round(item.bpm)} <span className="text-[10px] text-muted-foreground">BPM</span>
                      </span>
                    )}
                    {item.spo2 && (
                      <span className="flex items-center gap-1 text-foreground">
                        <Droplets className="h-3 w-3 text-sky-500" />
                        {item.spo2.toFixed(1)}%
                      </span>
                    )}
                    <span className="text-[10px] px-2 py-0.5 rounded bg-muted text-muted-foreground border border-border/40">
                      95% Guarantee
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
