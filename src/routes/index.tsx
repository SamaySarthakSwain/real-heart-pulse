import { createFileRoute } from "@tanstack/react-router";
import { Dashboard } from "@/pages/Dashboard";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Real-Time ESP32 ECG & SpO₂ Monitor" },
      {
        name: "description",
        content:
          "Live biomedical dashboard streaming real AD8232 ECG and MAX30102 PPG, BPM and SpO₂ data from an ESP32 over Web Serial.",
      },
      { property: "og:title", content: "Real-Time ESP32 ECG & SpO₂ Monitor" },
      {
        property: "og:description",
        content: "Hardware-only health monitoring: real ECG, PPG, BPM and SpO₂ from an ESP32 over USB serial.",
      },
    ],
  }),
  component: Dashboard,
});
