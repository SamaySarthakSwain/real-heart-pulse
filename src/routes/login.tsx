import { createFileRoute } from "@tanstack/react-router";
import { LoginPage } from "@/pages/LoginPage";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Patient Login — Ear-to-Heart Biosensor" },
      {
        name: "description",
        content: "Patient login and clinical history access for ESP32 Health Monitor.",
      },
    ],
  }),
  component: LoginPage,
});
