/**
 * Move Kari from Bronze LEAGUE to Silver LEAGUE
 * The issue: level field doesn't matter - she needs to be in the Silver league document
 */

require('dotenv').config({ path: '.env.local' })
const mongoose = require('mongoose')

const MONGODB_URI = process.env.MONGODB_URI

async function moveKariToSilverLeague() {
  try {
    console.log('Connecting to MongoDB...')
    await mongoose.connect(MONGODB_URI)
    console.log('Connected!\n')

    const Player = mongoose.connection.collection('players')
    const League = mongoose.connection.collection('leagues')
    
    // Find all leagues to see what we're working with
    const leagues = await League.find({}).toArray()
    
    console.log('📋 Available Leagues:')
    leagues.forEach(league => {
      console.log(`  ${league.name}`)
      console.log(`    ID: ${league._id}`)
      console.log(`    City: ${league.city}`)
      console.log('')
    })
    
    // Find Bronze and Silver leagues
    const bronzeLeague = leagues.find(l => l.name?.toLowerCase().includes('bronze'))
    const silverLeague = leagues.find(l => l.name?.toLowerCase().includes('silver'))
    
    if (!silverLeague) {
      console.log('❌ Silver league not found!')
      return
    }
    
    console.log('🥉 Bronze League ID:', bronzeLeague?._id)
    console.log('🥈 Silver League ID:', silverLeague._id)
    
    // Find Kari
    const kari = await Player.findOne({ 
      name: { $regex: /kari/i }
    })
    
    if (!kari) {
      console.log('❌ Kari not found!')
      return
    }
    
    console.log('\n📋 Kari current registration:')
    console.log('  Current league ID:', kari.registrations[0]?.league)
    console.log('  Current level:', kari.registrations[0]?.level)
    
    // Update her league to Silver
    const result = await Player.updateOne(
      { _id: kari._id },
      { 
        $set: { 
          'registrations.0.league': silverLeague._id,
          'registrations.0.level': 'intermediate'
        } 
      }
    )
    
    console.log('\n✅ Moved Kari to Silver League!')
    console.log('  Modified:', result.modifiedCount)
    
    // Verify
    const updated = await Player.findOne({ _id: kari._id })
    console.log('\n📋 Verified:')
    console.log('  New league ID:', updated.registrations[0]?.league)
    console.log('  Level:', updated.registrations[0]?.level)

  } catch (error) {
    console.error('Error:', error)
  } finally {
    await mongoose.disconnect()
    console.log('\nDisconnected from MongoDB')
  }
}

moveKariToSilverLeague()
