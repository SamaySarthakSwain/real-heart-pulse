import { createFileRoute } from "@tanstack/react-router";
import { HardwareSetup } from "@/pages/HardwareSetup";

export const Route = createFileRoute("/hardware")({
  head: () => ({
    meta: [
      { title: "Device Hub — Hardware, Firmware & Diagnostics" },
      {
        name: "description",
        content:
          "Complete ESP32 Device Hub: hardware wiring diagrams, pin mappings, C++ Arduino firmware sketch, connection wizard, and live sensor stream diagnostics.",
      },
      { property: "og:title", content: "Device Hub — Hardware, Firmware & Diagnostics" },
      {
        property: "og:description",
        content: "Unified ESP32 Device Hub for sensor wiring, firmware sketch flashing, and live telemetry diagnostics.",
      },
    ],
  }),
  component: HardwareSetup,
});
