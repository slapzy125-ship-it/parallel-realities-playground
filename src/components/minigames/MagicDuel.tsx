import { useState, useEffect, useRef } from 'react'

interface Props {
  playerName: string
  opponentName: string
  onComplete: (result: { won: boolean; description: string }) => void
}

interface Projectile { id:number;x:number;y:number;vx:number;vy:number;color:string;size:number;fromPlayer:boolean;spell:string }
interface Particle { id:number;x:number;y:number;vx:number;vy:number;color:string;life:number }

export default function MagicDuel({ playerName, opponentName, onComplete }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number | undefined>(undefined)
  const [phase, setPhase] = useState<'intro'|'duel'|'result'>('intro')
  const [playerHP, setPlayerHP] = useState(100)
  const [enemyHP, setEnemyHP] = useState(100)
  const [won, setWon] = useState(false)
  const [resultText, setResultText] = useState('')
  const [spellCooldown, setSpellCooldown] = useState(0)
  const [activeSpell, setActiveSpell] = useState(0)

  const SPELLS = [
    { name:'Fireball', color:'#E74C3C', damage:18, speed:0.008, size:10 },
    { name:'Ice Lance', color:'#3498DB', damage:22, speed:0.012, size:7 },
    { name:'Void Bolt', color:'#9B59B6', damage:28, speed:0.006, size:14 },
    { name:'Shield', color:'#F1C40F', damage:0, speed:0, size:0 },
  ]

  const S = useRef({
    playerHP:100, enemyHP:100,
    projectiles:[] as Projectile[],
    particles:[] as Particle[],
    playerX:0.15, enemyX:0.85,
    playerY:0.6, enemyY:0.6,
    playerShield:0, enemyShield:0,
    enemyAttackTimer:0,
    spellCooldown:0,
    nextId:0,
    ended:false,
  })

  useEffect(() => {
    if (phase !== 'duel') return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    let running = true

    const spawnParticles = (x:number,y:number,color:string,count:number) => {
      for (let i=0;i<count;i++) {
        const angle=(Math.PI*2*i)/count+Math.random()*0.5
        const speed=0.003+Math.random()*0.006
        S.current.particles.push({id:S.current.nextId++,x,y,vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed,color,life:1})
      }
    }

    const enemyAttack = () => {
      const s=S.current
      const spell=SPELLS[Math.floor(Math.random()*3)]
      const angle=Math.atan2(s.playerY-s.enemyY,s.playerX-s.enemyX)
      const spread=(Math.random()-0.5)*0.3
      s.projectiles.push({id:s.nextId++,x:s.enemyX,y:s.enemyY,vx:Math.cos(angle+spread)*spell.speed*0.8,vy:Math.sin(angle+spread)*spell.speed*0.8,color:spell.color,size:spell.size*0.8,fromPlayer:false,spell:spell.name})
    }

    const loop = () => {
      if (!running) return
      const W=canvas.width, H=canvas.height
      const s=S.current

      s.spellCooldown=Math.max(0,s.spellCooldown-1)
      s.enemyShield=Math.max(0,s.enemyShield-0.5)
      s.playerShield=Math.max(0,s.playerShield-0.5)
      setSpellCooldown(s.spellCooldown)

      s.enemyAttackTimer++
      if (s.enemyAttackTimer>80+Math.random()*60) { enemyAttack(); s.enemyAttackTimer=0 }

      s.projectiles=s.projectiles.filter(p => {
        p.x+=p.vx; p.y+=p.vy
        if (p.x<0||p.x>1||p.y<0||p.y>1) return false
        if (p.fromPlayer) {
          if (Math.hypot(p.x-s.enemyX,p.y-s.enemyY)<0.08) {
            const spell=SPELLS.find(sp=>sp.name===p.spell)!
            const dmg=s.enemyShield>0?spell.damage*0.2:spell.damage
            s.enemyHP=Math.max(0,s.enemyHP-dmg)
            setEnemyHP(Math.round(s.enemyHP))
            spawnParticles(p.x,p.y,p.color,12)
            if (s.enemyHP<=0&&!s.ended) {
              s.ended=true
              setWon(true)
              const desc=`${playerName} lands the final spell. ${opponentName} staggers backward, magic extinguished.`
              setResultText(desc)
              setPhase('result')
              setTimeout(()=>onComplete({won:true,description:desc}),2000)
            }
            return false
          }
        } else {
          if (Math.hypot(p.x-s.playerX,p.y-s.playerY)<0.08) {
            const dmg=s.playerShield>0?4:20+Math.random()*8
            s.playerHP=Math.max(0,s.playerHP-dmg)
            setPlayerHP(Math.round(s.playerHP))
            spawnParticles(p.x,p.y,s.playerShield>0?'#F1C40F':p.color,10)
            if (s.playerHP<=0&&!s.ended) {
              s.ended=true
              const desc=`${opponentName}'s spells overwhelm ${playerName}'s defences. A painful defeat.`
              setResultText(desc)
              setPhase('result')
              setTimeout(()=>onComplete({won:false,description:desc}),2000)
            }
            return false
          }
        }
        return true
      })

      s.particles=s.particles.filter(p=>{p.x+=p.vx;p.y+=p.vy;p.vy+=0.00005;p.life-=0.03;return p.life>0})

      ctx.clearRect(0,0,W,H)

      const bg=ctx.createLinearGradient(0,0,0,H)
      bg.addColorStop(0,'#050520'); bg.addColorStop(1,'#0a0a1a')
      ctx.fillStyle=bg; ctx.fillRect(0,0,W,H)

      s.particles.forEach(p=>{
        ctx.globalAlpha=p.life; ctx.fillStyle=p.color
        ctx.beginPath(); ctx.arc(p.x*W,p.y*H,3,0,Math.PI*2); ctx.fill()
      })
      ctx.globalAlpha=1

      s.projectiles.forEach(p=>{
        const px=p.x*W, py=p.y*H
        const glow=ctx.createRadialGradient(px,py,0,px,py,p.size*2.5)
        glow.addColorStop(0,p.color); glow.addColorStop(0.4,p.color+'88'); glow.addColorStop(1,'transparent')
        ctx.fillStyle=glow; ctx.beginPath(); ctx.arc(px,py,p.size*2.5,0,Math.PI*2); ctx.fill()
        ctx.fillStyle='#fff'; ctx.beginPath(); ctx.arc(px,py,p.size*0.4,0,Math.PI*2); ctx.fill()
      })

      const drawFighter=(x:number,y:number,color:string,label:string,shield:number,flip:boolean)=>{
        const fx=x*W, fy=y*H
        if (shield>0) {
          ctx.strokeStyle=`rgba(241,196,15,${shield/100})`; ctx.lineWidth=3
          ctx.beginPath(); ctx.arc(fx,fy,30,0,Math.PI*2); ctx.stroke()
        }
        ctx.save()
        if (flip) { ctx.scale(-1,1); ctx.translate(-fx*2,0) }
        const bx=flip?-fx:fx
        ctx.fillStyle=color
        ctx.beginPath(); ctx.arc(bx,fy-20,12,0,Math.PI*2); ctx.fill()
        ctx.fillRect(bx-10,fy-8,20,25)
        ctx.fillStyle=color+'88'
        ctx.fillRect(bx-18,fy-6,8,15); ctx.fillRect(bx+10,fy-6,8,15)
        ctx.restore()
        ctx.fillStyle='rgba(255,255,255,0.7)'
        ctx.font='9px sans-serif'; ctx.textAlign='center'
        ctx.fillText(label.split(' ')[0],fx,fy+28)
      }

      drawFighter(s.playerX,s.playerY,'#8E44AD',playerName,s.playerShield,false)
      drawFighter(s.enemyX,s.enemyY,'#C0392B',opponentName,s.enemyShield,true)

      animRef.current=requestAnimationFrame(loop)
    }

    animRef.current=requestAnimationFrame(loop)
    return ()=>{running=false;if(animRef.current)cancelAnimationFrame(animRef.current)}
  },[phase])

  const castSpell=(idx:number)=>{
    const s=S.current
    if (s.spellCooldown>0||s.ended) return
    setActiveSpell(idx)
    const spell=SPELLS[idx]
    if (spell.name==='Shield') { s.playerShield=100; s.spellCooldown=90; return }
    const angle=Math.atan2(s.enemyY-s.playerY,s.enemyX-s.playerX)
    s.projectiles.push({id:s.nextId++,x:s.playerX,y:s.playerY,vx:Math.cos(angle)*spell.speed,vy:Math.sin(angle)*spell.speed,color:spell.color,size:spell.size,fromPlayer:true,spell:spell.name})
    s.spellCooldown=45
  }

  const HPBar=({hp,name,flip}:{hp:number,name:string,flip?:boolean})=>(
    <div style={{flex:1}}>
      {!flip&&<div style={{color:'#E8E4D8',fontSize:'11px',marginBottom:'3px'}}>{name}</div>}
      <div style={{width:'100%',height:'8px',background:'#1A1A24',borderRadius:'4px',overflow:'hidden'}}>
        <div style={{height:'100%',width:`${hp}%`,background:hp>50?'#27AE60':hp>25?'#D4A843':'#E74C3C',transition:'width 0.3s',borderRadius:'4px'}}/>
      </div>
      <div style={{color:'#7A7A8A',fontSize:'10px',marginTop:'2px',textAlign:flip?'right':'left'}}>{Math.max(0,hp)}HP</div>
      {flip&&<div style={{color:'#E8E4D8',fontSize:'11px',marginTop:'2px',textAlign:'right'}}>{name}</div>}
    </div>
  )

  return (
    <div style={{background:'#050520',borderRadius:'4px',overflow:'hidden',maxWidth:'520px',margin:'0 auto',fontFamily:"'Rajdhani',sans-serif"}}>
      {phase==='intro'&&(
        <div style={{padding:'40px',textAlign:'center',background:'radial-gradient(ellipse at center,#1a0a2e,#050520)'}}>
          <div style={{color:'#9B59B6',fontSize:'10px',letterSpacing:'4px',marginBottom:'16px'}}>MAGIC DUEL</div>
          <div style={{fontFamily:"'Cinzel',serif",fontSize:'22px',fontWeight:700,color:'#E8E4D8',marginBottom:'8px'}}>{playerName}</div>
          <div style={{color:'#9B59B6',fontSize:'20px',marginBottom:'8px'}}>⚡ VS ⚡</div>
          <div style={{fontFamily:"'Cinzel',serif",fontSize:'22px',fontWeight:700,color:'#E74C3C',marginBottom:'24px'}}>{opponentName}</div>
          <button style={{background:'linear-gradient(135deg,#6C3483,#9B59B6)',color:'#fff',fontFamily:"'Cinzel',serif",fontWeight:700,padding:'12px 32px',border:'none',cursor:'pointer',letterSpacing:'2px',fontSize:'14px',borderRadius:'2px'}} onClick={()=>setPhase('duel')}>BEGIN DUEL</button>
        </div>
      )}

      {phase==='duel'&&(
        <>
          <div style={{padding:'10px 16px',background:'#0a0a1a',display:'flex',gap:'12px',alignItems:'center'}}>
            <HPBar hp={playerHP} name={playerName}/>
            <div style={{color:'#9B59B6',fontWeight:700,fontSize:'12px',flexShrink:0}}>VS</div>
            <HPBar hp={enemyHP} name={opponentName} flip/>
          </div>
          <canvas ref={canvasRef} width={520} height={280} style={{display:'block',width:'100%'}}/>
          <div style={{padding:'12px',background:'#0a0a1a',display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'8px'}}>
            {SPELLS.map((spell,idx)=>{
              const isShield = spell.name === 'Shield'
              return (
                <button key={spell.name} onClick={()=>castSpell(idx)} disabled={spellCooldown>0} style={{background:activeSpell===idx?spell.color+'22':'#0F0F20',border:`1px solid ${spellCooldown>0?'#2A2A3A':spell.color}`,color:spellCooldown>0?'#3A3A4A':spell.color,padding:'10px 4px',cursor:spellCooldown>0?'not-allowed':'pointer',fontFamily:"'Rajdhani',sans-serif",fontSize:'11px',fontWeight:700,borderRadius:'2px',display:'flex',flexDirection:'column',alignItems:'center',gap:'4px'}}>
                  <span style={{fontSize:'18px'}}>{isShield?'🛡️':spell.name==='Fireball'?'🔥':spell.name==='Ice Lance'?'🧊':'⚫'}</span>
                  {spell.name}
                  {spell.damage>0&&<span style={{fontSize:'9px',color:'#7A7A8A'}}>{spell.damage} dmg</span>}
                </button>
              )
            })}
          </div>
          {spellCooldown>0&&(
            <div style={{background:'#0a0a1a',padding:'4px 16px'}}>
              <div style={{width:'100%',height:'3px',background:'#1A1A24',borderRadius:'2px'}}>
                <div style={{width:`${(1-spellCooldown/90)*100}%`,height:'100%',background:'#9B59B6',transition:'width .1s',borderRadius:'2px'}}/>
              </div>
            </div>
          )}
        </>
      )}

      {phase==='result'&&(
        <div style={{padding:'40px',textAlign:'center',background:`radial-gradient(ellipse at center,${won?'rgba(39,174,96,0.15)':'rgba(192,57,43,0.15)'},#050520)`}}>
          <div style={{fontSize:'40px',marginBottom:'12px'}}>{won?'✨':'💀'}</div>
          <div style={{fontFamily:"'Cinzel',serif",fontSize:'24px',fontWeight:700,color:won?'#27AE60':'#E74C3C',letterSpacing:'2px',marginBottom:'12px'}}>{won?'VICTORY':'DEFEATED'}</div>
          <div style={{color:'#E8E4D8',fontSize:'14px',lineHeight:1.7}}>{resultText}</div>
        </div>
      )}
    </div>
  )
}
