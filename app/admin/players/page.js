'use client'

import { useState, Suspense } from 'react'
import usePlayersData from '../../../lib/hooks/usePlayersData'
import PlayerFilters from '../../../components/admin/players/PlayerFilters'
import PlayerTable from '../../../components/admin/players/PlayerTable'
import DeletePlayerModal from '../../../components/admin/players/DeletePlayerModal'
import InvitationResultModal from '../../../components/admin/players/InvitationResultModal'
import ImportCSVModal from '../../../components/admin/players/ImportCSVModal'
import EloRecalculateModal from '../../../components/admin/players/EloRecalculateModal'

function AdminPlayersContent() {
  const [deleteModal, setDeleteModal] = useState({ show: false, player: null })
  const [importModal, setImportModal] = useState({ show: false })
  const [importResult, setImportResult] = useState(null)
  const [eloRecalculateLoading, setEloRecalculateLoading] = useState({})
  const [eloRecalculateResult, setEloRecalculateResult] = useState(null)
  
  const {
    players,
    filteredPlayers,
    loading,
    leagues,
    filters,
    setFilters,
    updateLoading,
    invitationLoading,
    invitationResult,
    setInvitationResult,
    leagueParam,
    handleStatusUpdate,
    handleLevelUpdate,
    handleInvitePlayer,
    handleDeletePlayer,
    handleImportCSV,
    exportCSV
  } = usePlayersData()

  const handleDelete = async () => {
    if (!deleteModal.player) return
    await handleDeletePlayer(deleteModal.player._id)
    setDeleteModal({ show: false, player: null })
  }

  const handleImport = async (file) => {
    const result = await handleImportCSV(file)
    setImportResult(result)
    return result
  }

  const handleRecalculateElo = async (playerId) => {
    const loadingKey = `elo-${playerId}`
    
    try {
      setEloRecalculateLoading(prev => ({ ...prev, [loadingKey]: true }))
      
      const response = await fetch(`/api/admin/players/${playerId}/recalculate-elo`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to recalculate ELO')
      }
      
      // Show the results in a modal
      setEloRecalculateResult(data)
      
    } catch (error) {
      console.error('Error recalculating ELO:', error)
      alert(`Failed to recalculate ELO: ${error.message}`)
    } finally {
      setEloRecalculateLoading(prev => ({ ...prev, [loadingKey]: false }))
    }
  }

  const handleEloModalClose = () => {
    setEloRecalculateResult(null)
    // Refresh the page to show updated ELO data
    window.location.reload()
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
          <p className="text-gray-600 mt-1">
            {leagueParam ? 
              `Manage players in ${leagues.find(l => l._id === leagueParam)?.name || 'selected league'}` :
              'Manage all registered players across leagues'
            }
          </p>
          <p className="text-sm text-blue-600 mt-2">
            💡 Click <span className="font-medium">📧 Invite</span> for new players or <span className="font-medium">🔄 Re-invite</span> for players who need a new activation link
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setImportModal({ show: true })}
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
      <PlayerFilters
        filters={{ ...filters, filteredCount: filteredPlayers.length, totalCount: players.length }}
        onFilterChange={setFilters}
        leagues={leagues}
        leagueParam={leagueParam}
      />

      {/* Players Table */}
      <PlayerTable
        players={filteredPlayers}
        onStatusUpdate={handleStatusUpdate}
        onLevelUpdate={handleLevelUpdate}
        onInvite={handleInvitePlayer}
        onDelete={setDeleteModal}
        onRecalculateElo={handleRecalculateElo}
        updateLoading={updateLoading}
        invitationLoading={invitationLoading}
        eloRecalculateLoading={eloRecalculateLoading}
      />

      {/* Modals */}
      <DeletePlayerModal
        player={deleteModal.player}
        onClose={() => setDeleteModal({ show: false, player: null })}
        onConfirm={handleDelete}
      />

      <InvitationResultModal
        invitation={invitationResult}
        onClose={() => setInvitationResult(null)}
      />

      <ImportCSVModal
        show={importModal.show}
        onClose={() => {
          setImportModal({ show: false })
          setImportResult(null)
        }}
        onImport={handleImport}
        leagues={leagues}
        selectedLeague={filters.league || leagueParam}
        importResult={importResult}
      />

      <EloRecalculateModal
        result={eloRecalculateResult}
        onClose={handleEloModalClose}
      />
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
