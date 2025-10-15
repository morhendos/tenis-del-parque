#!/usr/bin/env node

import mongoose from 'mongoose'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

dotenv.config({ path: join(__dirname, '..', '.env.local') })

async function check() {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('✅ Connected')
    
    const db = mongoose.connection.db
    
    // Check if there's a seasons collection
    const seasons = await db.collection('seasons').find({}).toArray()
    console.log('\n📊 Seasons collection:')
    seasons.forEach(s => {
      console.log(`  ID: ${s._id}, Year: ${s.year}, Type: ${s.type}`)
    })
    
    // Check what the season ObjectId in matches points to
    const seasonId = '688f5d51c94f8e3b3cbfd87b'
    const season = await db.collection('seasons').findOne({ _id: new mongoose.Types.ObjectId(seasonId) })
    console.log(`\n🎾 Season ${seasonId}:`, season)
    
    await mongoose.connection.close()
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

check()

