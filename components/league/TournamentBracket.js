import React, { useState } from 'react'
import { formatPlayerNameForStandings } from '@/lib/utils/playerNameUtils'

export default function TournamentBracket({ 
  bracket, 
  qualifiedPlayers, 
  matches,
  group = 'A',
  language = 'es',
  onMatchClick,
  title,
  player: currentPlayer,
  locale,
  hideTitle = false,
  hideLegend = false
}) {
  // === HELPER FUNCTIONS (unchanged) ===
  const getPlayerBySeed = (seed) => {
    const player = qualifiedPlayers?.find(p => p.seed === seed)
    return player?.player
  }

  const formatName = (player) => {
    if (!player) return '—'
    if (typeof player === 'string') return player
    return formatPlayerNameForStandings(player.name || player, language)
  }

  const getMatchResult = (match) => {
    if (!match || match.status !== 'completed') return null
    const isWalkover = match.result?.score?.walkover
    const isRetirement = match.result?.score?.retiredPlayer
    return {
      winner: match.result?.winner,
      score: match.getScoreDisplay ? match.getScoreDisplay() : 
             match.result?.score?.sets?.map(set => `${set.player1}-${set.player2}`).join(', '),
      isWalkover,
      isRetirement,
      retiredPlayer: match.result?.score?.retiredPlayer
    }
  }

  const isWinner = (player, match) => {
    if (!player || !match || match.status !== 'completed') return false
    return match.result?.winner?._id === player._id || match.result?.winner === player._id
  }

  const getMatchWinner = (match) => {
    if (!match || match.status !== 'completed' || !match.result?.winner) return null
    const winnerId = match.result.winner._id || match.result.winner
    if (match.players.player1._id === winnerId || match.players.player1._id?.toString() === winnerId?.toString()) return match.players.player1
    if (match.players.player2._id === winnerId || match.players.player2._id?.toString() === winnerId?.toString()) return match.players.player2
    return null
  }

  const getMatchLoser = (match) => {
    if (!match || match.status !== 'completed' || !match.result?.winner) return null
    const winnerId = match.result.winner._id || match.result.winner
    if (match.players.player1._id === winnerId || match.players.player1._id?.toString() === winnerId?.toString()) return match.players.player2
    if (match.players.player2._id === winnerId || match.players.player2._id?.toString() === winnerId?.toString()) return match.players.player1
    return null
  }

  const formatSchedule = (match) => {
    if (!match?.schedule?.confirmedDate) return null
    const date = new Date(match.schedule.confirmedDate)
    return {
      date: date.toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US', { day: 'numeric', month: 'short' }),
      time: match.schedule.time || date.toLocaleTimeString(language === 'es' ? 'es-ES' : 'en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
      venue: match.schedule.club || match.schedule.venue,
      court: match.schedule.court
    }
  }

  const getChampion = () => {
    if (!bracket?.final?.winner) return null
    const winnerId = bracket.final.winner._id || bracket.final.winner
    return qualifiedPlayers?.find(p => p.player._id === winnerId || p.player._id?.toString() === winnerId?.toString())?.player
  }

  const getRunnerUp = () => {
    const finalMatch = matches?.find(m => m.playoffInfo?.stage === 'final')
    if (!finalMatch || !finalMatch.result?.winner) return null
    const champion = getChampion()
    if (!champion) return null
    const player1 = finalMatch.players?.player1
    const player2 = finalMatch.players?.player2
    const championId = champion._id?.toString()
    if (player1?._id?.toString() === championId) return player2
    if (player2?._id?.toString() === championId) return player1
    return null
  }

  const getThirdPlace = () => {
    const thirdPlaceMatch = matches?.find(m => m.playoffInfo?.stage === 'third_place')
    if (!thirdPlaceMatch || !thirdPlaceMatch.result?.winner) return null
    const winnerId = thirdPlaceMatch.result.winner._id || thirdPlaceMatch.result.winner
    if (thirdPlaceMatch.players?.player1?._id === winnerId || thirdPlaceMatch.players?.player1?._id?.toString() === winnerId?.toString()) return thirdPlaceMatch.players.player1
    if (thirdPlaceMatch.players?.player2?._id === winnerId || thirdPlaceMatch.players?.player2?._id?.toString() === winnerId?.toString()) return thirdPlaceMatch.players.player2
    return null
  }

  // === INTERACTIVE STATE ===
  const [expandedMatchId, setExpandedMatchId] = useState(null)
  const currentPlayerId = currentPlayer?._id?.toString()

  const isPlayerMatch = (match) => {
    if (!currentPlayerId || !match) return false
    const p1 = match.players?.player1?._id?.toString()
    const p2 = match.players?.player2?._id?.toString()
    return p1 === currentPlayerId || p2 === currentPlayerId
  }

  const getPlayerOpponent = (match) => {
    if (!currentPlayerId || !match) return null
    const p1 = match.players?.player1
    const p2 = match.players?.player2
    if (p1?._id?.toString() === currentPlayerId) return p2
    if (p2?._id?.toString() === currentPlayerId) return p1
    return null
  }

  const openWhatsApp = (match, stage) => {
    const opp = getPlayerOpponent(match)
    if (!opp?.whatsapp) return
    let cleaned = opp.whatsapp.replace(/[^0-9]/g, '')
    if (cleaned.startsWith('00')) cleaned = cleaned.substring(2)
    const stages = {
      quarterfinal: { es: 'cuartos de final de los playoffs', en: 'playoff quarterfinals' },
      semifinal: { es: 'las semifinales de los playoffs', en: 'the playoff semifinals' },
      final: { es: 'la final de los playoffs', en: 'the playoff final' },
      third_place: { es: 'el partido por el tercer puesto', en: 'the 3rd place playoff' }
    }
    const rl = stages[stage]?.[language] || stages.quarterfinal[language]
    const msg = language === 'es'
      ? 'Hola ' + (opp.name?.split(' ')[0] || '') + '! Soy ' + (currentPlayer?.name?.split(' ')[0] || '') + ' de TDP. Cuando te viene bien para jugar nuestro partido de ' + rl + '?'
      : 'Hi ' + (opp.name?.split(' ')[0] || '') + '! I am ' + (currentPlayer?.name?.split(' ')[0] || '') + ' from TDP. When would suit you for our ' + rl + ' match?'
    window.open('https://wa.me/' + cleaned + '?text=' + encodeURIComponent(msg), '_blank')
  }

  // === MATCH BOX COMPONENT ===
  const MatchBox = ({ match, player1, player2, stage, matchNumber }) => {
    const result = getMatchResult(match)
    const scheduleInfo = formatSchedule(match)
    const isWalkover = result?.isWalkover
    const isRetirement = result?.isRetirement
    const isCompleted = match?.status === 'completed'
    const isScheduled = match?.status === 'scheduled'

    const isMyMatch = isPlayerMatch(match)
    const borderColor = isCompleted ? 'border-emerald-500/40' : isMyMatch && isScheduled ? 'border-purple-400/70' : isScheduled ? 'border-purple-400/40' : 'border-white/10'
    const glowStyle = isScheduled ? { boxShadow: '0 0 15px rgba(168, 85, 247, 0.15)' } : isCompleted ? { boxShadow: '0 0 15px rgba(16, 185, 129, 0.1)' } : {}

    const stageLabels = {
      quarterfinal: `${language === 'es' ? 'CF' : 'QF'} ${matchNumber}`,
      semifinal: `${language === 'es' ? 'SF' : 'SF'} ${matchNumber}`,
      final: 'Final',
      third_place: language === 'es' ? '3er Puesto' : '3rd Place'
    }

    return (
      <div
        className={`relative border rounded-lg backdrop-blur-md transition-all hover:border-purple-400/60 cursor-pointer w-full min-w-[180px] lg:min-w-0 ${borderColor}`}
        style={{ background: 'rgba(255,255,255,0.06)', ...glowStyle }}
        onClick={() => { if (isPlayerMatch(match) && match?.status === 'scheduled') { setExpandedMatchId(expandedMatchId === match?._id ? null : match?._id) } else if (onMatchClick) { onMatchClick(match) } }}
      >
        <div className="px-3 pt-2 pb-1 flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-400/80">{stageLabels[stage]}</span>
          {isWalkover && <span className="px-1.5 py-0.5 text-[9px] font-bold bg-white/10 text-gray-400 rounded uppercase">W.O.</span>}
          {isRetirement && <span className="px-1.5 py-0.5 text-[9px] font-bold bg-amber-500/20 text-amber-400 rounded uppercase">RET</span>}
        </div>

        {scheduleInfo && !isCompleted && (
          <div className="mx-3 mb-1 px-2 py-1 rounded bg-purple-500/10 border border-purple-400/20">
            <div className="flex items-center text-[11px] text-purple-300">
              <svg className="w-3 h-3 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              <span className="font-medium">{scheduleInfo.date} · {scheduleInfo.time}</span>
            </div>
            {(scheduleInfo.venue || scheduleInfo.court) && (
              <div className="flex items-center text-[10px] text-purple-300/60 mt-0.5 ml-4">
                {scheduleInfo.venue}{scheduleInfo.venue && scheduleInfo.court ? ' · ' : ''}{scheduleInfo.court ? ((language === 'es' ? 'Pista ' : 'Court ') + scheduleInfo.court) : ''}
              </div>
            )}
          </div>
        )}

        <div className="px-3 pb-2">
          {/* Player 1 */}
          <div className={`flex items-center justify-between py-1.5 ${isWinner(player1, match) ? '' : ''}`}>
            <span className={`text-sm truncate ${isWinner(player1, match) ? 'text-white font-bold' : isCompleted ? 'text-gray-500' : 'text-gray-200'}`}>
              {formatName(player1)}
            </span>
            {result && !isWalkover && (
              <span className="text-xs text-gray-400 font-mono ml-2 flex-shrink-0">
                {result.score?.split(', ').map((set, idx) => <span key={idx} className={`ml-0.5 ${isWinner(player1, match) ? 'text-white' : ''}`}>{set.split('-')[0]}</span>)}
              </span>
            )}
          </div>

          <div className="border-t border-white/10"></div>

          {/* Player 2 */}
          <div className={`flex items-center justify-between py-1.5`}>
            <span className={`text-sm truncate ${isWinner(player2, match) ? 'text-white font-bold' : isCompleted ? 'text-gray-500' : 'text-gray-200'}`}>
              {formatName(player2)}
            </span>
            {result && !isWalkover && (
              <span className="text-xs text-gray-400 font-mono ml-2 flex-shrink-0">
                {result.score?.split(', ').map((set, idx) => <span key={idx} className={`ml-0.5 ${isWinner(player2, match) ? 'text-white' : ''}`}>{set.split('-')[1]}</span>)}
              </span>
            )}
          </div>
        </div>

        {/* Action buttons for player match */}
        {isPlayerMatch(match) && match?.status === 'scheduled' && expandedMatchId === match?._id && (
          <div className="px-2 pb-2 flex gap-1.5">
            {getPlayerOpponent(match)?.whatsapp && (
              <button onClick={(e) => { e.stopPropagation(); openWhatsApp(match, stage) }}
                className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded text-[11px] font-medium bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                WhatsApp
              </button>
            )}
            <a href={'/' + (locale || language) + '/player/matches'} onClick={(e) => e.stopPropagation()}
              className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded text-[11px] font-medium bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 transition-colors">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              {language === 'es' ? 'Gestionar' : 'Manage'}
            </a>
          </div>
        )}
        {isPlayerMatch(match) && match?.status === 'scheduled' && expandedMatchId !== match?._id && (
          <div className="px-3 pb-2"><span className="text-[10px] text-purple-400/60">{language === 'es' ? 'Toca para acciones' : 'Tap for actions'}</span></div>
        )}

        {/* Winner indicator line */}
        {isCompleted && <div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-b-lg bg-gradient-to-r from-emerald-500/0 via-emerald-500/60 to-emerald-500/0"></div>}
        {isScheduled && <div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-b-lg bg-gradient-to-r from-purple-500/0 via-purple-400/60 to-purple-500/0"></div>}
      </div>
    )
  }

  // === COLUMN HEADER ===
  const ColumnHeader = ({ children, className = '' }) => (
    <h3 className={`text-sm font-bold mb-3 text-center uppercase tracking-widest text-white/50 ${className}`}>{children}</h3>
  )

  // === HELPER: Get QF/SF match data ===
  const getQFMatch = (i) => {
    const qfMatch = bracket?.quarterfinals?.[i]
    return matches?.find(m => m._id === qfMatch?.matchId || (m.playoffInfo?.stage === 'quarterfinal' && m.playoffInfo?.matchNumber === i + 1))
  }
  const getSFMatch = (i) => {
    const sfMatch = bracket?.semifinals?.[i]
    return matches?.find(m => m._id === sfMatch?.matchId || (m.playoffInfo?.stage === 'semifinal' && m.playoffInfo?.matchNumber === i + 1))
  }
  const getFinalMatch = () => {
    const fm = bracket?.final
    return matches?.find(m => m._id === fm?.matchId || m.playoffInfo?.stage === 'final')
  }
  const getThirdPlaceMatch = () => {
    const tp = bracket?.thirdPlace
    return matches?.find(m => m._id === tp?.matchId || m.playoffInfo?.stage === 'third_place')
  }

  // === PODIUM CARD ===
  const PodiumCard = ({ place, label, player, gradient, textSize = 'text-xs' }) => (
    <div className={`relative overflow-hidden rounded-xl p-3 text-center ${gradient} transition-transform hover:scale-105`} style={{ boxShadow: place === 1 ? '0 0 30px rgba(251, 191, 36, 0.25)' : 'none' }}>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(255,255,255,0.15)_0%,_transparent_70%)]"></div>
      <div className="relative">
        <div className={`font-black ${place === 1 ? 'text-3xl' : 'text-2xl'}`}>{place === 1 ? '1' : place === 2 ? '2' : '3'}</div>
        <div className="text-[10px] uppercase tracking-widest opacity-80 mt-0.5">{label}</div>
        <div className={`${textSize} font-bold mt-1 truncate px-1`}>{formatName(player)}</div>
      </div>
    </div>
  )

  // === MAIN RENDER ===
  return (
    <div className="w-full rounded-2xl overflow-hidden" style={{ background: 'linear-gradient(145deg, #1a0a2e 0%, #16082a 30%, #0f0520 60%, #0a0318 100%)' }}>
      <div className="w-full p-5 lg:p-8">
        
        {(title || !hideTitle) && (
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-white">{title || ((language === 'es' ? 'Playoff Grupo ' : 'Playoff Group ') + group)}</h2>
            <p className="text-sm text-white/40 mt-1">{language === 'es' ? 'Eliminación directa' : 'Single elimination'}</p>
          </div>
        )}

        {/* Mobile scroll hint */}
        <div className="lg:hidden text-center mb-4">
          <div className="inline-flex items-center text-xs text-white/40 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">
            <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            {language === 'es' ? 'Desliza para ver el bracket' : 'Swipe to see bracket'}
            <svg className="w-3.5 h-3.5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </div>
        </div>

        {/* === DESKTOP BRACKET === */}
        <div className="hidden lg:grid lg:grid-cols-5 gap-4">
          
          {/* QF Column */}
          <div className="flex flex-col">
            <ColumnHeader>{language === 'es' ? 'Cuartos' : 'Quarters'}</ColumnHeader>
            <div className="space-y-3">
              {[0,1,2,3].map(i => {
                const qf = bracket?.quarterfinals?.[i]
                return <MatchBox key={`qf-${i}`} match={getQFMatch(i)} player1={getPlayerBySeed(qf?.seed1 || (i*2+1))} player2={getPlayerBySeed(qf?.seed2 || (i*2+2))} stage="quarterfinal" matchNumber={i+1} />
              })}
            </div>
          </div>

          {/* SF Column */}
          <div className="flex flex-col">
            <ColumnHeader>{language === 'es' ? 'Semifinales' : 'Semifinals'}</ColumnHeader>
            <div className="flex flex-col justify-around flex-1 py-8 space-y-4">
              <MatchBox match={getSFMatch(0)} player1={getMatchWinner(getQFMatch(0))} player2={getMatchWinner(getQFMatch(1))} stage="semifinal" matchNumber={1} />
              <MatchBox match={getSFMatch(1)} player1={getMatchWinner(getQFMatch(2))} player2={getMatchWinner(getQFMatch(3))} stage="semifinal" matchNumber={2} />
            </div>
          </div>

          {/* Finals Column */}
          <div className="col-span-2 flex flex-col">
            <ColumnHeader>{language === 'es' ? 'Finales' : 'Finals'}</ColumnHeader>
            <div className="flex-1 flex items-center">
              <div className="grid grid-cols-2 gap-4 w-full">
                {/* 3rd Place */}
                <div>
                  <p className="text-[10px] text-white/30 text-center uppercase tracking-wider mb-2">{language === 'es' ? '3er / 4to' : '3rd / 4th'}</p>
                  <MatchBox match={getThirdPlaceMatch()} player1={getMatchLoser(getSFMatch(0))} player2={getMatchLoser(getSFMatch(1))} stage="third_place" />
                </div>
                {/* Grand Final */}
                <div>
                  <p className="text-[10px] text-amber-400/60 text-center uppercase tracking-wider mb-2">{language === 'es' ? '1er / 2do' : '1st / 2nd'}</p>
                  <div className="rounded-lg p-px" style={{ background: 'linear-gradient(135deg, rgba(251,191,36,0.4), rgba(251,191,36,0.1), rgba(251,191,36,0.3))' }}>
                    <div className="rounded-lg overflow-hidden">
                      <MatchBox match={getFinalMatch()} player1={getMatchWinner(getSFMatch(0))} player2={getMatchWinner(getSFMatch(1))} stage="final" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Podium */}
          <div className="flex flex-col">
            <ColumnHeader>{language === 'es' ? 'Podio' : 'Podium'}</ColumnHeader>
            <div className="flex-1 flex flex-col justify-center space-y-2">
              <PodiumCard place={1} label={language === 'es' ? 'Campeón' : 'Champion'} player={getChampion()} gradient="bg-gradient-to-br from-yellow-500 via-amber-500 to-yellow-600 text-white" />
              <PodiumCard place={2} label={language === 'es' ? 'Subcampeón' : 'Runner-up'} player={getRunnerUp()} gradient="bg-gradient-to-br from-gray-300 via-slate-400 to-gray-500 text-white" />
              <PodiumCard place={3} label={language === 'es' ? 'Tercero' : 'Third'} player={getThirdPlace()} gradient="bg-gradient-to-br from-orange-500 via-amber-600 to-orange-600 text-white" />
            </div>
          </div>
        </div>

        {/* === MOBILE BRACKET === */}
        <div className="lg:hidden overflow-x-auto -mx-5 px-5 bracket-scroll-container">
          <div className="flex gap-4 pb-4" style={{ minWidth: 'max-content' }}>
            
            {/* QF */}
            <div className="flex flex-col" style={{ minWidth: '200px' }}>
              <ColumnHeader>{language === 'es' ? 'Cuartos' : 'Quarters'}</ColumnHeader>
              <div className="space-y-3 flex-1">
                {[0,1,2,3].map(i => {
                  const qf = bracket?.quarterfinals?.[i]
                  return <MatchBox key={`qf-m-${i}`} match={getQFMatch(i)} player1={getPlayerBySeed(qf?.seed1 || (i*2+1))} player2={getPlayerBySeed(qf?.seed2 || (i*2+2))} stage="quarterfinal" matchNumber={i+1} />
                })}
              </div>
            </div>

            {/* SF */}
            <div className="flex flex-col" style={{ minWidth: '200px' }}>
              <ColumnHeader>{language === 'es' ? 'Semis' : 'Semis'}</ColumnHeader>
              <div className="flex flex-col justify-around flex-1 py-6 space-y-6">
                <MatchBox match={getSFMatch(0)} player1={getMatchWinner(getQFMatch(0))} player2={getMatchWinner(getQFMatch(1))} stage="semifinal" matchNumber={1} />
                <MatchBox match={getSFMatch(1)} player1={getMatchWinner(getQFMatch(2))} player2={getMatchWinner(getQFMatch(3))} stage="semifinal" matchNumber={2} />
              </div>
            </div>

            {/* Finals */}
            <div className="flex flex-col" style={{ minWidth: '200px' }}>
              <ColumnHeader>{language === 'es' ? 'Finales' : 'Finals'}</ColumnHeader>
              <div className="flex flex-col justify-center flex-1 space-y-4">
                <div>
                  <p className="text-[10px] text-white/30 text-center uppercase tracking-wider mb-2">{language === 'es' ? '3er Puesto' : '3rd Place'}</p>
                  <MatchBox match={getThirdPlaceMatch()} player1={getMatchLoser(getSFMatch(0))} player2={getMatchLoser(getSFMatch(1))} stage="third_place" />
                </div>
                <div>
                  <p className="text-[10px] text-amber-400/60 text-center uppercase tracking-wider mb-2">Final</p>
                  <div className="rounded-lg p-px" style={{ background: 'linear-gradient(135deg, rgba(251,191,36,0.4), rgba(251,191,36,0.1), rgba(251,191,36,0.3))' }}>
                    <div className="rounded-lg overflow-hidden">
                      <MatchBox match={getFinalMatch()} player1={getMatchWinner(getSFMatch(0))} player2={getMatchWinner(getSFMatch(1))} stage="final" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Podium */}
            <div className="flex flex-col" style={{ minWidth: '150px' }}>
              <ColumnHeader>{language === 'es' ? 'Podio' : 'Podium'}</ColumnHeader>
              <div className="flex flex-col justify-center flex-1 space-y-3">
                <PodiumCard place={1} label={language === 'es' ? 'Campeón' : 'Champion'} player={getChampion()} gradient="bg-gradient-to-br from-yellow-500 via-amber-500 to-yellow-600 text-white" textSize="text-sm" />
                <PodiumCard place={2} label={language === 'es' ? '2do' : '2nd'} player={getRunnerUp()} gradient="bg-gradient-to-br from-gray-300 via-slate-400 to-gray-500 text-white" textSize="text-sm" />
                <PodiumCard place={3} label={language === 'es' ? '3ro' : '3rd'} player={getThirdPlace()} gradient="bg-gradient-to-br from-orange-500 via-amber-600 to-orange-600 text-white" textSize="text-sm" />
              </div>
            </div>
          </div>
        </div>

        {/* Legend */}
        {!hideLegend && (
          <div className="mt-6 flex flex-wrap justify-center gap-4 text-[11px] text-white/30">
            <div className="flex items-center"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500/50 mr-1.5"></div>{language === 'es' ? 'Completado' : 'Completed'}</div>
            <div className="flex items-center"><div className="w-2.5 h-2.5 rounded-full bg-purple-400/50 mr-1.5"></div>{language === 'es' ? 'Programado' : 'Scheduled'}</div>
            <div className="flex items-center"><div className="w-2.5 h-2.5 rounded-full bg-white/15 mr-1.5"></div>{language === 'es' ? 'Pendiente' : 'Pending'}</div>
          </div>
        )}
      </div>
    </div>
  )
}
