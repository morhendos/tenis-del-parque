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
  const { data: session, status } = useSession()
  const router = useRouter()

  const fetchPlayerData = useCallback(async () => {
    try {
      // Check if we have a session
      if (status === 'loading') return
      if (status === 'unauthenticated') {
        router.push('/login')
        return
      }
      
      // Then get player profile data
      const profileResponse = await fetch('/api/player/profile')
      if (profileResponse.ok) {
        const profileData = await profileResponse.json()
        if (profileData.player) {
          setPlayer(profileData.player)
          
          // Check for first round matches - FIXED ENDPOINT
          const matchesResponse = await fetch('/api/player/matches')
          if (matchesResponse.ok) {
            const matchesData = await matchesResponse.json()
            const firstRound = matchesData.matches?.find(match => match.round === 1)
            
            if (firstRound && !session.user.seenAnnouncements?.includes(announcementContent.firstRoundMatch.id)) {
              setFirstRoundMatch(firstRound)
              setShowFirstRoundAnnouncement(true)
            }
          }
        } else {
          // Profile response was ok but no player data
          setPlayer(null)
        }
      } else {
        // No player profile found - don't create fallback with email prefix
        setPlayer(null)
      }
    } catch (error) {
      console.error('Error fetching player data:', error)
      setPlayer(null)
    } finally {
      setLoading(false)
    }
  }, [router, status, session])

  const handleCloseFirstRoundAnnouncement = async () => {
    // Mark announcement as seen
    try {
      await fetch('/api/player/messages/mark-seen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageIds: [announcementContent.firstRoundMatch.id] })
      })
    } catch (error) {
      console.error('Failed to mark announcement as seen:', error)
    }
    
    setShowFirstRoundAnnouncement(false)
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

  useEffect(() => {
    fetchPlayerData()
  }, [fetchPlayerData])

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
