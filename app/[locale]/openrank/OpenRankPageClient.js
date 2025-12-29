'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Navigation from '@/components/common/Navigation'
import Footer from '@/components/common/Footer'
import { homeContent } from '@/lib/content/homeContent'

export default function OpenRankPageClient({ locale }) {
  const [loading, setLoading] = useState(true)
  const [rankings, setRankings] = useState([])
  const [almostQualified, setAlmostQualified] = useState([])
  const [stats, setStats] = useState({ qualifiedCount: 0, matchesRequired: 8, totalPlayers: 0 })
  const [showAlmostQualified, setShowAlmostQualified] = useState(false)

  const footerContent = homeContent[locale]?.footer || homeContent.es?.footer

  const content = {
    es: {
      title: 'OpenRank',
      subtitle: 'Ranking Global de Tenis Amateur',
      description: 'El ranking definitivo que mide el nivel real de los jugadores basado en el sistema ELO. Juega 8 partidos en cualquier liga para entrar.',
      qualifiedPlayers: 'Jugadores Clasificados',
      totalPlayers: 'Jugadores Totales',
      matchesRequired: 'partidos para clasificar',
      rank: 'Pos',
      player: 'Jugador',
      elo: 'ELO',
      matches: 'Partidos',
      winRate: 'Victorias',
      almostThere: 'Casi clasificados',
      almostThereDesc: 'Jugadores trabajando para alcanzar los 8 partidos',
      showMore: 'Ver jugadores casi clasificados',
      hideMore: 'Ocultar',
      noRankings: 'Aún no hay jugadores clasificados',
      noRankingsDesc: 'Sé el primero en jugar 8 partidos y entrar al OpenRank',
      joinNow: '¡Únete ahora!',
      howItWorks: '¿Cómo funciona?',
      howItWorksItems: [
        'Regístrate en cualquier liga de Tenis del Parque',
        'Juega al menos 8 partidos oficiales',
        'Tu rating ELO se calcula automáticamente',
        '¡Apareces en el ranking global!'
      ],
      learnMore: 'Aprende más sobre el sistema ELO'
    },
    en: {
      title: 'OpenRank',
      subtitle: 'Global Amateur Tennis Ranking',
      description: 'The definitive ranking that measures real player level based on the ELO system. Play 8 matches in any league to enter.',
      qualifiedPlayers: 'Qualified Players',
      totalPlayers: 'Total Players',
      matchesRequired: 'matches to qualify',
      rank: 'Rank',
      player: 'Player',
      elo: 'ELO',
      matches: 'Matches',
      winRate: 'Win Rate',
      almostThere: 'Almost There',
      almostThereDesc: 'Players working towards 8 matches',
      showMore: 'Show almost qualified players',
      hideMore: 'Hide',
      noRankings: 'No qualified players yet',
      noRankingsDesc: 'Be the first to play 8 matches and enter the OpenRank',
      joinNow: 'Join now!',
      howItWorks: 'How does it work?',
      howItWorksItems: [
        'Register in any Tenis del Parque league',
        'Play at least 8 official matches',
        'Your ELO rating is calculated automatically',
        'You appear in the global ranking!'
      ],
      learnMore: 'Learn more about the ELO system'
    }
  }
  
  const t = content[locale] || content.es

  useEffect(() => {
    fetchOpenRank()
  }, [])

  const fetchOpenRank = async () => {
    try {
      const response = await fetch('/api/openrank?all=true')
      if (response.ok) {
        const data = await response.json()
        setRankings(data.rankings || [])
        setAlmostQualified(data.almostQualified || [])
        setStats({
          qualifiedCount: data.qualifiedCount || 0,
          matchesRequired: data.matchesRequired || 8,
          totalPlayers: data.totalPlayers || 0
        })
      }
    } catch (error) {
      console.error('Error fetching OpenRank:', error)
    } finally {
      setLoading(false)
    }
  }

  // Position styling for top 3
  const getPositionBadgeStyle = (position) => {
    if (position === 1) return 'bg-gradient-to-br from-amber-400 to-yellow-500 text-white'
    if (position === 2) return 'bg-gradient-to-br from-gray-300 to-slate-400 text-white'
    if (position === 3) return 'bg-gradient-to-br from-orange-400 to-amber-500 text-white'
    return 'bg-gray-100 text-gray-600'
  }

  const getPositionRowStyle = (position) => {
    if (position === 1) return 'bg-gradient-to-r from-amber-50 to-yellow-50 border-l-4 border-amber-400'
    if (position === 2) return 'bg-gradient-to-r from-gray-50 to-slate-50 border-l-4 border-gray-400'
    if (position === 3) return 'bg-gradient-to-r from-orange-50 to-amber-50 border-l-4 border-orange-400'
    return 'bg-white hover:bg-gray-50'
  }

  // Format player name for public display (first name + last initial)
  const formatPublicName = (name) => {
    if (!name) return 'Unknown'
    const parts = name.trim().split(' ')
    if (parts.length === 1) return parts[0]
    return `${parts[0]} ${parts[parts.length - 1].charAt(0)}.`
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Navigation 
        currentPage="openrank" 
        language={locale}
        showLanguageSwitcher={true}
      />
      
      {/* Hero Section */}
      <section className="pt-20 sm:pt-24 pb-8 sm:pb-12 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-8 sm:mb-12">
            <div className="inline-flex items-center justify-center w-14 h-14 sm:w-20 sm:h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl sm:rounded-2xl shadow-lg shadow-amber-500/30 mb-4 sm:mb-6">
              <svg className="w-7 h-7 sm:w-10 sm:h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
              </svg>
            </div>
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-2 sm:mb-4">{t.title}</h1>
            <p className="text-base sm:text-xl text-amber-600 font-medium mb-2 sm:mb-4">{t.subtitle}</p>
            <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto">{t.description}</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-8 sm:mb-12">
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl sm:rounded-2xl p-3 sm:p-6 border border-amber-200 text-center">
              <div className="text-2xl sm:text-4xl font-bold text-amber-900 mb-0.5 sm:mb-1">{stats.qualifiedCount}</div>
              <div className="text-[10px] sm:text-sm text-amber-700">{t.qualifiedPlayers}</div>
            </div>
            <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl sm:rounded-2xl p-3 sm:p-6 border border-gray-200 text-center">
              <div className="text-2xl sm:text-4xl font-bold text-gray-900 mb-0.5 sm:mb-1">{stats.totalPlayers}</div>
              <div className="text-[10px] sm:text-sm text-gray-600">{t.totalPlayers}</div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl sm:rounded-2xl p-3 sm:p-6 border border-purple-200 text-center">
              <div className="text-2xl sm:text-4xl font-bold text-purple-900 mb-0.5 sm:mb-1">{stats.matchesRequired}</div>
              <div className="text-[10px] sm:text-sm text-purple-700">{t.matchesRequired}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Rankings Section */}
      <section className="py-4 sm:py-8 px-4">
        <div className="container mx-auto max-w-4xl">
          {loading ? (
            <div className="flex items-center justify-center py-12 sm:py-20">
              <div className="text-center">
                <div className="relative">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-gray-200 rounded-full"></div>
                  <div className="absolute top-0 left-0 w-12 h-12 sm:w-16 sm:h-16 border-4 border-amber-500 rounded-full animate-spin border-t-transparent"></div>
                </div>
                <p className="mt-3 sm:mt-4 text-sm sm:text-base text-gray-600 animate-pulse">
                  {locale === 'es' ? 'Cargando rankings...' : 'Loading rankings...'}
                </p>
              </div>
            </div>
          ) : rankings.length > 0 ? (
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-200 overflow-hidden mb-6 sm:mb-8">
              {/* Table Header */}
              <div className="bg-gradient-to-r from-gray-100 to-slate-100 px-3 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
                <div className="grid grid-cols-12 gap-1 sm:gap-2 text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <div className="col-span-2 sm:col-span-1 text-center">{t.rank}</div>
                  <div className="col-span-5 sm:col-span-5">{t.player}</div>
                  <div className="col-span-2 text-center">{t.elo}</div>
                  <div className="col-span-1 sm:col-span-2 text-center hidden sm:block">{t.matches}</div>
                  <div className="col-span-3 sm:col-span-2 text-center">{t.winRate}</div>
                </div>
              </div>

              {/* Table Body */}
              <div className="divide-y divide-gray-100">
                {rankings.map((player) => (
                  <div 
                    key={player._id}
                    className={`px-3 sm:px-6 py-3 sm:py-4 transition-colors ${getPositionRowStyle(player.position)}`}
                  >
                    <div className="grid grid-cols-12 gap-1 sm:gap-2 items-center">
                      {/* Position */}
                      <div className="col-span-2 sm:col-span-1 flex justify-center">
                        <span className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold ${getPositionBadgeStyle(player.position)}`}>
                          {player.position}
                        </span>
                      </div>
                      
                      {/* Player Name */}
                      <div className="col-span-5">
                        <div className="flex items-center space-x-2 sm:space-x-3">
                          <div className={`w-7 h-7 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold flex-shrink-0 ${
                            player.position <= 3 
                              ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white' 
                              : 'bg-gray-200 text-gray-600'
                          }`}>
                            {player.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium text-gray-900 text-sm sm:text-base truncate">
                            {formatPublicName(player.name)}
                          </span>
                        </div>
                      </div>
                      
                      {/* ELO */}
                      <div className="col-span-2 text-center">
                        <span className="font-bold text-gray-900 text-sm sm:text-base">{player.eloRating}</span>
                      </div>
                      
                      {/* Matches */}
                      <div className="col-span-1 sm:col-span-2 text-center hidden sm:block">
                        <span className="text-gray-600">{player.matchesPlayed}</span>
                      </div>
                      
                      {/* Win Rate */}
                      <div className="col-span-3 sm:col-span-2 text-center">
                        <span className={`font-medium text-sm sm:text-base ${
                          player.winRate >= 60 ? 'text-emerald-600' : 
                          player.winRate >= 40 ? 'text-gray-600' : 'text-orange-600'
                        }`}>
                          {player.winRate}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-200 p-8 sm:p-12 text-center mb-6 sm:mb-8">
              <div className="w-16 h-16 sm:w-24 sm:h-24 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <svg className="w-8 h-8 sm:w-12 sm:h-12 text-amber-500" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">{t.noRankings}</h3>
              <p className="text-sm sm:text-base text-gray-500 mb-4 sm:mb-6">{t.noRankingsDesc}</p>
              <Link 
                href={`/${locale}/ligas`}
                className="inline-flex items-center px-5 py-2.5 sm:px-6 sm:py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-semibold hover:from-amber-600 hover:to-orange-600 transition-all shadow-lg text-sm sm:text-base"
              >
                {t.joinNow}
              </Link>
            </div>
          )}

          {/* Almost Qualified Section */}
          {almostQualified.length > 0 && (
            <div className="mb-6 sm:mb-8">
              <button
                onClick={() => setShowAlmostQualified(!showAlmostQualified)}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors mb-3 sm:mb-4"
              >
                <svg className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform ${showAlmostQualified ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
                <span className="font-medium text-sm sm:text-base">
                  {showAlmostQualified ? t.hideMore : t.showMore} ({almostQualified.length})
                </span>
              </button>

              {showAlmostQualified && (
                <div className="bg-gray-50 rounded-xl sm:rounded-2xl border border-gray-200 overflow-hidden">
                  <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gray-100 border-b border-gray-200">
                    <h3 className="font-semibold text-gray-700 text-sm sm:text-base">{t.almostThere}</h3>
                    <p className="text-[10px] sm:text-xs text-gray-500">{t.almostThereDesc}</p>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {almostQualified.slice(0, 10).map((player) => (
                      <div key={player._id} className="px-4 sm:px-6 py-3 sm:py-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2 sm:space-x-3">
                            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-200 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold text-gray-600">
                              {player.name.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-medium text-gray-900 text-sm sm:text-base">
                              {formatPublicName(player.name)}
                            </span>
                          </div>
                          <div className="text-right">
                            <div className="text-xs sm:text-sm text-gray-600">
                              {player.matchesPlayed} / {stats.matchesRequired}
                            </div>
                          </div>
                        </div>
                        {/* Progress bar */}
                        <div className="mt-2 h-1 sm:h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full"
                            style={{ width: `${(player.matchesPlayed / stats.matchesRequired) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-10 sm:py-16 px-4 bg-gradient-to-br from-amber-50 to-orange-50">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-xl sm:text-3xl font-bold text-center text-gray-900 mb-6 sm:mb-12">{t.howItWorks}</h2>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {t.howItWorksItems.map((item, index) => (
              <div key={index} className="bg-white rounded-xl p-4 sm:p-6 shadow-md text-center">
                <div className="w-9 h-9 sm:w-12 sm:h-12 bg-gradient-to-br from-amber-400 to-orange-500 text-white rounded-full flex items-center justify-center text-base sm:text-xl font-bold mx-auto mb-2 sm:mb-4">
                  {index + 1}
                </div>
                <p className="text-gray-700 text-xs sm:text-base leading-snug">{item}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-8 sm:mt-12 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <Link 
              href={`/${locale}/elo`}
              className="inline-flex items-center justify-center px-4 py-2.5 sm:px-6 sm:py-3 bg-white text-amber-700 border-2 border-amber-500 rounded-xl font-semibold hover:bg-amber-50 transition-all text-sm sm:text-base"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {t.learnMore}
            </Link>
            <Link 
              href={`/${locale}/${locale === 'es' ? 'ligas' : 'leagues'}`}
              className="inline-flex items-center justify-center px-4 py-2.5 sm:px-6 sm:py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-semibold hover:from-amber-600 hover:to-orange-600 transition-all shadow-lg text-sm sm:text-base"
            >
              {t.joinNow}
            </Link>
          </div>
        </div>
      </section>

      <Footer content={footerContent} />
    </main>
  )
}
