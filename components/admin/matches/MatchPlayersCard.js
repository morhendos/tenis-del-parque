import React from 'react'

export default function MatchPlayersCard({ match }) {
  const getPlayerAvatar = (playerName) => {
    const initials = playerName.split(' ').map(n => n[0]).join('').toUpperCase()
    return (
      <div className="w-16 h-16 bg-gradient-to-br from-parque-purple to-parque-green rounded-full flex items-center justify-center text-white font-bold text-lg">
        {initials}
      </div>
    )
  }

  const getSetsSummary = () => {
    if (!match.result?.score?.sets) return null
    
    const player1Sets = match.result.score.sets.filter(set => 
      parseInt(set.player1) > parseInt(set.player2)
    ).length || 0
    
    const player2Sets = match.result.score.sets.filter(set => 
      parseInt(set.player2) > parseInt(set.player1)
    ).length || 0
    
    return `${player1Sets} - ${player2Sets}`
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
      <div className="bg-gradient-to-r from-parque-purple to-parque-green p-6 text-white">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          {/* Player 1 */}
          <div className="text-center">
            <div className="flex flex-col items-center">
              {getPlayerAvatar(match.players.player1.name)}
              <h3 className="text-xl font-bold mt-3 mb-1">{match.players.player1.name}</h3>
              <div className="flex items-center space-x-2 text-sm opacity-90">
                <span className="px-2 py-1 bg-white bg-opacity-20 rounded-full">
                  {match.players.player1.level}
                </span>
                <span>ELO: {match.players.player1.stats?.eloRating || 1200}</span>
              </div>
            </div>
          </div>

          {/* VS/Score Section */}
          <div className="text-center">
            {match.status === 'completed' && match.result ? (
              <div className="space-y-3">
                <div className="text-sm opacity-90 font-medium">MATCH COMPLETED</div>
                <div className="text-4xl font-bold opacity-80">
                  {getSetsSummary()}
                </div>
                
                {/* Special cases */}
                {match.result.score?.walkover && (
                  <div className="text-sm bg-yellow-500 bg-opacity-20 rounded-full px-3 py-1">
                    WALKOVER
                  </div>
                )}
                {match.result.score?.retiredPlayer && (
                  <div className="text-sm bg-yellow-500 bg-opacity-20 rounded-full px-3 py-1">
                    RETIREMENT
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <div className="text-4xl font-bold opacity-80">VS</div>
                {match.status === 'scheduled' && match.schedule?.confirmedDate && (
                  <div className="bg-white bg-opacity-10 rounded-lg p-3">
                    <div className="text-sm opacity-75 font-medium mb-1">SCHEDULED FOR</div>
                    <div className="text-lg font-semibold">
                      {new Date(match.schedule.confirmedDate).toLocaleDateString()}
                    </div>
                    <div className="text-sm opacity-90">
                      {new Date(match.schedule.confirmedDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      {match.schedule.court && ` • ${match.schedule.court}`}
                    </div>
                  </div>
                )}
                {match.status === 'scheduled' && !match.schedule?.confirmedDate && (
                  <div className="bg-white bg-opacity-10 rounded-lg p-3">
                    <div className="text-sm opacity-75 font-medium">AWAITING SCHEDULE</div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Player 2 */}
          <div className="text-center">
            <div className="flex flex-col items-center">
              {getPlayerAvatar(match.players.player2.name)}
              <h3 className="text-xl font-bold mt-3 mb-1">{match.players.player2.name}</h3>
              <div className="flex items-center space-x-2 text-sm opacity-90">
                <span className="px-2 py-1 bg-white bg-opacity-20 rounded-full">
                  {match.players.player2.level}
                </span>
                <span>ELO: {match.players.player2.stats?.eloRating || 1200}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Match Result Banner */}
      {match.status === 'completed' && match.result?.winner && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-200 px-6 py-4">
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center space-x-3">
              <span className="text-2xl">🏆</span>
              <span className="text-lg font-bold text-green-800">
                {match.result.winner === match.players.player1._id 
                  ? match.players.player1.name 
                  : match.players.player2.name} WINS!
              </span>
              <span className="text-2xl">🏆</span>
            </div>
            
            {/* Match details */}
            <div className="flex items-center justify-center space-x-4 text-xs text-green-600">
              {match.result.playedAt && (
                <>
                  <span>📅 {new Date(match.result.playedAt).toLocaleDateString()}</span>
                  <span>•</span>
                </>
              )}
              <span>Round {match.round}</span>
              {match.result.score?.walkover && (
                <>
                  <span>•</span>
                  <span className="font-medium">WALKOVER</span>
                </>
              )}
              {match.result.score?.retiredPlayer && (
                <>
                  <span>•</span>
                  <span className="font-medium">RETIREMENT</span>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
