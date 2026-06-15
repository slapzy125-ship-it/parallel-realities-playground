import { useState, useEffect, useRef } from 'react'

const STYLES = `
  @keyframes fadeUp { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
  @keyframes slideRight { from { opacity:0; transform:translateX(-32px); } to { opacity:1; transform:translateX(0); } }
  @keyframes slideLeft { from { opacity:0; transform:translateX(32px); } to { opacity:1; transform:translateX(0); } }
  @keyframes letterIn { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
  @keyframes shimmer { 0% { background-position:-200% center; } 100% { background-position:200% center; } }
  @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
  @keyframes expandCard { from { max-height:0; opacity:0; } to { max-height:600px; opacity:1; } }
`

const LOADING_MESSAGES = [
  'Identifying the divergence point...',
  'Mapping immediate consequences...',
  'Tracing political realignments...',
  'Charting population shifts...',
  'Modelling technological trajectories...',
  'Calculating cultural drift...',
  'Constructing the alternate timeline...',
]

type RippleEvent = {
  year: string
  title: string
  summary: string
  detail: string
}

type ComparisonRow = {
  era: string
  realHistory: string
  alternateHistory: string
}

type WhatIfResult = {
  scenario: string
  narrativeSummary: string[]
  rippleEvents: RippleEvent[]
  comparison: ComparisonRow[]
}

