'use client'

import { useEffect, useRef, useState } from 'react'
import confetti from 'canvas-confetti'

const LIVE = false
const TEST_EMAILS = ['tomasz@skilling.com']
const SHOW_MS = 3200
const FADE_MS = 600

const text = {
  es: { top: 'Temporada oficialmente en marcha', title: '¡Arranca la temporada!', sub: '¡Vamos! 🎾', skip: 'Toca para continuar' },
  en: { top: 'Season officially underway', title: 'The season has started!', sub: "Let's go! 🎾", skip: 'Tap to continue' }
}

function findLeagueToCelebrate(player) {
  return (player?.registrations || []).find(r =>
    ['confirmed', 'active'].includes(r.status) &&
    r.league?.status === 'active' &&
    !r.seasonStartCelebratedAt
  )
}

export default function SeasonStartCelebration({ player, language = 'es' }) {
  const [phase, setPhase] = useState('hidden')
  const startedRef = useRef(false)
  const timersRef = useRef([])
  const t = text[language] || text.es

  useEffect(() => {
    if (!player || startedRef.current) return
    const isTester = TEST_EMAILS.includes((player.email || '').toLowerCase())
    const forced = isTester && new URLSearchParams(window.location.search).get('celebrate') === '1'
    if (!LIVE && !isTester) return

    const registration = findLeagueToCelebrate(player)
    if (!forced && !registration) return

    startedRef.current = true
    if (registration && !forced) {
      fetch('/api/player/season-celebration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leagueId: registration.league._id || registration.league })
      }).catch(() => {})
    }

    setPhase('in')
    fireConfetti()
    timersRef.current.push(setTimeout(() => setPhase('out'), SHOW_MS))
    timersRef.current.push(setTimeout(() => setPhase('hidden'), SHOW_MS + FADE_MS))
  }, [player])

  useEffect(() => () => timersRef.current.forEach(clearTimeout), [])

  const close = () => {
    if (phase !== 'in') return
    timersRef.current.forEach(clearTimeout)
    setPhase('out')
    timersRef.current = [setTimeout(() => setPhase('hidden'), FADE_MS)]
  }

  if (phase === 'hidden') return null

  return (
    <div
      onClick={close}
      className="fixed inset-0 z-[100] flex items-center justify-center px-6 cursor-pointer"
      style={{
        background: 'rgba(30, 16, 50, 0.78)',
        opacity: phase === 'out' ? 0 : 1,
        transition: `opacity ${FADE_MS}ms ease`,
        animation: 'tdpFadeIn 300ms ease'
      }}
    >
      <style>{`
        @keyframes tdpFadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes tdpPop {
          0% { transform: scale(0.4); opacity: 0 }
          60% { transform: scale(1.08); opacity: 1 }
          100% { transform: scale(1) }
        }
        @keyframes tdpRise { from { transform: translateY(12px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }
      `}</style>
      <div className="text-center select-none">
        <div
          className="text-xs sm:text-sm font-semibold uppercase tracking-[0.2em] text-purple-200"
          style={{ animation: 'tdpRise 500ms ease 150ms both' }}
        >
          {t.top}
        </div>
        <div
          className="mt-3 text-4xl sm:text-6xl font-extrabold text-white leading-tight"
          style={{ animation: 'tdpPop 700ms cubic-bezier(0.2, 0.9, 0.3, 1.2) 250ms both', textShadow: '0 4px 24px rgba(0,0,0,0.35)' }}
        >
          {t.title}
        </div>
        <div
          className="mt-4 text-2xl sm:text-3xl font-bold"
          style={{ color: '#E6E94E', animation: 'tdpRise 500ms ease 700ms both' }}
        >
          {t.sub}
        </div>
        <div
          className="mt-10 text-xs text-purple-200/70"
          style={{ animation: 'tdpRise 500ms ease 1400ms both' }}
        >
          {t.skip}
        </div>
      </div>
    </div>
  )
}

function fireConfetti() {
  const colors = ['#563380', '#7c3aed', '#E6E94E', '#ffffff', '#22c55e']
  const base = { zIndex: 101, colors, disableForReducedMotion: true }
  setTimeout(() => {
    confetti({ ...base, particleCount: 120, spread: 90, startVelocity: 45, origin: { y: 0.6 } })
  }, 350)
  setTimeout(() => {
    confetti({ ...base, particleCount: 60, angle: 60, spread: 60, origin: { x: 0, y: 0.7 } })
    confetti({ ...base, particleCount: 60, angle: 120, spread: 60, origin: { x: 1, y: 0.7 } })
  }, 800)
}
