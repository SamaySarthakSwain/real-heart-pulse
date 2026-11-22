/**
 * Web Speech Voice-to-Voice Service for HEART AI Copilot
 * Provides speech-to-text (microphone input) and text-to-speech (audio response)
 * across multiple languages with zero external dependencies.
 */

export interface SupportedLanguage {
  code: string;
  speechLang: string;
  name: string;
  nativeName: string;
  flag: string;
}

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

  startListening(
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
          onError(`Microphone error: ${event.error}`);
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

  stopListening(): void {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch {}
      this.isListening = false;
    }
  }

  speak(
    text: string,
    langCode: string,
    onStart?: () => void,
    onEnd?: () => void
  ): void {
    if (!isSpeechSynthesisSupported()) return;

    this.stopSpeaking();

    // Strip markdown formatting and asterisks for smooth human-sounding speech
    const cleanText = text
      .replace(/[*#_`>~]/g, "")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .replace(/\n+/g, ". ")
      .trim();

    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = langCode;
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    // Pick best matching voice
    const voices = window.speechSynthesis.getVoices();
    const prefix = langCode.slice(0, 2).toLowerCase();
    const matchingVoice =
      voices.find((v) => v.lang.toLowerCase().startsWith(prefix)) ||
      voices.find((v) => v.lang.toLowerCase().startsWith("en")) ||
      null;

    if (matchingVoice) {
      utterance.voice = matchingVoice;
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

  stopSpeaking(): void {
    if (isSpeechSynthesisSupported()) {
      window.speechSynthesis.cancel();
      this.currentUtterance = null;
    }
  }
}

export const voiceController = new VoiceController();
