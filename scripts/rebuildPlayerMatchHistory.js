/**
 * REBUILD PLAYER MATCH HISTORY SCRIPT
 * 
 * This script rebuilds the matchHistory cache for all players
 * by reading from Match documents (the source of truth).
 * 
 * Usage: node scripts/rebuildPlayerMatchHistory.js [--dry-run] [--player-id=XXX]
 * 
 * Options:
 *   --dry-run       Show what would be updated without making changes
 *   --player-id=XXX Only rebuild for a specific player
 */

const mongoose = require('mongoose')
require('dotenv').config({ path: '.env.local' })

// Parse command line arguments
const args = process.argv.slice(2)
const isDryRun = args.includes('--dry-run')
const playerIdArg = args.find(arg => arg.startsWith('--player-id='))
const specificPlayerId = playerIdArg ? playerIdArg.split('=')[1] : null

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI not found in environment variables')
  process.exit(1)
}

// Define schemas inline to avoid ES module issues
const PlayerSchema = new mongoose.Schema({
  name: String,
  email: String,
  eloRating: { type: Number, default: 1200 },
  highestElo: { type: Number, default: 1200 },
  lowestElo: { type: Number, default: 1200 },
  registrations: [{
    league: { type: mongoose.Schema.Types.ObjectId, ref: 'League' },
    level: String,
    status: String,
    stats: {
      matchesPlayed: { type: Number, default: 0 },
      matchesWon: { type: Number, default: 0 },
      totalPoints: { type: Number, default: 0 },
      setsWon: { type: Number, default: 0 },
      setsLost: { type: Number, default: 0 },
      gamesWon: { type: Number, default: 0 },
      gamesLost: { type: Number, default: 0 }
    },
    matchHistory: [{
      match: { type: mongoose.Schema.Types.ObjectId, ref: 'Match' },
      opponent: { type: mongoose.Schema.Types.ObjectId, ref: 'Player' },
      result: String,
      score: String,
      eloChange: Number,
      eloAfter: Number,
      round: Number,
      date: Date
    }]
  }]
}, { timestamps: true })

const MatchSchema = new mongoose.Schema({
  league: { type: mongoose.Schema.Types.ObjectId, ref: 'League' },
  season: { type: mongoose.Schema.Types.ObjectId, ref: 'Season' },
  round: Number,
  matchType: String,
  players: {
    player1: { type: mongoose.Schema.Types.ObjectId, ref: 'Player' },
    player2: { type: mongoose.Schema.Types.ObjectId, ref: 'Player' }
  },
  result: {
    winner: { type: mongoose.Schema.Types.ObjectId, ref: 'Player' },
    score: {
      sets: [{
        player1: Number,
        player2: Number
      }],
      walkover: Boolean
    },
    playedAt: Date
  },
  eloChanges: {
    player1: {
      before: Number,
      after: Number,
      change: Number
    },
    player2: {
      before: Number,
      after: Number,
      change: Number
    }
  },
  status: String
}, { timestamps: true })

const Player = mongoose.models.Player || mongoose.model('Player', PlayerSchema)
const Match = mongoose.models.Match || mongoose.model('Match', MatchSchema)

/**
 * Get score display string from match
 */
function getScoreDisplay(match, isPlayer1) {
  if (!match.result?.score?.sets) return 'N/A'
  if (match.result.score.walkover) return 'Walkover'
  
  return match.result.score.sets
    .map(set => {
      // Show from player's perspective
      if (isPlayer1) {
        return `${set.player1}-${set.player2}`
      } else {
        return `${set.player2}-${set.player1}`
      }
    })
    .join(', ')
}

/**
 * Calculate points from a match for a specific player
 * 
 * Points system (SET-BASED):
 * - Win 2-0: 3 points (dominant win)
 * - Win 2-1: 2 points (close win)
 * - Win by walkover: 2 points (effortless win, less reward)
 * - Lose 1-2: 1 point (close loss)
 * - Lose 0-2: 0 points (dominant loss)
 * - Lose by walkover: 0 points (didn't show up)
 */
