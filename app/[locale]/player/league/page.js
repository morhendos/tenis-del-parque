'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import { useLeagueData } from '@/lib/hooks/useLeagueData'
import { getLeagueTabs, LEAGUE_TABS, DEFAULT_TOTAL_ROUNDS } from '@/lib/constants/leagueConstants'
import StandingsTable from '@/components/player/StandingsTable'
import ScheduleTab from '@/components/player/ScheduleTab'
import ResultsTab from '@/components/player/ResultsTab'
import PlayoffsTab from '@/components/player/PlayoffsTab'
import PlayoffExplanation from '@/components/player/PlayoffExplanation'
import LeagueTabs from '@/components/player/LeagueTabs'
import { TennisPreloaderInline } from '@/components/ui/TennisPreloader'

export default function PlayerLeague() {
  const [activeTab, setActiveTab] = useState(LEAGUE_TABS.STANDINGS)
  const [playoffData, setPlayoffData] = useState(null)
  const [loadingPlayoffs, setLoadingPlayoffs] = useState(false)
  const { standings, matches, schedule, loading, error, player, currentLeague, allRegistrations, refetch } = useLeagueData()
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const locale = params.locale || 'es'
  const language = locale

  // Use tabs from constants - now includes playoffs
  const tabs = getLeagueTabs(language)

  // Function to get season display name
  const getSeasonDisplayName = () => {
    // If league has season information, use it to create a proper name
    if (currentLeague?.season) {
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
      
      const season = currentLeague.season
      const seasonType = season.type || 'summer'
      const seasonYear = season.year || 2025
      
      const localizedSeasonName = seasonNames[language || 'es'][seasonType] || seasonType
      return `${localizedSeasonName} ${seasonYear}`
    }
    
    // Default fallback
    return language === 'es' ? 'Temporada 2025' : 'Season 2025'
  }

  // Handle tab query parameter
  useEffect(() => {
    const tabParam = searchParams.get('tab')
    if (tabParam && Object.values(LEAGUE_TABS).includes(tabParam)) {
      setActiveTab(tabParam)
    }
  }, [searchParams])

  // Fetch playoff data when playoffs tab is selected
  useEffect(() => {
    if (activeTab === LEAGUE_TABS.PLAYOFFS && currentLeague?.slug && !playoffData) {
      fetchPlayoffData()
    }
  }, [activeTab, currentLeague?.slug])

  const fetchPlayoffData = async () => {
    if (!currentLeague?.slug) return
    
    setLoadingPlayoffs(true)
    try {
      const response = await fetch(`/api/leagues/${currentLeague.slug}/playoffs`)
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

  // Handle league change
  const handleLeagueChange = (leagueId) => {
    // Update URL with new leagueId
    const url = new URL(window.location.href)
    url.searchParams.set('leagueId', leagueId)
    if (searchParams.get('tab')) {
      url.searchParams.set('tab', searchParams.get('tab'))
    }
    router.push(url.pathname + url.search)
  }

  // Show loading until data is loaded
  if (loading) {
    return (
      <TennisPreloaderInline 
        text={language === 'es' ? 'Cargando datos de la liga...' : 'Loading league data...'}
        locale={language}
      />
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
              onClick={refetch}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              {language === 'es' ? 'Intentar de nuevo' : 'Try again'}
            </button>
            <button 
              onClick={() => router.push(`/${locale}/login`)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors ml-2"
            >
              {language === 'es' ? 'Ir al login' : 'Go to login'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!currentLeague) {
    return (
      <div className="text-center py-12">
        <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
          <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {language === 'es' ? 'No tienes liga asignada' : 'No league assigned'}
        </h3>
        <p className="text-gray-500 mb-6">
          {language === 'es' 
            ? 'Actualmente no estás asignado a ninguna liga.' 
            : 'You are not currently assigned to any league.'}
        </p>
        <button
          onClick={() => router.push(`/${locale}/leagues`)}
          className="inline-flex items-center px-4 py-2 bg-parque-purple text-white rounded-lg hover:bg-parque-purple/90 transition-colors"
        >
          {language === 'es' ? 'Explorar ligas disponibles' : 'Explore available leagues'}
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* League Selector (if multiple leagues) */}
      {allRegistrations && allRegistrations.length > 1 && (
        <div className="bg-white rounded-xl shadow-md p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600 font-medium flex items-center gap-2">
              <svg className="w-4 h-4 text-parque-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              {language === 'es' ? 'Seleccionar Liga:' : 'Select League:'}
            </p>
            <span className="text-xs text-gray-500">
              {language === 'es' 
                ? `${allRegistrations.length} ligas disponibles` 
                : `${allRegistrations.length} leagues available`}
            </span>
          </div>
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 pt-1 px-1">
            {allRegistrations.map((registration) => (
              <button
                key={registration._id}
                onClick={() => handleLeagueChange(registration.league._id)}
                className={`flex-shrink-0 px-4 py-2.5 rounded-xl font-medium text-sm transition-all ${
                  currentLeague._id === registration.league._id
                    ? 'bg-gradient-to-r from-parque-purple to-purple-700 text-white shadow-lg transform scale-105'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <div className="flex flex-col items-start">
                  <span className="font-semibold">{registration.league.name}</span>
                  {registration.league.location?.city && (
                    <span className="text-xs opacity-75 mt-0.5 flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {registration.league.location.city}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* League Header */}
      <div className="bg-gradient-to-r from-parque-purple via-purple-600 to-indigo-600 rounded-xl shadow-lg overflow-hidden">
        <div className="px-6 py-8 sm:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center space-x-4">
              <div>
                <h1 className="text-3xl font-bold text-white">{currentLeague.name}</h1>
                {currentLeague.location?.city && (
                  <p className="text-purple-200 text-sm mt-0.5 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {currentLeague.location.city}
                  </p>
                )}
                <p className="text-purple-100 mt-1">
                  {language === 'es' ? 'Temporada' : 'Season'}: {getSeasonDisplayName()}
                </p>
                <p className="text-purple-200 text-sm mt-1">
                  {language === 'es' ? 'Tu ELO' : 'Your ELO'}: {player?.eloRating || 1200}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs - Modern Component */}
      <LeagueTabs
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        language={language}
      />

      {/* Tab Content */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden p-6">
          {activeTab === LEAGUE_TABS.STANDINGS && (
            <div>
              {standings && standings.unifiedStandings && standings.unifiedStandings.length > 0 ? (
                <>
                  <StandingsTable 
                    players={standings.unifiedStandings} 
                    language={language}
                    unified={true}
                  />
                  <PlayoffExplanation language={language} />
                </>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500">
                    {language === 'es' 
                      ? 'No hay datos de clasificación disponibles' 
                      : 'No standings data available'}
                  </p>
                </div>
              )}
            </div>
          )}
          
          {activeTab === LEAGUE_TABS.SCHEDULE && (
            <ScheduleTab 
              schedule={schedule}
              language={language}
              totalRounds={DEFAULT_TOTAL_ROUNDS}
              player={player}
            />
          )}
          
          {activeTab === LEAGUE_TABS.RESULTS && (
            <ResultsTab 
              matches={matches}
              language={language}
              player={player}
            />
          )}
          
          {activeTab === LEAGUE_TABS.PLAYOFFS && (
            loadingPlayoffs ? (
              <TennisPreloaderInline 
                text={language === 'es' ? 'Cargando playoffs...' : 'Loading playoffs...'}
                locale={language}
              />
            ) : (
              <PlayoffsTab
                playoffConfig={playoffData?.playoffConfig}
                matches={playoffData?.matches || []}
                language={language}
              />
            )
          )}
      </div>
    </div>
  )
}