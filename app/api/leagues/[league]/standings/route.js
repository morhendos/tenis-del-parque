import { NextResponse } from 'next/server'
import dbConnect from '../../../../../lib/db/mongoose'
import League from '../../../../../lib/models/League'
import Player from '../../../../../lib/models/Player'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

export async function GET(request, { params }) {
  try {
    await dbConnect()
    
    const { league: slug } = params
    const { searchParams } = new URL(request.url)
    const season = searchParams.get('season') || 'Verano 2025'
    const level = searchParams.get('level')
    
    // Find league by slug
    const league = await League.findOne({ 
      slug: slug.toLowerCase(),
      status: 'active'
    })
    
    if (!league) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'League not found' 
        },
        { status: 404 }
      )
    }
    
    // Build query for players - include ALL players, not just active ones
    const query = { 
      league: league._id, 
      season: season
      // Removed status filter to show all players
    }
    if (level) query.level = level
    
    // Get players with standings sorted by performance
    const players = await Player.find(query)
      .sort({ 
        'stats.totalPoints': -1,  // Primary: total points
        'stats.setsWon': -1,      // Secondary: sets won
        'stats.gamesWon': -1,     // Tertiary: games won
        'name': 1                 // Quaternary: alphabetical by name
      })
      .lean()
    
    // Calculate additional stats for each player
    const standings = players.map((player, index) => {
      const winPercentage = player.stats.matchesPlayed > 0 
        ? Math.round((player.stats.matchesWon / player.stats.matchesPlayed) * 100)
        : 0
      
      const setPercentage = (player.stats.setsWon + player.stats.setsLost) > 0
        ? Math.round((player.stats.setsWon / (player.stats.setsWon + player.stats.setsLost)) * 100)
        : 0
      
      // Calculate points based on new scoring system:
      // Win 2-0: 3 points, Win 2-1: 2 points, Lose 1-2: 1 point, Lose 0-2: 0 points
      const totalPoints = player.stats.totalPoints || 0
      
      return {
        position: index + 1,
        player: {
          _id: player._id,
          name: player.name,
          level: player.level,
          status: player.status  // Include player status for frontend styling
        },
        stats: {
          matchesPlayed: player.stats.matchesPlayed || 0,
          matchesWon: player.stats.matchesWon || 0,
          matchesLost: (player.stats.matchesPlayed || 0) - (player.stats.matchesWon || 0),
          winPercentage,
          setsWon: player.stats.setsWon || 0,
          setsLost: player.stats.setsLost || 0,
          setPercentage,
          gamesWon: player.stats.gamesWon || 0,
          gamesLost: player.stats.gamesLost || 0,
          totalPoints,
          eloRating: player.stats.eloRating || 1200,
          eloChange: (player.stats.eloRating || 1200) - 1200 // Change from starting ELO
        }
      }
    })
    
    // Get current round info
    const Match = (await import('../../../../../lib/models/Match')).default
    const latestRound = await Match.findOne({ 
      league: league._id, 
      season 
    }).sort({ round: -1 }).select('round')
    
    return NextResponse.json({
      success: true,
      league: {
        _id: league._id,
        name: league.name,
        slug: league.slug
      },
      season,
      unifiedStandings: standings,
      currentRound: latestRound?.round || 0,
      totalPlayers: players.length,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('League standings error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error' 
      },
      { status: 500 }
    )
  }
} 