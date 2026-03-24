/**
 * Swiss Pairing Algorithm for Tennis League (v2 - Global Optimization)
 * 
 * KEY IMPROVEMENT: Instead of greedily pairing within score groups (which
 * fragments the problem and fails in later rounds), this version treats
 * the entire round as ONE optimization problem using backtracking.
 * 
 * STRATEGY:
 * 
 * EARLY ROUNDS (1-3): Skill-Level Priority
 * 1. Group players by skill level (advanced, intermediate, beginner)
 * 2. Within each skill level, pair by current performance (wins, then ELO)
 * 3. Only cross skill levels when necessary
 * 4. Avoid rematches; give byes only as last resort
 * 
 * LATER ROUNDS (4+): Global Optimal Swiss Pairing
 * 1. Build a weighted graph of all possible pairings
 * 2. Use backtracking to find the globally optimal set of pairings
 * 3. Weights heavily penalize rematches, then score differences, then ELO gaps
 * 4. Rematches ARE allowed as last resort (flagged) rather than giving byes
 *    — because by round 7-8 with limited players, some are mathematically unavoidable
 * 
 * ALGORITHM (for later rounds):
 * 1. Sort players by standing (wins desc, ELO desc)
 * 2. For each player, compute a cost for pairing with every other player:
 *    - REMATCH: +10000 penalty
 *    - Score difference: +100 * |win_diff|
 *    - ELO difference: +|elo_diff| / 10
 *    - Level mismatch: +50
 * 3. Find the set of N/2 pairings that minimizes total cost
 *    using recursive backtracking with pruning
 * 4. For ≤30 players this completes in milliseconds
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

  // Create a map of previous opponents for each player
  const opponentHistory = createOpponentHistory(players, previousMatches)

  // For early rounds (1-3), prioritize skill level matching
  // For later rounds, use global optimal Swiss pairing
  const useSkillPriority = currentRound <= 3
  
  let playersToMatch = [...players]
  
  // Sort players appropriately based on round
  if (useSkillPriority) {
    playersToMatch = sortPlayersBySkillAndPerformance(playersToMatch)
  } else {
    playersToMatch = sortPlayersByPerformance(playersToMatch)
  }

  // Handle bye if odd number of players
  let bye = null
  
  if (playersToMatch.length % 2 === 1) {
    bye = selectByePlayer(playersToMatch, previousMatches)
    playersToMatch = playersToMatch.filter(p => p._id.toString() !== bye._id.toString())
  }

  // Generate pairings based on strategy
  let pairingResult
  if (useSkillPriority) {
    pairingResult = generateSkillBasedPairings(playersToMatch, opponentHistory, currentRound)
  } else {
    pairingResult = generateGlobalOptimalPairings(playersToMatch, opponentHistory, currentRound)
  }

  const { pairings, additionalByes = [] } = pairingResult

  return {
    pairings,
    bye,
    additionalByes,
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
      const p1Id = match.players.player1._id?.toString() || match.players.player1.toString()
      const p2Id = match.players.player2._id?.toString() || match.players.player2.toString()
      
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
      const playerId = match.players.player1._id?.toString() || match.players.player1.toString()
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
 * Calculate the cost of pairing two players (lower = better)
 */
function pairingCost(p1, p2, opponentHistory, currentRound) {
  let cost = 0
  
  // HUGE penalty for rematches — but not infinite, so we allow them as last resort
  if (hasPlayedBefore(p1, p2, opponentHistory)) {
    cost += 10000
  }
  
  // Penalize win difference (Swiss principle: pair players with similar records)
  const winDiff = Math.abs((p1.stats?.matchesWon || 0) - (p2.stats?.matchesWon || 0))
  cost += winDiff * 100
  
  // Penalize ELO difference
  const eloDiff = Math.abs((p1.stats?.eloRating || p1.eloRating || 1200) - (p2.stats?.eloRating || p2.eloRating || 1200))
  cost += eloDiff / 10
  
  // Small penalty for different skill levels
  if (p1.level !== p2.level) {
    cost += currentRound <= 3 ? 200 : 50
  }
  
  return cost
}

// ============================================================
// GLOBAL OPTIMAL PAIRING (for rounds 4+)
// Uses backtracking to find the minimum-cost perfect matching
// ============================================================

/**
 * Generate globally optimal pairings using backtracking search.
 * This considers ALL players simultaneously instead of greedily
 * pairing within score groups.
 */
