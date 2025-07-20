import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { announcementContent } from '../content/announcementContent'

export function usePlayerDashboard() {
  const [player, setPlayer] = useState(null)
  const [loading, setLoading] = useState(true)
  const [recentMatches, setRecentMatches] = useState([])
  const [upcomingMatches, setUpcomingMatches] = useState([])
  const [firstRoundMatch, setFirstRoundMatch] = useState(null)
  const [showFirstRoundAnnouncement, setShowFirstRoundAnnouncement] = useState(false)
  const [seenAnnouncements, setSeenAnnouncements] = useState([])
  const [calculatedStats, setCalculatedStats] = useState({
    matchesPlayed: 0,
    matchesWon: 0,
    totalPoints: 0,
    eloRating: 1200
  })
  const { data: session, status } = useSession()
  const router = useRouter()

  const calculatePointsFromMatch = (match, playerId) => {
    // Logic from Match model's calculatePoints method
    if (!match.result || !match.result.winner || match.status !== 'completed') {
      return 0
    }

    const isPlayer1 = match.players.player1._id === playerId
    const isWinner = match.result.winner === playerId
    
    let playerSetsWon = 0
    let opponentSetsWon = 0

    if (match.result.score?.walkover) {
      // Walkover counts as 2-0
      playerSetsWon = isWinner ? 2 : 0
      opponentSetsWon = isWinner ? 0 : 2
    } else if (match.result.score?.sets && match.result.score.sets.length > 0) {
      // Count sets won by each player
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

    // Calculate points based on sets won
    // Win 2-0: 3 points, Win 2-1: 2 points, Lose 1-2: 1 point, Lose 0-2: 0 points
    if (playerSetsWon === 2 && opponentSetsWon === 0) return 3
    if (playerSetsWon === 2 && opponentSetsWon === 1) return 2
    if (playerSetsWon === 1 && opponentSetsWon === 2) return 1
    if (playerSetsWon === 0 && opponentSetsWon === 2) return 0
    
    return 0
  }

  const fetchPlayerData = useCallback(async () => {
    try {
      // Check if we have a session
      if (status === 'loading') return
      if (status === 'unauthenticated') {
        router.push('/login')
        return
      }
      
      // Fetch user preferences separately
      const preferencesResponse = await fetch('/api/player/preferences')
      if (preferencesResponse.ok) {
        const preferencesData = await preferencesResponse.json()
        setSeenAnnouncements(preferencesData.seenAnnouncements || [])
      }
      
      // Then get player profile data
      const profileResponse = await fetch('/api/player/profile')
      if (profileResponse.ok) {
        const profileData = await profileResponse.json()
        if (profileData.player) {
          setPlayer(profileData.player)
          
          // Get matches and calculate stats
          const matchesResponse = await fetch('/api/player/matches')
          if (matchesResponse.ok) {
            const matchesData = await matchesResponse.json()
            const matches = matchesData.matches || []
            const playerId = profileData.player._id
            
            console.log('Fetched matches:', matches.length, 'matches')
            
            // Calculate stats from matches (single source of truth)
            let stats = {
              matchesPlayed: 0,
              matchesWon: 0,
              totalPoints: 0,
              eloRating: profileData.player.stats?.eloRating || 1200
            }
            
            // Process matches and calculate stats
            const processedMatches = matches.map(match => {
              const isPlayer1 = match.players.player1._id === playerId
              const opponent = isPlayer1 ? match.players.player2 : match.players.player1
              
              const baseMatch = {
                _id: match._id,
                round: match.round,
                opponent: opponent.name,
                opponentId: opponent._id,
                opponentWhatsapp: opponent.whatsapp
              }
              
              if (match.status === 'completed' && match.result && match.result.winner) {
                // Completed match - update stats
                stats.matchesPlayed++
                
                const isWinner = match.result.winner === playerId
                if (isWinner) {
                  stats.matchesWon++
                }
                
                // Calculate points for this match
                const points = calculatePointsFromMatch(match, playerId)
                stats.totalPoints += points
                
                console.log(`Match round ${match.round}: ${isWinner ? 'Won' : 'Lost'}, Points: ${points}`)
                
                // Extract ELO change
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
                // Upcoming match
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
            
            // Update calculated stats
            setCalculatedStats(stats)
            console.log('Calculated stats:', stats)
            
            // Update player object with calculated stats
            setPlayer(prev => ({
              ...prev,
              stats: {
                ...prev.stats,
                ...stats
              }
            }))
            
            // Separate and sort matches
            const recent = processedMatches
              .filter(m => m.type === 'recent')
              .sort((a, b) => new Date(b.playedAt) - new Date(a.playedAt))
            
            const upcoming = processedMatches
              .filter(m => m.type === 'upcoming')
              .sort((a, b) => {
                // Sort by confirmed date first, then by round
                if (a.scheduled && b.scheduled) {
                  return new Date(a.date) - new Date(b.date)
                }
                if (a.scheduled) return -1
                if (b.scheduled) return 1
                return a.round - b.round
              })
            
            console.log('Recent matches:', recent.length)
            console.log('Upcoming matches:', upcoming.length)
            
            setRecentMatches(recent)
            setUpcomingMatches(upcoming)
            
            // Check for first round announcement
            const firstRound = matches.find(match => match.round === 1)
            if (firstRound) {
              setFirstRoundMatch(firstRound)
              // Check if announcement has been seen using the fetched preferences
              const hasSeenAnnouncement = seenAnnouncements.includes(announcementContent.firstRoundMatch.id)
              setShowFirstRoundAnnouncement(!hasSeenAnnouncement)
            }
          }
        } else {
          // Profile response was ok but no player data
          setPlayer(null)
        }
      } else {
        // No player profile found
        setPlayer(null)
      }
    } catch (error) {
      console.error('Error fetching player data:', error)
      setPlayer(null)
    } finally {
      setLoading(false)
    }
  }, [router, status, seenAnnouncements])

  const handleCloseFirstRoundAnnouncement = async () => {
    setShowFirstRoundAnnouncement(false)
    
    // Mark announcement as seen
    try {
      const response = await fetch('/api/player/messages/mark-seen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageId: announcementContent.firstRoundMatch.id })
      })
      
      if (response.ok) {
        const data = await response.json()
        // Update local state with new seen announcements
        setSeenAnnouncements(data.seenAnnouncements || [])
      }
    } catch (error) {
      console.error('Failed to mark announcement as seen:', error)
    }
  }

  // Prepare dynamic announcement content
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

  // Initial fetch
  useEffect(() => {
    fetchPlayerData()
  }, [status]) // Only re-run when auth status changes

  // Re-check announcements when seenAnnouncements changes
  useEffect(() => {
    if (firstRoundMatch && seenAnnouncements.length > 0) {
      const hasSeenAnnouncement = seenAnnouncements.includes(announcementContent.firstRoundMatch.id)
      setShowFirstRoundAnnouncement(!hasSeenAnnouncement)
    }
  }, [seenAnnouncements, firstRoundMatch])

  return {
    player,
    loading,
    recentMatches,
    upcomingMatches,
    firstRoundMatch,
    showFirstRoundAnnouncement,
    session,
    handleCloseFirstRoundAnnouncement,
    getDynamicFirstRoundAnnouncement,
    refetch: fetchPlayerData
  }
} 
