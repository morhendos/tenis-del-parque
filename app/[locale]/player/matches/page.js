'use client'

import { useState, useEffect } from 'react'
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
  const [activeTab, setActiveTab] = useState('upcoming')
  const [showResultModal, setShowResultModal] = useState(false)
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [selectedMatch, setSelectedMatch] = useState(null)
  const [isEditingSchedule, setIsEditingSchedule] = useState(false)
  const [showResultCard, setShowResultCard] = useState(false)
  const [submittedMatch, setSubmittedMatch] = useState(null)
  const [isWinner, setIsWinner] = useState(false)
  const [selectedLeagueId, setSelectedLeagueId] = useState(null) // For multi-league filtering
  const [openRankData, setOpenRankData] = useState({}) // OpenRank positions by player ID
  const [extensionsRemaining, setExtensionsRemaining] = useState(3) // Extensions per season
  const router = useRouter()

  useEffect(() => {
    fetchMatches()
    fetchPlayerData()
    fetchOpenRankData()
  }, [])

  // Fetch extensions remaining when player data changes
  useEffect(() => {
    if (player?.registrations?.length > 0) {
      // Get the first registration's extensions (or the selected league's)
      const registration = selectedLeagueId 
        ? player.registrations.find(r => {
            const regLeagueId = r.league?._id?.toString() || r.league?.toString()
            return regLeagueId === selectedLeagueId?.toString()
          })
        : player.registrations[0]
      
      if (registration?.extensions) {
        setExtensionsRemaining(registration.extensions.total - registration.extensions.used)
      }
    }
  }, [player, selectedLeagueId])

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

  const fetchOpenRankData = async () => {
    try {
      const response = await fetch('/api/openrank?all=true')
      if (response.ok) {
        const data = await response.json()
        // Create a map of player ID to their OpenRank position
        const rankMap = {}
        data.rankings?.forEach(player => {
          rankMap[player._id] = player.position
        })
        setOpenRankData(rankMap)
      }
    } catch (error) {
      console.error('Error fetching OpenRank data:', error)
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

  const handleExtend = async (match) => {
    try {
      const response = await fetch('/api/player/matches/extend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matchId: match._id })
      })
      
      const result = await response.json()
      
      if (response.ok) {
        // Update match deadline in state
        setMatches(prevMatches => 
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
        toast.success(locale === 'es' ? 'Límite extendido 7 días' : 'Deadline extended by 7 days')
      } else {
        toast.error(result.error || (locale === 'es' ? 'Error al extender límite' : 'Failed to extend deadline'))
      }
    } catch (error) {
      console.error('Error extending deadline:', error)
      toast.error(locale === 'es' ? 'Error al extender límite' : 'Error extending deadline')
    }
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

  const handleUnschedule = async (match) => {
    try {
      const response = await fetch('/api/player/matches/unschedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matchId: match._id })
      })
      
      const result = await response.json()
      
      if (response.ok) {
        // Optimistically update the match in state
        setMatches(prevMatches => 
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
        
        setShowScheduleModal(false)
        toast.success(locale === 'es' ? 'Partido desprogramado' : 'Match unscheduled')
      } else {
        toast.error(result.error || (locale === 'es' ? 'Error al desprogramar partido' : 'Failed to unschedule match'))
      }
    } catch (error) {
      console.error('Error unscheduling match:', error)
      toast.error(locale === 'es' ? 'Error al desprogramar partido' : 'Error unscheduling match')
    }
  }

  // Detect if player has multiple leagues
  const hasMultipleLeagues = player?.registrations?.length > 1
  const playerLeagues = player?.registrations?.map(reg => reg.league) || []
  
  // Filter matches by selected league (only if multi-league)
  const filteredMatches = hasMultipleLeagues && selectedLeagueId
    ? matches.filter(m => m.league?._id?.toString() === selectedLeagueId?.toString())
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
      
      <div className="space-y-4 animate-fade-in-up">
        {/* Hero Header - Like OpenRank */}
        <div className="relative overflow-hidden bg-gradient-to-br from-parque-purple via-purple-600 to-indigo-600 rounded-xl sm:rounded-2xl text-white p-4 sm:p-6">
          {/* Background decoration */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-white rounded-full"></div>
            <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-white rounded-full"></div>
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M4.93 4.93c4.08 4.08 10.06 4.08 14.14 0" />
                  <path d="M4.93 19.07c4.08-4.08 10.06-4.08 14.14 0" />
                </svg>
                <h1 className="text-xl sm:text-2xl font-bold">
                  {locale === 'es' ? 'Mis Partidos' : 'My Matches'}
                </h1>
              </div>
              <button
                onClick={() => router.push(`/${locale}/player/dashboard`)}
                className="p-2 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
            </div>
            
            {/* Summary Stats - Compact grid */}
            <div className="grid grid-cols-4 gap-2">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2 text-center">
                <div className="text-lg sm:text-xl font-bold">{matches.length}</div>
                <div className="text-[10px] sm:text-xs text-purple-200">{locale === 'es' ? 'Total' : 'Total'}</div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2 text-center">
                <div className="text-lg sm:text-xl font-bold">
                  {matches.filter(m => m.result?.winner === player?._id).length}
                </div>
                <div className="text-[10px] sm:text-xs text-purple-200">{locale === 'es' ? 'Victorias' : 'Wins'}</div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2 text-center">
                <div className="text-lg sm:text-xl font-bold">
                  {matches.filter(m => m.result?.winner && m.result.winner !== player?._id).length}
                </div>
                <div className="text-[10px] sm:text-xs text-purple-200">{locale === 'es' ? 'Derrotas' : 'Losses'}</div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2 text-center">
                <div className="text-lg sm:text-xl font-bold">
                  {upcomingMatches.length}
                </div>
                <div className="text-[10px] sm:text-xs text-purple-200">{locale === 'es' ? 'Próximos' : 'Upcoming'}</div>
              </div>
            </div>
          </div>
        </div>

        {/* League Selector - Compact for multi-league */}
        {hasMultipleLeagues && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-500">
                {locale === 'es' ? 'Filtrar:' : 'Filter:'}
              </span>
              {selectedLeagueId && (
                <button
                  onClick={() => setSelectedLeagueId(null)}
                  className="text-xs text-parque-purple hover:text-purple-700 font-medium"
                >
                  {locale === 'es' ? 'Todas' : 'All'}
                </button>
              )}
            </div>
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              {playerLeagues.map((league) => {
                const leagueIdStr = league._id?.toString()
                const isSelected = selectedLeagueId?.toString() === leagueIdStr
                return (
                  <button
                    key={leagueIdStr}
                    onClick={() => setSelectedLeagueId(
                      isSelected ? null : leagueIdStr
                    )}
                    className={`flex-shrink-0 px-3 py-1.5 rounded-lg font-medium text-xs transition-all ${
                      isSelected
                        ? 'bg-parque-purple text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {league.name}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Filter Tabs - Compact */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <nav className="flex">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-2 px-2 font-medium text-xs transition-all relative ${
                  activeTab === tab.id
                    ? 'text-parque-purple bg-purple-50'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span className="flex items-center justify-center gap-1">
                  {tab.label}
                  <span className={`inline-flex items-center justify-center w-4 h-4 text-[10px] rounded-full ${
                    activeTab === tab.id
                      ? 'bg-parque-purple text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {tab.count}
                  </span>
                </span>
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-parque-purple"></div>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Matches List */}
        {activeTab === 'upcoming' && (
          <div className="space-y-2">
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
                  onExtend={handleExtend}
                  extensionsRemaining={extensionsRemaining}
                  isUpcoming={true}
                  showActions={true}
                  showLeagueBadge={hasMultipleLeagues}
                  openRankData={openRankData}
                  className="animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                />
              ))
            ) : (
              <div className="text-center py-10 bg-gray-50 rounded-xl">
                <div className="text-4xl mb-3">🎾</div>
                <h3 className="text-base font-medium text-gray-900 mb-1">
                  {locale === 'es' ? 'No hay partidos programados' : 'No scheduled matches'}
                </h3>
                <p className="text-gray-500 text-xs">
                  {locale === 'es' 
                    ? 'Los nuevos emparejamientos se crean cada domingo'
                    : 'New pairings are created every Sunday'}
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'completed' && (
          <div className="space-y-2">
            {completedMatches.length > 0 ? (
              completedMatches.map((match, index) => (
                <MatchCard
                  key={match._id}
                  match={match}
                  player={player}
                  language={locale}
                  isUpcoming={false}
                  showActions={false}
                  showLeagueBadge={hasMultipleLeagues}
                  openRankData={openRankData}
                  className="animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                />
              ))
            ) : (
              <div className="text-center py-10 bg-gray-50 rounded-xl">
                <div className="text-4xl mb-3">🏆</div>
                <h3 className="text-base font-medium text-gray-900 mb-1">
                  {locale === 'es' ? 'No hay partidos completados' : 'No completed matches'}
                </h3>
                <p className="text-gray-500 text-xs">
                  {locale === 'es' 
                    ? 'Los partidos completados aparecerán aquí'
                    : 'Completed matches will appear here'}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Match Modals */}
        <MatchModals
          showResultModal={showResultModal}
          showScheduleModal={showScheduleModal}
          selectedMatch={selectedMatch}
          player={player}
          language={locale}
          league={selectedMatch?.league}
          onCloseResult={() => setShowResultModal(false)}
          onCloseSchedule={() => {
            setShowScheduleModal(false)
            setIsEditingSchedule(false)
          }}
          onSubmitResult={handleSubmitResult}
          onSubmitSchedule={handleSubmitSchedule}
          onUnschedule={handleUnschedule}
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