'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Navigation from '../../../../components/common/Navigation'
import Footer from '../../../../components/common/Footer'
import { useLanguage } from '../../../../lib/hooks/useLanguage'
import { homeContent } from '../../../../lib/content/homeContent'

// Standings Table Component - Mobile Optimized
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
    const isActive = player.status === 'active' || player.status === 'confirmed'
    return isActive 
      ? 'opacity-100' 
      : 'opacity-50 bg-gray-50' // Make inactive players transparent with gray background
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
              className={`${getPositionStyle(standing.position)} ${getPlayerStatusStyle(standing.player)} rounded-xl p-4 shadow-lg border transition-all duration-300 hover:shadow-xl hover:scale-[1.02]`}
            >
              {/* Header with position and points */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  {/* Position with playoff qualification styling */}
                  <div className="flex items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${getPositionBadgeStyle(standing.position)}`}>
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
                  <div className={`text-3xl font-bold ${
                    standing.position <= 8 ? 'text-blue-600' :
                    standing.position <= 16 ? 'text-green-600' :
                    'text-gray-600'
                  }`}>
                    {standing.stats.totalPoints || 0}
                  </div>
                  <div className="text-xs text-gray-500 font-medium">
                    {language === 'es' ? 'puntos' : 'points'}
                  </div>
                </div>
              </div>

              {/* Player name on separate row */}
              <div className="mb-4 text-center">
                <div className="text-xl font-bold text-gray-900 mb-1 flex items-center justify-center">
                  {standing.player.name}
                  {getPlayerStatusIndicator(standing.player)}
                </div>
                {winPercentage > 0 && (
                  <div className="text-sm text-gray-500">
                    {winPercentage}% {language === 'es' ? 'victorias' : 'win rate'}
                  </div>
                )}
              </div>

              {/* Win percentage bar */}
              {standing.stats.matchesPlayed > 0 && (
                <div className="mb-4">
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
              
              {/* Enhanced stats grid */}
              <div className="grid grid-cols-4 gap-3 text-sm">
                <div className="text-center bg-white/50 rounded-lg p-3 border border-white/20">
                  <div className="font-bold text-gray-900 text-lg">{standing.stats.matchesPlayed}</div>
                  <div className="text-xs text-gray-600 font-medium">
                    {language === 'es' ? 'P.J.' : 'MP'}
                  </div>
                </div>
                <div className="text-center bg-white/50 rounded-lg p-3 border border-white/20">
                  <div className="font-bold text-green-600 text-lg">{standing.stats.matchesWon}</div>
                  <div className="text-xs text-gray-600 font-medium">
                    {language === 'es' ? 'P.G.' : 'MW'}
                  </div>
                </div>
                <div className="text-center bg-white/50 rounded-lg p-3 border border-white/20">
                  <div className="font-bold text-gray-900 text-lg">
                    {standing.stats.setsWon}-{standing.stats.setsLost}
                  </div>
                  <div className="text-xs text-gray-600 font-medium">Sets</div>
                </div>
                <div className="text-center bg-white/50 rounded-lg p-3 border border-white/20">
                  <div className="font-bold text-gray-900 text-lg">
                    {standing.stats.gamesWon || 0}-{standing.stats.gamesLost || 0}
                  </div>
                  <div className="text-xs text-gray-600 font-medium">
                    {language === 'es' ? 'Juegos' : 'Games'}
                  </div>
                </div>
              </div>

              {/* Form indicator for recent matches */}
              {standing.stats.matchesPlayed > 0 && (
                <div className="mt-3 flex items-center justify-between">
                  <div className="text-xs text-gray-500">
                    {language === 'es' ? 'Forma reciente' : 'Recent form'}
                  </div>
                  <div className="flex space-x-1">
                    {/* Simulated recent form - you can enhance this with actual data */}
                    {[...Array(Math.min(5, standing.stats.matchesPlayed))].map((_, i) => (
                      <div
                        key={i}
                        className={`w-2 h-2 rounded-full ${
                          i < standing.stats.matchesWon ? 'bg-green-500' : 'bg-red-500'
                        }`}
                      ></div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Desktop table layout - Enhanced */}
      <div className="hidden md:block">
        <div className="overflow-hidden rounded-xl border border-gray-200 shadow-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-parque-purple to-parque-purple/90">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                  {language === 'es' ? 'Posición' : 'Position'}
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
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
                  Sets
                </th>
                <th className="px-6 py-4 text-center text-xs font-bold text-white uppercase tracking-wider">
                  {language === 'es' ? 'Juegos' : 'Games'}
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
                              {winPercentage}% {language === 'es' ? 'victorias' : 'win rate'}
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

export default function LeagueSeasonPage() {
  const params = useParams()
  const { location, season } = params
  
  const { language, setLanguage } = useLanguage()
  const [league, setLeague] = useState(null)
  const [standings, setStandings] = useState(null)
  const [matches, setMatches] = useState([])
  const [schedule, setSchedule] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('standings')
  const [currentRound, setCurrentRound] = useState(1)
  const [totalRounds, setTotalRounds] = useState(8) // Default from league config

  const t = homeContent[language]

  useEffect(() => {
    fetchLeagueData()
  }, [location, season])

  const fetchLeagueData = async () => {
    try {
      setLoading(true)
      
      // Fetch league info
      const leagueRes = await fetch(`/api/leagues/${location}`)
      if (!leagueRes.ok) throw new Error('League not found')
      const leagueData = await leagueRes.json()
      
      // Find the season that matches our URL season parameter
      const seasonMap = {
        // Spanish URLs (primary)
        'verano2025': 'Verano 2025',
        'invierno2025': 'Invierno 2025',
        'primavera2025': 'Primavera 2025',
        'otono2025': 'Otoño 2025',
        // English URLs (fallback)
        'summer2025': 'Verano 2025',
        'winter2025': 'Invierno 2025',
        'spring2025': 'Primavera 2025',
        'autumn2025': 'Otoño 2025',
        'fall2025': 'Otoño 2025'
      }
      
      const targetSeasonName = seasonMap[season]
      // Try to find the season by the mapped name, or try both Spanish and English variants
      let targetSeason = leagueData.league.seasons?.find(s => s.name === targetSeasonName)
      
      // If not found, try alternative names for the same season
      if (!targetSeason && season === 'verano2025') {
        targetSeason = leagueData.league.seasons?.find(s => 
          s.name === 'Verano 2025' || s.name === 'Summer 2025'
        )
      } else if (!targetSeason && season === 'summer2025') {
        targetSeason = leagueData.league.seasons?.find(s => 
          s.name === 'Summer 2025' || s.name === 'Verano 2025'
        )
      }
      
      if (!targetSeason) {
        throw new Error(`Season ${season} not found`)
      }
      
      setLeague({ ...leagueData.league, currentSeason: targetSeason })
      
      // Set total rounds from league config
      if (leagueData.league.config?.roundsPerSeason) {
        setTotalRounds(leagueData.league.config.roundsPerSeason)
      }
      
      // Fetch standings data
      const standingsRes = await fetch(`/api/leagues/${location}/standings?season=${targetSeasonName}`)
      if (standingsRes.ok) {
        const standingsData = await standingsRes.json()
        setStandings(standingsData)
      }
      
      // Fetch recent matches
      const matchesRes = await fetch(`/api/leagues/${location}/matches?season=${targetSeasonName}&status=completed&limit=10`)
      if (matchesRes.ok) {
        const matchesData = await matchesRes.json()
        setMatches(matchesData.matches || [])
      }
      
      // Fetch upcoming matches schedule
      const scheduleRes = await fetch(`/api/leagues/${location}/matches?season=${targetSeasonName}&status=scheduled&limit=50`)
      if (scheduleRes.ok) {
        const scheduleData = await scheduleRes.json()
        setSchedule(scheduleData.matches || [])
        
        // Set current round to the first round with matches, or 1 if no matches
        if (scheduleData.matches && scheduleData.matches.length > 0) {
          const firstRound = Math.min(...scheduleData.matches.map(m => m.round))
          setCurrentRound(firstRound)
        }
      }
      
    } catch (err) {
      console.error('Error fetching league data:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const getSeasonDisplayName = (seasonKey) => {
    const seasonNames = {
      es: {
        'verano2025': 'Verano 2025',
        'invierno2025': 'Invierno 2025', 
        'primavera2025': 'Primavera 2025',
        'otono2025': 'Otoño 2025'
      },
      en: {
        'verano2025': 'Summer 2025',
        'invierno2025': 'Winter 2025',
        'primavera2025': 'Spring 2025', 
        'otono2025': 'Autumn 2025'
      }
    }
    return seasonNames[language][seasonKey] || seasonKey
  }

  // Get matches for current round
  const getCurrentRoundMatches = () => {
    return schedule.filter(match => match.round === currentRound)
  }

  // Get available rounds
  const getAvailableRounds = () => {
    const roundsWithMatches = [...new Set(schedule.map(match => match.round))].sort((a, b) => a - b)
    const allRounds = Array.from({ length: totalRounds }, (_, i) => i + 1)
    return allRounds.map(round => ({
      round,
      hasMatches: roundsWithMatches.includes(round),
      matchCount: schedule.filter(match => match.round === round).length
    }))
  }

  // Format date for display
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-parque-bg via-white to-white">
        <Navigation currentPage="league" language={language} onLanguageChange={setLanguage} />
        <div className="container mx-auto px-4 py-32 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-parque-purple mx-auto"></div>
          <p className="mt-4 text-gray-600">
            {language === 'es' ? 'Cargando información de la liga...' : 'Loading league information...'}
          </p>
        </div>
      </div>
    )
  }

  if (error || !league) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-parque-bg via-white to-white">
        <Navigation currentPage="league" language={language} onLanguageChange={setLanguage} />
        <div className="container mx-auto px-4 py-32 text-center">
          <div className="text-6xl mb-6">🎾</div>
          <h1 className="text-4xl font-light text-parque-purple mb-4">
            {language === 'es' ? 'Liga no encontrada' : 'League not found'}
          </h1>
          <p className="text-gray-600 mb-8">
            {language === 'es' 
              ? 'La liga o temporada que buscas no existe o no está activa.'
              : 'The league or season you are looking for does not exist or is not active.'}
          </p>
          <a 
            href="/sotogrande"
            className="bg-parque-purple text-white px-8 py-3 rounded-full hover:bg-parque-purple/90 transition-colors"
          >
            {language === 'es' ? 'Volver al inicio' : 'Back to home'}
          </a>
        </div>
        <Footer content={t.footer} />
      </div>
    )
  }

  const currentSeason = league.currentSeason

  return (
    <div className="min-h-screen bg-gradient-to-b from-parque-bg via-white to-white">
      <Navigation currentPage="league" language={language} onLanguageChange={setLanguage} />
      
      {/* Hero Section */}
      <section className="relative pt-20 md:pt-32 pb-8 md:pb-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 md:mb-12">
            <div className="mb-4 md:mb-6">
              <img 
                src="/logo.png" 
                alt="Tenis del Parque - Sotogrande League" 
                className="h-24 md:h-32 lg:h-40 w-auto mx-auto"
              />
            </div>
            
            {/* Season and Status in a compact layout */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4 mb-4">
              <p className="text-lg md:text-xl text-gray-600 font-medium">
                {getSeasonDisplayName(season)}
              </p>
              <span className={`inline-flex items-center px-3 md:px-4 py-2 rounded-full text-sm font-medium ${
                currentSeason.status === 'registration_open' 
                  ? 'bg-green-100 text-green-800' 
                  : currentSeason.status === 'active'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {currentSeason.status === 'registration_open' && 
                  (language === 'es' ? '✅ Inscripciones Abiertas' : '✅ Registration Open')
                }
                {currentSeason.status === 'active' && 
                  (language === 'es' ? '🎾 Liga Activa' : '🎾 League Active')
                }
                {currentSeason.status === 'completed' && 
                  (language === 'es' ? '🏁 Temporada Finalizada' : '🏁 Season Completed')
                }
                {currentSeason.status === 'upcoming' && 
                  (language === 'es' ? '⏳ Próximamente' : '⏳ Coming Soon')
                }
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Navigation Tabs */}
      <section className="container mx-auto px-4 mb-6 md:mb-8">
        <div className="flex justify-center">
          {/* Mobile tabs - full width */}
          <div className="bg-white rounded-lg p-1 shadow-lg w-full max-w-md md:hidden">
            <nav className="flex space-x-1 overflow-x-auto scrollbar-hide">
              {[
                { id: 'standings', label: language === 'es' ? 'Clasificación' : 'Standings', shortLabel: language === 'es' ? 'Tabla' : 'Table', icon: '🏆' },
                { id: 'schedule', label: language === 'es' ? 'Calendario' : 'Schedule', shortLabel: language === 'es' ? 'Fecha' : 'Date', icon: '📅' },
                { id: 'matches', label: language === 'es' ? 'Resultados' : 'Results', shortLabel: language === 'es' ? 'Juegos' : 'Games', icon: '🎾' },
                { id: 'register', label: language === 'es' ? 'Inscribirse' : 'Register', shortLabel: language === 'es' ? 'Unirse' : 'Join', icon: '✍️' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center justify-center space-x-1 px-2 py-2 rounded-lg font-medium transition-colors whitespace-nowrap min-w-0 flex-1 ${
                    activeTab === tab.id
                      ? 'bg-parque-purple text-white'
                      : 'text-gray-600 hover:text-parque-purple hover:bg-parque-bg'
                  }`}
                >
                  <span className="text-sm">{tab.icon}</span>
                  <span className="text-xs">{tab.shortLabel}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Desktop tabs - more compact and elegant */}
          <div className="hidden md:block">
            <nav className="bg-white rounded-xl shadow-lg p-2 border border-gray-100">
              <div className="flex items-center space-x-1">
                {[
                  { id: 'standings', label: language === 'es' ? 'Clasificación' : 'Standings', icon: '🏆' },
                  { id: 'schedule', label: language === 'es' ? 'Calendario' : 'Schedule', icon: '📅' },
                  { id: 'matches', label: language === 'es' ? 'Resultados' : 'Results', icon: '🎾' },
                  { id: 'register', label: language === 'es' ? 'Inscribirse' : 'Register', icon: '✍️' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                      activeTab === tab.id
                        ? 'bg-parque-purple text-white shadow-md transform scale-105'
                        : 'text-gray-600 hover:text-parque-purple hover:bg-parque-bg/50 hover:shadow-sm'
                    }`}
                  >
                    <span className="text-lg">{tab.icon}</span>
                    <span className="text-sm font-semibold">{tab.label}</span>
                  </button>
                ))}
              </div>
            </nav>
          </div>
        </div>
      </section>

      {/* Content Sections */}
      <section className="container mx-auto px-4 pb-8 md:pb-16">
        {activeTab === 'schedule' && (
          <div className="max-w-5xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg p-4 md:p-8">
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
                        
                        {/* ENHANCED DATE & TIME SECTION - Most Important */}
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
          </div>
        )}

        {activeTab === 'standings' && (
          <div className="max-w-7xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg p-4 md:p-8">
              <h2 className="text-xl md:text-2xl font-bold text-parque-purple mb-4 md:mb-6">
                {language === 'es' ? 'Clasificación General' : 'League Standings'}
              </h2>
              
              {standings && standings.unifiedStandings ? (
                <div>
                  <StandingsTable 
                    players={standings.unifiedStandings} 
                    language={language}
                    unified={true}
                  />
                  
                  {/* League stats and scoring system moved to bottom */}
                  <div className="mt-8 text-center">
                    {/* Enhanced league stats */}
                    <div className="flex items-center justify-center space-x-6 mb-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-10 h-10 rounded-full bg-parque-purple/10 flex items-center justify-center">
                          <span className="text-parque-purple font-bold">👥</span>
                        </div>
                        <div>
                          <div className="text-lg font-bold text-gray-900">{standings.totalPlayers}</div>
                          <div className="text-xs text-gray-500">
                            {language === 'es' ? 'jugadores' : 'players'}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-blue-600 font-bold">🎯</span>
                        </div>
                        <div>
                          <div className="text-lg font-bold text-gray-900">{standings.currentRound || 0}</div>
                          <div className="text-xs text-gray-500">
                            {language === 'es' ? 'ronda actual' : 'current round'}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Enhanced scoring system */}
                    <div className="bg-gradient-to-r from-parque-bg to-white rounded-lg p-4 border border-parque-purple/20">
                      <div className="text-xs font-semibold text-parque-purple mb-2">
                        {language === 'es' ? 'Sistema de Puntuación' : 'Scoring System'}
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center text-xs font-bold">3</div>
                          <span className="text-gray-600">
                            {language === 'es' ? 'Victoria 2-0' : 'Win 2-0'}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold">2</div>
                          <span className="text-gray-600">
                            {language === 'es' ? 'Victoria 2-1' : 'Win 2-1'}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 rounded-full bg-yellow-500 text-white flex items-center justify-center text-xs font-bold">1</div>
                          <span className="text-gray-600">
                            {language === 'es' ? 'Derrota 1-2' : 'Loss 1-2'}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center text-xs font-bold">0</div>
                          <span className="text-gray-600">
                            {language === 'es' ? 'Derrota 0-2' : 'Loss 0-2'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <span className="text-4xl mb-4 block">🏆</span>
                  <p>
                    {language === 'es' 
                      ? 'La clasificación se mostrará una vez que comiencen los partidos.'
                      : 'Standings will be displayed once matches begin.'}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'matches' && (
          <div className="max-w-5xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg p-4 md:p-8">
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
          </div>
        )}

        {activeTab === 'register' && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg p-4 md:p-8">
              <h2 className="text-xl md:text-2xl font-bold text-parque-purple mb-4 md:mb-6 text-center">
                {language === 'es' ? 'Inscribirse en la Liga' : 'Register for the League'}
              </h2>
              
              {currentSeason.status === 'registration_open' ? (
                <div className="text-center">
                  <div className="text-4xl mb-4">✍️</div>
                  <p className="text-gray-700 mb-6">
                    {language === 'es' 
                      ? '¡Las inscripciones están abiertas! Haz clic en el botón de abajo para registrarte.'
                      : 'Registration is open! Click the button below to sign up.'}
                  </p>
                  <a 
                    href={`/signup/${league.slug}`}
                    className="inline-block bg-parque-purple text-white px-8 py-3 rounded-full hover:bg-parque-purple/90 transition-colors font-medium"
                  >
                    {language === 'es' ? 'Inscribirse Ahora' : 'Register Now'}
                  </a>
                </div>
              ) : (
                <div className="text-center">
                  <div className="text-4xl mb-4">⏳</div>
                  <p className="text-gray-700">
                    {language === 'es' 
                      ? 'Las inscripciones no están abiertas en este momento.'
                      : 'Registration is not currently open.'}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </section>

      <Footer content={t.footer} />
    </div>
  )
}