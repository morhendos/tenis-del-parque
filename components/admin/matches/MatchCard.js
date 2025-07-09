import React from 'react'

export default function MatchCard({ match, onEditMatch }) {
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
            onClick={() => onEditMatch(match._id)}
            className="px-4 py-2 text-sm bg-parque-purple text-white rounded-lg hover:bg-opacity-90"
          >
            {match.status === 'scheduled' ? 'Enter Result' : 'View Details'}
          </button>
        </div>
      </div>
    </div>
  )
}
