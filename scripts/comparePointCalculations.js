/**
 * Script to compare point calculations between public league and playoffs admin
 */

const mongoose = require('mongoose')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

// Define Match schema with calculatePoints method
const MatchSchema = new mongoose.Schema({
  league: mongoose.Schema.Types.ObjectId,
  season: mongoose.Schema.Types.Mixed,
  players: {
    player1: mongoose.Schema.Types.ObjectId,
    player2: mongoose.Schema.Types.ObjectId
  },
  result: {
    winner: mongoose.Schema.Types.ObjectId,
    score: {
      sets: Array,
      walkover: Boolean
    }
  },
  status: String,
  matchType: String
}, { timestamps: true })

// Add the calculatePoints method from the Match model
MatchSchema.methods.calculatePoints = function() {
  if (!this.result || !this.result.winner || this.status !== 'completed') {
    return { player1: 0, player2: 0 };
  }

  // Playoff matches don't contribute to points
  if (this.matchType === 'playoff') {
    return { player1: 0, player2: 0 };
  }

  // Special handling for walkovers - give winner 2 points, loser 0 points
  if (this.result.score.walkover) {
    const player1Won = this.result.winner.toString() === this.players.player1.toString();
    return {
      player1: player1Won ? 2 : 0,
      player2: player1Won ? 0 : 2
    };
  }

  let player1Sets = 0;
  let player2Sets = 0;

  if (this.result.score.sets && this.result.score.sets.length > 0) {
    // Count sets won by each player
    this.result.score.sets.forEach(set => {
      if (set.player1 > set.player2) {
        player1Sets++;
      } else {
        player2Sets++;
      }
    });
  }

  // Calculate points based on sets won for regular matches
  // Win 2-0: 3 points, Win 2-1: 2 points, Lose 1-2: 1 point, Lose 0-2: 0 points
  const getPoints = (setsWon, setsLost) => {
    if (setsWon === 2 && setsLost === 0) return 3;
    if (setsWon === 2 && setsLost === 1) return 2;
    if (setsWon === 1 && setsLost === 2) return 1;
    if (setsWon === 0 && setsLost === 2) return 0;
    return 0; // Default case
  };

  return {
    player1: getPoints(player1Sets, player2Sets),
    player2: getPoints(player2Sets, player1Sets)
  };
};

// Playoffs admin custom function
function calculatePointsForPlayer(match, playerId) {
  if (!match.result || !match.result.winner || match.status !== 'completed') {
    return 0
  }
  
  // Playoff matches don't contribute to points
  if (match.matchType === 'playoff') {
    return 0
  }
  
  // Special handling for walkovers
  if (match.result.score?.walkover) {
    const isWinner = match.result.winner.toString() === playerId.toString()
    return isWinner ? 2 : 0
  }
  
  let player1Sets = 0
  let player2Sets = 0
  
  if (match.result.score?.sets && match.result.score.sets.length > 0) {
    match.result.score.sets.forEach(set => {
      if (set.player1 > set.player2) {
        player1Sets++
      } else {
        player2Sets++
      }
    })
  }
  
  const isPlayer1 = match.players.player1.toString() === playerId.toString()
  const setsWon = isPlayer1 ? player1Sets : player2Sets
  const setsLost = isPlayer1 ? player2Sets : player1Sets
  
  // Calculate points: Win 2-0: 3 points, Win 2-1: 2 points, Lose 1-2: 1 point, Lose 0-2: 0 points
  if (setsWon === 2 && setsLost === 0) return 3
  if (setsWon === 2 && setsLost === 1) return 2
  if (setsWon === 1 && setsLost === 2) return 1
  if (setsWon === 0 && setsLost === 2) return 0
  return 0
}

const Match = mongoose.models.Match || mongoose.model('Match', MatchSchema)

async function comparePointCalculations() {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('✅ Connected to MongoDB')
    
    const leagueId = new mongoose.Types.ObjectId('685fe21ae838c557d2be4b5b') // Liga de Sotogrande
    const seasonId = new mongoose.Types.ObjectId('688f5d51c94f8e3b3cbfd87b') // Summer 2025
    
    // Get all completed matches for the league
    const matches = await Match.find({
      league: leagueId,
      season: seasonId,
      status: 'completed'
    }).lean()
    
    console.log(`📊 Found ${matches.length} completed matches`)
    
    // Get all unique players
    const playerIds = new Set()
    matches.forEach(match => {
      playerIds.add(match.players.player1.toString())
      playerIds.add(match.players.player2.toString())
    })
    
    console.log(`👥 Found ${playerIds.size} unique players`)
    
    // Calculate points for each player using both methods
    const results = []
    
    for (const playerId of playerIds) {
      const playerMatches = matches.filter(match => 
        match.players.player1.toString() === playerId ||
        match.players.player2.toString() === playerId
      )
      
      let publicLeaguePoints = 0
      let playoffsAdminPoints = 0
      
      playerMatches.forEach(match => {
        // Public league method (using Match model)
        const matchInstance = new Match(match)
        const modelPoints = matchInstance.calculatePoints()
        const isPlayer1 = match.players.player1.toString() === playerId
        publicLeaguePoints += isPlayer1 ? modelPoints.player1 : modelPoints.player2
        
        // Playoffs admin method
        playoffsAdminPoints += calculatePointsForPlayer(match, playerId)
      })
      
      results.push({
        playerId,
        matchesPlayed: playerMatches.length,
        publicLeaguePoints,
        playoffsAdminPoints,
        difference: Math.abs(publicLeaguePoints - playoffsAdminPoints)
      })
    }
    
    // Sort by difference to see discrepancies
    results.sort((a, b) => b.difference - a.difference)
    
    console.log('\n📈 Point calculation comparison:')
    console.log('PlayerID'.padEnd(25) + 'Matches'.padEnd(10) + 'Public'.padEnd(10) + 'Playoffs'.padEnd(10) + 'Diff')
    console.log('-'.repeat(65))
    
    results.slice(0, 10).forEach(result => {
      console.log(
        result.playerId.slice(-8).padEnd(25) +
        result.matchesPlayed.toString().padEnd(10) +
        result.publicLeaguePoints.toString().padEnd(10) +
        result.playoffsAdminPoints.toString().padEnd(10) +
        result.difference.toString()
      )
    })
    
    const discrepancies = results.filter(r => r.difference > 0)
    console.log(`\n❌ Found ${discrepancies.length} players with point calculation discrepancies`)
    
    if (discrepancies.length === 0) {
      console.log('✅ All point calculations match! The issue might be elsewhere.')
    } else {
      console.log('⚠️  Point calculation methods are different!')
    }
    
  } catch (error) {
    console.error('❌ Error comparing point calculations:', error)
  } finally {
    await mongoose.disconnect()
    console.log('\n🔌 Disconnected from MongoDB')
    process.exit(0)
  }
}

// Run the comparison
comparePointCalculations()

