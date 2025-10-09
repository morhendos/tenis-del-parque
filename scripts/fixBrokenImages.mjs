// scripts/fixBrokenImages.mjs
import mongoose from 'mongoose'
import path from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import dotenv from 'dotenv'
import Club from '../lib/models/Club.js'
import imageStorage from '../lib/services/imageStorage.js'

// Load environment variables
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
dotenv.config({ path: path.resolve(__dirname, '../.env.local') })

async function runFix() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('Connected to MongoDB')

    // Find clubs with Google images or photo references
    const clubs = await Club.find({
      $or: [
        { 'images.main': { $regex: /googleusercontent|googleapis|ggpht/ } },
        { 'images.gallery': { $elemMatch: { $regex: /googleusercontent|googleapis|ggpht/ } } },
        { 'googleData.photos': { $exists: true, $ne: [] } }
      ]
    })

    console.log(`Found ${clubs.length} clubs with Google images to fix`)

    let fixed = 0
    let failed = 0
    let totalImagesDownloaded = 0

    for (const club of clubs) {
      try {
        console.log(`\nProcessing: ${club.name}`)
        
        let imagesUpdated = false
        const newImages = {
          main: club.images?.main,
          gallery: club.images?.gallery || []
        }

        // Check if we have Google photo references
        if (club.googleData?.photos && club.googleData.photos.length > 0) {
          console.log(`  Found ${club.googleData.photos.length} Google photo references`)
          
          // Download images from photo references
          const downloadedUrls = await imageStorage.processGooglePhotos(
            club.googleData.photos,
            process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
            club.slug,
            10
          )

          if (downloadedUrls.length > 0) {
            newImages.main = downloadedUrls[0]
            newImages.gallery = downloadedUrls
            imagesUpdated = true
            totalImagesDownloaded += downloadedUrls.length
            console.log(`  ✅ Downloaded ${downloadedUrls.length} images`)
          }
        } 
        // Try to download from existing URLs if they're Google URLs
        else if (club.images?.main && club.images.main.match(/googleusercontent|googleapis|ggpht/)) {
          console.log('  Attempting to download from existing URL')
          
          const newMainImage = await imageStorage.downloadAndSaveImage(
            club.images.main,
            club.slug,
            'main'
          )
          
          if (newMainImage) {
            newImages.main = newMainImage
            imagesUpdated = true
            totalImagesDownloaded++
            console.log('  ✅ Downloaded main image')
          }

          // Process gallery images
          if (club.images.gallery && club.images.gallery.length > 0) {
            const newGallery = []
            for (const imgUrl of club.images.gallery) {
              if (imgUrl.match(/googleusercontent|googleapis|ggpht/)) {
                const newUrl = await imageStorage.downloadAndSaveImage(
                  imgUrl,
                  club.slug,
                  'gallery'
                )
                if (newUrl) {
                  newGallery.push(newUrl)
                  totalImagesDownloaded++
                }
              } else {
                newGallery.push(imgUrl) // Keep non-Google URLs
              }
            }
            if (newGallery.length > 0) {
              newImages.gallery = newGallery
              imagesUpdated = true
              console.log(`  ✅ Downloaded ${newGallery.length} gallery images`)
            }
          }
        }

        // Update club if images were processed
        if (imagesUpdated) {
          await Club.findByIdAndUpdate(club._id, {
            images: newImages,
            'googleData.imagesFixed': true,
            'googleData.imagesFixedAt': new Date()
          })
          fixed++
          console.log(`  ✅ Club images updated successfully`)
        } else {
          console.log('  ⚠️ No images to fix')
        }

      } catch (error) {
        console.error(`  ❌ Error fixing club ${club.name}:`, error.message)
        failed++
      }
    }

    console.log('\n' + '='.repeat(50))
    console.log(`✅ Fixed: ${fixed} clubs`)
    console.log(`❌ Failed: ${failed} clubs`)
    console.log(`📷 Total images downloaded: ${totalImagesDownloaded}`)
    console.log('='.repeat(50))

  } catch (error) {
    console.error('Fatal error:', error)
  } finally {
    await mongoose.disconnect()
    console.log('Disconnected from MongoDB')
    process.exit(0)
  }
}

// Run the script
runFix().catch(console.error)
