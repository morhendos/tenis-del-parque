/**
 * Script to recalculate all player statistics after fixing season format issues
 * This script will:
 * 1. Reset all player registration stats to defaults
 * 2. Recalculate stats based on completed matches
 * 3. Update both global ELO and league-specific stats
 */

const mongoose = require('mongoose')
require('dotenv').config({ path: '.env.local' })

// Define schemas inline
const PlayerSchema = new mongoose.Schema({
  name: String,
  email: String,
  whatsapp: String,
  userId: mongoose.Schema.Types.ObjectId,
  eloRating: { type: Number, default: 1200 },
  highestElo: { type: Number, default: 1200 },
  lowestElo: { type: Number, default: 1200 },
  registrations: [{
    league: mongoose.Schema.Types.ObjectId,
    season: mongoose.Schema.Types.Mixed,
    level: String,
    status: String,
    stats: {
      matchesPlayed: { type: Number, default: 0 },
      matchesWon: { type: Number, default: 0 },
      setsWon: { type: Number, default: 0 },
      setsLost: { type: Number, default: 0 },
      eloRating: { type: Number, default: 1200 }
    },
    matchHistory: [mongoose.Schema.Types.Mixed],
    registeredAt: Date
  }]
}, { timestamps: true })

const MatchSchema = new mongoose.Schema({
  league: mongoose.Schema.Types.ObjectId,
  season: mongoose.Schema.Types.Mixed,
  round: Number,
  players: {
    player1: mongoose.Schema.Types.ObjectId,
    player2: mongoose.Schema.Types.ObjectId
  },
  status: String,
  result: {
    winner: mongoose.Schema.Types.ObjectId,
    score: {
      sets: [mongoose.Schema.Types.Mixed],
      walkover: Boolean
    },
    playedAt: Date
  },
  eloChanges: mongoose.Schema.Types.Mixed
}, { timestamps: true })

// Create models
const Player = mongoose.models.Player || mongoose.model('Player', PlayerSchema)
const Match = mongoose.models.Match || mongoose.model('Match', MatchSchema)

// ELO calculation function
const calculateEloChange = (ratingA, ratingB, aWon) => {
  const K = 32 // K-factor for ELO calculation
  const expectedA = 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400))
  const actualA = aWon ? 1 : 0
  return Math.round(K * (actualA - expectedA))
}

// Get initial ELO based on player level
const getInitialEloByLevel = (level) => {
  const eloRatings = {
    'beginner': 1100,
    'intermediate': 1200,
    'advanced': 1300
  }
  return eloRatings[level] || 1200
}

