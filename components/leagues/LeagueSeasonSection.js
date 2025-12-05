'use client'
import { useState } from 'react'
import LeagueLevelCard from './LeagueLevelCard'

export default function LeagueSeasonSection({ 
  title, 
  leagues, 
  locale, 
  status,
  collapsible = false 
}) {
  const [isExpanded, setIsExpanded] = useState(!collapsible)
  
  if (leagues.length === 0) return null
  
  return (
    <section className="mb-6 sm:mb-8 md:mb-12">
      <div className="flex items-center justify-between mb-4 sm:mb-5 md:mb-6">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">{title}</h2>
        {collapsible && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base"
          >
            {isExpanded 
              ? (locale === 'es' ? 'Ocultar' : 'Hide')
              : (locale === 'es' ? 'Mostrar' : 'Show')}
            <svg 
              className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        )}
      </div>
      
      {isExpanded && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
          {leagues.map(league => (
            <LeagueLevelCard 
              key={league._id} 
              league={league} 
              locale={locale}
              status={status}
            />
          ))}
        </div>
      )}
    </section>
  )
}
