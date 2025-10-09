// scripts/testImageDownload.mjs
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import mongoose from 'mongoose'
import Club from '../lib/models/Club.js'

// Load environment variables
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
dotenv.config({ path: path.resolve(__dirname, '../.env.local') })

console.log('Testing Image Download Script')
console.log('='.repeat(50))
console.log('MongoDB URI exists:', !!process.env.MONGODB_URI)
console.log('Google API Key exists:', !!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY)

async function test() {
  try {
    // Connect to MongoDB
    console.log('\nConnecting to MongoDB...')
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('✅ Connected to MongoDB')

    // Count clubs with Google images
    const googleImageCount = await Club.countDocuments({
      $or: [
        { 'images.main': { $regex: /googleusercontent|googleapis|ggpht/ } },
        { 'images.gallery': { $elemMatch: { $regex: /googleusercontent|googleapis|ggpht/ } } },
        { 'googleData.photos': { $exists: true, $ne: [] } }
      ]
    })

    console.log(`\n📊 Found ${googleImageCount} clubs with Google images`)

    // Get first club with Google images as example
    const exampleClub = await Club.findOne({
      $or: [
        { 'googleData.photos': { $exists: true, $ne: [] } },
        { 'images.main': { $regex: /googleusercontent|googleapis|ggpht/ } }
      ]
    })

    if (exampleClub) {
      console.log('\n📋 Example club:')
      console.log(`  Name: ${exampleClub.name}`)
      console.log(`  Slug: ${exampleClub.slug}`)
      console.log(`  Has Google photos: ${exampleClub.googleData?.photos?.length || 0}`)
      console.log(`  Current main image: ${exampleClub.images?.main ? 'Yes' : 'No'}`)
      
      if (exampleClub.images?.main) {
        console.log(`  Main image is Google URL: ${exampleClub.images.main.match(/googleusercontent|googleapis|ggpht/) ? 'Yes' : 'No'}`)
      }
    }

  } catch (error) {
    console.error('\n❌ Error:', error.message)
  } finally {
    await mongoose.disconnect()
    console.log('\n✅ Disconnected from MongoDB')
  }
}

test().catch(console.error)
