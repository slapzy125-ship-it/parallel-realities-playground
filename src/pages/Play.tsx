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

export default function Play() {
  const [screen, setScreen] = useState('splash')
  const [player, setPlayer] = useState(defaultPlayer())

  const toggleTrait = (t:string) => {
    setPlayer(p=>({...p,traits:p.traits.includes(t)?p.traits.filter((x:string)=>x!==t):p.traits.length<3?[...p.traits,t]:p.traits}))
  }

  const finishCreation = () => {
    if(!player.name.trim()){alert('Enter your name');return}
    if(player.traits.length<1){alert('Pick at least 1 trait');return}
    if(!player.goal){alert('Choose a goal');return}
    setScreen('worldselect')
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

  return <div style={{...G.app, ...G.center}}>{fonts}<div style={G.gold}>Loading...</div></div>
}
