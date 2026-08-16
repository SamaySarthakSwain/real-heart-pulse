import { useEffect, useState } from "react";
import { buffers, sessionRows, useSensorStore } from "@/store/sensorStore";
import { ConnectionBar } from "@/components/dashboard/connection/ConnectionBar";
import { MetricCard } from "@/components/dashboard/metrics/MetricCard";
import { WaveformChart } from "@/components/dashboard/charts/WaveformChart";
import { PipelineFlow } from "@/components/dashboard/diagnostics/PipelineFlow";
import { MedicalDisclaimer } from "@/components/dashboard/MedicalDisclaimer";
import { StatusPill, type PillTone } from "@/components/dashboard/StatusPill";
import { Button } from "@/components/ui/button";
import { downloadFile, toCSV, toJSON } from "@/services/export/exporters";
import { cn } from "@/lib/utils";

function useFreshness(time: number | null, windowMs = 2000) {
  const [, tick] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => tick((n) => n + 1), 400);
    return () => window.clearInterval(id);
  }, []);
  return time !== null && Date.now() - time < windowMs;
}

/* Section title with icon and optional trailing element */
function SectionTitle({
  icon,
  children,
  trail,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
  trail?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
        <span className="text-base leading-none">{icon}</span>
        {children}
      </h2>
      {trail}
    </div>
  );
}

/* Thin gradient divider */
function Divider() {
  return (
    <div
      aria-hidden
      className="h-px w-full rounded-full"
      style={{
        background:
          "linear-gradient(90deg, transparent 0%, oklch(0.76 0.17 165 / 30%) 50%, transparent 100%)",
      }}
    />
  );
}

