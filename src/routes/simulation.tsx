import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef } from "react";
import { useServerFn } from "@tanstack/react-start";
import { simulationScene } from "@/lib/simulation.functions";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";

export const Route = createFileRoute("/simulation")({
  head: () => ({
    meta: [
      { title: "Revenio Simulation — Build Your Legend" },
      { name: "description", content: "Step into AI-powered worlds and live the legend you never lived." },
    ],
  }),
  component: SimulationPage,
});

// ─── WORLD LORE ───────────────────────────────────────────────────────────────
const WORLD_LORE: Record<string, any> = {
  arcane: {
    factions: ["House Aetheris (knowledge & strategy)", "House Drakemore (courage & honor)", "House Umbra (ambition & cunning)", "House Sylvara (nature & creativity)"],
    rivals: ["Cassian Vael — top student, ruthless and calculating", "Lyra Ashwood — prodigy from House Sylvara, secretly kind", "Mordecai Thane — bully from House Umbra, connected and dangerous"],
    npcs: ["Headmaster Orin — wise but hides secrets", "Professor Serath — strict, respects only results", "The Groundskeeper — knows every secret passage"],
    events: ["A forbidden spell was used last night", "A student disappeared from the east tower", "The annual dueling tournament is announced", "A dark artifact was found in the library", "Someone is stealing from the potion stores"],
    tone: "mysterious, magical, politically charged school life",
    currency: "Arcane Marks",
    sceneTypes: ["class challenge", "duel", "house politics", "forbidden discovery", "secret mission", "rivalry confrontation", "mentor moment", "dangerous experiment"],
  },
  galactic: {
    factions: ["Vanguard Alliance (explorers & diplomats)", "Iron Dominion (military & order)", "Nova Syndicate (traders & smugglers)", "Celestial Order (mystics & ancient knowledge)"],
    rivals: ["Commander Hex — Iron Dominion enforcer, wants you eliminated", "Zara Voss — Nova Syndicate pilot, charismatic and untrustworthy", "The Ghost — unknown operative who keeps appearing"],
    npcs: ["Admiral Crane — old veteran, sees potential in you", "Kai — ship mechanic, loyal and street-smart", "Oracle-7 — ancient AI that speaks in riddles"],
    events: ["A distress signal from the outer rim", "A planet is about to be seized by Iron Dominion", "Smuggled cargo was found on your ship", "A bounty has been placed on someone in your crew", "Emperor Vexis made a public announcement"],
    tone: "gritty space opera, high stakes, political intrigue",
    currency: "Credits",
    sceneTypes: ["space combat", "faction negotiation", "planet exploration", "crew conflict", "smuggling run", "discovery", "ambush", "alliance decision"],
  },
  hero: {
    factions: ["Titan Academy (strength heroes)", "Sentinel Academy (protectors)", "Nexus Institute (tech & intelligence)", "Phoenix Academy (elite combat)"],
    rivals: ["Blaze — fire-powered showoff, media favorite", "Ironclad — strength-based hero, despises your style", "The Null — villain slowly removing heroes' powers"],
    npcs: ["Director Vane — runs Phoenix Academy, ruthless pragmatist", "Mira Chen — journalist always nearby", "Coach Sato — trainer who believes in you when no one else does"],
    events: ["A major villain attack downtown", "A hero was exposed as corrupt", "The Hero Rankings just updated", "A civilian recorded your last mission", "A new villain team formed"],
    tone: "superhero drama, public pressure, identity crisis, spectacular action",
    currency: "Hero Points",
    sceneTypes: ["combat mission", "press conference", "training session", "civilian rescue", "rivalry clash", "identity challenge", "team conflict", "moral dilemma"],
  },
  dragon: {
    factions: ["Emberhold (dragon riders & warriors)", "Frostmere (northern ice clans)", "Thornvale (archers & beast tamers)", "Goldcrest (royalty & diplomats)"],
    rivals: ["Lord Varek — Emberhold general, sees you as a threat", "Lady Sera — Goldcrest diplomat, plays every side", "Kael the Burned — former dragon rider, bitter and vengeful"],
    npcs: ["Elder Dwyn — oldest rider, knows where the last dragon eggs are", "Tomas — your squire, fiercely loyal", "The Dragon Seer — blind oracle who predicts fire"],
    events: ["King Malakar's army crossed the northern pass", "A dragon was seen circling the capital", "Harvest taxes caused riots in Thornvale", "A lost dragon egg was discovered", "Two kingdoms are on the brink of war"],
    tone: "epic medieval fantasy, war strategy, power and consequence",
    currency: "Gold Crowns",
    sceneTypes: ["battle command", "kingdom negotiation", "dragon encounter", "political intrigue", "siege warfare", "alliance building", "betrayal reveal", "moral ruling"],
  },
  champions: {
    factions: ["Crimson United (historic club, pressure & tradition)", "Royal Blue (elite technical academy)", "Blackstone FC (defensive discipline)", "Golden City Academy (wealthy & modern)", "Phoenix Athletic (underdog energy)"],
    rivals: ["Luca Moretti — elite striker, arrogant and flashy", "Mateo Silva — wonderkid midfielder, technical genius", "Kieran Blake — aggressive defender, physically dominant", "Adrian Vega — the best of your generation, your ultimate measure"],
    npcs: ["Coach Reyes — tough but fair, believes in you", "Agent Torres — your agent, loyal but greedy", "Dani — childhood friend who kept you grounded", "The Press — always watching, always judging"],
    events: ["Transfer window opens tomorrow", "A doping scandal rocked the league", "Your stats leaked to the media", "A rival club made a huge offer for you", "The national team selectors are watching tonight"],
    tone: "sports drama, pressure, sacrifice, fame and identity",
    currency: "Contract Value",
    sceneTypes: ["match moment", "training decision", "transfer negotiation", "media pressure", "rivalry confrontation", "personal sacrifice", "team conflict", "career crossroads"],
  },
  shadow: {
    factions: ["Night Ravens (stealth operatives)", "Phantom Circle (spies & deception)", "Iron Blades (mercenaries)", "Whisper Network (information brokers)"],
    rivals: ["The Jackal — rival operative, two steps ahead", "Director Lyons — agency head who wants you controlled", "Cipher — unknown hacker, knows everything about you"],
    npcs: ["Handler Rook — your contact, trustworthy until he isn't", "Vera — an asset turned ally, dangerous secrets", "The Fixer — cleans up problems, for a price"],
    events: ["A mole was discovered in the guild", "A senator was assassinated", "Classified files were leaked", "A rival guild is moving into your territory", "The Black Regent made a public appearance"],
    tone: "spy thriller, paranoia, betrayal, moral ambiguity, power in shadows",
    currency: "Influence",
    sceneTypes: ["infiltration", "interrogation", "double-cross", "intel extraction", "safe house crisis", "trust test", "assassination decision", "faction war"],
  },
  neon: {
    factions: ["Helix Industries (technology)", "NovaCore (energy)", "Synapse Systems (AI)", "Apex Dynamics (military tech)"],
    rivals: ["Director Kron — richest man in the city, wants to merge humanity with AI", "Nova Reyes — corporate climber, ruthless and brilliant", "Ghost Protocol — rogue AI that's been watching you"],
    npcs: ["Jax — street-level fixer, old school loyalty", "Dr. Ito — scientist who built things she regrets", "The Broker — trades in secrets, not money"],
    events: ["Synapse Systems released a new mind-interface", "Corporate enforcers raided the lower districts", "A blackout hit sector 7 for 72 hours", "A whistleblower went public", "Director Kron announced the Merger Initiative"],
    tone: "cyberpunk, corporate dystopia, tech identity, rebellion vs control",
    currency: "Crypto",
    sceneTypes: ["corporate heist", "street conflict", "tech upgrade", "faction negotiation", "exposure risk", "underground alliance", "system hack", "moral crossroads"],
  },
  odyssey: {
    factions: ["Dawnseekers (heroes)", "Moonwardens (mystics)", "Stormforged (warriors)", "Celestial Keepers (guardians of relics)"],
    rivals: ["The Eternal King — immortal ruler between realities", "Theron the Fallen — hero turned traitor, knows all your weaknesses", "The Mimic — creature that takes your form"],
    npcs: ["Seer Elara — ancient guide, speaks in half-truths", "Brennan — fellow traveler, heart of gold, terrible judgment", "The Oracle — can answer one question, always has a cost"],
    events: ["A mythical creature was spotted near the village", "An ancient temple opened for the first time in centuries", "The stars aligned in a forbidden pattern", "A legendary weapon resurfaced", "The Eternal King's shadow was seen crossing the moon"],
    tone: "mythological epic, destiny vs free will, trials and transformation",
    currency: "Relics",
    sceneTypes: ["mythic trial", "creature encounter", "ancient discovery", "legendary battle", "divine test", "realm crossing", "prophecy moment", "sacrifice decision"],
  },
};

