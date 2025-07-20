import { NextResponse } from 'next/server'
import dbConnect from '../../../lib/db/mongoose'
import League from '../../../lib/models/League'
import Player from '../../../lib/models/Player'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

export async function GET(request) {
  try {
    // Connect to database (no auth required for public API)
    await dbConnect()

    // Fetch all public leagues (active and coming_soon) using the model method
    const leagues = await League.findPublicLeagues()

    // Get player count for each league (including all players regardless of level)
    const leaguesWithStats = await Promise.all(leagues.map(async (league) => {
      // Only count players for active leagues
      let playerCount = 0
      let playersByLevel = {}
      
      if (league.status === 'active') {
        // Count all players except inactive ones
        playerCount = await Player.countDocuments({ 
          league: league._id,
          status: { $in: ['pending', 'confirmed', 'active'] }
        })

        // Optional: Get breakdown by level for debugging
        const levelBreakdown = await Player.aggregate([
          { 
            $match: { 
              league: league._id,
              status: { $in: ['pending', 'confirmed', 'active'] }
            }
          },
          {
            $group: {
              _id: '$level',
              count: { $sum: 1 }
            }
          }
        ])

        playersByLevel = levelBreakdown.reduce((acc, level) => {
          acc[level._id] = level.count
          return acc
        }, {})
      }

      return {
        ...league.toObject(),
        playerCount,
        playersByLevel
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