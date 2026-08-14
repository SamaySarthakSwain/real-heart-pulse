import { createFileRoute } from "@tanstack/react-router";
import { LandingPage } from "@/pages/LandingPage";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AikyaNova Labs — Real-Time Health Monitor" },
      {
        name: "description",
        content:
          "Professional ESP32 biomedical dashboard streaming real AD8232 ECG and MAX30102 PPG, BPM and SpO₂ data over Web Serial API.",
      },
      { property: "og:title", content: "AikyaNova Labs — Real-Time Health Monitor" },
      {
        property: "og:description",
        content: "Hardware-only health monitoring: real ECG, PPG, BPM and SpO₂ from an ESP32.",
      },
    ],
  }),
  component: LandingPage,
});
