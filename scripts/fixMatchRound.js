/**
 * Fix match rounds - change round 6 to round 4 for recently created Gold league matches
 * 
 * Usage:
 *   DRY RUN:  node scripts/fixMatchRound.js
 *   EXECUTE:  node scripts/fixMatchRound.js --execute
 */

const mongoose = require('mongoose')
require('dotenv').config({ path: '.env.local' })

const DRY_RUN = !process.argv.includes('--execute')

async function fixMatchRound() {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('Connected to MongoDB')

    if (DRY_RUN) {
      console.log('\n🔍 DRY RUN - No changes will be made')
      console.log('   Run with --execute to apply changes\n')
    }

    const Match = mongoose.model('Match', new mongoose.Schema({}, { strict: false }))
    const League = mongoose.model('League', new mongoose.Schema({}, { strict: false }))
    const Player = mongoose.model('Player', new mongoose.Schema({}, { strict: false }))

    // Find gold league(s)
    const leagues = await League.find({ name: /gold/i }).lean()
    console.log('Gold leagues found:')
    leagues.forEach(l => console.log(`  ${l._id} - ${l.name}`))

    if (leagues.length === 0) {
      // Fallback: show all leagues so user can pick
      const allLeagues = await League.find({}).select('name skillLevel').lean()
      console.log('\nNo "Gold" league found. All leagues:')
      allLeagues.forEach(l => console.log(`  ${l._id} - ${l.name} (${l.skillLevel || '?'})`))
      await mongoose.disconnect()
      return
    }

    for (const league of leagues) {
      console.log(`\n--- League: ${league.name} (${league._id}) ---`)

      // Find round 6 matches in this league (the ones to fix)
      const wrongRoundMatches = await Match.find({
        league: league._id,
        round: 6,
        matchType: 'regular'
      }).lean()

      console.log(`Found ${wrongRoundMatches.length} round 6 matches`)

      // Also check: does round 4 already have matches?
      const existingRound4 = await Match.find({
        league: league._id,
        round: 4,
        matchType: 'regular'
      }).lean()

      console.log(`Existing round 4 matches: ${existingRound4.length}`)

      if (existingRound4.length > 0) {
        console.log('⚠️  Round 4 already has matches! Listing both for review:')
        console.log('\nExisting Round 4:')
        for (const m of existingRound4) {
          const p1 = await Player.findById(m.players?.player1).select('name').lean()
          const p2 = await Player.findById(m.players?.player2).select('name').lean()
          console.log(`  ${p1?.name || '?'} vs ${p2?.name || '?'} (${m.status})`)
        }
      }

      console.log(`\nRound 6 matches to change to Round 4:`)
      for (const m of wrongRoundMatches) {
        const p1 = await Player.findById(m.players?.player1).select('name').lean()
        const p2 = await Player.findById(m.players?.player2).select('name').lean()
        console.log(`  ${p1?.name || '?'} vs ${p2?.name || '?'} (${m.status}) - created ${new Date(m.createdAt).toLocaleString()}`)
      }

      if (!DRY_RUN && wrongRoundMatches.length > 0) {
        const result = await Match.updateMany(
          { league: league._id, round: 6, matchType: 'regular' },
          { $set: { round: 4 } }
        )
        console.log(`\n✅ Updated ${result.modifiedCount} matches from round 6 → round 4`)
      }
    }

  } catch (error) {
    console.error('Error:', error)
  } finally {
    await mongoose.disconnect()
    console.log('\nDisconnected')
  }
}

fixMatchRound()
