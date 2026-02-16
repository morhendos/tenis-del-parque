'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

// ============================================================
// DEADLINE HELPERS
// ============================================================
function getDeadlineStatus(match) {
  if (match.status === 'completed') return { label: 'Completed', color: 'green', urgency: 0 }
  if (match.status === 'cancelled') return { label: 'Cancelled', color: 'red', urgency: 3 }
  if (match.isBye) return { label: 'BYE', color: 'gray', urgency: 0 }

  const deadline = match.schedule?.deadline
  if (!deadline) return { label: 'No deadline', color: 'gray', urgency: 1 }

  const now = new Date()
  const dl = new Date(deadline)
  const diffMs = dl - now
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))

  if (diffMs < 0) {
    const overdueDays = Math.abs(diffDays)
    return { label: `Overdue ${overdueDays}d`, color: 'red', urgency: 4, overdueDays, diffDays }
  }
  if (diffDays <= 2) return { label: `${diffDays}d left`, color: 'orange', urgency: 2, diffDays }
  if (diffDays <= 5) return { label: `${diffDays}d left`, color: 'yellow', urgency: 1, diffDays }
  return { label: `${diffDays}d left`, color: 'green', urgency: 0, diffDays }
}

function DeadlineBadge({ match }) {
  const status = getDeadlineStatus(match)
  const colorClasses = {
    green: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    yellow: 'bg-amber-50 text-amber-700 border-amber-200',
    orange: 'bg-orange-50 text-orange-700 border-orange-200',
    red: 'bg-red-50 text-red-700 border-red-200',
    gray: 'bg-gray-50 text-gray-500 border-gray-200'
  }
  const dotColors = {
    green: 'bg-emerald-400',
    yellow: 'bg-amber-400',
    orange: 'bg-orange-400 animate-pulse',
    red: 'bg-red-500 animate-pulse',
    gray: 'bg-gray-400'
  }

  if (match.status === 'completed' || match.isBye) return null

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border ${colorClasses[status.color]}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotColors[status.color]}`} />
      {match.schedule?.deadline && (
        <span className="opacity-70">
          {new Date(match.schedule.deadline).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
        </span>
      )}
      {status.label}
    </span>
  )
}

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
  const [selectedMatches, setSelectedMatches] = useState([])
  const [showBulkActions, setShowBulkActions] = useState(false)
  const [showPlayerReplacementModal, setShowPlayerReplacementModal] = useState(false)
  const [deadlineMatch, setDeadlineMatch] = useState(null) // match to manage deadline for
  
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

  const handleSelectMatch = (matchId, checked) => {
    if (checked) {
      setSelectedMatches(prev => [...prev, matchId])
    } else {
      setSelectedMatches(prev => prev.filter(id => id !== matchId))
    }
  }

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedMatches(filteredMatches.map(m => m._id))
    } else {
      setSelectedMatches([])
    }
  }

  const handleBulkDelete = async () => {
    if (!selectedMatches.length) return
    
    if (!confirm(`Are you sure you want to delete ${selectedMatches.length} matches? This action cannot be undone.`)) {
      return
    }

    try {
      setLoading(true)
      const response = await fetch('/api/admin/matches/bulk-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matchIds: selectedMatches })
      })

      if (!response.ok) throw new Error('Failed to delete matches')

      await fetchMatches()
      setSelectedMatches([])
      setShowBulkActions(false)
    } catch (error) {
      console.error('Bulk delete error:', error)
      setError('Failed to delete selected matches')
    } finally {
      setLoading(false)
    }
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
    // Enhanced status filter with deadline-aware options
    if (filters.status !== 'all') {
      if (filters.status === 'overdue') {
        // Show scheduled matches past deadline OR cancelled matches
        const dlStatus = getDeadlineStatus(match)
        if (!(match.status === 'cancelled' || (match.status === 'scheduled' && dlStatus.urgency >= 4))) return false
      } else if (filters.status === 'approaching') {
        // Show scheduled matches with deadline within 5 days
        const dlStatus = getDeadlineStatus(match)
        if (!(match.status === 'scheduled' && dlStatus.diffDays !== undefined && dlStatus.diffDays <= 5 && dlStatus.diffDays >= 0)) return false
      } else if (match.status !== filters.status) {
        return false
      }
    }
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
          <button
            onClick={() => router.push(`/admin/matches/round-management?league=${leagueId || selectedLeague?.id}`)}
            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Round Management
          </button>
        </div>
      </div>

      {/* Match Statistics Summary */}
      {matches.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">League Progress</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-gray-900">
                {matches.length}
              </div>
              <div className="text-sm text-gray-600">Total Matches</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-600">
                {matches.filter(m => m.status === 'completed').length}
              </div>
              <div className="text-sm text-gray-600">Completed</div>
            </div>
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-600">
                {matches.filter(m => m.status === 'scheduled').length}
              </div>
              <div className="text-sm text-gray-600">Scheduled</div>
            </div>
            <div className="bg-red-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-red-600">
                {matches.filter(m => m.status === 'cancelled').length}
              </div>
              <div className="text-sm text-gray-600">Cancelled</div>
            </div>
          </div>

          {/* Deadline health row */}
          {(() => {
            const scheduledMatches = matches.filter(m => m.status === 'scheduled')
            const overdueCount = scheduledMatches.filter(m => getDeadlineStatus(m).urgency >= 4).length
            const approachingCount = scheduledMatches.filter(m => {
              const s = getDeadlineStatus(m)
              return s.diffDays !== undefined && s.diffDays <= 5 && s.diffDays >= 0
            }).length
            const cancelledCount = matches.filter(m => m.status === 'cancelled').length
            const needsAttention = overdueCount + cancelledCount

            if (needsAttention > 0 || approachingCount > 0) {
              return (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                    <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    Deadline Health
                  </h4>
                  <div className="flex flex-wrap gap-3">
                    {overdueCount > 0 && (
                      <button
                        onClick={() => setFilters(f => ({ ...f, status: 'overdue' }))}
                        className="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors cursor-pointer"
                      >
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                        <span className="text-sm font-medium text-red-700">{overdueCount} overdue</span>
                      </button>
                    )}
                    {cancelledCount > 0 && (
                      <button
                        onClick={() => setFilters(f => ({ ...f, status: 'cancelled' }))}
                        className="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors cursor-pointer"
                      >
                        <span className="w-2 h-2 rounded-full bg-red-400" />
                        <span className="text-sm font-medium text-red-600">{cancelledCount} cancelled</span>
                      </button>
                    )}
                    {approachingCount > 0 && (
                      <button
                        onClick={() => setFilters(f => ({ ...f, status: 'approaching' }))}
                        className="flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors cursor-pointer"
                      >
                        <span className="w-2 h-2 rounded-full bg-amber-400" />
                        <span className="text-sm font-medium text-amber-700">{approachingCount} approaching deadline</span>
                      </button>
                    )}
                  </div>
                </div>
              )
            }
            return null
          })()}

          <div className="mt-4 bg-gray-100 rounded-full h-3">
            <div 
              className="bg-green-500 h-3 rounded-full transition-all duration-300"
              style={{ 
                width: `${matches.length > 0 ? (matches.filter(m => m.status === 'completed').length / matches.length) * 100 : 0}%` 
              }}
            ></div>
          </div>
          <div className="mt-2 text-center text-sm text-gray-600">
            {matches.length > 0 && (
              <>
                {matches.filter(m => m.status === 'completed').length} completed out of {matches.length} matches 
                ({Math.round((matches.filter(m => m.status === 'completed').length / matches.length) * 100)}% complete)
              </>
            )}
          </div>
          
          {/* Round-by-round breakdown */}
          {rounds.length > 1 && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Progress by Round</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
                {rounds.map(round => {
                  const roundMatches = matches.filter(m => m.round === round)
                  const completedInRound = roundMatches.filter(m => m.status === 'completed').length
                  const totalInRound = roundMatches.length
                  const percentage = totalInRound > 0 ? (completedInRound / totalInRound) * 100 : 0
                  
                  return (
                    <div key={round} className="text-center">
                      <div className="text-xs font-medium text-gray-600 mb-1">Round {round}</div>
                      <div className="bg-gray-200 rounded-full h-2 mb-1">
                        <div 
                          className="bg-green-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-500">
                        {completedInRound}/{totalInRound}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}

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

      {/* Bulk Actions Toolbar */}
      {selectedMatches.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-blue-800 font-medium">
                {selectedMatches.length} matches selected
              </span>
              <button
                onClick={() => setSelectedMatches([])}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                Clear selection
              </button>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowPlayerReplacementModal(true)}
                className="px-3 py-1 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 text-sm"
              >
                Replace Player
              </button>
              <button
                onClick={handleBulkDelete}
                className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
              >
                Delete Selected
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Filters & Selection</h3>
          {filteredMatches.length > 0 && (
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="select-all"
                checked={selectedMatches.length === filteredMatches.length && filteredMatches.length > 0}
                onChange={(e) => handleSelectAll(e.target.checked)}
                className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />
              <label htmlFor="select-all" className="text-sm text-gray-700">
                Select all {filteredMatches.length} matches
              </label>
            </div>
          )}
        </div>
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
              <option value="overdue">⚠ Overdue (needs attention)</option>
              <option value="approaching">⏰ Deadline approaching (≤5d)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Matches List - Grouped by Round only if showing all rounds AND no status filter */}
      {filters.round === 'all' && filters.status === 'all' && Object.keys(matchesByRound).length > 0 ? (
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
                  <MatchCard 
                    key={match._id} 
                    match={match} 
                    onEdit={handleEditMatch}
                    onSelect={handleSelectMatch}
                    isSelected={selectedMatches.includes(match._id)}
                    onDeadlineAction={setDeadlineMatch}
                  />
                ))}
              </div>
            ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredMatches.length > 0 && (
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {filters.round !== 'all' 
                  ? `Round ${filters.round} (${filteredMatches.length} matches)`
                  : filters.status !== 'all'
                    ? `${filters.status.charAt(0).toUpperCase() + filters.status.slice(1)} Matches (${filteredMatches.length} total)`
                    : `All Matches (${filteredMatches.length} total)`
                }
              </h3>
              {filters.round !== 'all' && (
                <button
                  onClick={() => handleCreateMatch(filters.round)}
                  className="px-3 py-1 text-sm bg-parque-purple text-white rounded-lg hover:bg-opacity-90 flex items-center"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                  Add More Matches
                </button>
              )}
            </div>
          )}
          {filteredMatches
            .sort((a, b) => (b.round || 0) - (a.round || 0)) // Sort by round descending
            .map((match) => (
              <MatchCard 
                key={match._id} 
                match={match} 
                onEdit={handleEditMatch}
                onSelect={handleSelectMatch}
                isSelected={selectedMatches.includes(match._id)}
                onDeadlineAction={setDeadlineMatch}
              />
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

      {/* Player Replacement Modal */}
      {showPlayerReplacementModal && (
        <PlayerReplacementModal
          selectedMatches={selectedMatches}
          leagueId={leagueId || selectedLeague?.id}
          onClose={() => setShowPlayerReplacementModal(false)}
          onSuccess={() => {
            setShowPlayerReplacementModal(false)
            fetchMatches()
            setSelectedMatches([])
          }}
        />
      )}

      {/* Deadline Management Modal */}
      {deadlineMatch && (
        <DeadlineModal
          match={deadlineMatch}
          onClose={() => setDeadlineMatch(null)}
          onSuccess={() => {
            setDeadlineMatch(null)
            fetchMatches()
          }}
        />
      )}
    </div>
  )
}

// Match Card Component
function MatchCard({ match, onEdit, onSelect, isSelected, onDeadlineAction }) {
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

  const dlStatus = getDeadlineStatus(match)
  const showDeadlineActions = match.status === 'cancelled' || 
    (match.status === 'scheduled' && dlStatus.urgency >= 2)
  const extensionCount = match.schedule?.extensionHistory?.length || 0

  // Card border highlight based on urgency
  const urgencyBorder = match.status === 'cancelled' 
    ? 'border-l-4 border-l-red-400' 
    : dlStatus.urgency >= 4 
      ? 'border-l-4 border-l-red-400' 
      : dlStatus.urgency >= 2 
        ? 'border-l-4 border-l-orange-400' 
        : ''

  return (
    <div className={`bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow ${urgencyBorder} ${isSelected ? 'ring-2 ring-blue-500' : ''}`}>
      <div className="flex justify-between items-start">
        <div className="flex items-start space-x-3">
          <input
            type="checkbox"
            checked={isSelected || false}
            onChange={(e) => onSelect && onSelect(match._id, e.target.checked)}
            className="mt-1 h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
          />
          <div className="flex-1">
          <div className="flex items-center flex-wrap gap-2 mb-3">
            <span className="text-sm font-medium text-gray-500">Round {match.round}</span>
            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeClass(match.status)}`}>
              {match.status.toUpperCase()}
            </span>
            <DeadlineBadge match={match} />
            {extensionCount > 0 && match.status !== 'completed' && (
              <span className="text-xs text-gray-400" title={`${extensionCount} extension(s) used`}>
                +{extensionCount} ext
              </span>
            )}
          </div>
          
          <div className="flex items-center mb-3">
            <div className="flex-1">
              <div className="text-lg font-semibold text-gray-900">
                {match.players?.player1?.name || 'Player 1'}
              </div>
              <div className="text-sm text-gray-500">
                {match.players?.player1?.level} &bull; ELO: {match.players?.player1?.stats?.eloRating || 1200}
              </div>
            </div>
            
            <div className="mx-6 text-gray-400 text-lg font-medium">VS</div>
            
            <div className="flex-1 text-right">
              <div className="text-lg font-semibold text-gray-900">
                {match.players?.player2?.name || 'Player 2'}
              </div>
              <div className="text-sm text-gray-500">
                {match.players?.player2?.level} &bull; ELO: {match.players?.player2?.stats?.eloRating || 1200}
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
              <svg className="w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              {formatDate(match.schedule?.confirmedDate)}
            </span>
            {match.schedule?.court && (
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                {match.schedule.court}
              </span>
            )}
            {match.notes && (
              <span className="flex items-center text-xs text-gray-400 italic max-w-[200px] truncate" title={match.notes}>
                {match.notes}
              </span>
            )}
          </div>
          </div>
        </div>
        
        <div className="ml-4 flex flex-col gap-2 shrink-0">
          <button
            onClick={() => onEdit(match._id)}
            className="px-4 py-2 text-sm bg-parque-purple text-white rounded-lg hover:bg-opacity-90 flex items-center"
          >
            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            {match.status === 'scheduled' ? 'Manage' : 'Details'}
          </button>

          {/* Deadline action button */}
          {match.status === 'cancelled' && (
            <button
              onClick={() => onDeadlineAction && onDeadlineAction(match)}
              className="px-4 py-2 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center gap-1.5"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
              Restore
            </button>
          )}
          {match.status === 'scheduled' && showDeadlineActions && (
            <button
              onClick={() => onDeadlineAction && onDeadlineAction(match)}
              className="px-4 py-2 text-sm bg-amber-500 text-white rounded-lg hover:bg-amber-600 flex items-center gap-1.5"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              Extend
            </button>
          )}
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

