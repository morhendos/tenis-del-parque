import { NextResponse } from 'next/server'
import mongoose from 'mongoose'
import dbConnect from '../../../../lib/db/mongoose'
import League from '../../../../lib/models/League'
import Player from '../../../../lib/models/Player'
import City from '../../../../lib/models/City'
import { requireAdmin } from '../../../../lib/auth/apiAuth'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

export async function GET(request) {
  try {
    const { session, error } = await requireAdmin(request)
    if (error) return error

    // Connect to database
    await dbConnect()

    // Fetch all leagues with basic info
    const leagues = await League.find({})
      .sort({ displayOrder: 1, 'location.city': 1 })
      .lean()

    // Get player counts for each league using the new registrations structure
    const leaguesWithStats = await Promise.all(leagues.map(async (league) => {
      
      // Count players with active statuses (pending, confirmed, active) in this league
      const activePlayerCount = await Player.countDocuments({ 
        'registrations': {
          $elemMatch: {
            'league': league._id,
            'status': { $in: ['pending', 'confirmed', 'active'] }
          }
        }
      })

      // Count players on waiting list for this league
      const waitingPlayerCount = await Player.countDocuments({ 
        'registrations': {
          $elemMatch: {
            'league': league._id,
            'status': 'waiting'
          }
        }
      })

      // Update the league document with the correct counts
      const updatedLeague = {
        ...league,
        playerCount: activePlayerCount,
        waitingListCount: waitingPlayerCount,
        // Update stats object
        stats: {
          ...league.stats,
          registeredPlayers: activePlayerCount,
          totalPlayers: activePlayerCount + waitingPlayerCount
        }
      }

      return updatedLeague
    }))

    return NextResponse.json({
      leagues: leaguesWithStats,
      total: leaguesWithStats.length
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })

  } catch (error) {
    console.error('Error fetching leagues:', error)
    return NextResponse.json(
      { error: 'Failed to fetch leagues' },
      { status: 500 }
    )
  }
}

export async function POST(request) {
  try {
    const { session, error } = await requireAdmin(request)
    if (error) return error

    // Connect to database
    await dbConnect()

    // Parse request body
    const data = await request.json()

    // Validate required fields
    if (!data.name || !data.slug || !data.location?.city || !data.location?.region) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if slug already exists
    const existingLeague = await League.findOne({ slug: data.slug })
    if (existingLeague) {
      return NextResponse.json(
        { error: 'A league with this slug already exists' },
        { status: 400 }
      )
    }

    // Validate required fields including season data
    if (!data.season?.type || !data.season?.year) {
      return NextResponse.json(
        { error: 'Missing required season data (type and year)' },
        { status: 400 }
      )
    }

    // Validate city reference if provided
    let cityId = null
    if (data.cityId) {
      const city = await City.findById(data.cityId)
      if (!city) {
        return NextResponse.json(
          { error: 'Invalid city reference' },
          { status: 400 }
        )
      }
      cityId = data.cityId
    }

    // Create new league
    const league = new League({
      name: data.name,
      slug: data.slug.toLowerCase(),
      skillLevel: data.skillLevel || 'all',
      season: {
        type: data.season.type,
        year: data.season.year,
        number: data.season.number || 1
      },
      city: cityId, // Required field
      status: data.status || 'coming_soon',
      location: {
        city: data.location.city,
        region: data.location.region,
        country: data.location.country || 'Spain',
        timezone: data.location.timezone || 'Europe/Madrid'
      },
      description: {
        es: data.description?.es || '',
        en: data.description?.en || ''
      },
      expectedLaunchDate: data.expectedLaunchDate || null,
      displayOrder: data.displayOrder || 0,
      waitingListCount: 0,
      stats: {
        totalPlayers: 0,
        totalMatches: 0,
        registeredPlayers: 0
      },
      config: {
        roundsPerSeason: data.config?.roundsPerSeason || 8,
        wildCardsPerPlayer: data.config?.wildCardsPerPlayer || 4,
        playoffPlayers: data.config?.playoffPlayers || 8
      }
    })

    await league.save()

    return NextResponse.json({
      success: true,
      league
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating league:', error)
    return NextResponse.json(
      { error: 'Failed to create league: ' + error.message },
      { status: 500 }
    )
  }
}
