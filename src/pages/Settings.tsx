import { useSensorStore } from "@/store/sensorStore";
import { MedicalDisclaimer } from "@/components/dashboard/MedicalDisclaimer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

const BAUD_RATES = [9600, 19200, 38400, 57600, 115200, 230400, 921600];

function SettingGroup({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      {children}
    </div>
  );
}

export function SettingsPage() {
  const settings = useSensorStore((s) => s.settings);
  const setSettings = useSensorStore((s) => s.setSettings);
  const connected = useSensorStore((s) => s.connectionState === "CONNECTED");

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header card */}
      <section className="rounded-2xl border bg-card p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary text-xl">
            ⚙️
          </div>
          <div>
            <h1 className="text-lg font-semibold text-foreground">Settings</h1>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Disconnect the ESP32 before changing transport or baud rate.
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-5 md:grid-cols-2">

          <SettingGroup>
            <Label htmlFor="transport" className="text-xs font-semibold tracking-wide uppercase text-muted-foreground">
              Communication method
            </Label>
            <select
              id="transport"
              className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm transition-colors hover:border-ring focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30"
              value={settings.transportType}
              disabled={connected}
              onChange={(e) =>
                setSettings({ transportType: e.target.value as "serial" | "websocket" })
              }
            >
              <option value="serial">USB Serial (default)</option>
              <option value="websocket">Wi-Fi WebSocket</option>
            </select>
          </SettingGroup>

          <SettingGroup>
            <Label htmlFor="baud" className="text-xs font-semibold tracking-wide uppercase text-muted-foreground">
              Baud rate
            </Label>
            <select
              id="baud"
              className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm transition-colors hover:border-ring focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30"
              value={settings.baudRate}
              disabled={connected}
              onChange={(e) => setSettings({ baudRate: Number(e.target.value) })}
            >
              {BAUD_RATES.map((rate) => (
                <option key={rate} value={rate}>
                  {rate.toLocaleString()} baud
                </option>
              ))}
            </select>
          </SettingGroup>

          <SettingGroup>
            <Label htmlFor="ws" className="text-xs font-semibold tracking-wide uppercase text-muted-foreground">
              ESP32 WebSocket URL
            </Label>
            <Input
              id="ws"
              placeholder="ws://192.168.1.50:81"
              value={settings.websocketUrl}
              onChange={(e) => setSettings({ websocketUrl: e.target.value })}
              className="rounded-xl"
            />
          </SettingGroup>

          <SettingGroup>
            <Label htmlFor="window" className="text-xs font-semibold tracking-wide uppercase text-muted-foreground">
              Graph time window (seconds)
            </Label>
            <Input
              id="window"
              type="number"
              min={2}
              max={30}
              value={settings.timeWindowSeconds}
              onChange={(e) =>
                setSettings({ timeWindowSeconds: Math.max(2, Number(e.target.value) || 6) })
              }
              className="rounded-xl"
            />
          </SettingGroup>

          <SettingGroup>
            <Label htmlFor="ecgbuf" className="text-xs font-semibold tracking-wide uppercase text-muted-foreground">
              ECG buffer size (samples)
            </Label>
            <Input
              id="ecgbuf"
              type="number"
              min={500}
              step={500}
              value={settings.ecgBufferSize}
              onChange={(e) =>
                setSettings({ ecgBufferSize: Math.max(500, Number(e.target.value) || 5000) })
              }
              className="rounded-xl"
            />
          </SettingGroup>

          <SettingGroup>
            <Label htmlFor="ppgbuf" className="text-xs font-semibold tracking-wide uppercase text-muted-foreground">
              PPG buffer size (samples)
            </Label>
            <Input
              id="ppgbuf"
              type="number"
              min={500}
              step={500}
              value={settings.ppgBufferSize}
              onChange={(e) =>
                setSettings({ ppgBufferSize: Math.max(500, Number(e.target.value) || 2500) })
              }
              className="rounded-xl"
            />
          </SettingGroup>

          <SettingGroup>
            <Label htmlFor="bpmscale" className="text-xs font-semibold tracking-wide uppercase text-muted-foreground">
              BPM plotter scale factor
            </Label>
            <Input
              id="bpmscale"
              type="number"
              min={1}
              step={1}
              value={settings.parser.plotterScaleBpm}
              onChange={(e) =>
                setSettings({
                  parser: { ...settings.parser, plotterScaleBpm: Number(e.target.value) || 1 },
                })
              }
              className="rounded-xl"
            />
            <p className="text-xs text-muted-foreground">
              The reference SpO₂ sketch prints BPM/2 for the Serial Plotter. Use 1 if your firmware prints true BPM.
            </p>
          </SettingGroup>

          <SettingGroup>
            <Label htmlFor="spo2scale" className="text-xs font-semibold tracking-wide uppercase text-muted-foreground">
              SpO₂ plotter scale factor
            </Label>
            <Input
              id="spo2scale"
              type="number"
              min={1}
              step={1}
              value={settings.parser.plotterScaleSpo2}
              onChange={(e) =>
                setSettings({
                  parser: { ...settings.parser, plotterScaleSpo2: Number(e.target.value) || 1 },
                })
              }
              className="rounded-xl"
            />
          </SettingGroup>

          {/* Raw console toggle — full width */}
          <div className="flex items-center justify-between gap-4 rounded-xl border border-border bg-background px-4 py-3 transition-colors hover:bg-accent/50 md:col-span-2">
            <div>
              <Label htmlFor="rawlog" className="text-sm font-medium">
                Raw serial console diagnostics
              </Label>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Shows raw bytes from the serial port in the Diagnostics tab
              </p>
            </div>
            <Switch
              id="rawlog"
              checked={settings.rawConsoleEnabled}
              onCheckedChange={(checked) => setSettings({ rawConsoleEnabled: checked })}
            />
          </div>
        </div>
      </section>

      <MedicalDisclaimer />
    </div>
  );
}