const MOCK_RESULT: WhatIfResult = {
  scenario: 'What if the Roman Empire never fell?',
  narrativeSummary: [
    'In 476 AD, the moment that never came: Odoacer does not depose Romulus Augustulus. Instead, a coalition of reformist generals stabilises the western provinces, and the empire enters a second era of consolidation. The great bureaucratic machine grinds on.',
    'By 600 AD, Latin remains the universal language of science and administration across Europe, North Africa, and the Near East. The Christian church exists — but as one institution among many, subordinate to imperial law rather than rival to it. The great cathedrals are still built, but in the old Roman cities, alongside temples to a dozen other faiths.',
    'The thousand-year darkness we call the Middle Ages simply does not happen. Literacy rates in 900 AD match what our world would not achieve until the 18th century. But the empire is not without its fractures — slave economies stall innovation, and eastern provinces grow restless under distant rule.',
  ],
  rippleEvents: [
    {
      year: '500 AD',
      title: 'The Western Consolidation',
      summary: 'Emperor Anthemius II brokers peace with Germanic federates.',
      detail: 'Rather than conquest, the reformed empire integrates Germanic peoples as full citizens, flooding the legions with new blood. The Rhine-Danube frontier holds. Taxation reform redistributes wealth to the provinces, building loyalty that endures for centuries.',
    },
    {
      year: '632 AD',
      title: 'Islam Meets the Empire',
      summary: 'The Arab expansion encounters a unified Mediterranean power.',
      detail: 'The early caliphate still rises — no alternate history erases the Prophet. But expansion into Roman territory stalls at a fortified eastern frontier. Trade replaces conquest. Within a century, Arabic and Latin scholars exchange manuscripts freely in Alexandria, producing a scientific renaissance 400 years early.',
    },
    {
      year: '900 AD',
      title: 'The Innovation Stagnation',
      summary: 'Slave labour keeps Roman society from mechanising.',
      detail: 'The empire\'s greatest weakness becomes visible: with millions of slaves performing every manual task, there is no incentive to develop the water mill, the printing press, or advanced metallurgy. Innovation clusters in the eastern cities while the western provinces grow wealthy but intellectually stagnant.',
    },
    {
      year: '1200 AD',
      title: 'The Americas Question',
      summary: 'Roman navigators reach Caribbean shores two centuries early.',
      detail: 'Following Ptolemaic geography updated by Arab astronomers, Roman-Arab joint expeditions reach the Caribbean in 1204. Unlike later Spanish conquistadors, they arrive with imperial administrators and surveyors rather than soldiers seeking gold. Contact is cautious, then brutal — disease still does its terrible work — but the political outcome is a colonial structure that prevents the total civilisational destruction seen in our timeline.',
    },
    {
      year: '1400 AD',
      title: 'The Great Provincial Rebellions',
      summary: 'Northern Europe fractures into autonomous kingdoms.',
      detail: 'After nineteen centuries of Roman rule, the Germanic and Slavic north rises in coordinated rebellion. The empire does not fall — it negotiates. A federated structure emerges, with the Senate acknowledging regional assemblies. It is the world\'s first constitutional federation, born not from Enlightenment philosophy but from imperial exhaustion.',
    },
    {
      year: '1600 AD',
      title: 'The Industrial Age Arrives Early',
      summary: 'Steam power emerges from Roman engineering traditions.',
      detail: 'The stagnation ends when slave manumission, driven by federated provinces, creates labour markets. Within fifty years, Roman engineers — building on Hero of Alexandria\'s ancient designs — produce practical steam engines. Industrialisation begins 200 years ahead of our own timeline, but without the nation-state competition that drove our version\'s explosive acceleration.',
    },
    {
      year: '2026 AD',
      title: 'The World Today',
      summary: 'A federated empire of 2.1 billion citizens spanning four continents.',
      detail: 'Latin dialects, branching into regional tongues, have evolved the way Romance languages did in our world — but unified by a shared administrative Latin. Democracy is universal, descended from reformed Roman assemblies. The Americas were colonised, then federated. The technological level is roughly comparable to our 1970s — slower to innovate, but more stable. No world wars. Several devastating civil conflicts. A planet that is warmer and more peaceful than ours, and strikingly less free.',
    },
  ],
  comparison: [
    {
      era: 'Religion & Culture',
      realHistory: 'Christianity dominates Europe for over a millennium. Islam expands into a vast empire. Buddhism spreads across Asia. Religions shape law, science, and war.',
      alternateHistory: 'Roman polytheism blends with Christianity, Judaism, and Islam under imperial tolerance. No single faith achieves monopoly. Philosophy and science remain secular disciplines. The Inquisition never happens.',
    },
    {
      era: 'Language',
      realHistory: 'Latin fragments into French, Spanish, Italian, Portuguese, Romanian. English emerges from Germanic roots. Hundreds of distinct European languages develop.',
      alternateHistory: 'Spoken Latin diversifies regionally but written Latin remains universal. Scientific and legal texts are immediately readable across the entire empire. A single written tradition spans from Scotland to Mesopotamia.',
    },
    {
      era: 'Technology (900 AD)',
      realHistory: 'Early medieval period. Limited literacy. Iron tools. Water mills beginning to spread. Architectural knowledge partially lost.',
      alternateHistory: 'Concrete, aqueducts, and road networks maintained. Literacy at 30% in cities. Roman engineering traditions unbroken. But no gunpowder, no printing press — innovation stalled by slave economy.',
    },
    {
      era: 'The Americas',
      realHistory: 'Pre-Columbian civilisations flourish in isolation until 1492. Spanish and Portuguese conquest destroys most in a century. Demographic collapse of up to 90% in some regions.',
      alternateHistory: 'Roman-Arab contact in 1204. Slower, more administrative colonisation. Disease still kills millions. But Aztec and Inca political structures survive in federated form. Indigenous leaders negotiate directly with Roman governors.',
    },
    {
      era: 'Today\'s World',
      realHistory: '195 nation-states. Two world wars. Nuclear weapons. The internet. Liberal democracy in partial retreat. 8 billion people. Climate crisis accelerating.',
      alternateHistory: 'One federated empire and several autonomous kingdoms. No world wars. No nuclear weapons — yet. Steam-to-electric industrialisation ongoing. 2.1 billion people. Climate stable. Political freedom limited by imperial tradition.',
    },
  ],
}

