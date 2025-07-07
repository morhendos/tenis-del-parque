'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useLanguage } from '../../../lib/hooks/useLanguage'

// EXACT SAME WORKING COMPONENT FROM PUBLIC PAGE
function StandingsTable({ players, language, unified = false }) {
  const getPositionStyle = (position) => {
    // Playoff A qualification (positions 1-8)
    if (position <= 8) return "bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200 shadow-blue-100"
    // Playoff B qualification (positions 9-16)  
    if (position <= 16) return "bg-gradient-to-r from-green-50 to-green-100 border-green-200 shadow-green-100"
    // Not qualified for playoffs
    return "bg-white border-gray-200 shadow-gray-100"
  }

  const getPositionBadgeStyle = (position) => {
    // Playoff A qualification (positions 1-8)
    if (position <= 8) return 'bg-blue-500 text-white'
    // Playoff B qualification (positions 9-16)
    if (position <= 16) return 'bg-green-500 text-white'
    // Not qualified for playoffs
    return 'bg-gray-400 text-white'
  }

  const getPositionLabel = (position) => {
    if (position <= 8) return language === 'es' ? 'Playoff A' : 'Playoff A'
    if (position <= 16) return language === 'es' ? 'Playoff B' : 'Playoff B'
    return language === 'es' ? 'Liga' : 'League' // More neutral than "Eliminated"
  }

  const getWinPercentage = (won, total) => {
    if (total === 0) return 0
    return Math.round((won / total) * 100)
  }

  // Helper function to get player status styling
  const getPlayerStatusStyle = (player) => {
    const isActive = player.status === 'active'
    return isActive 
      ? 'opacity-100' 
      : 'opacity-50 bg-gray-50' // Make pending/confirmed (invited but not activated) players transparent with gray background
  }

  // Helper function to get player status indicator
  const getPlayerStatusIndicator = (player) => {
    if (player.status === 'active' || player.status === 'confirmed') {
      return null // No indicator for active players
    }
    return (
      <span className="ml-2 px-2 py-1 text-xs rounded-full bg-gray-200 text-gray-600">
        {player.status}
      </span>
    )
  }

  return (
    <div className="overflow-x-auto">
      {/* Mobile-first card layout for small screens */}
      <div className="block md:hidden space-y-4">
        {players.map((standing, index) => {
          const winPercentage = getWinPercentage(standing.stats.matchesWon, standing.stats.matchesPlayed)
          
          return (
            <div 
              key={standing.player._id} 
              className={`${getPositionStyle(standing.position)} ${getPlayerStatusStyle(standing.player)} rounded-xl p-3 shadow-lg border transition-all duration-300 hover:shadow-xl hover:scale-[1.02]`}
            >
              {/* Header with position and points */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  {/* Position with playoff qualification styling */}
                  <div className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${getPositionBadgeStyle(standing.position)}`}>
                      {standing.position}
                    </div>
                    {/* Playoff qualification indicator - only show for playoff positions */}
                    {standing.position <= 16 && (
                      <div className="ml-2 text-xs">
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                          standing.position <= 8 ? 'bg-blue-100 text-blue-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {getPositionLabel(standing.position)}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Points with playoff zone styling */}
                <div className="text-right">
                  <div className={`text-2xl font-bold ${
                    standing.position <= 8 ? 'text-blue-600' :
                    standing.position <= 16 ? 'text-green-600' :
                    'text-gray-600'
                  }`}>
                    {standing.stats.totalPoints || 0}
                  </div>
                  <div className="text-xs text-gray-500 font-medium">{language === 'es' ? 'puntos' : 'points'}</div>
                </div>
              </div>

              {/* Player name on separate row */}
              <div className="mb-3 text-center">
                <div className="text-lg font-bold text-gray-900 mb-1 flex items-center justify-center">
                  {standing.player.name}
                  {getPlayerStatusIndicator(standing.player)}
                </div>
                {winPercentage > 0 && (
                  <div className="text-sm text-gray-500">
                    {winPercentage}% {language === 'es' ? 'victorias' : 'wins'}
                  </div>
                )}
              </div>

              {/* Win percentage bar */}
              {standing.stats.matchesPlayed > 0 && (
                <div className="mb-3">
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>{language === 'es' ? 'Progreso' : 'Progress'}</span>
                    <span>{winPercentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-500 ${
                        winPercentage >= 75 ? 'bg-green-500' :
                        winPercentage >= 50 ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}
                      style={{ width: `${winPercentage}%` }}
                    ></div>
                  </div>
                </div>
              )}
              
              {/* Enhanced stats grid - More compact for mobile */}
              <div className="grid grid-cols-4 gap-1 text-sm">
                <div className="text-center bg-white/50 rounded-lg p-2 border border-white/20">
                  <div className="font-bold text-gray-900 text-base">{standing.stats.matchesPlayed}</div>
                  <div className="text-xs text-gray-600 font-medium">{language === 'es' ? 'P.J.' : 'MP'}</div>
                </div>
                <div className="text-center bg-white/50 rounded-lg p-2 border border-white/20">
                  <div className="font-bold text-green-600 text-base">{standing.stats.matchesWon}</div>
                  <div className="text-xs text-gray-600 font-medium">{language === 'es' ? 'P.G.' : 'MW'}</div>
                </div>
                <div className="text-center bg-white/50 rounded-lg p-2 border border-white/20">
                  <div className="font-bold text-gray-900 text-base">
                    {standing.stats.setsWon}-{standing.stats.setsLost}
                  </div>
                  <div className="text-xs text-gray-600 font-medium">{language === 'es' ? 'Sets' : 'Sets'}</div>
                </div>
                <div className="text-center bg-white/50 rounded-lg p-2 border border-white/20">
                  <div className="font-bold text-gray-900 text-base">
                    {standing.stats.gamesWon || 0}-{standing.stats.gamesLost || 0}
                  </div>
                  <div className="text-xs text-gray-600 font-medium">{language === 'es' ? 'Juegos' : 'Games'}</div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Desktop table layout - Enhanced */}
      <div className="hidden md:block">
        <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-lg">
          <table className="w-full divide-y divide-gray-200" style={{ minWidth: '1100px' }}>
            <thead className="bg-gradient-to-r from-parque-purple to-parque-purple/90">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                  {language === 'es' ? 'Posición' : 'Position'}
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider w-48">
                  {language === 'es' ? 'Jugador' : 'Player'}
                </th>
                <th className="px-6 py-4 text-center text-xs font-bold text-white uppercase tracking-wider">
                  {language === 'es' ? 'Clasificación' : 'Qualification'}
                </th>
                <th className="px-6 py-4 text-center text-xs font-bold text-white uppercase tracking-wider">
                  {language === 'es' ? 'Puntos' : 'Points'}
                </th>
                <th className="px-6 py-4 text-center text-xs font-bold text-white uppercase tracking-wider">
                  {language === 'es' ? 'Partidos' : 'Matches'}
                </th>
                <th className="px-6 py-4 text-center text-xs font-bold text-white uppercase tracking-wider">
                  {language === 'es' ? 'Victorias' : 'Wins'}
                </th>
                <th className="px-6 py-4 text-center text-xs font-bold text-white uppercase tracking-wider">
                  {language === 'es' ? 'Sets' : 'Sets'}
                </th>
                <th className="px-6 py-4 text-center text-xs font-bold text-white uppercase tracking-wider">
                  {language === 'es' ? 'Juegos' : 'Games'}
                </th>
                <th className="px-6 py-4 text-center text-xs font-bold text-white uppercase tracking-wider">
                  {language === 'es' ? 'Progreso' : 'Progress'}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {players.map((standing, index) => {
                const winPercentage = getWinPercentage(standing.stats.matchesWon, standing.stats.matchesPlayed)
                const rowBg = getPositionStyle(standing.position)
                            
                return (
                  <tr key={standing.player._id} className={`${rowBg} ${getPlayerStatusStyle(standing.player)} hover:shadow-md hover:scale-[1.01] transition-all duration-200`}>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm mr-3 ${getPositionBadgeStyle(standing.position)}`}>
                          {standing.position}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-parque-purple text-white flex items-center justify-center text-sm font-bold mr-3">
                          {standing.player.name.charAt(0)}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-gray-900 flex items-center">
                            {standing.player.name}
                            {getPlayerStatusIndicator(standing.player)}
                          </div>
                          {winPercentage > 0 && (
                            <div className="text-xs text-gray-500">
                              {winPercentage}% {language === 'es' ? 'victorias' : 'wins'}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-center">
                      {standing.position <= 16 ? (
                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          standing.position <= 8 ? 'bg-blue-100 text-blue-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {getPositionLabel(standing.position)}
                        </div>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-center">
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-lg font-bold ${
                        standing.position <= 8 ? 'bg-blue-200 text-blue-800' :
                        standing.position <= 16 ? 'bg-green-200 text-green-800' :
                        'bg-gray-200 text-gray-800'
                      }`}>
                        {standing.stats.totalPoints || 0}
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-center">
                      <div className="text-sm font-medium text-gray-900">
                        {standing.stats.matchesPlayed}
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center space-x-1">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {standing.stats.matchesWon}
                        </span>
                        <span className="text-gray-400">-</span>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          {standing.stats.matchesLost}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-center">
                      <div className="text-sm font-medium text-gray-900">
                        <span className="text-green-600">{standing.stats.setsWon}</span>
                        <span className="text-gray-400 mx-1">-</span>
                        <span className="text-red-600">{standing.stats.setsLost}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-center">
                      <div className="text-sm font-medium text-gray-900">
                        <span className="text-green-600">{standing.stats.gamesWon || 0}</span>
                        <span className="text-gray-400 mx-1">-</span>
                        <span className="text-red-600">{standing.stats.gamesLost || 0}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-center w-32">
                      <div className="flex items-center justify-center space-x-3">
                        <div className="flex-1 bg-gray-200 rounded-full h-3 min-w-[60px]">
                          <div 
                            className={`h-3 rounded-full transition-all duration-500 ${
                              winPercentage >= 75 ? 'bg-green-500' :
                              winPercentage >= 50 ? 'bg-yellow-500' :
                              'bg-red-500'
                            }`}
                            style={{ width: `${winPercentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-700 min-w-[2.5rem]">
                          {winPercentage}%
                        </span>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default function PlayerLeague() {
  const [activeTab, setActiveTab] = useState('standings')
  const [standings, setStandings] = useState(null)
  const [matches, setMatches] = useState([])
  const [schedule, setSchedule] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [player, setPlayer] = useState(null)
  const [currentRound, setCurrentRound] = useState(1)
  const [totalRounds, setTotalRounds] = useState(8)
  const { language, setLanguage, isLanguageLoaded } = useLanguage()
  const router = useRouter()

  // Helper functions for schedule functionality
  const getCurrentRoundMatches = () => {
    return schedule.filter(match => match.round === currentRound)
  }

  const getAvailableRounds = () => {
    const roundsWithMatches = [...new Set(schedule.map(match => match.round))].sort((a, b) => a - b)
    const allRounds = Array.from({ length: totalRounds }, (_, i) => i + 1)
    return allRounds.map(round => ({
      round,
      hasMatches: roundsWithMatches.includes(round),
      matchCount: schedule.filter(match => match.round === round).length
    }))
  }

  const formatDateForDisplay = (date, showTime = false) => {
    if (!date) return null
    
    const dateObj = new Date(date)
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(today.getDate() + 1)
    
    const isToday = dateObj.toDateString() === today.toDateString()
    const isTomorrow = dateObj.toDateString() === tomorrow.toDateString()
    
    if (isToday) {
      return language === 'es' ? 'Hoy' : 'Today'
    } else if (isTomorrow) {
      return language === 'es' ? 'Mañana' : 'Tomorrow'
    } else {
      return dateObj.toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric'
      })
    }
  }

  const fetchPlayerAndLeague = useCallback(async () => {
    try {
      setLoading(true)
      
      // Get player data first
      const playerRes = await fetch('/api/player/profile', {
        credentials: 'include'
      })
      
      if (!playerRes.ok) {
        if (playerRes.status === 401) {
          router.push('/login')
          return
        }
        const errorData = await playerRes.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to fetch player data')
      }
      
      const playerData = await playerRes.json()
      setPlayer(playerData.player)
      
      if (playerData.player?.league) {
        // Use EXACT SAME LOGIC as public page
        const location = playerData.player.league.slug || 'sotogrande'
        const seasonDisplayName = playerData.player.season || 'Verano 2025'
        
        console.log('Fetching with same logic as public page:', { location, seasonDisplayName })
        
        // Sync language from user preferences with the global language state
        if (playerData.user?.preferences?.language) {
          setLanguage(playerData.user.preferences.language)
        }

        // EXACT SAME API CALLS as public page
        const standingsRes = await fetch(`/api/leagues/${location}/standings?season=${seasonDisplayName}`)
        if (standingsRes.ok) {
          const standingsData = await standingsRes.json()
          setStandings(standingsData)
        }
        
        const matchesRes = await fetch(`/api/leagues/${location}/matches?season=${seasonDisplayName}&status=completed&limit=10`)
        if (matchesRes.ok) {
          const matchesData = await matchesRes.json()
          setMatches(matchesData.matches || [])
        }
        
        const scheduleRes = await fetch(`/api/leagues/${location}/matches?season=${seasonDisplayName}&status=scheduled&limit=50`)
        if (scheduleRes.ok) {
          const scheduleData = await scheduleRes.json()
          setSchedule(scheduleData.matches || [])
        }
      }
    } catch (error) {
      console.error('Error fetching league data:', error)
      setError(error.message || 'Failed to load league data')
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => {
    fetchPlayerAndLeague()
  }, [fetchPlayerAndLeague])

  const tabs = [
    { id: 'standings', label: language === 'es' ? 'Clasificación' : 'Standings', icon: '📊' },
    { id: 'schedule', label: language === 'es' ? 'Calendario' : 'Schedule', icon: '📅' },
    { id: 'results', label: language === 'es' ? 'Resultados' : 'Results', icon: '🏆' }
  ]

  // Show loading until both language and data are loaded to prevent flickering
  if (!isLanguageLoaded || loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-parque-purple mx-auto"></div>
          <p className="mt-4 text-gray-600">
            {language === 'es' ? 'Cargando datos de la liga...' : 'Loading league data...'}
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
          <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-red-600 font-medium">{error}</p>
          <div className="mt-4 space-y-2">
            <button 
              onClick={fetchPlayerAndLeague}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Intentar de nuevo
            </button>
            <button 
              onClick={() => router.push('/login')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors ml-2"
            >
              Ir al login
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!player?.league) {
    return (
      <div className="text-center py-12">
        <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
          <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No tienes liga asignada</h3>
        <p className="text-gray-500 mb-6">Actualmente no estás asignado a ninguna liga.</p>
        <button
          onClick={() => router.push('/leagues')}
          className="inline-flex items-center px-4 py-2 bg-parque-purple text-white rounded-lg hover:bg-parque-purple/90 transition-colors"
        >
          Explorar ligas disponibles
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* League Header */}
      <div className="bg-gradient-to-r from-parque-purple via-purple-600 to-indigo-600 rounded-xl shadow-lg overflow-hidden">
        <div className="px-6 py-8 sm:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center space-x-4">
              <div>
                <h1 className="text-3xl font-bold text-white">{player.league.name}</h1>
                <p className="text-purple-100 mt-1">Temporada: {player.season}</p>
                <p className="text-purple-200 text-sm mt-1">Tu ELO: {player.stats?.eloRating || 1200}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 px-6 py-4 text-sm font-medium transition-colors duration-200 ${
                  activeTab === tab.id
                    ? 'text-parque-purple border-b-2 border-parque-purple bg-purple-50'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <span className="text-lg">{tab.icon}</span>
                  <span>{tab.label}</span>
                </div>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'standings' && (
            <div>
              {standings && standings.unifiedStandings && standings.unifiedStandings.length > 0 ? (
                <>
                  <StandingsTable 
                    players={standings.unifiedStandings} 
                    language={language}
                    unified={true}
                  />
                  
                  {/* Playoff Explanation Section */}
                  <div className="mt-8 space-y-6">
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                          <span className="text-xl">ℹ️</span>
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">
                            {language === 'es' ? 'Sistema de Playoffs' : 'Playoff System'}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {language === 'es' ? 'Clasificación para la fase final' : 'Qualification for the final phase'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white rounded-xl p-4 border border-blue-200">
                          <div className="flex items-center space-x-3 mb-3">
                            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                              <span className="text-white font-bold text-sm">A</span>
                            </div>
                            <h4 className="text-lg font-semibold text-blue-800">Playoff A</h4>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">
                            {language === 'es' ? (
                              <>
                                <strong>Posiciones 1-8:</strong> Los 8 mejores jugadores clasifican al Playoff A, 
                                donde compiten por el título de campeón de la liga.
                              </>
                            ) : (
                              <>
                                <strong>Positions 1-8:</strong> The top 8 players qualify for Playoff A, 
                                where they compete for the league championship title.
                              </>
                            )}
                          </p>
                          <div className="bg-blue-50 rounded-lg p-3">
                            <p className="text-xs text-blue-700">
                              🏆 <strong>{language === 'es' ? 'Premio:' : 'Prize:'}</strong> {language === 'es' ? 'Campeón de Liga + Mayor puntuación ELO' : 'League Champion + Higher ELO Rating'}
                            </p>
                          </div>
                        </div>
                        
                        <div className="bg-white rounded-xl p-4 border border-green-200">
                          <div className="flex items-center space-x-3 mb-3">
                            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                              <span className="text-white font-bold text-sm">B</span>
                            </div>
                            <h4 className="text-lg font-semibold text-green-800">Playoff B</h4>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">
                            {language === 'es' ? (
                              <>
                                <strong>Posiciones 9-16:</strong> Los siguientes 8 jugadores clasifican al Playoff B, 
                                una competición paralela con sus propios premios.
                              </>
                            ) : (
                              <>
                                <strong>Positions 9-16:</strong> The next 8 players qualify for Playoff B, 
                                a parallel competition with its own prizes.
                              </>
                            )}
                          </p>
                          <div className="bg-green-50 rounded-lg p-3">
                            <p className="text-xs text-green-700">
                              🥉 <strong>{language === 'es' ? 'Premio:' : 'Prize:'}</strong> {language === 'es' ? 'Campeón Playoff B + Puntos ELO adicionales' : 'Playoff B Champion + Additional ELO Points'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Swiss System Explanation */}
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-10 h-10 bg-parque-purple rounded-xl flex items-center justify-center">
                          <span className="text-xl">🎾</span>
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">
                            {language === 'es' ? 'Sistema Suizo' : 'Swiss System'}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {language === 'es' ? 'Cómo funciona la temporada regular' : 'How the regular season works'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white rounded-lg p-4">
                          <h4 className="font-semibold text-gray-900 mb-2">
                            📊 {language === 'es' ? 'Emparejamientos' : 'Pairings'}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {language === 'es' ? 
                              'Los jugadores se emparejan según su ranking ELO, asegurando partidos equilibrados y competitivos.' :
                              'Players are paired according to their ELO ranking, ensuring balanced and competitive matches.'
                            }
                          </p>
                        </div>
                        
                        <div className="bg-white rounded-lg p-4">
                          <h4 className="font-semibold text-gray-900 mb-2">
                            🏆 {language === 'es' ? 'Puntuación' : 'Scoring'}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {language === 'es' ? 
                              'Los puntos se asignan por victorias, y el ranking ELO se actualiza tras cada partido jugado.' :
                              'Points are awarded for wins, and the ELO ranking is updated after each match played.'
                            }
                          </p>
                        </div>
                        
                        <div className="bg-white rounded-lg p-4">
                          <h4 className="font-semibold text-gray-900 mb-2">
                            🎯 {language === 'es' ? 'Objetivo' : 'Objective'}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {language === 'es' ? 
                              'Alcanza las primeras 16 posiciones para clasificar a los playoffs y competir por el título.' :
                              'Reach the top 16 positions to qualify for the playoffs and compete for the title.'
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500">No hay datos de clasificación disponibles</p>
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'schedule' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl md:text-2xl font-bold text-parque-purple">
                  {language === 'es' ? 'Calendario de Partidos' : 'Match Schedule'}
                </h2>
                <div className="text-sm text-gray-600">
                  {language === 'es' ? 'Ronda' : 'Round'} {currentRound} {language === 'es' ? 'de' : 'of'} {totalRounds}
                </div>
              </div>
              
              {/* Round Navigation */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">
                    {language === 'es' ? 'Seleccionar Ronda' : 'Select Round'}
                  </h3>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setCurrentRound(Math.max(1, currentRound - 1))}
                      disabled={currentRound === 1}
                      className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      ← {language === 'es' ? 'Anterior' : 'Previous'}
                    </button>
                    <button
                      onClick={() => setCurrentRound(Math.min(totalRounds, currentRound + 1))}
                      disabled={currentRound === totalRounds}
                      className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {language === 'es' ? 'Siguiente' : 'Next'} →
                    </button>
                  </div>
                </div>
                
                {/* Round selector pills */}
                <div className="flex flex-wrap gap-2">
                  {getAvailableRounds().map(({ round, hasMatches, matchCount }) => (
                    <button
                      key={round}
                      onClick={() => setCurrentRound(round)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 relative ${
                        currentRound === round
                          ? 'bg-parque-purple text-white shadow-lg transform scale-105'
                          : hasMatches
                          ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                      }`}
                    >
                      {language === 'es' ? 'Ronda' : 'Round'} {round}
                      {hasMatches && (
                        <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          {matchCount}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Current Round Matches */}
              {getCurrentRoundMatches().length > 0 ? (
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-parque-purple to-parque-purple/80 text-white px-6 py-4 rounded-lg">
                    <h3 className="text-xl font-bold mb-2">
                      {language === 'es' ? 'Ronda' : 'Round'} {currentRound}
                    </h3>
                    <div className="flex items-center space-x-4 text-sm opacity-90">
                      <span>
                        {getCurrentRoundMatches().length} {language === 'es' ? 'partidos' : 'matches'}
                      </span>
                      <span>•</span>
                      <span>
                        {getCurrentRoundMatches().filter(m => m.schedule?.confirmedDate).length} {language === 'es' ? 'confirmados' : 'confirmed'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    {getCurrentRoundMatches().map((match) => (
                      <div key={match._id} className="bg-white border-2 border-gray-100 rounded-xl p-6 hover:shadow-lg hover:border-parque-purple/20 transition-all duration-200">
                        {/* Match Players */}
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center mb-6">
                          {/* Player 1 */}
                          <div className="md:col-span-2">
                            <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg">
                              <div className="w-12 h-12 rounded-full bg-parque-purple text-white flex items-center justify-center text-lg font-bold">
                                {match.players?.player1?.name?.charAt(0) || '?'}
                              </div>
                              <div>
                                <div className="font-bold text-gray-900 text-lg">
                                  {match.players?.player1?.name || 'TBD'}
                                </div>
                                <div className="text-sm text-gray-600">
                                  {language === 'es' ? 'Jugador 1' : 'Player 1'}
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {/* VS */}
                          <div className="text-center">
                            <div className="bg-parque-purple/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto">
                              <span className="text-2xl font-bold text-parque-purple">vs</span>
                            </div>
                          </div>
                          
                          {/* Player 2 */}
                          <div className="md:col-span-2">
                            <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg">
                              <div className="w-12 h-12 rounded-full bg-parque-purple text-white flex items-center justify-center text-lg font-bold">
                                {match.players?.player2?.name?.charAt(0) || '?'}
                              </div>
                              <div>
                                <div className="font-bold text-gray-900 text-lg">
                                  {match.players?.player2?.name || 'TBD'}
                                </div>
                                <div className="text-sm text-gray-600">
                                  {language === 'es' ? 'Jugador 2' : 'Player 2'}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* ENHANCED DATE & TIME SECTION */}
                        {match.schedule?.confirmedDate ? (
                          <div className="bg-gradient-to-r from-green-50 to-green-100 border-2 border-green-200 rounded-xl p-6 mb-4">
                            <div className="flex items-center space-x-3 mb-4">
                              <div className="w-12 h-12 rounded-full bg-green-500 text-white flex items-center justify-center">
                                <span className="text-2xl">✓</span>
                              </div>
                              <div>
                                <div className="text-lg font-bold text-green-800">
                                  {language === 'es' ? 'Partido Confirmado' : 'Match Confirmed'}
                                </div>
                                <div className="text-sm text-green-600">
                                  {language === 'es' ? 'Los jugadores han acordado fecha y hora' : 'Players have agreed on date and time'}
                                </div>
                              </div>
                            </div>
                            
                            {/* PRIMARY DATE & TIME DISPLAY */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              {/* Date - Most prominent */}
                              <div className="bg-white/80 rounded-lg p-4 text-center">
                                <div className="text-3xl mb-2">📅</div>
                                <div className="text-2xl font-bold text-gray-900 mb-1">
                                  {formatDateForDisplay(match.schedule.confirmedDate)}
                                </div>
                                <div className="text-lg text-gray-600">
                                  {new Date(match.schedule.confirmedDate).toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US', {
                                    month: 'long',
                                    day: 'numeric',
                                    year: 'numeric'
                                  })}
                                </div>
                              </div>
                              
                              {/* Time - Secondary prominence */}
                              {match.schedule?.time && (
                                <div className="bg-white/80 rounded-lg p-4 text-center">
                                  <div className="text-3xl mb-2">🕐</div>
                                  <div className="text-3xl font-bold text-parque-purple mb-1">
                                    {match.schedule.time}
                                  </div>
                                  <div className="text-sm text-gray-600">
                                    {language === 'es' ? 'Hora del partido' : 'Match time'}
                                  </div>
                                </div>
                              )}
                            </div>
                            
                            {/* Venue Information */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                              {match.schedule?.club && (
                                <div className="flex items-center space-x-3 bg-white/60 rounded-lg p-3">
                                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                    <span className="text-xl">🏌️</span>
                                  </div>
                                  <div>
                                    <div className="font-bold text-gray-900">{match.schedule.club}</div>
                                    <div className="text-sm text-gray-600">
                                      {language === 'es' ? 'Club' : 'Club'}
                                    </div>
                                  </div>
                                </div>
                              )}
                              
                              {(match.schedule?.court || match.schedule?.courtNumber) && (
                                <div className="flex items-center space-x-3 bg-white/60 rounded-lg p-3">
                                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                                    <span className="text-xl">🎾</span>
                                  </div>
                                  <div>
                                    <div className="font-bold text-gray-900">
                                      {match.schedule.court || 'Court'} {match.schedule.courtNumber}
                                    </div>
                                    <div className="text-sm text-gray-600">
                                      {language === 'es' ? 'Pista' : 'Court'}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="bg-gradient-to-r from-amber-50 to-amber-100 border-2 border-amber-200 rounded-xl p-6 mb-4">
                            <div className="flex items-center space-x-3 mb-4">
                              <div className="w-12 h-12 rounded-full bg-amber-500 text-white flex items-center justify-center">
                                <span className="text-2xl">⏰</span>
                              </div>
                              <div>
                                <div className="text-lg font-bold text-amber-800">
                                  {language === 'es' ? 'Pendiente de Confirmación' : 'Pending Confirmation'}
                                </div>
                                <div className="text-sm text-amber-600">
                                  {language === 'es' ? 'Los jugadores deben acordar fecha y hora' : 'Players need to agree on date and time'}
                                </div>
                              </div>
                            </div>
                            
                            {/* Deadline Information */}
                            {match.schedule?.deadline && (
                              <div className="bg-white/80 rounded-lg p-4 text-center">
                                <div className="text-2xl mb-2">⏳</div>
                                <div className="text-lg font-bold text-gray-900 mb-1">
                                  {language === 'es' ? 'Fecha Límite' : 'Deadline'}
                                </div>
                                <div className="text-xl font-bold text-amber-700">
                                  {formatDateForDisplay(match.schedule.deadline)}
                                </div>
                                <div className="text-sm text-gray-600 mt-1">
                                  {new Date(match.schedule.deadline).toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US', {
                                    month: 'long',
                                    day: 'numeric',
                                    year: 'numeric'
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                        
                        {/* Match Status */}
                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                          <div className="flex items-center space-x-2">
                            <div className={`w-3 h-3 rounded-full ${
                              match.status === 'scheduled' ? 'bg-blue-500' :
                              match.status === 'in_progress' ? 'bg-yellow-500' :
                              'bg-gray-500'
                            }`}></div>
                            <span className="text-sm font-medium text-gray-700">
                              {match.status === 'scheduled' ? 
                                (language === 'es' ? 'Programado' : 'Scheduled') :
                                match.status === 'in_progress' ? 
                                (language === 'es' ? 'En progreso' : 'In Progress') :
                                match.status
                              }
                            </span>
                          </div>
                          
                          {match.schedule?.confirmedDate && (
                            <div className="text-sm text-gray-500">
                              {language === 'es' ? 'Confirmado' : 'Confirmed'} ✓
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="text-6xl mb-4">📅</div>
                  <h3 className="text-xl font-bold text-gray-700 mb-2">
                    {language === 'es' ? 'Ronda' : 'Round'} {currentRound}
                  </h3>
                  <p className="text-gray-500 mb-6">
                    {language === 'es' 
                      ? 'No hay partidos programados para esta ronda todavía.'
                      : 'No matches scheduled for this round yet.'}
                  </p>
                  <div className="text-sm text-gray-400">
                    {language === 'es' 
                      ? 'Los partidos se programarán una vez que se complete la ronda anterior.'
                      : 'Matches will be scheduled once the previous round is completed.'}
                  </div>
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'results' && (
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-parque-purple mb-4 md:mb-6">
                {language === 'es' ? 'Partidos Recientes' : 'Recent Matches'}
              </h2>
              
              {matches && matches.length > 0 ? (
                <div className="space-y-4">
                  {matches.map((match) => (
                    <div key={match._id} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          {/* Match Header */}
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              <span className="bg-parque-purple text-white px-3 py-1 rounded-full text-sm font-medium">
                                {language === 'es' ? 'Ronda' : 'Round'} {match.round}
                              </span>
                              {match.schedule?.court && (
                                <span className="text-gray-500 text-sm">
                                  🏟️ {match.schedule.court}
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-gray-500">
                              {match.result?.playedAt 
                                ? new Date(match.result.playedAt).toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US')
                                : ''}
                            </div>
                          </div>
                          
                          {/* Players and Score */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                            {/* Player 1 */}
                            <div className={`text-center p-3 rounded-lg ${
                              match.result?.winner?._id === match.players.player1._id 
                                ? 'bg-green-50 border border-green-200' 
                                : 'bg-gray-50'
                            }`}>
                              <div className="font-medium text-gray-900">
                                {match.players.player1.name}
                                {match.result?.winner?._id === match.players.player1._id && 
                                  <span className="ml-2">🏆</span>}
                              </div>
                            </div>
                            
                            {/* Score */}
                            <div className="text-center">
                              {match.result?.score ? (
                                <div className="text-xl font-bold text-gray-900">
                                  {match.result.score}
                                </div>
                              ) : (
                                <div className="text-gray-500">vs</div>
                              )}
                            </div>
                            
                            {/* Player 2 */}
                            <div className={`text-center p-3 rounded-lg ${
                              match.result?.winner?._id === match.players.player2._id 
                                ? 'bg-green-50 border border-green-200' 
                                : 'bg-gray-50'
                            }`}>
                              <div className="font-medium text-gray-900">
                                {match.players.player2.name}
                                {match.result?.winner?._id === match.players.player2._id && 
                                  <span className="ml-2">🏆</span>}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <span className="text-4xl mb-4 block">🎾</span>
                  <p>
                    {language === 'es' 
                      ? 'Los partidos se mostrarán una vez que comience la temporada.'
                      : 'Matches will be displayed once the season begins.'}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 