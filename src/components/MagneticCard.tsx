import { ReactNode, useRef, useState } from 'react'

export default function MagneticCard({ children, style }: { children: ReactNode, style?: React.CSSProperties }) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [transform, setTransform] = useState('')
  const [glow, setGlow] = useState({ x: 50, y: 50 })

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = cardRef.current?.getBoundingClientRect()
    if (!rect) return
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height
    const rotateX = (y - 0.5) * -12
    const rotateY = (x - 0.5) * 12
    setTransform(`perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(8px)`)
    setGlow({ x: x * 100, y: y * 100 })
  }

  const handleMouseLeave = () => {
    setTransform('perspective(800px) rotateX(0) rotateY(0) translateZ(0)')
  }

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform,
        transition: transform.includes('rotateX(0)') ? 'transform 0.6s cubic-bezier(0.16,1,0.3,1)' : 'transform 0.1s ease',
        position: 'relative',
        background: `radial-gradient(circle at ${glow.x}% ${glow.y}%, rgba(212,168,67,0.06) 0%, transparent 60%), #1A1A24`,
        border: '1px solid rgba(212,168,67,0.15)',
        borderRadius: '4px',
        cursor: 'pointer',
        ...style,
      }}
    >
      {children}
    </div>
  )
}
