import React from 'react'

export default function MatchResultDisplay({ match, onEdit }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Match Result</h3>
        <button
          onClick={onEdit}
          className="text-sm text-parque-purple hover:underline"
        >
          Edit Result
        </button>
      </div>
      
      {/* Winner Section */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6 text-center mb-6 border border-green-200">
        <div className="text-4xl mb-4">🏆</div>
        <h4 className="text-2xl font-bold text-green-800 mb-4">
          {match.result.winner === match.players.player1._id 
            ? match.players.player1.name 
            : match.players.player2.name} Wins!
        </h4>
        
        {/* Set Score Summary */}
        {match.result.score?.sets && match.result.score.sets.length > 0 && (
          <div className="text-lg font-semibold text-green-700 mb-2">
            Sets Won: {(() => {
              const player1Sets = match.result.score.sets.filter(set => 
                parseInt(set.player1) > parseInt(set.player2)
              ).length
              const player2Sets = match.result.score.sets.filter(set => 
                parseInt(set.player2) > parseInt(set.player1)
              ).length
              return match.result.winner === match.players.player1._id 
                ? `${player1Sets}-${player2Sets}` 
                : `${player2Sets}-${player1Sets}`
            })()}
          </div>
        )}
        
        {/* Special Cases */}
        {match.result.score?.walkover && (
          <div className="inline-flex items-center px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
            Walkover
          </div>
        )}
        {match.result.score?.retiredPlayer && (
          <div className="inline-flex items-center px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">
            {match.result.score.retiredPlayer === match.players.player1._id 
              ? match.players.player1.name 
              : match.players.player2.name} retired
          </div>
        )}
      </div>

      {/* Detailed Score Breakdown */}
      {match.result.score?.sets && match.result.score.sets.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
            <h4 className="font-semibold text-gray-900">Set by Set Breakdown</h4>
          </div>
          
          {/* Score Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Player
                  </th>
                  {match.result.score.sets.map((_, index) => (
                    <th key={index} className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Set {index + 1}
                    </th>
                  ))}
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sets Won
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {/* Player 1 Row */}
                <tr className={match.result.winner === match.players.player1._id ? 'bg-green-50' : ''}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {match.result.winner === match.players.player1._id && (
                        <span className="text-green-600 mr-2">🏆</span>
                      )}
                      <span className="font-medium text-gray-900">
                        {match.players.player1.name}
                      </span>
                    </div>
                  </td>
                  {match.result.score.sets.map((set, index) => (
                    <td key={index} className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`text-lg font-bold ${
                        parseInt(set.player1) > parseInt(set.player2) 
                          ? 'text-green-600' 
                          : 'text-gray-500'
                      }`}>
                        {set.player1}
                      </span>
                    </td>
                  ))}
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className="text-lg font-bold text-green-600">
                      {match.result.score.sets.filter(set => 
                        parseInt(set.player1) > parseInt(set.player2)
                      ).length}
                    </span>
                  </td>
                </tr>
                
                {/* Player 2 Row */}
                <tr className={match.result.winner === match.players.player2._id ? 'bg-green-50' : ''}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {match.result.winner === match.players.player2._id && (
                        <span className="text-green-600 mr-2">🏆</span>
                      )}
                      <span className="font-medium text-gray-900">
                        {match.players.player2.name}
                      </span>
                    </div>
                  </td>
                  {match.result.score.sets.map((set, index) => (
                    <td key={index} className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`text-lg font-bold ${
                        parseInt(set.player2) > parseInt(set.player1) 
                          ? 'text-green-600' 
                          : 'text-gray-500'
                      }`}>
                        {set.player2}
                      </span>
                    </td>
                  ))}
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className="text-lg font-bold text-green-600">
                      {match.result.score.sets.filter(set => 
                        parseInt(set.player2) > parseInt(set.player1)
                      ).length}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Match Statistics */}
      {match.result.playedAt && (
        <div className="mt-6 bg-gray-50 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-2">Match Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Date Played:</span>
              <div className="font-medium">{new Date(match.result.playedAt).toLocaleDateString()}</div>
            </div>
            <div>
              <span className="text-gray-600">Time:</span>
              <div className="font-medium">{new Date(match.result.playedAt).toLocaleTimeString()}</div>
            </div>
            <div>
              <span className="text-gray-600">Court:</span>
              <div className="font-medium">{match.schedule?.court || 'Not specified'}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
