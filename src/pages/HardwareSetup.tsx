import { ConnectionWizard } from "@/components/dashboard/connection/ConnectionWizard";
import { HardwareTest } from "@/components/dashboard/diagnostics/HardwareTest";
import { MedicalDisclaimer } from "@/components/dashboard/MedicalDisclaimer";

const MAX_PINS = [
  ["VIN", "3.3V", "Power supply"],
  ["GND", "GND", "Ground"],
  ["SDA", "GPIO 21", "I2C data"],
  ["SCL", "GPIO 22", "I2C clock"],
];

export function HardwareSetup() {
  return (
    <div className="space-y-4">
      <section className="rounded-xl border border-border bg-card p-4">
        <h1 className="text-lg font-semibold">Hardware setup</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Reference firmware:{" "}
          <a
            className="text-primary underline"
            href="https://github.com/AikyaNova-Pvt-Ltd/Aikyanova_Labs_Embedded_Systems"
            target="_blank"
            rel="noreferrer"
          >
            AikyaNova Labs Embedded Systems
          </a>
          . This dashboard reads whatever those sketches print over USB serial at 115200 baud.
        </p>
        <pre className="mt-4 overflow-auto rounded-lg border border-border bg-background p-3 font-mono text-xs text-muted-foreground">{`PHYSICAL SENSOR (AD8232 / MAX30102)
   -> ESP32 (acquisition + BPM/SpO2 processing)
   -> USB serial @115200
   -> Browser (Web Serial)
   -> Parser -> Validator -> Sensor store -> Real-time dashboard`}</pre>
      </section>

      <section className="rounded-xl border border-border bg-card p-4">
        <h2 className="text-sm font-semibold">MAX30102 → ESP32 (documented in the repository)</h2>
        <table className="mt-3 w-full text-left font-mono text-sm">
          <thead className="text-xs text-muted-foreground">
            <tr>
              <th className="py-1">MAX30102</th>
              <th className="py-1">ESP32</th>
              <th className="py-1">Notes</th>
            </tr>
          </thead>
          <tbody>
            {MAX_PINS.map(([a, b, c]) => (
              <tr key={a} className="border-t border-border">
                <td className="py-1.5">{a}</td>
                <td className="py-1.5">{b}</td>
                <td className="py-1.5 text-muted-foreground">{c}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-3 text-xs text-muted-foreground">
          I2C runs at 400 kHz (I2C_SPEED_FAST) in the reference sketches. Raw values stream at roughly 50 Hz.
        </p>
      </section>

      <section className="rounded-xl border border-border bg-card p-4">
        <h2 className="text-sm font-semibold">AD8232 ECG → ESP32</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The reference repository currently documents the MAX30102 wiring only; it does not publish an AD8232 pinout.
          Pin assignments are therefore not shown here to avoid inventing them — use the analog output pin and lead-off
          pins defined in your own AD8232 sketch, and make the firmware print the sample as{" "}
          <code className="font-mono">ECG:&lt;value&gt;</code> or as a CSV row so this dashboard can parse it.
        </p>
      </section>

      <section className="rounded-xl border border-border bg-card p-4">
        <h2 className="text-sm font-semibold">Serial formats this dashboard understands</h2>
        <pre className="mt-3 overflow-auto rounded-lg border border-border bg-background p-3 font-mono text-xs">{`Max3010x_Raw_Values.ino   IR=52341\tRED=48213
Max3010x_BPM.ino          Signal:120, Threshold:80, BeatMarker:0
Max3010x_SpO2.ino         IR_Signal:120, Threshold:80, Beat:0, BPM:38, SpO2:49
JSON                      {"timestamp":123456,"ecg":2048,"ppgIR":52341,"ppgRed":48213,"bpm":76,"spo2":98}
CSV                       123456,2048,52341,48213,76,98`}</pre>
        <p className="mt-3 text-xs text-muted-foreground">
          The SpO2 sketch prints <code className="font-mono">BPM</code> and <code className="font-mono">SpO2</code>{" "}
          divided by 2 for the Arduino Serial Plotter. The parser multiplies them back by 2; change that factor in
          Settings if your firmware prints true values.
        </p>
      </section>

      <ConnectionWizard />
      <HardwareTest />
      <MedicalDisclaimer />
    </div>
  );
}