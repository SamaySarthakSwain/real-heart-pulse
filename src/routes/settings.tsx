import { createFileRoute } from "@tanstack/react-router";
import { SettingsPage } from "@/pages/Settings";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Transport, Baud Rate & Buffers" },
      {
        name: "description",
        content:
          "Configure USB serial baud rate, Wi-Fi WebSocket URL, graph window and ring-buffer sizes for the ESP32 monitor.",
      },
      { property: "og:title", content: "Settings — ESP32 Health Monitor" },
      {
        property: "og:description",
        content: "Transport, baud rate, buffer sizes and parser scaling for ESP32 sensor streams.",
      },
    ],
  }),
  component: SettingsPage,
});