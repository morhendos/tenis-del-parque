'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

function AdminPlayersContent() {
  const [players, setPlayers] = useState([])
  const [filteredPlayers, setFilteredPlayers] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleteModal, setDeleteModal] = useState({ show: false, player: null })
  const [importModal, setImportModal] = useState({ show: false, file: null, importing: false })
  const [importResult, setImportResult] = useState(null)
  const [filters, setFilters] = useState({
    search: '',
    level: '',
    status: '',
    league: ''
  })
  const [leagues, setLeagues] = useState([])
  
  const searchParams = useSearchParams()
  const leagueParam = searchParams.get('league')

  useEffect(() => {
    fetchLeagues()
    fetchPlayers()
  }, [])

  useEffect(() => {
    // Apply filters
    let filtered = [...players]
    
    if (filters.search) {
      const search = filters.search.toLowerCase()
      filtered = filtered.filter(player => 
        player.name.toLowerCase().includes(search) ||
        player.email.toLowerCase().includes(search) ||
        player.whatsapp.includes(search)
      )
    }
    
    if (filters.level) {
      filtered = filtered.filter(player => player.level === filters.level)
    }
    
    if (filters.status) {
      filtered = filtered.filter(player => player.status === filters.status)
    }
    
    if (filters.league || leagueParam) {
      const leagueId = filters.league || leagueParam
      filtered = filtered.filter(player => player.league?._id === leagueId)
    }
    
    setFilteredPlayers(filtered)
  }, [filters, players, leagueParam])

  const fetchLeagues = async () => {
    try {
      const res = await fetch('/api/admin/leagues')
      if (res.ok) {
        const data = await res.json()
        setLeagues(data.leagues || [])
      }
    } catch (error) {
      console.error('Error fetching leagues:', error)
    }
  }

  const fetchPlayers = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/players', { cache: 'no-store' })
      if (!res.ok) throw new Error('Failed to fetch players')
      
      const data = await res.json()
      setPlayers(data.players || [])
      setFilteredPlayers(data.players || [])
    } catch (error) {
      console.error('Error fetching players:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (playerId, newStatus) => {
    try {
      const res = await fetch(`/api/admin/players/${playerId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })
      
      if (res.ok) {
        // Update local state
        setPlayers(players.map(p => 
          p._id === playerId ? { ...p, status: newStatus } : p
        ))
      }
    } catch (error) {
      console.error('Error updating player:', error)
    }
  }

  const handleDelete = async () => {
    if (!deleteModal.player) return
    
    try {
      const res = await fetch(`/api/admin/players/${deleteModal.player._id}`, {
        method: 'DELETE'
      })
      
      if (res.ok) {
        // Remove from local state
        setPlayers(players.filter(p => p._id !== deleteModal.player._id))
        setDeleteModal({ show: false, player: null })
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to delete player')
      }
    } catch (error) {
      console.error('Error deleting player:', error)
      alert('Error deleting player')
    }
  }

  const exportCSV = () => {
    window.location.href = '/api/admin/players/export'
  }

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (file && file.type === 'text/csv') {
      setImportModal({ ...importModal, file })
    } else {
      alert('Please select a CSV file')
    }
  }

  const handleImport = async () => {
    if (!importModal.file) return

    setImportModal({ ...importModal, importing: true })
    setImportResult(null)

    const formData = new FormData()
    formData.append('file', importModal.file)
    
    // If a specific league is selected, include it
    if (filters.league || leagueParam) {
      formData.append('leagueId', filters.league || leagueParam)
    }

    try {
      const res = await fetch('/api/admin/players/import', {
        method: 'POST',
        body: formData
      })

      const data = await res.json()

      if (res.ok) {
        setImportResult({
          success: true,
          message: data.message,
          created: data.created,
          updated: data.updated,
          errors: data.errors
        })
        // Refresh players list
        fetchPlayers()
      } else {
        setImportResult({
          success: false,
          message: data.error || 'Import failed',
          errors: data.errors
        })
      }
    } catch (error) {
      console.error('Error importing players:', error)
      setImportResult({
        success: false,
        message: 'Error importing players',
        errors: []
      })
    } finally {
      setImportModal({ ...importModal, importing: false })
    }
  }

  const closeImportModal = () => {
    setImportModal({ show: false, file: null, importing: false })
    setImportResult(null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-xl text-gray-600">Loading players...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Players</h2>
          <p className="text-gray-600 mt-1">Manage all registered players across leagues</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setImportModal({ ...importModal, show: true })}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Import CSV
          </button>
          <button
            onClick={exportCSV}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Export CSV
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search
            </label>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              placeholder="Name, email, or phone..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-parque-purple focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Level
            </label>
            <select
              value={filters.level}
              onChange={(e) => setFilters({ ...filters, level: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-parque-purple focus:border-transparent"
            >
              <option value="">All Levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
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
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              League
            </label>
            <select
              value={filters.league || leagueParam || ''}
              onChange={(e) => setFilters({ ...filters, league: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-parque-purple focus:border-transparent"
            >
              <option value="">All Leagues</option>
              {leagues.map(league => (
                <option key={league._id} value={league._id}>
                  {league.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="mt-4 text-sm text-gray-600">
          Showing {filteredPlayers.length} of {players.length} players
        </div>
      </div>

      {/* Players Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Player
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Level
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  League
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stats
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPlayers.map((player) => (
                <tr key={player._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {player.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        Registered: {new Date(player.registeredAt).toLocaleDateString()}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{player.email}</div>
                    <div className="text-sm text-gray-500">{player.whatsapp}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      player.level === 'beginner' ? 'bg-green-100 text-green-800' :
                      player.level === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-purple-100 text-purple-800'
                    }`}>
                      {player.level}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {player.league?.name || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div>ELO: {player.stats?.eloRating || 1200}</div>
                    <div>W/L: {player.stats?.matchesWon || 0}/{player.stats?.matchesPlayed - player.stats?.matchesWon || 0}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={player.status}
                      onChange={(e) => handleStatusUpdate(player._id, e.target.value)}
                      className={`text-xs font-semibold px-2 py-1 rounded border ${
                        player.status === 'active' ? 'bg-green-50 text-green-800 border-green-200' :
                        player.status === 'confirmed' ? 'bg-blue-50 text-blue-800 border-blue-200' :
                        player.status === 'pending' ? 'bg-yellow-50 text-yellow-800 border-yellow-200' :
                        'bg-gray-50 text-gray-800 border-gray-200'
                      }`}
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => setDeleteModal({ show: true, player })}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredPlayers.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No players found matching your criteria
          </div>
        )}
      </div>

      {/* Delete Modal */}
      {deleteModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold mb-2">Delete Player</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete <strong>{deleteModal.player?.name}</strong>? 
              This will also delete all their match history and cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setDeleteModal({ show: false, player: null })}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete Player
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {importModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Import Players from CSV</h3>
            
            {!importResult ? (
              <>
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-4">
                    Upload a CSV file with player data. The CSV should have the following columns:
                  </p>
                  <ul className="text-sm text-gray-600 list-disc list-inside mb-4">
                    <li>name (required)</li>
                    <li>email (required)</li>
                    <li>whatsapp (required)</li>
                    <li>level (beginner/intermediate/advanced)</li>
                    <li>status (pending/confirmed/active/inactive)</li>
                  </ul>
                  {(filters.league || leagueParam) && (
                    <p className="text-sm text-blue-600 font-medium">
                      Players will be imported to: {leagues.find(l => l._id === (filters.league || leagueParam))?.name}
                    </p>
                  )}
                </div>

                <div className="mb-4">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileSelect}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  {importModal.file && (
                    <p className="mt-2 text-sm text-gray-600">
                      Selected: {importModal.file.name}
                    </p>
                  )}
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    onClick={closeImportModal}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    disabled={importModal.importing}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleImport}
                    disabled={!importModal.file || importModal.importing}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {importModal.importing ? 'Importing...' : 'Import'}
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className={`mb-4 p-4 rounded-lg ${importResult.success ? 'bg-green-50' : 'bg-red-50'}`}>
                  <p className={`text-sm font-medium ${importResult.success ? 'text-green-800' : 'text-red-800'}`}>
                    {importResult.message}
                  </p>
                  {importResult.success && (
                    <div className="mt-2 text-sm text-green-700">
                      <p>Created: {importResult.created || 0} players</p>
                      <p>Updated: {importResult.updated || 0} players</p>
                    </div>
                  )}
                </div>

                {importResult.errors && importResult.errors.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Errors:</p>
                    <div className="max-h-40 overflow-y-auto bg-gray-50 p-2 rounded text-sm">
                      {importResult.errors.map((error, index) => (
                        <p key={index} className="text-red-600">{error}</p>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-end">
                  <button
                    onClick={closeImportModal}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                  >
                    Close
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-xl text-gray-600">Loading players...</div>
    </div>
  )
}

export default function AdminPlayersPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <AdminPlayersContent />
    </Suspense>
  )
}
