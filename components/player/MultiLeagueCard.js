'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'

// Helper to categorize leagues
function categorizeRegistrations(registrations) {
  const categories = {
    active: [],
    upcoming: [],
    past: []
  }
  
  registrations.forEach(reg => {
    const league = reg.league
    if (!league) return
    
    const status = league.status
    const playoffPhase = league.playoffConfig?.currentPhase
    
    // Active: status is 'active' OR currently in playoffs
    if (status === 'active' || 
        (playoffPhase && playoffPhase !== 'regular_season' && playoffPhase !== 'completed')) {
      categories.active.push(reg)
    }
    // Upcoming: registration open or coming soon
    else if (status === 'registration_open' || status === 'coming_soon') {
      categories.upcoming.push(reg)
    }
    // Past: completed or archived
    else if (status === 'completed' || status === 'archived') {
      categories.past.push(reg)
    }
    // Default to active if status is unclear but has matches
    else if (reg.stats?.matchesPlayed > 0) {
      categories.active.push(reg)
    }
    // Otherwise upcoming
    else {
      categories.upcoming.push(reg)
    }
  })
  
  return categories
}

// Collapsible Section Component
function LeagueSection({ 
  title, 
  icon, 
  count, 
  children, 
  defaultExpanded = true,
  headerGradient = 'from-gray-500 to-gray-600',
  emptyMessage,
  language 
}) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)
  
  return (
    <div className="overflow-hidden">
      {/* Section Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-full flex items-center justify-between px-4 py-3 bg-gradient-to-r ${headerGradient} rounded-xl text-white transition-all hover:opacity-95 active:scale-[0.99]`}
      >
        <div className="flex items-center gap-2">
          {icon}
          <span className="font-semibold">{title}</span>
          {count > 0 && (
            <span className="px-2 py-0.5 bg-white/20 rounded-full text-sm">
              {count}
            </span>
          )}
        </div>
        <svg 
          className={`w-5 h-5 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {/* Section Content */}
      <div 
        className={`transition-all duration-300 ease-in-out ${
          isExpanded ? 'max-h-[2000px] opacity-100 mt-3' : 'max-h-0 opacity-0 overflow-hidden'
        }`}
      >
        {count === 0 ? (
          <div className="text-center py-6 px-4 bg-gray-50 rounded-xl border border-gray-200">
            <p className="text-gray-500 text-sm">{emptyMessage}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {children}
          </div>
        )}
      </div>
    </div>
  )
}

