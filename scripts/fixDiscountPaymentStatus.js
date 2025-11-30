/**
 * Fix Payment Status for Discount Code Registrations
 * 
 * This script finds all player registrations that have a discount code
 * with 100% discount but incorrect paymentStatus, and fixes them.
 * 
 * Usage: node scripts/fixDiscountPaymentStatus.js
 */

const mongoose = require('mongoose')
require('dotenv').config({ path: '.env.local' })

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI not found in environment variables')
  process.exit(1)
}

// Define Player schema inline (simplified)
const PlayerSchema = new mongoose.Schema({
  name: String,
  email: String,
  registrations: [{
    league: mongoose.Schema.Types.ObjectId,
    level: String,
    status: String,
    discountCode: String,
    discountApplied: Number,
    originalPrice: Number,
    finalPrice: Number,
    paymentStatus: String
  }]
}, { strict: false })

async function fixDiscountPaymentStatus() {
  try {
    console.log('🔌 Connecting to MongoDB...')
    await mongoose.connect(MONGODB_URI)
    console.log('✅ Connected to MongoDB')

    const Player = mongoose.models.Player || mongoose.model('Player', PlayerSchema)

    // Find all players with registrations that have discount codes
    const players = await Player.find({
      'registrations.discountCode': { $exists: true, $ne: null }
    })

    console.log(`\n📋 Found ${players.length} players with discount codes\n`)

    let fixedCount = 0
    let alreadyCorrectCount = 0

    for (const player of players) {
      let playerModified = false

      for (const registration of player.registrations) {
        if (registration.discountCode) {
          const needsFix = (
            registration.discountApplied === 100 || 
            registration.finalPrice === 0
          ) && registration.paymentStatus !== 'waived'

          console.log(`Player: ${player.name} (${player.email})`)
          console.log(`  Discount Code: ${registration.discountCode}`)
          console.log(`  Discount Applied: ${registration.discountApplied}%`)
          console.log(`  Original Price: €${registration.originalPrice}`)
          console.log(`  Final Price: €${registration.finalPrice}`)
          console.log(`  Payment Status: ${registration.paymentStatus}`)

          if (needsFix) {
            console.log(`  ⚠️  NEEDS FIX - Setting paymentStatus to 'waived'`)
            registration.paymentStatus = 'waived'
            playerModified = true
            fixedCount++
          } else if (registration.paymentStatus === 'waived') {
            console.log(`  ✅ Already correct`)
            alreadyCorrectCount++
          } else {
            console.log(`  ℹ️  Partial discount - no fix needed (owes €${registration.finalPrice})`)
          }
          console.log('')
        }
      }

      if (playerModified) {
        await player.save()
        console.log(`💾 Saved changes for ${player.email}\n`)
      }
    }

    console.log('=' .repeat(50))
    console.log('📊 SUMMARY')
    console.log('=' .repeat(50))
    console.log(`Total players with discount codes: ${players.length}`)
    console.log(`Already correct: ${alreadyCorrectCount}`)
    console.log(`Fixed: ${fixedCount}`)
    console.log('=' .repeat(50))

    if (fixedCount > 0) {
      console.log('\n✅ Payment status fixed successfully!')
    } else {
      console.log('\n✅ No fixes needed - all payment statuses are correct!')
    }

  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  } finally {
    await mongoose.disconnect()
    console.log('\n🔌 Disconnected from MongoDB')
  }
}

// Run the script
fixDiscountPaymentStatus()
