'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Trophy, ChevronRight } from 'lucide-react'

export default function NewSeasonCard({ language, locale }) {
  const [leagues, setLeagues] = useState([])

  useEffect(() => {
    let cancelled = false
    fetch('/api/player/open-leagues')
      .then(res => (res.ok ? res.json() : null))
      .then(data => {
        if (!cancelled && data?.leagues) setLeagues(data.leagues)
      })
      .catch(() => {})
    return () => { cancelled = true }
  }, [])

  if (leagues.length === 0) return null

  const es = language === 'es'
  const signupPath = locale === 'es' ? 'registro' : 'signup'

  const formatDate = (date) =>
    new Date(date).toLocaleDateString(es ? 'es-ES' : 'en-GB', { day: 'numeric', month: 'short' })

  return (
    <div className="bg-gradient-to-br from-parque-purple to-purple-700 rounded-2xl shadow-lg shadow-purple-500/25 p-4 sm:p-5 text-white">
      <div className="flex items-center gap-2 mb-1">
        <Trophy className="w-5 h-5" />
        <h2 className="font-bold text-lg">
          {es ? '¡Nueva temporada abierta!' : 'New season open!'}
        </h2>
      </div>
      <p className="text-sm text-white/80 mb-4">
        {es
          ? 'Apúntate ahora y asegura tu plaza.'
          : 'Sign up now and secure your spot.'}
      </p>

      <div className="space-y-2">
        {leagues.map(league => {
          const cityName = league.city?.name?.[language] || league.city?.name?.es || ''
          return (
            <Link
              key={league._id}
              href={`/${locale}/${signupPath}/${league.slug}`}
              className="flex items-center justify-between gap-3 bg-white rounded-xl px-4 py-3 text-gray-900 hover:bg-purple-50 active:scale-[0.99] transition-all"
            >
              <div className="min-w-0">
                <p className="font-semibold truncate">
                  {league.name}{cityName ? ` - ${cityName}` : ''}
                </p>
                <p className="text-xs text-gray-500">
                  {league.startDate && (es ? `Empieza ${formatDate(league.startDate)}` : `Starts ${formatDate(league.startDate)}`)}
                  {league.price && !league.price.isFree && ` · ${league.price.amount}€`}
                  {league.spotsLeft !== null && league.spotsLeft <= 5 && (
                    <span className="text-orange-600 font-medium">
                      {es ? ` · ¡Quedan ${league.spotsLeft} plazas!` : ` · Only ${league.spotsLeft} spots left!`}
                    </span>
                  )}
                </p>
              </div>
              <span className="flex items-center gap-1 text-sm font-semibold text-parque-purple flex-shrink-0">
                {es ? 'Unirme' : 'Join'}
                <ChevronRight className="w-4 h-4" />
              </span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
