import { NextResponse } from 'next/server'
import dbConnect from '../../../../../lib/db/mongoose'
import League from '../../../../../lib/models/League'
import Match from '../../../../../lib/models/Match'
import mongoose from 'mongoose'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

// Helper function to get player level for a specific league
function getPlayerLevelForLeague(player, leagueId, season) {
  if (!player.registrations || player.registrations.length === 0) {
    return 'intermediate' // Default level
  }
  
  // Find registration for this league/season
  const registration = player.registrations.find(reg => 
    reg.league.toString() === leagueId.toString() && 
    reg.season === season
  )
  
  return registration?.level || player.registrations[0]?.level || 'intermediate'
}

export async function GET(request, { params }) {
  try {
    await dbConnect()
    
    const { league: identifier } = params
    const { searchParams } = new URL(request.url)
    const season = searchParams.get('season') || 'summer-2025'  // Use database format
    const status = searchParams.get('status') // 'completed', 'scheduled', etc.
    const round = searchParams.get('round')
    const limit = parseInt(searchParams.get('limit')) || 100 // INCREASED DEFAULT FROM 20 TO 100
    
    console.log('API: Fetching matches for league:', identifier, 'season:', season, 'status:', status)
    
    // Build query to support both ID and slug
    let query = {}
    
    // Check if identifier is a valid MongoDB ObjectId
    if (mongoose.Types.ObjectId.isValid(identifier)) {
      query._id = identifier
    } else {
      // Otherwise, treat it as a slug
      query.slug = identifier
    }
    
    // Find league by ID or slug - Remove status filter to be more lenient
    const league = await League.findOne(query)
    
    if (!league) {
      console.error('API: League not found for identifier:', identifier)
      return NextResponse.json(
        { 
          success: false, 
          error: 'League not found',
          debug: { identifier: identifier.toLowerCase() }
        },
        { status: 404 }
      )
    }
    
    console.log('API: Found league:', league.name, 'with ID:', league._id)
    console.log('API: League season:', league.season)
    
    // Use the league's season year and type for matching (to handle legacy matches with season.number)
    const matchQuery = { 
      league: league._id, 
      'season.year': league.season.year,
      'season.type': league.season.type
    }
    if (status) matchQuery.status = status
    if (round) matchQuery.round = parseInt(round)
    
    console.log('API: Match query:', JSON.stringify(matchQuery))
    
    // Get matches with player details (using global ELO)
    const matches = await Match.find(matchQuery)
      .populate('players.player1', 'name eloRating registrations')
      .populate('players.player2', 'name eloRating registrations')
      .populate('result.winner', 'name')
      .sort({ round: 1, 'schedule.confirmedDate': 1 })
      .limit(limit)
      .lean()
    
    console.log('API: Found', matches.length, 'matches')
    
    // Filter out matches with null player references (orphaned after CSV import)
    const validMatches = matches.filter(match => 
      match.players?.player1 && match.players?.player2
    )
    
    console.log('API: Filtered out', matches.length - validMatches.length, 'invalid matches')
    
    // Format matches for frontend
    const formattedMatches = validMatches.map(match => {
      const scoreString = match.result?.score?.sets?.map(set => 
        `${set.player1}-${set.player2}`
      ).join(', ') || ''
      
      return {
        _id: match._id,
        round: match.round,
        players: {
          player1: match.players.player1 ? {
            _id: match.players.player1._id,
            name: match.players.player1.name,
            level: getPlayerLevelForLeague(match.players.player1, match.league, match.season),
            eloRating: match.players.player1.eloRating || 1200 // Global ELO
          } : null,
          player2: match.players.player2 ? {
            _id: match.players.player2._id,
            name: match.players.player2.name,
            level: getPlayerLevelForLeague(match.players.player2, match.league, match.season),
            eloRating: match.players.player2.eloRating || 1200 // Global ELO
          } : null
        },
        schedule: {
          confirmedDate: match.schedule?.confirmedDate,
          deadline: match.schedule?.deadline,
          club: match.schedule?.club,
          court: match.schedule?.court,
          courtNumber: match.schedule?.courtNumber,
          time: match.schedule?.time
        },
        result: match.result ? {
          winner: match.result.winner ? {
            _id: match.result.winner._id,
            name: match.result.winner.name
          } : null,
          score: match.result.score, // Keep original score structure with sets array
          scoreString: scoreString, // Also provide string representation for display
          playedAt: match.result.playedAt
        } : null,
        eloChanges: match.eloChanges || null,
        status: match.status,
        createdAt: match.createdAt
      }
    })
    
    // Get match statistics
    const totalMatches = await Match.countDocuments({ 
      league: league._id, 
      'season.year': league.season.year,
      'season.type': league.season.type
    })
    const completedMatches = await Match.countDocuments({ 
      league: league._id, 
      'season.year': league.season.year,
      'season.type': league.season.type,
      status: 'completed' 
    })
    const scheduledMatches = await Match.countDocuments({ 
      league: league._id, 
      'season.year': league.season.year,
      'season.type': league.season.type,
      status: 'scheduled' 
    })
    
    // Get current round info
    const latestRound = await Match.findOne({ 
      league: league._id, 
      'season.year': league.season.year,
      'season.type': league.season.type
    }).sort({ round: -1 }).select('round')
    
    return NextResponse.json({
      success: true,
      league: {
        _id: league._id,
        name: league.name,
        slug: league.slug,
        status: league.status
      },
      season,
      matches: formattedMatches,
      stats: {
        totalMatches,
        completedMatches,
        scheduledMatches,
        currentRound: latestRound?.round || 0
      },
      filters: {
        status,
        round,
        limit
      },
      debug: {
        query: matchQuery,
        matchCount: matches.length,
        leagueStatus: league.status
      },
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('League matches error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        details: error.message
      },
      { status: 500 }
    )
  }
} 
