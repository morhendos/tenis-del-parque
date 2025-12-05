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
 * Calculate points based on sets won (SET-BASED SCORING)
 * 
 * Points system:
 * - Win 2-0: 3 points (dominant win)
 * - Win 2-1: 2 points (close win)  
 * - Lose 1-2: 1 point (close loss)
 * - Lose 0-2: 0 points (dominant loss)
 */
export function calculateSetBasedPoints(playerSetsWon, opponentSetsWon) {
  if (playerSetsWon === 2 && opponentSetsWon === 0) return 3
  if (playerSetsWon === 2 && opponentSetsWon === 1) return 2
  if (playerSetsWon === 1 && opponentSetsWon === 2) return 1
  if (playerSetsWon === 0 && opponentSetsWon === 2) return 0
  return 0
}

/**
 * Helper function to find player registration for a league
 * 
 * NOTE: Registrations are per-league, not per-season. A player registers
 * for a league once and participates in all its seasons.
 * Season info is stored on the League model, not on registrations.
 */
export function getPlayerRegistration(player, leagueId, season = null) {
  if (!player.registrations || player.registrations.length === 0) {
    return null
  }
  
  // Find registration by league ID only
  // (registrations don't have season field - season is on the League)
  const registration = player.registrations.find(reg => {
    if (!reg.league) return false
    return reg.league.toString() === leagueId.toString()
  })
  
  return registration || null
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
  let player1GamesWon = 0
  let player2GamesWon = 0

  if (match.result.score?.sets && match.result.score.sets.length > 0) {
    match.result.score.sets.forEach(set => {
      if (set.player1 > set.player2) {
        player1SetsWon++
      } else {
        player2SetsWon++
      }
      player1GamesWon += set.player1 || 0
      player2GamesWon += set.player2 || 0
    })
  } else if (match.result.score?.walkover) {
    // For walkover, winner gets 2-0
    player1SetsWon = player1Won ? 2 : 0
    player2SetsWon = player1Won ? 0 : 2
  }

  // Update LEAGUE-SPECIFIC stats (cached in registrations for performance)
  const player1Reg = getPlayerRegistration(player1, match.league)
  const player2Reg = getPlayerRegistration(player2, match.league)

  if (!player1Reg || !player2Reg) {
    console.error('Players must be registered for the league')
    console.error('Player 1 registration:', player1Reg ? 'found' : 'NOT FOUND')
    console.error('Player 2 registration:', player2Reg ? 'found' : 'NOT FOUND')
    console.error('League ID:', match.league?.toString())
    throw new Error('Players must be registered for the league')
  }

  // Initialize stats if they don't exist
  if (!player1Reg.stats) player1Reg.stats = { matchesPlayed: 0, matchesWon: 0, setsWon: 0, setsLost: 0, gamesWon: 0, gamesLost: 0, totalPoints: 0 }
  if (!player2Reg.stats) player2Reg.stats = { matchesPlayed: 0, matchesWon: 0, setsWon: 0, setsLost: 0, gamesWon: 0, gamesLost: 0, totalPoints: 0 }

  // Calculate points:
  // - Walkover: winner gets 2 points, loser gets 0 (effortless win = less reward)
  // - Regular match: Win 2-0 = 3pts, Win 2-1 = 2pts, Lose 1-2 = 1pt, Lose 0-2 = 0pts
  let player1Points, player2Points
  if (match.result.score?.walkover) {
    player1Points = player1Won ? 2 : 0
    player2Points = player2Won ? 2 : 0
  } else {
    player1Points = calculateSetBasedPoints(player1SetsWon, player2SetsWon)
    player2Points = calculateSetBasedPoints(player2SetsWon, player1SetsWon)
  }

  // Update Player 1 league stats
  player1Reg.stats.matchesPlayed += 1
  if (player1Won) player1Reg.stats.matchesWon += 1
  player1Reg.stats.setsWon = (player1Reg.stats.setsWon || 0) + player1SetsWon
  player1Reg.stats.setsLost = (player1Reg.stats.setsLost || 0) + player2SetsWon
  player1Reg.stats.gamesWon = (player1Reg.stats.gamesWon || 0) + player1GamesWon
  player1Reg.stats.gamesLost = (player1Reg.stats.gamesLost || 0) + player2GamesWon
  player1Reg.stats.totalPoints = (player1Reg.stats.totalPoints || 0) + player1Points

  // Update Player 2 league stats
  player2Reg.stats.matchesPlayed += 1
  if (player2Won) player2Reg.stats.matchesWon += 1
  player2Reg.stats.setsWon = (player2Reg.stats.setsWon || 0) + player2SetsWon
  player2Reg.stats.setsLost = (player2Reg.stats.setsLost || 0) + player1SetsWon
  player2Reg.stats.gamesWon = (player2Reg.stats.gamesWon || 0) + player2GamesWon
  player2Reg.stats.gamesLost = (player2Reg.stats.gamesLost || 0) + player1GamesWon
  player2Reg.stats.totalPoints = (player2Reg.stats.totalPoints || 0) + player2Points

  // Update match history (keep last 50 matches for performance)
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
    date: match.result.playedAt || new Date()
  }

  const matchHistoryEntry2 = {
    match: match._id,
    opponent: player1._id,
    result: player2Won ? 'won' : 'lost',
    score: getMatchScoreDisplay(match),
    eloChange: -eloChange,
    eloAfter: player2.eloRating, // Global ELO
    round: match.round,
    date: match.result.playedAt || new Date()
  }

  // Add to beginning of array (most recent first)
  player1Reg.matchHistory.unshift(matchHistoryEntry1)
  player2Reg.matchHistory.unshift(matchHistoryEntry2)

  // Keep only last 50 matches per league registration
  if (player1Reg.matchHistory.length > 50) {
    player1Reg.matchHistory = player1Reg.matchHistory.slice(0, 50)
  }
  if (player2Reg.matchHistory.length > 50) {
    player2Reg.matchHistory = player2Reg.matchHistory.slice(0, 50)
  }

  // Save everything IN PARALLEL (use session if provided for transaction safety)
  const saveOptions = session ? { session } : {}
  await Promise.all([
    match.save(saveOptions),
    player1.save(saveOptions),
    player2.save(saveOptions)
  ])

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
  await recalculatePlayerEloExtremes(player1, session)
  await recalculatePlayerEloExtremes(player2, session)

  // Reverse LEAGUE-SPECIFIC stats
  const player1Reg = getPlayerRegistration(player1, match.league)
  const player2Reg = getPlayerRegistration(player2, match.league)

  // Calculate sets won for points reversal
  let player1SetsWon = 0
  let player2SetsWon = 0
  
  if (match.result?.score?.sets && match.result.score.sets.length > 0) {
    match.result.score.sets.forEach(set => {
      if (set.player1 > set.player2) player1SetsWon++
      else player2SetsWon++
    })
  } else if (match.result?.score?.walkover) {
    const winner = match.result.winner.toString()
    if (winner === player1._id.toString()) {
      player1SetsWon = 2
      player2SetsWon = 0
    } else {
      player1SetsWon = 0
      player2SetsWon = 2
    }
  }

  const isWalkover = match.result?.score?.walkover

  if (player1Reg?.stats) {
    const player1Won = match.result?.winner?.toString() === player1._id.toString()
    const player1Points = isWalkover ? (player1Won ? 2 : 0) : calculateSetBasedPoints(player1SetsWon, player2SetsWon)
    
    player1Reg.stats.matchesPlayed = Math.max(0, (player1Reg.stats.matchesPlayed || 0) - 1)
    
    if (player1Won) {
      player1Reg.stats.matchesWon = Math.max(0, (player1Reg.stats.matchesWon || 0) - 1)
    }
    
    player1Reg.stats.totalPoints = Math.max(0, (player1Reg.stats.totalPoints || 0) - player1Points)
    player1Reg.stats.setsWon = Math.max(0, (player1Reg.stats.setsWon || 0) - player1SetsWon)
    player1Reg.stats.setsLost = Math.max(0, (player1Reg.stats.setsLost || 0) - player2SetsWon)

    if (player1Reg.matchHistory) {
      player1Reg.matchHistory = player1Reg.matchHistory.filter(
        h => h.match && !h.match.equals(match._id)
      )
    }
  }

  if (player2Reg?.stats) {
    const player2Won = match.result?.winner?.toString() === player2._id.toString()
    const player2Points = isWalkover ? (player2Won ? 2 : 0) : calculateSetBasedPoints(player2SetsWon, player1SetsWon)
    
    player2Reg.stats.matchesPlayed = Math.max(0, (player2Reg.stats.matchesPlayed || 0) - 1)
    
    if (player2Won) {
      player2Reg.stats.matchesWon = Math.max(0, (player2Reg.stats.matchesWon || 0) - 1)
    }
    
    player2Reg.stats.totalPoints = Math.max(0, (player2Reg.stats.totalPoints || 0) - player2Points)
    player2Reg.stats.setsWon = Math.max(0, (player2Reg.stats.setsWon || 0) - player2SetsWon)
    player2Reg.stats.setsLost = Math.max(0, (player2Reg.stats.setsLost || 0) - player1SetsWon)

    if (player2Reg.matchHistory) {
      player2Reg.matchHistory = player2Reg.matchHistory.filter(
        h => h.match && !h.match.equals(match._id)
      )
    }
  }

  // Clear match ELO changes
  match.eloChanges = null

  // Save everything IN PARALLEL
  const saveOptions = session ? { session } : {}
  await Promise.all([
    match.save(saveOptions),
    player1.save(saveOptions),
    player2.save(saveOptions)
  ])
}