// Player Replacement Modal Component
function PlayerReplacementModal({ selectedMatches, leagueId, onClose, onSuccess }) {
  const [players, setPlayers] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [oldPlayerId, setOldPlayerId] = useState('')
  const [newPlayerId, setNewPlayerId] = useState('')

  useEffect(() => {
    fetchPlayers()
  }, [leagueId])

  const fetchPlayers = async () => {
    try {
      const response = await fetch(`/api/admin/players?league=${leagueId}`)
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
    
    if (!oldPlayerId || !newPlayerId) {
      setError('Please select both players')
      return
    }

    if (oldPlayerId === newPlayerId) {
      setError('Old and new player must be different')
      return
    }

    try {
      setLoading(true)
      
      const response = await fetch('/api/admin/matches/replace-player', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          matchIds: selectedMatches,
          oldPlayerId,
          newPlayerId
        })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to replace player')
      }

      const result = await response.json()
      onSuccess()
      
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const oldPlayer = players.find(p => p._id === oldPlayerId)
  const newPlayer = players.find(p => p._id === newPlayerId)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg">
        <h3 className="text-lg font-semibold mb-4">Replace Player in Selected Matches</h3>
        
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-blue-800 text-sm">
            This will replace a player across {selectedMatches.length} selected matches. 
            This action cannot be undone.
          </p>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 text-red-600 p-3 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Player to Replace
            </label>
            <select
              value={oldPlayerId}
              onChange={(e) => setOldPlayerId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-parque-purple focus:border-transparent"
              disabled={loading}
            >
              <option value="">Select player to replace</option>
              {players.map(player => (
                <option key={player._id} value={player._id}>
                  {player.name} ({player.level}) - ELO: {player.stats?.eloRating || 1200}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Replace With
            </label>
            <select
              value={newPlayerId}
              onChange={(e) => setNewPlayerId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-parque-purple focus:border-transparent"
              disabled={loading}
            >
              <option value="">Select replacement player</option>
              {players.map(player => (
                <option 
                  key={player._id} 
                  value={player._id}
                  disabled={player._id === oldPlayerId}
                >
                  {player.name} ({player.level}) - ELO: {player.stats?.eloRating || 1200}
                </option>
              ))}
            </select>
          </div>

          {oldPlayer && newPlayer && (
            <div className="bg-gray-50 rounded-lg p-3">
              <h4 className="font-medium text-gray-900 mb-2">Summary</h4>
              <p className="text-sm text-gray-600">
                Replace <strong>{oldPlayer.name}</strong> with <strong>{newPlayer.name}</strong> in {selectedMatches.length} matches
              </p>
            </div>
          )}

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !oldPlayerId || !newPlayerId}
              className="px-4 py-2 bg-parque-purple text-white rounded-lg hover:bg-opacity-90 disabled:opacity-50"
            >
              {loading ? 'Replacing...' : 'Replace Player'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ============================================================
// DEADLINE MANAGEMENT MODAL
// ============================================================
function DeadlineModal({ match, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [customDate, setCustomDate] = useState('')
  const [success, setSuccess] = useState('')

  const isCancelled = match.status === 'cancelled'
  const currentDeadline = match.schedule?.deadline
  const extensionCount = match.schedule?.extensionHistory?.length || 0

  const handleAction = async (days, isCustom = false) => {
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const body = {
        action: isCancelled ? 'uncancel' : 'extend',
        ...(isCustom ? { customDeadline: customDate } : { days })
      }

      const res = await fetch(`/api/admin/matches/${match._id}/deadline`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to update')

      setSuccess(
        isCancelled 
          ? `Match restored! New deadline: ${new Date(data.newDeadline).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`
          : `Deadline updated to ${new Date(data.newDeadline).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`
      )
      
      setTimeout(() => onSuccess(), 1200)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        {/* Header */}
        <div className={`px-6 py-4 rounded-t-xl ${isCancelled ? 'bg-red-50 border-b border-red-100' : 'bg-amber-50 border-b border-amber-100'}`}>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              {isCancelled ? 'Restore Cancelled Match' : 'Extend Deadline'}
            </h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            {match.players?.player1?.name || 'P1'} vs {match.players?.player2?.name || 'P2'} &bull; Round {match.round}
          </p>
        </div>

        <div className="px-6 py-4 space-y-4">
          {/* Current status */}
          <div className="bg-gray-50 rounded-lg p-3 space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Status:</span>
              <span className={`font-medium ${isCancelled ? 'text-red-600' : 'text-blue-600'}`}>
                {match.status.charAt(0).toUpperCase() + match.status.slice(1)}
              </span>
            </div>
            {currentDeadline && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">{isCancelled ? 'Was due:' : 'Current deadline:'}</span>
                <span className="font-medium text-gray-900">
                  {new Date(currentDeadline).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              </div>
            )}
            {extensionCount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Extensions used:</span>
                <span className="font-medium text-gray-900">{extensionCount}</span>
              </div>
            )}
            {match.notes && (
              <div className="text-xs text-gray-400 pt-1 border-t border-gray-200 mt-2">
                {match.notes}
              </div>
            )}
          </div>

          {/* Error/Success messages */}
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">{error}</div>
          )}
          {success && (
            <div className="bg-emerald-50 text-emerald-600 p-3 rounded-lg text-sm flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              {success}
            </div>
          )}

          {/* Quick extend buttons */}
          {!success && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {isCancelled ? 'Restore with new deadline:' : 'Extend deadline by:'}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[7, 14, 21].map(days => (
                    <button
                      key={days}
                      onClick={() => handleAction(days)}
                      disabled={loading}
                      className="px-4 py-3 text-sm font-medium rounded-lg border-2 border-gray-200 hover:border-parque-purple hover:bg-parque-purple/5 transition-colors disabled:opacity-50"
                    >
                      +{days} days
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Or set a specific date:
                </label>
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={customDate}
                    onChange={(e) => setCustomDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-parque-purple focus:border-transparent text-sm"
                  />
                  <button
                    onClick={() => handleAction(null, true)}
                    disabled={loading || !customDate}
                    className="px-4 py-2 text-sm bg-parque-purple text-white rounded-lg hover:bg-opacity-90 disabled:opacity-50"
                  >
                    {loading ? 'Saving...' : 'Set'}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-gray-50 rounded-b-xl flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
          >
            {success ? 'Done' : 'Cancel'}
          </button>
        </div>
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