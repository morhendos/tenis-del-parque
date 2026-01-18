'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import { useLeagueData } from '@/lib/hooks/useLeagueData'
import { getLeagueTabs, LEAGUE_TABS, DEFAULT_TOTAL_ROUNDS } from '@/lib/constants/leagueConstants'
import StandingsTable from '@/components/player/StandingsTable'
import MatchesTab from '@/components/player/MatchesTab'
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
        headerColor: 'bg-white/20 text-white border-white/30'
      }
    }
    if (status === 'active') {
      return { 
        text: language === 'es' ? 'Activa' : 'Active', 
        color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        headerColor: 'bg-white/20 text-white border-white/30'
      }
    }
    if (status === 'registration_open') {
      return { 
        text: language === 'es' ? 'Inscripción' : 'Registration', 
        color: 'bg-violet-50 text-violet-700 border-violet-200',
        headerColor: 'bg-white/20 text-white border-white/30'
      }
    }
    if (status === 'coming_soon') {
      return { 
        text: language === 'es' ? 'Próximamente' : 'Soon', 
        color: 'bg-sky-50 text-sky-700 border-sky-200',
        headerColor: 'bg-white/20 text-white border-white/30'
      }
    }
    if (status === 'completed') {
      return { 
        text: language === 'es' ? 'Completada' : 'Completed', 
        color: 'bg-gray-50 text-gray-600 border-gray-200',
        headerColor: 'bg-white/20 text-white border-white/30'
      }
    }
    return { text: '', color: '', headerColor: '' }
  }

  const getDropdownStatusBadge = (league) => {
    const status = league?.status
    const playoffPhase = league?.playoffConfig?.currentPhase
    
    if (playoffPhase && playoffPhase !== 'regular_season' && playoffPhase !== 'completed') {
      return { 
        text: 'Playoffs', 
        color: 'bg-amber-50 text-amber-700 border-amber-200', 
        dotColor: 'bg-amber-500'
      }
    }
    if (status === 'active') {
      return { 
        text: language === 'es' ? 'Activa' : 'Active', 
        color: 'bg-emerald-50 text-emerald-700 border-emerald-200', 
        dotColor: 'bg-emerald-500'
      }
    }
    if (status === 'registration_open') {
      return { 
        text: language === 'es' ? 'Inscripción' : 'Registration', 
        color: 'bg-violet-50 text-violet-700 border-violet-200', 
        dotColor: 'bg-violet-500'
      }
    }
    if (status === 'coming_soon') {
      return { 
        text: language === 'es' ? 'Próximamente' : 'Soon', 
        color: 'bg-sky-50 text-sky-700 border-sky-200', 
        dotColor: 'bg-sky-500'
      }
    }
    if (status === 'completed') {
      return { 
        text: language === 'es' ? 'Completada' : 'Completed', 
        color: 'bg-gray-50 text-gray-600 border-gray-200', 
        dotColor: 'bg-gray-400'
      }
    }
    return { text: '', color: '', dotColor: 'bg-gray-400' }
  }

  const handleLeagueSelect = (leagueId) => {
    onLeagueChange(leagueId)
    setIsExpanded(false)
  }

  const renderLeagueCard = (registration) => {
    const isSelected = currentLeagueId === registration.league?._id
    const badge = getDropdownStatusBadge(registration.league)
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
      <div className="-mx-2 -mt-4 sm:mx-0 sm:mt-0">
        <div className="bg-gradient-to-br from-parque-purple via-purple-600 to-indigo-600 shadow-lg overflow-hidden relative sm:rounded-2xl">
          {/* Background decoration - matching dashboard */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute -top-16 -right-16 w-48 h-48 bg-white rounded-full" />
          </div>
          
          <div className="flex items-center justify-between px-4 pt-5 pb-4 relative">
            <div className="flex items-center gap-3 min-w-0">
              {/* Logo - sized to match text height */}
              <div className="w-12 h-12 bg-white/30 rounded-xl flex items-center justify-center p-1.5 flex-shrink-0">
                <img 
                  src="/logo-big.png" 
                  alt="Tenis del Parque" 
                  width={36} 
                  height={36}
                  className="object-contain"
                />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-xl truncate">
                    {currentLeague?.name || 'Liga'}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-white/80 mt-0.5">
                  {currentLeague?.location?.city && (
                    <span className="flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {currentLeague.location.city}
                    </span>
                  )}
                  {currentSeasonDisplay && (
                    <>
                      <span className="text-white/50">·</span>
                      <span>{currentSeasonDisplay}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            {currentBadge.text && (
              <span className={`px-3 py-1 text-xs font-medium rounded-full border ${currentBadge.headerColor}`}>
                {currentBadge.text}
              </span>
            )}
          </div>
        </div>
      </div>
    )
  }

  // For multiple leagues, show expandable selector
  return (
    <div className="-mx-2 -mt-4 sm:mx-0 sm:mt-0 relative z-20">
      <div className="shadow-lg overflow-visible sm:rounded-2xl">
        {/* Collapsed Header - Purple gradient */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between px-4 pt-5 pb-4 bg-gradient-to-br from-parque-purple via-purple-600 to-indigo-600 hover:from-parque-purple/95 hover:via-purple-600/95 hover:to-indigo-600/95 transition-colors relative overflow-hidden sm:rounded-2xl z-30"
        >
          {/* Background decoration - matching dashboard */}
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="absolute -top-16 -right-16 w-48 h-48 bg-white rounded-full" />
          </div>
          
          <div className="flex items-center gap-3 min-w-0 relative">
            {/* Logo - sized to match text height */}
            <div className="w-12 h-12 bg-white/30 rounded-xl flex items-center justify-center p-1.5 flex-shrink-0">
              <img 
                src="/logo-big.png" 
                alt="Tenis del Parque" 
                width={36} 
                height={36}
                className="object-contain"
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-xl truncate">
                  {currentLeague?.name || 'Liga'}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-white/80 mt-0.5">
                {currentLeague?.location?.city && (
                  <span className="flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {currentLeague.location.city}
                  </span>
                )}
                {currentSeasonDisplay && (
                  <>
                    <span className="text-white/50">·</span>
                    <span>{currentSeasonDisplay}</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0 relative">
            {currentBadge.text && (
              <span className={`px-3 py-1 text-xs font-medium rounded-full border hidden sm:inline ${currentBadge.headerColor}`}>
                {currentBadge.text}
              </span>
            )}
            <div className="flex items-center gap-1.5 text-white/70">
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
        
        {/* Backdrop overlay */}
        {isExpanded && (
          <div 
            className="fixed inset-0 bg-black/20 z-10"
            onClick={() => setIsExpanded(false)}
          />
        )}
        
        {/* Expanded Content - Drawer sliding from behind header */}
        <div className="absolute left-0 right-0 top-full z-10 overflow-hidden">
          <div className={`transition-transform duration-300 ease-out ${
            isExpanded 
              ? 'translate-y-0' 
              : '-translate-y-full'
          }`}>
            <div className="mx-2 sm:mx-0 bg-white rounded-b-xl shadow-2xl border border-t-0 border-gray-200">
              <div className="px-4 py-4 space-y-4 max-h-[400px] overflow-y-auto">
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
    if (tabParam) {
      // Backward compatibility: redirect old schedule/results to matches
      if (tabParam === 'schedule' || tabParam === 'results') {
        setActiveTab(LEAGUE_TABS.MATCHES)
      } else if (Object.values(LEAGUE_TABS).includes(tabParam)) {
        setActiveTab(tabParam)
      }
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
      <div className="bg-white rounded-xl shadow-lg overflow-hidden p-2 sm:p-6">
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
          
          {activeTab === LEAGUE_TABS.MATCHES && (
            <MatchesTab 
              schedule={schedule}
              matches={matches}
              language={language}
              totalRounds={DEFAULT_TOTAL_ROUNDS}
              player={player}
              league={currentLeague}
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
              (() => {
                // Calculate playoff start date from season start (8 rounds × 7 days)
                let playoffDateStr = ''
                if (currentLeague?.seasonConfig?.startDate) {
                  const playoffDate = new Date(currentLeague.seasonConfig.startDate)
                  playoffDate.setDate(playoffDate.getDate() + (8 * 7) - 1) // 8 weeks minus 1 day to land on Monday
                  playoffDateStr = playoffDate.toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US', {
                    day: 'numeric',
                    month: 'long'
                  })
                }
                
                return (
                  <div className="text-center py-12 px-4">
                    <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {playoffDateStr 
                        ? (language === 'es' ? `Playoffs: ${playoffDateStr}` : `Playoffs start ${playoffDateStr}`)
                        : (language === 'es' ? 'Playoffs próximamente' : 'Playoffs coming soon')}
                    </h3>
                    <p className="text-gray-500 text-sm max-w-sm mx-auto mb-4">
                      {language === 'es' 
                        ? 'Los playoffs comenzarán después de completar las 8 rondas de la temporada regular.' 
                        : 'Playoffs will begin after completing all 8 rounds of the regular season.'}
                    </p>
                    <div className="inline-flex items-center gap-2 bg-purple-50 text-parque-purple px-4 py-2 rounded-full text-sm font-medium">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                      {language === 'es' ? 'Top 8 clasifican a playoffs' : 'Top 8 qualify for playoffs'}
                    </div>
                  </div>
                )
              })()
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
