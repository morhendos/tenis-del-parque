/**
 * Fix Round 1 deadlines to be Sunday Jan 18, 2026 end of day (23:59:59)
 * 
 * Usage:
 *   DRY RUN (default): node scripts/fixRound1Deadlines.js
 *   EXECUTE:           node scripts/fixRound1Deadlines.js --execute
 */

const mongoose = require('mongoose')
require('dotenv').config({ path: '.env.local' })

const DRY_RUN = !process.argv.includes('--execute')

async function fixDeadlines() {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('Connected to MongoDB')
    
    if (DRY_RUN) {
      console.log('\n🔍 DRY RUN MODE - No changes will be made')
      console.log('   Run with --execute to apply changes\n')
    } else {
      console.log('\n⚠️  EXECUTE MODE - Changes will be applied!\n')
    }

    const Match = mongoose.model('Match', new mongoose.Schema({}, { strict: false }))
    const Player = mongoose.model('Player', new mongoose.Schema({}, { strict: false }))

    // Set deadline to Sunday Jan 18, 2026 23:59:59 local time
    const correctDeadline = new Date('2026-01-18T23:59:59')
    
    console.log('New deadline:', correctDeadline.toISOString())

    // Find all Round 1 matches that aren't completed
    const matches = await Match.find({
      round: 1,
      status: { $ne: 'completed' }
    })

    console.log(`\nFound ${matches.length} Round 1 unplayed matches:\n`)

    for (const match of matches) {
      // Get player names for display
      const p1 = await Player.findById(match.players?.player1)
      const p2 = await Player.findById(match.players?.player2)
      const oldDeadline = match.schedule?.deadline
      
      console.log(`${p1?.name || 'TBD'} vs ${p2?.name || 'TBD'}`)
      console.log(`  Old: ${oldDeadline || 'none'}`)
      console.log(`  New: ${correctDeadline.toISOString()}`)
      
      if (!DRY_RUN) {
        await Match.updateOne(
          { _id: match._id },
          { $set: { 'schedule.deadline': correctDeadline } }
        )
        console.log('  ✅ Updated')
      } else {
        console.log('  ⏸️  Would update (dry run)')
      }
      console.log('')
    }

    if (DRY_RUN) {
      console.log('\n🔍 DRY RUN complete. Run with --execute to apply changes.')
    } else {
      console.log('\n✅ All Round 1 deadlines updated!')
    }

  } catch (error) {
    console.error('Error:', error)
  } finally {
    await mongoose.disconnect()
    console.log('\nDisconnected from MongoDB')
  }
}

fixDeadlines()
