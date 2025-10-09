import React, { useState, useEffect } from 'react'

export default function PlayerDetailsModal({ player, onClose }) {
  const [playerDetails, setPlayerDetails] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (player) {
      fetchPlayerDetails()
    }
  }, [player])

  const fetchPlayerDetails = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const res = await fetch(`/api/admin/players/${player._id}/details`)
      if (!res.ok) throw new Error('Failed to fetch player details')
      
      const data = await res.json()
      setPlayerDetails(data.player)
    } catch (error) {
      console.error('Error fetching player details:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  if (!player) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Player Details</h2>
            <p className="text-sm text-gray-600 mt-1">{player.name}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Loading player details...</span>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex">
                <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error loading player details</h3>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          {playerDetails && (
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <p className="text-sm text-gray-900">{playerDetails.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <p className="text-sm text-gray-900">{playerDetails.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">WhatsApp</label>
                    <p className="text-sm text-gray-900">{playerDetails.whatsapp || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Account Status</label>
                    <p className="text-sm text-gray-900">
                      {playerDetails.userId ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          Has Account
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          No Account
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Global ELO Stats */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Global ELO Statistics</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{playerDetails.eloRating || 1200}</div>
                    <div className="text-sm text-gray-600">Current ELO</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{playerDetails.highestElo || 1200}</div>
                    <div className="text-sm text-gray-600">Highest ELO</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{playerDetails.lowestElo || 1200}</div>
                    <div className="text-sm text-gray-600">Lowest ELO</div>
                  </div>
                </div>
              </div>

              {/* League Registrations */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">League Registrations</h3>
                <div className="space-y-4">
                  {playerDetails.registrations && playerDetails.registrations.length > 0 ? (
                    playerDetails.registrations.map((registration, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h4 className="font-medium text-gray-900">
                              {registration.league?.name || 'Unknown League'}
                            </h4>
                            <p className="text-sm text-gray-600">
                              Registered: {new Date(registration.registeredAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              registration.status === 'active' ? 'bg-green-100 text-green-800' :
                              registration.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                              registration.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {registration.status}
                            </span>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-gray-700">Level:</span>
                            <span className="ml-1 capitalize">{registration.level}</span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Matches:</span>
                            <span className="ml-1">{registration.stats?.matchesPlayed || 0}</span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Wins:</span>
                            <span className="ml-1">{registration.stats?.matchesWon || 0}</span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Win Rate:</span>
                            <span className="ml-1">
                              {registration.stats?.matchesPlayed > 0 
                                ? Math.round((registration.stats.matchesWon / registration.stats.matchesPlayed) * 100) + '%'
                                : '0%'
                              }
                            </span>
                          </div>
                        </div>

                        {registration.stats?.setsWon !== undefined && (
                          <div className="grid grid-cols-2 gap-4 text-sm mt-2">
                            <div>
                              <span className="font-medium text-gray-700">Sets Won:</span>
                              <span className="ml-1">{registration.stats.setsWon || 0}</span>
                            </div>
                            <div>
                              <span className="font-medium text-gray-700">Sets Lost:</span>
                              <span className="ml-1">{registration.stats.setsLost || 0}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-4">No league registrations found</p>
                  )}
                </div>
              </div>

              {/* Recent Match History */}
              {playerDetails.recentMatches && playerDetails.recentMatches.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Matches</h3>
                  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Opponent</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Result</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Score</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ELO Change</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {playerDetails.recentMatches.slice(0, 10).map((match, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="px-4 py-3 text-sm text-gray-900">
                                {new Date(match.date).toLocaleDateString()}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-900">{match.opponentName}</td>
                              <td className="px-4 py-3 text-sm">
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                  match.result === 'won' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }`}>
                                  {match.result}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-900">{match.score}</td>
                              <td className="px-4 py-3 text-sm">
                                <span className={`font-medium ${
                                  match.eloChange > 0 ? 'text-green-600' : 'text-red-600'
                                }`}>
                                  {match.eloChange > 0 ? '+' : ''}{match.eloChange}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end px-6 py-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
