import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { announcementContent } from '../content/announcementContent'

// Helper to check if player is registered for any targeted leagues
function getLeagueSpecificAnnouncements(registrations, seenAnnouncements) {
  if (!registrations || registrations.length === 0) return []
  
  // Get all league slugs the player is registered for
  const playerLeagueSlugs = registrations
    .map(reg => reg.league?.slug)
    .filter(Boolean)
  
  // Find announcements that target any of the player's leagues and haven't been seen
  const targetedAnnouncements = Object.values(announcementContent)
    .filter(announcement => {
      // Must have targetLeagues defined
      if (!announcement.targetLeagues || announcement.targetLeagues.length === 0) return false
      
      // Check if player is in any of the targeted leagues
      const isInTargetedLeague = announcement.targetLeagues.some(
        targetSlug => playerLeagueSlugs.includes(targetSlug)
      )
      
      // Check if player has already seen this announcement
      const hasSeenAnnouncement = seenAnnouncements.includes(announcement.id)
      
      return isInTargetedLeague && !hasSeenAnnouncement
    })
  
  return targetedAnnouncements
}

// Helper to find the best default league (prioritize active/upcoming over completed)
function findBestDefaultRegistration(registrations) {
  if (!registrations || registrations.length === 0) return null
  
  // Priority order: active > registration_open > coming_soon > completed
  const priorityOrder = ['active', 'registration_open', 'coming_soon', 'completed', 'archived']
  
  // Sort registrations by status priority
  const sorted = [...registrations].sort((a, b) => {
    const statusA = a.league?.status || 'completed'
    const statusB = b.league?.status || 'completed'
    
    // Check if either is in playoffs (treat as active)
    const playoffPhaseA = a.league?.playoffConfig?.currentPhase
    const playoffPhaseB = b.league?.playoffConfig?.currentPhase
    const isInPlayoffsA = playoffPhaseA && playoffPhaseA !== 'regular_season' && playoffPhaseA !== 'completed'
    const isInPlayoffsB = playoffPhaseB && playoffPhaseB !== 'regular_season' && playoffPhaseB !== 'completed'
    
    // Playoffs are highest priority
    if (isInPlayoffsA && !isInPlayoffsB) return -1
    if (!isInPlayoffsA && isInPlayoffsB) return 1
    
    const priorityA = priorityOrder.indexOf(statusA)
    const priorityB = priorityOrder.indexOf(statusB)
    
    // If same priority, prefer the one with more recent start date
    if (priorityA === priorityB) {
      const dateA = new Date(a.league?.seasonConfig?.startDate || 0)
      const dateB = new Date(b.league?.seasonConfig?.startDate || 0)
      return dateB - dateA // More recent first
    }
    
    return priorityA - priorityB
  })
  
  return sorted[0]
}

export function usePlayerDashboard() {
  const [player, setPlayer] = useState(null)
  const [loading, setLoading] = useState(true)
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

  const fetchPlayerData = useCallback(async () => {
    try {
      if (status === 'loading') return
      if (status === 'unauthenticated') {
        router.push('/login')
        return
      }
      
      // Fetch preferences and STORE LOCALLY (don't rely on state)
      let fetchedSeenAnnouncements = []
      const preferencesResponse = await fetch('/api/player/preferences')
      if (preferencesResponse.ok) {
        const preferencesData = await preferencesResponse.json()
        fetchedSeenAnnouncements = preferencesData.seenAnnouncements || []
        setSeenAnnouncements(fetchedSeenAnnouncements)
      }
      
      const profileResponse = await fetch('/api/player/profile')
      if (profileResponse.ok) {
        const profileData = await profileResponse.json()
        if (profileData.player) {
          const playerData = profileData.player
          const playerId = playerData._id
          
          const matchesResponse = await fetch('/api/player/matches')
          if (matchesResponse.ok) {
            const matchesData = await matchesResponse.json()
            const matches = matchesData.matches || []
            
            let stats = {
              matchesPlayed: 0,
              matchesWon: 0,
              eloRating: playerData.eloRating || 1200
            }
            
            const processedMatches = matches.map(match => {
              const isPlayer1 = match.players.player1?._id === playerId
              const opponent = isPlayer1 ? match.players.player2 : match.players.player1
              
              const baseMatch = {
                _id: match._id,
                round: match.round,
                opponent: opponent?.name || 'BYE',
                opponentId: opponent?._id || null,
                opponentWhatsapp: opponent?.whatsapp || null
              }
              
              if (match.status === 'completed' && match.result && match.result.winner) {
                stats.matchesPlayed++
                
                const isWinner = match.result.winner === playerId
                if (isWinner) {
                  stats.matchesWon++
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
                return {
                  ...baseMatch,
                  type: 'upcoming',
                  scheduled: !!(match.schedule && match.schedule.confirmedDate),
                  date: match.schedule?.confirmedDate 
                    ? new Date(match.schedule.confirmedDate).toLocaleDateString() 
                    : null,
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
                location: leagueData.location?.city || null
              })
            }
            
            if (leagueId) {
              try {
                const standingsResponse = await fetch(`/api/leagues/${leagueId}/standings`)
                if (standingsResponse.ok) {
                  const standingsData = await standingsResponse.json()
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
              const eloResponse = await fetch('/api/player/elo-history')
              if (eloResponse.ok) {
                const eloData = await eloResponse.json()
                setEloHistory(eloData)
              }
            } catch (eloError) {
              console.error('Error fetching ELO history:', eloError)
            }
            
            // Check for first round announcement - USE LOCAL VARIABLE, NOT STATE
            const firstRound = matches.find(match => match.round === 1)
            if (firstRound) {
              setFirstRoundMatch(firstRound)
              const hasSeenAnnouncement = fetchedSeenAnnouncements.includes(announcementContent.firstRoundMatch.id)
              setShowFirstRoundAnnouncement(!hasSeenAnnouncement)
            }
            
            // Check for league-specific announcements
            const leagueAnnouncements = getLeagueSpecificAnnouncements(
              playerData.registrations,
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
    } catch (error) {
      console.error('Error fetching player data:', error)
      setPlayer(null)
    } finally {
      setLoading(false)
    }
  }, [router, status])

  const handleCloseFirstRoundAnnouncement = async () => {
    setShowFirstRoundAnnouncement(false)
    
    try {
      const response = await fetch('/api/player/messages/mark-seen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageId: announcementContent.firstRoundMatch.id })
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
      const response = await fetch('/api/player/messages/mark-seen', {
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
    
    return {
      ...announcementContent.firstRoundMatch,
      es: {
        ...announcementContent.firstRoundMatch.es,
        content: announcementContent.firstRoundMatch.es.getContent(
          player.name,
          opponent.name,
          opponent.whatsapp,
          { level: player.level }
        )
      },
      en: {
        ...announcementContent.firstRoundMatch.en,
        content: announcementContent.firstRoundMatch.en.getContent(
          player.name,
          opponent.name,
          opponent.whatsapp,
          { level: player.level }
        )
      }
    }
  }

  useEffect(() => {
    fetchPlayerData()
  }, [status])

  return {
    player,
    loading,
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
    refetch: fetchPlayerData
  }
}
