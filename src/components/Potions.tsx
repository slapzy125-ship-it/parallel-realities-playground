import { useMemo, useState } from "react";

import { useGame } from "@/context/GameContext";

const recipe = ["Glimmercap", "Sun Salt", "Rainmint"];
const options = ["Rainmint", "Glimmercap", "Ash Pepper", "Sun Salt"];

export function Potions() {
  const { completeChoice, selectLocation } = useGame();
  const [sequence, setSequence] = useState<string[]>([]);
  const [result, setResult] = useState<string | null>(null);

  const complete = sequence.length === recipe.length;
  const success = useMemo(
    () => complete && recipe.every((ingredient, index) => ingredient === sequence[index]),
    [complete, sequence],
  );

  const addIngredient = (ingredient: string) => {
    if (complete) return;
    setSequence((current) => [...current, ingredient]);
  };

  const finish = () => {
    if (!complete) return;
    if (success) {
      completeChoice(
        "potions-first-perfect-brew",
        { xp: 35, housePoints: 8, mana: 12 },
        "Your tonic flashes gold and earns a clean first mark.",
      );
      setResult("Success: the tonic flashes gold. You gain XP, mana, and house points.");
    } else {
      completeChoice(
        "potions-first-fizz",
        { xp: 12, health: -4 },
        "The mixture fizzes purple and singes your cuff, but you learn from it.",
      );
      setResult("Fizzled: the brew pops purple. You gain a little XP but lose minor health.");
    }
  };

  return (
    <section className="rounded-3xl border border-gold/30 bg-[#f2dfad] p-6 text-[#2d1b10] shadow-xl">
      <p className="text-xs uppercase tracking-[0.35em] text-[#8a4f1d]">Potions prototype</p>
      <h2 className="mt-2 font-display text-4xl">Glimmercap Tonic</h2>
      <p className="mt-4 text-sm leading-7 text-[#5c3a1c]">
        Match the ingredient sequence from the board. This scaffold establishes the minigame loop
        while the duel system receives the complete first combat implementation.
      </p>

      <div className="mt-6 rounded-2xl border border-[#8a4f1d]/25 bg-[#fff0c8]/70 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#8a4f1d]">
          Recipe order
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {recipe.map((ingredient) => (
            <span
              key={ingredient}
              className="rounded-full bg-[#2d1b10] px-3 py-1 text-sm text-[#f8e7b9]"
            >
              {ingredient}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {options.map((ingredient) => (
          <button
            key={ingredient}
            type="button"
            onClick={() => addIngredient(ingredient)}
            disabled={complete}
            className="rounded-2xl border border-[#8a4f1d]/25 bg-[#fff0c8]/70 p-4 text-left transition hover:bg-[#fff6dd] disabled:cursor-not-allowed disabled:opacity-55"
          >
            <span className="font-display text-xl">{ingredient}</span>
          </button>
        ))}
      </div>

      <div className="mt-5 rounded-2xl bg-[#2d1b10]/10 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#8a4f1d]">
          Your cauldron
        </p>
        <p className="mt-2 min-h-6 font-display text-2xl">
          {sequence.length ? sequence.join(" → ") : "Empty"}
        </p>
      </div>

      {result && (
        <p className="mt-4 rounded-2xl bg-[#fff0c8]/70 p-4 text-sm text-[#5c3a1c]">{result}</p>
      )}

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={finish}
          disabled={!complete || Boolean(result)}
          className="rounded-xl bg-[#2d1b10] px-4 py-3 text-xs font-semibold uppercase tracking-[0.25em] text-[#f8e7b9] transition hover:bg-[#4a2e18] disabled:cursor-not-allowed disabled:opacity-50"
        >
          Finish brew
        </button>
        <button
          type="button"
          onClick={() => {
            setSequence([]);
            setResult(null);
          }}
          className="rounded-xl border border-[#8a4f1d]/30 px-4 py-3 text-xs font-semibold uppercase tracking-[0.25em] text-[#2d1b10] transition hover:bg-[#fff0c8]"
        >
          Reset
        </button>
        <button
          type="button"
          onClick={() => selectLocation("potions-lab", "dialogue")}
          className="rounded-xl border border-[#8a4f1d]/30 px-4 py-3 text-xs font-semibold uppercase tracking-[0.25em] text-[#2d1b10] transition hover:bg-[#fff0c8]"
        >
          Back to lab
        </button>
      </div>
    </section>
  );
}