function generateGlobalOptimalPairings(players, opponentHistory, currentRound) {
  const n = players.length
  console.log(`\n=== GLOBAL OPTIMAL PAIRING (Round ${currentRound}) ===`)
  console.log(`Total players to pair: ${n}`)
  
  // Log opponent history summary
  players.forEach(p => {
    const opponents = opponentHistory.get(p._id.toString())
    const opponentCount = opponents ? opponents.size : 0
    const maxPossibleOpponents = n - 1
    const freshOpponents = maxPossibleOpponents - opponentCount
    console.log(`  ${p.name}: ${opponentCount}/${maxPossibleOpponents} opponents faced, ${freshOpponents} fresh matchups available`)
  })
  
  // Pre-compute cost matrix for all pairs
  const costMatrix = []
  for (let i = 0; i < n; i++) {
    costMatrix[i] = []
    for (let j = 0; j < n; j++) {
      if (i === j) {
        costMatrix[i][j] = Infinity
      } else if (j > i) {
        costMatrix[i][j] = pairingCost(players[i], players[j], opponentHistory, currentRound)
      } else {
        costMatrix[i][j] = costMatrix[j][i] // symmetric
      }
    }
  }
  
  // Find optimal matching using backtracking
  const bestMatching = findOptimalMatching(n, costMatrix)
  
  // Convert matching to pairing objects
  const pairings = []
  const additionalByes = []
  
  for (const [i, j] of bestMatching.pairs) {
    const isRematch = hasPlayedBefore(players[i], players[j], opponentHistory)
    pairings.push({
      player1: players[i],
      player2: players[j],
      round: currentRound,
      isRematch
    })
  }
  
  // Collect unpaired players (shouldn't happen with even count, but just in case)
  const pairedIndices = new Set()
  for (const [i, j] of bestMatching.pairs) {
    pairedIndices.add(i)
    pairedIndices.add(j)
  }
  for (let i = 0; i < n; i++) {
    if (!pairedIndices.has(i)) {
      additionalByes.push(players[i])
    }
  }
  
  // Log results
  const rematchCount = pairings.filter(p => p.isRematch).length
  console.log(`\nOptimal pairings found (total cost: ${bestMatching.cost.toFixed(1)}):`)
  pairings.forEach((pairing, index) => {
    const cost = costMatrix[bestMatching.pairs[index][0]][bestMatching.pairs[index][1]]
    const winDiff = Math.abs((pairing.player1.stats?.matchesWon || 0) - (pairing.player2.stats?.matchesWon || 0))
    console.log(`  Match ${index + 1}: ${pairing.player1.name} (${pairing.player1.stats?.matchesWon || 0}W) vs ${pairing.player2.name} (${pairing.player2.stats?.matchesWon || 0}W) [cost: ${cost.toFixed(1)}${pairing.isRematch ? ', REMATCH' : ''}]`)
  })
  
  if (rematchCount > 0) {
    console.log(`\n⚠ ${rematchCount} rematch(es) were unavoidable given opponent history`)
  } else {
    console.log(`\n✓ All pairings are fresh matchups!`)
  }
  
  if (additionalByes.length > 0) {
    console.log(`  Additional byes: ${additionalByes.map(p => p.name).join(', ')}`)
  }
  
  console.log(`=== END GLOBAL OPTIMAL PAIRING ===\n`)
  
  return { pairings, additionalByes }
}

/**
 * Find the optimal (minimum cost) perfect matching using backtracking.
 * 
 * For N players, we need N/2 pairs. We always pick the first unpaired player
 * and try all possible partners for them. This naturally explores the full
 * search tree while pruning branches that can't beat the current best.
 * 
 * For 20 players: worst case ~654,729,075 leaves (19!!), but pruning 
 * reduces this to milliseconds in practice.
 */
