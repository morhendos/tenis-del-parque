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
import PlayoffsTab from '@/components/player/PlayoffsTab'
import { getSeasonDisplayName } from '@/lib/utils/seasonUtils.client'
import { TennisPreloaderFullScreen } from '@/components/ui/TennisPreloader'

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
  const [tabsRef, setTabsRef] = useState(null)
  const [tabsOriginalTop, setTabsOriginalTop] = useState(0)
  const [playoffData, setPlayoffData] = useState(null)
  const [loadingPlayoffs, setLoadingPlayoffs] = useState(false)

  const t = homeContent[language]

  useEffect(() => {
    fetchLeagueData()
  }, [location, season, locale])

  // Fetch playoff data when playoffs tab is selected
  useEffect(() => {
    if (activeTab === 'playoffs' && league?.slug && !playoffData) {
      fetchPlayoffData()
    }
  }, [activeTab, league?.slug])

  // If register tab is active but registration is closed, switch to standings
  useEffect(() => {
    if (activeTab === 'register' && currentSeason && currentSeason.status !== 'registration_open') {
      setActiveTab('standings')
    }
  }, [activeTab, currentSeason])

  // Calculate original position of tabs when component mounts
  useEffect(() => {
    if (tabsRef && !isTabsSticky) {
      const rect = tabsRef.getBoundingClientRect()
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop
      setTabsOriginalTop(rect.top + scrollTop)
    }
  }, [tabsRef, isTabsSticky])

  // Handle scroll effect for sticky tabs - precise positioning
  useEffect(() => {
    let ticking = false
    
    const handleScroll = () => {
      if (!ticking && tabsOriginalTop > 0) {
        requestAnimationFrame(() => {
          const scrollTop = window.pageYOffset || document.documentElement.scrollTop
          // Make tabs sticky when scroll position reaches the original tabs position (with small offset for smoother UX)
          setIsTabsSticky(scrollTop >= tabsOriginalTop + 1)
          ticking = false
        })
        ticking = true
      }
    }

    if (tabsOriginalTop > 0) {
      window.addEventListener('scroll', handleScroll, { passive: true })
      // Check initial position
      handleScroll()
    }

    return () => window.removeEventListener('scroll', handleScroll)
  }, [tabsOriginalTop])

  const fetchPlayoffData = async () => {
    if (!league?.slug) return
    
    setLoadingPlayoffs(true)
    try {
      const response = await fetch(`/api/leagues/${league.slug}/playoffs`)
      const data = await response.json()
      
      if (data.success) {
        setPlayoffData(data)
      }
    } catch (error) {
      console.error('Error fetching playoff data:', error)
    } finally {
      setLoadingPlayoffs(false)
    }
  }

  const fetchLeagueData = async () => {
    try {
      setLoading(true)
      
      // Fetch league data by location and season
      const leagueRes = await fetch(`/api/leagues/location/${location}?season=${season}`)
      if (!leagueRes.ok) throw new Error('League not found')
      const leagueData = await leagueRes.json()
      
      setLeague(leagueData.league)
      
      if (leagueData.league.config?.roundsPerSeason) {
        setTotalRounds(leagueData.league.config.roundsPerSeason)
      }
      
      // Use the league slug for API calls instead of location
      const leagueSlug = leagueData.league.slug
      
      // Build season key with proper validation and fallbacks
      let dbSeasonKey = 'summer-2025' // default fallback
      
      if (leagueData.league.season && 
          leagueData.league.season.type && 
          leagueData.league.season.year) {
        dbSeasonKey = `${leagueData.league.season.type}-${leagueData.league.season.year}`
      } else {
        console.warn('League season data incomplete, using fallback:', leagueData.league.season)
      }
      
      // Set current season info
      if (leagueData.league.season && 
          leagueData.league.season.type && 
          leagueData.league.season.year) {
        setCurrentSeason({
          ...leagueData.league.season,
          dbKey: dbSeasonKey,
          displayName: getSeasonDisplayName(leagueData.league.season, language)
        })
      } else {
        // Create fallback season for leagues with incomplete season data
        setCurrentSeason({
          type: 'summer',
          year: 2025,
          dbKey: dbSeasonKey,
          displayName: language === 'es' ? 'Verano 2025' : 'Summer 2025'
        })
      }
      
      // Fetch standings using league slug
      try {
        const standingsRes = await fetch(`/api/leagues/${leagueSlug}/standings?season=${dbSeasonKey}`)
        if (standingsRes.ok) {
          const standingsData = await standingsRes.json()
          setStandings(standingsData)
        }
      } catch (err) {
        console.log('Standings not available for this league')
      }
      
      // Fetch completed matches using league slug
      try {
        const matchesRes = await fetch(`/api/leagues/${leagueSlug}/matches?season=${dbSeasonKey}&status=completed&limit=200`)
        if (matchesRes.ok) {
          const matchesData = await matchesRes.json()
          setMatches(matchesData.matches || [])
        }
      } catch (err) {
        console.log('Matches not available for this league')
      }
      
      // Fetch scheduled matches using league slug
      try {
        const scheduleRes = await fetch(`/api/leagues/${leagueSlug}/matches?season=${dbSeasonKey}&status=scheduled&limit=200`)
        if (scheduleRes.ok) {
          const scheduleData = await scheduleRes.json()
          setSchedule(scheduleData.matches || [])
          console.log(`LeagueSeasonPage: Received ${scheduleData.matches?.length || 0} scheduled matches from API`)
        }
      } catch (err) {
        console.log('Schedule not available for this league')
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

        <TennisPreloaderFullScreen 
          text={language === 'es' ? 'Cargando información de la liga...' : 'Loading league information...'}
          locale={language}
        />
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
      <section 
        ref={(el) => setTabsRef(el)}
        className={`transition-all duration-300 ${
          isTabsSticky 
            ? 'fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-lg' 
            : 'relative'
        }`}
      >
        <div className="container mx-auto px-4 py-3">
          <nav className="flex justify-center">
            <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
              {[
                { id: 'standings', label: language === 'es' ? 'Clasificación' : 'Standings' },
                { id: 'schedule', label: language === 'es' ? 'Calendario' : 'Schedule' },
                { id: 'matches', label: language === 'es' ? 'Resultados' : 'Results' },
                { id: 'playoffs', label: language === 'es' ? 'Playoffs' : 'Playoffs' },
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
                      {tab.id === 'playoffs' && 'Playoffs'}
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
                  {/* League Progress Summary */}
                  {(matches.length > 0 || schedule.length > 0) && (
                    <div className="mb-6 bg-gray-50 rounded-lg p-4">
                      <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-3">
                        {language === 'es' ? 'Progreso de la Liga' : 'League Progress'}
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="text-center">
                          <div className="text-xl md:text-2xl font-bold text-gray-900">
                            {matches.length + schedule.length}
                          </div>
                          <div className="text-xs md:text-sm text-gray-600">
                            {language === 'es' ? 'Total Partidos' : 'Total Matches'}
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-xl md:text-2xl font-bold text-green-600">
                            {matches.length}
                          </div>
                          <div className="text-xs md:text-sm text-gray-600">
                            {language === 'es' ? 'Completados' : 'Completed'}
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-xl md:text-2xl font-bold text-blue-600">
                            {schedule.length}
                          </div>
                          <div className="text-xs md:text-sm text-gray-600">
                            {language === 'es' ? 'Programados' : 'Scheduled'}
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-xl md:text-2xl font-bold text-parque-purple">
                            {standings.currentRound || 1}
                          </div>
                          <div className="text-xs md:text-sm text-gray-600">
                            {language === 'es' ? 'Ronda Actual' : 'Current Round'}
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full transition-all duration-300"
                          style={{ 
                            width: `${(matches.length + schedule.length) > 0 ? (matches.length / (matches.length + schedule.length)) * 100 : 0}%` 
                          }}
                        ></div>
                      </div>
                      <div className="mt-2 text-center text-xs md:text-sm text-gray-600">
                        {(matches.length + schedule.length) > 0 && (
                          <>
                            {matches.length} {language === 'es' ? 'completados de' : 'completed out of'} {matches.length + schedule.length} {language === 'es' ? 'partidos' : 'matches'} 
                            ({Math.round((matches.length / (matches.length + schedule.length)) * 100)}% {language === 'es' ? 'completo' : 'complete'})
                          </>
                        )}
                      </div>
                    </div>
                  )}
                  
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

        {activeTab === 'playoffs' && (
          <div className="max-w-[1400px] mx-auto">
            <div className="bg-white rounded-lg md:rounded-xl shadow-md md:shadow-lg p-3 md:p-6 lg:p-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 md:mb-6">
                <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-parque-purple mb-2 sm:mb-0">
                  {language === 'es' ? 'Playoffs' : 'Playoffs'}
                </h2>
                <div className="flex items-center gap-3">
                  <span className="text-sm md:text-base text-gray-600 font-medium">
                    {currentSeason ? currentSeason.name : getSeasonDisplayName(season, language)}
                  </span>
                  {playoffData?.currentPhase && playoffData.currentPhase !== 'regular_season' && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      {playoffData.currentPhase === 'playoffs_groupA' && 
                        (language === 'es' ? 'Grupo A Activo' : 'Group A Active')
                      }
                      {playoffData.currentPhase === 'playoffs_groupB' && 
                        (language === 'es' ? 'Grupo B Activo' : 'Group B Active')
                      }
                      {playoffData.currentPhase === 'completed' && 
                        (language === 'es' ? 'Playoffs Completados' : 'Playoffs Completed')
                      }
                    </span>
                  )}
                </div>
              </div>
              
              {loadingPlayoffs ? (
                <div className="flex items-center justify-center min-h-[400px]">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-parque-purple"></div>
                </div>
              ) : (
                <PlayoffsTab
                  playoffConfig={playoffData?.playoffConfig}
                  matches={playoffData?.matches || []}
                  language={language}
                />
              )}
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