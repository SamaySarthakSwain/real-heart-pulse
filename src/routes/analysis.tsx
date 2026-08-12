import { createFileRoute } from "@tanstack/react-router";
import { Analysis } from "@/pages/Analysis";

export const Route = createFileRoute("/analysis")({
  head: () => ({
    meta: [
      { title: "Heart Risk Analysis — ESP32 ECG, PPG & IMU" },
      {
        name: "description",
        content:
          "Live heart disease risk estimation from real ESP32 ECG, PPG, SpO₂, LM35 temperature and BMI323 motion measurements.",
      },
      { property: "og:title", content: "Heart Risk Analysis — ESP32 ECG, PPG & IMU" },
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