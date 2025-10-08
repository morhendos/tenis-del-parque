/**
 * CENTRALIZED PLAYER STATISTICS SERVICE
 * 
 * This service manages all player statistics updates and ensures consistency
 * across the entire application. It follows these principles:
 * 
 * 1. MATCHES ARE THE SOURCE OF TRUTH
 * 2. ELO IS GLOBAL (across all leagues for a player)
 * 3. MATCH STATS ARE LEAGUE-SPECIFIC (cached in registrations)
 * 4. ALL UPDATES GO THROUGH THIS SERVICE
 */

import mongoose from 'mongoose'

/**
 * ELO calculation function
 */
export function calculateEloChange(ratingA, ratingB, aWon) {
  const K = 32 // K-factor for ELO calculation
  const expectedA = 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400))
  const actualA = aWon ? 1 : 0
  return Math.round(K * (actualA - expectedA))
}

/**
 * Get initial ELO based on player level
 */
export function getInitialEloByLevel(level) {
  const eloRatings = {
    'beginner': 1100,
    'intermediate': 1200,
    'advanced': 1300
  }
  return eloRatings[level] || 1200
}

/**
 * Helper function to find player registration for a league/season
 */
export function getPlayerRegistration(player, leagueId, season) {
  return player.registrations.find(reg => {
    const leagueMatch = reg.league.toString() === leagueId.toString()
    
    // Handle different season formats
    if (typeof season === 'string' && typeof reg.season === 'string') {
      return leagueMatch && reg.season === season
    } else if (mongoose.Types.ObjectId.isValid(season) && mongoose.Types.ObjectId.isValid(reg.season)) {
      return leagueMatch && reg.season.toString() === season.toString()
    } else if (typeof season === 'object' && typeof reg.season === 'object') {
      return leagueMatch && 
             reg.season.year === season.year && 
             reg.season.type === season.type
    } else {
      // Fallback - just match league
      return leagueMatch
    }
  })
}

/**
 * Update player statistics when a match is completed
 * This is the SINGLE POINT where stats are updated
 */
