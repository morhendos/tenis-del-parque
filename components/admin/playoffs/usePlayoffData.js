import { useState, useEffect, useCallback } from 'react'

/**
 * Custom hook to manage playoff data fetching and state
 */
export function usePlayoffData(leagueId) {
  const [loading, setLoading] = useState(true)
  const [league, setLeague] = useState(null)
  const [playoffConfig, setPlayoffConfig] = useState(null)
  const [playoffMatches, setPlayoffMatches] = useState([])
  const [standings, setStandings] = useState([])
  const [eligiblePlayerCount, setEligiblePlayerCount] = useState(0)
  const [seasonIdentifier, setSeasonIdentifier] = useState('')
  const [playoffsInitialized, setPlayoffsInitialized] = useState(false)
  const [numberOfGroups, setNumberOfGroups] = useState(1)
  const [allPlayoffsComplete, setAllPlayoffsComplete] = useState(false)
  
  const fetchLeagueData = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/leagues/${leagueId}`)
      const data = await res.json()
      if (data.success) {
        setLeague(data.league)
        setNumberOfGroups(data.league.playoffConfig?.numberOfGroups || 1)
      } else {
        console.warn('League endpoint failed, will use data from playoff endpoint')
      }
    } catch (error) {
      console.warn('Error fetching league (will use playoff data):', error)
    }
  }, [leagueId])
  
  const fetchPlayoffData = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/leagues/${leagueId}/playoffs`)
      const data = await res.json()
      if (data.success) {
        setPlayoffConfig(data.playoffConfig)
        setPlayoffMatches(data.matches)
        setStandings(data.standings || [])
        setEligiblePlayerCount(data.eligiblePlayerCount || 0)
        setSeasonIdentifier(data.seasonIdentifier || '')
        setPlayoffsInitialized(data.playoffsInitialized || false)
        setAllPlayoffsComplete(data.allPlayoffsComplete || false)
        
        // If league data is not set (due to league endpoint failure), use data from playoff endpoint
        setLeague(prevLeague => {
          if (!prevLeague && data.leagueSlug) {
            return {
              name: data.leagueName || 'Liga de Sotogrande',
              slug: data.leagueSlug,
              playoffConfig: data.playoffConfig
            }
          }
          return prevLeague
        })
        
        console.log('Playoff data:', data)
        console.log('Eligible players:', data.eligiblePlayerCount)
        console.log('Season identifier:', data.seasonIdentifier)
        console.log('League slug:', data.leagueSlug)
        console.log('Playoffs initialized:', data.playoffsInitialized)
        console.log('All playoffs complete:', data.allPlayoffsComplete)
      }
      return data
    } catch (error) {
      console.error('Error fetching playoff data:', error)
      return null
    } finally {
      setLoading(false)
    }
  }, [leagueId])
  
  useEffect(() => {
    if (leagueId) {
      fetchLeagueData()
      fetchPlayoffData()
    }
  }, [leagueId, fetchLeagueData, fetchPlayoffData])
  
  const refetch = useCallback(async () => {
    await fetchLeagueData()
    return await fetchPlayoffData()
  }, [fetchLeagueData, fetchPlayoffData])
  
  return {
    loading,
    league,
    playoffConfig,
    playoffMatches,
    standings,
    eligiblePlayerCount,
    seasonIdentifier,
    playoffsInitialized,
    numberOfGroups,
    setNumberOfGroups,
    allPlayoffsComplete,
    refetch,
    fetchPlayoffData
  }
}
