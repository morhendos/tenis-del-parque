import React from 'react'
import { formatPlayerNameForStandings } from '@/lib/utils/playerNameUtils'

export default function StandingsTable({ players, language, unified = false, playoffConfig = null }) {
  // Get playoff configuration or use defaults
  const numberOfGroups = playoffConfig?.numberOfGroups ?? 2
  const groupAPlayers = playoffConfig?.groupAPlayers ?? 8
  const groupBPlayers = playoffConfig?.groupBPlayers ?? 8
  const playoffsEnabled = playoffConfig?.enabled !== false

  // All position badges are the same subtle gray
  const getPositionBadgeStyle = () => {
    return 'bg-gray-100 text-gray-600'
  }

  // Get playoff indicator color
  const getPlayoffIndicatorColor = (position) => {
    if (!playoffsEnabled) return null
    if (position <= groupAPlayers) return 'bg-blue-500'
    if (numberOfGroups === 2 && position <= groupAPlayers + groupBPlayers) return 'bg-green-500'
    return null
  }

  // Calculate win percentage
  const getWinPercentage = (stats) => {
    if (!stats.matchesPlayed || stats.matchesPlayed === 0) return 0
    return Math.round((stats.matchesWon / stats.matchesPlayed) * 100)
  }

  // Get color for win percentage bar
  const getWinPercentageColor = (percentage) => {
    if (percentage >= 70) return 'bg-green-500'
    if (percentage >= 50) return 'bg-blue-500'
    if (percentage >= 30) return 'bg-yellow-500'
    return 'bg-gray-300'
  }

  return (
    <div>
      {/* Playoff Qualification Legend - Compact version */}
      {playoffsEnabled && (
        <div className="mb-4 bg-gray-50 rounded-lg p-3 border border-gray-200">
          <h3 className="text-xs font-semibold text-gray-700 mb-2">
            {language === 'es' ? 'Clasificación a Playoffs' : 'Playoff Qualification'}
          </h3>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span className="text-gray-600">
                1-{groupAPlayers}: {numberOfGroups === 1 ? 'Playoff' : 'Playoff'}
              </span>
            </div>
            {numberOfGroups === 2 && (
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 bg-green-500 rounded"></div>
                <span className="text-gray-600">
                  {groupAPlayers + 1}-{groupAPlayers + groupBPlayers}: Playoff B
                </span>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 bg-gray-300 rounded"></div>
              <span className="text-gray-600">
                {(numberOfGroups === 2 ? groupAPlayers + groupBPlayers : groupAPlayers) + 1}+: {language === 'es' ? 'Liga Regular' : 'Regular League'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Modern Compact Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Table Header */}
        <div className="bg-gradient-to-r from-parque-purple to-purple-600 text-white text-[10px] sm:text-xs font-semibold">
          <div className="flex items-center">
            <div className="w-8 sm:w-12 lg:w-14 px-1 py-2.5 sm:py-3 text-center flex-shrink-0">#</div>
            <div className="flex-1 min-w-0 max-w-[200px] lg:max-w-[280px] px-1 sm:px-2 py-2.5 sm:py-3">{language === 'es' ? 'Jugador' : 'Player'}</div>
            <div className="hidden md:block w-28 lg:w-36 px-2 py-2.5 sm:py-3 text-center flex-shrink-0">Win %</div>
            <div className="w-12 sm:w-16 lg:w-20 px-1 py-2.5 sm:py-3 text-center flex-shrink-0">W-L</div>
            <div className="w-12 sm:w-16 lg:w-20 px-1 py-2.5 sm:py-3 text-center flex-shrink-0">Sets</div>
            <div className="w-14 sm:w-16 lg:w-20 px-1 py-2.5 sm:py-3 text-center flex-shrink-0">{language === 'es' ? 'Juegos' : 'Games'}</div>
            <div className="w-10 sm:w-14 lg:w-16 px-1 py-2.5 sm:py-3 text-center flex-shrink-0 font-bold">Pts</div>
          </div>
        </div>

        {/* Table Body */}
        <div className="divide-y divide-gray-100">
          {players.map((standing, index) => {
            const position = index + 1
            const indicatorColor = getPlayoffIndicatorColor(position)
            const winPct = getWinPercentage(standing.stats)
            const pctColor = getWinPercentageColor(winPct)
            
            return (
              <div 
                key={standing.player._id} 
                className={`relative flex items-center ${
                  index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                } hover:bg-purple-50/50 transition-colors`}
              >
                {/* Playoff indicator bar */}
                {indicatorColor && (
                  <div className={`absolute left-0 top-0 bottom-0 w-0.5 ${indicatorColor}`} />
                )}

                {/* Position */}
                <div className="w-8 sm:w-12 lg:w-14 px-1 py-2 sm:py-2.5 flex justify-center flex-shrink-0">
                  <span className={`w-5 h-5 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-bold ${getPositionBadgeStyle()}`}>
                    {position}
                  </span>
                </div>

                {/* Player Name + Matches Played subtitle */}
                <div className="flex-1 min-w-0 max-w-[200px] lg:max-w-[280px] px-1 sm:px-2 py-1.5 sm:py-2">
                  <div className="font-semibold text-gray-900 text-[12px] sm:text-sm truncate">
                    {formatPlayerNameForStandings(standing.player.name, language)}
                  </div>
                  <div className="text-[10px] text-gray-400">
                    {standing.stats.matchesPlayed} {language === 'es' ? 'partidos' : 'matches'}
                  </div>
                </div>

                {/* Win Percentage - desktop only */}
                <div className="hidden md:flex w-28 lg:w-36 px-2 py-2 sm:py-2.5 flex-shrink-0 items-center gap-2">
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${pctColor} rounded-full transition-all`}
                      style={{ width: `${winPct}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-600 font-medium w-10 text-right">{winPct}%</span>
                </div>

                {/* Wins - Losses */}
                <div className="w-12 sm:w-16 lg:w-20 px-1 py-2 sm:py-2.5 text-center flex-shrink-0">
                  <span className="text-[11px] sm:text-sm lg:text-base font-medium">
                    <span className="text-green-600">{standing.stats.matchesWon}</span>
                    <span className="text-gray-300 mx-0.5">-</span>
                    <span className="text-red-500">{standing.stats.matchesLost}</span>
                  </span>
                </div>

                {/* Sets */}
                <div className="w-12 sm:w-16 lg:w-20 px-1 py-2 sm:py-2.5 text-center flex-shrink-0">
                  <span className="text-[11px] sm:text-sm lg:text-base">
                    <span className="text-green-600">{standing.stats.setsWon}</span>
                    <span className="text-gray-300 mx-0.5">-</span>
                    <span className="text-red-500">{standing.stats.setsLost}</span>
                  </span>
                </div>

                {/* Games */}
                <div className="w-14 sm:w-16 lg:w-20 px-1 py-2 sm:py-2.5 text-center flex-shrink-0">
                  <span className="text-[11px] sm:text-sm lg:text-base">
                    <span className="text-green-600">{standing.stats.gamesWon || 0}</span>
                    <span className="text-gray-300 mx-0.5">-</span>
                    <span className="text-red-500">{standing.stats.gamesLost || 0}</span>
                  </span>
                </div>

                {/* Points */}
                <div className="w-10 sm:w-14 lg:w-16 px-1 py-2 sm:py-2.5 text-center flex-shrink-0">
                  <span className="text-[12px] sm:text-base lg:text-lg font-bold text-gray-900">
                    {standing.stats.totalPoints || 0}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
