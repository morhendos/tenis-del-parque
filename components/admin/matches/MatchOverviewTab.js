import React, { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function MatchOverviewTab({ match, onTabChange, onStatusUpdate, onDeleteMatch }) {
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const router = useRouter()

  const handleStatusChange = async (newStatus) => {
    if (!confirm(`Are you sure you want to change the match status to "${newStatus}"?`)) {
      return
    }
    
    setUpdatingStatus(true)
    try {
      await onStatusUpdate(newStatus)
    } catch (error) {
      console.error('Error updating status:', error)
    } finally {
      setUpdatingStatus(false)
    }
  }

  const handleDeleteMatch = async () => {
    setDeleting(true)
    try {
      await onDeleteMatch(true) // recalculateStats = true
      // Redirect to matches list after successful deletion
      router.push(`/admin/matches?league=${match.league._id}`)
    } catch (error) {
      console.error('Error deleting match:', error)
      setDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  const getStatusBadge = (status) => {
    const styles = {
      scheduled: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      postponed: 'bg-yellow-100 text-yellow-800'
    }
    return styles[status] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="space-y-6">
      {/* Match Status Section */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold text-gray-900">Match Status</h4>
          <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusBadge(match.status)}`}>
            {match.status.toUpperCase()}
          </span>
        </div>
        
        {/* Status Change Buttons */}
        {match.status !== 'completed' && (
          <div className="flex flex-wrap gap-2">
            {match.status === 'cancelled' && (
              <button
                onClick={() => handleStatusChange('scheduled')}
                disabled={updatingStatus}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm flex items-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Restore Match (Uncancel)
              </button>
            )}
            
            {match.status === 'scheduled' && (
              <>
                <button
                  onClick={() => handleStatusChange('cancelled')}
                  disabled={updatingStatus}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 text-sm flex items-center"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Cancel Match
                </button>
                <button
                  onClick={() => handleStatusChange('postponed')}
                  disabled={updatingStatus}
                  className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 text-sm flex items-center"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Postpone Match
                </button>
              </>
            )}
            
            {match.status === 'postponed' && (
              <>
                <button
                  onClick={() => handleStatusChange('scheduled')}
                  disabled={updatingStatus}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm flex items-center"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Reschedule (Back to Scheduled)
                </button>
                <button
                  onClick={() => handleStatusChange('cancelled')}
                  disabled={updatingStatus}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 text-sm flex items-center"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Cancel Match
                </button>
              </>
            )}
          </div>
        )}
        
        {match.status === 'completed' && (
          <p className="text-sm text-gray-600">
            To change the status of a completed match, first reset it to unplayed from the Result tab.
          </p>
        )}
      </div>

      {/* Player Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Player 1 Details */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-3">{match.players.player1.name}</h4>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-600">Email:</dt>
              <dd className="font-medium text-gray-900">{match.players.player1.email}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-600">Phone:</dt>
              <dd className="font-medium text-gray-900">{match.players.player1.whatsapp}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-600">Level:</dt>
              <dd className="font-medium text-gray-900 capitalize">{match.players.player1.level}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-600">Current ELO:</dt>
              <dd className="font-medium text-gray-900">{match.players.player1.eloRating || 1200}</dd>
            </div>
            {match.eloChanges?.player1 && (
              <div className="flex justify-between">
                <dt className="text-gray-600">ELO Change:</dt>
                <dd className={`font-medium ${
                  match.eloChanges.player1.change > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {match.eloChanges.player1.change > 0 ? '+' : ''}{match.eloChanges.player1.change}
                </dd>
              </div>
            )}
          </dl>
        </div>

        {/* Player 2 Details */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-3">{match.players.player2.name}</h4>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-600">Email:</dt>
              <dd className="font-medium text-gray-900">{match.players.player2.email}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-600">Phone:</dt>
              <dd className="font-medium text-gray-900">{match.players.player2.whatsapp}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-600">Level:</dt>
              <dd className="font-medium text-gray-900 capitalize">{match.players.player2.level}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-600">Current ELO:</dt>
              <dd className="font-medium text-gray-900">{match.players.player2.eloRating || 1200}</dd>
            </div>
            {match.eloChanges?.player2 && (
              <div className="flex justify-between">
                <dt className="text-gray-600">ELO Change:</dt>
                <dd className={`font-medium ${
                  match.eloChanges.player2.change > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {match.eloChanges.player2.change > 0 ? '+' : ''}{match.eloChanges.player2.change}
                </dd>
              </div>
            )}
          </dl>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-blue-50 rounded-lg p-4">
        <h4 className="font-semibold text-gray-900 mb-3">Quick Actions</h4>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {match.status !== 'completed' && (
            <button
              onClick={() => onTabChange('players')}
              className="flex items-center justify-center px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              Edit Players
            </button>
          )}
          <button
            onClick={() => onTabChange('schedule')}
            className="flex items-center justify-center px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Schedule Match
          </button>
          <button
            onClick={() => onTabChange('result')}
            className="flex items-center justify-center px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Enter Result
          </button>
          <button
            onClick={() => window.open(`mailto:${match.players.player1.email},${match.players.player2.email}?subject=Tennis Match - Round ${match.round}`)}
            className="flex items-center justify-center px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Send Email
          </button>
        </div>
      </div>
      {/* Danger Zone - Delete Match */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <h4 className="font-semibold text-red-800 mb-2 flex items-center">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          Danger Zone
        </h4>
        <p className="text-sm text-red-700 mb-3">
          Permanently delete this match. {match.status === 'completed' && 'Player stats and ELO will be recalculated automatically.'}
        </p>
        
        {!showDeleteConfirm ? (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm flex items-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete Match
          </button>
        ) : (
          <div className="bg-white rounded-lg p-4 border border-red-300">
            <p className="text-sm text-gray-700 mb-3">
              Are you sure you want to delete this match?
              <br />
              <strong className="text-red-700">This action cannot be undone.</strong>
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleDeleteMatch}
                disabled={deleting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 text-sm flex items-center"
              >
                {deleting ? (
                  <>
                    <svg className="animate-spin w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Deleting...
                  </>
                ) : (
                  'Yes, Delete Match'
                )}
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
