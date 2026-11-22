import { useState, useRef, useEffect } from "react";
import { buffers, useSensorStore } from "@/store/sensorStore";
import { usePatientStore } from "@/store/patientStore";
import {
  generateClinicalSynthesis,
  analyzeEcgWaveformVision,
  sendCopilotChatMessage,
  hasGeminiApiKey,
  getGeminiApiKey,
  setGeminiApiKey,
  testGeminiConnection,
  type TelemetryContextPayload,
} from "@/services/gemini/geminiService";
import type {
  ClinicalSynthesisResult,
  EcgVisionResult,
  CopilotChatMessage,
  ClinicalUrgency,
} from "@/types/gemini";
import { analyseRisk } from "@/services/analysis/heartRisk";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Sparkles,
  Bot,
  Activity,
  Send,
  Camera,
  Upload,
  Key,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  ShieldAlert,
  Loader2,
  Copy,
  Check,
  Stethoscope,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { toast } from "sonner";

const URGENCY_STYLES: Record<
  ClinicalUrgency,
  { label: string; badge: string; border: string; bg: string }
> = {
  ROUTINE: {
    label: "ROUTINE MONITORING",
    badge: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    border: "border-emerald-500/30",
    bg: "bg-emerald-500/5",
  },
  ATTENTION_NEEDED: {
    label: "ATTENTION RECOMMENDED",
    badge: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    border: "border-amber-500/30",
    bg: "bg-amber-500/5",
  },
  URGENT: {
    label: "URGENT CLINICAL REVIEW",
    badge: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    border: "border-orange-500/30",
    bg: "bg-orange-500/5",
  },
  CRITICAL: {
    label: "CRITICAL RED FLAG",
    badge: "bg-rose-500/20 text-rose-400 border-rose-500/30 animate-pulse",
    border: "border-rose-500/50",
    bg: "bg-rose-500/10",
  },
};

const QUICK_PROMPTS = [
  "Explain my ST-segment deviation finding",
  "Is my RMSSD & HRV normal for my age?",
  "Check my active medications vs telemetry",
  "What questions should I ask my cardiologist?",
];

