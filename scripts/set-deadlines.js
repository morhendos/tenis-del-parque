/**
 * Bulk Set Deadlines Script
 * 
 * Usage:
 *   DRY RUN:  node scripts/set-deadlines.js
 *   APPLY:    node scripts/set-deadlines.js --apply
 * 
 * Configure the settings below before running.
 */

// ============================================================
// CONFIGURATION — edit these
// ============================================================
const CONFIG = {
  leagueId: '68eea90670fb0d35850af89e',  // Silver League
  rounds: [4, 5, 6, 7, 8],                   // Rounds to update
  deadline: '2026-04-12',                  // New deadline date (Sunday)
  uncancelOverdue: true                    // Restore cancelled matches too
}
// ============================================================

require('dotenv').config({ path: '.env.local' })
const mongoose = require('mongoose')

const MONGODB_URI = process.env.MONGODB_URI
if (!MONGODB_URI) {
  console.error('ERROR: MONGODB_URI not found in .env.local')
  process.exit(1)
}

const applyChanges = process.argv.includes('--apply')

async function run() {
  console.log('\n🎾 Tenis del Parque — Bulk Set Deadlines')
  console.log('=========================================')
  console.log(applyChanges ? '⚡ MODE: APPLY (will modify database)' : '👀 MODE: DRY RUN (preview only)')
  console.log('')

  await mongoose.connect(MONGODB_URI)
  console.log('Connected to MongoDB\n')

  const db = mongoose.connection.db

  // Get league name
  const league = await db.collection('leagues').findOne(
    { _id: new mongoose.Types.ObjectId(CONFIG.leagueId) },
    { projection: { name: 1 } }
  )
  if (!league) {
    console.error('ERROR: League not found:', CONFIG.leagueId)
    process.exit(1)
  }

  console.log('League:', league.name)
  console.log('Rounds:', CONFIG.rounds.join(', '))
  console.log('New deadline:', CONFIG.deadline, '(Sunday)')
  console.log('Uncancel overdue:', CONFIG.uncancelOverdue)
  console.log('')

  const deadlineDate = new Date(CONFIG.deadline + 'T23:59:59.000Z')

  // Count completed matches (won't be touched)
  const completedCount = await db.collection('matches').countDocuments({
    league: new mongoose.Types.ObjectId(CONFIG.leagueId),
    round: { $in: CONFIG.rounds },
    status: 'completed'
  })

  // Find matches to update
  const statusFilter = CONFIG.uncancelOverdue
    ? { $in: ['scheduled', 'cancelled'] }
    : 'scheduled'

  const matches = await db.collection('matches').aggregate([
    {
      $match: {
        league: new mongoose.Types.ObjectId(CONFIG.leagueId),
        round: { $in: CONFIG.rounds },
        status: statusFilter,
        isBye: { $ne: true }
      }
    },
    {
      $lookup: {
        from: 'players',
        localField: 'players.player1',
        foreignField: '_id',
        as: 'p1Info'
      }
    },
    {
      $lookup: {
        from: 'players',
        localField: 'players.player2',
        foreignField: '_id',
        as: 'p2Info'
      }
    },
    {
      $project: {
        round: 1,
        status: 1,
        'schedule.deadline': 1,
        p1Name: { $arrayElemAt: ['$p1Info.name', 0] },
        p2Name: { $arrayElemAt: ['$p2Info.name', 0] }
      }
    },
    { $sort: { round: 1 } }
  ]).toArray()

  console.log(`✅ ${completedCount} matches already completed (untouched)`)
  console.log(`📋 ${matches.length} matches to update:\n`)

  if (matches.length === 0) {
    console.log('Nothing to do!')
    await mongoose.disconnect()
    return
  }

  // Display table
  console.log('Round | Status     | Current Deadline | Players')
  console.log('------|------------|-----------------|--------')

  let cancelledCount = 0
  for (const m of matches) {
    const currentDl = m.schedule?.deadline
      ? new Date(m.schedule.deadline).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
      : 'none'
    const statusLabel = m.status === 'cancelled' ? 'CANCELLED' : 'scheduled'
    if (m.status === 'cancelled') cancelledCount++

    console.log(
      `  ${String(m.round).padStart(2)}  | ${statusLabel.padEnd(10)} | ${currentDl.padEnd(15)} | ${m.p1Name || '?'} vs ${m.p2Name || '?'}`
    )
  }

  console.log('')
  console.log(`Summary: ${matches.length} matches will get deadline → ${CONFIG.deadline}`)
  if (cancelledCount > 0) {
    console.log(`         ${cancelledCount} cancelled matches will be restored to scheduled`)
  }

  if (!applyChanges) {
    console.log('\n👀 DRY RUN complete. To apply changes, run:')
    console.log('   node scripts/set-deadlines.js --apply\n')
    await mongoose.disconnect()
    return
  }

  // APPLY
  console.log('\n⚡ Applying changes...\n')

  let updated = 0
  let uncancelled = 0

  for (const m of matches) {
    const updateFields = {
      'schedule.deadline': deadlineDate
    }

    const pushFields = {
      'schedule.extensionHistory': {
        player: null,
        usedAt: new Date(),
        previousDeadline: m.schedule?.deadline || null,
        newDeadline: deadlineDate,
        reason: 'bulk_admin_set'
      }
    }

    if (m.status === 'cancelled' && CONFIG.uncancelOverdue) {
      updateFields.status = 'scheduled'
      uncancelled++
    }

    await db.collection('matches').updateOne(
      { _id: m._id },
      { $set: updateFields, $push: pushFields }
    )
    updated++
  }

  console.log(`✅ Done! Updated ${updated} matches`)
  if (uncancelled > 0) {
    console.log(`✅ Restored ${uncancelled} cancelled matches back to scheduled`)
  }
  console.log(`📅 All deadlines set to: ${CONFIG.deadline} (23:59 UTC)`)
  console.log('')

  await mongoose.disconnect()
}

run().catch(err => {
  console.error('ERROR:', err)
  process.exit(1)
})
