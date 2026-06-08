interface Props {
  playerName: string
  position: string
  club: string
  season: string
  age: number
  stats: {
    appearances: number
    goals: number
    assists: number
    averageRating: number
    cleanSheets?: number
    yellowCards: number
    redCards: number
    minutesPlayed: number
    trophies: string[]
    leaguePosition: number
    topScorer: boolean
    playerOfSeason: boolean
  }
  marketValue: string
  wage: string
  nextSeasonGoal: string
  onClose: () => void
}

export default function SeasonSummary({ playerName, position, club, season, age, stats, marketValue, wage, nextSeasonGoal, onClose }: Props) {
  const ratingColor = stats.averageRating >= 7.5 ? '#D4A843' : stats.averageRating >= 6.5 ? '#27AE60' : '#E74C3C'

  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.95)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:2000,padding:'16px',fontFamily:"'Rajdhani',sans-serif",overflowY:'auto' as const}}>
      <div style={{background:'#0F0F14',border:'1px solid #D4A843',borderRadius:'4px',maxWidth:'480px',width:'100%'}}>
        <div style={{background:'linear-gradient(135deg,#0A0A0C,#1A1A24)',padding:'20px',textAlign:'center' as const,borderBottom:'1px solid #2A2A3A'}}>
          <div style={{color:'#D4A843',fontSize:'10px',letterSpacing:'4px',marginBottom:'8px'}}>END OF SEASON</div>
          <div style={{fontFamily:"'Cinzel',serif",fontSize:'22px',fontWeight:700,color:'#F0C060',marginBottom:'4px'}}>{season}</div>
          <div style={{color:'#7A7A8A',fontSize:'13px'}}>{playerName} · {position} · {club}</div>
          <div style={{color:'#7A7A8A',fontSize:'12px',marginTop:'2px'}}>Age {age}</div>
        </div>

        <div style={{padding:'16px'}}>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'8px',marginBottom:'16px'}}>
            {[
              {label:'APPS',value:stats.appearances},
              {label:'GOALS',value:stats.goals},
              {label:'ASSISTS',value:stats.assists},
              {label:'AVG RATING',value:stats.averageRating.toFixed(1),color:ratingColor},
              {label:'MINUTES',value:stats.minutesPlayed},
              {label:'YELLOWS',value:stats.yellowCards},
            ].map(s=>(
              <div key={s.label} style={{background:'#1A1A24',padding:'10px',textAlign:'center' as const,borderRadius:'2px',border:'1px solid #2A2A3A'}}>
                <div style={{color:'#7A7A8A',fontSize:'9px',letterSpacing:'2px',marginBottom:'4px'}}>{s.label}</div>
                <div style={{color:(s as any).color||'#F0C060',fontFamily:"'Orbitron',monospace",fontSize:'18px',fontWeight:700}}>{s.value}</div>
              </div>
            ))}
          </div>

          {stats.trophies.length > 0 && (
            <div style={{marginBottom:'12px'}}>
              <div style={{color:'#D4A843',fontSize:'9px',letterSpacing:'3px',marginBottom:'8px'}}>TROPHIES</div>
              <div style={{display:'flex',flexWrap:'wrap' as const,gap:'6px'}}>
                {stats.trophies.map((t,i)=>(
                  <span key={i} style={{background:'rgba(212,168,67,0.15)',border:'1px solid #8B6914',color:'#F0C060',fontSize:'11px',padding:'4px 10px',borderRadius:'2px'}}>🏆 {t}</span>
                ))}
              </div>
            </div>
          )}

          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px',marginBottom:'12px'}}>
            <div style={{background:'#1A1A24',padding:'10px',borderRadius:'2px',border:'1px solid #2A2A3A'}}>
              <div style={{color:'#7A7A8A',fontSize:'9px',letterSpacing:'2px',marginBottom:'4px'}}>MARKET VALUE</div>
              <div style={{color:'#27AE60',fontSize:'14px',fontWeight:700}}>{marketValue}</div>
            </div>
            <div style={{background:'#1A1A24',padding:'10px',borderRadius:'2px',border:'1px solid #2A2A3A'}}>
              <div style={{color:'#7A7A8A',fontSize:'9px',letterSpacing:'2px',marginBottom:'4px'}}>WEEKLY WAGE</div>
              <div style={{color:'#27AE60',fontSize:'14px',fontWeight:700}}>{wage}</div>
            </div>
          </div>

          {(stats.topScorer || stats.playerOfSeason) && (
            <div style={{display:'flex',gap:'8px',marginBottom:'12px'}}>
              {stats.topScorer && <span style={{background:'rgba(212,168,67,0.15)',border:'1px solid #8B6914',color:'#F0C060',fontSize:'11px',padding:'4px 12px',borderRadius:'2px'}}>⚽ Top Scorer</span>}
              {stats.playerOfSeason && <span style={{background:'rgba(212,168,67,0.15)',border:'1px solid #8B6914',color:'#F0C060',fontSize:'11px',padding:'4px 12px',borderRadius:'2px'}}>⭐ Player of the Season</span>}
            </div>
          )}

          <div style={{background:'rgba(212,168,67,0.05)',border:'1px solid #2A2A3A',padding:'10px',borderRadius:'2px',marginBottom:'12px'}}>
            <div style={{color:'#D4A843',fontSize:'9px',letterSpacing:'3px',marginBottom:'4px'}}>NEXT SEASON OBJECTIVE</div>
            <div style={{color:'#E8E4D8',fontSize:'13px',lineHeight:1.5}}>{nextSeasonGoal}</div>
          </div>

          <div style={{background:'#1A1A24',padding:'10px',borderRadius:'2px',border:'1px solid #2A2A3A',textAlign:'center' as const}}>
            <div style={{color:'#7A7A8A',fontSize:'9px',letterSpacing:'2px',marginBottom:'4px'}}>LEAGUE POSITION</div>
            <div style={{color:'#F0C060',fontFamily:"'Orbitron',monospace",fontSize:'20px',fontWeight:700}}>{stats.leaguePosition === 1 ? '🏆 1st' : `${stats.leaguePosition}th`}</div>
          </div>
        </div>

        <div style={{padding:'12px 16px',borderTop:'1px solid #2A2A3A',display:'flex',justifyContent:'center'}}>
          <button onClick={onClose} style={{background:'linear-gradient(135deg,#8B6914,#D4A843)',color:'#0A0A0C',fontFamily:"'Cinzel',serif",fontWeight:700,padding:'10px 40px',border:'none',cursor:'pointer',letterSpacing:'2px',fontSize:'13px',borderRadius:'2px'}}>
            NEXT SEASON →
          </button>
        </div>
      </div>
    </div>
  )
}
