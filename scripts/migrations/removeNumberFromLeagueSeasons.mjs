#!/usr/bin/env node

/**
 * Script to remove the 'number' field from league season objects
 */

import mongoose from 'mongoose'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

dotenv.config({ path: join(__dirname, '..', '.env.local') })

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI not found in environment variables')
  process.exit(1)
}

const LeagueSchema = new mongoose.Schema({
  name: String,
  slug: String,
  season: mongoose.Schema.Types.Mixed,
  status: String
})

async function removeNumberFromLeagues() {
  try {
    await mongoose.connect(MONGODB_URI)
    console.log('✅ Connected to MongoDB')
    
    if (!mongoose.models.League) {
      mongoose.model('League', LeagueSchema)
    }

    const League = mongoose.model('League')

    console.log('\n🔍 Finding leagues with season.number field...')
    
    const leaguesWithNumber = await League.find({
      'season.number': { $exists: true }
    }).lean()

    console.log(`📊 Found ${leaguesWithNumber.length} leagues with season.number`)

    if (leaguesWithNumber.length === 0) {
      console.log('✅ No leagues need updating!')
      await mongoose.connection.close()
      return
    }

    console.log('\n📋 Leagues to update:')
    leaguesWithNumber.forEach(league => {
      console.log(`  ${league.name}: ${JSON.stringify(league.season)}`)
    })

    console.log('\n🔧 Removing season.number from all leagues...')
    
    const result = await League.updateMany(
      { 'season.number': { $exists: true } },
      { $unset: { 'season.number': '' } }
    )

    console.log(`✅ Updated ${result.modifiedCount} leagues`)

    // Verify the update
    const updatedLeagues = await League.find({
      _id: { $in: leaguesWithNumber.map(l => l._id) }
    }).lean()

    console.log('\n📋 Updated leagues:')
    updatedLeagues.forEach(league => {
      console.log(`  ${league.name}: ${JSON.stringify(league.season)}`)
    })

    await mongoose.connection.close()
    console.log('\n✅ Done!')

  } catch (error) {
    console.error('❌ Error:', error)
    await mongoose.connection.close()
    process.exit(1)
  }
}

removeNumberFromLeagues()