/**
 * Recalculate a player's highest/lowest ELO from their match history
 */
async function recalculatePlayerEloExtremes(player, session = null) {
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
    matchesPlayed: 0,
    matchesWon: 0,
    matchesLost: 0,
    setsWon: 0,
    setsLost: 0,
    gamesWon: 0,
    gamesLost: 0,
    totalPoints: 0
  }
  
  playerMatches.forEach(match => {
    if (match.status !== 'completed' || !match.result?.winner) return
    
    stats.matchesPlayed++
    
    const isPlayer1 = (match.players?.player1?.toString() || match.players?.player1?._id?.toString()) === playerIdStr
    const won = match.result.winner.toString() === playerIdStr
    
    if (won) {
      stats.matchesWon++
    } else {
      stats.matchesLost++
    }
    
    // Count sets and games
    let playerSetsWon = 0
    let opponentSetsWon = 0
    
    if (match.result.score?.sets) {
      match.result.score.sets.forEach(set => {
        if (isPlayer1) {
          if (set.player1 > set.player2) {
            stats.setsWon++
            playerSetsWon++
          } else {
            stats.setsLost++
            opponentSetsWon++
          }
          stats.gamesWon += set.player1 || 0
          stats.gamesLost += set.player2 || 0
        } else {
          if (set.player2 > set.player1) {
            stats.setsWon++
            playerSetsWon++
          } else {
            stats.setsLost++
            opponentSetsWon++
          }
          stats.gamesWon += set.player2 || 0
          stats.gamesLost += set.player1 || 0
        }
      })
    } else if (match.result.score?.walkover) {
      if (won) {
        stats.setsWon += 2
        playerSetsWon = 2
        opponentSetsWon = 0
      } else {
        stats.setsLost += 2
        playerSetsWon = 0
        opponentSetsWon = 2
      }
    }
    
    // Calculate points:
    // - Walkover: winner gets 2 points, loser gets 0
    // - Regular match: use set-based scoring
    if (match.result.score?.walkover) {
      stats.totalPoints += won ? 2 : 0
    } else {
      stats.totalPoints += calculateSetBasedPoints(playerSetsWon, opponentSetsWon)
    }
  })
  
  return stats
}

