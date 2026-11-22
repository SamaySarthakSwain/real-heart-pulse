import { createFileRoute } from "@tanstack/react-router";
import { Dashboard } from "@/pages/Dashboard";

export const Route = createFileRoute("/dashboard")({

  head: () => ({
    meta: [
      { title: "HEART — Live Dashboard" },
      { property: "og:title", content: "HEART — Live Dashboard" },
      {
        name: "description",
        content:
          "HEART: Live biomedical dashboard streaming real AD8232 ECG and MAX30102 PPG, BPM and SpO₂ data from an ESP32 over Web Serial.",
      },
    ],
  }),
  component: Dashboard,
});
