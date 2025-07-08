import React, { useState } from 'react'
import MatchCard from './MatchCard'
import { MatchModals } from './MatchModals'

export default function ScheduleTab({ schedule, language, totalRounds = 8, player }) {
  const [currentRound, setCurrentRound] = useState(1)
  const [showResultModal, setShowResultModal] = useState(false)
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [selectedMatch, setSelectedMatch] = useState(null)

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
            
            <div className="space-y-4">
              {getCurrentRoundMatches().map((match) => (
                <MatchCard
                  key={match._id}
                  match={match}
                  player={player}
                  language={language}
                  onSchedule={handleSchedule}
                  onResult={handleResult}
                  onWhatsApp={handleWhatsApp}
                  isUpcoming={true}
                  showActions={true}
                />
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
