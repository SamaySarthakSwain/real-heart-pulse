/**
 * High-Fidelity Voice-to-Voice Service for HEART AI Copilot
 * Features:
 * - Ultra-sweet neural voice ranking (prefers Jenny, Aria, Google Natural, Zira over robotic David/Mark)
 * - 4 Sweet Voice Personalities (Sweet & Calming, Gentle Nurse, Mindful Guide, Clinical Pro)
 * - Fine-tuned acoustic prosody (warm pitch, calm pacing, natural breath pauses)
 * - Asynchronous voice cache initialization with 'onvoiceschanged'
 * - Speech-to-text recognition with 9 supported languages
 */

export interface SupportedLanguage {
  code: string;
  speechLang: string;
  name: string;
  nativeName: string;
  flag: string;
}

export type VoicePersonality = "sweet-calm" | "gentle-nurse" | "mindful-guide" | "clinical-pro";

export interface VoiceProfileConfig {
  id: VoicePersonality;
  label: string;
  description: string;
  emoji: string;
  pitch: number;
  rate: number;
}

export const VOICE_PROFILES: VoiceProfileConfig[] = [
  {
    id: "sweet-calm",
    label: "Sweet & Calming (Recommended)",
    description: "Ultra-soothing, warm feminine intonation with relaxed pacing",
    emoji: "🌸",
    pitch: 1.05,
    rate: 0.94,
  },
  {
    id: "gentle-nurse",
    label: "Gentle Health Companion",
    description: "Empathetic, reassuring bedside cadence",
    emoji: "🕊️",
    pitch: 1.02,
    rate: 0.96,
  },
  {
    id: "mindful-guide",
    label: "Mindful Serenity",
    description: "Slow, melodic, stress-relieving acoustic tone",
    emoji: "🌿",
    pitch: 1.08,
    rate: 0.88,
  },
  {
    id: "clinical-pro",
    label: "Crisp Clinical Specialist",
    description: "Clear, articulated, modern healthcare delivery",
    emoji: "🎙️",
    pitch: 1.0,
    rate: 1.0,
  },
];

export const SUPPORTED_LANGUAGES: SupportedLanguage[] = [
  { code: "en", speechLang: "en-US", name: "English", nativeName: "English", flag: "🇺🇸" },
  { code: "hi", speechLang: "hi-IN", name: "Hindi", nativeName: "हिन्दी", flag: "🇮🇳" },
  { code: "es", speechLang: "es-ES", name: "Spanish", nativeName: "Español", flag: "🇪🇸" },
  { code: "fr", speechLang: "fr-FR", name: "French", nativeName: "Français", flag: "🇫🇷" },
  { code: "de", speechLang: "de-DE", name: "German", nativeName: "Deutsch", flag: "🇩🇪" },
  { code: "or", speechLang: "or-IN", name: "Odia", nativeName: "ଓଡ଼ିଆ", flag: "🇮🇳" },
  { code: "zh", speechLang: "zh-CN", name: "Mandarin", nativeName: "中文", flag: "🇨🇳" },
  { code: "ar", speechLang: "ar-SA", name: "Arabic", nativeName: "العربية", flag: "🇸🇦" },
  { code: "bn", speechLang: "bn-IN", name: "Bengali", nativeName: "বাংলা", flag: "🇮🇳" },
];

