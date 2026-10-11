import { createFileRoute } from "@tanstack/react-router";
import { HardwareSetup } from "@/pages/HardwareSetup";

export const Route = createFileRoute("/hardware")({
  head: () => ({
    meta: [
      { title: "Hardware & Firmware — ESP32 ECG & PPG Monitor" },
      {
        name: "description",
        content:
          "ESP32 hardware wiring diagrams, pin mappings, C++ Arduino firmware sketch, serial formats, and connection wizard.",
      },
      { property: "og:title", content: "Hardware & Firmware — ESP32 ECG & PPG Monitor" },
      {
        property: "og:description",
        content: "ESP32 sensor wiring, Arduino firmware sketch, serial formats, and a step-by-step device connection wizard.",
      },
    ],
  }),
  component: HardwareSetup,
});
