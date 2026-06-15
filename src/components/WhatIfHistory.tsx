import { useEffect, useRef, useState } from 'react'

type Stage = 'input' | 'loading' | 'result'

type Ripple = {
  year: string
  title: string
  short: string
  detail: string
}

type Comparison = {
  category: string
  real: string
  alternate: string
}

type Result = {
  narrative: string
  ripples: Ripple[]
  comparisons: Comparison[]
}

const GOLD = '#D4A843'
const BG = '#0A0A0C'
const GOLD_GRADIENT = 'linear-gradient(135deg,#8B6914,#D4A843)'

// Stubbed API call — replace with real backend later.
async function runWhatIfSimulation(_scenario: string): Promise<Result> {
  await new Promise((r) => setTimeout(r, 2000))
  return {
    narrative:
      'In this alternate timeline, the divergence point reshapes the centuries that follow. Borders are redrawn, languages spread along different trade routes, and entire technologies arrive decades earlier — or never at all. The texture of daily life shifts in ways both subtle and seismic.\n\nGenerations grow up under unfamiliar flags, learning histories that never were. Wars that defined our world are quietly avoided; others, never recorded in our books, leave deep scars. By the modern era, the map, the powers, and the cultural balance of the world are unrecognisable.',
    ripples: [
      { year: 'Year 0', title: 'The Divergence', short: 'The pivotal moment unfolds differently.', detail: 'The single decision that splits this timeline from ours plays out under different pressures, with different actors making different calls.' },
      { year: '+25 yrs', title: 'Power Shifts', short: 'A new order begins to take shape.', detail: 'Within a generation, the balance of influence has moved. Old rivals find themselves allied; old allies drift apart.' },
      { year: '+75 yrs', title: 'Cultural Drift', short: 'Language, art and religion diverge.', detail: 'Without the upheavals of our world, art movements never crystallise. New schools of thought emerge in their place.' },
      { year: '+150 yrs', title: 'A Different Map', short: 'Borders are unrecognisable.', detail: 'Empires that fell in our timeline endure; nations that defined ours never form. The map of the world looks alien.' },
      { year: '+300 yrs', title: 'Technological Leap', short: 'Inventions arrive in a different order.', detail: 'Industrial breakthroughs land in unexpected places, accelerating some regions and bypassing others entirely.' },
      { year: '+500 yrs', title: 'Modernity', short: 'The present day, transformed.', detail: 'A modern world emerges — but its cities, its conflicts, its everyday life feel like a vivid stranger to our own.' },
    ],
    comparisons: [
      { category: 'Politics', real: 'A multipolar world dominated by familiar superpowers.', alternate: 'Power concentrated along entirely different axes.' },
      { category: 'Religion', real: 'Major faiths spread along known historical paths.', alternate: 'Smaller traditions become dominant; others never spread.' },
      { category: 'Technology', real: 'Industrial revolution in the 18th–19th century.', alternate: 'A staggered tech curve, earlier in some areas, later in others.' },
      { category: 'Culture', real: 'Familiar art, music, and literary canons.', alternate: 'An unfamiliar canon with different masterworks and movements.' },
      { category: 'Geography', real: 'The borders and capitals of today’s world.', alternate: 'A redrawn map with new capitals and lost nations.' },
    ],
  }
}

export default function WhatIfHistory() {
  const [stage, setStage] = useState<Stage>('input')
  const [scenario, setScenario] = useState('')
  const [result, setResult] = useState<Result | null>(null)
  const [expanded, setExpanded] = useState<number | null>(null)

  async function submit() {
    if (!scenario.trim()) return
    setStage('loading')
    const r = await runWhatIfSimulation(scenario)
    setResult(r)
    setStage('result')
  }

  return (
    <div style={{ minHeight: '100vh', background: BG, color: '#E8E4DA', fontFamily: 'system-ui, sans-serif' }}>
      {stage === 'input' && <InputStage scenario={scenario} setScenario={setScenario} onSubmit={submit} />}
      {stage === 'loading' && <LoadingStage />}
      {stage === 'result' && result && (
        <ResultStage
          result={result}
          scenario={scenario}
          expanded={expanded}
          setExpanded={setExpanded}
          onReset={() => { setStage('input'); setResult(null); setScenario(''); setExpanded(null) }}
        />
      )}
    </div>
  )
}

