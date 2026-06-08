import { useState } from "react";

type Screen = "splash" | "creation" | "worldselect" | "game";

const TRAITS = ["Ambitious","Loyal","Brave","Competitive","Intelligent","Creative","Confident","Curious","Ruthless","Charismatic"];
const GOALS = ["Become a Legend","Gain Power","Build an Empire","Become Rich","Save the World","Discover the Unknown"];
const WORLDS = [
  { id:'arcane', name:'Arcane Academy', icon:'🔮', desc:"Enter the world's greatest magical academy.", theme:'MAGIC · POWER · RIVALRY', villain:'The Hollow Mage', factions:['House Aetheris','House Drakemore','House Umbra','House Sylvara'], startStat:{Spellcasting:20,Knowledge:20,Courage:15,Control:15,HousePoints:0}, startItems:['📚 Spellbook'], startQuests:[{name:'Choose Your House',desc:'Attend the Sorting Ceremony tonight.'}], startRels:[{name:'Prof. Aldric',type:'Mentor',val:60,dir:'friend'},{name:'Kira Voss',type:'Rival',val:30,dir:'rival'}], startNews:['The Hollow Mage was sighted near the east tower.'] },
  { id:'champions', name:'Champions Legacy', icon:'⚽', desc:'From unknown youth to global icon.', theme:'FAME · SACRIFICE · RIVALRY', villain:'Adrian Vega', factions:['Crimson United','Royal Blue Academy','Blackstone FC','Golden City Academy'], startStat:{Overall:45,Speed:40,Skill:38,Shooting:35,Passing:40,Stamina:60}, startItems:['👟 Academy Boots'], startQuests:[{name:'First Trial',desc:"Impress the coaches at the trial match."}], startRels:[{name:'Coach Ramos',type:'Coach',val:50,dir:'friend'},{name:'Luca Moretti',type:'Rival',val:20,dir:'rival'}], startNews:['Adrian Vega signs record deal.'] },
  { id:'galactic', name:'Galactic Frontier', icon:'🚀', desc:'Command a starship across the stars.', theme:'FREEDOM · REBELLION · ORDER', villain:'Emperor Vexis', factions:['Vanguard Alliance','Iron Dominion','Nova Syndicate','Celestial Order'], startStat:{Piloting:30,Combat:25,Diplomacy:20,CrewLoyalty:50,Credits:1000,GalacticRep:0}, startItems:['⚔️ Energy Saber'], startQuests:[{name:'First Voyage',desc:'Establish your first alliance.'}], startRels:[{name:'Commander Lyra',type:'Ally',val:60,dir:'friend'},{name:'Admiral Kross',type:'Enemy',val:10,dir:'rival'}], startNews:['Emperor Vexis expands into Sector 7.'] },
  { id:'hero', name:'Hero Nexus', icon:'⚡', desc:'Rise from rookie to the number 1 hero.', theme:'POWER · FAME · SACRIFICE', villain:'The Null', factions:['Titan Academy','Sentinel Academy','Nexus Institute','Phoenix Academy'], startStat:{Power:30,Control:20,Courage:35,PublicTrust:40,HeroRank:99,Teamwork:30}, startItems:['🦸 Hero Suit'], startQuests:[{name:'First Mission',desc:'Respond to the distress call downtown.'}], startRels:[{name:'Director Crane',type:'Handler',val:55,dir:'friend'},{name:'Shadow Wolf',type:'Rival',val:25,dir:'rival'}], startNews:['The Null disables three heroes.'] },
  { id:'dragonfall', name:'Dragonfall Kingdoms', icon:'🐉', desc:'Command armies and claim the throne.', theme:'LEGACY · POWER · LOYALTY', villain:'King Malakar', factions:['Emberhold','Frostmere','Thornvale','Goldcrest'], startStat:{Leadership:25,ArmyStrength:30,DragonBond:10,Diplomacy:20,Territory:1,Gold:500}, startItems:['🗡️ Dragonsteel Blade'], startQuests:[{name:'Prove Your Worth',desc:'Win the Regional Tournament.'}], startRels:[{name:'Lord Eryn',type:'Advisor',val:65,dir:'friend'},{name:'Lord Kael',type:'Rival',val:20,dir:'rival'}], startNews:['King Malakar invades the northern border.'] },
  { id:'shadow', name:'Shadow Guild', icon:'🕶️', desc:'Rise through secret ranks. Trust no one.', theme:'DECEPTION · POWER · LOYALTY', villain:'The Black Regent', factions:['Night Ravens','Phantom Circle','Iron Blades','Whisper Network'], startStat:{Stealth:30,Influence:15,Trust:50,Resources:200,Reputation:0,DistrictControl:0}, startItems:['🗡️ Shadow Blades'], startQuests:[{name:'First Contract',desc:'Complete your initiation mission.'}], startRels:[{name:'Handler Zero',type:'Contact',val:60,dir:'friend'},{name:'The Fox',type:'Rival',val:15,dir:'rival'}], startNews:['The Black Regent tightens grip on east district.'] },
  { id:'neon', name:'Neon Domination', icon:'🌆', desc:'Hack the system and dominate the city.', theme:'WEALTH · TECH · CONTROL', villain:'Director Kron', factions:['Helix Industries','NovaCore','Synapse Systems','Apex Dynamics'], startStat:{Wealth:5000,Influence:10,Cybernetics:5,Hacking:20,CorporatePower:0,StreetRep:30}, startItems:['🕶️ Cyber Visor'], startQuests:[{name:'First Hack',desc:'Breach the rival server.'}], startRels:[{name:'Sable',type:'Ally',val:55,dir:'friend'},{name:'Dir. Kron',type:'Enemy',val:5,dir:'rival'}], startNews:['Director Kron announces citywide AI surveillance.'] },
  { id:'odyssey', name:'Eternal Odyssey', icon:'⚔️', desc:"Answer destiny's call. Face the Eternal King.", theme:'DESTINY · COURAGE · DISCOVERY', villain:'The Eternal King', factions:['Dawnseekers','Moonwardens','Stormforged','Celestial Keepers'], startStat:{Courage:30,Wisdom:25,Strength:35,ArtifactPower:0,MythicRep:0,Exploration:10}, startItems:['🛡️ Bronze Spear'], startQuests:[{name:'The First Trial',desc:"Complete the Oracle's trial."}], startRels:[{name:'Sage Pyrene',type:'Oracle',val:70,dir:'friend'},{name:'General Vorn',type:'Enemy',val:10,dir:'rival'}], startNews:['The Eternal King stirs beyond the Rift.'] },
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
  const [world, setWorld] = useState<typeof WORLDS[number] | null>(null);

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
                onClick={() => { setWorld(w); setScreen("game"); }}
                style={{
                  background: PANEL, border: `1px solid ${BORDER}`, color: GOLD,
                  padding: 20, textAlign: "left", cursor: "pointer", fontFamily: "Cinzel, serif",
                  transition: "all 0.2s", minHeight: 140,
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = GOLD; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = BORDER; }}
              >
                <div style={{ fontSize: 24, marginBottom: 8 }}>{w.icon}</div>
                <div style={{ fontSize: 16, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 4 }}>{w.name}</div>
                <div style={{ fontSize: 12, letterSpacing: "0.15em", textTransform: "uppercase", color: GOLD, opacity: 0.6, marginBottom: 8 }}>{w.theme}</div>
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
          {world && <p style={{ marginTop: 12, color: "#9a8550", fontSize: 12 }}>
            {name} · {world.name} · {goal}
          </p>}
      </div>
    </div>
  );
}
