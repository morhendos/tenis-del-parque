'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Trophy, ChevronRight } from 'lucide-react'

const seasonNames = {
  es: { spring: 'primavera', summer: 'verano', autumn: 'otoño', winter: 'invierno' },
  en: { spring: 'spring', summer: 'summer', autumn: 'autumn', winter: 'winter' }
}

export default function NewSeasonCard({ language, locale }) {
  const [cities, setCities] = useState([])

  useEffect(() => {
    let cancelled = false
    fetch('/api/player/open-leagues')
      .then(res => (res.ok ? res.json() : null))
      .then(data => {
        if (!cancelled && data?.cities) setCities(data.cities)
      })
      .catch(() => {})
    return () => { cancelled = true }
  }, [])

  if (cities.length === 0) return null

  const es = language === 'es'
  const seasonType = cities[0]?.season?.type
  const seasonName = seasonNames[es ? 'es' : 'en'][seasonType]

  const title = seasonName
    ? (es ? `¡Llega la temporada de ${seasonName}!` : `The ${seasonName} season is coming!`)
    : (es ? '¡Llega la nueva temporada!' : 'The new season is coming!')

  const formatDate = (date) =>
    new Date(date).toLocaleDateString(es ? 'es-ES' : 'en-GB', { day: 'numeric', month: 'short' })

  return (
    <div className="bg-gradient-to-br from-parque-purple to-purple-700 rounded-2xl shadow-lg shadow-purple-500/25 p-4 sm:p-5 text-white">
      <div className="flex items-center gap-2 mb-1">
        <Trophy className="w-5 h-5 flex-shrink-0" />
        <h2 className="font-bold text-lg">{title}</h2>
      </div>
      <p className="text-sm text-white/80 mb-4">
        {es ? 'Inscripciones abiertas' : 'Registration open'}
      </p>

      <div className="space-y-2">
        {cities.map(city => {
          const cityName = city.name?.[language] || city.name?.es || city.slug
          return (
            <Link
              key={city.slug}
              href={`/${locale}/leagues/${city.slug}${city.lastLevel ? `?level=${city.lastLevel}` : ''}`}
              className="flex items-center justify-between gap-3 bg-white rounded-xl px-4 py-3 text-gray-900 hover:bg-purple-50 active:scale-[0.99] transition-all"
            >
              <div className="min-w-0">
                <p className="font-semibold truncate">{cityName}</p>
                {city.registrationEnd && (
                  <p className="text-xs text-gray-500">
                    {es
                      ? `Inscripción hasta el ${formatDate(city.registrationEnd)}`
                      : `Registration closes ${formatDate(city.registrationEnd)}`}
                  </p>
                )}
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
