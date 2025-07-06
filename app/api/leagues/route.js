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

    // Fetch all active leagues with basic info
    const leagues = await League.find({ status: 'active' })
      .sort({ 'location.city': 1 })
      .lean()

    // Get player count for each league (including all players regardless of level)
    const leaguesWithStats = await Promise.all(leagues.map(async (league) => {
      // Count all players except inactive ones
      const playerCount = await Player.countDocuments({ 
        league: league._id,
        status: { $in: ['pending', 'confirmed', 'active'] }
      })

      // Optional: Get breakdown by level for debugging
      const playersByLevel = await Player.aggregate([
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

      return {
        ...league,
        playerCount,
        playersByLevel: playersByLevel.reduce((acc, level) => {
          acc[level._id] = level.count
          return acc
        }, {})
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