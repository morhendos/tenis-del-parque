'use client'
import { useState } from 'react'
import Link from 'next/link'
import SeasonLevelSelector from './SeasonLevelSelector'

/**
 * =============================================================================
 * LEAGUE SEASON SECTION - Groups leagues by season for better UX
 * =============================================================================
 */

// Helper to generate a unique season key
function getSeasonKey(league) {
  return `${league.season?.type || 'unknown'}-${league.season?.year || 'unknown'}`
}

// Group leagues by season
function groupLeaguesBySeason(leagues) {
  const groups = {}
  
  leagues.forEach(league => {
    const key = getSeasonKey(league)
    if (!groups[key]) {
      groups[key] = {
        seasonType: league.season?.type,
        seasonYear: league.season?.year,
        leagues: []
      }
    }
    groups[key].leagues.push(league)
  })
  
  return Object.values(groups)
}

const seasonTypeNames = {
  es: { spring: 'Primavera', summer: 'Verano', autumn: 'Otoño', winter: 'Invierno', annual: 'Anual' },
  en: { spring: 'Spring', summer: 'Summer', autumn: 'Autumn', winter: 'Winter', annual: 'Annual' }
}

// Simple card for single league - ALWAYS goes to league page
function SimpleLeagueCard({ league, locale, status }) {
  const citySlug = league.city?.slug || 'unknown'
  const seasonType = seasonTypeNames[locale]?.[league.season?.type] || league.season?.type
  const seasonName = `${seasonType} ${league.season?.year || ''}`
  
  // ALWAYS go to league page
  const href = `/${locale}/${citySlug}/liga/${league.slug}`
  
  const buttonText = status === 'past'
    ? (locale === 'es' ? 'Ver Resultados' : 'View Results')
    : (locale === 'es' ? 'Abrir Liga' : 'Open League')

  return (
    <div className="bg-white rounded-lg shadow-md p-4 sm:p-5 max-w-md">
      <h3 className="text-lg font-bold text-gray-900">{league.name}</h3>
      <p className="text-sm text-gray-600 mt-1">{seasonName}</p>
      <p className="text-sm text-gray-500 mt-2">
        {league.stats?.registeredPlayers || 0} / {league.seasonConfig?.maxPlayers || 32} {locale === 'es' ? 'jugadores' : 'players'}
      </p>
      <Link
        href={href}
        className="mt-4 block w-full text-center py-2.5 px-4 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium text-sm"
      >
        {buttonText}
      </Link>
    </div>
  )
}

export default function LeagueSeasonSection({ 
  title, 
  leagues, 
  locale, 
  status,
  collapsible = false,
  showSpots = false,
  showPrice = false,
  variant = 'default'
}) {
  const [isExpanded, setIsExpanded] = useState(!collapsible)
  
  if (leagues.length === 0) return null
  
  // Group leagues by season
  const seasonGroups = groupLeaguesBySeason(leagues)
  
  return (
    <section className="mb-6 sm:mb-8 md:mb-12">
      {/* Section Header */}
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
      
      {/* Season Groups */}
      {isExpanded && (
        <div className="space-y-4 sm:space-y-6">
          {seasonGroups.map((group, index) => {
            // If this season has multiple levels, use the unified selector
            if (group.leagues.length > 1) {
              return (
                <SeasonLevelSelector
                  key={`${group.seasonType}-${group.seasonYear}-${index}`}
                  leagues={group.leagues}
                  locale={locale}
                  status={status}
                  showSpots={showSpots}
                  showPrice={showPrice}
                  variant={variant}
                />
              )
            }
            
            // Single league - show as simple card
            return (
              <SimpleLeagueCard
                key={`${group.seasonType}-${group.seasonYear}-${index}`}
                league={group.leagues[0]}
                locale={locale}
                status={status}
              />
            )
          })}
        </div>
      )}
    </section>
  )
}
