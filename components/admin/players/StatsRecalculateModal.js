import React, { useState } from 'react'

export default function StatsRecalculateModal({ 
  players, 
  onClose, 
  onConfirm, 
  isFiltered 
}) {
  const [step, setStep] = useState('confirm') // confirm, progress, results
  const [progress, setProgress] = useState(0)
  const [results, setResults] = useState(null)

  const handleStart = async () => {
    setStep('progress')
    
    try {
      const playerIds = players.map(p => p._id)
      
      const response = await fetch('/api/admin/players/recalculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ playerIds })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to recalculate stats')
      }
      
      setResults(data.data)
      setStep('results')
      
    } catch (error) {
      console.error('Error recalculating stats:', error)
      setResults({
        error: true,
        message: error.message
      })
      setStep('results')
    }
  }

  const handleClose = () => {
    if (step === 'results' && results && !results.error) {
      // Refresh to show updated data
      window.location.reload()
    } else {
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        
        {/* STEP 1: CONFIRMATION */}
        {step === 'confirm' && (
          <>
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Recalculate Player Statistics
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    This will recalculate stats from match history
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {/* Warning box */}
              <div className={`rounded-lg p-4 ${
                isFiltered ? 'bg-blue-50 border border-blue-200' : 'bg-yellow-50 border border-yellow-200'
              }`}>
                <div className="flex items-start">
                  <svg className={`w-6 h-6 mr-3 flex-shrink-0 ${
                    isFiltered ? 'text-blue-600' : 'text-yellow-600'
                  }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <div>
                    <h4 className={`font-semibold ${
                      isFiltered ? 'text-blue-900' : 'text-yellow-900'
                    }`}>
                      {isFiltered ? '🔍 Filtered Selection' : '⚠️ All Players Selected'}
                    </h4>
                    <p className={`text-sm mt-1 ${
                      isFiltered ? 'text-blue-700' : 'text-yellow-700'
                    }`}>
                      {isFiltered 
                        ? 'Only players matching your current filters will be recalculated.'
                        : 'This will recalculate ALL players in the system. Consider applying filters first.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Player count */}
              <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-purple-700">Players to Process</p>
                    <p className="text-3xl font-bold text-purple-900">{players.length}</p>
                  </div>
                  <div>
                    <p className="text-sm text-purple-700">What will be recalculated</p>
                    <ul className="text-sm text-purple-800 mt-1 space-y-1">
                      <li>✓ Matches played &amp; won</li>
                      <li>✓ Regular season points (2-0, 2-1, 1-2)</li>
                      <li>✓ Sets &amp; games won/lost</li>
                      <li className="text-purple-600 font-medium">⚠️ Playoff matches EXCLUDED</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Important note */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h5 className="font-semibold text-gray-900 mb-2">📋 What happens:</h5>
                <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside">
                  <li>System will fetch all completed regular season matches</li>
                  <li>Stats will be calculated using the SAME logic as standings page</li>
                  <li>Playoff matches will NOT affect regular season points</li>
                  <li>Cached stats in registrations will be updated</li>
                </ol>
                <div className="mt-3 pt-3 border-t border-gray-300">
                  <p className="text-xs text-gray-600">
                    <strong>Note:</strong> This recalculates <strong>stats only</strong> (matches, points, sets, games). 
                    ELO ratings are NOT recalculated here. Use individual player ELO recalculation if needed.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-between">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleStart}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
              >
                Start Recalculation
              </button>
            </div>
          </>
        )}

        {/* STEP 2: PROGRESS */}
        {step === 'progress' && (
          <>
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">
                Calculating Statistics...
              </h3>
            </div>

            <div className="p-12 flex flex-col items-center justify-center space-y-6">
              {/* Spinner */}
              <div className="relative">
                <svg className="animate-spin h-16 w-16 text-purple-600" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>

              <div className="text-center">
                <p className="text-lg font-medium text-gray-900">Processing player statistics</p>
                <p className="text-sm text-gray-500 mt-2">
                  Analyzing match history and calculating stats...
                </p>
              </div>

              {/* Progress details */}
              <div className="bg-purple-50 rounded-lg p-4 w-full max-w-md">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="animate-pulse w-2 h-2 bg-purple-600 rounded-full"></div>
                    <p className="text-sm text-purple-800">Fetching completed matches...</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="animate-pulse w-2 h-2 bg-purple-600 rounded-full animation-delay-200"></div>
                    <p className="text-sm text-purple-800">Calculating stats per league...</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="animate-pulse w-2 h-2 bg-purple-600 rounded-full animation-delay-400"></div>
                    <p className="text-sm text-purple-800">Updating player records...</p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* STEP 3: RESULTS */}
        {step === 'results' && results && (
          <>
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                {results.error ? (
                  <>
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Recalculation Failed</h3>
                      <p className="text-sm text-gray-500">An error occurred during the process</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Recalculation Complete!</h3>
                      <p className="text-sm text-gray-500">Player statistics have been updated</p>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto flex-1">
              {results.error ? (
                // Error display
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-800">{results.message}</p>
                </div>
              ) : (
                // Success display
                <>
                  {/* Summary stats */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
                      <p className="text-sm text-green-700">Players Processed</p>
                      <p className="text-2xl font-bold text-green-900">{results.playersProcessed}</p>
                    </div>
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                      <p className="text-sm text-blue-700">Total Matches</p>
                      <p className="text-2xl font-bold text-blue-900">{results.totalMatches}</p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
                      <p className="text-sm text-purple-700">Errors</p>
                      <p className="text-2xl font-bold text-purple-900">{results.errors?.length || 0}</p>
                    </div>
                  </div>

                  {/* Errors if any */}
                  {results.errors && results.errors.length > 0 && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <h4 className="font-semibold text-yellow-900 mb-2">⚠️ Errors Encountered:</h4>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {results.errors.map((err, idx) => (
                          <div key={idx} className="text-sm text-yellow-800 bg-white rounded p-2">
                            Player ID: {err.playerId} - {err.error}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Detailed Players Table */}
                  {results.summary && results.summary.length > 0 && (
                    <div className="bg-white rounded-lg border border-gray-200">
                      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                        <h4 className="font-semibold text-gray-900">
                          📊 Detailed Results ({results.summary.length} players)
                        </h4>
                        <p className="text-xs text-gray-500 mt-1">
                          <span className="font-medium">ELO:</span> Shows current rating (from ALL matches) • 
                          <span className="font-medium">Points:</span> Regular season only (playoffs excluded)
                        </p>
                      </div>
                      
                      <div className="overflow-y-auto max-h-96">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50 sticky top-0">
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Player
                              </th>
                              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                ELO
                              </th>
                              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                League / Level
                              </th>
                              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Matches
                              </th>
                              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                W-L
                              </th>
                              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Points
                              </th>
                              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Sets
                              </th>
                              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Games
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {results.summary.map((player, pIdx) => (
                              <React.Fragment key={pIdx}>
                                {player.leagues.map((league, lIdx) => (
                                  <tr key={`${pIdx}-${lIdx}`} className="hover:bg-gray-50">
                                    {/* Player name - only show on first row */}
                                    {lIdx === 0 ? (
                                      <td className="px-4 py-3 text-sm font-medium text-gray-900" rowSpan={player.leagues.length}>
                                        {player.playerName}
                                        {player.totalMatchesProcessed > 0 && (
                                          <span className="block text-xs text-gray-500 font-normal mt-1">
                                            {player.totalMatchesProcessed} matches processed
                                          </span>
                                        )}
                                      </td>
                                    ) : null}
                                    
                                    {/* ELO - only show on first row */}
                                    {lIdx === 0 ? (
                                      <td className="px-4 py-3 text-center" rowSpan={player.leagues.length}>
                                        <div className="text-lg font-bold text-gray-900">{player.eloRating}</div>
                                        <div className="text-xs text-gray-500">Current</div>
                                      </td>
                                    ) : null}
                                    
                                    {/* League/Level */}
                                    <td className="px-4 py-3 text-center text-sm">
                                      <div className="font-medium text-gray-900">{league.leagueName}</div>
                                      <div className="text-xs text-gray-500">{league.level}</div>
                                    </td>
                                    
                                    {/* Matches */}
                                    <td className="px-4 py-3 text-center text-sm text-gray-900">
                                      {league.stats.matchesPlayed}
                                    </td>
                                    
                                    {/* W-L */}
                                    <td className="px-4 py-3 text-center text-sm">
                                      <span className="text-green-600 font-medium">{league.stats.matchesWon}</span>
                                      <span className="text-gray-400">-</span>
                                      <span className="text-red-600 font-medium">{league.stats.matchesLost}</span>
                                    </td>
                                    
                                    {/* Points */}
                                    <td className="px-4 py-3 text-center">
                                      <div className="text-lg font-bold text-purple-600">{league.stats.totalPoints}</div>
                                    </td>
                                    
                                    {/* Sets */}
                                    <td className="px-4 py-3 text-center text-sm text-gray-600">
                                      <div>{league.stats.setsWon}-{league.stats.setsLost}</div>
                                      <div className="text-xs text-gray-500">({league.stats.setDiff >= 0 ? '+' : ''}{league.stats.setDiff})</div>
                                    </td>
                                    
                                    {/* Games */}
                                    <td className="px-4 py-3 text-center text-sm text-gray-600">
                                      <div>{league.stats.gamesWon}-{league.stats.gamesLost}</div>
                                      <div className="text-xs text-gray-500">({league.stats.gameDiff >= 0 ? '+' : ''}{league.stats.gameDiff})</div>
                                    </td>
                                  </tr>
                                ))}
                              </React.Fragment>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Success message */}
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-start space-x-2">
                      <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <div className="text-sm text-green-800">
                        <p className="font-semibold mb-1">Statistics Successfully Recalculated!</p>
                        <ul className="space-y-1 text-xs">
                          <li>• <strong>Regular season stats</strong> updated (matches, points, sets, games)</li>
                          <li>• <strong>Points</strong> calculated from regular season matches only (playoffs excluded)</li>
                          <li>• <strong>ELO ratings</strong> shown are current values (use individual player ELO recalculation to update)</li>
                        </ul>
                        <p className="mt-2 text-green-700">The page will refresh to show updated data.</p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end">
              <button
                onClick={handleClose}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
              >
                {results.error ? 'Close' : 'Done & Refresh'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
