import { useEffect, useMemo, useState } from "react";
import { buffers, useSensorStore } from "@/store/sensorStore";
import { usePatientStore } from "@/store/patientStore";
import { analyseRisk, type ConditionRisk } from "@/services/analysis/heartRisk";
import { StatusPill, type PillTone } from "@/components/dashboard/StatusPill";
import { runEdgeOfflineDiagnostics } from "@/services/analysis/edgeOfflineEngine";

const bandTone: Record<ConditionRisk["band"], PillTone> = {
  low: "ok",
  moderate: "warn",
  elevated: "warn",
  high: "error",
};

const barColor: Record<ConditionRisk["band"], string> = {
  low: "bg-status-ok",
  moderate: "bg-status-warn",
  elevated: "bg-status-warn",
  high: "bg-destructive",
};

function num(value: number | null, digits = 0, unit = "") {
  return value === null || !Number.isFinite(value) ? "--" : `${value.toFixed(digits)}${unit}`;
}

interface DLAnalysisResult {
  isOfflineFallback?: boolean;
  primary_diagnosis: string;
  confidence: number;
  detailed_analysis: { class: string; description: string; probability: number }[];
  sqi_assessment?: {
    overall_sqi: number;
    decision: string;
    message: string;
  };
}

export function RiskPanel() {
  const connectionState = useSensorStore((s) => s.connectionState);
  const ecgSamples = useSensorStore((s) => s.ecgSamples);
  const [tick, setTick] = useState(0);
  const [dlAnalysis, setDlAnalysis] = useState<DLAnalysisResult | null>(null);

  useEffect(() => {
    const id = window.setInterval(async () => {
      setTick((n) => n + 1);

      const ecgValues = buffers.ecg.toArray();
      if (ecgValues.length > 500) {
        let padded = ecgValues.slice(-1000);
        if (padded.length < 1000) {
          padded = [...new Array(1000 - padded.length).fill(0), ...padded];
        }

        try {
          const currentPatient = usePatientStore.getState().getCurrentPatient();
          const liveSpo2 = useSensorStore.getState().spo2;

          const res = await fetch("http://localhost:8000/predict/ecg", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              signals: [padded],
              patient_id: currentPatient?.id || "PT-10492",
              reported_spo2: liveSpo2 || 98.0,
            }),
          });
          if (res.ok) {
            const data = await res.json();
            setDlAnalysis(data);
            useSensorStore.getState().setAiDiagnosisResult(data);
          } else {
            // Client-side Edge Offline Fallback
            const fallback = runEdgeOfflineDiagnostics(padded);
            setDlAnalysis(fallback);
            useSensorStore.getState().setAiDiagnosisResult(fallback);
          }
        } catch {
          // Client-side Edge Offline Fallback if server unreachable
          const fallback = runEdgeOfflineDiagnostics(padded);
          setDlAnalysis(fallback);
          useSensorStore.getState().setAiDiagnosisResult(fallback);
        }
      }
    }, 2000);
    return () => window.clearInterval(id);
  }, []);

  const analysis = useMemo(
    () =>
      analyseRisk({
        ecgValues: buffers.ecg.toArray(),
        ecgTimes: buffers.ecg.timeArray(),
        bpmValues: buffers.bpm.toArray(),
        spo2Values: buffers.spo2.toArray(),
        temperatureValues: buffers.temperature.toArray(),
        motionValues: buffers.motion.toArray(),
      }),
    // Recomputed on the timer and whenever new ECG samples land.
    [tick, ecgSamples],
  );

  const { ecg } = analysis;

  return (
    <div className="space-y-4">
      <section className="rounded-xl border border-border bg-card p-4">
        <header className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-semibold">Heart disease risk estimation</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Computed live from real ECG, PPG, SpO₂, LM35 temperature and BMI323 motion data only.
            </p>
          </div>
          <StatusPill tone={analysis.hasEnoughData ? "ok" : "idle"}>
            {analysis.hasEnoughData ? `CONFIDENCE ${analysis.confidence}%` : "NO ANALYSIS"}
          </StatusPill>
        </header>

        {!analysis.hasEnoughData ? (
          <p className="mt-3 rounded-lg border border-border bg-background p-3 font-mono text-xs text-muted-foreground">
            {connectionState === "CONNECTED"
              ? analysis.reason
              : "ESP32 disconnected — no physiological data to analyse."}
          </p>
        ) : (
          <div className="space-y-6 mt-4">
            {dlAnalysis && (
              <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-2 opacity-20">
                  <span className="text-4xl font-bold">AI</span>
                </div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-bold text-primary tracking-widest uppercase">
                    {dlAnalysis.isOfflineFallback
                      ? "Edge Offline Diagnostics (Browser Engine)"
                      : "SE-ResNet-1D + BiGRU (Hospital-Grade DL)"}
                  </h3>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded font-mono font-semibold ${
                      dlAnalysis.isOfflineFallback
                        ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                        : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    }`}
                  >
                    {dlAnalysis.isOfflineFallback ? "OFFLINE EDGE" : "SOTA CONNECTED"}
                  </span>
                </div>

                <div className="mb-6 flex items-center justify-between bg-background rounded-lg p-3 border border-border">
                  <span className="font-semibold text-lg">{dlAnalysis.primary_diagnosis}</span>
                  <StatusPill tone="ok">
                    CONFIDENCE {(dlAnalysis.confidence * 100).toFixed(1)}%
                  </StatusPill>
                </div>

                <ul className="space-y-3">
                  {dlAnalysis.detailed_analysis
                    .sort((a, b) => b.probability - a.probability)
                    .map((c) => (
                      <li key={c.class}>
                        <div className="flex items-center justify-between gap-3 text-sm">
                          <span className="font-medium">{c.description}</span>
                          <span className="font-mono tabular-nums">
                            {(c.probability * 100).toFixed(1)}%
                          </span>
                        </div>
                        <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                          <div
                            className={`h-full rounded-full ${c.probability > 0.5 ? "bg-destructive" : "bg-primary"}`}
                            style={{ width: `${Math.min(100, c.probability * 100)}%` }}
                          />
                        </div>
                      </li>
                    ))}
                </ul>
              </div>
            )}

            <div className="pt-4 border-t border-border">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase mb-3">
                Local Heuristic Fallback
              </h3>
              <ul className="space-y-4">
                {analysis.conditions.map((c) => (
                  <li key={c.id}>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-medium">{c.name}</span>
                      <span className="flex items-center gap-2">
                        <span className="font-mono text-sm tabular-nums">
                          {c.probability.toFixed(1)}%
                        </span>
                        <StatusPill tone={bandTone[c.band]}>{c.band.toUpperCase()}</StatusPill>
                      </span>
                    </div>
                    <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className={`h-full rounded-full ${barColor[c.band]}`}
                        style={{ width: `${Math.min(100, c.probability)}%` }}
                      />
                    </div>
                    {c.contributions.length > 0 && (
                      <ul className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 font-mono text-[11px] text-muted-foreground">
                        {c.contributions.slice(0, 3).map((f) => (
                          <li key={f.label}>
                            {f.direction === "raises" ? "▲" : "▼"} {f.label}: {f.value}
                          </li>
                        ))}
                      </ul>
                    )}
                    {c.missing.length > 0 && (
                      <p className="mt-1 text-[11px] text-muted-foreground">
                        Not measured yet: {c.missing.join(", ")}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </section>

      <section className="rounded-xl border border-border bg-card p-4">
        <h2 className="text-sm font-semibold">Extracted signal features (real measurements)</h2>
        <dl className="mt-3 grid gap-x-6 gap-y-2 font-mono text-xs sm:grid-cols-2 lg:grid-cols-3">
          {[
            ["Analysis window", `${analysis.windowSeconds.toFixed(1)} s`],
            ["ECG sampling", num(ecg.samplingHz, 0, " Hz")],
            ["Detected beats", String(ecg.beatCount)],
            ["ECG heart rate", num(ecg.heartRate, 0, " bpm")],
            ["SDNN", num(ecg.sdnn, 0, " ms")],
            ["RMSSD", num(ecg.rmssd, 0, " ms")],
            ["pNN50", ecg.pnn50 === null ? "--" : `${(ecg.pnn50 * 100).toFixed(0)} %`],
            [
              "RR irregularity",
              ecg.irregularity === null ? "--" : `${(ecg.irregularity * 100).toFixed(0)} %`,
            ],
            ["QRS amplitude", num(ecg.qrsAmplitude, 0, " counts")],
            ["QRS duration", num(ecg.qrsDuration, 0, " ms")],
            [
              "ST deviation",
              ecg.stDeviation === null ? "--" : `${(ecg.stDeviation * 100).toFixed(1)} % of R`,
            ],
            ["Mean SpO₂", num(analysis.spo2.mean, 1, " %")],
            ["Mean BPM (firmware)", num(analysis.bpm.mean, 0, " bpm")],
            ["Mean temperature", num(analysis.temperature.mean, 1, " °C")],
            ["Motion (|a|)", num(analysis.motion.mean, 2, " g")],
            [
              "Subject state",
              analysis.motion.count === 0 ? "--" : analysis.restingLikely ? "AT REST" : "MOVING",
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex justify-between gap-3 border-b border-border/60 py-1">
              <dt className="text-muted-foreground">{label}</dt>
              <dd className="tabular-nums">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="rounded-xl border border-border bg-card p-4">
        <h2 className="text-sm font-semibold">How this estimate is produced</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-muted-foreground">
          <li>
            R peaks are detected with a Pan-Tompkins style pipeline (derivative → squaring → 120 ms
            integration → adaptive threshold) on the raw AD8232 stream.
          </li>
          <li>
            Each condition uses an interpretable logistic model over those features. Weights come
            from published clinical thresholds — ST deviation for ischemia, QRS low voltage for
            amyloidosis, QRS widening and RR irregularity for fibrosis, resting tachycardia with
            desaturation for heart failure.
          </li>
          <li>
            A feature that has not been measured is reported as missing and simply left out of the
            score — it is never replaced by an assumed value.
          </li>
          <li>
            Single-lead ECG plus PPG cannot diagnose these diseases. Treat every percentage as a
            screening signal for follow-up with a clinician, not a diagnosis.
          </li>
        </ul>
      </section>
    </div>
  );
}
