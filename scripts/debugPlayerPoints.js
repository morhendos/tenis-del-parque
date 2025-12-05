/**
 * DEBUG SCRIPT - Show actual match data and points calculation
 * 
 * Usage: node scripts/debugPlayerPoints.js [player-id]
 */

const mongoose = require('mongoose')
require('dotenv').config({ path: '.env.local' })

const playerId = process.argv[2] || '68c5d0fca95ec4a58f0b66e7' // Raul by default

const MONGODB_URI = process.env.MONGODB_URI

const MatchSchema = new mongoose.Schema({
  league: { type: mongoose.Schema.Types.ObjectId, ref: 'League' },
  round: Number,
  players: {
    player1: { type: mongoose.Schema.Types.ObjectId, ref: 'Player' },
    player2: { type: mongoose.Schema.Types.ObjectId, ref: 'Player' }
  },
  result: {
    winner: { type: mongoose.Schema.Types.ObjectId, ref: 'Player' },
    score: {
      sets: [{ player1: Number, player2: Number }],
      walkover: Boolean
    },
    playedAt: Date
  },
  status: String
}, { timestamps: true })

const PlayerSchema = new mongoose.Schema({
  name: String,
  registrations: [{
    league: { type: mongoose.Schema.Types.ObjectId },
    stats: {
      matchesPlayed: Number,
      matchesWon: Number,
      totalPoints: Number
    }
  }]
})

const Match = mongoose.models.Match || mongoose.model('Match', MatchSchema)
const Player = mongoose.models.Player || mongoose.model('Player', PlayerSchema)

async function debug() {
  await mongoose.connect(MONGODB_URI)
  
  const player = await Player.findById(playerId)
  console.log(`\n🎾 DEBUG: ${player.name}`)
  console.log('=' .repeat(60))
  
  // Show current DB stats
  const reg = player.registrations[0]
  console.log(`\n📊 CURRENT DB STATS:`)
  console.log(`   Matches: ${reg?.stats?.matchesPlayed || 0}`)
  console.log(`   Wins: ${reg?.stats?.matchesWon || 0}`)
  console.log(`   Points: ${reg?.stats?.totalPoints || 0}`)
  
  // Get all matches
  const matches = await Match.find({
    $or: [
      { 'players.player1': playerId },
      { 'players.player2': playerId }
    ],
    status: 'completed'
  }).sort({ 'result.playedAt': 1 }).lean()
  
  console.log(`\n📋 ACTUAL MATCHES (${matches.length}):`)
  console.log('-'.repeat(60))
  
  let totalPoints = 0
  
  matches.forEach((match, i) => {
    const isPlayer1 = match.players.player1.toString() === playerId
    const won = match.result.winner.toString() === playerId
    
    let playerSets = 0
    let opponentSets = 0
    let scoreDisplay = ''
    
    if (match.result.score?.walkover) {
      scoreDisplay = 'WALKOVER'
      playerSets = won ? 2 : 0
      opponentSets = won ? 0 : 2
    } else if (match.result.score?.sets) {
      match.result.score.sets.forEach(set => {
        if (isPlayer1) {
          scoreDisplay += `${set.player1}-${set.player2} `
          if (set.player1 > set.player2) playerSets++
          else opponentSets++
        } else {
          scoreDisplay += `${set.player2}-${set.player1} `
          if (set.player2 > set.player1) playerSets++
          else opponentSets++
        }
      })
    }
    
    // Calculate points
    let points = 0
    if (playerSets === 2 && opponentSets === 0) points = 3
    else if (playerSets === 2 && opponentSets === 1) points = 2
    else if (playerSets === 1 && opponentSets === 2) points = 1
    else if (playerSets === 0 && opponentSets === 2) points = 0
    
    totalPoints += points
    
    console.log(`   Match ${i + 1}: ${won ? 'WON' : 'LOST'} | Score: ${scoreDisplay.trim()} | Sets: ${playerSets}-${opponentSets} | Points: ${points}`)
  })
  
  console.log('-'.repeat(60))
  console.log(`\n✅ CALCULATED TOTAL POINTS: ${totalPoints}`)
  console.log(`📊 DB POINTS: ${reg?.stats?.totalPoints || 0}`)
  console.log(`\n   Difference: ${totalPoints - (reg?.stats?.totalPoints || 0)}`)
  
  await mongoose.disconnect()
}

debug().catch(console.error)
