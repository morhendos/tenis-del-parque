/**
 * Script to add deadlines to existing matches that don't have them
 * Run with: node scripts/add-deadlines-to-matches.js
 * 
 * This will add a 7-day deadline from today to all scheduled matches
 * that don't have a deadline set.
 */

const mongoose = require('mongoose')
require('dotenv').config({ path: '.env.local' })

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI not found in .env.local')
  process.exit(1)
}

// Match schema (simplified for this script)
const MatchSchema = new mongoose.Schema({
  league: mongoose.Schema.Types.ObjectId,
  season: mongoose.Schema.Types.Mixed,
  round: Number,
  matchType: String,
  players: {
    player1: mongoose.Schema.Types.ObjectId,
    player2: mongoose.Schema.Types.ObjectId
  },
  schedule: {
    proposedDates: [Date],
    confirmedDate: Date,
    club: String,
    court: String,
    time: String,
    deadline: Date,
    extensionHistory: [{
      player: mongoose.Schema.Types.ObjectId,
      usedAt: Date,
      previousDeadline: Date,
      newDeadline: Date
    }]
  },
  result: {
    winner: mongoose.Schema.Types.ObjectId
  },
  status: String
}, { timestamps: true })

async function addDeadlinesToMatches() {
  try {
    console.log('🔌 Connecting to MongoDB...')
    await mongoose.connect(MONGODB_URI)
    console.log('✅ Connected to MongoDB')

    const Match = mongoose.models.Match || mongoose.model('Match', MatchSchema)

    // Find all scheduled matches without a deadline
    const matchesWithoutDeadline = await Match.find({
      status: 'scheduled',
      'result.winner': { $exists: false },
      $or: [
        { 'schedule.deadline': { $exists: false } },
        { 'schedule.deadline': null }
      ]
    })

    console.log(`\n📊 Found ${matchesWithoutDeadline.length} matches without deadlines`)

    if (matchesWithoutDeadline.length === 0) {
      console.log('✅ All scheduled matches already have deadlines!')
      await mongoose.disconnect()
      return
    }

    // Group by round for reporting
    const byRound = matchesWithoutDeadline.reduce((acc, match) => {
      acc[match.round] = (acc[match.round] || 0) + 1
      return acc
    }, {})
    
    console.log('\n📋 Matches by round:')
    Object.entries(byRound).sort((a, b) => a[0] - b[0]).forEach(([round, count]) => {
      console.log(`   Round ${round}: ${count} matches`)
    })

    // Calculate deadline: 7 days from now
    const deadline = new Date()
    deadline.setDate(deadline.getDate() + 7)
    deadline.setHours(23, 59, 59, 999) // End of day

    console.log(`\n⏰ Setting deadline to: ${deadline.toLocaleDateString()} ${deadline.toLocaleTimeString()}`)

    // Update all matches
    const result = await Match.updateMany(
      {
        status: 'scheduled',
        'result.winner': { $exists: false },
        $or: [
          { 'schedule.deadline': { $exists: false } },
          { 'schedule.deadline': null }
        ]
      },
      {
        $set: { 'schedule.deadline': deadline }
      }
    )

    console.log(`\n✅ Updated ${result.modifiedCount} matches with deadlines`)

    // Verify the update
    const verifyCount = await Match.countDocuments({
      status: 'scheduled',
      'result.winner': { $exists: false },
      'schedule.deadline': { $exists: true, $ne: null }
    })
    
    console.log(`📊 Total scheduled matches with deadlines: ${verifyCount}`)

    await mongoose.disconnect()
    console.log('\n🔌 Disconnected from MongoDB')
    console.log('✅ Done!')

  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

// Run the script
addDeadlinesToMatches()
