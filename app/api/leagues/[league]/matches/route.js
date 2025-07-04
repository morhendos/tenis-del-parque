import { NextResponse } from 'next/server'
import dbConnect from '../../../../../lib/db/mongoose'
import League from '../../../../../lib/models/League'
import Match from '../../../../../lib/models/Match'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

export async function GET(request, { params }) {
  try {
    await dbConnect()
    
    const { league: slug } = params
    const { searchParams } = new URL(request.url)
    const season = searchParams.get('season') || 'Verano 2025'
    const status = searchParams.get('status') // 'completed', 'scheduled', etc.
    const round = searchParams.get('round')
    const limit = parseInt(searchParams.get('limit')) || 20
    
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
    
    // Build query for matches
    const query = { 
      league: league._id, 
      season: season
    }
    if (status) query.status = status
    if (round) query.round = parseInt(round)
    
    // Get matches with player details
    const matches = await Match.find(query)
      .populate('players.player1', 'name level stats.eloRating')
      .populate('players.player2', 'name level stats.eloRating')
      .populate('result.winner', 'name')
      .sort({ 'result.playedAt': -1, 'schedule.confirmedDate': -1 })
      .limit(limit)
      .lean()
    
    // Format matches for frontend
    const formattedMatches = matches.map(match => {
      const score = match.result?.score?.sets?.map(set => 
        `${set.player1}-${set.player2}`
      ).join(', ') || ''
      
      return {
        _id: match._id,
        round: match.round,
        players: {
          player1: {
            _id: match.players.player1._id,
            name: match.players.player1.name,
            level: match.players.player1.level,
            eloRating: match.players.player1.stats?.eloRating || 1200
          },
          player2: {
            _id: match.players.player2._id,
            name: match.players.player2.name,
            level: match.players.player2.level,
            eloRating: match.players.player2.stats?.eloRating || 1200
          }
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
          score,
          playedAt: match.result.playedAt
        } : null,
        eloChanges: match.eloChanges || null,
        status: match.status,
        createdAt: match.createdAt
      }
    })
    
    // Get match statistics
    const totalMatches = await Match.countDocuments({ league: league._id, season })
    const completedMatches = await Match.countDocuments({ 
      league: league._id, 
      season, 
      status: 'completed' 
    })
    const scheduledMatches = await Match.countDocuments({ 
      league: league._id, 
      season, 
      status: 'scheduled' 
    })
    
    // Get current round info
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
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('League matches error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error' 
      },
      { status: 500 }
    )
  }
} 