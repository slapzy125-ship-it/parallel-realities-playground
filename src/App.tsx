import { useState } from "react";

type Screen = "splash" | "creation" | "worldselect" | "game";

const TRAITS = ["Ambitious","Loyal","Brave","Competitive","Intelligent","Creative","Confident","Curious","Ruthless","Charismatic"];
const GOALS = ["Become a Legend","Gain Power","Build an Empire","Become Rich","Save the World","Discover the Unknown"];
const WORLDS = [
  { name: "Arcane Academy", desc: "A school of forbidden magic" },
  { name: "Galactic Frontier", desc: "Pioneer the edge of known space" },
  { name: "Dragonfall Kingdoms", desc: "Medieval intrigue and dragons" },
  { name: "Neon Dominion", desc: "Cyberpunk power struggles" },
  { name: "Hero Nexus", desc: "A world of supers and villains" },
  { name: "Shadow Guild", desc: "Thieves, assassins, and secrets" },
  { name: "Champions Legacy", desc: "Rise through pro sports" },
  { name: "Eternal Odyssey", desc: "Ancient mythic adventure" },
];

const GOLD = "#d4af37";
const BLACK = "#000000";
const PANEL = "#0a0a0a";
const BORDER = "#3a2e10";

const btnBase: React.CSSProperties = {
  background: "transparent",
  color: GOLD,
  border: `1px solid ${GOLD}`,
  padding: "12px 20px",
  fontFamily: "Cinzel, serif",
  textTransform: "uppercase",
  letterSpacing: "0.1em",
  cursor: "pointer",
  fontSize: 14,
  transition: "all 0.2s",
};

const selectedBtn: React.CSSProperties = {
  ...btnBase,
  background: GOLD,
  color: BLACK,
  fontWeight: 700,
};

function Logo({ size = "clamp(2.5rem, 8vw, 6rem)" }: { size?: string }) {
  return (
    <h1 style={{
      fontFamily: "Cinzel, serif",
      color: GOLD,
      fontSize: size,
      letterSpacing: "0.3em",
      margin: 0,
      textTransform: "uppercase",
      textShadow: `0 0 30px ${GOLD}55`,
    }}>REVENIO</h1>
  );
}

export default function App() {
  const [screen, setScreen] = useState<Screen>("splash");
  const [name, setName] = useState("");
  const [traits, setTraits] = useState<string[]>([]);
  const [goal, setGoal] = useState<string>("");
  const [world, setWorld] = useState<string>("");

  const toggleTrait = (t: string) => {
    setTraits(prev =>
      prev.includes(t) ? prev.filter(x => x !== t) : prev.length < 3 ? [...prev, t] : prev
    );
  };

  const shell: React.CSSProperties = {
    minHeight: "100vh",
    background: BLACK,
    color: GOLD,
    fontFamily: "Cinzel, serif",
    boxSizing: "border-box",
    overflowY: "auto",
  };

  if (screen === "splash") {
    return (
      <div style={{ ...shell, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, textAlign: "center" }}>
        <Logo />
        <p style={{ color: "#9a8550", letterSpacing: "0.25em", textTransform: "uppercase", fontSize: 12, marginTop: 16 }}>
          Explore the Life You Never Lived
        </p>
        <button
          onClick={() => setScreen("creation")}
          style={{ ...btnBase, marginTop: 48, padding: "16px 32px", fontSize: 16 }}
        >
          Begin Your Legend
        </button>
      </div>
    );
  }

  if (screen === "creation") {
    const canContinue = name.trim() && traits.length === 3 && goal;
    return (
      <div style={{ ...shell, padding: "40px 24px" }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <Logo size="clamp(1.5rem, 4vw, 2.5rem)" />
          <h2 style={{ marginTop: 32, letterSpacing: "0.2em", textTransform: "uppercase", fontSize: 14, color: "#9a8550" }}>Forge Your Identity</h2>

          <label style={{ display: "block", marginTop: 24, fontSize: 12, letterSpacing: "0.2em", textTransform: "uppercase", color: "#9a8550" }}>Name</label>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Enter your name"
            style={{
              width: "100%", boxSizing: "border-box", marginTop: 8,
              background: PANEL, border: `1px solid ${BORDER}`, color: GOLD,
              padding: "12px 16px", fontFamily: "Cinzel, serif", fontSize: 16, outline: "none",
            }}
          />

          <h3 style={{ marginTop: 32, fontSize: 12, letterSpacing: "0.2em", textTransform: "uppercase", color: "#9a8550" }}>
            Pick 3 Traits ({traits.length}/3)
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 10, marginTop: 12 }}>
            {TRAITS.map(t => (
              <button key={t} onClick={() => toggleTrait(t)} style={traits.includes(t) ? selectedBtn : btnBase}>
                {t}
              </button>
            ))}
          </div>

          <h3 style={{ marginTop: 32, fontSize: 12, letterSpacing: "0.2em", textTransform: "uppercase", color: "#9a8550" }}>Choose Your Goal</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 10, marginTop: 12 }}>
            {GOALS.map(g => (
              <button key={g} onClick={() => setGoal(g)} style={goal === g ? selectedBtn : btnBase}>
                {g}
              </button>
            ))}
          </div>

          <div style={{ marginTop: 40, display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
            <button onClick={() => setScreen("splash")} style={{ ...btnBase, opacity: 0.7 }}>Back</button>
            <button
              onClick={() => canContinue && setScreen("worldselect")}
              disabled={!canContinue}
              style={{ ...btnBase, opacity: canContinue ? 1 : 0.3, cursor: canContinue ? "pointer" : "not-allowed" }}
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (screen === "worldselect") {
    return (
      <div style={{ ...shell, padding: "40px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <Logo size="clamp(1.5rem, 4vw, 2.5rem)" />
          <h2 style={{ marginTop: 32, letterSpacing: "0.2em", textTransform: "uppercase", fontSize: 14, color: "#9a8550" }}>Choose Your World</h2>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 16, marginTop: 24 }}>
            {WORLDS.map(w => (
              <button
                key={w.name}
                onClick={() => { setWorld(w.name); setScreen("game"); }}
                style={{
                  background: PANEL, border: `1px solid ${BORDER}`, color: GOLD,
                  padding: 20, textAlign: "left", cursor: "pointer", fontFamily: "Cinzel, serif",
                  transition: "all 0.2s", minHeight: 140,
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = GOLD; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = BORDER; }}
              >
                <div style={{ fontSize: 16, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 8 }}>{w.name}</div>
                <div style={{ fontSize: 13, color: "#9a8550", fontFamily: "serif", lineHeight: 1.5 }}>{w.desc}</div>
              </button>
            ))}
          </div>

          <div style={{ marginTop: 32 }}>
            <button onClick={() => setScreen("creation")} style={{ ...btnBase, opacity: 0.7 }}>Back</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ ...shell, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ textAlign: "center" }}>
        <Logo size="clamp(2rem, 5vw, 3rem)" />
        <p style={{ marginTop: 24, letterSpacing: "0.3em", textTransform: "uppercase", fontSize: 14 }}>Game Loading</p>
        <p style={{ marginTop: 12, color: "#9a8550", fontSize: 12 }}>
          {name} · {world} · {goal}
        </p>
      </div>
    </div>
  );
}
