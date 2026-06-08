import { createFileRoute } from "@tanstack/react-router";
import Play from "@/pages/Play";

export const Route = createFileRoute("/play")({
  head: () => ({
    meta: [
      { title: "Play — Revenio" },
      { name: "description", content: "Enter the Revenio simulation." },
    ],
  }),
  component: Play,
});
