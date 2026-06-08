import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useRef, useCallback, CSSProperties } from "react";
import { useServerFn } from "@tanstack/react-start";
import { simulationScene } from "@/lib/simulation.functions";

export const Route = createFileRoute("/simulation")({
  component: SimulationPage,
  head: () => ({
    meta: [
      { title: "Revenio — Explore the Life You Never Lived" },
      { name: "description", content: "AI-powered alternate-life simulation. Choose a world. Build your legend." },
    ],
  }),
});

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────────
const C = {
  gold: "#D4A843", gold2: "#F0C060", gold3: "#8B6914",
  bg: "#0A0A0C", bg2: "#0F0F14",
  surface: "#1A1A24", surface2: "#20202E",
  text: "#E8E4D8", muted: "#7A7A8A",
  border: "#2A2A3A", border2: "#3A3A4A",
  green: "#4ade80", red: "#f87171", purple: "#a78bfa", blue: "#60a5fa", amber: "#fbbf24",
};

const FONT_HEAD = "'Cinzel', serif";
const FONT_BODY = "'Rajdhani', sans-serif";
const FONT_NUM = "'Orbitron', sans-serif";

const CLIP = "polygon(8px 0, 100% 0, calc(100% - 8px) 100%, 0 100%)";

// ─── DATA ─────────────────────────────────────────────────────────────────────
const TRAITS = ["Ambitious","Loyal","Brave","Competitive","Intelligent","Creative","Confident","Curious","Ruthless","Charismatic"];
const GOALS = ["Become a Legend","Gain Power","Build an Empire","Become Rich","Save the World","Discover the Unknown"];

type WorldDef = {
  id: string; name: string; icon: string; desc: string; theme: string;
  factions: string[]; villain: string;
  startStat: Record<string, number>;
  locations: string[]; startItems: string[];
  startQuests: { name: string; desc: string }[];
  startRels: { name: string; type: string; val: number; dir: "friend"|"rival"|"neutral" }[];
  startNews: string[];
};

const WORLDS: WorldDef[] = [
  { id:'arcane', name:'Arcane Academy', icon:'🔮',
    desc:"Enter the world's greatest magical academy. Wield power, forge alliances, face the Hollow Mage.",
    theme:'MAGIC · POWER · RIVALRY',
    factions:['House Aetheris','House Drakemore','House Umbra','House Sylvara'],
    villain:'The Hollow Mage',
    startStat:{ Spellcasting:20, Knowledge:20, Courage:15, Control:15, HousePoints:0 },
    locations:['Courtyard','Great Hall','Dormitories','Dueling Arena','Forbidden Library','Potion Hall'],
    startItems:['📚 Spellbook'],
    startQuests:[{ name:'Choose Your House', desc:'Attend the Sorting Ceremony tonight.' }],
    startRels:[{ name:'Prof. Aldric', type:'Mentor', val:60, dir:'friend' },{ name:'Kira Voss', type:'Rival', val:30, dir:'rival' }],
    startNews:['The Hollow Mage was sighted near the east tower.','House championship begins next month.','New forbidden tomes discovered in the archive.'] },
  { id:'champions', name:'Champions Legacy', icon:'⚽',
    desc:'From unknown youth to global icon. Train, compete, and become the greatest athlete ever.',
    theme:'FAME · SACRIFICE · RIVALRY',
    factions:['Crimson United','Royal Blue Academy','Blackstone FC','Golden City Academy'],
    villain:'Adrian Vega',
    startStat:{ Overall:45, Speed:40, Skill:38, Shooting:35, Passing:40, Stamina:60 },
    locations:['Training Ground','Stadium','Gym','Scout Event','Press Room','Academy HQ'],
    startItems:['👟 Academy Boots'],
    startQuests:[{ name:'First Trial', desc:"Impress the coaches at tomorrow's trial match." }],
    startRels:[{ name:'Coach Ramos', type:'Coach', val:50, dir:'friend' },{ name:'Luca Moretti', type:'Rival', val:20, dir:'rival' }],
    startNews:['Adrian Vega signs record deal with Golden City.','Youth tournament registrations now open.','Scouts from Royal Blue spotted in the region.'] },
  { id:'galactic', name:'Galactic Frontier', icon:'🚀',
    desc:'Command a starship, choose your faction, and carve a legend across the stars.',
    theme:'FREEDOM · REBELLION · ORDER',
    factions:['Vanguard Alliance','Iron Dominion','Nova Syndicate','Celestial Order'],
    villain:'Emperor Vexis',
    startStat:{ Piloting:30, Combat:25, Diplomacy:20, CrewLoyalty:50, Credits:1000, GalacticRep:0 },
    locations:['Bridge','Hangar','Trade Station','Combat Zone','Celestial Ruins',"Emperor's Domain"],
    startItems:['⚔️ Energy Saber'],
    startQuests:[{ name:'First Voyage', desc:'Plot a course and establish your first alliance.' }],
    startRels:[{ name:'Commander Lyra', type:'Ally', val:60, dir:'friend' },{ name:'Admiral Kross', type:'Enemy', val:10, dir:'rival' }],
    startNews:['Emperor Vexis expands territory into Sector 7.','Vanguard Alliance seeks new pilots.','Mysterious signal detected from the outer rim.'] },
  { id:'hero', name:'Hero Nexus', icon:'⚡',
    desc:'Rise from rookie to #1 hero. Master your powers, earn public trust, face The Null.',
    theme:'POWER · FAME · SACRIFICE',
    factions:['Titan Academy','Sentinel Academy','Nexus Institute','Phoenix Academy'],
    villain:'The Null',
    startStat:{ Power:30, Control:20, Courage:35, PublicTrust:40, HeroRank:99, Teamwork:30 },
    locations:['Training Hall','City Center','Hero HQ','Crisis Zone','Media Plaza','Villain Lair'],
    startItems:['🦸 Hero Suit'],
    startQuests:[{ name:'First Mission', desc:'Respond to the distress call downtown.' }],
    startRels:[{ name:'Director Crane', type:'Handler', val:55, dir:'friend' },{ name:'Shadow Wolf', type:'Rival', val:25, dir:'rival' }],
    startNews:['The Null disables three heroes in downtown incident.','Hero Rankings updated — top spot still open.','New hero academy accepting applications.'] },
  { id:'dragonfall', name:'Dragonfall Kingdoms', icon:'🐉',
    desc:'Command armies, bond with dragons, and claim the throne of the realm.',
    theme:'LEGACY · POWER · LOYALTY',
    factions:['Emberhold','Frostmere','Thornvale','Goldcrest'],
    villain:'King Malakar',
    startStat:{ Leadership:25, ArmyStrength:30, DragonBond:10, Diplomacy:20, Territory:1, Gold:500 },
    locations:['Throne Room','Battleground','Dragon Eyrie','Trade Port','Rival Kingdom','Ancient Ruins'],
    startItems:['🗡️ Dragonsteel Blade'],
    startQuests:[{ name:'Prove Your Worth', desc:'Win the Regional Tournament to claim your title.' }],
    startRels:[{ name:'Lord Eryn', type:'Advisor', val:65, dir:'friend' },{ name:'Lord Kael', type:'Rival', val:20, dir:'rival' }],
    startNews:["King Malakar invades Thornvale's northern border.",'Dragon eggs discovered near the Crystal Peaks.','Goldcrest seeks new alliance partners.'] },
  { id:'shadow', name:'Shadow Guild', icon:'🗡️',
    desc:'Rise through secret ranks, control the city, survive betrayal. Trust no one.',
    theme:'DECEPTION · POWER · LOYALTY',
    factions:['Night Ravens','Phantom Circle','Iron Blades','Whisper Network'],
    villain:'The Black Regent',
    startStat:{ Stealth:30, Influence:15, Trust:50, Resources:200, Reputation:0, DistrictControl:0 },
    locations:['Safe House','Black Market','City Hall','Rival Territory','The Vault',"Regent's Tower"],
    startItems:['🗡️ Shadow Blades'],
    startQuests:[{ name:'First Contract', desc:'Complete your initiation mission for the guild.' }],
    startRels:[{ name:'Handler Zero', type:'Contact', val:60, dir:'friend' },{ name:'The Fox', type:'Rival', val:15, dir:'rival' }],
    startNews:['The Black Regent tightens grip on east district.','A double agent was discovered in the Phantom Circle.','New bounty posted — identity unknown.'] },
  { id:'neon', name:'Neon Domination', icon:'🌆',
    desc:'In a cyberpunk future, hack the system, build corporate power, and dominate the city.',
    theme:'WEALTH · TECH · CONTROL',
    factions:['Helix Industries','NovaCore','Synapse Systems','Apex Dynamics'],
    villain:'Director Kron',
    startStat:{ Wealth:5000, Influence:10, Cybernetics:5, Hacking:20, CorporatePower:0, StreetRep:30 },
    locations:['Corporate HQ','Neon Markets','Server Farm','Street Level',"Director's Tower",'Underground'],
    startItems:['🕶️ Cyber Visor'],
    startQuests:[{ name:'First Hack', desc:'Breach the rival server and steal their prototype data.' }],
    startRels:[{ name:'Sable', type:'Ally', val:55, dir:'friend' },{ name:'Dir. Kron', type:'Enemy', val:5, dir:'rival' }],
    startNews:['Director Kron announces citywide AI surveillance.','Helix Industries stock hits record high.','Underground resistance grows in Sector 9.'] },
  { id:'odyssey', name:'Eternal Odyssey', icon:'⚔️',
    desc:"Answer destiny's call, claim mythic relics, and face the immortal Eternal King.",
    theme:'DESTINY · COURAGE · DISCOVERY',
    factions:['Dawnseekers','Moonwardens','Stormforged','Celestial Keepers'],
    villain:'The Eternal King',
    startStat:{ Courage:30, Wisdom:25, Strength:35, ArtifactPower:0, MythicRep:0, Exploration:10 },
    locations:['Oracle Temple','Ancient Ruins','Colosseum','Mystic Forest',"Titan's Peak",'Eternal Gate'],
    startItems:['🛡️ Bronze Spear'],
    startQuests:[{ name:'The First Trial', desc:"Complete the Oracle's trial and receive your mythic title." }],
    startRels:[{ name:'Sage Pyrene', type:'Oracle', val:70, dir:'friend' },{ name:'General Vorn', type:'Enemy', val:10, dir:'rival' }],
    startNews:['The Eternal King stirs beyond the Rift.','Celestial Keepers seek a new champion.',"Rare artifact discovered near the Titan's Peak."] },
];

