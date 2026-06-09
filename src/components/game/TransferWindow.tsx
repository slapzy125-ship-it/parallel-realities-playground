import { useState } from 'react'

interface Club {
  name: string
  league: string
  leagueFlag: string
  wageOffer: string
  transferFee: string
  playingTime: string
  championsLeague: boolean
  pitch: string
  pros: string[]
  cons: string[]
}

interface Props {
  playerName: string
  currentClub: string
  position: string
  marketValue: string
  clubs: Club[]
  agentAdvice: string
  onDecide: (decision: string, club?: Club) => void
}

export default function TransferWindow({ playerName, currentClub, position, marketValue, clubs, agentAdvice, onDecide }: Props) {
  const [selected, setSelected] = useState<Club|null>(null)
  const [view, setView] = useState<'overview'|'detail'>('overview')

  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.95)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:2000,padding:'16px',fontFamily:"'Rajdhani',sans-serif",overflowY:'auto' as const}}>
      <div style={{background:'#0F0F14',border:'1px solid #2A2A3A',borderRadius:'4px',maxWidth:'560px',width:'100%'}}>

        <div style={{padding:'16px 20px',borderBottom:'1px solid #2A2A3A',background:'linear-gradient(135deg,#0A0A0C,#1A1A24)'}}>
          <div style={{color:'#D4A843',fontSize:'10px',letterSpacing:'4px',marginBottom:'4px'}}>TRANSFER WINDOW</div>
          <div style={{fontFamily:"'Cinzel',serif",fontSize:'18px',fontWeight:700,color:'#F0C060',marginBottom:'4px'}}>{playerName}</div>
          <div style={{display:'flex',gap:'12px',color:'#7A7A8A',fontSize:'12px',flexWrap:'wrap' as const}}>
            <span>{position}</span>
            <span>·</span>
            <span>Current: {currentClub}</span>
            <span>·</span>
            <span style={{color:'#27AE60'}}>Value: {marketValue}</span>
          </div>
        </div>

        <div style={{padding:'12px 20px',background:'rgba(212,168,67,0.05)',borderBottom:'1px solid #2A2A3A'}}>
          <div style={{color:'#D4A843',fontSize:'9px',letterSpacing:'3px',marginBottom:'4px'}}>AGENT ADVICE</div>
          <div style={{color:'#E8E4D8',fontSize:'13px',lineHeight:1.5,fontStyle:'italic'}}>"{agentAdvice}"</div>
        </div>

        <div style={{padding:'16px 20px'}}>
          {view === 'overview' && (
            <>
              <div style={{marginBottom:'12px',color:'#7A7A8A',fontSize:'12px',letterSpacing:'2px'}}>{clubs.length} CLUBS INTERESTED</div>
              <div style={{display:'flex',flexDirection:'column' as const,gap:'10px',marginBottom:'16px'}}>
                {clubs.map((club, i) => (
                  <div
                    key={i}
                    onClick={() => { setSelected(club); setView('detail') }}
                    style={{background:'#1A1A24',border:'1px solid #2A2A3A',padding:'14px',borderRadius:'2px',cursor:'pointer',transition:'all .2s'}}
                    onMouseEnter={e => e.currentTarget.style.borderColor='#8B6914'}
                    onMouseLeave={e => e.currentTarget.style.borderColor='#2A2A3A'}
                  >
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'8px'}}>
                      <div>
                        <span style={{color:'#E8E4D8',fontSize:'15px',fontWeight:700}}>{club.name}</span>
                        <span style={{color:'#7A7A8A',fontSize:'12px',marginLeft:'8px'}}>{club.leagueFlag} {club.league}</span>
                      </div>
                      {club.championsLeague && (
                        <span style={{background:'rgba(52,152,219,0.15)',border:'1px solid rgba(52,152,219,0.4)',color:'#3498DB',fontSize:'10px',padding:'2px 8px',borderRadius:'2px',letterSpacing:'1px'}}>UCL</span>
                      )}
                    </div>
                    <div style={{display:'flex',gap:'16px',flexWrap:'wrap' as const}}>
                      <div><span style={{color:'#7A7A8A',fontSize:'11px'}}>Wage </span><span style={{color:'#27AE60',fontSize:'13px',fontWeight:700}}>{club.wageOffer}</span></div>
                      <div><span style={{color:'#7A7A8A',fontSize:'11px'}}>Fee </span><span style={{color:'#D4A843',fontSize:'13px',fontWeight:700}}>{club.transferFee}</span></div>
                      <div><span style={{color:'#7A7A8A',fontSize:'11px'}}>Playing Time </span><span style={{color:'#E8E4D8',fontSize:'13px'}}>{club.playingTime}</span></div>
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={() => onDecide('stay')}
                style={{width:'100%',background:'transparent',border:'1px solid #3A3A4A',color:'#7A7A8A',fontFamily:"'Rajdhani',sans-serif",fontWeight:600,padding:'12px',cursor:'pointer',letterSpacing:'2px',fontSize:'13px',borderRadius:'2px',transition:'all .2s'}}
                onMouseEnter={e => { e.currentTarget.style.borderColor='#D4A843'; e.currentTarget.style.color='#D4A843' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor='#3A3A4A'; e.currentTarget.style.color='#7A7A8A' }}
              >
                STAY AT {currentClub.toUpperCase()}
              </button>
            </>
          )}

          {view === 'detail' && selected && (
            <>
              <button
                onClick={() => setView('overview')}
                style={{background:'transparent',border:'none',color:'#7A7A8A',cursor:'pointer',fontSize:'12px',letterSpacing:'2px',marginBottom:'16px',padding:'0',display:'flex',alignItems:'center',gap:'6px'}}
              >
                ← BACK TO ALL CLUBS
              </button>

              <div style={{fontFamily:"'Cinzel',serif",fontSize:'20px',fontWeight:700,color:'#F0C060',marginBottom:'4px'}}>{selected.name}</div>
              <div style={{color:'#7A7A8A',fontSize:'13px',marginBottom:'12px'}}>
                {selected.leagueFlag} {selected.league} {selected.championsLeague ? '· Champions League' : ''}
              </div>

              <div style={{background:'rgba(212,168,67,0.05)',border:'1px solid #2A2A3A',padding:'12px',borderRadius:'2px',marginBottom:'12px'}}>
                <div style={{color:'#7A7A8A',fontSize:'10px',letterSpacing:'3px',marginBottom:'6px'}}>THEIR PITCH</div>
                <div style={{color:'#E8E4D8',fontSize:'13px',lineHeight:1.6,fontStyle:'italic'}}>"{selected.pitch}"</div>
              </div>

              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px',marginBottom:'12px'}}>
                <div>
                  <div style={{color:'#27AE60',fontSize:'10px',letterSpacing:'2px',marginBottom:'6px'}}>PROS</div>
                  {selected.pros.map((p, i) => (
                    <div key={i} style={{color:'#E8E4D8',fontSize:'12px',marginBottom:'4px',display:'flex',gap:'6px'}}>
                      <span style={{color:'#27AE60'}}>✓</span><span>{p}</span>
                    </div>
                  ))}
                </div>
                <div>
                  <div style={{color:'#E74C3C',fontSize:'10px',letterSpacing:'2px',marginBottom:'6px'}}>CONS</div>
                  {selected.cons.map((c, i) => (
                    <div key={i} style={{color:'#E8E4D8',fontSize:'12px',marginBottom:'4px',display:'flex',gap:'6px'}}>
                      <span style={{color:'#E74C3C'}}>✗</span><span>{c}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'8px',marginBottom:'16px'}}>
                {[
                  {label:'WEEKLY WAGE',value:selected.wageOffer,color:'#27AE60'},
                  {label:'TRANSFER FEE',value:selected.transferFee,color:'#D4A843'},
                  {label:'PLAYING TIME',value:selected.playingTime,color:'#3498DB'},
                ].map(s => (
                  <div key={s.label} style={{background:'#1A1A24',padding:'10px',textAlign:'center' as const,borderRadius:'2px',border:'1px solid #2A2A3A'}}>
                    <div style={{color:'#7A7A8A',fontSize:'9px',letterSpacing:'2px',marginBottom:'4px'}}>{s.label}</div>
                    <div style={{color:s.color,fontSize:'13px',fontWeight:700}}>{s.value}</div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => onDecide('transfer', selected)}
                style={{width:'100%',background:'linear-gradient(135deg,#8B6914,#D4A843)',color:'#0A0A0C',fontFamily:"'Cinzel',serif",fontWeight:700,padding:'12px',border:'none',cursor:'pointer',letterSpacing:'2px',fontSize:'14px',borderRadius:'2px'}}
              >
                SIGN FOR {selected.name.toUpperCase()}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
