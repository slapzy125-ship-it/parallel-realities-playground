export type StatKey = "courage" | "intellect" | "charm" | "mysticPower";

export type GameView = "menu" | "creation" | "hub" | "settings";

export type LocationId =
  | "great-hall"
  | "library"
  | "potions-lab"
  | "dueling-arena"
  | "forbidden-grounds"
  | "dormitory";

export type ItemType = "wand" | "potion" | "artifact" | "ingredient" | "book";

export interface Stats {
  courage: number;
  intellect: number;
  charm: number;
  mysticPower: number;
}

export interface House {
  id: string;
  name: string;
  motto: string;
  trait: string;
  color: string;
  accent: string;
  bonus: StatKey;
  startingSpellId: string;
}

export interface Spell {
  id: string;
  name: string;
  icon: string;
  description: string;
  manaCost: number;
  school: "spark" | "ward" | "mind" | "wild" | "mending";
  power: number;
  effect: "damage" | "shield" | "heal" | "focus";
  unlockYear: number;
}

export interface NPC {
  id: string;
  name: string;
  role: string;
  house?: string;
  description: string;
}

export interface Quest {
  id: string;
  title: string;
  year: number;
  location: LocationId;
  description: string;
  rewards: {
    xp?: number;
    housePoints?: number;
    spellId?: string;
    itemId?: string;
  };
}

export interface Item {
  id: string;
  name: string;
  type: ItemType;
  icon: string;
  description: string;
}

export interface Player {
  name: string;
  houseId: string;
  year: number;
  level: number;
  xp: number;
  reputation: number;
  stats: Stats;
  health: number;
  maxHealth: number;
  mana: number;
  maxMana: number;
  learnedSpellIds: string[];
  inventory: string[];
  choices: string[];
}

export interface ChoiceEffect {
  xp?: number;
  reputation?: number;
  housePoints?: number;
  health?: number;
  mana?: number;
  relationship?: Record<string, number>;
  learnSpellId?: string;
  itemId?: string;
}

export interface DialogueChoice {
  id: string;
  label: string;
  description: string;
  effect: ChoiceEffect;
  once?: boolean;
}

export interface LocationScene {
  id: LocationId;
  title: string;
  subtitle: string;
  description: string;
  choices: DialogueChoice[];
}

export interface DuelResult {
  won: boolean;
  opponentName: string;
  turns: number;
  remainingHealth: number;
}

export interface GameSettings {
  reducedMotion: boolean;
  textSize: "normal" | "large";
}

export interface GameState {
  view: GameView;
  player: Player | null;
  activeLocationId: LocationId | null;
  activeActivity: "dialogue" | "duel" | "potions" | null;
  housePoints: Record<string, number>;
  relationships: Record<string, number>;
  lastEvent: string;
  settings: GameSettings;
}