// ─── TYPES ────────────────────────────────────────────────────────────────────
type Rel = { name:string; type:string; val:number; dir:'friend'|'rival'|'neutral' };
type Quest = { name:string; desc:string; done:boolean };
type Choice = { id:string; text:string; type:string; risk:string; hint:string };
type Scene = {
  sceneTitle:string; sceneText:string; choices:Choice[];
  statChanges?:Record<string,number>; xpGained?:number; reputationChange?:number;
  relationshipChanges?:{ name:string; change:number; dir?:Rel['dir']; newEvent?:string }[];
  inventoryUnlocks?:string[]; questUpdates?:Quest[]; newQuests?:Quest[];
  newAchievements?:string[]; newsUpdates?:string[]; worldStateUpdates?:Record<string,unknown>;
  nextSceneHint?:string;
};
type Msg = { role:'user'|'assistant'; content:string };
type PlayerState = {
  name:string; age:number; traits:string[]; goal:string;
  level:number; xp:number; xpNext:number; reputation:number;
  currentWorld:string; currentLocation:string; currentFaction:string;
  skills:Record<string,number>; relationships:Rel[]; inventory:string[];
  quests:Quest[]; achievements:string[]; majorDecisions:string[];
  storyProgress:number; worldState:Record<string,unknown>; newsHistory:string[];
};
type Notif = { id:number; kind:'stat+'|'stat-'|'xp'|'level'|'item'|'quest'|'ach'|'rel+'|'rel-'; text:string };
type SaveBlob = { player:PlayerState; history:Msg[]; scene:Scene|null };

const SAVE_KEY = "revenio_save";

