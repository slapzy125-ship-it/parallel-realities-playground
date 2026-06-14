import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import itemsData from "@/data/items.json";
import spellsData from "@/data/spells.json";
import type {
  ChoiceEffect,
  DuelResult,
  GameSettings,
  GameState,
  House,
  Item,
  LocationId,
  Player,
  Spell,
  Stats,
} from "@/types/game";

const SAVE_KEY = "eldergrove-rpg-save-v1";
const BASE_STATS: Stats = {
  courage: 4,
  intellect: 4,
  charm: 4,
  mysticPower: 4,
};

export const STAT_LABELS: Record<keyof Stats, string> = {
  courage: "Courage",
  intellect: "Intellect",
  charm: "Charm",
  mysticPower: "Mystic Power",
};

export const HOUSES: House[] = [
  {
    id: "suncrest",
    name: "Suncrest",
    motto: "Bravery casts the longest light.",
    trait: "Daring leadership",
    color: "#b45309",
    accent: "#facc15",
    bonus: "courage",
    startingSpellId: "ember-spark",
  },
  {
    id: "moonveil",
    name: "Moonveil",
    motto: "The quiet mind opens hidden doors.",
    trait: "Patient insight",
    color: "#4338ca",
    accent: "#a5b4fc",
    bonus: "intellect",
    startingSpellId: "luminara",
  },
  {
    id: "rosewynd",
    name: "Rosewynd",
    motto: "A kind word can turn the key.",
    trait: "Magnetic empathy",
    color: "#be185d",
    accent: "#f9a8d4",
    bonus: "charm",
    startingSpellId: "wardweave",
  },
  {
    id: "ironthorn",
    name: "Ironthorn",
    motto: "Roots deep. Will deeper.",
    trait: "Stubborn power",
    color: "#166534",
    accent: "#86efac",
    bonus: "mysticPower",
    startingSpellId: "ember-spark",
  },
];

const defaultHousePoints = HOUSES.reduce<Record<string, number>>((acc, house) => {
  acc[house.id] = 0;
  return acc;
}, {});

const defaultSettings: GameSettings = {
  reducedMotion: false,
  textSize: "normal",
};

const createInitialState = (): GameState => ({
  view: "menu",
  player: null,
  activeLocationId: null,
  activeActivity: null,
  housePoints: { ...defaultHousePoints },
  relationships: {
    "mira-vale": 0,
    "rowan-cinderglass": 0,
    "selene-morcant": 0,
    "professor-orlan-quill": 0,
  },
  lastEvent: "The gates of Eldergrove Institute wait beneath a sky full of candle-stars.",
  settings: defaultSettings,
});

interface CreateCharacterInput {
  name: string;
  houseId: string;
  stats: Stats;
}

interface GameContextValue {
  state: GameState;
  houses: House[];
  spells: Spell[];
  items: Item[];
  hasSave: boolean;
  getHouse: (houseId?: string | null) => House | undefined;
  getSpell: (spellId: string) => Spell | undefined;
  getItem: (itemId: string) => Item | undefined;
  startNewGame: () => void;
  continueGame: () => void;
  openSettings: () => void;
  returnToMenu: () => void;
  createCharacter: (input: CreateCharacterInput) => void;
  selectLocation: (locationId: LocationId, activity?: GameState["activeActivity"]) => void;
  completeChoice: (choiceId: string, effect: ChoiceEffect, message: string) => void;
  completeDuel: (result: DuelResult) => void;
  restAtDormitory: () => void;
  updateSettings: (settings: Partial<GameSettings>) => void;
  clearSave: () => void;
}

const GameContext = createContext<GameContextValue | null>(null);

const spells = spellsData as Spell[];
const items = itemsData as Item[];

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const xpToNextLevel = (level: number) => 100 + (level - 1) * 50;

const withXp = (player: Player, amount = 0): Player => {
  if (amount <= 0) return player;

  let xp = player.xp + amount;
  let level = player.level;
  const stats = { ...player.stats };

  while (xp >= xpToNextLevel(level)) {
    xp -= xpToNextLevel(level);
    level += 1;
    stats.mysticPower += 1;
    stats.intellect += level % 2 === 0 ? 1 : 0;
  }

  const maxHealth = 90 + stats.courage * 5 + level * 4;
  const maxMana = 35 + stats.mysticPower * 6 + level * 3;

  return {
    ...player,
    xp,
    level,
    stats,
    maxHealth,
    maxMana,
    health: clamp(player.health + amount / 10, 1, maxHealth),
    mana: clamp(player.mana + amount / 8, 0, maxMana),
  };
};

