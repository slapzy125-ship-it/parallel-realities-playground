import { ReactNode, useState, useRef } from 'react'

interface Props {
  children: ReactNode
  onClick?: () => void
  href?: string
  gold?: boolean
  ghost?: boolean
  style?: React.CSSProperties
}

export default function GlowButton({ children, onClick, href, gold = true, ghost = false, style }: Props) {
  const [hovered, setHovered] = useState(false)
  const [ripples, setRipples] = useState<{ x: number; y: number; id: number }[]>([])
  const btnRef = useRef<HTMLDivElement>(null)
  const nextId = useRef(0)

  const handleClick = (e: React.MouseEvent) => {
    const rect = btnRef.current?.getBoundingClientRect()
    if (rect) {
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      const id = nextId.current++
      setRipples(prev => [...prev, { x, y, id }])
      setTimeout(() => setRipples(prev => prev.filter(r => r.id !== id)), 800)
    }
    onClick?.()
  }

  const Tag = href ? 'a' : 'div'

  return (
    <Tag
      ref={btnRef as any}
      href={href}
      onClick={handleClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        cursor: 'pointer',
        padding: '14px 48px',
        borderRadius: '3px',
        textDecoration: 'none',
        fontFamily: "'Cinzel', serif",
        fontWeight: 700,
        fontSize: '14px',
        letterSpacing: '2px',
        transition: 'all 0.4s cubic-bezier(0.16,1,0.3,1)',
        background: ghost ? 'transparent' : gold ? 'linear-gradient(135deg,#8B6914,#D4A843)' : 'linear-gradient(135deg,#1a3a6b,#4A9EFF)',
        color: ghost ? (gold ? '#D4A843' : '#4A9EFF') : '#0A0A0C',
        border: ghost ? `1px solid ${gold ? 'rgba(212,168,67,0.4)' : 'rgba(74,158,255,0.4)'}` : 'none',
        transform: hovered ? 'translateY(-2px) scale(1.02)' : 'translateY(0) scale(1)',
        boxShadow: hovered
          ? gold ? '0 8px 40px rgba(212,168,67,0.4), 0 0 0 1px rgba(212,168,67,0.2)' : '0 8px 40px rgba(74,158,255,0.4)'
          : gold ? '0 4px 20px rgba(212,168,67,0.2)' : '0 4px 20px rgba(74,158,255,0.1)',
        ...style,
      }}
    >
      {ripples.map(r => (
        <span
          key={r.id}
          style={{
            position: 'absolute',
            left: r.x,
            top: r.y,
            width: '4px',
            height: '4px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.4)',
            transform: 'translate(-50%,-50%) scale(0)',
            animation: 'rippleOut 0.8s ease-out forwards',
            pointerEvents: 'none',
          }}
        />
      ))}
      <style>{`@keyframes rippleOut{to{transform:translate(-50%,-50%) scale(80);opacity:0}}`}</style>
      {children}
    </Tag>
  )
}