function LoadingScreen({ scenario }: { scenario: string }) {
  const [msgIndex, setMsgIndex] = useState(0)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number | undefined>(undefined)
  const particlesRef = useRef<{ x: number; y: number; size: number; speed: number; opacity: number }[]>([])

  useEffect(() => {
    particlesRef.current = Array.from({ length: 60 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: Math.random() * 2 + 0.5,
      speed: Math.random() * 0.4 + 0.1,
      opacity: Math.random() * 0.5 + 0.1,
    }))

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    let running = true
    let time = 0

    const draw = () => {
      if (!running) return
      time += 0.01
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.fillStyle = '#0A0A0C'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      particlesRef.current.forEach((p, i) => {
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
      for (let i = 0; i < 4; i++) {
        const radius = 60 + i * 50
        const alpha = 0.04 + Math.sin(time * 0.7 + i) * 0.025
        ctx.beginPath()
        ctx.arc(cx, cy, radius + Math.sin(time * 0.5 + i) * 12, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(212,168,67,${alpha})`
        ctx.lineWidth = 1
        ctx.stroke()
      }

      for (let i = 0; i < 8; i++) {
        const angle = time * 0.2 + i * Math.PI / 4
        const r = 140 + Math.sin(time + i) * 20
        const px = cx + Math.cos(angle) * r
        const py = cy + Math.sin(angle) * r
        ctx.beginPath()
        ctx.arc(px, py, 1.5, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(212,168,67,${0.4 + Math.sin(time * 3 + i) * 0.2})`
        ctx.fill()
      }

      animRef.current = requestAnimationFrame(draw)
    }
    draw()
    return () => { running = false; if (animRef.current) cancelAnimationFrame(animRef.current) }
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIndex(i => (i + 1) % LOADING_MESSAGES.length)
    }, 1800)
    return () => clearInterval(interval)
  }, [])

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#0A0A0C', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
      <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0 }} />
      <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: '0 24px', maxWidth: '560px' }}>
        <div style={{ color: '#D4A843', fontSize: '11px', letterSpacing: '4px', textTransform: 'uppercase', marginBottom: '32px', animation: 'pulse 2s infinite' }}>
          REWRITING HISTORY
        </div>
        <div style={{ fontFamily: 'Georgia,serif', fontSize: 'clamp(16px,3vw,22px)', color: 'rgba(240,240,240,0.7)', lineHeight: 1.6, marginBottom: '48px', fontStyle: 'italic' }}>
          "{scenario}"
        </div>
        <div style={{ color: 'rgba(240,240,240,0.5)', fontSize: '14px', letterSpacing: '1px', minHeight: '24px', transition: 'opacity 0.4s ease', fontFamily: 'system-ui,sans-serif' }}>
          {LOADING_MESSAGES[msgIndex]}
        </div>
        <div style={{ marginTop: '32px', display: 'flex', justifyContent: 'center', gap: '8px' }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#D4A843', animation: `pulse 1.2s ease ${i * 0.4}s infinite` }} />
          ))}
        </div>
      </div>
    </div>
  )
}

