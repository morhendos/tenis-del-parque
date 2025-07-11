import React from 'react'

export default function EloRecalculateModal({ result, onClose }) {
  if (!result) return null

  const { player, elo, matches, history } = result

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            ELO Recalculation Results
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        {/* Player Summary */}
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold text-blue-900 mb-2">{player.name}</h4>
              <p className="text-blue-700 text-sm">Level: {player.level}</p>
              <p className="text-blue-700 text-sm">Matches processed: {matches.processed}</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-900">
                {elo.initial} → {elo.final}
              </div>
              <div className={`text-lg font-semibold ${
                elo.change >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {elo.change >= 0 ? '+' : ''}{elo.change} points
              </div>
              <div className="text-sm text-blue-700">
                Peak: {elo.highest} | Low: {elo.lowest}
              </div>
            </div>
          </div>
        </div>

        {/* Match History */}
        <div className="flex-1 overflow-hidden">
          <h4 className="font-semibold text-gray-900 mb-3">Match History ({history.length} matches)</h4>
          
          <div className="overflow-y-auto max-h-64 border border-gray-200 rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Round
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Opponent
                  </th>
                  <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">
                    Result
                  </th>
                  <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">
                    ELO Before
                  </th>
                  <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">
                    ELO Change
                  </th>
                  <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">
                    ELO After
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {history.map((match, index) => (
                  <tr key={index} className={match.won ? 'bg-green-50' : 'bg-red-50'}>
                    <td className="px-4 py-2 text-sm text-gray-900">
                      {match.round}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-900">
                      {match.opponent}
                    </td>
                    <td className="px-4 py-2 text-center">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        match.won 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {match.won ? 'Won' : 'Lost'}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-center text-sm text-gray-900">
                      {match.eloBefore}
                    </td>
                    <td className="px-4 py-2 text-center text-sm">
                      <span className={`font-medium ${
                        match.eloChange >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {match.eloChange >= 0 ? '+' : ''}{match.eloChange}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-center text-sm font-medium text-gray-900">
                      {match.eloAfter}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-500">
                      {new Date(match.playedAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end mt-6 pt-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
} 