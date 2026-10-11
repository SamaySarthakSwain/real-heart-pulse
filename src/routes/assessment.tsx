import { createFileRoute, redirect } from "@tanstack/react-router";
import { HealthAssessmentPage } from "@/pages/HealthAssessmentPage";
import { usePatientStore } from "@/store/patientStore";

export const Route = createFileRoute("/assessment")({
  beforeLoad: () => {
    const currentPatient = usePatientStore.getState().getCurrentPatient();
    if (!currentPatient) {
      throw redirect({ to: "/login" });
    }
  },
  head: () => ({
    meta: [
      { title: "Health Assessment & Profile Wizard — Ear-to-Heart" },
      {
        name: "description",
        content:
          "Complete patient profile, medical history, and ear-wearable telemetry assessment for Ear-to-Heart Health Hub.",
      },
    ],
  }),
  component: HealthAssessmentPage,
});
