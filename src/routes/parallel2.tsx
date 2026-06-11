import { createFileRoute } from "@tanstack/react-router";
import ParallelLife2 from "@/pages/ParallelLife2";
import { SiteNav } from "@/components/SiteNav";

export const Route = createFileRoute("/parallel2")({
  head: () => ({
    meta: [
      { title: "Parallel Life 2.0 — Revenio" },
      {
        name: "description",
        content:
          "An interactive documentary of the life you didn't live. Pick the decision that changed everything and see how it would have rippled through every part of your existence.",
      },
      { property: "og:title", content: "Parallel Life 2.0 — Revenio" },
      {
        property: "og:description",
        content:
          "See the alternate version of your own life, written from your real profile and one different decision.",
      },
      { property: "og:url", content: "https://revenio.net/parallel2" },
    ],
    links: [
      { rel: "canonical", href: "https://revenio.net/parallel2" },
    ],
  }),
  component: ParallelPage2,
});

function ParallelPage2() {
  return (
    <div style={{ background: "#0D1117", minHeight: "100vh" }}>
      <SiteNav />
      <div style={{ paddingTop: "72px" }}>
        <ParallelLife2 />
      </div>
    </div>
  );
}
