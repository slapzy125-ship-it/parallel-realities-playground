import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useRef, useCallback } from "react";
import { useServerFn } from "@tanstack/react-start";
import { simulationScene } from "@/lib/simulation.functions";

export const Route = createFileRoute("/simulation")({
  component: SimulationPage,
});

// ─── CONSTANTS ──────────────────────────────────────────────────────────────
const TRAITS = ["Ambitious", "Loyal", "Brave", "Competitive", "Intelligent", "Creative", "Confident", "Curious", "Ruthless", "Charismatic"];
const GOALS = ["Become a Legend", "Gain Power", "Build an Empire", "Become Rich", "Save the World", "Discover the Unknown"];

type World = {
  id: string;
  name: string;
  icon: string;
  tag: string;
  theme: string;
  villain: string;
  factions: string[];
};

const WORLDS: World[] = [
  { id: "arcane", name: "Arcane Academy", icon: "🔮", tag: "Magic & Sorcery", theme: "Wizarding academy of moving staircases and forbidden spells", villain: "The Hollow Mage", factions: ["House Aetheris", "House Drakemore", "House Umbra", "House Sylvara"] },
  { id: "champions", name: "Champions Legacy", icon: "⚽", tag: "Sports Career", theme: "Soccer career mode — academies, transfers, trophies", villain: "Adrian Vega", factions: ["Crimson United", "Royal Blue", "Blackstone FC", "Golden City"] },
  { id: "galactic", name: "Galactic Frontier", icon: "🚀", tag: "Sci-Fi Galaxy", theme: "Star-faring frontier of energy sabers, smugglers, and empires", villain: "Emperor Vexis", factions: ["Vanguard Alliance", "Iron Dominion", "Nova Syndicate", "Celestial Order"] },
  { id: "hero", name: "Hero Nexus", icon: "🦸", tag: "Superhero City", theme: "Modern city of secret identities and super-teams", villain: "The Null", factions: ["Titan", "Sentinel", "Nexus Institute", "Phoenix"] },
  { id: "dragonfall", name: "Dragonfall Kingdoms", icon: "🐉", tag: "Medieval Fantasy", theme: "Scheming great houses, dragons, iron thrones", villain: "King Malakar", factions: ["Emberhold", "Frostmere", "Thornvale", "Goldcrest"] },
  { id: "shadow", name: "Shadow Guild", icon: "🗡️", tag: "Assassin Order", theme: "Hooded assassins, rooftop parkour, secret brotherhoods", villain: "The Black Regent", factions: ["Night Ravens", "Phantom Circle", "Iron Blades", "Whisper Network"] },
  { id: "neon", name: "Neon Domination", icon: "🌃", tag: "Cyberpunk", theme: "Neon megacity of corps, netrunners, and cyberware", villain: "Director Kron", factions: ["Helix Industries", "NovaCore", "Synapse Systems", "Apex Dynamics"] },
  { id: "odyssey", name: "Eternal Odyssey", icon: "⚡", tag: "Modern Myth", theme: "Demigods, oracles, monsters bleeding into the modern world", villain: "The Eternal King", factions: ["Dawnseekers", "Moonwardens", "Stormforged", "Celestial Keepers"] },
];

type Act = { id: number; name: string; range: [number, number]; desc: string };
const STORY_ACTS: Act[] = [
  { id: 1, name: "The Beginning", range: [0, 4], desc: "Your story starts here." },
  { id: 2, name: "Rising Tension", range: [5, 9], desc: "The world reacts to you." },
  { id: 3, name: "The Crisis", range: [10, 14], desc: "Everything is at stake." },
  { id: 4, name: "Confrontation", range: [15, 19], desc: "Face your greatest challenge." },
  { id: 5, name: "The Legend", range: [20, 24], desc: "Your legacy is decided." },
];

const getCurrentAct = (progress: number) =>
  STORY_ACTS.find(a => progress >= a.range[0] && progress <= a.range[1]) ?? STORY_ACTS[4];

// ─── TYPES ──────────────────────────────────────────────────────────────────
type Relationship = { name: string; val: number; dir: "friend" | "rival" | "neutral" };
type Quest = { name: string; done: boolean };
type Choice = { id: string; text: string; type: string; risk: string; hint: string };
type Scene = {
  sceneTitle: string;
  sceneText: string;
  choices: Choice[];
  statChanges?: Record<string, number>;
  xpGained?: number;
  reputationChange?: number;
  relationshipChanges?: { name: string; change: number; dir: "friend" | "rival" | "neutral" }[];
  inventoryUnlocks?: string[];
  questUpdates?: { name: string; done?: boolean }[];
  newQuests?: string[];
  newAchievements?: string[];
  newsUpdates?: string[];
  worldStateUpdates?: Record<string, unknown>;
  isFinalScene?: boolean;
  legacyTitle?: string;
  legacyEnding?: string;
};

type PlayerState = {
  name: string;
  age: number;
  traits: string[];
  goal: string;
  level: number;
  xp: number;
  reputation: number;
  skills: Record<string, number>;
  inventory: string[];
  relationships: Relationship[];
  quests: Quest[];
  achievements: string[];
  majorDecisions: string[];
  storyProgress: number;
};

const xpForLevel = (lvl: number) => Math.floor(100 * Math.pow(1.5, lvl - 1));

const emptyPlayer = (): PlayerState => ({
  name: "", age: 18, traits: [], goal: "",
  level: 1, xp: 0, reputation: 0,
  skills: { Courage: 5, Intellect: 5, Charisma: 5, Cunning: 5 },
  inventory: [], relationships: [], quests: [],
  achievements: [], majorDecisions: [], storyProgress: 0,
});

