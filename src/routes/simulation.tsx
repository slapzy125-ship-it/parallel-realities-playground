import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState, type CSSProperties } from "react";
import { useServerFn } from "@tanstack/react-start";
import { simulationScene } from "@/lib/simulation.functions";

export const Route = createFileRoute("/simulation")({
  head: () => ({
    meta: [
      { title: "Simulation — Revenio" },
      { name: "description", content: "Step into your simulation and live the life you never lived." },
    ],
  }),
  component: Revenio,
});

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

const TRAITS = ["Ambitious","Loyal","Brave","Competitive","Intelligent","Creative","Confident","Curious","Ruthless","Charismatic"];
const GOALS = ["Become a Legend","Gain Power","Build an Empire","Become Rich","Save the World","Discover the Unknown"];

type World = { id: string; name: string; icon: string; tag: string; color: string; desc: string };

const WORLDS: World[] = [
  { id:"arcane",    name:"Arcane Academy",     icon:"🔮", tag:"Magic & Power",       color:"#7c3aed", desc:"Enter the world's greatest magic school. What kind of power will you seek?" },
  { id:"galactic",  name:"Galactic Frontier",  icon:"🚀", tag:"Space & Rebellion",   color:"#0ea5e9", desc:"A galaxy of factions, starships, and destiny awaits your command." },
  { id:"hero",      name:"Hero Nexus",         icon:"⚡", tag:"Power & Identity",    color:"#f59e0b", desc:"You just got powers. The city is watching. What kind of hero will you be?" },
  { id:"dragon",    name:"Dragonfall Kingdoms",icon:"🐉", tag:"War & Legacy",        color:"#dc2626", desc:"Dragons, kingdoms, armies, betrayal. Who will you become as a ruler?" },
  { id:"champions", name:"Champions Legacy",   icon:"⚽", tag:"Glory & Sacrifice",   color:"#16a34a", desc:"Start unknown. Become the greatest athlete the world has ever seen." },
  { id:"shadow",    name:"Shadow Guild",       icon:"🗡️", tag:"Secrets & Betrayal",  color:"#6b7280", desc:"A hidden network of spies and power brokers. Trust no one." },
  { id:"neon",      name:"Neon Domination",    icon:"🤖", tag:"Tech & Control",      color:"#06b6d4", desc:"A mega-city ruled by AI and corporations. Fight it or own it." },
  { id:"odyssey",   name:"Eternal Odyssey",    icon:"⚔️", tag:"Myth & Destiny",      color:"#d97706", desc:"Mythical realms, ancient trials, legendary creatures. Write your epic." },
];

type Relationship = { name: string; status: string };
type Player = {
  name: string; age: string;
  traits: string[]; goal: string;
  profileImage: string | null;
  level: number; reputation: number; wealth: number;
  skills: Record<string, number>;
  relationships: Relationship[];
  inventory: string[]; achievements: string[]; titles: string[];
  majorDecisions: string[];
  currentWorld: string; currentFaction: string;
  storyProgress: number;
};
type Choice = { id: string; text: string; type: string; risk: string; potentialOutcome: string };
type Scene = {
  sceneTitle: string; sceneText: string; choices: Choice[];
  statChanges?: { reputation?: number; wealth?: number; level?: number };
  relationshipChanges?: { name: string; status: string; change?: string }[];
  inventoryUnlocks?: string[]; newAchievements?: string[]; nextSceneHint?: string;
};

