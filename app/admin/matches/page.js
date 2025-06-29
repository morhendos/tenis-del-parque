'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function AdminMatchesPage() {
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedLeague, setSelectedLeague] = useState(null)
  const [filters, setFilters] = useState({
    round: 'all',
    status: 'all',
    search: ''
  })
  
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

    fetchMatches()
  }, [leagueId])

  const fetchMatches = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        league: leagueId || selectedLeague?.id || ''
      })
      
      const res = await fetch(`/api/admin/matches?${params}`)
      if (!res.ok) throw new Error('Failed to fetch matches')
      
      const data = await res.json()
      setMatches(data.matches || [])
    } catch (error) {
      console.error('Error fetching matches:', error)
      setError('Error loading matches')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateMatch = () => {
    router.push(`/admin/matches/create?league=${leagueId || selectedLeague?.id}`)
  }

  const handleEditMatch = (matchId) => {
    router.push(`/admin/matches/${matchId}`)
  }

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      case 'postponed':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (date) => {
    if (!date) return 'TBD'
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const filteredMatches = matches.filter(match => {
    if (filters.round !== 'all' && match.round !== parseInt(filters.round)) return false
    if (filters.status !== 'all' && match.status !== filters.status) return false
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      const player1Name = match.players?.player1?.name?.toLowerCase() || ''
      const player2Name = match.players?.player2?.name?.toLowerCase() || ''
      if (!player1Name.includes(searchLower) && !player2Name.includes(searchLower)) {
        return false
      }
    }
    return true
  })

  const rounds = [...new Set(matches.map(m => m.round))].sort((a, b) => a - b)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-xl text-gray-600">Loading matches...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Matches</h2>
          <p className="text-gray-600 mt-1">
            {selectedLeague ? `${selectedLeague.name} - ` : ''}
            Manage matches and results
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => router.push(`/admin/matches/generate-round?league=${leagueId || selectedLeague?.id}`)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Generate Swiss Round
          </button>
          <button
            onClick={handleCreateMatch}
            className="px-4 py-2 bg-parque-purple text-white rounded-lg hover:bg-opacity-90"
          >
            + Create Match
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-4">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Players
            </label>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              placeholder="Search by player name..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-parque-purple focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Round
            </label>
            <select
              value={filters.round}
              onChange={(e) => setFilters({ ...filters, round: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-parque-purple focus:border-transparent"
            >
              <option value="all">All Rounds</option>
              {rounds.map(round => (
                <option key={round} value={round}>Round {round}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-parque-purple focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="scheduled">Scheduled</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="postponed">Postponed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Matches List */}
      <div className="space-y-4">
        {filteredMatches.map((match) => (
          <div key={match._id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center mb-3">
                  <span className="text-sm font-medium text-gray-500 mr-4">Round {match.round}</span>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeClass(match.status)}`}>
                    {match.status.toUpperCase()}
                  </span>
                </div>
                
                <div className="flex items-center mb-3">
                  <div className="flex-1">
                    <div className="text-lg font-semibold text-gray-900">
                      {match.players?.player1?.name || 'Player 1'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {match.players?.player1?.level} • ELO: {match.players?.player1?.stats?.eloRating || 1200}
                    </div>
                  </div>
                  
                  <div className="mx-6 text-gray-400 text-lg font-medium">VS</div>
                  
                  <div className="flex-1 text-right">
                    <div className="text-lg font-semibold text-gray-900">
                      {match.players?.player2?.name || 'Player 2'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {match.players?.player2?.level} • ELO: {match.players?.player2?.stats?.eloRating || 1200}
                    </div>
                  </div>
                </div>
                
                {match.result && match.status === 'completed' && (
                  <div className="bg-gray-50 rounded-lg p-3 mb-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Result:</span>
                      <span className="font-medium">
                        {match.result.score?.sets?.map(set => `${set.player1}-${set.player2}`).join(', ') || 'No score'}
                      </span>
                    </div>
                    {match.result.winner && (
                      <div className="mt-1 text-sm text-green-600 font-medium">
                        Winner: {match.result.winner === match.players.player1._id ? match.players.player1.name : match.players.player2.name}
                      </div>
                    )}
                  </div>
                )}
                
                <div className="flex items-center text-sm text-gray-500 space-x-4">
                  <span className="flex items-center">
                    <span className="mr-1">📅</span> {formatDate(match.schedule?.confirmedDate)}
                  </span>
                  {match.schedule?.court && (
                    <span className="flex items-center">
                      <span className="mr-1">🎾</span> {match.schedule.court}
                    </span>
                  )}
                </div>
              </div>
              
              <div className="ml-6">
                <button
                  onClick={() => handleEditMatch(match._id)}
                  className="px-4 py-2 text-sm bg-parque-purple text-white rounded-lg hover:bg-opacity-90"
                >
                  {match.status === 'scheduled' ? 'Enter Result' : 'View Details'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredMatches.length === 0 && (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-600 mb-4">No matches found matching your criteria.</p>
          <button
            onClick={handleCreateMatch}
            className="px-4 py-2 bg-parque-purple text-white rounded-lg hover:bg-opacity-90"
          >
            Create First Match
          </button>
        </div>
      )}
    </div>
  )
}