function findOptimalMatching(n, costMatrix) {
  if (n < 2) return { pairs: [], cost: 0 }
  if (n % 2 !== 0) {
    // Shouldn't happen (bye already removed), but handle gracefully
    console.warn('Odd number of players in optimal matching - one will be unpaired')
  }
  
  const targetPairs = Math.floor(n / 2)
  
  let bestPairs = null
  let bestCost = Infinity
  let nodesExplored = 0
  const startTime = Date.now()
  const TIME_LIMIT_MS = 5000 // 5 second safety limit
  
  /**
   * Recursive backtracking: pick the first unmatched player,
   * try all partners, recurse on remaining.
   */
  function backtrack(used, currentPairs, currentCost) {
    nodesExplored++
    
    // Time limit safety
    if (nodesExplored % 10000 === 0 && Date.now() - startTime > TIME_LIMIT_MS) {
      return // bail out, use best found so far
    }
    
    // Pruning: if current cost already exceeds best, stop
    if (currentCost >= bestCost) return
    
    // If we've paired everyone, check if this is the best
    if (currentPairs.length === targetPairs) {
      if (currentCost < bestCost) {
        bestCost = currentCost
        bestPairs = [...currentPairs]
      }
      return
    }
    
    // Find the first unmatched player
    let first = -1
    for (let i = 0; i < n; i++) {
      if (!used[i]) {
        first = i
        break
      }
    }
    
    if (first === -1) return // no more unmatched players
    
    // Collect all possible partners with their costs, sorted by cost (ascending)
    const candidates = []
    for (let j = first + 1; j < n; j++) {
      if (!used[j]) {
        candidates.push({ index: j, cost: costMatrix[first][j] })
      }
    }
    
    // Sort candidates by cost - try cheapest first for better pruning
    candidates.sort((a, b) => a.cost - b.cost)
    
    // Try each candidate partner
    for (const candidate of candidates) {
      const j = candidate.index
      const pairCost = candidate.cost
      
      // Pruning: even the cheapest remaining option exceeds budget
      if (currentCost + pairCost >= bestCost) break // sorted, so all remaining are worse
      
      used[first] = true
      used[j] = true
      currentPairs.push([first, j])
      
      backtrack(used, currentPairs, currentCost + pairCost)
      
      currentPairs.pop()
      used[first] = false
      used[j] = false
    }
    
    // Also try leaving 'first' unpaired if odd count
    // (only relevant if n is odd, which shouldn't happen here)
    if (n % 2 === 1) {
      used[first] = true
      backtrack(used, currentPairs, currentCost)
      used[first] = false
    }
  }
  
  // Initialize
  const used = new Array(n).fill(false)
  
  // First, compute a greedy solution as an upper bound for pruning
  const greedyResult = greedyMatching(n, costMatrix)
  bestPairs = greedyResult.pairs
  bestCost = greedyResult.cost
  console.log(`  Greedy upper bound: cost ${bestCost.toFixed(1)} (${greedyResult.pairs.length} pairs)`)
  
  // Now run backtracking to find optimal
  backtrack(used, [], 0)
  
  const elapsed = Date.now() - startTime
  console.log(`  Optimal search: explored ${nodesExplored} nodes in ${elapsed}ms`)
  console.log(`  Optimal cost: ${bestCost.toFixed(1)} (${bestPairs ? bestPairs.length : 0} pairs)`)
  
  return { pairs: bestPairs || [], cost: bestCost }
}

/**
 * Greedy matching to establish an upper bound for backtracking pruning.
 * Uses the "most constrained first" heuristic.
 */
function greedyMatching(n, costMatrix) {
  const used = new Array(n).fill(false)
  const pairs = []
  let totalCost = 0
  
  // Count available (non-rematch) partners for each player
  // Players with fewer options should be paired first
  const availableCount = new Array(n).fill(0)
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      if (costMatrix[i][j] < 10000) { // not a rematch
        availableCount[i]++
        availableCount[j]++
      }
    }
  }
  
  // Process players with fewest fresh options first
  const playerOrder = Array.from({ length: n }, (_, i) => i)
    .sort((a, b) => availableCount[a] - availableCount[b])
  
  for (const i of playerOrder) {
    if (used[i]) continue
    
    // Find the best available partner
    let bestJ = -1
    let bestJCost = Infinity
    
    for (let j = 0; j < n; j++) {
      if (j === i || used[j]) continue
      if (costMatrix[i][j] < bestJCost) {
        bestJCost = costMatrix[i][j]
        bestJ = j
      }
    }
    
    if (bestJ !== -1) {
      used[i] = true
      used[bestJ] = true
      pairs.push([Math.min(i, bestJ), Math.max(i, bestJ)])
      totalCost += bestJCost
    }
  }
  
  return { pairs, cost: totalCost }
}


// ============================================================
// SKILL-BASED PAIRING (for early rounds 1-3)
// Also improved with global optimization within skill groups
// ============================================================

/**
 * Generate pairings with skill level priority (for early rounds)
 */
