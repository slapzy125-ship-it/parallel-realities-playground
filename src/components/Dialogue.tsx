import { useMemo } from "react";

import { useGame } from "@/context/GameContext";
import questsData from "@/data/quests.json";
import type { LocationScene, Quest } from "@/types/game";

const quests = questsData as Quest[];

const scenes: LocationScene[] = [
  {
    id: "great-hall",
    title: "The Great Hall",
    subtitle: "Lanterns drift below the vaulted ceiling.",
    description:
      "Students trade rumors about a sealed north gate while professors pretend not to listen. Your first evening can make allies or headlines.",
    choices: [
      {
        id: "hall-help-mira",
        label: "Help Mira decode a glowing seating card",
        description: "A quiet act of kindness earns trust and a little house respect.",
        effect: { xp: 25, housePoints: 6, relationship: { "mira-vale": 2 }, reputation: 1 },
        once: true,
      },
      {
        id: "hall-toast-house",
        label: "Stand and toast your new house",
        description: "Bold confidence can inspire your table, even if your voice shakes.",
        effect: { xp: 15, housePoints: 8, reputation: 1 },
        once: true,
      },
    ],
  },
  {
    id: "library",
    title: "The Whispering Library",
    subtitle: "Shelves rearrange themselves when no one blinks.",
    description:
      "Professor Quill has left an annotated field guide open to a page about defensive spellwork and moonlit corridors.",
    choices: [
      {
        id: "library-learn-wardweave",
        label: "Study the margin notes for Wardweave",
        description: "A careful reading can add a protective charm to your spellbook.",
        effect: { xp: 35, learnSpellId: "wardweave", relationship: { "professor-orlan-quill": 1 } },
        once: true,
      },
      {
        id: "library-follow-ravens",
        label: "Map the ravens' flight paths",
        description: "The pattern points toward the north wall and unsettles Selene Morcant.",
        effect: { xp: 30, reputation: 1, relationship: { "selene-morcant": 1 } },
        once: true,
      },
    ],
  },
  {
    id: "forbidden-grounds",
    title: "The North Gate",
    subtitle: "Black branches scrape the moon beyond the wall.",
    description:
      "The lock hums with old magic. First-years are not invited through, but the gate remembers every student who tries.",
    choices: [
      {
        id: "grounds-listen",
        label: "Listen to the gate instead of forcing it",
        description: "Patience reveals a three-note melody hidden in the hinges.",
        effect: { xp: 20, relationship: { "selene-morcant": 1 } },
        once: true,
      },
      {
        id: "grounds-force",
        label: "Test the lock with raw power",
        description: "A risky shove of magic leaves sparks on your sleeve.",
        effect: { xp: 15, housePoints: -3, health: -8, reputation: 1 },
        once: true,
      },
    ],
  },
  {
    id: "dormitory",
    title: "House Dormitory",
    subtitle: "A fire murmurs inside the common-room hearth.",
    description:
      "Your trunk settles at the foot of a carved bed. Rest here to restore health and mana before another outing.",
    choices: [
      {
        id: "dorm-write-home",
        label: "Write a careful letter home",
        description: "Putting the day into words steadies your thoughts.",
        effect: { xp: 10, mana: 10 },
      },
      {
        id: "dorm-share-tonic",
        label: "Share a tonic with a nervous student",
        description: "Your kindness travels quickly through the corridor.",
        effect: { reputation: 1, relationship: { "mira-vale": 1 }, housePoints: 3 },
        once: true,
      },
    ],
  },
  {
    id: "potions-lab",
    title: "The Potions Lab",
    subtitle: "Copper bowls clink while Glimmercaps flash in jars.",
    description:
      "A sequence-mixing station has been set up for later lessons. For now, the room teaches patience and preparation.",
    choices: [
      {
        id: "potions-sort-glimmercaps",
        label: "Sort the flashing Glimmercaps",
        description: "Not glamorous, but every good potion begins with clean ingredients.",
        effect: { xp: 20, housePoints: 4, itemId: "glimmercap" },
        once: true,
      },
    ],
  },
  {
    id: "dueling-arena",
    title: "The Dueling Arena",
    subtitle: "Runes flare around a polished practice floor.",
    description:
      "Rowan Cinderglass waits with a ready grin. The arena records wins, losses, and how well you recover.",
    choices: [
      {
        id: "duel-watch-rowan",
        label: "Watch Rowan's footwork before challenging them",
        description: "Preparation sharpens your next exchange.",
        effect: { xp: 15, relationship: { "rowan-cinderglass": 1 }, mana: 8 },
        once: true,
      },
    ],
  },
];

