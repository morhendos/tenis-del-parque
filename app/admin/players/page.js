'use client'

import { useState, Suspense } from 'react'
import usePlayersData from '../../../lib/hooks/usePlayersData'
import PlayerFilters from '../../../components/admin/players/PlayerFilters'
import PlayerTable from '../../../components/admin/players/PlayerTable'
import DeletePlayerModal from '../../../components/admin/players/DeletePlayerModal'
import InvitationResultModal from '../../../components/admin/players/InvitationResultModal'
import ImportCSVModal from '../../../components/admin/players/ImportCSVModal'
import EloRecalculateModal from '../../../components/admin/players/EloRecalculateModal'
import StatsRecalculateModal from '../../../components/admin/players/StatsRecalculateModal'
import PlayerDetailsModal from '../../../components/admin/players/PlayerDetailsModal'
import MoveLeagueModal from '../../../components/admin/players/MoveLeagueModal'

function AdminPlayersContent() {
  const [deleteModal, setDeleteModal] = useState({ show: false, player: null })
  const [importModal, setImportModal] = useState({ show: false })
  const [importResult, setImportResult] = useState(null)
  const [eloRecalculateLoading, setEloRecalculateLoading] = useState({})
  const [eloRecalculateResult, setEloRecalculateResult] = useState(null)
  const [statsRecalculateModal, setStatsRecalculateModal] = useState({ show: false })
  const [detailsModal, setDetailsModal] = useState({ show: false, player: null })
  const [movePlayer, setMovePlayer] = useState(null)
  
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
    handleRemoveFromLeague,
    handleMoveToLeague,
    handleImportCSV,
    exportCSV
  } = usePlayersData()

  const handleMove = async (playerId, fromLeagueId, toLeagueId) => {
    const result = await handleMoveToLeague(playerId, fromLeagueId, toLeagueId)
    if (result.success) {
      setMovePlayer(null)
    } else {
      alert(result.message)
    }
  }

  const handleDelete = async () => {
    if (!deleteModal.player) return
    await handleDeletePlayer(deleteModal.player._id)
    setDeleteModal({ show: false, player: null })
  }

  const handleViewDetails = (player) => {
    setDetailsModal({ show: true, player })
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

  // NEW: Open stats recalculation modal
  const handleRecalculateAllPlayers = () => {
    const isFiltered = filters.league || filters.search || filters.status || filters.level
    setStatsRecalculateModal({ show: true, isFiltered })
  }

  const handleEloModalClose = () => {
    setEloRecalculateResult(null)
    // Refresh the page to show updated ELO data
    window.location.reload()
  }

  // Injury toggle handler
  const handleInjuryToggle = async (player) => {
    const isCurrentlyInjured = player.injury?.active
    
    if (isCurrentlyInjured) {
      // Clear injury
      if (!confirm(`Clear injury status for ${player.name}?`)) return
      try {
        const res = await fetch(`/api/admin/players/${player._id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ injury: { active: false } })
        })
        if (res.ok) {
          alert(`Injury cleared for ${player.name}`)
          window.location.reload()
        } else {
          alert('Failed to clear injury')
        }
      } catch (error) {
        console.error('Error clearing injury:', error)
        alert('Error clearing injury')
      }
    } else {
      // Mark as injured — prompt for return date
      const weeks = prompt(`How many weeks will ${player.name} be out?`, '4')
      if (!weeks) return
      const returnDate = new Date()
      returnDate.setDate(returnDate.getDate() + parseInt(weeks) * 7)
      const reason = prompt('Reason (optional):', '')
      
      try {
        const res = await fetch(`/api/admin/players/${player._id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            injury: {
              active: true,
              estimatedReturnDate: returnDate.toISOString(),
              reason: reason || ''
            }
          })
        })
        if (res.ok) {
          alert(`${player.name} marked as injured until ${returnDate.toLocaleDateString()}`)
          window.location.reload()
        } else {
          alert('Failed to mark injury')
        }
      } catch (error) {
        console.error('Error marking injury:', error)
        alert('Error marking injury')
      }
    }
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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-gray-500">
          {leagueParam
            ? <>Players in <span className="font-semibold text-gray-900">{leagues.find(l => l._id === leagueParam)?.name || 'selected league'}</span></>
            : 'All registered players across leagues'}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setImportModal({ show: true })}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M16 8l-4-4m0 0L8 8m4-4v12" /></svg>
            Import CSV
          </button>
          <button
            onClick={exportCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M8 12l4 4m0 0l4-4m-4 4V4" /></svg>
            Export CSV
          </button>
          <button
            onClick={handleRecalculateAllPlayers}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold rounded-xl bg-purple-50 text-parque-purple hover:bg-purple-100 transition-colors"
            title="Recalculate all player stats from match history"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            Recalculate stats
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
        onRemoveFromLeague={handleRemoveFromLeague}
        onMoveToLeague={setMovePlayer}
        onViewDetails={handleViewDetails}
        onInjuryToggle={handleInjuryToggle}
        updateLoading={updateLoading}
        invitationLoading={invitationLoading}
        eloRecalculateLoading={eloRecalculateLoading}
        currentLeagueId={leagueParam}
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

      <PlayerDetailsModal
        player={detailsModal.player}
        onClose={() => setDetailsModal({ show: false, player: null })}
      />

      <MoveLeagueModal
        player={movePlayer}
        currentLeagueId={leagueParam}
        leagues={leagues}
        onClose={() => setMovePlayer(null)}
        onMove={handleMove}
      />

      {statsRecalculateModal.show && (
        <StatsRecalculateModal
          players={filteredPlayers}
          isFiltered={statsRecalculateModal.isFiltered}
          onClose={() => setStatsRecalculateModal({ show: false })}
        />
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
