import { createFileRoute } from "@tanstack/react-router";
import { Diagnostics } from "@/pages/Diagnostics";

export const Route = createFileRoute("/diagnostics")({
  head: () => ({
    meta: [
      { title: "Diagnostics — Raw ESP32 Serial Packets" },
      {
        name: "description",
        content:
          "Raw serial console, packet statistics and pipeline health for the ESP32 ECG and PPG data stream.",
      },
      { property: "og:title", content: "Diagnostics — Raw ESP32 Serial Packets" },
      {
        property: "og:description",
        content: "Inspect raw packets, parsing results and validation errors from the ESP32.",
      },
    ],
  }),
  component: Diagnostics,
});