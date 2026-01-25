/**
 * Move Kari Twedt from Bronze (beginner) to Silver (intermediate)
 * 
 * Run with: node scripts/moveKariToSilver.js
 */

require('dotenv').config({ path: '.env.local' })
const mongoose = require('mongoose')

const MONGODB_URI = process.env.MONGODB_URI

async function moveKariToSilver() {
  try {
    console.log('Connecting to MongoDB...')
    await mongoose.connect(MONGODB_URI)
    console.log('Connected!')

    const Player = mongoose.connection.collection('players')
    
    // Find Kari
    const kari = await Player.findOne({ 
      name: { $regex: /kari/i }
    })
    
    if (!kari) {
      console.log('❌ Kari not found!')
      return
    }
    
    console.log('\n📋 Found Kari:')
    console.log('  ID:', kari._id)
    console.log('  Name:', kari.name)
    console.log('  Email:', kari.email)
    console.log('  Registrations:')
    
    kari.registrations?.forEach((reg, i) => {
      console.log(`    [${i}] League: ${reg.league}, Level: ${reg.level}, Status: ${reg.status}`)
    })
    
    // Update her level to intermediate
    const result = await Player.updateOne(
      { _id: kari._id },
      { 
        $set: { 
          'registrations.$[].level': 'intermediate' 
        } 
      }
    )
    
    console.log('\n✅ Updated Kari to intermediate (Silver)!')
    console.log('  Modified:', result.modifiedCount)
    
    // Verify
    const updated = await Player.findOne({ _id: kari._id })
    console.log('\n📋 Verified:')
    updated.registrations?.forEach((reg, i) => {
      console.log(`    [${i}] League: ${reg.league}, Level: ${reg.level}, Status: ${reg.status}`)
    })

  } catch (error) {
    console.error('Error:', error)
  } finally {
    await mongoose.disconnect()
    console.log('\nDisconnected from MongoDB')
  }
}

moveKariToSilver()
