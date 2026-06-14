import { useMemo, useState } from "react";

import { useGame } from "@/context/GameContext";
import type { Spell } from "@/types/game";

interface Combatant {
  health: number;
  mana: number;
  shield: number;
}

const opponent = {
  name: "Rowan Cinderglass",
  maxHealth: 96,
  maxMana: 52,
  spells: ["ember-spark", "wardweave", "luminara"],
};

const chooseOpponentSpell = (spells: Spell[], opponentState: Combatant) => {
  if (opponentState.health < 35 && opponentState.mana >= 10) {
    return spells.find((spell) => spell.effect === "shield") ?? spells[0];
  }

  const affordable = spells.filter((spell) => spell.manaCost <= opponentState.mana && spell.effect !== "focus");
  return affordable[Math.floor(Math.random() * affordable.length)] ?? spells[0];
};

export function Duel() {
  const { state, spells, completeDuel, selectLocation } = useGame();
  const player = state.player;
  const learnedSpells = useMemo(
    () => spells.filter((spell) => player?.learnedSpellIds.includes(spell.id)),
    [player?.learnedSpellIds, spells],
  );
  const opponentSpells = useMemo(
    () => spells.filter((spell) => opponent.spells.includes(spell.id)),
    [spells],
  );

  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [turns, setTurns] = useState(1);
  const [playerState, setPlayerState] = useState<Combatant>(() => ({
    health: player?.health ?? 100,
    mana: player?.mana ?? 50,
    shield: 0,
  }));
  const [opponentState, setOpponentState] = useState<Combatant>(() => ({
    health: opponent.maxHealth,
    mana: opponent.maxMana,
    shield: 0,
  }));
  const [log, setLog] = useState<string[]>([
    "Rowan bows with a grin. The arena runes brighten around your feet.",
  ]);

  if (!player) return null;

  const applySpell = (caster: "player" | "opponent", spell: Spell) => {
    if (finished) return;

    const casterState = caster === "player" ? playerState : opponentState;
    if (casterState.mana < spell.manaCost) {
      setLog((current) => [`Not enough mana for ${spell.name}.`, ...current]);
      return;
    }

    const playerAttackBonus = Math.floor(player.stats.mysticPower * 1.6 + player.stats.intellect * 0.8);
    const courageGuard = Math.floor(player.stats.courage * 0.8);

    let nextPlayer = {
      ...playerState,
      shield: Math.max(0, playerState.shield - 4),
    };
    let nextOpponent = {
      ...opponentState,
      shield: Math.max(0, opponentState.shield - 4),
    };
    const nextLog: string[] = [];

    const spendMana = () => {
      if (caster === "player") {
        nextPlayer = { ...nextPlayer, mana: Math.max(0, nextPlayer.mana - spell.manaCost) };
      } else {
        nextOpponent = { ...nextOpponent, mana: Math.max(0, nextOpponent.mana - spell.manaCost) };
      }
    };

    spendMana();

    if (spell.effect === "damage") {
      const targetShield = caster === "player" ? nextOpponent.shield : nextPlayer.shield;
      const rawDamage =
        caster === "player"
          ? spell.power + playerAttackBonus + Math.floor(Math.random() * 7)
          : spell.power + 5 + Math.floor(Math.random() * 8);
      const mitigated = Math.max(4, rawDamage - targetShield - (caster === "opponent" ? courageGuard : 0));

      if (caster === "player") {
        nextOpponent = {
          ...nextOpponent,
          health: Math.max(0, nextOpponent.health - mitigated),
          shield: Math.max(0, nextOpponent.shield - rawDamage),
        };
        nextLog.push(`You cast ${spell.name} for ${mitigated} damage.`);
      } else {
        nextPlayer = {
          ...nextPlayer,
          health: Math.max(0, nextPlayer.health - mitigated),
          shield: Math.max(0, nextPlayer.shield - rawDamage),
        };
        nextLog.push(`Rowan answers with ${spell.name} for ${mitigated} damage.`);
      }
    }

    if (spell.effect === "shield") {
      const shieldAmount = caster === "player" ? spell.power + player.stats.intellect : spell.power + 8;
      if (caster === "player") {
        nextPlayer = { ...nextPlayer, shield: nextPlayer.shield + shieldAmount };
        nextLog.push(`You weave a shield worth ${shieldAmount} protection.`);
      } else {
        nextOpponent = { ...nextOpponent, shield: nextOpponent.shield + shieldAmount };
        nextLog.push(`Rowan raises a glimmering ward.`);
      }
    }

    if (spell.effect === "heal") {
      const heal = spell.power + player.stats.charm;
      nextPlayer = { ...nextPlayer, health: Math.min(player.maxHealth, nextPlayer.health + heal) };
      nextLog.push(`Silver light restores ${heal} health.`);
    }

    if (spell.effect === "focus") {
      const focusMana = caster === "player" ? 12 + Math.floor(player.stats.intellect / 2) : 10;
      if (caster === "player") {
        nextPlayer = { ...nextPlayer, mana: Math.min(player.maxMana, nextPlayer.mana + focusMana) };
        nextLog.push(`You center yourself with ${spell.name} and recover ${focusMana} mana.`);
      } else {
        nextOpponent = { ...nextOpponent, mana: Math.min(opponent.maxMana, nextOpponent.mana + focusMana) };
        nextLog.push(`Rowan pauses to refocus.`);
      }
    }

    const playerWon = nextOpponent.health <= 0;
    const opponentWon = nextPlayer.health <= 0;

    if (!playerWon && !opponentWon && caster === "player") {
      const reply = chooseOpponentSpell(opponentSpells, nextOpponent);
      if (reply) {
        setPlayerState(nextPlayer);
        setOpponentState(nextOpponent);
        setLog((current) => [...nextLog, ...current].slice(0, 8));
        window.setTimeout(() => applyOpponentReply(reply, nextPlayer, nextOpponent, nextLog), 360);
        return;
      }
    }

    setPlayerState(nextPlayer);
    setOpponentState(nextOpponent);
    setTurns((current) => current + 1);
    setLog((current) => [...nextLog, ...current].slice(0, 8));

    if (playerWon || opponentWon) {
      finishDuel(playerWon, nextPlayer.health);
    }
  };

  const applyOpponentReply = (
    spell: Spell,
    currentPlayerState: Combatant,
    currentOpponentState: Combatant,
    previousLog: string[],
  ) => {
    const rawDamage = spell.effect === "damage" ? spell.power + 5 + Math.floor(Math.random() * 8) : 0;
    let nextPlayer = {
      ...currentPlayerState,
      shield: Math.max(0, currentPlayerState.shield - 4),
    };
    let nextOpponent = {
      ...currentOpponentState,
      mana: Math.max(0, currentOpponentState.mana - spell.manaCost),
      shield: Math.max(0, currentOpponentState.shield - 4),
    };
    const nextLog = [...previousLog];

    if (spell.effect === "damage") {
      const mitigated = Math.max(4, rawDamage - nextPlayer.shield - Math.floor(player.stats.courage * 0.8));
      nextPlayer = {
        ...nextPlayer,
        health: Math.max(0, nextPlayer.health - mitigated),
        shield: Math.max(0, nextPlayer.shield - rawDamage),
      };
      nextLog.push(`Rowan answers with ${spell.name} for ${mitigated} damage.`);
    } else if (spell.effect === "shield") {
      nextOpponent = { ...nextOpponent, shield: nextOpponent.shield + spell.power + 8 };
      nextLog.push("Rowan raises a glimmering ward.");
    } else {
      nextOpponent = { ...nextOpponent, mana: Math.min(opponent.maxMana, nextOpponent.mana + 10) };
      nextLog.push("Rowan pauses to refocus.");
    }

    setPlayerState(nextPlayer);
    setOpponentState(nextOpponent);
    setTurns((current) => current + 1);
    setLog((current) => [...nextLog, ...current].slice(0, 8));

    if (nextPlayer.health <= 0) {
      finishDuel(false, nextPlayer.health);
    }
  };

  const finishDuel = (won: boolean, remainingHealth: number) => {
    if (finished) return;
    setFinished(true);
    completeDuel({
      won,
      opponentName: opponent.name,
      turns,
      remainingHealth: Math.max(1, remainingHealth),
    });
  };

  return (
    <section className="rounded-3xl border border-gold/30 bg-[#17110d]/95 p-6 shadow-2xl shadow-black/40">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-gold">Dueling Arena</p>
          <h2 className="mt-2 font-display text-4xl text-[#f8e7b9]">Sparks Before Supper</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#e8d8b0]/75">
            A complete turn-based duel: choose spells, manage mana, absorb hits with shields, and let Rowan's
            AI choose a response after every cast.
          </p>
        </div>
        <button
          type="button"
          onClick={() => selectLocation("dueling-arena", "dialogue")}
          className="rounded-xl border border-gold/30 px-4 py-3 text-xs font-semibold uppercase tracking-[0.25em] text-gold transition hover:bg-gold hover:text-background"
        >
          Leave arena
        </button>
      </div>

      {!started ? (
        <div className="mt-8 rounded-3xl border border-gold/20 bg-black/25 p-8 text-center">
          <p className="text-sm uppercase tracking-[0.35em] text-gold">{player.name} vs {opponent.name}</p>
          <h3 className="mt-4 font-display text-5xl text-[#f8e7b9]">Wands Ready</h3>
          <button
            type="button"
            onClick={() => setStarted(true)}
            className="mt-7 rounded-xl bg-gold px-6 py-4 text-xs font-bold uppercase tracking-[0.3em] text-background transition hover:bg-gold-bright"
          >
            Begin duel
          </button>
        </div>
      ) : (
        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_0.9fr]">
          <div className="rounded-3xl border border-gold/20 bg-black/25 p-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <DuelistCard name={player.name} title="You" state={playerState} maxHealth={player.maxHealth} maxMana={player.maxMana} />
              <DuelistCard
                name={opponent.name}
                title="Rival"
                state={opponentState}
                maxHealth={opponent.maxHealth}
                maxMana={opponent.maxMana}
              />
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {learnedSpells.map((spell) => (
                <button
                  key={spell.id}
                  type="button"
                  disabled={finished || playerState.mana < spell.manaCost}
                  onClick={() => applySpell("player", spell)}
                  className="rounded-2xl border border-gold/20 bg-[#f2dfad] p-4 text-left text-[#2d1b10] transition hover:-translate-y-0.5 hover:bg-[#fff0c8] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-display text-2xl">{spell.icon} {spell.name}</p>
                      <p className="mt-1 text-sm text-[#5c3a1c]">{spell.description}</p>
                    </div>
                    <span className="rounded-full bg-[#2d1b10] px-2 py-1 text-xs text-[#f8e7b9]">{spell.manaCost}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-gold/20 bg-black/25 p-5">
            <h3 className="font-display text-3xl text-[#f8e7b9]">Combat log</h3>
            <div className="mt-4 space-y-3">
              {finished && (
                <div className="rounded-2xl border border-gold/30 bg-gold/10 p-4 text-sm text-[#f8e7b9]">
                  {opponentState.health <= 0
                    ? "Victory! The result has been saved to your house record."
                    : "Defeat. The result has been saved, and the dormitory can restore you."}
                </div>
              )}
              {log.map((entry, index) => (
                <p key={`${entry}-${index}`} className="rounded-2xl bg-[#f2dfad]/10 p-3 text-sm leading-6 text-[#e8d8b0]/80">
                  {entry}
                </p>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function DuelistCard({
  name,
  title,
  state,
  maxHealth,
  maxMana,
}: {
  name: string;
  title: string;
  state: Combatant;
  maxHealth: number;
  maxMana: number;
}) {
  return (
    <article className="rounded-2xl border border-gold/15 bg-[#f2dfad] p-4 text-[#2d1b10]">
      <p className="text-xs uppercase tracking-[0.28em] text-[#8a4f1d]">{title}</p>
      <h3 className="mt-1 font-display text-2xl">{name}</h3>
      <div className="mt-4 space-y-3">
        <Meter label="Health" value={state.health} max={maxHealth} color="#dc2626" />
        <Meter label="Mana" value={state.mana} max={maxMana} color="#2563eb" />
        <Meter label="Shield" value={state.shield} max={60} color="#ca8a04" />
      </div>
    </article>
  );
}

function Meter({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const percent = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div>
      <div className="mb-1 flex justify-between text-xs text-[#5c3a1c]">
        <span>{label}</span>
        <span>{Math.round(value)} / {Math.round(max)}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-[#2d1b10]/20">
        <div className="h-full rounded-full transition-all" style={{ width: `${percent}%`, background: color }} />
      </div>
    </div>
  );
}
