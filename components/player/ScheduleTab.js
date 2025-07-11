import React, { useState, useEffect } from 'react'
import MatchCard from './MatchCard'
import { MatchModals } from './MatchModals'

export default function ScheduleTab({ schedule, language, totalRounds = 8, player }) {
  const [currentRound, setCurrentRound] = useState(1)
  const [showResultModal, setShowResultModal] = useState(false)
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [selectedMatch, setSelectedMatch] = useState(null)
  const [playerMatches, setPlayerMatches] = useState([])
  const [loadingPlayerMatches, setLoadingPlayerMatches] = useState(true)

  // Filter out any matches that have results (defensive programming for data inconsistencies)
  const upcomingSchedule = schedule.filter(match => !match.result?.winner)

  // Fetch player's matches with full data (including WhatsApp)
  useEffect(() => {
    const fetchPlayerMatches = async () => {
      try {
        setLoadingPlayerMatches(true)
        const response = await fetch('/api/player/matches')
        if (response.ok) {
          const data = await response.json()
          // Also filter out completed matches from player matches
          const upcomingPlayerMatches = (data.matches || []).filter(match => !match.result?.winner)
          setPlayerMatches(upcomingPlayerMatches)
        }
      } catch (error) {
        console.error('Error fetching player matches:', error)
      } finally {
        setLoadingPlayerMatches(false)
      }
    }

    if (player) {
      fetchPlayerMatches()
    }
  }, [player])

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
    const allMatches = upcomingSchedule.filter(match => match.round === currentRound)
    
    // Find player's match from the playerMatches array (which has full data)
    const playerMatchWithFullData = playerMatches.find(match => 
      match.round === currentRound &&
      (match.players?.player1?._id === player?._id || 
       match.players?.player2?._id === player?._id)
    )
    
    // Find player's match from schedule (for display purposes)
    const playerMatch = allMatches.find(match => 
      match.players?.player1?._id === player?._id || 
      match.players?.player2?._id === player?._id
    )
    
    const otherMatches = allMatches.filter(match => 
      match.players?.player1?._id !== player?._id && 
      match.players?.player2?._id !== player?._id
    )
    
    // Use the match with full data if available, otherwise use the schedule match
    return { 
      playerMatch: playerMatchWithFullData || playerMatch, 
      otherMatches 
    }
  }

  const getAvailableRounds = () => {
    const roundsWithMatches = [...new Set(upcomingSchedule.map(match => match.round))].sort((a, b) => a - b)
    const allRounds = Array.from({ length: totalRounds }, (_, i) => i + 1)
    return allRounds.map(round => ({
      round,
      hasMatches: roundsWithMatches.includes(round),
      matchCount: upcomingSchedule.filter(match => match.round === round).length,
      hasPlayerMatch: upcomingSchedule.some(match => 
        match.round === round && 
        (match.players?.player1?._id === player?._id || 
         match.players?.player2?._id === player?._id)
      )
    }))
  }

  const handleSchedule = (match) => {
    setSelectedMatch(match)
    setShowScheduleModal(true)
  }

  const handleResult = (match) => {
    setSelectedMatch(match)
    setShowResultModal(true)
  }

  const handleWhatsApp = (match, opponent) => {
    if (!opponent?.whatsapp) return
    
    // Normalize phone number for WhatsApp
    let cleaned = opponent.whatsapp.replace(/[^0-9]/g, '')
    if (cleaned.startsWith('00')) {
      cleaned = cleaned.substring(2)
    }
    
    const message = language === 'es' 
      ? `Hola ${opponent.name}! Soy ${player?.name} de TDP liga de tenis. ¿Cuándo te viene bien para jugar nuestro partido de la ronda ${match.round}?`
      : `Hi ${opponent.name}! I'm ${player?.name} from the TDP tennis league. When would be a good time to play our round ${match.round} match?`
    
    const whatsappUrl = `https://wa.me/${cleaned}?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer')
  }

  const handleSubmitResult = async (data) => {
    try {
      const response = await fetch('/api/player/matches/result', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      
      const result = await response.json()
      
      if (response.ok) {
        setShowResultModal(false)
        showSuccessNotification(language === 'es' ? 'Resultado enviado con éxito' : 'Result submitted successfully')
        // Refresh the data
        window.location.reload()
      } else {
        alert(result.error || 'Failed to submit result')
      }
    } catch (error) {
      console.error('Error submitting result:', error)
      alert('Error submitting result')
    }
  }

  const handleSubmitSchedule = async (data) => {
    try {
      const response = await fetch('/api/player/matches/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      
      const result = await response.json()
      
      if (response.ok) {
        setShowScheduleModal(false)
        showSuccessNotification(language === 'es' ? 'Partido programado con éxito' : 'Match scheduled successfully')
        // Refresh the data
        window.location.reload()
      } else {
        alert(result.error || 'Failed to schedule match')
      }
    } catch (error) {
      console.error('Error scheduling match:', error)
      alert('Error scheduling match')
    }
  }

  const showSuccessNotification = (message) => {
    // Create and show a temporary success notification
    const notification = document.createElement('div')
    notification.className = 'fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-slide-down'
    notification.innerHTML = `
      <div class="flex items-center space-x-2">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
        </svg>
        <span>${message}</span>
      </div>
    `
    document.body.appendChild(notification)
    
    setTimeout(() => {
      notification.classList.add('animate-slide-up')
      setTimeout(() => {
        document.body.removeChild(notification)
      }, 300)
    }, 3000)
  }

  const { playerMatch, otherMatches } = getCurrentRoundMatches()
  const hasMatchesInRound = playerMatch || otherMatches.length > 0

  return (
    <>
      <style jsx global>{`
        @keyframes slide-down {
          from {
            opacity: 0;
            transform: translate(-50%, -1rem);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }
        
        @keyframes slide-up {
          from {
            opacity: 1;
            transform: translate(-50%, 0);
          }
          to {
            opacity: 0;
            transform: translate(-50%, -1rem);
          }
        }
        
        .animate-slide-down {
          animation: slide-down 0.3s ease-out;
        }
        
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
      
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
            {getAvailableRounds().map(({ round, hasMatches, matchCount, hasPlayerMatch }) => (
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
                {hasPlayerMatch && (
                  <span className="absolute -top-1 -right-1 bg-yellow-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    ⭐
                  </span>
                )}
                {hasMatches && !hasPlayerMatch && (
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
                  {(playerMatch ? 1 : 0) + otherMatches.length} {language === 'es' ? 'partidos' : 'matches'}
                </span>
                {playerMatch && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <span className="text-yellow-300">⭐</span>
                      {language === 'es' ? 'Tu partido' : 'Your match'}
                    </span>
                  </>
                )}
              </div>
            </div>
            
            {/* Player's Match - Interactive */}
            {playerMatch && (
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-600 mb-2 flex items-center gap-2">
                  <span className="text-yellow-500">⭐</span>
                  {language === 'es' ? 'Tu Partido' : 'Your Match'}
                  {loadingPlayerMatches && (
                    <span className="text-xs text-gray-400 animate-pulse">
                      {language === 'es' ? 'Cargando datos...' : 'Loading data...'}
                    </span>
                  )}
                </h4>
                <MatchCard
                  match={playerMatch}
                  player={player}
                  language={language}
                  onSchedule={handleSchedule}
                  onResult={handleResult}
                  onWhatsApp={handleWhatsApp}
                  isUpcoming={true}
                  showActions={true}
                  className="ring-2 ring-parque-purple ring-opacity-50"
                />
              </div>
            )}
            
            {/* Other Matches - Read Only with Full Info */}
            {otherMatches.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-600 mb-2">
                  {language === 'es' ? 'Otros Partidos' : 'Other Matches'}
                </h4>
                <div className="space-y-4">
                  {otherMatches.map((match) => (
                    <div 
                      key={match._id} 
                      className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden opacity-90"
                    >
                      {/* Match Header */}
                      <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-gray-400 rounded-full flex items-center justify-center shadow-md">
                              <span className="text-white font-bold text-lg">
                                {match.round}
                              </span>
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">
                                {language === 'es' ? 'Ronda' : 'Round'} {match.round}
                              </h3>
                              <div className="text-sm text-gray-700 font-medium mt-1">
                                <span>{match.players?.player1?.name || 'TBD'}</span>
                                <span className="mx-2 text-gray-500">vs</span>
                                <span>{match.players?.player2?.name || 'TBD'}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Match Details */}
                      <div className="p-4">
                        {/* Confirmed Match Info */}
                        {match.schedule?.confirmedDate && (
                          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center space-x-3 mb-3">
                              <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center">
                                <span className="text-sm">✓</span>
                              </div>
                              <div>
                                <div className="font-semibold text-gray-800 text-sm">
                                  {language === 'es' ? 'Partido Confirmado' : 'Match Confirmed'}
                                </div>
                                <div className="text-xs text-gray-600">
                                  {language === 'es' ? 'Fecha y hora acordadas' : 'Date and time agreed'}
                                </div>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div className="flex items-center space-x-2">
                                <span className="text-lg">📅</span>
                                <div>
                                  <p className="font-medium text-gray-800 text-xs">
                                    {formatDateForDisplay(match.schedule.confirmedDate)}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {new Date(match.schedule.confirmedDate).toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US', {
                                      month: 'short',
                                      day: 'numeric'
                                    })}
                                  </p>
                                </div>
                              </div>
                              
                              {match.schedule.time && (
                                <div className="flex items-center space-x-2">
                                  <span className="text-lg">🕐</span>
                                  <div>
                                    <p className="font-medium text-gray-800">
                                      {match.schedule.time}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      {language === 'es' ? 'Hora' : 'Time'}
                                    </p>
                                  </div>
                                </div>
                              )}
                              
                              {match.schedule.club && (
                                <div className="flex items-center space-x-2">
                                  <span className="text-lg">🏟️</span>
                                  <div>
                                    <p className="font-medium text-gray-800 text-xs">
                                      {match.schedule.club}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      {language === 'es' ? 'Club' : 'Club'}
                                    </p>
                                  </div>
                                </div>
                              )}
                              
                              {(match.schedule.court || match.schedule.courtNumber) && (
                                <div className="flex items-center space-x-2">
                                  <span className="text-lg">🎾</span>
                                  <div>
                                    <p className="font-medium text-gray-800 text-xs">
                                      {match.schedule.court || `${language === 'es' ? 'Pista' : 'Court'}`} {match.schedule.courtNumber || ''}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      {language === 'es' ? 'Pista' : 'Court'}
                                    </p>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                        
                        {/* Pending Match Info */}
                        {!match.schedule?.confirmedDate && match.schedule?.deadline && (
                          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center">
                                <span className="text-sm">⏰</span>
                              </div>
                              <div>
                                <div className="font-semibold text-amber-800 text-sm">
                                  {language === 'es' ? 'Pendiente de Confirmación' : 'Pending Confirmation'}
                                </div>
                                <div className="text-xs text-amber-600">
                                  {language === 'es' ? 'Fecha límite: ' : 'Deadline: '}
                                  {formatDateForDisplay(match.schedule.deadline)}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {/* Not Scheduled Yet */}
                        {!match.schedule?.confirmedDate && !match.schedule?.deadline && (
                          <div className="text-center py-3 text-gray-500 text-sm">
                            {language === 'es' ? 'Por programar' : 'To be scheduled'}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
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

        {/* Match Modals */}
        <MatchModals
          showResultModal={showResultModal}
          showScheduleModal={showScheduleModal}
          selectedMatch={selectedMatch}
          player={player}
          language={language}
          onCloseResult={() => setShowResultModal(false)}
          onCloseSchedule={() => setShowScheduleModal(false)}
          onSubmitResult={handleSubmitResult}
          onSubmitSchedule={handleSubmitSchedule}
        />
      </div>
    </>
  )
} 