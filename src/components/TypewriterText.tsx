import { useEffect, useState, useRef } from 'react'

export default function TypewriterText({ text, speed = 40, delay = 0, style }: { text: string, speed?: number, delay?: number, style?: React.CSSProperties }) {
  const [displayed, setDisplayed] = useState('')
  const [started, setStarted] = useState(false)
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setTimeout(() => setStarted(true), delay) },
      { threshold: 0.5 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [delay])

  useEffect(() => {
    if (!started) return
    let i = 0
    const interval = setInterval(() => {
      setDisplayed(text.slice(0, i + 1))
      i++
      if (i >= text.length) clearInterval(interval)
    }, speed)
    return () => clearInterval(interval)
  }, [started, text, speed])

  return (
    <span ref={ref} style={style}>
      {displayed || '\u00A0'}
      {started && displayed.length < text.length && (
        <span style={{ opacity: 1, animation: 'blink 0.7s infinite' }}>|</span>
      )}
      <style>{`@keyframes blink{0%,100%{opacity:1}50%{opacity:0}}`}</style>
    </span>
  )
}
