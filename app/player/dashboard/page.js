'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useLanguage } from '../../../lib/hooks/useLanguage'
import { useWelcomeModal } from '../../../lib/hooks/useWelcomeModal'
import WelcomeModal from '../../../components/ui/WelcomeModal'

export default function PlayerDashboard() {
  const { language, isLanguageLoaded } = useLanguage()
  const [player, setPlayer] = useState(null)
  const [loading, setLoading] = useState(true)
  const [recentMatches, setRecentMatches] = useState([])
  const [upcomingMatches, setUpcomingMatches] = useState([])
  const router = useRouter()
  const { showWelcome, playerName, closeWelcome } = useWelcomeModal()



  useEffect(() => {
    fetchPlayerData()
  }, [])

  const fetchPlayerData = async () => {
    try {
      // First get the user info
      const authResponse = await fetch('/api/auth/check')
      if (!authResponse.ok) {
        router.push('/login')
        return
      }
      
      const authData = await authResponse.json()
      const userEmail = authData.user.email
      
      // Then get player profile data
      const profileResponse = await fetch('/api/player/profile')
      if (profileResponse.ok) {
        const profileData = await profileResponse.json()
        if (profileData.player) {
          setPlayer(profileData.player)
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-parque-purple mx-auto"></div>
          <p className="mt-4 text-gray-600">
            {language === 'es' ? 'Cargando...' : 'Loading...'}
          </p>
        </div>
      </div>
    )
  }

  if (!player) {
    return (
      <div className="text-center py-12">
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
          className="inline-flex items-center px-4 py-2 bg-parque-purple text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          {language === 'es' ? 'Configurar Perfil' : 'Set Up Profile'}
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-parque-purple to-purple-600 rounded-xl text-white p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">
              {language === 'es' ? '¡Hola' : 'Hello'}, {player.name}! 👋
            </h1>
            <p className="text-purple-100 text-sm sm:text-base">
              {language === 'es' 
                ? 'Bienvenido! Aquí tienes un resumen de tu actividad.'
                : 'Welcome! Here\'s a summary of your activity.'}
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
            <Link
              href="/player/matches"
              className="inline-flex items-center justify-center px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors text-sm font-medium"
            >
              <span className="mr-2">🎾</span>
              {language === 'es' ? 'Mis Partidos' : 'My Matches'}
            </Link>
            <Link
              href="/player/league"
              className="inline-flex items-center justify-center px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors text-sm font-medium"
            >
              <span className="mr-2">🏆</span>
              {language === 'es' ? 'Ver Liga' : 'View League'}
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <span className="text-xl">🎯</span>
            </div>
            <div className="ml-3 sm:ml-4">
              <p className="text-xs sm:text-sm font-medium text-gray-600">ELO</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900">{player.stats?.eloRating || 1200}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <span className="text-xl">🏆</span>
            </div>
            <div className="ml-3 sm:ml-4">
              <p className="text-xs sm:text-sm font-medium text-gray-600">
                {language === 'es' ? 'Partidos' : 'Matches'}
              </p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900">{player.stats?.matchesPlayed || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
              <span className="text-xl">📈</span>
            </div>
            <div className="ml-3 sm:ml-4">
              <p className="text-xs sm:text-sm font-medium text-gray-600">
                {language === 'es' ? 'Victorias' : 'Wins'}
              </p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900">{player.stats?.matchesWon || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
              <span className="text-xl">🏆</span>
            </div>
            <div className="ml-3 sm:ml-4">
              <p className="text-xs sm:text-sm font-medium text-gray-600">
                {language === 'es' ? 'Puntos' : 'Points'}
              </p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900">{player.stats?.totalPoints || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* My League Card - Mobile Optimized */}
      {player && player.league && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl shadow-lg border border-green-200">
          <div className="px-4 sm:px-6 py-4 border-b border-green-200">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <span className="text-2xl mr-2">🏆</span>
              {language === 'es' ? 'Mi Liga' : 'My League'}
            </h2>
          </div>
          <div className="p-4 sm:p-6">
            {/* Mobile-first responsive layout */}
            <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
              {/* Left section - League info */}
              <div className="flex items-center space-x-3 sm:space-x-4">
                {/* Logo - smaller on mobile, tennis emoji */}
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-parque-purple to-purple-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                  <span className="text-lg sm:text-xl">🎾</span>
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 truncate">{player.league.name}</h3>
                  <p className="text-sm text-gray-600 font-medium">{language === 'es' ? 'Temporada' : 'Season'}: {player.season}</p>
                  
                  {/* Stats - responsive layout */}
                  <div className="flex flex-col xs:flex-row xs:items-center gap-2 mt-2">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 w-fit">
                      ELO: {player.stats?.eloRating || 1200}
                    </span>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 w-fit">
                      {language === 'es' ? 'Nivel' : 'Level'}: {player.level}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Right section - Action button */}
              <div className="flex-shrink-0 w-full sm:w-auto">
                <Link
                  href="/player/league"
                  className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-3 bg-gradient-to-r from-parque-purple to-purple-600 text-white text-sm font-medium rounded-lg hover:from-purple-700 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  <span className="text-lg mr-2">🔗</span>
                  {language === 'es' ? 'Ver Liga' : 'View League'}
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        {/* Recent Matches */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              {language === 'es' ? 'Partidos Recientes' : 'Recent Matches'}
            </h3>
          </div>
          <div className="p-4 sm:p-6">
            {recentMatches.length > 0 ? (
              <div className="space-y-4">
                {recentMatches.slice(0, 3).map((match, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">vs {match.opponent}</p>
                      <p className="text-sm text-gray-600">{formatDate(match.date)}</p>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
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
              <div className="text-center py-8">
                <div className="text-4xl mb-2">🎾</div>
                <p className="text-gray-500 text-sm">
                  {language === 'es' 
                    ? 'No hay partidos recientes'
                    : 'No recent matches'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Matches */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              {language === 'es' ? 'Próximos Partidos' : 'Upcoming Matches'}
            </h3>
          </div>
          <div className="p-4 sm:p-6">
            {upcomingMatches.length > 0 ? (
              <div className="space-y-4">
                {upcomingMatches.slice(0, 3).map((match, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">vs {match.opponent}</p>
                      <p className="text-sm text-gray-600">{formatDate(match.date)}</p>
                    </div>
                    <div className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                      {language === 'es' ? 'Programado' : 'Scheduled'}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">📅</div>
                <p className="text-gray-500 text-sm">
                  {language === 'es' 
                    ? 'No hay partidos programados'
                    : 'No upcoming matches'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {language === 'es' ? 'Acciones Rápidas' : 'Quick Actions'}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Link
            href="/player/matches"
            className="flex items-center justify-center px-4 py-3 bg-purple-50 text-parque-purple rounded-lg hover:bg-purple-100 transition-colors text-sm font-medium"
          >
            <span className="mr-2">🎾</span>
            {language === 'es' ? 'Ver Partidos' : 'View Matches'}
          </Link>
          <Link
            href="/player/league"
            className="flex items-center justify-center px-4 py-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors text-sm font-medium"
          >
            <span className="mr-2">🏆</span>
            {language === 'es' ? 'Clasificación' : 'Standings'}
          </Link>
          <Link
            href="/player/profile"
            className="flex items-center justify-center px-4 py-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
          >
            <span className="mr-2">👤</span>
            {language === 'es' ? 'Mi Perfil' : 'My Profile'}
          </Link>
          <Link
            href="/player/rules"
            className="flex items-center justify-center px-4 py-3 bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100 transition-colors text-sm font-medium"
          >
            <span className="mr-2">📋</span>
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
    </div>
  )
}
