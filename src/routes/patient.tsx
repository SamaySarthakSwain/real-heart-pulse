import { createFileRoute } from "@tanstack/react-router";
import { PatientProfilePage } from "@/pages/PatientProfilePage";

export const Route = createFileRoute("/patient")({
  head: () => ({
    meta: [
      { title: "HEART — Patient Records & Clinical History" },
      { property: "og:title", content: "HEART — Patient Records" },
      {
        name: "description",
        content: "HEART: Patient telemetry records, personal medical profile, and historical testing logs.",
      },
    ],
  }),
  component: PatientProfilePage,
});
