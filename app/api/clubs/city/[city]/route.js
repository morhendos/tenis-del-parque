import { NextResponse } from 'next/server'
import Club from '@/lib/models/Club'
import dbConnect from '@/lib/db/mongoose'
import { 
  determineLeagueByLocationWithFallback, 
  LEAGUE_POLYGONS, 
  LEAGUE_NAMES 
} from '@/lib/utils/geographicBoundaries'
import { 
  loadAreaBoundaries,
  enhanceClubWithCurrentLeague 
} from '@/lib/utils/areaLoader'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

/**
 * Helper function to determine club's league based on GPS coordinates
 */
function assignClubToLeague(club) {
  if (!club.location?.coordinates?.lat || !club.location?.coordinates?.lng) {
    console.warn(`Club ${club.name} missing GPS coordinates for league assignment`)
    return null
  }
  
  const league = determineLeagueByLocationWithFallback(
    club.location.coordinates.lat, 
    club.location.coordinates.lng
  )
  
  return league
}

/**
 * Enhanced club data with GPS-based league assignment
 */
function enhanceClubWithLeague(club) {
  const league = assignClubToLeague(club)
  
  // Convert to plain object if it's a MongoDB document
  const enhancedClub = club.toObject ? club.toObject() : { ...club }
  
  // Add league information based on GPS coordinates
  enhancedClub.league = league
  enhancedClub.leagueInfo = league ? {
    id: league,
    name: LEAGUE_NAMES[league],
    color: LEAGUE_POLYGONS[league]?.color
  } : null
  
  return enhancedClub
}

export async function GET(request, { params }) {
  try {
    await dbConnect()

    const { city } = params
    const { searchParams } = new URL(request.url)
    const includeInactive = searchParams.get('includeInactive') === 'true'
    const featured = searchParams.get('featured')
    const search = searchParams.get('search')
    const limit = parseInt(searchParams.get('limit') || '100')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Build query - include inactive clubs if requested (for debugging)
    let query = includeInactive ? {} : { status: 'active' }

    // Featured filtering
    if (featured === 'true') {
      query.featured = true
    }

    // Search functionality
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

    // Get all clubs that match the base query
    const clubsRaw = await Club.find(query)
      .sort({ featured: -1, displayOrder: 1, name: 1 })
      .select({
        name: 1,
        slug: 1,
        description: 1,
        location: 1,
        courts: 1,
        amenities: 1,
        services: 1,
        contact: 1,
        pricing: 1,
        tags: 1,
        featured: 1,
        images: 1,
        status: 1  // Include status for debugging
      })
      .lean()

    // Enhance clubs with current area boundaries (including modified ones)
    const clubsWithLeagues = []
    for (const club of clubsRaw) {
      const enhancedClub = await enhanceClubWithCurrentLeague(club)
      clubsWithLeagues.push(enhancedClub)
    }

    // Filter by target city/league using GPS assignments
    const cityClubs = clubsWithLeagues.filter(club => {
      if (!club.league) {
        console.warn(`⚠️  Club "${club.name}" has no GPS-based league assignment`)
        return false
      }
      
      // Use GPS-based league to determine if club belongs to this city
      return club.league.toLowerCase() === city.toLowerCase()
    })

    // Separate active and inactive for debugging
    const activeClubs = cityClubs.filter(club => club.status === 'active')
    const inactiveClubs = cityClubs.filter(club => club.status !== 'active')

    // Use appropriate clubs based on includeInactive flag
    const finalClubs = includeInactive ? cityClubs : activeClubs

    // Apply pagination to filtered results
    const clubs = finalClubs.slice(offset, offset + limit)
    const total = finalClubs.length

    // Enhanced debugging info
    console.log(`🗺️  GPS-based city clubs for "${city}":`, {
      totalClubsInDB: clubsRaw.length,
      totalWithGPSAssignments: clubsWithLeagues.filter(c => c.league).length,
      clubsAssignedToThisCity: cityClubs.length,
      activeInThisCity: activeClubs.length,
      inactiveInThisCity: inactiveClubs.length,
      returnedAfterFiltering: clubs.length,
      includeInactive: includeInactive
    })

    // Log specific club assignments for debugging
    cityClubs.forEach(club => {
      console.log(`  📍 ${club.name} (${club.status}): ${club.location?.coordinates?.lat}, ${club.location?.coordinates?.lng} → ${club.league}`)
    })

    // Determine city info from the actual league assignments
    const targetLeague = city.toLowerCase()
    const leagueInfo = LEAGUE_POLYGONS[targetLeague]
    
    if (!leagueInfo && cityClubs.length === 0) {
      return NextResponse.json(
        { error: `No clubs found for city "${city}". Available leagues: ${Object.keys(LEAGUE_POLYGONS).join(', ')}` },
        { status: 404 }
      )
    }

    const response = {
      clubs,
      total,
      city: {
        slug: city,
        league: targetLeague,
        name: LEAGUE_NAMES[targetLeague] || city,
        color: leagueInfo?.color
      },
      debug: {
        totalClubsQueried: clubsRaw.length,
        clubsWithGPSAssignments: clubsWithLeagues.filter(c => c.league).length,
        clubsInThisCity: cityClubs.length,
        activeClubsInThisCity: activeClubs.length,
        inactiveClubsInThisCity: inactiveClubs.length,
        clubAssignments: cityClubs.map(c => ({
          name: c.name,
          status: c.status,
          coordinates: c.location?.coordinates,
          assignedLeague: c.league
        }))
      },
      assignmentInfo: {
        method: 'pure-gps-based',
        targetLeague,
        includeInactive: includeInactive
      },
      pagination: {
        limit,
        offset,
        hasMore: offset + clubs.length < total
      },
      filters: {
        city: city,
        league: targetLeague,
        featured: featured === 'true',
        search: search || '',
        includeInactive: includeInactive
      }
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error(`Error fetching clubs for city "${params.city}":`, error)
    return NextResponse.json(
      { error: 'Failed to fetch clubs for city', details: error.message },
      { status: 500 }
    )
  }
}
