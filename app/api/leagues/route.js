import { NextResponse } from 'next/server'
import dbConnect from '../../../lib/db/mongoose'
import League from '../../../lib/models/League'
import Player from '../../../lib/models/Player'
import City from '../../../lib/models/City'  // 🚨 FIXED: Import City model

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

export async function GET(request) {
  try {
    // Connect to database (no auth required for public API)
    await dbConnect()
    console.log('✅ Database connected successfully')

    // Fetch all public leagues (active and coming_soon) with city data
    const leagues = await League.findPublicLeagues()
    console.log('📊 Raw leagues from database:', leagues.length, 'leagues found')
    
    if (leagues.length === 0) {
      console.warn('⚠️ NO LEAGUES FOUND IN DATABASE!')
      console.log('🔍 Checking all leagues in database...')
      
      // Check what's actually in the database
      const allLeagues = await League.find({})
      console.log('📋 All leagues in database:', allLeagues.map(l => ({
        name: l.name,
        slug: l.slug,
        status: l.status,
        location: l.location?.city
      })))
      
      return NextResponse.json({
        leagues: [],
        total: 0,
        debug: {
          totalLeaguesInDb: allLeagues.length,
          allLeagues: allLeagues.map(l => ({
            name: l.name,
            slug: l.slug,
            status: l.status,
            location: l.location?.city
          }))
        }
      })
    }

    // Get player count for each league and format city data
    const leaguesWithStats = await Promise.all(leagues.map(async (league) => {
      console.log(`🔄 Processing league: ${league.name} (${league.status})`)
      
      // Only count players for active leagues
      let playerCount = 0
      let playersByLevel = {}
      
      if (league.status === 'active') {
        // Count all players except inactive ones
        playerCount = await Player.countDocuments({ 
          league: league._id,
          status: { $in: ['pending', 'confirmed', 'active'] }
        })
        console.log(`👥 ${league.name} has ${playerCount} players`)

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

      console.log(`✅ League processed: ${league.name}`, {
        status: league.status,
        playerCount,
        cityData: cityData.name,
        expectedLaunchDate: league.expectedLaunchDate
      })

      return {
        ...leagueData,
        playerCount,
        playersByLevel,
        cityData // Add formatted city data for frontend
      }
    }))

    console.log('🎯 Final response:', {
      total: leaguesWithStats.length,
      activeLeagues: leaguesWithStats.filter(l => l.status === 'active').length,
      comingSoonLeagues: leaguesWithStats.filter(l => l.status === 'coming_soon').length
    })

    return NextResponse.json({
      leagues: leaguesWithStats,
      total: leaguesWithStats.length,
      success: true
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })

  } catch (error) {
    console.error('❌ LEAGUES API ERROR:', error)
    console.error('❌ Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    })
    
    return NextResponse.json({
      error: 'Failed to fetch leagues',
      message: error.message,
      success: false
    }, { 
      status: 500,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
  }
}
