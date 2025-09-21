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
      }
    } catch (error) {
      console.error('Error fetching league:', error)
    }
  }
  
  const fetchPlayoffData = async () => {
    try {
      const res = await fetch(`/api/admin/leagues/${leagueId}/playoffs`)
      const data = await res.json()
      if (data.success) {
        setPlayoffConfig(data.playoffConfig)
        setPlayoffMatches(data.matches)
      }
    } catch (error) {
      console.error('Error fetching playoff data:', error)
    } finally {
      setLoading(false)
    }
  }
  
  const handleInitializePlayoffs = async () => {
    if (!confirm('Are you sure you want to initialize playoffs? This will lock the regular season standings.')) {
      return
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
        alert('Playoffs initialized successfully!')
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
      </div>
      
      {/* Configuration Section */}
      {currentPhase === 'regular_season' && (
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
              >
                <option value={1}>1 Group (Group A only - Top 8)</option>
                <option value={2}>2 Groups (Group A: Top 8, Group B: 9-16)</option>
              </select>
            </div>
            
            <div className="flex space-x-4">
              <button
                onClick={handleUpdateConfig}
                className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
              >
                Save Configuration
              </button>
              
              <button
                onClick={handleInitializePlayoffs}
                className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
              >
                Initialize Playoffs
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Playoff Bracket Display */}
      {isPlayoffsActive && (
        <>
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
          <li>Configure the number of playoff groups before initializing</li>
          <li>Initialize playoffs when regular season is complete</li>
          <li>Quarterfinal matches are created automatically with proper seeding</li>
          <li>Create semifinal matches after quarterfinals are complete</li>
          <li>Create final matches after semifinals are complete</li>
          <li>Click on any match to enter results</li>
        </ul>
      </div>
    </div>
  )
}