function calculatePointsFromMatch(match, playerId) {
  if (match.status !== 'completed' || !match.result?.winner) {
    return 0
  }

  const playerIdStr = playerId.toString()
  const isPlayer1 = match.players.player1.toString() === playerIdStr
  const isWinner = match.result.winner.toString() === playerIdStr

  // Special case: Walkover - winner gets 2 points, loser gets 0
  if (match.result.score?.walkover) {
    return isWinner ? 2 : 0
  }

  // Regular match - count sets
  let playerSetsWon = 0
  let opponentSetsWon = 0

  if (match.result.score?.sets && match.result.score.sets.length > 0) {
    match.result.score.sets.forEach(set => {
      const player1Score = set.player1 || 0
      const player2Score = set.player2 || 0
      
      if (isPlayer1) {
        if (player1Score > player2Score) {
          playerSetsWon++
        } else {
          opponentSetsWon++
        }
      } else {
        if (player2Score > player1Score) {
          playerSetsWon++
        } else {
          opponentSetsWon++
        }
      }
    })
  }

  // Calculate points based on sets won
  // Win 2-0: 3 points, Win 2-1: 2 points, Lose 1-2: 1 point, Lose 0-2: 0 points
  if (playerSetsWon === 2 && opponentSetsWon === 0) return 3
  if (playerSetsWon === 2 && opponentSetsWon === 1) return 2
  if (playerSetsWon === 1 && opponentSetsWon === 2) return 1
  if (playerSetsWon === 0 && opponentSetsWon === 2) return 0
  
  return 0
}

/**
 * Calculate stats from matches for a player in a league
 */
function calculateStatsFromMatches(playerId, matches) {
  const playerIdStr = playerId.toString()
  
  const stats = {
    matchesPlayed: 0,
    matchesWon: 0,
    setsWon: 0,
    setsLost: 0,
    gamesWon: 0,
    gamesLost: 0,
    totalPoints: 0
  }
  
  matches.forEach(match => {
    if (match.status !== 'completed' || !match.result?.winner) return
    
    stats.matchesPlayed++
    
    const isPlayer1 = match.players.player1.toString() === playerIdStr
    const won = match.result.winner.toString() === playerIdStr
    
    if (won) {
      stats.matchesWon++
    }
    
    // Calculate points using set-based system (with walkover special case)
    stats.totalPoints += calculatePointsFromMatch(match, playerId)
    
    // Count sets and games
    if (match.result.score?.walkover) {
      // Walkover: winner gets 2-0 in sets, no games counted
      if (won) {
        stats.setsWon += 2
      } else {
        stats.setsLost += 2
      }
    } else if (match.result.score?.sets) {
      match.result.score.sets.forEach(set => {
        if (isPlayer1) {
          if (set.player1 > set.player2) stats.setsWon++
          else stats.setsLost++
          stats.gamesWon += set.player1 || 0
          stats.gamesLost += set.player2 || 0
        } else {
          if (set.player2 > set.player1) stats.setsWon++
          else stats.setsLost++
          stats.gamesWon += set.player2 || 0
          stats.gamesLost += set.player1 || 0
        }
      })
    }
  })
  
  return stats
}

/**
 * Build match history from matches for a player
 */
function buildMatchHistory(playerId, matches) {
  const playerIdStr = playerId.toString()
  const history = []
  
  // Sort by playedAt ascending (oldest first for ELO calculation)
  const sortedMatches = [...matches].sort((a, b) => {
    const dateA = a.result?.playedAt || a.updatedAt
    const dateB = b.result?.playedAt || b.updatedAt
    return new Date(dateA) - new Date(dateB)
  })
  
  sortedMatches.forEach((match) => {
    if (match.status !== 'completed' || !match.result?.winner) return
    
    const isPlayer1 = match.players.player1.toString() === playerIdStr
    const opponentId = isPlayer1 ? match.players.player2 : match.players.player1
    const won = match.result.winner.toString() === playerIdStr
    
    // Get ELO change from match data
    let eloChange = 0
    let eloAfter = 1200
    
    if (match.eloChanges) {
      if (isPlayer1 && match.eloChanges.player1) {
        eloChange = match.eloChanges.player1.change || 0
        eloAfter = match.eloChanges.player1.after || 1200
      } else if (!isPlayer1 && match.eloChanges.player2) {
        eloChange = match.eloChanges.player2.change || 0
        eloAfter = match.eloChanges.player2.after || 1200
      }
    }
    
    history.push({
      match: match._id,
      opponent: opponentId,
      result: won ? 'won' : 'lost',
      score: getScoreDisplay(match, isPlayer1),
      eloChange: eloChange,
      eloAfter: eloAfter,
      round: match.round,
      date: match.result.playedAt || match.updatedAt
    })
  })
  
  // Return in reverse chronological order (most recent first)
  return history.reverse()
}

/**
 * Main rebuild function
 */
