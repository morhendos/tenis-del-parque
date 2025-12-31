import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { put } from '@vercel/blob'
import Club from '@/lib/models/Club'
import dbConnect from '@/lib/db/mongoose'

export const dynamic = 'force-dynamic'
export const maxDuration = 60 // Allow up to 60 seconds for this endpoint

/**
 * Import Google Photos to Vercel Blob Storage
 * 
 * This endpoint:
 * 1. Fetches fresh photo references from Google Places API
 * 2. Downloads the actual image bytes
 * 3. Uploads to Vercel Blob (permanent storage)
 * 4. Saves the Blob URLs to the database
 * 
 * This replaces the old "refresh" workflow that only saved expiring photo_references.
 */
export async function POST(request) {
  try {
    // Auth check
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { clubId, maxPhotos = 5 } = await request.json()

    if (!clubId) {
      return NextResponse.json({ error: 'Club ID is required' }, { status: 400 })
    }

    // Validate environment
    if (!process.env.GOOGLE_MAPS_API_KEY) {
      return NextResponse.json({ error: 'GOOGLE_MAPS_API_KEY not configured' }, { status: 500 })
    }

    await dbConnect()

    // Get the club
    const club = await Club.findById(clubId)
    if (!club) {
      return NextResponse.json({ error: 'Club not found' }, { status: 404 })
    }

    if (!club.googlePlaceId) {
      return NextResponse.json({ 
        error: 'This club does not have a Google Place ID. Only clubs imported from Google Maps can use this feature.' 
      }, { status: 400 })
    }

    console.log(`🔄 Importing Google Photos to Blob for: ${club.name}`)

    // Step 1: Fetch fresh photo references from Google Places API
    const placeDetailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${club.googlePlaceId}&fields=photos&key=${process.env.GOOGLE_MAPS_API_KEY}`
    
    const placeResponse = await fetch(placeDetailsUrl)
    const placeData = await placeResponse.json()

    if (placeData.status !== 'OK') {
      return NextResponse.json({ 
        error: `Google Places API error: ${placeData.status}`,
        details: placeData.error_message 
      }, { status: 500 })
    }

    const googlePhotos = placeData.result?.photos || []
    
    if (googlePhotos.length === 0) {
      return NextResponse.json({ 
        error: 'No photos found for this place in Google Maps' 
      }, { status: 404 })
    }

    console.log(`   Found ${googlePhotos.length} photos from Google`)

    // Step 2: Download and upload photos to Vercel Blob
    const photosToProcess = googlePhotos.slice(0, Math.min(maxPhotos + 1, 10)) // +1 for main image
    const uploadedUrls = []
    const errors = []

    for (let i = 0; i < photosToProcess.length; i++) {
      const photo = photosToProcess[i]
      const photoRef = photo.photo_reference

      try {
        // Download from Google
        const photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photo_reference=${photoRef}&key=${process.env.GOOGLE_MAPS_API_KEY}`
        const photoResponse = await fetch(photoUrl)

        if (!photoResponse.ok) {
          errors.push(`Photo ${i + 1}: Download failed (${photoResponse.status})`)
          continue
        }

        const contentType = photoResponse.headers.get('content-type') || 'image/jpeg'
        const imageBuffer = await photoResponse.arrayBuffer()

        // Determine extension
        let extension = 'jpg'
        if (contentType.includes('png')) extension = 'png'
        if (contentType.includes('webp')) extension = 'webp'

        // Upload to Vercel Blob
        const timestamp = Date.now()
        const filename = `clubs/${club.slug}_google_${i}_${timestamp}.${extension}`

        const blob = await put(filename, Buffer.from(imageBuffer), {
          access: 'public',
          contentType,
          addRandomSuffix: false
        })

        uploadedUrls.push(blob.url)
        console.log(`   ✓ Photo ${i + 1}: ${(imageBuffer.byteLength / 1024).toFixed(0)} KB`)

      } catch (photoError) {
        errors.push(`Photo ${i + 1}: ${photoError.message}`)
        console.error(`   ✗ Photo ${i + 1} failed:`, photoError.message)
      }

      // Small delay to avoid rate limiting
      await new Promise(r => setTimeout(r, 300))
    }

    if (uploadedUrls.length === 0) {
      return NextResponse.json({ 
        error: 'Failed to upload any photos',
        details: errors 
      }, { status: 500 })
    }

    // Step 3: Update database with permanent Blob URLs
    const mainImage = uploadedUrls[0]
    const galleryImages = uploadedUrls.slice(1)

    // Preserve existing non-Google images in gallery
    const existingGallery = (club.images?.gallery || []).filter(url => 
      url && 
      !url.includes('photo_reference') && 
      !url.includes('/api/clubs/photo') &&
      !url.includes('_google_') // Don't duplicate our own Google imports
    )

    club.images = club.images || {}
    club.images.main = mainImage
    club.images.gallery = [...existingGallery, ...galleryImages]
    club.images.googlePhotoReference = '' // Clear deprecated field

    // Also update googleData with fresh references (for reference only)
    club.googleData = club.googleData || {}
    club.googleData.photos = googlePhotos.slice(0, 10).map(p => ({
      photo_reference: p.photo_reference,
      height: p.height,
      width: p.width
    }))
    club.googleData.photosImportedAt = new Date()

    await club.save()

    console.log(`✅ Successfully imported ${uploadedUrls.length} photos for ${club.name}`)

    // Step 4: Revalidate pages
    try {
      const city = club.location?.city
      const slug = club.slug
      
      if (city && slug) {
        revalidatePath(`/es/clubs/${city}/${slug}`)
        revalidatePath(`/en/clubs/${city}/${slug}`)
        revalidatePath(`/es/clubs/${city}`)
        revalidatePath(`/en/clubs/${city}`)
      }
    } catch (revalidateError) {
      console.error('Revalidation error:', revalidateError)
    }

    return NextResponse.json({
      success: true,
      message: `Successfully imported ${uploadedUrls.length} photos to Vercel Blob`,
      mainImage,
      galleryCount: galleryImages.length,
      totalUploaded: uploadedUrls.length,
      errors: errors.length > 0 ? errors : undefined
    })

  } catch (error) {
    console.error('Error importing Google Photos:', error)
    return NextResponse.json({
      error: 'Failed to import Google Photos',
      details: error.message
    }, { status: 500 })
  }
}
