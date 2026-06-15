import { useGame } from "@/context/GameContext";
import type { GameState, LocationId } from "@/types/game";

interface MapLocation {
  id: LocationId;
  name: string;
  label: string;
  description: string;
  activity: GameState["activeActivity"];
  position: string;
  unlockYear: number;
}

const locations: MapLocation[] = [
  {
    id: "great-hall",
    name: "Great Hall",
    label: "Feasts and rumors",
    description: "Candlelight, house banners, and story choices.",
    activity: "dialogue",
    position: "lg:col-start-2 lg:row-start-1",
    unlockYear: 1,
  },
  {
    id: "library",
    name: "Library",
    label: "Research wing",
    description: "Learn spells through riddles and dusty field guides.",
    activity: "dialogue",
    position: "lg:col-start-1 lg:row-start-2",
    unlockYear: 1,
  },
  {
    id: "potions-lab",
    name: "Potions Lab",
    label: "Sequence practice",
    description: "A scaffolded ingredient challenge for the next expansion.",
    activity: "potions",
    position: "lg:col-start-3 lg:row-start-2",
    unlockYear: 1,
  },
  {
    id: "dueling-arena",
    name: "Dueling Arena",
    label: "Turn-based combat",
    description: "Spend mana, cast spells, and face Rowan Cinderglass.",
    activity: "duel",
    position: "lg:col-start-2 lg:row-start-3",
    unlockYear: 1,
  },
  {
    id: "forbidden-grounds",
    name: "Forbidden Grounds",
    label: "Year 2 gate",
    description: "Shadowed trees beyond the north wall.",
    activity: "dialogue",
    position: "lg:col-start-1 lg:row-start-4",
    unlockYear: 2,
  },
  {
    id: "dormitory",
    name: "Dormitory",
    label: "Rest and save",
    description: "Restore health and mana beside the common-room fire.",
    activity: "dialogue",
    position: "lg:col-start-3 lg:row-start-4",
    unlockYear: 1,
  },
];

export function SchoolMap() {
  const { state, selectLocation, getHouse } = useGame();
  const house = getHouse(state.player?.houseId);
  const activeId = state.activeLocationId;

  return (
    <section className="rounded-3xl border border-gold/30 bg-[#21160e]/90 p-5 shadow-2xl shadow-black/40">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-gold">School Map</p>
          <h2 className="mt-2 font-display text-4xl text-[#f8e7b9]">Eldergrove Grounds</h2>
        </div>
        {house && (
          <span
            className="rounded-full border px-4 py-2 text-xs uppercase tracking-[0.25em]"
            style={{ borderColor: house.accent, color: house.accent }}
          >
            {house.name}
          </span>
        )}
      </div>

      <div className="relative mt-6 overflow-hidden rounded-3xl border border-[#8a6229]/40 bg-[#ead6a0] p-5 text-[#2f2116]">
        <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(circle_at_1px_1px,#5b3718_1px,transparent_0)] [background-size:22px_22px]" />
        <div className="relative grid gap-4 lg:grid-cols-3 lg:grid-rows-4">
          {locations.map((location) => {
            const locked = (state.player?.year ?? 1) < location.unlockYear;
            const active = activeId === location.id;

            return (
              <button
                key={location.id}
                type="button"
                onClick={() => selectLocation(location.id, locked ? "dialogue" : location.activity)}
                className={`group min-h-32 rounded-2xl border bg-[#f8e7b9]/85 p-4 text-left shadow-lg transition duration-300 hover:-translate-y-1 hover:bg-[#fff0c8] ${location.position}`}
                style={{
                  borderColor: active ? (house?.accent ?? "#b7791f") : "rgba(93, 55, 24, 0.28)",
                  boxShadow: active ? `0 0 0 2px ${house?.accent ?? "#b7791f"}66` : undefined,
                }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.28em] text-[#8a4f1d]">
                      {location.label}
                    </p>
                    <h3 className="mt-2 font-display text-2xl text-[#2f2116]">{location.name}</h3>
                  </div>
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#2f2116] text-[#f8e7b9]">
                    {locked ? "!" : "✦"}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-6 text-[#5c3a1c]">{location.description}</p>
                {locked && (
                  <p className="mt-3 text-xs font-semibold text-[#8a4f1d]">
                    Unlocks in Year {location.unlockYear}
                  </p>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
