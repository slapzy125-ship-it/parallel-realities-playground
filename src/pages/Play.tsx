import { useState, useRef } from 'react'
import { supabase } from '@/integrations/supabase/client'

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
  { id:'arcane', name:'Arcane Academy', desc:"Enter the world's greatest magic academy.", theme:'Magic School', icon:'✨', villain:'The Hollow Mage', factions:['House Aetheris','House Drakemore','House Umbra','House Sylvara'], locations:['Great Hall','Library','Dueling Grounds','Potion Lab'], startStat:{Spellcasting:10,Potions:5,Dueling:5,'Arcane Theory':5,Wandcraft:5}, startRels:[{name:'Prof. Aldric',val:60,dir:'friend'},{name:'Kira Voss',val:-20,dir:'rival'}], startItems:['Wand','Robes','Spellbook'], startQuests:[{name:'Sorting Ceremony',desc:'Attend the house sorting.'}], startNews:['Arcane Academy welcomes new students.'] },
  { id:'champions', name:'Champions Legacy', desc:'Rise from unknown youth to global sporting legend.', theme:'Sports Career', icon:'⚽', villain:'Adrian Vega', factions:['Crimson United','Royal Blue Academy','Blackstone FC','Golden City Academy','Phoenix Athletic'], locations:['Training Ground','Stadium','Locker Room','Cafeteria'], startStat:{Speed:10,Skill:5,Shooting:5,Passing:5,Leadership:5,Stamina:5}, startRels:[{name:'Coach Ramos',val:60,dir:'friend'},{name:'Luca Moretti',val:-20,dir:'rival'}], startItems:['Cleats','Jersey','Water Bottle'], startQuests:[{name:'First Trial',desc:'Prove yourself in the opening match.'}], startNews:['New talent spotted at the trials.'] },
  { id:'galactic', name:'Galactic Frontier', desc:'Navigate a galaxy of factions, destiny, and conflict.', theme:'Space Adventure', icon:'🚀', villain:'Emperor Vexis', factions:['Vanguard Alliance','Iron Dominion','Nova Syndicate','Celestial Order'], locations:['Bridge','Engine Room','Mess Hall','Airlock'], startStat:{Piloting:10,Combat:5,Diplomacy:5,Navigation:5,Engineering:5}, startRels:[{name:'Commander Lyra',val:60,dir:'friend'},{name:'Admiral Kross',val:-20,dir:'rival'}], startItems:['Blaster','Space Suit','Datapad'], startQuests:[{name:'Distress Signal',desc:'Respond to an incoming distress call.'}], startNews:['Vanguard Alliance patrols increase.'] },
  { id:'hero', name:'Hero Nexus', desc:'Discover powers and decide what kind of hero you are.', theme:'Superhero', icon:'⚡', villain:'The Null', factions:['Titan Academy','Sentinel Academy','Nexus Institute','Phoenix Academy'], locations:['Hero HQ','Training Room','City Streets','Rooftop'], startStat:{'Power Control':10,Combat:5,PR:5,Strategy:5,Tech:5}, startRels:[{name:'Director Crane',val:60,dir:'friend'},{name:'Shadow Wolf',val:-20,dir:'rival'}], startItems:['Costume','Mask','Comms Device'], startQuests:[{name:'First Assignment',desc:'Handle a downtown incident.'}], startNews:['Hero Nexus recruits new members.'] },
  { id:'dragonfall', name:'Dragonfall Kingdoms', desc:'Rule kingdoms, tame dragons, shape a realm.', theme:'Medieval Fantasy', icon:'🐉', villain:'King Malakar', factions:['Emberhold','Frostmere','Thornvale','Goldcrest'], locations:['Throne Room','Stables','Battlefield','Dragon Pit'], startStat:{Combat:10,Leadership:5,Diplomacy:5,'Dragon Taming':5,Strategy:5}, startRels:[{name:'Lord Eryn',val:60,dir:'friend'},{name:'Lord Kael',val:-20,dir:'rival'}], startItems:['Sword','Armor','Map'], startQuests:[{name:'Tournament',desc:'Prove your worth in the arena.'}], startNews:['Dragon sightings reported near the border.'] },
  { id:'shadow', name:'Shadow Guild', desc:'Join a secret network of spies and power brokers.', theme:'Spy Thriller', icon:'🕶️', villain:'The Black Regent', factions:['Night Ravens','Phantom Circle','Iron Blades','Whisper Network'], locations:['Safe House','Drop Point','Club Red','Rooftop'], startStat:{Stealth:10,Deception:5,Combat:5,Hacking:5,Persuasion:5}, startRels:[{name:'Handler Zero',val:60,dir:'friend'},{name:'The Fox',val:-20,dir:'rival'}], startItems:['Lockpick','Disguise','Encrypted Phone'], startQuests:[{name:'First Contract',desc:'Complete your first guild assignment.'}], startNews:['Shadow Guild activity rises in the east.'] },
  { id:'neon', name:'Neon Domination', desc:'Rise through a mega-city ruled by AI and corporations.', theme:'Cyberpunk', icon:'🤖', villain:'Director Kron', factions:['Helix Industries','NovaCore','Synapse Systems','Apex Dynamics'], locations:['Hideout','Server Farm','Club Neon','Rooftop'], startStat:{Hacking:10,Combat:5,Persuasion:5,Cybernetics:5,Business:5}, startRels:[{name:'Sable',val:60,dir:'friend'},{name:'Director Kron',val:-20,dir:'rival'}], startItems:['Cyberdeck','Neural Implant','Cred Chip'], startQuests:[{name:'First Hack',desc:'Infiltrate a corporate system.'}], startNews:['Corps tighten security after recent breaches.'] },
  { id:'odyssey', name:'Eternal Odyssey', desc:'Journey through mythical realms and ancient trials.', theme:'Mythological', icon:'⚔️', villain:'The Eternal King', factions:['Dawnseekers','Moonwardens','Stormforged','Celestial Keepers'], locations:['Oracle Temple','Forest of Trials','Ancient Ruins','Village'], startStat:{Combat:10,Wisdom:5,Exploration:5,'Ancient Lore':5,Leadership:5}, startRels:[{name:'Sage Pyrene',val:60,dir:'friend'},{name:'General Vorn',val:-20,dir:'rival'}], startItems:['Sword','Shield','Torch'], startQuests:[{name:'Oracle Prophecy',desc:'Seek the Oracle Temple blessing.'}], startNews:['Ancient ruins unearthed in the valley.'] },
]