export async function updatePlayerStatsOnMatchComplete(match, player1, player2, session = null) {
  if (!match.result || !match.result.winner) {
    throw new Error('Match must have a result with winner')
  }

  const player1Won = match.result.winner.toString() === player1._id.toString()
  const player2Won = !player1Won

  // Calculate ELO changes (only for non-walkover matches)
  let eloChange = 0
  if (!match.result.score?.walkover) {
    eloChange = calculateEloChange(
      player1.eloRating || 1200,
      player2.eloRating || 1200,
      player1Won
    )
  }

  // Store ELO changes in match for audit trail
  match.eloChanges = {
    player1: {
      before: player1.eloRating || 1200,
      after: (player1.eloRating || 1200) + eloChange,
      change: eloChange
    },
    player2: {
      before: player2.eloRating || 1200,
      after: (player2.eloRating || 1200) - eloChange,
      change: -eloChange
    }
  }

  // Update GLOBAL ELO (this is the player's true ELO across all leagues)
  player1.eloRating = (player1.eloRating || 1200) + eloChange
  player2.eloRating = (player2.eloRating || 1200) - eloChange

  // Update global highest/lowest ELO tracking
  if (player1.eloRating > (player1.highestElo || 1200)) {
    player1.highestElo = player1.eloRating
  }
  if (player1.eloRating < (player1.lowestElo || 1200)) {
    player1.lowestElo = player1.eloRating
  }
  if (player2.eloRating > (player2.highestElo || 1200)) {
    player2.highestElo = player2.eloRating
  }
  if (player2.eloRating < (player2.lowestElo || 1200)) {
    player2.lowestElo = player2.eloRating
  }

  // Count sets for league-specific stats
  let player1SetsWon = 0
  let player2SetsWon = 0

  if (match.result.score?.sets && match.result.score.sets.length > 0) {
    match.result.score.sets.forEach(set => {
      if (set.player1 > set.player2) {
        player1SetsWon++
      } else {
        player2SetsWon++
      }
    })
  } else if (match.result.score?.walkover) {
    // For walkover, winner gets 2-0
    player1SetsWon = player1Won ? 2 : 0
    player2SetsWon = player1Won ? 0 : 2
  }

  // Update LEAGUE-SPECIFIC stats (cached in registrations for performance)
  const player1Reg = getPlayerRegistration(player1, match.league, match.season)
  const player2Reg = getPlayerRegistration(player2, match.league, match.season)

  if (!player1Reg || !player2Reg) {
    throw new Error('Players must be registered for the league/season')
  }

  // Initialize stats if they don't exist
  if (!player1Reg.stats) player1Reg.stats = { matchesPlayed: 0, matchesWon: 0, setsWon: 0, setsLost: 0 }
  if (!player2Reg.stats) player2Reg.stats = { matchesPlayed: 0, matchesWon: 0, setsWon: 0, setsLost: 0 }

  // Update Player 1 league stats
  player1Reg.stats.matchesPlayed += 1
  if (player1Won) player1Reg.stats.matchesWon += 1
  player1Reg.stats.setsWon = (player1Reg.stats.setsWon || 0) + player1SetsWon
  player1Reg.stats.setsLost = (player1Reg.stats.setsLost || 0) + player2SetsWon

  // Update Player 2 league stats
  player2Reg.stats.matchesPlayed += 1
  if (player2Won) player2Reg.stats.matchesWon += 1
  player2Reg.stats.setsWon = (player2Reg.stats.setsWon || 0) + player2SetsWon
  player2Reg.stats.setsLost = (player2Reg.stats.setsLost || 0) + player1SetsWon

  // Update match history (keep last 20 matches for performance)
  if (!player1Reg.matchHistory) player1Reg.matchHistory = []
  if (!player2Reg.matchHistory) player2Reg.matchHistory = []

  const matchHistoryEntry1 = {
    match: match._id,
    opponent: player2._id,
    result: player1Won ? 'won' : 'lost',
    score: getMatchScoreDisplay(match),
    eloChange: eloChange,
    eloAfter: player1.eloRating, // Global ELO
    round: match.round,
    date: match.result.playedAt
  }

  const matchHistoryEntry2 = {
    match: match._id,
    opponent: player1._id,
    result: player2Won ? 'won' : 'lost',
    score: getMatchScoreDisplay(match),
    eloChange: -eloChange,
    eloAfter: player2.eloRating, // Global ELO
    round: match.round,
    date: match.result.playedAt
  }

  player1Reg.matchHistory.unshift(matchHistoryEntry1)
  player2Reg.matchHistory.unshift(matchHistoryEntry2)

  // Keep only last 20 matches
  if (player1Reg.matchHistory.length > 20) {
    player1Reg.matchHistory = player1Reg.matchHistory.slice(0, 20)
  }
  if (player2Reg.matchHistory.length > 20) {
    player2Reg.matchHistory = player2Reg.matchHistory.slice(0, 20)
  }

  // Save everything (use session if provided for transaction safety)
  const saveOptions = session ? { session } : {}
  await match.save(saveOptions)
  await player1.save(saveOptions)
  await player2.save(saveOptions)

  return {
    eloChanges: match.eloChanges,
    player1Stats: player1Reg.stats,
    player2Stats: player2Reg.stats
  }
}

/**
 * Reverse player statistics when a match is reset or changed
 */
export async function reversePlayerStatsOnMatchReset(match, player1, player2, session = null) {
  if (!match.eloChanges) {
    console.warn('No ELO changes to reverse for match', match._id)
    return
  }

  // Reverse GLOBAL ELO changes
  if (match.eloChanges.player1) {
    player1.eloRating = (player1.eloRating || 1200) - match.eloChanges.player1.change
  }
  if (match.eloChanges.player2) {
    player2.eloRating = (player2.eloRating || 1200) - match.eloChanges.player2.change
  }

  // Recalculate highest/lowest ELO (this is expensive but necessary for accuracy)
  // In a production system, you might want to do this async or batch it
  await recalculatePlayerEloExtremes(player1, session)
  await recalculatePlayerEloExtremes(player2, session)

  // Reverse LEAGUE-SPECIFIC stats
  const player1Reg = getPlayerRegistration(player1, match.league, match.season)
  const player2Reg = getPlayerRegistration(player2, match.league, match.season)

  if (player1Reg?.stats) {
    player1Reg.stats.matchesPlayed = Math.max(0, (player1Reg.stats.matchesPlayed || 0) - 1)
    
    // Reverse win if player1 won
    if (match.result?.winner?.toString() === player1._id.toString()) {
      player1Reg.stats.matchesWon = Math.max(0, (player1Reg.stats.matchesWon || 0) - 1)
    }

    // Remove from match history
    player1Reg.matchHistory = player1Reg.matchHistory.filter(
      h => h.match && !h.match.equals(match._id)
    )
  }

  if (player2Reg?.stats) {
    player2Reg.stats.matchesPlayed = Math.max(0, (player2Reg.stats.matchesPlayed || 0) - 1)
    
    // Reverse win if player2 won
    if (match.result?.winner?.toString() === player2._id.toString()) {
      player2Reg.stats.matchesWon = Math.max(0, (player2Reg.stats.matchesWon || 0) - 1)
    }

    // Remove from match history
    player2Reg.matchHistory = player2Reg.matchHistory.filter(
      h => h.match && !h.match.equals(match._id)
    )
  }

  // Clear match ELO changes
  match.eloChanges = null

  // Save everything
  const saveOptions = session ? { session } : {}
  await match.save(saveOptions)
  await player1.save(saveOptions)
  await player2.save(saveOptions)
}