const SYSTEM_PROMPT = (player: Player, worldName: string) => `You are the Revenio Simulation Engine — an AI that generates short, punchy, interactive life-simulation scenes.

Player Profile:
- Name: ${player.name}
- Age: ${player.age}
- Traits: ${player.traits.join(", ")}
- Goal: ${player.goal}
- World: ${worldName}
- Level: ${player.level}
- Reputation: ${player.reputation}
- Wealth: ${player.wealth}
- Story Progress: ${player.storyProgress}
- Major Decisions so far: ${player.majorDecisions.slice(-3).join("; ") || "none yet"}
- Relationships: ${player.relationships.map(r => r.name + " (" + r.status + ")").join(", ") || "none yet"}

RULES:
1. Keep sceneText SHORT — 2-4 punchy sentences max. No lore dumps. Show action.
2. Always include exactly 4 choices: A (safe/strategic), B (bold/risky), C (emotional/loyalty), D (create your own plan — keep text as "Create your own plan...")
3. Return ONLY valid JSON, no markdown, no backticks, no preamble.
4. Make stat changes meaningful but balanced (small integers, -5 to +8).
5. Choices should feel real and meaningful. Stakes should be clear.
6. The player's name is ${player.name} — use it naturally.
7. Make the story feel personal to their traits and goal.

Return this exact JSON format:
{
  "sceneTitle": "short dramatic title",
  "sceneText": "2-4 punchy sentences. Show action. Show stakes.",
  "choices": [
    {"id":"A","text":"choice text","type":"safe","risk":"Low","potentialOutcome":"brief outcome hint"},
    {"id":"B","text":"choice text","type":"risky","risk":"High","potentialOutcome":"brief outcome hint"},
    {"id":"C","text":"choice text","type":"loyalty","risk":"Medium","potentialOutcome":"brief outcome hint"},
    {"id":"D","text":"Create your own plan...","type":"custom","risk":"Variable","potentialOutcome":"Custom outcome"}
  ],
  "statChanges": {"reputation": 0, "wealth": 0, "level": 0},
  "relationshipChanges": [{"name":"character name","status":"ally|rival|neutral","change":"brief note"}],
  "inventoryUnlocks": [],
  "newAchievements": [],
  "nextSceneHint": "one sentence teaser"
}`;

const CHOICE_PROMPT = (player: Player, worldName: string, scene: Scene, choiceText: string, customText?: string) => `You are the Revenio Simulation Engine.

Player: ${player.name}, traits: ${player.traits.join(", ")}, goal: ${player.goal}, world: ${worldName}
Current scene: "${scene.sceneTitle}" — ${scene.sceneText}
Player chose: "${customText || choiceText}"
Player level: ${player.level}, reputation: ${player.reputation}, wealth: ${player.wealth}
Story progress: scene ${player.storyProgress}

Generate the CONSEQUENCE scene that directly follows this choice. The consequence should feel earned based on who ${player.name} is.

RULES:
1. sceneText: 2-4 punchy sentences. Show immediate consequence, then new stakes.
2. 4 choices again (A safe, B risky, C loyalty, D custom).
3. Make stat changes reflect the choice made.
4. Return ONLY valid JSON, no markdown fences.

Same JSON format as before.`;

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function StatBar({ label, value, max = 100, color }: { label: string; value: number; max?: number; color: string }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#94a3b8", marginBottom: 4 }}>
        <span>{label}</span><span>{value}</span>
      </div>
      <div style={{ height: 6, background: "#1f2937", borderRadius: 3, overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: color, transition: "width 0.4s" }} />
      </div>
    </div>
  );
}

function RiskBadge({ risk }: { risk: string }) {
  const colors: Record<string, string> = { Low: "#16a34a", Medium: "#d97706", High: "#dc2626", Variable: "#7c3aed" };
  const c = colors[risk] || "#6b7280";
  return (
    <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, padding: "3px 7px", borderRadius: 4, background: c + "22", color: c, flexShrink: 0 }}>
      {risk}
    </span>
  );
}

// ─── MAIN COMPONENT ────────────────────────────────────────────────────────────

