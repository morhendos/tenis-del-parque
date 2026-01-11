/**
 * Quick script to normalize a player's name to Title Case
 * 
 * Usage: node scripts/normalizePlayerName.js
 */

const mongoose = require('mongoose')
require('dotenv').config({ path: '.env.local' })

const MONGODB_URI = process.env.MONGODB_URI

// Title case function
function toTitleCase(str) {
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

async function main() {
  try {
    console.log('🔌 Connecting to MongoDB...')
    await mongoose.connect(MONGODB_URI)
    console.log('✅ Connected\n')

    // Find the player
    const player = await mongoose.connection.db.collection('players').findOne({
      name: 'FERNANDO SEGURA'
    })

    if (!player) {
      console.log('❌ Player not found')
      return
    }

    const newName = toTitleCase(player.name)
    console.log(`Found: ${player.name}`)
    console.log(`New name: ${newName}`)

    // Update the name
    await mongoose.connection.db.collection('players').updateOne(
      { _id: player._id },
      { $set: { name: newName } }
    )

    console.log(`\n✅ Updated "${player.name}" → "${newName}"`)

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await mongoose.disconnect()
    console.log('\n🔌 Disconnected')
  }
}

main()
