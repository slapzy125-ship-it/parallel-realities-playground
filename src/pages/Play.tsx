import { useState, useRef } from 'react'

const G:any = {
  app:{minHeight:'100vh',background:'#0A0A0C',color:'#E8E4D8',fontFamily:"'Rajdhani',sans-serif",fontSize:'15px'},
  center:{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',minHeight:'100vh',gap:'16px'},
  gold:{color:'#D4A843'},
  gold2:{color:'#F0C060'},
  muted:{color:'#7A7A8A'},
  surface:{background:'#1A1A24',border:'1px solid #2A2A3A',borderRadius:'2px',padding:'20px'},
  sideLabel:{color:'#D4A843',fontSize:'9px',letterSpacing:'4px',borderBottom:'1px solid #2A2A3A',paddingBottom:'6px',marginBottom:'10px'},
  input:{width:'100%',background:'#1A1A24',border:'1px solid #3A3A4A',color:'#E8E4D8',padding:'12px 16px',fontFamily:"'Rajdhani',sans-serif",fontSize:'16px',outline:'none',borderRadius:'2px',boxSizing:'border-box'},
  label:{display:'block',color:'#D4A843',fontSize:'11px',letterSpacing:'3px',marginBottom:'8px'},
  btnGold:{background:'linear-gradient(135deg,#8B6914,#D4A843)',color:'#0A0A0C',fontFamily:"'Cinzel',serif",fontWeight:700,padding:'14px 48px',border:'none',cursor:'pointer',letterSpacing:'2px',fontSize:'14px',borderRadius:'2px'},
  btnGhost:{background:'transparent',color:'#D4A843',border:'1px solid #8B6914',fontFamily:"'Rajdhani',sans-serif",fontWeight:600,padding:'10px 32px',cursor:'pointer',letterSpacing:'2px',fontSize:'14px',borderRadius:'2px'},
  topbar:{background:'#0F0F14',borderBottom:'1px solid #2A2A3A',padding:'10px 20px',display:'flex',alignItems:'center',justifyContent:'space-between',position:'sticky',top:0,zIndex:100},
}

const defaultPlayer = () => ({
  name:'',age:18,traits:[] as string[],goal:'',
  level:1,xp:0,xpNext:100,reputation:0,
  currentWorld:'',currentLocation:'',
  skills:{} as Record<string,number>,
  relationships:[] as any[],
  inventory:[] as string[],
  quests:[] as any[],
  achievements:[] as string[],
  majorDecisions:[] as string[],
  storyProgress:0,
  worldState:{} as Record<string,any>,
  newsHistory:[] as string[],
})

const TRAITS = ['Brave','Cunning','Kind','Strong','Wise','Charismatic','Lucky','Creative','Stealthy','Patient']
const GOALS = ['Wealth','Power','Love','Glory','Knowledge','Revenge','Freedom','Legacy']

const WORLDS = [
  { id:'arcane', name:'Arcane Academy', desc:"Enter the world's greatest magic academy.", theme:'Magic School', icon:'✨', locations:['Great Hall','Library','Dueling Grounds','Potion Lab'], startStat:{Spellcasting:10,Potions:5,Dueling:5,'Arcane Theory':5,Wandcraft:5}, startRels:[{name:'Prof. Aldric',type:'mentor',affinity:60},{name:'Kira Voss',type:'rival',affinity:-20}], startItems:['Wand','Robes','Spellbook'], startQuests:[{title:'Sorting Ceremony',desc:'Attend the house sorting.'}], startNews:['Arcane Academy welcomes new students.'] },
  { id:'champions', name:'Champions Legacy', desc:'Rise from unknown youth to global sporting legend.', theme:'Sports Career', icon:'⚽', locations:['Training Ground','Stadium','Locker Room','Cafeteria'], startStat:{Speed:10,Skill:5,Shooting:5,Passing:5,Leadership:5,Stamina:5}, startRels:[{name:'Coach Ramos',type:'mentor',affinity:60},{name:'Luca Moretti',type:'rival',affinity:-20}], startItems:['Cleats','Jersey','Water Bottle'], startQuests:[{title:'First Trial',desc:'Prove yourself in the opening match.'}], startNews:['New talent spotted at the trials.'] },
  { id:'galactic', name:'Galactic Frontier', desc:'Navigate a galaxy of factions, destiny, and conflict.', theme:'Space Adventure', icon:'🚀', locations:['Bridge','Engine Room','Mess Hall','Airlock'], startStat:{Piloting:10,Combat:5,Diplomacy:5,Navigation:5,Engineering:5}, startRels:[{name:'Commander Lyra',type:'mentor',affinity:60},{name:'Admiral Kross',type:'rival',affinity:-20}], startItems:['Blaster','Space Suit','Datapad'], startQuests:[{title:'Distress Signal',desc:'Respond to an incoming distress call.'}], startNews:['Vanguard Alliance patrols increase.'] },
  { id:'hero', name:'Hero Nexus', desc:'Discover powers and decide what kind of hero you are.', theme:'Superhero', icon:'⚡', locations:['Hero HQ','Training Room','City Streets','Rooftop'], startStat:{'Power Control':10,Combat:5,PR:5,Strategy:5,Tech:5}, startRels:[{name:'Director Crane',type:'mentor',affinity:60},{name:'Shadow Wolf',type:'rival',affinity:-20}], startItems:['Costume','Mask','Comms Device'], startQuests:[{title:'First Assignment',desc:'Handle a downtown incident.'}], startNews:['Hero Nexus recruits new members.'] },
  { id:'dragonfall', name:'Dragonfall Kingdoms', desc:'Rule kingdoms, tame dragons, shape a realm.', theme:'Medieval Fantasy', icon:'🐉', locations:['Throne Room','Stables','Battlefield','Dragon Pit'], startStat:{Combat:10,Leadership:5,Diplomacy:5,'Dragon Taming':5,Strategy:5}, startRels:[{name:'Lord Eryn',type:'mentor',affinity:60},{name:'Lord Kael',type:'rival',affinity:-20}], startItems:['Sword','Armor','Map'], startQuests:[{title:'Tournament',desc:'Prove your worth in the arena.'}], startNews:['Dragon sightings reported near the border.'] },
  { id:'shadow', name:'Shadow Guild', desc:'Join a secret network of spies and power brokers.', theme:'Spy Thriller', icon:'🕶️', locations:['Safe House','Drop Point','Club Red','Rooftop'], startStat:{Stealth:10,Deception:5,Combat:5,Hacking:5,Persuasion:5}, startRels:[{name:'Handler Zero',type:'mentor',affinity:60},{name:'The Fox',type:'rival',affinity:-20}], startItems:['Lockpick','Disguise','Encrypted Phone'], startQuests:[{title:'First Contract',desc:'Complete your first guild assignment.'}], startNews:['Shadow Guild activity rises in the east.'] },
  { id:'neon', name:'Neon Domination', desc:'Rise through a mega-city ruled by AI and corporations.', theme:'Cyberpunk', icon:'🤖', locations:['Hideout','Server Farm','Club Neon','Rooftop'], startStat:{Hacking:10,Combat:5,Persuasion:5,Cybernetics:5,Business:5}, startRels:[{name:'Sable',type:'mentor',affinity:60},{name:'Director Kron',type:'rival',affinity:-20}], startItems:['Cyberdeck','Neural Implant','Cred Chip'], startQuests:[{title:'First Hack',desc:'Infiltrate a corporate system.'}], startNews:['Corps tighten security after recent breaches.'] },
  { id:'odyssey', name:'Eternal Odyssey', desc:'Journey through mythical realms and ancient trials.', theme:'Mythological', icon:'⚔️', locations:['Oracle Temple','Forest of Trials','Ancient Ruins','Village'], startStat:{Combat:10,Wisdom:5,Exploration:5,'Ancient Lore':5,Leadership:5}, startRels:[{name:'Sage Pyrene',type:'mentor',affinity:60},{name:'General Vorn',type:'rival',affinity:-20}], startItems:['Sword','Shield','Torch'], startQuests:[{title:'Oracle Prophecy',desc:'Seek the Oracle Temple blessing.'}], startNews:['Ancient ruins unearthed in the valley.'] },
]

export default function Play() {
  const [screen, setScreen] = useState('splash')
  const [player, setPlayer] = useState(defaultPlayer())
  const [world, setWorld] = useState<any>(null)
  const [scene, setScene] = useState<any>(null)
  const [hasError, setHasError] = useState(false)
  const [sceneHistory, setSceneHistory] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const historyRef = useRef<any[]>([])

  const toggleTrait = (t:string) => {
    setPlayer(p=>({...p,traits:p.traits.includes(t)?p.traits.filter((x:string)=>x!==t):p.traits.length<3?[...p.traits,t]:p.traits}))
  }

  const finishCreation = () => {
    if(!player.name.trim()){alert('Enter your name');return}
    if(player.traits.length<1){alert('Pick at least 1 trait');return}
    if(!player.goal){alert('Choose a goal');return}
    setScreen('worldselect')
  }

  const callAI = async (prompt:string, player:any, world:any):Promise<any> => {
    // TODO: AI integration
    return null
  }

  const handleSelectWorld = async (w:any) => {
    const fresh = {
      ...defaultPlayer(),
      name:player.name,age:player.age,traits:player.traits,goal:player.goal,
      currentWorld:w.id,currentLocation:w.locations?.[0]??'',
      skills:{...w.startStat},
      relationships:w.startRels.map((r:any)=>({...r})),
      inventory:[...w.startItems],
      quests:w.startQuests.map((q:any)=>({...q,done:false})),
      newsHistory:[...w.startNews],
      worldState:{sceneCount:0},
    }
    setPlayer(fresh)
    setWorld(w)
    setScene(null)
    setHasError(false)
    setSceneHistory([])
    historyRef.current=[]
    setScreen('game')
    setLoading(true)
    const openers:Record<string,string> = {
      arcane:`${player.name} (traits: ${player.traits.join(', ')}, goal: ${player.goal}) receives their acceptance letter to Arcane Academy. First day. Great Hall. Sorting Ceremony. Prof. Aldric watches warmly. Kira Voss sneers from across the room. Create the opening scene ending with the Sorting choice.`,
      champions:`${player.name} arrives at their first trial match. Coach Ramos watches from the sideline. Luca Moretti warms up on the opposite team eyeing ${player.name} with contempt. Create the opening scene ending with a choice about how to play.`,
      galactic:`${player.name} is handed the controls of a scout ship for the first time. Commander Lyra is in the co-pilot seat. A distress signal appears on radar. Admiral Kross's warship is also responding. Create the dramatic opening scene.`,
      hero:`${player.name} reports to Hero HQ for their first assignment. Director Crane briefs them on a downtown incident. Shadow Wolf is already at the scene showing off. Create the opening scene.`,
      dragonfall:`${player.name} enters the tournament arena to prove their worth. Lord Eryn watches proudly. Lord Kael's champion stands across the field sneering. A dragon circles overhead. Create the opening scene.`,
      shadow:`${player.name} receives their first contract from Handler Zero in a dimly lit safe house. The job sounds simple but The Fox was also offered the same contract. Create the opening scene.`,
      neon:`${player.name} sits in front of three screens preparing their first hack. Sable is on comms. Director Kron's security system is the target. Failure means exposure. Create the opening scene.`,
      odyssey:`${player.name} stands before the Oracle Temple. Sage Pyrene speaks in riddles. General Vorn's soldiers block the gates demanding tribute. Create the opening scene.`,
    }
    const result = await callAI(openers[w.id]??`${player.name} enters ${w.name}. Create a dramatic opening scene.`, fresh, w)
    if(result){setScene(result);setSceneHistory([result.sceneTitle])}else{setHasError(true)}
    setLoading(false)
  }

  const fonts = <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700;900&family=Rajdhani:wght@400;500;600;700&family=Orbitron:wght@400;700&display=swap" rel="stylesheet"/>

  if (screen === 'splash') return (
    <div style={{...G.app, ...G.center}}>
      {fonts}
      <div style={{fontFamily:"'Cinzel',serif",fontSize:'72px',letterSpacing:'12px',...G.gold}}>REVENIO</div>
      <div style={{...G.muted,letterSpacing:'4px',fontSize:'12px'}}>EXPLORE THE LIFE YOU NEVER LIVED</div>
      <button style={{...G.btnGold,marginTop:'32px'}} onClick={() => setScreen('creation')}>BEGIN YOUR LEGEND</button>
      <button style={G.btnGhost}>CONTINUE JOURNEY</button>
    </div>
  )

  if (screen === 'creation') return (
    <div style={{...G.app,display:'flex',flexDirection:'column',alignItems:'center',padding:'40px 20px'}}>
      {fonts}
      <div style={{maxWidth:'600px',width:'100%'}}>
        <div style={{textAlign:'center',marginBottom:'32px'}}>
          <div style={{...G.gold,fontSize:'10px',letterSpacing:'4px',marginBottom:'8px'}}>CHAPTER I</div>
          <div style={{fontFamily:"'Cinzel',serif",fontSize:'28px',fontWeight:700,letterSpacing:'2px'}}>FORGE YOUR IDENTITY</div>
        </div>
        <div style={{marginBottom:'20px'}}>
          <label style={G.label}>YOUR NAME</label>
          <input style={G.input} value={player.name} onChange={e=>setPlayer(p=>({...p,name:e.target.value}))} placeholder="Enter your name..." maxLength={30}/>
        </div>
        <div style={{marginBottom:'20px'}}>
          <label style={G.label}>YOUR AGE</label>
          <input style={G.input} type="number" value={player.age} onChange={e=>setPlayer(p=>({...p,age:parseInt(e.target.value)||18}))} min={14} max={30}/>
        </div>
        <div style={{marginBottom:'20px'}}>
          <label style={G.label}>CHOOSE 3 TRAITS <span style={G.muted}>({player.traits.length}/3)</span></label>
          <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:'8px'}}>
            {TRAITS.map(t=>(
              <button key={t} onClick={()=>toggleTrait(t)} style={{background:player.traits.includes(t)?'#8B6914':'#1A1A24',border:`1px solid ${player.traits.includes(t)?'#D4A843':'#3A3A4A'}`,color:player.traits.includes(t)?'#F0C060':'#7A7A8A',padding:'8px 4px',cursor:'pointer',fontFamily:"'Rajdhani',sans-serif",fontSize:'12px',fontWeight:600,letterSpacing:'1px',borderRadius:'2px'}}>{t}</button>
            ))}
          </div>
        </div>
        <div style={{marginBottom:'32px'}}>
          <label style={G.label}>YOUR MAIN GOAL</label>
          <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:'8px'}}>
            {GOALS.map(g=>(
              <button key={g} onClick={()=>setPlayer(p=>({...p,goal:g}))} style={{background:player.goal===g?'#8B6914':'#1A1A24',border:`1px solid ${player.goal===g?'#D4A843':'#3A3A4A'}`,color:player.goal===g?'#F0C060':'#7A7A8A',padding:'12px',cursor:'pointer',fontFamily:"'Rajdhani',sans-serif",fontSize:'14px',fontWeight:600,letterSpacing:'1px',borderRadius:'2px'}}>{g}</button>
            ))}
          </div>
        </div>
        <button style={{...G.btnGold,width:'100%'}} onClick={finishCreation}>CHOOSE YOUR WORLD →</button>
      </div>
    </div>
  )

  if (screen === 'worldselect') return (
    <div style={{...G.app,padding:'30px 20px'}}>
      {fonts}
      <div style={{textAlign:'center',marginBottom:'32px'}}>
        <div style={{...G.gold,fontSize:'10px',letterSpacing:'4px',marginBottom:'8px'}}>CHAPTER II</div>
        <div style={{fontFamily:"'Cinzel',serif",fontSize:'28px',fontWeight:700,letterSpacing:'2px'}}>CHOOSE YOUR WORLD</div>
        <div style={{...G.muted,fontSize:'13px',marginTop:'6px',letterSpacing:'2px'}}>Where will your alternate life unfold?</div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))',gap:'16px',maxWidth:'960px',margin:'0 auto'}}>
        {WORLDS.map(w=>(
          <div key={w.id} onClick={()=>handleSelectWorld(w)} style={{background:'#1A1A24',border:'1px solid #2A2A3A',padding:'20px',cursor:'pointer',borderRadius:'2px',transition:'border-color .2s'}} onMouseEnter={e=>(e.currentTarget.style.borderColor='#D4A843')} onMouseLeave={e=>(e.currentTarget.style.borderColor='#2A2A3A')}>
            <div style={{fontSize:'28px',marginBottom:'10px'}}>{w.icon}</div>
            <div style={{fontFamily:"'Cinzel',serif",fontSize:'15px',fontWeight:700,color:'#D4A843',marginBottom:'6px',letterSpacing:'1px'}}>{w.name}</div>
            <div style={{...G.muted,fontSize:'12px',lineHeight:1.5}}>{w.desc}</div>
            <div style={{...G.muted,fontSize:'10px',letterSpacing:'2px',marginTop:'8px',borderTop:'1px solid #2A2A3A',paddingTop:'8px'}}>{w.theme}</div>
          </div>
        ))}
      </div>
    </div>
  )

  return <div style={{...G.app, ...G.center}}>{fonts}<div style={G.gold}>Loading...</div></div>
}
