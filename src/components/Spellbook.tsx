import { useGame } from "@/context/GameContext";

export function Spellbook() {
  const { state, spells } = useGame();
  const learnedIds = state.player?.learnedSpellIds ?? [];
  const knownSpells = spells.filter((spell) => learnedIds.includes(spell.id));
  const futureSpells = spells.filter((spell) => !learnedIds.includes(spell.id));

  return (
    <aside className="rounded-3xl border border-gold/30 bg-[#16110d]/90 p-5">
      <p className="text-xs uppercase tracking-[0.35em] text-gold">Spellbook</p>
      <h2 className="mt-2 font-display text-3xl text-[#f8e7b9]">Known charms</h2>

      <div className="mt-5 space-y-3">
        {knownSpells.map((spell) => (
          <article key={spell.id} className="rounded-2xl border border-gold/20 bg-black/25 p-4">
            <div className="flex items-start gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-gold/30 text-xl text-gold">
                {spell.icon}
              </span>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-display text-xl text-[#f8e7b9]">{spell.name}</h3>
                  <span className="rounded-full bg-gold/10 px-2 py-0.5 text-[0.65rem] uppercase tracking-[0.2em] text-gold">
                    {spell.manaCost} mana
                  </span>
                </div>
                <p className="mt-2 text-sm leading-6 text-[#e8d8b0]/75">{spell.description}</p>
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-6 border-t border-gold/20 pt-5">
        <h3 className="text-xs uppercase tracking-[0.3em] text-gold/80">Locked lessons</h3>
        <div className="mt-3 grid gap-2">
          {futureSpells.slice(0, 3).map((spell) => (
            <div
              key={spell.id}
              className="flex items-center justify-between gap-4 rounded-xl bg-black/20 px-3 py-2 text-sm"
            >
              <span className="text-[#e8d8b0]/70">{spell.name}</span>
              <span className="text-xs text-gold/70">Year {spell.unlockYear}</span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