// ─── SYSTEM PROMPT ────────────────────────────────────────────────────────────
function buildSystemPrompt(p: PlayerState): string {
  const w = WORLDS.find(x => x.id === p.currentWorld)!;
  return `You are the AI game master for REVENIO, an alternate-life simulation game.

CURRENT WORLD: ${w.name}
VILLAIN: ${w.villain}
FACTIONS: ${w.factions.join(', ')}
LOCATIONS: ${w.locations.join(', ')}

PLAYER:
- Name: ${p.name}, Age: ${p.age}
- Traits: ${p.traits.join(', ')}
- Goal: ${p.goal}
- Level: ${p.level}, XP: ${p.xp}/${p.xpNext}
- Current Location: ${p.currentLocation}
- Stats: ${JSON.stringify(p.skills)}
- Relationships: ${JSON.stringify(p.relationships)}
- Active Quests: ${JSON.stringify(p.quests.filter(q => !q.done))}
- Inventory: ${p.inventory.join(', ')}
- Major Decisions: ${p.majorDecisions.slice(-3).join(', ')}
- Story Progress: ${p.storyProgress}

RULES:
1. Scenes must be 40-80 words maximum
2. Always return exactly 4 choices
3. Make the world react to player stats and prior decisions
4. Reference the villain and rivals naturally as story progresses
5. Keep content appropriate for teens
6. Make stat changes meaningful and visible

Respond ONLY with this JSON, no markdown, no backticks, no extra text:
{
  "sceneTitle": "Short dramatic title",
  "sceneText": "40-80 word cinematic scene",
  "choices": [
    {"id":"A","text":"Choice text","type":"bold","risk":"Low","hint":"Short hint"},
    {"id":"B","text":"Choice text","type":"strategic","risk":"Medium","hint":"Short hint"},
    {"id":"C","text":"Choice text","type":"cautious","risk":"High","hint":"Short hint"},
    {"id":"D","text":"Write your own action","type":"custom","risk":"Variable","hint":"Your path"}
  ],
  "statChanges": {"StatName": 5},
  "xpGained": 15,
  "reputationChange": 3,
  "relationshipChanges": [{"name":"Name","change":10,"dir":"friend","newEvent":"note"}],
  "inventoryUnlocks": [],
  "questUpdates": [],
  "newQuests": [],
  "newAchievements": [],
  "newsUpdates": [],
  "worldStateUpdates": {},
  "nextSceneHint": "What comes next"
}`;
}

// ─── FONT LOADER ──────────────────────────────────────────────────────────────
function useFonts() {
  useEffect(() => {
    const id = "revenio-fonts";
    if (document.getElementById(id)) return;
    const l = document.createElement("link");
    l.id = id; l.rel = "stylesheet";
    l.href = "https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Rajdhani:wght@300;400;500;600;700&family=Orbitron:wght@400;600;700&display=swap";
    document.head.appendChild(l);
  }, []);
}

// ─── SHARED UI ────────────────────────────────────────────────────────────────
function GoldButton({ children, onClick, disabled, style }:{ children:React.ReactNode; onClick?:()=>void; disabled?:boolean; style?:CSSProperties }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      background: disabled ? C.surface2 : `linear-gradient(135deg, ${C.gold2}, ${C.gold} 50%, ${C.gold3})`,
      color: disabled ? C.muted : "#0A0A0C",
      border: "none", padding: "14px 28px", cursor: disabled?"not-allowed":"pointer",
      fontFamily: FONT_BODY, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", fontSize: 13,
      clipPath: CLIP, transition: "transform .15s, filter .15s", boxShadow: disabled ? "none" : `0 6px 20px ${C.gold}40`,
      ...style,
    }}
      onMouseEnter={e => !disabled && (e.currentTarget.style.filter = "brightness(1.1)")}
      onMouseLeave={e => !disabled && (e.currentTarget.style.filter = "brightness(1)")}
    >{children}</button>
  );
}
function GhostButton({ children, onClick, style }:{ children:React.ReactNode; onClick?:()=>void; style?:CSSProperties }) {
  return (
    <button onClick={onClick} style={{
      background: "transparent", color: C.gold, border: `1px solid ${C.gold}`,
      padding: "12px 24px", cursor: "pointer", fontFamily: FONT_BODY, fontWeight: 600,
      letterSpacing: "0.18em", textTransform: "uppercase", fontSize: 12, clipPath: CLIP,
      transition: "all .15s", ...style,
    }}
      onMouseEnter={e => { e.currentTarget.style.background = `${C.gold}15`; }}
      onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
    >{children}</button>
  );
}

function StatBar({ label, value, max=100 }:{ label:string; value:number; max?:number }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom: 4 }}>
        <span style={{ fontFamily: FONT_BODY, fontSize: 11, color: C.muted, letterSpacing: ".1em", textTransform: "uppercase" }}>{label}</span>
        <span style={{ fontFamily: FONT_NUM, fontSize: 11, color: C.gold, fontWeight: 600 }}>{value}</span>
      </div>
      <div style={{ height: 6, background: C.bg2, borderRadius: 3, overflow:"hidden", border:`1px solid ${C.border}` }}>
        <div style={{ height:"100%", width:`${pct}%`, background: `linear-gradient(90deg, ${C.gold3}, ${C.gold})`, transition:"width .5s" }} />
      </div>
    </div>
  );
}

