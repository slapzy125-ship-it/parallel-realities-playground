import { useEffect, useState } from 'react'

interface Props {
  title: string
  desc: string
  tier: 'bronze' | 'silver' | 'gold' | 'platinum'
  onDone: () => void
}

const TIER_COLORS = {
  bronze: { main:'#CD7F32', glow:'rgba(205,127,50,0.3)', label:'BRONZE TROPHY' },
  silver: { main:'#C0C0C0', glow:'rgba(192,192,192,0.3)', label:'SILVER TROPHY' },
  gold:   { main:'#FFD700', glow:'rgba(255,215,0,0.3)',   label:'GOLD TROPHY' },
  platinum:{ main:'#E5E4E2', glow:'rgba(229,228,226,0.3)',label:'PLATINUM TROPHY' },
}

export default function TrophyPopup({ title, desc, tier, onDone }: Props) {
  const [visible, setVisible] = useState(false)
  const c = TIER_COLORS[tier]

  useEffect(() => {
    const showTimer = setTimeout(() => setVisible(true), 50)
    const hideTimer = setTimeout(() => {
      setVisible(false)
      setTimeout(onDone, 400)
    }, 4000)
    return () => { clearTimeout(showTimer); clearTimeout(hideTimer) }
  }, [])

  return (
    <div style={{
      position:'fixed',
      bottom:'24px',
      right:'24px',
      zIndex:3000,
      transform: visible ? 'translateX(0)' : 'translateX(130%)',
      transition:'transform 0.4s cubic-bezier(0.34,1.56,0.64,1)',
      fontFamily:"'Rajdhani',sans-serif",
    }}>
      <div style={{
        background:'linear-gradient(135deg,#0F0F14,#1A1A24)',
        border:`1px solid ${c.main}`,
        borderRadius:'4px',
        padding:'14px 18px',
        display:'flex',
        alignItems:'center',
        gap:'14px',
        minWidth:'280px',
        boxShadow:`0 0 30px ${c.glow}, 0 4px 20px rgba(0,0,0,0.5)`,
      }}>
        <div style={{
          width:'48px',
          height:'48px',
          borderRadius:'50%',
          background:`radial-gradient(circle at 30% 30%, ${c.main}, ${c.main}88)`,
          display:'flex',
          alignItems:'center',
          justifyContent:'center',
          fontSize:'22px',
          flexShrink:0,
          boxShadow:`0 0 15px ${c.glow}`,
        }}>
          
        </div>
        <div>
          <div style={{color:c.main,fontSize:'9px',letterSpacing:'3px',marginBottom:'2px'}}>{c.label}</div>
          <div style={{fontFamily:"'Cinzel',serif",fontSize:'14px',fontWeight:700,color:'#F0C060',marginBottom:'2px'}}>{title}</div>
          <div style={{color:'#7A7A8A',fontSize:'11px',lineHeight:1.3}}>{desc}</div>
        </div>
      </div>
    </div>
  )
}