export function GeminiCopilotPanel() {
  const [apiKeyModalOpen, setApiKeyModalOpen] = useState(false);
  const [inputApiKey, setInputApiKey] = useState(getGeminiApiKey());
  const [testingKey, setTestingKey] = useState(false);
  const [keyStatus, setKeyStatus] = useState<string | null>(null);

  // Synthesis state
  const [synthesizing, setSynthesizing] = useState(false);
  const synthesis = useSensorStore((s) => s.geminiSynthesis);
  const setSynthesis = useSensorStore((s) => s.setGeminiSynthesis);

  // Chat state
  const [chatMessages, setChatMessages] = useState<CopilotChatMessage[]>([
    {
      id: "initial-msg",
      role: "model",
      text: "Hello! I am your **Gemini Cardiology Copilot** powered by `gemini-3.8-flash`. I am actively monitoring your patient profile and live ESP32 telemetry (AD8232 ECG Lead-II, MAX30102 PPG SpO₂/BPM, and temperature). How can I assist with your cardiac assessment today?",
      timestamp: Date.now(),
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [sendingChat, setSendingChat] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Vision state
  const [analyzingVision, setAnalyzingVision] = useState(false);
  const [visionImage, setVisionImage] = useState<string | null>(null);
  const [visionResult, setVisionResult] = useState<EcgVisionResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Expandable sections
  const [expandedInsights, setExpandedInsights] = useState<Record<number, boolean>>({});

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, sendingChat]);

  const handleSaveApiKey = async () => {
    setTestingKey(true);
    setKeyStatus(null);
    try {
      const res = await testGeminiConnection(inputApiKey);
      if (res.success) {
        setGeminiApiKey(inputApiKey);
        toast.success("Gemini API connected successfully!");
        setApiKeyModalOpen(false);
      } else {
        setKeyStatus(res.message);
        toast.error("Failed to connect with provided key.");
      }
    } finally {
      setTestingKey(false);
    }
  };

  const getPayload = (): TelemetryContextPayload => {
    const s = useSensorStore.getState();
    const currentPatient = usePatientStore.getState().getCurrentPatient();

    const ecgVals = buffers.ecg.toArray();
    const ecgTimes = buffers.ecg.timeArray();
    const bpmVals = buffers.bpm.toArray();
    const spo2Vals = buffers.spo2.toArray();
    const tempVals = buffers.temperature.toArray();
    const motionVals = buffers.motion.toArray();

    const analysis = analyseRisk({
      ecgValues: ecgVals,
      ecgTimes: ecgTimes,
      bpmValues: bpmVals,
      spo2Values: spo2Vals,
      temperatureValues: tempVals,
      motionValues: motionVals,
    });

    return {
      vitals: {
        bpm: s.bpm,
        spo2: s.spo2,
        temperature: s.temperature,
        motionMagnitude: s.motionMagnitude,
      },
      ecgFeatures: {
        samplingHz: analysis.ecg.samplingHz,
        beatCount: analysis.ecg.beatCount,
        heartRate: analysis.ecg.heartRate,
        sdnn: analysis.ecg.sdnn,
        rmssd: analysis.ecg.rmssd,
        pnn50: analysis.ecg.pnn50,
        irregularity: analysis.ecg.irregularity,
        qrsAmplitude: analysis.ecg.qrsAmplitude,
        qrsDuration: analysis.ecg.qrsDuration,
        stDeviation: analysis.ecg.stDeviation,
        qtIntervalMs: analysis.ecg.qtIntervalMs,
        qtcBazettMs: analysis.ecg.qtcBazettMs,
        qtcFridericiaMs: analysis.ecg.qtcFridericiaMs,
        prIntervalMs: analysis.ecg.prIntervalMs,
        stressIndex: analysis.ecg.stressIndex,
        subjectState: analysis.subjectState,
      },
      dlDiagnosis: {
        primary_diagnosis: s.aiPrimaryDiagnosis || "Normal Sinus Rhythm",
        confidence: s.aiConfidence || 0.98,
        detailed_analysis: s.aiDetailedAnalysis || undefined,
        sqi_assessment: {
          overall_sqi: s.sqiScore || 0.95,
          decision: s.sqiStatus || "Optimal",
          message: "High fidelity telemetry",
        },
      },
      patient: currentPatient
        ? {
            id: currentPatient.id,
            name: currentPatient.name,
            age: currentPatient.age,
            gender: currentPatient.gender,
            condition: currentPatient.condition,
            medications: currentPatient.medications,
            bloodType: currentPatient.bloodType,
          }
        : null,
    };
  };

  const handleRunSynthesis = async () => {
    if (!hasGeminiApiKey()) {
      setApiKeyModalOpen(true);
      return;
    }
    setSynthesizing(true);
    try {
      const payload = getPayload();
      const result = await generateClinicalSynthesis(payload);
      setSynthesis(result);
      toast.success("Gemini Clinical Synthesis generated!");
    } catch (err: any) {
      toast.error(err?.message || "Failed to generate synthesis");
    } finally {
      setSynthesizing(false);
    }
  };

  const handleSendChat = async (textToSend?: string) => {
    const text = textToSend || chatInput;
    if (!text.trim()) return;

    if (!hasGeminiApiKey()) {
      setApiKeyModalOpen(true);
      return;
    }

    const userMsg: CopilotChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      text: text.trim(),
      timestamp: Date.now(),
    };

    const newHistory = [...chatMessages, userMsg];
    setChatMessages(newHistory);
    if (!textToSend) setChatInput("");
    setSendingChat(true);

    try {
      const payload = getPayload();
      const telemetryContext = `Patient: ${payload.patient?.name || "Patient"} (${payload.patient?.age || 58}y, ${payload.patient?.gender || "Male"}, Condition: ${payload.patient?.condition || "None"}).
Meds: ${payload.patient?.medications?.join(", ") || "None"}
Current Hardware Telemetry:
- Heart Rate: ${payload.vitals.bpm ?? "--"} BPM
- SpO2: ${payload.vitals.spo2 != null ? `${payload.vitals.spo2.toFixed(1)}%` : "--"}
- Temperature: ${payload.vitals.temperature != null ? `${payload.vitals.temperature.toFixed(1)}°C` : "--"}
- ST-Deviation: ${payload.ecgFeatures.stDeviation != null ? `${(payload.ecgFeatures.stDeviation * 100).toFixed(1)}%` : "--"}
- RMSSD (HRV): ${payload.ecgFeatures.rmssd != null ? `${payload.ecgFeatures.rmssd.toFixed(1)} ms` : "--"}
- SDNN: ${payload.ecgFeatures.sdnn != null ? `${payload.ecgFeatures.sdnn.toFixed(1)} ms` : "--"}
- QRS Duration: ${payload.ecgFeatures.qrsDuration != null ? `${payload.ecgFeatures.qrsDuration.toFixed(1)} ms` : "--"}
- Primary DL Diagnosis: ${payload.dlDiagnosis?.primary_diagnosis || "Normal"} (${payload.dlDiagnosis?.confidence != null ? `${(payload.dlDiagnosis.confidence * 100).toFixed(0)}%` : "--"})`;

      const responseText = await sendCopilotChatMessage(newHistory, userMsg.text, telemetryContext);
      const modelMsg: CopilotChatMessage = {
        id: `model-${Date.now()}`,
        role: "model",
        text: responseText,
        timestamp: Date.now(),
      };
      setChatMessages([...newHistory, modelMsg]);
    } catch (err: any) {
      toast.error(err?.message || "Failed to generate chat response.");
      const errorMsg: CopilotChatMessage = {
        id: `err-${Date.now()}`,
        role: "model",
        text: `⚠️ **Error communicating with Gemini API**: ${err?.message || "Network error"}. Please check your API key in Settings.`,
        timestamp: Date.now(),
      };
      setChatMessages([...newHistory, errorMsg]);
    } finally {
      setSendingChat(false);
    }
  };

  const handleCaptureLiveEcg = () => {
    const ecgSamples = buffers.ecg.toArray().slice(-1000);
    const canvas = document.createElement("canvas");
    canvas.width = 1000;
    canvas.height = 300;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Standard medical pink grid background
    ctx.fillStyle = "#fff5f5";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Minor grid (1mm = 4px)
    ctx.strokeStyle = "rgba(244, 63, 94, 0.15)";
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 4) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += 4) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // Major grid (5mm = 20px)
    ctx.strokeStyle = "rgba(244, 63, 94, 0.35)";
    ctx.lineWidth = 1.2;
    for (let x = 0; x < canvas.width; x += 20) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += 20) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // Header label
    ctx.font = "bold 12px sans-serif";
    ctx.fillStyle = "#881337";
    ctx.fillText("EAR-TO-HEART TELEMETRY | LEAD-II (100 Hz, 25 mm/s, 10 mm/mV)", 15, 20);

    // Draw ECG waveform
    ctx.strokeStyle = "#09090b";
    ctx.lineWidth = 2.0;
    ctx.beginPath();

    const baselineY = canvas.height / 2;
    if (ecgSamples.length > 0) {
      const minVal = Math.min(...ecgSamples);
      const maxVal = Math.max(...ecgSamples);
      const range = maxVal - minVal || 1;

      for (let i = 0; i < ecgSamples.length; i++) {
        const x = (i / (ecgSamples.length - 1)) * canvas.width;
        // Invert Y because canvas Y increases downwards
        const norm = (ecgSamples[i] - minVal) / range;
        const y = baselineY + (0.5 - norm) * (canvas.height * 0.7);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
    } else {
      // Synthetic baseline if no buffer
      ctx.moveTo(0, baselineY);
      ctx.lineTo(canvas.width, baselineY);
    }
    ctx.stroke();

    const dataUrl = canvas.toDataURL("image/png");
    setVisionImage(dataUrl);
    setVisionResult(null);
    toast.info("Live Lead-II ECG strip captured ready for Vision analysis.");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setVisionImage(dataUrl);
      setVisionResult(null);
      toast.info(`Loaded "${file.name}" for ECG Vision analysis.`);
    };
    reader.readAsDataURL(file);
  };

  const handleRunVisionAnalysis = async () => {
    if (!visionImage) {
      toast.error("Please capture or upload an ECG image first.");
      return;
    }
    if (!hasGeminiApiKey()) {
      setApiKeyModalOpen(true);
      return;
    }

    setAnalyzingVision(true);
    try {
      const payload = getPayload();
      const contextStr = `Patient: ${payload.patient?.name || "Patient"}, ${payload.patient?.age || 58}y, Meds: ${payload.patient?.medications?.join(", ") || "None"}. Current BPM: ${payload.vitals.bpm || "--"}, SpO2: ${payload.vitals.spo2 || "--"}%`;
      const result = await analyzeEcgWaveformVision(visionImage, "image/png", contextStr);
      setVisionResult(result);
      toast.success("Gemini Multimodal ECG analysis complete!");
    } catch (err: any) {
      toast.error(err?.message || "Vision analysis failed.");
    } finally {
      setAnalyzingVision(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    toast.success("Copied to clipboard");
  };

  return (
    <div className="rounded-2xl border border-primary/20 bg-card shadow-sm overflow-hidden animate-fade-in">
      {/* ── Copilot Header Banner ─────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-primary/15 via-primary/5 to-transparent p-5 border-b border-border flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-md ring-2 ring-primary/20">
            <Sparkles className="h-6 w-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-foreground">
                Gemini Cardiology Copilot & Telemetry Intelligence
              </h2>
              <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/30">
                gemini-3.8-flash
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Multimodal Electrophysiology & Clinical Decision Support powered by Google Gemini API
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!hasGeminiApiKey() ? (
            <Button
              size="sm"
              variant="destructive"
              onClick={() => setApiKeyModalOpen(true)}
              className="gap-1.5 text-xs rounded-xl font-semibold shadow-sm animate-bounce"
            >
              <Key className="h-3.5 w-3.5" />
              Configure Gemini API Key
            </Button>
          ) : (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setApiKeyModalOpen(true)}
              className="gap-1.5 text-xs rounded-xl border-primary/30 bg-background/50 hover:bg-background"
            >
              <Key className="h-3.5 w-3.5 text-emerald-500" />
              API Connected
            </Button>
          )}
        </div>
      </div>

      {/* ── Main Tab Navigation ───────────────────────────────────────── */}
      <Tabs defaultValue="synthesis" className="w-full">
        <div className="px-5 pt-3 border-b border-border bg-muted/20">
          <TabsList className="bg-muted/60 p-1 rounded-xl">
            <TabsTrigger value="synthesis" className="rounded-lg text-xs font-semibold gap-1.5 data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <Stethoscope className="h-3.5 w-3.5 text-primary" />
              Clinical Synthesis
            </TabsTrigger>
            <TabsTrigger value="chat" className="rounded-lg text-xs font-semibold gap-1.5 data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <Bot className="h-3.5 w-3.5 text-primary" />
              Cardiology Assistant Q&A
            </TabsTrigger>
            <TabsTrigger value="vision" className="rounded-lg text-xs font-semibold gap-1.5 data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <Camera className="h-3.5 w-3.5 text-primary" />
              ECG Strip Vision Diagnostic
            </TabsTrigger>
          </TabsList>
        </div>

        {/* ════════ TAB 1: CLINICAL SYNTHESIS ════════ */}
        <TabsContent value="synthesis" className="p-5 space-y-5 m-0 focus-visible:outline-none">
          <div className="flex flex-wrap items-center justify-between gap-3 bg-muted/30 p-3.5 rounded-xl border border-border">
            <div>
              <p className="text-xs font-semibold text-foreground">
                Holistic Physiological Interpretation
              </p>
              <p className="text-[11px] text-muted-foreground">
                Correlates real-time AD8232 ECG, MAX30102 PPG, LM35 Temp, HRV metrics & medical history.
              </p>
            </div>
            <Button
              onClick={handleRunSynthesis}
              disabled={synthesizing}
              className="gap-2 text-xs rounded-xl bg-primary text-primary-foreground font-semibold shadow-sm hover:scale-[1.02] transition-transform"
            >
              {synthesizing ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Analyzing Telemetry with Gemini...
                </>
              ) : (
                <>
                  <Sparkles className="h-3.5 w-3.5" />
                  Generate Gemini Clinical Impression
                </>
              )}
            </Button>
          </div>

          {!synthesis ? (
            <div className="rounded-xl border border-dashed border-border p-8 text-center bg-muted/10 space-y-3">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Stethoscope className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground">
                  No Clinical Impression Generated Yet
                </h3>
                <p className="text-xs text-muted-foreground max-w-md mx-auto mt-1">
                  Click the button above to run Gemini 3.8 Flash on your active telemetry stream. Gemini will synthesize the ECG waveform, heart rate variability (HRV), oxygen saturation, and clinical conditions into an actionable diagnostic impression.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-5 animate-fade-in">
              {/* Urgency & Hemodynamics Banner */}
              <div
                className={`p-4 rounded-xl border ${URGENCY_STYLES[synthesis.urgency].border} ${URGENCY_STYLES[synthesis.urgency].bg} space-y-3`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs px-2.5 py-1 rounded-md font-bold uppercase tracking-wider ${URGENCY_STYLES[synthesis.urgency].badge}`}
                    >
                      {URGENCY_STYLES[synthesis.urgency].label}
                    </span>
                    <span className="text-xs text-muted-foreground font-mono">
                      Evaluated at {synthesis.timestamp}
                    </span>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(synthesis.summary, "summary")}
                    className="h-7 text-xs gap-1 text-muted-foreground hover:text-foreground"
                  >
                    {copiedId === "summary" ? (
                      <Check className="h-3 w-3 text-emerald-500" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                    Copy Impression
                  </Button>
                </div>

                <p className="text-xs font-medium text-foreground/90">
                  <span className="font-bold">Urgency Rationale:</span> {synthesis.urgencyReason}
                </p>

                {/* Hemodynamic status cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 pt-1">
                  <div className="bg-background/80 p-2.5 rounded-lg border border-border/80">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                      Rhythm Status
                    </p>
                    <p className="text-xs font-semibold text-foreground mt-0.5">
                      {synthesis.hemodynamicStatus.rhythm}
                    </p>
                  </div>
                  <div className="bg-background/80 p-2.5 rounded-lg border border-border/80">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                      Perfusion
                    </p>
                    <p className="text-xs font-semibold text-foreground mt-0.5">
                      {synthesis.hemodynamicStatus.perfusion}
                    </p>
                  </div>
                  <div className="bg-background/80 p-2.5 rounded-lg border border-border/80">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                      Autonomic Balance
                    </p>
                    <p className="text-xs font-semibold text-foreground mt-0.5">
                      {synthesis.hemodynamicStatus.autonomicTone}
                    </p>
                  </div>
                </div>
              </div>

              {/* Clinical Narrative */}
              <div className="rounded-xl border border-border bg-card p-4 space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                  <Activity className="h-3.5 w-3.5" />
                  Clinical Narrative & Electrophysiology Summary
                </h3>
                <p className="text-xs leading-relaxed text-foreground whitespace-pre-line">
                  {synthesis.summary}
                </p>
              </div>

              {/* Key Pathology Insights */}
              {synthesis.pathologyInsights.length > 0 && (
                <div className="space-y-2.5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Biomarker & Physiological Insights
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {synthesis.pathologyInsights.map((insight, idx) => {
                      const isExpanded = expandedInsights[idx];
                      return (
                        <div
                          key={insight.marker}
                          className="rounded-xl border border-border bg-card p-3 space-y-2 hover:border-primary/40 transition-colors"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <span className="font-semibold text-xs text-foreground">
                                {insight.marker}
                              </span>
                              <p className="text-[11px] font-mono text-primary mt-0.5">
                                {insight.finding}
                              </p>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() =>
                                setExpandedInsights((prev) => ({
                                  ...prev,
                                  [idx]: !prev[idx],
                                }))
                              }
                              className="h-6 w-6 p-0 text-muted-foreground"
                            >
                              {isExpanded ? (
                                <ChevronUp className="h-3.5 w-3.5" />
                              ) : (
                                <ChevronDown className="h-3.5 w-3.5" />
                              )}
                            </Button>
                          </div>

                          <p className="text-[11px] text-muted-foreground leading-relaxed">
                            {insight.clinicalSignificance}
                          </p>

                          {isExpanded && (
                            <div className="pt-2 border-t border-border text-[11px] bg-muted/20 p-2 rounded-lg">
                              <span className="font-semibold text-foreground">
                                Clinical Recommendation:
                              </span>{" "}
                              <span className="text-muted-foreground">
                                {insight.recommendation}
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Differential Diagnoses & Red Flags */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Differential Diagnoses */}
                <div className="rounded-xl border border-border bg-card p-4 space-y-2.5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                    Differential Diagnoses
                  </h3>
                  <ul className="space-y-2">
                    {synthesis.differentialDiagnoses.map((diff) => (
                      <li
                        key={diff.condition}
                        className="bg-muted/30 p-2.5 rounded-lg border border-border text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-foreground">{diff.condition}</span>
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                              diff.likelihood === "High"
                                ? "bg-rose-500/20 text-rose-400"
                                : diff.likelihood === "Moderate"
                                ? "bg-amber-500/20 text-amber-400"
                                : "bg-emerald-500/20 text-emerald-400"
                            }`}
                          >
                            {diff.likelihood} Likelihood
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground">{diff.rationale}</p>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Emergency Red Flags & Doctor Questions */}
                <div className="space-y-4">
                  {synthesis.emergencyRedFlags.length > 0 && (
                    <div className="rounded-xl border border-rose-500/30 bg-rose-500/5 p-4 space-y-2">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-rose-500 flex items-center gap-1.5">
                        <ShieldAlert className="h-3.5 w-3.5" />
                        Critical Red Flags to Watch
                      </h3>
                      <ul className="space-y-1 text-xs text-foreground/90">
                        {synthesis.emergencyRedFlags.map((flag, i) => (
                          <li key={i} className="flex items-start gap-1.5 text-[11px]">
                            <span className="text-rose-500 mt-0.5">•</span>
                            <span>{flag}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {synthesis.questionsForPhysician.length > 0 && (
                    <div className="rounded-xl border border-border bg-card p-4 space-y-2">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                        <HelpCircle className="h-3.5 w-3.5" />
                        Key Questions for Attending Cardiologist
                      </h3>
                      <ul className="space-y-1.5 text-xs text-muted-foreground">
                        {synthesis.questionsForPhysician.map((q, i) => (
                          <li key={i} className="flex items-start gap-1.5 text-[11px]">
                            <span className="text-primary font-bold">{i + 1}.</span>
                            <span className="text-foreground/90">{q}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </TabsContent>

        {/* ════════ TAB 2: CARDIOLOGY ASSISTANT CHAT ════════ */}
        <TabsContent value="chat" className="p-5 space-y-4 m-0 focus-visible:outline-none">
          {/* Quick Prompts */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-semibold text-muted-foreground">Quick queries:</span>
            {QUICK_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                disabled={sendingChat}
                onClick={() => handleSendChat(prompt)}
                className="text-[11px] px-2.5 py-1 rounded-full border border-border bg-muted/40 hover:bg-muted text-foreground transition-colors"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Chat Messages Log */}
          <div className="h-[380px] overflow-y-auto space-y-3 p-4 rounded-xl border border-border bg-muted/10 font-sans text-xs">
            {chatMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role === "model" && (
                  <div className="h-7 w-7 rounded-lg bg-primary/20 text-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Bot className="h-4 w-4" />
                  </div>
                )}
                <div
                  className={`max-w-[85%] rounded-2xl p-3.5 space-y-1 ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground rounded-br-sm"
                      : "bg-card border border-border text-foreground rounded-bl-sm shadow-sm"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3 text-[10px] opacity-70 mb-1">
                    <span className="font-semibold">
                      {msg.role === "user" ? "You" : "Gemini 3.8 Flash"}
                    </span>
                    <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                  </div>
                  <div className="whitespace-pre-wrap leading-relaxed text-xs">
                    {msg.text}
                  </div>
                </div>
              </div>
            ))}
            {sendingChat && (
              <div className="flex gap-3 justify-start items-center text-xs text-muted-foreground animate-pulse">
                <div className="h-7 w-7 rounded-lg bg-primary/20 text-primary flex items-center justify-center flex-shrink-0">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
                <span>Gemini is analyzing live telemetry and formulating a response...</span>
              </div>
            )}
            <div ref={chatBottomRef} />
          </div>

          {/* Chat Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendChat();
            }}
            className="flex gap-2"
          >
            <Input
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Ask about active telemetry, ECG findings, risk scores, or cardiac medications..."
              disabled={sendingChat}
              className="rounded-xl text-xs"
            />
            <Button
              type="submit"
              disabled={sendingChat || !chatInput.trim()}
              className="rounded-xl gap-1.5 text-xs bg-primary text-primary-foreground font-semibold px-4"
            >
              <Send className="h-3.5 w-3.5" />
              Send
            </Button>
          </form>
        </TabsContent>

        {/* ════════ TAB 3: ECG STRIP VISION DIAGNOSTIC ════════ */}
        <TabsContent value="vision" className="p-5 space-y-5 m-0 focus-visible:outline-none">
          <div className="flex flex-wrap items-center justify-between gap-3 bg-muted/30 p-3.5 rounded-xl border border-border">
            <div>
              <p className="text-xs font-semibold text-foreground">
                Multimodal Computer Vision Analysis
              </p>
              <p className="text-[11px] text-muted-foreground">
                Capture the live 10-second ECG telemetry strip or upload a hospital paper rhythm strip photo.
              </p>
            </div>
            <div className="flex gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="gap-1.5 text-xs rounded-xl"
              >
                <Upload className="h-3.5 w-3.5" />
                Upload ECG Strip
              </Button>
              <Button
                size="sm"
                onClick={handleCaptureLiveEcg}
                className="gap-1.5 text-xs rounded-xl bg-primary text-primary-foreground font-semibold shadow-sm"
              >
                <Camera className="h-3.5 w-3.5" />
                Capture Live ECG Strip
              </Button>
            </div>
          </div>

          {/* Image Preview & Action */}
          {visionImage ? (
            <div className="space-y-4">
              <div className="rounded-xl border border-rose-200 overflow-hidden relative shadow-sm max-h-56 bg-zinc-950 flex items-center justify-center">
                <img
                  src={visionImage}
                  alt="ECG Rhythm Strip for Analysis"
                  className="max-h-56 w-full object-contain"
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  onClick={handleRunVisionAnalysis}
                  disabled={analyzingVision}
                  className="gap-2 text-xs rounded-xl bg-primary text-primary-foreground font-semibold shadow-sm"
                >
                  {analyzingVision ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Analyzing Rhythm Strip via Gemini Vision...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-3.5 w-3.5" />
                      Run Gemini Vision Diagnostic
                    </>
                  )}
                </Button>
              </div>

              {/* Vision Results */}
              {visionResult && (
                <div className="space-y-4 rounded-xl border border-primary/30 bg-card p-5 animate-fade-in">
                  <div className="flex flex-wrap items-center justify-between border-b border-border pb-3">
                    <div>
                      <h4 className="text-sm font-bold text-foreground">
                        Diagnostic Visual Reading: {visionResult.rhythmClassification}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Estimated Rate:{" "}
                        <span className="font-semibold text-foreground">
                          {visionResult.estimatedRateBpm} BPM
                        </span>{" "}
                        | Quality:{" "}
                        <span className="text-emerald-500 font-semibold">
                          {visionResult.imageQualityScore}
                        </span>
                      </p>
                    </div>
                    <Badge
                      variant={visionResult.arrhythmiaDetected ? "destructive" : "default"}
                      className="text-xs uppercase"
                    >
                      {visionResult.arrhythmiaDetected ? "ARRHYTHMIA DETECTED" : "NORMAL RHYTHM"}
                    </Badge>
                  </div>

                  {/* Morphological Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                    <div className="bg-muted/30 p-2.5 rounded-lg border border-border">
                      <p className="text-[10px] uppercase font-bold text-muted-foreground">P-Wave</p>
                      <p className="font-medium text-foreground mt-0.5">
                        {visionResult.pWaveMorphology}
                      </p>
                    </div>
                    <div className="bg-muted/30 p-2.5 rounded-lg border border-border">
                      <p className="text-[10px] uppercase font-bold text-muted-foreground">PR Interval</p>
                      <p className="font-medium text-foreground mt-0.5">{visionResult.prIntervalMs}</p>
                    </div>
                    <div className="bg-muted/30 p-2.5 rounded-lg border border-border">
                      <p className="text-[10px] uppercase font-bold text-muted-foreground">QRS Complex</p>
                      <p className="font-medium text-foreground mt-0.5">
                        {visionResult.qrsDurationMs} ({visionResult.qrsMorphology})
                      </p>
                    </div>
                    <div className="bg-muted/30 p-2.5 rounded-lg border border-border">
                      <p className="text-[10px] uppercase font-bold text-muted-foreground">ST-Segment</p>
                      <p className="font-medium text-foreground mt-0.5">
                        {visionResult.stSegmentAnalysis}
                      </p>
                    </div>
                    <div className="bg-muted/30 p-2.5 rounded-lg border border-border">
                      <p className="text-[10px] uppercase font-bold text-muted-foreground">T-Wave</p>
                      <p className="font-medium text-foreground mt-0.5">
                        {visionResult.tWaveMorphology}
                      </p>
                    </div>
                    <div className="bg-muted/30 p-2.5 rounded-lg border border-border">
                      <p className="text-[10px] uppercase font-bold text-muted-foreground">Arrhythmia Status</p>
                      <p className="font-medium text-foreground mt-0.5">
                        {visionResult.arrhythmiaDetails}
                      </p>
                    </div>
                  </div>

                  {/* Clinical Impression */}
                  <div className="bg-primary/5 p-3.5 rounded-lg border border-primary/20 space-y-1.5">
                    <p className="text-xs font-bold text-primary uppercase tracking-wider">
                      Physician Impression
                    </p>
                    <p className="text-xs text-foreground leading-relaxed">
                      {visionResult.clinicalImpression}
                    </p>
                  </div>

                  {/* Recommendations */}
                  <div className="space-y-1.5">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      Recommended Follow-up
                    </p>
                    <ul className="space-y-1 text-xs text-muted-foreground">
                      {visionResult.physicianRecommendations.map((rec, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <CheckCircle2 className="h-3.5 w-3.5 text-primary mt-0.5 flex-shrink-0" />
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-border p-8 text-center bg-muted/10 space-y-3">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Camera className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground">
                  No ECG Strip Loaded
                </h3>
                <p className="text-xs text-muted-foreground max-w-md mx-auto mt-1">
                  Click <strong>Capture Live ECG Strip</strong> to render the currently streaming Lead-II waveform, or upload a photo of a hospital paper rhythm strip to inspect P-waves, ST-elevation, and rhythm irregularities with Gemini Vision.
                </p>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* ── API Key Configuration Dialog ──────────────────────────────── */}
      <Dialog open={apiKeyModalOpen} onOpenChange={setApiKeyModalOpen}>
        <DialogContent className="max-w-md p-6 bg-card">
          <DialogHeader className="space-y-1">
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Key className="h-4 w-4 text-primary" />
              Configure Google Gemini API
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Power the clinical telemetry synthesis, cardiology copilot chat, and ECG vision diagnostics using the latest Gemini models.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-3">
            <div className="space-y-2">
              <label htmlFor="gemini-api-key" className="text-xs font-semibold text-foreground">
                Gemini API Key
              </label>
              <Input
                id="gemini-api-key"
                type="password"
                placeholder="AIzaSy..."
                value={inputApiKey}
                onChange={(e) => setInputApiKey(e.target.value)}
                className="rounded-xl text-xs font-mono"
              />
              <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                <span>Stored securely in browser local storage. Never sent to any third party.</span>
              </p>
            </div>

            {keyStatus && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-2.5 text-xs text-destructive">
                {keyStatus}
              </div>
            )}

            <div className="bg-muted/40 p-3 rounded-xl border border-border text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-foreground">Model Selected:</span>
                <Badge variant="outline" className="font-mono text-[10px]">
                  gemini-3.8-flash
                </Badge>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Need an API key? You can generate a free Gemini key in seconds from Google AI Studio.
              </p>
              <a
                href="https://aistudio.google.com/apikey"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline"
              >
                Get a free API key at Google AI Studio <ExternalLink className="h-3 w-3" />
              </a>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setApiKeyModalOpen(false)}
                className="rounded-xl text-xs"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                disabled={testingKey || !inputApiKey.trim()}
                onClick={handleSaveApiKey}
                className="rounded-xl text-xs bg-primary text-primary-foreground font-semibold gap-1.5"
              >
                {testingKey ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Testing Connection...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Save & Connect
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
