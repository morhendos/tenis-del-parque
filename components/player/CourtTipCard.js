'use client'

import { useState } from 'react'

const TIP_ID = 'court-sotogrande'

const text = {
  es: {
    title: 'Dónde jugar: Club El Faisán',
    body: 'Precio especial para partidos de la liga: 25€ por 1.5 horas (12.50€ por jugador). Llama a Lorenzo y di que es un partido de la Liga TDP.',
    call: 'Llamar a Lorenzo',
    close: 'Cerrar'
  },
  en: {
    title: 'Where to play: Club El Faisán',
    body: "Special price for league matches: 25€ for 1.5 hours (12.50€ per player). Call Lorenzo and say it's a TDP League match.",
    call: 'Call Lorenzo',
    close: 'Close'
  }
}

export default function CourtTipCard({ player, hasUpcomingMatch, language = 'es' }) {
  const [hidden, setHidden] = useState(false)
  const t = text[language] || text.es

  const inSotogrande = (player?.registrations || []).some(r =>
    ['confirmed', 'active'].includes(r.status) &&
    r.league?.status === 'active' &&
    (r.league?.location?.city || '').toLowerCase() === 'sotogrande'
  )
  const dismissed = (player?.dismissedTips || []).includes(TIP_ID)

  if (hidden || dismissed || !inSotogrande || !hasUpcomingMatch) return null

  const dismiss = () => {
    setHidden(true)
    fetch('/api/player/dismiss-tip', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tip: TIP_ID })
    }).catch(() => {})
  }

  return (
    <div className="relative bg-white rounded-xl border border-purple-100 p-4 shadow-sm">
      <button
        onClick={dismiss}
        aria-label={t.close}
        className="absolute top-2 right-2 p-1.5 text-gray-400 hover:text-gray-600 rounded-full"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      <div className="flex items-start gap-3 pr-6">
        <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center flex-shrink-0">
          <svg className="w-4 h-4 text-parque-purple" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-900">{t.title}</p>
          <p className="mt-1 text-xs text-gray-600">{t.body}</p>
          <a
            href="tel:+34617462570"
            className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-parque-purple hover:bg-purple-800 text-white text-xs font-medium rounded-lg"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            {t.call}
          </a>
        </div>
      </div>
    </div>
  )
}
