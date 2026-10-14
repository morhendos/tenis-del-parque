'use client'

import CountdownCard from './CountdownCard'
import MatchCard from './MatchCard'
import usePlayerMatches, { isUpcomingMatch } from './usePlayerMatches'

export default function NextMatchCard({ matches = [], language, leagueInfo, playerName = '' }) {
  const hasMatches = matches && matches.length > 0
  const { matches: fullMatches, cardProps, modals } = usePlayerMatches(language, { enabled: hasMatches })

  const content = {
    es: {
      title: 'Próximos Partidos',
      titleSingle: 'Próximo Partido',
      noMatches: 'No tienes partidos programados',
      round: 'Ronda',
      daysLeft: 'días',
      playBefore: 'Jugad antes del',
      extensions: (n) => `${n} ${n === 1 ? 'extensión disponible' : 'extensiones disponibles'}`
    },
    en: {
      title: 'Next Matches',
      titleSingle: 'Next Match',
      noMatches: 'No matches scheduled',
      round: 'Round',
      daysLeft: 'days',
      playBefore: 'Play before',
      extensions: (n) => `${n} ${n === 1 ? 'extension left' : 'extensions left'}`
    }
  }

  const t = content[language] || content.es

  // No matches but we have league info - show countdown
  if (!hasMatches && leagueInfo) {
    const startDate = leagueInfo.startDate ? new Date(leagueInfo.startDate) : null
    const isNotStarted = leagueInfo.status === 'registration_open' || leagueInfo.status === 'coming_soon' || (startDate && startDate > new Date())
    
    if (isNotStarted && startDate) {
      return (
        <CountdownCard
          leagueName={leagueInfo.name}
          location={leagueInfo.location}
          startDate={startDate}
          status={leagueInfo.status}
          language={language}
          showQuote={false}
          joined={leagueInfo.paymentStatus !== 'pending'}
          playerName={playerName}
        />
      )
    }
  }

  if (!hasMatches) {
    return null
  }

  const ids = new Set(matches.map(m => String(m._id)).filter(Boolean))
  const upcoming = fullMatches.filter(isUpcomingMatch)
  const shownMatches = ids.size ? upcoming.filter(m => ids.has(String(m._id))) : upcoming
  const title = matches.length === 1 ? t.titleSingle : t.title

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm h-full">
      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
          <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <span className="text-lg font-semibold text-gray-900">{title}</span>
        {matches.length > 1 && (
          <span className="ml-auto bg-purple-100 text-purple-700 text-xs font-semibold px-2 py-0.5 rounded-full">
            {matches.length}
          </span>
        )}
      </div>

      {/* Match List */}
      <div className="space-y-3">
        {shownMatches.map(match => (
          <MatchCard key={match._id} {...cardProps(match)} isUpcoming={true} showActions={true} />
        ))}
      </div>
      {modals}
    </div>
  )
}
