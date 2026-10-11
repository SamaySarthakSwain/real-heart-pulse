import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/assessment")({
  beforeLoad: () => {
    throw redirect({ to: "/patient" });
  },
  component: () => null,
});
