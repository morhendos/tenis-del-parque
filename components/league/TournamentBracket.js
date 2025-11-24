import React from 'react'
import { formatPlayerNameForStandings } from '@/lib/utils/playerNameUtils'

export default function TournamentBracket({ 
  bracket, 
  qualifiedPlayers, 
  matches,
  group = 'A',
  language = 'es',
  onMatchClick,
  hideTitle = false,
  hideLegend = false
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

  // Helper to determine if player won
  const isWinner = (player, match) => {
    if (!player || !match || match.status !== 'completed') return false
    return match.result?.winner?._id === player._id || match.result?.winner === player._id
  }

  // Helper to get winner from a completed match
  const getMatchWinner = (match) => {
    if (!match || match.status !== 'completed' || !match.result?.winner) return null
    
    const winnerId = match.result.winner._id || match.result.winner
    if (match.players.player1._id === winnerId || match.players.player1._id?.toString() === winnerId?.toString()) {
      return match.players.player1
    }
    if (match.players.player2._id === winnerId || match.players.player2._id?.toString() === winnerId?.toString()) {
      return match.players.player2
    }
    return null
  }

  // Helper to get loser from a completed match
  const getMatchLoser = (match) => {
    if (!match || match.status !== 'completed' || !match.result?.winner) return null
    
    const winnerId = match.result.winner._id || match.result.winner
    // Return the player who is NOT the winner
    if (match.players.player1._id === winnerId || match.players.player1._id?.toString() === winnerId?.toString()) {
      return match.players.player2
    }
    if (match.players.player2._id === winnerId || match.players.player2._id?.toString() === winnerId?.toString()) {
      return match.players.player1
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
    
    // Determine match style based on type
    const isWalkover = result?.isWalkover
    const isRetirement = result?.isRetirement
    const matchStyle = isWalkover 
      ? 'border-dashed border-gray-400' 
      : isRetirement 
      ? 'border-dashed border-amber-400'
      : ''
    
    return (
      <div 
        className={`border rounded-lg p-3 cursor-pointer transition-all hover:shadow-md ${statusColor} ${matchStyle} w-full min-w-[180px] lg:min-w-0`}
        onClick={() => onMatchClick && onMatchClick(match)}
      >
        <div className="flex items-center justify-between mb-1">
          <div className="text-xs text-gray-500">
            {stage === 'quarterfinal' && `${language === 'es' ? 'Cuartos' : 'QF'} ${matchNumber}`}
            {stage === 'semifinal' && `${language === 'es' ? 'Semifinal' : 'SF'} ${matchNumber}`}
            {stage === 'final' && (language === 'es' ? 'Final' : 'Final')}
            {stage === 'third_place' && (language === 'es' ? '3er Puesto' : '3rd Place')}
          </div>
          
          {/* Match type badge */}
          {isWalkover && (
            <span className="px-2 py-0.5 text-[10px] font-semibold bg-gray-200 text-gray-700 rounded uppercase tracking-wide">
              W.O.
            </span>
          )}
          {isRetirement && (
            <span className="px-2 py-0.5 text-[10px] font-semibold bg-amber-100 text-amber-700 rounded uppercase tracking-wide">
              RET
            </span>
          )}
        </div>
        
        <div className={`flex items-center justify-between py-1 ${isWinner(player1, match) ? 'font-bold' : ''}`}>
          <div className="flex items-center">
            <span className="text-sm truncate">{formatName(player1)}</span>
            {player1?.seed && <span className="text-xs text-gray-400 ml-2">({player1.seed})</span>}
          </div>
          {result && !isWalkover && (
            <span className="text-xs text-gray-600 font-mono ml-2">
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
            <span className="text-sm truncate">{formatName(player2)}</span>
            {player2?.seed && <span className="text-xs text-gray-400 ml-2">({player2.seed})</span>}
          </div>
          {result && !isWalkover && (
            <span className="text-xs text-gray-600 font-mono ml-2">
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
        {/* Title */}
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

        {/* Mobile scroll hint */}
        <div className="lg:hidden text-center mb-4">
          <div className="inline-flex items-center text-xs text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            {language === 'es' ? 'Desliza para ver el bracket completo' : 'Swipe to see full bracket'}
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </div>
        </div>

        {/* Tournament Bracket - Horizontal scroll on mobile, grid on desktop */}
        <div className="relative">
          {/* Desktop: Grid layout */}
          <div className="hidden lg:grid lg:grid-cols-5 gap-3 max-w-full">
            
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

            {/* Semifinals Column */}
            <div className="flex flex-col min-w-0">
              <h3 className="text-base font-semibold mb-3 text-center text-gray-700">
                {language === 'es' ? 'Semifinales' : 'Semifinals'}
              </h3>
              <div className="flex flex-col justify-around flex-1 py-6">
                <div className="w-full">
                  {(() => {
                    const sfMatch = bracket?.semifinals?.[0]
                    const matchData = matches?.find(m => 
                      m._id === sfMatch?.matchId ||
                      (m.playoffInfo?.stage === 'semifinal' && m.playoffInfo?.matchNumber === 1)
                    )
                    
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
                
                <div className="w-full">
                  {(() => {
                    const sfMatch = bracket?.semifinals?.[1]
                    const matchData = matches?.find(m => 
                      m._id === sfMatch?.matchId ||
                      (m.playoffInfo?.stage === 'semifinal' && m.playoffInfo?.matchNumber === 2)
                    )
                    
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

            {/* Finals Column */}
            <div className="col-span-2 flex flex-col min-w-0">
              <h3 className="text-base font-semibold mb-3 text-center text-gray-700">
                {language === 'es' ? 'Finales' : 'Finals'}
              </h3>
              <div className="flex-1 flex items-center">
                <div className="grid grid-cols-2 gap-3 w-full">
                  {/* 3rd Place Match */}
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
                        const sf1Match = matches?.find(m => 
                          m.playoffInfo?.stage === 'semifinal' && m.playoffInfo?.matchNumber === 1
                        )
                        const sf2Match = matches?.find(m => 
                          m.playoffInfo?.stage === 'semifinal' && m.playoffInfo?.matchNumber === 2
                        )
                        
                        const player1 = getMatchLoser(sf1Match)
                        const player2 = getMatchLoser(sf2Match)
                        
                        return (
                          <MatchBox
                            match={matchData}
                            player1={player1}
                            player2={player2}
                            stage="third_place"
                          />
                        )
                      })()}
                    </div>
                  </div>
                  
                  {/* Grand Final */}
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

            {/* Podium Display */}
            <div className="flex flex-col min-w-0">
              <h3 className="text-base font-semibold mb-3 text-center text-gray-700">
                {language === 'es' ? 'Podio' : 'Podium'}
              </h3>
              <div className="flex-1 flex flex-col justify-center">
                <div className="space-y-2">
                  {/* 1st Place */}
                  <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 text-white rounded-lg p-2 text-center shadow transform hover:scale-105 transition-transform">
                    <div className="text-lg">🥇</div>
                    <div className="text-[10px] uppercase tracking-wider opacity-90">
                      {language === 'es' ? 'Campeón' : 'Champion'}
                    </div>
                    <div className="text-xs font-bold mt-0.5 truncate px-1">
                      {formatName(getChampion())}
                    </div>
                  </div>

                  {/* 2nd Place */}
                  <div className="bg-gradient-to-br from-gray-300 to-gray-500 text-white rounded-lg p-2 text-center shadow transform hover:scale-105 transition-transform">
                    <div className="text-base">🥈</div>
                    <div className="text-[10px] uppercase tracking-wider opacity-90">
                      {language === 'es' ? '2do' : '2nd'}
                    </div>
                    <div className="text-xs font-bold mt-0.5 truncate px-1">
                      {formatName(getRunnerUp())}
                    </div>
                  </div>

                  {/* 3rd Place */}
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

          {/* Mobile: Horizontal scroll layout */}
          <div className="lg:hidden overflow-x-auto -mx-4 px-4 bracket-scroll-container">
            <div className="flex gap-4 pb-4" style={{ minWidth: 'max-content' }}>
              
              {/* Quarterfinals */}
              <div className="flex flex-col" style={{ minWidth: '200px' }}>
                <h3 className="text-sm font-semibold mb-3 text-center text-gray-700 whitespace-nowrap">
                  {language === 'es' ? 'Cuartos' : 'Quarters'}
                </h3>
                <div className="space-y-3 flex-1">
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

              {/* Semifinals */}
              <div className="flex flex-col" style={{ minWidth: '200px' }}>
                <h3 className="text-sm font-semibold mb-3 text-center text-gray-700 whitespace-nowrap">
                  {language === 'es' ? 'Semis' : 'Semis'}
                </h3>
                <div className="flex flex-col justify-around flex-1 py-6 space-y-6">
                  <div>
                    {(() => {
                      const sfMatch = bracket?.semifinals?.[0]
                      const matchData = matches?.find(m => 
                        m._id === sfMatch?.matchId ||
                        (m.playoffInfo?.stage === 'semifinal' && m.playoffInfo?.matchNumber === 1)
                      )
                      
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
                  
                  <div>
                    {(() => {
                      const sfMatch = bracket?.semifinals?.[1]
                      const matchData = matches?.find(m => 
                        m._id === sfMatch?.matchId ||
                        (m.playoffInfo?.stage === 'semifinal' && m.playoffInfo?.matchNumber === 2)
                      )
                      
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

              {/* Finals */}
              <div className="flex flex-col" style={{ minWidth: '200px' }}>
                <h3 className="text-sm font-semibold mb-3 text-center text-gray-700 whitespace-nowrap">
                  {language === 'es' ? 'Finales' : 'Finals'}
                </h3>
                <div className="flex flex-col justify-center flex-1 space-y-4">
                  {/* 3rd Place */}
                  <div>
                    <h4 className="text-xs font-medium text-gray-600 mb-2 text-center">
                      {language === 'es' ? '3er Puesto' : '3rd Place'}
                    </h4>
                    <div className="bg-gray-50 border border-gray-300 rounded-lg p-1">
                      {(() => {
                        const thirdPlaceMatch = bracket?.thirdPlace
                        const matchData = matches?.find(m => 
                          m._id === thirdPlaceMatch?.matchId ||
                          m.playoffInfo?.stage === 'third_place'
                        )
                        
                        // Get losers from semifinals
                        const sf1Match = matches?.find(m => 
                          m.playoffInfo?.stage === 'semifinal' && m.playoffInfo?.matchNumber === 1
                        )
                        const sf2Match = matches?.find(m => 
                          m.playoffInfo?.stage === 'semifinal' && m.playoffInfo?.matchNumber === 2
                        )
                        
                        const player1 = getMatchLoser(sf1Match)
                        const player2 = getMatchLoser(sf2Match)
                        
                        return (
                          <MatchBox
                            match={matchData}
                            player1={player1}
                            player2={player2}
                            stage="third_place"
                          />
                        )
                      })()}
                    </div>
                  </div>
                  
                  {/* Grand Final */}
                  <div>
                    <h4 className="text-xs font-medium text-gray-600 mb-2 text-center">
                      {language === 'es' ? 'Final' : 'Final'}
                    </h4>
                    <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-1">
                      {(() => {
                        const finalMatch = bracket?.final
                        const matchData = matches?.find(m => 
                          m._id === finalMatch?.matchId ||
                          m.playoffInfo?.stage === 'final'
                        )
                        
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

              {/* Podium */}
              <div className="flex flex-col" style={{ minWidth: '150px' }}>
                <h3 className="text-sm font-semibold mb-3 text-center text-gray-700 whitespace-nowrap">
                  {language === 'es' ? 'Podio' : 'Podium'}
                </h3>
                <div className="flex flex-col justify-center flex-1">
                  <div className="space-y-3">
                    {/* 1st Place */}
                    <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 text-white rounded-lg p-3 text-center shadow">
                      <div className="text-2xl">🥇</div>
                      <div className="text-xs uppercase tracking-wider opacity-90 mt-1">
                        {language === 'es' ? 'Campeón' : 'Champion'}
                      </div>
                      <div className="text-sm font-bold mt-1 truncate px-1">
                        {formatName(getChampion())}
                      </div>
                    </div>

                    {/* 2nd Place */}
                    <div className="bg-gradient-to-br from-gray-300 to-gray-500 text-white rounded-lg p-3 text-center shadow">
                      <div className="text-xl">🥈</div>
                      <div className="text-xs uppercase tracking-wider opacity-90 mt-1">
                        {language === 'es' ? '2do' : '2nd'}
                      </div>
                      <div className="text-sm font-bold mt-1 truncate px-1">
                        {formatName(getRunnerUp())}
                      </div>
                    </div>

                    {/* 3rd Place */}
                    <div className="bg-gradient-to-br from-orange-400 to-orange-600 text-white rounded-lg p-3 text-center shadow">
                      <div className="text-xl">🥉</div>
                      <div className="text-xs uppercase tracking-wider opacity-90 mt-1">
                        {language === 'es' ? '3ro' : '3rd'}
                      </div>
                      <div className="text-sm font-bold mt-1 truncate px-1">
                        {formatName(getThirdPlace())}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Legend */}
        {!hideLegend && (
          <div className="mt-6 flex flex-wrap justify-center gap-4 text-xs">
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
