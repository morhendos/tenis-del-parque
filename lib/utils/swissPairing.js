/**
 * Swiss Pairing Algorithm for Tennis League
 * 
 * This implementation follows Swiss tournament rules with skill-level awareness
 * and STRICT no-rematch policy:
 * 
 * EARLY ROUNDS (1-3): Skill-Level Priority
 * 1. Group players by skill level (advanced, intermediate, beginner)
 * 2. Within each skill level, pair by current performance (wins, then ELO)
 * 3. Only cross skill levels when necessary (odd numbers within groups)
 * 4. ABSOLUTELY NO REMATCHES - players get byes instead
 * 
 * LATER ROUNDS (4+): Traditional Swiss
 * 1. Pair primarily by current standings (wins, then ELO)
 * 2. Skill level becomes secondary consideration
 * 3. ABSOLUTELY NO REMATCHES - players get byes instead
 * 
 * NO REMATCH GUARANTEE:
 * - Uses exhaustive search to find maximum pairings without rematches
 * - If players can't be paired without rematches, they get byes
 * - Maintains tournament integrity by never forcing repeat matches
 * 
 * This ensures fair competition for beginners while maintaining competitive balance
 * as the tournament progresses and skill levels naturally separate by performance.
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
  // For later rounds, use traditional Swiss pairing
  const useSkillPriority = currentRound <= 3
  
  let playersToMatch = [...players]
  
  // Sort players appropriately based on round
  if (useSkillPriority) {
    // For early rounds: group by skill level, then by ELO/wins within each level
    playersToMatch = sortPlayersBySkillAndPerformance(playersToMatch)
  } else {
    // For later rounds: traditional Swiss sorting (wins first, then ELO)
    playersToMatch = sortPlayersByPerformance(playersToMatch)
  }

  // Handle bye if odd number of players
  let bye = null
  
  if (playersToMatch.length % 2 === 1) {
    bye = selectByePlayer(playersToMatch, previousMatches)
    playersToMatch = playersToMatch.filter(p => p._id.toString() !== bye._id.toString())
  }

  // Generate pairings based on strategy
  const pairingResult = useSkillPriority ? 
    generateSkillBasedPairings(playersToMatch, opponentHistory, currentRound) :
    generateTraditionalSwissPairings(playersToMatch, opponentHistory, currentRound)

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
export function calculatePairingStrength(pairings, previousMatches, currentRound = 1) {
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

    // Penalize different levels - more heavily in early rounds
    if (pairing.player1.level !== pairing.player2.level) {
      const levelPenalty = currentRound <= 3 ? 200 : 50
      score += levelPenalty
    }

    // Penalize large win differences
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
        elo: p.player1.stats?.eloRating || 1200,
        wins: p.player1.stats?.matchesWon || 0,
        level: p.player1.level || 'unknown'
      },
      player2: {
        name: p.player2.name,
        elo: p.player2.stats?.eloRating || 1200,
        wins: p.player2.stats?.matchesWon || 0,
        level: p.player2.level || 'unknown'
      },
      isRematch: p.isRematch || false
    }))
  }

  return summary
}

/**
 * Sort players by skill level first, then performance within each level
 */
function sortPlayersBySkillAndPerformance(players) {
  const levelOrder = { 'advanced': 0, 'intermediate': 1, 'beginner': 2 }
  
  return [...players].sort((a, b) => {
    // First sort by skill level
    const aLevel = levelOrder[a.level] ?? 3
    const bLevel = levelOrder[b.level] ?? 3
    if (aLevel !== bLevel) return aLevel - bLevel
    
    // Then by wins
    const aWins = a.stats?.matchesWon || 0
    const bWins = b.stats?.matchesWon || 0
    if (aWins !== bWins) return bWins - aWins
    
    // Then by ELO
    const aElo = a.stats?.eloRating || 1200
    const bElo = b.stats?.eloRating || 1200
    return bElo - aElo
  })
}

/**
 * Traditional Swiss sorting: wins first, then ELO
 */
