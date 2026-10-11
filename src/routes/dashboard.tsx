import { createFileRoute, redirect } from "@tanstack/react-router";
import { Dashboard } from "@/pages/Dashboard";
import { usePatientStore } from "@/store/patientStore";

export const Route = createFileRoute("/dashboard")({
  beforeLoad: () => {
    const currentPatient = usePatientStore.getState().getCurrentPatient();
    if (currentPatient && !currentPatient.hasCompletedAssessment) {
      throw redirect({ to: "/assessment" });
    }
  },
  head: () => ({
    meta: [
      { title: "Live Dashboard — ESP32 Health Monitor" },
      {
        name: "description",
        content:
          "Live biomedical dashboard streaming real AD8232 ECG and MAX30102 PPG, BPM and SpO₂ data from an ESP32 over Web Serial.",
      },
    ],
  }),
  component: Dashboard,
});
