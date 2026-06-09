import { useState } from 'react'

interface SaveSlot {
  slot: number
  playerName: string
  world: string
  worldIcon: string
  level: number
  storyProgress: number
  savedAt: string
  chapter: string
  age?: number
}

interface Props {
  mode: 'save' | 'load'
  currentSlot?: number
  onSave: (slot: number) => void
  onLoad: (slot: number) => void
  onClose: () => void
}

export default function SaveSlots({ mode, currentSlot, onSave, onLoad, onClose }: Props) {
  const slots: (SaveSlot | null)[] = [1, 2, 3].map(slot => {
    try {
      const raw = localStorage.getItem(`revenio_save_${slot}`)
      if (!raw) return null
      const d = JSON.parse(raw)
      return {
        slot,
        playerName: d.player?.name || 'Unknown',
        world: d.worldName || 'Unknown World',
        worldIcon: d.worldIcon || '',
        level: d.player?.level || 1,
        storyProgress: d.player?.storyProgress || 0,
        savedAt: d.savedAt || '',
        chapter: d.chapterName || 'Chapter 1',
        age: d.player?.careerStats?.age || d.player?.age,
      }
    } catch { return null }
  })

  const formatDate = (dateStr: string) => {
    try { return new Date(dateStr).toLocaleDateString() } catch { return '' }
  }

  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.92)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:3000,padding:'16px',fontFamily:"'Rajdhani',sans-serif"}}>
      <div style={{background:'#0F0F14',border:'1px solid #2A2A3A',borderRadius:'4px',maxWidth:'440px',width:'100%'}}>

        <div style={{padding:'16px 20px',borderBottom:'1px solid #2A2A3A',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <div>
            <div style={{color:'#D4A843',fontSize:'10px',letterSpacing:'4px',marginBottom:'2px'}}>{mode === 'save' ? 'SAVE GAME' : 'LOAD GAME'}</div>
            <div style={{fontFamily:"'Cinzel',serif",fontSize:'16px',fontWeight:700,color:'#F0C060'}}>Choose a slot</div>
          </div>
          <button
            onClick={onClose}
            style={{background:'transparent',border:'none',color:'#7A7A8A',cursor:'pointer',fontSize:'20px',lineHeight:1,padding:'4px'}}
          >
            ✕
          </button>
        </div>

        <div style={{padding:'16px 20px',display:'flex',flexDirection:'column' as const,gap:'10px'}}>
          {[0, 1, 2].map(i => {
            const slot = slots[i]
            const slotNum = i + 1
            const isCurrent = currentSlot === slotNum
            const isDisabled = mode === 'load' && !slot

            return (
              <div
                key={slotNum}
                onClick={() => {
                  if (isDisabled) return
                  if (mode === 'save') onSave(slotNum)
                  else if (slot) onLoad(slotNum)
                }}
                style={{
                  background: isCurrent ? 'rgba(212,168,67,0.08)' : '#1A1A24',
                  border: `1px solid ${isCurrent ? '#D4A843' : '#2A2A3A'}`,
                  padding: '14px',
                  borderRadius: '2px',
                  cursor: isDisabled ? 'not-allowed' : 'pointer',
                  opacity: isDisabled ? 0.4 : 1,
                  transition: 'all .2s',
                }}
                onMouseEnter={e => { if (!isDisabled) e.currentTarget.style.borderColor = '#8B6914' }}
                onMouseLeave={e => e.currentTarget.style.borderColor = isCurrent ? '#D4A843' : '#2A2A3A'}
              >
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                  <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
                    <div style={{width:'40px',height:'40px',background:'#0A0A0C',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'18px',border:'1px solid #3A3A4A',flexShrink:0}}>
                      {slot ? slot.worldIcon : <span style={{color:'#3A3A4A',fontSize:'14px'}}>{slotNum}</span>}
                    </div>
                    <div>
                      {slot ? (
                        <>
                          <div style={{color:'#E8E4D8',fontSize:'14px',fontWeight:700,marginBottom:'2px'}}>{slot.playerName}</div>
                          <div style={{color:'#7A7A8A',fontSize:'11px',marginBottom:'2px'}}>
                            {slot.world} · {slot.chapter}{slot.age ? ` · Age ${slot.age}` : ''}
                          </div>
                          <div style={{color:'#3A3A4A',fontSize:'10px',letterSpacing:'1px'}}>{formatDate(slot.savedAt)}</div>
                        </>
                      ) : (
                        <div style={{color:'#3A3A4A',fontSize:'13px',letterSpacing:'1px'}}>Empty Slot {slotNum}</div>
                      )}
                    </div>
                  </div>
                  {slot && (
                    <div style={{textAlign:'right' as const,flexShrink:0}}>
                      <div style={{color:'#D4A843',fontFamily:"'Orbitron',monospace",fontSize:'12px',marginBottom:'2px'}}>LVL {slot.level}</div>
                      <div style={{color:'#7A7A8A',fontSize:'10px'}}>Scene {slot.storyProgress}</div>
                    </div>
                  )}
                </div>
                {isCurrent && mode === 'save' && (
                  <div style={{marginTop:'8px',paddingTop:'8px',borderTop:'1px solid #2A2A3A',color:'#D4A843',fontSize:'10px',letterSpacing:'2px'}}>
                    CURRENT SLOT — WILL OVERWRITE
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <div style={{padding:'12px 20px',borderTop:'1px solid #2A2A3A',display:'flex',justifyContent:'center'}}>
          <button
            onClick={onClose}
            style={{background:'transparent',border:'1px solid #3A3A4A',color:'#7A7A8A',fontFamily:"'Rajdhani',sans-serif",fontWeight:600,padding:'8px 24px',cursor:'pointer',letterSpacing:'2px',fontSize:'12px',borderRadius:'2px',transition:'all .2s'}}
            onMouseEnter={e => { e.currentTarget.style.borderColor='#7A7A8A'; e.currentTarget.style.color='#E8E4D8' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor='#3A3A4A'; e.currentTarget.style.color='#7A7A8A' }}
          >
            CANCEL
          </button>
        </div>
      </div>
    </div>
  )
}
