import { NextResponse } from 'next/server'
import dbConnect from '../../../../lib/db/mongoose'
import Match from '../../../../lib/models/Match'
import Player from '../../../../lib/models/Player'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

async function isAuthenticated() {
  const cookieStore = cookies()
  const sessionCookie = cookieStore.get('admin_session')
  return !!sessionCookie?.value
}

// GET /api/admin/matches - List matches
export async function GET(request) {
  try {
    // Check authentication
    if (!await isAuthenticated()) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

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

    return NextResponse.json({
      matches,
      total: matches.length
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
    if (!await isAuthenticated()) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { league, season, round, player1Id, player2Id, schedule } = body

    // Validate required fields
    if (!league || !season || !round || !player1Id || !player2Id) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate players are different
    if (player1Id === player2Id) {
      return NextResponse.json(
        { error: 'Players must be different' },
        { status: 400 }
      )
    }

    // Connect to database
    await dbConnect()

    // Verify both players exist and belong to the league
    const [player1, player2] = await Promise.all([
      Player.findById(player1Id),
      Player.findById(player2Id)
    ])

    if (!player1 || !player2) {
      return NextResponse.json(
        { error: 'One or both players not found' },
        { status: 404 }
      )
    }

    if (player1.league.toString() !== league || player2.league.toString() !== league) {
      return NextResponse.json(
        { error: 'Players must belong to the same league' },
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

    // Create the match
    const match = new Match({
      league,
      season,
      round,
      players: {
        player1: player1Id,
        player2: player2Id
      },
      schedule: schedule || {},
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