export function Dialogue() {
  const { state, completeChoice, restAtDormitory, selectLocation } = useGame();
  const player = state.player;

  const scene = useMemo(
    () => scenes.find((candidate) => candidate.id === state.activeLocationId) ?? scenes[0],
    [state.activeLocationId],
  );
  const relatedQuests = quests.filter((quest) => quest.location === scene.id && quest.year <= (player?.year ?? 1));

  if (!player) return null;

  return (
    <section className="rounded-3xl border border-gold/30 bg-[#f2dfad] p-6 text-[#2d1b10] shadow-xl">
      <p className="text-xs uppercase tracking-[0.35em] text-[#8a4f1d]">{scene.subtitle}</p>
      <h2 className="mt-2 font-display text-4xl">{scene.title}</h2>
      <p className="mt-4 text-sm leading-7 text-[#5c3a1c]">{scene.description}</p>

      {relatedQuests.length > 0 && (
        <div className="mt-5 rounded-2xl border border-[#8a4f1d]/25 bg-[#fff0c8]/60 p-4">
          <h3 className="text-xs font-semibold uppercase tracking-[0.25em] text-[#8a4f1d]">Active quest threads</h3>
          <div className="mt-3 space-y-2">
            {relatedQuests.map((quest) => (
              <div key={quest.id}>
                <p className="font-display text-xl">{quest.title}</p>
                <p className="text-sm text-[#5c3a1c]">{quest.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6 grid gap-3">
        {scene.choices.map((choice) => {
          const alreadyChosen = choice.once && player.choices.includes(choice.id);
          return (
            <button
              key={choice.id}
              type="button"
              disabled={alreadyChosen}
              onClick={() => completeChoice(choice.id, choice.effect, choice.description)}
              className="rounded-2xl border border-[#8a4f1d]/25 bg-[#fff0c8]/70 p-4 text-left transition hover:-translate-y-0.5 hover:bg-[#fff6dd] disabled:cursor-not-allowed disabled:opacity-55"
            >
              <p className="font-display text-xl">{choice.label}</p>
              <p className="mt-1 text-sm text-[#5c3a1c]">
                {alreadyChosen ? "This story choice has already been made." : choice.description}
              </p>
            </button>
          );
        })}
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        {scene.id === "dormitory" && (
          <button
            type="button"
            onClick={restAtDormitory}
            className="rounded-xl bg-[#2d1b10] px-4 py-3 text-xs font-semibold uppercase tracking-[0.25em] text-[#f8e7b9] transition hover:bg-[#4a2e18]"
          >
            Rest until morning
          </button>
        )}
        {scene.id === "dueling-arena" && (
          <button
            type="button"
            onClick={() => selectLocation("dueling-arena", "duel")}
            className="rounded-xl bg-[#2d1b10] px-4 py-3 text-xs font-semibold uppercase tracking-[0.25em] text-[#f8e7b9] transition hover:bg-[#4a2e18]"
          >
            Challenge Rowan
          </button>
        )}
        {scene.id === "potions-lab" && (
          <button
            type="button"
            onClick={() => selectLocation("potions-lab", "potions")}
            className="rounded-xl bg-[#2d1b10] px-4 py-3 text-xs font-semibold uppercase tracking-[0.25em] text-[#f8e7b9] transition hover:bg-[#4a2e18]"
          >
            Open mixing bench
          </button>
        )}
      </div>
    </section>
  );
}