// ─── SYSTEM PROMPT ──────────────────────────────────────────────────────────
const buildSystemPrompt = (player: PlayerState, world: World): string => {
  const act = getCurrentAct(player.storyProgress);
  const sceneInAct = player.storyProgress - act.range[0] + 1;
  const totalInAct = act.range[1] - act.range[0] + 1;

  return `You are the game master for REVENIO, a linear alternate-life simulation game.

WORLD: ${world.name}
THEME: ${world.theme}
VILLAIN: ${world.villain}
FACTIONS: ${world.factions.join(", ")}

PLAYER:
- Name: ${player.name}, Age: ${player.age}
- Traits: ${player.traits.join(", ")}
- Goal: ${player.goal}
- Level: ${player.level}
- Stats: ${JSON.stringify(player.skills)}
- Relationships: ${JSON.stringify(player.relationships.map(r => ({ name: r.name, val: r.val, dir: r.dir })))}
- Inventory: ${player.inventory.join(", ") || "none"}
- Active Quests: ${JSON.stringify(player.quests.filter(q => !q.done).map(q => q.name))}
- Major Decisions: ${player.majorDecisions.slice(-5).join(" | ") || "none yet"}

CURRENT NARRATIVE POSITION:
- Act: ${act.id} of 5 — "${act.name}"
- Scene: ${sceneInAct} of ${totalInAct} in this act
- Overall Progress: ${player.storyProgress} of 24

NARRATIVE RULES BY ACT:
- Act 1 (0-4): Establish the world. Introduce key allies and rivals. Give the player early wins. Hint at the villain. No major danger yet.
- Act 2 (5-9): Raise the stakes. A rival challenges the player directly. The villain's influence grows. Force a hard loyalty or betrayal choice.
- Act 3 (10-14): The crisis hits. Something the player built is threatened. A major loss or setback occurs. An ally may turn or be taken. The villain makes a move.
- Act 4 (15-19): Direct confrontation begins. The player must use everything they have built. Reference all major past decisions. The final battle approaches.
- Act 5 (20-24): The climax and resolution. Scene 24 must be the final confrontation with ${world.villain}. The ending reflects all of the player's choices.

CONTINUITY RULES:
- Every scene must reference at least one past decision the player made.
- Characters introduced earlier must reappear as the story progresses.
- Stats must matter: low Courage → hesitate; high Courage → bold action.
- The villain must appear or be referenced every act, and appear in person in Acts 4 and 5.
- Reward loyalty when chosen; test ambition when chosen.

SCENE RULES:
- Scene text: 60-80 words. Cinematic, immediate, present tense.
- Exactly 4 choices every scene (the 4th must be type "custom": "Write your own path").
- Choices must feel meaningfully different.
- At least 2 stat changes per scene.
- XP gained: 10-25 per scene.
- Scene 24 is the FINAL scene: set isFinalScene=true, choices=[], and fill legacyTitle + legacyEnding (a resolution paragraph).

YOU MUST RESPOND WITH ONLY THIS JSON. NO MARKDOWN. NO BACKTICKS. NO EXPLANATION:
{
  "sceneTitle": "Title here",
  "sceneText": "Scene text here. 60-80 words. Present tense.",
  "choices": [
    {"id":"A","text":"Choice text","type":"bold","risk":"Low","hint":"Outcome hint"},
    {"id":"B","text":"Choice text","type":"strategic","risk":"Medium","hint":"Outcome hint"},
    {"id":"C","text":"Choice text","type":"loyal","risk":"High","hint":"Outcome hint"},
    {"id":"D","text":"Write your own path","type":"custom","risk":"Variable","hint":"Anything goes"}
  ],
  "statChanges": {"StatName": 5, "StatName2": -2},
  "xpGained": 15,
  "reputationChange": 3,
  "relationshipChanges": [{"name":"Character Name","change":10,"dir":"friend"}],
  "inventoryUnlocks": [],
  "questUpdates": [],
  "newQuests": [],
  "newAchievements": [],
  "newsUpdates": ["One in-world headline reflecting story events"],
  "worldStateUpdates": {},
  "isFinalScene": false,
  "legacyTitle": "",
  "legacyEnding": ""
}`;
};

const getOpeningPrompt = (player: PlayerState, world: World): string => {
  const openers: Record<string, string> = {
    arcane: `${player.name} receives their acceptance letter to Arcane Academy. It is their first day. The Great Hall is filled with students waiting for the Sorting Ceremony. Create the opening scene. Introduce Prof. Aldric warmly and Kira Voss as an immediate rival. End with the Sorting choice.`,
    champions: `${player.name} arrives at their first trial match for a youth academy. The coach is watching. Rival player Luca Moretti is on the opposite team, already warming up and eyeing them with contempt. Create the opening scene. End with a choice about how to play.`,
    galactic: `${player.name} is handed the controls of a small scout ship for the first time. Commander Lyra is in the co-pilot seat. A distress signal appears on the radar from an unknown vessel. Admiral Kross's warship is also responding. Create the opening scene.`,
    hero: `${player.name} reports to Hero HQ for their first assignment as a junior hero. Director Crane briefs them on a low-level incident downtown. Shadow Wolf, a rival hero, is already at the scene showing off. Create the opening scene.`,
    dragonfall: `${player.name} enters the tournament arena to prove their worth as a leader. Lord Eryn watches from the stands with pride. Lord Kael's champion stands across the field, sneering. A dragon circles overhead. Create the opening scene.`,
    shadow: `${player.name} receives their first contract from Handler Zero in a dimly lit safe house. The job sounds simple. But The Fox, a rival operative, was also offered the same contract. Create the opening scene.`,
    neon: `${player.name} sits in front of three screens preparing their first hack. Sable is on comms providing support. Director Kron's security system is the target. Failure means exposure. Create the opening scene.`,
    odyssey: `${player.name} stands before the Oracle Temple to receive their mythic title. Sage Pyrene speaks in riddles. General Vorn's soldiers block the temple gates and demand tribute. Create the opening scene.`,
  };
  return openers[world.id] ?? `${player.name} enters ${world.name} for the first time. Create a dramatic opening scene establishing the world and ending with a critical first choice.`;
};

