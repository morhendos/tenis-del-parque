import React, { useState, useEffect, useMemo } from 'react'
import MatchCardUnified from './MatchCardUnified'
import { MatchModals } from './MatchModals'
import MatchResultCard from './MatchResultCard'
import { toast } from '@/components/ui/Toast'
import { processMatchResult } from '@/lib/utils/matchResultUtils'

export default function MatchesTab({ 
  schedule, 
  matches: completedMatches = [],
  language, 
  totalRounds = 8, 
  player = null, 
  isPublic = false, 
  league = null 
}) {
  const [currentRound, setCurrentRound] = useState(1)
  const [showResultModal, setShowResultModal] = useState(false)
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [showExtendModal, setShowExtendModal] = useState(false)
  const [selectedMatch, setSelectedMatch] = useState(null)
  const [playerMatches, setPlayerMatches] = useState([])
  const [loadingPlayerMatches, setLoadingPlayerMatches] = useState(true)
  const [isEditingSchedule, setIsEditingSchedule] = useState(false)
  const [showResultCard, setShowResultCard] = useState(false)
  const [submittedMatch, setSubmittedMatch] = useState(null)
  const [isWinner, setIsWinner] = useState(false)
  const [isNewResult, setIsNewResult] = useState(false) // Track if result was just submitted
  const [extensionsRemaining, setExtensionsRemaining] = useState(3)

  // Get all matches from schedule
  const allSchedule = schedule || []

  // Fetch player's matches with full data
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

    const fetchExtensionsStatus = async () => {
      if (!league?._id) return
      try {
        const response = await fetch('/api/player/profile')
        if (response.ok) {
          const data = await response.json()
          const registration = data.player?.registrations?.find(
            reg => reg.league?._id === league._id || reg.league === league._id
          )
          if (registration?.extensions) {
            setExtensionsRemaining(registration.extensions.total - registration.extensions.used)
          }
        }
      } catch (error) {
        console.error('Error fetching extensions status:', error)
      }
    }

    if (player && !isPublic) {
      fetchPlayerMatches()
      fetchExtensionsStatus()
    }
  }, [player, isPublic, league])

  // Get round info for selector
  const getAvailableRounds = () => {
    const allRounds = Array.from({ length: totalRounds }, (_, i) => i + 1)
    return allRounds.map(round => {
      const roundMatches = allSchedule.filter(match => match.round === round)
      const completedCount = roundMatches.filter(m => m.status === 'completed' || m.result?.winner).length
      const hasPlayerMatch = player && !isPublic && roundMatches.some(match => 
        match.players?.player1?._id === player?._id || 
        match.players?.player2?._id === player?._id
      )
      return {
        round,
        matchCount: roundMatches.length,
        completedCount,
        hasPlayerMatch
      }
    })
  }

  // Get matches for current round
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
        const fullMatch = playerMatches.find(m => {
          const matchLeagueId = m.league?._id?.toString() || m.league?.toString()
          const currentLeagueId = league?._id?.toString() || league?.toString()
          return m.round === currentRound &&
            matchLeagueId === currentLeagueId &&
            (m.players?.player1?._id === player?._id || m.players?.player2?._id === player?._id)
        })
        return { ...(fullMatch || match), isPlayerMatch: true }
      }
      
      return { ...match, isPlayerMatch: false }
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
            setIsNewResult(true) // This is a new submission
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
                  club: data.venue,
                  court: data.court,
                  time: data.time,
                  notes: data.notes
                },
                scheduledDate: new Date(`${data.date}T${data.time}`).toISOString(),
                notes: data.notes
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

  const handleUnschedule = async (match) => {
    try {
      const response = await fetch('/api/player/matches/unschedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matchId: match._id })
      })
      
      const result = await response.json()
      
      if (response.ok) {
        setPlayerMatches(prevMatches => 
          prevMatches.map(m => {
            if (m._id === match._id) {
              return {
                ...m,
                schedule: {
                  ...m.schedule,
                  confirmedDate: null,
                  venue: null,
                  club: null,
                  court: null,
                  time: null,
                  notes: null
                },
                scheduledDate: null,
                notes: null
              }
            }
            return m
          })
        )
        
        toast.success(language === 'es' ? 'Partido desprogramado' : 'Match unscheduled')
      } else {
        toast.error(result.error || (language === 'es' ? 'Error al desprogramar partido' : 'Failed to unschedule match'))
      }
    } catch (error) {
      console.error('Error unscheduling match:', error)
      toast.error(language === 'es' ? 'Error al desprogramar partido' : 'Error unscheduling match')
    }
  }

  const handleOpenExtendModal = (match) => {
    setSelectedMatch(match)
    setShowExtendModal(true)
  }

  const handleConfirmExtend = async (match) => {
    try {
      const response = await fetch('/api/player/matches/extend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matchId: match._id })
      })
      
      const result = await response.json()
      
      if (response.ok) {
        setPlayerMatches(prevMatches => 
          prevMatches.map(m => {
            if (m._id === match._id) {
              return {
                ...m,
                schedule: {
                  ...m.schedule,
                  deadline: result.newDeadline
                }
              }
            }
            return m
          })
        )
        
        setExtensionsRemaining(result.extensionsRemaining)
        setShowExtendModal(false)
        toast.success(language === 'es' ? 'Límite extendido 7 días' : 'Deadline extended by 7 days')
      } else {
        toast.error(result.error || (language === 'es' ? 'Error al extender límite' : 'Failed to extend deadline'))
      }
    } catch (error) {
      console.error('Error extending deadline:', error)
      toast.error(language === 'es' ? 'Error al extender límite' : 'Error extending deadline')
    }
  }

  // Handle tap on completed match to show result card
  const handleTapCompletedMatch = (match, playerWon) => {
    setSubmittedMatch(match)
    setIsWinner(playerWon)
    setIsNewResult(false) // Just viewing existing result
    setShowResultCard(true)
  }

  const roundMatches = getCurrentRoundMatches()
  const availableRounds = getAvailableRounds()

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-900">
          {language === 'es' ? 'Partidos' : 'Matches'}
        </h2>
      </div>
      
      {/* Round Selector - Horizontal Scroll */}
      <div className="mb-4 -mx-2 px-2">
        <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-hide">
          {availableRounds.map(({ round, matchCount, completedCount, hasPlayerMatch }) => (
            <button
              key={round}
              onClick={() => setCurrentRound(round)}
              className={`
                flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium
                transition-all duration-200
                ${currentRound === round
                  ? 'bg-parque-purple text-white shadow-md'
                  : matchCount > 0
                  ? 'bg-purple-50 text-parque-purple'
                  : 'bg-gray-100 text-gray-400'
                }
              `}
            >
              <span className="font-bold">R{round}</span>
              {matchCount > 0 && (
                <span className={`text-[10px] ${currentRound === round ? 'text-white/70' : 'text-gray-400'}`}>
                  {completedCount}/{matchCount}
                </span>
              )}
              {hasPlayerMatch && (
                <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full" />
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
              {roundMatches.filter(m => m.status === 'completed' || m.result?.winner).length > 0 && (
                <span> · {roundMatches.filter(m => m.status === 'completed' || m.result?.winner).length} {language === 'es' ? 'jugados' : 'played'}</span>
              )}
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
      
      {/* Round Matches */}
      {roundMatches.length > 0 ? (
        <div className="space-y-3">
          {roundMatches.map((match) => (
            <MatchCardUnified
              key={match._id}
              match={match}
              player={match.isPlayerMatch ? player : null}
              language={language}
              onSchedule={handleSchedule}
              onResult={handleResult}
              onWhatsApp={handleWhatsApp}
              onUnschedule={handleUnschedule}
              onExtend={handleOpenExtendModal}
              onTapCompleted={handleTapCompletedMatch}
              extensionsRemaining={extensionsRemaining}
              isPublic={!match.isPlayerMatch || isPublic}
            />
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
          showExtendModal={showExtendModal}
          selectedMatch={selectedMatch}
          player={player}
          language={language}
          league={league}
          onCloseResult={() => setShowResultModal(false)}
          onCloseSchedule={() => {
            setShowScheduleModal(false)
            setIsEditingSchedule(false)
          }}
          onCloseExtend={() => setShowExtendModal(false)}
          onSubmitResult={handleSubmitResult}
          onSubmitSchedule={handleSubmitSchedule}
          onUnschedule={handleUnschedule}
          onConfirmExtend={handleConfirmExtend}
          extensionsRemaining={extensionsRemaining}
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
            // Only reload if this was a new result submission
            if (isNewResult) {
              window.location.reload()
            }
          }}
        />
      )}
    </div>
  )
}
