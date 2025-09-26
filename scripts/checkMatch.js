/**
 * Script to check the match that's causing issues
 */

const mongoose = require('mongoose')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

async function checkMatch() {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('✅ Connected to MongoDB')
    
    const matchId = '6890e800fde4dc32f695f600'
    const winnerId = '68c5d0f7a95ec4a58f0b66ab' // Dirk Lennertz
    
    console.log(`🔍 Checking match: ${matchId}`)
    console.log(`   Winner should be: ${winnerId}`)
    
    // Find the match
    const Match = mongoose.connection.collection('matches')
    const match = await Match.findOne({ _id: new mongoose.Types.ObjectId(matchId) })
    
    if (!match) {
      console.log('❌ Match not found')
      return
    }
    
    console.log('✅ Match found:')
    console.log(`   League: ${match.league}`)
    console.log(`   Season: ${match.season}`)
    console.log(`   Round: ${match.round}`)
    console.log(`   Player 1: ${match.players.player1}`)
    console.log(`   Player 2: ${match.players.player2}`)
    console.log(`   Status: ${match.status}`)
    
    // Find the players
    const Player = mongoose.connection.collection('players')
    const [player1, player2] = await Promise.all([
      Player.findOne({ _id: match.players.player1 }),
      Player.findOne({ _id: match.players.player2 })
    ])
    
    if (player1) {
      console.log(`   Player 1: ${player1.name} (${player1.email})`)
    } else {
      console.log(`   Player 1: NOT FOUND`)
    }
    
    if (player2) {
      console.log(`   Player 2: ${player2.name} (${player2.email})`)
    } else {
      console.log(`   Player 2: NOT FOUND`)
    }
    
    // Check if winner ID matches one of the players
    const winnerIsPlayer1 = winnerId === match.players.player1.toString()
    const winnerIsPlayer2 = winnerId === match.players.player2.toString()
    
    console.log(`\n🏆 Winner validation:`)
    console.log(`   Winner ID: ${winnerId}`)
    console.log(`   Is Player 1: ${winnerIsPlayer1}`)
    console.log(`   Is Player 2: ${winnerIsPlayer2}`)
    
    if (winnerIsPlayer1 || winnerIsPlayer2) {
      console.log('✅ Winner ID is valid')
      const winner = winnerIsPlayer1 ? player1 : player2
      console.log(`   Winner: ${winner?.name}`)
    } else {
      console.log('❌ Winner ID does not match either player!')
    }
    
    // Check if match already has a result
    if (match.result) {
      console.log(`\n⚠️  Match already has result:`)
      console.log(`   Winner: ${match.result.winner}`)
      console.log(`   Walkover: ${match.result.score?.walkover}`)
    } else {
      console.log(`\n✅ Match has no result yet`)
    }
    
  } catch (error) {
    console.error('❌ Error checking match:', error)
  } finally {
    await mongoose.disconnect()
    console.log('\n🔌 Disconnected from MongoDB')
    process.exit(0)
  }
}

// Run the script
checkMatch()
