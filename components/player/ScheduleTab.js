import React, { useState } from 'react'

export default function ScheduleTab({ schedule, language, totalRounds = 8 }) {
  const [currentRound, setCurrentRound] = useState(1)

  const formatDateForDisplay = (date, showTime = false) => {
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
    return schedule.filter(match => match.round === currentRound)
  }

  const getAvailableRounds = () => {
    const roundsWithMatches = [...new Set(schedule.map(match => match.round))].sort((a, b) => a - b)
    const allRounds = Array.from({ length: totalRounds }, (_, i) => i + 1)
    return allRounds.map(round => ({
      round,
      hasMatches: roundsWithMatches.includes(round),
      matchCount: schedule.filter(match => match.round === round).length
    }))
  }

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
      {getCurrentRoundMatches().length > 0 ? (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-parque-purple to-parque-purple/80 text-white px-6 py-4 rounded-lg">
            <h3 className="text-xl font-bold mb-2">
              {language === 'es' ? 'Ronda' : 'Round'} {currentRound}
            </h3>
            <div className="flex items-center space-x-4 text-sm opacity-90">
              <span>
                {getCurrentRoundMatches().length} {language === 'es' ? 'partidos' : 'matches'}
              </span>
              <span>•</span>
              <span>
                {getCurrentRoundMatches().filter(m => m.schedule?.confirmedDate).length} {language === 'es' ? 'confirmados' : 'confirmed'}
              </span>
            </div>
          </div>
          
          <div className="space-y-6">
            {getCurrentRoundMatches().map((match) => (
              <div key={match._id} className="bg-white border-2 border-gray-100 rounded-xl p-6 hover:shadow-lg hover:border-parque-purple/20 transition-all duration-200">
                {/* Match Players */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center mb-6">
                  {/* Player 1 */}
                  <div className="md:col-span-2">
                    <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg">
                      <div className="w-12 h-12 rounded-full bg-parque-purple text-white flex items-center justify-center text-lg font-bold">
                        {match.players?.player1?.name?.charAt(0) || '?'}
                      </div>
                      <div>
                        <div className="font-bold text-gray-900 text-lg">
                          {match.players?.player1?.name || 'TBD'}
                        </div>
                        <div className="text-sm text-gray-600">
                          {language === 'es' ? 'Jugador 1' : 'Player 1'}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* VS */}
                  <div className="text-center">
                    <div className="bg-parque-purple/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto">
                      <span className="text-2xl font-bold text-parque-purple">vs</span>
                    </div>
                  </div>
                  
                  {/* Player 2 */}
                  <div className="md:col-span-2">
                    <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg">
                      <div className="w-12 h-12 rounded-full bg-parque-purple text-white flex items-center justify-center text-lg font-bold">
                        {match.players?.player2?.name?.charAt(0) || '?'}
                      </div>
                      <div>
                        <div className="font-bold text-gray-900 text-lg">
                          {match.players?.player2?.name || 'TBD'}
                        </div>
                        <div className="text-sm text-gray-600">
                          {language === 'es' ? 'Jugador 2' : 'Player 2'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* ENHANCED DATE & TIME SECTION */}
                {match.schedule?.confirmedDate ? (
                  <div className="bg-gradient-to-r from-green-50 to-green-100 border-2 border-green-200 rounded-xl p-6 mb-4">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-12 h-12 rounded-full bg-green-500 text-white flex items-center justify-center">
                        <span className="text-2xl">✓</span>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-green-800">
                          {language === 'es' ? 'Partido Confirmado' : 'Match Confirmed'}
                        </div>
                        <div className="text-sm text-green-600">
                          {language === 'es' ? 'Los jugadores han acordado fecha y hora' : 'Players have agreed on date and time'}
                        </div>
                      </div>
                    </div>
                    
                    {/* PRIMARY DATE & TIME DISPLAY */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Date - Most prominent */}
                      <div className="bg-white/80 rounded-lg p-4 text-center">
                        <div className="text-3xl mb-2">📅</div>
                        <div className="text-2xl font-bold text-gray-900 mb-1">
                          {formatDateForDisplay(match.schedule.confirmedDate)}
                        </div>
                        <div className="text-lg text-gray-600">
                          {new Date(match.schedule.confirmedDate).toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US', {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </div>
                      </div>
                      
                      {/* Time - Secondary prominence */}
                      {match.schedule?.time && (
                        <div className="bg-white/80 rounded-lg p-4 text-center">
                          <div className="text-3xl mb-2">🕐</div>
                          <div className="text-3xl font-bold text-parque-purple mb-1">
                            {match.schedule.time}
                          </div>
                          <div className="text-sm text-gray-600">
                            {language === 'es' ? 'Hora del partido' : 'Match time'}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Venue Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      {match.schedule?.club && (
                        <div className="flex items-center space-x-3 bg-white/60 rounded-lg p-3">
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-xl">🏌️</span>
                          </div>
                          <div>
                            <div className="font-bold text-gray-900">{match.schedule.club}</div>
                            <div className="text-sm text-gray-600">
                              {language === 'es' ? 'Club' : 'Club'}
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {(match.schedule?.court || match.schedule?.courtNumber) && (
                        <div className="flex items-center space-x-3 bg-white/60 rounded-lg p-3">
                          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                            <span className="text-xl">🎾</span>
                          </div>
                          <div>
                            <div className="font-bold text-gray-900">
                              {match.schedule.court || 'Court'} {match.schedule.courtNumber}
                            </div>
                            <div className="text-sm text-gray-600">
                              {language === 'es' ? 'Pista' : 'Court'}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="bg-gradient-to-r from-amber-50 to-amber-100 border-2 border-amber-200 rounded-xl p-6 mb-4">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-12 h-12 rounded-full bg-amber-500 text-white flex items-center justify-center">
                        <span className="text-2xl">⏰</span>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-amber-800">
                          {language === 'es' ? 'Pendiente de Confirmación' : 'Pending Confirmation'}
                        </div>
                        <div className="text-sm text-amber-600">
                          {language === 'es' ? 'Los jugadores deben acordar fecha y hora' : 'Players need to agree on date and time'}
                        </div>
                      </div>
                    </div>
                    
                    {/* Deadline Information */}
                    {match.schedule?.deadline && (
                      <div className="bg-white/80 rounded-lg p-4 text-center">
                        <div className="text-2xl mb-2">⏳</div>
                        <div className="text-lg font-bold text-gray-900 mb-1">
                          {language === 'es' ? 'Fecha Límite' : 'Deadline'}
                        </div>
                        <div className="text-xl font-bold text-amber-700">
                          {formatDateForDisplay(match.schedule.deadline)}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          {new Date(match.schedule.deadline).toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US', {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Match Status */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${
                      match.status === 'scheduled' ? 'bg-blue-500' :
                      match.status === 'in_progress' ? 'bg-yellow-500' :
                      'bg-gray-500'
                    }`}></div>
                    <span className="text-sm font-medium text-gray-700">
                      {match.status === 'scheduled' ? 
                        (language === 'es' ? 'Programado' : 'Scheduled') :
                        match.status === 'in_progress' ? 
                        (language === 'es' ? 'En progreso' : 'In Progress') :
                        match.status
                      }
                    </span>
                  </div>
                  
                  {match.schedule?.confirmedDate && (
                    <div className="text-sm text-gray-500">
                      {language === 'es' ? 'Confirmado' : 'Confirmed'} ✓
                    </div>
                  )}
                </div>
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