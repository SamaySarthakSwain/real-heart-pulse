import { createFileRoute } from "@tanstack/react-router";
import { Firmware } from "@/pages/Firmware";

export const Route = createFileRoute("/firmware")({
  head: () => ({
    meta: [
      { title: "ESP32 Firmware — ECG, PPG, LM35 & BMI323 Sketch" },
      {
        name: "description",
        content:
          "Copy-paste ESP32 Arduino firmware streaming AD8232 ECG, MAX30102 PPG/SpO₂, LM35 temperature and BMI323 IMU over serial and WiFi WebSocket.",
      },
      { property: "og:title", content: "ESP32 Firmware — ECG, PPG, LM35 & BMI323 Sketch" },
      {
        property: "og:description",
        content: "Wiring table, full Arduino sketch and a post-flash accuracy checklist.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Firmware,
});