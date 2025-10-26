'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'

export default function MultiLeagueCard({ player, language }) {
  const params = useParams()
  const locale = params?.locale || 'es'
  const [selectedLeague, setSelectedLeague] = useState(0)
  
  // Get all registrations from player
  const registrations = player?.registrations || []
  
  // If no registrations, show empty state
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

  // Get season display name for a registration
  const getSeasonDisplayName = (registration) => {
    const league = registration.league
    if (!league) return language === 'es' ? 'Temporada Actual' : 'Current Season'
    
    // Season info might be in the league itself
    if (league.season) {
      const seasonNames = {
        es: {
          spring: 'Primavera',
          summer: 'Verano',
          autumn: 'Otoño',
          winter: 'Invierno',
          annual: 'Anual'
        },
        en: {
          spring: 'Spring',
          summer: 'Summer', 
          autumn: 'Autumn',
          winter: 'Winter',
          annual: 'Annual'
        }
      }
      
      const seasonType = league.season.type || 'summer'
      const seasonYear = league.season.year || 2025
      const localizedSeasonName = seasonNames[language || 'es'][seasonType] || seasonType
      return `${localizedSeasonName} ${seasonYear}`
    }
    
    return language === 'es' ? 'Temporada 2025' : 'Season 2025'
  }

  // Get level display name
  const getLevelDisplayName = (level) => {
    const levelNames = {
      es: {
        beginner: 'Principiante',
        intermediate: 'Intermedio',
        advanced: 'Avanzado'
      },
      en: {
        beginner: 'Beginner',
        intermediate: 'Intermediate',
        advanced: 'Advanced'
      }
    }
    return levelNames[language || 'es'][level] || level
  }

  // Get status badge color and text
  const getStatusBadge = (status) => {
    const statusConfig = {
      active: {
        color: 'bg-green-100 text-green-800',
        label: language === 'es' ? 'Activo' : 'Active'
      },
      confirmed: {
        color: 'bg-blue-100 text-blue-800',
        label: language === 'es' ? 'Confirmado' : 'Confirmed'
      },
      pending: {
        color: 'bg-yellow-100 text-yellow-800',
        label: language === 'es' ? 'Pendiente' : 'Pending'
      },
      waiting: {
        color: 'bg-gray-100 text-gray-800',
        label: language === 'es' ? 'En espera' : 'Waiting'
      },
      inactive: {
        color: 'bg-red-100 text-red-800',
        label: language === 'es' ? 'Inactivo' : 'Inactive'
      }
    }
    return statusConfig[status] || statusConfig.pending
  }

  const currentRegistration = registrations[selectedLeague]

  return (
    <div 
      className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden transform transition-all hover:shadow-xl animate-scale-in" 
      style={{ 
        animationDelay: '0.5s',
        animationFillMode: 'both',
        opacity: 0,
        transform: 'scale(0.9)'
      }}
    >
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-4">
        <h2 className="text-lg font-semibold text-white flex items-center">
          <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
          </svg>
          {registrations.length > 1 
            ? (language === 'es' ? 'Mis Ligas' : 'My Leagues')
            : (language === 'es' ? 'Mi Liga' : 'My League')}
          {registrations.length > 1 && (
            <span className="ml-2 px-2 py-0.5 bg-white/20 rounded-full text-sm">
              {registrations.length}
            </span>
          )}
        </h2>
      </div>

      {/* League Selector Tabs (if multiple leagues) */}
      {registrations.length > 1 && (
        <div className="border-b border-gray-200 bg-gray-50">
          <div className="flex overflow-x-auto scrollbar-hide px-6 gap-1">
            {registrations.map((reg, index) => (
              <button
                key={reg._id || index}
                onClick={() => setSelectedLeague(index)}
                className={`relative flex-shrink-0 px-4 py-3 font-medium text-sm transition-all ${
                  selectedLeague === index
                    ? 'text-emerald-700'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <div className="flex flex-col items-start">
                  <span>{reg.league?.name || `Liga ${index + 1}`}</span>
                  {reg.league?.location?.city && (
                    <span className="text-xs opacity-75 mt-0.5 flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {reg.league.location.city}
                    </span>
                  )}
                </div>
                {/* Active indicator bar */}
                {selectedLeague === index && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-green-500 to-emerald-600 rounded-t-full" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="p-6">
        <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          {/* League Info */}
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-parque-purple to-purple-700 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" strokeLinecap="round" strokeLinejoin="round"/>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 2 A10 10 0 0 1 12 22 M12 2 A10 10 0 0 0 12 22"/>
                <circle cx="12" cy="12" r="3" fill="currentColor"/>
              </svg>
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                {currentRegistration.league?.name || 'Liga'}
              </h3>
              <p className="text-sm text-gray-600">
                {language === 'es' ? 'Temporada' : 'Season'}: {getSeasonDisplayName(currentRegistration)}
              </p>
              {currentRegistration.league?.location?.city && (
                <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {currentRegistration.league.location.city}
                </p>
              )}
              
              {/* Stats Pills */}
              <div className="flex flex-wrap gap-2 mt-2">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800">
                  ELO: {player.eloRating || 1200}
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-800">
                  {language === 'es' ? 'Nivel' : 'Level'}: {getLevelDisplayName(currentRegistration.level)}
                </span>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(currentRegistration.status).color}`}>
                  {getStatusBadge(currentRegistration.status).label}
                </span>
              </div>
              
              {/* League Stats */}
              {currentRegistration.stats && (
                <div className="flex gap-4 mt-2 text-xs text-gray-600">
                  <span>
                    {language === 'es' ? 'Partidos' : 'Matches'}: {currentRegistration.stats.matchesPlayed || 0}
                  </span>
                  <span>
                    {language === 'es' ? 'Ganados' : 'Won'}: {currentRegistration.stats.matchesWon || 0}
                  </span>
                  <span>
                    {language === 'es' ? 'Puntos' : 'Points'}: {currentRegistration.stats.totalPoints || 0}
                  </span>
                </div>
              )}
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <Link
              href={`/${locale}/player/league?leagueId=${currentRegistration.league?._id}`}
              className="flex-1 sm:flex-none inline-flex items-center justify-center px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm font-medium rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-green-500/25"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              {language === 'es' ? 'Ver Clasificación' : 'View Standings'}
            </Link>
            <Link
              href={`/${locale}/player/league?leagueId=${currentRegistration.league?._id}&tab=playoffs`}
              className="flex-1 sm:flex-none inline-flex items-center justify-center px-4 py-3 bg-white border-2 border-emerald-500 text-emerald-700 text-sm font-medium rounded-xl hover:bg-emerald-50 transition-all transform hover:scale-105 active:scale-95 shadow-sm"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              {language === 'es' ? 'Ver Playoffs' : 'View Playoffs'}
            </Link>
          </div>
        </div>

        {/* Quick Navigation for Multiple Leagues */}
        {registrations.length > 1 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-600 mb-2">
              {language === 'es' ? 'Acceso rápido a otras ligas:' : 'Quick access to other leagues:'}
            </p>
            <div className="flex flex-wrap gap-2">
              {registrations.filter((_, idx) => idx !== selectedLeague).map((reg, index) => (
                <Link
                  key={reg._id || index}
                  href={`/${locale}/player/league?leagueId=${reg.league?._id}`}
                  className="inline-flex items-center px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 hover:text-emerald-800 text-xs font-medium rounded-lg transition-colors border border-emerald-200"
                >
                  {reg.league?.name}
                  <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
