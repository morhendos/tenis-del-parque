import { NextResponse } from 'next/server'
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

    // Ensure courts structure is valid and calculate total
    const indoor = parseInt(data.courts?.indoor) || 0
    const outdoor = parseInt(data.courts?.outdoor) || 0
    const total = indoor + outdoor
    
    if (total < 1) {
      return NextResponse.json(
        { error: 'At least one court (indoor or outdoor) is required' },
        { status: 400 }
      )
    }
    
    data.courts = {
      ...data.courts,
      total,
      indoor,
      outdoor,
      surfaces: data.courts?.surfaces || []
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

    // Create the club
    const club = new Club({
      ...data,
      status: data.status || 'active',
      stats: { views: 0, clicks: 0 }
    })

    await club.save()
    console.log('Club created successfully:', club._id)

    return NextResponse.json({ 
      success: true, 
      club: club.toObject() 
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