const TENSION_LEVELS = ["calm", "building", "tense", "crisis"];

function getNextSceneType(worldId: string, history: any[], tension: number) {
  const lore = WORLD_LORE[worldId];
  if (!lore) return "encounter";
  const used = history.slice(-4).map((h) => h.sceneType).filter(Boolean);
  const available = lore.sceneTypes.filter((s: string) => !used.includes(s));
  const pool = available.length > 0 ? available : lore.sceneTypes;
  if (tension >= 2 && Math.random() > 0.4) {
    const dramatic = pool.filter((s: string) => /conflict|battle|crisis|confront|combat|betrayal|sacrifice|war|decision/.test(s));
    if (dramatic.length > 0) return dramatic[Math.floor(Math.random() * dramatic.length)];
  }
  return pool[Math.floor(Math.random() * pool.length)];
}

function buildPrompt(player: any, worldName: string, worldId: string, sceneType: string, tension: number, storyHistory: any[], isOpening: boolean) {
  const lore = WORLD_LORE[worldId] || {};
  const tensionWord = TENSION_LEVELS[tension] || "building";
  const recentDecisions = storyHistory.slice(-5).map((h) => `Scene "${h.title}": player chose "${h.choice}"`).join("\n") || "none yet";
  const activeRelationships = player.relationships.map((r: any) => `${r.name} (${r.status})`).join(", ") || "none yet";
  const events = lore.events || ["something stirs"];

  return `You are the Revenio Simulation Engine — an AI storyteller generating unique, dynamic life-simulation scenes.

=== PLAYER ===
Name: ${player.name} | Age: ${player.age} | Level: ${player.level}
Traits: ${player.traits.join(", ")}
Goal: ${player.goal}
World: ${worldName} | Reputation: ${player.reputation} | Wealth: ${player.wealth}
Current faction: ${player.currentFaction || "unaffiliated"}
Relationships: ${activeRelationships}
Inventory: ${player.inventory.join(", ") || "nothing yet"}

=== STORY MEMORY (last 5 decisions) ===
${recentDecisions}

=== WORLD CONTEXT ===
Factions: ${(lore.factions || []).join(" | ")}
Active rivals: ${(lore.rivals || []).join(" | ")}
Key NPCs: ${(lore.npcs || []).join(" | ")}
World event: ${events[Math.floor(Math.random() * events.length)]}
Currency: ${lore.currency || "gold"}
World tone: ${lore.tone || "dramatic"}

=== THIS SCENE ===
Type: ${sceneType}
Narrative tension: ${tensionWord}
${isOpening ? "This is the OPENING scene. Hook immediately. Drop them into action." : "This is a CONSEQUENCE scene — build directly on prior decisions."}

=== STRICT RULES ===
1. sceneText: 2-4 SHORT punchy sentences. NO lore dumps. Show action, show stakes, name an NPC or rival when relevant.
2. Make this scene feel DIFFERENT from recent ones.
3. Let the player's TRAITS actively shape the scene.
4. Choices must feel meaningfully different.
5. Choice D must always be: "Create your own plan..." (verbatim).
6. statChanges: small integers, can be NEGATIVE.
7. If tension is "crisis" or "tense", something is genuinely at stake.
8. Return ONLY raw JSON. No markdown. No backticks.

=== REQUIRED JSON FORMAT ===
{
  "sceneTitle": "short dramatic title max 5 words",
  "sceneText": "2-4 punchy sentences. Name NPCs. Show stakes.",
  "sceneType": "${sceneType}",
  "tension": "${tensionWord}",
  "choices": [
    {"id":"A","text":"safe/strategic choice","type":"safe","risk":"Low","potentialOutcome":"brief hint"},
    {"id":"B","text":"bold/risky choice","type":"risky","risk":"High","potentialOutcome":"brief hint"},
    {"id":"C","text":"emotional/loyalty choice","type":"loyalty","risk":"Medium","potentialOutcome":"brief hint"},
    {"id":"D","text":"Create your own plan...","type":"custom","risk":"Variable","potentialOutcome":"Custom outcome"}
  ],
  "statChanges": {"reputation": 0, "wealth": 0, "level": 0},
  "relationshipChanges": [],
  "inventoryUnlocks": [],
  "newAchievements": [],
  "factionChange": "",
  "nextSceneHint": "one sentence teaser for what comes next"
}`;
}

