import { NextResponse } from 'next/server'
import dbConnect from '../../../../lib/db/mongoose'
import Player from '../../../../lib/models/Player'
import User from '../../../../lib/models/User'
import { requireAdmin } from '../../../../lib/auth/apiAuth'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

export async function GET(request) {
  try {
    // Check authentication
    const { session, error } = await requireAdmin(request)
    if (error) return error

    await dbConnect()

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const league = searchParams.get('league')
    const status = searchParams.get('status')
    const level = searchParams.get('level')
    const hasUser = searchParams.get('hasUser')

    // Build aggregation pipeline to handle new registrations structure
    let pipeline = []

    // First, unwind registrations to get individual league registrations
    pipeline.push(
      { $unwind: '$registrations' },
      {
        $lookup: {
          from: 'leagues',
          localField: 'registrations.league',
          foreignField: '_id',
          as: 'league'
        }
      },
      { $unwind: '$league' },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user'
        }
      }
    )

    // Build match conditions
    let matchConditions = {}
    
    if (league) {
      matchConditions['registrations.league'] = { $eq: require('mongoose').Types.ObjectId(league) }
    }
    
    if (status) {
      const statusValues = status.split(',')
      matchConditions['registrations.status'] = { $in: statusValues }
    }
    
    if (level) {
      matchConditions['registrations.level'] = level
    }
    
    // Filter by user account status
    if (hasUser === 'true') {
      matchConditions['userId'] = { $exists: true, $ne: null }
    } else if (hasUser === 'false') {
      matchConditions['$or'] = [
        { userId: { $exists: false } },
        { userId: null }
      ]
    }

    if (Object.keys(matchConditions).length > 0) {
      pipeline.push({ $match: matchConditions })
    }

    // Project the data in the expected format for backward compatibility
    pipeline.push({
      $project: {
        _id: 1,
        name: 1,
        email: 1,
        whatsapp: 1,
        userId: 1,
        registeredAt: '$registrations.registeredAt',
        createdAt: 1,
        updatedAt: 1,
        // Flatten registration data to root level for backward compatibility
        level: '$registrations.level',
        status: '$registrations.status',
        stats: '$registrations.stats',
        matchHistory: '$registrations.matchHistory',
        wildCards: '$registrations.wildCards',
        notes: '$registrations.notes',
        // League and user data
        league: { 
          _id: '$league._id',
          name: '$league.name',
          slug: '$league.slug'
        },
        user: { $arrayElemAt: ['$user', 0] }
      }
    })

    // Sort by registration date (newest first)
    pipeline.push({ $sort: { registeredAt: -1 } })

    console.log('Player aggregation pipeline:', JSON.stringify(pipeline, null, 2))

    // Execute aggregation
    const players = await Player.aggregate(pipeline)

    // If no league filter and we want ALL players across all leagues, 
    // we need a different approach since one player can be in multiple leagues
    if (!league && players.length === 0) {
      // Fall back to simpler query for all players
      const allPlayers = await Player
        .find({})
        .populate('userId', 'email role isActive emailVerified')
        .sort({ 'metadata.firstRegistrationDate': -1 })
        .lean()

      // Transform to flatten the first registration for backward compatibility
      const transformedPlayers = allPlayers.map(player => {
        const firstRegistration = player.registrations?.[0] || {}
        return {
          ...player,
          level: firstRegistration.level,
          status: firstRegistration.status,
          stats: firstRegistration.stats,
          matchHistory: firstRegistration.matchHistory,
          wildCards: firstRegistration.wildCards,
          notes: firstRegistration.notes,
          registeredAt: firstRegistration.registeredAt || player.createdAt,
          league: null // Will need to be populated separately if needed
        }
      })

      return NextResponse.json({
        success: true,
        players: transformedPlayers,
        total: transformedPlayers.length,
        timestamp: new Date().toISOString(),
        note: 'Fallback query - showing first registration for each player'
      }, {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
          'Surrogate-Control': 'no-store'
        }
      })
    }

    // Create response
    const response = NextResponse.json({
      success: true,
      players,
      total: players.length,
      timestamp: new Date().toISOString()
    })

    // Set headers to prevent ANY caching
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    response.headers.set('Surrogate-Control', 'no-store')
    
    return response

  } catch (error) {
    console.error('Players fetch error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch players',
        details: error.message
      },
      { status: 500 }
    )
  }
}
