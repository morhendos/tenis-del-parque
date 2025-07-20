/**
 * Utility functions for processing match results
 */

/**
 * Process match result submission and prepare data for MatchResultCard
 * @param {Object} match - The original match object
 * @param {Object} player - The current player object
 * @param {Object} data - The form data from result submission
 * @returns {Object} - Processed match data with winner info
 */
export function processMatchResult(match, player, data) {
  // Determine if current player is player1 or player2
  const isPlayer1 = match.players.player1._id === player._id
  
  // Transform the sets data from myScore/opponentScore to player1/player2
  const transformedSets = data.sets.map(set => ({
    player1: isPlayer1 ? set.myScore : set.opponentScore,
    player2: isPlayer1 ? set.opponentScore : set.myScore
  }))
  
  // Calculate who won based on sets
  let mySetWins = 0
  let oppSetWins = 0
  transformedSets.forEach(set => {
    if (isPlayer1) {
      if (set.player1 > set.player2) mySetWins++
      else oppSetWins++
    } else {
      if (set.player2 > set.player1) mySetWins++
      else oppSetWins++
    }
  })
  
  // Determine the winner (full player object, not just ID)
  const winnerPlayer = mySetWins > oppSetWins ? player : 
                       (isPlayer1 ? match.players.player2 : match.players.player1)
  
  // Create updated match with properly formatted data
  const updatedMatch = {
    ...match,
    status: 'completed',
    result: {
      ...match.result,
      winner: {
        _id: winnerPlayer._id,
        name: winnerPlayer.name
      },
      score: {
        sets: transformedSets,
        walkover: data.walkover
      },
      playedAt: new Date().toISOString()
    }
  }
  
  // Return all the processed data
  return {
    updatedMatch,
    winnerPlayer,
    isPlayerWinner: winnerPlayer._id === player._id,
    mySetWins,
    oppSetWins
  }
} 