// ─── SPLASH ───────────────────────────────────────────────────────────────────
function Splash({ onStart, onContinue, hasSave }:{ onStart:()=>void; onContinue:()=>void; hasSave:boolean }) {
  const bgSvg = `data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60"><path d="M30 0 L60 30 L30 60 L0 30 Z" fill="none" stroke="${C.gold}" stroke-opacity="0.06" stroke-width="1"/></svg>`)}`;
  return (
    <div style={{
      minHeight:"100vh", boxSizing:"border-box", background: `${C.bg} url("${bgSvg}")`,
      display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
      padding:"40px 20px", color: C.text, fontFamily: FONT_BODY, textAlign:"center", overflowY:"auto",
    }}>
      <div style={{ fontFamily: FONT_HEAD, fontSize: "clamp(56px, 12vw, 140px)", fontWeight: 700,
        background:`linear-gradient(135deg, ${C.gold2}, ${C.gold}, ${C.gold3})`, WebkitBackgroundClip:"text",
        WebkitTextFillColor:"transparent", letterSpacing:"0.2em", lineHeight:1, marginBottom: 8 }}>REVENIO</div>
      <div style={{ width: 120, height: 1, background: C.gold, opacity:.6, margin:"20px 0" }} />
      <div style={{ fontStyle:"italic", color: C.gold2, fontSize:"clamp(16px, 2.5vw, 22px)", letterSpacing:"0.15em", marginBottom: 60 }}>
        Explore the Life You Never Lived
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap: 18, alignItems:"center" }}>
        <GoldButton onClick={onStart} style={{ padding:"18px 48px", fontSize: 14 }}>Begin Your Legend</GoldButton>
        {hasSave && <GhostButton onClick={onContinue}>Continue Journey</GhostButton>}
      </div>
    </div>
  );
}

// ─── CHARACTER CREATION ───────────────────────────────────────────────────────
function CharacterCreation({ onDone, onBack }:{ onDone:(p:{name:string;age:number;traits:string[];goal:string})=>void; onBack:()=>void }) {
  const [name, setName] = useState("");
  const [age, setAge] = useState(18);
  const [traits, setTraits] = useState<string[]>([]);
  const [goal, setGoal] = useState("");
  const ready = name.trim().length>0 && traits.length===3 && goal;
  const toggleTrait = (t:string) => setTraits(p => p.includes(t) ? p.filter(x=>x!==t) : p.length<3 ? [...p, t] : p);
  return (
    <div style={{ minHeight:"100vh", boxSizing:"border-box", background: C.bg, color: C.text, fontFamily: FONT_BODY, padding:"40px 20px", overflowY:"auto" }}>
      <div style={{ maxWidth: 880, margin:"0 auto" }}>
        <div style={{ textAlign:"center", marginBottom: 40 }}>
          <div style={{ fontFamily: FONT_HEAD, fontSize: 40, color: C.gold, letterSpacing:".15em" }}>FORGE YOUR CHARACTER</div>
          <div style={{ color: C.muted, marginTop: 8, letterSpacing:".1em" }}>Choose who you become.</div>
        </div>

        <Section title="IDENTITY">
          <div style={{ display:"grid", gridTemplateColumns:"1fr 140px", gap: 14 }}>
            <input value={name} onChange={e=>setName(e.target.value)} placeholder="Your name" style={inputStyle} />
            <input type="number" min={10} max={99} value={age} onChange={e=>setAge(+e.target.value || 18)} style={inputStyle} />
          </div>
        </Section>

        <Section title={`PICK 3 TRAITS  ·  ${traits.length}/3`}>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(140px, 1fr))", gap: 10 }}>
            {TRAITS.map(t => {
              const on = traits.includes(t);
              return (
                <button key={t} onClick={()=>toggleTrait(t)} style={{
                  padding:"12px", background: on ? `${C.gold}20` : C.surface, color: on ? C.gold : C.text,
                  border:`1px solid ${on ? C.gold : C.border}`, cursor:"pointer", fontFamily: FONT_BODY, fontSize: 13,
                  letterSpacing:".1em", clipPath: CLIP,
                }}>{t}</button>
              );
            })}
          </div>
        </Section>

        <Section title="LONG-TERM GOAL">
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(200px, 1fr))", gap: 10 }}>
            {GOALS.map(g => {
              const on = goal===g;
              return (
                <button key={g} onClick={()=>setGoal(g)} style={{
                  padding:"14px", background: on ? `${C.gold}20` : C.surface, color: on ? C.gold : C.text,
                  border:`1px solid ${on ? C.gold : C.border}`, cursor:"pointer", fontFamily: FONT_BODY, fontSize: 13,
                  letterSpacing:".08em", clipPath: CLIP,
                }}>{g}</button>
              );
            })}
          </div>
        </Section>

        <div style={{ display:"flex", justifyContent:"space-between", gap: 16, marginTop: 30 }}>
          <GhostButton onClick={onBack}>← Back</GhostButton>
          <GoldButton onClick={()=> ready && onDone({ name:name.trim(), age, traits, goal })} disabled={!ready}>Choose Your World →</GoldButton>
        </div>
      </div>
    </div>
  );
}
const inputStyle: CSSProperties = { background: C.surface, border:`1px solid ${C.border}`, color: C.text, padding:"14px 16px", fontFamily: FONT_BODY, fontSize: 16, outline:"none", clipPath: CLIP };
function Section({ title, children }:{ title:string; children:React.ReactNode }) {
  return (
    <div style={{ marginBottom: 30 }}>
      <div style={{ fontFamily: FONT_HEAD, fontSize: 14, color: C.gold, letterSpacing:".25em", marginBottom: 14 }}>{title}</div>
      {children}
    </div>
  );
}

// ─── WORLD SELECT ─────────────────────────────────────────────────────────────
function WorldSelect({ onPick, onBack }:{ onPick:(w:WorldDef)=>void; onBack:()=>void }) {
  return (
    <div style={{ minHeight:"100vh", boxSizing:"border-box", background: C.bg, color: C.text, fontFamily: FONT_BODY, padding:"40px 20px", overflowY:"auto" }}>
      <div style={{ maxWidth: 1280, margin:"0 auto" }}>
        <div style={{ textAlign:"center", marginBottom: 40 }}>
          <div style={{ fontFamily: FONT_HEAD, fontSize: 42, color: C.gold, letterSpacing:".15em" }}>CHOOSE YOUR WORLD</div>
          <div style={{ color: C.muted, marginTop: 10, letterSpacing:".1em" }}>Eight realities. One legend.</div>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
          {WORLDS.map(w => (
            <button key={w.id} onClick={()=>onPick(w)} style={{
              textAlign:"left", background: C.surface, border:`1px solid ${C.border}`,
              padding: 20, cursor:"pointer", color: C.text, fontFamily: FONT_BODY, transition:"all .2s",
              display:"flex", flexDirection:"column", gap: 8, minHeight: 240,
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = C.gold; e.currentTarget.style.background = C.surface2; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.background = C.surface; }}
            >
              <div style={{ fontSize: 36 }}>{w.icon}</div>
              <div style={{ fontFamily: FONT_HEAD, fontSize: 18, color: C.gold, letterSpacing:".08em" }}>{w.name}</div>
              <div style={{ fontSize: 10, color: C.gold3, letterSpacing:".25em" }}>{w.theme}</div>
              <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.5, marginTop: 6 }}>{w.desc}</div>
              <div style={{ marginTop:"auto", fontSize: 11, color: C.red, letterSpacing:".1em" }}>Villain: {w.villain}</div>
            </button>
          ))}
        </div>
        <div style={{ marginTop: 30, textAlign:"center" }}>
          <GhostButton onClick={onBack}>← Back</GhostButton>
        </div>
      </div>
    </div>
  );
}

// ─── NOTIFICATIONS ────────────────────────────────────────────────────────────
function notifColor(k: Notif['kind']) {
  switch (k) {
    case 'stat+': return { bg: `${C.green}20`, fg: C.green };
    case 'stat-': return { bg: `${C.red}20`, fg: C.red };
    case 'xp': return { bg: `${C.gold}25`, fg: C.gold };
    case 'level': return { bg: `${C.gold}40`, fg: C.gold2 };
    case 'item': return { bg: `${C.amber}20`, fg: C.amber };
    case 'quest': return { bg: `${C.purple}25`, fg: C.purple };
    case 'ach': return { bg: `${C.blue}25`, fg: C.blue };
    case 'rel+': return { bg: `${C.green}20`, fg: C.green };
    case 'rel-': return { bg: `${C.red}20`, fg: C.red };
  }
}

// ─── GAME SCREEN ──────────────────────────────────────────────────────────────
function GameScreen({
  player, setPlayer, scene, setScene, history, setHistory,
  loading, callAI, error, onRetry, onSave, onEndChapter, onMenu,
}: {
  player: PlayerState; setPlayer: (p:PlayerState)=>void;
  scene: Scene | null; setScene: (s:Scene|null)=>void;
  history: Msg[]; setHistory: (m:Msg[])=>void;
  loading: boolean;
  callAI: (userMsg: string) => Promise<void>;
  error: string | null; onRetry: ()=>void;
  onSave: ()=>void; onEndChapter: ()=>void; onMenu: ()=>void;
}) {
  const [notifs, setNotifs] = useState<Notif[]>([]);
  const [popup, setPopup] = useState<string | null>(null);
  const [sideOpen, setSideOpen] = useState<"none"|"left"|"right">("none");
  const world = WORLDS.find(w => w.id === player.currentWorld)!;

  const showPopup = (txt: string) => {
    setPopup(txt);
    setTimeout(() => setPopup(null), 3000);
  };

  // After scene applied, derive notifications
  const lastSceneRef = useRef<Scene | null>(null);
  useEffect(() => {
    if (!scene || scene === lastSceneRef.current) return;
    lastSceneRef.current = scene;
    const ns: Notif[] = [];
    let nid = Date.now();
    if (scene.statChanges) for (const [k,v] of Object.entries(scene.statChanges)) {
      ns.push({ id: nid++, kind: v>=0?'stat+':'stat-', text: `${v>=0?'+':''}${v} ${k}` });
    }
    if (scene.xpGained) ns.push({ id: nid++, kind:'xp', text:`+${scene.xpGained} XP` });
    if (scene.inventoryUnlocks) for (const it of scene.inventoryUnlocks) ns.push({ id: nid++, kind:'item', text:`Item: ${it}` });
    if (scene.questUpdates) for (const q of scene.questUpdates) ns.push({ id: nid++, kind:'quest', text:`Quest: ${q.name}` });
    if (scene.newQuests) for (const q of scene.newQuests) ns.push({ id: nid++, kind:'quest', text:`New Quest: ${q.name}` });
    if (scene.newAchievements) for (const a of scene.newAchievements) ns.push({ id: nid++, kind:'ach', text:`🏆 ${a}` });
    if (scene.relationshipChanges) for (const r of scene.relationshipChanges) ns.push({
      id: nid++, kind: r.change>=0?'rel+':'rel-', text:`${r.name} ${r.change>=0?'▲':'▼'}`,
    });
    setNotifs(ns);
  }, [scene]);

  const handleChoice = async (c: Choice) => {
    if (loading) return;
    let userMsg = `Player chose: ${c.text}. Create the consequence scene.`;
    if (c.type === "custom") {
      const ans = window.prompt("What do you do?");
      if (!ans || !ans.trim()) return;
      userMsg = `Player chose to: ${ans.trim()}. Create the consequence scene.`;
      setPlayer({ ...player, majorDecisions: [...player.majorDecisions, ans.trim()] });
    } else {
      setPlayer({ ...player, majorDecisions: [...player.majorDecisions, c.text] });
    }
    await callAI(userMsg);
  };

  const handleTravel = async (loc: string) => {
    if (loading || loc === player.currentLocation) return;
    setPlayer({ ...player, currentLocation: loc });
    await callAI(`Player travels to ${loc}. Create a short scene or event there.`);
  };

  // Track level ups
  const prevLevel = useRef(player.level);
  useEffect(() => {
    if (player.level > prevLevel.current) {
      showPopup(`LEVEL UP → ${player.level}`);
      setNotifs(n => [...n, { id: Date.now(), kind:'level', text:`LEVEL UP → ${player.level}` }]);
    }
    prevLevel.current = player.level;
  }, [player.level]);

  // Track new achievements popup
  const prevAch = useRef(player.achievements.length);
  useEffect(() => {
    if (player.achievements.length > prevAch.current) {
      const latest = player.achievements[player.achievements.length-1];
      showPopup(`🏆 ${latest}`);
    }
    prevAch.current = player.achievements.length;
  }, [player.achievements]);

  const xpPct = Math.min(100, (player.xp / player.xpNext) * 100);

  return (
    <div style={{ minHeight:"100vh", boxSizing:"border-box", background: C.bg, color: C.text, fontFamily: FONT_BODY, display:"flex", flexDirection:"column" }}>
      {/* TOPBAR */}
      <div style={{
        position:"sticky", top: 0, zIndex: 50, background: `${C.bg2}f5`, backdropFilter:"blur(10px)",
        borderBottom: `1px solid ${C.border}`, padding:"10px 16px", display:"flex", alignItems:"center", gap: 14, flexWrap:"wrap"
      }}>
        <div style={{ fontFamily: FONT_HEAD, fontSize: 20, color: C.gold, letterSpacing:".2em", fontWeight: 700 }}>REVENIO</div>
        <div style={{ flex: 1, display:"flex", alignItems:"center", gap: 10, justifyContent:"center", minWidth: 200 }}>
          <span style={{ fontFamily: FONT_BODY, fontSize: 14, color: C.text, fontWeight: 600 }}>{player.name}</span>
          <span style={{ background: C.gold, color: C.bg, padding:"2px 8px", fontFamily: FONT_NUM, fontSize: 11, fontWeight: 700, clipPath: CLIP }}>LV {player.level}</span>
          <div style={{ width: 160, height: 6, background: C.bg2, border:`1px solid ${C.border}`, borderRadius: 3, overflow:"hidden" }}>
            <div style={{ width:`${xpPct}%`, height:"100%", background: `linear-gradient(90deg, ${C.gold3}, ${C.gold2})`, transition:"width .4s" }} />
          </div>
          <span style={{ fontFamily: FONT_NUM, fontSize: 11, color: C.muted }}>{player.xp}/{player.xpNext}</span>
        </div>
        <button onClick={()=>setSideOpen(o => o==="left"?"none":"left")} style={topBtn}>☰ Stats</button>
        <button onClick={()=>setSideOpen(o => o==="right"?"none":"right")} style={topBtn}>Info ☰</button>
        <button onClick={onSave} style={topBtn}>Save</button>
        <button onClick={onMenu} style={topBtn}>Menu</button>
      </div>

      {/* BODY */}
      <div style={{ display:"flex", flex: 1, minHeight: 0 }}>
        {/* LEFT */}
        <aside style={leftStyle(sideOpen==="left")}>
          <Pane title="STATS">
            {Object.entries(player.skills).map(([k,v]) => <StatBar key={k} label={k} value={v} max={Math.max(100, v)} />)}
            <StatBar label="Reputation" value={player.reputation} max={Math.max(100, player.reputation)} />
          </Pane>
          <Pane title="QUESTS">
            {player.quests.filter(q=>!q.done).slice(0,5).map((q,i) => (
              <div key={i} style={{ marginBottom: 10, padding: 8, background: C.bg2, borderLeft:`2px solid ${C.gold}` }}>
                <div style={{ fontSize: 12, color: C.gold, fontWeight: 600 }}>{q.name}</div>
                <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{q.desc}</div>
              </div>
            ))}
            {player.quests.filter(q=>!q.done).length===0 && <div style={{ fontSize: 12, color: C.muted }}>No active quests.</div>}
          </Pane>
          <Pane title="LOCATIONS">
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap: 6 }}>
              {world.locations.map(loc => {
                const here = loc === player.currentLocation;
                return (
                  <button key={loc} onClick={()=>handleTravel(loc)} disabled={loading} style={{
                    padding:"8px 6px", fontSize: 11, fontFamily: FONT_BODY, cursor: loading?"wait":"pointer",
                    background: here ? `${C.gold}25` : C.bg2, color: here ? C.gold : C.text,
                    border:`1px solid ${here ? C.gold : C.border}`, letterSpacing:".05em",
                  }}>{loc}</button>
                );
              })}
            </div>
          </Pane>
        </aside>

        {/* MAIN */}
        <main style={{ flex: 1, padding: 20, overflowY:"auto", minWidth: 0 }}>
          {/* notifications */}
          {notifs.length > 0 && (
            <div style={{ display:"flex", flexWrap:"wrap", gap: 6, marginBottom: 14 }}>
              {notifs.map(n => {
                const col = notifColor(n.kind);
                return (
                  <span key={n.id} style={{
                    background: col.bg, color: col.fg, padding:"5px 12px", fontSize: 11, fontFamily: FONT_BODY,
                    letterSpacing:".1em", borderRadius: 999, fontWeight: 600,
                    border: `1px solid ${col.fg}40`,
                  }}>{n.text}</span>
                );
              })}
            </div>
          )}

          {/* scene card */}
          <div style={{ background: C.surface, border:`1px solid ${C.border}`, padding: 24, marginBottom: 18 }}>
            <div style={{ fontSize: 10, color: C.gold3, letterSpacing:".3em", marginBottom: 8 }}>
              {world.icon} {world.name.toUpperCase()} · {player.currentLocation.toUpperCase()}
            </div>
            {loading && !scene ? (
              <LoadingState />
            ) : scene ? (
              <>
                <h2 style={{ fontFamily: FONT_HEAD, fontSize: 28, color: C.gold, margin: 0, marginBottom: 14, letterSpacing:".05em" }}>{scene.sceneTitle}</h2>
                <p style={{ fontSize: 16, lineHeight: 1.7, color: C.text, margin: 0 }}>{scene.sceneText}</p>
              </>
            ) : (
              <div style={{ color: C.muted }}>No scene loaded.</div>
            )}
          </div>

          {/* loading overlay */}
          {loading && scene && <LoadingState />}

          {/* choices */}
          {scene && !loading && (
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(260px, 1fr))", gap: 12 }}>
              {scene.choices.map(c => (
                <button key={c.id} onClick={()=>handleChoice(c)} disabled={loading} style={{
                  textAlign:"left", background: C.surface, border:`1px solid ${C.border2}`, padding: 16,
                  cursor: loading?"wait":"pointer", color: C.text, fontFamily: FONT_BODY, transition:"all .15s",
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = C.gold; e.currentTarget.style.background = C.surface2; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = C.border2; e.currentTarget.style.background = C.surface; }}
                >
                  <div style={{ fontSize: 10, color: C.gold3, letterSpacing:".25em", marginBottom: 6 }}>{c.id} · {c.type.toUpperCase()}</div>
                  <div style={{ fontSize: 14, color: C.text, marginBottom: 8, lineHeight: 1.4 }}>{c.text}</div>
                  <div style={{ display:"flex", justifyContent:"space-between", fontSize: 11 }}>
                    <span style={{ color: C.muted }}>{c.hint}</span>
                    <span style={{ color: c.risk==='Low'?C.green:c.risk==='High'?C.red:C.amber, letterSpacing:".1em" }}>{c.risk}</span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* end chapter */}
          {player.storyProgress >= 15 && (
            <div style={{ marginTop: 24, textAlign:"center" }}>
              <GhostButton onClick={onEndChapter}>End This Chapter</GhostButton>
            </div>
          )}
        </main>

        {/* RIGHT */}
        <aside style={rightStyle(sideOpen==="right")}>
          <Pane title="RELATIONSHIPS">
            {player.relationships.map((r,i) => (
              <div key={i} style={{ display:"flex", alignItems:"center", gap: 8, marginBottom: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius:"50%", background: C.surface2,
                  display:"flex", alignItems:"center", justifyContent:"center", color: C.gold,
                  fontFamily: FONT_HEAD, fontSize: 12, border:`1px solid ${C.border2}`, flexShrink: 0 }}>
                  {r.name.split(" ").map(w=>w[0]).join("").slice(0,2)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, color: C.text, fontWeight: 600, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{r.name}</div>
                  <div style={{ fontSize: 10, color: C.muted }}>{r.type}</div>
                  <div style={{ height: 4, background: C.bg2, marginTop: 4, borderRadius: 2, overflow:"hidden" }}>
                    <div style={{ width: `${Math.max(0,Math.min(100,r.val))}%`, height:"100%",
                      background: r.dir==='friend'?C.green:r.dir==='rival'?C.red:C.muted }} />
                  </div>
                </div>
              </div>
            ))}
          </Pane>
          <Pane title="INVENTORY">
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gap: 6 }}>
              {Array.from({length: 8}).map((_,i) => {
                const it = player.inventory[i];
                return (
                  <div key={i} title={it ?? "Empty"} style={{
                    aspectRatio:"1", background: C.bg2, border:`1px solid ${it?C.gold3:C.border}`,
                    display:"flex", alignItems:"center", justifyContent:"center", fontSize: 18,
                  }}>{it ? it.split(" ")[0] : ""}</div>
                );
              })}
            </div>
          </Pane>
          <Pane title="NEWS FEED">
            {player.newsHistory.slice(-5).reverse().map((n,i) => (
              <div key={i} style={{
                fontSize: 11, padding: 8, marginBottom: 6, background: C.bg2,
                borderLeft:`2px solid ${i===0?C.gold:C.border2}`,
                color: i===0?C.gold2:C.muted, lineHeight: 1.4,
              }}>{n}</div>
            ))}
          </Pane>
        </aside>
      </div>

      {/* achievement popup */}
      {popup && (
        <div style={{
          position:"fixed", top: 80, right: 20, zIndex: 100, background: `linear-gradient(135deg, ${C.gold2}, ${C.gold3})`,
          color: C.bg, padding:"14px 22px", fontFamily: FONT_HEAD, letterSpacing:".15em", fontSize: 14,
          fontWeight: 700, clipPath: CLIP, boxShadow:`0 10px 30px ${C.gold}60`, animation: "slideIn .3s ease-out",
        }}>{popup}</div>
      )}
      <style>{`@keyframes slideIn { from { transform: translateX(120%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 900px) { .revenio-left, .revenio-right { display: none; } .revenio-left-open, .revenio-right-open { display: block !important; position: fixed; top: 60px; bottom: 0; z-index: 40; } .revenio-left-open { left: 0; } .revenio-right-open { right: 0; } }
      `}</style>
    </div>
  );
}

const topBtn: CSSProperties = {
  background: "transparent", color: C.gold, border:`1px solid ${C.border2}`, padding:"6px 12px",
  fontFamily: FONT_BODY, fontSize: 11, letterSpacing:".15em", cursor:"pointer", textTransform:"uppercase",
};
function leftStyle(open: boolean): CSSProperties {
  return {
    width: 220, background: C.bg2, borderRight:`1px solid ${C.border}`, padding: 16, overflowY:"auto", flexShrink: 0,
  } as any;
}
function rightStyle(open: boolean): CSSProperties {
  return {
    width: 240, background: C.bg2, borderLeft:`1px solid ${C.border}`, padding: 16, overflowY:"auto", flexShrink: 0,
  } as any;
}
function Pane({ title, children }:{ title:string; children:React.ReactNode }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <div style={{ fontFamily: FONT_HEAD, fontSize: 11, color: C.gold, letterSpacing:".3em", marginBottom: 10, paddingBottom: 6, borderBottom:`1px solid ${C.border}` }}>{title}</div>
      {children}
    </div>
  );
}
function LoadingState() {
  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding: 40, gap: 16 }}>
      <div style={{
        width: 44, height: 44, borderRadius:"50%",
        border: `3px solid ${C.border2}`, borderTopColor: C.gold,
        animation: "spin 0.9s linear infinite",
      }} />
      <div style={{ fontFamily: FONT_HEAD, fontSize: 12, color: C.gold, letterSpacing:".3em" }}>GENERATING YOUR FATE...</div>
    </div>
  );
}

// ─── LEGACY SCREEN ────────────────────────────────────────────────────────────
function Legacy({ player, onNewWorld, onNewChar }:{ player:PlayerState; onNewWorld:()=>void; onNewChar:()=>void }) {
  const topSkill = Object.entries(player.skills).sort((a,b)=>b[1]-a[1])[0];
  return (
    <div style={{ minHeight:"100vh", boxSizing:"border-box", background: C.bg, color: C.text, fontFamily: FONT_BODY, padding:"40px 20px", overflowY:"auto" }}>
      <div style={{ maxWidth: 880, margin:"0 auto", textAlign:"center" }}>
        <div style={{ fontFamily: FONT_HEAD, fontSize: 14, color: C.gold3, letterSpacing:".4em", marginBottom: 10 }}>YOUR LEGACY</div>
        <div style={{ fontFamily: FONT_HEAD, fontSize: 56, color: C.gold, letterSpacing:".1em", marginBottom: 40 }}>{player.name}</div>

        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(200px, 1fr))", gap: 14, marginBottom: 30 }}>
          <StatCard label="LEVEL" val={player.level} />
          <StatCard label="ACHIEVEMENTS" val={player.achievements.length} />
          <StatCard label="SCENES LIVED" val={player.storyProgress} />
        </div>

        {topSkill && (
          <div style={{ background: C.surface, border:`1px solid ${C.gold}`, padding: 20, marginBottom: 30 }}>
            <div style={{ fontSize: 11, color: C.gold3, letterSpacing:".3em" }}>TOP SKILL</div>
            <div style={{ fontFamily: FONT_HEAD, fontSize: 28, color: C.gold, marginTop: 4 }}>{topSkill[0]} · {topSkill[1]}</div>
          </div>
        )}

        <div style={{ textAlign:"left", marginBottom: 30 }}>
          <div style={{ fontFamily: FONT_HEAD, fontSize: 14, color: C.gold, letterSpacing:".3em", marginBottom: 12 }}>DEFINING CHOICES</div>
          {player.majorDecisions.slice(-5).map((d,i) => (
            <div key={i} style={{ padding:"10px 14px", background: C.surface, borderLeft:`2px solid ${C.gold}`, marginBottom: 6, fontStyle:"italic", color: C.text }}>“{d}”</div>
          ))}
        </div>

        {player.achievements.length>0 && (
          <div style={{ marginBottom: 40 }}>
            <div style={{ fontFamily: FONT_HEAD, fontSize: 14, color: C.gold, letterSpacing:".3em", marginBottom: 12 }}>ACHIEVEMENTS</div>
            <div style={{ display:"flex", flexWrap:"wrap", gap: 8, justifyContent:"center" }}>
              {player.achievements.map((a,i) => (
                <span key={i} style={{ background:`${C.gold}20`, color: C.gold, padding:"8px 16px", border:`1px solid ${C.gold}`, fontSize: 12, letterSpacing:".1em", clipPath: CLIP }}>🏆 {a}</span>
              ))}
            </div>
          </div>
        )}

        <div style={{ display:"flex", gap: 14, justifyContent:"center", flexWrap:"wrap" }}>
          <GoldButton onClick={onNewWorld}>New World</GoldButton>
          <GhostButton onClick={onNewChar}>New Character</GhostButton>
        </div>
      </div>
    </div>
  );
}
function StatCard({ label, val }:{ label:string; val:number }) {
  return (
    <div style={{ background: C.surface, border:`1px solid ${C.border}`, padding: 20 }}>
      <div style={{ fontSize: 10, color: C.gold3, letterSpacing:".3em" }}>{label}</div>
      <div style={{ fontFamily: FONT_NUM, fontSize: 38, color: C.gold, fontWeight: 700, marginTop: 4 }}>{val}</div>
    </div>
  );
}

// ─── ROOT PAGE / STATE MACHINE ────────────────────────────────────────────────
type Screen = "splash" | "create" | "world" | "game" | "legacy";

function SimulationPage() {
  useFonts();
  const callScene = useServerFn(simulationScene);
  const [screen, setScreen] = useState<Screen>("splash");
  const [hasSave, setHasSave] = useState(false);
  const [player, setPlayer] = useState<PlayerState | null>(null);
  const [scene, setScene] = useState<Scene | null>(null);
  const [history, setHistory] = useState<Msg[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUserMsg, setLastUserMsg] = useState<string | null>(null);
  const [pending, setPending] = useState<{ name:string;age:number;traits:string[];goal:string } | null>(null);

  useEffect(() => {
    try { setHasSave(!!localStorage.getItem(SAVE_KEY)); } catch {}
  }, []);

  const save = useCallback((p: PlayerState, h: Msg[], s: Scene | null) => {
    try {
      const blob: SaveBlob = { player: p, history: h, scene: s };
      localStorage.setItem(SAVE_KEY, JSON.stringify(blob));
      setHasSave(true);
    } catch {}
  }, []);

  // Core AI call
  const callAI = useCallback(async (userMsg: string, playerOverride?: PlayerState) => {
    const p = playerOverride ?? player;
    if (!p) return;
    setLoading(true);
    setError(null);
    setLastUserMsg(userMsg);
    try {
      const trimmedHistory = history.slice(-20);
      const conversationContext = trimmedHistory.map(m => `${m.role.toUpperCase()}: ${m.content}`).join("\n\n");
      const fullUserMsg = conversationContext
        ? `RECENT STORY:\n${conversationContext}\n\nNOW: ${userMsg}`
        : userMsg;

      const res = await callScene({ data: { systemPrompt: buildSystemPrompt(p), userMessage: fullUserMsg } });
      const s = res.scene as Scene;
      if (!s || !s.choices) {
        setError("The story flickered. The scene could not form.");
        return;
      }

      // Apply
      const np: PlayerState = { ...p };
      np.storyProgress += 1;

      if (s.statChanges) {
        const sk = { ...np.skills };
        for (const [k,v] of Object.entries(s.statChanges)) {
          sk[k] = Math.max(0, (sk[k] ?? 0) + (v as number));
        }
        np.skills = sk;
      }
      if (s.xpGained) {
        np.xp += s.xpGained;
        while (np.xp >= np.xpNext) {
          np.xp -= np.xpNext;
          np.level += 1;
          np.xpNext = Math.round(np.xpNext * 1.4);
        }
      }
      if (s.reputationChange) np.reputation += s.reputationChange;
      if (s.relationshipChanges) {
        const rels = [...np.relationships];
        for (const rc of s.relationshipChanges) {
          const idx = rels.findIndex(r => r.name === rc.name);
          if (idx >= 0) {
            rels[idx] = { ...rels[idx], val: Math.max(0, Math.min(100, rels[idx].val + rc.change)), dir: rc.dir ?? rels[idx].dir };
          } else {
            rels.push({ name: rc.name, type: "Contact", val: Math.max(0, Math.min(100, 50 + rc.change)), dir: rc.dir ?? "neutral" });
          }
        }
        np.relationships = rels;
      }
      if (s.inventoryUnlocks) for (const it of s.inventoryUnlocks) if (!np.inventory.includes(it)) np.inventory.push(it);
      if (s.questUpdates) {
        for (const qu of s.questUpdates) {
          const idx = np.quests.findIndex(q => q.name === qu.name);
          if (idx >= 0) np.quests[idx] = { ...np.quests[idx], ...qu };
        }
      }
      if (s.newQuests) for (const q of s.newQuests) if (!np.quests.find(x => x.name===q.name)) np.quests.push({ ...q, done: false });
      if (s.newAchievements) for (const a of s.newAchievements) if (!np.achievements.includes(a)) np.achievements.push(a);
      if (s.newsUpdates) np.newsHistory = [...np.newsHistory, ...s.newsUpdates];
      if (s.worldStateUpdates) np.worldState = { ...np.worldState, ...s.worldStateUpdates };

      const newHistory: Msg[] = [...trimmedHistory, { role:"user", content: userMsg }, { role:"assistant", content: JSON.stringify(s) }];
      setPlayer(np);
      setScene(s);
      setHistory(newHistory);
      save(np, newHistory, s);
    } catch (e: any) {
      console.error(e);
      setError(e?.message ?? "The rift trembles. The story flickers.");
    } finally {
      setLoading(false);
    }
  }, [player, history, callScene, save]);

  const retryLast = useCallback(() => {
    if (lastUserMsg) callAI(lastUserMsg);
    else callAI("Continue the story from where we left off.");
  }, [lastUserMsg, callAI]);

  // ── Splash actions
  const beginNew = () => setScreen("create");
  const continueJourney = () => {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return;
      const blob = JSON.parse(raw) as SaveBlob;
      setPlayer(blob.player); setHistory(blob.history ?? []); setScene(blob.scene ?? null);
      setScreen("game");
      // continue narrative
      setTimeout(() => { callAI("Continue the story from where we left off.", blob.player); }, 50);
    } catch {}
  };

  // ── Character → world
  const onCreated = (data:{name:string;age:number;traits:string[];goal:string}) => {
    setPending(data); setScreen("world");
  };

  // ── World pick → start game
  const onPickWorld = async (w: WorldDef) => {
    if (!pending) return;
    const p: PlayerState = {
      name: pending.name, age: pending.age, traits: pending.traits, goal: pending.goal,
      level: 1, xp: 0, xpNext: 100, reputation: 0,
      currentWorld: w.id, currentLocation: w.locations[0], currentFaction: w.factions[0],
      skills: { ...w.startStat }, relationships: w.startRels.map(r => ({ ...r })),
      inventory: [...w.startItems], quests: w.startQuests.map(q => ({ ...q, done: false })),
      achievements: [], majorDecisions: [], storyProgress: 0, worldState: {},
      newsHistory: [...w.startNews],
    };
    setPlayer(p); setScene(null); setHistory([]);
    setScreen("game");
    setTimeout(() => callAI(`Player ${p.name} just entered ${w.name}. Create a dramatic opening scene.`, p), 50);
  };

  // ── Menu / save / legacy
  const goSave = () => { if (player) save(player, history, scene); };
  const goEndChapter = () => setScreen("legacy");
  const goMenu = () => setScreen("splash");
  const newWorldKeepChar = () => { setScene(null); setHistory([]); setScreen("world"); if (player) setPending({ name: player.name, age: player.age, traits: player.traits, goal: player.goal }); };
  const newChar = () => { setPlayer(null); setScene(null); setHistory([]); setPending(null); setScreen("create"); };

  // ── Render
  if (screen === "splash") return <Splash onStart={beginNew} onContinue={continueJourney} hasSave={hasSave} />;
  if (screen === "create") return <CharacterCreation onDone={onCreated} onBack={()=>setScreen("splash")} />;
  if (screen === "world") return <WorldSelect onPick={onPickWorld} onBack={()=> setScreen(player?"game":"create")} />;
  if (screen === "legacy" && player) return <Legacy player={player} onNewWorld={newWorldKeepChar} onNewChar={newChar} />;
  if (screen === "game" && player) {
    return (
      <GameScreen
        player={player} setPlayer={(p)=>{ setPlayer(p); save(p, history, scene); }}
        scene={scene} setScene={setScene}
        history={history} setHistory={setHistory}
        loading={loading} callAI={callAI}
        onSave={goSave} onEndChapter={goEndChapter} onMenu={goMenu}
      />
    );
  }
  return <Splash onStart={beginNew} onContinue={continueJourney} hasSave={hasSave} />;
}
