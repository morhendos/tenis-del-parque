import { formatPlayerNameForPublic } from '@/lib/utils/playerNameUtils'

/**
 * Tennis broadcast-style scoreboard for displaying match results
 * Inspired by professional tennis TV graphics
 */
export default function MatchScoreboard({ 
  match, 
  player = null,
  language = 'es',
  compact = false,
  className = ''
}) {
  if (!match?.result?.score?.sets || !match.players?.player1 || !match.players?.player2) {
    return null
  }

  const player1 = match.players.player1
  const player2 = match.players.player2
  const sets = match.result.score.sets
  const winnerId = match.result?.winner?._id || match.result?.winner

  const isPlayer1Winner = winnerId === player1._id
  const isPlayer2Winner = winnerId === player2._id

  // Format name for display (First name + Last initial, uppercase)
  const formatName = (name) => {
    if (!name) return 'TBD'
    const parts = name.trim().split(' ')
    if (parts.length === 1) return parts[0].toUpperCase()
    const lastName = parts[parts.length - 1]
    return lastName.toUpperCase()
  }

  // Check if set was a tiebreak (one score is 7, other is 6)
  const isTiebreak = (set) => {
    return (set.player1 === 7 && set.player2 === 6) || 
           (set.player1 === 6 && set.player2 === 7)
  }

  // Get tiebreak score if available
  const getTiebreakScore = (set, forPlayer1) => {
    if (set.tiebreak) {
      return forPlayer1 ? set.tiebreak.player1 : set.tiebreak.player2
    }
    return null
  }

  const renderPlayerRow = (playerData, isWinner, playerNum) => {
    const isCurrentUser = player && playerData._id === player._id

    return (
      <div className={`flex items-center px-3 py-2 ${
        isWinner 
          ? 'bg-gradient-to-r from-teal-600 to-cyan-600' 
          : 'bg-gradient-to-r from-slate-600 to-slate-500'
      } ${playerNum === 1 ? '' : ''}`}>
        {/* Winner indicator dot */}
        <div className="w-4 flex-shrink-0">
          {isWinner && (
            <div className="w-2 h-2 rounded-full bg-lime-400 shadow-sm shadow-lime-400/50" />
          )}
        </div>
        
        {/* Player name */}
        <div className="flex-1 min-w-0">
          <span className={`font-bold text-sm tracking-wide truncate block ${
            isWinner ? 'text-white' : 'text-gray-300'
          } ${isCurrentUser ? 'underline decoration-yellow-400 decoration-2 underline-offset-2' : ''}`}>
            {formatName(playerData.name)}
          </span>
        </div>

        {/* Set scores */}
        <div className="flex items-baseline gap-3 ml-4">
          {sets.map((set, idx) => {
            const score = playerNum === 1 ? set.player1 : set.player2
            const opponentScore = playerNum === 1 ? set.player2 : set.player1
            const wonSet = score > opponentScore
            const tiebreak = isTiebreak(set)
            const tiebreakScore = tiebreak ? getTiebreakScore(set, playerNum === 1) : null
            // For tiebreak, loser shows their TB score
            const showTiebreak = tiebreak && !wonSet && tiebreakScore !== null

            return (
              <div 
                key={idx} 
                className="relative"
              >
                <span className={`text-xl font-bold tabular-nums ${
                  wonSet
                    ? 'text-lime-400'
                    : 'text-gray-400'
                }`}>
                  {score}
                </span>
                {showTiebreak && (
                  <sup className="absolute -top-1 -right-2 text-[10px] text-gray-400 font-normal">
                    {tiebreakScore}
                  </sup>
                )}
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className={`rounded-lg overflow-hidden shadow-lg ${className}`}>
      {/* Match header */}
      {!compact && (
        <div className="bg-slate-700 px-3 py-1.5 flex items-center justify-between">
          <span className="text-[10px] font-semibold text-cyan-400 uppercase tracking-wider">
            {match.matchType === 'playoff' && match.playoffInfo?.stage ? (
              (() => {
                const stageNames = {
                  quarterfinal: language === 'es' ? 'Cuartos de Final' : 'Quarterfinal',
                  semifinal: language === 'es' ? 'Semifinal' : 'Semifinal',
                  final: language === 'es' ? 'Final' : 'Final',
                  third_place: language === 'es' ? '3er Puesto' : '3rd Place'
                }
                return stageNames[match.playoffInfo.stage] || `${language === 'es' ? 'Ronda' : 'Round'} ${match.round}`
              })()
            ) : (
              `${language === 'es' ? 'Ronda' : 'Round'} ${match.round}`
            )}
          </span>
          {match.result?.playedAt && (
            <span className="text-[10px] text-gray-400">
              {new Date(match.result.playedAt).toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US', {
                day: 'numeric',
                month: 'short'
              })}
            </span>
          )}
        </div>
      )}

      {/* Player rows - winner first */}
      {isPlayer1Winner ? (
        <>
          {renderPlayerRow(player1, true, 1)}
          {renderPlayerRow(player2, false, 2)}
        </>
      ) : (
        <>
          {renderPlayerRow(player2, true, 2)}
          {renderPlayerRow(player1, false, 1)}
        </>
      )}
    </div>
  )
}