async function rebuildPlayerMatchHistory() {
  console.log('🎾 REBUILD PLAYER MATCH HISTORY')
  console.log('================================')
  console.log(`Mode: ${isDryRun ? 'DRY RUN (no changes will be made)' : 'LIVE'}`)
  if (specificPlayerId) {
    console.log(`Target: Player ${specificPlayerId}`)
  } else {
    console.log('Target: All players')
  }
  console.log('')
  console.log('📊 Points System:')
  console.log('   Win 2-0: 3 points')
  console.log('   Win 2-1: 2 points')
  console.log('   Win by walkover: 2 points')
  console.log('   Lose 1-2: 1 point')
  console.log('   Lose 0-2: 0 points')
  console.log('   Lose by walkover: 0 points')
  console.log('')
  
  try {
    // Connect to MongoDB
    console.log('📡 Connecting to MongoDB...')
    await mongoose.connect(MONGODB_URI)
    console.log('✅ Connected to MongoDB')
    console.log('')
    
    // Find players to process
    const playerQuery = specificPlayerId 
      ? { _id: new mongoose.Types.ObjectId(specificPlayerId) }
      : { 'registrations.0': { $exists: true } } // Players with at least one registration
    
    const players = await Player.find(playerQuery)
    console.log(`📋 Found ${players.length} players to process`)
    console.log('')
    
    let updatedCount = 0
    let skippedCount = 0
    let errorCount = 0
    
    for (const player of players) {
      try {
        console.log(`\n👤 Processing: ${player.name} (${player._id})`)
        
        // Get all completed matches for this player
        const allMatches = await Match.find({
          $or: [
            { 'players.player1': player._id },
            { 'players.player2': player._id }
          ],
          status: 'completed',
          'result.winner': { $exists: true }
        }).sort({ 'result.playedAt': 1 }).lean()
        
        console.log(`   Found ${allMatches.length} total completed matches`)
        
        // Group matches by league
        const matchesByLeague = {}
        allMatches.forEach(match => {
          const leagueId = match.league.toString()
          if (!matchesByLeague[leagueId]) {
            matchesByLeague[leagueId] = []
          }
          matchesByLeague[leagueId].push(match)
        })
        
        // Process each registration
        let playerModified = false
        
        for (const registration of player.registrations) {
          const leagueId = registration.league.toString()
          const leagueMatches = matchesByLeague[leagueId] || []
          
          console.log(`   📁 League ${leagueId}: ${leagueMatches.length} matches`)
          
          // Calculate stats from matches
          const newStats = calculateStatsFromMatches(player._id, leagueMatches)
          
          // Build match history
          const newMatchHistory = buildMatchHistory(player._id, leagueMatches)
          
          // Check if anything changed
          const oldStats = registration.stats || {}
          const oldHistoryLength = registration.matchHistory?.length || 0
          
          const statsChanged = 
            newStats.matchesPlayed !== (oldStats.matchesPlayed || 0) ||
            newStats.matchesWon !== (oldStats.matchesWon || 0) ||
            newStats.totalPoints !== (oldStats.totalPoints || 0)
          
          const historyChanged = newMatchHistory.length !== oldHistoryLength
          
          if (statsChanged || historyChanged) {
            console.log(`   ⚡ Changes detected:`)
            if (statsChanged) {
              console.log(`      Stats: ${oldStats.matchesPlayed || 0} matches → ${newStats.matchesPlayed} matches`)
              console.log(`             ${oldStats.matchesWon || 0} wins → ${newStats.matchesWon} wins`)
              console.log(`             ${oldStats.totalPoints || 0} points → ${newStats.totalPoints} points`)
            }
            if (historyChanged) {
              console.log(`      History: ${oldHistoryLength} entries → ${newMatchHistory.length} entries`)
            }
            
            if (!isDryRun) {
              registration.stats = newStats
              registration.matchHistory = newMatchHistory
              playerModified = true
            }
          } else {
            console.log(`   ✓ No changes needed for this league`)
          }
        }
        
        // Save player if modified
        if (playerModified && !isDryRun) {
          await player.save()
          console.log(`   💾 Saved changes`)
          updatedCount++
        } else if (playerModified && isDryRun) {
          console.log(`   🔍 Would save changes (dry run)`)
          updatedCount++
        } else {
          skippedCount++
        }
        
      } catch (error) {
        console.error(`   ❌ Error processing player: ${error.message}`)
        errorCount++
      }
    }
    
    // Summary
    console.log('\n================================')
    console.log('📊 SUMMARY')
    console.log('================================')
    console.log(`Total players processed: ${players.length}`)
    console.log(`Updated: ${updatedCount}`)
    console.log(`Skipped (no changes): ${skippedCount}`)
    console.log(`Errors: ${errorCount}`)
    
    if (isDryRun) {
      console.log('\n⚠️  This was a DRY RUN. No changes were made.')
      console.log('   Run without --dry-run to apply changes.')
    }
    
  } catch (error) {
    console.error('❌ Fatal error:', error)
    process.exit(1)
  } finally {
    await mongoose.disconnect()
    console.log('\n👋 Disconnected from MongoDB')
  }
}

// Run the script
rebuildPlayerMatchHistory()
