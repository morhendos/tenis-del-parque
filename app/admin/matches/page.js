'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

function AdminMatchesContent() {
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedLeague, setSelectedLeague] = useState(null)
  const [filters, setFilters] = useState({
    round: 'all',
    status: 'all',
    search: ''
  })
  const [showImportModal, setShowImportModal] = useState(false)
  
  const router = useRouter()
  const searchParams = useSearchParams()
  const leagueId = searchParams.get('league')

  const fetchMatches = useCallback(async () => {
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
  }, [leagueId, selectedLeague?.id])

  useEffect(() => {
    const storedLeague = sessionStorage.getItem('selectedLeague')
    if (storedLeague) {
      setSelectedLeague(JSON.parse(storedLeague))
    } else if (!leagueId) {
      router.push('/admin/leagues')
      return
    }

    fetchMatches()
  }, [leagueId, router, fetchMatches])

  const handleCreateMatch = (round = null) => {
    const params = new URLSearchParams({
      league: leagueId || selectedLeague?.id
    })
    if (round !== null) {
      params.append('round', round)
    }
    router.push(`/admin/matches/create?${params}`)
  }

  const handleEditMatch = (matchId) => {
    router.push(`/admin/matches/${matchId}`)
  }

  const handleExport = async () => {
    try {
      const params = new URLSearchParams({
        league: leagueId || selectedLeague?.id || '',
        status: filters.status !== 'all' ? filters.status : ''
      })
      
      const res = await fetch(`/api/admin/matches/export?${params}`)
      if (!res.ok) throw new Error('Failed to export matches')
      
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `matches-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Export error:', error)
      setError('Failed to export matches')
    }
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
  
  // Group matches by round for display
  const matchesByRound = filteredMatches.reduce((acc, match) => {
    const round = match.round || 0
    if (!acc[round]) acc[round] = []
    acc[round].push(match)
    return acc
  }, {})

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
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Matches</h2>
          <p className="text-gray-600 mt-1">
            {selectedLeague ? `Manage matches and results for ${selectedLeague.name}` : 'Manage matches and results'}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
            </svg>
            Export
          </button>
          <button
            onClick={() => setShowImportModal(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            Import
          </button>
          <button
            onClick={() => router.push(`/admin/matches/generate-round?league=${leagueId || selectedLeague?.id}`)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
            Swiss Pairing
          </button>
          <button
            onClick={() => handleCreateMatch()}
            className="px-4 py-2 bg-parque-purple text-white rounded-lg hover:bg-opacity-90 flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Create Match
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-4">
          {error}
        </div>
      )}

      {/* Quick Actions Info */}
      {matches.length === 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start">
            <svg className="w-6 h-6 text-blue-600 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="text-lg font-semibold text-blue-900 mb-2">Getting Started</h3>
              <p className="text-blue-800 mb-3">You can create matches in multiple ways:</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg p-4 border border-blue-200">
                  <h4 className="font-semibold text-blue-900 mb-1">📥 Import Matches</h4>
                  <p className="text-sm text-blue-700">
                    Import multiple matches from a CSV file. Perfect for migrating data or bulk creation.
                  </p>
                </div>
                <div className="bg-white rounded-lg p-4 border border-blue-200">
                  <h4 className="font-semibold text-blue-900 mb-1">🎯 Swiss Pairing</h4>
                  <p className="text-sm text-blue-700">
                    Automatically generate a full round of matches using the Swiss tournament system.
                  </p>
                </div>
                <div className="bg-white rounded-lg p-4 border border-blue-200">
                  <h4 className="font-semibold text-blue-900 mb-1">✋ Manual Creation</h4>
                  <p className="text-sm text-blue-700">
                    Create individual matches by selecting players manually.
                  </p>
                </div>
              </div>
            </div>
          </div>
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

      {/* Matches List - Grouped by Round if showing all rounds */}
      {filters.round === 'all' && Object.keys(matchesByRound).length > 0 ? (
        <div className="space-y-6">
          {Object.entries(matchesByRound)
            .sort(([a], [b]) => parseInt(b) - parseInt(a)) // Sort rounds in descending order
            .map(([round, roundMatches]) => (
              <div key={round} className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Round {round} ({roundMatches.length} matches)
                  </h3>
                  <button
                    onClick={() => handleCreateMatch(round)}
                    className="px-3 py-1 text-sm bg-parque-purple text-white rounded-lg hover:bg-opacity-90 flex items-center"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                    Add Matches to Round {round}
                  </button>
                </div>
                {roundMatches.map((match) => (
                  <MatchCard key={match._id} match={match} onEdit={handleEditMatch} />
                ))}
              </div>
            ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filters.round !== 'all' && filteredMatches.length > 0 && (
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Round {filters.round} ({filteredMatches.length} matches)
              </h3>
              <button
                onClick={() => handleCreateMatch(filters.round)}
                className="px-3 py-1 text-sm bg-parque-purple text-white rounded-lg hover:bg-opacity-90 flex items-center"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                Add More Matches
              </button>
            </div>
          )}
          {filteredMatches.map((match) => (
            <MatchCard key={match._id} match={match} onEdit={handleEditMatch} />
          ))}
        </div>
      )}

      {filteredMatches.length === 0 && (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-600 mb-4">No matches found matching your criteria.</p>
          <div className="flex justify-center space-x-3">
            <button
              onClick={() => setShowImportModal(true)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Import Matches
            </button>
            <button
              onClick={() => router.push(`/admin/matches/generate-round?league=${leagueId || selectedLeague?.id}`)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Generate Swiss Round
            </button>
            <button
              onClick={() => handleCreateMatch()}
              className="px-4 py-2 bg-parque-purple text-white rounded-lg hover:bg-opacity-90"
            >
              Create Match Manually
            </button>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {showImportModal && (
        <ImportMatchesModal
          onClose={() => setShowImportModal(false)}
          onSuccess={() => {
            setShowImportModal(false)
            fetchMatches()
          }}
          leagueId={leagueId || selectedLeague?.id}
        />
      )}
    </div>
  )
}

// Match Card Component
function MatchCard({ match, onEdit }) {
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

  return (
    <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
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
              {match.result.winner && match.players?.player1 && match.players?.player2 && (
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
            onClick={() => onEdit(match._id)}
            className="px-4 py-2 text-sm bg-parque-purple text-white rounded-lg hover:bg-opacity-90"
          >
            {match.status === 'scheduled' ? 'Enter Result' : 'View Details'}
          </button>
        </div>
      </div>
    </div>
  )
}

// Import Matches Modal Component
function ImportMatchesModal({ onClose, onSuccess, leagueId }) {
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [results, setResults] = useState(null)

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile && selectedFile.type !== 'text/csv') {
      setError('Please select a CSV file')
      return
    }
    setFile(selectedFile)
    setError('')
  }

  const handleImport = async () => {
    if (!file) {
      setError('Please select a file')
      return
    }

    try {
      setLoading(true)
      setError('')
      
      const formData = new FormData()
      formData.append('file', file)
      if (leagueId) {
        formData.append('leagueId', leagueId)
      }

      const res = await fetch('/api/admin/matches/import', {
        method: 'POST',
        body: formData
      })

      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to import matches')
      }

      setResults(data)
      
      if (data.errors.length === 0) {
        setTimeout(() => {
          onSuccess()
        }, 2000)
      }
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">Import Matches</h3>
        
        {error && (
          <div className="mb-4 bg-red-50 text-red-600 p-3 rounded-lg">
            {error}
          </div>
        )}

        {results ? (
          <div>
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 font-medium">Import completed!</p>
              <p className="text-green-600 text-sm mt-1">
                Created: {results.created}, Updated: {results.updated}
              </p>
            </div>

            {results.errors.length > 0 && (
              <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-yellow-800 font-medium mb-2">Some errors occurred:</p>
                <ul className="text-sm text-yellow-700 space-y-1">
                  {results.errors.slice(0, 5).map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                  {results.errors.length > 5 && (
                    <li>... and {results.errors.length - 5} more errors</li>
                  )}
                </ul>
              </div>
            )}

            <div className="flex justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-parque-purple text-white rounded-lg hover:bg-opacity-90"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                CSV File Format:
              </label>
              <div className="text-xs text-gray-600 bg-gray-50 p-3 rounded">
                <p className="font-medium mb-1">Required columns:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Round</li>
                  <li>Player 1 Email</li>
                  <li>Player 2 Email</li>
                </ul>
                <p className="font-medium mt-2 mb-1">Optional columns:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>League, Season, Status</li>
                  <li>Date Played, Winner, Score</li>
                  <li>Court, Notes</li>
                  <li>ELO changes and ratings</li>
                </ul>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select CSV File
              </label>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-parque-purple focus:border-transparent"
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleImport}
                disabled={loading || !file}
                className="px-4 py-2 bg-parque-purple text-white rounded-lg hover:bg-opacity-90 disabled:opacity-50"
              >
                {loading ? 'Importing...' : 'Import'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-xl text-gray-600">Loading matches...</div>
    </div>
  )
}

export default function AdminMatchesPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <AdminMatchesContent />
    </Suspense>
  )
}
