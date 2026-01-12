import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

// Helper to find the best default league (prioritize active/upcoming over completed)
function findBestDefaultRegistration(registrations) {
  if (!registrations || registrations.length === 0) return null
  
  // Priority order: active > registration_open > coming_soon > completed
  const priorityOrder = ['active', 'registration_open', 'coming_soon', 'completed', 'archived']
  
  // Sort registrations by status priority
  const sorted = [...registrations].sort((a, b) => {
    const statusA = a.league?.status || 'completed'
    const statusB = b.league?.status || 'completed'
    
    // Check if either is in playoffs (treat as active)
    const playoffPhaseA = a.league?.playoffConfig?.currentPhase
    const playoffPhaseB = b.league?.playoffConfig?.currentPhase
    const isInPlayoffsA = playoffPhaseA && playoffPhaseA !== 'regular_season' && playoffPhaseA !== 'completed'
    const isInPlayoffsB = playoffPhaseB && playoffPhaseB !== 'regular_season' && playoffPhaseB !== 'completed'
    
    // Playoffs are highest priority
    if (isInPlayoffsA && !isInPlayoffsB) return -1
    if (!isInPlayoffsA && isInPlayoffsB) return 1
    
    const priorityA = priorityOrder.indexOf(statusA)
    const priorityB = priorityOrder.indexOf(statusB)
    
    // If same priority, prefer the one with more recent start date
    if (priorityA === priorityB) {
      const dateA = new Date(a.league?.seasonConfig?.startDate || 0)
      const dateB = new Date(b.league?.seasonConfig?.startDate || 0)
      return dateB - dateA // More recent first
    }
    
    return priorityA - priorityB
  })
  
  return sorted[0]
}

export function useLeagueData() {
  const [standings, setStandings] = useState(null)
  const [matches, setMatches] = useState([])
  const [schedule, setSchedule] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [player, setPlayer] = useState(null)
  const [currentLeague, setCurrentLeague] = useState(null)
  const [allRegistrations, setAllRegistrations] = useState([])
  const router = useRouter()
  const searchParams = useSearchParams()

  // Get leagueId from URL parameters
  const leagueIdParam = searchParams.get('leagueId')

  // Convert league season name to database season name for API calls
  const seasonToDbName = (seasonName) => {
    const mapping = {
      // English season names
      'Summer 2025': 'summer-2025',
      'Winter 2025': 'winter-2025',
      'Spring 2025': 'spring-2025',
      'Autumn 2025': 'autumn-2025',
      'Fall 2025': 'autumn-2025',
      
      // Spanish season names
      'Verano 2025': 'summer-2025',
      'Invierno 2025': 'winter-2025',
      'Primavera 2025': 'spring-2025',
      'Otoño 2025': 'autumn-2025'
    }
    return mapping[seasonName] || seasonName
  }

  const fetchPlayerAndLeague = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      // Clear previous data to prevent showing stale data while loading
      setStandings(null)
      setMatches([])
      setSchedule([])
      
      // Get player data first
      const playerRes = await fetch('/api/player/profile', {
        credentials: 'include'
      })
      
      if (!playerRes.ok) {
        if (playerRes.status === 401) {
          router.push('/login')
          return
        }
        const errorData = await playerRes.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to fetch player data')
      }
      
      const playerData = await playerRes.json()
      setPlayer(playerData.player)
      setAllRegistrations(playerData.player.registrations || [])
      
      // Determine which league to display
      let selectedLeague = null
      let selectedRegistration = null
      
      if (leagueIdParam) {
        // If leagueId is in URL, find that specific registration
        selectedRegistration = playerData.player.registrations?.find(
          reg => reg.league?._id === leagueIdParam
        )
        if (selectedRegistration) {
          selectedLeague = selectedRegistration.league
        }
      }
      
      // Fallback: find best default registration (prioritize active/upcoming over completed)
      if (!selectedLeague && playerData.player.registrations?.length > 0) {
        selectedRegistration = findBestDefaultRegistration(playerData.player.registrations)
        if (selectedRegistration) {
          selectedLeague = selectedRegistration.league
        }
      }
      
      // Fallback to legacy single league property for backward compatibility
      if (!selectedLeague && playerData.player.league) {
        selectedLeague = playerData.player.league
        selectedRegistration = {
          league: playerData.player.league,
          level: playerData.player.level,
          status: playerData.player.status,
          stats: playerData.player.stats
        }
      }
      
      setCurrentLeague(selectedLeague)
      
      if (selectedLeague) {
        // Update player object with the selected league for compatibility
        setPlayer({
          ...playerData.player,
          league: selectedLeague,
          level: selectedRegistration?.level,
          status: selectedRegistration?.status,
          stats: selectedRegistration?.stats,
          // Keep all registrations for multi-league support
          registrations: playerData.player.registrations
        })
        
        // Use league ID for API calls
        const leagueId = selectedLeague._id || selectedLeague
        const seasonDisplayName = selectedRegistration?.season || 'Verano 2025'
        
        console.log('Fetching with league ID:', { leagueId, seasonDisplayName })
        
        const dbSeasonName = seasonToDbName(seasonDisplayName)
        console.log('Season conversion:', { seasonDisplayName, dbSeasonName })

        // API CALLS with league ID
        const standingsRes = await fetch(`/api/leagues/${leagueId}/standings?season=${dbSeasonName}`)
        if (standingsRes.ok) {
          const standingsData = await standingsRes.json()
          setStandings(standingsData)
        }
        
        const matchesRes = await fetch(`/api/leagues/${leagueId}/matches?season=${dbSeasonName}&status=completed&limit=200`)
        if (matchesRes.ok) {
          const matchesData = await matchesRes.json()
          setMatches(matchesData.matches || [])
        }
        
        const scheduleRes = await fetch(`/api/leagues/${leagueId}/matches?season=${dbSeasonName}&limit=200`)
        if (scheduleRes.ok) {
          const scheduleData = await scheduleRes.json()
          setSchedule(scheduleData.matches || [])
        }
      }
    } catch (error) {
      console.error('Error fetching league data:', error)
      setError(error.message || 'Failed to load league data')
    } finally {
      setLoading(false)
    }
  }, [router, leagueIdParam])

  useEffect(() => {
    fetchPlayerAndLeague()
  }, [fetchPlayerAndLeague])

  return {
    standings,
    matches,
    schedule,
    loading,
    error,
    player,
    currentLeague,
    allRegistrations,
    refetch: fetchPlayerAndLeague
  }
}