// ─── STYLES ─────────────────────────────────────────────────────────────────
const CSS = `
:root {
  --bg: #07070a; --surface: #11121a; --surface2: #1a1c28; --border: #2a2d3d;
  --text: #e8e6df; --muted: #8b8a85;
  --gold: #d4af37; --gold2: #f4d878; --gold3: #8b7320;
}
* { box-sizing: border-box; }
body { margin: 0; background: var(--bg); color: var(--text); font-family: 'Rajdhani', system-ui, sans-serif; }
.rv-root { min-height: 100vh; background: radial-gradient(circle at 50% 0%, #1a1810 0%, #07070a 60%); color: var(--text); font-family: 'Rajdhani', system-ui, sans-serif; }
.rv-shell { max-width: 1400px; margin: 0 auto; padding: 20px; }

/* TOP BAR */
.topbar { position: sticky; top: 0; z-index: 10; background: rgba(7,7,10,0.95); backdrop-filter: blur(10px); border-bottom: 1px solid var(--gold3); padding: 12px 20px; display: flex; justify-content: space-between; align-items: center; gap: 16px; flex-wrap: wrap; }
.tb-brand { font-family: 'Cinzel', serif; font-size: 18px; font-weight: 700; color: var(--gold2); letter-spacing: 3px; }
.tb-stats { display: flex; gap: 16px; align-items: center; font-family: 'Orbitron', monospace; font-size: 11px; color: var(--muted); }
.tb-stats b { color: var(--gold2); margin-left: 4px; }

/* SPLASH */
.splash { min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 24px; padding: 40px 20px; text-align: center; }
.splash-logo { font-family: 'Cinzel', serif; font-size: clamp(48px, 10vw, 96px); font-weight: 900; color: var(--gold2); letter-spacing: 8px; text-shadow: 0 0 40px rgba(212,175,55,0.4); }
.splash-tag { color: var(--muted); font-size: 14px; letter-spacing: 6px; text-transform: uppercase; }

/* BUTTONS */
.btn-gold { background: linear-gradient(135deg, var(--gold), var(--gold2)); color: #0a0a0a; border: none; padding: 14px 32px; font-family: 'Cinzel', serif; font-weight: 700; letter-spacing: 3px; font-size: 13px; cursor: pointer; clip-path: polygon(12px 0, 100% 0, calc(100% - 12px) 100%, 0 100%); transition: transform 0.2s; }
.btn-gold:hover { transform: translateY(-2px); }
.btn-gold:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-ghost { background: transparent; color: var(--gold2); border: 1px solid var(--gold3); padding: 12px 28px; font-family: 'Cinzel', serif; font-weight: 700; letter-spacing: 2px; font-size: 12px; cursor: pointer; }
.btn-ghost:hover { background: rgba(212,175,55,0.1); }

/* CREATION */
.create-wrap { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
.create-step { color: var(--gold); font-size: 10px; letter-spacing: 4px; margin-bottom: 8px; }
.create-title { font-family: 'Cinzel', serif; font-size: 28px; color: var(--gold2); margin-bottom: 24px; letter-spacing: 2px; }
.create-input { width: 100%; background: var(--surface); border: 1px solid var(--border); color: var(--text); padding: 14px 16px; font-family: 'Rajdhani', sans-serif; font-size: 16px; margin-bottom: 12px; }
.create-input:focus { outline: none; border-color: var(--gold); }
.chip-grid { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 16px; }
.chip { background: var(--surface); border: 1px solid var(--border); color: var(--text); padding: 8px 14px; font-size: 13px; cursor: pointer; letter-spacing: 1px; }
.chip.on { background: var(--gold3); border-color: var(--gold); color: var(--gold2); }
.chip:hover { border-color: var(--gold); }

/* WORLD SELECT */
.world-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 16px; max-width: 1100px; margin: 0 auto; padding: 20px; }
.world-card { background: var(--surface); border: 1px solid var(--border); padding: 20px; cursor: pointer; transition: all 0.2s; }
.world-card:hover { border-color: var(--gold); transform: translateY(-4px); }
.world-icon { font-size: 36px; margin-bottom: 8px; }
.world-name { font-family: 'Cinzel', serif; font-size: 16px; color: var(--gold2); letter-spacing: 1px; margin-bottom: 4px; }
.world-tag { color: var(--muted); font-size: 11px; letter-spacing: 2px; margin-bottom: 8px; }
.world-theme { color: var(--text); font-size: 13px; line-height: 1.5; opacity: 0.8; }

/* GAME LAYOUT */
.game-grid { display: grid; grid-template-columns: 260px 1fr 280px; gap: 16px; padding: 16px 0; }
@media (max-width: 1024px) { .game-grid { grid-template-columns: 1fr; } .sidebar-toggle { display: block; } .side-col { display: none; } .side-col.open { display: block; } }
@media (min-width: 1025px) { .sidebar-toggle { display: none; } }
.side-col { background: var(--surface); border: 1px solid var(--border); padding: 16px; min-height: 100px; }
.side-section { margin-bottom: 18px; }
.side-label { color: var(--gold); font-size: 9px; letter-spacing: 4px; margin-bottom: 8px; border-bottom: 1px solid var(--border); padding-bottom: 4px; }
.sidebar-toggle { background: var(--surface); border: 1px solid var(--gold3); color: var(--gold2); padding: 8px 14px; margin: 4px; font-size: 12px; cursor: pointer; letter-spacing: 1px; }

/* Stats */
.stat-row { margin-bottom: 8px; }
.stat-head { display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 2px; }
.stat-name { color: var(--text); letter-spacing: 1px; }
.stat-val { color: var(--gold2); font-family: 'Orbitron', monospace; }
.stat-bar { width: 100%; height: 4px; background: var(--surface2); }
.stat-fill { height: 100%; background: linear-gradient(90deg, var(--gold3), var(--gold)); transition: width 0.5s; }

/* Act tracker */
.act-tracker { margin-bottom: 16px; }
.act-name { color: var(--gold2); font-family: 'Cinzel', serif; font-size: 13px; font-weight: 700; letter-spacing: 1px; margin-bottom: 4px; }
.act-desc { color: var(--muted); font-size: 11px; letter-spacing: 1px; margin-bottom: 8px; }
.act-progress-bar { width: 100%; height: 4px; background: var(--surface2); margin-bottom: 4px; }
.act-progress-fill { height: 100%; background: linear-gradient(90deg, var(--gold3), var(--gold)); transition: width 0.5s ease; }
.act-counter { color: var(--muted); font-size: 10px; letter-spacing: 2px; font-family: 'Orbitron', monospace; }

/* Story history */
.history-list { display: flex; flex-direction: column; gap: 4px; margin-top: 6px; }
.history-item { display: flex; gap: 6px; color: var(--muted); font-size: 11px; line-height: 1.4; letter-spacing: 0.5px; }
.history-dot { color: var(--gold3); flex-shrink: 0; }

/* Scene + choices */
.scene-card { background: var(--surface); border: 1px solid var(--gold3); padding: 28px; min-height: 320px; clip-path: polygon(16px 0, 100% 0, calc(100% - 16px) 100%, 0 100%); }
.scene-title { font-family: 'Cinzel', serif; font-size: 22px; color: var(--gold2); letter-spacing: 2px; margin-bottom: 16px; }
.scene-text { color: var(--text); line-height: 1.7; font-size: 15px; margin-bottom: 20px; white-space: pre-wrap; }
.notif-row { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 16px; }
.notif { background: var(--surface2); border: 1px solid var(--gold3); color: var(--gold2); padding: 4px 10px; font-size: 10px; letter-spacing: 1px; font-family: 'Orbitron', monospace; animation: fadeIn 0.4s; }
.notif.bad { border-color: #6b2a2a; color: #f4a878; }
.choices-wrap { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 12px; }
@media (max-width: 700px) { .choices-wrap { grid-template-columns: 1fr; } }
.choice-btn { background: var(--surface2); border: 1px solid var(--border); color: var(--text); padding: 14px; text-align: left; cursor: pointer; display: flex; flex-direction: column; gap: 4px; transition: all 0.2s; font-family: 'Rajdhani', sans-serif; }
.choice-btn:hover:not(:disabled) { border-color: var(--gold); background: rgba(212,175,55,0.05); }
.choice-btn:disabled { opacity: 0.4; cursor: wait; }
.choice-type { color: var(--gold); font-size: 9px; letter-spacing: 2px; font-family: 'Orbitron', monospace; }
.choice-text { color: var(--text); font-size: 14px; line-height: 1.4; }
.choice-hint { color: var(--muted); font-size: 11px; letter-spacing: 0.5px; }

.custom-row { display: flex; gap: 8px; margin-top: 10px; }
.custom-row input { flex: 1; background: var(--surface2); border: 1px solid var(--border); color: var(--text); padding: 10px; font-family: 'Rajdhani', sans-serif; font-size: 14px; }

/* Act transition */
.act-transition { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 60px 24px; gap: 12px; animation: fadeIn 0.6s ease; background: var(--surface); border: 1px solid var(--gold3); min-height: 320px; }
.act-transition-label { color: var(--gold); font-size: 10px; letter-spacing: 4px; }
.act-transition-title { font-family: 'Cinzel', serif; font-size: 28px; font-weight: 700; color: var(--gold2); letter-spacing: 2px; text-align: center; }
.act-transition-desc { color: var(--muted); font-size: 13px; letter-spacing: 2px; margin-bottom: 16px; text-align: center; }

/* Final scene */
.ending-wrap { display: flex; flex-direction: column; gap: 16px; padding: 24px; background: var(--surface); border: 1px solid var(--gold3); clip-path: polygon(16px 0, 100% 0, calc(100% - 16px) 100%, 0 100%); }
.ending-label { color: var(--gold); font-size: 10px; letter-spacing: 4px; }
.ending-text { color: var(--text); line-height: 1.7; font-size: 15px; }
.ending-title { font-family: 'Cinzel', serif; font-size: 22px; font-weight: 700; color: var(--gold2); letter-spacing: 2px; }

/* Relationships, inventory, news */
.rel-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 12px; border-bottom: 1px dashed var(--border); }
.rel-name { color: var(--text); }
.rel-tag { font-family: 'Orbitron', monospace; font-size: 10px; }
.rel-tag.friend { color: #7cd17c; }
.rel-tag.rival { color: #e87878; }
.rel-tag.neutral { color: var(--muted); }
.inv-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 4px; }
.inv-slot { background: var(--surface2); border: 1px solid var(--border); aspect-ratio: 1; display: flex; align-items: center; justify-content: center; font-size: 10px; color: var(--muted); text-align: center; padding: 2px; word-break: break-word; line-height: 1.1; }
.inv-slot.filled { color: var(--gold2); border-color: var(--gold3); font-size: 9px; }
.news-item { font-size: 11px; color: var(--muted); line-height: 1.4; padding: 6px 0; border-bottom: 1px dashed var(--border); }
.news-item:before { content: "▸ "; color: var(--gold); }

/* Loader */
.loader { text-align: center; color: var(--gold2); padding: 40px; font-family: 'Cinzel', serif; letter-spacing: 4px; animation: pulse 1.5s infinite; }
@keyframes pulse { 0%,100% { opacity: 0.4; } 50% { opacity: 1; } }
@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }

/* Error */
.err-banner { background: rgba(139,42,42,0.2); border: 1px solid #6b2a2a; padding: 16px; color: #f4a878; margin-bottom: 12px; }
.err-banner button { margin-top: 8px; background: #6b2a2a; color: #fff; border: none; padding: 8px 16px; cursor: pointer; font-family: 'Cinzel', serif; letter-spacing: 2px; font-size: 11px; }

/* Legacy */
.legacy-screen { max-width: 700px; margin: 0 auto; padding: 40px 20px; }
.legacy-header { text-align: center; margin-bottom: 32px; }
.legacy-world { color: var(--gold); font-size: 10px; letter-spacing: 4px; margin-bottom: 8px; }
.legacy-name { font-family: 'Cinzel', serif; font-size: 36px; font-weight: 900; color: var(--gold2); letter-spacing: 4px; }
.legacy-title-earned { color: var(--muted); font-size: 14px; letter-spacing: 3px; margin-top: 8px; }
.legacy-stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 32px; }
@media (max-width: 600px) { .legacy-stats-grid { grid-template-columns: repeat(2, 1fr); } }
.legacy-stat { background: var(--surface); padding: 16px; text-align: center; }
.ls-label { color: var(--gold); font-size: 9px; letter-spacing: 3px; margin-bottom: 6px; }
.ls-val { font-family: 'Orbitron', monospace; font-size: 24px; color: var(--gold2); }
.legacy-section { margin-bottom: 24px; }
.legacy-section-title { color: var(--gold); font-size: 9px; letter-spacing: 4px; border-bottom: 1px solid var(--border); padding-bottom: 6px; margin-bottom: 10px; }
.legacy-scene-item { display: flex; gap: 12px; padding: 6px 0; border-bottom: 1px solid var(--border); align-items: center; }
.legacy-scene-num { font-family: 'Orbitron', monospace; font-size: 11px; color: var(--gold3); min-width: 20px; }
.legacy-scene-title { color: var(--text); font-size: 13px; }
.legacy-decision { color: var(--muted); font-size: 13px; padding: 4px 0; }
.legacy-achievements { display: flex; flex-wrap: wrap; gap: 8px; }
.legacy-ach-badge { background: var(--gold3); color: var(--gold2); font-size: 11px; padding: 4px 12px; letter-spacing: 1px; }
.legacy-actions { display: flex; gap: 12px; justify-content: center; margin-top: 32px; flex-wrap: wrap; }
`;

