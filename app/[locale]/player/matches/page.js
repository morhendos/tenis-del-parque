'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import MatchCard from '@/components/player/MatchCard'
import usePlayerMatches from '@/components/player/usePlayerMatches'
import { TennisPreloaderInline } from '@/components/ui/TennisPreloader'

export default function PlayerMatches() {
  const params = useParams()
  const locale = params.locale || 'es'
  const [activeTab, setActiveTab] = useState('upcoming')
  const [selectedLeagueId, setSelectedLeagueId] = useState(null)
  const router = useRouter()
  const { matches, player, openRankData, loading, error, refetch: fetchMatches, cardProps, modals } = usePlayerMatches(locale)

  // Detect if player has multiple leagues
  const hasMultipleLeagues = player?.registrations?.length > 1
  const playerLeagues = player?.registrations?.map(reg => reg.league) || []
  
  // Filter matches by selected league (only if multi-league)
  const filteredMatches = hasMultipleLeagues && selectedLeagueId
    ? matches.filter(m => m.league?._id?.toString() === selectedLeagueId?.toString())
    : matches
  
  // A match is "overdue" if scheduled but deadline has passed
  const isOverdue = (m) => {
    if (m.status !== 'scheduled' || !m.schedule?.deadline) return false
    return new Date(m.schedule.deadline) < new Date()
  }
  
  const upcomingMatches = filteredMatches.filter(m => m.status === 'scheduled' && !m.result?.winner && !isOverdue(m))
  const completedMatches = filteredMatches.filter(m => m.status === 'completed' || m.status === 'cancelled' || m.result?.winner || isOverdue(m))

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
        
        . {
          animation: fade-in-up 0.5s ease-out;
        }
      `}</style>
      
      <div className="space-y-4">
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
                  className="tap-target text-xs text-parque-purple hover:text-purple-700 font-medium"
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {upcomingMatches.length > 0 ? (
              upcomingMatches.map((match) => (
                <MatchCard
                  key={match._id}
                  {...cardProps(match)}
                  isUpcoming={true}
                  showActions={true}
                  showLeagueBadge={hasMultipleLeagues}
                />
              ))
            ) : (
              <div className="text-center py-10 bg-gray-50 rounded-xl col-span-full">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {completedMatches.length > 0 ? (
              completedMatches.map((match) => (
                <MatchCard
                  key={match._id}
                  match={match}
                  player={player}
                  language={locale}
                  isUpcoming={false}
                  showActions={false}
                  showLeagueBadge={hasMultipleLeagues}
                  openRankData={openRankData}
                />
              ))
            ) : (
              <div className="text-center py-10 bg-gray-50 rounded-xl col-span-full">
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

        {modals}
      </div>
    </>
  )
}
