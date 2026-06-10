import { createFileRoute } from "@tanstack/react-router";
import ParallelLife from "@/pages/ParallelLife";
import { SiteNav } from "@/components/SiteNav";

export const Route = createFileRoute("/parallel")({
  head: () => ({
    meta: [
      { title: "Parallel Life — Revenio" },
      {
        name: "description",
        content:
          "An interactive documentary of the life you didn't live. Pick the decision that changed everything and see how it would have rippled through every part of your existence.",
      },
      { property: "og:title", content: "Parallel Life — Revenio" },
      {
        property: "og:description",
        content:
          "See the alternate version of your own life, written from your real profile and one different decision.",
      },
    ],
  }),
  component: ParallelPage,
});

function ParallelPage() {
  return (
    <div style={{ background: "#0D1117", minHeight: "100vh" }}>
      <SiteNav />
      <div style={{ paddingTop: "72px" }}>
        <ParallelLife />
      </div>
    </div>
  );
}
