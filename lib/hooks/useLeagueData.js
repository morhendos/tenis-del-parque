import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'

export function useLeagueData() {
  const [standings, setStandings] = useState(null)
  const [matches, setMatches] = useState([])
  const [schedule, setSchedule] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [player, setPlayer] = useState(null)
  const router = useRouter()

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
      
      if (playerData.player?.league) {
        // Use EXACT SAME LOGIC as public page
        const location = playerData.player.league.slug || 'sotogrande'
        const seasonDisplayName = playerData.player.season || 'Verano 2025'
        
        console.log('Fetching with same logic as public page:', { location, seasonDisplayName })
        
        const dbSeasonName = seasonToDbName(seasonDisplayName)
        console.log('Season conversion:', { seasonDisplayName, dbSeasonName })

        // API CALLS with converted season name
        const standingsRes = await fetch(`/api/leagues/${location}/standings?season=${dbSeasonName}`)
        if (standingsRes.ok) {
          const standingsData = await standingsRes.json()
          setStandings(standingsData)
        }
        
        // INCREASED LIMIT FROM 10 TO 100
        const matchesRes = await fetch(`/api/leagues/${location}/matches?season=${dbSeasonName}&status=completed&limit=100`)
        if (matchesRes.ok) {
          const matchesData = await matchesRes.json()
          setMatches(matchesData.matches || [])
        }
        
        const scheduleRes = await fetch(`/api/leagues/${location}/matches?season=${dbSeasonName}&status=scheduled&limit=50`)
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
  }, [router])

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
    refetch: fetchPlayerAndLeague
  }
} 