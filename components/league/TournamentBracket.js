import React from 'react'
import { formatPlayerNameForStandings } from '@/lib/utils/playerNameUtils'

export default function TournamentBracket({ 
  bracket, 
  qualifiedPlayers, 
  matches,
  group = 'A',
  language = 'es',
  onMatchClick,
  hideTitle = false,  // New prop to optionally hide title
  hideLegend = false  // New prop to optionally hide legend
}) {
  // Helper to get player by seed
  const getPlayerBySeed = (seed) => {
    const player = qualifiedPlayers?.find(p => p.seed === seed)
    return player?.player
  }

  // Helper to format player name
  const formatName = (player) => {
    if (!player) return '—'
    if (typeof player === 'string') return player
    return formatPlayerNameForStandings(player.name || player, language)
  }

  // Helper to get match result
  const getMatchResult = (match) => {
    if (!match || match.status !== 'completed') return null
    return {
      winner: match.result?.winner,
      score: match.getScoreDisplay ? match.getScoreDisplay() : 
             match.result?.score?.sets?.map(set => `${set.player1}-${set.player2}`).join(', ')
    }
  }

  // Helper to determine if player won
  const isWinner = (player, match) => {
    if (!player || !match || match.status !== 'completed') return false
    return match.result?.winner?._id === player._id || match.result?.winner === player._id
  }

  // Helper to get winner from a completed match
  const getMatchWinner = (match) => {
    if (!match || match.status !== 'completed' || !match.result?.winner) return null
    
    // Find the winner player object from the match
    const winnerId = match.result.winner._id || match.result.winner
    if (match.players.player1._id === winnerId || match.players.player1._id?.toString() === winnerId?.toString()) {
      return match.players.player1
    }
    if (match.players.player2._id === winnerId || match.players.player2._id?.toString() === winnerId?.toString()) {
      return match.players.player2
    }
    return null
  }

  // Get match status color
  const getMatchStatusColor = (match) => {
    if (!match) return 'bg-gray-100'
    if (match.status === 'completed') return 'bg-green-50 border-green-300'
    if (match.status === 'scheduled') return 'bg-blue-50 border-blue-300'
    return 'bg-gray-50'
  }

  // Render a match box
  const MatchBox = ({ match, player1, player2, stage, matchNumber }) => {
    const result = getMatchResult(match)
    const statusColor = getMatchStatusColor(match)
    
    return (
      <div 
        className={`border rounded-lg p-3 cursor-pointer transition-all hover:shadow-md ${statusColor} w-full`}
        onClick={() => onMatchClick && onMatchClick(match)}
      >
        <div className="text-xs text-gray-500 mb-1">
          {stage === 'quarterfinal' && `${language === 'es' ? 'Cuartos' : 'QF'} ${matchNumber}`}
          {stage === 'semifinal' && `${language === 'es' ? 'Semifinal' : 'SF'} ${matchNumber}`}
          {stage === 'final' && (language === 'es' ? 'Final' : 'Final')}
          {stage === 'third_place' && (language === 'es' ? '3er Puesto' : '3rd Place')}
        </div>
        
        <div className={`flex items-center justify-between py-1 ${isWinner(player1, match) ? 'font-bold' : ''}`}>
          <div className="flex items-center">
            <span className="text-sm">{formatName(player1)}</span>
            {player1?.seed && <span className="text-xs text-gray-400 ml-2">({player1.seed})</span>}
          </div>
          {result && (
            <span className="text-xs text-gray-600 font-mono">
              {result.score?.split(', ').map((set, index) => {
                const [p1Score, p2Score] = set.split('-')
                return (
                  <span key={index} className="ml-1">
                    {p1Score}
                  </span>
                )
              })}
            </span>
          )}
        </div>
        
        <div className="border-t my-1"></div>
        
        <div className={`flex items-center justify-between py-1 ${isWinner(player2, match) ? 'font-bold' : ''}`}>
          <div className="flex items-center">
            <span className="text-sm">{formatName(player2)}</span>
            {player2?.seed && <span className="text-xs text-gray-400 ml-2">({player2.seed})</span>}
          </div>
          {result && (
            <span className="text-xs text-gray-600 font-mono">
              {result.score?.split(', ').map((set, index) => {
                const [p1Score, p2Score] = set.split('-')
                return (
                  <span key={index} className="ml-1">
                    {p2Score}
                  </span>
                )
              })}
            </span>
          )}
        </div>
      </div>
    )
  }

  // Get winners for podium
  const getChampion = () => {
    if (!bracket?.final?.winner) return null
    return qualifiedPlayers?.find(p => p.player._id === bracket.final.winner)?.player
  }

  const getRunnerUp = () => {
    const finalMatch = matches?.find(m => m.playoffInfo?.stage === 'final')
    if (!finalMatch || !finalMatch.result?.winner) return null
    const champion = getChampion()
    // Find the other player in the final who is not the champion
    const player1 = finalMatch.players?.player1
    const player2 = finalMatch.players?.player2
    if (player1?._id === champion?._id) return player2
    if (player2?._id === champion?._id) return player1
    return null
  }

  const getThirdPlace = () => {
    const thirdPlaceMatch = matches?.find(m => m.playoffInfo?.stage === 'third_place')
    if (!thirdPlaceMatch || !thirdPlaceMatch.result?.winner) return null
    const winnerId = thirdPlaceMatch.result.winner
    return thirdPlaceMatch.players?.player1?._id === winnerId 
      ? thirdPlaceMatch.players.player1 
      : thirdPlaceMatch.players.player2
  }

  return (
    <div className="w-full">
      <div className="w-full p-4">
        {/* Title - only show if not hidden */}
        {!hideTitle && (
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {language === 'es' ? 'Playoff Grupo' : 'Playoff Group'} {group}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {language === 'es' ? 'Formato de eliminación directa' : 'Single elimination format'}
            </p>
          </div>
        )}

        {/* Tournament Bracket Grid - OPTIMIZED FOR NO SCROLLBAR */}
        <div className="grid grid-cols-5 gap-3 max-w-full">
          
          {/* Quarterfinals Column */}
          <div className="flex flex-col min-w-0">
            <h3 className="text-base font-semibold mb-3 text-center text-gray-700">
              {language === 'es' ? 'Cuartos de Final' : 'Quarterfinals'}
            </h3>
            <div className="space-y-3">
              {[0, 1, 2, 3].map((i) => {
                const qfMatch = bracket?.quarterfinals?.[i]
                const matchData = matches?.find(m => 
                  m._id === qfMatch?.matchId || 
                  (m.playoffInfo?.stage === 'quarterfinal' && m.playoffInfo?.matchNumber === i + 1)
                )
                const player1 = getPlayerBySeed(qfMatch?.seed1 || (i * 2 + 1))
                const player2 = getPlayerBySeed(qfMatch?.seed2 || (i * 2 + 2))
                
                return (
                  <MatchBox
                    key={`qf-${i}`}
                    match={matchData}
                    player1={player1}
                    player2={player2}
                    stage="quarterfinal"
                    matchNumber={i + 1}
                  />
                )
              })}
            </div>
          </div>

          {/* Semifinals Column - PROPERLY SIZED AND CENTERED */}
          <div className="flex flex-col min-w-0">
            <h3 className="text-base font-semibold mb-3 text-center text-gray-700">
              {language === 'es' ? 'Semifinales' : 'Semifinals'}
            </h3>
            <div className="flex flex-col justify-around flex-1 py-6">
              {/* Top semifinal - centered between QF1 and QF2 */}
              <div className="w-full">
                {(() => {
                  const sfMatch = bracket?.semifinals?.[0]
                  const matchData = matches?.find(m => 
                    m._id === sfMatch?.matchId ||
                    (m.playoffInfo?.stage === 'semifinal' && m.playoffInfo?.matchNumber === 1)
                  )
                  
                  // Get winners from quarterfinals matches
                  const qf1Match = matches?.find(m => 
                    m.playoffInfo?.stage === 'quarterfinal' && m.playoffInfo?.matchNumber === 1
                  )
                  const qf2Match = matches?.find(m => 
                    m.playoffInfo?.stage === 'quarterfinal' && m.playoffInfo?.matchNumber === 2
                  )
                  const player1 = getMatchWinner(qf1Match)
                  const player2 = getMatchWinner(qf2Match)
                  
                  return (
                    <MatchBox
                      match={matchData}
                      player1={player1}
                      player2={player2}
                      stage="semifinal"
                      matchNumber={1}
                    />
                  )
                })()}
              </div>
              
              {/* Bottom semifinal - centered between QF3 and QF4 */}
              <div className="w-full">
                {(() => {
                  const sfMatch = bracket?.semifinals?.[1]
                  const matchData = matches?.find(m => 
                    m._id === sfMatch?.matchId ||
                    (m.playoffInfo?.stage === 'semifinal' && m.playoffInfo?.matchNumber === 2)
                  )
                  
                  // Get winners from quarterfinals matches
                  const qf3Match = matches?.find(m => 
                    m.playoffInfo?.stage === 'quarterfinal' && m.playoffInfo?.matchNumber === 3
                  )
                  const qf4Match = matches?.find(m => 
                    m.playoffInfo?.stage === 'quarterfinal' && m.playoffInfo?.matchNumber === 4
                  )
                  const player1 = getMatchWinner(qf3Match)
                  const player2 = getMatchWinner(qf4Match)
                  
                  return (
                    <MatchBox
                      match={matchData}
                      player1={player1}
                      player2={player2}
                      stage="semifinal"
                      matchNumber={2}
                    />
                  )
                })()}
              </div>
            </div>
          </div>

          {/* Finals Column - SWAPPED ORDER: 3RD PLACE FIRST, GRAND FINAL LAST */}
          <div className="col-span-2 flex flex-col min-w-0">
            <h3 className="text-base font-semibold mb-3 text-center text-gray-700">
              {language === 'es' ? 'Finales' : 'Finals'}
            </h3>
            <div className="flex-1 flex items-center">
              <div className="grid grid-cols-2 gap-3 w-full">
                {/* 3rd Place Match - NOW FIRST */}
                <div className="w-full">
                  <h4 className="text-xs font-medium text-gray-600 mb-2 text-center">
                    {language === 'es' ? '3er/4to Puesto' : '3rd/4th Place'}
                  </h4>
                  <div className="bg-gray-50 border border-gray-300 rounded-lg p-1">
                    {(() => {
                      const thirdPlaceMatch = bracket?.thirdPlace
                      const matchData = matches?.find(m => 
                        m._id === thirdPlaceMatch?.matchId ||
                        m.playoffInfo?.stage === 'third_place'
                      )
                      
                      // Get losers from semifinals
                      // This would need more complex logic to track SF losers
                      
                      return (
                        <MatchBox
                          match={matchData}
                          player1={null}
                          player2={null}
                          stage="third_place"
                        />
                      )
                    })()}
                  </div>
                </div>
                
                {/* Grand Final - NOW SECOND (LAST) */}
                <div className="w-full">
                  <h4 className="text-xs font-medium text-gray-600 mb-2 text-center">
                    {language === 'es' ? '1er/2do Puesto' : '1st/2nd Place'}
                  </h4>
                  <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-1">
                    {(() => {
                      const finalMatch = bracket?.final
                      const matchData = matches?.find(m => 
                        m._id === finalMatch?.matchId ||
                        m.playoffInfo?.stage === 'final'
                      )
                      
                      // Get winners from semifinals matches
                      const sf1Match = matches?.find(m => 
                        m.playoffInfo?.stage === 'semifinal' && m.playoffInfo?.matchNumber === 1
                      )
                      const sf2Match = matches?.find(m => 
                        m.playoffInfo?.stage === 'semifinal' && m.playoffInfo?.matchNumber === 2
                      )
                      const player1 = getMatchWinner(sf1Match)
                      const player2 = getMatchWinner(sf2Match)
                      
                      return (
                        <MatchBox
                          match={matchData}
                          player1={player1}
                          player2={player2}
                          stage="final"
                        />
                      )
                    })()}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Podium Display - COMPACT VERSION */}
          <div className="flex flex-col min-w-0">
            <h3 className="text-base font-semibold mb-3 text-center text-gray-700">
              {language === 'es' ? 'Podio' : 'Podium'}
            </h3>
            <div className="flex-1 flex flex-col justify-center">
              <div className="space-y-2">
                {/* 1st Place - Champion - COMPACT */}
                <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 text-white rounded-lg p-2 text-center shadow transform hover:scale-105 transition-transform">
                  <div className="text-lg">🥇</div>
                  <div className="text-[10px] uppercase tracking-wider opacity-90">
                    {language === 'es' ? 'Campeón' : 'Champion'}
                  </div>
                  <div className="text-xs font-bold mt-0.5 truncate px-1">
                    {formatName(getChampion())}
                  </div>
                </div>

                {/* 2nd Place - COMPACT */}
                <div className="bg-gradient-to-br from-gray-300 to-gray-500 text-white rounded-lg p-2 text-center shadow transform hover:scale-105 transition-transform">
                  <div className="text-base">🥈</div>
                  <div className="text-[10px] uppercase tracking-wider opacity-90">
                    {language === 'es' ? '2do' : '2nd'}
                  </div>
                  <div className="text-xs font-bold mt-0.5 truncate px-1">
                    {formatName(getRunnerUp())}
                  </div>
                </div>

                {/* 3rd Place - COMPACT */}
                <div className="bg-gradient-to-br from-orange-400 to-orange-600 text-white rounded-lg p-2 text-center shadow transform hover:scale-105 transition-transform">
                  <div className="text-base">🥉</div>
                  <div className="text-[10px] uppercase tracking-wider opacity-90">
                    {language === 'es' ? '3ro' : '3rd'}
                  </div>
                  <div className="text-xs font-bold mt-0.5 truncate px-1">
                    {formatName(getThirdPlace())}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Legend - only show if not hidden */}
        {!hideLegend && (
          <div className="mt-6 flex justify-center space-x-4 text-xs">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-50 border border-green-300 rounded mr-1.5"></div>
              <span>{language === 'es' ? 'Completado' : 'Completed'}</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-50 border border-blue-300 rounded mr-1.5"></div>
              <span>{language === 'es' ? 'Programado' : 'Scheduled'}</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-gray-100 border border-gray-300 rounded mr-1.5"></div>
              <span>{language === 'es' ? 'Pendiente' : 'Pending'}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}