// Helper function to find player registration for a league/season
function getPlayerRegistration(player, leagueId, season) {
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

async function recalculateAllPlayerStats() {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('✅ Connected to MongoDB')
    
    // Get all players
    const players = await Player.find({}).lean()
    console.log(`📊 Found ${players.length} players to process`)
    
    // Get all completed matches in chronological order
    const matches = await Match.find({
      status: 'completed',
      'result.playedAt': { $exists: true }
    })
    .populate('players.player1 players.player2', 'name email registrations eloRating')
    .sort({ 'result.playedAt': 1 })
    .lean()
    
    console.log(`📊 Found ${matches.length} completed matches`)
    
    // Step 1: Reset all player stats to defaults
    console.log('\n🔄 Step 1: Resetting all player stats...')
    
    const playerStatsMap = new Map()
    
    for (const player of players) {
      // Initialize global ELO based on primary registration level
      const primaryLevel = player.registrations?.[0]?.level || 'intermediate'
      const initialElo = getInitialEloByLevel(primaryLevel)
      
      playerStatsMap.set(player._id.toString(), {
        globalElo: initialElo,
        highestElo: initialElo,
        lowestElo: initialElo,
        registrationStats: new Map() // leagueId+season -> stats
      })
      
      // Reset registration stats
      for (const registration of player.registrations || []) {
        const regKey = `${registration.league}_${JSON.stringify(registration.season)}`
        playerStatsMap.get(player._id.toString()).registrationStats.set(regKey, {
          matchesPlayed: 0,
          matchesWon: 0,
          setsWon: 0,
          setsLost: 0,
          eloRating: initialElo,
          matchHistory: []
        })
      }
    }
    
    console.log(`   ✅ Reset stats for ${players.length} players`)
    
    // Step 2: Process matches chronologically to recalculate stats
    console.log('\n🔄 Step 2: Processing matches chronologically...')
    
    let processedMatches = 0
    
    for (const match of matches) {
      try {
        const player1Id = match.players.player1._id.toString()
        const player2Id = match.players.player2._id.toString()
        
        const player1Stats = playerStatsMap.get(player1Id)
        const player2Stats = playerStatsMap.get(player2Id)
        
        if (!player1Stats || !player2Stats) {
          console.log(`   ⚠️  Skipping match ${match._id} - player stats not found`)
          continue
        }
        
        // Determine winner
        const player1Won = match.result.winner.toString() === player1Id
        const player2Won = match.result.winner.toString() === player2Id
        
        // Calculate ELO changes
        const player1EloBefore = player1Stats.globalElo
        const player2EloBefore = player2Stats.globalElo
        
        const player1EloChange = calculateEloChange(player1EloBefore, player2EloBefore, player1Won)
        const player2EloChange = -player1EloChange
        
        // Update global ELO
        player1Stats.globalElo += player1EloChange
        player2Stats.globalElo += player2EloChange
        
        // Update highest/lowest ELO
        if (player1Stats.globalElo > player1Stats.highestElo) {
          player1Stats.highestElo = player1Stats.globalElo
        }
        if (player1Stats.globalElo < player1Stats.lowestElo) {
          player1Stats.lowestElo = player1Stats.globalElo
        }
        if (player2Stats.globalElo > player2Stats.highestElo) {
          player2Stats.highestElo = player2Stats.globalElo
        }
        if (player2Stats.globalElo < player2Stats.lowestElo) {
          player2Stats.lowestElo = player2Stats.globalElo
        }
        
        // Update league-specific stats
        const regKey = `${match.league}_${JSON.stringify(match.season)}`
        
        const player1RegStats = player1Stats.registrationStats.get(regKey)
        const player2RegStats = player2Stats.registrationStats.get(regKey)
        
        if (player1RegStats) {
          player1RegStats.matchesPlayed++
          if (player1Won) player1RegStats.matchesWon++
          player1RegStats.eloRating = player1Stats.globalElo
          
          // Count sets
          if (match.result.score?.sets) {
            for (const set of match.result.score.sets) {
              player1RegStats.setsWon += set.player1 || 0
              player1RegStats.setsLost += set.player2 || 0
            }
          }
          
          // Add to match history
          player1RegStats.matchHistory.unshift({
            match: match._id,
            opponent: player2Id,
            result: player1Won ? 'won' : 'lost',
            eloChange: player1EloChange,
            eloAfter: player1Stats.globalElo,
            round: match.round,
            date: match.result.playedAt
          })
          
          // Keep only last 20 matches
          if (player1RegStats.matchHistory.length > 20) {
            player1RegStats.matchHistory = player1RegStats.matchHistory.slice(0, 20)
          }
        }
        
        if (player2RegStats) {
          player2RegStats.matchesPlayed++
          if (player2Won) player2RegStats.matchesWon++
          player2RegStats.eloRating = player2Stats.globalElo
          
          // Count sets
          if (match.result.score?.sets) {
            for (const set of match.result.score.sets) {
              player2RegStats.setsWon += set.player2 || 0
              player2RegStats.setsLost += set.player1 || 0
            }
          }
          
          // Add to match history
          player2RegStats.matchHistory.unshift({
            match: match._id,
            opponent: player1Id,
            result: player2Won ? 'won' : 'lost',
            eloChange: player2EloChange,
            eloAfter: player2Stats.globalElo,
            round: match.round,
            date: match.result.playedAt
          })
          
          // Keep only last 20 matches
          if (player2RegStats.matchHistory.length > 20) {
            player2RegStats.matchHistory = player2RegStats.matchHistory.slice(0, 20)
          }
        }
        
        // Update match ELO changes
        await Match.findByIdAndUpdate(match._id, {
          eloChanges: {
            player1: {
              before: player1EloBefore,
              after: player1Stats.globalElo,
              change: player1EloChange
            },
            player2: {
              before: player2EloBefore,
              after: player2Stats.globalElo,
              change: player2EloChange
            }
          }
        })
        
        processedMatches++
        
        if (processedMatches % 10 === 0) {
          console.log(`   ✅ Processed ${processedMatches} matches...`)
        }
        
      } catch (error) {
        console.error(`   ❌ Error processing match ${match._id}:`, error.message)
      }
    }
    
    console.log(`   ✅ Processed ${processedMatches} matches`)
    
    // Step 3: Update all players in database
    console.log('\n🔄 Step 3: Updating player records...')
    
    let updatedPlayers = 0
    
    for (const player of players) {
      try {
        const playerId = player._id.toString()
        const playerStats = playerStatsMap.get(playerId)
        
        if (!playerStats) continue
        
        // Update global ELO
        const updateData = {
          eloRating: playerStats.globalElo,
          highestElo: playerStats.highestElo,
          lowestElo: playerStats.lowestElo
        }
        
        // Update registration stats
        const updatedRegistrations = player.registrations.map(registration => {
          const regKey = `${registration.league}_${JSON.stringify(registration.season)}`
          const regStats = playerStats.registrationStats.get(regKey)
          
          if (regStats) {
            return {
              ...registration,
              stats: {
                matchesPlayed: regStats.matchesPlayed,
                matchesWon: regStats.matchesWon,
                setsWon: regStats.setsWon,
                setsLost: regStats.setsLost,
                eloRating: regStats.eloRating
              },
              matchHistory: regStats.matchHistory
            }
          }
          
          return registration
        })
        
        updateData.registrations = updatedRegistrations
        
        await Player.findByIdAndUpdate(player._id, updateData)
        updatedPlayers++
        
        if (updatedPlayers % 10 === 0) {
          console.log(`   ✅ Updated ${updatedPlayers} players...`)
        }
        
      } catch (error) {
        console.error(`   ❌ Error updating player ${player._id}:`, error.message)
      }
    }
    
    console.log(`   ✅ Updated ${updatedPlayers} players`)
    
    // Step 4: Summary
    console.log('\n📊 Recalculation Summary:')
    console.log(`   Players processed: ${players.length}`)
    console.log(`   Matches processed: ${processedMatches}`)
    console.log(`   Players updated: ${updatedPlayers}`)
    
    // Sample some results
    console.log('\n🎾 Sample Results:')
    const samplePlayers = await Player.find({}).limit(3).lean()
    
    for (const player of samplePlayers) {
      const reg = player.registrations?.[0]
      if (reg?.stats) {
        console.log(`   ${player.name}:`)
        console.log(`     Global ELO: ${player.eloRating} (${player.lowestElo}-${player.highestElo})`)
        console.log(`     League Stats: ${reg.stats.matchesWon}/${reg.stats.matchesPlayed} W/L`)
        console.log(`     League ELO: ${reg.stats.eloRating}`)
      }
    }
    
    console.log('\n✨ Player statistics recalculation completed!')
    console.log('   Admin panel should now show correct ELO and W/L stats.')
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await mongoose.disconnect()
    console.log('\n🔌 Disconnected from MongoDB')
    process.exit(0)
  }
}

// Run the script
recalculateAllPlayerStats()