// ─── COMPONENT ──────────────────────────────────────────────────────────────
type Screen = "splash" | "creation" | "worldselect" | "game" | "legacy";

function SimulationPage() {
  const callScene = useServerFn(simulationScene);
  const [screen, setScreen] = useState<Screen>("splash");
  const [player, setPlayer] = useState<PlayerState>(emptyPlayer);
  const [currentWorld, setCurrentWorld] = useState<World | null>(null);
  const [currentScene, setCurrentScene] = useState<Scene | null>(null);
  const [sceneHistory, setSceneHistory] = useState<string[]>([]);
  const [newsFeed, setNewsFeed] = useState<string[]>([]);
  const [notifications, setNotifications] = useState<{ text: string; bad?: boolean }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingAct, setPendingAct] = useState<typeof STORY_ACTS[number] | null>(null);
  const [historyOpen, setHistoryOpen] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState<"left" | "right" | null>(null);
  const [customText, setCustomText] = useState("");
  const [creationStep, setCreationStep] = useState(0);
  const playerRef = useRef(player);
  playerRef.current = player;
  const worldRef = useRef(currentWorld);
  worldRef.current = currentWorld;

  // Load save
  useEffect(() => {
    try {
      const raw = localStorage.getItem("revenio_save_v2");
      if (raw) {
        const s = JSON.parse(raw);
        if (s.player && s.world && s.scene) {
          setPlayer(s.player); setCurrentWorld(s.world); setCurrentScene(s.scene);
          setSceneHistory(s.sceneHistory ?? []); setNewsFeed(s.newsFeed ?? []);
          setScreen("game");
        }
      }
    } catch { /* ignore */ }
  }, []);

  const saveGame = useCallback(() => {
    try {
      localStorage.setItem("revenio_save_v2", JSON.stringify({
        player: playerRef.current, world: worldRef.current,
        scene: currentScene, sceneHistory, newsFeed,
      }));
      pushNotif("Game Saved");
    } catch { /* ignore */ }
  }, [currentScene, sceneHistory, newsFeed]);

  const pushNotif = (text: string, bad = false) => {
    setNotifications(n => [...n, { text, bad }]);
    setTimeout(() => setNotifications(n => n.slice(1)), 4000);
  };

  // ─── AI call ──────────────────────────────────────────────────────────────
  const requestScene = useCallback(async (userMessage: string, basePlayer: PlayerState, world: World) => {
    setIsLoading(true); setError(null);
    try {
      const res = await callScene({
        data: { systemPrompt: buildSystemPrompt(basePlayer, world), userMessage },
      });
      const scene = res.scene as Scene;
      if (!scene || !scene.sceneTitle) throw new Error("Empty scene from AI");
      applyScene(scene, basePlayer);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "The rift trembles…";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [callScene]);

  const applyScene = (scene: Scene, basePlayer: PlayerState) => {
    const next: PlayerState = { ...basePlayer, skills: { ...basePlayer.skills }, relationships: [...basePlayer.relationships], quests: [...basePlayer.quests], inventory: [...basePlayer.inventory], achievements: [...basePlayer.achievements], majorDecisions: [...basePlayer.majorDecisions] };

    // stats
    if (scene.statChanges) {
      for (const [k, v] of Object.entries(scene.statChanges)) {
        next.skills[k] = Math.max(0, (next.skills[k] ?? 0) + Number(v));
        pushNotif(`${k} ${v >= 0 ? "+" : ""}${v}`, v < 0);
      }
    }
    // xp & level
    if (scene.xpGained) {
      next.xp += scene.xpGained;
      while (next.xp >= xpForLevel(next.level)) {
        next.xp -= xpForLevel(next.level); next.level += 1;
        pushNotif(`LEVEL UP → ${next.level}`);
      }
    }
    if (scene.reputationChange) {
      next.reputation += scene.reputationChange;
      pushNotif(`Reputation ${scene.reputationChange >= 0 ? "+" : ""}${scene.reputationChange}`, scene.reputationChange < 0);
    }
    // relationships
    if (scene.relationshipChanges) {
      for (const rc of scene.relationshipChanges) {
        const i = next.relationships.findIndex(r => r.name.toLowerCase() === rc.name.toLowerCase());
        if (i >= 0) next.relationships[i] = { ...next.relationships[i], val: next.relationships[i].val + rc.change, dir: rc.dir ?? next.relationships[i].dir };
        else next.relationships.push({ name: rc.name, val: rc.change, dir: rc.dir ?? "neutral" });
      }
    }
    // inventory
    if (scene.inventoryUnlocks) {
      for (const it of scene.inventoryUnlocks) {
        if (!next.inventory.includes(it) && next.inventory.length < 8) {
          next.inventory.push(it); pushNotif(`Acquired: ${it}`);
        }
      }
    }
    // quests
    if (scene.newQuests) for (const q of scene.newQuests) if (!next.quests.find(x => x.name === q)) { next.quests.push({ name: q, done: false }); pushNotif(`New Quest: ${q}`); }
    if (scene.questUpdates) for (const u of scene.questUpdates) {
      const q = next.quests.find(x => x.name === u.name);
      if (q && u.done) { q.done = true; pushNotif(`Quest Done: ${q.name}`); }
    }
    if (scene.newAchievements) for (const a of scene.newAchievements) if (!next.achievements.includes(a)) { next.achievements.push(a); pushNotif(`🏆 ${a}`); }
    if (scene.newsUpdates) setNewsFeed(f => [...scene.newsUpdates!, ...f].slice(0, 12));

    next.storyProgress = basePlayer.storyProgress + 1;

    setPlayer(next);
    setCurrentScene(scene);
    setSceneHistory(h => [...h, scene.sceneTitle]);
  };

  // ─── Handlers ────────────────────────────────────────────────────────────
  const startWorld = (world: World) => {
    const fresh = { ...player, storyProgress: 0 };
    setPlayer(fresh); setCurrentWorld(world); setSceneHistory([]); setNewsFeed([]);
    setCurrentScene(null); setScreen("game");
    requestScene(getOpeningPrompt(fresh, world), fresh, world);
  };

  const handleChoice = (choice: Choice) => {
    if (!currentWorld || !currentScene) return;
    if (choice.type === "custom") return; // handled separately
    const decision = `${currentScene.sceneTitle}: ${choice.text}`;
    const updated = { ...player, majorDecisions: [...player.majorDecisions, decision] };
    setPlayer(updated);

    // act transition check (we just finished scene at end of act)
    const justFinished = updated.storyProgress - 1; // storyProgress was incremented after last scene
    const finishedAct = STORY_ACTS.find(a => justFinished === a.range[1]);
    if (finishedAct && finishedAct.id < 5) {
      setPendingAct(STORY_ACTS[finishedAct.id] as typeof STORY_ACTS[number]); // next act
      // store the choice to send after transition
      void choice;
      const userMsg = `The player chose: "${choice.text}" (${choice.type}, risk ${choice.risk}). Continue the story into Act ${finishedAct.id + 1}.`;
      pendingMsgRef.current = userMsg;
      return;
    }

    const userMsg = `The player chose: "${choice.text}" (${choice.type}, risk ${choice.risk}). Continue the story.`;
    requestScene(userMsg, updated, currentWorld);
  };

  const pendingMsgRef = useRef<string | null>(null);
  const continueAfterAct = () => {
    if (!currentWorld || !pendingMsgRef.current) return;
    const msg = pendingMsgRef.current;
    pendingMsgRef.current = null;
    setPendingAct(null);
    requestScene(msg, playerRef.current, currentWorld);
  };

  const submitCustom = () => {
    if (!customText.trim() || !currentWorld || !currentScene) return;
    const decision = `${currentScene.sceneTitle}: ${customText}`;
    const updated = { ...player, majorDecisions: [...player.majorDecisions, decision] };
    setPlayer(updated);
    const userMsg = `The player writes their own path: "${customText}". Continue the story.`;
    setCustomText("");

    const justFinished = updated.storyProgress - 1;
    const finishedAct = STORY_ACTS.find(a => justFinished === a.range[1]);
    if (finishedAct && finishedAct.id < 5) {
      setPendingAct(STORY_ACTS[finishedAct.id]);
      pendingMsgRef.current = userMsg;
      return;
    }
    requestScene(userMsg, updated, currentWorld);
  };

  const retryLast = () => {
    if (!currentWorld) return;
    const msg = pendingMsgRef.current ?? "Continue the story from where we left off.";
    requestScene(msg, playerRef.current, currentWorld);
  };

  const resetGame = () => {
    localStorage.removeItem("revenio_save_v2");
    setPlayer(emptyPlayer()); setCurrentWorld(null); setCurrentScene(null);
    setSceneHistory([]); setNewsFeed([]); setNotifications([]); setError(null);
    pendingMsgRef.current = null; setPendingAct(null); setCreationStep(0);
  };

  // ─── RENDER ───────────────────────────────────────────────────────────────
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700;900&family=Rajdhani:wght@400;600;700&family=Orbitron:wght@400;700&display=swap" />
      <div className="rv-root">
        {screen === "splash" && <SplashView onStart={() => { resetGame(); setScreen("creation"); }} />}
        {screen === "creation" && (
          <CreationView
            player={player} setPlayer={setPlayer}
            step={creationStep} setStep={setCreationStep}
            onDone={() => setScreen("worldselect")}
            onBack={() => setScreen("splash")}
          />
        )}
        {screen === "worldselect" && <WorldSelectView onPick={startWorld} onBack={() => setScreen("creation")} />}
        {screen === "game" && currentWorld && (
          <GameView
            player={player} world={currentWorld} scene={currentScene}
            sceneHistory={sceneHistory} newsFeed={newsFeed}
            notifications={notifications} isLoading={isLoading} error={error}
            historyOpen={historyOpen} setHistoryOpen={setHistoryOpen}
            sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}
            pendingAct={pendingAct} continueAfterAct={continueAfterAct}
            onChoice={handleChoice} customText={customText} setCustomText={setCustomText}
            submitCustom={submitCustom} onSave={saveGame} onRetry={retryLast}
            onSeeLegacy={() => setScreen("legacy")}
          />
        )}
        {screen === "legacy" && currentWorld && (
          <LegacyView player={player} world={currentWorld} scene={currentScene}
            sceneHistory={sceneHistory}
            onNewWorld={() => { setScreen("worldselect"); setPlayer(p => ({ ...emptyPlayer(), name: p.name, age: p.age, traits: p.traits, goal: p.goal })); setCurrentWorld(null); setCurrentScene(null); setSceneHistory([]); setNewsFeed([]); }}
            onNewChar={() => { resetGame(); setScreen("creation"); }}
          />
        )}
      </div>
    </>
  );
}

