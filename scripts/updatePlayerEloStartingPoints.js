/**
 * Script to update existing players' ELO starting points based on their level
 * This fixes players who were initialized with the old ELO values
 */

const mongoose = require('mongoose')
require('dotenv').config({ path: '.env.local' })

// Define schemas inline
const PlayerSchema = new mongoose.Schema({
  name: String,
  email: String,
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
      setsLost: { type: Number, default: 0 }
    },
    matchHistory: [mongoose.Schema.Types.Mixed],
    registeredAt: Date
  }]
}, { timestamps: true })

const MatchSchema = new mongoose.Schema({
  league: mongoose.Schema.Types.ObjectId,
  season: mongoose.Schema.Types.Mixed,
  players: {
    player1: mongoose.Schema.Types.ObjectId,
    player2: mongoose.Schema.Types.ObjectId
  },
  status: String,
  result: mongoose.Schema.Types.Mixed
}, { timestamps: true })

// Create models
const Player = mongoose.models.Player || mongoose.model('Player', PlayerSchema)
const Match = mongoose.models.Match || mongoose.model('Match', MatchSchema)

// New ELO starting points
const getInitialEloByLevel = (level) => {
  const eloRatings = {
    'beginner': 1100,
    'intermediate': 1200,
    'advanced': 1300
  }
  return eloRatings[level] || 1200
}

async function updatePlayerEloStartingPoints() {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('✅ Connected to MongoDB')
    
    // Get all players
    const players = await Player.find({})
    console.log(`📊 Found ${players.length} players to analyze`)
    
    let playersToUpdate = []
    
    // Analyze each player
    for (const player of players) {
      // Get player's primary level (from first registration)
      const primaryLevel = player.registrations?.[0]?.level || 'intermediate'
      const correctStartingElo = getInitialEloByLevel(primaryLevel)
      
      // Check if player has played any matches
      const matchCount = await Match.countDocuments({
        $or: [
          { 'players.player1': player._id },
          { 'players.player2': player._id }
        ],
        status: 'completed'
      })
      
      // Only update players who:
      // 1. Have not played any matches (so their ELO is still at starting point)
      // 2. Have the old starting ELO values (1180, 1250) or default 1200 but should have different
      const shouldUpdate = matchCount === 0 && (
        (primaryLevel === 'beginner' && player.eloRating !== 1100) ||
        (primaryLevel === 'advanced' && player.eloRating !== 1300) ||
        (primaryLevel === 'intermediate' && player.eloRating !== 1200)
      )
      
      if (shouldUpdate) {
        playersToUpdate.push({
          player,
          currentElo: player.eloRating,
          correctElo: correctStartingElo,
          level: primaryLevel,
          matchCount
        })
      }
    }
    
    console.log(`\n🔄 Found ${playersToUpdate.length} players that need ELO updates:`)
    
    if (playersToUpdate.length === 0) {
      console.log('   ✅ All players already have correct starting ELO values!')
      return
    }
    
    // Show what will be updated
    playersToUpdate.forEach(({ player, currentElo, correctElo, level, matchCount }) => {
      console.log(`   ${player.name} (${level}): ${currentElo} → ${correctElo} (${matchCount} matches played)`)
    })
    
    // Ask for confirmation (in a real script, you might want to add a prompt)
    console.log(`\n❓ This will update ${playersToUpdate.length} players. Proceeding...`)
    
    let updated = 0
    
    // Update each player
    for (const { player, correctElo } of playersToUpdate) {
      try {
        await Player.findByIdAndUpdate(player._id, {
          eloRating: correctElo,
          highestElo: correctElo,
          lowestElo: correctElo
        })
        updated++
        
        if (updated % 5 === 0) {
          console.log(`   ✅ Updated ${updated} players...`)
        }
      } catch (error) {
        console.error(`   ❌ Error updating ${player.name}:`, error.message)
      }
    }
    
    console.log(`\n📊 Update Summary:`)
    console.log(`   ✅ Successfully updated: ${updated} players`)
    console.log(`   ❌ Errors: ${playersToUpdate.length - updated} players`)
    
    // Verify the updates
    console.log(`\n🔍 Verification:`)
    const verificationSample = await Player.find({}).limit(5).lean()
    
    verificationSample.forEach(player => {
      const level = player.registrations?.[0]?.level || 'intermediate'
      const expectedElo = getInitialEloByLevel(level)
      const isCorrect = player.eloRating === expectedElo
      
      console.log(`   ${player.name} (${level}): ELO ${player.eloRating} ${isCorrect ? '✅' : '❌'}`)
    })
    
    console.log('\n✨ ELO starting points update completed!')
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await mongoose.disconnect()
    console.log('\n🔌 Disconnected from MongoDB')
    process.exit(0)
  }
}

// Run the script
updatePlayerEloStartingPoints()
