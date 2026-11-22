import type { CapacitorConfig } from "@capacitor/cli";

// In live reload mode, the app connects directly to Vite dev server over Wi-Fi
const liveUrl = process.env.CAPACITOR_LIVE_RELOAD_URL;

const config: CapacitorConfig = {
  appId: "com.aikyanova.eartoheart",
  appName: "Ear to Heart",
  webDir: "dist",
  server: {
    androidScheme: "https",
    cleartext: true,
    ...(liveUrl ? { url: liveUrl } : {}),
  },
  android: {
    allowMixedContent: true,
  },
};

export default config;
