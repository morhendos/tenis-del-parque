/**
 * Swiss Pairing Algorithm for Tennis League
 * 
 * This implementation follows Swiss tournament rules:
 * 1. Players are paired based on their current points/standings
 * 2. Players should not face the same opponent twice
 * 3. Handle odd number of players with byes
 * 4. Try to avoid pairing players from the same level when possible
 */

/**
 * Generate pairings for a Swiss round
 * @param {Array} players - Array of player objects with stats
 * @param {Array} previousMatches - Array of all previous matches
 * @param {Number} currentRound - Current round number
 * @returns {Object} - { pairings: Array, bye: Player|null }
 */
export function generateSwissPairings(players, previousMatches = [], currentRound = 1) {
  if (!players || players.length < 2) {
    throw new Error('Need at least 2 players to generate pairings')
  }

  // Sort players by points (wins), then by ELO rating
  const sortedPlayers = [...players].sort((a, b) => {
    // First sort by match points (wins)
    const aWins = a.stats?.matchesWon || 0
    const bWins = b.stats?.matchesWon || 0
    if (aWins !== bWins) return bWins - aWins

    // Then by ELO rating
    const aElo = a.stats?.eloRating || 1200
    const bElo = b.stats?.eloRating || 1200
    return bElo - aElo
  })

  // Create a map of previous opponents for each player
  const opponentHistory = createOpponentHistory(players, previousMatches)

  // Handle bye if odd number of players
  let bye = null
  let playersToMatch = [...sortedPlayers]
  
  if (playersToMatch.length % 2 === 1) {
    // Find the lowest-ranked player who hasn't had a bye yet
    const byeHistory = createByeHistory(players, previousMatches)
    
    // Start from the bottom and find someone who hasn't had a bye
    for (let i = playersToMatch.length - 1; i >= 0; i--) {
      const player = playersToMatch[i]
      if (!byeHistory.has(player._id.toString())) {
        bye = player
        playersToMatch.splice(i, 1)
        break
      }
    }
    
    // If everyone has had a bye, give it to the lowest-ranked player
    if (!bye && playersToMatch.length > 0) {
      bye = playersToMatch.pop()
    }
  }

  // Generate pairings
  const pairings = []
  const paired = new Set()

  // Try to pair players in score groups
  const scoreGroups = groupPlayersByScore(playersToMatch)

  for (const [score, groupPlayers] of scoreGroups) {
    const unpaired = groupPlayers.filter(p => !paired.has(p._id.toString()))
    
    // Try to pair within the same score group
    for (let i = 0; i < unpaired.length - 1; i++) {
      if (paired.has(unpaired[i]._id.toString())) continue

      for (let j = i + 1; j < unpaired.length; j++) {
        if (paired.has(unpaired[j]._id.toString())) continue

        const player1 = unpaired[i]
        const player2 = unpaired[j]

        // Check if they've played before
        if (!hasPlayedBefore(player1, player2, opponentHistory)) {
          pairings.push({
            player1,
            player2,
            round: currentRound
          })
          paired.add(player1._id.toString())
          paired.add(player2._id.toString())
          break
        }
      }
    }
  }

  // Handle remaining unpaired players (cross-score-group pairing)
  const stillUnpaired = playersToMatch.filter(p => !paired.has(p._id.toString()))
  
  for (let i = 0; i < stillUnpaired.length - 1; i += 2) {
    const player1 = stillUnpaired[i]
    const player2 = stillUnpaired[i + 1]
    
    // At this point, we might have to allow rematches if no other option
    pairings.push({
      player1,
      player2,
      round: currentRound,
      isRematch: hasPlayedBefore(player1, player2, opponentHistory)
    })
  }

  return {
    pairings,
    bye,
    totalPlayers: players.length,
    round: currentRound
  }
}

/**
 * Create a map of opponents each player has faced
 */
