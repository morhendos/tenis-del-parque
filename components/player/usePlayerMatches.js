'use client'

import { useState, useEffect, useCallback } from 'react'
import { MatchModals } from './MatchModals'
import MatchResultCard from './MatchResultCard'
import { toast } from '@/components/ui/Toast'
import { processMatchResult } from '@/lib/utils/matchResultUtils'
import { fetchWithRetry } from '@/lib/utils/fetchWithRetry'

const clearedSchedule = {
  confirmedDate: null,
  venue: null,
  club: null,
  court: null,
  time: null,
  notes: null
}

export function isUpcomingMatch(m) {
  if (m.status !== 'scheduled' || m.result?.winner) return false
  if (m.schedule?.deadline && new Date(m.schedule.deadline) < new Date()) return false
  return true
}

export default function usePlayerMatches(language = 'es', { enabled = true, onResultSubmitted } = {}) {
  const [matches, setMatches] = useState([])
  const [player, setPlayer] = useState(null)
  const [openRankData, setOpenRankData] = useState({})
  const [loading, setLoading] = useState(enabled)
  const [error, setError] = useState('')

  const [selectedMatch, setSelectedMatch] = useState(null)
  const [showResultModal, setShowResultModal] = useState(false)
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [showExtendModal, setShowExtendModal] = useState(false)
  const [isEditingSchedule, setIsEditingSchedule] = useState(false)
  const [resultCard, setResultCard] = useState(null)

  const es = language === 'es'

  const fetchMatches = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetchWithRetry('/api/player/matches', {}, { label: 'Matches:matches' })
      if (!response.ok) throw new Error('Failed to fetch matches')
      const data = await response.json()
      setMatches(data.matches || [])
      setError('')
    } catch (err) {
      console.error('Error fetching matches:', err)
      setError('Failed to load matches')
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchPlayer = useCallback(async () => {
    try {
      const response = await fetchWithRetry('/api/player/profile', {}, { label: 'Matches:profile' })
      if (response.ok) {
        const data = await response.json()
        setPlayer(data.player)
      }
    } catch (err) {
      console.error('Error fetching player data:', err)
    }
  }, [])

  const fetchOpenRank = useCallback(async () => {
    try {
      const response = await fetchWithRetry('/api/openrank?all=true', {}, { label: 'Matches:openrank' })
      if (response.ok) {
        const data = await response.json()
        const rankMap = {}
        data.rankings?.forEach(p => { rankMap[p._id] = p.position })
        setOpenRankData(rankMap)
      }
    } catch (err) {
      console.error('Error fetching OpenRank data:', err)
    }
  }, [])

  useEffect(() => {
    if (!enabled) return
    fetchMatches()
    fetchPlayer()
    fetchOpenRank()
  }, [enabled, fetchMatches, fetchPlayer, fetchOpenRank])

  const getExtensionsForLeague = (leagueId) => {
    if (!player?.registrations?.length || !leagueId) return 3
    const lid = leagueId?._id?.toString() || leagueId?.toString()
    const registration = player.registrations.find(r => (r.league?._id?.toString() || r.league?.toString()) === lid)
    if (registration?.extensions) return registration.extensions.total - registration.extensions.used
    return 3
  }

  const updateMatch = (matchId, fn) => {
    setMatches(prev => prev.map(m => (m._id === matchId ? fn(m) : m)))
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

  const handleExtend = (match) => {
    setSelectedMatch(match)
    setShowExtendModal(true)
  }

  const handleWhatsApp = (match, opponent) => {
    if (!opponent?.whatsapp) return
    let cleaned = opponent.whatsapp.replace(/[^0-9]/g, '')
    if (cleaned.startsWith('00')) cleaned = cleaned.substring(2)

    const stageLabels = {
      quarterfinal: { es: 'cuartos de final de los playoffs', en: 'playoff quarterfinals' },
      semifinal: { es: 'las semifinales de los playoffs', en: 'the playoff semifinals' },
      final: { es: 'la final de los playoffs', en: 'the playoff final' },
      third_place: { es: 'el partido por el tercer puesto', en: 'the 3rd place playoff' }
    }
    const lang = es ? 'es' : 'en'
    const roundLabel = match.matchType === 'playoff'
      ? (stageLabels[match.playoffInfo?.stage]?.[lang] || stageLabels.quarterfinal[lang])
      : (es ? `la ronda ${match.round}` : `round ${match.round}`)

    const message = es
      ? `Hola ${opponent.name}! Soy ${player?.name} de TDP liga de tenis. Cuando te viene bien para jugar nuestro partido de ${roundLabel}?`
      : `Hi ${opponent.name}! I'm ${player?.name} from the TDP tennis league. When would be a good time to play our ${roundLabel} match?`
    window.open(`https://wa.me/${cleaned}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer')
  }

  const showResultFor = (match, isWinner) => {
    setResultCard({ match, isWinner, isNew: false })
  }

  const postJson = async (url, body) => {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
    return { response, result: await response.json() }
  }

  const handleConfirmExtend = async (match) => {
    try {
      const { response, result } = await postJson('/api/player/matches/extend', { matchId: match._id })
      if (response.ok) {
        updateMatch(match._id, m => ({ ...m, schedule: { ...m.schedule, deadline: result.newDeadline } }))
        fetchPlayer()
        setShowExtendModal(false)
        toast.success(es ? 'Límite extendido 7 días' : 'Deadline extended by 7 days')
      } else {
        toast.error(result.error || (es ? 'Error al extender límite' : 'Failed to extend deadline'))
      }
    } catch (err) {
      console.error('Error extending deadline:', err)
      toast.error(es ? 'Error al extender límite' : 'Error extending deadline')
    }
  }

  const handleSubmitResult = async (data) => {
    try {
      const { response, result } = await postJson('/api/player/matches/result', data)
      if (!response.ok) {
        toast.error(result.error || (es ? 'Error al enviar resultado' : 'Failed to submit result'))
        return
      }
      const match = matches.find(m => m._id === data.matchId) || selectedMatch
      if (!match) {
        toast.error(es ? 'Error: Partido no encontrado' : 'Error: Match not found')
        return
      }
      const { updatedMatch, isPlayerWinner } = processMatchResult(match, player, data)
      updateMatch(data.matchId, () => updatedMatch)
      setShowResultModal(false)
      setTimeout(() => setResultCard({ match: updatedMatch, isWinner: isPlayerWinner, isNew: true }), 100)
      toast.success(es ? 'Resultado enviado con éxito' : 'Result submitted successfully')
    } catch (err) {
      console.error('Error submitting result:', err)
      toast.error(es ? 'Error al enviar resultado' : 'Error submitting result')
    }
  }

  const handleSubmitSchedule = async (data) => {
    try {
      const { response, result } = await postJson('/api/player/matches/schedule', data)
      if (response.ok) {
        const iso = new Date(`${data.date}T${data.time}`).toISOString()
        updateMatch(data.matchId, m => ({
          ...m,
          schedule: { ...m.schedule, confirmedDate: iso, venue: data.venue, club: data.venue, court: data.court, time: data.time, notes: data.notes },
          scheduledDate: iso,
          notes: data.notes
        }))
        setShowScheduleModal(false)
        toast.success(isEditingSchedule
          ? (es ? 'Programación actualizada con éxito' : 'Schedule updated successfully')
          : (es ? 'Partido programado con éxito' : 'Match scheduled successfully'))
      } else {
        toast.error(result.error || (es ? 'Error al programar partido' : 'Failed to schedule match'))
      }
    } catch (err) {
      console.error('Error scheduling match:', err)
      toast.error(es ? 'Error al programar partido' : 'Error scheduling match')
    }
  }

  const handleUnschedule = async (match) => {
    try {
      const { response, result } = await postJson('/api/player/matches/unschedule', { matchId: match._id })
      if (response.ok) {
        updateMatch(match._id, m => ({ ...m, schedule: { ...m.schedule, ...clearedSchedule }, scheduledDate: null, notes: null }))
        setShowScheduleModal(false)
        toast.success(es ? 'Partido desprogramado' : 'Match unscheduled')
      } else {
        toast.error(result.error || (es ? 'Error al desprogramar partido' : 'Failed to unschedule match'))
      }
    } catch (err) {
      console.error('Error unscheduling match:', err)
      toast.error(es ? 'Error al desprogramar partido' : 'Error unscheduling match')
    }
  }

  const cardProps = (match) => ({
    match,
    player,
    language,
    onSchedule: handleSchedule,
    onResult: handleResult,
    onWhatsApp: handleWhatsApp,
    onExtend: handleExtend,
    extensionsRemaining: getExtensionsForLeague(match.league?._id || match.league),
    openRankData
  })

  const modals = (
    <>
      <MatchModals
        showResultModal={showResultModal}
        showScheduleModal={showScheduleModal}
        showExtendModal={showExtendModal}
        selectedMatch={selectedMatch}
        player={player}
        language={language}
        league={selectedMatch?.league}
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
        extensionsRemaining={getExtensionsForLeague(selectedMatch?.league?._id || selectedMatch?.league)}
        isEditingSchedule={isEditingSchedule}
      />
      {resultCard && (
        <MatchResultCard
          match={resultCard.match}
          player={player}
          language={language}
          isWinner={resultCard.isWinner}
          onClose={() => {
            const wasNew = resultCard.isNew
            setResultCard(null)
            if (!wasNew) return
            if (onResultSubmitted) onResultSubmitted()
            else fetchMatches()
          }}
        />
      )}
    </>
  )

  return {
    matches,
    player,
    openRankData,
    loading,
    error,
    refetch: fetchMatches,
    cardProps,
    showResultFor,
    getExtensionsForLeague,
    modals
  }
}
