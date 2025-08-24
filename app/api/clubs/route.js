import { NextResponse } from 'next/server'
import Club from '@/lib/models/Club'
import dbConnect from '@/lib/db/mongoose'
import { 
  CITY_AREAS_MAPPING, 
  AREA_DISPLAY_NAMES, 
  CITY_DISPLAY_NAMES,
  getAreasForCity
} from '@/lib/utils/areaMapping'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

export async function GET(request) {
  try {
    await dbConnect()

    const { searchParams } = new URL(request.url)
    const city = searchParams.get('city')
    const area = searchParams.get('area') // NEW: Area filtering support
    const featured = searchParams.get('featured')
    const search = searchParams.get('search') // NEW: Search support
    const limit = parseInt(searchParams.get('limit') || '100')
    const offset = parseInt(searchParams.get('offset') || '0')

    let query = { status: 'active' }

    // City filtering
    if (city && city !== 'all') {
      query['location.city'] = city.toLowerCase()
    }

    // NEW: Area filtering
    if (area && area !== 'all') {
      query['location.area'] = area.toLowerCase()
    }

    // Featured filtering
    if (featured === 'true') {
      query.featured = true
    }

    // NEW: Search functionality
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i')
      query.$or = [
        { name: searchRegex },
        { 'description.es': searchRegex },
        { 'description.en': searchRegex },
        { 'location.address': searchRegex },
        { 'location.displayName': searchRegex }
      ]
    }

    const clubs = await Club.find(query)
      .sort({ featured: -1, displayOrder: 1, name: 1 })
      .limit(limit)
      .skip(offset)
      .select({
        name: 1,
        slug: 1,
        description: 1,
        location: 1, // Enhanced to include area information
        courts: 1,
        amenities: 1,
        services: 1,
        contact: 1,
        pricing: 1,
        tags: 1,
        featured: 1,
        images: 1
      })
      .lean()

    // Get total count for pagination
    const total = await Club.countDocuments(query)

    // Enhanced: Get counts by city AND area for filters
    const cityCounts = await Club.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: '$location.city', count: { $sum: 1 } } }
    ])

    const cityStats = cityCounts.reduce((acc, { _id, count }) => {
      acc[_id] = count
      return acc
    }, {})

    // NEW: Get area statistics
    const areaCounts = await Club.aggregate([
      { $match: { status: 'active', 'location.area': { $exists: true, $ne: null } } },
      { 
        $group: { 
          _id: { 
            city: '$location.city', 
            area: '$location.area' 
          }, 
          count: { $sum: 1 } 
        } 
      }
    ])

    const areaStats = {}
    areaCounts.forEach(({ _id, count }) => {
      if (!areaStats[_id.city]) {
        areaStats[_id.city] = {}
      }
      areaStats[_id.city][_id.area] = count
    })

    // NEW: Enhanced response with area support
    const response = {
      clubs,
      total,
      cityStats,
      areaStats, // NEW: Area-based statistics
      pagination: {
        limit,
        offset,
        hasMore: offset + clubs.length < total
      },
      filters: { // NEW: Applied filters info
        city: city || 'all',
        area: area || 'all',
        featured: featured === 'true',
        search: search || ''
      }
    }

    // NEW: Add area context for specific city queries
    if (city && city !== 'all') {
      const availableAreas = getAreasForCity(city)
      const cityAreaStats = areaStats[city] || {}
      
      response.areaContext = {
        city: city,
        cityDisplayName: CITY_DISPLAY_NAMES[city] || city,
        availableAreas: availableAreas.map(areaKey => ({
          key: areaKey,
          name: AREA_DISPLAY_NAMES[areaKey] || areaKey,
          count: cityAreaStats[areaKey] || 0
        })),
        totalAreasWithClubs: Object.keys(cityAreaStats).length
      }
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching clubs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch clubs', details: error.message },
      { status: 500 }
    )
  }
}

// NEW: Enhanced POST method with area support for future club creation
export async function POST(request) {
  try {
    await dbConnect()
    
    const clubData = await request.json()
    
    // Validate required fields
    if (!clubData.name || !clubData.location) {
      return NextResponse.json(
        { error: 'Name and location are required' },
        { status: 400 }
      )
    }

    // Enhanced: Generate display name if area is provided
    if (clubData.location.area && clubData.location.city) {
      const areaName = AREA_DISPLAY_NAMES[clubData.location.area] || clubData.location.area
      const cityName = CITY_DISPLAY_NAMES[clubData.location.city] || clubData.location.city
      clubData.location.displayName = `${areaName} (${cityName.charAt(0).toUpperCase() + cityName.slice(1)})`
    }

    const club = new Club(clubData)
    await club.save()

    return NextResponse.json({ 
      success: true, 
      club,
      message: 'Club created successfully with area context'
    }, { status: 201 })
    
  } catch (error) {
    console.error('Error creating club:', error)
    return NextResponse.json(
      { error: 'Failed to create club', details: error.message },
      { status: 500 }
    )
  }
}
