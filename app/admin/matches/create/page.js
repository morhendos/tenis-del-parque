'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

// Player Card Component for drag and drop
function PlayerCard({ player, isSelected, onSelect, isDragging, matchHistory = [] }) {
  const initials = player.name.split(' ').map(n => n[0]).join('').toUpperCase()
  
  // Get status color and label
  const getStatusStyle = () => {
    switch(player.status) {
      case 'active':
        return { bg: 'bg-green-100', text: 'text-green-800', label: 'Active' }
      case 'confirmed':
        return { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Confirmed' }
      case 'pending':
        return { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Pending' }
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-800', label: player.status }
    }
  }
  
  const statusStyle = getStatusStyle()
  
  return (
    <div
      className={`
        p-4 bg-white rounded-lg border-2 cursor-pointer transition-all
        ${isSelected ? 'border-parque-purple shadow-lg scale-105' : 'border-gray-200 hover:border-gray-300'}
        ${isDragging ? 'opacity-50' : ''}
      `}
      onClick={() => onSelect(player)}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('playerId', player._id)
        e.dataTransfer.effectAllowed = 'move'
      }}
    >
      <div className="flex items-center space-x-3">
        <div className={`
          w-12 h-12 rounded-full flex items-center justify-center font-bold text-white
          ${player.level === 'advanced' ? 'bg-purple-600' : 
            player.level === 'intermediate' ? 'bg-blue-600' : 'bg-green-600'}
        `}>
          {initials}
        </div>
        <div className="flex-1">
          <div className="font-semibold text-gray-900 flex items-center gap-2">
            {player.name}
            <span className={`text-xs px-2 py-0.5 rounded-full ${statusStyle.bg} ${statusStyle.text}`}>
              {statusStyle.label}
            </span>
          </div>
          <div className="text-sm text-gray-600">
            {player.level} • ELO: {player.eloRating || player.stats?.eloRating || 1200}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            W: {player.stats?.matchesWon || 0} - L: {player.stats?.matchesPlayed - player.stats?.matchesWon || 0}
          </div>
        </div>
      </div>
    </div>
  )
}

