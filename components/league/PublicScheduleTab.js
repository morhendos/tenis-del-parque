import React, { useState, useMemo } from 'react'

export default function PublicScheduleTab({ schedule, language, totalRounds = 8 }) {
  const [currentRound, setCurrentRound] = useState(1)

  // Filter out any matches that have results (defensive programming for data inconsistencies)
  const upcomingSchedule = schedule?.filter(match => !match.result?.winner) || []

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

  const getCurrentRoundMatches = () => {
    return upcomingSchedule.filter(match => match.round === currentRound)
  }

  const getAvailableRounds = () => {
    const roundsWithMatches = [...new Set(upcomingSchedule.map(match => match.round))].sort((a, b) => a - b)
    const allRounds = Array.from({ length: totalRounds }, (_, i) => i + 1)
    return allRounds.map(round => ({
      round,
      hasMatches: roundsWithMatches.includes(round),
      matchCount: upcomingSchedule.filter(match => match.round === round).length
    }))
  }

  const currentRoundMatches = getCurrentRoundMatches()
  const hasMatchesInRound = currentRoundMatches.length > 0

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl md:text-2xl font-bold text-parque-purple">
          {language === 'es' ? 'Calendario de Partidos' : 'Match Schedule'}
        </h2>
        <div className="text-sm text-gray-600">
          {language === 'es' ? 'Ronda' : 'Round'} {currentRound} {language === 'es' ? 'de' : 'of'} {totalRounds}
        </div>
      </div>
      
      {/* Round Navigation */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">
            {language === 'es' ? 'Seleccionar Ronda' : 'Select Round'}
          </h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentRound(Math.max(1, currentRound - 1))}
              disabled={currentRound === 1}
              className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              ← {language === 'es' ? 'Anterior' : 'Previous'}
            </button>
            <button
              onClick={() => setCurrentRound(Math.min(totalRounds, currentRound + 1))}
              disabled={currentRound === totalRounds}
              className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {language === 'es' ? 'Siguiente' : 'Next'} →
            </button>
          </div>
        </div>
        
        {/* Round selector pills */}
        <div className="flex flex-wrap gap-2">
          {getAvailableRounds().map(({ round, hasMatches, matchCount }) => (
            <button
              key={round}
              onClick={() => setCurrentRound(round)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 relative ${
                currentRound === round
                  ? 'bg-parque-purple text-white shadow-lg transform scale-105'
                  : hasMatches
                  ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              {language === 'es' ? 'Ronda' : 'Round'} {round}
              {hasMatches && (
                <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {matchCount}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
      
      {/* Current Round Matches */}
      {hasMatchesInRound ? (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-parque-purple to-parque-purple/80 text-white px-6 py-4 rounded-lg">
            <h3 className="text-xl font-bold mb-2">
              {language === 'es' ? 'Ronda' : 'Round'} {currentRound}
            </h3>
            <div className="flex items-center space-x-4 text-sm opacity-90">
              <span>
                {currentRoundMatches.length} {language === 'es' ? 'partidos' : 'matches'}
              </span>
            </div>
          </div>
          
          {/* Matches Grid */}
          <div className="grid gap-4">
            {currentRoundMatches.map((match) => (
              <div 
                key={match._id} 
                className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow"
              >
                {/* Match Players */}
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                    {/* Player 1 */}
                    <div className="text-center md:text-right">
                      <div className="flex items-center justify-center md:justify-end space-x-3">
                        <div className="order-2 md:order-1">
                          <div className="font-bold text-lg text-gray-900">
                            {match.players?.player1?.name || 'TBD'}
                          </div>
                          {match.players?.player1?.level && (
                            <div className="text-sm text-gray-500">
                              {language === 'es' ? 'Nivel' : 'Level'} {match.players.player1.level}
                            </div>
                          )}
                        </div>
                        <div className="order-1 md:order-2 w-12 h-12 rounded-full bg-parque-purple text-white flex items-center justify-center text-lg font-bold">
                          {match.players?.player1?.name?.charAt(0) || '?'}
                        </div>
                      </div>
                    </div>
                    
                    {/* VS Divider */}
                    <div className="text-center my-4 md:my-0">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100">
                        <span className="text-xl font-bold text-gray-600">VS</span>
                      </div>
                    </div>
                    
                    {/* Player 2 */}
                    <div className="text-center md:text-left">
                      <div className="flex items-center justify-center md:justify-start space-x-3">
                        <div className="w-12 h-12 rounded-full bg-parque-purple text-white flex items-center justify-center text-lg font-bold">
                          {match.players?.player2?.name?.charAt(0) || '?'}
                        </div>
                        <div>
                          <div className="font-bold text-lg text-gray-900">
                            {match.players?.player2?.name || 'TBD'}
                          </div>
                          {match.players?.player2?.level && (
                            <div className="text-sm text-gray-500">
                              {language === 'es' ? 'Nivel' : 'Level'} {match.players.player2.level}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Match Details Section */}
                {(match.schedule?.confirmedDate || match.schedule?.deadline) && (
                  <div className="border-t border-gray-100 px-6 py-4 bg-gray-50">
                    {/* Confirmed Match Info */}
                    {match.schedule?.confirmedDate ? (
                      <div>
                        <div className="flex items-center space-x-2 mb-3">
                          <div className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center">
                            <span className="text-xs">✓</span>
                          </div>
                          <span className="font-semibold text-green-700 text-sm">
                            {language === 'es' ? 'Partido Confirmado' : 'Match Confirmed'}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="flex items-start space-x-2">
                            <span className="text-lg mt-0.5">📅</span>
                            <div>
                              <p className="text-xs text-gray-500">
                                {language === 'es' ? 'Fecha' : 'Date'}
                              </p>
                              <p className="font-medium text-gray-800 text-sm">
                                {formatDateForDisplay(match.schedule.confirmedDate)}
                              </p>
                            </div>
                          </div>
                          
                          {match.schedule.time && (
                            <div className="flex items-start space-x-2">
                              <span className="text-lg mt-0.5">🕐</span>
                              <div>
                                <p className="text-xs text-gray-500">
                                  {language === 'es' ? 'Hora' : 'Time'}
                                </p>
                                <p className="font-medium text-gray-800 text-sm">
                                  {match.schedule.time}
                                </p>
                              </div>
                            </div>
                          )}
                          
                          {match.schedule.club && (
                            <div className="flex items-start space-x-2">
                              <span className="text-lg mt-0.5">🏟️</span>
                              <div>
                                <p className="text-xs text-gray-500">
                                  {language === 'es' ? 'Club' : 'Club'}
                                </p>
                                <p className="font-medium text-gray-800 text-sm">
                                  {match.schedule.club}
                                </p>
                              </div>
                            </div>
                          )}
                          
                          {(match.schedule.court || match.schedule.courtNumber) && (
                            <div className="flex items-start space-x-2">
                              <span className="text-lg mt-0.5">🎾</span>
                              <div>
                                <p className="text-xs text-gray-500">
                                  {language === 'es' ? 'Pista' : 'Court'}
                                </p>
                                <p className="font-medium text-gray-800 text-sm">
                                  {match.schedule.court || `${language === 'es' ? 'Pista' : 'Court'} ${match.schedule.courtNumber || ''}`}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      /* Pending Match Info */
                      <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center">
                          <span className="text-xs">⏰</span>
                        </div>
                        <div>
                          <span className="font-semibold text-amber-700 text-sm">
                            {language === 'es' ? 'Pendiente de Confirmación' : 'Pending Confirmation'}
                          </span>
                          <p className="text-xs text-amber-600 mt-0.5">
                            {language === 'es' ? 'Fecha límite: ' : 'Deadline: '}
                            {formatDateForDisplay(match.schedule.deadline)}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">📅</div>
          <h3 className="text-xl font-bold text-gray-700 mb-2">
            {language === 'es' ? 'Ronda' : 'Round'} {currentRound}
          </h3>
          <p className="text-gray-500 mb-6">
            {language === 'es' 
              ? 'No hay partidos programados para esta ronda todavía.'
              : 'No matches scheduled for this round yet.'}
          </p>
          <div className="text-sm text-gray-400">
            {language === 'es' 
              ? 'Los partidos se programarán una vez que se complete la ronda anterior.'
              : 'Matches will be scheduled once the previous round is completed.'}
          </div>
        </div>
      )}
    </div>
  )
}