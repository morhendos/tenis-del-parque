import { useState } from 'react'

export default function MatchCard({ 
  match, 
  player, 
  language, 
  onSchedule, 
  onResult,
  onWhatsApp,
  isUpcoming = true,
  showActions = true,
  isPublic = false,
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
        weekday: 'long',
        month: 'long',
        day: 'numeric'
      })
    }
  }

  const opponent = getOpponent()
  const result = getMatchResult()
  const isWinner = result === 'won'

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
  const showDetails = isPublic || isExpanded || !isUpcoming

  // Check if match has been scheduled
  const isScheduled = !!(match.schedule?.confirmedDate || match.schedule?.venue || match.scheduledDate)

  return (
    <div 
      className={`bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all hover:shadow-lg ${className}`}
      onClick={() => !isPublic && showActions && isUpcoming && setIsExpanded(!isExpanded)}
    >
      {/* Match Header */}
      <div className={`p-4 ${
        isPublic || !player
          ? 'bg-gradient-to-r from-gray-50 to-gray-100'
          : isUpcoming 
          ? 'bg-gradient-to-r from-blue-50 to-indigo-50' 
          : isWinner 
          ? 'bg-gradient-to-r from-green-50 to-emerald-50' 
          : 'bg-gradient-to-r from-red-50 to-pink-50'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-md ${
              isPublic || !player
                ? 'bg-gradient-to-br from-gray-400 to-gray-600'
                : isUpcoming 
                ? 'bg-gradient-to-br from-parque-purple to-purple-700' 
                : isWinner 
                ? 'bg-gradient-to-br from-green-500 to-emerald-600' 
                : 'bg-gradient-to-br from-red-500 to-pink-600'
            }`}>
              <span className="text-white font-bold text-lg">
                {match.round}
              </span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">
                {language === 'es' ? 'Ronda' : 'Round'} {match.round}
              </h3>
              <div className="text-sm text-gray-700 font-medium mt-1">
                {isPublic || !player ? (
                  // Public view: show both players equally
                  <>
                    <span className="text-gray-900">
                      {match.players?.player1?.name || 'TBD'}
                    </span>
                    <span className="mx-2 text-gray-500">vs</span>
                    <span className="text-gray-900">
                      {match.players?.player2?.name || 'TBD'}
                    </span>
                  </>
                ) : (
                  // Player view: highlight player vs opponent
                  <>
                    <span className={isUpcoming ? 'text-parque-purple' : isWinner ? 'text-green-600' : 'text-red-600'}>
                      {player?.name || 'You'}
                    </span>
                    <span className="mx-2 text-gray-500">vs</span>
                    <span className={!isUpcoming && !isWinner ? 'text-green-600' : 'text-gray-900'}>
                      {opponent?.name || 'TBD'}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
          {!isUpcoming && !isPublic && player && (
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">
                {myScore !== undefined ? `${myScore} - ${opponentScore}` : 'N/A'}
              </div>
              <div className={`text-sm font-medium flex items-center justify-end gap-1 ${
                isWinner ? 'text-green-600' : 'text-red-600'
              }`}>
                {isWinner ? (
                  <>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    {language === 'es' ? 'Victoria' : 'Win'}
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    {language === 'es' ? 'Derrota' : 'Loss'}
                  </>
                )}
              </div>
            </div>
          )}
          {isUpcoming && showActions && !isPublic && (
            <svg 
              className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          )}
        </div>
      </div>

      {/* Match Details - Show when expanded or for completed matches or public view */}
      {showDetails && (
        <div className="p-4">
          {/* Schedule information for upcoming matches */}
          {isUpcoming && isScheduled ? (
            <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center">
                  <span className="text-lg">✓</span>
                </div>
                <div>
                  <div className="font-semibold text-green-800">
                    {language === 'es' ? 'Partido Confirmado' : 'Match Confirmed'}
                  </div>
                  <div className="text-sm text-green-600">
                    {language === 'es' ? 'Fecha y hora acordadas' : 'Date and time agreed'}
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                {(match.schedule?.confirmedDate || match.scheduledDate) && (
                  <div className="flex items-center space-x-2 bg-white rounded-lg p-3">
                    <span className="text-xl">📅</span>
                    <div>
                      <p className="font-medium text-gray-900">
                        {formatDateForDisplay(match.schedule?.confirmedDate || match.scheduledDate)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(match.schedule?.confirmedDate || match.scheduledDate).toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                )}
                
                {match.schedule?.time && (
                  <div className="flex items-center space-x-2 bg-white rounded-lg p-3">
                    <span className="text-xl">🕐</span>
                    <div>
                      <p className="font-medium text-gray-900">
                        {match.schedule.time}
                      </p>
                      <p className="text-xs text-gray-500">
                        {language === 'es' ? 'Hora' : 'Time'}
                      </p>
                    </div>
                  </div>
                )}
                
                {(match.schedule?.venue || match.schedule?.club) && (
                  <div className="flex items-center space-x-2 bg-white rounded-lg p-3">
                    <span className="text-xl">🏟️</span>
                    <div>
                      <p className="font-medium text-gray-900">
                        {match.schedule.venue || match.schedule.club}
                      </p>
                      <p className="text-xs text-gray-500">
                        {language === 'es' ? 'Lugar' : 'Venue'}
                      </p>
                    </div>
                  </div>
                )}
                
                {(match.schedule?.court || match.schedule?.courtNumber) && (
                  <div className="flex items-center space-x-2 bg-white rounded-lg p-3">
                    <span className="text-xl">🎾</span>
                    <div>
                      <p className="font-medium text-gray-900">
                        {match.schedule.court || `${language === 'es' ? 'Pista' : 'Court'} ${match.schedule.courtNumber || ''}`}
                      </p>
                      <p className="text-xs text-gray-500">
                        {language === 'es' ? 'Pista' : 'Court'}
                      </p>
                    </div>
                  </div>
                )}
                
                {/* Display notes if they exist */}
                {match.schedule?.notes && (
                  <div className="flex items-start space-x-2 bg-white rounded-lg p-3 col-span-full">
                    <span className="text-xl">📝</span>
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 mb-1">
                        {language === 'es' ? 'Notas' : 'Notes'}
                      </p>
                      <p className="text-sm text-gray-700">
                        {match.schedule.notes}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : isUpcoming && match.schedule?.deadline ? (
            <div className="mb-4 bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-amber-500 text-white flex items-center justify-center">
                  <span className="text-lg">⏰</span>
                </div>
                <div>
                  <div className="font-semibold text-amber-800">
                    {language === 'es' ? 'Pendiente de Confirmación' : 'Pending Confirmation'}
                  </div>
                  <div className="text-sm text-amber-600">
                    {language === 'es' ? 'Fecha límite: ' : 'Deadline: '}
                    {formatDateForDisplay(match.schedule.deadline)}
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          {/* Set details for completed matches */}
          {!isUpcoming && match.result?.score?.sets && !isPublic && player && (
            <div className="bg-gray-50 rounded-lg p-3">
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                {language === 'es' ? 'Detalle de Sets' : 'Set Details'}
              </h4>
              <div className="flex gap-3 overflow-x-auto">
                {match.result.score.sets.map((set, index) => {
                  const isPlayer1 = match.players.player1._id === player._id
                  const mySetScore = isPlayer1 ? set.player1 : set.player2
                  const oppSetScore = isPlayer1 ? set.player2 : set.player1
                  const wonSet = mySetScore > oppSetScore
                  
                  return (
                    <div 
                      key={index} 
                      className={`flex-shrink-0 text-center p-2 rounded-lg ${
                        wonSet ? 'bg-green-100' : 'bg-red-100'
                      }`}
                    >
                      <div className="text-lg font-bold">
                        {mySetScore}-{oppSetScore}
                      </div>
                      <div className="text-xs text-gray-600">
                        Set {index + 1}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Action buttons for upcoming matches - Only show for logged in players */}
          {isUpcoming && showActions && isExpanded && !isPublic && (
            <div className={`grid ${isScheduled ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-1 sm:grid-cols-3'} gap-3 mt-4`}>
              {/* Schedule/Reschedule button */}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onSchedule && onSchedule(match, isScheduled) // Pass true if already scheduled
                }}
                className={`${
                  isScheduled 
                    ? 'bg-orange-500 hover:bg-orange-600' 
                    : 'bg-blue-500 hover:bg-blue-600'
                } text-white px-4 py-3 rounded-xl text-sm font-medium transition-all transform hover:scale-105 active:scale-95 shadow-sm flex items-center justify-center`}
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {isScheduled 
                  ? (language === 'es' ? 'Reprogramar' : 'Reschedule')
                  : (language === 'es' ? 'Programar' : 'Schedule')}
              </button>
              
              {/* WHATSAPP BUTTON - ALWAYS VISIBLE */}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  if (opponent?.whatsapp) {
                    onWhatsApp && onWhatsApp(match, opponent)
                  } else {
                    alert(language === 'es' 
                      ? `No hay número de WhatsApp disponible para ${opponent?.name || 'este jugador'}` 
                      : `No WhatsApp number available for ${opponent?.name || 'this player'}`)
                  }
                }}
                className={`${
                  opponent?.whatsapp 
                    ? 'bg-green-500 hover:bg-green-600' 
                    : 'bg-gray-400 cursor-not-allowed'
                } text-white px-4 py-3 rounded-xl text-sm font-medium transition-all shadow-sm flex items-center justify-center`}
              >
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.487"/>
                </svg>
                {language === 'es' ? 'WhatsApp' : 'WhatsApp'}
              </button>
              
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onResult && onResult(match)
                }}
                className="bg-purple-500 text-white px-4 py-3 rounded-xl text-sm font-medium hover:bg-purple-600 transition-all transform hover:scale-105 active:scale-95 shadow-sm flex items-center justify-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {language === 'es' ? 'Resultado' : 'Result'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}