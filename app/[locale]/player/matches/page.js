'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import MatchCard from '@/components/player/MatchCard'
import { MatchModals } from '@/components/player/MatchModals'
import MatchResultCard from '@/components/player/MatchResultCard'
import { toast } from '@/components/ui/Toast'
import { processMatchResult } from '@/lib/utils/matchResultUtils'
import { TennisPreloaderInline } from '@/components/ui/TennisPreloader'

export default function PlayerMatches() {
  const params = useParams()
  const locale = params.locale || 'es'
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [player, setPlayer] = useState(null)
  const [leaguePlayers, setLeaguePlayers] = useState([])
  const [showPlayers, setShowPlayers] = useState(false)
  const [activeTab, setActiveTab] = useState('upcoming')
  const [showResultModal, setShowResultModal] = useState(false)
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [selectedMatch, setSelectedMatch] = useState(null)
  const [isEditingSchedule, setIsEditingSchedule] = useState(false)
  const [showResultCard, setShowResultCard] = useState(false)
  const [submittedMatch, setSubmittedMatch] = useState(null)
  const [isWinner, setIsWinner] = useState(false)
  const [selectedLeagueId, setSelectedLeagueId] = useState(null) // For multi-league filtering
  const router = useRouter()

  useEffect(() => {
    fetchMatches()
    fetchPlayerData()
  }, [])

  const fetchLeaguePlayers = useCallback(async () => {
    if (!player?.league?._id) return
    
    try {
      // Extract unique players from matches
      const allPlayers = new Map()
      
      matches.forEach(match => {
        if (match.players.player1 && match.players.player1._id !== player._id) {
          allPlayers.set(match.players.player1._id, match.players.player1)
        }
        if (match.players.player2 && match.players.player2._id !== player._id) {
          allPlayers.set(match.players.player2._id, match.players.player2)
        }
      })
      
      setLeaguePlayers(Array.from(allPlayers.values()))
    } catch (error) {
      console.error('Error fetching league players:', error)
    }
  }, [matches, player])

  useEffect(() => {
    if (matches.length > 0 && player) {
      fetchLeaguePlayers()
    }
  }, [matches, player, fetchLeaguePlayers])

  const fetchPlayerData = async () => {
    try {
      const response = await fetch('/api/player/profile')
      if (response.ok) {
        const data = await response.json()
        setPlayer(data.player)
      }
    } catch (error) {
      console.error('Error fetching player data:', error)
    }
  }

  const fetchMatches = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/player/matches')
      
      if (!response.ok) {
        throw new Error('Failed to fetch matches')
      }

      const data = await response.json()
      setMatches(data.matches || [])
    } catch (error) {
      console.error('Error fetching matches:', error)
      setError('Failed to load matches')
    } finally {
      setLoading(false)
    }
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
    
    // Normalize phone number for WhatsApp
    let cleaned = opponent.whatsapp.replace(/[^0-9]/g, '')
    if (cleaned.startsWith('00')) {
      cleaned = cleaned.substring(2)
    }
    
    const message = locale === 'es' 
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
        // Find the match that was submitted
        const match = matches.find(m => m._id === data.matchId)
        
        if (match) {
          // Use the reusable utility to process the match result
          const { updatedMatch, isPlayerWinner } = processMatchResult(match, player, data)
          
          // Update matches state
          setMatches(prevMatches => 
            prevMatches.map(m => 
              m._id === data.matchId ? updatedMatch : m
            )
          )
          
          // Close the result modal first
          setShowResultModal(false)
          
          // Set up the result card display with a small delay to ensure modal is closed
          setTimeout(() => {
            setSubmittedMatch(updatedMatch)
            setIsWinner(isPlayerWinner)
            setShowResultCard(true)
          }, 100)
          
          // Show success toast
          toast.success(locale === 'es' ? 'Resultado enviado con éxito' : 'Result submitted successfully')
        } else {
          toast.error(locale === 'es' ? 'Error: Partido no encontrado' : 'Error: Match not found')
        }
      } else {
        toast.error(result.error || (locale === 'es' ? 'Error al enviar resultado' : 'Failed to submit result'))
      }
    } catch (error) {
      console.error('Error submitting result:', error)
      toast.error(locale === 'es' ? 'Error al enviar resultado' : 'Error submitting result')
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
        // Optimistically update the match in state
        setMatches(prevMatches => 
          prevMatches.map(match => {
            if (match._id === data.matchId) {
              // Update match schedule
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
            ? (locale === 'es' ? 'Programación actualizada con éxito' : 'Schedule updated successfully')
            : (locale === 'es' ? 'Partido programado con éxito' : 'Match scheduled successfully')
        )
      } else {
        toast.error(result.error || (locale === 'es' ? 'Error al programar partido' : 'Failed to schedule match'))
      }
    } catch (error) {
      console.error('Error scheduling match:', error)
      toast.error(locale === 'es' ? 'Error al programar partido' : 'Error scheduling match')
    }
  }

  // Detect if player has multiple leagues
  const hasMultipleLeagues = player?.registrations?.length > 1
  const playerLeagues = player?.registrations?.map(reg => reg.league) || []
  
  // Filter matches by selected league (only if multi-league)
  const filteredMatches = hasMultipleLeagues && selectedLeagueId
    ? matches.filter(m => m.league?._id === selectedLeagueId)
    : matches
  
  const upcomingMatches = filteredMatches.filter(m => m.status === 'scheduled' && !m.result?.winner)
  const completedMatches = filteredMatches.filter(m => m.status === 'completed' || m.result?.winner)

  const tabs = [
    { id: 'upcoming', label: locale === 'es' ? 'Próximos' : 'Upcoming', count: upcomingMatches.length },
    { id: 'completed', label: locale === 'es' ? 'Completados' : 'Completed', count: completedMatches.length }
  ]

  if (loading) {
    return (
      <TennisPreloaderInline 
        text={locale === 'es' ? 'Cargando partidos...' : 'Loading matches...'}
        locale={locale}
      />
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
          <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-red-600 font-medium">{error}</p>
          <button 
            onClick={fetchMatches}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all transform hover:scale-105 active:scale-95"
          >
            {locale === 'es' ? 'Reintentar' : 'Try Again'}
          </button>
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
        
        .animate-fade-in-up {
          animation: fade-in-up 0.5s ease-out;
        }
      `}</style>
      
      <div className="space-y-6 animate-fade-in-up">
        {/* Page Header - Mobile Optimized */}
        <div className="bg-gradient-to-r from-parque-purple to-purple-700 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
                🎾 {locale === 'es' ? 'Mis Partidos' : 'My Matches'}
              </h1>
              <p className="mt-2 text-purple-100 text-sm sm:text-base">
                {locale === 'es' 
                  ? 'Seguimiento de tu trayectoria y historial'
                  : 'Track your tennis journey and history'}
              </p>
            </div>
            <button
              onClick={() => router.push(`/${locale}/player/dashboard`)}
              className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-sm font-medium text-white hover:bg-white/30 transition-all transform hover:scale-105 active:scale-95"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              {locale === 'es' ? 'Volver' : 'Back'}
            </button>
          </div>
        </div>

        {/* League Selector - ONLY shown for multi-league players */}
        {hasMultipleLeagues && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <svg className="w-4 h-4 text-parque-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                {locale === 'es' ? 'Filtrar por Liga:' : 'Filter by League:'}
              </h3>
              {selectedLeagueId && (
                <button
                  onClick={() => setSelectedLeagueId(null)}
                  className="text-xs text-parque-purple hover:text-purple-700 font-medium"
                >
                  {locale === 'es' ? 'Ver todas' : 'Show all'}
                </button>
              )}
            </div>
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 pt-1 px-1">
              {playerLeagues.map((league) => (
                <button
                  key={league._id}
                  onClick={() => setSelectedLeagueId(
                    selectedLeagueId === league._id ? null : league._id
                  )}
                  className={`flex-shrink-0 px-4 py-2.5 rounded-xl font-medium text-sm transition-all ${
                    selectedLeagueId === league._id
                      ? 'bg-gradient-to-r from-parque-purple to-purple-700 text-white shadow-md transform scale-105'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <div className="flex flex-col items-start">
                    <span className="font-semibold">{league.name}</span>
                    {league.location?.city && (
                      <span className="text-xs opacity-75 mt-0.5 flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {league.location.city}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Filter Tabs - Touch Optimized */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <nav className="flex">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-4 px-4 font-medium text-sm transition-all relative ${
                  activeTab === tab.id
                    ? 'text-parque-purple bg-purple-50'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span className="flex items-center justify-center gap-2">
                  {tab.label}
                  <span className={`inline-flex items-center justify-center px-2 py-1 text-xs rounded-full ${
                    activeTab === tab.id
                      ? 'bg-parque-purple text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {tab.count}
                  </span>
                </span>
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-parque-purple"></div>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Matches List - Mobile Optimized Cards */}
        {activeTab === 'upcoming' && (
          <div className="space-y-4">
            {upcomingMatches.length > 0 ? (
              upcomingMatches.map((match, index) => (
                <MatchCard
                  key={match._id}
                  match={match}
                  player={player}
                  language={locale}
                  onSchedule={handleSchedule}
                  onResult={handleResult}
                  onWhatsApp={handleWhatsApp}
                  isUpcoming={true}
                  showActions={true}
                  showLeagueBadge={hasMultipleLeagues} // Only show league badge if multiple leagues
                  className="animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                />
              ))
            ) : (
              <div className="text-center py-16 bg-gray-50 rounded-2xl">
                <div className="text-6xl mb-4 animate-bounce">🎾</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {locale === 'es' ? 'No hay partidos programados' : 'No scheduled matches'}
                </h3>
                <p className="text-gray-500 text-sm">
                  {locale === 'es' 
                    ? 'Los nuevos emparejamientos se crean cada domingo'
                    : 'New pairings are created every Sunday'}
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'completed' && (
          <div className="space-y-4">
            {completedMatches.length > 0 ? (
              completedMatches.map((match, index) => (
                <MatchCard
                  key={match._id}
                  match={match}
                  player={player}
                  language={locale}
                  isUpcoming={false}
                  showActions={false}
                  showLeagueBadge={hasMultipleLeagues} // Only show league badge if multiple leagues
                  className="animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                />
              ))
            ) : (
              <div className="text-center py-16 bg-gray-50 rounded-2xl">
                <div className="text-6xl mb-4">🏆</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {locale === 'es' ? 'No hay partidos completados' : 'No completed matches'}
                </h3>
                <p className="text-gray-500 text-sm">
                  {locale === 'es' 
                    ? 'Los partidos completados aparecerán aquí'
                    : 'Completed matches will appear here'}
                </p>
              </div>
            )}
          </div>
        )}

        {/* League Players - Improved Mobile Layout */}
        {leaguePlayers.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <button
              onClick={() => setShowPlayers(!showPlayers)}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <h3 className="text-lg font-semibold text-gray-900">
                {locale === 'es' ? 'Jugadores de la Liga' : 'League Players'}
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-sm text-parque-purple font-medium">
                  {showPlayers 
                    ? (locale === 'es' ? 'Ocultar' : 'Hide') 
                    : (locale === 'es' ? 'Mostrar' : 'Show')} ({leaguePlayers.length})
                </span>
                <svg 
                  className={`w-5 h-5 text-gray-400 transition-transform ${showPlayers ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </button>
            {showPlayers && (
              <div className="p-6 pt-0">
                <p className="text-sm text-gray-600 mb-4">
                  {locale === 'es' 
                    ? 'Contacta a otros jugadores para partidos de práctica o para programar tus partidos de liga'
                    : 'Contact other players for practice matches or to schedule your league games'}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {leaguePlayers.map((opponent) => (
                    <div key={opponent._id} className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-parque-purple to-purple-700 rounded-full flex items-center justify-center shadow-sm">
                          <span className="text-sm font-medium text-white">
                            {opponent.name ? opponent.name.charAt(0).toUpperCase() : '?'}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-semibold text-gray-900 truncate">
                            {opponent.name}
                          </h4>
                          <p className="text-xs text-gray-500">
                            ELO: {opponent.stats?.eloRating || 1200}
                          </p>
                        </div>
                      </div>
                      {opponent.whatsapp && (
                        <a
                          href={`https://wa.me/${(() => {
                            // Normalize phone number for WhatsApp
                            let cleaned = opponent.whatsapp.replace(/[^0-9]/g, '')
                            if (cleaned.startsWith('00')) {
                              cleaned = cleaned.substring(2)
                            }
                            return cleaned
                          })()}?text=${encodeURIComponent(
                            locale === 'es' 
                              ? `Hola ${opponent.name}! ¿Cómo estás? Nos toca jugar nuestro partido de liga. ¿Cuándo y dónde te vendría bien?`
                              : `Hi ${opponent.name}! Hope you're doing well. We're scheduled to play our league match. When and where would work best for you?`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full inline-flex items-center justify-center px-3 py-2 text-xs font-medium text-white bg-green-500 rounded-lg hover:bg-green-600 transition-all transform hover:scale-105 active:scale-95"
                        >
                          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.487"/>
                          </svg>
                          WhatsApp
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Summary Stats - Enhanced Mobile Cards */}
        {matches.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              📊 {locale === 'es' ? 'Estadísticas de Partidos' : 'Match Statistics'}
            </h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gray-50 rounded-xl p-4 text-center transition-all hover:bg-gray-100">
                <div className="text-3xl font-bold text-gray-900">{matches.length}</div>
                <div className="text-sm text-gray-500 mt-1">
                  {locale === 'es' ? 'Total' : 'Total'}
                </div>
              </div>
              <div className="bg-green-50 rounded-xl p-4 text-center transition-all hover:bg-green-100">
                <div className="text-3xl font-bold text-green-600">
                  {matches.filter(m => m.result?.winner === player?._id).length}
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  {locale === 'es' ? 'Victorias' : 'Wins'}
                </div>
              </div>
              <div className="bg-red-50 rounded-xl p-4 text-center transition-all hover:bg-red-100">
                <div className="text-3xl font-bold text-red-600">
                  {matches.filter(m => m.result?.winner && m.result.winner !== player?._id).length}
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  {locale === 'es' ? 'Derrotas' : 'Losses'}
                </div>
              </div>
              <div className="bg-blue-50 rounded-xl p-4 text-center transition-all hover:bg-blue-100">
                <div className="text-3xl font-bold text-blue-600">
                  {matches.filter(m => m.status === 'scheduled' && !m.result?.winner).length}
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  {locale === 'es' ? 'Próximos' : 'Upcoming'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Match Modals */}
        <MatchModals
          showResultModal={showResultModal}
          showScheduleModal={showScheduleModal}
          selectedMatch={selectedMatch}
          player={player}
          language={locale}
          onCloseResult={() => setShowResultModal(false)}
          onCloseSchedule={() => {
            setShowScheduleModal(false)
            setIsEditingSchedule(false)
          }}
          onSubmitResult={handleSubmitResult}
          onSubmitSchedule={handleSubmitSchedule}
          isEditingSchedule={isEditingSchedule}
        />

        {/* Match Result Card */}
        {showResultCard && submittedMatch && (
          <MatchResultCard
            match={submittedMatch}
            player={player}
            language={locale}
            isWinner={isWinner}
            onClose={() => {
              setShowResultCard(false)
              setSubmittedMatch(null)
              // Refresh matches data
              fetchMatches()
            }}
          />
        )}
      </div>
    </>
  )
}