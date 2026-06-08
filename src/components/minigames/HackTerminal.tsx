import { useState, useEffect, useRef } from 'react'

interface Props {
  playerName: string
  targetName: string
  onComplete: (result: { success: boolean; description: string }) => void
}

export default function HackTerminal({ playerName, targetName, onComplete }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number | undefined>(undefined)
  const [phase, setPhase] = useState<'boot'|'hack'|'result'>('boot')
  const [bootLines, setBootLines] = useState<string[]>([])
  const [success, setSuccess] = useState(false)
  const [resultText, setResultText] = useState('')
  const [grid, setGrid] = useState<{code:string,type:'real'|'decoy'|'used'|'wrong'}[][]>([])
  const [sequence, setSequence] = useState<string[]>([])
  const [entered, setEntered] = useState<string[]>([])
  const [timeLeft, setTimeLeft] = useState(25)
  const [traceProgress, setTraceProgress] = useState(0)
  const [layer, setLayer] = useState(1)
  const [layerComplete, setLayerComplete] = useState(false)
  const timerRef = useRef<any>(null)
  const traceRef = useRef<any>(null)
  const ended = useRef(false)
  const layerRef = useRef(1)
  const nodeMap = useRef(
    Array.from({length:12},(_,i)=>({
      id:i,
      x:Math.random(),
      y:Math.random(),
      color:['#00FF41','#00AAFF','#F0C060'][Math.floor(Math.random()*3)]
    }))
  )

  const CODES = ['4A7F','9B2E','C31D','7E4A','2F8C','B6D1','5A9E','3C7F','8D2B','1F6A']
  const DECOYS = ['XXXX','????','////','----','::::','NULL']

  useEffect(()=>{
    const lines = [
      `> REVENIO BREACH OS v3.1`,
      `> Target: ${targetName.toUpperCase()} mainframe`,
      `> Scanning firewall layers...`,
      `> Vulnerability detected in sector ${Math.floor(Math.random()*9)+1}`,
      `> WARNING: Active trace protocol engaged`,
      `> READY — Match the sequence to breach`,
    ]
    let i=0
    const t=setInterval(()=>{
      if(i<lines.length){
        setBootLines(prev=>[...prev,lines[i]])
        i++
      } else {
        clearInterval(t)
        buildLayer(1)
        setPhase('hack')
      }
    },400)
    return()=>clearInterval(t)
  },[])

  const buildLayer=(layerNum:number)=>{
    layerRef.current=layerNum
    const seqLen=layerNum+2
    const seq=Array.from({length:seqLen},()=>CODES[Math.floor(Math.random()*CODES.length)])
    setSequence(seq)
    setEntered([])
    setLayerComplete(false)
    const allCodes=[...seq]
    while(allCodes.length<16){
      if(Math.random()>0.4) allCodes.push(CODES[Math.floor(Math.random()*CODES.length)])
      else allCodes.push(DECOYS[Math.floor(Math.random()*DECOYS.length)])
    }
    allCodes.sort(()=>Math.random()-0.5)
    const g:{code:string,type:'real'|'decoy'|'used'|'wrong'}[][]=[]
    for(let r=0;r<4;r++){
      g.push(allCodes.slice(r*4,r*4+4).map(code=>({
        code,
        type:(DECOYS.includes(code)?'decoy':'real') as 'real'|'decoy'
      })))
    }
    setGrid(g)
    setTimeLeft(25-(layerNum-1)*3)
  }

  useEffect(()=>{
    if(phase!=='hack') return
    timerRef.current=setInterval(()=>{
      setTimeLeft(t=>{
        if(t<=1){
          clearInterval(timerRef.current)
          if(!ended.current) endHack(false)
          return 0
        }
        return t-1
      })
    },1000)
    traceRef.current=setInterval(()=>{
      setTraceProgress(p=>{
        const newP=p+(layerRef.current*1.2)
        if(newP>=100){
          clearInterval(traceRef.current)
          if(!ended.current) endHack(false)
          return 100
        }
        return newP
      })
    },300)
    return()=>{clearInterval(timerRef.current);clearInterval(traceRef.current)}
  },[phase])

  useEffect(()=>{
    if(phase!=='hack') return
    const canvas=canvasRef.current
    if(!canvas) return
    const ctx=canvas.getContext('2d')!
    let running=true
    const draw=()=>{
      if(!running) return
      const W=canvas.width,H=canvas.height
      ctx.clearRect(0,0,W,H)
      ctx.fillStyle='#050510'
      ctx.fillRect(0,0,W,H)
      ctx.strokeStyle='rgba(0,255,65,0.05)'
      ctx.lineWidth=1
      for(let x=0;x<W;x+=20){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke()}
      for(let y=0;y<H;y+=20){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke()}
      const time=Date.now()*0.001
      nodeMap.current.forEach((n,i)=>{
        const nx=n.x*W,ny=n.y*H
        const pulse=0.3+Math.sin(time*2+i)*0.3
        const hexAlpha=Math.round(pulse*255).toString(16).padStart(2,'0')
        ctx.strokeStyle=n.color+hexAlpha
        ctx.lineWidth=1
        nodeMap.current.slice(i+1,i+3).forEach(m=>{
          ctx.beginPath();ctx.moveTo(nx,ny);ctx.lineTo(m.x*W,m.y*H);ctx.stroke()
        })
        const grd=ctx.createRadialGradient(nx,ny,0,nx,ny,8)
        grd.addColorStop(0,n.color)
        grd.addColorStop(1,'transparent')
        ctx.fillStyle=grd
        ctx.beginPath();ctx.arc(nx,ny,8,0,Math.PI*2);ctx.fill()
      })
      animRef.current=requestAnimationFrame(draw)
    }
    animRef.current=requestAnimationFrame(draw)
    return()=>{running=false;if(animRef.current)cancelAnimationFrame(animRef.current)}
  },[phase])

  const handleCellClick=(row:number,col:number)=>{
    if(phase!=='hack'||ended.current) return
    const cell=grid[row][col]
    if(cell.type==='used'||cell.type==='wrong') return
    if(cell.type==='decoy'){
      const newGrid=grid.map(r=>r.map(c=>({...c})))
      newGrid[row][col].type='wrong'
      setGrid(newGrid)
      setTraceProgress(p=>Math.min(100,p+15))
      return
    }
    const expectedCode=sequence[entered.length]
    if(cell.code===expectedCode){
      const newEntered=[...entered,cell.code]
      setEntered(newEntered)
      const newGrid=grid.map(r=>r.map(c=>({...c})))
      newGrid[row][col].type='used'
      setGrid(newGrid)
      if(newEntered.length===sequence.length){
        clearInterval(timerRef.current)
        clearInterval(traceRef.current)
        setLayerComplete(true)
        if(layerRef.current<3){
          setTimeout(()=>{
            const nextLayer=layerRef.current+1
            setLayer(nextLayer)
            buildLayer(nextLayer)
            setTraceProgress(0)
          },1200)
        } else {
          setTimeout(()=>endHack(true),1200)
        }
      }
    } else {
      const newGrid=grid.map(r=>r.map(c=>({...c})))
      newGrid[row][col].type='wrong'
      setGrid(newGrid)
      setEntered([])
      setTraceProgress(p=>Math.min(100,p+10))
    }
  }

  const endHack=(isSuccess:boolean)=>{
    if(ended.current) return
    ended.current=true
    clearInterval(timerRef.current)
    clearInterval(traceRef.current)
    setSuccess(isSuccess)
    setPhase('result')
    const desc=isSuccess
      ?`${playerName} threads the exploit perfectly. ${targetName} mainframe breached. Full access granted.`
      :`The trace completes. ${targetName}'s security team responds. ${playerName} disconnects just in time.`
    setResultText(desc)
    setTimeout(()=>onComplete({success:isSuccess,description:desc}),2500)
  }

  const getCellStyle=(cell:{code:string,type:string}):React.CSSProperties=>{
    const base:React.CSSProperties={
      padding:'10px 4px',cursor:'pointer',
      fontFamily:"'Courier New',monospace",fontSize:'13px',
      letterSpacing:'2px',borderRadius:'2px',textAlign:'center',
      transition:'all .15s',border:'1px solid',fontWeight:700
    }
    switch(cell.type){
      case 'used': return{...base,background:'rgba(0,255,65,0.2)',borderColor:'#00FF41',color:'#00FF41',cursor:'default'}
      case 'wrong': return{...base,background:'rgba(231,76,60,0.15)',borderColor:'#E74C3C',color:'rgba(231,76,60,0.3)',cursor:'default'}
      case 'decoy': return{...base,background:'#050510',borderColor:'rgba(200,50,50,0.2)',color:'rgba(231,76,60,0.5)'}
      default: return{...base,background:'rgba(0,255,65,0.03)',borderColor:'rgba(0,255,65,0.2)',color:'#00FF41'}
    }
  }

  return (
    <div style={{background:'#050510',borderRadius:'4px',overflow:'hidden',maxWidth:'520px',margin:'0 auto',fontFamily:"'Courier New',monospace"}}>
      {phase==='boot'&&(
        <div style={{padding:'20px',minHeight:'200px'}}>
          <div style={{color:'#00FF41',fontSize:'10px',letterSpacing:'4px',marginBottom:'12px'}}>BREACH TERMINAL</div>
          {bootLines.map((line,i)=>(
            <div key={i} style={{color:i===bootLines.length-1?'#00FF41':'rgba(0,255,65,0.5)',fontSize:'12px',lineHeight:1.9}}>{line}</div>
          ))}
        </div>
      )}
      {phase==='hack'&&(
        <>
          <canvas ref={canvasRef} width={520} height={80} style={{display:'block',width:'100%'}}/>
          <div style={{padding:'10px 16px',background:'rgba(0,0,0,0.5)',display:'flex',gap:'12px',alignItems:'center'}}>
            <div style={{flex:1}}>
              <div style={{color:'rgba(0,255,65,0.5)',fontSize:'9px',letterSpacing:'3px',marginBottom:'3px'}}>TRACE PROGRESS</div>
              <div style={{width:'100%',height:'6px',background:'#001a00',borderRadius:'3px',overflow:'hidden'}}>
                <div style={{height:'100%',width:`${traceProgress}%`,background:traceProgress>70?'#E74C3C':traceProgress>40?'#D4A843':'#00FF41',transition:'width .3s',borderRadius:'3px'}}/>
              </div>
            </div>
            <div style={{textAlign:'center' as const,minWidth:'50px'}}>
              <div style={{color:'rgba(0,255,65,0.5)',fontSize:'9px',letterSpacing:'2px'}}>TIME</div>
              <div style={{fontFamily:"'Orbitron',monospace",fontSize:'20px',color:timeLeft>10?'#00FF41':timeLeft>5?'#D4A843':'#E74C3C',fontWeight:700}}>{timeLeft}</div>
            </div>
            <div style={{textAlign:'right' as const}}>
              <div style={{color:'rgba(0,255,65,0.5)',fontSize:'9px',letterSpacing:'2px'}}>LAYER</div>
              <div style={{fontFamily:"'Orbitron',monospace",fontSize:'20px',color:'#00FF41',fontWeight:700}}>{layer}/3</div>
            </div>
          </div>
          <div style={{padding:'12px 16px',background:'rgba(0,255,65,0.02)'}}>
            <div style={{color:'rgba(0,255,65,0.5)',fontSize:'9px',letterSpacing:'3px',marginBottom:'6px'}}>TARGET SEQUENCE</div>
            <div style={{display:'flex',gap:'6px',marginBottom:'12px',flexWrap:'wrap' as const}}>
              {sequence.map((s,i)=>(
                <div key={i} style={{background:i<entered.length?'rgba(0,255,65,0.2)':'rgba(0,255,65,0.05)',border:`1px solid ${i<entered.length?'#00FF41':'rgba(0,255,65,0.3)'}`,color:i<entered.length?'#00FF41':'rgba(0,255,65,0.4)',padding:'4px 8px',fontSize:'12px',letterSpacing:'2px',borderRadius:'2px',minWidth:'52px',textAlign:'center' as const,fontWeight:700}}>
                  {i<entered.length?entered[i]:'????'}
                </div>
              ))}
            </div>
            {layerComplete&&(
              <div style={{textAlign:'center' as const,color:'#00FF41',fontSize:'13px',letterSpacing:'3px',padding:'8px',background:'rgba(0,255,65,0.1)',borderRadius:'2px',marginBottom:'8px',fontFamily:"'Cinzel',serif"}}>
                LAYER {layer} BREACHED — LOADING NEXT...
              </div>
            )}
            {!layerComplete&&(
              <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'6px'}}>
                {grid.map((row,ri)=>row.map((cell,ci)=>{
                  const key = `${ri}-${ci}`
                  return (
                    <button key={key} onClick={()=>handleCellClick(ri,ci)} style={getCellStyle(cell)}>{cell.code}</button>
                  )
                }))}
              </div>
            )}
            <div style={{color:'rgba(0,255,65,0.4)',fontSize:'10px',textAlign:'center' as const,marginTop:'10px',letterSpacing:'2px'}}>
              SELECT CODES IN ORDER · AVOID DECOYS
            </div>
          </div>
        </>
      )}
      {phase==='result'&&(
        <div style={{padding:'40px',textAlign:'center' as const,background:`radial-gradient(ellipse at center,${success?'rgba(0,255,65,0.08)':'rgba(200,50,50,0.08)'},#050510)`}}>
          <div style={{fontSize:'36px',marginBottom:'12px'}}>{success?'':''}</div>
          <div style={{fontFamily:"'Cinzel',serif",fontSize:'20px',fontWeight:700,color:success?'#00FF41':'#E74C3C',letterSpacing:'3px',marginBottom:'12px'}}>{success?'ACCESS GRANTED':'ACCESS DENIED'}</div>
          <div style={{color:'#E8E4D8',fontSize:'13px',lineHeight:1.7,fontFamily:"'Rajdhani',sans-serif"}}>{resultText}</div>
        </div>
      )}
    </div>
  )
}
