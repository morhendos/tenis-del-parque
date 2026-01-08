import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import Club from '@/lib/models/Club'
import City from '@/lib/models/City'
import dbConnect from '@/lib/db/mongoose'

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await dbConnect()

    const { searchParams } = new URL(request.url)
    const city = searchParams.get('city')
    const status = searchParams.get('status')

    let query = {}
    if (city && city !== 'all') {
      query['location.city'] = city
    }
    if (status) {
      query.status = status
    }

    const clubs = await Club.find(query)
      .sort({ featured: -1, displayOrder: 1, name: 1 })
      .lean()

    return NextResponse.json({ clubs })
  } catch (error) {
    console.error('Error fetching clubs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch clubs' },
      { status: 500 }
    )
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await dbConnect()

    const data = await request.json()
    console.log('Received club data:', JSON.stringify(data, null, 2))

    // Validate required fields
    if (!data.name || !data.slug || !data.location?.city) {
      console.error('Missing required fields:', {
        name: data.name,
        slug: data.slug,
        city: data.location?.city
      })
      return NextResponse.json(
        { error: 'Missing required fields: name, slug, or city' },
        { status: 400 }
      )
    }

    // For Google imports, descriptions are optional, but for manual entry they're required
    const isGoogleImport = data.importSource === 'google'
    if (!isGoogleImport && (!data.description?.es || !data.description?.en)) {
      console.error('Missing description fields')
      return NextResponse.json(
        { error: 'Missing required description in Spanish and English' },
        { status: 400 }
      )
    }

    // Check if slug already exists
    const existingClub = await Club.findOne({ slug: data.slug })
    if (existingClub) {
      return NextResponse.json(
        { error: 'A club with this slug already exists' },
        { status: 400 }
      )
    }

    // Auto-create city if it doesn't exist
    const citySlug = data.location.city.toLowerCase().trim()
    try {
      const city = await City.findOrCreate({
        slug: citySlug,
        name: data.location.cityName || citySlug.charAt(0).toUpperCase() + citySlug.slice(1),
        importSource: data.importSource === 'google' ? 'google' : 'manual'
      })
      
      if (city && city.isNew) {
        console.log(`Created new city: ${city.name.es}`)
      }
    } catch (cityError) {
      console.warn(`City creation failed for ${citySlug}:`, cityError.message)
      // Continue with club creation even if city creation fails
    }

    // Handle new court structure
    if (data.courts) {
      // Calculate totals for each court type
      if (data.courts.tennis) {
        const tennisIndoor = parseInt(data.courts.tennis.indoor) || 0
        const tennisOutdoor = parseInt(data.courts.tennis.outdoor) || 0
        data.courts.tennis.total = tennisIndoor + tennisOutdoor
        data.courts.tennis.indoor = tennisIndoor
        data.courts.tennis.outdoor = tennisOutdoor
        data.courts.tennis.surfaces = data.courts.tennis.surfaces || []
      } else {
        data.courts.tennis = {
          total: 0,
          indoor: 0,
          outdoor: 0,
          surfaces: []
        }
      }
      
      if (data.courts.padel) {
        const padelIndoor = parseInt(data.courts.padel.indoor) || 0
        const padelOutdoor = parseInt(data.courts.padel.outdoor) || 0
        data.courts.padel.total = padelIndoor + padelOutdoor
        data.courts.padel.indoor = padelIndoor
        data.courts.padel.outdoor = padelOutdoor
        data.courts.padel.surfaces = data.courts.padel.surfaces || []
      } else {
        data.courts.padel = {
          total: 0,
          indoor: 0,
          outdoor: 0,
          surfaces: []
        }
      }
      
      if (data.courts.pickleball) {
        const pickleballIndoor = parseInt(data.courts.pickleball.indoor) || 0
        const pickleballOutdoor = parseInt(data.courts.pickleball.outdoor) || 0
        data.courts.pickleball.total = pickleballIndoor + pickleballOutdoor
        data.courts.pickleball.indoor = pickleballIndoor
        data.courts.pickleball.outdoor = pickleballOutdoor
        data.courts.pickleball.surfaces = data.courts.pickleball.surfaces || []
      } else {
        data.courts.pickleball = {
          total: 0,
          indoor: 0,
          outdoor: 0,
          surfaces: []
        }
      }
      
      // Handle legacy structure for backward compatibility
      if (data.courts.total !== undefined && !data.courts.tennis.total && !data.courts.padel.total && !data.courts.pickleball.total) {
        const indoor = parseInt(data.courts.indoor) || 0
        const outdoor = parseInt(data.courts.outdoor) || 0
        const total = indoor + outdoor
        
        // Convert legacy to tennis courts by default
        data.courts.tennis = {
          total,
          indoor,
          outdoor,
          surfaces: data.courts.surfaces || []
        }
      }
      
      // Clear legacy fields
      data.courts.total = 0
      data.courts.indoor = 0
      data.courts.outdoor = 0
      data.courts.surfaces = []
      
      // Validate that at least one court exists
      const totalAllCourts = data.courts.tennis.total + data.courts.padel.total + data.courts.pickleball.total
      
      if (totalAllCourts < 1) {
        return NextResponse.json(
          { error: 'At least one court (tennis, padel, or pickleball) is required' },
          { status: 400 }
        )
      }
    } else {
      // Initialize empty court structure
      data.courts = {
        tennis: { total: 0, indoor: 0, outdoor: 0, surfaces: [] },
        padel: { total: 0, indoor: 0, outdoor: 0, surfaces: [] },
        pickleball: { total: 0, indoor: 0, outdoor: 0, surfaces: [] },
        total: 0,
        indoor: 0,
        outdoor: 0,
        surfaces: []
      }
    }

    // Ensure arrays are arrays
    if (!Array.isArray(data.tags)) {
      data.tags = []
    }

    // Ensure the city is stored as lowercase slug
    data.location = {
      ...data.location,
      city: citySlug
    }

    // Sanitize coordinates - remove if null/invalid to avoid 2dsphere index errors
    if (data.location.coordinates) {
      const { lat, lng } = data.location.coordinates
      if (lat == null || lng == null || isNaN(lat) || isNaN(lng)) {
        // Remove invalid coordinates entirely
        delete data.location.coordinates
      }
    }

    // Create the club
    const club = new Club({
      ...data,
      status: data.status || 'active',
      stats: { views: 0, clicks: 0 }
    })

    await club.save()
    console.log('Club created successfully:', club._id)

    // Auto-revalidate clubs listing pages
    try {
      console.log(`🔄 Auto-revalidating clubs pages after creating: ${club.name}`)
      revalidatePath('/es/clubs')
      revalidatePath('/en/clubs')
      revalidatePath(`/es/clubs/${citySlug}`)
      revalidatePath(`/en/clubs/${citySlug}`)
      console.log('✅ Clubs pages revalidated')
    } catch (revalidateError) {
      console.error('⚠️ Error revalidating clubs pages:', revalidateError)
      // Don't fail the creation if revalidation fails
    }

    return NextResponse.json({ 
      success: true, 
      club: club.toObject(),
      revalidated: true
    })
  } catch (error) {
    console.error('Error creating club:', error)
    console.error('Error stack:', error.stack)
    
    // Check for validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.keys(error.errors).map(key => ({
        field: key,
        message: error.errors[key].message
      }))
      return NextResponse.json(
        { 
          error: 'Validation failed', 
          details: validationErrors 
        },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to create club', 
        details: error.message 
      },
      { status: 500 }
    )
  }
}