function createOpponentHistory(players, matches) {
  const history = new Map()
  
  // Initialize history for all players
  players.forEach(player => {
    history.set(player._id.toString(), new Set())
  })

  // Add opponent history from matches
  matches.forEach(match => {
    if (match.players?.player1 && match.players?.player2) {
      const p1Id = match.players.player1._id?.toString() || match.players.player1
      const p2Id = match.players.player2._id?.toString() || match.players.player2
      
      if (history.has(p1Id)) {
        history.get(p1Id).add(p2Id)
      }
      if (history.has(p2Id)) {
        history.get(p2Id).add(p1Id)
      }
    }
  })

  return history
}

/**
 * Create a set of players who have had byes
 */
function createByeHistory(players, matches) {
  const byeHistory = new Set()
  
  matches.forEach(match => {
    if (match.isBye && match.players?.player1) {
      const playerId = match.players.player1._id?.toString() || match.players.player1
      byeHistory.add(playerId)
    }
  })

  return byeHistory
}

/**
 * Check if two players have played before
 */
function hasPlayedBefore(player1, player2, opponentHistory) {
  const p1Id = player1._id.toString()
  const p2Id = player2._id.toString()
  
  return opponentHistory.get(p1Id)?.has(p2Id) || false
}

/**
 * Group players by their current score (wins)
 */
function groupPlayersByScore(players) {
  const groups = new Map()
  
  players.forEach(player => {
    const wins = player.stats?.matchesWon || 0
    if (!groups.has(wins)) {
      groups.set(wins, [])
    }
    groups.get(wins).push(player)
  })

  // Sort groups by score (descending)
  return new Map([...groups.entries()].sort((a, b) => b[0] - a[0]))
}

/**
 * Validate if a pairing set is valid
 */
export function validatePairings(pairings, players) {
  const errors = []
  const pairedPlayers = new Set()

  // Check for duplicate players in pairings
  pairings.forEach((pairing, index) => {
    const p1Id = pairing.player1._id.toString()
    const p2Id = pairing.player2._id.toString()

    if (pairedPlayers.has(p1Id)) {
      errors.push(`Player ${pairing.player1.name} appears in multiple pairings`)
    }
    if (pairedPlayers.has(p2Id)) {
      errors.push(`Player ${pairing.player2.name} appears in multiple pairings`)
    }

    pairedPlayers.add(p1Id)
    pairedPlayers.add(p2Id)

    // Check for self-pairing
    if (p1Id === p2Id) {
      errors.push(`Pairing ${index + 1}: Player cannot play against themselves`)
    }
  })

  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Calculate the strength of a pairing (for optimization)
 * Lower score is better
 */
export function calculatePairingStrength(pairings, previousMatches) {
  let score = 0

  pairings.forEach(pairing => {
    // Penalize rematches heavily
    if (pairing.isRematch) {
      score += 1000
    }

    // Penalize large ELO differences
    const eloDiff = Math.abs(
      (pairing.player1.stats?.eloRating || 1200) - 
      (pairing.player2.stats?.eloRating || 1200)
    )
    score += eloDiff / 10

    // Penalize different levels slightly
    if (pairing.player1.level !== pairing.player2.level) {
      score += 50
    }
  })

  return score
}

/**
 * Get a summary of the pairings for display
 */
export function getPairingsSummary(result) {
  const { pairings, bye, round } = result
  
  const summary = {
    round,
    totalMatches: pairings.length,
    totalPlayers: pairings.length * 2 + (bye ? 1 : 0),
    byePlayer: bye ? bye.name : null,
    rematches: pairings.filter(p => p.isRematch).length,
    pairings: pairings.map(p => ({
      player1: {
        name: p.player1.name,
        elo: p.player1.stats?.eloRating || 1200,
        wins: p.player1.stats?.matchesWon || 0
      },
      player2: {
        name: p.player2.name,
        elo: p.player2.stats?.eloRating || 1200,
        wins: p.player2.stats?.matchesWon || 0
      },
      isRematch: p.isRematch || false
    }))
  }

  return summary
}
