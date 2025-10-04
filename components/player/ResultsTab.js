import React, { useState, useMemo } from 'react'
import MatchResultCard from './MatchResultCard'
import { formatPlayerNameForPublic } from '@/lib/utils/playerNameUtils'

// Helper function to get round display name
const getRoundDisplayName = (round, language) => {
  if (round <= 8) {
    return language === 'es' ? `Ronda ${round}` : `Round ${round}`
  }
  
  // Playoff rounds (beyond regular season)
  const playoffRounds = {
    9: language === 'es' ? 'Cuartos de Final' : 'Quarterfinals',
    10: language === 'es' ? 'Semifinal' : 'Semifinals', 
    11: language === 'es' ? 'Final' : 'Final',
    12: language === 'es' ? '3er Puesto' : '3rd Place'
  }
  
  return playoffRounds[round] || (language === 'es' ? `Ronda ${round}` : `Round ${round}`)
}

export default function ResultsTab({ matches, language, player = null }) {
  const [filters, setFilters] = useState({
    search: '',
    round: 'all'
  })
  const [selectedMatch, setSelectedMatch] = useState(null)
  const [showResultCard, setShowResultCard] = useState(false)

  // Get unique rounds from matches
  const rounds = useMemo(() => {
    const validMatches = matches.filter(match => match.players?.player1 && match.players?.player2)
    const uniqueRounds = [...new Set(validMatches.map(match => match.round))].sort((a, b) => b - a)
    return uniqueRounds
  }, [matches])

  // Filter matches based on search and round
  const filteredMatches = useMemo(() => {
    return matches.filter(match => {
      // Safety check: skip matches with invalid player data
      if (!match.players?.player1 || !match.players?.player2) {
        console.warn('Skipping match with null player reference:', match._id)
        return false
      }
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        const player1Name = match.players.player1?.name?.toLowerCase() || ''
        const player2Name = match.players.player2?.name?.toLowerCase() || ''
        
        if (!player1Name.includes(searchLower) && !player2Name.includes(searchLower)) {
          return false
        }
      }

      // Round filter
      if (filters.round !== 'all' && match.round !== parseInt(filters.round)) {
        return false
      }

      return true
    })
  }, [matches, filters])

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters)
  }

  const handleMatchClick = (match) => {
    setSelectedMatch(match)
    setShowResultCard(true)
  }

  const getMatchScore = (match) => {
    if (!match.result?.score?.sets) return null
    
    const sets = match.result.score.sets
    const p1SetWins = sets.filter(set => set.player1 > set.player2).length
    const p2SetWins = sets.filter(set => set.player2 > set.player1).length
    
    return { p1SetWins, p2SetWins, sets }
  }

  return (
    <div>
      <h2 className="text-xl md:text-2xl font-bold text-parque-purple mb-4 md:mb-6">
        {language === 'es' ? 'Partidos Recientes' : 'Recent Matches'}
      </h2>
      
      {/* Filters Section */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {language === 'es' ? 'Buscar Jugadores' : 'Search Players'}
            </label>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => handleFilterChange({ ...filters, search: e.target.value })}
              placeholder={language === 'es' ? 'Buscar por nombre de jugador...' : 'Search by player name...'}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-parque-purple focus:border-transparent"
            />
          </div>
          
          {/* Round Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {language === 'es' ? 'Ronda' : 'Round'}
            </label>
            <select
              value={filters.round}
              onChange={(e) => handleFilterChange({ ...filters, round: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-parque-purple focus:border-transparent"
            >
              <option value="all">
                {language === 'es' ? 'Todas las Rondas' : 'All Rounds'}
              </option>
              {rounds.map(round => (
                <option key={round} value={round}>
                  {getRoundDisplayName(round, language)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results Section */}
      {filteredMatches && filteredMatches.length > 0 ? (
        <div className="space-y-4">
          <div className="text-sm text-gray-600 mb-2">
            {language === 'es' 
              ? `Mostrando ${filteredMatches.length} de ${matches.length} partidos`
              : `Showing ${filteredMatches.length} of ${matches.length} matches`}
          </div>
          {filteredMatches.map((match) => {
            const scoreData = getMatchScore(match)
            
            const isPlayer1Winner = match.result?.winner?._id === match.players.player1?._id
            const isPlayer2Winner = match.result?.winner?._id === match.players.player2?._id
            
            return (
              <div 
                key={match._id} 
                className="border rounded-lg p-6 hover:shadow-md transition-all cursor-pointer hover:border-parque-purple/30"
                onClick={() => handleMatchClick(match)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    {/* Match Header */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <span className="bg-parque-purple text-white px-3 py-1 rounded-full text-sm font-medium">
                          {match.matchType === 'playoff' && match.playoffInfo?.stage ? (
                            (() => {
                              const stageNames = {
                                quarterfinal: language === 'es' ? 'Cuartos de Final' : 'Quarterfinals',
                                semifinal: language === 'es' ? 'Semifinal' : 'Semifinals', 
                                final: language === 'es' ? 'Final' : 'Final',
                                third_place: language === 'es' ? '3er Puesto' : '3rd Place'
                              }
                              return stageNames[match.playoffInfo.stage] || getRoundDisplayName(match.round, language)
                            })()
                          ) : (
                            getRoundDisplayName(match.round, language)
                          )}
                        </span>
                        {match.schedule?.venue && (
                          <span className="text-gray-500 text-sm">
                            📍 {match.schedule.venue}
                          </span>
                        )}
                        {match.schedule?.court && (
                          <span className="text-gray-500 text-sm">
                            🏟️ {match.schedule.court}
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-500">
                        {match.result?.playedAt 
                          ? new Date(match.result.playedAt).toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US')
                          : ''}
                      </div>
                    </div>
                    
                    {/* Players and Score */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                      {/* Player 1 (Left) */}
                      <div className={`text-center p-3 rounded-lg ${
                        isPlayer1Winner
                          ? 'bg-green-50 border border-green-200' 
                          : 'bg-gray-50'
                      }`}>
                        <div className="font-medium text-gray-900">
                          {formatPlayerNameForPublic(match.players.player1.name)}
                          {isPlayer1Winner && 
                            <span className="ml-2">🏆</span>}
                        </div>
                        {scoreData && (
                          <div className="text-2xl font-bold mt-1">
                            {scoreData.p1SetWins}
                          </div>
                        )}
                      </div>
                      
                      {/* Score Details */}
                      <div className="text-center">
                        {scoreData ? (
                          <div>
                            <div className="text-xs text-gray-500 mb-1">
                              {scoreData.sets.map((set, idx) => (
                                <span key={idx} className="mx-1">
                                  {set.player1}-{set.player2}
                                </span>
                              ))}
                            </div>
                            <div className="text-sm text-gray-600">
                              {language === 'es' ? 'Click para ver detalles' : 'Click to see details'}
                            </div>
                          </div>
                        ) : (
                          <div className="text-gray-500">vs</div>
                        )}
                      </div>
                      
                      {/* Player 2 (Right) */}
                      <div className={`text-center p-3 rounded-lg ${
                        isPlayer2Winner
                          ? 'bg-green-50 border border-green-200' 
                          : 'bg-gray-50'
                      }`}>
                        <div className="font-medium text-gray-900">
                          {formatPlayerNameForPublic(match.players.player2.name)}
                          {isPlayer2Winner && 
                            <span className="ml-2">🏆</span>}
                        </div>
                        {scoreData && (
                          <div className="text-2xl font-bold mt-1">
                            {scoreData.p2SetWins}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : filteredMatches && filteredMatches.length === 0 && matches.length > 0 ? (
        <div className="text-center py-12 text-gray-500">
          <span className="text-4xl mb-4 block">🔍</span>
          <p className="mb-2">
            {language === 'es' 
              ? 'No se encontraron partidos con los filtros seleccionados.'
              : 'No matches found with the selected filters.'}
          </p>
          <button
            onClick={() => setFilters({ search: '', round: 'all' })}
            className="text-parque-purple hover:underline"
          >
            {language === 'es' ? 'Limpiar filtros' : 'Clear filters'}
          </button>
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          <span className="text-4xl mb-4 block">🎾</span>
          <p>
            {language === 'es' 
              ? 'Los partidos se mostrarán una vez que comience la temporada.'
              : 'Matches will be displayed once the season begins.'}
          </p>
        </div>
      )}

      {/* Match Result Card Modal */}
      {showResultCard && selectedMatch && (
        <MatchResultCard
          match={selectedMatch}
          player={player}
          language={language}
          isWinner={player && selectedMatch.result?.winner === player._id}
          onClose={() => {
            setShowResultCard(false)
            setSelectedMatch(null)
          }}
        />
      )}
    </div>
  )
}