// ─── SUBVIEWS ───────────────────────────────────────────────────────────────
function SplashView({ onStart }: { onStart: () => void }) {
  return (
    <div className="splash">
      <div className="splash-logo">REVENIO</div>
      <div className="splash-tag">Explore the Life You Never Lived</div>
      <button className="btn-gold" onClick={onStart} style={{ marginTop: 32 }}>BEGIN YOUR LEGEND</button>
    </div>
  );
}

function CreationView({ player, setPlayer, step, setStep, onDone, onBack }: {
  player: PlayerState; setPlayer: (p: PlayerState | ((p: PlayerState) => PlayerState)) => void;
  step: number; setStep: (n: number) => void; onDone: () => void; onBack: () => void;
}) {
  const toggleTrait = (t: string) => {
    setPlayer(p => {
      const has = p.traits.includes(t);
      if (has) return { ...p, traits: p.traits.filter(x => x !== t) };
      if (p.traits.length >= 3) return p;
      return { ...p, traits: [...p.traits, t] };
    });
  };
  return (
    <div className="create-wrap">
      {step === 0 && (
        <>
          <div className="create-step">STEP 1 OF 3</div>
          <div className="create-title">Who are you?</div>
          <input className="create-input" placeholder="Your name" value={player.name} onChange={e => setPlayer(p => ({ ...p, name: e.target.value }))} maxLength={40} />
          <input className="create-input" type="number" placeholder="Age" value={player.age} onChange={e => setPlayer(p => ({ ...p, age: Number(e.target.value) || 18 }))} min={10} max={100} />
          <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
            <button className="btn-ghost" onClick={onBack}>BACK</button>
            <button className="btn-gold" onClick={() => setStep(1)} disabled={!player.name.trim() || player.age < 10}>NEXT</button>
          </div>
        </>
      )}
      {step === 1 && (
        <>
          <div className="create-step">STEP 2 OF 3</div>
          <div className="create-title">Choose 3 traits</div>
          <div className="chip-grid">
            {TRAITS.map(t => <div key={t} className={`chip ${player.traits.includes(t) ? "on" : ""}`} onClick={() => toggleTrait(t)}>{t}</div>)}
          </div>
          <div style={{ color: "var(--muted)", fontSize: 12, letterSpacing: 2, marginBottom: 16 }}>{player.traits.length}/3 SELECTED</div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn-ghost" onClick={() => setStep(0)}>BACK</button>
            <button className="btn-gold" onClick={() => setStep(2)} disabled={player.traits.length !== 3}>NEXT</button>
          </div>
        </>
      )}
      {step === 2 && (
        <>
          <div className="create-step">STEP 3 OF 3</div>
          <div className="create-title">Your life goal</div>
          <div className="chip-grid">
            {GOALS.map(g => <div key={g} className={`chip ${player.goal === g ? "on" : ""}`} onClick={() => setPlayer(p => ({ ...p, goal: g }))}>{g}</div>)}
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
            <button className="btn-ghost" onClick={() => setStep(1)}>BACK</button>
            <button className="btn-gold" onClick={onDone} disabled={!player.goal}>CHOOSE WORLD</button>
          </div>
        </>
      )}
    </div>
  );
}

