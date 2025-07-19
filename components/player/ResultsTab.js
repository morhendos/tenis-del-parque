import React, { useState, useMemo } from 'react'

export default function ResultsTab({ matches, language }) {
  const [filters, setFilters] = useState({
    search: '',
    round: 'all'
  })

  // Get unique rounds from matches
  const rounds = useMemo(() => {
    const uniqueRounds = [...new Set(matches.map(match => match.round))].sort((a, b) => b - a)
    return uniqueRounds
  }, [matches])

  // Filter matches based on search and round
  const filteredMatches = useMemo(() => {
    return matches.filter(match => {
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
                  {language === 'es' ? `Ronda ${round}` : `Round ${round}`}
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
          {filteredMatches.map((match) => (
            <div key={match._id} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  {/* Match Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <span className="bg-parque-purple text-white px-3 py-1 rounded-full text-sm font-medium">
                        {language === 'es' ? 'Ronda' : 'Round'} {match.round}
                      </span>
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
                    {/* Player 1 */}
                    <div className={`text-center p-3 rounded-lg ${
                      match.result?.winner?._id === match.players.player1._id 
                        ? 'bg-green-50 border border-green-200' 
                        : 'bg-gray-50'
                    }`}>
                      <div className="font-medium text-gray-900">
                        {match.players.player1.name}
                        {match.result?.winner?._id === match.players.player1._id && 
                          <span className="ml-2">🏆</span>}
                      </div>
                    </div>
                    
                    {/* Score */}
                    <div className="text-center">
                      {match.result?.score ? (
                        <div className="text-xl font-bold text-gray-900">
                          {match.result.score}
                        </div>
                      ) : (
                        <div className="text-gray-500">vs</div>
                      )}
                    </div>
                    
                    {/* Player 2 */}
                    <div className={`text-center p-3 rounded-lg ${
                      match.result?.winner?._id === match.players.player2._id 
                        ? 'bg-green-50 border border-green-200' 
                        : 'bg-gray-50'
                    }`}>
                      <div className="font-medium text-gray-900">
                        {match.players.player2.name}
                        {match.result?.winner?._id === match.players.player2._id && 
                          <span className="ml-2">🏆</span>}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
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
    </div>
  )
} 