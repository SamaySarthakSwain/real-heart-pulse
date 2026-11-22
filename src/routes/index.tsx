import { createFileRoute } from "@tanstack/react-router";
import { LandingPage } from "@/pages/LandingPage";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "HEART — Real-Time Health Monitor" },
      {
        name: "description",
        content:
          "HEART: Professional biomedical dashboard streaming real AD8232 ECG and MAX30102 PPG, BPM and SpO₂ data over Web Serial API.",
      },
      { property: "og:title", content: "HEART" },
      {
        property: "og:description",
        content: "HEART: Continuous biomedical monitoring, ECG, PPG, BPM and SpO₂ telemetry.",
      },
    ],
  }),
  component: LandingPage,
});
