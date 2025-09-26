/**
 * Simple script to find Tomasz's match with Dirk
 */

const mongoose = require('mongoose')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

async function findTomaszMatch() {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('✅ Connected to MongoDB')
    
    // Find Dirk first
    const Player = mongoose.connection.collection('players')
    const dirk = await Player.findOne({ name: /Dirk.*Lennertz/i })
    
    if (!dirk) {
      console.log('❌ Dirk not found')
      return
    }
    
    console.log(`✅ Found Dirk: ${dirk.name} - ID: ${dirk._id}`)
    
    // Find matches with Dirk in round 5
    const Match = mongoose.connection.collection('matches')
    const matches = await Match.find({
      $or: [
        { 'players.player1': dirk._id },
        { 'players.player2': dirk._id }
      ],
      round: 5
    }).toArray()
    
    console.log(`📊 Found ${matches.length} matches with Dirk in round 5`)
    
    matches.forEach((match, index) => {
      console.log(`\n🎾 Match ${index + 1}:`)
      console.log(`   Round: ${match.round}`)
      console.log(`   Player 1 ID: ${match.players.player1}`)
      console.log(`   Player 2 ID: ${match.players.player2}`)
      console.log(`   Match ID: ${match._id}`)
      console.log(`   League: ${match.league}`)
      console.log(`   Season: ${match.season}`)
      
      // Identify Tomasz's ID
      const tomaszId = match.players.player1.toString() === dirk._id.toString() ? 
        match.players.player2 : match.players.player1
      
      console.log(`   🔧 Tomasz's Player ID: ${tomaszId}`)
      
      if (match.result) {
        console.log(`   Winner ID: ${match.result.winner}`)
        if (match.result.score && match.result.score.sets) {
          console.log(`   Score: ${match.result.scoreString || 'No score string'}`)
        }
      }
    })
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await mongoose.disconnect()
    console.log('\n🔌 Disconnected from MongoDB')
    process.exit(0)
  }
}

// Run the script
findTomaszMatch()
