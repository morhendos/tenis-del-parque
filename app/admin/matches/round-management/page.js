'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

function RoundManagementContent() {
  const [matches, setMatches] = useState([])
  const [players, setPlayers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedLeague, setSelectedLeague] = useState(null)
  const [processing, setProcessing] = useState(false)
  const [currentSeason, setCurrentSeason] = useState('summer-2025')
  
  const router = useRouter()
  const searchParams = useSearchParams()
  const leagueId = searchParams.get('league')

  useEffect(() => {
    const storedLeague = sessionStorage.getItem('selectedLeague')
    if (storedLeague) {
      setSelectedLeague(JSON.parse(storedLeague))
    } else if (!leagueId) {
      router.push('/admin/leagues')
      return
    }

    fetchData()
  }, [leagueId, router])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Fetch matches
      const matchesRes = await fetch(`/api/admin/matches?league=${leagueId || selectedLeague?.id}`)
      if (matchesRes.ok) {
        const matchesData = await matchesRes.json()
        setMatches(matchesData.matches || [])
        
        // Try to determine current season from existing matches
        if (matchesData.matches && matchesData.matches.length > 0) {
          const seasons = [...new Set(matchesData.matches.map(m => m.season).filter(Boolean))]
          if (seasons.length > 0) {
            setCurrentSeason(seasons[0]) // Use the first season found
            console.log('Detected season from matches:', seasons[0])
          }
        }
      }

      // Fetch players
      const playersRes = await fetch(`/api/admin/players?league=${leagueId || selectedLeague?.id}`)
      if (playersRes.ok) {
        const playersData = await playersRes.json()
        setPlayers(playersData.players || [])
      }

    } catch (error) {
      console.error('Error fetching data:', error)
      setError('Error loading data')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteRound = async (round) => {
    if (!confirm(`Are you sure you want to delete all matches in Round ${round}? This action cannot be undone.`)) {
      return
    }

    try {
      setProcessing(true)
      const roundMatches = matches.filter(m => m.round === round)
      const matchIds = roundMatches.map(m => m._id)

      const response = await fetch('/api/admin/matches/bulk-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matchIds })
      })

      if (!response.ok) throw new Error('Failed to delete round')

      await fetchData()
    } catch (error) {
      console.error('Delete round error:', error)
      setError('Failed to delete round')
    } finally {
      setProcessing(false)
    }
  }



  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-xl text-gray-600">Loading round management...</div>
      </div>
    )
  }

  // Group matches by round
  const matchesByRound = matches.reduce((acc, match) => {
    const round = match.round || 0
    if (!acc[round]) acc[round] = []
    acc[round].push(match)
    return acc
  }, {})

  const rounds = Object.keys(matchesByRound).map(Number).sort((a, b) => a - b)
  const activePlayers = players.filter(p => p.status === 'active')
  const inactivePlayers = players.filter(p => p.status !== 'active')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Round Management</h2>
          <p className="text-gray-600 mt-1">
            {selectedLeague ? `Manage rounds for ${selectedLeague.name}` : 'Manage tournament rounds'}
          </p>
        </div>
        <button
          onClick={() => router.push(`/admin/matches?league=${leagueId || selectedLeague?.id}`)}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
        >
          ← Back to Matches
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-4">
          {error}
        </div>
      )}

      {/* Player Status Summary */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Player Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-green-700 mb-2">Active Players ({activePlayers.length})</h4>
            <div className="max-h-32 overflow-y-auto">
              {activePlayers.map(player => (
                <div key={player._id} className="text-sm text-gray-600">
                  {player.name} ({player.level})
                </div>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-medium text-red-700 mb-2">Inactive Players ({inactivePlayers.length})</h4>
            <div className="max-h-32 overflow-y-auto">
              {inactivePlayers.map(player => (
                <div key={player._id} className="text-sm text-gray-600">
                  {player.name} ({player.level}) - {player.status}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Rounds Management */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Round Management</h3>
        
        {rounds.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600">No rounds found. Create matches to get started.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {rounds.map(round => {
              const roundMatches = matchesByRound[round]
              const completedMatches = roundMatches.filter(m => m.status === 'completed').length
              const scheduledMatches = roundMatches.filter(m => m.status === 'scheduled').length
              
              return (
                <div key={round} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="font-medium text-gray-900">Round {round}</h4>
                      <div className="text-sm text-gray-600 mt-1">
                        {roundMatches.length} matches total • {completedMatches} completed • {scheduledMatches} scheduled
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => handleDeleteRound(round)}
                        disabled={processing}
                        className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 text-sm"
                      >
                        Delete Entire Round
                      </button>
                    </div>
                  </div>
                  
                  {/* List all matches in this round - EDITABLE */}
                  <div className="mt-4">
                    <h5 className="text-sm font-medium text-gray-700 mb-2">Matches in this round:</h5>
                    <div className="space-y-2">
                      {roundMatches.map(match => {
                        const isProblematic = inactivePlayers.some(p => 
                          p._id === match.players?.player1?._id || p._id === match.players?.player2?._id
                        )
                        
                        return (
                          <div 
                            key={match._id} 
                            className={`flex items-center justify-between p-3 rounded border ${
                              isProblematic ? 'bg-yellow-50 border-yellow-200' : 'bg-gray-50 border-gray-200'
                            }`}
                          >
                            <div className="flex-1">
                              <div className="text-sm font-medium">
                                {match.players?.player1?.name || 'Player 1'} vs {match.players?.player2?.name || 'Player 2'}
                              </div>
                              <div className="text-xs text-gray-500">
                                Status: {match.status} 
                                {match.schedule?.confirmedDate && ` • ${new Date(match.schedule.confirmedDate).toLocaleDateString()}`}
                                {isProblematic && ' • ⚠️ Inactive player'}
                              </div>
                            </div>
                            <button
                              onClick={() => router.push(`/admin/matches/${match._id}`)}
                              className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                            >
                              Edit Match
                            </button>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* How to Edit */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h3 className="font-semibold text-green-900 mb-2">✏️ How to Edit Matches</h3>
        <div className="text-sm text-green-800 space-y-2">
          <p><strong>1. Click "Edit Match"</strong> on any match below to change players, schedule, or enter results</p>
          <p><strong>2. Delete entire rounds</strong> if you want to start over</p>
          <p><strong>3. Go back to Matches</strong> to create new matches or use Swiss Pairing for new rounds</p>
        </div>
      </div>
    </div>
  )
}

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-xl text-gray-600">Loading round management...</div>
    </div>
  )
}

export default function RoundManagementPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <RoundManagementContent />
    </Suspense>
  )
}