export function Dashboard() {
  const s = useSensorStore();
  const live = s.connectionState === "CONNECTED";
  const ecgLive  = useFreshness(s.lastEcgTime)  && live;
  const ppgLive  = useFreshness(s.lastPpgTime)  && live;
  const bpmFresh = useFreshness(s.lastBpmTime, 8000)         && live;
  const spo2Fresh= useFreshness(s.lastSpo2Time, 8000)        && live;
  const tempFresh= useFreshness(s.lastTemperatureTime, 8000) && live;
  const imuFresh = useFreshness(s.lastImuTime, 4000)         && live;

  const signalTone = (fresh: boolean): PillTone => (fresh ? "ok" : live ? "warn" : "idle");
  const signalText = (fresh: boolean) => (fresh ? "LIVE" : live ? "WAITING" : "NO SIGNAL");

  return (
    <div className="space-y-5">

      {/* ── Connection status ──────────────────────────────────────────── */}
      <div className="animate-slide-in-up stagger-1">
        <ConnectionBar />
      </div>

      <Divider />

      {/* ── Primary vitals ─────────────────────────────────────────────── */}
      <section>
        <SectionTitle icon="💓">Primary Vitals</SectionTitle>
        <div className="mt-3 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="animate-slide-in-up stagger-2">
            <MetricCard
              label="Heart Rate"
              value={bpmFresh ? s.bpm : null}
              unit="BPM"
              waitingText={live ? "Waiting for BPM data" : "ESP32 disconnected"}
              statusText={bpmFresh ? "LIVE" : live ? "WAITING" : "NO DATA"}
              tone={signalTone(bpmFresh)}
              accentClass="text-signal-ecg"
              footnote="Computed on the ESP32 firmware"
              icon="🫀"
            />
          </div>
          <div className="animate-slide-in-up stagger-3">
            <MetricCard
              label="Blood Oxygen"
              value={spo2Fresh ? s.spo2 : null}
              unit="%"
              waitingText={live ? "Waiting for SpO₂ data" : "ESP32 disconnected"}
              statusText={spo2Fresh ? "LIVE" : live ? "WAITING" : "NO DATA"}
              tone={signalTone(spo2Fresh)}
              accentClass="text-signal-ir"
              footnote="MAX30102 ratio-of-ratios on ESP32"
              icon="🩸"
            />
          </div>

          {/* ECG inline card */}
          <div className="animate-slide-in-up stagger-4">
            <section
              className={cn(
                "relative rounded-2xl border bg-card p-5 overflow-hidden",
                "transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5",
              )}
            >
              <div aria-hidden className="pointer-events-none absolute -top-8 -right-8 h-24 w-24 rounded-full opacity-10 blur-2xl bg-signal-ecg" />
              <header className="flex items-start justify-between gap-2">
                <h3 className="flex items-center gap-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  <span className="text-base">📈</span> ECG (AD8232)
                </h3>
                <StatusPill tone={signalTone(ecgLive)}>{signalText(ecgLive)}</StatusPill>
              </header>
              <p className="mt-4 font-mono text-4xl font-bold tabular-nums leading-none text-signal-ecg">
                {s.ecgCurrent === null ? "——" : s.ecgCurrent}
              </p>
              <p className="mt-3 font-mono text-xs text-muted-foreground/70">
                {s.ecgSampleRate} samples/s · {s.ecgSamples.toLocaleString()} samples
              </p>
            </section>
          </div>

          {/* PPG inline card */}
          <div className="animate-slide-in-up stagger-5">
            <section
              className={cn(
                "relative rounded-2xl border bg-card p-5 overflow-hidden",
                "transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5",
              )}
            >
              <div aria-hidden className="pointer-events-none absolute -top-8 -right-8 h-24 w-24 rounded-full opacity-10 blur-2xl bg-signal-ir" />
              <header className="flex items-start justify-between gap-2">
                <h3 className="flex items-center gap-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  <span className="text-base">🔴</span> PPG (MAX30102)
                </h3>
                <StatusPill tone={signalTone(ppgLive)}>{signalText(ppgLive)}</StatusPill>
              </header>
              <p className="mt-4 font-mono text-lg tabular-nums font-bold text-signal-ir">
                IR {s.ppgIRCurrent ?? "——"} · RED {s.ppgRedCurrent ?? "——"}
              </p>
              <p className="mt-3 font-mono text-xs text-muted-foreground/70">
                {s.ppgSampleRate} samples/s · {s.ppgSamples.toLocaleString()} samples
              </p>
            </section>
          </div>
        </div>
      </section>

      <Divider />

      {/* ── Secondary vitals ───────────────────────────────────────────── */}
      <section>
        <SectionTitle icon="🌡️">Environment &amp; Motion</SectionTitle>
        <div className="mt-3 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="animate-slide-in-up stagger-2">
            <MetricCard
              label="Body Temperature"
              value={tempFresh ? s.temperature : null}
              unit="°C"
              decimals={1}
              waitingText={live ? "Waiting for LM35 data" : "ESP32 disconnected"}
              statusText={tempFresh ? "LIVE" : live ? "WAITING" : "NO DATA"}
              tone={signalTone(tempFresh)}
              accentClass="text-signal-red"
              footnote="Analog LM35 read by the ESP32 ADC"
              icon="🌡️"
            />
          </div>
          <div className="animate-slide-in-up stagger-3">
            <MetricCard
              label="Motion Magnitude"
              value={imuFresh ? s.motionMagnitude : null}
              unit="g"
              decimals={2}
              waitingText={live ? "Waiting for BMI323 accelerometer data" : "ESP32 disconnected"}
              statusText={imuFresh ? "LIVE" : live ? "WAITING" : "NO DATA"}
              tone={signalTone(imuFresh)}
              footnote="Used to detect rest vs movement artefacts"
              icon="📱"
            />
          </div>

          {/* Accelerometer inline card */}
          <div className="animate-slide-in-up stagger-4">
            <section className="relative rounded-2xl border bg-card p-5 overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5">
              <div aria-hidden className="pointer-events-none absolute -top-8 -right-8 h-24 w-24 rounded-full opacity-10 blur-2xl bg-primary" />
              <header className="flex items-start justify-between gap-2">
                <h3 className="flex items-center gap-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  <span>🔧</span> Accelerometer (g)
                </h3>
                <StatusPill tone={signalTone(imuFresh)}>{signalText(imuFresh)}</StatusPill>
              </header>
              <p className="mt-4 font-mono text-lg tabular-nums font-semibold">
                <span className="text-muted-foreground text-xs">X </span>
                {imuFresh && s.accel ? s.accel.x.toFixed(2) : "——"}
                <span className="text-muted-foreground text-xs"> Y </span>
                {imuFresh && s.accel ? s.accel.y.toFixed(2) : "——"}
                <span className="text-muted-foreground text-xs"> Z </span>
                {imuFresh && s.accel ? s.accel.z.toFixed(2) : "——"}
              </p>
              <p className="mt-3 font-mono text-xs text-muted-foreground/70">
                {s.imuUpdates.toLocaleString()} IMU samples
              </p>
            </section>
          </div>

          {/* Gyroscope inline card */}
          <div className="animate-slide-in-up stagger-5">
            <section className="relative rounded-2xl border bg-card p-5 overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5">
              <div aria-hidden className="pointer-events-none absolute -top-8 -right-8 h-24 w-24 rounded-full opacity-10 blur-2xl bg-signal-ir" />
              <header className="flex items-start justify-between gap-2">
                <h3 className="flex items-center gap-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  <span>🌀</span> Gyroscope (°/s)
                </h3>
                <StatusPill tone={signalTone(imuFresh)}>{signalText(imuFresh)}</StatusPill>
              </header>
              <p className="mt-4 font-mono text-lg tabular-nums font-semibold">
                <span className="text-muted-foreground text-xs">X </span>
                {imuFresh && s.gyro ? s.gyro.x.toFixed(1) : "——"}
                <span className="text-muted-foreground text-xs"> Y </span>
                {imuFresh && s.gyro ? s.gyro.y.toFixed(1) : "——"}
                <span className="text-muted-foreground text-xs"> Z </span>
                {imuFresh && s.gyro ? s.gyro.z.toFixed(1) : "——"}
              </p>
              <p className="mt-3 font-mono text-xs text-muted-foreground/70">6-DoF BMI323 over I²C</p>
            </section>
          </div>
        </div>
      </section>

      <Divider />

      {/* ── ECG waveform ────────────────────────────────────────────────── */}
      <section className="rounded-2xl border bg-card p-5 transition-all duration-300 hover:shadow-lg">
        <SectionTitle
          icon="📉"
          trail={
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="secondary"
                className="rounded-xl text-xs font-medium"
                onClick={() => s.setPaused(!s.paused)}
              >
                {s.paused ? "▶ Resume" : "⏸ Pause"}
              </Button>
              <Button
                size="sm"
                variant="secondary"
                className="rounded-xl text-xs font-medium"
                onClick={s.clearWaveforms}
              >
                Clear
              </Button>
            </div>
          }
        >
          ECG Waveform — {s.settings.timeWindowSeconds}s window
        </SectionTitle>
        <WaveformChart
          buffer={buffers.ecg}
          color="--signal-ecg"
          label="ECG"
          hasData={s.ecgSamples > 0}
          paused={s.paused}
          windowSeconds={s.settings.timeWindowSeconds}
          height={220}
          emptyMessage={
            live
              ? "Waiting for ECG samples from the AD8232"
              : "ECG: no signal — ESP32 disconnected"
          }
        />
      </section>

      {/* ── PPG waveforms ────────────────────────────────────────────────── */}
      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-2xl border bg-card p-5 transition-all duration-300 hover:shadow-lg">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-signal-ir">
            <span>🔵</span> PPG Infrared (IR)
          </h2>
          <WaveformChart
            buffer={buffers.ppgIR}
            color="--signal-ir"
            label="PPG IR"
            hasData={s.ppgSamples > 0}
            paused={s.paused}
            windowSeconds={s.settings.timeWindowSeconds}
            emptyMessage={live ? "Waiting for MAX30102 IR data" : "PPG IR: no signal"}
          />
        </section>
        <section className="rounded-2xl border bg-card p-5 transition-all duration-300 hover:shadow-lg">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-signal-red">
            <span>🔴</span> PPG Red
          </h2>
          <WaveformChart
            buffer={buffers.ppgRed}
            color="--signal-red"
            label="PPG RED"
            hasData={s.ppgRedCurrent !== null}
            paused={s.paused}
            windowSeconds={s.settings.timeWindowSeconds}
            emptyMessage={live ? "Waiting for MAX30102 RED data" : "PPG RED: no signal"}
          />
        </section>
      </div>

      {/* ── Trend charts ─────────────────────────────────────────────────── */}
      <section>
        <SectionTitle icon="📊">Trend History</SectionTitle>
        <div className="mt-3 grid gap-4 lg:grid-cols-2">
          <section className="rounded-2xl border bg-card p-5 transition-all duration-300 hover:shadow-lg">
            <h2 className="text-sm font-semibold">BPM Trend</h2>
            <WaveformChart
              buffer={buffers.bpm}
              color="--signal-ecg"
              label="BPM trend"
              hasData={s.bpmUpdates > 0}
              paused={s.paused}
              windowSeconds={120}
              height={140}
              emptyMessage="Waiting for BPM data"
              fillWidth={true}
            />
          </section>
          <section className="rounded-2xl border bg-card p-5 transition-all duration-300 hover:shadow-lg">
            <h2 className="text-sm font-semibold">SpO₂ Trend</h2>
            <WaveformChart
              buffer={buffers.spo2}
              color="--signal-ir"
              label="SpO2 trend"
              hasData={s.spo2Updates > 0}
              paused={s.paused}
              windowSeconds={120}
              height={140}
              emptyMessage="Waiting for SpO₂ data"
              fillWidth={true}
            />
          </section>
        </div>
      </section>

      {/* ── Pipeline flow ─────────────────────────────────────────────────── */}
      <PipelineFlow />

      {/* ── Session recording ─────────────────────────────────────────────── */}
      <section
        className={cn(
          "rounded-2xl border p-5 transition-all duration-300",
          "bg-card hover:shadow-lg",
          s.recording && "border-destructive/30 bg-destructive/5",
        )}
      >
        <SectionTitle
          icon={s.recording ? "🔴" : "⏺"}
          trail={
            <div className="flex flex-wrap gap-2">
              {s.recording ? (
                <Button
                  size="sm"
                  variant="destructive"
                  className="rounded-xl font-medium"
                  onClick={s.stopSession}
                >
                  ⏹ Stop Session
                </Button>
              ) : (
                <Button
                  size="sm"
                  className="rounded-xl font-medium"
                  onClick={s.startSession}
                >
                  ▶ Start Session
                </Button>
              )}
              <Button
                size="sm"
                variant="secondary"
                className="rounded-xl font-medium"
                disabled={s.recordedRows === 0}
                onClick={() =>
                  downloadFile(
                    `esp32-session-${Date.now()}.csv`,
                    toCSV(sessionRows),
                    "text/csv",
                  )
                }
              >
                ↓ CSV
              </Button>
              <Button
                size="sm"
                variant="secondary"
                className="rounded-xl font-medium"
                disabled={s.recordedRows === 0}
                onClick={() =>
                  downloadFile(
                    `esp32-session-${Date.now()}.json`,
                    toJSON(sessionRows),
                    "application/json",
                  )
                }
              >
                ↓ JSON
              </Button>
            </div>
          }
        >
          Session Recording
        </SectionTitle>
        <p className="mt-3 font-mono text-xs text-muted-foreground">
          <span
            className={cn(
              "font-semibold",
              s.recording ? "text-destructive" : "text-muted-foreground",
            )}
          >
            {s.recording ? "● RECORDING" : "○ IDLE"}
          </span>
          {" · "}
          {s.recordedRows.toLocaleString()} real sensor rows captured
        </p>
      </section>

      {/* ── Medical disclaimer ────────────────────────────────────────────── */}
      <MedicalDisclaimer />
    </div>
  );
}