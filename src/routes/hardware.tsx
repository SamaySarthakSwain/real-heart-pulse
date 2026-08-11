import { createFileRoute } from "@tanstack/react-router";
import { HardwareSetup } from "@/pages/HardwareSetup";

export const Route = createFileRoute("/hardware")({
  head: () => ({
    meta: [
      { title: "Hardware Setup — ESP32 ECG & PPG Monitor" },
      {
        name: "description",
        content:
          "Wiring, firmware output formats and connection wizard for the ESP32 + AD8232 ECG and MAX30102 PPG monitoring rig.",
      },
      { property: "og:title", content: "Hardware Setup — ESP32 ECG & PPG Monitor" },
      {
        property: "og:description",
        content: "ESP32 wiring, serial formats and a step-by-step device connection wizard.",
      },
    ],
  }),
  component: HardwareSetup,
});