/**
 * Auto-cancel matches that are past their deadline and not scheduled.
 * If one player has an active injury, the match is resolved as a walkover
 * for the healthy opponent (not just cancelled).
 * 
 * Usage:
 *   DRY RUN (default): node scripts/autoCancelOverdueMatches.js
 *   EXECUTE:           node scripts/autoCancelOverdueMatches.js --execute
 * 
 * This can be run manually or set up as a cron job to run daily
 */

const mongoose = require('mongoose')
require('dotenv').config({ path: '.env.local' })

const DRY_RUN = !process.argv.includes('--execute')

async function autoCancelOverdueMatches() {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('Connected to MongoDB')
    
    if (DRY_RUN) {
      console.log('\n\ud83d\udd0d DRY RUN MODE - No changes will be made')
      console.log('   Run with --execute to apply changes\n')
    } else {
      console.log('\n\u26a0\ufe0f  EXECUTE MODE - Changes will be applied!\n')
    }

    const Match = mongoose.model('Match', new mongoose.Schema({}, { strict: false }))
    const Player = mongoose.model('Player', new mongoose.Schema({}, { strict: false }))

    const now = new Date()
    console.log('Current time:', now.toISOString())

    // Find all matches that:
    // 1. Are not completed or cancelled
    // 2. Have a deadline that has passed
    // 3. Don't have a confirmed schedule
    const overdueMatches = await Match.find({
      status: { $in: ['scheduled'] },
      'schedule.deadline': { $lt: now },
      'schedule.confirmedDate': { $eq: null }
    })

    console.log(`\nFound ${overdueMatches.length} overdue unscheduled matches:\n`)

    if (overdueMatches.length === 0) {
      console.log('\u2705 No matches to cancel!')
      return
    }

    for (const match of overdueMatches) {
      const p1 = await Player.findById(match.players?.player1)
      const p2 = await Player.findById(match.players?.player2)
      
      const p1Injured = p1?.injury?.active === true
      const p2Injured = p2?.injury?.active === true
      
      const deadline = match.schedule?.deadline
      const hoursOverdue = Math.round((now - new Date(deadline)) / (1000 * 60 * 60))
      
      console.log(`Round ${match.round}: ${p1?.name || 'TBD'} vs ${p2?.name || 'TBD'}`)
      console.log(`  Deadline: ${deadline}`)
      console.log(`  Overdue by: ${hoursOverdue} hours`)
      if (p1Injured) console.log(`  \ud83e\udd15 ${p1?.name} is INJURED`)
      if (p2Injured) console.log(`  \ud83e\udd15 ${p2?.name} is INJURED`)
      
      if (!DRY_RUN) {
        if ((p1Injured && !p2Injured) || (!p1Injured && p2Injured)) {
          // One player injured \u2014 walkover for healthy player
          const winner = p1Injured ? match.players.player2 : match.players.player1
          const winnerName = p1Injured ? p2?.name : p1?.name
          const injuredName = p1Injured ? p1?.name : p2?.name
          
          await Match.updateOne(
            { _id: match._id },
            { 
              $set: { 
                status: 'completed',
                'result.winner': winner,
                'result.score': { walkover: true, sets: [] },
                'result.playedAt': new Date(),
                notes: `Auto-walkover: ${injuredName} injured, ${winnerName} wins (${new Date().toISOString()})`
              } 
            }
          )
          console.log(`  \ud83c\udfc6 WALKOVER \u2192 ${winnerName} wins (${injuredName} injured)`)
        } else {
          // Both healthy (or both injured) \u2014 just cancel
          await Match.updateOne(
            { _id: match._id },
            { 
              $set: { 
                status: 'cancelled',
                notes: `Auto-cancelled: deadline passed without scheduling (${new Date().toISOString()})`
              } 
            }
          )
          console.log('  \u274c CANCELLED')
        }
      } else {
        if ((p1Injured && !p2Injured) || (!p1Injured && p2Injured)) {
          const winnerName = p1Injured ? p2?.name : p1?.name
          console.log(`  \u23f8\ufe0f  Would WALKOVER \u2192 ${winnerName} (dry run)`)
        } else {
          console.log('  \u23f8\ufe0f  Would cancel (dry run)')
        }
      }
      console.log('')
    }

    if (DRY_RUN) {
      console.log('\n\ud83d\udd0d DRY RUN complete. Run with --execute to cancel these matches.')
    } else {
      console.log(`\n\u274c Cancelled ${overdueMatches.length} overdue matches.`)
    }

  } catch (error) {
    console.error('Error:', error)
  } finally {
    await mongoose.disconnect()
    console.log('\nDisconnected from MongoDB')
  }
}

autoCancelOverdueMatches()
