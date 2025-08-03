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

    // Fetch all public leagues (active and coming_soon) with city data
    const leagues = await League.findPublicLeagues()

    // Get player count for each league and format city data
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

      // Format league data with city information
      const leagueData = league.toObject()
      
      // Add cityData for frontend consumption
      const cityData = {
        name: league.getCityName ? league.getCityName() : (league.location?.city || 'Unknown'),
        slug: league.getCitySlug ? league.getCitySlug() : league.slug,
        images: league.getCityImages ? league.getCityImages() : null,
        coordinates: league.city?.coordinates || null,
        googleData: league.city?.googleData || null
      }

      return {
        ...leagueData,
        playerCount,
        playersByLevel,
        cityData // Add formatted city data for frontend
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
