/**
 * SINGLE SOURCE OF TRUTH FOR STANDINGS CALCULATION
 * 
 * This service is used EVERYWHERE we need to calculate league standings:
 * - Public league standings API
 * - Admin playoff preview
 * - Playoff initialization
 * - Player dashboard
 * - ANY OTHER PLACE that needs standings
 * 
 * DO NOT DUPLICATE THIS LOGIC ANYWHERE ELSE!
 */

import mongoose from 'mongoose'

/**
 * Calculate comprehensive player statistics from matches
 * @param {string} playerId - Player ID to calculate stats for
 * @param {Array} matches - Array of match documents
 * @returns {Object} Player statistics
 */
export function calculatePlayerStats(playerId, matches) {
  const playerIdStr = playerId.toString()
  
  const playerMatches = matches.filter(match => {
    const p1 = match.players?.player1?.toString() || match.players?.player1?._id?.toString()
    const p2 = match.players?.player2?.toString() || match.players?.player2?._id?.toString()
    return p1 === playerIdStr || p2 === playerIdStr
  })
  
  // Separate BYE matches from regular matches
  const regularMatches = playerMatches.filter(match => !match.isBye)
  const byeMatches = playerMatches.filter(match => match.isBye)
  
  const stats = {
    matchesPlayed: regularMatches.length, // BYE matches DON'T count toward matches played (for OpenRank)
    matchesWon: byeMatches.length, // Start with BYE wins
    matchesLost: 0,
    totalPoints: byeMatches.length * 3, // 3 points per BYE (equivalent to 2-0 win)
    setsWon: byeMatches.length * 2, // Virtual 2-0 score for BYEs
    setsLost: 0,
    gamesWon: 0,
    gamesLost: 0,
    byeCount: byeMatches.length // Track BYEs separately
  }
  
  regularMatches.forEach(match => {
    if (!match.result || !match.result.winner || match.status !== 'completed') {
      return // Skip incomplete matches
    }
    
    const winnerId = match.result.winner?.toString() || match.result.winner?._id?.toString()
    const p1Id = match.players?.player1?.toString() || match.players?.player1?._id?.toString()
    const p2Id = match.players?.player2?.toString() || match.players?.player2?._id?.toString()
    
    const isPlayer1 = p1Id === playerIdStr
    const isWinner = winnerId === playerIdStr
    
    // Count wins/losses
    if (isWinner) {
      stats.matchesWon++
    } else {
      stats.matchesLost++
    }
    
    // Special handling for walkovers
    if (match.result.score?.walkover) {
      stats.totalPoints += isWinner ? 2 : 0
      stats.setsWon += isWinner ? 2 : 0
      stats.setsLost += isWinner ? 0 : 2
      stats.gamesWon += isWinner ? 12 : 0  // 6-0, 6-0
      stats.gamesLost += isWinner ? 0 : 12
      return
    }
    
    // Calculate sets and games from actual match data
    let player1Sets = 0
    let player2Sets = 0
    let player1Games = 0
    let player2Games = 0
    
    if (match.result.score?.sets && match.result.score.sets.length > 0) {
      match.result.score.sets.forEach((set, index) => {
        const p1Games = set.player1 || 0
        const p2Games = set.player2 || 0
        
        // Check if this is a super tiebreak (third set with scores >= 10)
        const isThirdSet = index === 2
        const isSuperTiebreak = isThirdSet && (p1Games >= 10 || p2Games >= 10)
        
        if (isSuperTiebreak) {
          // Super tiebreak counts as 1 game for the winner
          if (p1Games > p2Games) {
            player1Games += 1
            player2Games += 0
          } else {
            player1Games += 0
            player2Games += 1
          }
        } else {
          // Regular set - count actual games
          player1Games += p1Games
          player2Games += p2Games
        }
        
        if (p1Games > p2Games) {
          player1Sets++
        } else if (p2Games > p1Games) {
          player2Sets++
        }
      })
    }
    
    const setsWon = isPlayer1 ? player1Sets : player2Sets
    const setsLost = isPlayer1 ? player2Sets : player1Sets
    const gamesWon = isPlayer1 ? player1Games : player2Games
    const gamesLost = isPlayer1 ? player2Games : player1Games
    
    stats.setsWon += setsWon
    stats.setsLost += setsLost
    stats.gamesWon += gamesWon
    stats.gamesLost += gamesLost
    
    // Calculate points: Win 2-0: 3 points, Win 2-1: 2 points, Lose 1-2: 1 point, Lose 0-2: 0 points
    if (setsWon === 2 && setsLost === 0) stats.totalPoints += 3
    else if (setsWon === 2 && setsLost === 1) stats.totalPoints += 2
    else if (setsWon === 1 && setsLost === 2) stats.totalPoints += 1
    // 0-2 loss gives 0 points (no need to add)
  })
  
  return stats
}

