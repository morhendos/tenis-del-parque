'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'

export default function MatchDetailPage() {
  const [match, setMatch] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [isEditingResult, setIsEditingResult] = useState(false)
  const [resultForm, setResultForm] = useState({
    sets: [{ player1: '', player2: '' }],
    winner: '',
    walkover: false,
    retiredPlayer: ''
  })
  
  const router = useRouter()
  const params = useParams()
  const matchId = params.id

  useEffect(() => {
    checkAuth()
    fetchMatch()
  }, [matchId])

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/admin/auth/check')
      if (!res.ok) {
        router.push('/admin')
      }
    } catch (error) {
      router.push('/admin')
    }
  }

  const fetchMatch = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/admin/matches/${matchId}`)
      if (!res.ok) throw new Error('Failed to fetch match')
      
      const data = await res.json()
      setMatch(data.match)
      
      // Initialize form with existing result if any
      if (data.match.result) {
        setResultForm({
          sets: data.match.result.score?.sets || [{ player1: '', player2: '' }],
          winner: data.match.result.winner || '',
          walkover: data.match.result.score?.walkover || false,
          retiredPlayer: data.match.result.score?.retiredPlayer || ''
        })
      }
    } catch (error) {
      console.error('Error fetching match:', error)
      setError('Error loading match')
    } finally {
      setLoading(false)
    }
  }

  const handleAddSet = () => {
    setResultForm({
      ...resultForm,
      sets: [...resultForm.sets, { player1: '', player2: '' }]
    })
  }

  const handleRemoveSet = (index) => {
    const newSets = resultForm.sets.filter((_, i) => i !== index)
    setResultForm({
      ...resultForm,
      sets: newSets.length > 0 ? newSets : [{ player1: '', player2: '' }]
    })
  }

  const handleSetChange = (index, player, value) => {
    const newSets = [...resultForm.sets]
    newSets[index][player] = value
    setResultForm({ ...resultForm, sets: newSets })
    
    // Auto-determine winner if all sets are filled
    if (value !== '') {
      const completeSets = newSets.filter(set => set.player1 !== '' && set.player2 !== '')
      if (completeSets.length >= 2) {
        const player1Wins = completeSets.filter(set => parseInt(set.player1) > parseInt(set.player2)).length
        const player2Wins = completeSets.filter(set => parseInt(set.player2) > parseInt(set.player1)).length
        
        if (player1Wins > player2Wins) {
          setResultForm(prev => ({ ...prev, winner: match.players.player1._id }))
        } else if (player2Wins > player1Wins) {
          setResultForm(prev => ({ ...prev, winner: match.players.player2._id }))
        }
      }
    }
  }

  const handleSubmitResult = async () => {
    setError('')
    setSubmitting(true)

    try {
      // Validate form
      if (!resultForm.winner) {
        throw new Error('Please select a winner')
      }

      // Prepare result data
      const result = {
        winner: resultForm.winner,
        score: {
          sets: resultForm.sets.filter(set => set.player1 !== '' && set.player2 !== ''),
          walkover: resultForm.walkover
        }
      }

      if (resultForm.retiredPlayer) {
        result.score.retiredPlayer = resultForm.retiredPlayer
      }

      const res = await fetch(`/api/admin/matches/${matchId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ result })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to update match')
      }

      // Refresh match data
      await fetchMatch()
      setIsEditingResult(false)
    } catch (error) {
      console.error('Error submitting result:', error)
      setError(error.message || 'Failed to submit result')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-parque-bg flex items-center justify-center">
        <div className="text-xl text-parque-purple">Loading match...</div>
      </div>
    )
  }

  if (!match) {
    return (
      <div className="min-h-screen bg-parque-bg flex items-center justify-center">
        <div className="text-xl text-red-600">Match not found</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-parque-bg">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-parque-purple mb-2">Match Details</h1>
            <p className="text-gray-600">
              Round {match.round} - {match.league?.name || 'Unknown League'}
            </p>
          </div>
          <button
            onClick={() => router.push(`/admin/matches?league=${match.league._id}`)}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            Back to Matches
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Match Info */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Player 1 */}
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {match.players.player1.name}
              </h3>
              <p className="text-sm text-gray-600">
                {match.players.player1.level} • ELO: {match.players.player1.stats?.eloRating || 1200}
              </p>
              <p className="text-sm text-gray-500">{match.players.player1.email}</p>
              <p className="text-sm text-gray-500">{match.players.player1.whatsapp}</p>
              {match.eloChanges?.player1 && (
                <p className={`text-sm mt-2 font-medium ${
                  match.eloChanges.player1.change > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  ELO Change: {match.eloChanges.player1.change > 0 ? '+' : ''}{match.eloChanges.player1.change}
                  ({match.eloChanges.player1.before} → {match.eloChanges.player1.after})
                </p>
              )}
            </div>

            <div className="text-center text-2xl text-gray-400 flex items-center justify-center">
              VS
            </div>

            {/* Player 2 */}
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {match.players.player2.name}
              </h3>
              <p className="text-sm text-gray-600">
                {match.players.player2.level} • ELO: {match.players.player2.stats?.eloRating || 1200}
              </p>
              <p className="text-sm text-gray-500">{match.players.player2.email}</p>
              <p className="text-sm text-gray-500">{match.players.player2.whatsapp}</p>
              {match.eloChanges?.player2 && (
                <p className={`text-sm mt-2 font-medium ${
                  match.eloChanges.player2.change > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  ELO Change: {match.eloChanges.player2.change > 0 ? '+' : ''}{match.eloChanges.player2.change}
                  ({match.eloChanges.player2.before} → {match.eloChanges.player2.after})
                </p>
              )}
            </div>
          </div>

          {/* Schedule Info */}
          <div className="mt-6 pt-6 border-t">
            <h4 className="font-medium text-gray-900 mb-2">Schedule</h4>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Date:</span>{' '}
                {match.schedule?.confirmedDate
                  ? new Date(match.schedule.confirmedDate).toLocaleDateString()
                  : 'TBD'}
              </div>
              <div>
                <span className="text-gray-500">Time:</span>{' '}
                {match.schedule?.confirmedDate
                  ? new Date(match.schedule.confirmedDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  : 'TBD'}
              </div>
              <div>
                <span className="text-gray-500">Court:</span>{' '}
                {match.schedule?.court || 'TBD'}
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="mt-4">
            <span className="text-gray-500">Status:</span>{' '}
            <span className={`inline-block px-2 py-1 text-xs rounded-full ${
              match.status === 'completed' ? 'bg-green-100 text-green-800' :
              match.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
              match.status === 'cancelled' ? 'bg-red-100 text-red-800' :
              'bg-yellow-100 text-yellow-800'
            }`}>
              {match.status.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Result Section */}
        {match.status === 'completed' && match.result && !isEditingResult ? (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Match Result</h3>
              <button
                onClick={() => setIsEditingResult(true)}
                className="text-sm text-parque-purple hover:underline"
              >
                Edit Result
              </button>
            </div>
            
            <div className="text-center mb-4">
              <p className="text-lg font-medium text-gray-900">
                Winner: <span className="text-parque-green">
                  {match.result.winner === match.players.player1._id 
                    ? match.players.player1.name 
                    : match.players.player2.name}
                </span>
              </p>
            </div>

            {match.result.score?.sets && (
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">
                  {match.result.score.sets.map(set => `${set.player1}-${set.player2}`).join(', ')}
                </p>
              </div>
            )}

            {match.result.playedAt && (
              <p className="text-sm text-gray-500 text-center mt-4">
                Played on {new Date(match.result.playedAt).toLocaleString()}
              </p>
            )}
          </div>
        ) : (match.status === 'scheduled' || isEditingResult) && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {isEditingResult ? 'Edit Result' : 'Enter Result'}
            </h3>

            {/* Score Entry */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Score (Sets)
                </label>
                {resultForm.sets.map((set, index) => (
                  <div key={index} className="flex items-center mb-2">
                    <span className="text-sm text-gray-600 w-32">{match.players.player1.name}:</span>
                    <input
                      type="number"
                      min="0"
                      max="7"
                      value={set.player1}
                      onChange={(e) => handleSetChange(index, 'player1', e.target.value)}
                      className="w-16 px-2 py-1 border border-gray-300 rounded"
                      disabled={resultForm.walkover}
                    />
                    <span className="mx-2">-</span>
                    <input
                      type="number"
                      min="0"
                      max="7"
                      value={set.player2}
                      onChange={(e) => handleSetChange(index, 'player2', e.target.value)}
                      className="w-16 px-2 py-1 border border-gray-300 rounded"
                      disabled={resultForm.walkover}
                    />
                    <span className="text-sm text-gray-600 ml-2 w-32">{match.players.player2.name}</span>
                    {resultForm.sets.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveSet(index)}
                        className="ml-2 text-red-500 hover:text-red-700"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
                
                {!resultForm.walkover && (
                  <button
                    type="button"
                    onClick={handleAddSet}
                    className="text-sm text-parque-purple hover:underline"
                  >
                    + Add Set
                  </button>
                )}
              </div>

              {/* Winner Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Winner <span className="text-red-500">*</span>
                </label>
                <select
                  value={resultForm.winner}
                  onChange={(e) => setResultForm({ ...resultForm, winner: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-parque-purple"
                  required
                >
                  <option value="">Select winner...</option>
                  <option value={match.players.player1._id}>{match.players.player1.name}</option>
                  <option value={match.players.player2._id}>{match.players.player2.name}</option>
                </select>
              </div>

              {/* Special Cases */}
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={resultForm.walkover}
                    onChange={(e) => setResultForm({ ...resultForm, walkover: e.target.checked })}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Walkover</span>
                </label>

                {!resultForm.walkover && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Retirement (optional)
                    </label>
                    <select
                      value={resultForm.retiredPlayer}
                      onChange={(e) => setResultForm({ ...resultForm, retiredPlayer: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-parque-purple"
                    >
                      <option value="">No retirement</option>
                      <option value={match.players.player1._id}>{match.players.player1.name} retired</option>
                      <option value={match.players.player2._id}>{match.players.player2.name} retired</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Buttons */}
              <div className="flex justify-end space-x-4 pt-4">
                {isEditingResult && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditingResult(false)
                      // Reset form to original result
                      if (match.result) {
                        setResultForm({
                          sets: match.result.score?.sets || [{ player1: '', player2: '' }],
                          winner: match.result.winner || '',
                          walkover: match.result.score?.walkover || false,
                          retiredPlayer: match.result.score?.retiredPlayer || ''
                        })
                      }
                    }}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                )}
                <button
                  onClick={handleSubmitResult}
                  disabled={submitting || !resultForm.winner}
                  className="px-6 py-2 bg-parque-purple text-white rounded-lg hover:bg-opacity-90 disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Save Result'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Notes Section */}
        {match.notes && (
          <div className="bg-white rounded-lg shadow-md p-6 mt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Notes</h3>
            <p className="text-gray-700">{match.notes}</p>
          </div>
        )}
      </div>
    </div>
  )
}
