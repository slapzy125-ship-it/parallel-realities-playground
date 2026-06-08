import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { useServerFn } from "@tanstack/react-start";
import { simulationScene } from "@/lib/simulation.functions";

export const Route = createFileRoute("/simulation")({
  component: SimulationPage,
  head: () => ({
    meta: [
      { title: "Revenio Simulation — Live Your Alternate Life" },
      { name: "description", content: "Choose a world, build your legend. AI-powered alternate life simulation." },
    ],
  }),
});

// ─── DATA ─────────────────────────────────────────────────────────────────────
const WORLDS = [
  { id: "champions", name: "Champions Legacy", emoji: "⚽", tag: "Sports Career", color: "#e85d04", img: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&q=80", question: "What would I sacrifice to become the greatest?", desc: "Rise from unknown youth to global sporting legend." },
  { id: "arcane", name: "Arcane Academy", emoji: "✨", tag: "Magic School", color: "#7c3aed", img: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&q=80", question: "What kind of person would I become with power?", desc: "Enter the world's greatest magic academy." },
  { id: "galactic", name: "Galactic Frontier", emoji: "🚀", tag: "Space Adventure", color: "#0ea5e9", img: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=800&q=80", question: "Would I choose freedom, order, or rebellion?", desc: "Navigate a galaxy of factions, destiny, and conflict." },
  { id: "dragon", name: "Dragonfall Kingdoms", emoji: "🐉", tag: "Medieval Fantasy", color: "#dc2626", img: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&q=80", question: "What kind of leader would I become?", desc: "Rule kingdoms, tame dragons, shape a realm." },
  { id: "hero", name: "Hero Nexus", emoji: "⚡", tag: "Superhero", color: "#f59e0b", img: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&q=80", question: "Would I use power for fame or responsibility?", desc: "Discover powers and decide what kind of hero you are." },
  { id: "shadow", name: "Shadow Guild", emoji: "🕶️", tag: "Spy Thriller", color: "#6b7280", img: "https://images.unsplash.com/photo-1509248961158-e54f6934749c?w=800&q=80", question: "Would I stay loyal when betrayal benefits me?", desc: "Join a secret network of spies and power brokers." },
  { id: "neon", name: "Neon Domination", emoji: "🤖", tag: "Cyberpunk", color: "#06b6d4", img: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80", question: "Would I control the system or fight it?", desc: "Rise through a mega-city ruled by AI and corporations." },
  { id: "odyssey", name: "Eternal Odyssey", emoji: "⚔️", tag: "Mythological", color: "#d97706", img: "https://images.unsplash.com/photo-1548532928-b34e3be62fc6?w=800&q=80", question: "Would I follow destiny or create my own?", desc: "Journey through mythical realms and ancient trials." },
];

const TRAITS = ["Ambitious", "Loyal", "Brave", "Competitive", "Intelligent", "Creative", "Confident", "Curious", "Ruthless", "Charismatic"];
const GOALS = ["Become a Legend", "Gain Power", "Build an Empire", "Become Rich", "Save the World", "Discover the Unknown"];

const WORLD_SYSTEM_PROMPTS: Record<string, string> = {
  champions: `You are the AI narrator for "Champions Legacy" in Revenio — a sports career life simulation. The player is a young unknown athlete rising toward greatness. Teams: Crimson United, Royal Blue Academy, Blackstone FC, Golden City Academy, Phoenix Athletic. Rivals: Luca Moretti, Mateo Silva, Kieran Blake, Jules Laurent, ultimate rival Adrian Vega. Attributes: Speed, Skill, Shooting, Passing, Leadership, Stamina. Currency = Career Credits. Soccer ONLY.`,
  arcane: `You are the AI narrator for "Arcane Academy" — a magic school life simulation. Houses: Aetheris, Drakemore, Umbra, Sylvara. Villain: The Hollow Mage. Skills: Spellcasting, Potions, Dueling, Arcane Theory, Wandcraft. Currency = Arcane Coins.`,
  galactic: `You are the AI narrator for "Galactic Frontier" — a Star Wars-style space adventure. Factions: Vanguard Alliance, Iron Dominion, Nova Syndicate, Celestial Order. Villain: Emperor Vexis. Skills: Piloting, Combat, Diplomacy, Navigation, Engineering. Currency = Credits.`,
  dragon: `You are the AI narrator for "Dragonfall Kingdoms" — a Game of Thrones-style medieval kingdom simulation. Kingdoms: Emberhold, Frostmere, Thornvale, Goldcrest. Villain: King Malakar. Skills: Combat, Leadership, Diplomacy, Dragon Taming, Strategy. Currency = Gold.`,
  hero: `You are the AI narrator for "Hero Nexus" — a Marvel-style superhero simulation. Academies: Titan, Sentinel, Nexus Institute, Phoenix. Villain: The Null. Skills: Power Control, Combat, PR, Strategy, Tech. Currency = Hero Credits.`,
  shadow: `You are the AI narrator for "Shadow Guild" — an Assassin's Creed-style secret order. Branches: Night Ravens, Phantom Circle, Iron Blades, Whisper Network. Villain: The Black Regent. Skills: Stealth, Deception, Combat, Hacking, Persuasion. Currency = Black Coins.`,
  neon: `You are the AI narrator for "Neon Domination" — a cyberpunk mega-city simulation. Corps: Helix Industries, NovaCore, Synapse Systems, Apex Dynamics. Villain: Director Kron. Skills: Hacking, Combat, Persuasion, Cybernetics, Business. Currency = NeoCredits.`,
  odyssey: `You are the AI narrator for "Eternal Odyssey" — a Percy Jackson-style mythological simulation. Orders: Dawnseekers, Moonwardens, Stormforged, Celestial Keepers. Villain: The Eternal King. Skills: Combat, Wisdom, Exploration, Ancient Lore, Leadership. Currency = Ancient Gold.`,
};

// ─── TYPES ────────────────────────────────────────────────────────────────────
type Player = {
  name: string;
  age: string;
  traits: string[];
  goal: string;
  level: number;
  reputation: number;
  wealth: number;
  skills: Record<string, number>;
  currentFaction: string;
};

type Choice = { id: string; text: string; risk: string; potentialOutcome: string };
type Scene = {
  sceneTitle: string;
  sceneText: string;
  atmosphere?: string;
  choices: Choice[];
  statChanges?: { reputation?: number; wealth?: number; level?: number };
  skillChanges?: Record<string, number>;
  newAchievements?: string[];
  nextSceneHint?: string;
};

type HistEntry = { title: string; choiceMade: string };

// ─── PROMPT BUILDERS ──────────────────────────────────────────────────────────
function buildSystem(player: Player, worldId: string, history: HistEntry[]) {
  const ctx = WORLD_SYSTEM_PROMPTS[worldId] || "";
  const hist = history.length > 0
    ? `\n\nRecent story:\n${history.slice(-3).map(h => `Scene: ${h.title} | Choice: ${h.choiceMade}`).join("\n")}`
    : "";
  return `${ctx}

Player profile:
- Name: ${player.name}, Age: ${player.age}
- Traits: ${player.traits.join(", ")}
- Goal: ${player.goal}
- Level: ${player.level} | Reputation: ${player.reputation} | Wealth: ${player.wealth}
- Skills: ${JSON.stringify(player.skills)}
- Faction: ${player.currentFaction || "None yet"}
${hist}

CRITICAL RULES:
1. Return ONLY valid JSON. No markdown, no fences.
2. sceneText: 2-4 punchy sentences. Show action.
3. Always exactly 4 choices: A (safe), B (bold/risky), C (loyalty/emotional), D (custom plan).
4. Stat changes small (1-5).
5. Teen-friendly but dramatic.
6. Use the player's name (${player.name}). Reference their traits/goal naturally.`;
}

function buildUserMessage(player: Player, sceneHint: string) {
  return `Generate the next scene. ${sceneHint ? `Setup: ${sceneHint}` : "Generate an exciting OPENING scene for a brand new player just entering this world."}

Return this exact JSON structure:
{
  "sceneTitle": "short dramatic title",
  "sceneText": "2-4 punchy sentences personal to ${player.name}",
  "atmosphere": "tense|exciting|mysterious|dangerous|triumphant",
  "choices": [
    {"id":"A","text":"safe strategic option (10-15 words)","risk":"Low","potentialOutcome":"brief outcome"},
    {"id":"B","text":"bold risky option (10-15 words)","risk":"High","potentialOutcome":"brief outcome"},
    {"id":"C","text":"loyalty/emotional option (10-15 words)","risk":"Medium","potentialOutcome":"brief outcome"},
    {"id":"D","text":"Create your own plan...","risk":"Variable","potentialOutcome":"Custom outcome"}
  ],
  "statChanges": {"reputation": 0, "wealth": 0, "level": 0},
  "skillChanges": {},
  "newAchievements": [],
  "nextSceneHint": "one intriguing sentence"
}`;
}

function buildCustomUser(player: Player, customChoice: string, scene: Scene) {
  return `The player chose: "${customChoice}"

Current scene: ${scene.sceneTitle} — ${scene.sceneText}

Generate the consequence as JSON with the SAME structure (sceneTitle, sceneText (2-4 sentences), atmosphere, 4 choices A/B/C/D where D is "Create your own plan...", statChanges, skillChanges, newAchievements, nextSceneHint). Return ONLY valid JSON.`;
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────
function SimulationPage() {
  const [screen, setScreen] = useState<"splash" | "create" | "worlds" | "sim">("splash");
  const [player, setPlayer] = useState<Player | null>(null);
  const [worldId, setWorldId] = useState<string | null>(null);

  if (screen === "splash") return <SplashScreen onStart={() => setScreen("create")} />;
  if (screen === "create") return <CharacterCreation onComplete={(p) => { setPlayer(p); setScreen("worlds"); }} />;
  if (screen === "worlds" && player) return <WorldSelect player={player} onSelect={(w) => { setWorldId(w); setScreen("sim"); }} />;
  if (screen === "sim" && player && worldId) return <SimulationEngine player={player} worldId={worldId} onUpdatePlayer={setPlayer} onBack={() => setScreen("worlds")} />;
  return null;
}

// ─── SPLASH ───────────────────────────────────────────────────────────────────
function SplashScreen({ onStart }: { onStart: () => void }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVisible(true), 100); return () => clearTimeout(t); }, []);

  return (
    <div style={{ minHeight: "100vh", overflowY: "auto", background: "#050508", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "2rem 1rem", textAlign: "center", position: "relative", boxSizing: "border-box" }}>
      <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
        {[...Array(30)].map((_, i) => (
          <div key={i} style={{
            position: "absolute",
            width: Math.random() * 3 + 1 + "px", height: Math.random() * 3 + 1 + "px",
            borderRadius: "50%", background: "white",
            left: Math.random() * 100 + "%", top: Math.random() * 100 + "%",
            opacity: Math.random() * 0.7 + 0.1,
            animation: `twinkle ${Math.random() * 3 + 2}s ease-in-out infinite alternate`,
            animationDelay: Math.random() * 3 + "s",
          }} />
        ))}
      </div>
      <div style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(30px)", transition: "all 1s cubic-bezier(0.16,1,0.3,1)", position: "relative", zIndex: 1, maxWidth: "440px", width: "100%" }}>
        <div style={{ fontSize: "clamp(2.5rem, 8vw, 4rem)", marginBottom: "1rem", letterSpacing: "-0.05em", fontFamily: "Georgia, serif" }}>
          <span style={{ background: "linear-gradient(135deg,#fff 0%, #a78bfa 50%, #f472b6 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>REVENIO</span>
        </div>
        <p style={{ color: "#a78bfa", fontSize: "1rem", fontStyle: "italic", marginBottom: "0.5rem", letterSpacing: "0.15em", textTransform: "uppercase", fontFamily: "Georgia, serif" }}>Explore the Life You Never Lived</p>
        <p style={{ color: "#6b7280", fontSize: "0.9rem", marginBottom: "3rem" }}>An AI-powered alternate life simulation. 8 worlds. Infinite choices.<br /><em style={{ color: "#d1d5db" }}>Who could you become?</em></p>
        <button onClick={onStart} style={{ background: "linear-gradient(135deg,#7c3aed,#db2777)", border: "none", borderRadius: "50px", padding: "1rem 3rem", color: "white", fontSize: "1.05rem", fontWeight: 700, cursor: "pointer", letterSpacing: "0.05em", boxShadow: "0 0 40px rgba(124,58,237,0.4)" }}>
          Begin Your Journey →
        </button>
      </div>
      <style>{`@keyframes twinkle { from { opacity: 0.1; } to { opacity: 0.8; } }`}</style>
    </div>
  );
}

// ─── CHARACTER CREATION ───────────────────────────────────────────────────────
function CharacterCreation({ onComplete }: { onComplete: (p: Player) => void }) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [traits, setTraits] = useState<string[]>([]);
  const [goal, setGoal] = useState("");
  const [visible, setVisible] = useState(true);

  const advance = (n: number) => { setVisible(false); setTimeout(() => { setStep(n); setVisible(true); }, 250); };
  const toggleTrait = (t: string) => {
    if (traits.includes(t)) setTraits(traits.filter(x => x !== t));
    else if (traits.length < 3) setTraits([...traits, t]);
  };
  const finish = () => onComplete({
    name: name || "Hero", age: age || "18", traits, goal,
    level: 1, reputation: 0, wealth: 500, skills: {}, currentFaction: "",
  });

  const stepLabels = ["Identity", "Traits", "Goal"];

  return (
    <div style={{ minHeight: "100vh", overflowY: "auto", background: "#050508", display: "flex", flexDirection: "column", alignItems: "center", padding: "2rem 1rem", boxSizing: "border-box" }}>
      <div style={{ width: "100%", maxWidth: "440px" }}>
        <div style={{ textAlign: "center", marginBottom: "2rem", paddingTop: "1rem" }}>
          <div style={{ fontSize: "1.8rem", fontFamily: "Georgia,serif", background: "linear-gradient(135deg,#a78bfa,#f472b6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>REVENIO</div>
          <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center", marginTop: "1rem", flexWrap: "wrap" }}>
            {stepLabels.map((l, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <div style={{ width: 24, height: 24, borderRadius: "50%", background: i <= step ? "linear-gradient(135deg,#7c3aed,#db2777)" : "#374151", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", color: "white", fontWeight: 700 }}>{i + 1}</div>
                <span style={{ fontSize: "0.75rem", color: i === step ? "#a78bfa" : "#6b7280" }}>{l}</span>
                {i < 2 && <div style={{ width: 20, height: 1, background: "#374151" }} />}
              </div>
            ))}
          </div>
        </div>

        <div style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(15px)", transition: "all 0.3s ease" }}>
          {step === 0 && (
            <div>
              <h2 style={{ color: "white", fontSize: "1.6rem", fontFamily: "Georgia,serif", marginBottom: "0.5rem" }}>Who are you?</h2>
              <p style={{ color: "#9ca3af", marginBottom: "2rem" }}>Every legend starts with a name.</p>
              <div style={{ marginBottom: "1rem" }}>
                <label style={{ color: "#d1d5db", fontSize: "0.85rem", display: "block", marginBottom: "0.4rem", textTransform: "uppercase", letterSpacing: "0.1em" }}>Your Name</label>
                <input value={name} onChange={e => setName(e.target.value)} placeholder="Enter your name..."
                  style={{ width: "100%", padding: "0.9rem 1rem", background: "#1a1a2e", border: "1px solid #374151", borderRadius: 10, color: "white", fontSize: "1rem", outline: "none", boxSizing: "border-box" }} />
              </div>
              <div style={{ marginBottom: "2rem" }}>
                <label style={{ color: "#d1d5db", fontSize: "0.85rem", display: "block", marginBottom: "0.4rem", textTransform: "uppercase", letterSpacing: "0.1em" }}>Your Age</label>
                <input value={age} onChange={e => setAge(e.target.value)} placeholder="18" type="number"
                  style={{ width: "100%", padding: "0.9rem 1rem", background: "#1a1a2e", border: "1px solid #374151", borderRadius: 10, color: "white", fontSize: "1rem", outline: "none", boxSizing: "border-box" }} />
              </div>
              <button onClick={() => advance(1)} disabled={!name.trim()}
                style={{ width: "100%", padding: "1rem", background: name.trim() ? "linear-gradient(135deg,#7c3aed,#db2777)" : "#374151", border: "none", borderRadius: 10, color: "white", fontSize: "1rem", fontWeight: 700, cursor: name.trim() ? "pointer" : "not-allowed" }}>
                Continue →
              </button>
            </div>
          )}

          {step === 1 && (
            <div>
              <h2 style={{ color: "white", fontSize: "1.6rem", fontFamily: "Georgia,serif", marginBottom: "0.5rem" }}>Choose 3 Traits</h2>
              <p style={{ color: "#9ca3af", marginBottom: "1.5rem" }}>These shape how the world responds to you.</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.6rem", marginBottom: "2rem" }}>
                {TRAITS.map(t => (
                  <button key={t} onClick={() => toggleTrait(t)} style={{
                    padding: "0.6rem 1.2rem", borderRadius: 50,
                    border: `1px solid ${traits.includes(t) ? "#7c3aed" : "#374151"}`,
                    background: traits.includes(t) ? "rgba(124,58,237,0.2)" : "transparent",
                    color: traits.includes(t) ? "#a78bfa" : "#9ca3af",
                    cursor: "pointer", fontSize: "0.9rem", fontWeight: traits.includes(t) ? 700 : 400,
                  }}>{t}</button>
                ))}
              </div>
              <p style={{ color: "#6b7280", fontSize: "0.8rem", marginBottom: "1.5rem" }}>{traits.length}/3 selected</p>
              <button onClick={() => advance(2)} disabled={traits.length !== 3}
                style={{ width: "100%", padding: "1rem", background: traits.length === 3 ? "linear-gradient(135deg,#7c3aed,#db2777)" : "#374151", border: "none", borderRadius: 10, color: "white", fontSize: "1rem", fontWeight: 700, cursor: traits.length === 3 ? "pointer" : "not-allowed" }}>
                Continue →
              </button>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 style={{ color: "white", fontSize: "1.6rem", fontFamily: "Georgia,serif", marginBottom: "0.5rem" }}>What drives you?</h2>
              <p style={{ color: "#9ca3af", marginBottom: "1.5rem" }}>Your ultimate ambition across all worlds.</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "2rem" }}>
                {GOALS.map(g => (
                  <button key={g} onClick={() => setGoal(g)} style={{
                    padding: "1rem 1.25rem", borderRadius: 12,
                    border: `1px solid ${goal === g ? "#7c3aed" : "#374151"}`,
                    background: goal === g ? "rgba(124,58,237,0.15)" : "rgba(255,255,255,0.02)",
                    color: goal === g ? "#e9d5ff" : "#d1d5db",
                    cursor: "pointer", fontSize: "1rem", textAlign: "left", fontWeight: goal === g ? 700 : 400,
                  }}>{g === goal ? "✓ " : ""}{g}</button>
                ))}
              </div>
              <button onClick={finish} disabled={!goal}
                style={{ width: "100%", padding: "1rem", background: goal ? "linear-gradient(135deg,#7c3aed,#db2777)" : "#374151", border: "none", borderRadius: 10, color: "white", fontSize: "1rem", fontWeight: 700, cursor: goal ? "pointer" : "not-allowed" }}>
                Enter the Multiverse →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── WORLD SELECT ─────────────────────────────────────────────────────────────
function WorldSelect({ player, onSelect }: { player: Player; onSelect: (id: string) => void }) {
  const [hovered, setHovered] = useState<string | null>(null);
  return (
    <div style={{ minHeight: "100vh", overflowY: "auto", background: "#050508", padding: "2rem 1rem", boxSizing: "border-box" }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "2.5rem", paddingTop: "1rem" }}>
          <div style={{ fontSize: "1.8rem", fontFamily: "Georgia,serif", background: "linear-gradient(135deg,#a78bfa,#f472b6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>REVENIO</div>
          <h1 style={{ color: "white", fontSize: "2rem", fontFamily: "Georgia,serif", margin: "1rem 0 0.5rem" }}>Choose Your World</h1>
          <p style={{ color: "#9ca3af" }}>Welcome, <strong style={{ color: "#a78bfa" }}>{player.name}</strong>. Your goal: <em style={{ color: "#f472b6" }}>{player.goal}</em>.</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: "1rem" }}>
          {WORLDS.map((w, i) => (
            <div key={w.id}
              onMouseEnter={() => setHovered(w.id)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => onSelect(w.id)}
              style={{
                borderRadius: 16, overflow: "hidden", cursor: "pointer",
                border: `1px solid ${hovered === w.id ? w.color : "#1f2937"}`,
                transform: hovered === w.id ? "translateY(-4px)" : "translateY(0)",
                transition: "all 0.3s cubic-bezier(0.16,1,0.3,1)",
                boxShadow: hovered === w.id ? `0 20px 40px rgba(0,0,0,0.5), 0 0 30px ${w.color}30` : "none",
                background: "#0d0d1a",
                animation: `fadeUp 0.5s ease both`,
                animationDelay: `${i * 0.07}s`,
              }}>
              <div style={{ position: "relative", height: 160, overflow: "hidden" }}>
                <img src={w.img} alt={w.name} style={{ width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.5)", transition: "transform 0.4s", transform: hovered === w.id ? "scale(1.05)" : "scale(1)" }} onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                <div style={{ position: "absolute", inset: 0, background: `linear-gradient(to top, ${w.color}60, transparent)` }} />
                <div style={{ position: "absolute", top: "1rem", left: "1rem", background: "rgba(0,0,0,0.5)", borderRadius: 50, padding: "0.25rem 0.75rem", fontSize: "0.75rem", color: w.color, border: `1px solid ${w.color}50` }}>{w.tag}</div>
                <div style={{ position: "absolute", bottom: "1rem", left: "1rem", fontSize: "2rem" }}>{w.emoji}</div>
              </div>
              <div style={{ padding: "1.25rem" }}>
                <h3 style={{ color: "white", margin: "0 0 0.5rem", fontSize: "1.1rem", fontFamily: "Georgia,serif" }}>{w.name}</h3>
                <p style={{ color: "#9ca3af", fontSize: "0.85rem", margin: "0 0 0.75rem", lineHeight: 1.4 }}>{w.desc}</p>
                <p style={{ color: w.color, fontSize: "0.8rem", fontStyle: "italic", margin: 0 }}>"{w.question}"</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <style>{`@keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }`}</style>
    </div>
  );
}

// ─── STAT BAR ─────────────────────────────────────────────────────────────────
function StatBar({ label, value, max = 100, color = "#7c3aed" }: { label: string; value: number; max?: number; color?: string }) {
  return (
    <div style={{ marginBottom: "0.6rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.25rem" }}>
        <span style={{ color: "#9ca3af", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</span>
        <span style={{ color: "white", fontSize: "0.75rem", fontWeight: 700 }}>{value}</span>
      </div>
      <div style={{ height: 4, background: "#1f2937", borderRadius: 2, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${Math.min(100, (value / max) * 100)}%`, background: color, borderRadius: 2, transition: "width 0.6s cubic-bezier(0.16,1,0.3,1)" }} />
      </div>
    </div>
  );
}

// ─── SIMULATION ENGINE ────────────────────────────────────────────────────────
function SimulationEngine({ player, worldId, onUpdatePlayer, onBack }: {
  player: Player; worldId: string; onUpdatePlayer: (p: Player) => void; onBack: () => void;
}) {
  const world = WORLDS.find(w => w.id === worldId)!;
  const callScene = useServerFn(simulationScene);
  const [scene, setScene] = useState<Scene | null>(null);
  const [loading, setLoading] = useState(true);
  const [choosing, setChoosing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCustom, setShowCustom] = useState(false);
  const [customText, setCustomText] = useState("");
  const [nextHint, setNextHint] = useState("");
  const [history, setHistory] = useState<HistEntry[]>([]);
  const [sceneVisible, setSceneVisible] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const didLoadRef = useRef(false);

  const loadScene = async (hint = "", hist: HistEntry[] = history) => {
    setLoading(true);
    setSceneVisible(false);
    setError(null);
    setShowCustom(false);
    setCustomText("");
    try {
      const { scene: s } = await callScene({
        data: {
          systemPrompt: buildSystem(player, worldId, hist),
          userMessage: buildUserMessage(player, hint),
        },
      });
      setScene(s as Scene);
      setTimeout(() => setSceneVisible(true), 100);
    } catch {
      setError("The multiverse glitched. Try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (didLoadRef.current) return;
    didLoadRef.current = true;
    loadScene();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const applyStatChanges = (changes?: Scene["statChanges"], skillChanges?: Record<string, number>) => {
    const updated = { ...player };
    if (changes) {
      if (changes.reputation) updated.reputation = Math.max(0, updated.reputation + changes.reputation);
      if (changes.wealth) updated.wealth = Math.max(0, updated.wealth + changes.wealth);
      if (changes.level) updated.level = Math.max(1, updated.level + changes.level);
    }
    if (skillChanges) {
      updated.skills = { ...updated.skills };
      Object.entries(skillChanges).forEach(([k, v]) => {
        updated.skills[k] = Math.min(100, (updated.skills[k] || 0) + v);
      });
    }
    return updated;
  };

  const makeChoice = async (choice: Choice) => {
    if (choosing || !scene) return;
    setChoosing(true);
    const newHistory = [...history, { title: scene.sceneTitle, choiceMade: choice.text }];
    setHistory(newHistory);
    const updated = applyStatChanges(scene.statChanges, scene.skillChanges);
    onUpdatePlayer(updated);

    if (choice.id === "D") {
      setShowCustom(true);
      setChoosing(false);
      return;
    }

    setNextHint(scene.nextSceneHint || "");
    if (scene.newAchievements?.length) {
      setNotification(`🏆 Achievement Unlocked: ${scene.newAchievements[0]}`);
      setTimeout(() => setNotification(null), 3000);
    }
    await loadScene(scene.nextSceneHint || "", newHistory);
    setChoosing(false);
  };

  const submitCustom = async () => {
    if (!customText.trim() || choosing || !scene) return;
    setChoosing(true);
    setShowCustom(false);
    try {
      setLoading(true);
      setSceneVisible(false);
      const { scene: s } = await callScene({
        data: {
          systemPrompt: buildSystem(player, worldId, history),
          userMessage: buildCustomUser(player, customText, scene),
        },
      });
      const newHistory = [...history, { title: scene.sceneTitle, choiceMade: customText }];
      setHistory(newHistory);
      const sc = s as Scene;
      const updated = applyStatChanges(sc.statChanges, sc.skillChanges);
      onUpdatePlayer(updated);
      setScene(sc);
      setTimeout(() => setSceneVisible(true), 100);
    } catch {
      setError("Custom choice failed. Try again.");
    } finally {
      setLoading(false);
      setChoosing(false);
      setCustomText("");
    }
  };

  const atmColors: Record<string, string> = { tense: "#ef4444", exciting: "#f59e0b", mysterious: "#8b5cf6", dangerous: "#dc2626", triumphant: "#10b981" };
  const atmColor = scene && scene.atmosphere ? (atmColors[scene.atmosphere] || world.color) : world.color;

  return (
    <div style={{ minHeight: "100vh", overflowY: "auto", background: "#050508", boxSizing: "border-box" }}>
      {/* Sticky top bar */}
      <div style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(10px)", borderBottom: "1px solid #1f2937", padding: "0.75rem 1rem", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50, boxSizing: "border-box" }}>
        <button onClick={onBack} style={{ background: "none", border: "none", color: "#9ca3af", cursor: "pointer", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>← {world.name}</button>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap", justifyContent: "flex-end" }}>
          <span style={{ color: "#a78bfa", fontSize: "0.8rem", fontWeight: 700 }}>Lv.{player.level}</span>
          <span style={{ color: "#f472b6", fontSize: "0.8rem" }}>⭐ {player.reputation}</span>
          <span style={{ color: "#fbbf24", fontSize: "0.8rem" }}>💰 {player.wealth}</span>
          <button onClick={() => setShowStats(!showStats)} style={{ background: showStats ? "rgba(124,58,237,0.3)" : "rgba(255,255,255,0.05)", border: "1px solid #374151", borderRadius: 6, padding: "0.3rem 0.6rem", color: "#d1d5db", cursor: "pointer", fontSize: "0.8rem" }}>Stats</button>
          <Link to="/" style={{ background: "rgba(239,68,68,0.15)", border: "1px solid #ef444450", borderRadius: 6, padding: "0.3rem 0.6rem", color: "#fca5a5", fontSize: "0.8rem", textDecoration: "none", cursor: "pointer" }}>Exit</Link>
        </div>
      </div>

      {notification && (
        <div style={{ background: "rgba(16,185,129,0.2)", border: "1px solid #10b981", color: "#6ee7b7", padding: "0.75rem 1rem", textAlign: "center", fontSize: "0.9rem" }}>{notification}</div>
      )}

      <div style={{ maxWidth: 720, margin: "0 auto", width: "100%", padding: "1.5rem 1rem 4rem", boxSizing: "border-box" }}>
        {showStats && (
          <div style={{ background: "#0d0d1a", border: "1px solid #1f2937", borderRadius: 12, padding: "1.25rem", marginBottom: "1.5rem" }}>
            <h3 style={{ color: "white", margin: "0 0 1rem", fontFamily: "Georgia,serif", fontSize: "1rem" }}>{player.name}'s Profile</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem 1.5rem" }}>
              <StatBar label="Reputation" value={player.reputation} max={500} color="#7c3aed" />
              <StatBar label="Wealth" value={player.wealth} max={10000} color="#f59e0b" />
              {Object.entries(player.skills || {}).slice(0, 6).map(([k, v]) => (
                <StatBar key={k} label={k} value={v} max={100} color={world.color} />
              ))}
            </div>
            <div style={{ marginTop: "1rem", display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              {player.traits.map(t => (
                <span key={t} style={{ background: "rgba(124,58,237,0.15)", border: "1px solid #7c3aed", borderRadius: 50, padding: "0.2rem 0.7rem", color: "#a78bfa", fontSize: "0.75rem" }}>{t}</span>
              ))}
            </div>
            {history.length > 0 && (
              <div style={{ marginTop: "1rem", borderTop: "1px solid #1f2937", paddingTop: "1rem" }}>
                <p style={{ color: "#6b7280", fontSize: "0.75rem", margin: "0 0 0.5rem", textTransform: "uppercase", letterSpacing: "0.1em" }}>Story so far</p>
                {history.slice(-3).map((h, i) => (
                  <p key={i} style={{ color: "#9ca3af", fontSize: "0.8rem", margin: "0.25rem 0" }}>▸ {h.choiceMade}</p>
                ))}
              </div>
            )}
          </div>
        )}

        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "1.5rem", padding: "4rem 0" }}>
            <div style={{ width: 48, height: 48, border: `3px solid ${world.color}30`, borderTop: `3px solid ${world.color}`, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
            <p style={{ color: "#6b7280", fontSize: "0.9rem", textAlign: "center" }}>{nextHint ? `"${nextHint}"` : "The multiverse is generating your story..."}</p>
          </div>
        ) : error ? (
          <div style={{ textAlign: "center", padding: "3rem 1rem" }}>
            <p style={{ color: "#ef4444", marginBottom: "1rem" }}>{error}</p>
            <button onClick={() => loadScene(nextHint)} style={{ background: world.color, border: "none", borderRadius: 8, padding: "0.75rem 1.5rem", color: "white", cursor: "pointer", fontWeight: 700 }}>Try Again</button>
          </div>
        ) : scene && (
          <div ref={sceneRef} style={{ opacity: sceneVisible ? 1 : 0, transform: sceneVisible ? "translateY(0)" : "translateY(20px)", transition: "all 0.5s cubic-bezier(0.16,1,0.3,1)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
              <div style={{ width: 40, height: 40, borderRadius: 8, overflow: "hidden", flexShrink: 0 }}>
                <img src={world.img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
              </div>
              <div style={{ minWidth: 0 }}>
                <p style={{ color: world.color, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.1em", margin: 0 }}>{world.name} · Scene {history.length + 1}</p>
                <p style={{ color: "#9ca3af", fontSize: "0.75rem", margin: 0 }}>Traits: {player.traits.join(" · ")}</p>
              </div>
              <div style={{ marginLeft: "auto", background: `${atmColor}20`, border: `1px solid ${atmColor}50`, borderRadius: 50, padding: "0.2rem 0.75rem", color: atmColor, fontSize: "0.75rem", textTransform: "capitalize" }}>
                {scene.atmosphere || "dramatic"}
              </div>
            </div>

            <div style={{ background: "#0d0d1a", border: `1px solid ${atmColor}30`, borderRadius: 16, padding: "1.75rem", marginBottom: "1.5rem", position: "relative", overflow: "hidden", boxSizing: "border-box" }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${atmColor}, transparent)` }} />
              <h2 style={{ color: "white", fontFamily: "Georgia,serif", fontSize: "1.35rem", margin: "0 0 1rem", lineHeight: 1.3 }}>{scene.sceneTitle}</h2>
              <p style={{ color: "#e2e8f0", lineHeight: 1.7, margin: 0, fontSize: "1rem", whiteSpace: "pre-wrap" }}>{scene.sceneText}</p>
              {scene.statChanges && Object.values(scene.statChanges).some(v => v !== 0) && (
                <div style={{ marginTop: "1.25rem", display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                  {Object.entries(scene.statChanges).map(([k, v]) => v !== 0 ? (
                    <span key={k} style={{ background: v > 0 ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)", border: `1px solid ${v > 0 ? "#10b981" : "#ef4444"}30`, borderRadius: 50, padding: "0.2rem 0.7rem", color: v > 0 ? "#6ee7b7" : "#fca5a5", fontSize: "0.75rem" }}>
                      {v > 0 ? "+" : ""}{v} {k}
                    </span>
                  ) : null)}
                </div>
              )}
            </div>

            {!showCustom ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                <p style={{ color: "#6b7280", fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 0.25rem" }}>What do you do?</p>
                {scene.choices?.map((c) => {
                  const riskColor = ({ Low: "#10b981", Medium: "#f59e0b", High: "#ef4444", Variable: "#8b5cf6" } as Record<string, string>)[c.risk] || "#9ca3af";
                  const isCustom = c.id === "D";
                  return (
                    <button key={c.id} onClick={() => makeChoice(c)} disabled={choosing}
                      style={{
                        background: isCustom ? "rgba(124,58,237,0.08)" : "rgba(255,255,255,0.03)",
                        border: `1px solid ${isCustom ? "#7c3aed50" : "#1f2937"}`,
                        borderRadius: 12, padding: "1rem 1.1rem",
                        color: "white", cursor: choosing ? "not-allowed" : "pointer",
                        textAlign: "left", width: "100%", opacity: choosing ? 0.6 : 1,
                        transition: "all 0.2s", display: "flex", alignItems: "flex-start", gap: "0.75rem",
                        boxSizing: "border-box",
                      }}
                    >
                      <span style={{ width: 24, height: 24, borderRadius: 6, background: isCustom ? "#7c3aed" : "#1f2937", color: isCustom ? "white" : "#9ca3af", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 700, flexShrink: 0 }}>{c.id}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ margin: "0 0 0.3rem", fontSize: "0.95rem", lineHeight: 1.4 }}>{c.text}</p>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
                          <span style={{ color: riskColor, fontSize: "0.75rem", fontWeight: 700 }}>{c.risk} Risk</span>
                          {!isCustom && <span style={{ color: "#6b7280", fontSize: "0.75rem" }}>→ {c.potentialOutcome}</span>}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div style={{ background: "rgba(124,58,237,0.08)", border: "1px solid #7c3aed50", borderRadius: 12, padding: "1.25rem", boxSizing: "border-box" }}>
                <p style={{ color: "#a78bfa", fontSize: "0.9rem", margin: "0 0 0.75rem", fontWeight: 700 }}>Create your own plan...</p>
                <textarea value={customText} onChange={e => setCustomText(e.target.value)}
                  placeholder="What does your character do? Be specific..."
                  rows={3} style={{ width: "100%", background: "#0d0d1a", border: "1px solid #374151", borderRadius: 8, color: "white", padding: "0.75rem", fontSize: "0.95rem", resize: "vertical", outline: "none", boxSizing: "border-box", fontFamily: "inherit" }} />
                <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.75rem" }}>
                  <button onClick={submitCustom} disabled={!customText.trim()}
                    style={{ flex: 1, padding: "0.75rem", background: "linear-gradient(135deg,#7c3aed,#db2777)", border: "none", borderRadius: 8, color: "white", cursor: customText.trim() ? "pointer" : "not-allowed", fontWeight: 700 }}>
                    Execute Plan →
                  </button>
                  <button onClick={() => setShowCustom(false)}
                    style={{ padding: "0.75rem 1rem", background: "none", border: "1px solid #374151", borderRadius: 8, color: "#9ca3af", cursor: "pointer" }}>
                    Back
                  </button>
                </div>
              </div>
            )}

            {scene.nextSceneHint && !showCustom && (
              <p style={{ color: "#4b5563", fontSize: "0.8rem", textAlign: "center", marginTop: "1.25rem", fontStyle: "italic" }}>Next: {scene.nextSceneHint}</p>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
