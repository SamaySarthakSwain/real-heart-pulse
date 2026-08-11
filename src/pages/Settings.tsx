import { useSensorStore } from "@/store/sensorStore";
import { MedicalDisclaimer } from "@/components/dashboard/MedicalDisclaimer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

const BAUD_RATES = [9600, 19200, 38400, 57600, 115200, 230400, 921600];

export function SettingsPage() {
  const settings = useSensorStore((s) => s.settings);
  const setSettings = useSensorStore((s) => s.setSettings);
  const connected = useSensorStore((s) => s.connectionState === "CONNECTED");

  return (
    <div className="space-y-4">
      <section className="rounded-xl border border-border bg-card p-4">
        <h1 className="text-lg font-semibold">Settings</h1>
        <p className="mt-1 text-xs text-muted-foreground">
          Disconnect the ESP32 before changing transport or baud rate.
        </p>

        <div className="mt-4 grid gap-5 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="transport">Communication method</Label>
            <select
              id="transport"
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={settings.transportType}
              disabled={connected}
              onChange={(e) => setSettings({ transportType: e.target.value as "serial" | "websocket" })}
            >
              <option value="serial">USB Serial (default)</option>
              <option value="websocket">Wi-Fi WebSocket</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="baud">Baud rate</Label>
            <select
              id="baud"
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={settings.baudRate}
              disabled={connected}
              onChange={(e) => setSettings({ baudRate: Number(e.target.value) })}
            >
              {BAUD_RATES.map((rate) => (
                <option key={rate} value={rate}>
                  {rate}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ws">ESP32 WebSocket URL</Label>
            <Input
              id="ws"
              placeholder="ws://192.168.1.50:81"
              value={settings.websocketUrl}
              onChange={(e) => setSettings({ websocketUrl: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="window">Graph time window (seconds)</Label>
            <Input
              id="window"
              type="number"
              min={2}
              max={30}
              value={settings.timeWindowSeconds}
              onChange={(e) => setSettings({ timeWindowSeconds: Math.max(2, Number(e.target.value) || 6) })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ecgbuf">ECG buffer size (samples)</Label>
            <Input
              id="ecgbuf"
              type="number"
              min={500}
              step={500}
              value={settings.ecgBufferSize}
              onChange={(e) => setSettings({ ecgBufferSize: Math.max(500, Number(e.target.value) || 5000) })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ppgbuf">PPG buffer size (samples)</Label>
            <Input
              id="ppgbuf"
              type="number"
              min={500}
              step={500}
              value={settings.ppgBufferSize}
              onChange={(e) => setSettings({ ppgBufferSize: Math.max(500, Number(e.target.value) || 2500) })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bpmscale">BPM plotter scale factor</Label>
            <Input
              id="bpmscale"
              type="number"
              min={1}
              step={1}
              value={settings.parser.plotterScaleBpm}
              onChange={(e) => setSettings({ parser: { ...settings.parser, plotterScaleBpm: Number(e.target.value) || 1 } })}
            />
            <p className="text-xs text-muted-foreground">
              The reference SpO2 sketch prints BPM/2 for the Serial Plotter. Use 1 if your firmware prints true BPM.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="spo2scale">SpO₂ plotter scale factor</Label>
            <Input
              id="spo2scale"
              type="number"
              min={1}
              step={1}
              value={settings.parser.plotterScaleSpo2}
              onChange={(e) => setSettings({ parser: { ...settings.parser, plotterScaleSpo2: Number(e.target.value) || 1 } })}
            />
          </div>

          <div className="flex items-center justify-between gap-4 rounded-lg border border-border bg-background p-3 md:col-span-2">
            <Label htmlFor="rawlog">Raw serial console diagnostics</Label>
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