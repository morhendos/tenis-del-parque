import React, { useState, useEffect } from 'react'
import MatchCard from './MatchCard'
import { MatchModals } from './MatchModals'
import MatchResultCard from './MatchResultCard'
import { toast } from '@/components/ui/Toast'
import { processMatchResult } from '@/lib/utils/matchResultUtils'

export default function ScheduleTab({ schedule, language, totalRounds = 8, player = null, isPublic = false }) {
  const [currentRound, setCurrentRound] = useState(1)
  const [showResultModal, setShowResultModal] = useState(false)
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [selectedMatch, setSelectedMatch] = useState(null)
  const [playerMatches, setPlayerMatches] = useState([])
  const [loadingPlayerMatches, setLoadingPlayerMatches] = useState(true)
  const [isEditingSchedule, setIsEditingSchedule] = useState(false)
  const [showResultCard, setShowResultCard] = useState(false)
  const [submittedMatch, setSubmittedMatch] = useState(null)
  const [isWinner, setIsWinner] = useState(false)

  // Show all matches (including completed ones)
  const allSchedule = schedule || []

  // Fetch player's matches with full data - only if player is provided
  useEffect(() => {
    const fetchPlayerMatches = async () => {
      try {
        setLoadingPlayerMatches(true)
        const response = await fetch('/api/player/matches')
        if (response.ok) {
          const data = await response.json()
          setPlayerMatches(data.matches || [])
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

  const getCurrentRoundMatches = () => {
    const allMatches = allSchedule.filter(match => match.round === currentRound)
    
    if (!player || isPublic) {
      return allMatches.map(match => ({ ...match, isPlayerMatch: false }))
    }
    
    // Mark which match belongs to the player and merge with full data
    return allMatches.map(match => {
      const isPlayerMatch = match.players?.player1?._id === player?._id || 
                           match.players?.player2?._id === player?._id
      
      // If it's the player's match, try to get full data from playerMatches
      if (isPlayerMatch) {
        const fullMatch = playerMatches.find(m => 
          m.round === currentRound &&
          (m.players?.player1?._id === player?._id || m.players?.player2?._id === player?._id)
        )
        return { ...(fullMatch || match), isPlayerMatch: true }
      }
      
      return { ...match, isPlayerMatch: false }
    })
  }

  const getAvailableRounds = () => {
    const allRounds = Array.from({ length: totalRounds }, (_, i) => i + 1)
    return allRounds.map(round => {
      const roundMatches = allSchedule.filter(match => match.round === round)
      const hasPlayerMatch = player && !isPublic && roundMatches.some(match => 
        match.players?.player1?._id === player?._id || 
        match.players?.player2?._id === player?._id
      )
      return {
        round,
        matchCount: roundMatches.length,
        hasPlayerMatch
      }
    })
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
        const match = playerMatches.find(m => m._id === data.matchId)
        
        if (match) {
          const { updatedMatch, isPlayerWinner } = processMatchResult(match, player, data)
          
          setPlayerMatches(prevMatches => 
            prevMatches.map(m => m._id === data.matchId ? updatedMatch : m)
          )
          
          setShowResultModal(false)
          
          setTimeout(() => {
            setSubmittedMatch(updatedMatch)
            setIsWinner(isPlayerWinner)
            setShowResultCard(true)
          }, 100)
          
          toast.success(language === 'es' ? 'Resultado enviado con éxito' : 'Result submitted successfully')
        } else {
          toast.error(language === 'es' ? 'Error: Partido no encontrado' : 'Error: Match not found')
        }
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
        setPlayerMatches(prevMatches => 
          prevMatches.map(match => {
            if (match._id === data.matchId) {
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
            ? (language === 'es' ? 'Programación actualizada' : 'Schedule updated')
            : (language === 'es' ? 'Partido programado' : 'Match scheduled')
        )
      } else {
        toast.error(result.error || (language === 'es' ? 'Error al programar partido' : 'Failed to schedule match'))
      }
    } catch (error) {
      console.error('Error scheduling match:', error)
      toast.error(language === 'es' ? 'Error al programar partido' : 'Error scheduling match')
    }
  }

  const roundMatches = getCurrentRoundMatches()
  const availableRounds = getAvailableRounds()

  return (
    <div>
      {/* Compact Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-900">
          {language === 'es' ? 'Calendario' : 'Schedule'}
        </h2>
      </div>
      
      {/* Round Selector - Horizontal Scroll */}
      <div className="mb-4 -mx-2 px-2">
        <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-hide">
          {availableRounds.map(({ round, matchCount, hasPlayerMatch }) => (
            <button
              key={round}
              onClick={() => setCurrentRound(round)}
              className={`
                flex-shrink-0 flex flex-col items-center px-3 py-2 rounded-lg text-xs font-medium
                transition-all duration-200 min-w-[52px]
                ${currentRound === round
                  ? 'bg-parque-purple text-white shadow-md'
                  : matchCount > 0
                  ? 'bg-purple-50 text-parque-purple'
                  : 'bg-gray-100 text-gray-400'
                }
              `}
            >
              <span className="text-[10px] opacity-70">R{round}</span>
              <span className="font-bold">{matchCount}</span>
              {hasPlayerMatch && (
                <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full mt-0.5" />
              )}
            </button>
          ))}
        </div>
      </div>
      
      {/* Round Header */}
      <div className="bg-gradient-to-r from-parque-purple to-purple-600 text-white px-4 py-3 rounded-lg mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold">
              {language === 'es' ? 'Ronda' : 'Round'} {currentRound}
            </h3>
            <p className="text-xs text-white/70">
              {roundMatches.length} {language === 'es' ? 'partidos' : 'matches'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentRound(Math.max(1, currentRound - 1))}
              disabled={currentRound === 1}
              className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => setCurrentRound(Math.min(totalRounds, currentRound + 1))}
              disabled={currentRound === totalRounds}
              className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      {/* All Matches for Current Round */}
      {roundMatches.length > 0 ? (
        <div className="space-y-3">
          {roundMatches.map((match) => (
            <div key={match._id} className="relative">
              {/* Player's match indicator */}
              {match.isPlayerMatch && !isPublic && (
                <div className="absolute -left-1 top-0 bottom-0 w-1 bg-yellow-400 rounded-full" />
              )}
              <MatchCard
                match={match}
                player={match.isPlayerMatch ? player : null}
                language={language}
                onSchedule={match.isPlayerMatch ? handleSchedule : undefined}
                onResult={match.isPlayerMatch ? handleResult : undefined}
                onWhatsApp={match.isPlayerMatch ? handleWhatsApp : undefined}
                isUpcoming={true}
                showActions={match.isPlayerMatch && !isPublic}
                isPublic={!match.isPlayerMatch || isPublic}
                className={match.isPlayerMatch && !isPublic ? 'ring-1 ring-yellow-300 bg-yellow-50/30' : ''}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-gray-500 text-sm">
            {language === 'es' 
              ? 'No hay partidos en esta ronda todavía'
              : 'No matches in this round yet'}
          </p>
        </div>
      )}

      {/* Modals */}
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

      {/* Match Result Card */}
      {showResultCard && submittedMatch && (
        <MatchResultCard
          match={submittedMatch}
          player={player}
          language={language}
          isWinner={isWinner}
          onClose={() => {
            setShowResultCard(false)
            setSubmittedMatch(null)
            window.location.reload()
          }}
        />
      )}
    </div>
  )
}