function generateSkillBasedPairings(players, opponentHistory, currentRound) {
  console.log(`\n=== SKILL-BASED PAIRING (Round ${currentRound}) ===`)
  console.log(`Total players to pair: ${players.length}`)
  
  const pairings = []
  const paired = new Set()
  
  // Group players by skill level
  const skillGroups = groupPlayersBySkill(players)
  
  console.log('Skill groups:')
  for (const [level, levelPlayers] of skillGroups) {
    console.log(`  ${level}: ${levelPlayers.length} players - ${levelPlayers.map(p => p.name).join(', ')}`)
  }
  
  // For each skill group, use optimal matching
  for (const [level, levelPlayers] of skillGroups) {
    const unpaired = levelPlayers.filter(p => !paired.has(p._id.toString()))
    if (unpaired.length < 2) continue
    
    console.log(`\nOptimal pairing for ${level} level (${unpaired.length} players)...`)
    
    // If odd number in this group, defer one player to cross-level matching
    let deferred = null
    let toMatch = unpaired
    if (unpaired.length % 2 === 1) {
      // Defer the player with the most fresh opponents across levels
      deferred = unpaired[unpaired.length - 1] // lowest ranked in group
      toMatch = unpaired.slice(0, -1)
    }
    
    if (toMatch.length >= 2) {
      // Build cost matrix for this sub-group
      const subN = toMatch.length
      const subCost = []
      for (let i = 0; i < subN; i++) {
        subCost[i] = []
        for (let j = 0; j < subN; j++) {
          if (i === j) subCost[i][j] = Infinity
          else if (j > i) subCost[i][j] = pairingCost(toMatch[i], toMatch[j], opponentHistory, currentRound)
          else subCost[i][j] = subCost[j][i]
        }
      }
      
      const matching = findOptimalMatching(subN, subCost)
      
      for (const [i, j] of matching.pairs) {
        const isRematch = hasPlayedBefore(toMatch[i], toMatch[j], opponentHistory)
        pairings.push({
          player1: toMatch[i],
          player2: toMatch[j],
          round: currentRound,
          isRematch
        })
        paired.add(toMatch[i]._id.toString())
        paired.add(toMatch[j]._id.toString())
      }
    }
  }
  
  // Handle remaining unpaired players (cross-level matching)
  const stillUnpaired = players.filter(p => !paired.has(p._id.toString()))
  
  console.log(`\nAfter within-level pairing: ${pairings.length} matches, ${stillUnpaired.length} unpaired`)
  
  if (stillUnpaired.length >= 2) {
    console.log(`Cross-level matching for ${stillUnpaired.length} remaining players...`)
    
    // Use optimal matching for remaining players
    const subN = stillUnpaired.length
    
    // Handle odd remaining
    let toMatch = stillUnpaired
    const additionalByes = []
    
    if (subN % 2 === 1) {
      // Pick the lowest-ranked remaining for bye
      const byePlayer = toMatch[toMatch.length - 1]
      additionalByes.push(byePlayer)
      toMatch = toMatch.slice(0, -1)
    }
    
    if (toMatch.length >= 2) {
      const subCost = []
      for (let i = 0; i < toMatch.length; i++) {
        subCost[i] = []
        for (let j = 0; j < toMatch.length; j++) {
          if (i === j) subCost[i][j] = Infinity
          else if (j > i) subCost[i][j] = pairingCost(toMatch[i], toMatch[j], opponentHistory, currentRound)
          else subCost[i][j] = subCost[j][i]
        }
      }
      
      const matching = findOptimalMatching(toMatch.length, subCost)
      
      for (const [i, j] of matching.pairs) {
        const isRematch = hasPlayedBefore(toMatch[i], toMatch[j], opponentHistory)
        pairings.push({
          player1: toMatch[i],
          player2: toMatch[j],
          round: currentRound,
          isRematch
        })
      }
    }
    
    console.log(`=== END SKILL-BASED PAIRING ===\n`)
    return { pairings, additionalByes }
  }
  
  console.log(`=== END SKILL-BASED PAIRING ===\n`)
  return { pairings, additionalByes: stillUnpaired.length === 1 ? stillUnpaired : [] }
}


// ============================================================
// HELPER FUNCTIONS
// ============================================================

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

  return new Map([...groups.entries()].sort((a, b) => b[0] - a[0]))
}

/**
 * Group players by skill level
 */
