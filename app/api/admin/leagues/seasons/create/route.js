import { NextResponse } from 'next/server'
import dbConnect from '../../../../../../lib/db/mongoose'
import League from '../../../../../../lib/models/League'
import City from '../../../../../../lib/models/City'
import { requireAdmin } from '../../../../../../lib/auth/apiAuth'

export const dynamic = 'force-dynamic'

// POST /api/admin/leagues/seasons/create - Create a new season
export async function POST(request) {
  try {
    const { session, error } = await requireAdmin(request)
    if (error) return error

    await dbConnect()
    
    const {
      baseLeagueId,
      seasonData,
      isNewLeague = false // Flag to create completely new league vs new season of existing league
    } = await request.json()

    let newLeague

    if (isNewLeague) {
      // Create completely new league
      const cityId = seasonData.cityId
      const city = await City.findById(cityId)
      if (!city) {
        return NextResponse.json({ error: 'City not found' }, { status: 404 })
      }

      // Generate slug
      const citySlug = city.slug
      const skillSlug = seasonData.skillLevel === 'all' ? '' : `-${seasonData.skillLevel}`
      const seasonSlug = `${citySlug}${skillSlug}-${seasonData.season.type}-${seasonData.season.year}`
      
      newLeague = new League({
        name: seasonData.name,
        slug: seasonSlug,
        skillLevel: seasonData.skillLevel,
        season: seasonData.season,
        city: cityId,
        location: {
          city: city.name.es || city.name.en,
          region: city.province || 'Málaga',
          country: 'Spain',
          timezone: 'Europe/Madrid'
        },
        description: seasonData.description || {},
        seasonConfig: seasonData.seasonConfig,
        config: seasonData.config || {
          roundsPerSeason: 8,
          wildCardsPerPlayer: 4,
          playoffPlayers: 8
        },
        contact: seasonData.contact || {},
        status: seasonData.status || 'coming_soon',
        expectedLaunchDate: seasonData.expectedLaunchDate,
        displayOrder: seasonData.displayOrder || 0
      })

      await newLeague.save()
      await newLeague.populate('city')
      
    } else {
      // Create new season for existing league
      if (!baseLeagueId) {
        return NextResponse.json({ error: 'Base league ID is required for new season' }, { status: 400 })
      }

      console.log('🔍 Creating new season for base league:', baseLeagueId)
      console.log('🔍 Season data:', seasonData)
      
      newLeague = await League.createNewSeason(baseLeagueId, seasonData)
    }

    // Ensure the league is populated with city data before accessing virtual properties
    if (!newLeague.populated('city')) {
      await newLeague.populate('city')
    }

    console.log(`✅ Created new ${isNewLeague ? 'league' : 'season'}: ${newLeague.name}`)

    return NextResponse.json({
      success: true,
      league: newLeague,
      message: `${isNewLeague ? 'League' : 'Season'} created successfully`
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating season/league:', error)
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return NextResponse.json({
        error: 'A league with this city, skill level, and season already exists',
        details: error.message
      }, { status: 409 })
    }

    return NextResponse.json({
      error: 'Failed to create season/league',
      details: error.message
    }, { status: 500 })
  }
}

// GET /api/admin/leagues/seasons/create - Get data for creating new seasons
export async function GET(request) {
  try {
    const { session, error } = await requireAdmin(request)
    if (error) return error

    await dbConnect()

    // Get all cities for selection
    const cities = await City.find({ status: 'active' })
      .select('_id slug name')
      .sort({ 'name.es': 1 })

    // Get existing leagues for reference
    const existingLeagues = await League.find({ status: { $ne: 'inactive' } })
      .populate('city', 'slug name')
      .select('_id name slug skillLevel season city status')
      .sort({ 'season.year': -1, 'season.type': 1 })

    // Group existing leagues by city and skill level
    const leagueGroups = {}
    existingLeagues.forEach(league => {
      const citySlug = league.city?.slug || 'unknown'
      const skillLevel = league.skillLevel
      const key = `${citySlug}-${skillLevel}`
      
      if (!leagueGroups[key]) {
        leagueGroups[key] = {
          city: league.city,
          skillLevel: skillLevel,
          leagues: []
        }
      }
      leagueGroups[key].leagues.push(league)
    })

    return NextResponse.json({
      cities,
      existingLeagues,
      leagueGroups,
      skillLevels: [
        { value: 'all', label: { es: 'General', en: 'General' } },
        { value: 'beginner', label: { es: 'Principiantes', en: 'Beginners' } },
        { value: 'intermediate', label: { es: 'Intermedio', en: 'Intermediate' } },
        { value: 'advanced', label: { es: 'Avanzado', en: 'Advanced' } }
      ],
      seasonTypes: [
        { value: 'spring', label: { es: 'Primavera', en: 'Spring' } },
        { value: 'summer', label: { es: 'Verano', en: 'Summer' } },
        { value: 'autumn', label: { es: 'Otoño', en: 'Autumn' } },
        { value: 'winter', label: { es: 'Invierno', en: 'Winter' } },
        { value: 'annual', label: { es: 'Anual', en: 'Annual' } }
      ],
      statusOptions: [
        { value: 'coming_soon', label: { es: 'Próximamente', en: 'Coming Soon' } },
        { value: 'registration_open', label: { es: 'Inscripciones Abiertas', en: 'Registration Open' } },
        { value: 'active', label: { es: 'Activa', en: 'Active' } }
      ]
    })

  } catch (error) {
    console.error('Error fetching season creation data:', error)
    return NextResponse.json({
      error: 'Failed to fetch creation data',
      details: error.message
    }, { status: 500 })
  }
}
