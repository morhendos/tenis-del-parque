/**
 * Script to fix leagues with missing or incomplete season data
 * This addresses the issue where public league pages show "undefined-undefined" in API calls
 * Sets all leagues without proper season data to Summer 2025
 */

const mongoose = require('mongoose')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

// Define League schema inline to avoid import issues
const LeagueSchema = new mongoose.Schema({
  name: String,
  slug: String,
  skillLevel: {
    type: String,
    enum: ['all', 'beginner', 'intermediate', 'advanced'],
    default: 'all'
  },
  season: {
    year: {
      type: Number,
      min: 2024,
      max: 2030
    },
    type: {
      type: String,
      enum: ['spring', 'summer', 'autumn', 'winter', 'annual']
    },
    number: {
      type: Number,
      default: 1
    }
  },
  city: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'City'
  },
  location: {
    city: String,
    region: String,
    country: String,
    timezone: String
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'coming_soon', 'registration_open', 'completed'],
    default: 'coming_soon'
  }
}, { timestamps: true })

// Create the models
const League = mongoose.models.League || mongoose.model('League', LeagueSchema)
const City = mongoose.models.City || mongoose.model('City', mongoose.Schema({
  name: {
    es: String,
    en: String
  },
  slug: String
}, { timestamps: true }))

async function fixLeagueSeasonData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('✅ Connected to MongoDB')
    
    console.log('🔍 Checking for leagues with incomplete season data...')
    
    // Find leagues with missing or incomplete season data
    const problematicLeagues = await League.find({
      $or: [
        { season: { $exists: false } },
        { 'season.type': { $exists: false } },
        { 'season.year': { $exists: false } },
        { 'season.type': null },
        { 'season.year': null },
        { 'season.type': '' },
        { 'season.year': '' }
      ]
    }).populate('city', 'slug name')
    
    console.log(`📊 Found ${problematicLeagues.length} leagues with incomplete season data`)
    
    if (problematicLeagues.length === 0) {
      console.log('✅ All leagues have complete season data!')
      return
    }
    
    console.log('\n🔧 Leagues to fix:')
    problematicLeagues.forEach((league, index) => {
      console.log(`   ${index + 1}. ${league.name} (${league.slug})`)
      console.log(`      Current season:`, league.season || 'undefined')
      console.log(`      City: ${league.city?.name?.es || league.city?.name?.en || 'Unknown'}`)
    })
    
    // Ask for confirmation (in real usage, you might want to remove this)
    console.log('\n⚠️  About to update all these leagues to Summer 2025')
    console.log('   This will set season.type = "summer" and season.year = 2025')
    
    let fixed = 0
    let errors = 0
    
    for (const league of problematicLeagues) {
      try {
        console.log(`\n🔧 Fixing league: ${league.name} (${league.slug})`)
        
        // Determine season from league slug if possible, otherwise default to summer 2025
        let seasonType = 'summer'
        let seasonYear = 2025
        
        // Try to parse season from slug
        if (league.slug) {
          const slugParts = league.slug.split('-')
          const possibleSeasons = ['spring', 'summer', 'autumn', 'winter']
          const possibleYear = slugParts.find(part => /^\d{4}$/.test(part))
          const possibleSeason = slugParts.find(part => possibleSeasons.includes(part))
          
          if (possibleYear) {
            seasonYear = parseInt(possibleYear)
            console.log(`   📅 Found year in slug: ${seasonYear}`)
          }
          if (possibleSeason) {
            seasonType = possibleSeason
            console.log(`   🌞 Found season in slug: ${seasonType}`)
          }
        }
        
        // Update the league with proper season data
        const updateResult = await League.findByIdAndUpdate(
          league._id, 
          {
            'season.type': seasonType,
            'season.year': seasonYear,
            'season.number': 1
          },
          { new: true }
        )
        
        if (updateResult) {
          console.log(`   ✅ Fixed! New season: ${seasonType} ${seasonYear}`)
          fixed++
        } else {
          console.log(`   ❌ Failed to update league`)
          errors++
        }
        
      } catch (error) {
        console.error(`   ❌ Error fixing league ${league.name}:`, error.message)
        errors++
      }
    }
    
    console.log(`\n📈 Migration Summary:`)
    console.log(`   ✅ Successfully fixed: ${fixed} leagues`)
    console.log(`   ❌ Errors: ${errors} leagues`)
    
    if (fixed > 0) {
      console.log(`\n🔄 Verifying fixes...`)
      const stillProblematic = await League.find({
        $or: [
          { season: { $exists: false } },
          { 'season.type': { $exists: false } },
          { 'season.year': { $exists: false } },
          { 'season.type': null },
          { 'season.year': null },
          { 'season.type': '' },
          { 'season.year': '' }
        ]
      })
      
      if (stillProblematic.length === 0) {
        console.log('🎉 All season data issues have been resolved!')
        console.log('✅ Public league pages should now work properly')
      } else {
        console.log(`⚠️  Still ${stillProblematic.length} leagues with issues`)
        stillProblematic.forEach(league => {
          console.log(`   - ${league.name} (${league.slug}): ${JSON.stringify(league.season)}`)
        })
      }
    }
    
    // Show final stats
    console.log(`\n📊 Final league stats:`)
    const allLeagues = await League.find({}).select('name season')
    const seasonCounts = {}
    
    allLeagues.forEach(league => {
      if (league.season && league.season.type && league.season.year) {
        const key = `${league.season.type} ${league.season.year}`
        seasonCounts[key] = (seasonCounts[key] || 0) + 1
      } else {
        seasonCounts['incomplete'] = (seasonCounts['incomplete'] || 0) + 1
      }
    })
    
    Object.entries(seasonCounts).forEach(([season, count]) => {
      console.log(`   ${season}: ${count} leagues`)
    })
    
  } catch (error) {
    console.error('❌ Error fixing league season data:', error)
    process.exit(1)
  } finally {
    await mongoose.disconnect()
    console.log('\n🔌 Disconnected from MongoDB')
    process.exit(0)
  }
}

// Run the script
fixLeagueSeasonData()