function Revenio() {
  const sceneFn = useServerFn(simulationScene);
  const [screen, setScreen] = useState<"splash" | "create" | "world" | "game">("splash");
  const [step, setStep] = useState(0);
  const [player, setPlayer] = useState<Player>({
    name: "", age: "", traits: [], goal: "", profileImage: null,
    level: 1, reputation: 0, wealth: 0, skills: {}, relationships: [],
    inventory: [], achievements: [], titles: [], majorDecisions: [],
    currentWorld: "", currentFaction: "", storyProgress: 0,
  });
  const [scene, setScene] = useState<Scene | null>(null);
  const [loading, setLoading] = useState(false);
  const [customInput, setCustomInput] = useState("");
  const [showCustom, setShowCustom] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [statDeltas, setStatDeltas] = useState<{ reputation?: number; wealth?: number; level?: number }>({});
  const fileRef = useRef<HTMLInputElement>(null);

  const worldObj = WORLDS.find(w => w.id === player.currentWorld);

  function notify(msg: string) {
    setNotification(msg);
    setTimeout(() => setNotification(null), 2800);
  }

  function applyStatChanges(changes: NonNullable<Scene["statChanges"]>, s: Scene) {
    setPlayer(p => {
      const next = { ...p };
      if (changes.reputation) next.reputation = Math.max(0, p.reputation + changes.reputation);
      if (changes.wealth) next.wealth = Math.max(0, p.wealth + changes.wealth);
      if (changes.level && changes.level > 0) { next.level = p.level + changes.level; notify("⬆ LEVEL UP!"); }
      if (s.relationshipChanges?.length) {
        const rel = [...p.relationships];
        s.relationshipChanges.forEach(rc => {
          const idx = rel.findIndex(r => r.name === rc.name);
          if (idx >= 0) rel[idx] = { ...rel[idx], status: rc.status };
          else rel.push({ name: rc.name, status: rc.status });
        });
        next.relationships = rel;
      }
      if (s.inventoryUnlocks?.length) next.inventory = [...p.inventory, ...s.inventoryUnlocks];
      if (s.newAchievements?.length) { next.achievements = [...p.achievements, ...s.newAchievements]; notify("🏆 " + s.newAchievements[0]); }
      next.storyProgress = p.storyProgress + 1;
      return next;
    });
    setStatDeltas(changes);
    setTimeout(() => setStatDeltas({}), 2000);
  }

  async function startWorld(world: World) {
    const updated = { ...player, currentWorld: world.id };
    setPlayer(updated);
    setLoading(true);
    setScreen("game");
    try {
      const sys = SYSTEM_PROMPT(updated, world.name);
      const res = await sceneFn({ data: { systemPrompt: sys, userMessage: `Generate the opening scene for ${player.name} entering ${world.name}. Make it dramatic and immediate. Hook them in 2 sentences.` } });
      setScene(res.scene as Scene);
    } catch { notify("Error generating scene. Try again."); }
    setLoading(false);
  }

  async function makeChoice(choice: Choice, custom?: string) {
    if (!scene || !worldObj) return;
    const text = custom || choice.text;
    setPlayer(p => ({ ...p, majorDecisions: [...p.majorDecisions, text] }));
    setLoading(true);
    setShowCustom(false);
    setCustomInput("");
    try {
      const sys = CHOICE_PROMPT(player, worldObj.name, scene, choice.text, custom);
      const res = await sceneFn({ data: { systemPrompt: sys, userMessage: `Player chose: "${text}". Generate consequence scene.` } });
      const nextScene = res.scene as Scene;
      applyStatChanges(nextScene.statChanges || {}, nextScene);
      setScene(nextScene);
    } catch { notify("Error. Try again."); }
    setLoading(false);
  }

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setPlayer(p => ({ ...p, profileImage: ev.target?.result as string }));
    reader.readAsDataURL(file);
  }

  function toggleTrait(t: string) {
    setPlayer(p => {
      const has = p.traits.includes(t);
      if (has) return { ...p, traits: p.traits.filter(x => x !== t) };
      if (p.traits.length >= 3) return p;
      return { ...p, traits: [...p.traits, t] };
    });
  }

  const canProceed = [
    player.name.trim().length > 0 && Number(player.age) > 0,
    player.profileImage !== null,
    player.traits.length === 3,
    player.goal !== "",
  ];

  // ── STYLES ──────────────────────────────────────────────────────────────────

  const base: CSSProperties = {
    minHeight: "100vh",
    background: "#080b0f",
    color: "#f1f5f9",
    fontFamily: "'Georgia', 'Times New Roman', serif",
    position: "relative",
    overflow: "hidden",
  };
  const glowBg: CSSProperties = {
    position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0,
    background: "radial-gradient(ellipse at 20% 20%, rgba(124,58,237,0.08) 0%, transparent 60%), radial-gradient(ellipse at 80% 80%, rgba(6,182,212,0.06) 0%, transparent 60%)",
  };
  const card: CSSProperties = {
    background: "rgba(15,20,30,0.95)",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: 16,
    padding: 28,
    position: "relative",
    zIndex: 1,
  };
  const btn = (color = "#7c3aed", ghost = false): CSSProperties => ({
    background: ghost ? "transparent" : color,
    border: ghost ? `1px solid ${color}` : "none",
    color: ghost ? color : "#fff",
    padding: "12px 24px",
    borderRadius: 8,
    cursor: "pointer",
    fontFamily: "inherit",
    fontSize: 14,
    fontWeight: 700,
    letterSpacing: 1,
    transition: "all 0.2s",
  });

  // ── SCREENS ─────────────────────────────────────────────────────────────────

  if (screen === "splash") return (
    <div style={base}>
      <div style={glowBg} />
      <div style={{ maxWidth: 600, margin: "0 auto", padding: "120px 24px", textAlign: "center", position: "relative", zIndex: 1 }}>
        <p style={{ fontSize: 14, letterSpacing: 4, color: "#64748b", marginBottom: 12 }}>WELCOME TO</p>
        <h1 style={{ fontSize: 72, fontWeight: 900, margin: 0, background: "linear-gradient(135deg, #a78bfa, #06b6d4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", letterSpacing: 2 }}>
          REVENIO
        </h1>
        <p style={{ fontSize: 18, color: "#94a3b8", margin: "24px 0 40px", fontStyle: "italic" }}>Explore the Life You Never Lived.</p>
        <button style={btn("#7c3aed")} onClick={() => setScreen("create")}>BEGIN YOUR STORY →</button>
        <div style={{ marginTop: 60, display: "flex", justifyContent: "center", gap: 24, flexWrap: "wrap" }}>
          {["8 Worlds","AI-Powered","Choice-Driven","Your Legend"].map(t => (
            <span key={t} style={{ fontSize: 12, color: "#475569", letterSpacing: 2 }}>• {t}</span>
          ))}
        </div>
      </div>
    </div>
  );

  if (screen === "create") {
    const steps = ["Identity","Your Look","Personality","Your Goal"];
    return (
      <div style={base}>
        <div style={glowBg} />
        <div style={{ maxWidth: 560, margin: "0 auto", padding: "60px 24px" }}>
          <div style={{ display: "flex", gap: 8, marginBottom: 32 }}>
            {steps.map((s, i) => (
              <div key={s} style={{ flex: 1, textAlign: "center" }}>
                <div style={{ height: 3, background: i <= step ? "#7c3aed" : "#1f2937", borderRadius: 2, marginBottom: 6 }} />
                <div style={{ fontSize: 10, letterSpacing: 1, color: i === step ? "#a78bfa" : "#475569" }}>{s.toUpperCase()}</div>
              </div>
            ))}
          </div>

          <div style={card}>
            {step === 0 && (
              <div>
                <h2 style={{ margin: "0 0 8px", fontSize: 28 }}>Who are you?</h2>
                <p style={{ color: "#94a3b8", marginBottom: 24, fontSize: 14 }}>Your name and age define your starting point.</p>
                <input placeholder="Your name" value={player.name} onChange={e => setPlayer(p => ({ ...p, name: e.target.value }))}
                  style={{ width: "100%", background: "#111827", border: "1px solid #374151", borderRadius: 8, padding: "12px 16px", color: "#fff", fontSize: 16, fontFamily: "inherit", boxSizing: "border-box", marginBottom: 12 }} />
                <input placeholder="Your age" type="number" value={player.age} onChange={e => setPlayer(p => ({ ...p, age: e.target.value }))}
                  style={{ width: "100%", background: "#111827", border: "1px solid #374151", borderRadius: 8, padding: "12px 16px", color: "#fff", fontSize: 16, fontFamily: "inherit", boxSizing: "border-box" }} />
              </div>
            )}
            {step === 1 && (
              <div style={{ textAlign: "center" }}>
                <h2 style={{ margin: "0 0 8px", fontSize: 28 }}>Your Look</h2>
                <p style={{ color: "#94a3b8", marginBottom: 24, fontSize: 14 }}>Upload a photo to personalize your journey.</p>
                <div onClick={() => fileRef.current?.click()} style={{ width: 120, height: 120, borderRadius: "50%", background: "#111827", border: "2px dashed #374151", margin: "0 auto 16px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", fontSize: 40 }}>
                  {player.profileImage && player.profileImage !== "skip" ? <img src={player.profileImage} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : "👤"}
                </div>
                <input ref={fileRef} type="file" accept="image/*" onChange={handleImageUpload} style={{ display: "none" }} />
                <button style={btn("#7c3aed", true)} onClick={() => fileRef.current?.click()}>Upload Photo</button>
                <p style={{ color: "#475569", fontSize: 12, marginTop: 16 }}>Or skip — your legend speaks louder than your face.</p>
                {!player.profileImage && (
                  <button style={{ ...btn("#475569", true), padding: "6px 14px", fontSize: 12 }} onClick={() => setPlayer(p => ({ ...p, profileImage: "skip" }))}>Skip this step</button>
                )}
              </div>
            )}
            {step === 2 && (
              <div>
                <h2 style={{ margin: "0 0 8px", fontSize: 28 }}>Your Traits</h2>
                <p style={{ color: "#94a3b8", marginBottom: 20, fontSize: 14 }}>Choose exactly 3. These shape every decision.</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {TRAITS.map(t => {
                    const sel = player.traits.includes(t);
                    return (
                      <button key={t} onClick={() => toggleTrait(t)} style={{ padding: "8px 14px", borderRadius: 6, border: sel ? "1px solid #7c3aed" : "1px solid #374151", background: sel ? "rgba(124,58,237,0.2)" : "#111827", color: sel ? "#a78bfa" : "#9ca3af", cursor: "pointer", fontSize: 13, fontFamily: "inherit" }}>
                        {t}
                      </button>
                    );
                  })}
                </div>
                <p style={{ fontSize: 12, color: "#475569", marginTop: 16 }}>{player.traits.length}/3 selected</p>
              </div>
            )}
            {step === 3 && (
              <div>
                <h2 style={{ margin: "0 0 8px", fontSize: 28 }}>Your Goal</h2>
                <p style={{ color: "#94a3b8", marginBottom: 20, fontSize: 14 }}>What drives you above all else?</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {GOALS.map(g => {
                    const sel = player.goal === g;
                    return (
                      <button key={g} onClick={() => setPlayer(p => ({ ...p, goal: g }))} style={{ textAlign: "left", padding: "14px 18px", borderRadius: 8, border: sel ? "1px solid #7c3aed" : "1px solid #374151", background: sel ? "rgba(124,58,237,0.15)" : "#111827", color: sel ? "#e2e8f0" : "#9ca3af", cursor: "pointer", fontSize: 14, fontFamily: "inherit" }}>
                        {g}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 24, gap: 12 }}>
              {step > 0 ? <button style={btn("#475569", true)} onClick={() => setStep(s => s - 1)}>← Back</button> : <div />}
              {step < 3 ? (
                <button style={{ ...btn("#7c3aed"), opacity: canProceed[step] ? 1 : 0.4 }} disabled={!canProceed[step]} onClick={() => setStep(s => s + 1)}>Next →</button>
              ) : (
                <button style={{ ...btn("#7c3aed"), opacity: canProceed[step] ? 1 : 0.4 }} disabled={!canProceed[step]} onClick={() => setScreen("world")}>Choose Your World →</button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (screen === "world") return (
    <div style={base}>
      <div style={glowBg} />
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "60px 24px", position: "relative", zIndex: 1 }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <p style={{ color: "#64748b", letterSpacing: 3, fontSize: 12 }}>Welcome, {player.name}</p>
          <h1 style={{ fontSize: 42, margin: "8px 0" }}>Choose Your World</h1>
          <p style={{ color: "#94a3b8", fontSize: 14 }}>Each world is a lens for discovering who you become.</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
          {WORLDS.map(w => (
            <div key={w.id} onClick={() => startWorld(w)} style={{ ...card, cursor: "pointer", transition: "all 0.25s" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = w.color + "88"; e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; e.currentTarget.style.transform = "none"; }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                <span style={{ fontSize: 32 }}>{w.icon}</span>
                <div>
                  <h3 style={{ margin: 0, fontSize: 18 }}>{w.name}</h3>
                  <p style={{ margin: 0, fontSize: 11, color: w.color, letterSpacing: 1 }}>{w.tag.toUpperCase()}</p>
                </div>
              </div>
              <p style={{ color: "#94a3b8", fontSize: 13, lineHeight: 1.5, margin: "0 0 12px" }}>{w.desc}</p>
              <p style={{ color: w.color, fontSize: 12, fontWeight: 700, letterSpacing: 1, margin: 0 }}>Enter World →</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // game screen
  return (
    <div style={base}>
      <div style={glowBg} />
      {notification && (
        <div style={{ position: "fixed", top: 24, left: "50%", transform: "translateX(-50%)", background: "rgba(124,58,237,0.95)", color: "#fff", padding: "10px 20px", borderRadius: 8, zIndex: 100, fontSize: 13, fontWeight: 700, letterSpacing: 1 }}>
          {notification}
        </div>
      )}

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px", display: "grid", gridTemplateColumns: "1fr 280px", gap: 16, position: "relative", zIndex: 1 }}>
        {/* LEFT */}
        <div>
          <div style={{ ...card, padding: 16, display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
            <span style={{ fontSize: 28 }}>{worldObj?.icon}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800 }}>{worldObj?.name}</div>
              <div style={{ fontSize: 11, color: "#475569" }}>Scene {player.storyProgress + 1} · {player.name}</div>
            </div>
            <button style={{ ...btn("#475569", true), padding: "6px 12px", fontSize: 12 }} onClick={() => { setScreen("world"); setScene(null); setPlayer(p => ({ ...p, currentWorld: "", storyProgress: 0, majorDecisions: [] })); }}>
              ← Worlds
            </button>
          </div>

          {loading ? (
            <div style={{ ...card, textAlign: "center", padding: 60 }}>
              <div style={{ fontSize: 40, animation: "spin 1.4s linear infinite", display: "inline-block" }}>⟳</div>
              <p style={{ color: "#64748b", letterSpacing: 2, fontSize: 12, marginTop: 16 }}>GENERATING YOUR STORY...</p>
              <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
            </div>
          ) : scene ? (
            <div>
              <div style={{ ...card, marginBottom: 16 }}>
                <h2 style={{ margin: "0 0 12px", fontSize: 24, color: worldObj?.color }}>{scene.sceneTitle}</h2>
                <p style={{ color: "#e2e8f0", fontSize: 15, lineHeight: 1.7, whiteSpace: "pre-line" }}>{scene.sceneText}</p>
                {scene.nextSceneHint && (
                  <p style={{ color: "#475569", fontSize: 12, fontStyle: "italic", marginTop: 16, borderTop: "1px solid #1f2937", paddingTop: 12 }}>
                    Next: {scene.nextSceneHint}
                  </p>
                )}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {scene.choices?.map(choice => (
                  <div key={choice.id}>
                    {choice.type === "custom" ? (
                      showCustom ? (
                        <div style={{ ...card, padding: 16 }}>
                          <textarea placeholder="Describe your own plan..." value={customInput} onChange={e => setCustomInput(e.target.value)}
                            style={{ width: "100%", background: "#111827", border: "1px solid #374151", borderRadius: 8, padding: 12, color: "#fff", fontSize: 14, fontFamily: "inherit", resize: "vertical", minHeight: 80, boxSizing: "border-box" }} />
                          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                            <button style={{ ...btn("#7c3aed"), flex: 1 }} onClick={() => customInput.trim() && makeChoice(choice, customInput.trim())} disabled={!customInput.trim()}>
                              Submit My Plan
                            </button>
                            <button style={btn("#374151")} onClick={() => setShowCustom(false)}>Cancel</button>
                          </div>
                        </div>
                      ) : (
                        <button onClick={() => setShowCustom(true)} style={{ width: "100%", ...card, padding: "14px 18px", cursor: "pointer", textAlign: "left", display: "flex", alignItems: "center", justifyContent: "space-between", border: "1px dashed #374151" }}>
                          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                            <span style={{ width: 24, height: 24, borderRadius: 4, background: "#7c3aed22", color: "#7c3aed", fontSize: 12, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>D</span>
                            <span style={{ color: "#a78bfa", fontSize: 14 }}>{choice.text}</span>
                          </div>
                          <RiskBadge risk={choice.risk} />
                        </button>
                      )
                    ) : (
                      <button onClick={() => makeChoice(choice)} style={{ width: "100%", ...card, padding: "14px 18px", cursor: "pointer", textAlign: "left", display: "flex", alignItems: "flex-start", gap: 12 }}>
                        <span style={{ width: 24, height: 24, borderRadius: 4, background: (worldObj?.color || "#7c3aed") + "22", color: worldObj?.color || "#7c3aed", fontSize: 12, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>{choice.id}</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ color: "#e2e8f0", fontSize: 14, marginBottom: 4 }}>{choice.text}</div>
                          <div style={{ color: "#475569", fontSize: 12, fontStyle: "italic" }}>{choice.potentialOutcome}</div>
                        </div>
                        <RiskBadge risk={choice.risk} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        {/* RIGHT */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ ...card, padding: 16, textAlign: "center" }}>
            <div style={{ width: 60, height: 60, borderRadius: "50%", margin: "0 auto 10px", overflow: "hidden", background: "#111827", border: `2px solid ${worldObj?.color || "#7c3aed"}` }}>
              {player.profileImage && player.profileImage !== "skip" ? <img src={player.profileImage} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" /> : <div style={{ fontSize: 28, lineHeight: "60px" }}>👤</div>}
            </div>
            <div style={{ fontWeight: 800, fontSize: 15 }}>{player.name}</div>
            <div style={{ fontSize: 11, color: "#475569", marginBottom: 8 }}>Age {player.age} · {player.goal}</div>
            <div style={{ display: "inline-block", padding: "3px 10px", borderRadius: 20, background: (worldObj?.color || "#7c3aed") + "22", color: worldObj?.color || "#7c3aed", fontSize: 11, fontWeight: 700 }}>
              LVL {player.level}
            </div>
          </div>

          <div style={{ ...card, padding: 16 }}>
            <div style={{ fontSize: 10, letterSpacing: 2, color: "#475569", textTransform: "uppercase", marginBottom: 12 }}>Stats</div>
            <StatBar label="Reputation" value={player.reputation} max={200} color="#7c3aed" />
            <StatBar label="Wealth" value={player.wealth} max={1000} color="#f59e0b" />
            {statDeltas.reputation ? (
              <div style={{ fontSize: 12, color: statDeltas.reputation > 0 ? "#4ade80" : "#f87171", textAlign: "right" }}>
                Rep {statDeltas.reputation > 0 ? "+" : ""}{statDeltas.reputation}
              </div>
            ) : null}
          </div>

          <div style={{ ...card, padding: 16 }}>
            <div style={{ fontSize: 10, letterSpacing: 2, color: "#475569", textTransform: "uppercase", marginBottom: 10 }}>Traits</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {player.traits.map(t => (
                <span key={t} style={{ fontSize: 11, padding: "3px 8px", borderRadius: 4, background: "#1f2937", color: "#94a3b8" }}>{t}</span>
              ))}
            </div>
          </div>

          {player.relationships.length > 0 && (
            <div style={{ ...card, padding: 16 }}>
              <div style={{ fontSize: 10, letterSpacing: 2, color: "#475569", textTransform: "uppercase", marginBottom: 10 }}>Relations</div>
              {player.relationships.slice(0, 5).map(r => (
                <div key={r.name} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 6 }}>
                  <span style={{ color: "#9ca3af" }}>{r.name}</span>
                  <span style={{ color: r.status === "ally" ? "#4ade80" : r.status === "rival" ? "#f87171" : "#6b7280", fontSize: 10 }}>{r.status}</span>
                </div>
              ))}
            </div>
          )}

          {player.inventory.length > 0 && (
            <div style={{ ...card, padding: 16 }}>
              <div style={{ fontSize: 10, letterSpacing: 2, color: "#475569", textTransform: "uppercase", marginBottom: 10 }}>Inventory</div>
              {player.inventory.slice(0, 4).map((item, i) => (
                <div key={i} style={{ fontSize: 12, color: "#9ca3af", marginBottom: 4 }}>· {item}</div>
              ))}
            </div>
          )}

          {player.majorDecisions.length > 0 && (
            <div style={{ ...card, padding: 16 }}>
              <div style={{ fontSize: 10, letterSpacing: 2, color: "#475569", textTransform: "uppercase", marginBottom: 10 }}>Story ({player.storyProgress} scenes)</div>
              {player.majorDecisions.slice(-3).map((d, i) => (
                <div key={i} style={{ fontSize: 11, color: "#64748b", marginBottom: 4, fontStyle: "italic" }}>"{d.length > 50 ? d.slice(0, 50) + "…" : d}"</div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
