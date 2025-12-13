'use client'

export default function RecentResults({ matches, language, maxResults = 3 }) {
  const content = {
    es: {
      title: 'Actividad Reciente',
      noMatches: 'Sin partidos completados',
      round: 'Ronda',
      win: 'Victoria',
      loss: 'Derrota',
      viewAll: 'Ver todos'
    },
    en: {
      title: 'Recent Activity',
      noMatches: 'No completed matches',
      round: 'Round',
      win: 'Win',
      loss: 'Loss',
      viewAll: 'View all'
    }
  }

  const t = content[language] || content.es

  // Format score for display
  const formatScore = (score) => {
    if (!score) return ''
    if (score.walkover) return 'W/O'
    if (!score.sets || score.sets.length === 0) return ''
    
    return score.sets.map(set => `${set.player1}-${set.player2}`).join(' ')
  }

  // Get display matches (limited to maxResults)
  const displayMatches = (matches || []).slice(0, maxResults)

  if (!displayMatches || displayMatches.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <span className="text-lg font-semibold text-gray-400">{t.title}</span>
        </div>
        <p className="text-gray-400 text-sm">{t.noMatches}</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <span className="text-lg font-semibold text-gray-900">{t.title}</span>
        </div>
      </div>

      {/* Match List */}
      <div className="space-y-3">
        {displayMatches.map((match, index) => {
          const isWin = match.result === 'won'
          const scoreStr = formatScore(match.score)
          const eloChange = match.eloChange || 0
          const position = match.opponentPosition
          
          return (
            <div 
              key={match._id || index}
              className={`rounded-xl p-4 ${isWin ? 'bg-green-50' : 'bg-red-50'}`}
            >
              <div className="flex items-center gap-4">
                {/* Position Circle */}
                <div className={`w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 ${
                  isWin ? 'bg-green-500' : 'bg-red-500'
                }`}>
                  <span className="text-white text-base font-bold">
                    {position ? `#${position}` : '—'}
                  </span>
                </div>
                
                {/* Player Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate">
                    {match.opponent}
                  </p>
                  <p className="text-sm text-gray-500">
                    {t.round} {match.round}
                  </p>
                </div>
                
                {/* Result + ELO */}
                <div className="text-right flex-shrink-0">
                  <p className={`font-semibold ${isWin ? 'text-green-600' : 'text-red-600'}`}>
                    {isWin ? t.win : t.loss}
                  </p>
                  <p className="text-sm text-gray-500">
                    ELO {eloChange >= 0 ? '+' : ''}{eloChange}
                  </p>
                </div>
              </div>
              
              {/* Score row */}
              {scoreStr && (
                <div className="mt-2 pt-2 border-t border-gray-200/50">
                  <p className="text-sm text-gray-600 font-mono text-center">
                    {scoreStr}
                  </p>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