function groupPlayersBySkill(players) {
  const groups = new Map()
  
  players.forEach(player => {
    const level = player.level || 'unknown'
    if (!groups.has(level)) {
      groups.set(level, [])
    }
    groups.get(level).push(player)
  })

  const levelOrder = new Map([
    ['advanced', 0],
    ['intermediate', 1], 
    ['beginner', 2],
    ['unknown', 3]
  ])
  
  return new Map([...groups.entries()].sort((a, b) => {
    const aOrder = levelOrder.get(a[0]) ?? 3
    const bOrder = levelOrder.get(b[0]) ?? 3
    return aOrder - bOrder
  }))
}

/**
 * Sort players by skill level first, then performance within each level
 */
function sortPlayersBySkillAndPerformance(players) {
  const levelOrder = { 'advanced': 0, 'intermediate': 1, 'beginner': 2 }
  
  return [...players].sort((a, b) => {
    const aLevel = levelOrder[a.level] ?? 3
    const bLevel = levelOrder[b.level] ?? 3
    if (aLevel !== bLevel) return aLevel - bLevel
    
    const aWins = a.stats?.matchesWon || 0
    const bWins = b.stats?.matchesWon || 0
    if (aWins !== bWins) return bWins - aWins
    
    const aElo = a.stats?.eloRating || a.eloRating || 1200
    const bElo = b.stats?.eloRating || b.eloRating || 1200
    return bElo - aElo
  })
}

/**
 * Traditional Swiss sorting: wins first, then ELO
 */
function sortPlayersByPerformance(players) {
  return [...players].sort((a, b) => {
    const aWins = a.stats?.matchesWon || 0
    const bWins = b.stats?.matchesWon || 0
    if (aWins !== bWins) return bWins - aWins

    const aElo = a.stats?.eloRating || a.eloRating || 1200
    const bElo = b.stats?.eloRating || b.eloRating || 1200
    return bElo - aElo
  })
}

/**
 * Select the bye player (lowest ranked player who hasn't had a bye)
 */
function selectByePlayer(players, previousMatches) {
  const byeHistory = createByeHistory(players, previousMatches)
  
  for (let i = players.length - 1; i >= 0; i--) {
    const player = players[i]
    if (!byeHistory.has(player._id.toString())) {
      return player
    }
  }
  
  return players[players.length - 1]
}


// ============================================================
// EXPORTED UTILITY FUNCTIONS
// ============================================================

/**
 * Validate if a pairing set is valid
 */
export function validatePairings(pairings, players) {
  const errors = []
  const pairedPlayers = new Set()

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
export function calculatePairingStrength(pairings, previousMatches, currentRound = 1) {
  let score = 0

  pairings.forEach(pairing => {
    if (pairing.isRematch) score += 1000

    const eloDiff = Math.abs(
      (pairing.player1.stats?.eloRating || 1200) - 
      (pairing.player2.stats?.eloRating || 1200)
    )
    score += eloDiff / 10

    if (pairing.player1.level !== pairing.player2.level) {
      const levelPenalty = currentRound <= 3 ? 200 : 50
      score += levelPenalty
    }

    const winDiff = Math.abs(
      (pairing.player1.stats?.matchesWon || 0) - 
      (pairing.player2.stats?.matchesWon || 0)
    )
    score += winDiff * 30
  })

  return score
}

/**
 * Get a summary of the pairings for display
 */
export function getPairingsSummary(result) {
  const { pairings, bye, additionalByes = [], round } = result
  
  const summary = {
    round,
    totalMatches: pairings.length,
    totalPlayers: pairings.length * 2 + (bye ? 1 : 0) + additionalByes.length,
    byePlayer: bye ? bye.name : null,
    additionalByes: additionalByes.map(p => ({
      name: p.name,
      level: p.level || 'unknown',
      reason: 'Avoided rematch'
    })),
    rematches: pairings.filter(p => p.isRematch).length,
    pairings: pairings.map(p => ({
      player1: {
        name: p.player1.name,
        elo: p.player1.stats?.eloRating || p.player1.eloRating || 1200,
        wins: p.player1.stats?.matchesWon || 0,
        level: p.player1.level || 'unknown'
      },
      player2: {
        name: p.player2.name,
        elo: p.player2.stats?.eloRating || p.player2.eloRating || 1200,
        wins: p.player2.stats?.matchesWon || 0,
        level: p.player2.level || 'unknown'
      },
      isRematch: p.isRematch || false
    }))
  }

  return summary
}
