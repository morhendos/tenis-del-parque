import React, { useState, useEffect } from 'react'

export default function MatchPlayersTab({ match, onPlayersUpdate }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [players, setPlayers] = useState([])
  const [selectedPlayer1, setSelectedPlayer1] = useState(match.players.player1._id)
  const [selectedPlayer2, setSelectedPlayer2] = useState(match.players.player2._id)

  useEffect(() => {
    fetchPlayers()
  }, [match.league._id])

  const fetchPlayers = async () => {
    try {
      const response = await fetch(`/api/admin/players?league=${match.league._id}`)
      if (!response.ok) throw new Error('Failed to fetch players')
      
      const data = await response.json()
      setPlayers(data.players || [])
    } catch (error) {
      console.error('Error fetching players:', error)
      setError('Failed to load players')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    
    // Validate selections
    if (selectedPlayer1 === selectedPlayer2) {
      setError('Player 1 and Player 2 must be different')
      return
    }

    // Check if players have changed
    if (selectedPlayer1 === match.players.player1._id && 
        selectedPlayer2 === match.players.player2._id) {
      setError('No changes made to players')
      return
    }

    try {
      setLoading(true)
      await onPlayersUpdate({
        player1: selectedPlayer1,
        player2: selectedPlayer2
      })
      setSuccess('Players updated successfully')
    } catch (error) {
      setError(error.message || 'Failed to update players')
    } finally {
      setLoading(false)
    }
  }

  // Don't allow editing completed matches
  if (match.status === 'completed') {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-yellow-800">
          <strong>Players cannot be changed for completed matches.</strong> This match has already been played and results have been recorded.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-blue-800 text-sm">
          <strong>Note:</strong> Changing players will maintain all other match data (schedule, round, etc.) but will reset any wild card usage records.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-800">{success}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Player 1 Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Player 1
            </label>
            <select
              value={selectedPlayer1}
              onChange={(e) => setSelectedPlayer1(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-parque-purple focus:border-transparent"
              disabled={loading}
            >
              <option value="">Select Player 1</option>
              {players.map(player => (
                <option 
                  key={player._id} 
                  value={player._id}
                  disabled={player._id === selectedPlayer2}
                >
                  {player.name} ({player.level}) - ELO: {player.stats?.eloRating || 1200}
                </option>
              ))}
            </select>
            {match.players.player1._id !== selectedPlayer1 && (
              <p className="text-sm text-gray-500 mt-1">
                Currently: {match.players.player1.name}
              </p>
            )}
          </div>

          {/* Player 2 Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Player 2
            </label>
            <select
              value={selectedPlayer2}
              onChange={(e) => setSelectedPlayer2(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-parque-purple focus:border-transparent"
              disabled={loading}
            >
              <option value="">Select Player 2</option>
              {players.map(player => (
                <option 
                  key={player._id} 
                  value={player._id}
                  disabled={player._id === selectedPlayer1}
                >
                  {player.name} ({player.level}) - ELO: {player.stats?.eloRating || 1200}
                </option>
              ))}
            </select>
            {match.players.player2._id !== selectedPlayer2 && (
              <p className="text-sm text-gray-500 mt-1">
                Currently: {match.players.player2.name}
              </p>
            )}
          </div>
        </div>

        {/* Current Match Info */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-2">Current Match Details</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Round:</span> {match.round}
            </div>
            <div>
              <span className="text-gray-600">Status:</span> {match.status}
            </div>
            <div>
              <span className="text-gray-600">Scheduled:</span> {match.schedule?.confirmedDate ? new Date(match.schedule.confirmedDate).toLocaleDateString() : 'TBD'}
            </div>
            <div>
              <span className="text-gray-600">League:</span> {match.league.name}
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => {
              setSelectedPlayer1(match.players.player1._id)
              setSelectedPlayer2(match.players.player2._id)
              setError('')
              setSuccess('')
            }}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            disabled={loading}
          >
            Reset
          </button>
          <button
            type="submit"
            disabled={loading || !selectedPlayer1 || !selectedPlayer2}
            className="px-4 py-2 bg-parque-purple text-white rounded-lg hover:bg-opacity-90 disabled:opacity-50"
          >
            {loading ? 'Updating...' : 'Update Players'}
          </button>
        </div>
      </form>
    </div>
  )
}
