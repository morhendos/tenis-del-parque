// Optional migration script to add playoff fields to existing data
// Run with: node scripts/migrate-playoff-fields.js

import mongoose from 'mongoose'
import dotenv from 'dotenv'
import League from '../lib/models/League.js'
import Match from '../lib/models/Match.js'

dotenv.config()

async function migrate() {
  try {
    // Connect to database
    const mongoUri = process.env.MONGODB_URI
    if (!mongoUri) {
      throw new Error('MONGODB_URI not found in environment variables')
    }
    
    await mongoose.connect(mongoUri)
    console.log('✅ Connected to MongoDB')
    
    // 1. Update existing matches to have matchType = 'regular'
    console.log('\n📊 Updating existing matches...')
    const matchUpdateResult = await Match.updateMany(
      { matchType: { $exists: false } },
      { $set: { matchType: 'regular' } }
    )
    console.log(`✅ Updated ${matchUpdateResult.modifiedCount} matches with matchType='regular'`)
    
    // 2. Initialize playoffConfig for leagues that don't have it
    console.log('\n📊 Updating existing leagues...')
    const leaguesWithoutPlayoffs = await League.find({
      playoffConfig: { $exists: false }
    })
    
    for (const league of leaguesWithoutPlayoffs) {
      league.playoffConfig = {
        enabled: true,
        numberOfGroups: 1,
        groupAPlayers: 8,
        groupBPlayers: 0,
        format: 'tournament',
        currentPhase: 'regular_season',
        qualifiedPlayers: {
          groupA: [],
          groupB: []
        },
        bracket: {
          groupA: {
            quarterfinals: [],
            semifinals: [],
            final: {},
            thirdPlace: {}
          },
          groupB: {}
        }
      }
      await league.save()
      console.log(`✅ Added playoffConfig to league: ${league.name}`)
    }
    
    console.log(`✅ Updated ${leaguesWithoutPlayoffs.length} leagues with default playoffConfig`)
    
    // 3. Display summary
    console.log('\n📈 Migration Summary:')
    const totalMatches = await Match.countDocuments()
    const totalLeagues = await League.countDocuments()
    const regularMatches = await Match.countDocuments({ matchType: 'regular' })
    const playoffMatches = await Match.countDocuments({ matchType: 'playoff' })
    const leaguesWithPlayoffs = await League.countDocuments({ 'playoffConfig.enabled': true })
    
    console.log(`- Total matches: ${totalMatches}`)
    console.log(`  - Regular: ${regularMatches}`)
    console.log(`  - Playoff: ${playoffMatches}`)
    console.log(`- Total leagues: ${totalLeagues}`)
    console.log(`  - With playoff config: ${leaguesWithPlayoffs}`)
    
    console.log('\n✅ Migration completed successfully!')
    
  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  } finally {
    await mongoose.connection.close()
    console.log('🔌 Database connection closed')
    process.exit(0)
  }
}

// Run migration
console.log('🚀 Starting playoff fields migration...')
migrate()