// Match Pairing Component
function MatchPairing({ match, index, onSwapPlayers, onRemoveMatch, playerHistory, isEditable = true }) {
  const [dragOver, setDragOver] = useState(null)
  
  // Handle BYE matches
  if (match.isBye || !match.player2) {
    return (
      <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-lg shadow-md p-6 relative border-2 border-emerald-300">
        {isEditable && (
          <button
            onClick={() => onRemoveMatch(index)}
            className="absolute top-2 right-2 text-gray-400 hover:text-red-600"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
        
        <div className="flex items-center justify-between">
          <div className="flex-1 p-3 rounded-lg border-2 border-emerald-200 bg-white">
            <PlayerCard player={match.player1} isSelected={false} onSelect={() => {}} />
          </div>
          
          <div className="mx-4 flex flex-col items-center">
            <span className="text-emerald-600 text-lg font-bold">BYE</span>
            <span className="text-emerald-500 text-xs">+3 pts</span>
          </div>
          
          <div className="flex-1 p-3 rounded-lg border-2 border-dashed border-emerald-300 bg-emerald-50 flex items-center justify-center min-h-[100px]">
            <div className="text-center">
              <svg className="w-8 h-8 mx-auto text-emerald-400 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-emerald-600 font-medium">Auto Win</span>
            </div>
          </div>
        </div>
      </div>
    )
  }
  
  const handleDrop = (e, position) => {
    e.preventDefault()
    const playerId = e.dataTransfer.getData('playerId')
    if (playerId && isEditable) {
      onSwapPlayers(index, position, playerId)
    }
    setDragOver(null)
  }
  
  const handleDragOver = (e, position) => {
    e.preventDefault()
    setDragOver(position)
  }
  
  const hasPlayedBefore = playerHistory[match.player1._id]?.includes(match.player2._id)
  const eloDiff = Math.abs((match.player1.eloRating || match.player1.stats?.eloRating || 1200) - (match.player2.eloRating || match.player2.stats?.eloRating || 1200))
  const isHighEloDiff = eloDiff > 200
  const isDifferentLevel = match.player1.level !== match.player2.level
  
  return (
    <div className={`
      bg-white rounded-lg shadow-md p-6 relative
      ${hasPlayedBefore ? 'border-2 border-orange-400' : ''}
    `}>
      {isEditable && (
        <button
          onClick={() => onRemoveMatch(index)}
          className="absolute top-2 right-2 text-gray-400 hover:text-red-600"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
      
      <div className="flex items-center justify-between">
        <div 
          className={`
            flex-1 p-3 rounded-lg border-2 transition-all
            ${dragOver === 'player1' ? 'border-parque-purple bg-purple-50' : 'border-gray-200'}
          `}
          onDrop={(e) => handleDrop(e, 'player1')}
          onDragOver={(e) => handleDragOver(e, 'player1')}
          onDragLeave={() => setDragOver(null)}
        >
          <PlayerCard player={match.player1} isSelected={false} onSelect={() => {}} />
        </div>
        
        <div className="mx-4 text-gray-400 text-lg font-bold">VS</div>
        
        <div 
          className={`
            flex-1 p-3 rounded-lg border-2 transition-all
            ${dragOver === 'player2' ? 'border-parque-purple bg-purple-50' : 'border-gray-200'}
          `}
          onDrop={(e) => handleDrop(e, 'player2')}
          onDragOver={(e) => handleDragOver(e, 'player2')}
          onDragLeave={() => setDragOver(null)}
        >
          <PlayerCard player={match.player2} isSelected={false} onSelect={() => {}} />
        </div>
      </div>
      
      {/* Warnings */}
      <div className="mt-4 space-y-2">
        {hasPlayedBefore && (
          <div className="flex items-center text-orange-600 text-sm">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            These players have already played each other
          </div>
        )}
        {isHighEloDiff && (
          <div className="flex items-center text-yellow-600 text-sm">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Large ELO difference ({eloDiff} points)
          </div>
        )}
        {isDifferentLevel && (
          <div className="flex items-center text-blue-600 text-sm">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Different skill levels
          </div>
        )}
      </div>
    </div>
  )
}

// Main Component
function CreateMatchContent() {
  const [players, setPlayers] = useState([])
  const [loading, setLoading] = useState(true)
  const [roundLoading, setRoundLoading] = useState(true) // New state for round loading
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [selectedLeague, setSelectedLeague] = useState(null)
  const [selectedPlayers, setSelectedPlayers] = useState([])
  const [matches, setMatches] = useState([])
  const [mode, setMode] = useState('manual') // 'manual', 'automatic', 'combined'
  const [roundNumber, setRoundNumber] = useState(null) // Start with null instead of 1
  const [playerHistory, setPlayerHistory] = useState({})
  const [isGenerating, setIsGenerating] = useState(false)
  const [existingRounds, setExistingRounds] = useState([])
  const [roundMode, setRoundMode] = useState('new') // 'new' or 'existing'
  
  const router = useRouter()
  const searchParams = useSearchParams()
  const leagueId = searchParams.get('league')
  const initialMode = searchParams.get('mode')
  const targetRound = searchParams.get('round')

  const fetchPlayers = useCallback(async () => {
    try {
      setLoading(true)
      setRoundLoading(true) // Set round loading to true
      
      const params = new URLSearchParams({
        league: leagueId || selectedLeague?.id || '',
        status: 'confirmed,active'
      })
      
      const res = await fetch(`/api/admin/players?${params}`)
      if (!res.ok) throw new Error('Failed to fetch players')
      
      const data = await res.json()
      setPlayers(data.players || [])
      
      // Fetch match history
      const matchRes = await fetch(`/api/admin/matches?league=${leagueId || selectedLeague?.id}`)
      if (matchRes.ok) {
        const matchData = await matchRes.json()
        const history = {}
        
        matchData.matches?.forEach(match => {
          if (match.players?.player1?._id && match.players?.player2?._id) {
            const p1Id = match.players.player1._id
            const p2Id = match.players.player2._id
            
            if (!history[p1Id]) history[p1Id] = []
            if (!history[p2Id]) history[p2Id] = []
            
            history[p1Id].push(p2Id)
            history[p2Id].push(p1Id)
          }
        })
        
        setPlayerHistory(history)
        
        // Get existing rounds
        const rounds = [...new Set(matchData.matches?.map(m => m.round || 0) || [])].sort((a, b) => a - b)
        setExistingRounds(rounds)
        
        // Determine round number based on URL parameter or next available
        if (targetRound) {
          setRoundNumber(parseInt(targetRound))
          setRoundMode('existing')
        } else {
          // Check if there's a stored round selection
          const storedRoundSelection = sessionStorage.getItem('roundSelection')
          if (storedRoundSelection) {
            const { round, mode } = JSON.parse(storedRoundSelection)
            setRoundNumber(round)
            setRoundMode(mode)
          } else {
            // Calculate next round number
            const maxRound = Math.max(0, ...rounds)
            setRoundNumber(maxRound + 1)
            setRoundMode('new')
          }
        }
      } else {
        // If match fetch fails, default to round 1
        setRoundNumber(1)
        setRoundMode('new')
      }
      
      setRoundLoading(false) // Round loading complete
      return data.players || []
    } catch (error) {
      console.error('Error fetching players:', error)
      setError('Error loading players')
      setRoundNumber(1) // Default to round 1 on error
      setRoundLoading(false)
      return []
    } finally {
      setLoading(false)
    }
  }, [leagueId, selectedLeague?.id, targetRound])

  useEffect(() => {
    const storedLeague = sessionStorage.getItem('selectedLeague')
    if (storedLeague) {
      setSelectedLeague(JSON.parse(storedLeague))
    } else if (!leagueId) {
      router.push('/admin/leagues')
      return
    }

    fetchPlayers().then((playerList) => {
      // Check if we have Swiss pairings from the generate-round page
      if (initialMode === 'swiss') {
        const swissData = sessionStorage.getItem('swissPairings')
        if (swissData) {
          const { round, pairings } = JSON.parse(swissData)
          setRoundNumber(round)
          
          // Convert pairings to match format using the actual player objects
          const swissMatches = pairings.map(pairing => {
            const player1 = playerList.find(p => p.name === pairing.player1.name)
            const player2 = playerList.find(p => p.name === pairing.player2.name)
            
            if (player1 && player2) {
              return {
                player1,
                player2,
                round: round,
                isRematch: pairing.isRematch
              }
            }
            return null
          }).filter(m => m !== null)
          
          setMatches(swissMatches)
          setMode('combined')
          
          // Clear the stored pairings
          sessionStorage.removeItem('swissPairings')
        }
      }
    })
  }, [leagueId, router, fetchPlayers, initialMode])

  // Save round selection to session storage whenever it changes
  useEffect(() => {
    if (roundNumber !== null && roundMode) {
      sessionStorage.setItem('roundSelection', JSON.stringify({
        round: roundNumber,
        mode: roundMode
      }))
    }
  }, [roundNumber, roundMode])

  const handlePlayerSelect = (player) => {
    // Don't allow player selection until round is determined
    if (roundNumber === null) {
      setError('Please wait for round information to load')
      return
    }
    
    if (selectedPlayers.some(p => p._id === player._id)) {
      setSelectedPlayers(selectedPlayers.filter(p => p._id !== player._id))
    } else {
      setSelectedPlayers([...selectedPlayers, player])
      
      // Auto-create match when 2 players selected
      if (selectedPlayers.length === 1) {
        const newMatch = {
          player1: selectedPlayers[0],
          player2: player,
          round: roundNumber
        }
        setMatches([...matches, newMatch])
        setSelectedPlayers([])
      }
    }
  }

  const handleCreateBye = () => {
    if (selectedPlayers.length !== 1 || roundNumber === null) return
    
    const byeMatch = {
      player1: selectedPlayers[0],
      player2: null, // BYE indicator
      round: roundNumber,
      isBye: true
    }
    setMatches([...matches, byeMatch])
    setSelectedPlayers([])
  }
  
  const handleSwapPlayers = (matchIndex, position, playerId) => {
    const player = players.find(p => p._id === playerId)
    if (!player) return
    
    const newMatches = [...matches]
    newMatches[matchIndex] = {
      ...newMatches[matchIndex],
      [position]: player
    }
    setMatches(newMatches)
  }
  
  const handleRemoveMatch = (index) => {
    setMatches(matches.filter((_, i) => i !== index))
  }
  
  const generateAutomaticPairings = async () => {
    if (roundNumber === null) {
      setError('Round number not determined yet')
      return
    }
    
    setIsGenerating(true)
    setError('')
    
    try {
      const res = await fetch('/api/admin/matches/generate-round', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leagueId: selectedLeague?.id || leagueId,
          season: selectedLeague?.season ? `${selectedLeague.season.type}-${selectedLeague.season.year}` : leagueId,
          round: roundNumber,
          generateMatches: false
        })
      })
      
      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate pairings')
      }
      
      // Convert summary pairings to match format
      const generatedMatches = data.summary.pairings.map(pairing => ({
        player1: players.find(p => p.name === pairing.player1.name),
        player2: players.find(p => p.name === pairing.player2.name),
        round: roundNumber,
        isRematch: pairing.isRematch
      }))
      
      setMatches(generatedMatches)
      setMode('combined')
    } catch (error) {
      console.error('Error generating pairings:', error)
      setError(error.message || 'Failed to generate pairings')
    } finally {
      setIsGenerating(false)
    }
  }
  
  const handleSubmit = async () => {
    if (matches.length === 0) {
      setError('Please create at least one match')
      return
    }
    
    if (roundNumber === null) {
      setError('Round number not determined')
      return
    }
    
    setSubmitting(true)
    setError('')
    
    try {
      // Separate BYE matches from regular matches
      const byeMatches = matches.filter(m => m.isBye || !m.player2)
      const regularMatches = matches.filter(m => !m.isBye && m.player2)
      
      // Create regular matches
      const regularPromises = regularMatches.map(match => 
        fetch('/api/admin/matches', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            league: leagueId || selectedLeague?.id,
            season: selectedLeague?.season ? `${selectedLeague.season.type}-${selectedLeague.season.year}` : leagueId,
            round: roundNumber,
            player1Id: match.player1._id,
            player2Id: match.player2._id
          })
        })
      )
      
      // Create BYE matches
      const byePromises = byeMatches.map(match => 
        fetch('/api/admin/matches', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            league: leagueId || selectedLeague?.id,
            season: selectedLeague?.season ? `${selectedLeague.season.type}-${selectedLeague.season.year}` : leagueId,
            round: roundNumber,
            player1Id: match.player1._id,
            isBye: true
          })
        })
      )
      
      const results = await Promise.all([...regularPromises, ...byePromises])
      const failed = results.filter(r => !r.ok).length
      
      if (failed > 0) {
        throw new Error(`Failed to create ${failed} matches`)
      }
      
      const byeCount = byeMatches.length
      const regularCount = regularMatches.length
      const message = byeCount > 0 
        ? `Successfully created ${regularCount} matches and ${byeCount} BYE${byeCount > 1 ? 's' : ''} for round ${roundNumber}`
        : `Successfully created ${matches.length} matches for round ${roundNumber}`
      
      setSuccess(message)
      
      // Clear round selection from session storage on success
      sessionStorage.removeItem('roundSelection')
      
      setTimeout(() => {
        router.push(`/admin/matches?league=${leagueId || selectedLeague?.id}`)
      }, 2000)
    } catch (error) {
      console.error('Error creating matches:', error)
      setError(error.message || 'Failed to create matches')
    } finally {
      setSubmitting(false)
    }
  }

  const handleRoundModeChange = (mode) => {
    setRoundMode(mode)
    if (mode === 'new') {
      const maxRound = Math.max(0, ...existingRounds)
      setRoundNumber(maxRound + 1)
    } else if (existingRounds.length > 0) {
      setRoundNumber(existingRounds[existingRounds.length - 1])
    }
  }

  // Group players by level for display
  const playersByLevel = {
    advanced: players.filter(p => p.level === 'advanced'),
    intermediate: players.filter(p => p.level === 'intermediate'),
    beginner: players.filter(p => p.level === 'beginner')
  }
  
  const unpairedPlayers = players.filter(player => 
    !matches.some(m => m.player1._id === player._id || m.player2._id === player._id)
  )

  // Show loading state while determining round
  if (loading || roundLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-parque-purple mx-auto mb-4"></div>
          <div className="text-xl text-gray-600">
            {roundLoading ? 'Determining round number...' : 'Loading players...'}
          </div>
        </div>
      </div>
    )
  }

  // Don't allow any actions until round is determined
  const isReady = roundNumber !== null

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Create Matches</h1>
            <p className="text-gray-600 mt-1">
              {selectedLeague?.name || 'League'} - Round {roundNumber || '...'}
            </p>
          </div>
          <button
            onClick={() => router.push(`/admin/matches?league=${selectedLeague?.id || leagueId}`)}
            className="px-4 py-2 text-gray-600 hover:text-gray-900"
          >
            ← Back to Matches
          </button>
        </div>
        
        {/* Mode Selection */}
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setMode('manual')}
            disabled={!isReady}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              mode === 'manual' 
                ? 'bg-parque-purple text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            Manual Pairing
          </button>
          <button
            onClick={() => {
              if (isReady) {
                setMode('automatic')
                generateAutomaticPairings()
              }
            }}
            disabled={!isReady || isGenerating}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              mode === 'automatic' || mode === 'combined'
                ? 'bg-parque-purple text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isGenerating ? 'Generating...' : 'Swiss Pairing'}
          </button>
        </div>
        
        {/* Round Selection */}
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-3">
              <input
                type="radio"
                id="new-round"
                name="round-mode"
                value="new"
                checked={roundMode === 'new'}
                onChange={() => handleRoundModeChange('new')}
                disabled={!isReady}
                className="text-parque-purple focus:ring-parque-purple disabled:opacity-50"
              />
              <label htmlFor="new-round" className="text-sm font-medium text-gray-700">
                Create New Round
              </label>
            </div>
            
            {existingRounds.length > 0 && (
              <div className="flex items-center space-x-3">
                <input
                  type="radio"
                  id="existing-round"
                  name="round-mode"
                  value="existing"
                  checked={roundMode === 'existing'}
                  onChange={() => handleRoundModeChange('existing')}
                  disabled={!isReady}
                  className="text-parque-purple focus:ring-parque-purple disabled:opacity-50"
                />
                <label htmlFor="existing-round" className="text-sm font-medium text-gray-700">
                  Add to Existing Round
                </label>
              </div>
            )}
          </div>
          
          <div className="mt-4 flex items-center space-x-4">
            {roundMode === 'new' ? (
              <>
                <label className="text-sm font-medium text-gray-700">Round Number:</label>
                <input
                  type="number"
                  min="1"
                  value={roundNumber || ''}
                  onChange={(e) => setRoundNumber(parseInt(e.target.value) || 1)}
                  disabled={!isReady}
                  className="w-20 px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:bg-gray-100"
                />
              </>
            ) : (
              <>
                <label className="text-sm font-medium text-gray-700">Select Round:</label>
                <select
                  value={roundNumber || ''}
                  onChange={(e) => setRoundNumber(parseInt(e.target.value))}
                  disabled={!isReady}
                  className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:bg-gray-100"
                >
                  {existingRounds.map(round => (
                    <option key={round} value={round}>Round {round}</option>
                  ))}
                </select>
              </>
            )}
          </div>
          
          {!isReady && (
            <div className="mt-3 text-sm text-yellow-600">
              <svg className="inline w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Determining round number...
            </div>
          )}
        </div>
        
        {/* Status Legend */}
        <div className="flex items-center space-x-4 text-sm text-gray-600">
          <span className="font-medium">Player Status:</span>
          <div className="flex items-center space-x-2">
            <span className="px-2 py-1 rounded-full bg-green-100 text-green-800">Active</span>
            <span className="text-gray-400">Players can log in</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="px-2 py-1 rounded-full bg-yellow-100 text-yellow-800">Confirmed</span>
            <span className="text-gray-400">Invited, not yet activated</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-4 mb-6">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-600 rounded-lg p-4 mb-6">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Player Pool */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">
              Available Players ({players.length})
            </h2>
            
            {mode === 'combined' && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
                Drag players to swap positions or click to select for new matches
              </div>
            )}
            
            <div className="space-y-4 max-h-[600px] overflow-y-auto">
              {Object.entries(playersByLevel).map(([level, levelPlayers]) => {
                // Sort players within each level: unpaired first, then paired
                const sortedLevelPlayers = [...levelPlayers].sort((a, b) => {
                  const aIsPaired = !unpairedPlayers.includes(a)
                  const bIsPaired = !unpairedPlayers.includes(b)
                  
                  // Unpaired players come first
                  if (aIsPaired && !bIsPaired) return 1
                  if (!aIsPaired && bIsPaired) return -1
                  
                  // Within same pairing status, sort by name
                  return a.name.localeCompare(b.name)
                })
                
                return (
                  <div key={level}>
                    <h3 className="text-sm font-medium text-gray-600 mb-2 capitalize">
                      {level} ({unpairedPlayers.filter(p => p.level === level).length}/{levelPlayers.length})
                    </h3>
                    <div className="space-y-2">
                      {sortedLevelPlayers.map(player => {
                        const isPaired = !unpairedPlayers.includes(player)
                        const isSelected = selectedPlayers.some(p => p._id === player._id)
                        
                        return (
                          <div key={player._id} className={isPaired ? 'opacity-50' : ''}>
                            <PlayerCard
                              player={player}
                              isSelected={isSelected}
                              onSelect={isReady ? handlePlayerSelect : () => {}}
                              matchHistory={playerHistory[player._id] || []}
                            />
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
            
            {selectedPlayers.length === 1 && (
              <div className="mt-4 p-3 bg-parque-purple/10 rounded-lg space-y-3">
                <p className="text-sm text-parque-purple">
                  Selected: {selectedPlayers[0].name}
                </p>
                <div className="flex gap-2">
                  <span className="text-xs text-gray-500 self-center">Choose opponent or:</span>
                  <button
                    onClick={handleCreateBye}
                    className="px-3 py-1.5 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-1.5"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    Create BYE
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Match Pairings */}
        <div className="lg:col-span-2">
          <div className="bg-gray-50 rounded-lg p-6 min-h-[600px]">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">
                Match Pairings ({matches.length})
              </h2>
              {matches.length > 0 && (
                <button
                  onClick={() => setMatches([])}
                  className="text-sm text-red-600 hover:text-red-700"
                >
                  Clear All
                </button>
              )}
            </div>
            
            {!isReady ? (
              <div className="text-center py-12 text-gray-500">
                Please wait while round information loads...
              </div>
            ) : matches.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                {mode === 'manual' 
                  ? 'Select two players to create a match'
                  : 'Click "Swiss Pairing" to generate matches automatically'
                }
              </div>
            ) : (
              <div className="space-y-4">
                {matches.map((match, index) => (
                  <MatchPairing
                    key={index}
                    match={match}
                    index={index}
                    onSwapPlayers={handleSwapPlayers}
                    onRemoveMatch={handleRemoveMatch}
                    playerHistory={playerHistory}
                    isEditable={mode !== 'automatic' || mode === 'combined'}
                  />
                ))}
              </div>
            )}
            
            {matches.length > 0 && (
              <div className="mt-6 flex justify-end space-x-4">
                <button
                  onClick={() => router.back()}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting || !isReady}
                  className="px-6 py-2 bg-parque-purple text-white rounded-lg hover:bg-opacity-90 disabled:opacity-50"
                >
                  {submitting ? 'Creating...' : `Create ${matches.length} Matches`}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-xl text-gray-600">Loading...</div>
    </div>
  )
}

export default function CreateMatchPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <CreateMatchContent />
    </Suspense>
  )
}
