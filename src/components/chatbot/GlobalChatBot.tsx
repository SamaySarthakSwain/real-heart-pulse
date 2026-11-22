import React, { useState, useEffect, useRef } from "react";
import {
  Sparkles,
  Bot,
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  FileText,
  Printer,
  Copy,
  Check,
  X,
  Minimize2,
  Globe,
  Radio,
  Activity,
  AlertCircle,
  Loader2,
  Stethoscope,
  RefreshCw,
  Music,
  Bell,
  Sliders,
  Play,
  Heart,
} from "lucide-react";
import { useSensorStore } from "@/store/sensorStore";
import {
  askChatbot,
  generatePlainLanguageReport,
  extractRealHardwareTelemetry,
  type ChatMessage,
  type HardwareTelemetrySummary,
} from "@/services/chatbot/chatbotService";
import {
  SUPPORTED_LANGUAGES,
  VOICE_PROFILES,
  voiceController,
  type VoicePersonality,
  isSpeechRecognitionSupported,
  isSpeechSynthesisSupported,
} from "@/services/chatbot/voiceService";
import { soundFx } from "@/services/audio/soundFx";
import { toast } from "sonner";

export function GlobalChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Multi-lingual state (Default English)
  const [selectedLanguage, setSelectedLanguage] = useState(SUPPORTED_LANGUAGES[0]);

  // Voice-to-voice & Personality states
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceOutputEnabled, setVoiceOutputEnabled] = useState(true);
  const [voicePersonality, setVoicePersonality] = useState<VoicePersonality>(voiceController.getPersonality());
  const [isTestingVoice, setIsTestingVoice] = useState(false);
  const [showVoiceSettings, setShowVoiceSettings] = useState(false);

  // Acoustic Sound FX state
  const [soundMuted, setSoundMuted] = useState(soundFx.getMuted());
  const [isPlayingChime, setIsPlayingChime] = useState(false);

  // Real Hardware telemetry state
  const [telemetry, setTelemetry] = useState<HardwareTelemetrySummary>(extractRealHardwareTelemetry());
  const packetsReceived = useSensorStore((s) => s.packetsReceived);
  const connectionState = useSensorStore((s) => s.connectionState);

  // Auto-scroll ref
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-ingest hardware data when new packets arrive
  useEffect(() => {
    setTelemetry(extractRealHardwareTelemetry());
  }, [packetsReceived, connectionState]);

  // Initial greeting
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: "welcome-1",
          role: "bot",
          text: `👋 **Welcome to HEART AI Copilot!**

I am your multi-lingual, voice-interactive medical telemetry assistant with sweet acoustic sound & natural neural voice.

🌸 **Acoustic & Voice Highlights**:
- **Sweet Harmonic Chime**: Tap 🎵 in the header to enjoy an ultra-satisfying celestial chime.
- **Natural Neural Voice**: Soothing, caring human prosody with 4 tailored voice personalities.
- **Zero Synthetic Data**: I read live telemetry directly from your physical **ESP32 hardware** (AD8232 ECG, MAX30102 PPG, LM35 Temp, BMI323 Motion).
- Tap 🎙️ for instant voice-to-voice conversation or generate an **Easy-to-Understand Patient Health Report**.`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Open chatbot with gentle greeting chime
  const handleOpenChat = () => {
    setIsOpen(true);
    soundFx.playGreetingChime();
  };

  // Trigger Sweet Harmonic Chime test
  const handlePlaySweetChime = () => {
    setIsPlayingChime(true);
    soundFx.playSweetChime();
    toast.success("Playing sweet harmonic chime 🌸", {
      description: "Celestial E-major 9th acoustic resonance",
      duration: 2500,
    });
    setTimeout(() => setIsPlayingChime(false), 1600);
  };

  // Preview sweet neural voice
  const handleTestSweetVoice = () => {
    setIsTestingVoice(true);
    soundFx.playSatisfyingPop();
    voiceController.previewSweetVoice(selectedLanguage.speechLang, () => {
      setIsTestingVoice(false);
    });
    toast.info("Speaking with sweet neural voice...", {
      description: `Language: ${selectedLanguage.name} • Personality: ${voicePersonality}`,
      duration: 3000,
    });
  };

  // Toggle Sound FX Mute
  const handleToggleSoundFx = () => {
    const newMuted = soundFx.toggleMuted();
    setSoundMuted(newMuted);
    if (!newMuted) {
      soundFx.playSatisfyingPop();
      toast.success("Sound effects enabled");
    } else {
      toast.info("Sound effects muted");
    }
  };

  // Handle Voice Listening Toggle
  const toggleListening = () => {
    if (isListening) {
      voiceController.stopListening();
      setIsListening(false);
      soundFx.playSatisfyingPop();
      return;
    }

    soundFx.playSatisfyingPop();
    const started = voiceController.startListening(
      selectedLanguage.speechLang,
      (transcript, isFinal) => {
        setInputValue(transcript);
        if (isFinal) {
          handleSendMessage(transcript);
        }
      },
      (error) => {
        toast.error(error);
        setIsListening(false);
      },
      () => {
        setIsListening(false);
      }
    );

    if (started) {
      setIsListening(true);
      toast.info(`Listening in ${selectedLanguage.name}... Speak now`);
    }
  };

  // Handle Sending Chat Message
  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text || isLoading) return;

    soundFx.playSatisfyingPop();
    setInputValue("");
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const botResponse = await askChatbot(text, [...messages, userMsg], selectedLanguage.name);

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: "bot",
        text: botResponse,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, botMsg]);

      // Play sweet harmonic chime when AI answers
      soundFx.playSweetChime();

      // Voice-to-voice audio output if enabled
      if (voiceOutputEnabled) {
        voiceController.speak(
          botResponse,
          selectedLanguage.speechLang,
          () => setIsSpeaking(true),
          () => setIsSpeaking(false),
          voicePersonality
        );
      }
    } catch (err: any) {
      toast.error("Failed to generate response. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Generate Easy-to-Understand Report
  const handleGenerateReport = () => {
    soundFx.playSuccessChime();
    const reportText = generatePlainLanguageReport(selectedLanguage.name);
    const reportMsg: ChatMessage = {
      id: `report-${Date.now()}`,
      role: "bot",
      text: reportText,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      isReport: true,
    };
    setMessages((prev) => [...prev, reportMsg]);

    if (voiceOutputEnabled) {
      voiceController.speak(
        "Here is your easy-to-understand heart health summary based on your real hardware readings.",
        selectedLanguage.speechLang,
        () => setIsSpeaking(true),
        () => setIsSpeaking(false),
        voicePersonality
      );
    }
  };

  // Print/Save Report
  const handlePrintReport = (reportText: string) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>HEART - Patient Health Report</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; line-height: 1.6; padding: 40px; color: #1e293b; max-width: 800px; margin: 0 auto; }
            h3, h4 { color: #0f172a; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; }
            ul { padding-left: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .brand { color: #00B496; font-size: 24px; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="brand">HEART Health Hub</div>
            <p>Plain-Language Patient Telemetry Report</p>
          </div>
          <div>${reportText.replace(/\n/g, "<br/>").replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")}</div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <>
      {/* ── 1. FLOATING CHAT TRIGGER BUTTON ─────────────────────────────────── */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2">
          {/* Quick Chime Button alongside Trigger */}
          <button
            onClick={handlePlaySweetChime}
            aria-label="Play sweet chime"
            className="group relative flex h-11 w-11 items-center justify-center rounded-full bg-white dark:bg-[#1A221C] text-teal-600 dark:text-teal-400 border border-teal-500/30 shadow-lg hover:scale-110 active:scale-95 transition-all"
            title="Play Sweet Satisfying Chime 🎵"
          >
            <Music className="h-5 w-5 stroke-[2] group-hover:rotate-12 transition-transform" />
            <span className="sr-only">Sweet Chime</span>
          </button>

          {/* Main Bot Button */}
          <button
            onClick={handleOpenChat}
            aria-label="Open HEART AI Copilot"
            className="group relative flex items-center gap-2.5 rounded-full bg-gradient-to-r from-teal-500 via-[#00B496] to-emerald-600 p-3.5 sm:px-5 sm:py-3.5 text-white shadow-xl shadow-teal-500/25 hover:shadow-2xl hover:shadow-teal-500/40 hover:scale-105 active:scale-95 transition-all"
          >
            {/* Pulsing Aura */}
            <span className="absolute -inset-1 rounded-full bg-teal-400 opacity-25 blur-sm group-hover:opacity-40 animate-pulse pointer-events-none" />

            <div className="relative flex items-center justify-center">
              <Bot className="h-6 w-6 stroke-[2.2] animate-bounce" />
            </div>

            <div className="hidden sm:flex flex-col text-left">
              <div className="flex items-center gap-1.5 leading-none">
                <span className="text-xs font-bold tracking-tight">HEART Copilot</span>
                <span
                  className={`h-2 w-2 rounded-full ${
                    telemetry.isConnected ? "bg-emerald-300 animate-ping" : "bg-white/60"
                  }`}
                />
              </div>
              <span className="text-[10px] text-white/80 font-mono mt-0.5">
                {telemetry.isConnected ? "Hardware Live" : "Sweet Voice & Telemetry"}
              </span>
            </div>
          </button>
        </div>
      )}

      {/* ── 2. FULL CHATBOT DRAWER / MODAL ─────────────────────────────────── */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="HEART AI Assistant"
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[450px] h-[650px] max-h-[88vh] rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111512] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-200"
          style={{
            boxShadow: "0 25px 60px -15px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(0, 180, 150, 0.15)",
          }}
        >
          {/* Header */}
          <header className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-[#141A16]/90 backdrop-blur-md">
            <div className="flex items-center gap-2.5">
              <div className="relative flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#00B496] to-emerald-500 text-white shadow-sm">
                <Bot className="h-5 w-5" />
                {isSpeaking && (
                  <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-teal-500" />
                  </span>
                )}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-xs font-bold text-[#142033] dark:text-white uppercase tracking-wider">
                    HEART Copilot
                  </h3>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-semibold bg-teal-500/10 text-teal-600 dark:text-teal-400">
                    Sweet Audio
                  </span>
                </div>
                <p className="text-[10px] text-[#667085] dark:text-slate-400">
                  {telemetry.isConnected ? "Reading ESP32 hardware" : "Awaiting hardware readings"}
                </p>
              </div>
            </div>

            {/* Header Controls: Sweet Chime, Voice Test, Voice Settings, Language, TTS Toggle, Close */}
            <div className="flex items-center gap-1">
              {/* Play Sweet Chime Button */}
              <button
                onClick={handlePlaySweetChime}
                className={`p-1.5 rounded-lg text-teal-600 dark:text-teal-400 hover:bg-teal-500/15 transition-all ${
                  isPlayingChime ? "scale-125 bg-teal-500/20" : ""
                }`}
                title="Play Sweet Harmonic Chime 🌸 (E Major 9th)"
              >
                <Music className="h-4 w-4" />
              </button>

              {/* Sound FX Mute/Unmute */}
              <button
                onClick={handleToggleSoundFx}
                className={`p-1.5 rounded-lg text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 transition-colors ${
                  !soundMuted ? "text-teal-600 dark:text-teal-400 bg-teal-500/10" : ""
                }`}
                title={soundMuted ? "Unmute Sound Effects" : "Mute Sound Effects"}
              >
                <Bell className={`h-4 w-4 ${soundMuted ? "opacity-40" : ""}`} />
              </button>

              {/* Voice Personality Settings Toggle */}
              <button
                onClick={() => setShowVoiceSettings(!showVoiceSettings)}
                className={`p-1.5 rounded-lg transition-colors ${
                  showVoiceSettings
                    ? "bg-teal-500/20 text-teal-600 dark:text-teal-400"
                    : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-200"
                }`}
                title="Choose Sweet Voice Personality"
              >
                <Sliders className="h-4 w-4" />
              </button>

              {/* Language Selector */}
              <div className="relative group">
                <select
                  value={selectedLanguage.code}
                  onChange={(e) => {
                    const l = SUPPORTED_LANGUAGES.find((lang) => lang.code === e.target.value);
                    if (l) setSelectedLanguage(l);
                  }}
                  className="appearance-none bg-slate-200/60 dark:bg-slate-800 text-[11px] font-semibold text-[#142033] dark:text-slate-200 rounded-lg pl-2 pr-5 py-1 focus:outline-none cursor-pointer"
                  title="Select AI Language"
                >
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <option key={lang.code} value={lang.code} className="dark:bg-slate-900">
                      {lang.flag} {lang.name}
                    </option>
                  ))}
                </select>
                <Globe className="h-3 w-3 text-slate-500 pointer-events-none absolute right-1.5 top-2" />
              </div>

              {/* Text-to-Speech Mute/Unmute */}
              <button
                onClick={() => {
                  if (isSpeaking) voiceController.stopSpeaking();
                  setVoiceOutputEnabled(!voiceOutputEnabled);
                }}
                className={`p-1.5 rounded-lg text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 transition-colors ${
                  voiceOutputEnabled ? "text-teal-600 dark:text-teal-400 bg-teal-500/10" : ""
                }`}
                title={voiceOutputEnabled ? "Voice speech enabled (click to mute)" : "Voice speech muted (click to enable)"}
              >
                {voiceOutputEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              </button>

              {/* Close Button */}
              <button
                onClick={() => {
                  voiceController.stopSpeaking();
                  voiceController.stopListening();
                  setIsOpen(false);
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </header>

          {/* Voice Personality Settings Drawer (if toggled) */}
          {showVoiceSettings && (
            <div className="bg-slate-50 dark:bg-[#161D18] p-3.5 border-b border-slate-200 dark:border-slate-800 space-y-2.5 animate-in slide-in-from-top-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#142033] dark:text-white flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-teal-500" />
                  Sweet Voice & Acoustic Settings
                </span>
                <button
                  onClick={() => setShowVoiceSettings(false)}
                  className="text-[10px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  Close
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {VOICE_PROFILES.map((profile) => (
                  <button
                    key={profile.id}
                    onClick={() => {
                      setVoicePersonality(profile.id);
                      voiceController.setPersonality(profile.id);
                      soundFx.playSatisfyingPop();
                    }}
                    className={`p-2 rounded-xl text-left border transition-all ${
                      voicePersonality === profile.id
                        ? "bg-teal-500/15 border-teal-500 text-teal-800 dark:text-teal-200 font-semibold shadow-sm"
                        : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-teal-500/40"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-[11px]">
                      <span>{profile.emoji}</span>
                      <span className="truncate">{profile.label}</span>
                    </div>
                    <p className="text-[9px] opacity-75 mt-0.5 line-clamp-1">{profile.description}</p>
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-between pt-1">
                <button
                  onClick={handleTestSweetVoice}
                  disabled={isTestingVoice}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-medium text-[11px] shadow-sm transition-all"
                >
                  <Play className="h-3 w-3 fill-current" />
                  <span>{isTestingVoice ? "Speaking..." : "Test Sweet Voice 🗣️"}</span>
                </button>

                <button
                  onClick={handlePlaySweetChime}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 text-[#142033] dark:text-slate-200 text-[11px] hover:bg-slate-300 dark:hover:bg-slate-700 transition-all font-medium"
                >
                  <Music className="h-3 w-3 text-teal-500" />
                  <span>Test Chime 🎵</span>
                </button>
              </div>
            </div>
          )}

          {/* Real Hardware Data Status Ribbon */}
          <div className="bg-slate-100/70 dark:bg-slate-900/60 px-3.5 py-1.5 border-b border-slate-200/50 dark:border-slate-800 text-[10px] flex items-center justify-between text-[#667085] dark:text-slate-400">
            <div className="flex items-center gap-1.5">
              <span
                className={`h-2 w-2 rounded-full ${
                  telemetry.isConnected ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
                }`}
              />
              <span className="font-medium text-[#142033] dark:text-slate-200">
                {telemetry.isConnected
                  ? `Hardware Live (${telemetry.packetsReceived.toLocaleString()} pkts • ${telemetry.vitals.bpm ?? "--"} BPM • ${telemetry.vitals.spo2 ?? "--"}% SpO2)`
                  : "ESP32 Disconnected (Strictly zero fake data)"}
              </span>
            </div>
            <button
              onClick={() => {
                setTelemetry(extractRealHardwareTelemetry());
                soundFx.playSatisfyingPop();
                toast.success("Synchronized with physical hardware buffers.");
              }}
              className="flex items-center gap-1 text-[10px] text-teal-600 dark:text-teal-400 hover:underline"
              title="Sync latest readings"
            >
              <RefreshCw className="h-2.5 w-2.5" />
              <span>Sync</span>
            </button>
          </div>

          {/* Messages Scroll View */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  msg.role === "user" ? "items-end" : "items-start"
                }`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-3.5 shadow-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-gradient-to-r from-teal-500 to-emerald-600 text-white rounded-br-none"
                      : "bg-slate-100/90 dark:bg-[#1A221C] text-[#142033] dark:text-slate-100 border border-slate-200/60 dark:border-slate-800 rounded-bl-none"
                  }`}
                >
                  <div className="whitespace-pre-wrap">{msg.text}</div>

                  {/* Actions on Bot Messages */}
                  {msg.role === "bot" && (
                    <div className="mt-2.5 pt-2 border-t border-slate-200/40 dark:border-slate-700/40 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                      <span className="text-[10px] opacity-70">{msg.timestamp}</span>
                      <div className="flex items-center gap-1.5">
                        {/* Listen with sweet voice */}
                        <button
                          onClick={() => {
                            voiceController.speak(
                              msg.text,
                              selectedLanguage.speechLang,
                              () => setIsSpeaking(true),
                              () => setIsSpeaking(false),
                              voicePersonality
                            );
                          }}
                          className="flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors text-[10px]"
                          title="Listen with sweet neural voice"
                        >
                          <Volume2 className="h-3 w-3 text-teal-600 dark:text-teal-400" />
                          <span>Listen</span>
                        </button>

                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(msg.text);
                            soundFx.playSatisfyingPop();
                            toast.success("Copied to clipboard");
                          }}
                          className="flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors text-[10px]"
                          title="Copy text"
                        >
                          <Copy className="h-3 w-3" />
                          <span>Copy</span>
                        </button>

                        {msg.isReport && (
                          <button
                            onClick={() => handlePrintReport(msg.text)}
                            className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-teal-500/10 text-teal-600 dark:text-teal-400 font-semibold hover:bg-teal-500/20 transition-colors text-[10px]"
                            title="Print or save as PDF"
                          >
                            <Printer className="h-3 w-3" />
                            <span>Print PDF</span>
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex items-center gap-2 text-slate-500 text-xs py-2">
                <Loader2 className="h-4 w-4 animate-spin text-teal-600" />
                <span>Reading hardware telemetry & synthesizing...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions & Easy Report Action */}
          <div className="px-3 pt-2 pb-1 border-t border-slate-100 dark:border-slate-800/60 bg-white/50 dark:bg-[#111512]/50 flex items-center gap-1.5 overflow-x-auto no-scrollbar text-[11px]">
            <button
              onClick={handleGenerateReport}
              disabled={isLoading}
              className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-500/10 text-teal-700 dark:text-teal-300 border border-teal-500/20 font-semibold hover:bg-teal-500/20 transition-all"
            >
              <FileText className="h-3.5 w-3.5 text-teal-600" />
              <span>Generate Easy Report</span>
            </button>
            <button
              onClick={() => handleSendMessage("What is my live heart rate and rhythm?")}
              disabled={isLoading}
              className="shrink-0 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition-colors"
            >
              💓 Live Heart Rate
            </button>
            <button
              onClick={() => handleSendMessage("Check my blood oxygen level")}
              disabled={isLoading}
              className="shrink-0 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition-colors"
            >
              🫁 Blood Oxygen
            </button>
            <button
              onClick={handlePlaySweetChime}
              className="shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 hover:bg-teal-500/20 transition-colors font-medium"
            >
              <Music className="h-3 w-3" />
              <span>Sweet Chime</span>
            </button>
          </div>

          {/* Voice & Text Input Section */}
          <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-[#111512]">
            {isListening && (
              <div className="mb-2 p-2 rounded-xl bg-teal-500/10 border border-teal-500/20 text-xs text-teal-700 dark:text-teal-300 flex items-center justify-between animate-pulse">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-teal-500 animate-ping" />
                  <span>Listening in {selectedLanguage.name}... Speak naturally</span>
                </div>
                <button
                  onClick={toggleListening}
                  className="text-[10px] text-teal-800 dark:text-teal-200 font-semibold underline"
                >
                  Done
                </button>
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              {/* Mic Button for Voice Interaction */}
              <button
                type="button"
                onClick={toggleListening}
                className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all ${
                  isListening
                    ? "bg-rose-500 text-white shadow-lg shadow-rose-500/30 scale-105"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400"
                }`}
                title={isListening ? "Stop listening" : "Click to speak with sweet voice"}
              >
                {isListening ? (
                  <MicOff className="h-5 w-5 animate-pulse" />
                ) : (
                  <Mic className="h-5 w-5" />
                )}
              </button>

              {/* Text Input */}
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={`Ask about heart vitals (${selectedLanguage.name})...`}
                className="flex-1 h-10 px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#161D18] text-[#142033] dark:text-slate-100 placeholder:text-slate-400 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
              />

              {/* Send Button */}
              <button
                type="submit"
                disabled={!inputValue.trim() || isLoading}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 text-white shadow-md shadow-teal-500/20 hover:scale-105 active:scale-95 disabled:opacity-40 disabled:hover:scale-100 transition-all"
                title="Send message"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
