import { useEffect, useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { SiteNav } from '@/components/SiteNav'
import { SiteFooter } from '@/components/SiteFooter'

const STYLES = `
  @keyframes fadeUp { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
  @keyframes shimmer { 0% { background-position:-200% center; } 100% { background-position:200% center; } }
  @keyframes spin { to { transform:rotate(360deg); } }
`

type WhatIfEntry = {
  id: string
  created_at: string
  question: string
  summary: string
}

export default function WhatIfHistory() {
  const [entries, setEntries] = useState<WhatIfEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<{ id: string } | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ? { id: data.session.user.id } : null)
      setLoading(false)
    })
  }, [])

  useEffect(() => {
    if (!user) return
    setLoading(true)
    supabase
      .from('whatif_entries')
      .select('id, created_at, question, summary')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50)
      .then(({ data }) => {
        setEntries((data as WhatIfEntry[]) ?? [])
        setLoading(false)
      })
  }, [user])

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })

  return (
    <div style={{ minHeight: '100vh', background: '#0A0A0C', color: '#E8E0D0', fontFamily: "'Inter', sans-serif" }}>
      <style>{STYLES}</style>
      <SiteNav />

      <main style={{ maxWidth: 800, margin: '0 auto', padding: '80px 24px 120px' }}>
        <div style={{ animation: 'fadeUp 0.6s ease both' }}>
          <h1 style={{
            fontSize: 'clamp(28px, 5vw, 42px)',
            fontWeight: 700,
            letterSpacing: '-0.02em',
            marginBottom: 8,
            background: 'linear-gradient(135deg, #D4A843 0%, #F0C060 50%, #D4A843 100%)',
            backgroundSize: '200% auto',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            animation: 'shimmer 4s linear infinite',
          }}>
            What If History
          </h1>
          <p style={{ color: '#888', marginBottom: 48, fontSize: 16 }}>
            Your past explorations of alternate paths.
          </p>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              border: '3px solid #222', borderTopColor: '#D4A843',
              animation: 'spin 0.8s linear infinite',
            }} />
          </div>
        ) : !user ? (
          <div style={{
            textAlign: 'center', padding: '80px 24px',
            background: 'rgba(212,168,67,0.05)',
            border: '1px solid rgba(212,168,67,0.15)',
            borderRadius: 16,
          }}>
            <p style={{ color: '#888', marginBottom: 0 }}>
              Sign in to view your What If history.
            </p>
          </div>
        ) : entries.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '80px 24px',
            background: 'rgba(212,168,67,0.05)',
            border: '1px solid rgba(212,168,67,0.15)',
            borderRadius: 16,
          }}>
            <p style={{ color: '#888', marginBottom: 0 }}>
              No what-if simulations yet. Run your first one to see it here.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {entries.map((entry, i) => (
              <div
                key={entry.id}
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 12,
                  padding: '20px 24px',
                  animation: `fadeUp 0.5s ease ${i * 0.05}s both`,
                  transition: 'border-color 0.2s',
                }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(212,168,67,0.3)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)')}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
                  <p style={{ margin: 0, fontWeight: 600, color: '#E8E0D0', fontSize: 16, lineHeight: 1.4 }}>
                    {entry.question}
                  </p>
                  <span style={{ color: '#555', fontSize: 13, whiteSpace: 'nowrap', flexShrink: 0 }}>
                    {formatDate(entry.created_at)}
                  </span>
                </div>
                {entry.summary && (
                  <p style={{ margin: '10px 0 0', color: '#888', fontSize: 14, lineHeight: 1.6 }}>
                    {entry.summary}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      <SiteFooter />
    </div>
  )
}
