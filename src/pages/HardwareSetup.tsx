import { ConnectionWizard } from "@/components/dashboard/connection/ConnectionWizard";
import { HardwareTest } from "@/components/dashboard/diagnostics/HardwareTest";
import { MedicalDisclaimer } from "@/components/dashboard/MedicalDisclaimer";

const MAX_PINS: Array<[string, string, string]> = [
  ["VIN", "3.3V",    "Power supply"],
  ["GND", "GND",     "Ground"],
  ["SDA", "GPIO 21", "I²C data"],
  ["SCL", "GPIO 22", "I²C clock"],
];

export function HardwareSetup() {
  return (
    <div className="space-y-5 animate-fade-in">

      {/* Overview */}
      <section className="rounded-2xl border bg-card p-5">
        <div className="flex items-start gap-3 mb-4">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary text-xl">
            🔌
          </div>
          <div>
            <h1 className="text-lg font-semibold text-foreground">Hardware Setup</h1>
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
                  <th key={h} className="px-4 py-2.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
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
          The reference repository currently documents the MAX30102 wiring only; it does not publish an AD8232 pinout.
          Pin assignments are therefore not shown here to avoid inventing them — use the analog output pin and lead-off
          pins defined in your own AD8232 sketch, and make the firmware print the sample as{" "}
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
          <code className="rounded bg-muted px-1 font-mono text-xs">SpO₂</code>{" "}
          divided by 2 for the Arduino Serial Plotter. The parser multiplies them back by 2; adjust in Settings if
          your firmware prints true values.
        </p>
      </section>

      <ConnectionWizard />
      <HardwareTest />
      <MedicalDisclaimer />
    </div>
  );
}