const TRAITS = ["Ambitious", "Loyal", "Brave", "Competitive", "Intelligent", "Creative", "Confident", "Curious", "Ruthless", "Charismatic"];
const GOALS = ["Become a Legend", "Gain Power", "Build an Empire", "Become Rich", "Save the World", "Discover the Unknown"];
const WORLDS = [
  { id: "arcane", name: "Arcane Academy", icon: "🔮", tag: "Magic & Power", color: "#7c3aed", desc: "Enter the world's greatest magic school. What kind of power will you seek?" },
  { id: "galactic", name: "Galactic Frontier", icon: "🚀", tag: "Space & Rebellion", color: "#0ea5e9", desc: "A galaxy of factions, starships, and destiny awaits your command." },
  { id: "hero", name: "Hero Nexus", icon: "⚡", tag: "Power & Identity", color: "#f59e0b", desc: "You just got powers. The city is watching. What kind of hero will you be?" },
  { id: "dragon", name: "Dragonfall Kingdoms", icon: "🐉", tag: "War & Legacy", color: "#dc2626", desc: "Dragons, kingdoms, armies, betrayal. Who will you become as a ruler?" },
  { id: "champions", name: "Champions Legacy", icon: "⚽", tag: "Glory & Sacrifice", color: "#16a34a", desc: "Start unknown. Become the greatest athlete the world has ever seen." },
  { id: "shadow", name: "Shadow Guild", icon: "🗡️", tag: "Secrets & Betrayal", color: "#6b7280", desc: "A hidden network of spies and power brokers. Trust no one." },
  { id: "neon", name: "Neon Domination", icon: "🤖", tag: "Tech & Control", color: "#06b6d4", desc: "A mega-city ruled by AI and corporations. Fight it or own it." },
  { id: "odyssey", name: "Eternal Odyssey", icon: "⚔️", tag: "Myth & Destiny", color: "#d97706", desc: "Mythical realms, ancient trials, legendary creatures. Write your epic." },
];
const RISK_COLOR: Record<string, string> = { Low: "#16a34a", Medium: "#d97706", High: "#dc2626", Variable: "#7c3aed" };

