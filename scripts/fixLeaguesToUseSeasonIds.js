/**
 * Script to fix leagues to use proper Season ObjectIds instead of nested season objects
 * This is the correct approach - matches are already using Season ObjectIds properly
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

async function fixLeaguesToUseSeasonIds() {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('✅ Connected to MongoDB')
    
    // Find all leagues with nested season objects instead of ObjectIds
    const problematicLeagues = await League.find({
      'season.type': { $exists: true },
      'season.year': { $exists: true }
    })
    
    console.log(`🔍 Found ${problematicLeagues.length} leagues with nested season objects`)
    
    if (problematicLeagues.length === 0) {
      console.log('✅ All leagues already use Season ObjectIds')
      return
    }
    
    let fixed = 0
    let errors = 0
    
    for (const league of problematicLeagues) {
      try {
        console.log(`\n🔧 Fixing league: ${league.name} (${league.slug})`)
        console.log(`   Current season: ${JSON.stringify(league.season)}`)
        
        // Find the matching Season document
        const seasonDoc = await Season.findOne({
          year: league.season.year,
          type: league.season.type
        })
        
        if (seasonDoc) {
          // Update league to use Season ObjectId
          await League.findByIdAndUpdate(
            league._id,
            { season: seasonDoc._id }
          )
          
          console.log(`   ✅ Updated to use Season ObjectId: ${seasonDoc._id}`)
          console.log(`   📋 Season: ${seasonDoc.names?.en} (${seasonDoc.type} ${seasonDoc.year})`)
          fixed++
        } else {
          console.log(`   ❌ No Season document found for ${league.season.type} ${league.season.year}`)
          errors++
        }
        
      } catch (error) {
        console.error(`   ❌ Error fixing league ${league.name}:`, error.message)
        errors++
      }
    }
    
    console.log(`\n📈 Fix Summary:`)
    console.log(`   ✅ Successfully fixed: ${fixed} leagues`)
    console.log(`   ❌ Errors: ${errors} leagues`)
    
    if (fixed > 0) {
      console.log(`\n🔄 Verifying fixes...`)
      const stillProblematic = await League.find({
        'season.type': { $exists: true },
        'season.year': { $exists: true }
      })
      
      if (stillProblematic.length === 0) {
        console.log('🎉 All leagues now use Season ObjectIds!')
        console.log('✅ Matches should now connect properly to leagues')
      } else {
        console.log(`⚠️  Still ${stillProblematic.length} leagues with nested season objects`)
      }
    }
    
    // Show final league season formats
    console.log(`\n📊 Final league season formats:`)
    const allLeagues = await League.find({}).select('name slug season')
    
    for (const league of allLeagues) {
      if (mongoose.Types.ObjectId.isValid(league.season)) {
        const seasonDoc = await Season.findById(league.season)
        console.log(`   ${league.slug}: ObjectId -> ${seasonDoc?.type} ${seasonDoc?.year}`)
      } else {
        console.log(`   ${league.slug}: ${JSON.stringify(league.season)}`)
      }
    }
    
  } catch (error) {
    console.error('❌ Error fixing leagues:', error)
  } finally {
    await mongoose.disconnect()
    console.log('\n🔌 Disconnected from MongoDB')
    process.exit(0)
  }
}

// Run the script
fixLeaguesToUseSeasonIds()
