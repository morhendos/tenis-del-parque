'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Navigation from '../../../../components/common/Navigation'
import Footer from '../../../../components/common/Footer'
import { useLanguage } from '../../../../lib/hooks/useLanguage'
import { homeContent } from '../../../../lib/content/homeContent'

// Standings Table Component - Mobile Optimized
function StandingsTable({ players, language, unified = false }) {
  return (
    <div className="overflow-x-auto">
      {/* Mobile-first card layout for small screens */}
      <div className="block md:hidden space-y-3">
        {players.map((standing) => (
          <div key={standing.player._id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="flex items-center">
                  <span className="font-bold text-xl text-parque-purple">#{standing.position}</span>
                  {standing.position === 1 && <span className="ml-2 text-xl">🏆</span>}
                  {standing.position === 2 && <span className="ml-2 text-xl">🥈</span>}
                  {standing.position === 3 && <span className="ml-2 text-xl">🥉</span>}
                </div>
                <div className="text-lg font-semibold text-gray-900">
                  {standing.player.name}
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-parque-purple">{standing.stats.totalPoints || 0}</div>
                <div className="text-xs text-gray-500">
                  {language === 'es' ? 'puntos' : 'points'}
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-3 text-sm">
              <div className="text-center bg-gray-50 rounded-lg p-2">
                <div className="font-medium text-gray-900">{standing.stats.matchesPlayed}</div>
                <div className="text-xs text-gray-500">
                  {language === 'es' ? 'P.J.' : 'MP'}
                </div>
              </div>
              <div className="text-center bg-gray-50 rounded-lg p-2">
                <div className="font-medium text-green-600">{standing.stats.matchesWon}</div>
                <div className="text-xs text-gray-500">
                  {language === 'es' ? 'P.G.' : 'MW'}
                </div>
              </div>
              <div className="text-center bg-gray-50 rounded-lg p-2">
                <div className="font-medium text-gray-900">
                  {standing.stats.setsWon}-{standing.stats.setsLost}
                </div>
                <div className="text-xs text-gray-500">Sets</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop table layout */}
      <div className="hidden md:block">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {language === 'es' ? 'Pos.' : 'Pos.'}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {language === 'es' ? 'Jugador' : 'Player'}
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {language === 'es' ? 'Puntos' : 'Points'}
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {language === 'es' ? 'P.J.' : 'MP'}
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {language === 'es' ? 'P.G.' : 'MW'}
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {language === 'es' ? 'Sets' : 'Sets'}
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {language === 'es' ? 'Juegos' : 'Games'}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {players.map((standing) => (
              <tr key={standing.player._id} className="hover:bg-gray-50">
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div className="flex items-center">
                    <span className="font-bold text-lg">#{standing.position}</span>
                    {standing.position === 1 && <span className="ml-2 text-xl">🏆</span>}
                    {standing.position === 2 && <span className="ml-2 text-xl">🥈</span>}
                    {standing.position === 3 && <span className="ml-2 text-xl">🥉</span>}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {standing.player.name}
                  </div>
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                  <span className="font-bold text-parque-purple text-lg">{standing.stats.totalPoints || 0}</span>
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                  {standing.stats.matchesPlayed}
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                  <span className="font-medium text-green-600">{standing.stats.matchesWon}</span>
                  <span className="text-gray-500">-{standing.stats.matchesLost}</span>
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                  <span className="font-medium">{standing.stats.setsWon}</span>
                  <span className="text-gray-500">-{standing.stats.setsLost}</span>
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                  <span className="font-medium">{standing.stats.gamesWon || 0}</span>
                  <span className="text-gray-500">-{standing.stats.gamesLost || 0}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
        'verano2025': 'Verano 2025',
        'invierno2025': 'Invierno 2025',
        'primavera2025': 'Primavera 2025',
        'otono2025': 'Otoño 2025'
      }
      
      const targetSeasonName = seasonMap[season]
      const targetSeason = leagueData.league.seasons?.find(s => s.name === targetSeasonName)
      
      if (!targetSeason) {
        throw new Error(`Season ${season} not found`)
      }
      
      setLeague({ ...leagueData.league, currentSeason: targetSeason })
      
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
      const scheduleRes = await fetch(`/api/leagues/${location}/matches?season=${targetSeasonName}&status=scheduled&limit=20`)
      if (scheduleRes.ok) {
        const scheduleData = await scheduleRes.json()
        setSchedule(scheduleData.matches || [])
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
              <h2 className="text-xl md:text-2xl font-bold text-parque-purple mb-4 md:mb-6">
                {language === 'es' ? 'Calendario de Partidos' : 'Match Schedule'}
              </h2>
              
              {schedule && schedule.length > 0 ? (
                <div className="space-y-6">
                  {/* Group matches by round */}
                  {Object.entries(
                    schedule.reduce((rounds, match) => {
                      const roundKey = match.round || 'TBD'
                      if (!rounds[roundKey]) rounds[roundKey] = []
                      rounds[roundKey].push(match)
                      return rounds
                    }, {})
                  ).map(([round, roundMatches]) => (
                    <div key={round} className="border border-gray-200 rounded-lg overflow-hidden">
                      <div className="bg-parque-purple text-white px-6 py-4">
                        <h3 className="text-lg font-semibold">
                          {language === 'es' ? 'Ronda' : 'Round'} {round}
                        </h3>
                        <p className="text-sm opacity-90">
                          {roundMatches.length} {language === 'es' ? 'partidos programados' : 'scheduled matches'}
                        </p>
                      </div>
                      
                      <div className="divide-y divide-gray-200">
                        {roundMatches.map((match) => (
                          <div key={match._id} className="p-6 hover:bg-gray-50 transition-colors">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                                  {/* Player 1 */}
                                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                                    <div className="font-medium text-gray-900">
                                      {match.players?.player1?.name || 'TBD'}
                                    </div>
                                  </div>
                                  
                                  {/* VS */}
                                  <div className="text-center">
                                    <div className="text-xl font-bold text-gray-400">vs</div>
                                  </div>
                                  
                                  {/* Player 2 */}
                                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                                    <div className="font-medium text-gray-900">
                                      {match.players?.player2?.name || 'TBD'}
                                    </div>
                                  </div>
                                </div>
                                
                                {/* Match details */}
                                <div className="mt-4 space-y-3">
                                  {/* Confirmed Date & Time */}
                                  {match.schedule?.confirmedDate && (
                                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                                      <div className="flex items-center space-x-2 mb-2">
                                        <span className="text-green-600">✅</span>
                                        <span className="font-medium text-green-800">
                                          {language === 'es' ? 'Partido Confirmado' : 'Match Confirmed'}
                                        </span>
                                      </div>
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                        <div className="flex items-center space-x-2">
                                          <span>📅</span>
                                          <span className="font-medium">
                                            {new Date(match.schedule.confirmedDate).toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US', {
                                              weekday: 'long',
                                              year: 'numeric',
                                              month: 'long', 
                                              day: 'numeric'
                                            })}
                                          </span>
                                        </div>
                                        {match.schedule?.time && (
                                          <div className="flex items-center space-x-2">
                                            <span>🕐</span>
                                            <span className="font-medium">{match.schedule.time}</span>
                                          </div>
                                        )}
                                        {match.schedule?.club && (
                                          <div className="flex items-center space-x-2">
                                            <span>🏌️</span>
                                            <span className="font-medium">{match.schedule.club}</span>
                                          </div>
                                        )}
                                        {(match.schedule?.court || match.schedule?.courtNumber) && (
                                          <div className="flex items-center space-x-2">
                                            <span>🎾</span>
                                            <span className="font-medium">
                                              {match.schedule.court} 
                                              {match.schedule.courtNumber && ` ${match.schedule.courtNumber}`}
                                            </span>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                  
                                  {/* Deadline info for unconfirmed matches */}
                                  {!match.schedule?.confirmedDate && match.schedule?.deadline && (
                                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                                      <div className="flex items-center space-x-2 mb-2">
                                        <span className="text-amber-600">⏰</span>
                                        <span className="font-medium text-amber-800">
                                          {language === 'es' ? 'Pendiente de Confirmación' : 'Pending Confirmation'}
                                        </span>
                                      </div>
                                      <div className="text-sm text-amber-700">
                                        {language === 'es' ? 'Fecha límite:' : 'Deadline:'} {' '}
                                        <span className="font-medium">
                                          {new Date(match.schedule.deadline).toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US', {
                                            weekday: 'short',
                                            month: 'short',
                                            day: 'numeric'
                                          })}
                                        </span>
                                      </div>
                                    </div>
                                  )}
                                  
                                  {/* Status indicator */}
                                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                                    <span className={`w-2 h-2 rounded-full ${
                                      match.status === 'scheduled' ? 'bg-blue-500' :
                                      match.status === 'in_progress' ? 'bg-yellow-500' :
                                      'bg-gray-500'
                                    }`}></span>
                                    <span className="capitalize">
                                      {match.status === 'scheduled' ? 
                                        (language === 'es' ? 'Programado' : 'Scheduled') :
                                        match.status === 'in_progress' ? 
                                        (language === 'es' ? 'En progreso' : 'In Progress') :
                                        match.status
                                      }
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <span className="text-4xl mb-4 block">📅</span>
                  <p>
                    {language === 'es' 
                      ? 'No hay partidos programados en este momento.'
                      : 'No matches scheduled at the moment.'}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'standings' && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg p-4 md:p-8">
              <h2 className="text-xl md:text-2xl font-bold text-parque-purple mb-4 md:mb-6">
                {language === 'es' ? 'Clasificación General' : 'League Standings'}
              </h2>
              
              {standings && standings.unifiedStandings ? (
                <div>
                  <div className="mb-4 text-center">
                    <div className="text-sm text-gray-600 mb-2">
                      {language === 'es' 
                        ? `${standings.totalPlayers} jugadores • Ronda actual: ${standings.currentRound || 0}`
                        : `${standings.totalPlayers} players • Current round: ${standings.currentRound || 0}`
                      }
                    </div>
                    <div className="text-xs md:text-sm text-gray-500 px-2">
                      {language === 'es' 
                        ? 'Victoria 2-0: 3 pts • Victoria 2-1: 2 pts • Derrota 1-2: 1 pt • Derrota 0-2: 0 pts'
                        : 'Win 2-0: 3 pts • Win 2-1: 2 pts • Loss 1-2: 1 pt • Loss 0-2: 0 pts'
                      }
                    </div>
                  </div>
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