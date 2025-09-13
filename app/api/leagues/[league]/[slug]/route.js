import { NextResponse } from 'next/server'
import dbConnect from '../../../../../lib/db/mongoose'
import League from '../../../../../lib/models/League'
import City from '../../../../../lib/models/City' // Import City model for population

export const dynamic = 'force-dynamic'

export async function GET(request, { params }) {
  try {
    await dbConnect()
    
    const { slug } = params
    console.log('🔍 Fetching league by slug:', slug)
    
    // First, let's see ALL leagues to debug
    const allLeagues = await League.find({})
      .select('name slug status season')
      .lean()
    
    console.log('🔍 All leagues in database:')
    allLeagues.forEach(l => {
      console.log(`- ${l.name} | slug: ${l.slug} | status: ${l.status}`)
    })
    
    // Find league by slug and populate city data
    const league = await League.findOne({ 
      slug: slug,
      status: { $in: ['active', 'coming_soon', 'registration_open'] }
    })
    .populate('city', 'slug name images coordinates googleData province')
    .lean()

    if (!league) {
      console.log('❌ League not found with slug:', slug)
      console.log('🔍 Trying to find league with any status...')
      
      // Try to find with any status to see if it exists
      const anyStatusLeague = await League.findOne({ slug: slug }).select('name slug status').lean()
      if (anyStatusLeague) {
        console.log('⚠️ League exists but has wrong status:', anyStatusLeague.status)
      } else {
        console.log('❌ League does not exist at all with slug:', slug)
      }
      return NextResponse.json(
        { 
          success: false,
          error: 'League not found',
          message: 'The league you are looking for does not exist or is not active.'
        },
        { status: 404 }
      )
    }

    console.log('✅ League found:', league.name)

    // Transform league data for frontend
    const cityData = league.city || {}
    
    // Get current season info
    const currentSeason = league.seasons?.find(s => 
      s.status === 'registration_open' || s.status === 'active'
    ) || league.seasons?.[0]

    // Calculate registration status
    const now = new Date()
    const regStart = league.seasonConfig?.registrationStart ? new Date(league.seasonConfig.registrationStart) : null
    const regEnd = league.seasonConfig?.registrationEnd ? new Date(league.seasonConfig.registrationEnd) : null
    
    const isRegistrationOpen = league.status === 'registration_open' && 
      (!regStart || now >= regStart) && 
      (!regEnd || now <= regEnd)

    const transformedLeague = {
      _id: league._id,
      name: league.name,
      slug: league.slug,
      
      // Season information
      season: league.season,
      seasons: league.seasons || [],
      
      // Skill level information
      skillLevel: league.skillLevel || 'all',
      
      // City information
      location: {
        city: league.location?.city || cityData.name?.es || 'Unknown',
        citySlug: cityData.slug || league.slug,
        region: league.location?.region || cityData.province || 'Málaga',
        country: league.location?.country || 'Spain',
        timezone: league.location?.timezone || 'Europe/Madrid'
      },
      
      // City data for display
      cityData: cityData ? {
        _id: cityData._id,
        slug: cityData.slug,
        name: cityData.name,
        province: cityData.province,
        coordinates: cityData.coordinates,
        images: cityData.images
      } : null,
      
      // Status and registration
      status: league.status,
      isRegistrationOpen,
      expectedLaunchDate: league.expectedLaunchDate,
      
      // Season configuration
      seasonConfig: league.seasonConfig,
      
      // League configuration
      config: league.config,
      
      // Contact and description
      contact: league.contact,
      description: league.description,
      
      // Stats
      stats: league.stats || {
        totalPlayers: 0,
        totalMatches: 0,
        registeredPlayers: 0
      },
      
      // Waiting list
      waitingListCount: league.waitingListCount || 0,
      
      // Legacy fields for backward compatibility
      playerCount: league.stats?.registeredPlayers || 0,
      
      // Timestamps
      createdAt: league.createdAt,
      updatedAt: league.updatedAt
    }

    return NextResponse.json({
      success: true,
      league: transformedLeague
    })

  } catch (error) {
    console.error('❌ Error fetching league by slug:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch league', 
        details: error.message 
      },
      { status: 500 }
    )
  }
}
