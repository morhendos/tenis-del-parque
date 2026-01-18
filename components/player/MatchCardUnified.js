import { formatOpponentName } from '@/lib/utils/playerNameUtils'

/**
 * Unified match card component for both completed and unplayed matches
 * Tennis broadcast-style presentation with purple theme
 */
export default function MatchCardUnified({ 
  match, 
  player = null,
  language = 'es',
  onSchedule,
  onResult,
  onWhatsApp,
  onUnschedule,
  onExtend,
  onTapCompleted,
  extensionsRemaining = 3,
  isPublic = false,
  className = ''
}) {

  // Determine match state
  const isCompleted = match.status === 'completed' || match.result?.winner
  const hasSets = match.result?.score?.sets?.length > 0

  // Get player data
  const player1 = match.players?.player1
  const player2 = match.players?.player2
  const winnerId = match.result?.winner?._id || match.result?.winner

  const isPlayer1Winner = winnerId && (winnerId === player1?._id || winnerId.toString() === player1?._id?.toString())
  const isPlayer2Winner = winnerId && (winnerId === player2?._id || winnerId.toString() === player2?._id?.toString())

  // Check if current user is in this match
  const isPlayerMatch = player && (
    player._id === player1?._id || 
    player._id === player2?._id ||
    player._id?.toString() === player1?._id?.toString() ||
    player._id?.toString() === player2?._id?.toString()
  )

  const isCurrentUserPlayer1 = player && (player._id === player1?._id || player._id?.toString() === player1?._id?.toString())

  // Format name as "First L."
  const formatName = (name) => {
    if (!name) return 'TBD'
    const parts = name.trim().split(' ')
    if (parts.length === 1) return parts[0]
    const firstName = parts[0]
    const lastInitial = parts[parts.length - 1][0]
    return `${firstName} ${lastInitial}.`
  }

  // Get opponent for WhatsApp
  const getOpponent = () => {
    if (!player) return null
    return isCurrentUserPlayer1 ? player2 : player1
  }

  // Calculate deadline status
  const getDeadlineStatus = () => {
    const deadline = match.schedule?.deadline
    if (!deadline) return null
    
    const now = new Date()
    const deadlineDate = new Date(deadline)
    const diffMs = deadlineDate - now
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffMinutes = Math.floor(diffMs / (1000 * 60))
    
    if (diffMs < 0) {
      const overdueDays = Math.abs(diffDays)
      return {
        status: 'overdue',
        text: language === 'es' ? 'Vencido' : 'Overdue',
        shortText: `-${overdueDays}d`,
        color: 'red',
        urgent: true
      }
    } else if (diffHours < 1) {
      // Less than 1 hour - show minutes
      return {
        status: 'critical',
        text: `${diffMinutes}m`,
        shortText: `${diffMinutes}m`,
        color: 'red',
        urgent: true
      }
    } else if (diffDays === 0) {
      return {
        status: 'critical',
        text: `${diffHours}h`,
        shortText: `${diffHours}h`,
        color: 'red',
        urgent: true
      }
    } else if (diffDays <= 2) {
      return {
        status: 'warning',
        text: `${diffDays}d`,
        shortText: `${diffDays}d`,
        color: 'orange',
        urgent: true
      }
    } else if (diffDays <= 3) {
      return {
        status: 'soon',
        text: `${diffDays}d`,
        shortText: `${diffDays}d`,
        color: 'yellow',
        urgent: false
      }
    } else {
      return {
        status: 'ok',
        text: `${diffDays}d`,
        shortText: `${diffDays}d`,
        color: 'gray',
        urgent: false
      }
    }
  }

  // Check if match is scheduled
  const isScheduled = !!(match.schedule?.confirmedDate || match.scheduledDate)

  // Format scheduled date
  const formatScheduledDate = () => {
    const date = match.schedule?.confirmedDate || match.scheduledDate
    if (!date) return null
    
    const dateObj = new Date(date)
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(today.getDate() + 1)
    
    if (dateObj.toDateString() === today.toDateString()) {
      return language === 'es' ? 'Hoy' : 'Today'
    } else if (dateObj.toDateString() === tomorrow.toDateString()) {
      return language === 'es' ? 'Mañana' : 'Tomorrow'
    } else {
      return dateObj.toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US', {
        day: 'numeric',
        month: 'short'
      })
    }
  }

  // Format played date for completed matches
  const formatPlayedDate = () => {
    const date = match.result?.playedAt || match.schedule?.confirmedDate
    if (!date) return null
    return new Date(date).toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US', {
      day: 'numeric',
      month: 'short'
    })
  }

  const deadlineStatus = getDeadlineStatus()
  
  // Check if match is "virtually cancelled" (deadline passed + not scheduled + not completed)
  const isVirtuallyCancelled = !isCompleted && !isScheduled && deadlineStatus?.status === 'overdue'
  
  // Don't show actions for completed or virtually cancelled matches
  const showActions = isPlayerMatch && !isPublic && !isCompleted && !isVirtuallyCancelled

  // Render player row
  const renderPlayerRow = (playerData, isWinner, isFirst) => {
    const isCurrentUser = player && (
      playerData?._id === player._id || 
      playerData?._id?.toString() === player._id?.toString()
    )

    return (
      <div className={`flex items-center px-3 py-2.5 ${
        isFirst ? 'border-b border-gray-100' : ''
      } ${
        isCompleted && isWinner ? 'bg-purple-50' : 'bg-white'
      } ${
        isVirtuallyCancelled ? 'bg-gray-50' : ''
      }`}>
        {/* Winner indicator or cancelled X */}
        <div className="w-5 flex-shrink-0">
          {isCompleted && isWinner && (
            <div className="w-2 h-2 rounded-full bg-yellow-500" />
          )}
          {isVirtuallyCancelled && isFirst && (
            <svg className="w-3.5 h-3.5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
        </div>
        
        {/* Player name */}
        <div className="flex-1 min-w-0">
          <span className={`font-semibold text-sm truncate block ${
            isVirtuallyCancelled ? 'text-gray-400 line-through' : 'text-gray-800'
          }`}>
            {formatName(playerData?.name)}
          </span>
        </div>

        {/* Scores or placeholder */}
        <div className="flex items-center ml-3">
          {isCompleted && hasSets ? (
            match.result.score.sets.map((set, idx) => {
              const score = isFirst ? set.player1 : set.player2
              const opponentScore = isFirst ? set.player2 : set.player1
              const wonSet = score > opponentScore

              return (
                <span 
                  key={idx} 
                  className={`text-sm font-bold tabular-nums w-8 text-center ${
                    wonSet ? 'text-gray-900' : 'text-gray-500'
                  }`}
                >
                  {score}
                </span>
              )
            })
          ) : (
            <span className="text-gray-300 text-sm">-</span>
          )}
        </div>
      </div>
    )
  }

  // Check if card should be tappable (completed player match)
  const isTappable = isCompleted && isPlayerMatch && !isPublic && onTapCompleted

  // Handle card tap
  const handleCardTap = () => {
    if (isTappable) {
      // Determine if current player won
      const currentPlayerIsPlayer1 = player && (
        player._id === player1?._id || 
        player._id?.toString() === player1?._id?.toString()
      )
      const playerWon = currentPlayerIsPlayer1 ? isPlayer1Winner : isPlayer2Winner
      onTapCompleted(match, playerWon)
    }
  }

  return (
    <div 
      onClick={handleCardTap}
      className={`rounded-xl overflow-hidden shadow-sm border transition-all ${
        isVirtuallyCancelled ? 'border-red-200 opacity-75' : 'border-gray-200'
      } ${
        isPlayerMatch && !isPublic && !isVirtuallyCancelled ? 'ring-2 ring-yellow-400/60 ring-offset-1' : ''
      } ${
        isTappable ? 'cursor-pointer active:scale-[0.99]' : ''
      } ${className}`}
    >
      {/* Header */}
      <div className={`px-3 py-1.5 flex items-center justify-between ${
        isVirtuallyCancelled 
          ? 'bg-gradient-to-r from-red-500 to-red-600' 
          : 'bg-gradient-to-r from-parque-purple to-purple-600'
      }`}>
        {/* Left side: status info */}
        <div className="flex items-center gap-1">
          {/* Playoff stage name */}
          {match.matchType === 'playoff' && match.playoffInfo?.stage && (
            <span className="text-xs font-semibold text-white/90 uppercase tracking-wide mr-2">
              {(() => {
                const stageNames = {
                  quarterfinal: language === 'es' ? 'Cuartos' : 'Quarters',
                  semifinal: language === 'es' ? 'Semifinal' : 'Semifinal',
                  final: language === 'es' ? 'Final' : 'Final',
                  third_place: language === 'es' ? '3er Puesto' : '3rd Place'
                }
                return stageNames[match.playoffInfo.stage] || ''
              })()}
              {' · '}
            </span>
          )}
          
          {!isCompleted && isScheduled && (
            <>
              <svg className="w-3.5 h-3.5 text-white/90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-xs font-medium text-white/90">
                {formatScheduledDate()}
                {match.schedule?.time && ` · ${match.schedule.time}`}
                {(match.schedule?.club || match.schedule?.venue) && ` · ${match.schedule.club || match.schedule.venue}`}
              </span>
            </>
          )}
          
          {/* Virtually cancelled - show cancelled status */}
          {isVirtuallyCancelled && (
            <>
              <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span className="text-xs font-medium text-white">
                {language === 'es' ? 'Cancelado - Plazo para programar vencido' : 'Cancelled - Deadline to schedule passed'}
              </span>
            </>
          )}
          
          {!isCompleted && !isScheduled && !isVirtuallyCancelled && deadlineStatus && (
            <>
              <svg className={`w-3.5 h-3.5 ${deadlineStatus.urgent ? 'text-red-300' : 'text-white/90'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className={`text-xs font-medium ${deadlineStatus.urgent ? 'text-red-300' : 'text-white/90'}`}>
                {language === 'es' ? 'Límite' : 'Deadline'}: {deadlineStatus.shortText}
              </span>
            </>
          )}
          
          {isCompleted && (
            <span className="text-xs font-medium text-white/90">
              {formatPlayedDate()}
            </span>
          )}
        </div>
        
        {/* Right side: score column headers for completed matches */}
        {isCompleted && hasSets && (
          <div className="flex items-center ml-3">
            {match.result.score.sets.map((set, idx) => {
              const isLastSet = idx === match.result.score.sets.length - 1
              const isSuperTiebreak = isLastSet && match.result.score.sets.length > 2
              
              return (
                <span 
                  key={idx} 
                  className="text-[10px] font-medium text-white/60 w-8 text-center"
                >
                  {isSuperTiebreak ? 'ST' : `S${idx + 1}`}
                </span>
              )
            })}
          </div>
        )}
      </div>

      {/* Player rows */}
      {renderPlayerRow(player1, isPlayer1Winner, true)}
      {renderPlayerRow(player2, isPlayer2Winner, false)}

      {/* Actions for unplayed matches - always visible */}
      {showActions && (
        <div className="bg-gray-50 px-3 py-3 space-y-2 border-t border-gray-100">
            {/* Deadline extension option */}
            {!isScheduled && deadlineStatus && deadlineStatus.urgent && extensionsRemaining > 0 && onExtend && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onExtend(match)
                }}
                className="w-full text-xs bg-blue-100 text-blue-700 hover:bg-blue-200 py-2.5 rounded-lg transition-colors font-medium flex items-center justify-center gap-1.5"
              >
                <span style={{ fontSize: '1.4rem' }}>⏱</span>
                {language === 'es' 
                  ? `Ampliar plazo 7 días (${extensionsRemaining} disponibles)` 
                  : `Extend deadline by 7 days (${extensionsRemaining} left)`}
              </button>
            )}
            
            {/* Action buttons */}
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onSchedule && onSchedule(match, isScheduled)
                }}
                className={`${
                  isScheduled 
                    ? 'bg-orange-100 text-orange-700 hover:bg-orange-200' 
                    : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                } py-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1`}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {isScheduled 
                  ? (language === 'es' ? 'Cambiar' : 'Change')
                  : (language === 'es' ? 'Fecha' : 'Schedule')}
              </button>
              
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  const opponent = getOpponent()
                  if (opponent?.whatsapp) {
                    onWhatsApp && onWhatsApp(match, opponent)
                  } else {
                    alert(language === 'es' 
                      ? `No hay WhatsApp disponible` 
                      : `No WhatsApp available`)
                  }
                }}
                className="bg-green-100 text-green-700 hover:bg-green-200 py-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1"
              >
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.487"/>
                </svg>
                WhatsApp
              </button>
              
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onResult && onResult(match)
                }}
                className="bg-purple-100 text-purple-700 hover:bg-purple-200 py-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