function InputStage({ scenario, setScenario, onSubmit }: { scenario: string, setScenario: (v: string) => void, onSubmit: () => void }) {
  return (
    <div style={{ maxWidth: 880, margin: '0 auto', padding: '80px 24px', textAlign: 'center' as const }}>
      <h1 style={{
        fontFamily: 'Georgia, serif',
        fontSize: 'clamp(32px, 6vw, 56px)',
        fontWeight: 700,
        letterSpacing: '4px',
        lineHeight: 1.15,
        background: 'linear-gradient(135deg,#8B6914,#D4A843,#F0C060)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        marginBottom: '24px',
      }}>WHAT IF HISTORY HAD GONE DIFFERENTLY</h1>

      <p style={{ fontFamily: 'Georgia, serif', fontSize: '18px', color: '#9A9388', maxWidth: 620, margin: '0 auto 40px', lineHeight: 1.6 }}>
        Pick a moment. Change it. Watch the centuries rearrange themselves.
      </p>

      <textarea
        value={scenario}
        onChange={(e) => setScenario(e.target.value)}
        placeholder="What if the Roman Empire never fell?"
        rows={4}
        style={{
          width: '100%',
          background: '#15151A',
          color: '#E8E4DA',
          border: `1px solid rgba(212,168,67,0.3)`,
          borderRadius: 6,
          padding: '18px 20px',
          fontFamily: 'Georgia, serif',
          fontSize: '17px',
          resize: 'vertical' as const,
          outline: 'none',
          marginBottom: '24px',
        }}
      />

      <div>
        <button
          onClick={onSubmit}
          disabled={!scenario.trim()}
          style={{
            background: GOLD_GRADIENT,
            color: BG,
            border: 'none',
            padding: '16px 48px',
            fontSize: '15px',
            fontFamily: 'Georgia, serif',
            cursor: scenario.trim() ? 'pointer' : 'not-allowed',
            opacity: scenario.trim() ? 1 : 0.5,
            borderRadius: 4,
            fontWeight: 700,
            letterSpacing: '3px',
          }}
        >
          REWRITE HISTORY
        </button>
      </div>
    </div>
  )
}

function LoadingStage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number | undefined>(undefined)
  const [currentLine, setCurrentLine] = useState(0)

  const messages = [
    'Analysing the divergence point...',
    'Mapping global consequences...',
    'Tracing political and cultural ripples...',
    'Redrawing the borders of nations...',
    'Charting the alternate timeline...',
  ]

  useEffect(() => {
    const id = setInterval(() => {
      setCurrentLine((c) => (c < messages.length - 1 ? c + 1 : c))
    }, 1400)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const particles = Array.from({ length: 70 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 2 + 0.5,
      speed: Math.random() * 0.5 + 0.1,
      opacity: Math.random() * 0.5 + 0.1,
    }))

    let running = true
    let time = 0
    const draw = () => {
      if (!running) return
      time += 0.01
      ctx.fillStyle = BG
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      particles.forEach((p, i) => {
        p.y -= p.speed
        if (p.y < 0) p.y = canvas.height
        const pulse = 0.5 + Math.sin(time * 2 + i) * 0.3
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(212,168,67,${p.opacity * pulse})`
        ctx.fill()
      })
      const cx = canvas.width / 2
      const cy = canvas.height / 2
      for (let i = 0; i < 3; i++) {
        const radius = 80 + i * 40
        const alpha = 0.05 + Math.sin(time + i) * 0.03
        ctx.beginPath()
        ctx.arc(cx, cy, radius + Math.sin(time * 0.5 + i) * 10, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(212,168,67,${alpha})`
        ctx.lineWidth = 1
        ctx.stroke()
      }
      animRef.current = requestAnimationFrame(draw)
    }
    draw()
    return () => { running = false; if (animRef.current) cancelAnimationFrame(animRef.current) }
  }, [])

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'center' }}>
      <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, zIndex: -1 }} />
      <div style={{
        fontFamily: 'Georgia, serif',
        fontSize: 'clamp(20px, 3vw, 28px)',
        color: GOLD,
        letterSpacing: '2px',
        textAlign: 'center' as const,
        padding: '0 24px',
      }}>
        {messages[currentLine]}
      </div>
      <div style={{ marginTop: 32, display: 'flex', gap: 8 }}>
        {messages.map((_, i) => (
          <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: i <= currentLine ? GOLD : 'rgba(212,168,67,0.2)' }} />
        ))}
      </div>
    </div>
  )
}