const getAct = (progress:number) => {
  if(progress<=4) return {id:1,name:'Awakening',range:[0,4]}
  if(progress<=9) return {id:2,name:'Rising Stakes',range:[5,9]}
  if(progress<=14) return {id:3,name:'Crisis',range:[10,14]}
  if(progress<=19) return {id:4,name:'Confrontation',range:[15,19]}
  return {id:5,name:'Climax',range:[20,24]}
}

export default function Play() {
  const [screen, setScreen] = useState('splash')
  const [player, setPlayer] = useState(defaultPlayer())
  const [world, setWorld] = useState<any>(null)
  const [scene, setScene] = useState<any>(null)
  const [hasError, setHasError] = useState(false)
  const [sceneHistory, setSceneHistory] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [notifs, setNotifs] = useState<any[]>([])
  const [nextAct, setNextAct] = useState<any>(null)
  const [showTransition, setShowTransition] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')
  const [historyOpen, setHistoryOpen] = useState(false)
  const historyRef = useRef<any[]>([])

  const callAI = async (msg:string, playerOverride?:any, worldOverride?:any):Promise<any> => {
    const p = playerOverride ?? player
    const w = worldOverride ?? world
    if(!w) { console.log('NO WORLD'); return null }
    const act = getAct(p.storyProgress)
    const sceneInAct = p.storyProgress - act.range[0] + 1
    const totalInAct = act.range[1] - act.range[0] + 1
    const system = `You are the game master for REVENIO, a linear alternate-life simulation game.

WORLD: ${w.name} | VILLAIN: ${w.villain} | FACTIONS: ${w.factions.join(', ')}

PLAYER: ${p.name}, Level ${p.level}, Traits: ${p.traits.join(', ')}, Goal: ${p.goal}

STATS: ${JSON.stringify(p.skills)}

RELATIONSHIPS: ${JSON.stringify(p.relationships.map((r:any)=>({name:r.name,val:r.val,dir:r.dir})))}

INVENTORY: ${p.inventory.join(', ')||'none'}

QUESTS: ${p.quests.filter((q:any)=>!q.done).map((q:any)=>q.name).join(', ')||'none'}

DECISIONS: ${p.majorDecisions.slice(-5).join(' | ')||'none'}

ACT: ${act.id} of 5 — ${act.name} | Scene ${sceneInAct} of ${totalInAct} | Overall: ${p.storyProgress} of 24

NARRATIVE RULES:

Act 1 scenes 0-4: Establish world, early wins, hint at villain, introduce key characters

Act 2 scenes 5-9: Stakes rise, rival confronts player directly, force a hard loyalty choice

Act 3 scenes 10-14: Crisis hits, something the player built is threatened, villain makes a move

Act 4 scenes 15-19: Direct confrontation begins, reference all past decisions, villain appears in person

Act 5 scenes 20-24: Climax and resolution. Scene 24 is the final battle. Set isFinalScene true on scene 24 only.

Every scene must reference at least one past player decision.

Stats affect the narrative. High courage means bold action. Low stamina means fatigue shows.

Scene text is 60 to 80 words, present tense, cinematic.

Always return exactly 4 choices unless isFinalScene is true.

Always change at least 2 stats. XP between 10 and 25.

RESPOND WITH ONLY THIS JSON NO MARKDOWN NO BACKTICKS NO EXTRA TEXT:

{"sceneTitle":"title","sceneText":"60-80 words present tense","choices":[{"id":"A","text":"choice","type":"bold","risk":"Low","hint":"hint"},{"id":"B","text":"choice","type":"strategic","risk":"Medium","hint":"hint"},{"id":"C","text":"choice","type":"loyal","risk":"High","hint":"hint"},{"id":"D","text":"Write your own path","type":"custom","risk":"Variable","hint":"anything goes"}],"statChanges":{"StatName":5,"StatName2":-2},"xpGained":15,"reputationChange":2,"relationshipChanges":[{"name":"Name","change":10,"dir":"friend"}],"inventoryUnlocks":[],"questUpdates":[],"newQuests":[],"newAchievements":[],"newsUpdates":["one headline"],"worldStateUpdates":{},"isFinalScene":false,"legacyTitle":"","legacyEnding":""}`

    historyRef.current.push({role:'user',content:msg})
    try {
      const { data, error } = await supabase.functions.invoke('ai-scene', {
        body: { system, messages: historyRef.current }
      })
      console.log('Full data:', JSON.stringify(data))
      console.log('Full error:', JSON.stringify(error))
      if (error) throw new Error(JSON.stringify(error))
      if (data?.type === 'error') throw new Error(JSON.stringify(data.error))
      const raw = (data.content || []).map((c: any) => c.text || '').join('')
      console.log('Raw:', raw)
      const match = raw.match(/\{[\s\S]*\}/)
      if (!match) throw new Error('no json found')
      const result = JSON.parse(match[0])
      historyRef.current.push({role:'assistant',content:raw})
      if (historyRef.current.length > 20) historyRef.current = historyRef.current.slice(-20)
      return result
    } catch(e) {
      console.log('FULL ERROR:', e)
      historyRef.current.pop()
      return null
    }
  }

  const toggleTrait = (t:string) => {
    setPlayer(p=>({...p,traits:p.traits.includes(t)?p.traits.filter((x:string)=>x!==t):p.traits.length<3?[...p.traits,t]:p.traits}))
  }

  const finishCreation = () => {
    if(!player.name.trim()){alert('Enter your name');return}
    if(player.traits.length<1){alert('Pick at least 1 trait');return}
    if(!player.goal){alert('Choose a goal');return}
    setScreen('worldselect')
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

  const applyScene = (s:any) => {
    const n:any[] = []
    setPlayer(prev => {
      const next = {...prev,skills:{...prev.skills},relationships:[...prev.relationships],inventory:[...prev.inventory],quests:[...prev.quests],achievements:[...prev.achievements],newsHistory:[...prev.newsHistory]}
      if(s.statChanges) Object.entries(s.statChanges).forEach(([k,v]:any)=>{if(next.skills[k]!==undefined){next.skills[k]=Math.max(0,Math.min(100,next.skills[k]+v));n.push({text:`${k} ${v>0?'+'+v:v}`,type:v>0?'pos':'neg'})}})
      if(s.xpGained){next.xp+=s.xpGained;n.push({text:`+${s.xpGained} XP`,type:'xp'});if(next.xp>=next.xpNext){next.xp-=next.xpNext;next.level+=1;next.xpNext=Math.round(next.xpNext*1.3);n.push({text:`LEVEL UP → ${next.level}`,type:'ach'})}}
      if(s.reputationChange){next.reputation+=s.reputationChange;n.push({text:`REP ${s.reputationChange>0?'+':''}${s.reputationChange}`,type:s.reputationChange>0?'pos':'neg'})}
      if(s.relationshipChanges) s.relationshipChanges.forEach((rc:any)=>{const idx=next.relationships.findIndex((r:any)=>r.name===rc.name);if(idx>=0){next.relationships[idx]={...next.relationships[idx],val:Math.max(0,Math.min(100,next.relationships[idx].val+rc.change)),dir:rc.dir??next.relationships[idx].dir};n.push({text:`${rc.name} ${rc.change>0?'▲':'▼'}`,type:rc.change>0?'pos':'neg'})}else{next.relationships.push({name:rc.name,type:'Character',val:Math.max(0,Math.min(100,50+rc.change)),dir:rc.dir??'neutral'});n.push({text:`Met: ${rc.name}`,type:'item'})}})
      if(s.inventoryUnlocks?.length) s.inventoryUnlocks.forEach((item:string)=>{if(!next.inventory.includes(item)){next.inventory.push(item);n.push({text:`Item: ${item}`,type:'item'})}})
      if(s.questUpdates) s.questUpdates.forEach((qu:any)=>{const idx=next.quests.findIndex((q:any)=>q.name===qu.name);if(idx>=0){next.quests[idx]={...next.quests[idx],...qu};if(qu.done)n.push({text:`✓ ${qu.name}`,type:'quest'})}})
      if(s.newQuests) s.newQuests.forEach((nq:any)=>{if(!next.quests.find((q:any)=>q.name===nq.name)){next.quests.push({...nq,done:false});n.push({text:`Quest: ${nq.name}`,type:'quest'})}})
      if(s.newAchievements) s.newAchievements.forEach((a:string)=>{if(!next.achievements.includes(a)){next.achievements.push(a);n.push({text:`🏆 ${a}`,type:'ach'})}})
      if(s.newsUpdates?.length) next.newsHistory=[...prev.newsHistory,...s.newsUpdates]
      next.storyProgress=prev.storyProgress+1
      next.worldState={...prev.worldState,...s.worldStateUpdates,sceneCount:(prev.worldState.sceneCount??0)+1}
      return next
    })
    return n
  }

  const handleChoice = async (choice:any) => {
    if(loading) return
    let msg = ''
    if(choice.id==='D'){const c=window.prompt('What do you do?');if(!c)return;msg=`Player custom action: "${c}". Create consequence scene.`}
    else msg=`Player chose "${choice.text}". Risk: ${choice.risk}. Create the consequence scene. Change at least 2 stats. Progress story toward ${world?.villain}.`
    setPlayer(p=>({...p,majorDecisions:[...p.majorDecisions,choice.text]}))
    setLoading(true)
    setHasError(false)
    const result = await callAI(msg)
    if(result){
      const n = applyScene(result)
      const prevAct = getAct(player.storyProgress)
      setScene(result)
      setNotifs(n)
      setSceneHistory(h=>[...h,result.sceneTitle])
      const newProgress = player.storyProgress + 1
      const newAct = getAct(newProgress)
      if(newAct.id !== prevAct.id && !result.isFinalScene){setNextAct(newAct);setShowTransition(true)}
    } else {
      setHasError(true)
    }
    setLoading(false)
  }

  const handleRetry = async () => {
    setHasError(false)
    setLoading(true)
    const result = await callAI('Continue the story from where we left off. Give the player a new choice.')
    if(result){const n=applyScene(result);setScene(result);setNotifs(n);setSceneHistory(h=>[...h,result.sceneTitle])}else{setHasError(true)}
    setLoading(false)
  }

  const handleSave = () => {
    try{
      localStorage.setItem('revenio_save',JSON.stringify({player,worldId:world?.id,scene,sceneHistory,history:historyRef.current.slice(-10)}))
      setSaveMsg('SAVED ✓')
    }catch{setSaveMsg('FAILED')}
    setTimeout(()=>setSaveMsg(''),2000)
  }

  const handleLoad = () => {
    try{
      const raw=localStorage.getItem('revenio_save')
      if(!raw){alert('No save found.');return}
      const d=JSON.parse(raw)
      const w=WORLDS.find(x=>x.id===d.worldId)
      if(!w){alert('Save corrupted.');return}
      setPlayer(d.player)
      setWorld(w)
      setScene(d.scene)
      setSceneHistory(d.sceneHistory??[])
      historyRef.current=d.history??[]
      setScreen('game')
      callAI('Continue the story from where we left off. Give the player a new choice.').then(result=>{
        if(result){const n=applyScene(result);setScene(result);setNotifs(n);setSceneHistory(h=>[...h,result.sceneTitle])}
      })
    }catch{alert('Could not load.')}
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

  if(screen==='game'){
    const act = getAct(player.storyProgress)
    const sceneInAct = player.storyProgress - act.range[0] + 1
    const totalInAct = act.range[1] - act.range[0] + 1
    const actPct = Math.round(((sceneInAct-1)/totalInAct)*100)

    if(showTransition && nextAct) return (
      <div style={{...G.app, ...G.center, padding:'40px', textAlign:'center'}}>
        {fonts}
        <div style={{color:'#D4A843',fontSize:'11px',letterSpacing:'6px'}}>ACT {nextAct.id} OF 5</div>
        <div style={{fontFamily:"'Cinzel',serif",fontSize:'48px',fontWeight:900,color:'#F0C060',letterSpacing:'4px'}}>{nextAct.name}</div>
        <div style={{...G.muted,maxWidth:'600px',fontSize:'15px',lineHeight:1.7}}>{nextAct.desc}</div>
        <button style={G.btnGold} onClick={()=>setShowTransition(false)}>CONTINUE YOUR LEGEND</button>
      </div>
    )

    return (
      <div style={G.app}>
        {fonts}
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

        <div style={G.topbar}>
          <div style={{fontFamily:"'Cinzel',serif",fontSize:'18px',fontWeight:900,color:'#D4A843',letterSpacing:'3px'}}>REVENIO</div>
          <div style={{display:'flex',alignItems:'center',gap:'16px',flex:1,justifyContent:'center'}}>
            <div style={{color:'#F0C060',fontWeight:700,letterSpacing:'1px'}}>{player.name}</div>
            <div style={{...G.muted,fontSize:'11px',letterSpacing:'2px'}}>LVL {player.level}</div>
            <div style={{display:'flex',alignItems:'center',gap:'8px',minWidth:'180px'}}>
              <div style={{color:'#D4A843',fontSize:'10px',letterSpacing:'2px'}}>XP</div>
              <div style={{flex:1,height:'6px',background:'#1A1A24',borderRadius:'2px',overflow:'hidden'}}>
                <div style={{width:`${(player.xp/player.xpNext)*100}%`,height:'100%',background:'linear-gradient(90deg,#8B6914,#D4A843)'}} />
              </div>
            </div>
          </div>
          <div style={{display:'flex',gap:'8px'}}>
            <button style={G.btnGhost} onClick={handleSave}>{saveMsg||'SAVE'}</button>
            <button style={G.btnGhost} onClick={()=>setScreen('worldselect')}>MENU</button>
          </div>
        </div>

        <div style={{display:'grid',gridTemplateColumns:'260px 1fr 260px',gap:'16px',padding:'16px',maxWidth:'1400px',margin:'0 auto'}}>
          <div style={{display:'flex',flexDirection:'column',gap:'16px'}}>
            <div style={G.surface}>
              <div style={G.sideLabel}>STORY PROGRESS</div>
              <div style={{color:'#F0C060',fontWeight:700,fontSize:'14px'}}>Act {act.id}: {act.name}</div>
              <div style={{...G.muted,fontSize:'11px',marginTop:'4px'}}>{(act as any).desc||''}</div>
              <div style={{height:'6px',background:'#0F0F14',borderRadius:'2px',overflow:'hidden',marginTop:'10px'}}>
                <div style={{width:`${actPct}%`,height:'100%',background:'linear-gradient(90deg,#8B6914,#D4A843)'}} />
              </div>
              <div style={{...G.muted,fontSize:'10px',marginTop:'6px',letterSpacing:'2px'}}>Scene {Math.max(1,sceneInAct)} of {totalInAct}</div>
            </div>

            <div style={G.surface}>
              <div style={G.sideLabel}>STATS</div>
              {Object.entries(player.skills).map(([k,v])=>(
                <div key={k} style={{marginBottom:'8px'}}>
                  <div style={{display:'flex',justifyContent:'space-between',fontSize:'11px',color:'#E8E4D8'}}>{k}</div>
                  <div style={{display:'flex',alignItems:'center',gap:'6px'}}>
                    <div style={{flex:1,height:'4px',background:'#0F0F14',borderRadius:'2px',overflow:'hidden'}}>
                      <div style={{width:`${Math.min(100,Number(v))}%`,height:'100%',background:'#D4A843'}} />
                    </div>
                    <div style={{color:'#F0C060',fontSize:'10px',width:'24px',textAlign:'right'}}>{Math.round(Number(v))}</div>
                  </div>
                </div>
              ))}
            </div>

            <div style={G.surface}>
              <div style={G.sideLabel}>QUESTS</div>
              {player.quests.filter((q:any)=>!q.done).slice(0,3).map((q:any,i:number)=>(
                <div key={i} style={{marginBottom:'10px',paddingBottom:'8px',borderBottom:'1px solid #2A2A3A'}}>
                  <div style={{color:'#F0C060',fontSize:'12px',fontWeight:700}}>{q.name}</div>
                  <div style={{...G.muted,fontSize:'11px',marginTop:'2px'}}>{q.desc}</div>
                </div>
              ))}
            </div>

            <div style={G.surface}>
              <div style={{...G.sideLabel,cursor:'pointer'}} onClick={()=>setHistoryOpen(h=>!h)}>STORY SO FAR {historyOpen?'▲':'▼'}</div>
              {historyOpen && sceneHistory.slice(-5).reverse().map((t,i)=>(
                <div key={i} style={{...G.muted,fontSize:'11px',marginBottom:'4px'}}>·{t}</div>
              ))}
            </div>
          </div>

          <div style={{display:'flex',flexDirection:'column',gap:'16px'}}>
            <div style={{display:'flex',flexDirection:'column',gap:'12px'}}>
              {notifs.length>0 && (
                <div style={{display:'flex',flexWrap:'wrap',gap:'8px'}}>
                  {notifs.map((n,i)=>{
                    const colors:any={pos:'rgba(39,174,96,.15)',neg:'rgba(192,57,43,.15)',xp:'rgba(212,168,67,.15)',ach:'rgba(41,128,185,.15)',item:'rgba(212,168,67,.15)',quest:'rgba(142,68,173,.15)'}
                    const borders:any={pos:'rgba(39,174,96,.4)',neg:'rgba(192,57,43,.4)',xp:'rgba(212,168,67,.4)',ach:'rgba(41,128,185,.4)',item:'rgba(212,168,67,.4)',quest:'rgba(142,68,173,.4)'}
                    const textc:any={pos:'#27AE60',neg:'#E74C3C',xp:'#F0C060',ach:'#5DADE2',item:'#F0C060',quest:'#BB8FCE'}
                    return <div key={i} style={{background:colors[n.kind]||colors.pos,border:`1px solid ${borders[n.kind]||borders.pos}`,color:textc[n.kind]||textc.pos,padding:'6px 12px',fontSize:'11px',letterSpacing:'1px',borderRadius:'2px'}}>{n.text}</div>
                  })}
                </div>
              )}

              {loading && (
                <div style={{...G.surface,...G.center,padding:'60px',gap:'16px'}}>
                  <div style={{width:'32px',height:'32px',border:'3px solid #2A2A3A',borderTopColor:'#D4A843',borderRadius:'50%',animation:'spin 1s linear infinite'}} />
                  <div style={{color:'#D4A843',fontSize:'11px',letterSpacing:'4px'}}>GENERATING YOUR FATE...</div>
                </div>
              )}

              {hasError && !loading && (
                <div style={{...G.surface,textAlign:'center',padding:'40px'}}>
                  <div style={{color:'#E74C3C',fontSize:'14px',letterSpacing:'3px',fontWeight:700}}>THE RIFT TREMBLES</div>
                  <div style={{...G.muted,fontSize:'12px',margin:'10px 0 20px'}}>The simulation faltered. Your legend continues.</div>
                  <button style={G.btnGold} onClick={handleRetry}>RETRY</button>
                </div>
              )}

              {scene && !loading && !hasError && (
                <>
                  <div style={G.surface}>
                    <div style={{color:'#D4A843',fontSize:'10px',letterSpacing:'3px',marginBottom:'8px'}}>{world?.name?.toUpperCase()} · ACT {act.id}</div>
                    <div style={{fontFamily:"'Cinzel',serif",fontSize:'22px',fontWeight:700,color:'#F0C060',marginBottom:'14px',letterSpacing:'1px'}}>{scene.sceneTitle}</div>
                    <div style={{color:'#E8E4D8',fontSize:'15px',lineHeight:1.8,whiteSpace:'pre-wrap'}}>{scene.sceneText}</div>
                  </div>

                  {scene.isFinalScene ? (
                    <div style={{...G.surface,textAlign:'center',padding:'40px'}}>
                      <div style={{color:'#D4A843',fontSize:'11px',letterSpacing:'4px'}}>YOUR LEGEND IS WRITTEN</div>
                      <div style={{color:'#E8E4D8',fontSize:'14px',lineHeight:1.7,margin:'16px 0'}}>{scene.legacyEnding}</div>
                      <div style={{fontFamily:"'Cinzel',serif",fontSize:'24px',color:'#F0C060',fontWeight:700,letterSpacing:'2px',marginBottom:'20px'}}>{scene.legacyTitle}</div>
                      <button style={G.btnGold} onClick={()=>setScreen('legacy')}>SEE YOUR LEGACY</button>
                    </div>
                  ) : (
                    <div style={{display:'flex',flexDirection:'column',gap:'10px'}}>
                      {(scene.choices||[]).map((c:any,i:number)=>(
                        <button key={i} onClick={()=>handleChoice(c)} disabled={loading} style={{background:'#1A1A24',border:'1px solid #3A3A4A',color:'#E8E4D8',padding:'14px 16px',cursor:loading?'not-allowed':'pointer',textAlign:'left',fontFamily:"'Rajdhani',sans-serif",fontSize:'14px',fontWeight:600,display:'flex',flexDirection:'column',gap:'4px',letterSpacing:'.5px',borderRadius:'2px',opacity:loading?0.5:1}} onMouseEnter={e=>{if(!loading){e.currentTarget.style.borderColor='#D4A843';e.currentTarget.style.color='#F0C060'}}} onMouseLeave={e=>{e.currentTarget.style.borderColor='#3A3A4A';e.currentTarget.style.color='#E8E4D8'}}>
                          <span style={{color:'#D4A843',fontSize:'10px',letterSpacing:'2px'}}>[{c.type?.toUpperCase()}]</span>
                          <span>{c.text}</span>
                          <span style={{...G.muted,fontSize:'11px'}}>Risk: {c.risk} · {c.hint}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          <div style={{display:'flex',flexDirection:'column',gap:'16px'}}>
            <div style={G.surface}>
              <div style={G.sideLabel}>RELATIONSHIPS</div>
              {player.relationships.slice(0,5).map((r:any,i:number)=>{
                const initials=r.name.split(' ').map((x:string)=>x[0]).join('').substring(0,2)
                return (
                  <div key={i} style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'10px'}}>
                    <div style={{width:'32px',height:'32px',borderRadius:'50%',background:'#2A2A3A',display:'flex',alignItems:'center',justifyContent:'center',color:'#D4A843',fontSize:'11px',fontWeight:700}}>{initials}</div>
                    <div style={{flex:1}}>
                      <div style={{color:'#E8E4D8',fontSize:'12px',fontWeight:700}}>{r.name}</div>
                      <div style={{...G.muted,fontSize:'10px',letterSpacing:'1px'}}>{r.type||r.dir} · {r.val}%</div>
                      <div style={{height:'3px',background:'#0F0F14',borderRadius:'2px',overflow:'hidden',marginTop:'3px'}}>
                        <div style={{width:`${Math.max(0,Math.min(100,Number(r.val)))}%`,height:'100%',background:Number(r.val)>=0?'#27AE60':'#E74C3C'}} />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            <div style={G.surface}>
              <div style={G.sideLabel}>INVENTORY</div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'6px'}}>
                {Array.from({length:8},(_,i)=>(
                  <div key={i} style={{aspectRatio:'1',background:'#0F0F14',border:'1px solid #2A2A3A',borderRadius:'2px',display:'flex',alignItems:'center',justifyContent:'center',color:player.inventory[i]?'#F0C060':'#3A3A4A',fontSize:'10px',padding:'2px',textAlign:'center'}}>
                    {player.inventory[i]?player.inventory[i].split(' ')[0]:'·'}
                  </div>
                ))}
              </div>
            </div>

            <div style={G.surface}>
              <div style={G.sideLabel}>NEWS FEED</div>
              {player.newsHistory.slice(-5).reverse().map((n:string,i:number)=>(
                <div key={i} style={{...G.muted,fontSize:'11px',marginBottom:'6px',lineHeight:1.4}}>📰 {n}</div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if(screen==='legacy'){

    const topStat = Object.entries(player.skills).sort((a,b)=>Number(b[1])-Number(a[1]))[0]

    return (

      <div style={{...G.app,display:'flex',flexDirection:'column',alignItems:'center',padding:'40px 20px',background:'radial-gradient(ellipse at center,#0F0F20,#0A0A0C)'}}>

        {fonts}

        <div style={{maxWidth:'700px',width:'100%'}}>

          <div style={{textAlign:'center',marginBottom:'32px'}}>

            <div style={{...G.gold,fontSize:'10px',letterSpacing:'4px',marginBottom:'8px'}}>{world?.name?.toUpperCase()}</div>

            <div style={{fontFamily:"'Cinzel',serif",fontSize:'clamp(24px,6vw,42px)',fontWeight:900,color:'#F0C060',letterSpacing:'4px'}}>{player.name.toUpperCase()}</div>

            <div style={{...G.muted,fontSize:'14px',letterSpacing:'3px',marginTop:'8px'}}>{scene?.legacyTitle||'A Legend in the Making'}</div>

          </div>

          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'12px',marginBottom:'32px'}}>

            {[['LEVEL',player.level],['SCENES',player.storyProgress],['ACHIEVEMENTS',player.achievements.length],['REPUTATION',player.reputation]].map(([l,v])=>(

              <div key={String(l)} style={{background:'#1A1A24',padding:'16px',textAlign:'center',borderRadius:'2px'}}>

                <div style={{...G.gold,fontSize:'9px',letterSpacing:'3px',marginBottom:'6px'}}>{l}</div>

                <div style={{fontFamily:"'Orbitron',monospace",fontSize:'24px',color:'#F0C060'}}>{v}</div>

              </div>

            ))}

          </div>

          {topStat && (

            <div style={{...G.surface,marginBottom:'20px'}}>

              <div style={{...G.gold,fontSize:'9px',letterSpacing:'4px',marginBottom:'8px'}}>TOP SKILL</div>

              <div style={{fontSize:'16px',fontWeight:600}}>{topStat[0]}: {Math.round(Number(topStat[1]))}</div>

            </div>

          )}

          <div style={{...G.surface,marginBottom:'20px'}}>

            <div style={{...G.gold,fontSize:'9px',letterSpacing:'4px',borderBottom:'1px solid #2A2A3A',paddingBottom:'6px',marginBottom:'10px'}}>YOUR STORY</div>

            {sceneHistory.map((t,i)=> (

              <div key={i} style={{display:'flex',gap:'12px',padding:'6px 0',borderBottom:'1px solid #2A2A3A',alignItems:'center'}}>

                <span style={{fontFamily:"'Orbitron',monospace",fontSize:'11px',color:'#8B6914',minWidth:'20px'}}>{i+1}</span>

                <span style={{fontSize:'13px'}}>{t}</span>

              </div>

            ))}

          </div>

          {player.majorDecisions.length>0 && (

            <div style={{...G.surface,marginBottom:'20px'}}>

              <div style={{...G.gold,fontSize:'9px',letterSpacing:'4px',borderBottom:'1px solid #2A2A3A',paddingBottom:'6px',marginBottom:'10px'}}>KEY DECISIONS</div>

              {player.majorDecisions.map((d,i)=> (

                <div key={i} style={{...G.muted,fontSize:'13px',padding:'4px 0'}}>· {d}</div>

              ))}

            </div>

          )}

          {player.achievements.length>0 && (

            <div style={{...G.surface,marginBottom:'24px'}}>

              <div style={{...G.gold,fontSize:'9px',letterSpacing:'4px',marginBottom:'10px'}}>ACHIEVEMENTS</div>

              <div style={{display:'flex',flexWrap:'wrap',gap:'8px'}}>

                {player.achievements.map((a,i)=> (

                  <span key={i} style={{background:'#8B6914',color:'#F0C060',fontSize:'11px',padding:'4px 12px',letterSpacing:'1px',borderRadius:'2px'}}>🏆 {a}</span>

                ))}

              </div>

            </div>

          )}

          <div style={{display:'flex',gap:'12px',justifyContent:'center'}}>

            <button style={G.btnGold} onClick={()=>{setWorld(null);setScene(null);setSceneHistory([]);setNotifs([]);setPlayer(defaultPlayer());setScreen('worldselect')}}>NEW WORLD</button>

            <button style={G.btnGhost} onClick={()=>{setWorld(null);setScene(null);setSceneHistory([]);setNotifs([]);setPlayer(defaultPlayer());setScreen('creation')}}>NEW CHARACTER</button>

          </div>

        </div>

      </div>

    )

  }

  return null

}
