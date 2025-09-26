/**
 * Script to check what Season ObjectId the matches are using
 * and fix the league to use the same Season ObjectId
 */

const mongoose = require('mongoose')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

// Define Season schema inline
const SeasonSchema = new mongoose.Schema({
  year: Number,
  type: String,
  slugs: {
    en: String,
    es: String
  },
  names: {
    en: String,
    es: String
  },
  status: String
}, { timestamps: true })

// Define League schema inline
const LeagueSchema = new mongoose.Schema({
  name: String,
  slug: String,
  season: mongoose.Schema.Types.Mixed // Can be ObjectId or object
}, { timestamps: true })

// Create models
const Season = mongoose.models.Season || mongoose.model('Season', SeasonSchema)
const League = mongoose.models.League || mongoose.model('League', LeagueSchema)

async function checkSeasonData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('✅ Connected to MongoDB')
    
    // Find the Season ObjectId that matches are using
    const matchSeasonId = '688f5d51c94f8e3b3cbfd87b'
    console.log(`🔍 Looking up Season: ${matchSeasonId}`)
    
    const season = await Season.findById(matchSeasonId)
    if (season) {
      console.log('📋 Season found:')
      console.log(`   Year: ${season.year}`)
      console.log(`   Type: ${season.type}`)
      console.log(`   English name: ${season.names?.en}`)
      console.log(`   Spanish name: ${season.names?.es}`)
      console.log(`   English slug: ${season.slugs?.en}`)
      console.log(`   Spanish slug: ${season.slugs?.es}`)
      console.log(`   Status: ${season.status}`)
    } else {
      console.log('❌ Season not found in database')
    }
    
    // Check all seasons
    console.log('\n📊 All seasons in database:')
    const allSeasons = await Season.find({}).sort({ year: -1, type: 1 })
    allSeasons.forEach(s => {
      console.log(`   ${s._id}: ${s.type} ${s.year} (${s.names?.en || 'No name'})`)
    })
    
    // Check current league season
    const sotograndeLeague = await League.findOne({ slug: 'liga-de-sotogrande' })
    console.log('\n🏆 Liga de Sotogrande current season:')
    console.log(`   Season: ${JSON.stringify(sotograndeLeague.season)}`)
    
    // The fix: Update league to use the correct Season ObjectId
    if (season && sotograndeLeague) {
      console.log('\n🔧 SOLUTION:')
      console.log(`   League should use Season ObjectId: ${season._id}`)
      console.log(`   Instead of current: ${JSON.stringify(sotograndeLeague.season)}`)
      console.log(`   This Season represents: ${season.type} ${season.year}`)
    }
    
  } catch (error) {
    console.error('❌ Error checking season data:', error)
  } finally {
    await mongoose.disconnect()
    console.log('\n🔌 Disconnected from MongoDB')
    process.exit(0)
  }
}

// Run the script
checkSeasonData()
