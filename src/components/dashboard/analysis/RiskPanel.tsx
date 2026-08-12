import { useEffect, useMemo, useState } from "react";
import { buffers, useSensorStore } from "@/store/sensorStore";
import { analyseRisk, type ConditionRisk } from "@/services/analysis/heartRisk";
import { StatusPill, type PillTone } from "@/components/dashboard/StatusPill";

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

export function RiskPanel() {
  const connectionState = useSensorStore((s) => s.connectionState);
  const ecgSamples = useSensorStore((s) => s.ecgSamples);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => setTick((n) => n + 1), 2000);
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
          <ul className="mt-4 space-y-4">
            {analysis.conditions.map((c) => (
              <li key={c.id}>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-medium">{c.name}</span>
                  <span className="flex items-center gap-2">
                    <span className="font-mono text-sm tabular-nums">{c.probability.toFixed(1)}%</span>
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
            ["RR irregularity", ecg.irregularity === null ? "--" : `${(ecg.irregularity * 100).toFixed(0)} %`],
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
            ["Subject state", analysis.motion.count === 0 ? "--" : analysis.restingLikely ? "AT REST" : "MOVING"],
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
            Each condition uses an interpretable logistic model over those features. Weights come from
            published clinical thresholds — ST deviation for ischemia, QRS low voltage for amyloidosis,
            QRS widening and RR irregularity for fibrosis, resting tachycardia with desaturation for
            heart failure.
          </li>
          <li>
            A feature that has not been measured is reported as missing and simply left out of the score —
            it is never replaced by an assumed value.
          </li>
          <li>
            Single-lead ECG plus PPG cannot diagnose these diseases. Treat every percentage as a screening
            signal for follow-up with a clinician, not a diagnosis.
          </li>
        </ul>
      </section>
    </div>
  );
}