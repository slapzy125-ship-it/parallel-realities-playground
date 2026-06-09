interface Props {
  chapterNumber: number
  chapterName: string
  actName?: string
  onClose: () => void
}

export default function ChapterCard({ chapterNumber, chapterName, actName, onClose }: Props) {
  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.92)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:2000,fontFamily:"'Rajdhani',sans-serif"}}>
      <div style={{background:'#0F0F14',border:'1px solid #D4A843',borderRadius:'4px',padding:'32px 48px',textAlign:'center'}}>
        {actName && <div style={{color:'#7A7A8A',fontSize:'10px',letterSpacing:'4px',marginBottom:'8px'}}>{actName.toUpperCase()}</div>}
        <div style={{color:'#D4A843',fontSize:'12px',letterSpacing:'4px',marginBottom:'8px'}}>CHAPTER {chapterNumber}</div>
        <div style={{fontFamily:"'Cinzel',serif",fontSize:'24px',fontWeight:700,color:'#F0C060',marginBottom:'20px'}}>{chapterName}</div>
        <button onClick={onClose} style={{background:'linear-gradient(135deg,#8B6914,#D4A843)',color:'#0A0A0C',fontFamily:"'Cinzel',serif",fontWeight:700,padding:'10px 32px',border:'none',cursor:'pointer',letterSpacing:'2px',fontSize:'13px',borderRadius:'2px'}}>BEGIN</button>
      </div>
    </div>
  )
}
