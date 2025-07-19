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
        weekday: 'short',
        month: 'short',
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
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-parque-purple">
          {language === 'es' ? 'Calendario' : 'Schedule'}
        </h2>
        <div className="text-xs md:text-sm text-gray-600">
          {language === 'es' ? 'R' : 'R'}{currentRound}/{totalRounds}
        </div>
      </div>
      
      {/* Round Navigation - Mobile Optimized */}
      <div className="mb-4 md:mb-8">
        {/* Mobile: Horizontal scroll with compact pills */}
        <div className="md:hidden">
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={() => setCurrentRound(Math.max(1, currentRound - 1))}
              disabled={currentRound === 1}
              className="p-1.5 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <h3 className="text-sm font-semibold text-gray-800">
              {language === 'es' ? 'Ronda' : 'Round'} {currentRound}
            </h3>
            
            <button
              onClick={() => setCurrentRound(Math.min(totalRounds, currentRound + 1))}
              disabled={currentRound === totalRounds}
              className="p-1.5 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          
          <div className="overflow-x-auto -mx-4 px-4">
            <div className="flex gap-1.5 pb-2">
              {getAvailableRounds().map(({ round, hasMatches, matchCount }) => (
                <button
                  key={round}
                  onClick={() => setCurrentRound(round)}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 relative ${
                    currentRound === round
                      ? 'bg-parque-purple text-white shadow-md'
                      : hasMatches
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  R{round}
                  {hasMatches && (
                    <span className="absolute -top-1 -right-1 bg-green-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
                      {matchCount}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        {/* Desktop: Original layout */}
        <div className="hidden md:block">
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
      </div>
      
      {/* Current Round Matches */}
      {hasMatchesInRound ? (
        <div className="space-y-3 md:space-y-4">
          {/* Round Header - More compact on mobile */}
          <div className="bg-gradient-to-r from-parque-purple to-parque-purple/80 text-white px-4 py-3 md:px-6 md:py-4 rounded-lg">
            <h3 className="text-base md:text-xl font-bold">
              {language === 'es' ? 'Ronda' : 'Round'} {currentRound}
            </h3>
            <div className="text-xs md:text-sm opacity-90 mt-1">
              {currentRoundMatches.length} {language === 'es' ? 'partidos' : 'matches'}
            </div>
          </div>
          
          {/* Matches Grid */}
          <div className="space-y-3 md:space-y-4">
            {currentRoundMatches.map((match) => (
              <div 
                key={match._id} 
                className="bg-gradient-to-b from-white to-gray-50 rounded-xl md:rounded-2xl shadow-sm md:shadow-md border border-gray-200 overflow-hidden hover:shadow-md md:hover:shadow-lg transition-all"
              >
                {/* Match Players - Centered Row Layout */}
                <div className="p-4 md:p-6 bg-white">
                  {/* Mobile: Horizontal centered layout */}
                  <div className="flex items-center justify-center space-x-4 md:hidden">
                    {/* Player 1 */}
                    <div className="flex items-center space-x-2">
                      <div className="w-10 h-10 rounded-full bg-parque-purple text-white flex items-center justify-center text-sm font-bold">
                        {match.players?.player1?.name?.charAt(0) || '?'}
                      </div>
                      <div className="font-semibold text-sm text-gray-900">
                        {match.players?.player1?.name?.split(' ')[0] || 'TBD'}
                      </div>
                    </div>
                    
                    {/* VS Badge */}
                    <div className="bg-gray-100 px-3 py-1 rounded-full">
                      <span className="text-xs font-bold text-gray-600">VS</span>
                    </div>
                    
                    {/* Player 2 */}
                    <div className="flex items-center space-x-2">
                      <div className="font-semibold text-sm text-gray-900 text-right">
                        {match.players?.player2?.name?.split(' ')[0] || 'TBD'}
                      </div>
                      <div className="w-10 h-10 rounded-full bg-parque-purple text-white flex items-center justify-center text-sm font-bold">
                        {match.players?.player2?.name?.charAt(0) || '?'}
                      </div>
                    </div>
                  </div>
                  
                  {/* Desktop: Original centered layout */}
                  <div className="hidden md:grid md:grid-cols-3 md:gap-4 md:items-center">
                    {/* Player 1 */}
                    <div className="text-right">
                      <div className="flex items-center justify-end space-x-3">
                        <div className="font-bold text-lg text-gray-900">
                          {match.players?.player1?.name || 'TBD'}
                        </div>
                        <div className="w-12 h-12 rounded-full bg-parque-purple text-white flex items-center justify-center text-lg font-bold">
                          {match.players?.player1?.name?.charAt(0) || '?'}
                        </div>
                      </div>
                    </div>
                    
                    {/* VS Divider */}
                    <div className="text-center">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100">
                        <span className="text-xl font-bold text-gray-600">VS</span>
                      </div>
                    </div>
                    
                    {/* Player 2 */}
                    <div className="text-left">
                      <div className="flex items-center justify-start space-x-3">
                        <div className="w-12 h-12 rounded-full bg-parque-purple text-white flex items-center justify-center text-lg font-bold">
                          {match.players?.player2?.name?.charAt(0) || '?'}
                        </div>
                        <div className="font-bold text-lg text-gray-900">
                          {match.players?.player2?.name || 'TBD'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Match Details Section - Compact on Mobile */}
                {(match.schedule?.confirmedDate || match.schedule?.deadline) && (
                  <div className="border-t border-gray-200 px-4 py-3 md:px-6 md:py-4 bg-gradient-to-r from-gray-50 to-gray-100">
                    {/* Confirmed Match Info */}
                    {match.schedule?.confirmedDate ? (
                      <div>
                        <div className="flex items-center justify-center space-x-2 mb-2 md:mb-3">
                          <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-green-500 text-white flex items-center justify-center">
                            <span className="text-[10px] md:text-xs">✓</span>
                          </div>
                          <span className="font-semibold text-green-700 text-xs md:text-sm">
                            {language === 'es' ? 'Confirmado' : 'Confirmed'}
                          </span>
                        </div>
                        
                        {/* Mobile: 2 column grid centered */}
                        <div className="grid grid-cols-2 gap-3 md:hidden max-w-xs mx-auto">
                          <div className="flex items-start space-x-1.5">
                            <span className="text-sm mt-0.5">📅</span>
                            <div className="min-w-0">
                              <p className="text-[10px] text-gray-500">
                                {language === 'es' ? 'Fecha' : 'Date'}
                              </p>
                              <p className="font-medium text-gray-800 text-xs truncate">
                                {formatDateForDisplay(match.schedule.confirmedDate)}
                              </p>
                            </div>
                          </div>
                          
                          {match.schedule.time && (
                            <div className="flex items-start space-x-1.5">
                              <span className="text-sm mt-0.5">🕐</span>
                              <div className="min-w-0">
                                <p className="text-[10px] text-gray-500">
                                  {language === 'es' ? 'Hora' : 'Time'}
                                </p>
                                <p className="font-medium text-gray-800 text-xs">
                                  {match.schedule.time}
                                </p>
                              </div>
                            </div>
                          )}
                          
                          {match.schedule.club && (
                            <div className="flex items-start space-x-1.5">
                              <span className="text-sm mt-0.5">🏟️</span>
                              <div className="min-w-0">
                                <p className="text-[10px] text-gray-500">
                                  {language === 'es' ? 'Club' : 'Club'}
                                </p>
                                <p className="font-medium text-gray-800 text-xs truncate">
                                  {match.schedule.club}
                                </p>
                              </div>
                            </div>
                          )}
                          
                          {(match.schedule.court || match.schedule.courtNumber) && (
                            <div className="flex items-start space-x-1.5">
                              <span className="text-sm mt-0.5">🎾</span>
                              <div className="min-w-0">
                                <p className="text-[10px] text-gray-500">
                                  {language === 'es' ? 'Pista' : 'Court'}
                                </p>
                                <p className="font-medium text-gray-800 text-xs truncate">
                                  {match.schedule.court || `${match.schedule.courtNumber || ''}`}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                        
                        {/* Desktop: 4 column grid */}
                        <div className="hidden md:grid md:grid-cols-4 md:gap-4">
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
                      <div className="flex items-center justify-center space-x-2 md:space-x-3">
                        <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-amber-500 text-white flex items-center justify-center">
                          <span className="text-[10px] md:text-xs">⏰</span>
                        </div>
                        <div className="text-center">
                          <span className="font-semibold text-amber-700 text-xs md:text-sm">
                            {language === 'es' ? 'Por confirmar' : 'To be confirmed'}
                          </span>
                          <p className="text-[10px] md:text-xs text-amber-600 mt-0.5">
                            {language === 'es' ? 'Límite: ' : 'Deadline: '}
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
        <div className="text-center py-8 md:py-16">
          <div className="text-4xl md:text-6xl mb-3 md:mb-4">📅</div>
          <h3 className="text-lg md:text-xl font-bold text-gray-700 mb-2">
            {language === 'es' ? 'Ronda' : 'Round'} {currentRound}
          </h3>
          <p className="text-sm md:text-base text-gray-500 mb-4 md:mb-6">
            {language === 'es' 
              ? 'Sin partidos programados todavía'
              : 'No matches scheduled yet'}
          </p>
          <div className="text-xs md:text-sm text-gray-400">
            {language === 'es' 
              ? 'Se programarán al completar la ronda anterior'
              : 'Will be scheduled after previous round'}
          </div>
        </div>
      )}
    </div>
  )
}