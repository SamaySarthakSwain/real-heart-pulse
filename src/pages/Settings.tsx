import { useState } from "react";
import { useSensorStore } from "@/store/sensorStore";
import { MedicalDisclaimer } from "@/components/dashboard/MedicalDisclaimer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  getGeminiApiKey,
  setGeminiApiKey,
  testGeminiConnection,
} from "@/services/gemini/geminiService";
import { soundFx } from "@/services/audio/soundFx";
import {
  voiceController,
  VOICE_PROFILES,
  type VoicePersonality,
} from "@/services/chatbot/voiceService";
import {
  Sparkles,
  Key,
  CheckCircle2,
  ExternalLink,
  Loader2,
  RefreshCw,
  Music,
  Bell,
  Volume2,
  Play,
  Heart,
} from "lucide-react";
import { toast } from "sonner";

const BAUD_RATES = [9600, 19200, 38400, 57600, 115200, 230400, 921600];

function SettingGroup({ children }: { children: React.ReactNode }) {
  return <div className="space-y-1.5">{children}</div>;
}

export function SettingsPage() {
  const settings = useSensorStore((s) => s.settings);
  const setSettings = useSensorStore((s) => s.setSettings);
  const connected = useSensorStore((s) => s.connectionState === "CONNECTED");

  const [geminiKey, setLocalGeminiKey] = useState(getGeminiApiKey());
  const [testingKey, setTestingKey] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // Acoustic & Sweet Voice states
  const [soundMuted, setSoundMuted] = useState(soundFx.getMuted());
  const [voicePersonality, setVoicePersonality] = useState<VoicePersonality>(voiceController.getPersonality());
  const [isPlayingChime, setIsPlayingChime] = useState(false);
  const [isTestingVoice, setIsTestingVoice] = useState(false);

  const handleSaveGeminiKey = () => {
    setGeminiApiKey(geminiKey);
    toast.success("Gemini API Key saved successfully");
  };

  const handleTestGeminiKey = async () => {
    setTestingKey(true);
    setTestResult(null);
    try {
      const res = await testGeminiConnection(geminiKey);
      setTestResult(res);
      if (res.success) {
        setGeminiApiKey(geminiKey);
        toast.success(res.message);
      } else {
        toast.error(res.message);
      }
    } finally {
      setTestingKey(false);
    }
  };

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
            <Label
              htmlFor="transport"
              className="text-xs font-semibold tracking-wide uppercase text-muted-foreground"
            >
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
            <Label
              htmlFor="baud"
              className="text-xs font-semibold tracking-wide uppercase text-muted-foreground"
            >
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
            <Label
              htmlFor="ws"
              className="text-xs font-semibold tracking-wide uppercase text-muted-foreground"
            >
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
            <Label
              htmlFor="window"
              className="text-xs font-semibold tracking-wide uppercase text-muted-foreground"
            >
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
            <Label
              htmlFor="ecgbuf"
              className="text-xs font-semibold tracking-wide uppercase text-muted-foreground"
            >
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
            <Label
              htmlFor="ppgbuf"
              className="text-xs font-semibold tracking-wide uppercase text-muted-foreground"
            >
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
            <Label
              htmlFor="bpmscale"
              className="text-xs font-semibold tracking-wide uppercase text-muted-foreground"
            >
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
              The reference SpO₂ sketch prints BPM/2 for the Serial Plotter. Use 1 if your firmware
              prints true BPM.
            </p>
          </SettingGroup>

          <SettingGroup>
            <Label
              htmlFor="spo2scale"
              className="text-xs font-semibold tracking-wide uppercase text-muted-foreground"
            >
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

      {/* Google Gemini API Configuration Card */}
      <section className="rounded-2xl border border-primary/20 bg-card p-5 space-y-4 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold text-foreground">
                  Google Gemini API Configuration
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/30">
                  gemini-3.8-flash
                </span>
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Powers the Gemini Cardiology Copilot, real-time clinical telemetry synthesis, and multimodal ECG vision diagnostics.
              </p>
            </div>
          </div>
          <a
            href="https://aistudio.google.com/apikey"
            target="_blank"
            rel="noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline bg-primary/5 px-3 py-1.5 rounded-lg border border-primary/20"
          >
            Get Free Key <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>

        <div className="grid gap-4 md:grid-cols-3 items-end pt-2">
          <div className="space-y-1.5 md:col-span-2">
            <Label
              htmlFor="gemini-key-input"
              className="text-xs font-semibold tracking-wide uppercase text-muted-foreground flex items-center gap-1.5"
            >
              <Key className="h-3.5 w-3.5" /> Gemini API Key
            </Label>
            <Input
              id="gemini-key-input"
              type="password"
              placeholder="AIzaSy..."
              value={geminiKey}
              onChange={(e) => setLocalGeminiKey(e.target.value)}
              className="rounded-xl font-mono text-xs"
            />
          </div>

          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={handleSaveGeminiKey}
              className="rounded-xl text-xs bg-primary text-primary-foreground font-semibold flex-1"
            >
              Save Key
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={testingKey || !geminiKey.trim()}
              onClick={handleTestGeminiKey}
              className="rounded-xl text-xs gap-1.5 flex-1"
            >
              {testingKey ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Testing...
                </>
              ) : (
                <>
                  <RefreshCw className="h-3.5 w-3.5" />
                  Test Key
                </>
              )}
            </Button>
          </div>
        </div>

        {testResult && (
          <div
            className={`p-3 rounded-xl border text-xs flex items-start gap-2 ${
              testResult.success
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                : "bg-destructive/10 border-destructive/30 text-destructive"
            }`}
          >
            {testResult.success ? (
              <CheckCircle2 className="h-4 w-4 flex-shrink-0 mt-0.5" />
            ) : (
              <Key className="h-4 w-4 flex-shrink-0 mt-0.5" />
            )}
            <div>
              <p className="font-semibold">{testResult.success ? "Connection Verified" : "Connection Error"}</p>
              <p className="mt-0.5 text-[11px] opacity-90">{testResult.message}</p>
            </div>
          </div>
        )}

        <div className="bg-muted/30 p-3 rounded-xl border border-border text-[11px] text-muted-foreground flex flex-wrap items-center justify-between gap-2">
          <span>
            API keys are kept strictly local in client storage or loaded via <code className="font-mono text-foreground font-semibold">VITE_GEMINI_API_KEY</code>.
          </span>
          <span className="font-medium text-foreground">
            Zero telemetry or sensor data is ever sent to third parties without your explicit trigger.
          </span>
        </div>
      </section>

      {/* Acoustic Audio & Sweet Voice Experience */}
      <section className="rounded-2xl border bg-card p-5 space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 text-xl">
              🎵
            </div>
            <div>
              <h2 className="text-base font-semibold tracking-tight">Acoustic Audio & Sweet Voice Experience</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Harmonic celestial chimes, satisfying acoustic feedback, and comforting natural neural AI voices.
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20">
            Web Audio Studio
          </span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 pt-1">
          {/* Sweet Chime Preview */}
          <div className="p-4 rounded-xl border border-border bg-muted/20 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Music className="h-4 w-4 text-teal-500" />
                <span className="text-xs font-semibold">Sweet Harmonic Chime</span>
              </div>
              <span className="text-[10px] text-muted-foreground font-mono">E Major 9th</span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              A celestial 4-tone acoustic chord with gentle exponential decay, tuned for psychological calm and delight.
            </p>
            <Button
              size="sm"
              onClick={() => {
                setIsPlayingChime(true);
                soundFx.playSweetChime();
                toast.success("Playing sweet harmonic chime 🌸");
                setTimeout(() => setIsPlayingChime(false), 1600);
              }}
              className="w-full rounded-xl text-xs gap-2 bg-gradient-to-r from-teal-500 to-emerald-600 text-white font-medium hover:opacity-95 shadow-sm"
            >
              <Music className={`h-3.5 w-3.5 ${isPlayingChime ? "animate-bounce" : ""}`} />
              <span>{isPlayingChime ? "Ringing Sweetly..." : "Play Sweet Chime 🌸"}</span>
            </Button>
          </div>

          {/* Sound FX Mute Toggle */}
          <div className="p-4 rounded-xl border border-border bg-muted/20 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-teal-500" />
                <span className="text-xs font-semibold">Tactile Acoustic Feedback</span>
              </div>
              <Switch
                checked={!soundMuted}
                onCheckedChange={() => {
                  const m = soundFx.toggleMuted();
                  setSoundMuted(m);
                  if (!m) soundFx.playSatisfyingPop();
                }}
              />
            </div>
            <p className="text-[11px] text-muted-foreground">
              Delightful micro-pops on messages, buttons, and telemetry sync. Zero latency via Web Audio API.
            </p>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                soundFx.playSatisfyingPop();
                toast.success("Popped! 🫧");
              }}
              className="w-full rounded-xl text-xs gap-2"
            >
              <span>Test Dewdrop Pop 🫧</span>
            </Button>
          </div>
        </div>

        {/* Voice Personality Selector */}
        <div className="pt-2 space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-semibold tracking-wide uppercase text-muted-foreground">
              Sweet Neural Voice Personality
            </Label>
            <span className="text-[10px] text-teal-600 dark:text-teal-400 font-medium">
              High-Fidelity Neural Ranking
            </span>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            {VOICE_PROFILES.map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  setVoicePersonality(p.id);
                  voiceController.setPersonality(p.id);
                  soundFx.playSatisfyingPop();
                  toast.success(`Voice set to: ${p.label}`);
                }}
                className={`p-3 rounded-xl border text-left transition-all ${
                  voicePersonality === p.id
                    ? "bg-teal-500/10 border-teal-500 text-teal-900 dark:text-teal-100 font-semibold shadow-sm"
                    : "bg-card border-border text-muted-foreground hover:border-teal-500/40"
                }`}
              >
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-base">{p.emoji}</span>
                  <span className="text-foreground">{p.label}</span>
                </div>
                <p className="text-[11px] text-muted-foreground mt-1 pl-6">{p.description}</p>
              </button>
            ))}
          </div>

          <div className="pt-2 flex justify-end">
            <Button
              size="sm"
              onClick={() => {
                setIsTestingVoice(true);
                soundFx.playSatisfyingPop();
                voiceController.previewSweetVoice("en-US", () => setIsTestingVoice(false));
                toast.info("Speaking with sweet neural voice...");
              }}
              disabled={isTestingVoice}
              className="rounded-xl text-xs gap-2 bg-teal-600 hover:bg-teal-500 text-white font-medium shadow-sm"
            >
              <Play className="h-3.5 w-3.5 fill-current" />
              <span>{isTestingVoice ? "Speaking Comfortably..." : "Test Sweet Voice 🗣️"}</span>
            </Button>
          </div>
        </div>
      </section>

      <MedicalDisclaimer />
    </div>
  );
}
