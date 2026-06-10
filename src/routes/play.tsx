import { createFileRoute } from "@tanstack/react-router";
import Play from "@/pages/Play";
import { SiteNav } from "@/components/SiteNav";

export const Route = createFileRoute("/play")({
  head: () => ({
    meta: [
      { title: "Play — Revenio" },
      { name: "description", content: "Step into the Revenio simulation. Pick one of eight AI-powered worlds and live a story shaped by every choice you make." },
      { property: "og:title", content: "Play — Revenio" },
      { property: "og:description", content: "Enter the Revenio simulation and start your journey across eight AI-powered worlds." },
      { property: "og:url", content: "https://revenio.net/play" },
    ],
    links: [
      { rel: "canonical", href: "https://revenio.net/play" },
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
