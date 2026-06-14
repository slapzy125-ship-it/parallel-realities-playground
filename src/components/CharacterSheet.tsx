import { HOUSES, STAT_LABELS, useGame, xpToNextLevel } from "@/context/GameContext";
import itemsData from "@/data/items.json";
import npcsData from "@/data/npcs.json";
import type { Item, NPC, Stats } from "@/types/game";

const statKeys = Object.keys(STAT_LABELS) as Array<keyof Stats>;
const items = itemsData as Item[];
const npcs = npcsData as NPC[];

export function CharacterSheet() {
  const { state, getHouse } = useGame();
  const player = state.player;
  if (!player) return null;

  const house = getHouse(player.houseId) ?? HOUSES[0];
  const xpGoal = xpToNextLevel(player.level);
  const xpPercent = Math.round((player.xp / xpGoal) * 100);

  return (
    <aside className="rounded-3xl border border-gold/30 bg-[#16110d]/90 p-5">
      <p className="text-xs uppercase tracking-[0.35em] text-gold">Character Sheet</p>
      <div className="mt-4 flex items-center gap-4">
        <div
          className="grid h-16 w-16 place-items-center rounded-2xl font-display text-3xl text-white shadow-lg"
          style={{ background: `linear-gradient(135deg, ${house.color}, ${house.accent})` }}
        >
          {player.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <h2 className="font-display text-3xl text-[#f8e7b9]">{player.name}</h2>
          <p className="text-sm text-[#e8d8b0]/70">
            Year {player.year} · Level {player.level} · {house.name}
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-3">
        <Meter label="Health" value={player.health} max={player.maxHealth} color="#ef4444" />
        <Meter label="Mana" value={player.mana} max={player.maxMana} color="#60a5fa" />
        <Meter label="XP" value={player.xp} max={xpGoal} color="#d4a843" suffix={`${xpPercent}%`} />
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3">
        {statKeys.map((key) => (
          <div key={key} className="rounded-2xl border border-gold/15 bg-black/20 p-3">
            <p className="text-[0.65rem] uppercase tracking-[0.24em] text-gold/75">{STAT_LABELS[key]}</p>
            <p className="mt-1 font-display text-3xl text-[#f8e7b9]">{player.stats[key]}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-2xl border border-gold/15 bg-black/20 p-4">
        <h3 className="text-xs uppercase tracking-[0.28em] text-gold">Inventory</h3>
        <div className="mt-3 space-y-2">
          {player.inventory.map((itemId) => {
            const item = items.find((candidate) => candidate.id === itemId);
            if (!item) return null;
            return (
              <div key={item.id} className="flex items-center gap-3 text-sm text-[#e8d8b0]/80">
                <span className="grid h-7 w-7 place-items-center rounded-full bg-gold/10 text-gold">{item.icon}</span>
                <span>{item.name}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-gold/15 bg-black/20 p-4">
        <h3 className="text-xs uppercase tracking-[0.28em] text-gold">Relationships</h3>
        <div className="mt-3 space-y-2">
          {npcs.map((npc) => (
            <div key={npc.id} className="flex items-center justify-between gap-3 text-sm">
              <span className="text-[#e8d8b0]/80">{npc.name}</span>
              <span className="font-display text-lg text-[#f8e7b9]">{state.relationships[npc.id] ?? 0}</span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}

function Meter({
  label,
  value,
  max,
  color,
  suffix,
}: {
  label: string;
  value: number;
  max: number;
  color: string;
  suffix?: string;
}) {
  const percent = Math.max(0, Math.min(100, (value / max) * 100));

  return (
    <div>
      <div className="mb-1 flex justify-between text-xs text-[#e8d8b0]/70">
        <span>{label}</span>
        <span>{suffix ?? `${Math.round(value)} / ${Math.round(max)}`}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-black/40">
        <div className="h-full rounded-full transition-all" style={{ width: `${percent}%`, background: color }} />
      </div>
    </div>
  );
}
