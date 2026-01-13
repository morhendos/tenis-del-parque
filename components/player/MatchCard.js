import { useState } from 'react'
import { formatPlayerNameForPublic, formatOpponentName } from '@/lib/utils/playerNameUtils'

export default function MatchCard({ 
  match, 
  player, 
  language, 
  onSchedule, 
  onResult,
  onWhatsApp,
  onUnschedule,
  isUpcoming = true,
  showActions = true,
  isPublic = false,
  showLeagueBadge = false,
  openRankData = {},
  className = ''
}) {
  const [isExpanded, setIsExpanded] = useState(false)
  
  const getOpponent = () => {
    if (!player) return null
    return match.players.player1._id === player._id 
      ? match.players.player2 
      : match.players.player1
  }

  const getMatchResult = () => {
    if (!player || !match.result || !match.result.winner) return null
    return match.result.winner === player._id ? 'won' : 'lost'
  }

  const formatDateForDisplay = (date) => {
    if (!date) return null
    
    const dateObj = new Date(date)
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(today.getDate() + 1)
    
    const isToday = dateObj.toDateString() === today.toDateString()
    const isTomorrow = dateObj.toDateString() === tomorrow.toDateString()
    
    if (isToday) {
      return language === 'es' ? 'Hoy' : 'Today'
    } else if (isTomorrow) {
      return language === 'es' ? 'Mañana' : 'Tomorrow'
    } else {
      return dateObj.toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      })
    }
  }

  const opponent = getOpponent()
  const result = getMatchResult()
  const isWinner = result === 'won'

  // Get display title for the match (playoff stage or round)
  const getMatchTitle = () => {
    if (match.matchType === 'playoff' && match.playoffInfo?.stage) {
      const stageNames = {
        quarterfinal: language === 'es' ? 'Cuartos' : 'Quarters',
        semifinal: language === 'es' ? 'Semifinal' : 'Semifinal', 
        final: language === 'es' ? 'Final' : 'Final',
        third_place: language === 'es' ? '3er Puesto' : '3rd Place'
      }
      return stageNames[match.playoffInfo.stage] || `R${match.round}`
    }
    return `${language === 'es' ? 'Ronda' : 'Round'} ${match.round}`
  }

  // Get display number for the match (playoff stage abbreviation or round number)
  const getMatchNumber = () => {
    if (match.matchType === 'playoff' && match.playoffInfo?.stage) {
      const stageAbbr = {
        quarterfinal: 'QF',
        semifinal: 'SF',
        final: 'F',
        third_place: '3P'
      }
      return stageAbbr[match.playoffInfo.stage] || match.round
    }
    return match.round
  }

  // Determine the score display for completed matches
  let myScore, opponentScore
  if (!isUpcoming && match.result?.score?.sets && player) {
    const isPlayer1 = match.players.player1._id === player._id
    myScore = match.result.score.sets.filter((set) => 
      isPlayer1 ? set.player1 > set.player2 : set.player2 > set.player1
    ).length
    opponentScore = match.result.score.sets.length - myScore
  }

  // For public view, always show match details
  // const showDetails = isPublic || isExpanded || !isUpcoming  // No longer needed

  // Check if match has been scheduled
  const isScheduled = !!(match.schedule?.confirmedDate || match.schedule?.venue || match.scheduledDate)

  return (
    <div 
      className={`bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden transition-all ${className}`}
      onClick={() => !isPublic && showActions && isUpcoming && setIsExpanded(!isExpanded)}
    >
      {/* Match Header - Minimal */}
      <div className="p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            {/* Thin color indicator bar */}
            <div className={`w-1 h-10 rounded-full flex-shrink-0 ${
              isPublic || !player
                ? 'bg-gray-300'
                : isUpcoming 
                ? 'bg-parque-purple' 
                : isWinner 
                ? 'bg-green-500' 
                : 'bg-red-400'
            }`} />
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${
                  isPublic || !player
                    ? 'bg-gray-100 text-gray-600'
                    : isUpcoming 
                    ? 'bg-purple-100 text-purple-700' 
                    : isWinner 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-red-100 text-red-700'
                }`}>
                  {getMatchNumber()}
                </span>
                <h3 className="font-medium text-gray-900 text-sm">
                  {getMatchTitle()}
                </h3>
              </div>
              <div className="text-xs text-gray-600 mt-0.5">
                {isPublic || !player ? (
                  <>
                    <span>{match.players?.player1?.name ? formatPlayerNameForPublic(match.players.player1.name) : 'TBD'}</span>
                    <span className="mx-1 text-gray-400">vs</span>
                    <span>{match.players?.player2?.name ? formatPlayerNameForPublic(match.players.player2.name) : 'TBD'}</span>
                  </>
                ) : (
                  <>
                    <span className={!isUpcoming && isWinner ? 'font-semibold text-gray-900' : !isUpcoming ? 'text-gray-400' : 'text-gray-700'}>
                      {player?.name || 'You'}
                    </span>
                    {player?._id && openRankData[player._id] && (
                      <span className="ml-1 text-[10px] font-semibold text-amber-600">#{openRankData[player._id]}</span>
                    )}
                    <span className="mx-1 text-gray-400">vs</span>
                    <span className={!isUpcoming && !isWinner ? 'font-semibold text-gray-900' : !isUpcoming ? 'text-gray-400' : 'text-gray-700'}>
                      {opponent?.name ? formatOpponentName(opponent.name, language) : 'TBD'}
                    </span>
                    {opponent?._id && openRankData[opponent._id] && (
                      <span className="ml-1 text-[10px] font-semibold text-amber-600">#{openRankData[opponent._id]}</span>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!isUpcoming && !isPublic && player && (
              <div className="text-right">
                <div className="text-base font-bold text-gray-900">
                  {myScore !== undefined ? `${myScore}-${opponentScore}` : 'N/A'}
                </div>
                <div className={`text-[10px] font-medium ${
                  isWinner ? 'text-green-600' : 'text-red-500'
                }`}>
                  {isWinner ? (language === 'es' ? 'Victoria' : 'Win') : (language === 'es' ? 'Derrota' : 'Loss')}
                </div>
              </div>
            )}
            {isUpcoming && showActions && !isPublic && (
              <svg 
                className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            )}
          </div>
        </div>
      </div>

      {/* League Badge - Minimal */}
      {showLeagueBadge && match.league && (
        <div className="px-3 pb-2 -mt-1">
          <span className="text-[10px] text-gray-400">
            {match.league.name}{match.league.location?.city ? ` • ${match.league.location.city}` : ''}
          </span>
        </div>
      )}

      {/* Schedule info - Visible for ALL scheduled matches */}
      {isUpcoming && isScheduled && (
        <div className="px-3 pb-2 -mt-1 space-y-1">
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <span className="text-green-600 font-medium">✓</span>
            {(match.schedule?.confirmedDate || match.scheduledDate) && (
              <span>{formatDateForDisplay(match.schedule?.confirmedDate || match.scheduledDate)}</span>
            )}
            {match.schedule?.time && <span>• {match.schedule.time}</span>}
            {(match.schedule?.venue || match.schedule?.club) && (
              <span className="truncate">• {match.schedule.venue || match.schedule.club}</span>
            )}
          </div>
          {/* Show notes if they exist */}
          {(match.notes || match.schedule?.notes) && (
            <div className="text-xs text-gray-500 italic pl-4">
              📝 {match.notes || match.schedule?.notes}
            </div>
          )}
        </div>
      )}

      {/* Set details for completed matches - Inline */}
      {!isUpcoming && match.result?.score?.sets && !isPublic && player && (
        <div className="px-3 pb-2 -mt-1">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-gray-400">Sets:</span>
            {match.result.score.sets.map((set, index) => {
              const isPlayer1 = match.players.player1._id === player._id
              const mySetScore = isPlayer1 ? set.player1 : set.player2
              const oppSetScore = isPlayer1 ? set.player2 : set.player1
              const wonSet = mySetScore > oppSetScore
              
              return (
                <span 
                  key={index} 
                  className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                    wonSet ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}
                >
                  {mySetScore}-{oppSetScore}
                </span>
              )
            })}
          </div>
        </div>
      )}

      {/* Match Details - Only for upcoming matches when expanded */}
      {isUpcoming && showActions && isExpanded && !isPublic && (
        <div className="px-3 pb-3 border-t border-gray-100">
          {/* Deadline warning (only if not scheduled yet) */}
          {!isScheduled && match.schedule?.deadline && (
            <div className="py-2 text-xs text-amber-600">
              <span className="font-medium">⏰ {language === 'es' ? 'Límite:' : 'Due:'}</span> {formatDateForDisplay(match.schedule.deadline)}
            </div>
          )}

          {/* Action buttons - Compact */}
          <div className="grid grid-cols-3 gap-2 pt-2">
            <button
              onClick={(e) => {
                e.stopPropagation()
                onSchedule && onSchedule(match, isScheduled)
              }}
              className={`${
                isScheduled 
                  ? 'bg-orange-500 hover:bg-orange-600' 
                  : 'bg-blue-500 hover:bg-blue-600'
              } text-white px-2 py-1.5 rounded text-[10px] font-medium transition-all flex items-center justify-center gap-1`}
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {isScheduled 
                ? (language === 'es' ? 'Cambiar' : 'Change')
                : (language === 'es' ? 'Fecha' : 'Schedule')}
            </button>
            
            <button
              onClick={(e) => {
                e.stopPropagation()
                if (opponent?.whatsapp) {
                  onWhatsApp && onWhatsApp(match, opponent)
                } else {
                  const opponentDisplayName = opponent?.name ? formatOpponentName(opponent.name, language) : (language === 'es' ? 'este jugador' : 'this player')
                  alert(language === 'es' 
                    ? `No hay WhatsApp para ${opponentDisplayName}` 
                    : `No WhatsApp for ${opponentDisplayName}`)
                }
              }}
              className={`${
                opponent?.whatsapp 
                  ? 'bg-green-500 hover:bg-green-600' 
                  : 'bg-gray-400'
              } text-white px-2 py-1.5 rounded text-[10px] font-medium transition-all flex items-center justify-center gap-1`}
            >
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.487"/>
              </svg>
              WhatsApp
            </button>
            
            <button
              onClick={(e) => {
                e.stopPropagation()
                onResult && onResult(match)
              }}
              className="bg-purple-500 text-white px-2 py-1.5 rounded text-[10px] font-medium hover:bg-purple-600 transition-all flex items-center justify-center gap-1"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {language === 'es' ? 'Resultado' : 'Result'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}