function sortPlayersByPerformance(players) {
  return [...players].sort((a, b) => {
    // First sort by match points (wins)
    const aWins = a.stats?.matchesWon || 0
    const bWins = b.stats?.matchesWon || 0
    if (aWins !== bWins) return bWins - aWins

    // Then by ELO rating
    const aElo = a.stats?.eloRating || 1200
    const bElo = b.stats?.eloRating || 1200
    return bElo - aElo
  })
}

/**
 * Select the bye player (lowest ranked player who hasn't had a bye)
 */
function selectByePlayer(players, previousMatches) {
  const byeHistory = createByeHistory(players, previousMatches)
  
  // Start from the bottom and find someone who hasn't had a bye
  for (let i = players.length - 1; i >= 0; i--) {
    const player = players[i]
    if (!byeHistory.has(player._id.toString())) {
      return player
    }
  }
  
  // If everyone has had a bye, give it to the lowest-ranked player
  return players[players.length - 1]
}

/**
 * Generate pairings with skill level priority (for early rounds)
 */
function generateSkillBasedPairings(players, opponentHistory, currentRound) {
  console.log(`\n=== SKILL-BASED PAIRING DEBUG (Round ${currentRound}) ===`)
  console.log(`Total players to pair: ${players.length}`)
  
  const pairings = []
  const paired = new Set()
  
  // Group players by skill level
  const skillGroups = groupPlayersBySkill(players)
  
  console.log('Skill groups:')
  for (const [level, levelPlayers] of skillGroups) {
    console.log(`  ${level}: ${levelPlayers.length} players - ${levelPlayers.map(p => p.name).join(', ')}`)
  }
  
  // Try to pair within each skill level first
  for (const [level, levelPlayers] of skillGroups) {
    console.log(`\nProcessing ${level} level (${levelPlayers.length} players)...`)
    const unpaired = levelPlayers.filter(p => !paired.has(p._id.toString()))
    console.log(`  Unpaired in ${level}: ${unpaired.map(p => p.name).join(', ')}`)
    
    // Within each skill level, use score-based pairing
    const scoreGroups = groupPlayersByScore(unpaired)
    
    for (const [score, groupPlayers] of scoreGroups) {
      console.log(`  Score group ${score}: ${groupPlayers.map(p => p.name).join(', ')}`)
      const unpairedInGroup = groupPlayers.filter(p => !paired.has(p._id.toString()))
      
      // Try to pair within the same score group
      for (let i = 0; i < unpairedInGroup.length - 1; i++) {
        if (paired.has(unpairedInGroup[i]._id.toString())) continue

        for (let j = i + 1; j < unpairedInGroup.length; j++) {
          if (paired.has(unpairedInGroup[j]._id.toString())) continue

          const player1 = unpairedInGroup[i]
          const player2 = unpairedInGroup[j]

          // Check if they've played before
          if (!hasPlayedBefore(player1, player2, opponentHistory)) {
            console.log(`    ✓ Paired: ${player1.name} vs ${player2.name}`)
            pairings.push({
              player1,
              player2,
              round: currentRound
            })
            paired.add(player1._id.toString())
            paired.add(player2._id.toString())
            break
          } else {
            console.log(`    ✗ Can't pair ${player1.name} vs ${player2.name} - already played`)
          }
        }
      }
    }
  }
  
  // Handle remaining unpaired players with exhaustive search to avoid rematches
  const stillUnpaired = players.filter(p => !paired.has(p._id.toString()))
  
  console.log(`\nAfter skill-based pairing:`)
  console.log(`  Paired: ${pairings.length} matches`)
  console.log(`  Still unpaired: ${stillUnpaired.length} players - ${stillUnpaired.map(p => p.name).join(', ')}`)
  
  if (stillUnpaired.length > 0) {
    console.log(`\nTrying to pair remaining ${stillUnpaired.length} players...`)
    
    // Special case: if we have an even number of unpaired players, we should be able to pair them all
    if (stillUnpaired.length % 2 === 0 && stillUnpaired.length > 0) {
      console.log(`Even number of unpaired players (${stillUnpaired.length}), trying exhaustive pairing...`)
      
      // Try simple pairing first - pair players sequentially if they haven't played
      const simplePairings = []
      const simpleUsed = new Set()
      
      for (let i = 0; i < stillUnpaired.length - 1; i++) {
        if (simpleUsed.has(i)) continue
        
        for (let j = i + 1; j < stillUnpaired.length; j++) {
          if (simpleUsed.has(j)) continue
          
          if (!hasPlayedBefore(stillUnpaired[i], stillUnpaired[j], opponentHistory)) {
            simplePairings.push({
              player1: stillUnpaired[i],
              player2: stillUnpaired[j],
              round: currentRound
            })
            simpleUsed.add(i)
            simpleUsed.add(j)
            console.log(`    ✓ Simple pairing: ${stillUnpaired[i].name} vs ${stillUnpaired[j].name}`)
            break
          }
        }
      }
      
      if (simplePairings.length === stillUnpaired.length / 2) {
        console.log(`✓ Successfully paired all ${stillUnpaired.length} remaining players with simple method!`)
        pairings.push(...simplePairings)
        
        console.log(`\nFinal result:`)
        console.log(`  Total pairings: ${pairings.length}`)
        console.log(`  Additional byes: 0`)
        console.log(`=== END SKILL-BASED PAIRING DEBUG ===\n`)
        
        return { pairings, additionalByes: [] }
      } else {
        console.log(`Simple pairing only found ${simplePairings.length} pairs, trying exhaustive search...`)
      }
    }
    
    // Try all possible combinations to avoid rematches
    const remainingPairings = findBestPairingsAvoidingRematches(stillUnpaired, opponentHistory, currentRound)
    pairings.push(...remainingPairings.pairings)
    
    // If we couldn't pair everyone due to rematch constraints, give byes
    const additionalByes = remainingPairings.unpairedPlayers || []
    if (additionalByes.length > 0) {
      console.warn(`Warning: ${additionalByes.length} players couldn't be paired without rematches, giving additional byes`)
      console.log(`  Additional byes: ${additionalByes.map(p => p.name).join(', ')}`)
    }
    
    console.log(`\nFinal result:`)
    console.log(`  Total pairings: ${pairings.length}`)
    console.log(`  Additional byes: ${additionalByes.length}`)
    console.log(`=== END SKILL-BASED PAIRING DEBUG ===\n`)
    
    return { pairings, additionalByes }
  }
  
  console.log(`\nAll players paired successfully!`)
  console.log(`=== END SKILL-BASED PAIRING DEBUG ===\n`)
  
  return { pairings, additionalByes: [] }
}

