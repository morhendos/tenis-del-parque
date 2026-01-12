'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import { useLeagueData } from '@/lib/hooks/useLeagueData'
import { getLeagueTabs, LEAGUE_TABS, DEFAULT_TOTAL_ROUNDS } from '@/lib/constants/leagueConstants'
import StandingsTable from '@/components/player/StandingsTable'
import ScheduleTab from '@/components/player/ScheduleTab'
import ResultsTab from '@/components/player/ResultsTab'
import PlayoffsTab from '@/components/player/PlayoffsTab'
import PlayoffExplanation from '@/components/player/PlayoffExplanation'
import LeagueTabs from '@/components/player/LeagueTabs'
import CountdownCard from '@/components/player/CountdownCard'
import { TennisPreloaderInline } from '@/components/ui/TennisPreloader'

// Helper to categorize registrations
function categorizeRegistrations(registrations) {
  const categories = {
    active: [],
    upcoming: [],
    past: []
  }
  
  registrations.forEach(reg => {
    const league = reg.league
    if (!league) return
    
    const status = league.status
    const playoffPhase = league.playoffConfig?.currentPhase
    
    // Active: status is 'active' OR currently in playoffs (not completed)
    if (status === 'active' || 
        (playoffPhase && playoffPhase !== 'regular_season' && playoffPhase !== 'completed')) {
      categories.active.push(reg)
    }
    // Upcoming: registration open or coming soon
    else if (status === 'registration_open' || status === 'coming_soon') {
      categories.upcoming.push(reg)
    }
    // Past: completed or archived
    else if (status === 'completed' || status === 'archived') {
      categories.past.push(reg)
    }
    // Default to active if status is unclear but has matches
    else if (reg.stats?.matchesPlayed > 0) {
      categories.active.push(reg)
    }
    // Otherwise treat as upcoming
    else {
      categories.upcoming.push(reg)
    }
  })
  
  return categories
}

// Helper to format season display
function formatSeasonDisplay(league, language) {
  if (!league?.season) return null
  
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
  
  const season = league.season
  const seasonType = season.type || 'summer'
  const seasonYear = season.year || 2025
  
  const localizedSeasonName = seasonNames[language || 'es'][seasonType] || seasonType
  return `${localizedSeasonName} ${seasonYear}`
}

