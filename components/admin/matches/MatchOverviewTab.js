import React from 'react'

export default function MatchOverviewTab({ match, onTabChange }) {
  return (
    <div className="space-y-6">
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
              <dd className="font-medium text-gray-900">{match.players.player1.stats?.eloRating || 1200}</dd>
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
              <dd className="font-medium text-gray-900">{match.players.player2.stats?.eloRating || 1200}</dd>
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
    </div>
  )
}