'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Camera, Flag, Zap, X, ChevronRight, Check, Trophy } from 'lucide-react'

const DISMISS_KEY = 'profile-prompt-dismissed'
const TEST_EMAILS = ['tomasz@skilling.com', 'morhendos@gmail.com']
const TENNIS_FIELDS = ['surface', 'playStyle', 'bestShot', 'dominantHand', 'backhand', 'racket']

function inUpcomingLeague(registrations = []) {
  const now = Date.now()
  return registrations.some(r => {
    const league = r.league
    if (!league || typeof league !== 'object') return false
    const paid = r.status === 'confirmed' || ['completed', 'waived'].includes(r.paymentStatus)
    const start = league.seasonConfig?.startDate ? new Date(league.seasonConfig.startDate).getTime() : null
    const notStarted = ['registration_open', 'upcoming', 'coming_soon'].includes(league.status) || (start && start > now)
    return paid && notStarted
  })
}

export default function ProfilePromptCard({ player, language = 'es', locale = 'es' }) {
  const [show, setShow] = useState(false)
  const [barWidth, setBarWidth] = useState(0)
  const isTest = TEST_EMAILS.includes((player?.email || '').toLowerCase())
  const t = (es, en) => (language === 'es' ? es : en)

  const tp = player?.tennisProfile || {}
  const hasPhoto = !!player?.avatar
  const hasCountry = !!player?.country
  const tennisDone = TENNIS_FIELDS.filter(f => tp[f]).length
  const total = 2 + TENNIS_FIELDS.length
  const done = (hasPhoto ? 1 : 0) + (hasCountry ? 1 : 0) + tennisDone
  const percent = Math.round((done / total) * 100)
  const complete = done === total

  useEffect(() => {
    if (!player) return
    const store = isTest ? sessionStorage : localStorage
    if (store.getItem(DISMISS_KEY)) return
    if (isTest || (!complete && inUpcomingLeague(player.registrations))) setShow(true)
  }, [player, isTest, complete])

  useEffect(() => {
    if (!show) return
    const id = setTimeout(() => setBarWidth(percent), 150)
    return () => clearTimeout(id)
  }, [show, percent])

  const dismiss = () => {
    (isTest ? sessionStorage : localStorage).setItem(DISMISS_KEY, '1')
    setShow(false)
  }

  if (!show) return null

  const steps = [
    { done: hasPhoto, icon: Camera, label: t('Foto', 'Photo'), cta: t('Añadir foto', 'Add photo') },
    { done: hasCountry, icon: Flag, label: t('País', 'Country'), cta: t('Elegir país', 'Pick your country') },
    {
      done: tennisDone === TENNIS_FIELDS.length,
      icon: Zap,
      label: `${t('Estilo de juego', 'Playing style')} ${tennisDone}/${TENNIS_FIELDS.length}`,
      cta: t('Completar estilo de juego', 'Add your playing style')
    }
  ]
  const next = steps.find(s => !s.done)

  return (
    <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-parque-purple via-purple-700 to-indigo-700 text-white shadow-lg">
      <div className="absolute -top-10 -right-10 w-36 h-36 rounded-full bg-white/10" />
      <div className="absolute -bottom-12 -left-8 w-28 h-28 rounded-full bg-white/5" />
      <button onClick={dismiss} className="absolute top-3 right-3 p-1 text-white/60 hover:text-white rounded-full hover:bg-white/10 z-10" aria-label={t('Cerrar', 'Close')}>
        <X className="w-4 h-4" />
      </button>

      <div className="relative p-4 sm:p-5">
        <div className="flex items-end justify-between gap-3 pr-6">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-purple-200">
              {t('Mientras empieza la temporada', 'Before the season starts')}
            </p>
            <h3 className="mt-0.5 text-lg sm:text-xl font-bold">
              {complete ? t('¡Ficha completa!', 'Player card complete!') : t('Prepara tu ficha de jugador', 'Build your player card')}
            </h3>
          </div>
          <div className="text-3xl sm:text-4xl font-extrabold tabular-nums leading-none">
            {percent}<span className="text-lg sm:text-xl text-purple-200">%</span>
          </div>
        </div>

        <div className="mt-3 h-3 rounded-full bg-white/15 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-parque-yellow to-lime-300 transition-[width] duration-1000 ease-out"
            style={{ width: `${barWidth}%` }}
          />
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {steps.map(({ done, icon: Icon, label }) => (
            <span
              key={label}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${done ? 'bg-parque-yellow text-parque-purple' : 'bg-white/15 text-white'}`}
            >
              {done ? <Check className="w-3.5 h-3.5" /> : <Icon className="w-3.5 h-3.5" />}
              {label}
            </span>
          ))}
        </div>

        {complete ? (
          <div className="mt-4 flex items-center gap-2 text-sm font-medium text-purple-100">
            <Trophy className="w-5 h-5 text-parque-yellow" />
            {t('Listo para la pista. ¡Nos vemos en el primer partido!', 'Ready for court. See you at your first match!')}
          </div>
        ) : (
          <Link
            href={`/${locale}/player/profile`}
            className="mt-4 inline-flex items-center gap-1.5 bg-white text-parque-purple px-4 py-2.5 rounded-xl text-sm font-bold shadow hover:bg-purple-50 active:scale-[0.98] transition-all"
          >
            {next?.cta}
            <ChevronRight className="w-4 h-4" />
          </Link>
        )}
      </div>
    </div>
  )
}
