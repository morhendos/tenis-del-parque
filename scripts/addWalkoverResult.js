/**
 * Script to add walkover result to a specific match
 * This bypasses the admin API transaction issues
 */

const mongoose = require('mongoose')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

// Define schemas inline
const MatchSchema = new mongoose.Schema({
  league: mongoose.Schema.Types.ObjectId,
  season: mongoose.Schema.Types.Mixed,
  round: Number,
  players: {
    player1: mongoose.Schema.Types.ObjectId,
    player2: mongoose.Schema.Types.ObjectId
  },
  result: {
    winner: mongoose.Schema.Types.ObjectId,
    score: {
      sets: Array,
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

const PlayerSchema = new mongoose.Schema({
  name: String,
  email: String,
  eloRating: Number,
  registrations: [{
    league: mongoose.Schema.Types.ObjectId,
    season: mongoose.Schema.Types.Mixed,
    level: String,
    stats: {
      matchesPlayed: Number,
      matchesWon: Number,
      setsWon: Number,
      setsLost: Number
    }
  }]
}, { timestamps: true })

// Create models
const Match = mongoose.models.Match || mongoose.model('Match', MatchSchema)
const Player = mongoose.models.Player || mongoose.model('Player', PlayerSchema)

async function addWalkoverResult() {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('✅ Connected to MongoDB')
    
    const matchId = '68724c4b7cb3773aae0dd4ed'
    const winnerId = '68c5d0f5a95ec4a58f0b668d' // Nico Baltazar
    
    console.log(`🔍 Looking for match: ${matchId}`)
    
    // Find the match
    const match = await Match.findById(matchId)
    if (!match) {
      console.log('❌ Match not found')
      return
    }
    
    console.log('✅ Found match:')
    console.log(`   League: ${match.league}`)
    console.log(`   Season: ${match.season}`)
    console.log(`   Round: ${match.round}`)
    console.log(`   Player 1: ${match.players.player1}`)
    console.log(`   Player 2: ${match.players.player2}`)
    console.log(`   Current status: ${match.status}`)
    
    // Find both players
    const [player1, player2] = await Promise.all([
      Player.findById(match.players.player1),
      Player.findById(match.players.player2)
    ])
    
    if (!player1 || !player2) {
      console.log('❌ One or both players not found')
      return
    }
    
    console.log(`   Player 1: ${player1.name} (${player1.email})`)
    console.log(`   Player 2: ${player2.name} (${player2.email})`)
    
    // Verify winner is one of the players
    if (winnerId !== match.players.player1.toString() && 
        winnerId !== match.players.player2.toString()) {
      console.log('❌ Winner ID does not match either player')
      return
    }
    
    const winner = winnerId === match.players.player1.toString() ? player1 : player2
    console.log(`   Winner: ${winner.name}`)
    
    // Check if match already has a result
    if (match.result && match.result.winner) {
      console.log('⚠️  Match already has a result. Updating...')
    }
    
    // Update match with walkover result
    match.result = {
      winner: new mongoose.Types.ObjectId(winnerId),
      score: {
        sets: [],
        walkover: true
      },
      playedAt: new Date()
    }
    
    // For walkover, no ELO changes
    match.eloChanges = {
      player1: {
        before: player1.eloRating || 1200,
        after: player1.eloRating || 1200,
        change: 0
      },
      player2: {
        before: player2.eloRating || 1200,
        after: player2.eloRating || 1200,
        change: 0
      }
    }
    
    match.status = 'completed'
    
    // Update player stats (simple version)
    const player1Won = winnerId === match.players.player1.toString()
    
    // Find the correct registrations for both players
    const player1Reg = player1.registrations.find(reg => 
      reg.league.toString() === match.league.toString() && 
      reg.season.toString() === match.season.toString()
    )
    
    const player2Reg = player2.registrations.find(reg => 
      reg.league.toString() === match.league.toString() && 
      reg.season.toString() === match.season.toString()
    )
    
    if (player1Reg) {
      player1Reg.stats = player1Reg.stats || {}
      player1Reg.stats.matchesPlayed = (player1Reg.stats.matchesPlayed || 0) + 1
      if (player1Won) {
        player1Reg.stats.matchesWon = (player1Reg.stats.matchesWon || 0) + 1
        player1Reg.stats.setsWon = (player1Reg.stats.setsWon || 0) + 2 // Walkover = 2-0
      } else {
        player1Reg.stats.setsLost = (player1Reg.stats.setsLost || 0) + 2
      }
    }
    
    if (player2Reg) {
      player2Reg.stats = player2Reg.stats || {}
      player2Reg.stats.matchesPlayed = (player2Reg.stats.matchesPlayed || 0) + 1
      if (!player1Won) {
        player2Reg.stats.matchesWon = (player2Reg.stats.matchesWon || 0) + 1
        player2Reg.stats.setsWon = (player2Reg.stats.setsWon || 0) + 2 // Walkover = 2-0
      } else {
        player2Reg.stats.setsLost = (player2Reg.stats.setsLost || 0) + 2
      }
    }
    
    // Save all changes
    await match.save()
    await player1.save()
    await player2.save()
    
    console.log('\n🎉 Successfully added walkover result!')
    console.log(`   Winner: ${winner.name}`)
    console.log(`   Score: Walkover (2-0)`)
    console.log(`   Status: ${match.status}`)
    
    if (player1Reg && player2Reg) {
      console.log('\n📊 Updated player stats:')
      console.log(`   ${player1.name}: ${player1Reg.stats.matchesPlayed} matches, ${player1Reg.stats.matchesWon} wins`)
      console.log(`   ${player2.name}: ${player2Reg.stats.matchesPlayed} matches, ${player2Reg.stats.matchesWon} wins`)
    }
    
  } catch (error) {
    console.error('❌ Error adding walkover result:', error)
  } finally {
    await mongoose.disconnect()
    console.log('\n🔌 Disconnected from MongoDB')
    process.exit(0)
  }
}

// Run the script
addWalkoverResult()