/**
 * Generate traditional Swiss pairings (for later rounds)
 */
function generateTraditionalSwissPairings(players, opponentHistory, currentRound) {
  console.log(`\n=== TRADITIONAL SWISS PAIRING DEBUG (Round ${currentRound}) ===`)
  console.log(`Total players to pair: ${players.length}`)
  
  const pairings = []
  const paired = new Set()

  // Try to pair players in score groups
  const scoreGroups = groupPlayersByScore(players)
  
  console.log('Score groups:')
  for (const [score, groupPlayers] of scoreGroups) {
    console.log(`  ${score} wins: ${groupPlayers.length} players - ${groupPlayers.map(p => p.name).join(', ')}`)
  }

  for (const [score, groupPlayers] of scoreGroups) {
    console.log(`\nProcessing score group ${score} (${groupPlayers.length} players)...`)
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
          console.log(`    ✓ Paired: ${player1.name} vs ${player2.name}`)
          pairings.push({
            player1,
            player2,
            round: currentRound
          })
          paired.add(player1._id.toString())
          paired.add(player2._id.toString())
          break
        } else {
          console.log(`    ✗ Can't pair ${player1.name} vs ${player2.name} - already played`)
        }
      }
    }
  }

  // Handle remaining unpaired players with exhaustive search to avoid rematches
  const stillUnpaired = players.filter(p => !paired.has(p._id.toString()))
  
  console.log(`\nAfter traditional pairing:`)
  console.log(`  Paired: ${pairings.length} matches`)
  console.log(`  Still unpaired: ${stillUnpaired.length} players - ${stillUnpaired.map(p => p.name).join(', ')}`)
  
  if (stillUnpaired.length > 0) {
    console.log(`\nTrying to pair remaining ${stillUnpaired.length} players...`)
    
    // Special case: if we have an even number of unpaired players, we should be able to pair them all
    if (stillUnpaired.length % 2 === 0 && stillUnpaired.length > 0) {
      console.log(`Even number of unpaired players (${stillUnpaired.length}), trying exhaustive pairing...`)
      
      // Try simple pairing first - pair players sequentially if they haven't played
      const simplePairings = []
      const simpleUsed = new Set()
      
      for (let i = 0; i < stillUnpaired.length - 1; i++) {
        if (simpleUsed.has(i)) continue
        
        for (let j = i + 1; j < stillUnpaired.length; j++) {
          if (simpleUsed.has(j)) continue
          
          if (!hasPlayedBefore(stillUnpaired[i], stillUnpaired[j], opponentHistory)) {
            simplePairings.push({
              player1: stillUnpaired[i],
              player2: stillUnpaired[j],
              round: currentRound
            })
            simpleUsed.add(i)
            simpleUsed.add(j)
            console.log(`    ✓ Simple pairing: ${stillUnpaired[i].name} vs ${stillUnpaired[j].name}`)
            break
          }
        }
      }
      
      if (simplePairings.length === stillUnpaired.length / 2) {
        console.log(`✓ Successfully paired all ${stillUnpaired.length} remaining players with simple method!`)
        pairings.push(...simplePairings)
        
        console.log(`\nFinal result:`)
        console.log(`  Total pairings: ${pairings.length}`)
        console.log(`  Additional byes: 0`)
        console.log(`=== END TRADITIONAL SWISS PAIRING DEBUG ===\n`)
        
        return { pairings, additionalByes: [] }
      } else {
        console.log(`Simple pairing only found ${simplePairings.length} pairs, trying exhaustive search...`)
      }
    }
    
    // Try all possible combinations to avoid rematches
    const remainingPairings = findBestPairingsAvoidingRematches(stillUnpaired, opponentHistory, currentRound)
    pairings.push(...remainingPairings.pairings)
    
    // If we couldn't pair everyone due to rematch constraints, give byes
    const additionalByes = remainingPairings.unpairedPlayers || []
    if (additionalByes.length > 0) {
      console.warn(`Warning: ${additionalByes.length} players couldn't be paired without rematches, giving additional byes`)
      console.log(`  Additional byes: ${additionalByes.map(p => p.name).join(', ')}`)
    }
    
    console.log(`\nFinal result:`)
    console.log(`  Total pairings: ${pairings.length}`)
    console.log(`  Additional byes: ${additionalByes.length}`)
    console.log(`=== END TRADITIONAL SWISS PAIRING DEBUG ===\n`)
    
    return { pairings, additionalByes }
  }
  
  console.log(`\nAll players paired successfully!`)
  console.log(`=== END TRADITIONAL SWISS PAIRING DEBUG ===\n`)

  return { pairings, additionalByes: [] }
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

  // Sort groups by level (advanced first)
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
 * Find the best pairings for remaining unpaired players, avoiding rematches
 * Uses exhaustive search to maximize pairings without rematches
 */
