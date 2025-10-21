#!/usr/bin/env node

const mongoose = require('mongoose')
const League = require('../lib/models/League')
const dotenv = require('dotenv')

// Load environment variables
dotenv.config({ path: '.env.local' })
dotenv.config()

async function checkLeagueSkillLevels() {
  try {
    // Connect to MongoDB
    const MONGODB_URI = process.env.MONGODB_URI
    if (!MONGODB_URI) {
      throw new Error('Please define the MONGODB_URI environment variable')
    }
    
    await mongoose.connect(MONGODB_URI)
    console.log('✅ Connected to MongoDB')
    
    // Fetch all leagues
    const leagues = await League.find({})
      .select('name slug skillLevel status season')
      .sort({ createdAt: -1 })
    
    console.log(`\n📊 Found ${leagues.length} leagues:\n`)
    console.log('='.repeat(80))
    
    // Group by skill level
    const skillLevelGroups = {}
    
    leagues.forEach(league => {
      const level = league.skillLevel || 'undefined'
      if (!skillLevelGroups[level]) {
        skillLevelGroups[level] = []
      }
      skillLevelGroups[level].push(league)
    })
    
    // Display grouped results
    Object.keys(skillLevelGroups).forEach(level => {
      console.log(`\n🎯 Skill Level: ${level.toUpperCase()} (${skillLevelGroups[level].length} leagues)`)
      console.log('-'.repeat(80))
      
      skillLevelGroups[level].forEach(league => {
        const seasonInfo = league.season ? 
          `${league.season.type} ${league.season.year}` : 
          'No season'
        console.log(`  • ${league.name}`)
        console.log(`    Slug: ${league.slug}`)
        console.log(`    Status: ${league.status}`)
        console.log(`    Season: ${seasonInfo}`)
        console.log()
      })
    })
    
    // Summary statistics
    console.log('='.repeat(80))
    console.log('\n📈 Summary:')
    console.log(`  Total leagues: ${leagues.length}`)
    Object.keys(skillLevelGroups).forEach(level => {
      const percentage = ((skillLevelGroups[level].length / leagues.length) * 100).toFixed(1)
      console.log(`  ${level}: ${skillLevelGroups[level].length} (${percentage}%)`)
    })
    
    // Check for issues
    const leaguesWithoutSkillLevel = leagues.filter(l => !l.skillLevel)
    if (leaguesWithoutSkillLevel.length > 0) {
      console.log('\n⚠️  Warning: The following leagues have no skillLevel set:')
      leaguesWithoutSkillLevel.forEach(league => {
        console.log(`  - ${league.name} (${league.slug})`)
      })
      console.log('\n💡 Tip: Update these leagues with appropriate skillLevel values:')
      console.log('  - "all" for open/general leagues')
      console.log('  - "beginner" for beginner leagues')
      console.log('  - "intermediate" for intermediate leagues')
      console.log('  - "advanced" for advanced leagues')
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await mongoose.connection.close()
    console.log('\n✅ Database connection closed')
  }
}

// Run the script
checkLeagueSkillLevels()
