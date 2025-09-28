'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import TournamentBracket from '@/components/league/TournamentBracket'

export default function LeaguePlayoffsAdmin() {
  const params = useParams()
  const leagueId = params.id
  
  const [loading, setLoading] = useState(true)
  const [league, setLeague] = useState(null)
  const [playoffConfig, setPlayoffConfig] = useState(null)
  const [playoffMatches, setPlayoffMatches] = useState([])
  const [regularSeasonComplete, setRegularSeasonComplete] = useState(false)
  const [numberOfGroups, setNumberOfGroups] = useState(1)
  const [standings, setStandings] = useState([])
  const [eligiblePlayerCount, setEligiblePlayerCount] = useState(0)
  const [seasonIdentifier, setSeasonIdentifier] = useState('')
  const [playoffsInitialized, setPlayoffsInitialized] = useState(false)
  
  useEffect(() => {
    if (leagueId) {
      fetchLeagueData()
      fetchPlayoffData()
    }
  }, [leagueId])
  
  const fetchLeagueData = async () => {
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
  }
  
  const fetchPlayoffData = async () => {
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
        
        // If league data is not set (due to league endpoint failure), use data from playoff endpoint
        if (!league && data.leagueSlug) {
          setLeague({
            name: data.leagueName || 'Liga de Sotogrande',
            slug: data.leagueSlug,
            playoffConfig: data.playoffConfig
          })
        }
        
        console.log('Playoff data:', data)
        console.log('Eligible players:', data.eligiblePlayerCount)
        console.log('Season identifier:', data.seasonIdentifier)
        console.log('League slug:', data.leagueSlug)
        console.log('Playoffs initialized:', data.playoffsInitialized)
      }
      return data // Return the data so we can use it
    } catch (error) {
      console.error('Error fetching playoff data:', error)
      return null
    } finally {
      setLoading(false)
    }
  }
  
  const handleInitializePlayoffs = async (skipConfirm = false) => {
    if (eligiblePlayerCount < 8) {
      alert(`Cannot initialize playoffs: Only ${eligiblePlayerCount} eligible players found. Need at least 8.`)
      return
    }
    
    // Show confirmation with current standings
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
        await fetchPlayoffData()
        await fetchLeagueData()
      } else {
        alert(`Error: ${data.error}`)
      }
    } catch (error) {
      console.error('Error initializing playoffs:', error)
      alert('Failed to initialize playoffs')
    }
  }
  
  const handleResetPlayoffs = async () => {
    if (!confirm('⚠️ WARNING: This will RESET all playoff data and recalculate based on current standings.\n\nThis will:\n• Delete all playoff matches\n• Recalculate qualified players from current standings\n• Reset the playoff bracket\n• Lock in the NEW top players\n\nAre you sure?')) {
      return
    }
    
    try {
      // Show loading indicator while resetting
      alert('Resetting playoffs... Please wait.')
      
      // First, update the league to reset playoff phase
      const resetRes = await fetch(`/api/admin/leagues/${leagueId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playoffConfig: {
            ...league.playoffConfig,
            currentPhase: 'regular_season',
            enabled: false,
            qualifiedPlayers: { groupA: [], groupB: [] } // Clear qualified players
          }
        })
      })
      
      if (resetRes.ok) {
        // CRITICAL FIX: Refresh the playoff data BEFORE initializing
        // This ensures we get fresh standings calculated by the service
        alert('Playoffs reset. Fetching fresh standings...')
        const freshData = await fetchPlayoffData()
        
        // Wait a bit to ensure state is updated
        await new Promise(resolve => setTimeout(resolve, 100))
        
        if (freshData && freshData.success && freshData.standings && freshData.standings.length >= 8) {
          // Now show confirmation with the FRESH standings
          const freshStandings = freshData.standings
          const confirmMessage = `Playoffs have been reset. Ready to initialize with the current top ${numberOfGroups === 2 ? '16' : '8'} players:\n\nTop 8 players:\n${freshStandings.slice(0, 8).map((s, idx) => `${idx + 1}. ${s.player.name} (${s.stats.totalPoints} pts)`).join('\n')}\n\n⚠️ These players will be LOCKED IN for the playoffs. Continue?`
          
          if (confirm(confirmMessage)) {
            // Now initialize with fresh data
            await handleInitializePlayoffs(true) // Skip the normal confirm since we just showed it
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
  }
  
  const handleUpdateConfig = async () => {
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
        await fetchPlayoffData()
      }
    } catch (error) {
      console.error('Error updating config:', error)
    }
  }
  
  const handleMatchClick = (match) => {
    // Navigate to match detail/edit page
    window.location.href = `/admin/matches/${match._id}`
  }
  
  const handleCreateNextRound = async (group, stage) => {
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
        await fetchPlayoffData()
      } else {
        alert(`Error: ${data.error}`)
      }
    } catch (error) {
      console.error('Error creating matches:', error)
    }
  }
  
  const currentPhase = playoffConfig?.currentPhase || 'regular_season'
  const isPlayoffsActive = currentPhase !== 'regular_season' && currentPhase !== 'completed'
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Playoff Management</h1>
        <p className="mt-2 text-sm text-gray-600">
          League: {league?.name} | Status: {currentPhase.replace(/_/g, ' ').toUpperCase()}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Season ID: {seasonIdentifier || 'Loading...'} | League Slug: {league?.slug}
        </p>
      </div>
      
      {/* Eligible Players Display */}
      {currentPhase === 'regular_season' && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">
            {playoffsInitialized ? '🔒 Locked-in Playoff Players' : 'Current Standings'}
          </h2>
          
          {playoffsInitialized && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <p className="text-yellow-800 font-semibold">
                ⚠️ Playoffs have been initialized - these players are LOCKED IN
              </p>
              <p className="text-sm text-yellow-700 mt-1">
                The standings shown below are the qualified players at the time playoffs were initialized.
                To recalculate with current standings, use the &quot;Reset & Recalculate Playoffs&quot; button.
              </p>
            </div>
          )}
          
          {eligiblePlayerCount === 0 ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800">
                ⚠️ No eligible players found! This could mean:
              </p>
              <ul className="list-disc list-inside mt-2 text-sm text-red-700">
                <li>Players are not properly registered for this league</li>
                <li>The season identifier mismatch (check season ID above)</li>
                <li>No matches have been played yet</li>
                <li>Player registrations use a different season value than "{seasonIdentifier}"</li>
              </ul>
            </div>
          ) : (
            <div>
              <p className="mb-4 text-green-700">
                ✅ {playoffsInitialized ? 'Qualified' : 'Found'} {eligiblePlayerCount} eligible players {playoffsInitialized ? '(locked in)' : 'with completed matches'}
              </p>
              
              {/* Show top 16 players */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {playoffsInitialized ? 'Qualification Position' : 'Position'}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Player
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Points {playoffsInitialized && '(at qualification)'}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Matches
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {playoffsInitialized ? 'Playoff Seed' : 'Playoff Group'}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {standings.map((standing, index) => (
                      <tr key={standing.player._id} className={index === 7 ? 'border-b-2 border-purple-500' : ''}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {standing.position}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {standing.player.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {standing.stats.totalPoints}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {standing.stats.matchesPlayed}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {playoffsInitialized ? (
                            standing.seed && (
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                standing.group === 'A' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-blue-100 text-blue-800'
                              }`}>
                                {standing.group === 'A' ? 'Group A' : 'Group B'} - Seed {standing.seed}
                              </span>
                            )
                          ) : (
                            <>
                              {index < 8 && (
                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                  Group A
                                </span>
                              )}
                              {index >= 8 && index < 16 && numberOfGroups === 2 && (
                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                  Group B
                                </span>
                              )}
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Configuration Section */}
      {currentPhase === 'regular_season' && !playoffsInitialized && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Playoff Configuration</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Playoff Groups
              </label>
              <select
                value={numberOfGroups}
                onChange={(e) => setNumberOfGroups(Number(e.target.value))}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm rounded-md"
                disabled={eligiblePlayerCount < 16 && numberOfGroups === 2}
              >
                <option value={1}>1 Group (Group A only - Top 8)</option>
                <option value={2} disabled={eligiblePlayerCount < 16}>
                  2 Groups (Group A: Top 8, Group B: 9-16) {eligiblePlayerCount < 16 && '(Need 16+ players)'}
                </option>
              </select>
            </div>
            
            <div className="flex space-x-4">
              <button
                onClick={handleUpdateConfig}
                className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                disabled={eligiblePlayerCount < 8}
              >
                Save Configuration
              </button>
              
              <button
                onClick={() => handleInitializePlayoffs(false)}
                className={`px-4 py-2 rounded text-white ${
                  eligiblePlayerCount >= 8 
                    ? 'bg-purple-600 hover:bg-purple-700' 
                    : 'bg-gray-400 cursor-not-allowed'
                }`}
                disabled={eligiblePlayerCount < 8}
              >
                Initialize Playoffs {eligiblePlayerCount < 8 && `(Need ${8 - eligiblePlayerCount} more players)`}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Playoff Bracket Display */}
      {isPlayoffsActive && (
        <>
          {/* Reset Playoffs Button */}
          <div className="mb-4 flex justify-end">
            <button
              onClick={handleResetPlayoffs}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Reset & Recalculate Playoffs
            </button>
          </div>
          
          {/* Locked Players Notice */}
          {playoffConfig?.qualifiedPlayers?.groupA?.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="text-blue-800 font-semibold mb-2">🔒 Playoff Players Locked In</h3>
              <p className="text-sm text-blue-700 mb-2">
                The following players qualified for playoffs and are locked into the bracket:
              </p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-semibold text-blue-800">Group A:</p>
                  <ol className="list-decimal list-inside text-blue-700">
                    {playoffConfig.qualifiedPlayers.groupA.map((qp, idx) => (
                      <li key={idx}>
                        Seed {qp.seed}: {qp.player?.name || 'Loading...'}
                      </li>
                    ))}
                  </ol>
                </div>
                {playoffConfig.qualifiedPlayers.groupB?.length > 0 && (
                  <div>
                    <p className="font-semibold text-blue-800">Group B:</p>
                    <ol className="list-decimal list-inside text-blue-700">
                      {playoffConfig.qualifiedPlayers.groupB.map((qp, idx) => (
                        <li key={idx}>
                          Seed {qp.seed}: {qp.player?.name || 'Loading...'}
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Group A Bracket */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Group A Tournament</h2>
              <div className="space-x-2">
                <button
                  onClick={() => handleCreateNextRound('A', 'semifinal')}
                  className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                >
                  Create Semifinals
                </button>
                <button
                  onClick={() => handleCreateNextRound('A', 'final')}
                  className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                >
                  Create Finals
                </button>
              </div>
            </div>
            
            <TournamentBracket
              bracket={playoffConfig?.bracket?.groupA}
              qualifiedPlayers={playoffConfig?.qualifiedPlayers?.groupA}
              matches={playoffMatches.filter(m => m.playoffInfo?.group === 'A')}
              group="A"
              language="es"
              onMatchClick={handleMatchClick}
            />
          </div>
          
          {/* Group B Bracket (if enabled) */}
          {playoffConfig?.numberOfGroups === 2 && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Group B Tournament</h2>
                <div className="space-x-2">
                  <button
                    onClick={() => handleCreateNextRound('B', 'semifinal')}
                    className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                  >
                    Create Semifinals
                  </button>
                  <button
                    onClick={() => handleCreateNextRound('B', 'final')}
                    className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                  >
                    Create Finals
                  </button>
                </div>
              </div>
              
              <TournamentBracket
                bracket={playoffConfig?.bracket?.groupB}
                qualifiedPlayers={playoffConfig?.qualifiedPlayers?.groupB}
                matches={playoffMatches.filter(m => m.playoffInfo?.group === 'B')}
                group="B"
                language="es"
                onMatchClick={handleMatchClick}
              />
            </div>
          )}
        </>
      )}
      
      {/* Completed Status */}
      {currentPhase === 'completed' && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-green-800 mb-2">
            Playoffs Completed! 🏆
          </h2>
          <p className="text-green-700">
            The playoffs have been successfully completed. Check the tournament brackets above for final results.
          </p>
        </div>
      )}
      
      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8">
        <h3 className="text-lg font-semibold text-blue-800 mb-2">Instructions</h3>
        <ul className="list-disc list-inside text-sm text-blue-700 space-y-1">
          <li>Check the eligible players count before initializing playoffs</li>
          <li>You need at least 8 players who have played matches to start playoffs</li>
          <li>Configure the number of playoff groups before initializing</li>
          <li>Initialize playoffs when regular season is complete - this will LOCK IN the qualified players</li>
          <li>Once initialized, playoff players are locked and won&apos;t change even if regular season standings change</li>
          <li>If playoffs show wrong players, use &quot;Reset & Recalculate Playoffs&quot; button to re-lock with current standings</li>
          <li>Quarterfinal matches are created automatically with proper seeding</li>
          <li>Create semifinal matches after quarterfinals are complete</li>
          <li>Create final matches after semifinals are complete</li>
          <li>Click on any match to enter results</li>
        </ul>
      </div>
    </div>
  )
}
