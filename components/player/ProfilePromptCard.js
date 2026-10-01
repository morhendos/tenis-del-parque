'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Camera, Flag, Zap, X, ChevronRight, Check } from 'lucide-react'

const DISMISS_KEY = 'profile-prompt-dismissed'
const TEST_EMAILS = ['tomasz@skilling.com', 'morhendos@gmail.com']

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
  const isTest = TEST_EMAILS.includes((player?.email || '').toLowerCase())
  const t = (es, en) => (language === 'es' ? es : en)

  const hasPhoto = !!player?.avatar
  const hasCountry = !!player?.country
  const hasTennis = Object.values(player?.tennisProfile || {}).some(v => v !== null && v !== undefined && v !== '')
  const complete = hasPhoto && hasCountry && hasTennis

  useEffect(() => {
    if (!player) return
    const store = isTest ? sessionStorage : localStorage
    if (store.getItem(DISMISS_KEY)) return
    if (isTest || (!complete && inUpcomingLeague(player.registrations))) setShow(true)
  }, [player, isTest, complete])

  const dismiss = () => {
    (isTest ? sessionStorage : localStorage).setItem(DISMISS_KEY, '1')
    setShow(false)
  }

  if (!show) return null

  const items = [
    { done: hasPhoto, icon: Camera, label: t('Foto de perfil', 'Profile photo') },
    { done: hasCountry, icon: Flag, label: t('País que representas', 'Country you represent') },
    { done: hasTennis, icon: Zap, label: t('Tu estilo de juego', 'Your playing style') }
  ]

  return (
    <div className="relative bg-white rounded-2xl border border-purple-100 shadow-sm overflow-hidden">
      <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-parque-purple to-violet-500" />
      <button onClick={dismiss} className="absolute top-3 right-3 p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100" aria-label={t('Cerrar', 'Close')}>
        <X className="w-4 h-4" />
      </button>
      <div className="p-4 sm:p-5 pl-5 sm:pl-6">
        <p className="text-xs font-semibold text-parque-purple uppercase tracking-wide">
          {t('Mientras esperas el inicio', 'While you wait for the start')}
        </p>
        <h3 className="mt-1 text-base sm:text-lg font-bold text-gray-900 pr-6">
          {t('Tus rivales verán tu perfil', 'Your rivals will see your profile')}
        </h3>
        <p className="mt-1 text-sm text-gray-600">
          {t('Añade una foto, tu país y cómo juegas. Así sabrán a quién se enfrentan.', 'Add a photo, your country and how you play. So they know who they are up against.')}
        </p>

        <div className="mt-3 flex flex-wrap gap-2">
          {items.map(({ done, icon: Icon, label }) => (
            <span key={label} className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${done ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
              {done ? <Check className="w-3.5 h-3.5" /> : <Icon className="w-3.5 h-3.5" />}
              {label}
            </span>
          ))}
        </div>

        <Link
          href={`/${locale}/player/profile`}
          className="mt-4 inline-flex items-center gap-1.5 bg-parque-purple text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-parque-purple/90 active:scale-[0.98] transition-all"
        >
          {t('Completar perfil', 'Complete profile')}
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  )
}
