/**
 * Script to seed the database with Season data
 * This will create standardized seasons for the years we need
 */

import pkg from '../lib/utils/seasonUtils.js'
import mongoose from 'mongoose'

const { initializeSeasons } = pkg

// Simple connection function for the script
async function connectDB() {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/tenis-del-parque')
  }
}

async function seedSeasons() {
  console.log('🌱 Starting season seeding process...')
  
  try {
    // Connect to the database
    await connectDB()
    console.log('✅ Database connected successfully')
    
    // Initialize seasons for current and upcoming years
    const years = [2024, 2025, 2026]
    console.log(`📅 Creating seasons for years: ${years.join(', ')}`)
    
    const results = await initializeSeasons(years)
    
    // Display results
    console.log('\n📊 Seeding Results:')
    console.log('='.repeat(50))
    
    for (const result of results) {
      if (result.error) {
        console.log(`❌ Year ${result.year}: ERROR - ${result.error}`)
      } else if (result.created > 0) {
        console.log(`✅ Year ${result.year}: Created ${result.created} seasons`)
      } else {
        console.log(`ℹ️  Year ${result.year}: ${result.existing} seasons already exist`)
      }
    }
    
    console.log('\n🎉 Season seeding completed!')
    console.log('\nNext steps:')
    console.log('1. Update your leagues to reference the new Season objects')
    console.log('2. Migrate existing players and matches to use the new season system')
    console.log('3. Update your API routes to work with the new Season model')
    
  } catch (error) {
    console.error('❌ Error seeding seasons:', error)
    process.exit(1)
  } finally {
    // Close the database connection
    await mongoose.connection.close()
    console.log('\n👋 Database connection closed')
    process.exit(0)
  }
}

// Run the seeding
seedSeasons()