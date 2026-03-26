import { formatPlayerNameForPublic, formatOpponentName } from '@/lib/utils/playerNameUtils'

export default function MatchCard({ 
  match, 
  player, 
  language, 
  onSchedule, 
  onResult,
  onWhatsApp,
  onUnschedule,
  onExtend,
  extensionsRemaining = 3,
  isUpcoming = true,
  showActions = true,
  isPublic = false,
  showLeagueBadge = false,
  openRankData = {},
  className = ''
}) {
  
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

  const getDeadlineStatus = () => {
    const deadline = match.schedule?.deadline
    if (!deadline) return null
    
    const now = new Date()
    const deadlineDate = new Date(deadline)
    const diffMs = deadlineDate - now
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    
    if (diffMs < 0) {
      const overdueDays = Math.abs(diffDays)
      return {
        status: 'overdue',
        text: language === 'es' 
          ? 'Vencido hace ' + overdueDays + ' d\u00eda' + (overdueDays !== 1 ? 's' : '')
          : 'Overdue by ' + overdueDays + ' day' + (overdueDays !== 1 ? 's' : ''),
        shortText: language === 'es' ? 'Vencido' : 'Overdue',
        color: 'red', urgent: true, daysRemaining: -overdueDays
      }
    } else if (diffDays === 0) {
      return {
        status: 'critical',
        text: language === 'es' 
          ? diffHours + ' hora' + (diffHours !== 1 ? 's' : '') + ' restante' + (diffHours !== 1 ? 's' : '')
          : diffHours + ' hour' + (diffHours !== 1 ? 's' : '') + ' left',
        shortText: diffHours + 'h',
        color: 'red', urgent: true, daysRemaining: 0
      }
    } else if (diffDays <= 2) {
      return {
        status: 'warning',
        text: language === 'es' 
          ? diffDays + ' d\u00eda' + (diffDays !== 1 ? 's' : '') + ' restante' + (diffDays !== 1 ? 's' : '')
          : diffDays + ' day' + (diffDays !== 1 ? 's' : '') + ' left',
        shortText: diffDays + 'd',
        color: 'orange', urgent: true, daysRemaining: diffDays
      }
    } else if (diffDays <= 5) {
      return {
        status: 'soon',
        text: language === 'es' ? diffDays + ' d\u00edas restantes' : diffDays + ' days left',
        shortText: diffDays + 'd',
        color: 'yellow', urgent: false, daysRemaining: diffDays
      }
    } else {
      return {
        status: 'ok',
        text: language === 'es' ? diffDays + ' d\u00edas restantes' : diffDays + ' days left',
        shortText: diffDays + 'd',
        color: 'gray', urgent: false, daysRemaining: diffDays
      }
    }
  }

  const handleExtend = (e) => {
    e.stopPropagation()
    if (extensionsRemaining <= 0) return
    onExtend && onExtend(match)
  }

  const formatDateForDisplay = (date) => {
    if (!date) return null
    const dateObj = new Date(date)
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(today.getDate() + 1)
    
    if (dateObj.toDateString() === today.toDateString()) return language === 'es' ? 'Hoy' : 'Today'
    if (dateObj.toDateString() === tomorrow.toDateString()) return language === 'es' ? 'Ma\u00f1ana' : 'Tomorrow'
    return dateObj.toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US', { weekday: 'short', month: 'short', day: 'numeric' })
  }

  const getInitials = (name) => {
    if (!name) return '?'
    const parts = name.split(' ')
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
    return name.substring(0, 2).toUpperCase()
  }

  const getMatchTitle = () => {
    if (match.matchType === 'playoff' && match.playoffInfo?.stage) {
      const stageNames = {
        quarterfinal: language === 'es' ? 'Cuartos' : 'Quarters',
        semifinal: language === 'es' ? 'Semifinal' : 'Semifinal', 
        final: 'Final',
        third_place: language === 'es' ? '3er Puesto' : '3rd Place'
      }
      return stageNames[match.playoffInfo.stage] || ('R' + match.round)
    }
    return (language === 'es' ? 'Ronda ' : 'Round ') + match.round
  }

  const opponent = getOpponent()
  const result = getMatchResult()
  const isWinner = result === 'won'
  const isCancelled = match.status === 'cancelled' || (!match.result?.winner && match.schedule?.deadline && new Date(match.schedule.deadline) < new Date())
  const isScheduled = !!(match.schedule?.confirmedDate || match.schedule?.venue || match.scheduledDate)
  const deadlineStatus = getDeadlineStatus()

  // Score calculation for completed matches
  let myScore, opponentScore, setScores = []
  if (!isUpcoming && player) {
    const isPlayer1 = match.players.player1._id === player._id
    if (match.result?.score?.walkover) {
      const winnerId = match.result?.winner?._id || match.result?.winner
      const playerWon = (isPlayer1 && winnerId === match.players.player1._id) || (!isPlayer1 && winnerId === match.players.player2._id)
      myScore = playerWon ? 2 : 0
      opponentScore = playerWon ? 0 : 2
    } else if (match.result?.score?.sets) {
      myScore = 0
      opponentScore = 0
      match.result.score.sets.forEach(set => {
        const my = isPlayer1 ? set.player1 : set.player2
        const opp = isPlayer1 ? set.player2 : set.player1
        if (my > opp) myScore++
        else opponentScore++
        setScores.push({ my, opp, won: my > opp })
      })
    }
  }

  // Avatar colors based on state
  const avatarStyle = isUpcoming
    ? { bg: 'bg-purple-50', text: 'text-purple-600' }
    : isCancelled
    ? { bg: 'bg-gray-100', text: 'text-gray-400' }
    : isWinner
    ? { bg: 'bg-green-50', text: 'text-green-600' }
    : { bg: 'bg-red-50', text: 'text-red-500' }

  // Round pill colors
  const pillStyle = isUpcoming
    ? 'bg-purple-50 text-purple-700'
    : isCancelled
    ? 'bg-gray-100 text-gray-500'
    : isWinner
    ? 'bg-green-50 text-green-700'
    : 'bg-red-50 text-red-600'

  return (
    <div className={'bg-white rounded-xl border border-gray-100 overflow-hidden transition-all ' + (isCancelled && !isUpcoming ? 'opacity-60 ' : '') + (!isUpcoming && !isCancelled ? (isWinner ? 'border-l-[3px] border-l-green-500 ' : 'border-l-[3px] border-l-red-400 ') : '') + className}>
      
      {/* Top row: Round pill + league + deadline/score */}
      <div className="flex items-center justify-between px-4 pt-3">
        <div className="flex items-center gap-1.5">
          <span className={'text-[11px] font-medium px-2 py-0.5 rounded-full ' + pillStyle}>
            {getMatchTitle()}
          </span>
          {showLeagueBadge && match.league && (
            <span className="text-[11px] text-gray-400">
              {match.league.name}
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-1.5">
          {/* Upcoming: show deadline or scheduled date */}
          {isUpcoming && isScheduled && (
            <span className="text-[11px] text-green-600 font-medium flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path d="M9 12l2 2 4-4" /></svg>
              {formatDateForDisplay(match.schedule?.confirmedDate || match.scheduledDate)}
              {match.schedule?.time && (' \u00b7 ' + match.schedule.time)}
            </span>
          )}
          {isUpcoming && !isScheduled && deadlineStatus && (
            <span className={'text-[11px] font-medium flex items-center gap-1 ' + (
              deadlineStatus.color === 'red' ? 'text-red-500' :
              deadlineStatus.color === 'orange' ? 'text-orange-500' :
              'text-gray-400'
            )}>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
              {deadlineStatus.text}
            </span>
          )}
          
          {/* Completed: show result */}
          {!isUpcoming && !isCancelled && myScore !== undefined && (
            <div className="flex items-center gap-1.5">
              <span className={'text-[11px] font-medium px-2 py-0.5 rounded-full ' + (isWinner ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600')}>
                {isWinner ? (language === 'es' ? 'Victoria' : 'Win') : (language === 'es' ? 'Derrota' : 'Loss')}
              </span>
              <span className="text-sm font-semibold text-gray-900">{myScore}-{opponentScore}</span>
            </div>
          )}
          
          {/* Cancelled */}
          {!isUpcoming && isCancelled && (
            <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-amber-50 text-amber-700">
              {language === 'es' ? 'No jugado' : 'Not played'}
            </span>
          )}
        </div>
      </div>

      {/* Center: Avatar + both player names */}
      <div className="px-4 py-3">
        <div className="flex items-center gap-3">
          {/* Opponent avatar */}
          <div className={'w-10 h-10 rounded-full flex items-center justify-center font-medium text-sm flex-shrink-0 ' + avatarStyle.bg + ' ' + avatarStyle.text}>
            {getInitials(opponent?.name)}
          </div>
          
          <div className="flex-1 min-w-0">
            {isPublic || !player ? (
              /* Public view */
              <div className="flex items-center gap-1 text-[15px] font-medium text-gray-900">
                <span className="truncate">{match.players?.player1?.name ? formatPlayerNameForPublic(match.players.player1.name) : 'TBD'}</span>
                <span className="text-gray-300 mx-0.5">vs</span>
                <span className="truncate">{match.players?.player2?.name ? formatPlayerNameForPublic(match.players.player2.name) : 'TBD'}</span>
              </div>
            ) : (
              /* Player view - both names same size */
              <>
                <div className="flex items-baseline gap-1.5 flex-wrap">
                  <span className={'text-[15px] font-medium ' + (isCancelled ? 'text-gray-400' : 'text-gray-900')}>
                    {opponent?.name ? formatOpponentName(opponent.name, language) : 'TBD'}
                  </span>
                  {isUpcoming && opponent?._id && openRankData[opponent._id] && (
                    <span className="text-[11px] font-medium text-amber-600">[{openRankData[opponent._id]}]</span>
                  )}
                </div>
                <div className="flex items-baseline gap-1.5 mt-0.5">
                  <span className={'text-[15px] ' + (isCancelled ? 'text-gray-300' : 'text-gray-500')}>
                    vs {player?.name || 'You'}
                  </span>
                  {isUpcoming && player?._id && openRankData[player._id] && (
                    <span className="text-[11px] font-medium text-amber-600">[{openRankData[player._id]}]</span>
                  )}
                </div>
              </>
            )}
            
            {/* Set scores for completed matches */}
            {!isUpcoming && !isCancelled && setScores.length > 0 && (
              <div className="flex items-center gap-1.5 mt-2">
                {match.result?.score?.walkover ? (
                  <span className="text-[11px] font-medium px-1.5 py-0.5 rounded bg-amber-50 text-amber-700">W/O</span>
                ) : (
                  setScores.map((s, i) => (
                    <span key={i} className={'text-[11px] font-medium px-1.5 py-0.5 rounded ' + (s.won ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600')}>
                      {s.my}-{s.opp}
                    </span>
                  ))
                )}
              </div>
            )}
            
            {/* Cancelled subtitle */}
            {!isUpcoming && isCancelled && (
              <div className="text-[11px] text-amber-600 mt-1">
                {match.status === 'cancelled'
                  ? (language === 'es' ? 'Cancelado' : 'Cancelled')
                  : (language === 'es' ? 'Plazo vencido' : 'Deadline passed')}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Scheduled match venue info */}
      {isUpcoming && isScheduled && (match.schedule?.venue || match.schedule?.club) && (
        <div className="px-4 pb-2 -mt-1">
          <span className="text-[11px] text-gray-400">
            {match.schedule.venue || match.schedule.club}
            {match.schedule?.notes && (' \u00b7 ' + match.schedule.notes)}
          </span>
        </div>
      )}

      {/* Extension button for urgent deadlines */}
      {isUpcoming && !isScheduled && deadlineStatus?.urgent && onExtend && extensionsRemaining > 0 && (
        <div className="px-4 pb-2">
          <button
            onClick={handleExtend}
            className={'w-full text-[11px] font-medium px-3 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ' + (
              deadlineStatus.color === 'red' 
                ? 'bg-red-50 text-red-600 hover:bg-red-100' 
                : 'bg-orange-50 text-orange-600 hover:bg-orange-100'
            )}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2m6-2a10 10 0 11-20 0 10 10 0 0120 0z" />
            </svg>
            {language === 'es' ? 'Ampliar plazo +7d' : 'Extend +7 days'}
            <span className="opacity-60">{extensionsRemaining} {language === 'es' ? 'disp.' : 'left'}</span>
          </button>
        </div>
      )}

      {/* Action buttons - clean toolbar */}
      {isUpcoming && showActions && !isPublic && (
        <div className="grid grid-cols-3 border-t border-gray-100">
          <button
            onClick={(e) => { e.stopPropagation(); onSchedule && onSchedule(match, isScheduled) }}
            className={'flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium border-r border-gray-100 transition-colors ' + (
              isScheduled ? 'text-amber-600 hover:bg-amber-50' : 'text-purple-600 hover:bg-purple-50'
            )}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            {isScheduled ? (language === 'es' ? 'Cambiar' : 'Change') : (language === 'es' ? 'Fecha' : 'Schedule')}
          </button>
          
          <button
            onClick={(e) => {
              e.stopPropagation()
              if (opponent?.whatsapp) { onWhatsApp && onWhatsApp(match, opponent) }
              else {
                const name = opponent?.name ? formatOpponentName(opponent.name, language) : (language === 'es' ? 'este jugador' : 'this player')
                alert(language === 'es' ? 'No hay WhatsApp para ' + name : 'No WhatsApp for ' + name)
              }
            }}
            className={'flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium border-r border-gray-100 transition-colors ' + (
              opponent?.whatsapp ? 'text-green-600 hover:bg-green-50' : 'text-gray-400'
            )}
          >
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.487" />
            </svg>
            WhatsApp
          </button>
          
          <button
            onClick={(e) => { e.stopPropagation(); onResult && onResult(match) }}
            className="flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium text-gray-500 hover:bg-gray-50 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {language === 'es' ? 'Resultado' : 'Result'}
          </button>
        </div>
      )}
    </div>
  )
}
