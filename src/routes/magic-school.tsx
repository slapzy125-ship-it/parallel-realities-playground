import { createFileRoute } from "@tanstack/react-router";

import { MagicSchoolGame } from "@/components/MagicSchoolGame";
import { GameProvider } from "@/context/GameContext";

export const Route = createFileRoute("/magic-school")({
  head: () => ({
    meta: [
      { title: "Eldergrove Institute — Magic School RPG" },
      {
        name: "description",
        content:
          "Create a student, join an original magical house, explore Eldergrove Institute, learn spells, and duel rivals in a browser RPG.",
      },
      { property: "og:title", content: "Eldergrove Institute — Magic School RPG" },
      {
        property: "og:description",
        content: "A localStorage-powered React RPG set in an original wizarding school world.",
      },
    ],
  }),
  component: MagicSchoolRoute,
});

function MagicSchoolRoute() {
  return (
    <GameProvider>
      <MagicSchoolGame />
    </GameProvider>
  );
}
