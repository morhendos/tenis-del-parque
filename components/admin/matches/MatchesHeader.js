import React from 'react'

export default function MatchesHeader({ selectedLeague, leagueId, onCreateMatch, onGenerateRound }) {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Matches</h2>
        <p className="text-gray-600 mt-1">
          {selectedLeague ? `Manage matches and results for ${selectedLeague.name}` : 'Manage matches and results'}
        </p>
      </div>
      <div className="flex space-x-3">
        <button
          onClick={onGenerateRound}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
          </svg>
          Swiss Pairing
        </button>
        <button
          onClick={onCreateMatch}
          className="px-4 py-2 bg-parque-purple text-white rounded-lg hover:bg-opacity-90 flex items-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          Create Match
        </button>
      </div>
    </div>
  )
}
