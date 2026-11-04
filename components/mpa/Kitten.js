'use client'

import { useEffect, useRef, useState } from 'react'

const EARS = [
  { outer: 'M5.7 5.6 5 0.9 10.1 3.2', inner: 'M6.6 5 6.3 2.6 8.8 3.7Z' },
  { outer: 'M18.3 5.6 19 0.9 13.9 3.2', inner: 'M17.4 5 17.7 2.6 15.2 3.7Z' },
]

function Eyes({ mood, look }) {
  if (mood === 'happy') return <path d="M7.9 10.6q1.3-1.8 2.6 0M13.5 10.6q1.3-1.8 2.6 0" />
  if (mood === 'blink') return <path d="M8 10.2h2.4M13.6 10.2h2.4" />
  const dx = look.x * 0.7
  const dy = look.y * 0.6
  return (
    <g stroke="none">
      {[9.2, 14.8].map((cx) => (
        <g key={cx}>
          <circle cx={cx + dx} cy={10 + dy} r="1.35" fill="currentColor" />
          <circle cx={cx + dx - 0.45} cy={10 + dy - 0.45} r="0.42" fill="white" />
        </g>
      ))}
    </g>
  )
}

function Paw({ cx, shown, shift, lift }) {
  return (
    <g className="mpa-paw" style={{ transform: shown ? `translate(${shift}px, ${lift}px)` : 'translate(0, 12px)', opacity: shown ? 1 : 0 }}>
      <ellipse cx={cx} cy="10.6" rx="2.7" ry="2.3" stroke="none" fill="currentColor" />
      <ellipse cx={cx} cy="11.2" rx="1" ry="0.75" stroke="none" fill="white" fillOpacity="0.45" />
      {[-1.2, 0, 1.2].map((d) => (
        <circle key={d} cx={cx + d} cy={d ? 9.3 : 9} r="0.42" stroke="none" fill="white" fillOpacity="0.45" />
      ))}
    </g>
  )
}

export function KittenFace({ mood = 'look', look = { x: 0, y: 0 }, paws = null, className = '' }) {
  return (
    <svg className={`mpa-kitten ${className}`} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" viewBox="0 0 24 24" aria-hidden="true">
      {EARS.map((ear) => (
        <g key={ear.outer}>
          <path d={ear.outer} strokeLinejoin="round" className="mpa-kitten-fill" />
          <path d={ear.inner} stroke="none" className="mpa-kitten-inner" />
        </g>
      ))}
      <circle cx="12" cy="12" r="9" className="mpa-kitten-fill" />
      <ellipse cx="7.6" cy="13.4" rx="1.5" ry="0.9" stroke="none" className="mpa-kitten-cheek" />
      <ellipse cx="16.4" cy="13.4" rx="1.5" ry="0.9" stroke="none" className="mpa-kitten-cheek" />
      <Eyes mood={paws ? 'look' : mood} look={paws ? { x: 0.6, y: 0.4 } : look} />
      <Paw cx={9.2} shown={Boolean(paws)} shift={paws === 'peek' ? -1.6 : 0} lift={paws === 'peek' ? 2.2 : 0} />
      <Paw cx={14.8} shown={Boolean(paws)} shift={0} lift={0} />
      <path d="M11.4 12.5h1.2l-.6.7Z" fill="currentColor" strokeWidth="1" strokeLinejoin="round" />
      <path d="M12 13.3q-.4 1.4-1.6 1.1M12 13.3q.4 1.4 1.6 1.1" />
      <path d="M3.6 12.2 6.4 12.8M3.9 14.6l2.6-.7M20.4 12.2l-2.8.6M20.1 14.6l-2.6-.7" strokeWidth="1" />
    </svg>
  )
}

export default function GuardKitten({ field = null, reveal = false, typed = 0, label = '' }) {
  const ref = useRef(null)
  const [look, setLook] = useState({ x: 0, y: 0 })
  const [mood, setMood] = useState('look')
  const [hop, setHop] = useState(false)
  const moodTimer = useRef(null)

  useEffect(() => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return undefined
    const onMove = (event) => {
      const rect = ref.current?.getBoundingClientRect()
      if (!rect) return
      const dx = event.clientX - (rect.left + rect.width / 2)
      const dy = event.clientY - (rect.top + rect.height / 2)
      const length = Math.hypot(dx, dy) || 1
      const reach = Math.min(1, length / 160)
      setLook({ x: (dx / length) * reach, y: (dy / length) * reach })
    }
    let blinkTimer = null
    const blink = () => {
      blinkTimer = setTimeout(() => {
        setMood((current) => {
          if (current !== 'look') return current
          clearTimeout(moodTimer.current)
          moodTimer.current = setTimeout(() => setMood('look'), 140)
          return 'blink'
        })
        blink()
      }, 2200 + Math.random() * 3000)
    }
    blink()
    window.addEventListener('pointermove', onMove)
    return () => {
      window.removeEventListener('pointermove', onMove)
      clearTimeout(blinkTimer)
      clearTimeout(moodTimer.current)
    }
  }, [])

  const reading = field === 'username'
  const paws = field === 'password' ? (reveal ? 'peek' : 'cover') : null
  const eyes = reading ? { x: -0.8 + Math.min(1, typed / 24) * 1.6, y: 0.9 } : look

  const pet = () => {
    clearTimeout(moodTimer.current)
    setMood('happy')
    moodTimer.current = setTimeout(() => setMood('look'), 1000)
    setHop(false)
    requestAnimationFrame(() => setHop(true))
  }

  return (
    <button
      ref={ref}
      type="button"
      onClick={pet}
      onAnimationEnd={() => setHop(false)}
      aria-label={label}
      className={`mpa-guard ${hop ? 'mpa-guard--hop' : ''} ${paws ? 'mpa-guard--paws' : reading ? 'mpa-guard--read' : ''}`}
    >
      <KittenFace mood={mood} look={eyes} paws={paws} />
    </button>
  )
}
