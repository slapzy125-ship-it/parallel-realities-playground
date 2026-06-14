import { CharacterCreation } from "@/components/CharacterCreation";
import { CharacterSheet } from "@/components/CharacterSheet";
import { Dialogue } from "@/components/Dialogue";
import { Duel } from "@/components/Duel";
import { SchoolMap } from "@/components/Map";
import { Potions } from "@/components/Potions";
import { Spellbook } from "@/components/Spellbook";
import { HOUSES, useGame } from "@/context/GameContext";

export function MagicSchoolGame() {
  const { state } = useGame();

  return (
    <main className="min-h-screen bg-[#0d0805] text-[#f8e7b9]">
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(circle_at_top,rgba(212,168,67,0.2),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(91,55,24,0.5),transparent_35%)]" />
      <div className="relative">
        {state.view === "menu" && <MainMenu />}
        {state.view === "settings" && <Settings />}
        {state.view === "creation" && <CharacterCreation />}
        {state.view === "hub" && <Hub />}
      </div>
    </main>
  );
}

function MainMenu() {
  const { hasSave, startNewGame, continueGame, openSettings } = useGame();

  return (
    <section className="mx-auto flex min-h-screen max-w-6xl items-center px-4 py-16 sm:px-6 lg:px-8">
      <div className="grid w-full gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div>
          <p className="text-xs uppercase tracking-[0.45em] text-gold">Browser RPG Prototype</p>
          <h1 className="mt-5 font-display text-6xl leading-none text-[#f8e7b9] sm:text-7xl lg:text-8xl">
            Eldergrove
            <span className="block italic text-gold-gradient">Institute</span>
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-[#e8d8b0]/75">
            A parchment-styled magic school RPG with original houses, spells, rivals, year progression,
            branching choices, and localStorage save state.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={startNewGame}
              className="rounded-xl bg-gold px-6 py-4 text-xs font-bold uppercase tracking-[0.3em] text-background shadow-[var(--shadow-gold)] transition hover:bg-gold-bright"
            >
              New game
            </button>
            <button
              type="button"
              onClick={continueGame}
              disabled={!hasSave}
              className="rounded-xl border border-gold/35 px-6 py-4 text-xs font-bold uppercase tracking-[0.3em] text-gold transition hover:bg-gold hover:text-background disabled:cursor-not-allowed disabled:opacity-45"
            >
              Continue
            </button>
            <button
              type="button"
              onClick={openSettings}
              className="rounded-xl border border-gold/25 px-6 py-4 text-xs font-bold uppercase tracking-[0.3em] text-[#e8d8b0] transition hover:border-gold hover:text-gold"
            >
              Settings
            </button>
          </div>
        </div>

        <div className="rounded-3xl border border-gold/30 bg-[#f2dfad] p-6 text-[#2d1b10] shadow-2xl shadow-black/50">
          <p className="text-xs uppercase tracking-[0.35em] text-[#8a4f1d]">Houses</p>
          <div className="mt-5 grid gap-3">
            {HOUSES.map((house) => (
              <article key={house.id} className="rounded-2xl border border-[#8a4f1d]/20 bg-[#fff0c8]/70 p-4">
                <div className="flex items-center gap-3">
                  <span
                    className="h-4 w-4 rounded-full"
                    style={{ background: `linear-gradient(135deg, ${house.color}, ${house.accent})` }}
                  />
                  <h2 className="font-display text-2xl">{house.name}</h2>
                </div>
                <p className="mt-2 text-sm italic text-[#5c3a1c]">"{house.motto}"</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Settings() {
  const { state, updateSettings, clearSave, returnToMenu } = useGame();

  return (
    <section className="mx-auto flex min-h-screen max-w-3xl items-center px-4 py-16 sm:px-6">
      <div className="w-full rounded-3xl border border-gold/30 bg-[#f2dfad] p-6 text-[#2d1b10] shadow-2xl">
        <p className="text-xs uppercase tracking-[0.35em] text-[#8a4f1d]">Settings</p>
        <h1 className="mt-2 font-display text-5xl">Game options</h1>

        <div className="mt-8 space-y-5">
          <label className="flex items-center justify-between gap-4 rounded-2xl bg-[#fff0c8]/70 p-4">
            <span>
              <span className="block font-display text-2xl">Reduced motion</span>
              <span className="text-sm text-[#5c3a1c]">Softens transitions in future animated scenes.</span>
            </span>
            <input
              type="checkbox"
              checked={state.settings.reducedMotion}
              onChange={(event) => updateSettings({ reducedMotion: event.target.checked })}
              className="h-5 w-5 accent-[#8a4f1d]"
            />
          </label>

          <label className="block rounded-2xl bg-[#fff0c8]/70 p-4">
            <span className="font-display text-2xl">Text size</span>
            <select
              value={state.settings.textSize}
              onChange={(event) => updateSettings({ textSize: event.target.value as "normal" | "large" })}
              className="mt-3 w-full rounded-xl border border-[#8a4f1d]/30 bg-[#f8e7b9] px-4 py-3"
            >
              <option value="normal">Normal</option>
              <option value="large">Large</option>
            </select>
          </label>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={returnToMenu}
            className="rounded-xl bg-[#2d1b10] px-5 py-3 text-xs font-semibold uppercase tracking-[0.25em] text-[#f8e7b9]"
          >
            Back
          </button>
          <button
            type="button"
            onClick={clearSave}
            className="rounded-xl border border-[#8a4f1d]/35 px-5 py-3 text-xs font-semibold uppercase tracking-[0.25em] text-[#2d1b10]"
          >
            Clear save
          </button>
        </div>
      </div>
    </section>
  );
}

function Hub() {
  const { state, returnToMenu, houses } = useGame();
  const player = state.player;
  if (!player) return <MainMenu />;

  const sortedHouses = [...houses].sort((a, b) => (state.housePoints[b.id] ?? 0) - (state.housePoints[a.id] ?? 0));

  return (
    <div className={state.settings.textSize === "large" ? "text-lg" : ""}>
      <header className="border-b border-gold/20 bg-black/30 px-4 py-4 backdrop-blur sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-gold">Eldergrove Institute</p>
            <h1 className="font-display text-3xl text-[#f8e7b9]">Year {player.year}: The Lantern Stair</h1>
          </div>
          <button
            type="button"
            onClick={returnToMenu}
            className="rounded-xl border border-gold/30 px-4 py-3 text-xs font-semibold uppercase tracking-[0.25em] text-gold transition hover:bg-gold hover:text-background"
          >
            Menu
          </button>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:px-8">
        <div className="space-y-6">
          <div className="rounded-3xl border border-gold/30 bg-black/25 p-4">
            <p className="text-xs uppercase tracking-[0.35em] text-gold">Last event</p>
            <p className="mt-2 text-sm leading-6 text-[#e8d8b0]/85">{state.lastEvent}</p>
          </div>

          <SchoolMap />

          {state.activeActivity === "duel" && <Duel />}
          {state.activeActivity === "potions" && <Potions />}
          {(state.activeActivity === "dialogue" || !state.activeActivity) && <Dialogue />}
        </div>

        <div className="space-y-6">
          <CharacterSheet />
          <Spellbook />
          <section className="rounded-3xl border border-gold/30 bg-[#16110d]/90 p-5">
            <p className="text-xs uppercase tracking-[0.35em] text-gold">House Cup</p>
            <div className="mt-4 space-y-3">
              {sortedHouses.map((house, index) => (
                <div key={house.id} className="flex items-center justify-between rounded-2xl bg-black/25 p-3">
                  <div className="flex items-center gap-3">
                    <span className="font-display text-2xl text-gold">{index + 1}</span>
                    <span className="text-[#e8d8b0]">{house.name}</span>
                  </div>
                  <span className="font-display text-2xl text-[#f8e7b9]">{state.housePoints[house.id] ?? 0}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
