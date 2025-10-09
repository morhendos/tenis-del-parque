// lib/services/imageStorage.js
import fs from 'fs/promises'
import path from 'path'
import crypto from 'crypto'

/**
 * Downloads and stores images from Google Places API
 * Note: We'll use native fetch and fs for now, add sharp later for optimization
 */
class ImageStorageService {
  constructor() {
    // For local storage - create these directories
    this.baseDir = path.join(process.cwd(), 'public', 'uploads', 'clubs')
    this.publicPath = '/uploads/clubs'
  }

  /**
   * Ensure upload directory exists
   */
  async ensureDirectory() {
    try {
      await fs.mkdir(this.baseDir, { recursive: true })
    } catch (error) {
      console.error('Error creating directory:', error)
    }
  }

  /**
   * Generate unique filename
   */
  generateFilename(clubSlug, originalName = '') {
    const timestamp = Date.now()
    const randomString = crypto.randomBytes(6).toString('hex')
    const extension = originalName.split('.').pop() || 'jpg'
    return `${clubSlug}-${timestamp}-${randomString}.${extension}`
  }

  /**
   * Download image from URL and save locally
   */
  async downloadAndSaveImage(imageUrl, clubSlug, imageType = 'gallery') {
    try {
      await this.ensureDirectory()

      // Fetch image from URL
      const response = await fetch(imageUrl)
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.statusText}`)
      }

      const buffer = Buffer.from(await response.arrayBuffer())
      const filename = this.generateFilename(clubSlug)
      const filepath = path.join(this.baseDir, filename)

      // For now, save directly without sharp optimization
      // You can add sharp later for image optimization
      await fs.writeFile(filepath, buffer)

      // Return public URL
      return `${this.publicPath}/${filename}`
      
    } catch (error) {
      console.error('Error downloading image:', error)
      return null
    }
  }

  /**
   * Download image from Google Places Photo API
   */
  async downloadGooglePlacePhoto(photoReference, apiKey, clubSlug, maxWidth = 1200) {
    try {
      const googlePhotoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxWidth}&photo_reference=${photoReference}&key=${apiKey}`
      
      return await this.downloadAndSaveImage(googlePhotoUrl, clubSlug)
    } catch (error) {
      console.error('Error downloading Google Place photo:', error)
      return null
    }
  }

  /**
   * Process multiple Google photo references
   */
  async processGooglePhotos(photos, apiKey, clubSlug, limit = 10) {
    const downloadedUrls = []
    const photosToProcess = photos.slice(0, limit)

    for (const photo of photosToProcess) {
      if (photo.photo_reference) {
        const url = await this.downloadGooglePlacePhoto(
          photo.photo_reference,
          apiKey,
          clubSlug
        )
        if (url) {
          downloadedUrls.push(url)
        }
      }
    }

    return downloadedUrls
  }

  /**
   * Alternative: Upload to Cloudinary (if you prefer cloud storage)
   * Uncomment and configure if you want to use Cloudinary
   */
  /*
  async uploadToCloudinary(imageUrl, clubSlug) {
    // npm install cloudinary
    const cloudinary = require('cloudinary').v2
    
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET
    })

    try {
      const result = await cloudinary.uploader.upload(imageUrl, {
        folder: `clubs/${clubSlug}`,
        resource_type: 'auto',
        quality: 'auto:good',
        fetch_format: 'auto',
        width: 1200,
        height: 800,
        crop: 'limit'
      })
      
      return result.secure_url
    } catch (error) {
      console.error('Cloudinary upload error:', error)
      return null
    }
  }
  */
}

const imageStorage = new ImageStorageService()
export default imageStorage