const applyEffectToPlayer = (player: Player, effect: ChoiceEffect): Player => {
  let next = withXp(player, effect.xp);

  if (effect.reputation) {
    next = { ...next, reputation: next.reputation + effect.reputation };
  }

  if (effect.health) {
    next = { ...next, health: clamp(next.health + effect.health, 0, next.maxHealth) };
  }

  if (effect.mana) {
    next = { ...next, mana: clamp(next.mana + effect.mana, 0, next.maxMana) };
  }

  if (effect.learnSpellId && !next.learnedSpellIds.includes(effect.learnSpellId)) {
    next = { ...next, learnedSpellIds: [...next.learnedSpellIds, effect.learnSpellId] };
  }

  if (effect.itemId && !next.inventory.includes(effect.itemId)) {
    next = { ...next, inventory: [...next.inventory, effect.itemId] };
  }

  return next;
};

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<GameState>(() => createInitialState());
  const [hasSave, setHasSave] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const raw = window.localStorage.getItem(SAVE_KEY);
    setHasSave(Boolean(raw));

    if (raw) {
      try {
        const parsed = JSON.parse(raw) as GameState;
        setState({ ...createInitialState(), ...parsed, view: "menu" });
      } catch {
        window.localStorage.removeItem(SAVE_KEY);
        setHasSave(false);
      }
    }

    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated || typeof window === "undefined") return;

    if (state.player) {
      window.localStorage.setItem(SAVE_KEY, JSON.stringify(state));
      setHasSave(true);
    }
  }, [hydrated, state]);

  const getHouse = useCallback((houseId?: string | null) => HOUSES.find((house) => house.id === houseId), []);
  const getSpell = useCallback((spellId: string) => spells.find((spell) => spell.id === spellId), []);
  const getItem = useCallback((itemId: string) => items.find((item) => item.id === itemId), []);

  const startNewGame = useCallback(() => {
    setState({ ...createInitialState(), view: "creation" });
  }, []);

  const continueGame = useCallback(() => {
    setState((current) => ({
      ...current,
      view: current.player ? "hub" : "creation",
      activeLocationId: current.activeLocationId ?? "great-hall",
      activeActivity: current.activeActivity ?? "dialogue",
    }));
  }, []);

  const openSettings = useCallback(() => {
    setState((current) => ({ ...current, view: "settings" }));
  }, []);

  const returnToMenu = useCallback(() => {
    setState((current) => ({ ...current, view: "menu", activeActivity: null }));
  }, []);

  const createCharacter = useCallback(({ name, houseId, stats }: CreateCharacterInput) => {
    const house = HOUSES.find((candidate) => candidate.id === houseId) ?? HOUSES[0];
    const boostedStats = { ...BASE_STATS, ...stats };
    boostedStats[house.bonus] += 2;

    const maxHealth = 90 + boostedStats.courage * 5;
    const maxMana = 35 + boostedStats.mysticPower * 6;
    const learnedSpellIds = Array.from(new Set(["luminara", house.startingSpellId]));

    const player: Player = {
      name: name.trim(),
      houseId: house.id,
      year: 1,
      level: 1,
      xp: 0,
      reputation: 0,
      stats: boostedStats,
      health: maxHealth,
      maxHealth,
      mana: maxMana,
      maxMana,
      learnedSpellIds,
      inventory: ["ashroot-wand", "moonmilk-tonic", "brass-house-pin"],
      choices: [],
    };

    setState({
      ...createInitialState(),
      view: "hub",
      player,
      activeLocationId: "great-hall",
      activeActivity: "dialogue",
      housePoints: { ...defaultHousePoints, [house.id]: 10 },
      lastEvent: `${player.name} joins ${house.name} and earns 10 opening-night house points.`,
    });
  }, []);

  const selectLocation = useCallback(
    (locationId: LocationId, activity: GameState["activeActivity"] = "dialogue") => {
      setState((current) => ({
        ...current,
        activeLocationId: locationId,
        activeActivity: activity,
        lastEvent:
          locationId === "forbidden-grounds" && (current.player?.year ?? 1) < 2
            ? "The north gate shivers shut. Older students whisper that the grounds open properly in Year 2."
            : current.lastEvent,
      }));
    },
    [],
  );

  const completeChoice = useCallback((choiceId: string, effect: ChoiceEffect, message: string) => {
    setState((current) => {
      if (!current.player) return current;
      if (current.player.choices.includes(choiceId)) {
        return { ...current, lastEvent: "You have already shaped that thread of the story." };
      }

      const player = applyEffectToPlayer(
        { ...current.player, choices: [...current.player.choices, choiceId] },
        effect,
      );
      const housePoints = { ...current.housePoints };
      if (effect.housePoints) {
        housePoints[player.houseId] = (housePoints[player.houseId] ?? 0) + effect.housePoints;
      }

      const relationships = { ...current.relationships };
      Object.entries(effect.relationship ?? {}).forEach(([npcId, delta]) => {
        relationships[npcId] = (relationships[npcId] ?? 0) + delta;
      });

      return {
        ...current,
        player,
        housePoints,
        relationships,
        lastEvent: message,
      };
    });
  }, []);

  const completeDuel = useCallback((result: DuelResult) => {
    setState((current) => {
      if (!current.player) return current;

      const reward: ChoiceEffect = result.won
        ? {
            xp: 70,
            housePoints: 15,
            reputation: 2,
            relationship: { "rowan-cinderglass": 1 },
            itemId: "duelist-token",
            learnSpellId: current.player.year >= 2 ? "aether-lash" : undefined,
          }
        : {
            xp: 20,
            housePoints: -5,
            reputation: -1,
            health: -18,
            relationship: { "rowan-cinderglass": -1 },
          };

      const player = applyEffectToPlayer(
        {
          ...current.player,
          health: clamp(result.remainingHealth, 1, current.player.maxHealth),
        },
        reward,
      );
      const housePoints = { ...current.housePoints };
      if (reward.housePoints) {
        housePoints[player.houseId] = Math.max(0, (housePoints[player.houseId] ?? 0) + reward.housePoints);
      }

      const relationships = { ...current.relationships };
      Object.entries(reward.relationship ?? {}).forEach(([npcId, delta]) => {
        relationships[npcId] = (relationships[npcId] ?? 0) + delta;
      });

      return {
        ...current,
        player,
        housePoints,
        relationships,
        lastEvent: result.won
          ? `${result.opponentName} salutes your wand. You gain 70 XP, 15 house points, and a duelist token.`
          : `${result.opponentName} wins the exchange. You keep 20 practice XP but lose 5 house points.`,
      };
    });
  }, []);

  const restAtDormitory = useCallback(() => {
    setState((current) => {
      if (!current.player) return current;
      return {
        ...current,
        player: {
          ...current.player,
          health: current.player.maxHealth,
          mana: current.player.maxMana,
        },
        lastEvent: "A quiet night in the dormitory restores your health and mana.",
      };
    });
  }, []);

  const updateSettings = useCallback((settings: Partial<GameSettings>) => {
    setState((current) => ({ ...current, settings: { ...current.settings, ...settings } }));
  }, []);

  const clearSave = useCallback(() => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(SAVE_KEY);
    }
    setHasSave(false);
    setState(createInitialState());
  }, []);

  const value = useMemo<GameContextValue>(
    () => ({
      state,
      houses: HOUSES,
      spells,
      items,
      hasSave,
      getHouse,
      getSpell,
      getItem,
      startNewGame,
      continueGame,
      openSettings,
      returnToMenu,
      createCharacter,
      selectLocation,
      completeChoice,
      completeDuel,
      restAtDormitory,
      updateSettings,
      clearSave,
    }),
    [
      state,
      hasSave,
      getHouse,
      getSpell,
      getItem,
      startNewGame,
      continueGame,
      openSettings,
      returnToMenu,
      createCharacter,
      selectLocation,
      completeChoice,
      completeDuel,
      restAtDormitory,
      updateSettings,
      clearSave,
    ],
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGame must be used inside GameProvider");
  }
  return context;
}

export { BASE_STATS, xpToNextLevel };
