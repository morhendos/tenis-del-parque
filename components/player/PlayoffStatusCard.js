import Link from 'next/link'

/**
 * Shows playoff status on the dashboard when playoffs are active.
 * Replaces MiniStandings during playoff phase.
 */
export default function PlayoffStatusCard({ matches, player, leagueInfo, language = 'es', locale = 'es' }) {
  const playerId = player?._id?.toString()
  
  // Split playoff matches
  const playoffMatches = matches?.filter(m => m.matchType === 'playoff') || []
  const scheduledMatch = playoffMatches.find(m => m.status === 'scheduled')
  const completedMatches = playoffMatches.filter(m => m.status === 'completed')
  
  // Sort completed by round desc to get the latest
  completedMatches.sort((a, b) => (b.round || 0) - (a.round || 0))
  const lastMatch = completedMatches[0]

  const stageNames = {
    quarterfinal: { es: 'Cuartos de Final', en: 'Quarterfinals' },
    semifinal: { es: 'Semifinales', en: 'Semifinals' },
    final: { es: 'Final', en: 'Final' },
    third_place: { es: 'Tercer Puesto', en: '3rd Place' }
  }

  const nextStage = {
    quarterfinal: 'semifinal',
    semifinal: 'final'
  }

  const getOpponent = (match) => {
    if (!match || !playerId) return null
    const p1 = match.players?.player1
    const p2 = match.players?.player2
    if (p1?._id?.toString() === playerId) return p2
    if (p2?._id?.toString() === playerId) return p1
    return null
  }

  const didWin = (match) => {
    if (!match?.result?.winner) return false
    const winnerId = match.result.winner._id?.toString() || match.result.winner?.toString()
    return winnerId === playerId
  }

  const wins = completedMatches.filter(m => didWin(m)).length
  const losses = completedMatches.length - wins

  const t = language === 'es' ? {
    title: 'Playoffs',
    yourMatch: 'Tu partido',
    vs: 'vs',
    viewBracket: 'Ver cuadro',
    youWon: 'Ganaste',
    youLost: 'Perdiste',
    waitingFor: 'Esperando',
    seasonOver: 'Temporada finalizada',
    goodSeason: 'Gran temporada'
  } : {
    title: 'Playoffs',
    yourMatch: 'Your match',
    vs: 'vs',
    viewBracket: 'View bracket',
    youWon: 'You won',
    youLost: 'You lost',
    waitingFor: 'Waiting for',
    seasonOver: 'Season finished',
    goodSeason: 'Great season'
  }

  // Determine what to show
  const currentStage = scheduledMatch?.playoffInfo?.stage
  const lastStage = lastMatch?.playoffInfo?.stage
  const wonLast = lastMatch ? didWin(lastMatch) : null
  const opponent = scheduledMatch ? getOpponent(scheduledMatch) : null
  const lastOpponent = lastMatch ? getOpponent(lastMatch) : null

  return (
    <div className="relative overflow-hidden rounded-2xl border border-purple-200 shadow-sm" style={{ background: 'linear-gradient(145deg, #1a0a2e 0%, #16082a 50%, #0f0520 100%)' }}>
      <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl"></div>
      
      <div className="relative p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <svg className="w-4 h-4 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="font-bold text-white text-base">{t.title}</h3>
          </div>
          {completedMatches.length > 0 && (
            <span className="text-xs text-purple-300 bg-purple-500/20 px-2 py-1 rounded-full">
              {wins}W {losses}L
            </span>
          )}
        </div>

        {scheduledMatch ? (
          /* === ACTIVE MATCH === */
          <>
            <div className="mb-3">
              <span className="text-[11px] uppercase tracking-widest text-amber-400/70 font-semibold">
                {stageNames[currentStage]?.[language] || 'Playoffs'}
              </span>
            </div>
            <div className="rounded-lg p-3 mb-4" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(168,85,247,0.2)' }}>
              <p className="text-[10px] uppercase tracking-wider text-white/30 mb-2">{t.yourMatch}</p>
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-white truncate flex-1">{player?.name?.split(' ')[0] || '—'}</span>
                <span className="text-xs text-white/40 mx-2">{t.vs}</span>
                <span className="text-sm font-semibold text-white truncate flex-1 text-right">{opponent?.name?.split(' ')[0] || '—'}</span>
              </div>
            </div>
          </>
        ) : lastMatch ? (
          /* === LAST RESULT + WAITING === */
          <>
            {/* Last result */}
            <div className="rounded-lg p-3 mb-3" style={{ background: wonLast ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', border: `1px solid ${wonLast ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}` }}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] uppercase tracking-wider text-white/40">
                  {stageNames[lastStage]?.[language] || 'Playoffs'}
                </span>
                <span className={`text-[10px] font-bold uppercase ${wonLast ? 'text-emerald-400' : 'text-red-400'}`}>
                  {wonLast ? t.youWon : t.youLost}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-white truncate flex-1">{player?.name?.split(' ')[0] || '—'}</span>
                <span className="text-xs text-white/40 mx-2">{t.vs}</span>
                <span className="text-sm text-white/60 truncate flex-1 text-right">{lastOpponent?.name?.split(' ')[0] || '—'}</span>
              </div>
            </div>
            
            {/* What's next */}
            {wonLast && nextStage[lastStage] ? (
              <p className="text-sm text-purple-300 mb-4">
                {t.waitingFor} {stageNames[nextStage[lastStage]]?.[language]?.toLowerCase() || '...'}
              </p>
            ) : !wonLast ? (
              <p className="text-sm text-white/40 mb-4">{t.goodSeason}</p>
            ) : (
              <p className="text-sm text-white/40 mb-4">{t.waitingFor}...</p>
            )}
          </>
        ) : (
          /* === NO MATCHES YET === */
          <div className="mb-4">
            <span className="text-[11px] uppercase tracking-widest text-amber-400/70 font-semibold">
              {stageNames.quarterfinal[language]}
            </span>
            <p className="text-sm text-white/40 mt-2">{t.waitingFor}...</p>
          </div>
        )}

        {/* View Bracket */}
        <Link
          href={`/${locale}/player/league?tab=playoffs`}
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg text-sm font-semibold text-purple-200 transition-colors hover:text-white"
          style={{ background: 'rgba(168,85,247,0.15)', border: '1px solid rgba(168,85,247,0.25)' }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
          {t.viewBracket}
        </Link>
      </div>
    </div>
  )
}
