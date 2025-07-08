import React from 'react'

export default function ResultsTab({ matches, language }) {
  return (
    <div>
      <h2 className="text-xl md:text-2xl font-bold text-parque-purple mb-4 md:mb-6">
        {language === 'es' ? 'Partidos Recientes' : 'Recent Matches'}
      </h2>
      
      {matches && matches.length > 0 ? (
        <div className="space-y-4">
          {matches.map((match) => (
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