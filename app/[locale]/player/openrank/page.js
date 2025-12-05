'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import EloProgressionChart from '@/components/player/EloProgressionChart'

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

  const content = {
    es: {
      title: 'OpenRank',
      subtitle: 'Ranking Global ELO',
      description: 'El ranking definitivo que mide tu nivel real de tenis basado en el sistema ELO.',
      qualifiedPlayers: 'Jugadores Clasificados',
      matchesRequired: 'partidos para clasificar',
      yourPosition: 'Tu posición',
      notQualified: 'Aún no clasificado',
      matchesNeeded: 'partidos más para clasificar',
      rank: 'Pos',
      player: 'Jugador',
      elo: 'ELO',
      matches: 'Partidos',
      winRate: 'Victorias',
      highest: 'Máximo ELO',
      almostThere: 'Casi clasificados',
      almostThereDesc: 'Jugadores trabajando para alcanzar los 8 partidos',
      showMore: 'Ver jugadores casi clasificados',
      hideMore: 'Ocultar',
      noRankings: 'Aún no hay jugadores clasificados',
      noRankingsDesc: 'Sé el primero en jugar 8 partidos y entrar al OpenRank',
      backToDashboard: 'Volver al Dashboard',
      you: 'Tú'
    },
    en: {
      title: 'OpenRank',
      subtitle: 'Global ELO Ranking',
      description: 'The definitive ranking that measures your real tennis level based on the ELO system.',
      qualifiedPlayers: 'Qualified Players',
      matchesRequired: 'matches to qualify',
      yourPosition: 'Your position',
      notQualified: 'Not yet qualified',
      matchesNeeded: 'more matches to qualify',
      rank: 'Rank',
      player: 'Player',
      elo: 'ELO',
      matches: 'Matches',
      winRate: 'Win Rate',
      highest: 'Peak ELO',
      almostThere: 'Almost There',
      almostThereDesc: 'Players working towards 8 matches',
      showMore: 'Show almost qualified players',
      hideMore: 'Hide',
      noRankings: 'No qualified players yet',
      noRankingsDesc: 'Be the first to play 8 matches and enter the OpenRank',
      backToDashboard: 'Back to Dashboard',
      you: 'You'
    }
  }
  
  const t = content[locale] || content.es

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
  const getPositionBadgeStyle = (position) => {
    if (position === 1) return 'bg-gradient-to-br from-amber-400 to-yellow-500 text-white'
    if (position === 2) return 'bg-gradient-to-br from-gray-300 to-slate-400 text-white'
    if (position === 3) return 'bg-gradient-to-br from-orange-400 to-amber-500 text-white'
    return 'bg-gray-100 text-gray-600'
  }

  const getPositionStyle = (position) => {
    if (position === 1) return 'bg-gradient-to-r from-amber-100 to-yellow-50 border-amber-300'
    if (position === 2) return 'bg-gradient-to-r from-gray-100 to-slate-50 border-gray-300'
    if (position === 3) return 'bg-gradient-to-r from-orange-100 to-amber-50 border-orange-300'
    return 'bg-white border-gray-200'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-gray-200 rounded-full"></div>
            <div className="absolute top-0 left-0 w-16 h-16 border-4 border-amber-500 rounded-full animate-spin border-t-transparent"></div>
          </div>
          <p className="mt-4 text-gray-600 animate-pulse">
            {locale === 'es' ? 'Cargando rankings...' : 'Loading rankings...'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-4 mb-4">
          <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/30">
            <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
            </svg>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{t.title}</h1>
            <p className="text-gray-500">{t.subtitle}</p>
          </div>
        </div>
        <p className="text-gray-600">{t.description}</p>
      </div>

      {/* ELO Progression Chart */}
      {!eloLoading && (
        <EloProgressionChart 
          chartData={eloHistory.chartData} 
          stats={eloHistory.stats} 
          locale={locale} 
        />
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        {/* Qualified Players */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-5 border border-amber-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-amber-700 font-medium">{t.qualifiedPlayers}</p>
              <p className="text-3xl font-bold text-amber-900">{stats.qualifiedCount}</p>
            </div>
            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
          </div>
          <p className="text-xs text-amber-600 mt-2">{stats.matchesRequired} {t.matchesRequired}</p>
        </div>

        {/* Your Position */}
        <div className={`rounded-2xl p-5 border ${
          currentPlayerRanking 
            ? 'bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200' 
            : 'bg-gradient-to-br from-gray-50 to-slate-50 border-gray-200'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${currentPlayerRanking ? 'text-emerald-700' : 'text-gray-500'}`}>
                {t.yourPosition}
              </p>
              {currentPlayerRanking ? (
                <p className="text-3xl font-bold text-emerald-900">#{currentPlayerRanking.position}</p>
              ) : currentPlayerAlmost ? (
                <p className="text-lg font-semibold text-gray-700">{t.notQualified}</p>
              ) : (
                <p className="text-lg font-semibold text-gray-500">{t.notQualified}</p>
              )}
            </div>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              currentPlayerRanking ? 'bg-emerald-100' : 'bg-gray-100'
            }`}>
              {currentPlayerRanking ? (
                <svg className="w-6 h-6 text-emerald-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                </svg>
              ) : (
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              )}
            </div>
          </div>
          {currentPlayerAlmost && !currentPlayerRanking && (
            <p className="text-xs text-gray-500 mt-2">
              {currentPlayerAlmost.matchesToQualify} {t.matchesNeeded}
            </p>
          )}
        </div>
      </div>

      {/* Rankings Table */}
      {rankings.length > 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-6">
          {/* Table Header */}
          <div className="bg-gradient-to-r from-gray-50 to-slate-50 px-4 py-3 border-b border-gray-200">
            <div className="grid grid-cols-12 gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <div className="col-span-1 text-center">{t.rank}</div>
              <div className="col-span-5">{t.player}</div>
              <div className="col-span-2 text-center">{t.elo}</div>
              <div className="col-span-2 text-center hidden sm:block">{t.matches}</div>
              <div className="col-span-2 text-center">{t.winRate}</div>
            </div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-gray-100">
            {rankings.map((player, index) => {
              const isCurrentPlayer = currentPlayer && player._id.toString() === currentPlayer._id.toString()
              
              
              return (
                <div 
                  key={player._id}
                  className={`px-4 py-3 transition-colors ${getPositionStyle(player.position)} ${
                    isCurrentPlayer ? 'ring-2 ring-inset ring-emerald-400' : ''
                  }`}
                >
                  <div className="grid grid-cols-12 gap-2 items-center">
                    {/* Position */}
                    <div className="col-span-1 flex justify-center">
                      <span className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold ${getPositionBadgeStyle(player.position)}`}>
                        {player.position}
                      </span>
                    </div>
                    
                    {/* Player Name */}
                    <div className="col-span-5">
                      <div className="flex items-center space-x-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                          player.position <= 3 
                            ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white' 
                            : 'bg-gray-200 text-gray-600'
                        }`}>
                          {player.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <span className="font-medium text-gray-900">{player.name}</span>
                          {isCurrentPlayer && (
                            <span className="ml-2 text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">
                              {t.you}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* ELO */}
                    <div className="col-span-2 text-center">
                      <span className="font-bold text-gray-900">{player.eloRating}</span>
                    </div>
                    
                    {/* Matches */}
                    <div className="col-span-2 text-center hidden sm:block">
                      <span className="text-gray-600">{player.matchesPlayed}</span>
                    </div>
                    
                    {/* Win Rate */}
                    <div className="col-span-2 text-center">
                      <span className={`font-medium ${
                        player.winRate >= 60 ? 'text-emerald-600' : 
                        player.winRate >= 40 ? 'text-gray-600' : 'text-orange-600'
                      }`}>
                        {player.winRate}%
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center mb-6">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{t.noRankings}</h3>
          <p className="text-gray-500">{t.noRankingsDesc}</p>
        </div>
      )}

      {/* Almost Qualified Section */}
      {almostQualified.length > 0 && (
        <div className="mb-6">
          <button
            onClick={() => setShowAlmostQualified(!showAlmostQualified)}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
          >
            <svg className={`w-5 h-5 transition-transform ${showAlmostQualified ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
            <span className="font-medium">
              {showAlmostQualified ? t.hideMore : t.showMore} ({almostQualified.length})
            </span>
          </button>

          {showAlmostQualified && (
            <div className="bg-gray-50 rounded-2xl border border-gray-200 overflow-hidden">
              <div className="px-4 py-3 bg-gray-100 border-b border-gray-200">
                <h3 className="font-semibold text-gray-700">{t.almostThere}</h3>
                <p className="text-xs text-gray-500">{t.almostThereDesc}</p>
              </div>
              <div className="divide-y divide-gray-100">
                {almostQualified.map((player) => {
                  const isCurrentPlayer = currentPlayer && player._id.toString() === currentPlayer._id.toString()
                  
                  return (
                    <div 
                      key={player._id}
                      className={`px-4 py-3 ${isCurrentPlayer ? 'bg-amber-50' : ''}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-sm font-bold text-gray-600">
                            {player.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-medium text-gray-900">{player.name}</span>
                            {isCurrentPlayer && (
                              <span className="ml-2 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
                                {t.you}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-600">
                            {player.matchesPlayed} / {stats.matchesRequired}
                          </div>
                          <div className="text-xs text-gray-400">
                            {player.matchesToQualify} {t.matchesNeeded}
                          </div>
                        </div>
                      </div>
                      {/* Mini progress bar */}
                      <div className="mt-2 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full"
                          style={{ width: `${(player.matchesPlayed / stats.matchesRequired) * 100}%` }}
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

      {/* Back Link */}
      <div className="text-center">
        <Link
          href={`/${locale}/player/dashboard`}
          className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          {t.backToDashboard}
        </Link>
      </div>
    </div>
  )
}
