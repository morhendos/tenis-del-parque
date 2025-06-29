'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

function CreateMatchContent() {
  const [players, setPlayers] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [selectedLeague, setSelectedLeague] = useState(null)
  const [formData, setFormData] = useState({
    player1Id: '',
    player2Id: '',
    round: 1,
    season: 'summer-2025',
    confirmedDate: '',
    court: '',
    time: ''
  })
  
  const router = useRouter()
  const searchParams = useSearchParams()
  const leagueId = searchParams.get('league')

  useEffect(() => {
    // Get selected league from session storage
    const storedLeague = sessionStorage.getItem('selectedLeague')
    if (storedLeague) {
      setSelectedLeague(JSON.parse(storedLeague))
    } else if (!leagueId) {
      router.push('/admin/leagues')
      return
    }

    checkAuth()
    fetchPlayers()
  }, [leagueId])

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

  const fetchPlayers = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        league: leagueId || selectedLeague?.id || '',
        status: 'confirmed,active'
      })
      
      const res = await fetch(`/api/admin/players?${params}`)
      if (!res.ok) throw new Error('Failed to fetch players')
      
      const data = await res.json()
      setPlayers(data.players || [])
    } catch (error) {
      console.error('Error fetching players:', error)
      setError('Error loading players')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      // Validate form
      if (!formData.player1Id || !formData.player2Id) {
        throw new Error('Please select both players')
      }

      if (formData.player1Id === formData.player2Id) {
        throw new Error('Players must be different')
      }

      const schedule = {}
      if (formData.confirmedDate || formData.time) {
        const dateTime = formData.confirmedDate + (formData.time ? `T${formData.time}` : '')
        schedule.confirmedDate = new Date(dateTime).toISOString()
      }
      if (formData.court) {
        schedule.court = formData.court
      }

      const res = await fetch('/api/admin/matches', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          league: leagueId || selectedLeague?.id,
          season: formData.season,
          round: parseInt(formData.round),
          player1Id: formData.player1Id,
          player2Id: formData.player2Id,
          schedule
        })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create match')
      }

      // Redirect back to matches list
      router.push(`/admin/matches?league=${leagueId || selectedLeague?.id}`)
    } catch (error) {
      console.error('Error creating match:', error)
      setError(error.message || 'Failed to create match')
    } finally {
      setSubmitting(false)
    }
  }

  // Group players by level
  const playersByLevel = {
    beginner: players.filter(p => p.level === 'beginner'),
    intermediate: players.filter(p => p.level === 'intermediate'),
    advanced: players.filter(p => p.level === 'advanced')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-parque-bg flex items-center justify-center">
        <div className="text-xl text-parque-purple">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-parque-bg">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-parque-purple mb-2">Create Match</h1>
          <p className="text-gray-600">
            {selectedLeague ? `${selectedLeague.name} - ` : ''}
            Schedule a new match between two players
          </p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-6">
          {/* Round and Season */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Round
              </label>
              <input
                type="number"
                min="1"
                max="20"
                value={formData.round}
                onChange={(e) => setFormData({ ...formData, round: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-parque-purple"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Season
              </label>
              <select
                value={formData.season}
                onChange={(e) => setFormData({ ...formData, season: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-parque-purple"
                required
              >
                <option value="summer-2025">Summer 2025</option>
                <option value="fall-2025">Fall 2025</option>
                <option value="winter-2025">Winter 2025</option>
              </select>
            </div>
          </div>

          {/* Player Selection */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Player 1 <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.player1Id}
                onChange={(e) => setFormData({ ...formData, player1Id: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-parque-purple"
                required
              >
                <option value="">Select a player...</option>
                {Object.entries(playersByLevel).map(([level, levelPlayers]) => (
                  <optgroup key={level} label={`${level.charAt(0).toUpperCase() + level.slice(1)} (${levelPlayers.length})`}>
                    {levelPlayers.map(player => (
                      <option key={player._id} value={player._id} disabled={player._id === formData.player2Id}>
                        {player.name} (ELO: {player.stats?.eloRating || 1200})
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Player 2 <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.player2Id}
                onChange={(e) => setFormData({ ...formData, player2Id: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-parque-purple"
                required
              >
                <option value="">Select a player...</option>
                {Object.entries(playersByLevel).map(([level, levelPlayers]) => (
                  <optgroup key={level} label={`${level.charAt(0).toUpperCase() + level.slice(1)} (${levelPlayers.length})`}>
                    {levelPlayers.map(player => (
                      <option key={player._id} value={player._id} disabled={player._id === formData.player1Id}>
                        {player.name} (ELO: {player.stats?.eloRating || 1200})
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>
          </div>

          {/* Schedule */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Schedule (Optional)</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  value={formData.confirmedDate}
                  onChange={(e) => setFormData({ ...formData, confirmedDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-parque-purple"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Time
                </label>
                <input
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-parque-purple"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Court
                </label>
                <input
                  type="text"
                  value={formData.court}
                  onChange={(e) => setFormData({ ...formData, court: e.target.value })}
                  placeholder="e.g., Court 1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-parque-purple"
                />
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 bg-parque-purple text-white rounded-lg hover:bg-opacity-90 disabled:opacity-50"
            >
              {submitting ? 'Creating...' : 'Create Match'}
            </button>
          </div>
        </form>

        {/* Helper Text */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Tips:</strong> Players should ideally be from the same level or adjacent levels. 
            The Swiss system will automatically pair players with similar points in future rounds.
          </p>
        </div>
      </div>
    </div>
  )
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-parque-bg flex items-center justify-center">
      <div className="text-xl text-parque-purple">Loading...</div>
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
