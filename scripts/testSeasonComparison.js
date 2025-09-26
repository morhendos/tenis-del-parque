/**
 * Script to test season comparison logic
 */

const mongoose = require('mongoose')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

async function testSeasonComparison() {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('✅ Connected to MongoDB')
    
    // Test the season comparison that was causing issues
    const seasonObjectId = new mongoose.Types.ObjectId('688f5d51c94f8e3b3cbfd87b')
    const seasonString = '688f5d51c94f8e3b3cbfd87b'
    
    console.log('🔍 Testing season comparison:')
    console.log(`   ObjectId: ${seasonObjectId}`)
    console.log(`   String: ${seasonString}`)
    console.log(`   Direct comparison (===): ${seasonObjectId === seasonString}`)
    console.log(`   toString comparison: ${seasonObjectId.toString() === seasonString}`)
    
    // Test with actual player data
    const Player = mongoose.connection.collection('players')
    const testPlayer = await Player.findOne({
      'registrations.season': seasonObjectId
    })
    
    if (testPlayer) {
      console.log(`\n✅ Found test player: ${testPlayer.name}`)
      const registration = testPlayer.registrations.find(reg => 
        reg.season.toString() === seasonObjectId.toString()
      )
      
      if (registration) {
        console.log(`   ✅ Registration found using toString() comparison`)
        console.log(`   League: ${registration.league}`)
        console.log(`   Season: ${registration.season}`)
        console.log(`   Level: ${registration.level}`)
      } else {
        console.log(`   ❌ Registration NOT found with toString() comparison`)
      }
    } else {
      console.log('⚠️  No players found with this season')
    }
    
    console.log('\n✅ Season comparison test completed')
    
  } catch (error) {
    console.error('❌ Error testing season comparison:', error)
  } finally {
    await mongoose.disconnect()
    console.log('🔌 Disconnected from MongoDB')
    process.exit(0)
  }
}

// Run the test
testSeasonComparison()