function ResultStage({ result, scenario, expanded, setExpanded, onReset }: {
  result: Result
  scenario: string
  expanded: number | null
  setExpanded: (n: number | null) => void
  onReset: () => void
}) {
  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '64px 24px 96px' }}>
      <div style={{ marginBottom: 48 }}>
        <div style={{ color: GOLD, fontSize: 12, letterSpacing: '3px', fontFamily: 'system-ui, sans-serif', marginBottom: 12 }}>YOUR SCENARIO</div>
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(26px, 4vw, 42px)', fontWeight: 700, lineHeight: 1.2, color: '#F0E6CC' }}>
          {scenario}
        </h1>
      </div>

      {/* Narrative */}
      <section style={{ marginBottom: 72 }}>
        <SectionTitle>The Alternate Timeline</SectionTitle>
        <div style={{ fontFamily: 'Georgia, serif', fontSize: 18, lineHeight: 1.8, color: '#C8C2B5', whiteSpace: 'pre-wrap' as const }}>
          {result.narrative}
        </div>
      </section>

      {/* Ripples */}
      <section style={{ marginBottom: 72 }}>
        <SectionTitle>Ripples Across Time</SectionTitle>
        <div style={{
          display: 'flex',
          gap: 16,
          overflowX: 'auto' as const,
          paddingBottom: 16,
          scrollSnapType: 'x mandatory' as const,
        }}>
          {result.ripples.map((r, i) => {
            const isOpen = expanded === i
            return (
              <div
                key={i}
                onClick={() => setExpanded(isOpen ? null : i)}
                style={{
                  flex: isOpen ? '0 0 420px' : '0 0 260px',
                  scrollSnapAlign: 'start' as const,
                  background: '#15151A',
                  border: `1px solid ${isOpen ? GOLD : 'rgba(212,168,67,0.2)'}`,
                  borderRadius: 6,
                  padding: 20,
                  cursor: 'pointer',
                  transition: 'flex 0.3s ease, border-color 0.3s ease',
                }}
              >
                <div style={{ color: GOLD, fontSize: 11, letterSpacing: '2px', marginBottom: 8 }}>{r.year}</div>
                <div style={{ fontFamily: 'Georgia, serif', fontSize: 18, fontWeight: 700, color: '#F0E6CC', marginBottom: 8 }}>{r.title}</div>
                <div style={{ fontFamily: 'Georgia, serif', fontSize: 14, color: '#9A9388', lineHeight: 1.5 }}>
                  {isOpen ? r.detail : r.short}
                </div>
                {!isOpen && <div style={{ color: GOLD, fontSize: 11, marginTop: 12, letterSpacing: '1px' }}>TAP TO EXPAND →</div>}
              </div>
            )
          })}
        </div>
      </section>

      {/* Comparison */}
      <section style={{ marginBottom: 72 }}>
        <SectionTitle>Real vs Alternate</SectionTitle>
        <div style={{ display: 'grid', gap: 12 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr 1fr', gap: 12, padding: '0 16px', fontSize: 11, letterSpacing: '2px', color: GOLD }}>
            <div></div>
            <div>REAL HISTORY</div>
            <div>ALTERNATE HISTORY</div>
          </div>
          {result.comparisons.map((c, i) => (
            <div key={i} style={{
              display: 'grid',
              gridTemplateColumns: '160px 1fr 1fr',
              gap: 12,
              background: '#15151A',
              border: '1px solid rgba(212,168,67,0.15)',
              borderRadius: 6,
              padding: 16,
              alignItems: 'start' as const,
            }}>
              <div style={{ fontFamily: 'Georgia, serif', fontWeight: 700, color: GOLD, fontSize: 15 }}>{c.category}</div>
              <div style={{ fontFamily: 'Georgia, serif', fontSize: 15, color: '#C8C2B5', lineHeight: 1.6 }}>{c.real}</div>
              <div style={{ fontFamily: 'Georgia, serif', fontSize: 15, color: '#E8E4DA', lineHeight: 1.6 }}>{c.alternate}</div>
            </div>
          ))}
        </div>
      </section>

      {/* World map placeholder */}
      <section style={{ marginBottom: 56 }}>
        <SectionTitle>The Alternate World Map</SectionTitle>
        <div
          id="world-map-container"
          style={{
            width: '100%',
            height: 480,
            background: '#10101A',
            border: '1px dashed rgba(212,168,67,0.3)',
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#5A5347',
            fontFamily: 'Georgia, serif',
            fontStyle: 'italic' as const,
          }}
        >
          Interactive world map coming soon
        </div>
      </section>

      <div style={{ textAlign: 'center' as const }}>
        <button
          onClick={onReset}
          style={{
            background: GOLD_GRADIENT,
            color: BG,
            border: 'none',
            padding: '14px 40px',
            fontSize: 14,
            fontFamily: 'Georgia, serif',
            cursor: 'pointer',
            borderRadius: 4,
            fontWeight: 700,
            letterSpacing: '2px',
          }}
        >
          REWRITE ANOTHER HISTORY
        </button>
      </div>
    </div>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 style={{
      fontFamily: 'Georgia, serif',
      fontSize: 'clamp(20px, 3vw, 28px)',
      fontWeight: 700,
      color: GOLD,
      letterSpacing: '2px',
      marginBottom: 24,
      paddingBottom: 12,
      borderBottom: '1px solid rgba(212,168,67,0.2)',
    }}>{children}</h2>
  )
}