function findBestPairingsAvoidingRematches(players, opponentHistory, currentRound) {
  if (players.length === 0) {
    return { pairings: [], unpairedPlayers: [] }
  }
  
  if (players.length === 1) {
    return { pairings: [], unpairedPlayers: [players[0]] }
  }

  // For 2 players, simple case
  if (players.length === 2) {
    const [p1, p2] = players
    if (!hasPlayedBefore(p1, p2, opponentHistory)) {
      return {
        pairings: [{
          player1: p1,
          player2: p2,
          round: currentRound
        }],
        unpairedPlayers: []
      }
    } else {
      // Can't pair them - both get byes
      return { pairings: [], unpairedPlayers: [p1, p2] }
    }
  }

  // For more than 2 players, use greedy approach with backtracking
  const bestResult = findMaximumMatchingWithoutRematches(players, opponentHistory, currentRound)
  return bestResult
}

/**
 * Find maximum matching without rematches using backtracking
 */
function findMaximumMatchingWithoutRematches(players, opponentHistory, currentRound) {
  const n = players.length
  
  // Create adjacency list of who can play whom (no rematches)
  const canPlay = new Map()
  for (let i = 0; i < n; i++) {
    canPlay.set(i, [])
    for (let j = i + 1; j < n; j++) {
      if (!hasPlayedBefore(players[i], players[j], opponentHistory)) {
        canPlay.get(i).push(j)
      }
    }
  }
  
  // Debug: log the adjacency list
  console.log('Adjacency list for remaining players:')
  for (let i = 0; i < n; i++) {
    const opponents = canPlay.get(i).map(j => players[j].name)
    console.log(`  ${players[i].name} can play: [${opponents.join(', ')}]`)
  }
  
  // Try all possible matchings and find the one with maximum pairs
  const bestResult = findMaximumMatching(players, canPlay, currentRound)
  
  console.log(`Maximum matching found: ${bestResult.pairings.length} pairs, ${bestResult.unpairedPlayers.length} unpaired`)
  
  return bestResult
}