function StatBar({ label, value, max = 200, color }: { label: string; value: number; max?: number; color: string }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#94a3b8", marginBottom: 4 }}>
        <span>{label}</span><span>{value}</span>
      </div>
      <div style={{ height: 6, background: "#1e293b", borderRadius: 3, overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: color, transition: "width 0.4s" }} />
      </div>
    </div>
  );
}
function Badge({ label, color }: { label: string; color: string }) {
  return <span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 4, background: color + "22", color, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase" }}>{label}</span>;
}
function TensionBar({ tension }: { tension: string }) {
  const levels = ["calm", "building", "tense", "crisis"];
  const colors = ["#16a34a", "#d97706", "#dc2626", "#7c3aed"];
  const idx = levels.indexOf(tension);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, color: "#64748b" }}>
      <span style={{ letterSpacing: 1.5 }}>TENSION</span>
      {levels.map((_, i) => (
        <div key={i} style={{ width: 14, height: 4, borderRadius: 2, background: i <= idx ? colors[Math.max(0, idx)] : "#1e293b" }} />
      ))}
      <span style={{ color: idx >= 0 ? colors[idx] : "#475569", marginLeft: 4, fontWeight: 700 }}>{tension}</span>
    </div>
  );
}

function SimulationPage() {
  const runScene = useServerFn(simulationScene);
  const [screen, setScreen] = useState<"splash" | "create" | "world" | "game">("splash");
  const [step, setStep] = useState(0);
  const [player, setPlayer] = useState<any>({
    name: "", age: "", traits: [], goal: "", profileImage: null,
    level: 1, reputation: 0, wealth: 0,
    relationships: [], inventory: [], achievements: [],
    majorDecisions: [], storyProgress: 0, currentWorld: "", currentFaction: "",
  });
  const [scene, setScene] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [customOpen, setCustomOpen] = useState(false);
  const [customText, setCustomText] = useState("");
  const [statFlash, setStatFlash] = useState<any>({});
  const [storyHistory, setStoryHistory] = useState<any[]>([]);
  const [tension, setTension] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);

  const worldObj = WORLDS.find((w) => w.id === player.currentWorld);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2800);
  }

  function applyScene(nextScene: any, choiceText: string) {
    const ch = nextScene.statChanges || {};
    setStatFlash(ch);
    setTimeout(() => setStatFlash({}), 2400);
    const tMap: any = { calm: 0, building: 1, tense: 2, crisis: 3 };
    const newTension = tMap[nextScene.tension] ?? Math.min(3, tension + (Math.random() > 0.6 ? 1 : 0));
    setTension(newTension);
    setStoryHistory((h) => [...h, { title: nextScene.sceneTitle, choice: choiceText || "—", sceneType: nextScene.sceneType, tension: nextScene.tension }]);
    setPlayer((p: any) => {
      const next = { ...p, storyProgress: p.storyProgress + 1 };
      if (ch.reputation) next.reputation = Math.max(0, p.reputation + ch.reputation);
      if (ch.wealth) next.wealth = Math.max(0, p.wealth + ch.wealth);
      if (ch.level > 0) { next.level = p.level + 1; showToast("⬆ LEVEL UP!"); }
      if (nextScene.factionChange) next.currentFaction = nextScene.factionChange;
      if (nextScene.relationshipChanges?.length) {
        const rel = [...p.relationships];
        nextScene.relationshipChanges.forEach((rc: any) => {
          const idx = rel.findIndex((r: any) => r.name === rc.name);
          if (idx >= 0) rel[idx] = { ...rel[idx], status: rc.status };
          else rel.push({ name: rc.name, status: rc.status });
        });
        next.relationships = rel;
      }
      if (nextScene.inventoryUnlocks?.length) next.inventory = [...p.inventory, ...nextScene.inventoryUnlocks];
      if (nextScene.newAchievements?.length) {
        next.achievements = [...p.achievements, ...nextScene.newAchievements];
        showToast("🏆 " + nextScene.newAchievements[0]);
      }
      return next;
    });
    setScene(nextScene);
  }

  async function generateScene(world: any, currentPlayer: any, history: any[], currentTension: number, isOpening: boolean, choiceText: string) {
    setLoading(true);
    setErrorMsg(null);
    try {
      const sceneType = getNextSceneType(world.id, history, currentTension);
      const sys = buildPrompt(currentPlayer, world.name, world.id, sceneType, currentTension, history, isOpening);
      const userMsg = isOpening
        ? `Generate the opening scene. ${currentPlayer.name} just entered ${world.name}. Make it immediate and gripping.`
        : `Player chose: "${choiceText}". Generate the consequence scene of type "${sceneType}". Build directly on what just happened.`;
      const res = await runScene({ data: { systemPrompt: sys, userMessage: userMsg } });
      applyScene(res.scene, choiceText);
    } catch (e: any) {
      setErrorMsg(e?.message || "Scene generation failed");
    }
    setLoading(false);
  }

  async function makeChoice(choice: any, custom?: string) {
    const choiceLabel = custom || choice.text;
    const updatedPlayer = { ...player, majorDecisions: [...player.majorDecisions, choiceLabel] };
    setPlayer(updatedPlayer);
    setCustomOpen(false);
    setCustomText("");
    const newTension = Math.min(3, tension + (choice.risk === "High" ? 1 : choice.risk === "Low" ? -1 : 0));
    setTension(Math.max(0, newTension));
    await generateScene(worldObj, updatedPlayer, storyHistory, newTension, false, choiceLabel);
  }

  function startWorld(world: any) {
    const updatedPlayer = { ...player, currentWorld: world.id, storyProgress: 0, majorDecisions: [], relationships: [], inventory: [], currentFaction: "" };
    setPlayer(updatedPlayer);
    setScene(null);
    setStoryHistory([]);
    setTension(0);
    setScreen("game");
    generateScene(world, updatedPlayer, [], 0, true, "");
  }

  function toggleTrait(t: string) {
    setPlayer((p: any) => {
      if (p.traits.includes(t)) return { ...p, traits: p.traits.filter((x: string) => x !== t) };
      if (p.traits.length >= 3) return p;
      return { ...p, traits: [...p.traits, t] };
    });
  }

  const PAGE: React.CSSProperties = { minHeight: "100vh", background: "#070a0e", color: "#f1f5f9", fontFamily: "'Georgia', serif", boxSizing: "border-box" };
  const CARD: React.CSSProperties = { background: "rgba(13,18,28,0.96)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: 20 };
  const BTN = (bg = "#7c3aed", ghost = false): React.CSSProperties => ({ background: ghost ? "transparent" : bg, border: ghost ? `1px solid ${bg}` : "none", color: ghost ? bg : "#fff", padding: "11px 22px", borderRadius: 8, cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 700, letterSpacing: 0.8, transition: "opacity 0.2s" });
  const canProceed = [!!(player.name.trim() && Number(player.age) > 0), player.profileImage !== null, player.traits.length === 3, player.goal !== ""];

  if (screen === "splash") return (
    <div style={PAGE}>
      <SiteNav />
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "80px 24px", textAlign: "center" }}>
        <div style={{ fontSize: 12, letterSpacing: 6, color: "#7c3aed", marginBottom: 12 }}>WELCOME TO</div>
        <h1 style={{ fontSize: 64, fontWeight: 900, margin: "0 0 16px", letterSpacing: -2 }}>REVENIO</h1>
        <p style={{ fontSize: 18, color: "#94a3b8", marginBottom: 36 }}>Explore the Life You Never Lived.</p>
        <button style={BTN("#7c3aed")} onClick={() => setScreen("create")}>BEGIN YOUR STORY →</button>
        <div style={{ marginTop: 60, display: "flex", justifyContent: "center", gap: 24, flexWrap: "wrap", color: "#475569", fontSize: 12 }}>
          {["8 Worlds", "AI-Powered", "Every Run Unique", "Your Legend"].map((t) => <span key={t}>• {t}</span>)}
        </div>
      </div>
      <SiteFooter />
    </div>
  );

  if (screen === "create") {
    const STEPS = ["Identity", "Your Look", "Personality", "Your Goal"];
    return (
      <div style={PAGE}>
        <SiteNav />
        <div style={{ maxWidth: 560, margin: "0 auto", padding: "40px 20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 28 }}>
            {STEPS.map((s, i) => (
              <div key={s} style={{ flex: 1, textAlign: "center" }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: i <= step ? "#7c3aed" : "#1e293b", margin: "0 auto 6px" }} />
                <div style={{ fontSize: 9, letterSpacing: 1.5, color: i <= step ? "#a78bfa" : "#475569" }}>{s.toUpperCase()}</div>
              </div>
            ))}
          </div>
          <div style={CARD}>
            {step === 0 && (
              <div>
                <h2 style={{ marginTop: 0 }}>Who are you?</h2>
                <p style={{ color: "#94a3b8", fontSize: 13 }}>Your name and age define your starting point.</p>
                <input placeholder="Your name" value={player.name} onChange={(e) => setPlayer((p: any) => ({ ...p, name: e.target.value }))}
                  style={{ width: "100%", background: "#0f172a", border: "1px solid #334151", borderRadius: 8, padding: "11px 14px", color: "#fff", fontSize: 15, fontFamily: "inherit", boxSizing: "border-box", marginBottom: 10, outline: "none" }} />
                <input placeholder="Your age" type="number" value={player.age} onChange={(e) => setPlayer((p: any) => ({ ...p, age: e.target.value }))}
                  style={{ width: "100%", background: "#0f172a", border: "1px solid #334151", borderRadius: 8, padding: "11px 14px", color: "#fff", fontSize: 15, fontFamily: "inherit", boxSizing: "border-box", outline: "none" }} />
              </div>
            )}
            {step === 1 && (
              <div style={{ textAlign: "center" }}>
                <h2 style={{ marginTop: 0 }}>Your Look</h2>
                <p style={{ color: "#94a3b8", fontSize: 13 }}>Upload a photo to personalize your journey.</p>
                <div onClick={() => fileRef.current?.click()} style={{ width: 110, height: 110, borderRadius: "50%", margin: "0 auto 14px", cursor: "pointer", background: "#0f172a", border: "2px dashed #334151", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", fontSize: 36 }}>
                  {player.profileImage && player.profileImage !== "skip" ? <img src={player.profileImage} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : "👤"}
                </div>
                <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => { const f = e.target.files?.[0]; if (!f) return; const r = new FileReader(); r.onload = (ev) => setPlayer((p: any) => ({ ...p, profileImage: ev.target?.result })); r.readAsDataURL(f); }} />
                <button style={BTN("#7c3aed")} onClick={() => fileRef.current?.click()}>Upload Photo</button>
                <div style={{ marginTop: 12 }}>
                  <button style={{ background: "transparent", border: "none", color: "#64748b", cursor: "pointer", fontSize: 12 }} onClick={() => setPlayer((p: any) => ({ ...p, profileImage: "skip" }))}>Skip this step</button>
                </div>
              </div>
            )}
            {step === 2 && (
              <div>
                <h2 style={{ marginTop: 0 }}>Your Traits</h2>
                <p style={{ color: "#94a3b8", fontSize: 13 }}>Choose exactly 3. These shape every scene.</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {TRAITS.map((t) => {
                    const sel = player.traits.includes(t);
                    return <button key={t} onClick={() => toggleTrait(t)} style={{ padding: "7px 13px", borderRadius: 6, fontFamily: "inherit", fontSize: 13, cursor: "pointer", transition: "all 0.18s", border: sel ? "1px solid #7c3aed" : "1px solid #1e293b", background: sel ? "rgba(124,58,237,0.18)" : "#0f172a", color: sel ? "#a78bfa" : "#64748b" }}>{t}</button>;
                  })}
                </div>
                <p style={{ color: "#475569", fontSize: 11, marginTop: 10 }}>{player.traits.length}/3 selected</p>
              </div>
            )}
            {step === 3 && (
              <div>
                <h2 style={{ marginTop: 0 }}>Your Goal</h2>
                <p style={{ color: "#94a3b8", fontSize: 13 }}>What drives you above all else?</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {GOALS.map((g) => {
                    const sel = player.goal === g;
                    return <button key={g} onClick={() => setPlayer((p: any) => ({ ...p, goal: g }))} style={{ textAlign: "left", padding: "13px 16px", borderRadius: 8, fontFamily: "inherit", fontSize: 14, cursor: "pointer", transition: "all 0.18s", border: sel ? "1px solid #7c3aed" : "1px solid #1e293b", background: sel ? "rgba(124,58,237,0.14)" : "#0f172a", color: sel ? "#e2e8f0" : "#64748b" }}>{g}</button>;
                  })}
                </div>
              </div>
            )}
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 22 }}>
              {step > 0 ? <button style={BTN("#475569", true)} onClick={() => setStep((s) => s - 1)}>← Back</button> : <div />}
              {step < 3
                ? <button style={{ ...BTN("#7c3aed"), opacity: canProceed[step] ? 1 : 0.4 }} disabled={!canProceed[step]} onClick={() => canProceed[step] && setStep((s) => s + 1)}>Next →</button>
                : <button style={{ ...BTN("#7c3aed"), opacity: canProceed[3] ? 1 : 0.4 }} disabled={!canProceed[3]} onClick={() => canProceed[3] && setScreen("world")}>Choose Your World →</button>}
            </div>
          </div>
        </div>
        <SiteFooter />
      </div>
    );
  }

  if (screen === "world") return (
    <div style={PAGE}>
      <SiteNav />
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 20px" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 11, letterSpacing: 3, color: "#7c3aed" }}>READY, {player.name?.toUpperCase()}</div>
          <h1 style={{ fontSize: 36, margin: "8px 0" }}>Choose Your World</h1>
          <p style={{ color: "#94a3b8" }}>Each world explores a different version of you.</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
          {WORLDS.map((w) => (
            <div key={w.id} onClick={() => startWorld(w)}
              style={{ ...CARD, cursor: "pointer", transition: "transform 0.2s, border-color 0.2s" }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = w.color + "80"; e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; e.currentTarget.style.transform = "none"; }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                <div style={{ fontSize: 32 }}>{w.icon}</div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 16 }}>{w.name}</div>
                  <div style={{ fontSize: 11, color: w.color, letterSpacing: 1 }}>{w.tag}</div>
                </div>
              </div>
              <p style={{ color: "#94a3b8", fontSize: 13, lineHeight: 1.5, margin: 0 }}>{w.desc}</p>
              <div style={{ marginTop: 12, fontSize: 12, color: w.color, fontWeight: 700 }}>Enter World →</div>
            </div>
          ))}
        </div>
      </div>
      <SiteFooter />
    </div>
  );

  // GAME
  return (
    <div style={PAGE}>
      <SiteNav />
      {toast && (
        <div style={{ position: "fixed", top: 80, left: "50%", transform: "translateX(-50%)", background: "#7c3aed", color: "#fff", padding: "10px 18px", borderRadius: 8, zIndex: 50, fontWeight: 700, fontSize: 13 }}>{toast}</div>
      )}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 16px", display: "flex", gap: 16, flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 520px", display: "flex", flexDirection: "column", gap: 12, minWidth: 0 }}>
          <div style={{ ...CARD, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <div style={{ fontSize: 30 }}>{worldObj?.icon}</div>
            <div style={{ flex: 1, minWidth: 140 }}>
              <div style={{ fontWeight: 800 }}>{worldObj?.name}</div>
              <div style={{ fontSize: 11, color: "#64748b" }}>Scene {player.storyProgress + 1} · {player.name}</div>
            </div>
            <TensionBar tension={TENSION_LEVELS[tension]} />
            <button style={BTN("#475569", true)} onClick={() => { setScreen("world"); setScene(null); }}>← Worlds</button>
          </div>

          {errorMsg && (
            <div style={{ ...CARD, borderColor: "#dc2626" }}>
              <div style={{ color: "#f87171", fontWeight: 700, marginBottom: 6 }}>⚠ Scene generation failed</div>
              <div style={{ color: "#94a3b8", fontSize: 12, marginBottom: 10 }}>{errorMsg}</div>
              <button style={BTN("#dc2626")} onClick={() => worldObj && generateScene(worldObj, player, storyHistory, tension, scene === null, "retry")}>Retry</button>
            </div>
          )}

          {loading && (
            <div style={{ ...CARD, textAlign: "center", padding: 40 }}>
              <div style={{ fontSize: 32, animation: "rev-spin 1s linear infinite", display: "inline-block" }}>⟳</div>
              <div style={{ color: "#94a3b8", marginTop: 10 }}>Generating your story…</div>
              <style>{`@keyframes rev-spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
            </div>
          )}

          {!loading && scene && (
            <>
              <div style={CARD}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, gap: 8, flexWrap: "wrap" }}>
                  <h2 style={{ margin: 0, fontSize: 22 }}>{scene.sceneTitle}</h2>
                  {scene.sceneType && <Badge label={scene.sceneType} color={worldObj?.color || "#7c3aed"} />}
                </div>
                <p style={{ color: "#cbd5e1", fontSize: 15, lineHeight: 1.65, margin: 0 }}>{scene.sceneText}</p>
                {scene.nextSceneHint && (
                  <div style={{ marginTop: 12, fontSize: 11, color: "#64748b", fontStyle: "italic" }}>Next: {scene.nextSceneHint}</div>
                )}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {(scene.choices || []).map((choice: any) => {
                  const isCustom = choice.type === "custom";
                  const wc = worldObj?.color || "#7c3aed";
                  if (isCustom) {
                    return (
                      <div key={choice.id}>
                        {customOpen ? (
                          <div style={CARD}>
                            <textarea placeholder="Describe your plan…" value={customText} onChange={(e) => setCustomText(e.target.value)}
                              style={{ width: "100%", background: "#0f172a", border: "1px solid #334151", borderRadius: 8, padding: 11, color: "#fff", fontSize: 13, fontFamily: "inherit", resize: "vertical", minHeight: 72, boxSizing: "border-box", outline: "none" }} />
                            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                              <button style={{ ...BTN("#7c3aed"), flex: 1 }} onClick={() => customText.trim() && makeChoice(choice, customText.trim())} disabled={!customText.trim()}>Submit My Plan →</button>
                              <button style={BTN("#334151")} onClick={() => { setCustomOpen(false); setCustomText(""); }}>Cancel</button>
                            </div>
                          </div>
                        ) : (
                          <button onClick={() => setCustomOpen(true)}
                            style={{ width: "100%", ...CARD, padding: "13px 16px", cursor: "pointer", textAlign: "left", display: "flex", alignItems: "center", justifyContent: "space-between", border: "1px dashed #334151" }}>
                            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                              <span style={{ width: 22, height: 22, borderRadius: 4, background: "#7c3aed22", color: "#7c3aed", fontSize: 11, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>D</span>
                              <span style={{ color: "#a78bfa", fontSize: 13 }}>{choice.text}</span>
                            </div>
                            <Badge label={choice.risk} color={RISK_COLOR[choice.risk] || "#7c3aed"} />
                          </button>
                        )}
                      </div>
                    );
                  }
                  return (
                    <button key={choice.id} onClick={() => makeChoice(choice)}
                      style={{ width: "100%", ...CARD, padding: "13px 16px", cursor: "pointer", textAlign: "left", display: "flex", alignItems: "flex-start", gap: 10, transition: "border-color 0.18s, background 0.18s" }}>
                      <span style={{ width: 22, height: 22, borderRadius: 4, background: wc + "22", color: wc, fontSize: 11, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>{choice.id}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ color: "#e2e8f0", fontSize: 13, marginBottom: 3 }}>{choice.text}</div>
                        <div style={{ color: "#475569", fontSize: 11, fontStyle: "italic" }}>{choice.potentialOutcome}</div>
                      </div>
                      <Badge label={choice.risk} color={RISK_COLOR[choice.risk] || "#7c3aed"} />
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>

        <div style={{ flex: "1 1 240px", maxWidth: 280, display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ ...CARD, textAlign: "center" }}>
            <div style={{ width: 56, height: 56, borderRadius: "50%", margin: "0 auto 10px", overflow: "hidden", background: "#0f172a", border: `2px solid ${worldObj?.color || "#7c3aed"}` }}>
              {player.profileImage && player.profileImage !== "skip" ? <img src={player.profileImage} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" /> : <div style={{ fontSize: 24, lineHeight: "56px" }}>👤</div>}
            </div>
            <div style={{ fontWeight: 800, fontSize: 14 }}>{player.name}</div>
            <div style={{ fontSize: 11, color: "#475569", marginBottom: 8 }}>Age {player.age} · {player.goal}</div>
            <Badge label={`LVL ${player.level}`} color={worldObj?.color || "#7c3aed"} />
            {player.currentFaction && <div style={{ marginTop: 6, fontSize: 11, color: "#64748b" }}>{player.currentFaction}</div>}
          </div>

          <div style={CARD}>
            <div style={{ fontSize: 10, letterSpacing: 2, color: "#475569", textTransform: "uppercase", marginBottom: 10 }}>Stats</div>
            <StatBar label="Reputation" value={player.reputation} max={200} color="#7c3aed" />
            <StatBar label="Wealth" value={player.wealth} max={1000} color="#f59e0b" />
            {statFlash.reputation !== undefined && statFlash.reputation !== 0 && (
              <div style={{ fontSize: 11, color: statFlash.reputation > 0 ? "#4ade80" : "#f87171", textAlign: "right", marginTop: 2 }}>Rep {statFlash.reputation > 0 ? "+" : ""}{statFlash.reputation}</div>
            )}
            {statFlash.wealth !== undefined && statFlash.wealth !== 0 && (
              <div style={{ fontSize: 11, color: statFlash.wealth > 0 ? "#4ade80" : "#f87171", textAlign: "right" }}>Wealth {statFlash.wealth > 0 ? "+" : ""}{statFlash.wealth}</div>
            )}
          </div>

          <div style={CARD}>
            <div style={{ fontSize: 10, letterSpacing: 2, color: "#475569", textTransform: "uppercase", marginBottom: 8 }}>Traits</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
              {player.traits.map((t: string) => <span key={t} style={{ fontSize: 11, padding: "2px 7px", borderRadius: 4, background: "#1e293b", color: "#94a3b8" }}>{t}</span>)}
            </div>
          </div>

          {player.relationships.length > 0 && (
            <div style={CARD}>
              <div style={{ fontSize: 10, letterSpacing: 2, color: "#475569", textTransform: "uppercase", marginBottom: 8 }}>Relationships</div>
              {player.relationships.slice(0, 5).map((r: any) => (
                <div key={r.name} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 5 }}>
                  <span style={{ color: "#9ca3af" }}>{r.name}</span>
                  <span style={{ fontSize: 10, color: r.status === "ally" ? "#4ade80" : r.status === "rival" ? "#f87171" : "#64748b" }}>{r.status}</span>
                </div>
              ))}
            </div>
          )}

          {player.inventory.length > 0 && (
            <div style={CARD}>
              <div style={{ fontSize: 10, letterSpacing: 2, color: "#475569", textTransform: "uppercase", marginBottom: 8 }}>Inventory</div>
              {player.inventory.slice(0, 5).map((item: string, i: number) => <div key={i} style={{ fontSize: 12, color: "#9ca3af", marginBottom: 3 }}>· {item}</div>)}
            </div>
          )}

          {storyHistory.length > 0 && (
            <div style={CARD}>
              <div style={{ fontSize: 10, letterSpacing: 2, color: "#475569", textTransform: "uppercase", marginBottom: 8 }}>Story Log · {player.storyProgress} scenes</div>
              {storyHistory.slice(-4).map((h, i, arr) => (
                <div key={i} style={{ marginBottom: 8, paddingBottom: 8, borderBottom: i < arr.length - 1 ? "1px solid #1e293b" : "none" }}>
                  <div style={{ fontSize: 11, color: "#64748b", fontStyle: "italic", lineHeight: 1.5 }}>"{h.title}"</div>
                  <div style={{ fontSize: 10, color: "#334155", marginTop: 2 }}>→ {h.choice.length > 40 ? h.choice.slice(0, 40) + "…" : h.choice}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <SiteFooter />
    </div>
  );
}