export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === "undefined") return false;
  return Boolean((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
}

export function isSpeechSynthesisSupported(): boolean {
  if (typeof window === "undefined") return false;
  return Boolean(window.speechSynthesis);
}

export class VoiceController {
  private recognition: any = null;
  private isListening = false;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private cachedVoices: SpeechSynthesisVoice[] = [];
  private activePersonality: VoicePersonality = "sweet-calm";

  constructor() {
    if (typeof window !== "undefined" && isSpeechSynthesisSupported()) {
      this.initVoices();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = () => this.initVoices();
      }
      const savedProfile = localStorage.getItem("HEART_VOICE_PERSONALITY");
      if (savedProfile && VOICE_PROFILES.some((p) => p.id === savedProfile)) {
        this.activePersonality = savedProfile as VoicePersonality;
      }
    }
  }

  private initVoices(): void {
    if (typeof window !== "undefined" && isSpeechSynthesisSupported()) {
      this.cachedVoices = window.speechSynthesis.getVoices();
    }
  }

  public getAvailableVoices(): SpeechSynthesisVoice[] {
    if (this.cachedVoices.length === 0 && typeof window !== "undefined" && isSpeechSynthesisSupported()) {
      this.cachedVoices = window.speechSynthesis.getVoices();
    }
    return this.cachedVoices;
  }

  public setPersonality(personality: VoicePersonality): void {
    this.activePersonality = personality;
    if (typeof window !== "undefined") {
      localStorage.setItem("HEART_VOICE_PERSONALITY", personality);
    }
  }

  public getPersonality(): VoicePersonality {
    return this.activePersonality;
  }

  /**
   * Intelligently selects the sweetest, highest-fidelity voice available
   * Specifically deprioritizes mechanical voices like "David" in favor of
   * natural neural voices (Jenny, Aria, Google Natural, Zira, etc.)
   */
  public getSweetestVoice(langCode: string): SpeechSynthesisVoice | null {
    const voices = this.getAvailableVoices();
    if (!voices || voices.length === 0) return null;

    const prefix = langCode.slice(0, 2).toLowerCase();
    const langVoices = voices.filter((v) => v.lang.toLowerCase().startsWith(prefix));
    const searchPool = langVoices.length > 0 ? langVoices : voices;

    // Sweet voice keywords ordered by acoustic pleasantness & quality
    const sweetKeywords = [
      "jenny",          // Microsoft Jenny Online (Natural) - ultra sweet & pleasant
      "aria",           // Microsoft Aria Online (Natural)
      "ana",            // Microsoft Ana Online (Natural)
      "google uk english female",
      "google us english",
      "swara",          // Hindi sweet natural
      "neerja",         // Hindi natural
      "elvira",         // Spanish natural
      "denise",         // French natural
      "natural",
      "neural",
      "online",
      "zira",           // Windows Desktop gentle female
      "samantha",       // Apple natural female
      "karen",
      "moira",
      "ava",
      "emma",
      "female",
    ];

    // Harsh mechanical voice identifiers to penalize
    const harshKeywords = ["david", "mark", "desktop", "robotic", "hazel", "george"];

    let bestVoice: SpeechSynthesisVoice | null = null;
    let highestScore = -999;

    for (const voice of searchPool) {
      const name = voice.name.toLowerCase();
      let score = 0;

      // Bonus for exact or matching language
      if (voice.lang.toLowerCase() === langCode.toLowerCase()) {
        score += 30;
      } else if (voice.lang.toLowerCase().startsWith(prefix)) {
        score += 20;
      }

      // Bonus for natural neural sweet voices
      for (let i = 0; i < sweetKeywords.length; i++) {
        if (name.includes(sweetKeywords[i])) {
          score += 100 - i * 4;
          break;
        }
      }

      // Heavy penalty for harsh robotic voices
      for (const harsh of harshKeywords) {
        if (name.includes(harsh)) {
          score -= 80;
          break;
        }
      }

      // Prefer local/high-res if available
      if (voice.default) score += 5;

      if (score > highestScore) {
        highestScore = score;
        bestVoice = voice;
      }
    }

    return bestVoice || searchPool[0] || null;
  }

  public startListening(
    langCode: string,
    onResult: (text: string, isFinal: boolean) => void,
    onError: (err: string) => void,
    onEnd: () => void
  ): boolean {
    if (!isSpeechRecognitionSupported()) {
      onError("Speech recognition is not supported in this browser. Please use Chrome or Edge.");
      return false;
    }

    try {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();
      this.recognition.lang = langCode;
      this.recognition.interimResults = true;
      this.recognition.continuous = false;
      this.recognition.maxAlternatives = 1;

      this.recognition.onstart = () => {
        this.isListening = true;
      };

      this.recognition.onresult = (event: any) => {
        let transcript = "";
        let isFinal = false;
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
          if (event.results[i].isFinal) isFinal = true;
        }
        onResult(transcript, isFinal);
      };

      this.recognition.onerror = (event: any) => {
        this.isListening = false;
        if (event.error !== "no-speech") {
          onError(`Microphone notice: ${event.error}`);
        }
      };

      this.recognition.onend = () => {
        this.isListening = false;
        onEnd();
      };

      this.recognition.start();
      return true;
    } catch (err: any) {
      onError(err?.message || "Could not access microphone.");
      return false;
    }
  }

  public stopListening(): void {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch {}
      this.isListening = false;
    }
  }

  /**
   * Speaks the given text using the selected sweet voice and prosody tuning.
   */
  public speak(
    text: string,
    langCode: string,
    onStart?: () => void,
    onEnd?: () => void,
    customPersonality?: VoicePersonality
  ): void {
    if (!isSpeechSynthesisSupported()) return;

    this.stopSpeaking();

    // Clean formatting and markdown symbols for natural human delivery
    const cleanText = text
      .replace(/[*#_`>~]/g, "")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .replace(/[-•]\s+/g, ", ")
      .replace(/\n+/g, ". ")
      .replace(/\s+/g, " ")
      .trim();

    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = langCode;

    // Apply active personality acoustics
    const profileId = customPersonality || this.activePersonality;
    const profile = VOICE_PROFILES.find((p) => p.id === profileId) || VOICE_PROFILES[0];
    utterance.pitch = profile.pitch;
    utterance.rate = profile.rate;

    const sweetVoice = this.getSweetestVoice(langCode);
    if (sweetVoice) {
      utterance.voice = sweetVoice;
    }

    utterance.onstart = () => onStart?.();
    utterance.onend = () => {
      this.currentUtterance = null;
      onEnd?.();
    };
    utterance.onerror = () => {
      this.currentUtterance = null;
      onEnd?.();
    };

    this.currentUtterance = utterance;
    window.speechSynthesis.speak(utterance);
  }

  /**
   * Preview function so the user can immediately test the sweet voice.
   */
  public previewSweetVoice(langCode: string = "en-US", onEnd?: () => void): void {
    const samplePhrases: Record<string, string> = {
      en: "Hello! I am HEART, your personal clinical companion. How is your heart feeling today?",
      hi: "नमस्ते! मैं हार्ट हूँ, आपका व्यक्तिगत स्वास्थ्य साथी। आपकी धड़कन बिल्कुल सामान्य और सुरक्षित है।",
      es: "¡Hola! Soy HEART, tu compañero clínico de confianza. ¿Cómo se siente tu corazón hoy?",
      fr: "Bonjour ! Je suis HEART, votre compagnon de santé cardiaque. Comment vous sentez-vous aujourd'hui ?",
      de: "Hallo! Ich bin HEART, Ihr persönlicher Herzgesundheitsbegleiter. Wie geht es Ihnen heute?",
      or: "ନମସ୍କାର! ମୁଁ ହାର୍ଟ, ଆପଣଙ୍କର ସ୍ୱାସ୍ଥ୍ୟ ସାଥୀ। ଆପଣଙ୍କ ହୃଦୟ କିପରି ଅଛି?",
      bn: "নমস্কার! আমি হার্ট, আপনার ব্যক্তিগত স্বাস্থ্য সহকারী। আজ আপনি কেমন অনুভব করছেন?",
      zh: "您好！我是 HEART，您的专属心脏健康助手。您今天感觉怎么样？",
      ar: "مرحباً! أنا هارت، رفيقك الصحي الشخصي. كيف تشعر اليوم؟",
    };

    const prefix = langCode.slice(0, 2).toLowerCase();
    const phrase = samplePhrases[prefix] || samplePhrases.en;

    this.speak(phrase, langCode, undefined, onEnd);
  }

  public stopSpeaking(): void {
    if (isSpeechSynthesisSupported()) {
      window.speechSynthesis.cancel();
      this.currentUtterance = null;
    }
  }
}

export const voiceController = new VoiceController();
