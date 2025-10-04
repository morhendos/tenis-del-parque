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
import { TennisPreloaderInline } from '@/components/ui/TennisPreloader'

export default function PlayerLeague() {
  const [activeTab, setActiveTab] = useState(LEAGUE_TABS.STANDINGS)
  console.log('Current active tab:', activeTab) // Debug log
  const [playoffData, setPlayoffData] = useState(null)
  const [loadingPlayoffs, setLoadingPlayoffs] = useState(false)
  const { standings, matches, schedule, loading, error, player, refetch } = useLeagueData()
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
    if (player?.league?.season) {
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
      
      const season = player.league.season
      const seasonType = season.type || 'summer'
      const seasonYear = season.year || 2025
      const seasonNumber = season.number > 1 ? ` ${season.number}` : ''
      
      const localizedSeasonName = seasonNames[language || 'es'][seasonType] || seasonType
      return `${localizedSeasonName} ${seasonYear}${seasonNumber}`
    }
    
    // Fallback: If we have a string that looks like a season name, use it
    if (player?.season && typeof player.season === 'string') {
      // Check if it's an ObjectId (24 hex characters) or a proper season name
      if (/^[0-9a-f]{24}$/i.test(player.season)) {
        // It's an ObjectId, show a default season
        return language === 'es' ? 'Verano 2025' : 'Summer 2025'
      }
      // It might be a proper season name, return it
      return player.season
    }
    
    // Default fallback
    return language === 'es' ? 'Temporada Actual' : 'Current Season'
  }

  // Handle tab query parameter
  useEffect(() => {
    const tabParam = searchParams.get('tab')
    console.log('Tab param from URL:', tabParam) // Debug log
    console.log('Available tabs:', Object.values(LEAGUE_TABS)) // Debug log
    console.log('Current URL:', window.location.href) // Debug log
    
    if (tabParam && Object.values(LEAGUE_TABS).includes(tabParam)) {
      console.log('Setting active tab to:', tabParam) // Debug log
      setActiveTab(tabParam)
    } else if (tabParam) {
      console.log('Invalid tab param:', tabParam) // Debug log
    }
  }, [searchParams])

  // Also check on mount in case useSearchParams has issues
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const tabParam = urlParams.get('tab')
    console.log('Tab param from window.location:', tabParam) // Debug log
    
    if (tabParam && Object.values(LEAGUE_TABS).includes(tabParam)) {
      console.log('Setting active tab from window.location to:', tabParam) // Debug log
      setActiveTab(tabParam)
    }
  }, [])

  // Fetch playoff data when playoffs tab is selected
  useEffect(() => {
    if (activeTab === LEAGUE_TABS.PLAYOFFS && player?.league?.slug && !playoffData) {
      fetchPlayoffData()
    }
  }, [activeTab, player?.league?.slug])

  const fetchPlayoffData = async () => {
    if (!player?.league?.slug) return
    
    setLoadingPlayoffs(true)
    try {
      const response = await fetch(`/api/leagues/${player.league.slug}/playoffs`)
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

  // Show loading until data is loaded
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <TennisPreloaderInline 
          text={language === 'es' ? 'Cargando datos de la liga...' : 'Loading league data...'}
          locale={language}
        />
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

  if (!player?.league) {
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
      {/* League Header */}
      <div className="bg-gradient-to-r from-parque-purple via-purple-600 to-indigo-600 rounded-xl shadow-lg overflow-hidden">
        <div className="px-6 py-8 sm:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center space-x-4">
              <div>
                <h1 className="text-3xl font-bold text-white">{player.league.name}</h1>
                <p className="text-purple-100 mt-1">
                  {language === 'es' ? 'Temporada' : 'Season'}: {getSeasonDisplayName()}
                </p>
                <p className="text-purple-200 text-sm mt-1">
                  {language === 'es' ? 'Tu ELO' : 'Your ELO'}: {player.eloRating || 1200}
                </p>
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
              <div className="flex items-center justify-center min-h-[400px]">
                <TennisPreloaderInline 
                  text={language === 'es' ? 'Cargando playoffs...' : 'Loading playoffs...'}
                  locale={language}
                />
              </div>
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
    </div>
  )
}