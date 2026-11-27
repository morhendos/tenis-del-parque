import { playerFetch } from '@/lib/utils/playerApi'
import { useState, useEffect, useLayoutEffect, useCallback, useMemo } from 'react'
import useSWR from 'swr'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { announcementContent } from '../content/announcementContent'
import { findBestDefaultRegistration } from '@/lib/utils/leagueSelection'
import {
  getLiveRoundOneMatches,
  getRoundOneAnnouncementId,
  getLeagueTargetedAnnouncements
} from '@/lib/utils/announcementRules'

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect

export function usePlayerDashboard() {
  const [player, setPlayer] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [recentMatches, setRecentMatches] = useState([])
  const [upcomingMatches, setUpcomingMatches] = useState([])
  const [eloHistory, setEloHistory] = useState(null)
  const [standings, setStandings] = useState(null)
  const [leagueInfo, setLeagueInfo] = useState(null)
  const [firstRoundMatch, setFirstRoundMatch] = useState(null)
  const [showFirstRoundAnnouncement, setShowFirstRoundAnnouncement] = useState(false)
  const [seenAnnouncements, setSeenAnnouncements] = useState([])
  // League-specific announcements
  const [leagueAnnouncement, setLeagueAnnouncement] = useState(null)
  const [showLeagueAnnouncement, setShowLeagueAnnouncement] = useState(false)
  const [calculatedStats, setCalculatedStats] = useState({
    matchesPlayed: 0,
    matchesWon: 0,
    eloRating: 1200
  })
  const { data: session, status } = useSession()
  const router = useRouter()

  const calculatePointsFromMatch = (match, playerId) => {
    if (!match.result || !match.result.winner || match.status !== 'completed') {
      return 0
    }

    const isPlayer1 = match.players.player1._id === playerId
    const isWinner = match.result.winner === playerId
    
    let playerSetsWon = 0
    let opponentSetsWon = 0

    if (match.result.score?.walkover) {
      playerSetsWon = isWinner ? 2 : 0
      opponentSetsWon = isWinner ? 0 : 2
    } else if (match.result.score?.sets && match.result.score.sets.length > 0) {
      match.result.score.sets.forEach(set => {
        const player1Score = set.player1 || 0
        const player2Score = set.player2 || 0
        
        if (isPlayer1) {
          if (player1Score > player2Score) {
            playerSetsWon++
          } else {
            opponentSetsWon++
          }
        } else {
          if (player2Score > player1Score) {
            playerSetsWon++
          } else {
            opponentSetsWon++
          }
        }
      })
    }

    if (playerSetsWon === 2 && opponentSetsWon === 0) return 3
    if (playerSetsWon === 2 && opponentSetsWon === 1) return 2
    if (playerSetsWon === 1 && opponentSetsWon === 2) return 1
    if (playerSetsWon === 0 && opponentSetsWon === 2) return 0
    
    return 0
  }

  const isAuthenticated = status === 'authenticated'
  const { data: preferencesData, error: preferencesError, mutate: mutatePreferences } = useSWR(isAuthenticated ? '/api/player/preferences' : null)
  const { data: profileData, error: profileError, mutate: mutateProfile } = useSWR(isAuthenticated ? '/api/player/profile' : null)
  const { data: matchesData, error: matchesError, mutate: mutateMatches } = useSWR(isAuthenticated ? '/api/player/matches' : null)
  const { data: eloData } = useSWR(isAuthenticated ? '/api/player/elo-history' : null)

  const dashboardLeagueId = useMemo(() => {
    const registrations = profileData?.player?.registrations
    if (!registrations?.length) return null
    const league = findBestDefaultRegistration(registrations)?.league
    return (typeof league === 'object' ? league?._id : league) || null
  }, [profileData])

  const { data: standingsData, mutate: mutateStandings } = useSWR(
    dashboardLeagueId ? `/api/leagues/${dashboardLeagueId}/standings` : null
  )

  const preferencesSettled = !!preferencesData || !!preferencesError
  const profileSettled = !!profileData || !!profileError
  const matchesSettled = !!matchesData || !!matchesError

  const processPlayerData = () => {
    try {
      if (status === 'loading') return
      if (status === 'unauthenticated') {
        router.push('/login')
        return
      }
      
      setError(null)
      
      // Fetch preferences and STORE LOCALLY (don't rely on state)
      const fetchedSeenAnnouncements = preferencesData?.seenAnnouncements || []
      setSeenAnnouncements(fetchedSeenAnnouncements)
      
      if (profileData) {
        if (profileData.player) {
          const playerData = profileData.player
          const playerId = playerData._id
          
          // Fetch matches with retry logic — cold starts after inactivity can cause transient 500s
          if (matchesData) {
            const matches = matchesData.matches || []
            
            let stats = {
              matchesPlayed: 0,
              matchesWon: 0,
              eloRating: playerData.eloRating || 1200
            }
            
            const finishedLeagueIds = new Set(
              (playerData.registrations || [])
                .filter(r => ['completed', 'archived', 'cancelled'].includes(r.league?.status))
                .map(r => String(r.league?._id || r.league))
            )

            const processedMatches = matches.map(match => {
              const isPlayer1 = match.players.player1?._id === playerId
              const opponent = isPlayer1 ? match.players.player2 : match.players.player1
              
              const baseMatch = {
                _id: match._id,
                round: match.round,
                opponent: opponent?.name || 'BYE',
                isBye: match.isBye === true,
                opponentId: opponent?._id || null,
                opponentAvatar: opponent?.avatar || null,
                opponentCountry: opponent?.country || null,
                opponentWhatsapp: opponent?.whatsapp || null,
                matchType: match.matchType || 'regular',
                playoffInfo: match.playoffInfo || null,
                leagueId: match.league?._id?.toString() || match.league?.toString() || null
              }
              
              if (match.status === 'completed' && match.result && match.result.winner) {
                const isWinner = match.result.winner === playerId
                if (!match.isBye) {
                  stats.matchesPlayed++
                  if (isWinner) stats.matchesWon++
                }
                
                let eloChange = 0
                if (match.eloChanges) {
                  if (isPlayer1 && match.eloChanges.player1) {
                    eloChange = match.eloChanges.player1.change || 0
                  } else if (!isPlayer1 && match.eloChanges.player2) {
                    eloChange = match.eloChanges.player2.change || 0
                  }
                }
                
                return {
                  ...baseMatch,
                  type: 'recent',
                  result: isWinner ? 'won' : 'lost',
                  eloChange: eloChange,
                  playedAt: match.result.playedAt || match.updatedAt,
                  score: match.result.score
                }
              } else {
                // Check if match is cancelled or overdue (deadline passed)
                const isCancelled = match.status === 'cancelled'
                const isOverdue = match.status === 'scheduled' && match.schedule?.deadline && new Date(match.schedule.deadline) < new Date()
                const leagueFinished = finishedLeagueIds.has(String(match.league?._id || match.league)) ||
                  ['completed', 'archived', 'cancelled'].includes(match.league?.status)
                
                if (isCancelled || isOverdue || leagueFinished) {
                  // Treat as a "recent" match with no result
                  return {
                    ...baseMatch,
                    type: 'recent',
                    result: 'cancelled',
                    eloChange: 0,
                    playedAt: match.schedule?.deadline || match.updatedAt,
                    score: null,
                    isCancelled: true
                  }
                }
                
                return {
                  ...baseMatch,
                  type: 'upcoming',
                  scheduled: !!(match.schedule && match.schedule.confirmedDate),
                  date: match.schedule?.confirmedDate 
                    ? new Date(match.schedule.confirmedDate).toLocaleDateString() 
                    : null,
                  deadline: match.schedule?.deadline || null,
                  leagueId: match.league?._id || match.league,
                  leagueName: match.league?.name || null,
                  status: match.status
                }
              }
            })
            
            setCalculatedStats(stats)
            
            setPlayer({
              ...playerData,
              stats: {
                ...playerData.stats,
                ...stats
              }
            })
            
            const recent = processedMatches
              .filter(m => m.type === 'recent')
              .sort((a, b) => new Date(b.playedAt) - new Date(a.playedAt))
            
            const upcoming = processedMatches
              .filter(m => m.type === 'upcoming')
              .sort((a, b) => {
                if (a.scheduled && b.scheduled) {
                  return new Date(a.date) - new Date(b.date)
                }
                if (a.scheduled) return -1
                if (b.scheduled) return 1
                return a.round - b.round
              })
            
            setRecentMatches(recent)
            setUpcomingMatches(upcoming)
            
            // Fetch standings for position data
            // Find the best league to show (prioritize active/upcoming over completed)
            const bestRegistration = findBestDefaultRegistration(playerData.registrations)
            const leagueData = bestRegistration?.league
            const leagueId = typeof leagueData === 'object' ? leagueData._id : leagueData
            
            // Store league info for dashboard display
            if (typeof leagueData === 'object' && leagueData) {
              setLeagueInfo({
                _id: leagueData._id,
                name: leagueData.name,
                status: leagueData.status,
                startDate: leagueData.seasonConfig?.startDate,
                endDate: leagueData.seasonConfig?.endDate,
                currentRound: leagueData.currentRound,
                totalRounds: leagueData.config?.roundsPerSeason || null,
                level: bestRegistration?.level || null,
                location: leagueData.location?.city || null,
                playoffPhase: leagueData.playoffConfig?.currentPhase || null,
                slug: leagueData.slug || null,
                paymentStatus: bestRegistration?.paymentStatus || null
              })
            }
            
            if (leagueId) {
              try {
                if (standingsData) {
                  setStandings(standingsData)
                  
                  // Create position map - ensure string keys for comparison
                  const positionMap = {}
                  if (standingsData.unifiedStandings) {
                    standingsData.unifiedStandings.forEach(entry => {
                      positionMap[String(entry.player._id)] = entry.position
                    })
                  }
                  
                  // Update upcoming matches with opponent positions
                  const upcomingWithPositions = upcoming.map(match => ({
                    ...match,
                    opponentPosition: positionMap[String(match.opponentId)] || null
                  }))
                  setUpcomingMatches(upcomingWithPositions)
                  
                  // Update recent matches with opponent positions
                  const recentWithPositions = recent.map(match => ({
                    ...match,
                    opponentPosition: positionMap[String(match.opponentId)] || null
                  }))
                  setRecentMatches(recentWithPositions)
                }
              } catch (standingsError) {
                console.error('Error fetching standings:', standingsError)
              }
            }
            
            // Fetch ELO history for sparkline
            try {
              if (eloData) {
                setEloHistory(eloData)
              }
            } catch (eloError) {
              console.error('Error fetching ELO history:', eloError)
            }
            
            const firstRound = getLiveRoundOneMatches(matches).find(match =>
              match.isBye !== true &&
              !fetchedSeenAnnouncements.includes(getRoundOneAnnouncementId(match))
            )
            if (firstRound) {
              setFirstRoundMatch(firstRound)
              setShowFirstRoundAnnouncement(true)
            }
            
            const leagueAnnouncements = getLeagueTargetedAnnouncements(
              (playerData.registrations || []).map(reg => reg.league?.slug).filter(Boolean),
              fetchedSeenAnnouncements
            )
            if (leagueAnnouncements.length > 0) {
              // Show the first unseen league-specific announcement
              setLeagueAnnouncement(leagueAnnouncements[0])
              setShowLeagueAnnouncement(true)
            }
          } else {
            setPlayer({
              ...playerData,
              stats: {
                ...playerData.stats,
                matchesPlayed: 0,
                matchesWon: 0,
                eloRating: playerData.eloRating || 1200
              }
            })
          }
        } else {
          setPlayer(null)
        }
      } else {
        setPlayer(null)
      }
    } catch (err) {
      console.error('Error fetching player data:', err)
      setError(err.message || 'Failed to load player data')
    } finally {
      setLoading(false)
    }
  }

  const handleCloseFirstRoundAnnouncement = async () => {
    setShowFirstRoundAnnouncement(false)
    
    try {
      const response = await playerFetch('/api/player/messages/mark-seen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageId: getRoundOneAnnouncementId(firstRoundMatch) })
      })
      
      if (response.ok) {
        const data = await response.json()
        setSeenAnnouncements(data.seenAnnouncements || [])
      }
    } catch (error) {
      console.error('Failed to mark announcement as seen:', error)
    }
  }

  const handleCloseLeagueAnnouncement = async () => {
    setShowLeagueAnnouncement(false)
    
    if (!leagueAnnouncement) return
    
    try {
      const response = await playerFetch('/api/player/messages/mark-seen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageId: leagueAnnouncement.id })
      })
      
      if (response.ok) {
        const data = await response.json()
        setSeenAnnouncements(data.seenAnnouncements || [])
      }
    } catch (error) {
      console.error('Failed to mark league announcement as seen:', error)
    }
  }

  const getDynamicFirstRoundAnnouncement = () => {
    if (!firstRoundMatch || !player) return null
    
    const opponent = firstRoundMatch.players.player1._id === player._id 
      ? firstRoundMatch.players.player2 
      : firstRoundMatch.players.player1
    const matchDetails = { level: player.level, leagueName: firstRoundMatch.league?.name }
    
    return {
      ...announcementContent.firstRoundMatch,
      es: {
        ...announcementContent.firstRoundMatch.es,
        content: announcementContent.firstRoundMatch.es.getContent(
          player.name,
          opponent.name,
          opponent.whatsapp,
          matchDetails
        )
      },
      en: {
        ...announcementContent.firstRoundMatch.en,
        content: announcementContent.firstRoundMatch.en.getContent(
          player.name,
          opponent.name,
          opponent.whatsapp,
          matchDetails
        )
      }
    }
  }

  useIsomorphicLayoutEffect(() => {
    if (status === 'loading') return
    if (isAuthenticated && !(preferencesSettled && profileSettled && matchesSettled)) return
    processPlayerData()
  }, [status, preferencesSettled, profileSettled, matchesSettled, preferencesData, profileData, matchesData, standingsData, eloData])

  const refetch = useCallback(
    () => Promise.all([mutatePreferences(), mutateProfile(), mutateMatches(), mutateStandings()]),
    [mutatePreferences, mutateProfile, mutateMatches, mutateStandings]
  )

  return {
    player,
    loading,
    error,
    recentMatches,
    upcomingMatches,
    eloHistory,
    standings,
    leagueInfo,
    firstRoundMatch,
    showFirstRoundAnnouncement,
    session,
    handleCloseFirstRoundAnnouncement,
    getDynamicFirstRoundAnnouncement,
    // League-specific announcements
    leagueAnnouncement,
    showLeagueAnnouncement,
    handleCloseLeagueAnnouncement,
    refetch
  }
}
