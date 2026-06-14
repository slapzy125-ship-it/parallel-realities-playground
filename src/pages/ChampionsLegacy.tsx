import { useState } from 'react'
import { useRouter } from '@tanstack/react-router'

const CLUBS = [
  'Riverside United', 'Northgate FC', 'Ashford Athletic', 'Crestwood City',
  'Hollow Park Rangers', 'Iron Bridge FC', 'Westfall Town', 'Stonecastle United',
  'Brackham Rovers', 'Solway Wanderers', 'Faircross Albion', 'Underhill FC'
]

const POSITION_STATS: Record<string, Record<string, number>> = {
  Striker: { Shooting: 60, Pace: 65, Passing: 50, Defending: 30, Stamina: 60 },
  Midfielder: { Shooting: 50, Pace: 60, Passing: 65, Defending: 50, Stamina: 65 },
  Defender: { Shooting: 30, Pace: 55, Passing: 55, Defending: 65, Stamina: 60 },
  Goalkeeper: { Shooting: 20, Pace: 45, Passing: 45, Defending: 70, Stamina: 55 },
}

export default function ChampionsLegacy() {
  const router = useRouter()
  const [playerName, setPlayerName] = useState('')
  const [position, setPosition] = useState<string | null>(null)
  const [club, setClub] = useState<string | null>(null)

  const handlePositionSelect = (pos: string) => {
    setPosition(pos)
    setClub(CLUBS[Math.floor(Math.random() * CLUBS.length)])
  }

  const handleBegin = () => {
    const careerData = {
      playerName,
      position,
      club,
      stats: POSITION_STATS[position!],
      season: 1,
      week: 1,
    }
    localStorage.setItem('cl_career', JSON.stringify(careerData))
    router.navigate({ to: '/champions-legacy/hub' })
  }

  const canBegin = playerName.trim().length > 0 && position !== null

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0A0A0C',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '60px 24px',
      fontFamily: "'Rajdhani', sans-serif",
    }}>
      <h1 style={{
        fontFamily: "'Cinzel', serif",
        fontSize: '42px',
        fontWeight: 700,
        letterSpacing: '6px',
        background: 'linear-gradient(135deg, #D4A843, #F0C060)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        marginBottom: '8px',
        textAlign: 'center',
      }}>
        CHAMPIONS LEGACY
      </h1>
      <p style={{ color: '#7A7A8A', fontSize: '16px', letterSpacing: '3px', marginBottom: '48px', textTransform: 'uppercase' }}>
        Your Career Begins
      </p>

      <div style={{ width: '100%', maxWidth: '480px', background: '#1A1A24', borderRadius: '12px', padding: '32px', border: '1px solid #2A2A38' }}>
        <label style={{ color: '#D4A843', fontSize: '12px', letterSpacing: '2px', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
          Player Name
        </label>
        <input
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          placeholder="Enter your name"
          style={{
            width: '100%',
            background: '#0F0F14',
            border: '1px solid #2A2A38',
            borderRadius: '8px',
            padding: '12px 16px',
            color: '#E8E4D8',
            fontSize: '16px',
            fontFamily: "'Rajdhani', sans-serif",
            marginBottom: '32px',
            outline: 'none',
            boxSizing: 'border-box',
          }}
          onFocus={(e) => e.target.style.borderColor = '#D4A843'}
          onBlur={(e) => e.target.style.borderColor = '#2A2A38'}
        />

        <label style={{ color: '#D4A843', fontSize: '12px', letterSpacing: '2px', textTransform: 'uppercase', display: 'block', marginBottom: '12px' }}>
          Position
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '32px' }}>
          {Object.keys(POSITION_STATS).map((pos) => (
            <button
              key={pos}
              onClick={() => handlePositionSelect(pos)}
              style={{
                padding: '14px',
                borderRadius: '8px',
                border: position === pos ? '1px solid #D4A843' : '1px solid #2A2A38',
                background: position === pos ? 'rgba(212,168,67,0.1)' : '#0F0F14',
                color: position === pos ? '#D4A843' : '#E8E4D8',
                fontSize: '14px',
                fontFamily: "'Rajdhani', sans-serif",
                fontWeight: 600,
                letterSpacing: '1px',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {pos}
            </button>
          ))}
        </div>

        {position && club && (
          <div style={{ marginBottom: '32px', animation: 'fadeIn 0.4s ease' }}>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div style={{ color: '#7A7A8A', fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '4px' }}>
                Assigned Club
              </div>
              <div style={{ color: '#F0C060', fontSize: '20px', fontFamily: "'Cinzel', serif", fontWeight: 600 }}>
                {club}
              </div>
            </div>

            {Object.entries(POSITION_STATS[position]).map(([stat, value]) => (
              <div key={stat} style={{ marginBottom: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ color: '#7A7A8A', fontSize: '12px', letterSpacing: '1px' }}>{stat}</span>
                  <span style={{ color: '#D4A843', fontSize: '12px', fontWeight: 600 }}>{value}</span>
                </div>
                <div style={{ height: '6px', background: '#0F0F14', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${value}%`, background: 'linear-gradient(90deg, #D4A843, #F0C060)', borderRadius: '3px' }} />
                </div>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={handleBegin}
          disabled={!canBegin}
          style={{
            width: '100%',
            padding: '16px',
            borderRadius: '8px',
            border: 'none',
            background: canBegin ? 'linear-gradient(135deg, #D4A843, #F0C060)' : '#2A2A38',
            color: canBegin ? '#0A0A0C' : '#7A7A8A',
            fontFamily: "'Cinzel', serif",
            fontSize: '14px',
            fontWeight: 700,
            letterSpacing: '3px',
            cursor: canBegin ? 'pointer' : 'not-allowed',
            textTransform: 'uppercase',
          }}
        >
          Begin Career
        </button>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
