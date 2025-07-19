'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { useLanguage } from '../../../lib/hooks/useLanguage'
import { useWelcomeModal } from '../../../lib/hooks/useWelcomeModal'
import { usePlayerDashboard } from '../../../lib/hooks/usePlayerDashboard'
import WelcomeModal from '../../../components/ui/WelcomeModal'
import AnnouncementModal from '../../../components/ui/AnnouncementModal'
import DashboardHeader from '../../../components/player/DashboardHeader'
import StatsCards from '../../../components/player/StatsCards'
import LeagueCard from '../../../components/player/LeagueCard'
import { RecentMatches, UpcomingMatches } from '../../../components/player/MatchActivity'
import QuickActions from '../../../components/player/QuickActions'
import { dashboardStyles } from '../../../styles/dashboard'

export default function PlayerDashboard() {
  const { language, isLanguageLoaded } = useLanguage()
  const { showWelcome, playerName, closeWelcome } = useWelcomeModal()
  const { data: session, status } = useSession()
  const [player, setPlayer] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showFirstRoundAnnouncement, setShowFirstRoundAnnouncement] = useState(false)
  const [firstRoundMatch, setFirstRoundMatch] = useState(null)
  const [recentMatches, setRecentMatches] = useState([])
  const [upcomingMatches, setUpcomingMatches] = useState([])
  const [calculatedStats, setCalculatedStats] = useState({
    matchesPlayed: 0,
    matchesWon: 0,
    totalPoints: 0,
    eloRating: 1200
  })

  useEffect(() => {
    if (status === 'loading') return
    if (status === 'unauthenticated') {
      window.location.href = '/login'
      return
    }
    fetchData()
  }, [status])

  const calculatePointsFromMatch = (match, playerId) => {
    // Logic from Match model's calculatePoints method
    if (!match.result || !match.result.winner || match.status !== 'completed') {
      return 0
    }

    const isPlayer1 = match.players.player1._id === playerId
    const isWinner = match.result.winner === playerId
    
    let playerSetsWon = 0
    let opponentSetsWon = 0

    if (match.result.score.walkover) {
      // Walkover counts as 2-0
      playerSetsWon = isWinner ? 2 : 0
      opponentSetsWon = isWinner ? 0 : 2
    } else if (match.result.score.sets && match.result.score.sets.length > 0) {
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

  const fetchData = async () => {
    try {
      // Get player profile
      const profileResponse = await fetch('/api/player/profile')
      if (profileResponse.ok) {
        const profileData = await profileResponse.json()
        setPlayer(profileData.player)
        
        // Get user preferences to check seen announcements
        const prefsResponse = await fetch('/api/player/preferences')
        let seenAnnouncements = []
        if (prefsResponse.ok) {
          const prefs = await prefsResponse.json()
          seenAnnouncements = prefs.seenAnnouncements || []
        }
        
        // Get matches
        const matchesResponse = await fetch('/api/player/matches')
        if (matchesResponse.ok) {
          const matchesData = await matchesResponse.json()
          const matches = matchesData.matches || []
          const playerId = profileData.player._id
          
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
          
          setRecentMatches(recent)
          setUpcomingMatches(upcoming)
          
          // Check for first round announcement
          const firstRound = matches.find(match => match.round === 1)
          if (firstRound && !seenAnnouncements.includes('first-round-match-2025')) {
            setFirstRoundMatch(firstRound)
            setShowFirstRoundAnnouncement(true)
          }
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCloseFirstRoundAnnouncement = async () => {
    setShowFirstRoundAnnouncement(false)
    
    // Mark as seen
    try {
      await fetch('/api/player/messages/mark-seen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageId: 'first-round-match-2025' })
      })
    } catch (error) {
      console.error('Failed to mark announcement as seen:', error)
    }
  }

  const getDynamicFirstRoundAnnouncement = () => {
    if (!firstRoundMatch || !player) return null
    
    const opponent = firstRoundMatch.players.player1._id === player._id 
      ? firstRoundMatch.players.player2 
      : firstRoundMatch.players.player1
    
    const announcementContent = {
      es: {
        title: '🎾 ¡Tu Primera Ronda ya está aquí!',
        subtitle: 'Tu rival te está esperando',
        buttonText: 'Entendido',
        content: `<p><strong>¡Hola ${player.name}!</strong></p>
        <p>Tu rival de primera ronda es <strong>${opponent.name}</strong>.</p>
        <p>📱 Contacta con ${opponent.name}: <strong>${opponent.whatsapp}</strong></p>
        <p>¡Mucha suerte y que gane el mejor!</p>`
      },
      en: {
        title: '🎾 Your First Round is here!',
        subtitle: 'Your opponent is waiting',
        buttonText: 'Got it',
        content: `<p><strong>Hello ${player.name}!</strong></p>
        <p>Your first round opponent is <strong>${opponent.name}</strong>.</p>
        <p>📱 Contact ${opponent.name}: <strong>${opponent.whatsapp}</strong></p>
        <p>Good luck and may the best player win!</p>`
      }
    }
    
    return announcementContent
  }

  // Show loading until both language and data are loaded
  if (!isLanguageLoaded || loading || status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-gray-200 rounded-full"></div>
            <div className="absolute top-0 left-0 w-16 h-16 border-4 border-parque-purple rounded-full animate-spin border-t-transparent"></div>
          </div>
          <p className="mt-4 text-gray-600 animate-pulse">
            {language === 'es' ? 'Cargando...' : 'Loading...'}
          </p>
        </div>
      </div>
    )
  }

  if (!player) {
    return (
      <div className="text-center py-12 px-4">
        <div className="max-w-md mx-auto">
          <div className="w-24 h-24 bg-gradient-to-br from-parque-purple to-purple-700 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {language === 'es' ? 'Bienvenido al Portal del Jugador' : 'Welcome to Player Portal'}
          </h2>
          <p className="text-gray-600 mb-6">
            {language === 'es' 
              ? 'No se encontraron datos del jugador.' 
              : 'No player data found.'}
          </p>
          <Link
            href="/player/profile"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-parque-purple to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-purple-500/25 font-medium"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            {language === 'es' ? 'Configurar Perfil' : 'Set Up Profile'}
          </Link>
        </div>
      </div>
    )
  }

  // Create player object with calculated stats
  const playerWithCalculatedStats = {
    ...player,
    stats: {
      ...player.stats,
      ...calculatedStats
    }
  }

  return (
    <>
      <style jsx global>{dashboardStyles}</style>
      
      <div className="space-y-6 sm:space-y-8 animate-fade-in-up">
        {/* Welcome Header */}
        <DashboardHeader player={playerWithCalculatedStats} language={language} />

        {/* Stats Cards with calculated stats */}
        <StatsCards player={playerWithCalculatedStats} language={language} />

        {/* League Card */}
        <LeagueCard player={playerWithCalculatedStats} language={language} />

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          <RecentMatches matches={recentMatches} language={language} />
          <UpcomingMatches matches={upcomingMatches} language={language} />
        </div>

        {/* Quick Actions */}
        <QuickActions language={language} />

        {/* Welcome Modal */}
        <WelcomeModal
          isOpen={showWelcome}
          onClose={closeWelcome}
          playerName={playerName || player?.name || 'Player'}
        />
        
        {/* First Round Match Announcement */}
        {showFirstRoundAnnouncement && (
          <AnnouncementModal
            isOpen={true}
            onClose={handleCloseFirstRoundAnnouncement}
            announcement={getDynamicFirstRoundAnnouncement()}
          />
        )}
      </div>
    </>
  )
}
