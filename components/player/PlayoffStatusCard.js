import Link from 'next/link'

/**
 * Shows playoff status on the dashboard when playoffs are active.
 * Replaces MiniStandings during playoff phase.
 * Displays player's current stage, opponent, and link to bracket.
 */
export default function PlayoffStatusCard({ matches, player, leagueInfo, language = 'es', locale = 'es' }) {
  // Find the player's active playoff match
  const playoffMatch = matches?.find(m => 
    m.matchType === 'playoff' && m.status === 'scheduled'
  )
  
  // Find completed playoff matches for this player
  const completedPlayoffs = matches?.filter(m => 
    m.matchType === 'playoff' && m.status === 'completed'
  ) || []

  const stageNames = {
    quarterfinal: { es: 'Cuartos de Final', en: 'Quarterfinals' },
    semifinal: { es: 'Semifinales', en: 'Semifinals' },
    final: { es: 'Final', en: 'Final' },
    third_place: { es: 'Tercer Puesto', en: '3rd Place' }
  }

  // Determine current stage
  const currentStage = playoffMatch?.playoffInfo?.stage || null
  const stageName = stageNames[currentStage]?.[language] || stageNames[currentStage]?.es || (language === 'es' ? 'Playoffs' : 'Playoffs')

  // Find opponent
  const getOpponent = (match) => {
    if (!match || !player) return null
    const p1 = match.players?.player1
    const p2 = match.players?.player2
    const playerId = player._id?.toString()
    if (p1?._id?.toString() === playerId) return p2
    if (p2?._id?.toString() === playerId) return p1
    return null
  }

  const opponent = getOpponent(playoffMatch)
  const wins = completedPlayoffs.filter(m => m.result?.winner?.toString() === player?._id?.toString() || m.result?.winner?._id?.toString() === player?._id?.toString()).length

  const t = language === 'es' ? {
    title: 'Playoffs',
    yourMatch: 'Tu partido',
    vs: 'vs',
    seed: 'Seed',
    won: 'ganado',
    viewBracket: 'Ver cuadro',
    waiting: 'Esperando siguiente ronda',
    eliminated: 'Temporada finalizada'
  } : {
    title: 'Playoffs',
    yourMatch: 'Your match',
    vs: 'vs',
    seed: 'Seed',
    won: 'won',
    viewBracket: 'View bracket',
    waiting: 'Waiting for next round',
    eliminated: 'Season finished'
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-purple-200 shadow-sm" style={{ background: 'linear-gradient(145deg, #1a0a2e 0%, #16082a 50%, #0f0520 100%)' }}>
      {/* Subtle glow */}
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
          {completedPlayoffs.length > 0 && (
            <span className="text-xs text-purple-300 bg-purple-500/20 px-2 py-1 rounded-full">
              {wins}W {completedPlayoffs.length - wins}L
            </span>
          )}
        </div>

        {playoffMatch ? (
          <>
            {/* Current Stage */}
            <div className="mb-3">
              <span className="text-[11px] uppercase tracking-widest text-amber-400/70 font-semibold">{stageName}</span>
            </div>

            {/* Match Card */}
            <div className="rounded-lg p-3 mb-4" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(168,85,247,0.2)' }}>
              <p className="text-[10px] uppercase tracking-wider text-white/30 mb-2">{t.yourMatch}</p>
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold text-white truncate flex-1">
                  {player?.name?.split(' ')[0] || '—'}
                </div>
                <span className="text-xs text-white/40 mx-2">{t.vs}</span>
                <div className="text-sm font-semibold text-white truncate flex-1 text-right">
                  {opponent?.name?.split(' ')[0] || '—'}
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="mb-4">
            <p className="text-sm text-white/50">{t.waiting}</p>
          </div>
        )}

        {/* View Bracket Link */}
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
