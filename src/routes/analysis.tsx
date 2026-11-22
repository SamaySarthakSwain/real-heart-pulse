import { createFileRoute } from "@tanstack/react-router";
import { Analysis } from "@/pages/Analysis";

export const Route = createFileRoute("/analysis")({
  head: () => ({
    meta: [
      { title: "HEART — AI & Risk Analysis" },
      {
        name: "description",
        content:
          "HEART: Live heart disease risk estimation from real ESP32 ECG, PPG, SpO₂, LM35 temperature and BMI323 motion measurements.",
      },
      { property: "og:title", content: "HEART — AI & Risk Analysis" },
      {
        property: "og:description",
        content:
          "Ischemia, amyloidosis, fibrosis, arrhythmia and heart failure risk scored from real sensor features.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Analysis,
});
