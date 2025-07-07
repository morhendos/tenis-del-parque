'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useLanguage } from '../../../lib/hooks/useLanguage'
import { useWelcomeModal } from '../../../lib/hooks/useWelcomeModal'
import WelcomeModal from '../../../components/ui/WelcomeModal'
import AnnouncementModal from '../../../components/ui/AnnouncementModal'
import { announcementContent } from '../../../lib/content/announcementContent'

export default function PlayerDashboard() {
  const { language, isLanguageLoaded } = useLanguage()
  const [player, setPlayer] = useState(null)
  const [loading, setLoading] = useState(true)
  const [recentMatches, setRecentMatches] = useState([])
  const [upcomingMatches, setUpcomingMatches] = useState([])
  const [firstRoundMatch, setFirstRoundMatch] = useState(null)
  const [showFirstRoundAnnouncement, setShowFirstRoundAnnouncement] = useState(false)
  const [session, setSession] = useState(null)
  const router = useRouter()
  const { showWelcome, playerName, closeWelcome } = useWelcomeModal()

  const fetchPlayerData = useCallback(async () => {
    try {
      // First get the user info
      const authResponse = await fetch('/api/auth/check')
      if (!authResponse.ok) {
        router.push('/login')
        return
      }
      
      const authData = await authResponse.json()
      const userEmail = authData.user.email
      setSession(authData)
      
      // Then get player profile data
      const profileResponse = await fetch('/api/player/profile')
      if (profileResponse.ok) {
        const profileData = await profileResponse.json()
        if (profileData.player) {
          setPlayer(profileData.player)
          
          // Check for first round matches
          const matchesResponse = await fetch('/api/player/matches/schedule')
          if (matchesResponse.ok) {
            const matchesData = await matchesResponse.json()
            const firstRound = matchesData.matches?.find(match => match.round === 1)
            
            if (firstRound && !authData.user.seenAnnouncements?.includes(announcementContent.firstRoundMatch.id)) {
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
  }, [router])

  useEffect(() => {
    fetchPlayerData()
  }, [fetchPlayerData])

  const handleCloseFirstRoundAnnouncement = async () => {
    // Mark announcement as seen
    try {
      await fetch('/api/player/messages/mark-seen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageId: announcementContent.firstRoundMatch.id })
      })
      
      // Update local state
      setSession(prev => ({
        ...prev,
        user: {
          ...prev.user,
          seenAnnouncements: [...(prev.user.seenAnnouncements || []), announcementContent.firstRoundMatch.id]
        }
      }))
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

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    })
  }

  // Show loading until both language and data are loaded to prevent flickering
  if (!isLanguageLoaded || loading) {
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

  return (
    <>
      <style jsx global>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(1rem);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slide-in-left {
          from {
            opacity: 0;
            transform: translateX(-1rem);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes slide-in-right {
          from {
            opacity: 0;
            transform: translateX(1rem);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.5s ease-out;
        }
        
        .animate-slide-in-left {
          animation: slide-in-left 0.5s ease-out;
        }
        
        .animate-slide-in-right {
          animation: slide-in-right 0.5s ease-out;
        }
        
        .animate-scale-in {
          animation: scale-in 0.5s ease-out;
        }
        
        .stat-card {
          transition: all 0.3s ease;
        }
        
        .stat-card:hover {
          transform: translateY(-4px);
        }
      `}</style>
      
      <div className="space-y-6 sm:space-y-8 animate-fade-in-up">
        {/* Welcome Header - Enhanced Mobile Design */}
        <div className="relative overflow-hidden bg-gradient-to-br from-parque-purple via-purple-600 to-purple-700 rounded-2xl text-white p-6 sm:p-8 shadow-xl">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-white rounded-full"></div>
            <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-white rounded-full"></div>
          </div>
          
          <div className="relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="animate-slide-in-left">
                <div className="flex items-center gap-2 mb-2">
                  <h1 className="text-2xl sm:text-3xl font-bold">
                    {language === 'es' ? '¡Hola' : 'Hello'}, {player.name}!
                  </h1>
                  <span className="text-2xl animate-pulse">👋</span>
                </div>
                <p className="text-purple-100 text-sm sm:text-base">
                  {language === 'es' 
                    ? 'Tu centro de control personal de tenis'
                    : 'Your personal tennis command center'}
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 animate-slide-in-right">
                <Link
                  href="/player/matches"
                  className="inline-flex items-center justify-center px-5 py-3 bg-white/20 backdrop-blur-sm border border-white/30 text-white rounded-xl hover:bg-white/30 transition-all transform hover:scale-105 active:scale-95 text-sm font-medium shadow-lg"
                >
                  <span className="mr-2 text-lg">🎾</span>
                  {language === 'es' ? 'Mis Partidos' : 'My Matches'}
                </Link>
                <Link
                  href="/player/league"
                  className="inline-flex items-center justify-center px-5 py-3 bg-white text-parque-purple rounded-xl hover:bg-purple-50 transition-all transform hover:scale-105 active:scale-95 text-sm font-medium shadow-lg"
                >
                  <span className="mr-2 text-lg">🏆</span>
                  {language === 'es' ? 'Ver Liga' : 'View League'}
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards - Enhanced Mobile Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* ELO Rating Card */}
          <div className="stat-card bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-sm p-5 sm:p-6 border border-blue-100" style={{ animationDelay: '0.1s' }}>
            <div className="flex flex-col">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mb-3 shadow-lg shadow-blue-500/20">
                <span className="text-2xl">🎯</span>
              </div>
              <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">ELO Rating</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900">{player.stats?.eloRating || 1200}</p>
            </div>
          </div>

          {/* Matches Card */}
          <div className="stat-card bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl shadow-sm p-5 sm:p-6 border border-green-100" style={{ animationDelay: '0.2s' }}>
            <div className="flex flex-col">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mb-3 shadow-lg shadow-green-500/20">
                <span className="text-2xl">⚔️</span>
              </div>
              <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">
                {language === 'es' ? 'Partidos' : 'Matches'}
              </p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900">{player.stats?.matchesPlayed || 0}</p>
            </div>
          </div>

          {/* Wins Card */}
          <div className="stat-card bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl shadow-sm p-5 sm:p-6 border border-purple-100" style={{ animationDelay: '0.3s' }}>
            <div className="flex flex-col">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mb-3 shadow-lg shadow-purple-500/20">
                <span className="text-2xl">🏅</span>
              </div>
              <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">
                {language === 'es' ? 'Victorias' : 'Wins'}
              </p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900">{player.stats?.matchesWon || 0}</p>
            </div>
          </div>

          {/* Points Card */}
          <div className="stat-card bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl shadow-sm p-5 sm:p-6 border border-yellow-100" style={{ animationDelay: '0.4s' }}>
            <div className="flex flex-col">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center mb-3 shadow-lg shadow-yellow-500/20">
                <span className="text-2xl">⭐</span>
              </div>
              <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">
                {language === 'es' ? 'Puntos' : 'Points'}
              </p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900">{player.stats?.totalPoints || 0}</p>
            </div>
          </div>
        </div>

        {/* My League Card - Enhanced Mobile Design */}
        {player && player.league && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden transform transition-all hover:shadow-xl animate-scale-in" style={{ animationDelay: '0.5s' }}>
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-4">
              <h2 className="text-lg font-semibold text-white flex items-center">
                <span className="text-2xl mr-2">🏆</span>
                {language === 'es' ? 'Mi Liga' : 'My League'}
              </h2>
            </div>
            <div className="p-6">
              <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                {/* League Info */}
                <div className="flex items-center space-x-4">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-parque-purple to-purple-700 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
                    <span className="text-2xl">🎾</span>
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900">{player.league.name}</h3>
                    <p className="text-sm text-gray-600">{language === 'es' ? 'Temporada' : 'Season'}: {player.season}</p>
                    
                    {/* Stats Pills */}
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800">
                        ELO: {player.stats?.eloRating || 1200}
                      </span>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-green-100 to-emerald-100 text-green-800">
                        {language === 'es' ? 'Nivel' : 'Level'}: {player.level}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Action Button */}
                <Link
                  href="/player/league"
                  className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm font-medium rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-green-500/25"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                  {language === 'es' ? 'Ver Clasificación' : 'View Standings'}
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Recent Activity - Enhanced Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {/* Recent Matches */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-slide-in-left" style={{ animationDelay: '0.6s' }}>
            <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <span className="text-xl mr-2">📋</span>
                {language === 'es' ? 'Partidos Recientes' : 'Recent Matches'}
              </h3>
            </div>
            <div className="p-6">
              {recentMatches.length > 0 ? (
                <div className="space-y-3">
                  {recentMatches.slice(0, 3).map((match, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl hover:from-gray-100 hover:to-gray-200 transition-all">
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          match.result === 'won' 
                            ? 'bg-gradient-to-br from-green-500 to-emerald-600' 
                            : 'bg-gradient-to-br from-red-500 to-pink-600'
                        }`}>
                          <span className="text-white text-lg">
                            {match.result === 'won' ? '✓' : '✗'}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">vs {match.opponent}</p>
                          <p className="text-sm text-gray-600">{formatDate(match.date)}</p>
                        </div>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                        match.result === 'won' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {match.result === 'won' 
                          ? (language === 'es' ? 'Victoria' : 'Won')
                          : (language === 'es' ? 'Derrota' : 'Lost')
                        }
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-5xl mb-3 animate-bounce">🎾</div>
                  <p className="text-gray-500">
                    {language === 'es' 
                      ? 'No hay partidos recientes'
                      : 'No recent matches'}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Upcoming Matches */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-slide-in-right" style={{ animationDelay: '0.7s' }}>
            <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-100">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <span className="text-xl mr-2">📅</span>
                {language === 'es' ? 'Próximos Partidos' : 'Upcoming Matches'}
              </h3>
            </div>
            <div className="p-6">
              {upcomingMatches.length > 0 ? (
                <div className="space-y-3">
                  {upcomingMatches.slice(0, 3).map((match, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl hover:from-blue-100 hover:to-indigo-100 transition-all">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-lg">📅</span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">vs {match.opponent}</p>
                          <p className="text-sm text-gray-600">{formatDate(match.date)}</p>
                        </div>
                      </div>
                      <div className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                        {language === 'es' ? 'Programado' : 'Scheduled'}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-5xl mb-3">📅</div>
                  <p className="text-gray-500">
                    {language === 'es' 
                      ? 'No hay partidos programados'
                      : 'No upcoming matches'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions - Enhanced Mobile Grid */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-scale-in" style={{ animationDelay: '0.8s' }}>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <span className="text-xl mr-2">⚡</span>
            {language === 'es' ? 'Acciones Rápidas' : 'Quick Actions'}
          </h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <Link
              href="/player/matches"
              className="flex flex-col items-center justify-center px-4 py-6 bg-gradient-to-br from-purple-50 to-pink-50 text-parque-purple rounded-xl hover:from-purple-100 hover:to-pink-100 transition-all transform hover:scale-105 active:scale-95 text-sm font-medium border border-purple-100"
            >
              <span className="text-3xl mb-2">🎾</span>
              {language === 'es' ? 'Ver Partidos' : 'View Matches'}
            </Link>
            <Link
              href="/player/league"
              className="flex flex-col items-center justify-center px-4 py-6 bg-gradient-to-br from-green-50 to-emerald-50 text-green-700 rounded-xl hover:from-green-100 hover:to-emerald-100 transition-all transform hover:scale-105 active:scale-95 text-sm font-medium border border-green-100"
            >
              <span className="text-3xl mb-2">🏆</span>
              {language === 'es' ? 'Clasificación' : 'Standings'}
            </Link>
            <Link
              href="/player/profile"
              className="flex flex-col items-center justify-center px-4 py-6 bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-700 rounded-xl hover:from-blue-100 hover:to-indigo-100 transition-all transform hover:scale-105 active:scale-95 text-sm font-medium border border-blue-100"
            >
              <span className="text-3xl mb-2">👤</span>
              {language === 'es' ? 'Mi Perfil' : 'My Profile'}
            </Link>
            <Link
              href="/player/rules"
              className="flex flex-col items-center justify-center px-4 py-6 bg-gradient-to-br from-yellow-50 to-orange-50 text-yellow-700 rounded-xl hover:from-yellow-100 hover:to-orange-100 transition-all transform hover:scale-105 active:scale-95 text-sm font-medium border border-yellow-100"
            >
              <span className="text-3xl mb-2">📋</span>
              {language === 'es' ? 'Reglas' : 'Rules'}
            </Link>
          </div>
        </div>

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