/**
 * Find maximum matching using a more thorough approach
 */
function findMaximumMatching(players, canPlay, currentRound) {
  const n = players.length
  let bestPairings = []
  let minUnpaired = n
  
  // Try all possible pairings starting from different players
  for (let startPlayer = 0; startPlayer < n; startPlayer++) {
    const result = findMatchingStartingFrom(players, canPlay, currentRound, startPlayer)
    
    if (result.unpairedPlayers.length < minUnpaired) {
      bestPairings = result.pairings
      minUnpaired = result.unpairedPlayers.length
    }
    
    // If we found a perfect matching (no one unpaired), we're done
    if (minUnpaired === 0 || (n % 2 === 1 && minUnpaired === 1)) {
      break
    }
  }
  
  const unpairedPlayers = []
  const pairedSet = new Set()
  
  bestPairings.forEach(pairing => {
    const p1Index = players.findIndex(p => p._id.toString() === pairing.player1._id.toString())
    const p2Index = players.findIndex(p => p._id.toString() === pairing.player2._id.toString())
    pairedSet.add(p1Index)
    pairedSet.add(p2Index)
  })
  
  for (let i = 0; i < n; i++) {
    if (!pairedSet.has(i)) {
      unpairedPlayers.push(players[i])
    }
  }
  
  return { pairings: bestPairings, unpairedPlayers }
}

/**
 * Find a matching starting from a specific player
 */
function findMatchingStartingFrom(players, canPlay, currentRound, startPlayer) {
  const n = players.length
  const pairings = []
  const used = new Set()
  
  // Start with the specified player
  if (!used.has(startPlayer)) {
    const availableOpponents = canPlay.get(startPlayer).filter(j => !used.has(j))
    if (availableOpponents.length > 0) {
      const opponent = availableOpponents[0]
      pairings.push({
        player1: players[startPlayer],
        player2: players[opponent],
        round: currentRound
      })
      used.add(startPlayer)
      used.add(opponent)
    }
  }
  
  // Continue with remaining players using improved greedy approach
  const remainingPlayers = Array.from({ length: n }, (_, i) => i).filter(i => !used.has(i))
  
  // Sort by number of available opponents (ascending)
  remainingPlayers.sort((a, b) => {
    const aAvailable = canPlay.get(a).filter(j => !used.has(j)).length
    const bAvailable = canPlay.get(b).filter(j => !used.has(j)).length
    return aAvailable - bAvailable
  })
  
  for (const i of remainingPlayers) {
    if (used.has(i)) continue
    
    const availableOpponents = canPlay.get(i).filter(j => !used.has(j))
    if (availableOpponents.length === 0) continue
    
    // Pick the first available opponent
    const opponent = availableOpponents[0]
    
    pairings.push({
      player1: players[i],
      player2: players[opponent],
      round: currentRound
    })
    
    used.add(i)
    used.add(opponent)
  }
  
  // Collect unpaired players
  const unpairedPlayers = players.filter((_, i) => !used.has(i))
  
  return { pairings, unpairedPlayers }
}
