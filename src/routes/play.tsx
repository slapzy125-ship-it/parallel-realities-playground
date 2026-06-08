import { createFileRoute } from "@tanstack/react-router";
import Play from "@/pages/Play";
import { SiteNav } from "@/components/SiteNav";

export const Route = createFileRoute("/play")({
  head: () => ({
    meta: [
      { title: "Play — Revenio" },
      { name: "description", content: "Enter the Revenio simulation." },
    ],
  }),
  component: PlayPage,
});

function PlayPage() {
  return (
    <div>
      <SiteNav />
      <div style={{ paddingTop: "72px" }}>
        <Play />
      </div>
    </div>
  );
}