// Active League Card
function ActiveLeagueCard({ registration, language, locale, player }) {
  const league = registration.league
  const stats = registration.stats || {}
  const playoffStats = registration.playoffStats || {}
  const isInPlayoffs = registration.playoffStats?.matchesPlayed > 0 || 
                       league?.playoffConfig?.currentPhase !== 'regular_season'
  
  const getSeasonDisplayName = () => {
    if (league?.season) {
      const seasonNames = {
        es: { spring: 'Primavera', summer: 'Verano', autumn: 'Otoño', winter: 'Invierno', annual: 'Anual' },
        en: { spring: 'Spring', summer: 'Summer', autumn: 'Autumn', winter: 'Winter', annual: 'Annual' }
      }
      const seasonType = league.season.type || 'summer'
      const seasonYear = league.season.year || 2025
      return `${seasonNames[language]?.[seasonType] || seasonType} ${seasonYear}`
    }
    return '2025'
  }

  const getLevelDisplayName = (level) => {
    const levelNames = {
      es: { beginner: 'Principiante', intermediate: 'Intermedio', advanced: 'Avanzado' },
      en: { beginner: 'Beginner', intermediate: 'Intermediate', advanced: 'Advanced' }
    }
    return levelNames[language]?.[level] || level
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {/* Card Header */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-white text-lg">{league?.name || 'Liga'}</h3>
            <p className="text-green-100 text-sm">{getSeasonDisplayName()}</p>
          </div>
          {isInPlayoffs && (
            <span className="px-2 py-1 bg-amber-400 text-amber-900 text-xs font-bold rounded-full flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              Playoffs
            </span>
          )}
        </div>
      </div>
      
      {/* Card Body */}
      <div className="p-4">
        {/* Status Pills */}
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            ELO: {player?.eloRating || 1200}
          </span>
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
            {getLevelDisplayName(registration.level)}
          </span>
          {league?.location?.city && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
              {league.location.city}
            </span>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="text-center p-2 bg-gray-50 rounded-lg">
            <div className="text-xl font-bold text-gray-900">{stats.matchesPlayed || 0}</div>
            <div className="text-xs text-gray-500">{language === 'es' ? 'Partidos' : 'Matches'}</div>
          </div>
          <div className="text-center p-2 bg-gray-50 rounded-lg">
            <div className="text-xl font-bold text-green-600">{stats.matchesWon || 0}</div>
            <div className="text-xs text-gray-500">{language === 'es' ? 'Ganados' : 'Won'}</div>
          </div>
          <div className="text-center p-2 bg-gray-50 rounded-lg">
            <div className="text-xl font-bold text-emerald-600">{stats.totalPoints || 0}</div>
            <div className="text-xs text-gray-500">{language === 'es' ? 'Puntos' : 'Points'}</div>
          </div>
        </div>

        {/* Playoff Stats (if in playoffs) */}
        {isInPlayoffs && (playoffStats.matchesPlayed > 0) && (
          <div className="mb-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
            <p className="text-xs font-semibold text-amber-800 mb-2 flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              {language === 'es' ? 'Playoffs' : 'Playoffs'}
            </p>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <div className="font-bold text-gray-900">{playoffStats.matchesPlayed || 0}</div>
                <div className="text-xs text-gray-500">{language === 'es' ? 'Partidos' : 'Matches'}</div>
              </div>
              <div>
                <div className="font-bold text-amber-700">{playoffStats.matchesWon || 0}</div>
                <div className="text-xs text-gray-500">{language === 'es' ? 'Ganados' : 'Won'}</div>
              </div>
              <div>
                <div className="font-bold text-amber-600">{playoffStats.totalPoints || 0}</div>
                <div className="text-xs text-gray-500">{language === 'es' ? 'Puntos' : 'Points'}</div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Link
            href={`/${locale}/player/league?leagueId=${league?._id}`}
            className="flex-1 inline-flex items-center justify-center px-3 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm font-medium rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all active:scale-[0.98]"
          >
            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            {language === 'es' ? 'Clasificación' : 'Standings'}
          </Link>
          <Link
            href={`/${locale}/player/league?leagueId=${league?._id}&tab=playoffs`}
            className="flex-1 inline-flex items-center justify-center px-3 py-2.5 bg-white border border-emerald-500 text-emerald-700 text-sm font-medium rounded-lg hover:bg-emerald-50 transition-all active:scale-[0.98]"
          >
            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            Playoffs
          </Link>
        </div>
      </div>
    </div>
  )
}

// Upcoming League Card
function UpcomingLeagueCard({ registration, language, locale }) {
  const league = registration.league
  const isRegistrationOpen = league?.status === 'registration_open'
  
  const getSeasonDisplayName = () => {
    if (league?.season) {
      const seasonNames = {
        es: { spring: 'Primavera', summer: 'Verano', autumn: 'Otoño', winter: 'Invierno', annual: 'Anual' },
        en: { spring: 'Spring', summer: 'Summer', autumn: 'Autumn', winter: 'Winter', annual: 'Annual' }
      }
      const seasonType = league.season.type || 'summer'
      const seasonYear = league.season.year || 2025
      return `${seasonNames[language]?.[seasonType] || seasonType} ${seasonYear}`
    }
    return '2025'
  }

  const formatDate = (dateString) => {
    if (!dateString) return null
    const date = new Date(dateString)
    return date.toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
      {/* Card Header */}
      <div className="bg-gradient-to-r from-parque-purple to-purple-700 px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-white text-lg">{league?.name || 'Liga'}</h3>
            <p className="text-purple-200 text-sm">{getSeasonDisplayName()}</p>
          </div>
          <span className={`px-2 py-1 text-xs font-bold rounded-full ${
            isRegistrationOpen 
              ? 'bg-green-400 text-green-900' 
              : 'bg-purple-300 text-purple-900'
          }`}>
            {isRegistrationOpen 
              ? (language === 'es' ? 'Inscripción Abierta' : 'Registration Open')
              : (language === 'es' ? 'Próximamente' : 'Coming Soon')}
          </span>
        </div>
      </div>
      
      {/* Card Body */}
      <div className="p-4">
        {/* Info */}
        <div className="space-y-2 mb-4">
          {league?.location?.city && (
            <div className="flex items-center text-sm text-gray-600">
              <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
              {league.location.city}
            </div>
          )}
          {league?.seasonConfig?.startDate && (
            <div className="flex items-center text-sm text-gray-600">
              <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {language === 'es' ? 'Inicio: ' : 'Starts: '}{formatDate(league.seasonConfig.startDate)}
            </div>
          )}
          {!isRegistrationOpen && league?.expectedLaunchDate && (
            <div className="flex items-center text-sm text-gray-600">
              <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {language === 'es' ? 'Apertura: ' : 'Opens: '}{formatDate(league.expectedLaunchDate)}
            </div>
          )}
        </div>

        {/* Registration Status */}
        <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg mb-4">
          <span className="text-sm text-purple-700">
            {language === 'es' ? 'Estado de inscripción' : 'Registration status'}
          </span>
          <span className={`text-sm font-medium ${registration.status === 'confirmed' ? 'text-green-600' : 'text-purple-600'}`}>
            {registration.status === 'confirmed' 
              ? (language === 'es' ? '✓ Confirmado' : '✓ Confirmed')
              : (language === 'es' ? 'Pendiente' : 'Pending')}
          </span>
        </div>

        {/* Action Button */}
        <Link
          href={`/${locale}/player/league?leagueId=${league?._id}`}
          className="w-full inline-flex items-center justify-center px-3 py-2.5 bg-gradient-to-r from-parque-purple to-purple-700 text-white text-sm font-medium rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all active:scale-[0.98]"
        >
          <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {language === 'es' ? 'Ver Detalles' : 'View Details'}
        </Link>
      </div>
    </div>
  )
}

// Past League Card
function PastLeagueCard({ registration, language, locale }) {
  const league = registration.league
  const stats = registration.stats || {}
  
  const getSeasonDisplayName = () => {
    if (league?.season) {
      const seasonNames = {
        es: { spring: 'Primavera', summer: 'Verano', autumn: 'Otoño', winter: 'Invierno', annual: 'Anual' },
        en: { spring: 'Spring', summer: 'Summer', autumn: 'Autumn', winter: 'Winter', annual: 'Annual' }
      }
      const seasonType = league.season.type || 'summer'
      const seasonYear = league.season.year || 2025
      return `${seasonNames[language]?.[seasonType] || seasonType} ${seasonYear}`
    }
    return '2025'
  }

  // Calculate win rate
  const winRate = stats.matchesPlayed > 0 
    ? Math.round((stats.matchesWon / stats.matchesPlayed) * 100) 
    : 0

  return (
    <div className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
      {/* Card Header - Muted */}
      <div className="bg-gradient-to-r from-gray-400 to-gray-500 px-4 py-2.5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-white">{league?.name || 'Liga'}</h3>
            <p className="text-gray-200 text-xs">{getSeasonDisplayName()}</p>
          </div>
          <span className="px-2 py-0.5 bg-gray-300 text-gray-700 text-xs font-medium rounded-full">
            {language === 'es' ? 'Completada' : 'Completed'}
          </span>
        </div>
      </div>
      
      {/* Card Body - Compact */}
      <div className="p-3">
        {/* Stats Row */}
        <div className="flex items-center justify-between text-sm mb-3">
          <div className="flex items-center gap-4">
            <span className="text-gray-600">
              <span className="font-semibold text-gray-900">{stats.matchesPlayed || 0}</span>
              {' '}{language === 'es' ? 'partidos' : 'matches'}
            </span>
            <span className="text-gray-600">
              <span className="font-semibold text-green-600">{stats.matchesWon || 0}</span>
              {' '}{language === 'es' ? 'ganados' : 'won'}
            </span>
          </div>
          <span className="text-gray-500 text-xs">
            {winRate}% {language === 'es' ? 'victorias' : 'win rate'}
          </span>
        </div>

        {/* Final Position if available */}
        {registration.finalPosition && (
          <div className="flex items-center gap-2 p-2 bg-white rounded-lg border border-gray-200 mb-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
              registration.finalPosition === 1 ? 'bg-amber-100 text-amber-700' :
              registration.finalPosition === 2 ? 'bg-gray-200 text-gray-700' :
              registration.finalPosition === 3 ? 'bg-orange-100 text-orange-700' :
              'bg-gray-100 text-gray-600'
            }`}>
              {registration.finalPosition}º
            </div>
            <span className="text-sm text-gray-600">
              {language === 'es' ? 'Posición final' : 'Final position'}
            </span>
          </div>
        )}

        {/* Action Button - Subtle */}
        <Link
          href={`/${locale}/player/league?leagueId=${league?._id}`}
          className="w-full inline-flex items-center justify-center px-3 py-2 bg-white border border-gray-300 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-100 transition-all"
        >
          <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          {language === 'es' ? 'Ver Historial' : 'View History'}
        </Link>
      </div>
    </div>
  )
}

// Section Icons
const ActiveIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="3" fill="currentColor"/>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
  </svg>
)

const UpcomingIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
)

const PastIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
  </svg>
)

// Main Component
export default function MultiLeagueCard({ player, language }) {
  const params = useParams()
  const locale = params?.locale || 'es'
  
  // Get all registrations from player
  const registrations = player?.registrations || []
  
  // Categorize registrations
  const categories = useMemo(() => categorizeRegistrations(registrations), [registrations])
  
  // If no registrations at all, show empty state
  if (!registrations.length) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-gray-400 to-gray-500 px-6 py-4">
          <h2 className="text-lg font-semibold text-white flex items-center">
            <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
            {language === 'es' ? 'Mis Ligas' : 'My Leagues'}
          </h2>
        </div>
        <div className="p-8 text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" strokeLinecap="round" strokeLinejoin="round"/>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 2 A10 10 0 0 1 12 22 M12 2 A10 10 0 0 0 12 22"/>
              <circle cx="12" cy="12" r="3" fill="currentColor"/>
            </svg>
          </div>
          <p className="text-gray-600 mb-4">
            {language === 'es' 
              ? 'No estás registrado en ninguna liga actualmente' 
              : 'You are not registered in any leagues currently'}
          </p>
          <Link
            href={`/${locale}/leagues`}
            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-parque-purple to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all"
          >
            {language === 'es' ? 'Explorar Ligas' : 'Explore Leagues'}
          </Link>
        </div>
      </div>
    )
  }

  const totalCount = registrations.length

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      {/* Main Header */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-4">
        <h2 className="text-lg font-semibold text-white flex items-center">
          <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
          </svg>
          {language === 'es' ? 'Mis Ligas' : 'My Leagues'}
          <span className="ml-2 px-2 py-0.5 bg-white/20 rounded-full text-sm">
            {totalCount}
          </span>
        </h2>
      </div>

      {/* Sections */}
      <div className="p-4 space-y-4">
        {/* Active Leagues - Always first, collapsed by default to reduce noise */}
        {(categories.active.length > 0 || categories.upcoming.length === 0 && categories.past.length === 0) && (
          <LeagueSection
            title={language === 'es' ? 'Ligas Activas' : 'Active Leagues'}
            icon={<ActiveIcon />}
            count={categories.active.length}
            defaultExpanded={false}
            headerGradient="from-green-500 to-emerald-600"
            emptyMessage={language === 'es' 
              ? 'No tienes ligas activas. ¡Únete a una!' 
              : 'No active leagues. Join one!'}
            language={language}
          >
            {categories.active.map((reg) => (
              <ActiveLeagueCard
                key={reg._id}
                registration={reg}
                language={language}
                locale={locale}
                player={player}
              />
            ))}
          </LeagueSection>
        )}

        {/* Upcoming Leagues - Second, collapsed by default */}
        {categories.upcoming.length > 0 && (
          <LeagueSection
            title={language === 'es' ? 'Próximas Ligas' : 'Upcoming Leagues'}
            icon={<UpcomingIcon />}
            count={categories.upcoming.length}
            defaultExpanded={false}
            headerGradient="from-parque-purple to-purple-700"
            emptyMessage={language === 'es' 
              ? 'No hay ligas próximas por el momento.' 
              : 'No upcoming leagues at the moment.'}
            language={language}
          >
            {categories.upcoming.map((reg) => (
              <UpcomingLeagueCard
                key={reg._id}
                registration={reg}
                language={language}
                locale={locale}
              />
            ))}
          </LeagueSection>
        )}

        {/* Past Leagues - Last, collapsed by default */}
        {categories.past.length > 0 && (
          <LeagueSection
            title={language === 'es' ? 'Ligas Pasadas' : 'Past Leagues'}
            icon={<PastIcon />}
            count={categories.past.length}
            defaultExpanded={false}
            headerGradient="from-gray-400 to-gray-500"
            emptyMessage={language === 'es' 
              ? 'Aún no has completado ninguna liga.' 
              : "You haven't completed any leagues yet."}
            language={language}
          >
            {categories.past.map((reg) => (
              <PastLeagueCard
                key={reg._id}
                registration={reg}
                language={language}
                locale={locale}
              />
            ))}
          </LeagueSection>
        )}

        {/* Explore More Link */}
        <div className="pt-2 border-t border-gray-100">
          <Link
            href={`/${locale}/leagues`}
            className="flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-parque-purple transition-colors py-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {language === 'es' ? 'Explorar más ligas' : 'Explore more leagues'}
          </Link>
        </div>
      </div>
    </div>
  )
}