function WorldSelectView({ onPick, onBack }: { onPick: (w: World) => void; onBack: () => void }) {
  return (
    <div>
      <div style={{ textAlign: "center", padding: "32px 20px 8px" }}>
        <div className="create-step">CHOOSE YOUR WORLD</div>
        <div className="create-title" style={{ marginBottom: 4 }}>Eight realities. One legend.</div>
      </div>
      <div className="world-grid">
        {WORLDS.map(w => (
          <div key={w.id} className="world-card" onClick={() => onPick(w)}>
            <div className="world-icon">{w.icon}</div>
            <div className="world-name">{w.name}</div>
            <div className="world-tag">{w.tag}</div>
            <div className="world-theme">{w.theme}</div>
          </div>
        ))}
      </div>
      <div style={{ textAlign: "center", padding: 20 }}>
        <button className="btn-ghost" onClick={onBack}>BACK</button>
      </div>
    </div>
  );
}

function GameView(props: {
  player: PlayerState; world: World; scene: Scene | null;
  sceneHistory: string[]; newsFeed: string[];
  notifications: { text: string; bad?: boolean }[]; isLoading: boolean; error: string | null;
  historyOpen: boolean; setHistoryOpen: (f: (b: boolean) => boolean) => void;
  sidebarOpen: "left" | "right" | null; setSidebarOpen: (s: "left" | "right" | null) => void;
  pendingAct: typeof STORY_ACTS[number] | null; continueAfterAct: () => void;
  onChoice: (c: Choice) => void; customText: string; setCustomText: (s: string) => void;
  submitCustom: () => void; onSave: () => void; onRetry: () => void;
  onSeeLegacy: () => void;
}) {
  const { player, world, scene, sceneHistory, newsFeed, notifications, isLoading, error, historyOpen, setHistoryOpen, sidebarOpen, setSidebarOpen, pendingAct, continueAfterAct, onChoice, customText, setCustomText, submitCustom, onSave, onRetry, onSeeLegacy } = props;
  const act = getCurrentAct(player.storyProgress);
  const sceneInAct = Math.max(1, player.storyProgress - act.range[0] + 1);
  const totalInAct = act.range[1] - act.range[0] + 1;
  const actPct = Math.min(100, (sceneInAct / totalInAct) * 100);

  return (
    <div>
      <div className="topbar">
        <div className="tb-brand">{world.icon} {world.name.toUpperCase()}</div>
        <div className="tb-stats">
          <span>LVL<b>{player.level}</b></span>
          <span>XP<b>{player.xp}/{xpForLevel(player.level)}</b></span>
          <span>REP<b>{player.reputation}</b></span>
          <span>SCENE<b>{player.storyProgress}/24</b></span>
          <button className="btn-ghost" style={{ padding: "6px 12px", fontSize: 11 }} onClick={onSave}>SAVE</button>
        </div>
      </div>

      <div className="rv-shell">
        <div style={{ display: "flex", gap: 8 }}>
          <button className="sidebar-toggle" onClick={() => setSidebarOpen(sidebarOpen === "left" ? null : "left")}>{sidebarOpen === "left" ? "✕ STORY" : "☰ STORY"}</button>
          <button className="sidebar-toggle" onClick={() => setSidebarOpen(sidebarOpen === "right" ? null : "right")}>{sidebarOpen === "right" ? "✕ ALLIES" : "☰ ALLIES"}</button>
        </div>

        <div className="game-grid">
          {/* LEFT */}
          <div className={`side-col ${sidebarOpen === "left" ? "open" : ""}`}>
            <div className="side-section act-tracker">
              <div className="side-label">CURRENT ACT</div>
              <div className="act-name">ACT {act.id} · {act.name}</div>
              <div className="act-desc">{act.desc}</div>
              <div className="act-progress-bar"><div className="act-progress-fill" style={{ width: `${actPct}%` }} /></div>
              <div className="act-counter">SCENE {sceneInAct} OF {totalInAct}</div>
            </div>

            <div className="side-section">
              <div className="side-label">STATS</div>
              {Object.entries(player.skills).map(([k, v]) => (
                <div key={k} className="stat-row">
                  <div className="stat-head"><span className="stat-name">{k}</span><span className="stat-val">{v}</span></div>
                  <div className="stat-bar"><div className="stat-fill" style={{ width: `${Math.min(100, v * 4)}%` }} /></div>
                </div>
              ))}
            </div>

            <div className="side-section">
              <div className="side-label" onClick={() => setHistoryOpen(h => !h)} style={{ cursor: "pointer" }}>
                STORY SO FAR {historyOpen ? "▲" : "▼"}
              </div>
              {historyOpen && (
                <div className="history-list">
                  {sceneHistory.length === 0 && <div className="history-item"><span className="history-dot">·</span><span>Your story begins…</span></div>}
                  {sceneHistory.slice(-5).reverse().map((title, i) => (
                    <div key={i} className="history-item"><span className="history-dot">·</span><span>{title}</span></div>
                  ))}
                </div>
              )}
            </div>

            {player.quests.filter(q => !q.done).length > 0 && (
              <div className="side-section">
                <div className="side-label">QUESTS</div>
                {player.quests.filter(q => !q.done).map((q, i) => (
                  <div key={i} style={{ fontSize: 12, color: "var(--text)", padding: "4px 0", borderBottom: "1px dashed var(--border)" }}>▸ {q.name}</div>
                ))}
              </div>
            )}
          </div>

          {/* MAIN */}
          <div>
            {notifications.length > 0 && (
              <div className="notif-row">
                {notifications.map((n, i) => <div key={i} className={`notif ${n.bad ? "bad" : ""}`}>{n.text}</div>)}
              </div>
            )}

            {error && (
              <div className="err-banner">
                <div style={{ fontFamily: "'Cinzel', serif", letterSpacing: 3, marginBottom: 6 }}>THE RIFT TREMBLES</div>
                <div style={{ fontSize: 13 }}>{error}</div>
                <button onClick={onRetry}>RETRY</button>
              </div>
            )}

            {pendingAct ? (
              <div className="act-transition">
                <div className="act-transition-label">ACT COMPLETE</div>
                <div className="act-transition-title">ACT {pendingAct.id} · {pendingAct.name}</div>
                <div className="act-transition-desc">{pendingAct.desc}</div>
                <button className="btn-gold" onClick={continueAfterAct}>CONTINUE YOUR LEGEND</button>
              </div>
            ) : isLoading && !scene ? (
              <div className="loader">WEAVING YOUR STORY…</div>
            ) : scene ? (
              <div className="scene-card">
                <div className="scene-title">{scene.sceneTitle}</div>
                <div className="scene-text">{scene.sceneText}</div>
                {isLoading && <div className="loader" style={{ padding: 12, fontSize: 12 }}>THE WORLD SHIFTS…</div>}

                {scene.isFinalScene ? (
                  <div className="ending-wrap">
                    <div className="ending-label">YOUR LEGEND IS WRITTEN</div>
                    <div className="ending-text">{scene.legacyEnding}</div>
                    <div className="ending-title">{scene.legacyTitle}</div>
                    <button className="btn-gold" onClick={onSeeLegacy}>SEE YOUR LEGACY</button>
                  </div>
                ) : (
                  <>
                    <div className="choices-wrap">
                      {scene.choices?.filter(c => c.type !== "custom").map(c => (
                        <button key={c.id} className="choice-btn" disabled={isLoading} onClick={() => onChoice(c)}>
                          <span className="choice-type">[{c.type?.toUpperCase()}] · RISK {c.risk}</span>
                          <span className="choice-text">{c.text}</span>
                          <span className="choice-hint">{c.hint}</span>
                        </button>
                      ))}
                    </div>
                    <div className="custom-row">
                      <input
                        placeholder="Write your own path…"
                        value={customText}
                        onChange={e => setCustomText(e.target.value)}
                        onKeyDown={e => { if (e.key === "Enter") submitCustom(); }}
                        disabled={isLoading}
                        maxLength={200}
                      />
                      <button className="btn-gold" onClick={submitCustom} disabled={isLoading || !customText.trim()}>GO</button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="loader">AWAITING THE FIRST SCENE…</div>
            )}
          </div>

          {/* RIGHT */}
          <div className={`side-col ${sidebarOpen === "right" ? "open" : ""}`}>
            <div className="side-section">
              <div className="side-label">RELATIONSHIPS</div>
              {player.relationships.length === 0 && <div style={{ color: "var(--muted)", fontSize: 12 }}>No bonds yet.</div>}
              {player.relationships.slice(0, 8).map((r, i) => (
                <div key={i} className="rel-row">
                  <span className="rel-name">{r.name}</span>
                  <span className={`rel-tag ${r.dir}`}>{r.dir.toUpperCase()} {r.val >= 0 ? "+" : ""}{r.val}</span>
                </div>
              ))}
            </div>

            <div className="side-section">
              <div className="side-label">INVENTORY</div>
              <div className="inv-grid">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className={`inv-slot ${player.inventory[i] ? "filled" : ""}`}>{player.inventory[i] ?? "—"}</div>
                ))}
              </div>
            </div>

            <div className="side-section">
              <div className="side-label">NEWS FEED</div>
              {newsFeed.length === 0 && <div style={{ color: "var(--muted)", fontSize: 11 }}>The world is quiet.</div>}
              {newsFeed.slice(0, 6).map((n, i) => <div key={i} className="news-item">{n}</div>)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function LegacyView({ player, world, scene, sceneHistory, onNewWorld, onNewChar }: {
  player: PlayerState; world: World; scene: Scene | null;
  sceneHistory: string[]; onNewWorld: () => void; onNewChar: () => void;
}) {
  return (
    <div className="legacy-screen">
      <div className="legacy-header">
        <div className="legacy-world">{world.name.toUpperCase()}</div>
        <div className="legacy-name">{player.name.toUpperCase()}</div>
        <div className="legacy-title-earned">{scene?.legacyTitle || "A Legend in the Making"}</div>
      </div>

      <div className="legacy-stats-grid">
        <div className="legacy-stat"><div className="ls-label">LEVEL</div><div className="ls-val">{player.level}</div></div>
        <div className="legacy-stat"><div className="ls-label">SCENES LIVED</div><div className="ls-val">{player.storyProgress}</div></div>
        <div className="legacy-stat"><div className="ls-label">ACHIEVEMENTS</div><div className="ls-val">{player.achievements.length}</div></div>
        <div className="legacy-stat"><div className="ls-label">REPUTATION</div><div className="ls-val">{player.reputation}</div></div>
      </div>

      {scene?.legacyEnding && (
        <div className="legacy-section">
          <div className="legacy-section-title">YOUR ENDING</div>
          <div style={{ color: "var(--text)", lineHeight: 1.7, fontSize: 14 }}>{scene.legacyEnding}</div>
        </div>
      )}

      <div className="legacy-section">
        <div className="legacy-section-title">YOUR STORY</div>
        {sceneHistory.map((title, i) => (
          <div key={i} className="legacy-scene-item">
            <span className="legacy-scene-num">{String(i + 1).padStart(2, "0")}</span>
            <span className="legacy-scene-title">{title}</span>
          </div>
        ))}
      </div>

      {player.majorDecisions.length > 0 && (
        <div className="legacy-section">
          <div className="legacy-section-title">KEY DECISIONS</div>
          {player.majorDecisions.slice(-10).map((d, i) => <div key={i} className="legacy-decision">· {d}</div>)}
        </div>
      )}

      {player.achievements.length > 0 && (
        <div className="legacy-section">
          <div className="legacy-section-title">ACHIEVEMENTS</div>
          <div className="legacy-achievements">
            {player.achievements.map((a, i) => <span key={i} className="legacy-ach-badge">🏆 {a}</span>)}
          </div>
        </div>
      )}

      <div className="legacy-actions">
        <button className="btn-gold" onClick={onNewWorld}>NEW WORLD</button>
        <button className="btn-ghost" onClick={onNewChar}>NEW CHARACTER</button>
      </div>
    </div>
  );
}