function RippleTimeline({ events }: { events: RippleEvent[] }) {
  const [expanded, setExpanded] = useState<number | null>(null)

  return (
    <div style={{ marginBottom: '32px' }}>
      <div style={{ color: '#D4A843', fontSize: '12px', letterSpacing: '3px', marginBottom: '20px', textAlign: 'center' as const }}>
        {'RIPPLE EVENTS'.split('').map((l, i) => (
          <span key={i} style={{ display: 'inline-block', animation: `letterIn 0.5s ease ${i * 0.04}s both` }}>{l === ' ' ? '\u00A0' : l}</span>
        ))}
      </div>
      <div style={{ display: 'flex', overflowX: 'auto', gap: '16px', paddingBottom: '16px', scrollbarWidth: 'none' }}>
        {events.map((ev, i) => (
          <div
            key={i}
            onClick={() => setExpanded(expanded === i ? null : i)}
            style={{
              flexShrink: 0,
              width: expanded === i ? '340px' : '220px',
              background: expanded === i ? 'rgba(212,168,67,0.06)' : '#1A1A24',
              border: `1px solid ${expanded === i ? 'rgba(212,168,67,0.5)' : '#2A2A38'}`,
              borderRadius: '8px',
              padding: '20px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              animation: `fadeUp 0.5s ease ${i * 0.1}s both`,
            }}
          >
            <div style={{ color: '#D4A843', fontSize: '11px', letterSpacing: '2px', marginBottom: '6px' }}>
              {ev.year}
            </div>
            <div style={{ fontFamily: 'Georgia,serif', fontSize: '14px', fontWeight: 700, color: '#F0F0F0', marginBottom: '8px', lineHeight: 1.4 }}>
              {ev.title}
            </div>
            <div style={{ fontFamily: 'Georgia,serif', fontSize: '13px', color: 'rgba(240,240,240,0.55)', lineHeight: 1.6 }}>
              {ev.summary}
            </div>
            {expanded === i && (
              <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid rgba(212,168,67,0.2)', fontFamily: 'Georgia,serif', fontSize: '13px', color: 'rgba(240,240,240,0.78)', lineHeight: 1.7, animation: 'fadeUp 0.3s ease both' }}>
                {ev.detail}
              </div>
            )}
            <div style={{ marginTop: '12px', color: expanded === i ? '#D4A843' : 'rgba(240,240,240,0.25)', fontSize: '11px', letterSpacing: '1px', textAlign: 'right' as const }}>
              {expanded === i ? '▲ COLLAPSE' : '▼ EXPAND'}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ComparisonGrid({ rows }: { rows: ComparisonRow[] }) {
  return (
    <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(212,168,67,0.2)', borderRadius: '8px', overflow: 'hidden', marginBottom: '32px', animation: 'fadeUp 0.8s ease both' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
        <div style={{ color: 'rgba(240,240,240,0.4)', fontSize: '11px', letterSpacing: '2px', padding: '12px 20px', borderBottom: '1px solid rgba(212,168,67,0.2)', textTransform: 'uppercase' as const }}>
          Real History
        </div>
        <div style={{ color: '#D4A843', fontSize: '11px', letterSpacing: '2px', padding: '12px 20px', borderBottom: '1px solid rgba(212,168,67,0.2)', borderLeft: '1px solid rgba(212,168,67,0.2)', textTransform: 'uppercase' as const }}>
          Alternate History
        </div>
        {rows.map((row, i) => (
          <>
            <div key={`era-r${i}`} style={{ padding: '20px', borderBottom: i < rows.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none', animation: `slideRight 0.5s ease ${i * 0.12}s both` }}>
              <div style={{ color: 'rgba(240,240,240,0.35)', fontSize: '10px', letterSpacing: '2px', marginBottom: '6px', textTransform: 'uppercase' as const }}>{row.era}</div>
              <div style={{ fontFamily: 'Georgia,serif', fontSize: '14px', lineHeight: 1.65, color: 'rgba(240,240,240,0.7)' }}>{row.realHistory}</div>
            </div>
            <div key={`era-a${i}`} style={{ padding: '20px', borderBottom: i < rows.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none', borderLeft: '1px solid rgba(212,168,67,0.2)', animation: `slideLeft 0.5s ease ${i * 0.12}s both` }}>
              <div style={{ color: '#D4A843', fontSize: '10px', letterSpacing: '2px', marginBottom: '6px', textTransform: 'uppercase' as const }}>{row.era}</div>
              <div style={{ fontFamily: 'Georgia,serif', fontSize: '14px', lineHeight: 1.65, color: 'rgba(240,240,240,0.88)' }}>{row.alternateHistory}</div>
            </div>
          </>
        ))}
      </div>
    </div>
  )
}

async function runWhatIfSimulation(_scenario: string): Promise<WhatIfResult> {
  await new Promise(r => setTimeout(r, 2000))
  return { ...MOCK_RESULT, scenario: _scenario || MOCK_RESULT.scenario }
}

export default function WhatIf() {
  const [step, setStep] = useState<'input' | 'loading' | 'result'>('input')
  const [scenario, setScenario] = useState('')
  const [result, setResult] = useState<WhatIfResult | null>(null)

  const handleSubmit = async () => {
    if (!scenario.trim()) return
    setStep('loading')
    const data = await runWhatIfSimulation(scenario.trim())
    setResult(data)
    setStep('result')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const sectionStyle: React.CSSProperties = {
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(212,168,67,0.2)',
    borderRadius: '8px',
    padding: '32px',
    marginBottom: '24px',
    animation: 'fadeUp 0.8s ease both',
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0A0A0C', color: '#F0F0F0', fontFamily: 'system-ui,sans-serif' }}>
      <style>{STYLES}</style>

      {step === 'loading' && <LoadingScreen scenario={scenario} />}

      {step === 'input' && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '80px 24px 60px', maxWidth: '680px', margin: '0 auto' }}>
          <div style={{ color: '#D4A843', fontSize: '11px', letterSpacing: '4px', marginBottom: '20px', animation: 'fadeUp 0.5s ease both' }}>
            REVENIO — ALTERNATE HISTORIES
          </div>
          <h1 style={{
            fontFamily: 'Georgia,serif',
            fontSize: 'clamp(24px,5vw,48px)',
            fontWeight: 700,
            letterSpacing: '3px',
            textAlign: 'center',
            lineHeight: 1.2,
            marginBottom: '16px',
            animation: 'fadeUp 0.6s ease 0.1s both',
          }}>
            WHAT IF HISTORY HAD<br />GONE DIFFERENTLY?
          </h1>
          <p style={{ color: '#7A7A8A', fontSize: '15px', lineHeight: 1.7, textAlign: 'center', marginBottom: '48px', maxWidth: '480px', fontFamily: 'Georgia,serif', fontStyle: 'italic', animation: 'fadeUp 0.6s ease 0.2s both' }}>
            Describe any historical turning point. The AI will construct the full alternate timeline — ripple by ripple, century by century.
          </p>

          <div style={{ width: '100%', animation: 'fadeUp 0.6s ease 0.3s both' }}>
            <div style={{ color: '#D4A843', fontSize: '11px', letterSpacing: '2px', marginBottom: '10px', textTransform: 'uppercase' as const }}>
              Your Scenario
            </div>
            <textarea
              value={scenario}
              onChange={e => setScenario(e.target.value)}
              placeholder="e.g. What if the Roman Empire never fell? What if the Library of Alexandria survived? What if the Black Death never happened?"
              rows={5}
              style={{
                width: '100%',
                background: '#1A1A24',
                border: '1px solid rgba(212,168,67,0.2)',
                borderRadius: '8px',
                padding: '16px 20px',
                color: '#F0F0F0',
                fontSize: '16px',
                fontFamily: 'Georgia,serif',
                lineHeight: 1.65,
                resize: 'vertical',
                outline: 'none',
                boxSizing: 'border-box',
                marginBottom: '20px',
                transition: 'border-color 0.2s',
              }}
              onFocus={e => e.target.style.borderColor = 'rgba(212,168,67,0.6)'}
              onBlur={e => e.target.style.borderColor = 'rgba(212,168,67,0.2)'}
              onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSubmit() }}
            />
            <button
              onClick={handleSubmit}
              disabled={!scenario.trim()}
              style={{
                width: '100%',
                padding: '16px',
                background: scenario.trim() ? 'linear-gradient(135deg,#8B6914,#D4A843)' : '#2A2A38',
                color: scenario.trim() ? '#0A0A0C' : '#7A7A8A',
                border: 'none',
                borderRadius: '8px',
                fontFamily: "'Cinzel',serif",
                fontSize: '14px',
                fontWeight: 700,
                letterSpacing: '3px',
                cursor: scenario.trim() ? 'pointer' : 'not-allowed',
                textTransform: 'uppercase' as const,
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => { if (scenario.trim()) e.currentTarget.style.transform = 'scale(1.01)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)' }}
            >
              Simulate Alternate History
            </button>
            <div style={{ color: 'rgba(240,240,240,0.2)', fontSize: '12px', textAlign: 'center' as const, marginTop: '12px' }}>
              ⌘ + Enter to submit
            </div>
          </div>
        </div>
      )}

      {step === 'result' && result && (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '48px 24px 80px' }}>

          <div style={{ textAlign: 'center' as const, marginBottom: '48px', animation: 'fadeUp 0.6s ease both' }}>
            <div style={{ color: '#D4A843', fontSize: '11px', letterSpacing: '4px', marginBottom: '16px' }}>ALTERNATE TIMELINE</div>
            <h1 style={{ fontFamily: 'Georgia,serif', fontSize: 'clamp(20px,4vw,36px)', fontWeight: 700, lineHeight: 1.3, color: '#F0F0F0', marginBottom: '0' }}>
              {result.scenario}
            </h1>
          </div>

          <div style={sectionStyle}>
            <div style={{ color: '#D4A843', fontSize: '12px', letterSpacing: '3px', marginBottom: '24px' }}>THE ALTERNATE WORLD</div>
            {result.narrativeSummary.map((para, i) => (
              <p key={i} style={{ fontFamily: 'Georgia,serif', fontSize: '17px', lineHeight: 1.85, color: 'rgba(240,240,240,0.88)', marginBottom: i < result.narrativeSummary.length - 1 ? '20px' : '0' }}>
                {para}
              </p>
            ))}
          </div>

          <div style={sectionStyle}>
            <RippleTimeline events={result.rippleEvents} />
          </div>

          <div style={sectionStyle}>
            <div style={{ color: '#D4A843', fontSize: '12px', letterSpacing: '3px', marginBottom: '20px' }}>SIDE BY SIDE — TWO HISTORIES</div>
            <ComparisonGrid rows={result.comparison} />
          </div>

          <div style={{ ...sectionStyle, border: '1px solid rgba(212,168,67,0.15)' }}>
            <div style={{ color: '#D4A843', fontSize: '12px', letterSpacing: '3px', marginBottom: '8px' }}>WORLD MAP</div>
            <div style={{ color: 'rgba(240,240,240,0.3)', fontSize: '12px', marginBottom: '16px', fontStyle: 'italic', fontFamily: 'Georgia,serif' }}>
              An interactive map of the alternate world will appear here.
            </div>
            <div
              id="world-map-container"
              style={{
                width: '100%',
                height: '360px',
                background: 'rgba(255,255,255,0.02)',
                border: '1px dashed rgba(212,168,67,0.15)',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'rgba(240,240,240,0.15)',
                fontSize: '13px',
                letterSpacing: '2px',
                fontFamily: 'system-ui,sans-serif',
              }}
            >
              MAP PLACEHOLDER
            </div>
          </div>

          <div style={{ textAlign: 'center' as const, marginTop: '16px' }}>
            <button
              onClick={() => { setStep('input'); setResult(null); setScenario('') }}
              style={{
                background: 'transparent',
                border: '1px solid rgba(212,168,67,0.3)',
                color: '#D4A843',
                padding: '12px 32px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '13px',
                fontFamily: "'Cinzel',serif",
                letterSpacing: '2px',
              }}
            >
              TRY ANOTHER SCENARIO
            </button>
          </div>

        </div>
      )}
    </div>
  )
}
