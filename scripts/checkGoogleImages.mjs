// scripts/checkGoogleImages.mjs
// Simple script to check if there are any Google images to fix
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load env vars
dotenv.config({ path: path.resolve(__dirname, '../.env.local') })

// Simplified Club schema just for checking
const clubSchema = new mongoose.Schema({
  name: String,
  slug: String,
  images: {
    main: String,
    gallery: [String]
  },
  googleData: {
    photos: [Object]
  }
}, { collection: 'clubs' })

const Club = mongoose.model('Club', clubSchema)

async function checkImages() {
  try {
    console.log('Google Images Check')
    console.log('=' .repeat(50))
    
    if (!process.env.MONGODB_URI) {
      console.error('❌ MONGODB_URI not found in .env.local')
      process.exit(1)
    }
    
    if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
      console.warn('⚠️ NEXT_PUBLIC_GOOGLE_MAPS_API_KEY not found')
      console.log('   Images with photo_reference cannot be downloaded')
    }
    
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('✅ Connected to MongoDB\n')
    
    // Check for clubs with Google photo references
    const clubsWithPhotoRefs = await Club.countDocuments({
      'googleData.photos': { $exists: true, $ne: [] }
    })
    
    // Check for clubs with Google URLs in images
    const clubsWithGoogleUrls = await Club.countDocuments({
      $or: [
        { 'images.main': { $regex: /googleusercontent|googleapis|ggpht|maps\.google/ } },
        { 'images.gallery': { $elemMatch: { $regex: /googleusercontent|googleapis|ggpht|maps\.google/ } } }
      ]
    })
    
    // Get total clubs
    const totalClubs = await Club.countDocuments()
    
    console.log(`📊 Database Statistics:`)
    console.log(`   Total clubs: ${totalClubs}`)
    console.log(`   Clubs with Google photo references: ${clubsWithPhotoRefs}`)
    console.log(`   Clubs with Google URLs in images: ${clubsWithGoogleUrls}`)
    console.log(`   Total clubs needing fix: ${Math.max(clubsWithPhotoRefs, clubsWithGoogleUrls)}`)
    
    // Show example of each type
    console.log('\n📋 Examples:')
    
    const exampleWithRefs = await Club.findOne({
      'googleData.photos': { $exists: true, $ne: [] }
    })
    
    if (exampleWithRefs) {
      console.log('\n1. Club with Google photo references:')
      console.log(`   Name: ${exampleWithRefs.name}`)
      console.log(`   Photo references: ${exampleWithRefs.googleData.photos.length}`)
    }
    
    const exampleWithUrls = await Club.findOne({
      $or: [
        { 'images.main': { $regex: /googleusercontent|googleapis|ggpht/ } },
        { 'images.gallery': { $elemMatch: { $regex: /googleusercontent|googleapis|ggpht/ } } }
      ]
    })
    
    if (exampleWithUrls) {
      console.log('\n2. Club with Google URLs:')
      console.log(`   Name: ${exampleWithUrls.name}`)
      console.log(`   Main image: ${exampleWithUrls.images?.main?.substring(0, 50)}...`)
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await mongoose.disconnect()
    console.log('\n✅ Done')
  }
}

checkImages()
