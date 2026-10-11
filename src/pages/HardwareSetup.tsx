import { useState } from "react";
import { ConnectionWizard } from "@/components/dashboard/connection/ConnectionWizard";
import { HardwareTest } from "@/components/dashboard/diagnostics/HardwareTest";
import { MedicalDisclaimer } from "@/components/dashboard/MedicalDisclaimer";
import { Firmware } from "@/pages/Firmware";

const MAX_PINS: Array<[string, string, string]> = [
  ["VIN", "3.3V", "Power supply"],
  ["GND", "GND", "Ground"],
  ["SDA", "GPIO 21", "I²C data"],
  ["SCL", "GPIO 22", "I²C clock"],
];

export function HardwareSetup() {
  const [activeTab, setActiveTab] = useState<"hardware" | "firmware">(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("tab") === "firmware") return "firmware";
    }
    return "hardware";
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header & Subgroup Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary text-xl">
              🔌
            </span>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-foreground">
                Hardware & Firmware Setup
              </h1>
              <p className="mt-0.5 text-xs sm:text-sm text-muted-foreground">
                ESP32 wiring diagrams, sensor pin mappings, flashing sketch, and hardware connection diagnostics.
              </p>
            </div>
          </div>
        </div>

        {/* Segmented Subgroup Switcher */}
        <div className="inline-flex rounded-xl bg-muted/70 p-1 border border-border/60 shadow-inner">
          <button
            type="button"
            onClick={() => setActiveTab("hardware")}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs sm:text-sm font-semibold transition-all ${
              activeTab === "hardware"
                ? "bg-card text-foreground shadow-sm border border-border/60"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <span>🔌</span> Hardware Setup & Wiring
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("firmware")}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs sm:text-sm font-semibold transition-all ${
              activeTab === "firmware"
                ? "bg-card text-foreground shadow-sm border border-border/60"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <span>💾</span> ESP32 Firmware & Sketch
          </button>
        </div>
      </div>

      {/* Subgroup 1: Hardware Setup & Wiring */}
      {activeTab === "hardware" && (
        <div className="space-y-5">
          {/* Overview */}
          <section className="rounded-2xl border bg-card p-5">
            <div className="flex items-start gap-3 mb-4">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary text-xl">
                🔌
              </div>
              <div>
                <h2 className="text-base font-semibold text-foreground">Hardware Architecture</h2>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  Reference firmware:{" "}
                  <a
                    className="text-primary underline decoration-primary/40 hover:decoration-primary transition-colors"
                    href="https://github.com/AikyaNova-Pvt-Ltd/Aikyanova_Labs_Embedded_Systems"
                    target="_blank"
                    rel="noreferrer"
                  >
                    AikyaNova Labs Embedded Systems
                  </a>
                  . This dashboard reads whatever those sketches print over USB serial at 115200 baud.
                </p>
              </div>
            </div>
            <pre className="overflow-auto rounded-xl border border-border bg-background p-4 font-mono text-xs text-muted-foreground leading-relaxed">
              {`PHYSICAL SENSOR (AD8232 / MAX30102)
   → ESP32 (acquisition + BPM/SpO₂ processing)
   → USB Serial @ 115200 baud
   → Browser (Web Serial API)
   → Parser → Validator → Sensor Store → Real-time Dashboard`}
            </pre>
          </section>

          {/* Quick Jump to Firmware */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-primary/20 bg-primary/5 p-4 text-sm">
            <div className="flex items-center gap-3">
              <span className="text-2xl">💾</span>
              <div>
                <p className="font-semibold text-foreground">Ready to flash your ESP32 microcontroller?</p>
                <p className="text-xs text-muted-foreground">
                  View the full C++ Arduino sketch for ECG, PPG, BMI323, LM35, and WiFi streaming.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab("firmware")}
              className="inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
            >
              Open Firmware Sketch →
            </button>
          </div>

          {/* MAX30102 pinout */}
          <section className="rounded-2xl border bg-card p-5">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <span className="text-base">🔴</span> MAX30102 → ESP32 Pin Mapping
            </h2>
            <div className="mt-4 overflow-auto rounded-xl border border-border">
              <table className="w-full text-left font-mono text-sm">
                <thead className="bg-muted/60">
                  <tr>
                    {["MAX30102", "ESP32", "Notes"].map((h) => (
                      <th
                        key={h}
                        className="px-4 py-2.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {MAX_PINS.map(([a, b, c]) => (
                    <tr key={a} className="border-t border-border hover:bg-accent/40 transition-colors">
                      <td className="px-4 py-2.5 font-semibold text-primary">{a}</td>
                      <td className="px-4 py-2.5 text-foreground">{b}</td>
                      <td className="px-4 py-2.5 text-muted-foreground">{c}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              I²C runs at 400 kHz (I2C_SPEED_FAST) in the reference sketches. Raw values stream at roughly 50 Hz.
            </p>
          </section>

          {/* AD8232 note */}
          <section className="rounded-2xl border bg-card p-5">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <span className="text-base">📈</span> AD8232 ECG → ESP32
            </h2>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
              The reference repository currently documents the MAX30102 wiring only; it does not publish
              an AD8232 pinout. Pin assignments are therefore not shown here to avoid inventing them —
              use the analog output pin and lead-off pins defined in your own AD8232 sketch, and make
              the firmware print the sample as{" "}
              <code className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-xs text-foreground">
                ECG:&lt;value&gt;
              </code>{" "}
              or as a CSV row so this dashboard can parse it.
            </p>
          </section>

          {/* Serial formats */}
          <section className="rounded-2xl border bg-card p-5">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <span className="text-base">📡</span> Serial Formats Supported
            </h2>
            <pre className="mt-4 overflow-auto rounded-xl border border-border bg-background p-4 font-mono text-xs leading-relaxed">
              {`Max3010x_Raw_Values.ino   IR=52341\tRED=48213
Max3010x_BPM.ino          Signal:120, Threshold:80, BeatMarker:0
Max3010x_SpO2.ino         IR_Signal:120, Threshold:80, Beat:0, BPM:38, SpO2:49
JSON                      {"timestamp":123456,"ecg":2048,"ppgIR":52341,"ppgRed":48213,"bpm":76,"spo2":98}
CSV                       123456,2048,52341,48213,76,98`}
            </pre>
            <p className="mt-3 text-xs text-muted-foreground">
              The SpO₂ sketch prints{" "}
              <code className="rounded bg-muted px-1 font-mono text-xs">BPM</code> and{" "}
              <code className="rounded bg-muted px-1 font-mono text-xs">SpO₂</code> divided by 2 for the
              Arduino Serial Plotter. The parser multiplies them back by 2; adjust in Settings if your
              firmware prints true values.
            </p>
          </section>

          <ConnectionWizard />
          <HardwareTest />
          <MedicalDisclaimer />
        </div>
      )}

      {/* Subgroup 2: ESP32 Firmware & Sketch */}
      {activeTab === "firmware" && (
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4 text-sm">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🔌</span>
              <div>
                <p className="font-semibold text-foreground">Looking for wiring & connection tests?</p>
                <p className="text-xs text-muted-foreground">
                  Check pin mappings, test live baud rates, or run the hardware diagnostic connection wizard.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab("hardware")}
              className="inline-flex items-center justify-center rounded-xl border border-border bg-background px-4 py-2 text-xs font-semibold text-foreground hover:bg-accent transition-colors"
            >
              ← Back to Hardware Setup
            </button>
          </div>

          <Firmware />
        </div>
      )}
    </div>
  );
}
