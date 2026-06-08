interface StatRowProps { label: string; value: any; highlight?: boolean }

function StatRow({ label, value, highlight = false }: StatRowProps) {
  return (
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'6px 8px',background:'#1A1A24',borderRadius:'2px',border:`1px solid ${highlight?'rgba(212,168,67,0.3)':'#2A2A3A'}`}}>
      <span style={{color:'#7A7A8A',fontSize:'11px',letterSpacing:'1px'}}>{label}</span>
      <span style={{color:highlight?'#D4A843':'#E8E4D8',fontSize:'13px',fontWeight:700,fontFamily:"'Orbitron',monospace"}}>{value}</span>
    </div>
  )
}

interface MatchReportProps {
  playerName: string
  position: string
  rating: number
  stats: {
    goals?: number
    assists?: number
    shots?: number
    shotsOnTarget?: number
    passes?: number
    passAccuracy?: number
    tackles?: number
    aerialDuels?: number
    distanceCovered?: number
    touches?: number
    keyPasses?: number
    dribbles?: number
    saves?: number
    cleanSheet?: boolean
  }
  matchResult: string
  opposition: string
  competition: string
  manOfMatch?: boolean
  onClose: () => void
}

const getRatingColor = (r: number) =>
  r >= 8.5 ? '#D4A843' : r >= 7.5 ? '#27AE60' : r >= 6.5 ? '#3498DB' : r >= 5.5 ? '#E67E22' : '#E74C3C'

export default function MatchReport({ playerName, position, rating, stats, matchResult, opposition, competition, manOfMatch, onClose }: MatchReportProps) {
  const ratingColor = getRatingColor(rating)
  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.92)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:2000,padding:'16px',fontFamily:"'Rajdhani',sans-serif"}}>
      <div style={{background:'#0F0F14',border:'1px solid #2A2A3A',borderRadius:'4px',maxWidth:'440px',width:'100%',overflow:'hidden'}}>
        <div style={{background:'linear-gradient(135deg,#0A0A0C,#1A1A24)',padding:'16px',borderBottom:'1px solid #2A2A3A'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
            <div>
              <div style={{color:'#7A7A8A',fontSize:'10px',letterSpacing:'3px',marginBottom:'4px'}}>{competition.toUpperCase()}</div>
              <div style={{color:'#E8E4D8',fontSize:'16px',fontWeight:700,marginBottom:'2px'}}>vs {opposition}</div>
              <div style={{color:'#D4A843',fontSize:'14px',fontWeight:700}}>{matchResult}</div>
            </div>
            <div style={{textAlign:'center' as const}}>
              <div style={{width:'64px',height:'64px',borderRadius:'50%',border:`3px solid ${ratingColor}`,display:'flex',alignItems:'center',justifyContent:'center',background:'#0A0A0C',boxShadow:`0 0 20px ${ratingColor}44`}}>
                <span style={{color:ratingColor,fontSize:'22px',fontWeight:900,fontFamily:"'Orbitron',monospace"}}>{rating.toFixed(1)}</span>
              </div>
              {manOfMatch && <div style={{color:'#D4A843',fontSize:'9px',letterSpacing:'2px',marginTop:'4px'}}>MAN OF MATCH</div>}
            </div>
          </div>
          <div style={{marginTop:'8px',color:'#7A7A8A',fontSize:'12px',letterSpacing:'1px'}}>{playerName} · {position}</div>
        </div>
        <div style={{padding:'16px'}}>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px'}}>
            {stats.goals !== undefined && <StatRow label="Goals" value={stats.goals} highlight={(stats.goals||0)>0}/>}
            {stats.assists !== undefined && <StatRow label="Assists" value={stats.assists} highlight={(stats.assists||0)>0}/>}
            {stats.shots !== undefined && <StatRow label="Shots" value={`${stats.shotsOnTarget||0}/${stats.shots}`}/>}
            {stats.passes !== undefined && <StatRow label="Pass Acc" value={`${stats.passAccuracy||0}%`} highlight={(stats.passAccuracy||0)>85}/>}
            {stats.tackles !== undefined && <StatRow label="Tackles" value={stats.tackles} highlight={(stats.tackles||0)>3}/>}
            {stats.keyPasses !== undefined && <StatRow label="Key Passes" value={stats.keyPasses} highlight={(stats.keyPasses||0)>2}/>}
            {stats.dribbles !== undefined && <StatRow label="Dribbles" value={stats.dribbles}/>}
            {stats.touches !== undefined && <StatRow label="Touches" value={stats.touches}/>}
            {stats.distanceCovered !== undefined && <StatRow label="Distance" value={`${stats.distanceCovered}km`}/>}
            {stats.aerialDuels !== undefined && <StatRow label="Aerial Duels" value={stats.aerialDuels}/>}
            {stats.saves !== undefined && <StatRow label="Saves" value={stats.saves} highlight={(stats.saves||0)>3}/>}
            {stats.cleanSheet !== undefined && <StatRow label="Clean Sheet" value={stats.cleanSheet?'Yes':'No'} highlight={!!stats.cleanSheet}/>}
          </div>
        </div>
        <div style={{padding:'12px 16px',borderTop:'1px solid #2A2A3A',display:'flex',justifyContent:'center'}}>
          <button onClick={onClose} style={{background:'linear-gradient(135deg,#8B6914,#D4A843)',color:'#0A0A0C',fontFamily:"'Cinzel',serif",fontWeight:700,padding:'10px 32px',border:'none',cursor:'pointer',letterSpacing:'2px',fontSize:'13px',borderRadius:'2px'}}>
            CONTINUE
          </button>
        </div>
      </div>
    </div>
  )
}