/**
 * Verify that cached stats match calculated stats (for debugging/maintenance)
 */
export async function verifyPlayerStats(playerId, leagueId) {
  const Match = mongoose.models.Match
  const Player = mongoose.models.Player
  
  const player = await Player.findById(playerId)
  const matches = await Match.find({
    league: leagueId,
    status: 'completed',
    $or: [
      { 'players.player1': playerId },
      { 'players.player2': playerId }
    ]
  }).lean()
  
  const calculatedStats = calculatePlayerStatsFromMatches(playerId, matches)
  const registration = getPlayerRegistration(player, leagueId)
  const cachedStats = registration?.stats || {}
  
  const discrepancies = []
  
  if (calculatedStats.matchesPlayed !== (cachedStats.matchesPlayed || 0)) {
    discrepancies.push(`matchesPlayed: calculated ${calculatedStats.matchesPlayed}, cached ${cachedStats.matchesPlayed || 0}`)
  }
  
  if (calculatedStats.matchesWon !== (cachedStats.matchesWon || 0)) {
    discrepancies.push(`matchesWon: calculated ${calculatedStats.matchesWon}, cached ${cachedStats.matchesWon || 0}`)
  }
  
  if (calculatedStats.totalPoints !== (cachedStats.totalPoints || 0)) {
    discrepancies.push(`totalPoints: calculated ${calculatedStats.totalPoints}, cached ${cachedStats.totalPoints || 0}`)
  }
  
  return {
    playerId,
    leagueId,
    calculatedStats,
    cachedStats,
    discrepancies,
    isValid: discrepancies.length === 0
  }
}
