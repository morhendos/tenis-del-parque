'use client'
import { useState } from 'react'
import SeasonLevelSelector from './SeasonLevelSelector'
import LeagueLevelCard from './LeagueLevelCard'

/**
 * =============================================================================
 * LEAGUE SEASON SECTION - Groups leagues by season for better UX
 * =============================================================================
 * 
 * This component groups leagues by season (e.g., "Winter 2026") and displays
 * them using SeasonLevelSelector for a unified experience.
 * 
 * If a season has multiple skill levels (Gold, Silver, Bronze), they're shown
 * as ONE card with level options instead of 3 separate cards.
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
            
            // Single league - show as individual card (for special cases)
            // But wrap it in a container for consistent spacing
            return (
              <div 
                key={`${group.seasonType}-${group.seasonYear}-${index}`}
                className="max-w-md"
              >
                <LeagueLevelCard 
                  league={group.leagues[0]} 
                  locale={locale}
                  status={status}
                />
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
