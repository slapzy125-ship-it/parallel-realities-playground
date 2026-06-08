import { useState, useEffect, useRef } from 'react'

interface Props {
  playerName: string
  opponentName: string
  onComplete: (result: { won: boolean; healthRemaining: number; description: string }) => void
}

export default function CombatStrike({ playerName, opponentName, onComplete }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number | undefined>(undefined)
  const [phase, setPhase] = useState<'intro'|'fight'|'result'>('intro')
  const [playerHP, setPlayerHP] = useState(100)
  const [enemyHP, setEnemyHP] = useState(100)
  const [won, setWon] = useState(false)
  const [resultText, setResultText] = useState('')
  const [canAct, setCanAct] = useState(true)
  const [showPrompt, setShowPrompt] = useState<{text:string;color:string}|null>(null)

  const S = useRef({
    playerHP:100, enemyHP:100,
    playerX:0.2, enemyX:0.75,
    playerY:0.65, enemyY:0.65,
    playerAnim:'idle', enemyAnim:'idle',
    playerAnimTimer:0, enemyAnimTimer:0,
    particles:[] as any[],
    nextId:0, canAct:true, combo:0,
    ended:false, enemyAttackTimer:60,
    shakeX:0, shakeY:0, blocking:false,
  })

  useEffect(()=>{
    if (phase!=='fight') return
    const canvas=canvasRef.current
    if (!canvas) return
    const ctx=canvas.getContext('2d')!
    let running=true

    const addParticles=(x:number,y:number,color:string,count=8)=>{
      for(let i=0;i<count;i++){
        const a=Math.random()*Math.PI*2
        const spd=0.004+Math.random()*0.008
        S.current.particles.push({id:S.current.nextId++,x,y,vx:Math.cos(a)*spd,vy:Math.sin(a)*spd,color,life:1,size:2+Math.random()*4})
      }
    }

    const drawFighter=(cx:number,cy:number,color:string,animState:string,timer:number,label:string,flip:boolean)=>{
      const W=canvas.width,H=canvas.height
      const x=cx*W,y=cy*H
      ctx.save()
      if(flip){ctx.scale(-1,1);ctx.translate(-x*2,0)}
      const bx=flip?-x:x
      const bob=Math.sin(timer*0.1)*(animState==='idle'?3:0)
      ctx.fillStyle=animState==='hurt'?'#E74C3C':color
      ctx.beginPath();ctx.arc(bx,y-55+bob,12,0,Math.PI*2);ctx.fill()
      ctx.fillStyle=color
      ctx.fillRect(bx-10,y-43+bob,20,28)
      if(animState==='attack'){
        ctx.fillRect(bx+10,y-38+bob,28,8)
      } else if(animState==='block'){
        ctx.fillStyle=color+'88'
        ctx.fillRect(bx-22,y-50+bob,18,32)
      } else {
        ctx.fillRect(bx-18,y-38+bob+Math.sin(timer*0.1)*4,8,20)
        ctx.fillRect(bx+10,y-38+bob-Math.sin(timer*0.1)*4,8,20)
      }
      ctx.fillStyle=color
      ctx.fillRect(bx-10,y-15+bob,8,22)
      ctx.fillRect(bx+2,y-15+bob,8,22)
      ctx.restore()
      ctx.fillStyle='rgba(255,255,255,0.6)'
      ctx.font='10px sans-serif';ctx.textAlign='center'
      ctx.fillText(label.split(' ')[0],cx*W,cy*H+15)
    }

    const loop=()=>{
      if(!running)return
      const W=canvas.width,H=canvas.height
      const s=S.current
      s.playerAnimTimer++;s.enemyAnimTimer++
      s.shakeX*=0.85;s.shakeY*=0.85
      if(s.playerAnimTimer>20&&(s.playerAnim==='attack'||s.playerAnim==='hurt')){s.playerAnim='idle';s.playerAnimTimer=0}
      if(s.enemyAnimTimer>20&&(s.enemyAnim==='attack'||s.enemyAnim==='hurt')){s.enemyAnim='idle';s.enemyAnimTimer=0}
      s.enemyAttackTimer--
      if(s.enemyAttackTimer<=0&&!s.ended){
        const blocked=s.blocking&&Math.random()>0.3
        const dmg=blocked?5:15+Math.floor(Math.random()*15)
        s.enemyAnim='attack';s.enemyAnimTimer=0
        setTimeout(()=>{
          if(s.ended)return
          s.playerAnim=blocked?'block':'hurt';s.playerAnimTimer=0
          s.playerHP=Math.max(0,s.playerHP-dmg)
          s.shakeX=blocked?3:8
          setPlayerHP(Math.round(s.playerHP))
          addParticles(s.playerX,s.playerY,blocked?'#F1C40F':'#E74C3C',blocked?5:10)
          if(s.playerHP<=0&&!s.ended){
            s.ended=true
            const desc=`${opponentName} overpowers ${playerName} with a devastating combination.`
            setResultText(desc);setPhase('result')
            setTimeout(()=>onComplete({won:false,healthRemaining:0,description:desc}),2000)
          }
        },300)
        s.enemyAttackTimer=70+Math.floor(Math.random()*50)
      }
      s.particles=s.particles.filter((p:any)=>{p.x+=p.vx;p.y+=p.vy;p.life-=0.04;return p.life>0})
      ctx.clearRect(0,0,W,H)
      ctx.save()
      ctx.translate(s.shakeX*(Math.random()-0.5),s.shakeY*(Math.random()-0.5))
      const bg=ctx.createLinearGradient(0,0,0,H)
      bg.addColorStop(0,'#1a0a0a');bg.addColorStop(1,'#0a0505')
      ctx.fillStyle=bg;ctx.fillRect(0,0,W,H)
      ctx.fillStyle='rgba(180,50,50,0.08)'
      ctx.fillRect(0,H*0.72,W,H*0.28)
      s.particles.forEach((p:any)=>{
        ctx.globalAlpha=p.life;ctx.fillStyle=p.color
        ctx.beginPath();ctx.arc(p.x*W,p.y*H,p.size,0,Math.PI*2);ctx.fill()
      })
      ctx.globalAlpha=1
      drawFighter(s.playerX,s.playerY,'#8E44AD',s.playerAnim,s.playerAnimTimer,playerName,false)
      drawFighter(s.enemyX,s.enemyY,'#C0392B',s.enemyAnim,s.enemyAnimTimer,opponentName,true)
      if(s.combo>1){
        ctx.fillStyle='#D4A843'
        ctx.font=`bold ${14+s.combo*2}px Cinzel`
        ctx.textAlign='center';ctx.globalAlpha=0.9
        ctx.fillText(`${s.combo}x COMBO!`,W/2,H*0.25)
        ctx.globalAlpha=1
      }
      ctx.restore()
      animRef.current=requestAnimationFrame(loop)
    }
    animRef.current=requestAnimationFrame(loop)
    return()=>{running=false;if(animRef.current)cancelAnimationFrame(animRef.current)}
  },[phase])

  const playerAttack=(type:'quick'|'heavy'|'block')=>{
    const s=S.current
    if(!s.canAct||s.ended)return
    if(type==='block'){
      s.blocking=true;s.playerAnim='block'
      setCanAct(false)
      setTimeout(()=>{s.blocking=false;s.canAct=true;setCanAct(true)},1200)
      return
    }
    s.canAct=false;setCanAct(false)
    s.playerAnim='attack';s.playerAnimTimer=0
    const baseDmg=type==='quick'?12+Math.random()*10:22+Math.random()*15
    const dodged=type==='heavy'&&Math.random()>0.65
    const dmg=dodged?0:baseDmg
    const newCombo=dodged?0:s.combo+1
    s.combo=newCombo
    const prompt=dodged
      ?{text:'DODGED!',color:'#E74C3C'}
      :newCombo>2
        ?{text:`${newCombo}x COMBO!`,color:'#D4A843'}
        :{text:`HIT! -${Math.round(dmg)}`,color:'#27AE60'}
    setShowPrompt(prompt)
    setTimeout(()=>setShowPrompt(null),800)
    setTimeout(()=>{
      if(s.ended)return
      s.enemyAnim=dodged?'idle':'hurt';s.enemyAnimTimer=0
      s.enemyHP=Math.max(0,s.enemyHP-dmg);s.shakeX=dodged?0:6
      setEnemyHP(Math.round(s.enemyHP))
      if(s.enemyHP<=0&&!s.ended){
        s.ended=true
        const finalHP=Math.round(s.playerHP)
        const desc=`${playerName} lands a decisive ${newCombo>2?newCombo+'-hit combo':'blow'} and ${opponentName} goes down.`
        setResultText(desc);setWon(true);setPhase('result')
        setTimeout(()=>onComplete({won:true,healthRemaining:finalHP,description:desc}),2000)
      }
      setTimeout(()=>{s.canAct=true;setCanAct(true)},type==='quick'?400:700)
    },250)
  }

  return (
    <div style={{background:'#1a0a0a',borderRadius:'4px',overflow:'hidden',maxWidth:'520px',margin:'0 auto',fontFamily:"'Rajdhani',sans-serif"}}>
      {phase==='intro'&&(
        <div style={{padding:'40px',textAlign:'center',background:'radial-gradient(ellipse at center,#2d1515,#0a0505)'}}>
          <div style={{color:'#E74C3C',fontSize:'10px',letterSpacing:'4px',marginBottom:'16px'}}>COMBAT</div>
          <div style={{fontFamily:"'Cinzel',serif",fontSize:'22px',fontWeight:700,color:'#E8E4D8',marginBottom:'8px'}}>{playerName}</div>
          <div style={{color:'#E74C3C',fontSize:'20px',marginBottom:'8px'}}> VS </div>
          <div style={{fontFamily:"'Cinzel',serif",fontSize:'22px',fontWeight:700,color:'#E74C3C',marginBottom:'24px'}}>{opponentName}</div>
          <button style={{background:'linear-gradient(135deg,#922B21,#E74C3C)',color:'#fff',fontFamily:"'Cinzel',serif",fontWeight:700,padding:'12px 32px',border:'none',cursor:'pointer',letterSpacing:'2px',fontSize:'14px',borderRadius:'2px'}} onClick={()=>setPhase('fight')}>FIGHT</button>
        </div>
      )}
      {phase==='fight'&&(
        <>
          <div style={{padding:'10px 16px',background:'#0a0505',display:'flex',gap:'12px',alignItems:'center'}}>
            <div style={{flex:1}}>
              <div style={{color:'#E8E4D8',fontSize:'11px',marginBottom:'3px'}}>{playerName}</div>
              <div style={{width:'100%',height:'8px',background:'#1A0A0A',borderRadius:'4px',overflow:'hidden'}}>
                <div style={{height:'100%',width:`${playerHP}%`,background:playerHP>50?'#27AE60':playerHP>25?'#D4A843':'#E74C3C',transition:'width 0.3s',borderRadius:'4px'}}/>
              </div>
              <div style={{color:'#7A7A8A',fontSize:'10px',marginTop:'2px'}}>{playerHP}HP</div>
            </div>
            <div style={{color:'#E74C3C',fontWeight:700,fontSize:'14px',flexShrink:0}}>VS</div>
            <div style={{flex:1,textAlign:'right' as const}}>
              <div style={{color:'#E74C3C',fontSize:'11px',marginBottom:'3px'}}>{opponentName}</div>
              <div style={{width:'100%',height:'8px',background:'#1A0A0A',borderRadius:'4px',overflow:'hidden'}}>
                <div style={{height:'100%',width:`${enemyHP}%`,background:'#E74C3C',transition:'width 0.3s',borderRadius:'4px'}}/>
              </div>
              <div style={{color:'#7A7A8A',fontSize:'10px',marginTop:'2px',textAlign:'right' as const}}>{enemyHP}HP</div>
            </div>
          </div>
          <div style={{position:'relative'}}>
            <canvas ref={canvasRef} width={520} height={280} style={{display:'block',width:'100%'}}/>
            {showPrompt&&(
              <div style={{position:'absolute',top:'20%',left:'50%',transform:'translateX(-50%)',fontFamily:"'Cinzel',serif",fontSize:'18px',fontWeight:700,color:showPrompt.color,pointerEvents:'none',whiteSpace:'nowrap' as const}}>
                {showPrompt.text}
              </div>
            )}
          </div>
          <div style={{padding:'12px',background:'#0a0505',display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'8px'}}>
            {[
              {label:'Quick Strike',icon:'',type:'quick' as const,color:'#27AE60',desc:'Fast, reliable'},
              {label:'Heavy Blow',icon:'',type:'heavy' as const,color:'#E74C3C',desc:'Slow, powerful'},
              {label:'Block',icon:'',type:'block' as const,color:'#F1C40F',desc:'Reduce damage'},
            ].map(btn=>(
              <button key={btn.type} onClick={()=>playerAttack(btn.type)} disabled={!canAct} style={{background:canAct?btn.color+'15':'#0a0505',border:`1px solid ${canAct?btn.color:'#2A2A3A'}`,color:canAct?btn.color:'#3A3A4A',padding:'10px 6px',cursor:canAct?'pointer':'not-allowed',fontFamily:"'Rajdhani',sans-serif",fontSize:'12px',fontWeight:700,letterSpacing:'1px',borderRadius:'2px',display:'flex',flexDirection:'column' as const,alignItems:'center',gap:'4px',transition:'all .15s'}}>
                <span style={{fontSize:'20px'}}>{btn.icon}</span>
                {btn.label}
                <span style={{fontSize:'9px',color:'#7A7A8A'}}>{btn.desc}</span>
              </button>
            ))}
          </div>
        </>
      )}
      {phase==='result'&&(
        <div style={{padding:'40px',textAlign:'center',background:`radial-gradient(ellipse at center,${won?'rgba(39,174,96,0.15)':'rgba(192,57,43,0.15)'},#0a0505)`}}>
          <div style={{fontSize:'40px',marginBottom:'12px'}}>{won?'':''}</div>
          <div style={{fontFamily:"'Cinzel',serif",fontSize:'24px',fontWeight:700,color:won?'#27AE60':'#E74C3C',letterSpacing:'2px',marginBottom:'12px'}}>{won?'VICTORY':'DEFEATED'}</div>
          <div style={{color:'#E8E4D8',fontSize:'14px',lineHeight:1.7}}>{resultText}</div>
        </div>
      )}
    </div>
  )
}
