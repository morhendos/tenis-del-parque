'use client'

import Link from 'next/link'

export default function MiniStandings({ standings, playerId, language, locale }) {
  const content = {
    es: {
      title: 'Tu Posición',
      viewTable: 'Ver tabla completa',
      pos: '#',
      player: 'Jugador',
      pts: 'Pts',
      played: 'PJ',
      won: 'PG',
      noData: 'Tabla no disponible'
    },
    en: {
      title: 'Your Position',
      viewTable: 'View full table',
      pos: '#',
      player: 'Player',
      pts: 'Pts',
      played: 'MP',
      won: 'MW',
      noData: 'Table not available'
    }
  }

  const t = content[language] || content.es

  // Get standings data
  const allStandings = standings?.unifiedStandings || []
  
  // Find current player's position
  const playerIndex = allStandings.findIndex(s => String(s.player._id) === String(playerId))
  const playerPosition = playerIndex >= 0 ? playerIndex + 1 : null

  // Get rows to display (2 above, player, 2 below - or adjust at edges)
  const getDisplayRows = () => {
    if (allStandings.length === 0 || playerIndex < 0) return []
    
    const total = allStandings.length
    let start, end
    
    if (total <= 5) {
      // Show all if 5 or fewer
      start = 0
      end = total
    } else if (playerIndex <= 2) {
      // Player near top
      start = 0
      end = 5
    } else if (playerIndex >= total - 2) {
      // Player near bottom
      start = total - 5
      end = total
    } else {
      // Player in middle - show 2 above and 2 below
      start = playerIndex - 2
      end = playerIndex + 3
    }
    
    return allStandings.slice(start, end).map((s, idx) => ({
      ...s,
      position: start + idx + 1,
      isCurrentPlayer: String(s.player._id) === String(playerId)
    }))
  }

  const displayRows = getDisplayRows()

  if (!standings || displayRows.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <span className="text-lg font-semibold text-gray-400">{t.title}</span>
        </div>
        <p className="text-gray-400 text-sm">{t.noData}</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <span className="text-lg font-semibold text-gray-900">{t.title}</span>
        </div>
        <Link 
          href={`/${locale}/player/league`}
          className="text-sm text-parque-purple font-medium hover:underline"
        >
          {t.viewTable} →
        </Link>
      </div>

      {/* Mini Table */}
      <div className="overflow-hidden rounded-xl border border-gray-100">
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-2 px-3 py-2 bg-gray-50 text-xs font-medium text-gray-500">
          <div className="col-span-1 text-center">{t.pos}</div>
          <div className="col-span-7">{t.player}</div>
          <div className="col-span-2 text-center">{t.played}</div>
          <div className="col-span-2 text-center">{t.pts}</div>
        </div>
        
        {/* Table Rows */}
        {displayRows.map((row, idx) => (
          <div 
            key={row.player._id || idx}
            className={`grid grid-cols-12 gap-2 px-3 py-2.5 border-t border-gray-100 ${
              row.isCurrentPlayer 
                ? 'bg-purple-50 font-semibold' 
                : 'bg-white'
            }`}
          >
            <div className={`col-span-1 text-center text-sm ${
              row.isCurrentPlayer ? 'text-parque-purple' : 'text-gray-600'
            }`}>
              {row.position}
            </div>
            <div className={`col-span-7 text-sm truncate ${
              row.isCurrentPlayer ? 'text-parque-purple' : 'text-gray-900'
            }`}>
              {row.isCurrentPlayer && '→ '}{row.player.name}
            </div>
            <div className={`col-span-2 text-center text-sm ${
              row.isCurrentPlayer ? 'text-parque-purple' : 'text-gray-600'
            }`}>
              {row.stats?.matchesPlayed || 0}
            </div>
            <div className={`col-span-2 text-center text-sm font-semibold ${
              row.isCurrentPlayer ? 'text-parque-purple' : 'text-gray-900'
            }`}>
              {row.stats?.totalPoints || 0}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
