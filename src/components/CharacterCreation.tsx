import { useMemo, useState } from "react";

import { HOUSES, STAT_LABELS, useGame } from "@/context/GameContext";
import type { Stats } from "@/types/game";

const ALLOCATION_POINTS = 8;
const MIN_STAT = 4;
const MAX_ALLOCATED_STAT = 10;

const statKeys = Object.keys(STAT_LABELS) as Array<keyof Stats>;

const createBaseStats = (): Stats => ({
  courage: MIN_STAT,
  intellect: MIN_STAT,
  charm: MIN_STAT,
  mysticPower: MIN_STAT,
});

export function CharacterCreation() {
  const { createCharacter, returnToMenu } = useGame();
  const [name, setName] = useState("");
  const [houseId, setHouseId] = useState(HOUSES[0].id);
  const [stats, setStats] = useState<Stats>(() => createBaseStats());

  const spentPoints = useMemo(
    () => statKeys.reduce((total, key) => total + Math.max(0, stats[key] - MIN_STAT), 0),
    [stats],
  );
  const remainingPoints = ALLOCATION_POINTS - spentPoints;
  const selectedHouse = HOUSES.find((house) => house.id === houseId) ?? HOUSES[0];

  const adjustStat = (key: keyof Stats, delta: number) => {
    setStats((current) => {
      const nextValue = current[key] + delta;
      if (nextValue < MIN_STAT || nextValue > MAX_ALLOCATED_STAT) return current;
      if (delta > 0 && remainingPoints <= 0) return current;
      return { ...current, [key]: nextValue };
    });
  };

  const canBegin = name.trim().length >= 2 && remainingPoints === 0;

  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <button
        type="button"
        onClick={returnToMenu}
        className="mb-6 text-xs uppercase tracking-[0.3em] text-gold/80 transition hover:text-gold-bright"
      >
        ← Main menu
      </button>

      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-3xl border border-gold/30 bg-[#2f2116]/80 p-6 shadow-2xl shadow-black/40">
          <p className="text-xs uppercase tracking-[0.4em] text-gold">Enrollment Ledger</p>
          <h1 className="mt-4 font-display text-5xl text-[#f8e7b9]">Create your student</h1>
          <p className="mt-4 text-sm leading-7 text-[#e8d8b0]/80">
            Eldergrove Institute accepts one promising new apprentice tonight. Name them, choose a house,
            and spend every starting point before the lantern stair fades.
          </p>

          <label className="mt-8 block text-sm font-medium text-[#f8e7b9]" htmlFor="student-name">
            Student name
          </label>
          <input
            id="student-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            maxLength={28}
            placeholder="Avery Ashborne"
            className="mt-2 w-full rounded-xl border border-gold/30 bg-black/30 px-4 py-3 text-[#f8e7b9] outline-none transition placeholder:text-[#c7a96b]/50 focus:border-gold"
          />

          <div className="mt-8 rounded-2xl border border-gold/20 bg-black/20 p-4">
            <div className="flex items-center justify-between gap-4">
              <h2 className="font-display text-2xl text-[#f8e7b9]">Starting stats</h2>
              <span className="rounded-full border border-gold/30 px-3 py-1 text-xs text-gold">
                {remainingPoints} points left
              </span>
            </div>
            <div className="mt-5 space-y-4">
              {statKeys.map((key) => (
                <div key={key} className="rounded-xl bg-black/20 p-3">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-medium text-[#f8e7b9]">{STAT_LABELS[key]}</p>
                      {selectedHouse.bonus === key && (
                        <p className="text-xs text-gold">+2 {selectedHouse.name} house bonus after enrollment</p>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => adjustStat(key, -1)}
                        className="grid h-8 w-8 place-items-center rounded-full border border-gold/30 text-gold transition hover:bg-gold hover:text-background"
                        aria-label={`Decrease ${STAT_LABELS[key]}`}
                      >
                        -
                      </button>
                      <span className="w-8 text-center font-display text-2xl text-[#f8e7b9]">{stats[key]}</span>
                      <button
                        type="button"
                        onClick={() => adjustStat(key, 1)}
                        className="grid h-8 w-8 place-items-center rounded-full border border-gold/30 text-gold transition hover:bg-gold hover:text-background"
                        aria-label={`Increase ${STAT_LABELS[key]}`}
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl border border-gold/30 bg-[#1b1510]/85 p-6">
            <p className="text-xs uppercase tracking-[0.4em] text-gold">Choose a house</p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {HOUSES.map((house) => (
                <button
                  key={house.id}
                  type="button"
                  onClick={() => setHouseId(house.id)}
                  className="rounded-2xl border p-5 text-left transition hover:-translate-y-1"
                  style={{
                    borderColor: houseId === house.id ? house.accent : "rgba(212,168,67,0.22)",
                    background:
                      houseId === house.id
                        ? `linear-gradient(135deg, ${house.color}55, rgba(0,0,0,0.45))`
                        : "rgba(0,0,0,0.24)",
                  }}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="h-4 w-4 rounded-full"
                      style={{ background: `linear-gradient(135deg, ${house.color}, ${house.accent})` }}
                    />
                    <h3 className="font-display text-2xl text-[#f8e7b9]">{house.name}</h3>
                  </div>
                  <p className="mt-3 text-sm italic text-[#e8d8b0]/90">"{house.motto}"</p>
                  <p className="mt-3 text-xs uppercase tracking-[0.25em] text-gold/80">{house.trait}</p>
                  <p className="mt-2 text-xs text-[#e8d8b0]/70">Bonus: {STAT_LABELS[house.bonus]}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-gold/30 bg-[#f2dfad] p-6 text-[#2d1b10] shadow-xl">
            <h2 className="font-display text-3xl">Enrollment preview</h2>
            <p className="mt-3 text-sm leading-6">
              {name.trim() || "Your student"} will enter <strong>{selectedHouse.name}</strong>, carrying an
              Ashroot Wand, a Moonmilk Tonic, and the house spell tradition into Year 1.
            </p>
            <button
              type="button"
              disabled={!canBegin}
              onClick={() => createCharacter({ name, houseId, stats })}
              className="mt-6 w-full rounded-xl bg-[#2d1b10] px-5 py-4 text-xs font-semibold uppercase tracking-[0.32em] text-[#f8e7b9] transition hover:bg-[#4a2e18] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Begin Year 1
            </button>
            {!canBegin && (
              <p className="mt-3 text-xs text-[#6b3b1e]">
                Enter a name and spend all {ALLOCATION_POINTS} stat points to begin.
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
