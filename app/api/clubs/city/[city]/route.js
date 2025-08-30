import { NextResponse } from 'next/server'
import Club from '@/lib/models/Club'
import dbConnect from '@/lib/db/mongoose'
import { 
  determineLeagueByLocationWithFallback, 
  LEAGUE_POLYGONS, 
  LEAGUE_NAMES 
} from '@/lib/utils/geographicBoundaries'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

/**
 * Mapping from city slugs to league IDs
 * This maintains backward compatibility with existing URLs
 */
const CITY_TO_LEAGUE_MAPPING = {
  'marbella': 'marbella',
  'malaga': 'malaga',
  'estepona': 'estepona',
  'sotogrande': 'sotogrande'
}

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
    const featured = searchParams.get('featured')
    const search = searchParams.get('search')
    const limit = parseInt(searchParams.get('limit') || '100')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Map city slug to league ID
    const targetLeague = CITY_TO_LEAGUE_MAPPING[city?.toLowerCase()]
    
    if (!targetLeague) {
      return NextResponse.json(
        { error: `City "${city}" not found. Available cities: ${Object.keys(CITY_TO_LEAGUE_MAPPING).join(', ')}` },
        { status: 404 }
      )
    }

    let query = { status: 'active' }

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

    // Get all active clubs first
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
        images: 1
      })
      .lean()

    // Enhance clubs with GPS-based league assignments
    const clubsWithLeagues = clubsRaw.map(club => enhanceClubWithLeague(club))

    // Filter by target league (based on GPS assignment)
    const cityClubs = clubsWithLeagues.filter(club => club.league === targetLeague)

    // Apply pagination to filtered results
    const clubs = cityClubs.slice(offset, offset + limit)
    const total = cityClubs.length

    console.log(`📍 City clubs API for "${city}" (${targetLeague} league):`, {
      totalClubsInDB: clubsRaw.length,
      clubsInTargetLeague: cityClubs.length,
      returnedAfterPagination: clubs.length
    })

    const response = {
      clubs,
      total,
      city: {
        slug: city,
        league: targetLeague,
        name: LEAGUE_NAMES[targetLeague],
        color: LEAGUE_POLYGONS[targetLeague]?.color
      },
      assignmentInfo: {
        method: 'gps-based-city-filter',
        targetLeague,
        totalInLeague: cityClubs.length
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
        search: search || ''
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
