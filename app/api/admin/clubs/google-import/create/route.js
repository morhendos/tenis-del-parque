import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import Club from '@/lib/models/Club'
import City from '@/lib/models/City'
import dbConnect from '@/lib/db/mongoose'
import imageStorage from '@/lib/services/imageStorage'

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await dbConnect()

    const { clubs } = await request.json()

    // Validate input
    if (!clubs || !Array.isArray(clubs) || clubs.length === 0) {
      return NextResponse.json(
        { error: 'Clubs data is required' },
        { status: 400 }
      )
    }

    console.log(`🚀 Attempting to import ${clubs.length} clubs with area mapping...`)

    const results = {
      created: 0,
      failed: 0,
      duplicates: 0,
      citiesCreated: 0,
      areasProcessed: [],
      imagesProcessed: 0,
      errors: []
    }

    // Process each club
    for (const clubData of clubs) {
      try {
        console.log(`\n📍 Processing: ${clubData.name}`)
        console.log(`   Area: ${clubData.location?.area || 'none'}`)
        console.log(`   City: ${clubData.location?.city || 'none'}`)
        console.log(`   Display: ${clubData.location?.displayName || 'none'}`)

        // Check for duplicates by slug or Google Place ID
        const existingClub = await Club.findOne({
          $or: [
            { slug: clubData.slug },
            { googlePlaceId: clubData.googlePlaceId }
          ]
        })

        if (existingClub) {
          console.log(`⚠️  Duplicate found: ${clubData.name} (${existingClub.slug})`)
          results.duplicates++
          results.errors.push({
            name: clubData.name,
            error: 'Club already exists',
            existingSlug: existingClub.slug
          })
          continue
        }

        // Validate required fields with enhanced location structure
        if (!clubData.name || !clubData.slug || !clubData.location?.city) {
          console.log(`❌ Missing required fields for: ${clubData.name || 'Unknown'}`)
          results.failed++
          results.errors.push({
            name: clubData.name || 'Unknown',
            error: 'Missing required fields (name, slug, location.city)'
          })
          continue
        }

        // Auto-create main city if it doesn't exist
        const mainCitySlug = clubData.location.city.toLowerCase().trim()
        try {
          const cityDisplayName = clubData.location.city.charAt(0).toUpperCase() + 
                                clubData.location.city.slice(1)
          
          const city = await City.findOrCreate({
            slug: mainCitySlug,
            name: {
              es: cityDisplayName,
              en: cityDisplayName
            },
            importSource: 'google'
          })
          
          if (city && city.isNew) {
            console.log(`🏙️  Created new city: ${cityDisplayName}`)
            results.citiesCreated++
          }
        } catch (cityError) {
          console.warn(`⚠️  City creation failed for ${mainCitySlug}:`, cityError.message)
          // Continue with club creation even if city creation fails
        }

        // Ensure courts structure is valid
        const indoor = parseInt(clubData.courts?.indoor) || 0
        const outdoor = parseInt(clubData.courts?.outdoor) || 0
        const total = indoor + outdoor
        
        if (total < 1) {
          // For Google imports, we'll allow 0 courts but set a default
          clubData.courts = {
            ...clubData.courts,
            total: 6, // Default estimate
            indoor: 0,
            outdoor: 6,
            surfaces: [{ type: 'clay', count: 6 }]
          }
        } else {
          clubData.courts = {
            ...clubData.courts,
            total,
            indoor,
            outdoor,
            surfaces: clubData.courts?.surfaces || []
          }
        }

        // Validate and clean location data
        const locationData = {
          address: clubData.location.address,
          city: mainCitySlug,
          postalCode: clubData.location.postalCode || '',
          coordinates: clubData.location.coordinates,
          googleMapsUrl: clubData.location.googleMapsUrl,
          
          // Enhanced area fields
          area: clubData.location.area || null,
          displayName: clubData.location.displayName || null,
          administrativeCity: clubData.location.administrativeCity || null
        }

        // Process and download images before saving
        let processedImages = {
          main: clubData.images?.main || null,
          gallery: clubData.images?.gallery || []
        }

        if (clubData.googleData?.photos && clubData.googleData.photos.length > 0) {
          console.log(`📷 Processing ${clubData.googleData.photos.length} images for ${clubData.name}`)
          
          // Download all Google photos
          const downloadedUrls = await imageStorage.processGooglePhotos(
            clubData.googleData.photos,
            process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
            clubData.slug,
            10 // Max 10 images
          )

          if (downloadedUrls.length > 0) {
            processedImages.main = downloadedUrls[0] // First image as main
            processedImages.gallery = downloadedUrls // All images in gallery
            results.imagesProcessed += downloadedUrls.length
            
            console.log(`✅ Downloaded ${downloadedUrls.length} images for ${clubData.name}`)
          }
        }

        // Create the club with enhanced location data and processed images
        const club = new Club({
          ...clubData,
          images: processedImages, // Use downloaded images instead of Google URLs
          location: locationData,
          stats: { views: 0, clicks: 0 },
          createdBy: session.user.id,
          importedAt: new Date()
        })

        await club.save()
        
        console.log(`✅ Successfully imported: ${club.name}`)
        console.log(`   → Slug: ${club.slug}`)
        console.log(`   → Display: ${club.location.displayName}`)
        console.log(`   → League City: ${club.location.city}`)
        console.log(`   → Images: ${processedImages.gallery.length} downloaded`)
        
        results.created++
        
        // Track area processing for reporting
        results.areasProcessed.push({
          name: club.name,
          area: club.location.area,
          city: club.location.city,
          displayName: club.location.displayName,
          slug: club.slug
        })

      } catch (error) {
        console.error(`❌ Error importing club ${clubData.name}:`, error)
        results.failed++
        results.errors.push({
          name: clubData.name || 'Unknown',
          error: error.message,
          details: error.stack?.split('\n')[0]
        })
      }
    }

    // Summary logging
    console.log(`\n🎉 Import complete!`)
    console.log(`   ✅ Created: ${results.created}`)
    console.log(`   ⚠️  Duplicates: ${results.duplicates}`)
    console.log(`   ❌ Failed: ${results.failed}`)
    console.log(`   🏙️  Cities created: ${results.citiesCreated}`)
    console.log(`   📍 Areas processed: ${results.areasProcessed.length}`)
    console.log(`   📷 Images downloaded: ${results.imagesProcessed}`)

    // Log area mapping results
    if (results.areasProcessed.length > 0) {
      console.log(`\n📋 Area Mapping Results:`)
      results.areasProcessed.forEach(item => {
        console.log(`   • ${item.name}: ${item.area || 'N/A'} → ${item.city}`)
        console.log(`     Display: "${item.displayName}"`)
      })
    }

    // Return enhanced results
    return NextResponse.json({
      ...results,
      summary: {
        totalProcessed: clubs.length,
        successRate: clubs.length > 0 ? Math.round((results.created / clubs.length) * 100) : 0,
        areasDetected: results.areasProcessed.filter(item => item.area).length,
        citiesAffected: [...new Set(results.areasProcessed.map(item => item.city))].length
      }
    })

  } catch (error) {
    console.error('💥 Error in bulk club import:', error)
    return NextResponse.json(
      { 
        error: 'Failed to import clubs', 
        details: error.message,
        stack: error.stack?.split('\n').slice(0, 3)
      },
      { status: 500 }
    )
  }
}
