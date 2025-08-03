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
import { getSeasonDisplayName } from '@/lib/utils/seasonUtils.client'

export default function LeagueSeasonPage() {
  const params = useParams()
  const { locale, location, season } = params
  const language = locale || 'es'
  
  const [league, setLeague] = useState(null)
  const [currentSeason, setCurrentSeason] = useState(null)
  const [standings, setStandings] = useState(null)
  const [matches, setMatches] = useState([])
  const [schedule, setSchedule] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('standings')
  const [totalRounds, setTotalRounds] = useState(8)
  const [showNavigation, setShowNavigation] = useState(false)
  const [isTabsSticky, setIsTabsSticky] = useState(false)

  const t = homeContent[language]

  useEffect(() => {
    fetchLeagueData()
  }, [location, season, locale])

  // If register tab is active but registration is closed, switch to standings
  useEffect(() => {
    if (activeTab === 'register' && currentSeason && currentSeason.status !== 'registration_open') {
      setActiveTab('standings')
    }
  }, [activeTab, currentSeason])

  // Handle scroll effect for sticky tabs
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY
      // Make tabs sticky when we scroll past the hero section (roughly 150px since it's more compact now)
      setIsTabsSticky(scrollTop > 150)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const fetchLeagueData = async () => {
    try {
      setLoading(true)
      
      // Fetch league data
      const leagueRes = await fetch(`/api/leagues/${location}`)
      if (!leagueRes.ok) throw new Error('League not found')
      const leagueData = await leagueRes.json()
      
      // Find the season using the API
      const seasonRes = await fetch(`/api/seasons/${season}?language=${language}`)
      if (!seasonRes.ok) {
        throw new Error(`Season ${season} not found`)
      }
      const seasonObj = await seasonRes.json()
      
      setLeague(leagueData.league)
      setCurrentSeason(seasonObj)
      
      if (leagueData.league.config?.roundsPerSeason) {
        setTotalRounds(leagueData.league.config.roundsPerSeason)
      }
      
      // Use the season's database key for API calls
      const dbSeasonKey = seasonObj.dbKey // e.g., "summer-2025"
      
      // Fetch standings
      const standingsRes = await fetch(`/api/leagues/${location}/standings?season=${dbSeasonKey}`)
      if (standingsRes.ok) {
        const standingsData = await standingsRes.json()
        setStandings(standingsData)
      }
      
      // Fetch completed matches
      const matchesRes = await fetch(`/api/leagues/${location}/matches?season=${dbSeasonKey}&status=completed&limit=200`)
      if (matchesRes.ok) {
        const matchesData = await matchesRes.json()
        setMatches(matchesData.matches || [])
      }
      
      // Fetch scheduled matches
      const scheduleRes = await fetch(`/api/leagues/${location}/matches?season=${dbSeasonKey}&status=scheduled&limit=200`)
      if (scheduleRes.ok) {
        const scheduleData = await scheduleRes.json()
        console.log(`LeagueSeasonPage: Received ${scheduleData.matches?.length || 0} scheduled matches from API`)
        console.log(`LeagueSeasonPage: Matches by round:`, (scheduleData.matches || []).reduce((acc, match) => {
          acc[match.round] = (acc[match.round] || 0) + 1
          return acc
        }, {}))
        setSchedule(scheduleData.matches || [])
      }
      
    } catch (err) {
      console.error('Error fetching league data:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }



  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-parque-bg via-white to-white">
        {showNavigation && <Navigation currentPage="league" />}
        
        {/* Navigation Toggle Button */}
        <button
          onClick={() => setShowNavigation(!showNavigation)}
          className="fixed top-4 right-4 z-50 bg-white/90 backdrop-blur-md p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200"
          aria-label={showNavigation ? (language === 'es' ? 'Ocultar menú' : 'Hide menu') : (language === 'es' ? 'Mostrar menú' : 'Show menu')}
        >
          <div className="w-5 h-5 flex flex-col justify-center items-center space-y-1">
            <span className={`block w-4 h-0.5 bg-parque-purple transition-all duration-300 ${showNavigation ? 'rotate-45 translate-y-1.5' : ''}`}></span>
            <span className={`block w-4 h-0.5 bg-parque-purple transition-all duration-300 ${showNavigation ? 'opacity-0' : ''}`}></span>
            <span className={`block w-4 h-0.5 bg-parque-purple transition-all duration-300 ${showNavigation ? '-rotate-45 -translate-y-1.5' : ''}`}></span>
          </div>
        </button>

        <div className={`container mx-auto px-4 text-center transition-all duration-300 ${showNavigation ? 'py-24' : 'py-12'}`}>
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
        {showNavigation && <Navigation currentPage="league" />}
        
        {/* Navigation Toggle Button */}
        <button
          onClick={() => setShowNavigation(!showNavigation)}
          className="fixed top-4 right-4 z-50 bg-white/90 backdrop-blur-md p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200"
          aria-label={showNavigation ? (language === 'es' ? 'Ocultar menú' : 'Hide menu') : (language === 'es' ? 'Mostrar menú' : 'Show menu')}
        >
          <div className="w-5 h-5 flex flex-col justify-center items-center space-y-1">
            <span className={`block w-4 h-0.5 bg-parque-purple transition-all duration-300 ${showNavigation ? 'rotate-45 translate-y-1.5' : ''}`}></span>
            <span className={`block w-4 h-0.5 bg-parque-purple transition-all duration-300 ${showNavigation ? 'opacity-0' : ''}`}></span>
            <span className={`block w-4 h-0.5 bg-parque-purple transition-all duration-300 ${showNavigation ? '-rotate-45 -translate-y-1.5' : ''}`}></span>
          </div>
        </button>

        <div className={`container mx-auto px-4 text-center transition-all duration-300 ${showNavigation ? 'py-24' : 'py-12'}`}>
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-parque-bg via-white to-white">
      {/* Navigation - Only show when toggled */}
      <div className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${showNavigation ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}`}>
        <Navigation currentPage="league" />
      </div>
      
      {/* Navigation Toggle Button */}
      <button
        onClick={() => setShowNavigation(!showNavigation)}
        className={`fixed right-4 z-[60] bg-white/90 backdrop-blur-md p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-parque-purple/30 ${
          isTabsSticky ? 'top-20' : 'top-4'
        }`}
        aria-label={showNavigation ? (language === 'es' ? 'Ocultar menú' : 'Hide menu') : (language === 'es' ? 'Mostrar menú' : 'Show menu')}
      >
        <div className="w-5 h-5 flex flex-col justify-center items-center space-y-1">
          <span className={`block w-4 h-0.5 bg-parque-purple transition-all duration-300 ${showNavigation ? 'rotate-45 translate-y-1.5' : ''}`}></span>
          <span className={`block w-4 h-0.5 bg-parque-purple transition-all duration-300 ${showNavigation ? 'opacity-0' : ''}`}></span>
          <span className={`block w-4 h-0.5 bg-parque-purple transition-all duration-300 ${showNavigation ? '-rotate-45 -translate-y-1.5' : ''}`}></span>
        </div>
      </button>
      
      {/* Hero Section - Logo only, much more prominent */}
      <section className={`relative transition-all duration-300 ${showNavigation ? 'pt-16 md:pt-20 lg:pt-24' : 'pt-8 md:pt-12 lg:pt-16'} pb-4 md:pb-6`}>
        <div className="container mx-auto px-4">
          <div className="text-center">
            <img 
              src="/logo.png" 
              alt="Tenis del Parque - Sotogrande League" 
              className="h-24 md:h-32 lg:h-40 xl:h-48 w-auto mx-auto"
            />
          </div>
        </div>
      </section>

      {/* Navigation Tabs - Clean and Simple */}
      <section className={`transition-all duration-300 ${
        isTabsSticky 
          ? 'fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-lg' 
          : 'relative'
      }`}>
        <div className="container mx-auto px-4 py-3">
          <nav className="flex justify-center">
            <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
              {[
                { id: 'standings', label: language === 'es' ? 'Clasificación' : 'Standings' },
                { id: 'schedule', label: language === 'es' ? 'Calendario' : 'Schedule' },
                { id: 'matches', label: language === 'es' ? 'Resultados' : 'Results' },
                ...(currentSeason && currentSeason.status === 'registration_open' ? [{ id: 'register', label: language === 'es' ? 'Inscribirse' : 'Register' }] : [])
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 md:px-6 py-2 rounded-md font-medium transition-all duration-200 pointer-events-auto cursor-pointer ${
                    activeTab === tab.id
                      ? 'bg-white text-parque-purple shadow-sm' 
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <span className="text-sm font-semibold">
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
            </div>
          </nav>
        </div>
      </section>

      {/* Spacer when tabs are sticky to prevent content jump */}
      {isTabsSticky && <div className="h-16 md:h-20"></div>}

      {/* Content Sections - Adjusted padding for mobile and sticky tabs */}
      <section className={`container mx-auto px-2 md:px-4 pb-4 md:pb-8 lg:pb-16 ${isTabsSticky ? 'pt-4' : ''}`}>
        {activeTab === 'standings' && (
          <div className="max-w-[1400px] mx-auto">
            <div className="bg-white rounded-lg md:rounded-xl shadow-md md:shadow-lg p-3 md:p-6 lg:p-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 md:mb-6">
                <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-parque-purple mb-2 sm:mb-0">
                  {language === 'es' ? 'Clasificación General' : 'League Standings'}
                </h2>
                <div className="flex items-center gap-3">
                  <span className="text-sm md:text-base text-gray-600 font-medium">
                    {currentSeason ? currentSeason.name : getSeasonDisplayName(season, language)}
                  </span>
                  {currentSeason && (
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      currentSeason.status === 'registration_open' 
                        ? 'bg-green-100 text-green-800' 
                        : currentSeason.status === 'active'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {currentSeason.status === 'registration_open' && 
                        (language === 'es' ? 'Inscripciones Abiertas' : 'Registration Open')
                      }
                      {currentSeason.status === 'active' && 
                        (language === 'es' ? 'Liga Activa' : 'League Active')
                      }
                      {currentSeason.status === 'completed' && 
                        (language === 'es' ? 'Temporada Finalizada' : 'Season Completed')
                      }
                      {currentSeason.status === 'upcoming' && 
                        (language === 'es' ? 'Próximamente' : 'Coming Soon')
                      }
                    </span>
                  )}
                </div>
              </div>
              
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
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 md:mb-6">
                <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-parque-purple mb-2 sm:mb-0">
                  {language === 'es' ? 'Calendario de Partidos' : 'Match Schedule'}
                </h2>
                <div className="flex items-center gap-3">
                  <span className="text-sm md:text-base text-gray-600 font-medium">
                    {currentSeason ? currentSeason.name : getSeasonDisplayName(season, language)}
                  </span>
                  {currentSeason && (
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      currentSeason.status === 'registration_open' 
                        ? 'bg-green-100 text-green-800' 
                        : currentSeason.status === 'active'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {currentSeason.status === 'registration_open' && 
                        (language === 'es' ? 'Inscripciones Abiertas' : 'Registration Open')
                      }
                      {currentSeason.status === 'active' && 
                        (language === 'es' ? 'Liga Activa' : 'League Active')
                      }
                      {currentSeason.status === 'completed' && 
                        (language === 'es' ? 'Temporada Finalizada' : 'Season Completed')
                      }
                      {currentSeason.status === 'upcoming' && 
                        (language === 'es' ? 'Próximamente' : 'Coming Soon')
                      }
                    </span>
                  )}
                </div>
              </div>
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
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 md:mb-6">
                <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-parque-purple mb-2 sm:mb-0">
                  {language === 'es' ? 'Resultados de Partidos' : 'Match Results'}
                </h2>
                <div className="flex items-center gap-3">
                  <span className="text-sm md:text-base text-gray-600 font-medium">
                    {currentSeason ? currentSeason.name : getSeasonDisplayName(season, language)}
                  </span>
                  {currentSeason && (
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      currentSeason.status === 'registration_open' 
                        ? 'bg-green-100 text-green-800' 
                        : currentSeason.status === 'active'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {currentSeason.status === 'registration_open' && 
                        (language === 'es' ? 'Inscripciones Abiertas' : 'Registration Open')
                      }
                      {currentSeason.status === 'active' && 
                        (language === 'es' ? 'Liga Activa' : 'League Active')
                      }
                      {currentSeason.status === 'completed' && 
                        (language === 'es' ? 'Temporada Finalizada' : 'Season Completed')
                      }
                      {currentSeason.status === 'upcoming' && 
                        (language === 'es' ? 'Próximamente' : 'Coming Soon')
                      }
                    </span>
                  )}
                </div>
              </div>
              <ResultsTab matches={matches} language={language} />
            </div>
          </div>
        )}

        {activeTab === 'register' && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg md:rounded-xl shadow-md md:shadow-lg p-3 md:p-6 lg:p-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 md:mb-6">
                <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-parque-purple mb-2 sm:mb-0">
                  {language === 'es' ? 'Inscribirse en la Liga' : 'Register for the League'}
                </h2>
                <div className="flex items-center gap-3">
                  <span className="text-sm md:text-base text-gray-600 font-medium">
                    {currentSeason ? currentSeason.name : getSeasonDisplayName(season, language)}
                  </span>
                  {currentSeason && (
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      currentSeason.status === 'registration_open' 
                        ? 'bg-green-100 text-green-800' 
                        : currentSeason.status === 'active'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {currentSeason.status === 'registration_open' && 
                        (language === 'es' ? 'Inscripciones Abiertas' : 'Registration Open')
                      }
                      {currentSeason.status === 'active' && 
                        (language === 'es' ? 'Liga Activa' : 'League Active')
                      }
                      {currentSeason.status === 'completed' && 
                        (language === 'es' ? 'Temporada Finalizada' : 'Season Completed')
                      }
                      {currentSeason.status === 'upcoming' && 
                        (language === 'es' ? 'Próximamente' : 'Coming Soon')
                      }
                    </span>
                  )}
                </div>
              </div>
              
              {currentSeason && currentSeason.status === 'registration_open' ? (
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