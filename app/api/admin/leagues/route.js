import { NextResponse } from 'next/server'
import dbConnect from '../../../../lib/db/mongoose'
import League from '../../../../lib/models/League'
import Player from '../../../../lib/models/Player'
import { verifyAdminAuth } from '../../../../lib/utils/adminAuth'

export const dynamic = 'force-dynamic'

export async function GET(request) {
  try {
    // Check authentication
    const auth = await verifyAdminAuth(request)
    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: 401 })
    }

    // Connect to database
    await dbConnect()

    // Fetch all leagues with basic info
    const leagues = await League.find({})
      .sort({ 'location.city': 1 })
      .lean()

    // Get player count for each league
    const leaguesWithStats = await Promise.all(leagues.map(async (league) => {
      const playerCount = await Player.countDocuments({ 
        league: league._id,
        status: { $in: ['pending', 'confirmed', 'active'] }
      })

      return {
        ...league,
        playerCount
      }
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
