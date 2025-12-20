'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Star, TrendingUp, Users, Target, ChevronDown, ChevronUp } from 'lucide-react'
import EloProgressionChart from '@/components/player/EloProgressionChart'
import { TennisPreloaderInline } from '@/components/ui/TennisPreloader'
import { getMaskedName, isDemoModeActive } from '@/lib/utils/demoMode'

export default function OpenRankPage() {
  const params = useParams()
  const { data: session } = useSession()
  const locale = params.locale || 'es'
  
  const [loading, setLoading] = useState(true)
  const [rankings, setRankings] = useState([])
  const [almostQualified, setAlmostQualified] = useState([])
  const [stats, setStats] = useState({ qualifiedCount: 0, matchesRequired: 8 })
  const [currentPlayer, setCurrentPlayer] = useState(null)
  const [showAlmostQualified, setShowAlmostQualified] = useState(false)
  const [eloHistory, setEloHistory] = useState({ chartData: [], stats: null })
  const [eloLoading, setEloLoading] = useState(true)
  const [isDemoMode, setIsDemoMode] = useState(false)

  const content = {
    es: {
      title: 'OpenRank',
      subtitle: 'Ranking Global ELO',
      description: 'El ranking definitivo que mide tu nivel real de tenis basado en el sistema ELO.',
      qualifiedPlayers: 'Clasificados',
      matchesRequired: 'partidos para clasificar',
      yourPosition: 'Tu posición',
      yourElo: 'Tu ELO',
      notQualified: 'Sin clasificar',
      matchesNeeded: 'partidos más',
      rank: 'Pos',
      player: 'Jugador',
      elo: 'ELO',
      matches: 'partidos',
      winRate: 'victorias',
      highest: 'Máximo ELO',
      almostThere: 'Casi clasificados',
      almostThereDesc: 'Jugadores trabajando para alcanzar los 8 partidos',
      showMore: 'Ver casi clasificados',
      hideMore: 'Ocultar',
      noRankings: 'Aún no hay jugadores clasificados',
      noRankingsDesc: 'Sé el primero en jugar 8 partidos y entrar al OpenRank',
      you: 'Tú',
      howItWorks: '¿Cómo funciona?',
      howItWorksDesc: 'Juega 8 partidos para entrar al ranking. Tu posición se basa en tu puntuación ELO.'
    },
    en: {
      title: 'OpenRank',
      subtitle: 'Global ELO Ranking',
      description: 'The definitive ranking that measures your real tennis level based on the ELO system.',
      qualifiedPlayers: 'Qualified',
      matchesRequired: 'matches to qualify',
      yourPosition: 'Your position',
      yourElo: 'Your ELO',
      notQualified: 'Not ranked',
      matchesNeeded: 'more matches',
      rank: 'Rank',
      player: 'Player',
      elo: 'ELO',
      matches: 'matches',
      winRate: 'wins',
      highest: 'Peak ELO',
      almostThere: 'Almost There',
      almostThereDesc: 'Players working towards 8 matches',
      showMore: 'Show almost qualified',
      hideMore: 'Hide',
      noRankings: 'No qualified players yet',
      noRankingsDesc: 'Be the first to play 8 matches and enter the OpenRank',
      you: 'You',
      howItWorks: 'How it works?',
      howItWorksDesc: 'Play 8 matches to enter the ranking. Your position is based on your ELO score.'
    }
  }
  
  const t = content[locale] || content.es

  useEffect(() => {
    setIsDemoMode(isDemoModeActive())
  }, [])

  useEffect(() => {
    fetchOpenRank()
    fetchCurrentPlayer()
    fetchEloHistory()
  }, [])

  const fetchEloHistory = async () => {
    try {
      const response = await fetch('/api/player/elo-history')
      if (response.ok) {
        const data = await response.json()
        setEloHistory(data)
      }
    } catch (error) {
      console.error('Error fetching ELO history:', error)
    } finally {
      setEloLoading(false)
    }
  }

  const fetchOpenRank = async () => {
    try {
      const response = await fetch('/api/openrank?all=true')
      if (response.ok) {
        const data = await response.json()
        setRankings(data.rankings || [])
        setAlmostQualified(data.almostQualified || [])
        setStats({
          qualifiedCount: data.qualifiedCount || 0,
          matchesRequired: data.matchesRequired || 8
        })
      }
    } catch (error) {
      console.error('Error fetching OpenRank:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCurrentPlayer = async () => {
    try {
      const response = await fetch('/api/player/profile')
      if (response.ok) {
        const data = await response.json()
        setCurrentPlayer(data.player)
      }
    } catch (error) {
      console.error('Error fetching player:', error)
    }
  }

  // Find current player's position
  const currentPlayerRanking = rankings.find(r => 
    currentPlayer && r._id.toString() === currentPlayer._id.toString()
  )
  
  const currentPlayerAlmost = almostQualified.find(r => 
    currentPlayer && r._id.toString() === currentPlayer._id.toString()
  )

  // Position styling for top 3
  const getPositionBadge = (position) => {
    if (position === 1) return { bg: 'bg-gradient-to-br from-amber-400 to-yellow-500', text: 'text-white', ring: 'ring-amber-300' }
    if (position === 2) return { bg: 'bg-gradient-to-br from-gray-300 to-slate-400', text: 'text-white', ring: 'ring-gray-300' }
    if (position === 3) return { bg: 'bg-gradient-to-br from-orange-400 to-amber-600', text: 'text-white', ring: 'ring-orange-300' }
    return { bg: 'bg-purple-100', text: 'text-purple-700', ring: 'ring-purple-200' }
  }

  const getRowStyle = (position, isCurrentPlayer) => {
    let base = 'transition-all duration-200 '
    if (isCurrentPlayer) base += 'ring-2 ring-inset ring-purple-400 bg-purple-50 '
    else if (position === 1) base += 'bg-gradient-to-r from-amber-50 to-yellow-50 '
    else if (position === 2) base += 'bg-gradient-to-r from-gray-50 to-slate-50 '
    else if (position === 3) base += 'bg-gradient-to-r from-orange-50 to-amber-50 '
    else base += 'bg-white hover:bg-gray-50 '
    return base
  }

  if (loading) {
    return (
      <TennisPreloaderInline 
        text={locale === 'es' ? 'Cargando rankings...' : 'Loading rankings...'}
        locale={locale}
      />
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-parque-purple via-purple-600 to-indigo-600 rounded-2xl text-white p-6 sm:p-8">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-white rounded-full"></div>
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-white rounded-full"></div>
        </div>
        <Star className="absolute top-6 right-6 w-20 h-20 text-white/10" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <Star className="w-8 h-8" />
            <h1 className="text-2xl sm:text-3xl font-bold">{t.title}</h1>
          </div>
          <p className="text-purple-100 mb-6">{t.description}</p>
          
          {/* Summary Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 text-center">
              <div className="text-2xl font-bold">{stats.qualifiedCount}</div>
              <div className="text-xs text-purple-200">{t.qualifiedPlayers}</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 text-center">
              <div className="text-2xl font-bold">{stats.matchesRequired}</div>
              <div className="text-xs text-purple-200">{t.matchesRequired}</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 text-center">
              <div className="text-2xl font-bold">
                {currentPlayerRanking ? `#${currentPlayerRanking.position}` : '-'}
              </div>
              <div className="text-xs text-purple-200">{t.yourPosition}</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 text-center">
              <div className="text-2xl font-bold">{currentPlayer?.eloRating || '-'}</div>
              <div className="text-xs text-purple-200">{t.yourElo}</div>
            </div>
          </div>
        </div>
      </div>

      {/* ELO Progression Chart */}
      {!eloLoading && eloHistory.chartData?.length > 0 && (
        <EloProgressionChart 
          chartData={eloHistory.chartData} 
          stats={eloHistory.stats} 
          locale={locale} 
        />
      )}

      {/* Rankings Table */}
      {rankings.length > 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Table Header */}
          <div className="bg-gradient-to-r from-gray-50 to-slate-50 px-4 py-3 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-500" />
              <h2 className="font-bold text-gray-900">{t.subtitle}</h2>
            </div>
          </div>

          {/* Column Headers */}
          <div className="bg-gray-50 px-4 py-2 border-b border-gray-100">
            <div className="flex items-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <div className="w-8 text-center">#</div>
              <div className="flex-1 ml-2">{t.player}</div>
              <div className="w-16 text-right">{t.elo}</div>
            </div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-gray-100">
            {rankings.map((player) => {
              const isCurrentPlayer = currentPlayer && player._id.toString() === currentPlayer._id.toString()
              const badge = getPositionBadge(player.position)
              
              return (
                <div 
                  key={player._id}
                  className={`px-4 py-3 ${getRowStyle(player.position, isCurrentPlayer)}`}
                >
                  <div className="flex items-center">
                    {/* Position */}
                    <div className="w-8 flex justify-center flex-shrink-0">
                      <span className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold shadow-sm ${badge.bg} ${badge.text}`}>
                        {player.position}
                      </span>
                    </div>
                    
                    {/* Player Name & Avatar */}
                    <div className="flex-1 ml-2 flex items-center min-w-0">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shadow-sm flex-shrink-0 ${
                        player.position <= 3 
                          ? 'bg-gradient-to-br from-purple-500 to-indigo-600 text-white' 
                          : 'bg-purple-100 text-purple-700'
                      }`}>
                        {(isDemoMode ? getMaskedName(player.name) : player.name).charAt(0).toUpperCase()}
                      </div>
                      <div className="ml-2 min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900 truncate">{isDemoMode ? getMaskedName(player.name) : player.name}</span>
                          {isCurrentPlayer && (
                            <span className="text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-full font-medium flex-shrink-0">
                              {t.you}
                            </span>
                          )}
                        </div>
                        {/* Win rate as subtle secondary info */}
                        <div className="text-xs text-gray-400">
                          {player.matchesPlayed} {t.matches} · {player.winRate}% {t.winRate.toLowerCase()}
                        </div>
                      </div>
                    </div>
                    
                    {/* ELO - prominent */}
                    <div className="w-16 text-right flex-shrink-0">
                      <span className="text-lg font-bold text-gray-900">{player.eloRating}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
          <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Star className="w-10 h-10 text-purple-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{t.noRankings}</h3>
          <p className="text-gray-500">{t.noRankingsDesc}</p>
        </div>
      )}

      {/* Almost Qualified Section */}
      {almostQualified.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <button
            onClick={() => setShowAlmostQualified(!showAlmostQualified)}
            className="w-full flex items-center justify-between px-4 py-4 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-purple-500" />
              <span className="font-semibold text-gray-900">{t.almostThere}</span>
              <span className="text-sm text-gray-500">({almostQualified.length})</span>
            </div>
            {showAlmostQualified ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </button>

          {showAlmostQualified && (
            <div className="border-t border-gray-100">
              <div className="px-4 py-2 bg-purple-50 text-xs text-purple-600">
                {t.almostThereDesc}
              </div>
              <div className="divide-y divide-gray-100">
                {almostQualified.map((player) => {
                  const isCurrentPlayer = currentPlayer && player._id.toString() === currentPlayer._id.toString()
                  const progress = (player.matchesPlayed / stats.matchesRequired) * 100
                  
                  return (
                    <div 
                      key={player._id}
                      className={`px-4 py-3 ${isCurrentPlayer ? 'bg-purple-50' : ''}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <div className="w-9 h-9 bg-gray-200 rounded-full flex items-center justify-center text-sm font-bold text-gray-600">
                            {(isDemoMode ? getMaskedName(player.name) : player.name).charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-medium text-gray-900">{isDemoMode ? getMaskedName(player.name) : player.name}</span>
                            {isCurrentPlayer && (
                              <span className="ml-2 text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-medium">
                                {t.you}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-900">
                            {player.matchesPlayed} / {stats.matchesRequired}
                          </div>
                          <div className="text-xs text-gray-500">
                            {player.matchesToQualify} {t.matchesNeeded}
                          </div>
                        </div>
                      </div>
                      {/* Progress bar */}
                      <div className="h-2 bg-purple-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-parque-purple to-indigo-500 rounded-full transition-all duration-500"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* How it works */}
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl p-6 border border-purple-100">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <Users className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 mb-1">{t.howItWorks}</h3>
            <p className="text-sm text-gray-600">{t.howItWorksDesc}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
