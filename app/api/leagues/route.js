import { NextResponse } from 'next/server'
import dbConnect from '../../../lib/db/mongoose'
import League from '../../../lib/models/League'
import City from '../../../lib/models/City'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    await dbConnect()
    
    console.log('🔍 Fetching leagues for public display...')
    
    // First, let's see all leagues to debug
    const allLeagues = await League.find({})
      .populate('city', 'slug name')
      .select('name status season city createdAt')
      .sort({ createdAt: -1 })
      .limit(10)
    
    console.log('🔍 Recent leagues (all statuses):')
    allLeagues.forEach(league => {
      console.log(`- ${league.name} | Status: ${league.status} | City: ${league.city?.name?.es || 'No city'} | Created: ${league.createdAt}`)
    })
    
    // Get all public leagues with city data
    const leagues = await League.find({ 
      status: { $in: ['active', 'coming_soon', 'registration_open'] } 
    })
    .populate('city', 'slug name images coordinates googleData province')
    .sort({ 
      displayOrder: 1,
      'season.year': -1,    // Latest year first
      'season.type': 1,     // Spring, Summer, Autumn, Winter
      'season.number': 1,   // Season 1, Season 2, etc.
      skillLevel: 1,        // all, beginner, intermediate, advanced
      createdAt: 1 
    })
    .lean()

    console.log(`📊 Found ${leagues.length} public leagues`)

    // Transform leagues for frontend with enhanced data
    const transformedLeagues = leagues.map(league => {
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

      // Get display names
      const skillLevelNames = {
        es: {
          all: 'General',
          beginner: 'Principiantes', 
          intermediate: 'Intermedio',
          advanced: 'Avanzado'
        },
        en: {
          all: 'General',
          beginner: 'Beginners',
          intermediate: 'Intermediate',
          advanced: 'Advanced'
        }
      }

      const seasonTypeNames = {
        es: {
          spring: 'Primavera',
          summer: 'Verano',
          autumn: 'Otoño',
          winter: 'Invierno',
          annual: 'Anual'
        },
        en: {
          spring: 'Spring',
          summer: 'Summer',
          autumn: 'Autumn',
          winter: 'Winter',
          annual: 'Annual'
        }
      }

      return {
        _id: league._id,
        name: league.name,
        slug: league.slug,
        
        // Enhanced display info
        displayName: {
          es: league.name,
          en: league.name
        },
        
        // Season information
        season: league.season ? {
          year: league.season.year,
          type: league.season.type,
          number: league.season.number,
          displayName: {
            es: `${seasonTypeNames.es[league.season.type]} ${league.season.year}${league.season.number > 1 ? ` - T${league.season.number}` : ''}`,
            en: `${seasonTypeNames.en[league.season.type]} ${league.season.year}${league.season.number > 1 ? ` - S${league.season.number}` : ''}`
          }
        } : null,
        
        // Skill level information
        skillLevel: {
          value: league.skillLevel || 'all',
          displayName: {
            es: skillLevelNames.es[league.skillLevel] || 'General',
            en: skillLevelNames.en[league.skillLevel] || 'General'
          }
        },
        
        // Full league name including skill level and season
        fullName: {
          es: (() => {
            const cityName = cityData.name?.es || league.location?.city
            const skillName = league.skillLevel === 'all' ? '' : ` ${skillLevelNames.es[league.skillLevel]}`
            const seasonName = league.season ? ` ${seasonTypeNames.es[league.season.type]} ${league.season.year}` : ''
            const seasonNumber = league.season?.number > 1 ? ` - T${league.season.number}` : ''
            return `Liga ${cityName}${skillName}${seasonName}${seasonNumber}`
          })(),
          en: (() => {
            const cityName = cityData.name?.en || league.location?.city
            const skillName = league.skillLevel === 'all' ? '' : ` ${skillLevelNames.en[league.skillLevel]}`
            const seasonName = league.season ? ` ${seasonTypeNames.en[league.season.type]} ${league.season.year}` : ''
            const seasonNumber = league.season?.number > 1 ? ` - S${league.season.number}` : ''
            return `${cityName}${skillName} League${seasonName}${seasonNumber}`
          })()
        },
        
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
        seasonConfig: league.seasonConfig ? {
          startDate: league.seasonConfig.startDate,
          endDate: league.seasonConfig.endDate,
          registrationStart: league.seasonConfig.registrationStart,
          registrationEnd: league.seasonConfig.registrationEnd,
          maxPlayers: league.seasonConfig.maxPlayers,
          minPlayers: league.seasonConfig.minPlayers,
          price: league.seasonConfig.price
        } : null,
        
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
        seasons: league.seasons || [], // Keep for backward compatibility
        
        // Timestamps
        createdAt: league.createdAt,
        updatedAt: league.updatedAt
      }
    })

    // Group leagues by city and skill level for better organization
    const leagueGroups = {}
    transformedLeagues.forEach(league => {
      const citySlug = league.cityData?.slug || 'unknown'
      const skillLevel = league.skillLevel.value
      const groupKey = `${citySlug}-${skillLevel}`
      
      if (!leagueGroups[groupKey]) {
        leagueGroups[groupKey] = {
          city: league.cityData,
          skillLevel: league.skillLevel,
          leagues: []
        }
      }
      
      leagueGroups[groupKey].leagues.push(league)
    })

    // Sort groups by city name and skill level
    const sortedGroups = Object.values(leagueGroups).sort((a, b) => {
      const cityCompare = (a.city?.name?.es || '').localeCompare(b.city?.name?.es || '')
      if (cityCompare !== 0) return cityCompare
      
      const skillOrder = { all: 0, beginner: 1, intermediate: 2, advanced: 3 }
      return (skillOrder[a.skillLevel.value] || 0) - (skillOrder[b.skillLevel.value] || 0)
    })

    const stats = {
      total: transformedLeagues.length,
      active: transformedLeagues.filter(l => l.status === 'active').length,
      comingSoon: transformedLeagues.filter(l => l.status === 'coming_soon').length,
      registrationOpen: transformedLeagues.filter(l => l.status === 'registration_open').length,
      cities: new Set(transformedLeagues.map(l => l.cityData?.slug).filter(Boolean)).size,
      skillLevels: new Set(transformedLeagues.map(l => l.skillLevel.value)).size
    }

    console.log('📈 League statistics:', stats)

    return NextResponse.json({
      success: true,
      leagues: transformedLeagues,
      leagueGroups: sortedGroups,
      stats,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ Error fetching leagues:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch leagues', 
        details: error.message 
      },
      { status: 500 }
    )
  }
}
