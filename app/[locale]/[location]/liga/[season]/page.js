'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Navigation from '@/components/common/Navigation'
import Footer from '@/components/common/Footer'
import { homeContent } from '@/lib/content/homeContent'

// Import the existing StandingsTable component
function StandingsTable({ players, language, unified = false }) {
  const getPositionStyle = (position) => {
    const baseStyle = "bg-gradient-to-r from-violet-50/30 via-white to-violet-50/20 border-gray-200 shadow-violet-100/50"
    if (position <= 8) return `${baseStyle} border-l-4 border-l-blue-500`
    if (position <= 16) return `${baseStyle} border-l-4 border-l-green-500`
    return baseStyle
  }

  const getPositionBadgeStyle = (position) => {
    if (position <= 8) return 'bg-blue-600 text-white ring-2 ring-blue-200'
    if (position <= 16) return 'bg-green-600 text-white ring-2 ring-green-200'
    return 'bg-gray-500 text-white ring-2 ring-gray-200'
  }

  const getPositionLabel = (position) => {
    if (position <= 8) return language === 'es' ? 'Playoff A' : 'Playoff A'
    if (position <= 16) return language === 'es' ? 'Playoff B' : 'Playoff B'
    return language === 'es' ? 'Liga' : 'League'
  }

  const getWinPercentage = (won, total) => {
    if (total === 0) return 0
    return Math.round((won / total) * 100)
  }

  const getPlayerStatusStyle = (player) => {
    const isActive = player.status === 'active'
    return isActive ? 'opacity-100' : 'opacity-50 bg-gray-50'
  }

  const getPlayerStatusIndicator = (player) => {
    if (player.status === 'active' || player.status === 'confirmed') {
      return null
    }
    return (
      <span className="ml-2 px-2 py-1 text-xs rounded-full bg-gray-200 text-gray-600">
        {player.status}
      </span>
    )
  }

  return (
    <div className="overflow-x-auto">
      {/* Playoff Qualification Legend */}
      <div className="mb-6 bg-gradient-to-r from-violet-50/50 to-violet-50/30 rounded-lg p-4 border border-violet-100/40">
        <h3 className="text-sm font-semibold text-violet-800 mb-3">
          {language === 'es' ? 'Clasificación a Playoffs' : 'Playoff Qualification'}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
          <div className="flex items-center space-x-3">
            <div className="w-4 h-4 bg-blue-600 rounded"></div>
            <span className="text-gray-700">
              <span className="font-medium">1-8:</span> {language === 'es' ? 'Playoff A' : 'Playoff A'}
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-4 h-4 bg-green-600 rounded"></div>
            <span className="text-gray-700">
              <span className="font-medium">9-16:</span> {language === 'es' ? 'Playoff B' : 'Playoff B'}
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-4 h-4 bg-gray-500 rounded"></div>
            <span className="text-gray-700">
              <span className="font-medium">17+:</span> {language === 'es' ? 'Liga Regular' : 'Regular League'}
            </span>
          </div>
        </div>
      </div>
      
      {/* Mobile-first card layout */}
      <div className="block md:hidden space-y-4">
        {players.map((standing, index) => {
          const winPercentage = getWinPercentage(standing.stats.matchesWon, standing.stats.matchesPlayed)
          
          return (
            <div 
              key={standing.player._id} 
              className={`${getPositionStyle(standing.position)} ${getPlayerStatusStyle(standing.player)} rounded-xl p-4 shadow-lg border transition-all duration-300 hover:shadow-xl hover:scale-[1.02]`}
            >
              {/* Mobile card content - simplified version */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${getPositionBadgeStyle(standing.position)}`}>
                    {standing.position}
                  </div>
                  {standing.position <= 16 && (
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      standing.position <= 8 ? 'bg-blue-100 text-blue-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {getPositionLabel(standing.position)}
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-gray-900">
                    {standing.stats.totalPoints || 0}
                  </div>
                  <div className="text-xs text-gray-500 font-medium">
                    {language === 'es' ? 'puntos' : 'points'}
                  </div>
                </div>
              </div>
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
            </div>
          )
        })}
      </div>

      {/* Desktop table layout */}
      <div className="hidden md:block">
        <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-lg">
          <table className="w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-violet-600 via-parque-purple to-violet-600">
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
                  Sets
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
                      <div className="text-lg font-bold text-gray-900">
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

export default function LeagueSeasonPage() {
  const params = useParams()
  const { locale, location, season } = params
  const language = locale || 'es'
  
  const [league, setLeague] = useState(null)
  const [standings, setStandings] = useState(null)
  const [matches, setMatches] = useState([])
  const [schedule, setSchedule] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('standings')
  const [currentRound, setCurrentRound] = useState(1)
  const [totalRounds, setTotalRounds] = useState(8)
  const [viewMode, setViewMode] = useState('byRound')

  const t = homeContent[language]

  useEffect(() => {
    fetchLeagueData()
  }, [location, season, locale])

  const fetchLeagueData = async () => {
    try {
      setLoading(true)
      
      const leagueRes = await fetch(`/api/leagues/${location}`)
      if (!leagueRes.ok) throw new Error('League not found')
      const leagueData = await leagueRes.json()
      
      const seasonMap = {
        'verano2025': 'Summer 2025',
        'summer2025': 'Summer 2025',
        'invierno2025': 'Winter 2025',
        'winter2025': 'Winter 2025',
        'primavera2025': 'Spring 2025',
        'spring2025': 'Spring 2025',
        'otono2025': 'Autumn 2025',
        'autumn2025': 'Autumn 2025',
        'fall2025': 'Autumn 2025'
      }
      
      const targetSeasonName = seasonMap[season]
      let targetSeason = leagueData.league.seasons?.find(s => s.name === targetSeasonName)
      
      if (!targetSeason) {
        targetSeason = leagueData.league.seasons?.find(s => s.name === season)
      }
      
      if (!targetSeason) {
        throw new Error(`Season ${season} not found`)
      }
      
      setLeague({ ...leagueData.league, currentSeason: targetSeason })
      
      if (leagueData.league.config?.roundsPerSeason) {
        setTotalRounds(leagueData.league.config.roundsPerSeason)
      }
      
      const dbSeason = targetSeasonName === 'Summer 2025' ? 'summer-2025' : targetSeasonName
      
      const standingsRes = await fetch(`/api/leagues/${location}/standings?season=${dbSeason}`)
      if (standingsRes.ok) {
        const standingsData = await standingsRes.json()
        setStandings(standingsData)
      }
      
      const matchesRes = await fetch(`/api/leagues/${location}/matches?season=${dbSeason}&status=completed&limit=10`)
      if (matchesRes.ok) {
        const matchesData = await matchesRes.json()
        setMatches(matchesData.matches || [])
      }
      
      const scheduleRes = await fetch(`/api/leagues/${location}/matches?season=${dbSeason}&status=scheduled&limit=50`)
      if (scheduleRes.ok) {
        const scheduleData = await scheduleRes.json()
        setSchedule(scheduleData.matches || [])
        
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

  const getMatchesByRound = () => {
    const matchesByRound = {}
    schedule.forEach(match => {
      if (!matchesByRound[match.round]) {
        matchesByRound[match.round] = []
      }
      matchesByRound[match.round].push(match)
    })
    return matchesByRound
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-parque-bg via-white to-white">
        <Navigation currentPage="league" />
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
        <Navigation currentPage="league" />
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
            href={`/${locale}`}
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

  // Render matches helper function
  function renderMatches(matchList) {
    return (
      <div className="space-y-6">
        {matchList.map((match) => (
          <div key={match._id} className="bg-white border-2 border-gray-100 rounded-xl p-6 hover:shadow-lg hover:border-parque-purple/20 transition-all duration-200">
            {/* Match content */}
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
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-parque-bg via-white to-white">
      <Navigation currentPage="league" />
      
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
          <div className="bg-white rounded-lg p-1 shadow-lg w-full max-w-md md:max-w-none md:w-auto">
            <nav className="flex space-x-1 md:space-x-2">
              {[
                { id: 'standings', label: language === 'es' ? 'Clasificación' : 'Standings', icon: '🏆' },
                { id: 'schedule', label: language === 'es' ? 'Calendario' : 'Schedule', icon: '📅' },
                { id: 'matches', label: language === 'es' ? 'Resultados' : 'Results', icon: '🎾' },
                { id: 'register', label: language === 'es' ? 'Inscribirse' : 'Register', icon: '✍️' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center justify-center space-x-1 md:space-x-2 px-3 md:px-6 py-2 md:py-3 rounded-lg font-medium transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-parque-purple text-white shadow-md'
                      : 'text-gray-600 hover:text-parque-purple hover:bg-parque-bg/50'
                  }`}
                >
                  <span className="text-sm md:text-lg">{tab.icon}</span>
                  <span className="text-xs md:text-sm font-semibold">{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>
      </section>

      {/* Content Sections */}
      <section className="container mx-auto px-4 pb-8 md:pb-16">
        {activeTab === 'standings' && (
          <div className="max-w-[1400px] mx-auto">
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

        {activeTab === 'schedule' && (
          <div className="max-w-[1200px] mx-auto">
            <div className="bg-white rounded-xl shadow-lg p-4 md:p-8">
              <h2 className="text-xl md:text-2xl font-bold text-parque-purple mb-6">
                {language === 'es' ? 'Calendario de Partidos' : 'Match Schedule'}
              </h2>
              {schedule.length > 0 ? renderMatches(getCurrentRoundMatches()) : (
                <div className="text-center py-16">
                  <div className="text-6xl mb-4">📅</div>
                  <p className="text-gray-500">
                    {language === 'es' 
                      ? 'No hay partidos programados todavía.'
                      : 'No matches scheduled yet.'}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'matches' && (
          <div className="max-w-[1200px] mx-auto">
            <div className="bg-white rounded-xl shadow-lg p-4 md:p-8">
              <h2 className="text-xl md:text-2xl font-bold text-parque-purple mb-4 md:mb-6">
                {language === 'es' ? 'Partidos Recientes' : 'Recent Matches'}
              </h2>
              {matches.length > 0 ? renderMatches(matches) : (
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
          <div className="max-w-4xl mx-auto">
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
                    href={`/${locale}/${locale === 'es' ? 'registro' : 'signup'}/${league.slug}`}
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