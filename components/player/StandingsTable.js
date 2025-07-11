import React from 'react'

export default function StandingsTable({ players, language, unified = false }) {
  const getPositionStyle = (position) => {
    // Unified subtle violet gradient background with left border indicators
    const baseStyle = "bg-gradient-to-r from-violet-50/30 via-white to-violet-50/20 border-gray-200 shadow-violet-100/50"
    
    // Add subtle left border color for qualification zones
    if (position <= 8) return `${baseStyle} border-l-4 border-l-blue-500`
    if (position <= 16) return `${baseStyle} border-l-4 border-l-green-500`
    return baseStyle
  }

  const getPositionBadgeStyle = (position) => {
    // More prominent badges to compensate for unified row backgrounds
    if (position <= 8) return 'bg-blue-600 text-white ring-2 ring-blue-200'
    if (position <= 16) return 'bg-green-600 text-white ring-2 ring-green-200'
    return 'bg-gray-500 text-white ring-2 ring-gray-200'
  }

  const getPositionLabel = (position) => {
    if (position <= 8) return language === 'es' ? 'Playoff A' : 'Playoff A'
    if (position <= 16) return language === 'es' ? 'Playoff B' : 'Playoff B'
    return language === 'es' ? 'Liga' : 'League' // More neutral than "Eliminated"
  }

  const getWinPercentage = (won, total) => {
    if (total === 0) return 0
    return Math.round((won / total) * 100)
  }

  // Helper function to get player status styling
  const getPlayerStatusStyle = (player) => {
    const isActive = player.status === 'active'
    return isActive 
      ? 'opacity-100' 
      : 'opacity-50 bg-gray-50' // Make pending/confirmed (invited but not activated) players transparent with gray background
  }

  // Helper function to get player status indicator
  const getPlayerStatusIndicator = (player) => {
    if (player.status === 'active' || player.status === 'confirmed') {
      return null // No indicator for active players
    }
    return (
      <span className="ml-2 px-2 py-1 text-xs rounded-full bg-gray-200 text-gray-600">
        {player.status}
      </span>
    )
  }

  return (
    <div className="overflow-x-auto">
      {/* Playoff Qualification Legend */}
      <div className="mb-6 bg-gradient-to-r from-violet-50/50 to-violet-50/30 rounded-lg p-4 border border-violet-100/40">
        <h3 className="text-sm font-semibold text-violet-800 mb-3">
          {language === 'es' ? 'Clasificación a Playoffs' : 'Playoff Qualification'}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
          <div className="flex items-center space-x-3">
            <div className="w-4 h-4 bg-blue-600 rounded"></div>
            <span className="text-gray-700">
              <span className="font-medium">1-8:</span> {language === 'es' ? 'Playoff A' : 'Playoff A'}
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-4 h-4 bg-green-600 rounded"></div>
            <span className="text-gray-700">
              <span className="font-medium">9-16:</span> {language === 'es' ? 'Playoff B' : 'Playoff B'}
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-4 h-4 bg-gray-500 rounded"></div>
            <span className="text-gray-700">
              <span className="font-medium">17+:</span> {language === 'es' ? 'Liga Regular' : 'Regular League'}
            </span>
          </div>
        </div>
      </div>
      {/* Mobile-first card layout for small screens */}
      <div className="block md:hidden space-y-4">
        {players.map((standing, index) => {
          const winPercentage = getWinPercentage(standing.stats.matchesWon, standing.stats.matchesPlayed)
          
          return (
            <div 
              key={standing.player._id} 
              className={`${getPositionStyle(standing.position)} ${getPlayerStatusStyle(standing.player)} rounded-xl p-3 shadow-lg border transition-all duration-300 hover:shadow-xl hover:scale-[1.02]`}
            >
              {/* Header with position and points */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  {/* Position with playoff qualification styling */}
                  <div className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${getPositionBadgeStyle(standing.position)}`}>
                      {standing.position}
                    </div>
                    {/* Playoff qualification indicator - only show for playoff positions */}
                    {standing.position <= 16 && (
                      <div className="ml-2 text-xs">
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                          standing.position <= 8 ? 'bg-blue-100 text-blue-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {getPositionLabel(standing.position)}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Points with unified styling */}
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">
                    {standing.stats.totalPoints || 0}
                  </div>
                  <div className="text-xs text-gray-500 font-medium">{language === 'es' ? 'puntos' : 'points'}</div>
                </div>
              </div>

              {/* Player name on separate row */}
              <div className="mb-3 text-center">
                <div className="text-lg font-bold text-gray-900 mb-1 flex items-center justify-center">
                  {standing.player.name}
                  {getPlayerStatusIndicator(standing.player)}
                </div>
                {winPercentage > 0 && (
                  <div className="text-sm text-gray-500">
                    {winPercentage}% {language === 'es' ? 'victorias' : 'wins'}
                  </div>
                )}
              </div>

              {/* Win percentage bar */}
              {standing.stats.matchesPlayed > 0 && (
                <div className="mb-3">
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>{language === 'es' ? 'Progreso' : 'Progress'}</span>
                    <span>{winPercentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-500 ${
                        winPercentage >= 75 ? 'bg-green-500' :
                        winPercentage >= 50 ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}
                      style={{ width: `${winPercentage}%` }}
                    ></div>
                  </div>
                </div>
              )}
              
              {/* Enhanced stats grid - More compact for mobile */}
              <div className="grid grid-cols-4 gap-1 text-sm">
                                  <div className="text-center bg-white/70 rounded-lg p-2 border border-violet-100/40">
                    <div className="font-bold text-gray-900 text-base">{standing.stats.matchesPlayed}</div>
                    <div className="text-xs text-gray-600 font-medium">{language === 'es' ? 'P.J.' : 'MP'}</div>
                  </div>
                  <div className="text-center bg-white/70 rounded-lg p-2 border border-violet-100/40">
                    <div className="font-bold text-green-600 text-base">{standing.stats.matchesWon}</div>
                    <div className="text-xs text-gray-600 font-medium">{language === 'es' ? 'P.G.' : 'MW'}</div>
                  </div>
                  <div className="text-center bg-white/70 rounded-lg p-2 border border-violet-100/40">
                    <div className="font-bold text-gray-900 text-base">
                      {standing.stats.setsWon}-{standing.stats.setsLost}
                    </div>
                    <div className="text-xs text-gray-600 font-medium">{language === 'es' ? 'Sets' : 'Sets'}</div>
                  </div>
                  <div className="text-center bg-white/70 rounded-lg p-2 border border-violet-100/40">
                    <div className="font-bold text-gray-900 text-base">
                      {standing.stats.gamesWon || 0}-{standing.stats.gamesLost || 0}
                    </div>
                    <div className="text-xs text-gray-600 font-medium">{language === 'es' ? 'Juegos' : 'Games'}</div>
                  </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Desktop table layout - Enhanced */}
      <div className="hidden md:block">
        <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-lg">
          <table className="w-full divide-y divide-gray-200" style={{ minWidth: '1100px' }}>
            <thead className="bg-gradient-to-r from-violet-600 via-parque-purple to-violet-600">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                  {language === 'es' ? 'Posición' : 'Position'}
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider w-48">
                  {language === 'es' ? 'Jugador' : 'Player'}
                </th>
                <th className="px-6 py-4 text-center text-xs font-bold text-white uppercase tracking-wider">
                  {language === 'es' ? 'Clasificación' : 'Qualification'}
                </th>
                <th className="px-6 py-4 text-center text-xs font-bold text-white uppercase tracking-wider">
                  {language === 'es' ? 'Puntos' : 'Points'}
                </th>
                <th className="px-6 py-4 text-center text-xs font-bold text-white uppercase tracking-wider">
                  {language === 'es' ? 'Partidos' : 'Matches'}
                </th>
                <th className="px-6 py-4 text-center text-xs font-bold text-white uppercase tracking-wider">
                  {language === 'es' ? 'Victorias' : 'Wins'}
                </th>
                <th className="px-6 py-4 text-center text-xs font-bold text-white uppercase tracking-wider">
                  {language === 'es' ? 'Sets' : 'Sets'}
                </th>
                <th className="px-6 py-4 text-center text-xs font-bold text-white uppercase tracking-wider">
                  {language === 'es' ? 'Juegos' : 'Games'}
                </th>
                <th className="px-6 py-4 text-center text-xs font-bold text-white uppercase tracking-wider">
                  {language === 'es' ? 'Progreso' : 'Progress'}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {players.map((standing, index) => {
                const winPercentage = getWinPercentage(standing.stats.matchesWon, standing.stats.matchesPlayed)
                const rowBg = getPositionStyle(standing.position)
                            
                return (
                  <tr key={standing.player._id} className={`${rowBg} ${getPlayerStatusStyle(standing.player)} hover:shadow-md hover:scale-[1.01] transition-all duration-200`}>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm mr-3 ${getPositionBadgeStyle(standing.position)}`}>
                          {standing.position}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-parque-purple text-white flex items-center justify-center text-sm font-bold mr-3">
                          {standing.player.name.charAt(0)}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-gray-900 flex items-center">
                            {standing.player.name}
                            {getPlayerStatusIndicator(standing.player)}
                          </div>
                          {winPercentage > 0 && (
                            <div className="text-xs text-gray-500">
                              {winPercentage}% {language === 'es' ? 'victorias' : 'wins'}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-center">
                      {standing.position <= 16 ? (
                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          standing.position <= 8 ? 'bg-blue-100 text-blue-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {getPositionLabel(standing.position)}
                        </div>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-center">
                      <div className="text-lg font-bold text-gray-900">
                        {standing.stats.totalPoints || 0}
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-center">
                      <div className="text-sm font-medium text-gray-900">
                        {standing.stats.matchesPlayed}
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center space-x-1">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {standing.stats.matchesWon}
                        </span>
                        <span className="text-gray-400">-</span>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          {standing.stats.matchesLost}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-center">
                      <div className="text-sm font-medium text-gray-900">
                        <span className="text-green-600">{standing.stats.setsWon}</span>
                        <span className="text-gray-400 mx-1">-</span>
                        <span className="text-red-600">{standing.stats.setsLost}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-center">
                      <div className="text-sm font-medium text-gray-900">
                        <span className="text-green-600">{standing.stats.gamesWon || 0}</span>
                        <span className="text-gray-400 mx-1">-</span>
                        <span className="text-red-600">{standing.stats.gamesLost || 0}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-center w-32">
                      <div className="flex items-center justify-center space-x-3">
                        <div className="flex-1 bg-gray-200 rounded-full h-3 min-w-[60px]">
                          <div 
                            className={`h-3 rounded-full transition-all duration-500 ${
                              winPercentage >= 75 ? 'bg-green-500' :
                              winPercentage >= 50 ? 'bg-yellow-500' :
                              'bg-red-500'
                            }`}
                            style={{ width: `${winPercentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-700 min-w-[2.5rem]">
                          {winPercentage}%
                        </span>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
} 