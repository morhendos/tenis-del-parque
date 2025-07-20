import React, { useState, useEffect } from 'react'
import MatchCard from './MatchCard'
import { MatchModals } from './MatchModals'
import { toast } from '@/components/ui/Toast'

export default function ScheduleTab({ schedule, language, totalRounds = 8, player = null, isPublic = false }) {
  const [currentRound, setCurrentRound] = useState(1)
  const [showResultModal, setShowResultModal] = useState(false)
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [selectedMatch, setSelectedMatch] = useState(null)
  const [playerMatches, setPlayerMatches] = useState([])
  const [loadingPlayerMatches, setLoadingPlayerMatches] = useState(true)
  const [isEditingSchedule, setIsEditingSchedule] = useState(false)

  // Filter out any matches that have results (defensive programming for data inconsistencies)
  const upcomingSchedule = schedule?.filter(match => !match.result?.winner) || []

  // Fetch player's matches with full data (including WhatsApp) - only if player is provided
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

    if (player && !isPublic) {
      fetchPlayerMatches()
    }
  }, [player, isPublic])

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
    
    if (!player || isPublic) {
      // For public view or no player, return all matches
      return { playerMatch: null, otherMatches: allMatches }
    }
    
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
      hasPlayerMatch: player && !isPublic ? upcomingSchedule.some(match => 
        match.round === round && 
        (match.players?.player1?._id === player?._id || 
         match.players?.player2?._id === player?._id)
      ) : false
    }))
  }

  const handleSchedule = (match, isEditing = false) => {
    setSelectedMatch(match)
    setIsEditingSchedule(isEditing)
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
        // Optimistically update the match in playerMatches
        setPlayerMatches(prevMatches => 
          prevMatches.map(match => {
            if (match._id === data.matchId) {
              // Determine if current player is player1 or player2
              const isPlayer1 = match.players.player1._id === player._id
              
              // Transform the sets data from myScore/opponentScore to player1/player2
              const transformedSets = data.sets.map(set => ({
                player1: isPlayer1 ? set.myScore : set.opponentScore,
                player2: isPlayer1 ? set.opponentScore : set.myScore
              }))
              
              // Calculate who won based on sets
              let mySetWins = 0
              let oppSetWins = 0
              transformedSets.forEach(set => {
                if (isPlayer1) {
                  if (set.player1 > set.player2) mySetWins++
                  else oppSetWins++
                } else {
                  if (set.player2 > set.player1) mySetWins++
                  else oppSetWins++
                }
              })
              
              const winnerId = mySetWins > oppSetWins ? player._id : 
                              (isPlayer1 ? match.players.player2._id : match.players.player1._id)
              
              // Update match to completed status with properly formatted data
              return {
                ...match,
                status: 'completed',
                result: {
                  ...match.result,
                  winner: winnerId,
                  score: {
                    sets: transformedSets,
                    walkover: data.walkover
                  },
                  playedAt: new Date().toISOString()
                }
              }
            }
            return match
          })
        )
        
        setShowResultModal(false)
        toast.success(language === 'es' ? 'Resultado enviado con éxito' : 'Result submitted successfully')
      } else {
        toast.error(result.error || (language === 'es' ? 'Error al enviar resultado' : 'Failed to submit result'))
      }
    } catch (error) {
      console.error('Error submitting result:', error)
      toast.error(language === 'es' ? 'Error al enviar resultado' : 'Error submitting result')
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
        // Optimistically update the match in playerMatches
        setPlayerMatches(prevMatches => 
          prevMatches.map(match => {
            if (match._id === data.matchId) {
              // Update match schedule
              return {
                ...match,
                schedule: {
                  ...match.schedule,
                  confirmedDate: new Date(`${data.date}T${data.time}`).toISOString(),
                  venue: data.venue,
                  court: data.court,
                  time: data.time,
                  notes: data.notes
                },
                scheduledDate: new Date(`${data.date}T${data.time}`).toISOString()
              }
            }
            return match
          })
        )
        
        setShowScheduleModal(false)
        toast.success(
          isEditingSchedule 
            ? (language === 'es' ? 'Programación actualizada con éxito' : 'Schedule updated successfully')
            : (language === 'es' ? 'Partido programado con éxito' : 'Match scheduled successfully')
        )
      } else {
        toast.error(result.error || (language === 'es' ? 'Error al programar partido' : 'Failed to schedule match'))
      }
    } catch (error) {
      console.error('Error scheduling match:', error)
      toast.error(language === 'es' ? 'Error al programar partido' : 'Error scheduling match')
    }
  }

  const { playerMatch, otherMatches } = getCurrentRoundMatches()
  const hasMatchesInRound = playerMatch || otherMatches.length > 0

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
              {playerMatch && !isPublic && (
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
          {playerMatch && !isPublic && (
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
          
          {/* Other Matches - Read Only */}
          {otherMatches.length > 0 && (
            <div>
              {!isPublic && (
                <h4 className="text-sm font-semibold text-gray-600 mb-2">
                  {language === 'es' ? 'Otros Partidos' : 'Other Matches'}
                </h4>
              )}
              <div className="space-y-4">
                {otherMatches.map((match) => (
                  <MatchCard
                    key={match._id}
                    match={match}
                    player={null}
                    language={language}
                    isUpcoming={true}
                    showActions={false}
                    isPublic={true}
                  />
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

      {/* Match Modals - Only for logged in players */}
      {!isPublic && (
        <MatchModals
          showResultModal={showResultModal}
          showScheduleModal={showScheduleModal}
          selectedMatch={selectedMatch}
          player={player}
          language={language}
          onCloseResult={() => setShowResultModal(false)}
          onCloseSchedule={() => {
            setShowScheduleModal(false)
            setIsEditingSchedule(false)
          }}
          onSubmitResult={handleSubmitResult}
          onSubmitSchedule={handleSubmitSchedule}
          isEditingSchedule={isEditingSchedule}
        />
      )}
    </div>
  )
}