/**
 * Recalculate a player's highest/lowest ELO from their match history
 * This is expensive but ensures accuracy
 */
async function recalculatePlayerEloExtremes(player, session = null) {
  // This would require loading all matches for the player and recalculating
  // For now, we'll use a simpler approach and just ensure current ELO is within bounds
  if (!player.highestElo || player.eloRating > player.highestElo) {
    player.highestElo = player.eloRating
  }
  if (!player.lowestElo || player.eloRating < player.lowestElo) {
    player.lowestElo = player.eloRating
  }
}

/**
 * Get a display string for match score
 */
function getMatchScoreDisplay(match) {
  if (!match.result?.score?.sets) return 'N/A'
  
  if (match.result.score.walkover) return 'Walkover'
  
  return match.result.score.sets
    .map(set => `${set.player1}-${set.player2}`)
    .join(', ')
}

/**
 * Calculate comprehensive player statistics from matches (for verification/recalculation)
 * This is the "source of truth" calculation that should match cached stats
 */
export function calculatePlayerStatsFromMatches(playerId, matches) {
  const playerIdStr = playerId.toString()
  
  const playerMatches = matches.filter(match => {
    const p1 = match.players?.player1?.toString() || match.players?.player1?._id?.toString()
    const p2 = match.players?.player2?.toString() || match.players?.player2?._id?.toString()
    return p1 === playerIdStr || p2 === playerIdStr
  })
  
  const stats = {
    matchesPlayed: playerMatches.length,
    matchesWon: 0,
    matchesLost: 0,
    setsWon: 0,
    setsLost: 0,
    totalPoints: 0 // League-specific points calculation
  }
  
  playerMatches.forEach(match => {
    if (match.status !== 'completed' || !match.result?.winner) return
    
    const isPlayer1 = (match.players?.player1?.toString() || match.players?.player1?._id?.toString()) === playerIdStr
    const won = match.result.winner.toString() === playerIdStr
    
    if (won) {
      stats.matchesWon++
    } else {
      stats.matchesLost++
    }
    
    // Count sets
    if (match.result.score?.sets) {
      match.result.score.sets.forEach(set => {
        if (isPlayer1) {
          stats.setsWon += set.player1 || 0
          stats.setsLost += set.player2 || 0
        } else {
          stats.setsWon += set.player2 || 0
          stats.setsLost += set.player1 || 0
        }
      })
    }
    
    // Calculate points (this would be league-specific)
    // For now, simple: 3 points for win, 1 for loss
    stats.totalPoints += won ? 3 : 1
  })
  
  return stats
}

/**
 * Verify that cached stats match calculated stats (for debugging/maintenance)
 */
export async function verifyPlayerStats(playerId, leagueId, season) {
  const Match = mongoose.models.Match
  const Player = mongoose.models.Player
  
  const player = await Player.findById(playerId)
  const matches = await Match.find({
    league: leagueId,
    season: season,
    status: 'completed',
    $or: [
      { 'players.player1': playerId },
      { 'players.player2': playerId }
    ]
  }).lean()
  
  const calculatedStats = calculatePlayerStatsFromMatches(playerId, matches)
  const registration = getPlayerRegistration(player, leagueId, season)
  const cachedStats = registration?.stats || {}
  
  const discrepancies = []
  
  if (calculatedStats.matchesPlayed !== (cachedStats.matchesPlayed || 0)) {
    discrepancies.push(`matchesPlayed: calculated ${calculatedStats.matchesPlayed}, cached ${cachedStats.matchesPlayed || 0}`)
  }
  
  if (calculatedStats.matchesWon !== (cachedStats.matchesWon || 0)) {
    discrepancies.push(`matchesWon: calculated ${calculatedStats.matchesWon}, cached ${cachedStats.matchesWon || 0}`)
  }
  
  return {
    playerId,
    leagueId,
    season,
    calculatedStats,
    cachedStats,
    discrepancies,
    isValid: discrepancies.length === 0
  }
}
