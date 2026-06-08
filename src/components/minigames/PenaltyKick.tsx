import { useState, useEffect, useRef } from 'react'

interface Props {
  playerName: string
  shootingSkill?: number
  onComplete: (result: { scored: boolean; description: string }) => void
}

export default function PenaltyKick({ playerName, shootingSkill = 50, onComplete }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [phase, setPhase] = useState<'intro'|'aim'|'shoot'|'result'>('intro')
  const [scored, setScored] = useState(false)
  const [resultText, setResultText] = useState('')
  const [countdown, setCountdown] = useState(3)
  const aimPos = useRef({ x: 0.5, y: 0.5 })
  const mousePos = useRef({ x: 0.5, y: 0.5 })
  const holdStart = useRef(0)
  const keeperX = useRef(0.5)
  const keeperLean = useRef(0)
  const animFrame = useRef<number>()
  const ballAnim = useRef({active:false,x:0.5,y:0.85,tx:0.5,ty:0.2,progress:0,scale:1})
  const keeperAnim = useRef({diving:false,dir:0,progress:0})
  const phaseRef = useRef('intro')

  useEffect(() => { phaseRef.current = phase }, [phase])

  useEffect(() => {
    if (phase !== 'intro') return
    let c = 3
    setCountdown(3)
    const t = setInterval(() => {
      c--
      setCountdown(c)
      if (c <= 0) { clearInterval(t); setPhase('aim') }
    }, 1000)
    return () => clearInterval(t)
  }, [phase])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    let running = true
    const draw = () => {
      if (!running) return
      const W = canvas.width, H = canvas.height
      ctx.clearRect(0, 0, W, H)

      const sky = ctx.createLinearGradient(0, 0, 0, H)
      sky.addColorStop(0, '#0a0a1a')
      sky.addColorStop(1, '#1a1a2e')
      ctx.fillStyle = sky
      ctx.fillRect(0, 0, W, H)

      ;[W*0.1, W*0.9].forEach(lx => {
        const lg = ctx.createRadialGradient(lx, H*0.05, 0, lx, H*0.05, 120)
        lg.addColorStop(0, 'rgba(255,240,180,0.4)')
        lg.addColorStop(1, 'rgba(255,240,180,0)')
        ctx.fillStyle = lg
        ctx.fillRect(0, 0, W, H)
      })

      const pitch = ctx.createLinearGradient(0, H*0.5, 0, H)
      pitch.addColorStop(0, '#1a4a1a')
      pitch.addColorStop(1, '#0d2e0d')
      ctx.fillStyle = pitch
      ctx.fillRect(0, H*0.45, W, H)

      const goalL=W*0.2, goalR=W*0.8, goalTop=H*0.12, goalBot=H*0.45

      ctx.shadowColor='rgba(255,255,255,0.3)'
      ctx.shadowBlur=8
      ctx.strokeStyle='#ffffff'
      ctx.lineWidth=4
      ctx.beginPath()
      ctx.moveTo(goalL,goalBot); ctx.lineTo(goalL,goalTop)
      ctx.lineTo(goalR,goalTop); ctx.lineTo(goalR,goalBot)
      ctx.stroke()
      ctx.shadowBlur=0

      ctx.strokeStyle='rgba(255,255,255,0.08)'
      ctx.lineWidth=0.5
      for(let nx=goalL;nx<=goalR;nx+=20){ctx.beginPath();ctx.moveTo(nx,goalTop);ctx.lineTo(nx,goalBot);ctx.stroke()}
      for(let ny=goalTop;ny<=goalBot;ny+=15){ctx.beginPath();ctx.moveTo(goalL,ny);ctx.lineTo(goalR,ny);ctx.stroke()}

      const kx=keeperX.current*W, ky=goalBot-30, lean=keeperLean.current
      if (keeperAnim.current.diving) {
        const dp=Math.min(1,keeperAnim.current.progress)
        keeperAnim.current.progress+=0.04
        const diveX=kx+keeperAnim.current.dir*dp*W*0.35
        const diveY=ky+dp*40
        ctx.save()
        ctx.translate(diveX,diveY)
        ctx.rotate(keeperAnim.current.dir*dp*1.2)
        ctx.fillStyle='#F39C12'
        ctx.beginPath(); ctx.ellipse(0,-35,14,14,0,0,Math.PI*2); ctx.fill()
        ctx.fillStyle='#2980B9'
        ctx.fillRect(-12,-20,24,28)
        ctx.restore()
      } else {
        ctx.save()
        ctx.translate(kx+lean*30,ky)
        ctx.fillStyle='#F39C12'
        ctx.beginPath(); ctx.arc(0,-35,14,0,Math.PI*2); ctx.fill()
        ctx.fillStyle='#2980B9'
        ctx.fillRect(-12,-20,24,28)
        const eyeOffX=(mousePos.current.x-keeperX.current)*8
        ctx.fillStyle='#111'
        ctx.beginPath(); ctx.arc(-5+eyeOffX*0.3,-37,3,0,Math.PI*2); ctx.fill()
        ctx.beginPath(); ctx.arc(5+eyeOffX*0.3,-37,3,0,Math.PI*2); ctx.fill()
        ctx.restore()
      }

      if (phaseRef.current==='aim') {
        const holdTime=holdStart.current>0?(Date.now()-holdStart.current)/1000:0
        const sway=Math.sin(Date.now()*0.003)*0.06
        const readShot=Math.min(1,holdTime/2)
        keeperLean.current+=((mousePos.current.x-0.5)*readShot*0.8+sway-keeperLean.current)*0.08
        keeperX.current+=(0.5+sway*0.3-keeperX.current)*0.03
      }

      const ba=ballAnim.current
      let bx=ba.x*W, by=ba.y*H, bscale=ba.scale
      if (ba.active) {
        ba.progress=Math.min(1,ba.progress+0.035)
        const t=ba.progress
        const eased=t<0.5?2*t*t:-1+(4-2*t)*t
        bx=(ba.x+(ba.tx-ba.x)*eased)*W
        by=(ba.y+(ba.ty-ba.y)*eased)*H
        bscale=1-t*0.65
      }

      ctx.fillStyle='rgba(0,0,0,0.3)'
      ctx.beginPath(); ctx.ellipse(bx,H*0.88,15*bscale,5*bscale,0,0,Math.PI*2); ctx.fill()

      ctx.save()
      ctx.translate(bx,by); ctx.scale(bscale,bscale)
      const ballGrad=ctx.createRadialGradient(-4,-4,2,0,0,16)
      ballGrad.addColorStop(0,'#ffffff'); ballGrad.addColorStop(0.4,'#dddddd'); ballGrad.addColorStop(1,'#888888')
      ctx.fillStyle=ballGrad; ctx.beginPath(); ctx.arc(0,0,16,0,Math.PI*2); ctx.fill()
      ctx.restore()

      if (phaseRef.current==='aim') {
        const ax=aimPos.current.x*W, ay=aimPos.current.y*H
        const pulse=0.7+Math.sin(Date.now()*0.006)*0.3
        ctx.strokeStyle=`rgba(212,168,67,${pulse})`; ctx.lineWidth=2
        const size=14
        ctx.beginPath()
        ctx.moveTo(ax-size,ay);ctx.lineTo(ax-4,ay)
        ctx.moveTo(ax+4,ay);ctx.lineTo(ax+size,ay)
        ctx.moveTo(ax,ay-size);ctx.lineTo(ax,ay-4)
        ctx.moveTo(ax,ay+4);ctx.lineTo(ax,ay+size)
        ctx.stroke()
      }

      animFrame.current=requestAnimationFrame(draw)
    }
    draw()
    return () => { running=false; if(animFrame.current) cancelAnimationFrame(animFrame.current) }
  }, [phase])

  const handleMouseMove=(e:React.MouseEvent<HTMLCanvasElement>)=>{
    if(phase!=='aim')return
    const rect=e.currentTarget.getBoundingClientRect()
    const x=(e.clientX-rect.left)/rect.width
    const y=(e.clientY-rect.top)/rect.height
    mousePos.current={x,y}
    if(x>0.18&&x<0.82&&y>0.1&&y<0.45)aimPos.current={x,y}
  }

  const handleMouseDown=()=>{if(phase==='aim')holdStart.current=Date.now()}

  const handleMouseUp=()=>{
    if(phase!=='aim')return
    const holdTime=(Date.now()-holdStart.current)/1000
    holdStart.current=0
    setPhase('shoot')
    const tx=aimPos.current.x, ty=aimPos.current.y
    const inGoal=tx>0.2&&tx<0.8&&ty>0.1&&ty<0.45
    const readByKeeper=Math.min(1,holdTime/2)
    const shotSide=tx<0.4?'left':tx>0.6?'right':'center'
    const keeperGuess=readByKeeper>0.7?shotSide:Math.random()>0.5?'left':'right'
    keeperAnim.current={diving:true,dir:keeperGuess==='left'?-1:1,progress:0}
    const keeperSaves=keeperGuess===shotSide&&ty>0.25&&Math.random()<0.6+(100-shootingSkill)*0.003
    const isScored=inGoal&&!keeperSaves
    ballAnim.current={active:true,x:0.5,y:0.85,tx,ty:ty*0.95,progress:0,scale:1}
    setTimeout(()=>{
      setScored(isScored)
      setResultText(
        !inGoal?`${playerName} drags it wide. The keeper did not even need to move.`:
        ty<0.2&&isScored?`Top corner. Unstoppable. The keeper had no chance.`:
        keeperSaves?`The keeper reads it perfectly and gets both hands to it.`:
        shotSide!==keeperGuess?`The keeper goes the wrong way. ${playerName} slots it ${shotSide}.`:
        `${playerName} holds their nerve and finds the bottom corner.`
      )
      setPhase('result')
      setTimeout(()=>onComplete({scored:isScored,description:''}),2500)
    },1800)
  }

  return (
    <div style={{background:'#0A0A0C',borderRadius:'4px',overflow:'hidden',maxWidth:'520px',margin:'0 auto',fontFamily:"'Rajdhani',sans-serif"}}>
      {(phase==='intro'||phase==='aim'||phase==='shoot'||phase==='result')&&(
        <div style={{position:'relative'}}>
          <canvas ref={canvasRef} width={520} height={320} style={{display:'block',width:'100%',cursor:phase==='aim'?'crosshair':'default'}} onMouseMove={handleMouseMove} onMouseDown={handleMouseDown} onMouseUp={handleMouseUp}/>

          {phase==='intro'&&(
            <div style={{position:'absolute',inset:0,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',background:'rgba(0,0,0,0.6)'}}>
              <div style={{color:'#D4A843',fontSize:'10px',letterSpacing:'4px',marginBottom:'8px'}}>PENALTY KICK</div>
              <div style={{fontFamily:"'Cinzel',serif",fontSize:'72px',fontWeight:900,color:'#F0C060'}}>{countdown||'GO!'}</div>
              <div style={{color:'#7A7A8A',fontSize:'12px',letterSpacing:'2px',marginTop:'8px'}}>MOVE MOUSE TO AIM · HOLD TO SHOOT</div>
            </div>
          )}

          {phase==='result'&&(
            <div style={{position:'absolute',inset:0,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',background:'rgba(0,0,0,0.75)',padding:'24px',textAlign:'center'}}>
              <div style={{fontSize:'48px',marginBottom:'8px'}}>{scored?'⚽':'🧤'}</div>
              <div style={{fontFamily:"'Cinzel',serif",fontSize:'28px',fontWeight:700,color:scored?'#27AE60':'#E74C3C',letterSpacing:'2px',marginBottom:'12px'}}>{scored?'GOAL!':'SAVED!'}</div>
              <div style={{color:'#E8E4D8',fontSize:'14px',lineHeight:1.7}}>{resultText}</div>
            </div>
          )}
        </div>
      )}

      <div style={{padding:'10px 16px',background:'#0F0F14',display:'flex',justifyContent:'space-between'}}>
        <div style={{color:'#D4A843',fontSize:'10px',letterSpacing:'3px'}}>⚽ PENALTY KICK</div>
        <div style={{color:'#7A7A8A',fontSize:'11px'}}>{playerName}</div>
      </div>
    </div>
  )
}
