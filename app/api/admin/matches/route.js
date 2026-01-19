import { NextResponse } from 'next/server'
import dbConnect from '../../../../lib/db/mongoose'
import Match from '../../../../lib/models/Match'
import Player from '../../../../lib/models/Player'
import { requireAdmin } from '../../../../lib/auth/apiAuth'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

// GET /api/admin/matches - List matches
export async function GET(request) {
  try {
    // Check authentication
    const { session, error } = await requireAdmin(request)
    if (error) return error

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const league = searchParams.get('league')
    const season = searchParams.get('season')
    const round = searchParams.get('round')
    const status = searchParams.get('status')
    const player = searchParams.get('player')

    // Connect to database
    await dbConnect()

    // Build query
    const query = {}
    if (league) query.league = league
    if (season) query.season = season
    if (round) query.round = parseInt(round)
    if (status) query.status = status
    if (player) {
      query.$or = [
        { 'players.player1': player },
        { 'players.player2': player }
      ]
    }

    // Fetch matches with populated player data
    const matches = await Match.find(query)
      .populate('players.player1', 'name email level whatsapp stats.eloRating')
      .populate('players.player2', 'name email level whatsapp stats.eloRating')
      .populate('league', 'name')
      .sort({ round: -1, 'schedule.confirmedDate': -1 })
      .lean()

    // Filter out matches with null player references (orphaned after CSV import)
    // BUT keep BYE matches (they have player2 = null intentionally)
    const validMatches = matches.filter(match => 
      match.players?.player1 && (match.players?.player2 || match.isBye)
    )

    return NextResponse.json({
      matches: validMatches,
      total: validMatches.length
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })

  } catch (error) {
    console.error('Error fetching matches:', error)
    return NextResponse.json(
      { error: 'Failed to fetch matches' },
      { status: 500 }
    )
  }
}

// POST /api/admin/matches - Create a new match
export async function POST(request) {
  try {
    // Check authentication
    const { session, error } = await requireAdmin(request)
    if (error) return error

    const body = await request.json()
    const { league, season, round, player1Id, player2Id, schedule, isBye } = body

    // Validate required fields (player2Id not required for BYE)
    if (!league || !season || !round || !player1Id) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // For non-BYE matches, validate player2Id
    if (!isBye && !player2Id) {
      return NextResponse.json(
        { error: 'player2Id is required for non-BYE matches' },
        { status: 400 }
      )
    }

    // Validate players are different (only for non-BYE)
    if (!isBye && player1Id === player2Id) {
      return NextResponse.json(
        { error: 'Players must be different' },
        { status: 400 }
      )
    }

    // Connect to database
    await dbConnect()

    // Verify player1 exists
    const player1 = await Player.findById(player1Id)
    if (!player1) {
      return NextResponse.json(
        { error: 'Player 1 not found' },
        { status: 404 }
      )
    }

    // Check if player1 is registered in this league
    const player1InLeague = player1.registrations?.some(
      reg => reg.league.toString() === league
    )
    if (!player1InLeague) {
      return NextResponse.json(
        { error: 'Player must be registered in the specified league' },
        { status: 400 }
      )
    }

    // Handle BYE match creation
    if (isBye) {
      // Check if player already has a BYE in this round
      const existingBye = await Match.findOne({
        league,
        season,
        round,
        'players.player1': player1Id,
        isBye: true
      })

      if (existingBye) {
        return NextResponse.json(
          { error: 'Player already has a BYE in this round' },
          { status: 400 }
        )
      }

      // Check if player already has any match in this round
      const existingMatch = await Match.findOne({
        league,
        season,
        round,
        $or: [
          { 'players.player1': player1Id },
          { 'players.player2': player1Id }
        ]
      })

      if (existingMatch) {
        return NextResponse.json(
          { error: 'Player already has a match scheduled in this round' },
          { status: 400 }
        )
      }

      // Create BYE match
      const byeMatch = new Match({
        league,
        season,
        round,
        players: {
          player1: player1Id,
          player2: null
        },
        isBye: true,
        status: 'completed',
        result: {
          winner: player1Id,
          score: { player1: 2, player2: 0 },
          sets: [
            { player1: 6, player2: 0 },
            { player1: 6, player2: 0 }
          ]
        }
      })

      await byeMatch.save()
      await byeMatch.populate('players.player1')

      console.log(`Created BYE match for ${player1.name} in round ${round}`)

      return NextResponse.json({
        message: 'BYE match created successfully',
        match: byeMatch
      }, { status: 201 })
    }

    // Regular match creation (non-BYE)
    const player2 = await Player.findById(player2Id)
    if (!player2) {
      return NextResponse.json(
        { error: 'Player 2 not found' },
        { status: 404 }
      )
    }

    // Check if player2 is registered in this league
    const player2InLeague = player2.registrations?.some(
      reg => reg.league.toString() === league
    )
    if (!player2InLeague) {
      return NextResponse.json(
        { error: 'Player 2 must be registered in the specified league' },
        { status: 400 }
      )
    }

    // Check if match already exists between these players in this round
    const existingMatch = await Match.findOne({
      league,
      season,
      round,
      $or: [
        { 'players.player1': player1Id, 'players.player2': player2Id },
        { 'players.player1': player2Id, 'players.player2': player1Id }
      ]
    })

    if (existingMatch) {
      return NextResponse.json(
        { error: 'Match already exists between these players in this round' },
        { status: 400 }
      )
    }

    // Create the match with default deadline if not provided
    const defaultDeadline = new Date()
    defaultDeadline.setDate(defaultDeadline.getDate() + 7) // 7 days from now
    defaultDeadline.setHours(23, 59, 59, 999) // End of day
    
    const match = new Match({
      league,
      season,
      round,
      players: {
        player1: player1Id,
        player2: player2Id
      },
      schedule: {
        ...schedule,
        deadline: schedule?.deadline || defaultDeadline
      },
      status: 'scheduled'
    })

    await match.save()

    // Populate player data for response
    await match.populate('players.player1 players.player2')

    return NextResponse.json({
      message: 'Match created successfully',
      match
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating match:', error)
    return NextResponse.json(
      { error: 'Failed to create match' },
      { status: 500 }
    )
  }
}
