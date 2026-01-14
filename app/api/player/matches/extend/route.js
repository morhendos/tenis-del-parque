import { NextResponse } from 'next/server'
import dbConnect from '../../../../../lib/db/mongoose'
import Match from '../../../../../lib/models/Match'
import Player from '../../../../../lib/models/Player'
import { requirePlayer } from '../../../../../lib/auth/apiAuth'

const EXTENSION_DAYS = 7

export async function POST(request) {
  try {
    await dbConnect()
    
    // Use NextAuth authentication system
    const { session, error } = await requirePlayer(request)
    if (error) return error

    const { matchId } = await request.json()

    // Validate required fields
    if (!matchId) {
      return NextResponse.json({ 
        success: false, 
        error: 'Match ID is required' 
      }, { status: 400 })
    }

    // Find the match
    const match = await Match.findById(matchId).populate('league')
    if (!match) {
      return NextResponse.json({ success: false, error: 'Match not found' }, { status: 404 })
    }

    // Get player from session's playerId
    if (!session.user.playerId) {
      return NextResponse.json({ 
        success: false, 
        error: 'Your user account is not linked to a player profile.'
      }, { status: 404 })
    }

    const userPlayer = await Player.findById(session.user.playerId)
    if (!userPlayer) {
      return NextResponse.json({ 
        success: false, 
        error: 'Player profile not found.'
      }, { status: 404 })
    }

    // Check player is part of this match
    const isPlayer1 = match.players.player1.equals(userPlayer._id)
    const isPlayer2 = match.players.player2.equals(userPlayer._id)
    
    if (!isPlayer1 && !isPlayer2) {
      return NextResponse.json({ success: false, error: 'You are not part of this match' }, { status: 403 })
    }

    // Check if match is already completed
    if (match.status === 'completed' || match.result?.winner) {
      return NextResponse.json({ 
        success: false, 
        error: 'Cannot extend deadline for a completed match' 
      }, { status: 400 })
    }

    // Find player's registration for this league
    const registration = userPlayer.registrations.find(reg => 
      reg.league.toString() === match.league._id.toString()
    )
    
    if (!registration) {
      return NextResponse.json({ 
        success: false, 
        error: 'You are not registered for this league' 
      }, { status: 403 })
    }

    // Initialize extensions if not present (for existing players)
    if (!registration.extensions) {
      registration.extensions = { total: 3, used: 0, history: [] }
    }

    // Check if player has extensions remaining
    const extensionsRemaining = registration.extensions.total - registration.extensions.used
    if (extensionsRemaining <= 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'No extensions remaining this season',
        extensionsRemaining: 0
      }, { status: 400 })
    }

    // Get current deadline (or create one based on current date if none exists)
    const currentDeadline = match.schedule?.deadline || new Date()
    const newDeadline = new Date(currentDeadline)
    newDeadline.setDate(newDeadline.getDate() + EXTENSION_DAYS)

    // Update match deadline
    if (!match.schedule) {
      match.schedule = {}
    }
    if (!match.schedule.extensionHistory) {
      match.schedule.extensionHistory = []
    }

    const previousDeadline = match.schedule.deadline
    match.schedule.deadline = newDeadline
    match.schedule.extensionHistory.push({
      player: userPlayer._id,
      usedAt: new Date(),
      previousDeadline: previousDeadline || currentDeadline,
      newDeadline: newDeadline
    })

    await match.save()

    // Update player's extension count
    registration.extensions.used += 1
    if (!registration.extensions.history) {
      registration.extensions.history = []
    }
    registration.extensions.history.push({
      match: match._id,
      usedAt: new Date(),
      previousDeadline: previousDeadline || currentDeadline,
      newDeadline: newDeadline
    })

    await userPlayer.save()

    // Populate match data for response
    await match.populate('players.player1 players.player2 league')

    return NextResponse.json({ 
      success: true, 
      message: 'Match deadline extended successfully',
      match: match,
      newDeadline: newDeadline,
      extensionsRemaining: extensionsRemaining - 1
    })

  } catch (error) {
    console.error('Error extending match deadline:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}

// GET endpoint to check extensions status for a match
export async function GET(request) {
  try {
    await dbConnect()
    
    const { session, error } = await requirePlayer(request)
    if (error) return error

    const { searchParams } = new URL(request.url)
    const matchId = searchParams.get('matchId')

    if (!matchId) {
      return NextResponse.json({ 
        success: false, 
        error: 'Match ID is required' 
      }, { status: 400 })
    }

    const match = await Match.findById(matchId).populate('league')
    if (!match) {
      return NextResponse.json({ success: false, error: 'Match not found' }, { status: 404 })
    }

    const userPlayer = await Player.findById(session.user.playerId)
    if (!userPlayer) {
      return NextResponse.json({ success: false, error: 'Player not found' }, { status: 404 })
    }

    const registration = userPlayer.registrations.find(reg => 
      reg.league.toString() === match.league._id.toString()
    )

    // Initialize extensions if not present
    const extensions = registration?.extensions || { total: 3, used: 0 }
    const extensionsRemaining = extensions.total - extensions.used

    return NextResponse.json({
      success: true,
      deadline: match.schedule?.deadline,
      extensionsRemaining,
      extensionHistory: match.schedule?.extensionHistory || []
    })

  } catch (error) {
    console.error('Error getting extension status:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}
