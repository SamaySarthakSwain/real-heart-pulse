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

function useFreshness(time: number | null, windowMs = 2000) {
  const [, tick] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => tick((n) => n + 1), 400);
    return () => window.clearInterval(id);
  }, []);
  return time !== null && Date.now() - time < windowMs;
}

export function Dashboard() {
  const s = useSensorStore();
  const live = s.connectionState === "CONNECTED";
  const ecgLive = useFreshness(s.lastEcgTime) && live;
  const ppgLive = useFreshness(s.lastPpgTime) && live;
  const bpmFresh = useFreshness(s.lastBpmTime, 8000) && live;
  const spo2Fresh = useFreshness(s.lastSpo2Time, 8000) && live;
  const tempFresh = useFreshness(s.lastTemperatureTime, 8000) && live;
  const imuFresh = useFreshness(s.lastImuTime, 4000) && live;

  const signalTone = (fresh: boolean): PillTone => (fresh ? "ok" : live ? "warn" : "idle");
  const signalText = (fresh: boolean) => (fresh ? "LIVE" : live ? "WAITING" : "NO SIGNAL");

  return (
    <div className="space-y-4">
      <ConnectionBar />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Heart rate"
          value={bpmFresh ? s.bpm : null}
          unit="BPM"
          waitingText={live ? "Waiting for BPM data" : "ESP32 disconnected"}
          statusText={bpmFresh ? "LIVE" : live ? "WAITING" : "NO DATA"}
          tone={signalTone(bpmFresh)}
          accentClass="text-signal-ecg"
          footnote="Computed on the ESP32 firmware"
        />
        <MetricCard
          label="Blood oxygen"
          value={spo2Fresh ? s.spo2 : null}
          unit="%"
          waitingText={live ? "Waiting for SpO₂ data" : "ESP32 disconnected"}
          statusText={spo2Fresh ? "LIVE" : live ? "WAITING" : "NO DATA"}
          tone={signalTone(spo2Fresh)}
          accentClass="text-signal-ir"
          footnote="MAX30102 ratio-of-ratios on ESP32"
        />
        <section className="rounded-xl border border-border bg-card p-4">
          <header className="flex items-start justify-between gap-2">
            <h3 className="text-sm font-medium text-muted-foreground">ECG (AD8232)</h3>
            <StatusPill tone={signalTone(ecgLive)}>{signalText(ecgLive)}</StatusPill>
          </header>
          <p className="mt-3 font-mono text-3xl font-bold tabular-nums">
            {s.ecgCurrent === null ? "--" : s.ecgCurrent}
          </p>
          <p className="mt-1 font-mono text-xs text-muted-foreground">
            {s.ecgSampleRate} samples/s · {s.ecgSamples.toLocaleString()} samples
          </p>
        </section>
        <section className="rounded-xl border border-border bg-card p-4">
          <header className="flex items-start justify-between gap-2">
            <h3 className="text-sm font-medium text-muted-foreground">PPG (MAX30102)</h3>
            <StatusPill tone={signalTone(ppgLive)}>{signalText(ppgLive)}</StatusPill>
          </header>
          <p className="mt-3 font-mono text-lg tabular-nums">
            IR {s.ppgIRCurrent ?? "--"} · RED {s.ppgRedCurrent ?? "--"}
          </p>
          <p className="mt-1 font-mono text-xs text-muted-foreground">
            {s.ppgSampleRate} samples/s · {s.ppgSamples.toLocaleString()} samples
          </p>
        </section>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Body temperature (LM35)"
          value={tempFresh ? s.temperature : null}
          unit="°C"
          decimals={1}
          waitingText={live ? "Waiting for LM35 data" : "ESP32 disconnected"}
          statusText={tempFresh ? "LIVE" : live ? "WAITING" : "NO DATA"}
          tone={signalTone(tempFresh)}
          accentClass="text-signal-red"
          footnote="Analog LM35 read by the ESP32 ADC"
        />
        <MetricCard
          label="Motion magnitude (BMI323)"
          value={imuFresh ? s.motionMagnitude : null}
          unit="g"
          decimals={2}
          waitingText={live ? "Waiting for BMI323 accelerometer data" : "ESP32 disconnected"}
          statusText={imuFresh ? "LIVE" : live ? "WAITING" : "NO DATA"}
          tone={signalTone(imuFresh)}
          footnote="Used to detect rest vs movement artefacts"
        />
        <section className="rounded-xl border border-border bg-card p-4">
          <header className="flex items-start justify-between gap-2">
            <h3 className="text-sm font-medium text-muted-foreground">Accelerometer (g)</h3>
            <StatusPill tone={signalTone(imuFresh)}>{signalText(imuFresh)}</StatusPill>
          </header>
          <p className="mt-3 font-mono text-lg tabular-nums">
            X {imuFresh && s.accel ? s.accel.x.toFixed(2) : "--"} · Y{" "}
            {imuFresh && s.accel ? s.accel.y.toFixed(2) : "--"} · Z{" "}
            {imuFresh && s.accel ? s.accel.z.toFixed(2) : "--"}
          </p>
          <p className="mt-1 font-mono text-xs text-muted-foreground">
            {s.imuUpdates.toLocaleString()} IMU samples
          </p>
        </section>
        <section className="rounded-xl border border-border bg-card p-4">
          <header className="flex items-start justify-between gap-2">
            <h3 className="text-sm font-medium text-muted-foreground">Gyroscope (°/s)</h3>
            <StatusPill tone={signalTone(imuFresh)}>{signalText(imuFresh)}</StatusPill>
          </header>
          <p className="mt-3 font-mono text-lg tabular-nums">
            X {imuFresh && s.gyro ? s.gyro.x.toFixed(1) : "--"} · Y{" "}
            {imuFresh && s.gyro ? s.gyro.y.toFixed(1) : "--"} · Z{" "}
            {imuFresh && s.gyro ? s.gyro.z.toFixed(1) : "--"}
          </p>
          <p className="mt-1 font-mono text-xs text-muted-foreground">6-DoF BMI323 over I²C</p>
        </section>
      </div>

      <section className="rounded-xl border border-border bg-card p-4">
        <header className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-semibold">ECG waveform — {s.settings.timeWindowSeconds}s window</h2>
          <div className="flex gap-2">
            <Button size="sm" variant="secondary" onClick={() => s.setPaused(!s.paused)}>
              {s.paused ? "Resume" : "Pause"}
            </Button>
            <Button size="sm" variant="secondary" onClick={s.clearWaveforms}>
              Clear
            </Button>
          </div>
        </header>
        <WaveformChart
          buffer={buffers.ecg}
          color="--signal-ecg"
          label="ECG"
          hasData={s.ecgSamples > 0}
          paused={s.paused}
          windowSeconds={s.settings.timeWindowSeconds}
          height={220}
          emptyMessage={live ? "Waiting for ECG samples from the AD8232" : "ECG: no signal — ESP32 disconnected"}
        />
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-xl border border-border bg-card p-4">
          <h2 className="text-sm font-semibold text-signal-ir">PPG infrared (IR)</h2>
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
        <section className="rounded-xl border border-border bg-card p-4">
          <h2 className="text-sm font-semibold text-signal-red">PPG red</h2>
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

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-xl border border-border bg-card p-4">
          <h2 className="text-sm font-semibold">BPM trend</h2>
          <WaveformChart
            buffer={buffers.bpm}
            color="--signal-ecg"
            label="BPM trend"
            hasData={s.bpmUpdates > 0}
            paused={s.paused}
            windowSeconds={120}
            height={140}
            emptyMessage="Waiting for BPM data"
          />
        </section>
        <section className="rounded-xl border border-border bg-card p-4">
          <h2 className="text-sm font-semibold">SpO₂ trend</h2>
          <WaveformChart
            buffer={buffers.spo2}
            color="--signal-ir"
            label="SpO2 trend"
            hasData={s.spo2Updates > 0}
            paused={s.paused}
            windowSeconds={120}
            height={140}
            emptyMessage="Waiting for SpO₂ data"
          />
        </section>
      </div>

      <PipelineFlow />

      <section className="rounded-xl border border-border bg-card p-4">
        <header className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-semibold">Session recording</h2>
          <div className="flex flex-wrap gap-2">
            {s.recording ? (
              <Button size="sm" variant="destructive" onClick={s.stopSession}>
                Stop session
              </Button>
            ) : (
              <Button size="sm" onClick={s.startSession}>
                Start session
              </Button>
            )}
            <Button
              size="sm"
              variant="secondary"
              disabled={s.recordedRows === 0}
              onClick={() => downloadFile(`esp32-session-${Date.now()}.csv`, toCSV(sessionRows), "text/csv")}
            >
              Export CSV
            </Button>
            <Button
              size="sm"
              variant="secondary"
              disabled={s.recordedRows === 0}
              onClick={() => downloadFile(`esp32-session-${Date.now()}.json`, toJSON(sessionRows), "application/json")}
            >
              Export JSON
            </Button>
          </div>
        </header>
        <p className="mt-2 font-mono text-xs text-muted-foreground">
          {s.recording ? "RECORDING" : "IDLE"} · {s.recordedRows.toLocaleString()} real sensor rows captured
        </p>
      </section>

      <MedicalDisclaimer />
    </div>
  );
}