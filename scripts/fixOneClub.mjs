// scripts/fixOneClub.mjs
// Test script to fix images for a single club
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import fs from 'fs/promises'
import crypto from 'crypto'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load env vars
dotenv.config({ path: path.resolve(__dirname, '../.env.local') })

// Define Club schema inline to avoid ES module import issues
const clubSchema = new mongoose.Schema({
  name: String,
  slug: String,
  images: {
    main: String,
    gallery: [String]
  },
  googleData: {
    photos: [Object],
    imagesFixed: Boolean,
    imagesFixedAt: Date
  }
}, { collection: 'clubs' })

const Club = mongoose.model('Club', clubSchema)

// Simple image download function for testing
async function downloadImage(imageUrl, clubSlug) {
  try {
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'clubs')
    await fs.mkdir(uploadDir, { recursive: true })
    
    console.log(`  Downloading from: ${imageUrl.substring(0, 100)}...`)
    
    const response = await fetch(imageUrl)
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    const buffer = Buffer.from(await response.arrayBuffer())
    const timestamp = Date.now()
    const randomString = crypto.randomBytes(6).toString('hex')
    const filename = `${clubSlug}-${timestamp}-${randomString}.jpg`
    const filepath = path.join(uploadDir, filename)
    
    await fs.writeFile(filepath, buffer)
    
    const publicUrl = `/uploads/clubs/${filename}`
    console.log(`  ✅ Saved to: ${publicUrl}`)
    
    return publicUrl
  } catch (error) {
    console.error(`  ❌ Download failed:`, error.message)
    return null
  }
}

// Download from Google photo reference
async function downloadGooglePhoto(photoRef, clubSlug) {
  if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
    console.error('  ❌ No Google API key found')
    return null
  }
  
  const url = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=1200&photo_reference=${photoRef}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
  return await downloadImage(url, clubSlug)
}

async function fixOneClub() {
  try {
    console.log('Fix One Club Test')
    console.log('=' .repeat(50))
    
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('✅ Connected to MongoDB\n')
    
    // Find ONE club with Google images to test
    const club = await Club.findOne({
      $or: [
        { 'googleData.photos': { $exists: true, $ne: [] } },
        { 'images.main': { $regex: /googleusercontent|googleapis|ggpht/ } }
      ]
    })
    
    if (!club) {
      console.log('❌ No clubs with Google images found')
      process.exit(0)
    }
    
    console.log(`Found club: ${club.name}`)
    console.log(`Slug: ${club.slug}`)
    console.log(`Google photos: ${club.googleData?.photos?.length || 0}`)
    console.log(`Current main image: ${club.images?.main ? 'Yes' : 'No'}`)
    
    let newImages = {
      main: club.images?.main,
      gallery: []
    }
    
    // Try to download from Google photo references first
    if (club.googleData?.photos && club.googleData.photos.length > 0) {
      console.log('\n📷 Processing Google photo references...')
      
      // Download up to 3 images for testing
      const maxPhotos = Math.min(3, club.googleData.photos.length)
      
      for (let i = 0; i < maxPhotos; i++) {
        const photo = club.googleData.photos[i]
        if (photo.photo_reference) {
          console.log(`\nPhoto ${i + 1}/${maxPhotos}:`)
          const localUrl = await downloadGooglePhoto(photo.photo_reference, club.slug)
          
          if (localUrl) {
            newImages.gallery.push(localUrl)
            if (i === 0) newImages.main = localUrl // Use first as main
          }
        }
      }
    }
    // Or try to download from existing Google URLs
    else if (club.images?.main && club.images.main.match(/googleusercontent|googleapis|ggpht/)) {
      console.log('\n📷 Downloading from existing Google URL...')
      const localUrl = await downloadImage(club.images.main, club.slug)
      
      if (localUrl) {
        newImages.main = localUrl
        newImages.gallery = [localUrl]
      }
    }
    
    // Update the club if we downloaded any images
    if (newImages.gallery.length > 0) {
      await Club.findByIdAndUpdate(club._id, {
        images: newImages,
        'googleData.imagesFixed': true,
        'googleData.imagesFixedAt': new Date()
      })
      
      console.log('\n✅ Club updated successfully!')
      console.log(`   Main image: ${newImages.main}`)
      console.log(`   Gallery: ${newImages.gallery.length} images`)
    } else {
      console.log('\n⚠️ No images downloaded')
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await mongoose.disconnect()
    console.log('\n✅ Done')
  }
}

fixOneClub()
