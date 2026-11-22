import { createFileRoute } from "@tanstack/react-router";
import { SettingsPage } from "@/pages/Settings";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "HEART — Settings" },
      {
        name: "description",
        content:
          "HEART: Configure USB serial baud rate, Wi-Fi WebSocket URL, graph window and ring-buffer sizes.",
      },
      { property: "og:title", content: "HEART — Settings" },
      {
        property: "og:description",
        content: "Transport, baud rate, buffer sizes and parser scaling for ESP32 sensor streams.",
      },
    ],
  }),
  component: SettingsPage,
});
