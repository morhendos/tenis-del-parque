'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Navigation from '@/components/common/Navigation'
import Footer from '@/components/common/Footer'
import { homeContent } from '@/lib/content/homeContent'
import ScoringSystem from '@/components/league/ScoringSystem'
import StandingsTable from '@/components/player/StandingsTable'
import ResultsTab from '@/components/player/ResultsTab'
import ScheduleTab from '@/components/player/ScheduleTab'

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
  const [totalRounds, setTotalRounds] = useState(8)

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
      
      const matchesRes = await fetch(`/api/leagues/${location}/matches?season=${dbSeason}&status=completed&limit=100`)
      if (matchesRes.ok) {
        const matchesData = await matchesRes.json()
        setMatches(matchesData.matches || [])
      }
      
      const scheduleRes = await fetch(`/api/leagues/${location}/matches?season=${dbSeason}&status=scheduled&limit=50`)
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-parque-bg via-white to-white">
      <Navigation currentPage="league" />
      
      {/* Hero Section - More compact on mobile */}
      <section className="relative pt-16 md:pt-20 lg:pt-32 pb-4 md:pb-8 lg:pb-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-4 md:mb-8 lg:mb-12">
            <div className="mb-3 md:mb-4 lg:mb-6">
              <img 
                src="/logo.png" 
                alt="Tenis del Parque - Sotogrande League" 
                className="h-20 md:h-24 lg:h-32 xl:h-40 w-auto mx-auto"
              />
            </div>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 md:gap-3 lg:gap-4 mb-2 md:mb-4">
              <p className="text-base md:text-lg lg:text-xl text-gray-600 font-medium">
                {getSeasonDisplayName(season)}
              </p>
              <span className={`inline-flex items-center px-2 md:px-3 lg:px-4 py-1 md:py-2 rounded-full text-xs md:text-sm font-medium ${
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

      {/* Navigation Tabs - More compact on mobile */}
      <section className="container mx-auto px-2 md:px-4 mb-4 md:mb-6 lg:mb-8">
        <div className="flex justify-center">
          <div className="bg-white rounded-lg p-0.5 md:p-1 shadow-md md:shadow-lg w-full max-w-md md:max-w-none md:w-auto">
            <nav className="flex space-x-0.5 md:space-x-1 lg:space-x-2">
              {[
                { id: 'standings', label: language === 'es' ? 'Clasificación' : 'Standings', icon: '🏆' },
                { id: 'schedule', label: language === 'es' ? 'Calendario' : 'Schedule', icon: '📅' },
                { id: 'matches', label: language === 'es' ? 'Resultados' : 'Results', icon: '🎾' },
                { id: 'register', label: language === 'es' ? 'Inscribirse' : 'Register', icon: '✍️' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center justify-center space-x-1 md:space-x-2 px-2 md:px-4 lg:px-6 py-2 md:py-3 rounded-lg font-medium transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-parque-purple text-white shadow-md'
                      : 'text-gray-600 hover:text-parque-purple hover:bg-parque-bg/50'
                  }`}
                >
                  <span className="text-xs md:text-sm lg:text-lg">{tab.icon}</span>
                  <span className="text-[10px] md:text-xs lg:text-sm font-semibold">
                    {/* Mobile: Show abbreviated labels */}
                    <span className="sm:hidden">
                      {tab.id === 'standings' && (language === 'es' ? 'Clas.' : 'Stand.')}
                      {tab.id === 'schedule' && (language === 'es' ? 'Cal.' : 'Sched.')}
                      {tab.id === 'matches' && (language === 'es' ? 'Result.' : 'Results')}
                      {tab.id === 'register' && (language === 'es' ? 'Reg.' : 'Reg.')}
                    </span>
                    {/* Desktop: Show full labels */}
                    <span className="hidden sm:inline">{tab.label}</span>
                  </span>
                </button>
              ))}
            </nav>
          </div>
        </div>
      </section>

      {/* Content Sections - Adjusted padding for mobile */}
      <section className="container mx-auto px-2 md:px-4 pb-4 md:pb-8 lg:pb-16">
        {activeTab === 'standings' && (
          <div className="max-w-[1400px] mx-auto">
            <div className="bg-white rounded-lg md:rounded-xl shadow-md md:shadow-lg p-3 md:p-6 lg:p-8">
              <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-parque-purple mb-3 md:mb-4 lg:mb-6">
                {language === 'es' ? 'Clasificación General' : 'League Standings'}
              </h2>
              
              {standings && standings.unifiedStandings ? (
                <div>
                  <StandingsTable 
                    players={standings.unifiedStandings} 
                    language={language}
                    unified={true}
                  />
                  
                  {/* Add the Scoring System component here */}
                  <ScoringSystem 
                    language={language}
                    totalPlayers={standings.totalPlayers || standings.unifiedStandings.length}
                    currentRound={standings.currentRound || 1}
                  />
                </div>
              ) : (
                <div className="text-center py-8 md:py-12 text-gray-500">
                  <span className="text-3xl md:text-4xl mb-3 md:mb-4 block">🏆</span>
                  <p className="text-sm md:text-base">
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
            <div className="bg-white rounded-lg md:rounded-xl shadow-md md:shadow-lg p-3 md:p-6 lg:p-8">
              <ScheduleTab 
                schedule={schedule} 
                language={language}
                totalRounds={totalRounds}
                player={null}
                isPublic={true}
              />
            </div>
          </div>
        )}

        {activeTab === 'matches' && (
          <div className="max-w-[1200px] mx-auto">
            <div className="bg-white rounded-lg md:rounded-xl shadow-md md:shadow-lg p-3 md:p-6 lg:p-8">
              <ResultsTab matches={matches} language={language} />
            </div>
          </div>
        )}

        {activeTab === 'register' && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg md:rounded-xl shadow-md md:shadow-lg p-3 md:p-6 lg:p-8">
              <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-parque-purple mb-3 md:mb-4 lg:mb-6 text-center">
                {language === 'es' ? 'Inscribirse en la Liga' : 'Register for the League'}
              </h2>
              
              {currentSeason.status === 'registration_open' ? (
                <div className="text-center">
                  <div className="text-3xl md:text-4xl mb-3 md:mb-4">✍️</div>
                  <p className="text-gray-700 mb-4 md:mb-6 text-sm md:text-base">
                    {language === 'es' 
                      ? '¡Las inscripciones están abiertas! Haz clic en el botón de abajo para registrarte.'
                      : 'Registration is open! Click the button below to sign up.'}
                  </p>
                  <a 
                    href={`/${locale}/${locale === 'es' ? 'registro' : 'signup'}/${league.slug}`}
                    className="inline-block bg-parque-purple text-white px-6 md:px-8 py-2 md:py-3 rounded-full hover:bg-parque-purple/90 transition-colors font-medium text-sm md:text-base"
                  >
                    {language === 'es' ? 'Inscribirse Ahora' : 'Register Now'}
                  </a>
                </div>
              ) : (
                <div className="text-center">
                  <div className="text-3xl md:text-4xl mb-3 md:mb-4">⏳</div>
                  <p className="text-gray-700 text-sm md:text-base">
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