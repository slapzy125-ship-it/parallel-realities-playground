import { useRef, useEffect, useState, ReactNode } from 'react'

interface Props {
  children: ReactNode
  delay?: number
  direction?: 'up' | 'left' | 'right' | 'scale'
  style?: React.CSSProperties
  className?: string
}

export default function AnimatedSection({ children, delay = 0, direction = 'up', style, className }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setTimeout(() => setVisible(true), delay) },
      { threshold: 0.1 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [delay])

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: direction === 'up' ? (visible ? 'translateY(0)' : 'translateY(48px)') :
                   direction === 'left' ? (visible ? 'translateX(0)' : 'translateX(-48px)') :
                   direction === 'right' ? (visible ? 'translateX(0)' : 'translateX(48px)') :
                   (visible ? 'scale(1)' : 'scale(0.92)'),
        transition: `opacity 0.9s cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 0.9s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
        ...style,
      }}
    >
      {children}
    </div>
  )
}
