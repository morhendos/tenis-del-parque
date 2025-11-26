import { useCallback } from 'react'

/**
 * Custom hook to manage playoff actions (initialize, reset, update config, create matches)
 */
export function usePlayoffActions(leagueId, playoffData) {
  const {
    league,
    numberOfGroups,
    eligiblePlayerCount,
    standings,
    refetch,
    fetchPlayoffData
  } = playoffData
  
  const handleInitializePlayoffs = useCallback(async (skipConfirm = false) => {
    if (eligiblePlayerCount < 8) {
      alert(`Cannot initialize playoffs: Only ${eligiblePlayerCount} eligible players found. Need at least 8.`)
      return
    }
    
    if (!skipConfirm) {
      const confirmMessage = `Initialize playoffs with top ${numberOfGroups === 2 ? '16' : '8'} players?\n\nTop 8 players:\n${standings.slice(0, 8).map(s => `${s.position}. ${s.player.name} (${s.stats.totalPoints} pts)`).join('\n')}\n\n⚠️ IMPORTANT: These players will be LOCKED IN for the playoffs and cannot be changed!`
      
      if (!confirm(confirmMessage)) {
        return
      }
    }
    
    try {
      const res = await fetch(`/api/admin/leagues/${leagueId}/playoffs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'initialize',
          numberOfGroups
        })
      })
      
      const data = await res.json()
      if (data.success) {
        alert('Playoffs initialized successfully! Players are now locked in.')
        await refetch()
      } else {
        alert(`Error: ${data.error}`)
      }
    } catch (error) {
      console.error('Error initializing playoffs:', error)
      alert('Failed to initialize playoffs')
    }
  }, [leagueId, eligiblePlayerCount, numberOfGroups, standings, refetch])
  
  const handleResetPlayoffs = useCallback(async () => {
    if (!confirm('⚠️ WARNING: This will RESET all playoff data and recalculate based on current standings.\n\nThis will:\n• Delete all playoff matches\n• Recalculate qualified players from current standings\n• Reset the playoff bracket\n• Lock in the NEW top players\n\nAre you sure?')) {
      return
    }
    
    try {
      alert('Resetting playoffs... Please wait.')
      
      const resetRes = await fetch(`/api/admin/leagues/${leagueId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playoffConfig: {
            ...league.playoffConfig,
            currentPhase: 'regular_season',
            enabled: false,
            qualifiedPlayers: { groupA: [], groupB: [] }
          }
        })
      })
      
      if (resetRes.ok) {
        alert('Playoffs reset. Fetching fresh standings...')
        const freshData = await fetchPlayoffData()
        
        await new Promise(resolve => setTimeout(resolve, 100))
        
        if (freshData && freshData.success && freshData.standings && freshData.standings.length >= 8) {
          const freshStandings = freshData.standings
          const confirmMessage = `Playoffs have been reset. Ready to initialize with the current top ${numberOfGroups === 2 ? '16' : '8'} players:\n\nTop 8 players:\n${freshStandings.slice(0, 8).map((s, idx) => `${idx + 1}. ${s.player.name} (${s.stats.totalPoints} pts)`).join('\n')}\n\n⚠️ These players will be LOCKED IN for the playoffs. Continue?`
          
          if (confirm(confirmMessage)) {
            await handleInitializePlayoffs(true)
          }
        } else {
          alert('Failed to get fresh standings after reset. Please refresh the page and try again.')
        }
      } else {
        alert('Failed to reset playoffs')
      }
    } catch (error) {
      console.error('Error resetting playoffs:', error)
      alert('Failed to reset playoffs')
    }
  }, [leagueId, league, numberOfGroups, fetchPlayoffData, handleInitializePlayoffs])
  
  const handleUpdateConfig = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/leagues/${leagueId}/playoffs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'updateConfig',
          numberOfGroups
        })
      })
      
      const data = await res.json()
      if (data.success) {
        alert('Configuration updated!')
        await refetch()
      }
    } catch (error) {
      console.error('Error updating config:', error)
    }
  }, [leagueId, numberOfGroups, refetch])
  
  const handleCreateNextRound = useCallback(async (group, stage) => {
    try {
      const res = await fetch(`/api/admin/leagues/${leagueId}/playoffs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'createMatches',
          group,
          stage
        })
      })
      
      const data = await res.json()
      if (data.success) {
        alert(`${stage} matches created!`)
        await refetch()
      } else {
        alert(`Error: ${data.error}`)
      }
    } catch (error) {
      console.error('Error creating matches:', error)
    }
  }, [leagueId, refetch])
  
  const handleMatchClick = useCallback((match) => {
    window.location.href = `/admin/matches/${match._id}`
  }, [])
  
  return {
    handleInitializePlayoffs,
    handleResetPlayoffs,
    handleUpdateConfig,
    handleCreateNextRound,
    handleMatchClick
  }
}

