import { createFileRoute } from "@tanstack/react-router";
import { PatientProfilePage } from "@/pages/PatientProfilePage";

export const Route = createFileRoute("/patient")({
  head: () => ({
    meta: [
      { title: "Patient Records & Clinical History — Ear-to-Heart" },
      {
        name: "description",
        content: "Patient telemetry records, personal medical profile, and historical testing logs.",
      },
    ],
  }),
  component: PatientProfilePage,
});
