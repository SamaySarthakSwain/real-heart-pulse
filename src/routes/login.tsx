import { createFileRoute } from "@tanstack/react-router";
import { LoginPage } from "@/pages/LoginPage";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "HEART — Patient Login" },
      { property: "og:title", content: "HEART — Patient Login" },
      {
        name: "description",
        content: "HEART: Patient login and clinical history access.",
      },
    ],
  }),
  component: LoginPage,
});
