import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/diagnostics")({
  beforeLoad: () => {
    throw redirect({ to: "/hardware" });
  },
  component: () => null,
});