// League Header Component - shows current league info (collapsible if multiple leagues)
function LeagueHeader({ 
  registrations, 
  currentLeagueId, 
  onLeagueChange, 
  language,
  currentLeague 
}) {
  const hasMultipleLeagues = registrations && registrations.length > 1
  const [isExpanded, setIsExpanded] = useState(false)
  const categories = useMemo(() => categorizeRegistrations(registrations || []), [registrations])
  
  const getStatusBadge = (league) => {
    const status = league?.status
    const playoffPhase = league?.playoffConfig?.currentPhase
    
    if (playoffPhase && playoffPhase !== 'regular_season' && playoffPhase !== 'completed') {
      return { 
        text: 'Playoffs', 
        color: 'bg-amber-50 text-amber-700 border-amber-200', 
        dotColor: 'bg-amber-500',
        ringColor: 'ring-amber-500/20'
      }
    }
    if (status === 'active') {
      return { 
        text: language === 'es' ? 'Activa' : 'Active', 
        color: 'bg-emerald-50 text-emerald-700 border-emerald-200', 
        dotColor: 'bg-emerald-500',
        ringColor: 'ring-emerald-500/20'
      }
    }
    if (status === 'registration_open') {
      return { 
        text: language === 'es' ? 'Inscripción' : 'Registration', 
        color: 'bg-violet-50 text-violet-700 border-violet-200', 
        dotColor: 'bg-violet-500',
        ringColor: 'ring-violet-500/20'
      }
    }
    if (status === 'coming_soon') {
      return { 
        text: language === 'es' ? 'Próximamente' : 'Soon', 
        color: 'bg-sky-50 text-sky-700 border-sky-200', 
        dotColor: 'bg-sky-500',
        ringColor: 'ring-sky-500/20'
      }
    }
    if (status === 'completed') {
      return { 
        text: language === 'es' ? 'Completada' : 'Completed', 
        color: 'bg-gray-50 text-gray-600 border-gray-200', 
        dotColor: 'bg-gray-400',
        ringColor: 'ring-gray-400/20'
      }
    }
    return { text: '', color: '', dotColor: 'bg-gray-400', ringColor: 'ring-gray-400/20' }
  }

  const handleLeagueSelect = (leagueId) => {
    onLeagueChange(leagueId)
    setIsExpanded(false)
  }

  const renderLeagueCard = (registration) => {
    const isSelected = currentLeagueId === registration.league?._id
    const badge = getStatusBadge(registration.league)
    const seasonDisplay = formatSeasonDisplay(registration.league, language)
    const leagueName = registration.league?.name || 'Liga'
    const location = registration.league?.location?.city
    
    return (
      <button
        key={registration._id}
        onClick={() => handleLeagueSelect(registration.league._id)}
        className={`w-full text-left p-3 rounded-xl transition-all duration-200 ${
          isSelected
            ? 'bg-gradient-to-r from-parque-purple to-purple-600 text-white shadow-lg shadow-purple-500/25 ring-2 ring-purple-500/50'
            : 'bg-white hover:bg-gray-50 border border-gray-200 hover:border-gray-300 hover:shadow-sm'
        }`}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              {!isSelected && (
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${badge.dotColor}`} />
              )}
              <span className={`font-semibold truncate ${isSelected ? 'text-white' : 'text-gray-900'}`}>
                {leagueName}
              </span>
            </div>
            {(seasonDisplay || location) && (
              <div className={`text-xs mt-0.5 ${isSelected ? 'text-white/80' : 'text-gray-500'} ${!isSelected ? 'ml-4' : ''}`}>
                {[location, seasonDisplay].filter(Boolean).join(' · ')}
              </div>
            )}
          </div>
          {!isSelected && badge.text && (
            <span className={`px-2 py-0.5 text-[10px] font-medium rounded-full border flex-shrink-0 ${badge.color}`}>
              {badge.text}
            </span>
          )}
          {isSelected && (
            <svg className="w-5 h-5 text-white/90 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
      </button>
    )
  }

  const currentBadge = getStatusBadge(currentLeague)
  const currentSeasonDisplay = formatSeasonDisplay(currentLeague, language)

  // For single league, show a simpler non-expandable header
  if (!hasMultipleLeagues) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3.5">
          <div className="flex items-center gap-3 min-w-0">
            <div className={`w-3 h-3 rounded-full flex-shrink-0 ${currentBadge.dotColor} ring-4 ${currentBadge.ringColor}`} />
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-900 truncate">
                  {currentLeague?.name || 'Liga'}
                </span>
                {currentSeasonDisplay && (
                  <span className="text-gray-400 font-normal hidden sm:inline">·</span>
                )}
                {currentSeasonDisplay && (
                  <span className="text-gray-500 font-normal text-sm hidden sm:inline">
                    {currentSeasonDisplay}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                {currentLeague?.location?.city && (
                  <span className="flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {currentLeague.location.city}
                  </span>
                )}
                {currentSeasonDisplay && (
                  <span className="sm:hidden">· {currentSeasonDisplay}</span>
                )}
              </div>
            </div>
          </div>
          {currentBadge.text && (
            <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${currentBadge.color}`}>
              {currentBadge.text}
            </span>
          )}
        </div>
      </div>
    )
  }

  // For multiple leagues, show expandable selector
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Collapsed Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-gray-50/50 transition-colors"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className={`w-3 h-3 rounded-full flex-shrink-0 ${currentBadge.dotColor} ring-4 ${currentBadge.ringColor}`} />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-900 truncate">
                {currentLeague?.name || 'Liga'}
              </span>
              {currentSeasonDisplay && (
                <span className="text-gray-400 font-normal hidden sm:inline">·</span>
              )}
              {currentSeasonDisplay && (
                <span className="text-gray-500 font-normal text-sm hidden sm:inline">
                  {currentSeasonDisplay}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
              {currentLeague?.location?.city && (
                <span className="flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {currentLeague.location.city}
                </span>
              )}
              {currentSeasonDisplay && (
                <span className="sm:hidden">· {currentSeasonDisplay}</span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          {currentBadge.text && (
            <span className={`px-2.5 py-1 text-xs font-medium rounded-full border hidden sm:inline ${currentBadge.color}`}>
              {currentBadge.text}
            </span>
          )}
          <div className="flex items-center gap-1.5 text-gray-400">
            <span className="text-xs hidden sm:inline">
              {registrations.length} {language === 'es' ? 'ligas' : 'leagues'}
            </span>
            <svg 
              className={`w-5 h-5 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </button>
      
      {/* Expanded Content */}
      <div className={`transition-all duration-200 ease-in-out overflow-hidden ${
        isExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
      }`}>
        <div className="px-4 pb-4 space-y-4 border-t border-gray-100 pt-4 bg-gray-50/50">
          {/* Active Leagues */}
          {categories.active.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">
                  {language === 'es' ? 'Activas' : 'Active'}
                </span>
                <div className="flex-1 h-px bg-emerald-200/50" />
              </div>
              <div className="space-y-2">
                {categories.active.map(reg => renderLeagueCard(reg))}
              </div>
            </div>
          )}
          
          {/* Upcoming Leagues */}
          {categories.upcoming.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2.5">
                <div className="w-1.5 h-1.5 rounded-full bg-violet-500" />
                <span className="text-xs font-semibold text-violet-700 uppercase tracking-wider">
                  {language === 'es' ? 'Próximas' : 'Upcoming'}
                </span>
                <div className="flex-1 h-px bg-violet-200/50" />
              </div>
              <div className="space-y-2">
                {categories.upcoming.map(reg => renderLeagueCard(reg))}
              </div>
            </div>
          )}
          
          {/* Past Leagues */}
          {categories.past.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2.5">
                <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {language === 'es' ? 'Pasadas' : 'Past'}
                </span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>
              <div className="space-y-2">
                {categories.past.map(reg => renderLeagueCard(reg))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

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

  // Clear playoff data when league changes
  useEffect(() => {
    setPlayoffData(null)
  }, [currentLeague?.slug])

  // Handle tab query parameter
  useEffect(() => {
    const tabParam = searchParams.get('tab')
    if (tabParam && Object.values(LEAGUE_TABS).includes(tabParam)) {
      setActiveTab(tabParam)
    }
  }, [searchParams])

  // Fetch playoff data when playoffs tab is selected
  // BUT only for leagues that are active or completed (not upcoming)
  useEffect(() => {
    const status = currentLeague?.status
    const slug = currentLeague?.slug
    
    // Skip fetching for leagues that haven&apos;t started
    if (status === 'registration_open' || status === 'coming_soon') {
      return
    }
    
    // Fetch if: on playoffs tab AND (no data OR data is for different league)
    if (activeTab === LEAGUE_TABS.PLAYOFFS && slug && (!playoffData || playoffData._forLeague !== slug)) {
      fetchPlayoffData(slug)
    }
  }, [activeTab, currentLeague?.slug, currentLeague?.status, playoffData?._forLeague])

  const fetchPlayoffData = async (leagueSlug) => {
    if (!leagueSlug) return
    
    setLoadingPlayoffs(true)
    try {
      const response = await fetch(`/api/leagues/${leagueSlug}/playoffs`)
      const data = await response.json()
      
      // IMPORTANT: Store which league this data is for
      if (data.success) {
        setPlayoffData({ ...data, _forLeague: leagueSlug })
      } else {
        setPlayoffData({ 
          success: false, 
          noPlayoffs: true,
          _forLeague: leagueSlug
        })
      }
    } catch (error) {
      console.error('Error fetching playoff data:', error)
      setPlayoffData({ success: false, error: true, _forLeague: leagueSlug })
    } finally {
      setLoadingPlayoffs(false)
    }
  }

  // Handle league change
  const handleLeagueChange = (leagueId) => {
    // Update URL with new leagueId
    const url = new URL(window.location.href)
    url.searchParams.set('leagueId', leagueId)
    
    // Keep current tab
    const currentTab = searchParams.get('tab')
    if (currentTab) {
      url.searchParams.set('tab', currentTab)
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
      {/* League Header - shows for all users, expandable if multiple leagues */}
      <LeagueHeader
        registrations={allRegistrations}
        currentLeagueId={currentLeague._id}
        currentLeague={currentLeague}
        onLeagueChange={handleLeagueChange}
        language={language}
      />

      {/* Countdown Card for upcoming leagues */}
      <CountdownCard 
        leagueName={currentLeague.name}
        location={currentLeague.location?.city}
        startDate={currentLeague.seasonConfig?.startDate}
        status={currentLeague.status}
        playerCount={currentLeague.playerCount}
        language={language}
        showQuote={true}
      />

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
                    playoffConfig={currentLeague?.playoffConfig}
                  />
                  <PlayoffExplanation language={language} playoffConfig={currentLeague?.playoffConfig} />
                </>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {currentLeague?.status === 'registration_open' || currentLeague?.status === 'coming_soon'
                      ? (language === 'es' ? 'Liga aún no iniciada' : 'League not started yet')
                      : (language === 'es' ? 'Sin clasificación' : 'No standings')}
                  </h3>
                  <p className="text-gray-500 text-sm">
                    {currentLeague?.status === 'registration_open' || currentLeague?.status === 'coming_soon'
                      ? (language === 'es' 
                          ? 'La clasificación se mostrará cuando comience la temporada' 
                          : 'Standings will appear when the season starts')
                      : (language === 'es' 
                          ? 'No hay datos de clasificación disponibles' 
                          : 'No standings data available')}
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
            // For leagues that haven&apos;t started, show empty state immediately
            (currentLeague?.status === 'registration_open' || currentLeague?.status === 'coming_soon') ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {language === 'es' ? 'Playoffs no disponibles' : 'Playoffs not available'}
                </h3>
                <p className="text-gray-500 text-sm">
                  {language === 'es' 
                    ? 'Los playoffs comenzarán cuando finalice la temporada regular' 
                    : 'Playoffs will begin after the regular season ends'}
                </p>
              </div>
            ) : loadingPlayoffs || !playoffData || playoffData._forLeague !== currentLeague?.slug ? (
              // Loading, no data, or data is for wrong league
              <TennisPreloaderInline 
                text={language === 'es' ? 'Cargando playoffs...' : 'Loading playoffs...'}
                locale={language}
              />
            ) : playoffData.noPlayoffs || !playoffData.success ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {language === 'es' ? 'Playoffs no activos' : 'Playoffs not active'}
                </h3>
                <p className="text-gray-500 text-sm">
                  {language === 'es' 
                    ? 'Esta liga aún no tiene playoffs activos' 
                    : 'This league does not have active playoffs yet'}
                </p>
              </div>
            ) : (
              <PlayoffsTab
                playoffConfig={playoffData.playoffConfig}
                matches={playoffData.matches || []}
                language={language}
              />
            )
          )}
      </div>
    </div>
  )
}
