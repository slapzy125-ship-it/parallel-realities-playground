import { useState, useEffect } from 'react'
import { useRouter } from '@tanstack/react-router'

interface CareerData {
  playerName: string
  position: string
  club: string
  stats: Record<string, number>
  season: number
  week: number
}

export default function ChampionsLegacyHub() {
  const router = useRouter()
  const [career, setCareer] = useState<CareerData | null>(null)

  useEffect(() => {
    const saved = localStorage.getItem('cl_career')
    if (!saved) {
      router.navigate({ to: '/champions-legacy' })
      return
    }
    setCareer(JSON.parse(saved))
  }, [router])

  if (!career) return null

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
      <div style={{ width: '100%', maxWidth: '600px' }}>

        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{
            fontFamily: "'Cinzel', serif",
            fontSize: '32px',
            fontWeight: 700,
            letterSpacing: '4px',
            background: 'linear-gradient(135deg, #D4A843, #F0C060)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '8px',
          }}>
            {career.playerName.toUpperCase()}
          </h1>
          <p style={{ color: '#7A7A8A', fontSize: '14px', letterSpacing: '2px' }}>
            {career.position} • {career.club}
          </p>
          <p style={{ color: '#D4A843', fontSize: '13px', letterSpacing: '3px', marginTop: '12px', textTransform: 'uppercase' }}>
            Season {career.season} — Week {career.week}
          </p>
        </div>

        <div style={{ background: '#1A1A24', borderRadius: '12px', padding: '24px', border: '1px solid #2A2A38', marginBottom: '24px' }}>
          <div style={{ color: '#D4A843', fontSize: '12px', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '16px' }}>
            Player Stats
          </div>
          {Object.entries(career.stats).map(([stat, value]) => (
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

        <div style={{ display: 'grid', gap: '12px' }}>
          <button
            onClick={() => router.navigate({ to: '/champions-legacy/training' })}
            style={{
              padding: '18px',
              borderRadius: '8px',
              border: '1px solid #2A2A38',
              background: '#1A1A24',
              color: '#E8E4D8',
              fontFamily: "'Cinzel', serif",
              fontSize: '14px',
              fontWeight: 700,
              letterSpacing: '3px',
              cursor: 'pointer',
              textTransform: 'uppercase',
              textAlign: 'left',
            }}
          >
            🏋️ Training Session
          </button>

          <button
            onClick={() => router.navigate({ to: '/champions-legacy/match' })}
            style={{
              padding: '18px',
              borderRadius: '8px',
              border: 'none',
              background: 'linear-gradient(135deg, #D4A843, #F0C060)',
              color: '#0A0A0C',
              fontFamily: "'Cinzel', serif",
              fontSize: '14px',
              fontWeight: 700,
              letterSpacing: '3px',
              cursor: 'pointer',
              textTransform: 'uppercase',
              textAlign: 'left',
            }}
          >
            ⚽ Play Next Match
          </button>
        </div>

      </div>
    </div>
  )
}