/**
 * THE MASTER SORTING FUNCTION - USE THIS EVERYWHERE!
 * This matches EXACTLY the logic from public league standings
 * @param {Array} standings - Array of standing objects with player and stats
 * @param {boolean} includeStatusSort - Whether to sort by player status first (for public standings)
 * @returns {Array} Sorted standings
 */
export function sortStandings(standings, includeStatusSort = false) {
  return standings.sort((a, b) => {
    // Optional: Status priority (active → confirmed → pending → inactive)
    if (includeStatusSort) {
      const statusPriority = {
        'active': 0,
        'confirmed': 1,
        'pending': 2,
        'inactive': 3
      }
      
      const aStatus = a.player?.status || a.status || 'inactive'
      const bStatus = b.player?.status || b.status || 'inactive'
      
      const aStatusPriority = statusPriority[aStatus] ?? 99
      const bStatusPriority = statusPriority[bStatus] ?? 99
      
      if (aStatusPriority !== bStatusPriority) {
        return aStatusPriority - bStatusPriority
      }
    }
    
    // 1. Has played matches (players with matches first)
    const aHasPlayed = a.stats.matchesPlayed > 0
    const bHasPlayed = b.stats.matchesPlayed > 0
    
    if (aHasPlayed !== bHasPlayed) {
      return bHasPlayed ? 1 : -1  // Players who have played come first
    }
    
    // 2. Total points (highest first)
    if (a.stats.totalPoints !== b.stats.totalPoints) {
      return b.stats.totalPoints - a.stats.totalPoints
    }
    
    // 3. Set difference (best first)
    const aSetDiff = (a.stats.setsWon || 0) - (a.stats.setsLost || 0)
    const bSetDiff = (b.stats.setsWon || 0) - (b.stats.setsLost || 0)
    if (aSetDiff !== bSetDiff) return bSetDiff - aSetDiff
    
    // 4. Game difference (best first)
    const aGameDiff = (a.stats.gamesWon || 0) - (a.stats.gamesLost || 0)
    const bGameDiff = (b.stats.gamesWon || 0) - (b.stats.gamesLost || 0)
    if (aGameDiff !== bGameDiff) return bGameDiff - aGameDiff
    
    // 5. Alphabetical by name
    const aName = a.player?.name || a.name || ''
    const bName = b.player?.name || b.name || ''
    return aName.localeCompare(bName)
  })
}

/**
 * Calculate complete league standings
 * @param {Array} players - Array of player documents
 * @param {Array} matches - Array of completed match documents
 * @param {boolean} includeStatusSort - Whether to include status in sorting
 * @returns {Array} Sorted standings with positions
 */
export function calculateLeagueStandings(players, matches, includeStatusSort = false) {
  console.log(`📊 Calculating standings for ${players.length} players and ${matches.length} matches`)
  
  // Calculate stats for each player
  const standings = players.map(player => {
    const playerId = player._id || player
    const stats = calculatePlayerStats(playerId, matches)
    
    return {
      player: {
        _id: playerId,
        name: player.name || 'Unknown',
        status: player.status || 'active'
      },
      stats,
      position: 0 // Will be set after sorting
    }
  })
  
  // Sort using the master sorting function
  const sortedStandings = sortStandings(standings, includeStatusSort)
  
  // Assign positions
  sortedStandings.forEach((standing, index) => {
    standing.position = index + 1
  })
  
  console.log('✅ Standings calculated with SINGLE SOURCE OF TRUTH')
  console.log('Top 5:', sortedStandings.slice(0, 5).map(s => ({
    pos: s.position,
    name: s.player.name,
    pts: s.stats.totalPoints,
    matches: s.stats.matchesPlayed,
    setDiff: s.stats.setsWon - s.stats.setsLost,
    gameDiff: s.stats.gamesWon - s.stats.gamesLost
  })))
  
  return sortedStandings
}

/**
 * Calculate standings specifically for playoffs (no status sorting)
 * @param {Array} players - Array of eligible player documents
 * @param {Array} matches - Array of completed regular season matches
 * @returns {Array} Sorted standings ready for playoff seeding
 */
export function calculatePlayoffStandings(players, matches) {
  // For playoffs, we never include status sort since all players are active/confirmed
  return calculateLeagueStandings(players, matches, false)
}
