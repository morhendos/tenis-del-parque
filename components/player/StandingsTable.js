import React from 'react'
import { formatPlayerNameForStandings } from '@/lib/utils/playerNameUtils'

export default function StandingsTable({ players, language, unified = false, playoffConfig = null }) {
  // Get playoff configuration or use defaults
  const numberOfGroups = playoffConfig?.numberOfGroups ?? 2
  const groupAPlayers = playoffConfig?.groupAPlayers ?? 8
  const groupBPlayers = playoffConfig?.groupBPlayers ?? 8
  const playoffsEnabled = playoffConfig?.enabled !== false

  const getPositionBadgeStyle = (position) => {
    if (!playoffsEnabled) {
      return 'bg-gray-100 text-gray-700'
    }
    if (position <= groupAPlayers) return 'bg-blue-600 text-white'
    if (numberOfGroups === 2 && position <= groupAPlayers + groupBPlayers) return 'bg-green-600 text-white'
    return 'bg-gray-100 text-gray-700'
  }

  const getRowAccent = (position) => {
    if (!playoffsEnabled) return ''
    if (position <= groupAPlayers) return 'border-l-2 border-l-blue-500'
    if (numberOfGroups === 2 && position <= groupAPlayers + groupBPlayers) return 'border-l-2 border-l-green-500'
    return ''
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
              <div className="w-3 h-3 bg-blue-600 rounded"></div>
              <span className="text-gray-600">
                1-{groupAPlayers}: {numberOfGroups === 1 ? 'Playoff' : 'Playoff'}
              </span>
            </div>
            {numberOfGroups === 2 && (
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 bg-green-600 rounded"></div>
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

      {/* Modern Compact Table - All columns visible */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Table Header */}
        <div className="bg-gradient-to-r from-parque-purple to-purple-600 text-white text-[10px] sm:text-xs font-semibold">
          <div className="flex items-center">
            <div className="w-8 sm:w-11 px-1 py-2.5 sm:py-3 text-center flex-shrink-0">#</div>
            <div className="flex-1 px-1 sm:px-2 py-2.5 sm:py-3 min-w-0">{language === 'es' ? 'Jugador' : 'Player'}</div>
            <div className="w-6 sm:w-8 px-0.5 py-2.5 sm:py-3 text-center flex-shrink-0">P</div>
            <div className="w-9 sm:w-12 px-0.5 py-2.5 sm:py-3 text-center flex-shrink-0">W-L</div>
            <div className="w-9 sm:w-12 px-0.5 py-2.5 sm:py-3 text-center flex-shrink-0">Sets</div>
            <div className="w-11 sm:w-14 px-0.5 py-2.5 sm:py-3 text-center flex-shrink-0">{language === 'es' ? 'Jueg' : 'Gms'}</div>
            <div className="w-9 sm:w-11 px-1 py-2.5 sm:py-3 text-center flex-shrink-0 font-bold">Pts</div>
          </div>
        </div>

        {/* Table Body */}
        <div className="divide-y divide-gray-100">
          {players.map((standing, index) => {
            return (
              <div 
                key={standing.player._id} 
                className={`flex items-center ${getRowAccent(standing.position)} ${
                  index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                } hover:bg-purple-50/50 transition-colors`}
              >
                {/* Position */}
                <div className="w-8 sm:w-11 px-1 py-2 sm:py-2.5 flex justify-center flex-shrink-0">
                  <span className={`w-5 h-5 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-bold ${getPositionBadgeStyle(standing.position)}`}>
                    {standing.position}
                  </span>
                </div>

                {/* Player Name */}
                <div className="flex-1 px-1 sm:px-2 py-2 sm:py-2.5 min-w-0">
                  <div className="font-semibold text-gray-900 text-[12px] sm:text-sm truncate">
                    {formatPlayerNameForStandings(standing.player.name, language)}
                  </div>
                </div>

                {/* Matches Played */}
                <div className="w-6 sm:w-8 px-0.5 py-2 sm:py-2.5 text-center text-[11px] sm:text-sm text-gray-600 flex-shrink-0">
                  {standing.stats.matchesPlayed}
                </div>

                {/* Wins - Losses */}
                <div className="w-9 sm:w-12 px-0.5 py-2 sm:py-2.5 text-center flex-shrink-0">
                  <span className="text-[11px] sm:text-sm font-medium">
                    <span className="text-green-600">{standing.stats.matchesWon}</span>
                    <span className="text-gray-300">-</span>
                    <span className="text-red-500">{standing.stats.matchesLost}</span>
                  </span>
                </div>

                {/* Sets */}
                <div className="w-9 sm:w-12 px-0.5 py-2 sm:py-2.5 text-center text-[11px] sm:text-sm flex-shrink-0">
                  <span className="text-green-600">{standing.stats.setsWon}</span>
                  <span className="text-gray-300">-</span>
                  <span className="text-red-500">{standing.stats.setsLost}</span>
                </div>

                {/* Games */}
                <div className="w-11 sm:w-14 px-0.5 py-2 sm:py-2.5 text-center text-[11px] sm:text-sm flex-shrink-0">
                  <span className="text-green-600">{standing.stats.gamesWon || 0}</span>
                  <span className="text-gray-300">-</span>
                  <span className="text-red-500">{standing.stats.gamesLost || 0}</span>
                </div>

                {/* Points */}
                <div className="w-9 sm:w-11 px-1 py-2 sm:py-2.5 text-center flex-shrink-0">
                  <span className="text-[12px] sm:text-base font-bold text-gray-900">
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
