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

export async function GET(request) {
  try {
    await dbConnect()

    const { searchParams } = new URL(request.url)
    const league = searchParams.get('league') // GPS-based league filtering
    const featured = searchParams.get('featured')
    const search = searchParams.get('search')
    const limit = parseInt(searchParams.get('limit') || '100')
    const offset = parseInt(searchParams.get('offset') || '0')

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

    // Filter by league if specified (after GPS assignment)
    let filteredClubs = clubsWithLeagues
    if (league && league !== 'all') {
      filteredClubs = clubsWithLeagues.filter(club => club.league === league)
    }

    // Apply pagination to filtered results
    const clubs = filteredClubs.slice(offset, offset + limit)
    const total = filteredClubs.length

    // Calculate league statistics based on GPS assignments
    const leagueStats = {}
    let assignedCount = 0
    let unassignedCount = 0

    clubsWithLeagues.forEach(club => {
      if (club.league) {
        leagueStats[club.league] = (leagueStats[club.league] || 0) + 1
        assignedCount++
      } else {
        unassignedCount++
      }
    })

    // Create league info for response
    const leagueInfo = {}
    Object.keys(LEAGUE_POLYGONS).forEach(leagueKey => {
      leagueInfo[leagueKey] = {
        id: leagueKey,
        name: LEAGUE_NAMES[leagueKey] || LEAGUE_POLYGONS[leagueKey].name,
        color: LEAGUE_POLYGONS[leagueKey].color,
        count: leagueStats[leagueKey] || 0
      }
    })

    console.log(`📊 GPS-based club assignment stats:`, {
      total: clubsWithLeagues.length,
      assigned: assignedCount,
      unassigned: unassignedCount,
      byLeague: leagueStats
    })

    const response = {
      clubs,
      total,
      leagueStats, // GPS-based league statistics
      leagueInfo,   // League information with names and colors
      assignmentInfo: {
        method: 'gps-based',
        assigned: assignedCount,
        unassigned: unassignedCount,
        assignmentRate: Math.round((assignedCount / clubsWithLeagues.length) * 100)
      },
      pagination: {
        limit,
        offset,
        hasMore: offset + clubs.length < total
      },
      filters: {
        league: league || 'all',
        featured: featured === 'true',
        search: search || ''
      }
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching clubs with GPS assignment:', error)
    return NextResponse.json(
      { error: 'Failed to fetch clubs', details: error.message },
      { status: 500 }
    )
  }
}

/**
 * Create new club with GPS-based league assignment
 */
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

    // GPS coordinates are required for league assignment
    if (!clubData.location.coordinates?.lat || !clubData.location.coordinates?.lng) {
      return NextResponse.json(
        { error: 'GPS coordinates (lat, lng) are required for automatic league assignment' },
        { status: 400 }
      )
    }

    const club = new Club(clubData)
    
    // Assign league based on GPS coordinates before saving
    const assignedLeague = assignClubToLeague(clubData)
    
    console.log(`🎯 New club "${clubData.name}" assigned to league: ${assignedLeague || 'unassigned'}`)

    await club.save()

    // Enhance response with league info
    const enhancedClub = enhanceClubWithLeague(club)

    return NextResponse.json({ 
      success: true, 
      club: enhancedClub,
      assignedLeague,
      message: `Club created successfully and assigned to ${assignedLeague ? `${LEAGUE_NAMES[assignedLeague]} league` : 'no league (outside defined areas)'} based on GPS coordinates`
    }, { status: 201 })
    
  } catch (error) {
    console.error('Error creating club with GPS assignment:', error)
    return NextResponse.json(
      { error: 'Failed to create club', details: error.message },
      { status: 500 }
    )
  }
}