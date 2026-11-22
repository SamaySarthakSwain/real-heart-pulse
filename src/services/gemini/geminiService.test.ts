import { describe, expect, it, beforeEach } from "vitest";
import {
  getGeminiApiKey,
  setGeminiApiKey,
  hasGeminiApiKey,
} from "./geminiService";

describe("Gemini API Service", () => {
  beforeEach(() => {
    const store: Record<string, string> = {};
    (globalThis as any).window = {};
    (globalThis as any).localStorage = {
      getItem: (key: string) => store[key] ?? null,
      setItem: (key: string, val: string) => {
        store[key] = val;
      },
      removeItem: (key: string) => {
        delete store[key];
      },
      clear: () => {
        for (const k of Object.keys(store)) delete store[k];
      },
    };
  });

  it("manages Gemini API key in local storage", () => {
    expect(hasGeminiApiKey()).toBe(false);
    expect(getGeminiApiKey()).toBe("");

    setGeminiApiKey("AIzaSyTestKey123");
    expect(hasGeminiApiKey()).toBe(true);
    expect(getGeminiApiKey()).toBe("AIzaSyTestKey123");

    setGeminiApiKey("");
    expect(hasGeminiApiKey()).toBe(false);
  });
});
