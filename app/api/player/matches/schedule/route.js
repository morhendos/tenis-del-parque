import { NextResponse } from 'next/server'
import dbConnect from '../../../../../lib/db/mongoose'
import Match from '../../../../../lib/models/Match'
import Player from '../../../../../lib/models/Player'
import User from '../../../../../lib/models/User'
import { requirePlayer } from '../../../../../lib/auth/apiAuth'

export async function POST(request) {
  try {
    await dbConnect()
    
    // Use new NextAuth authentication system
    const { session, error } = await requirePlayer(request)
    if (error) return error

    const { matchId, date, time, venue, court, notes } = await request.json()

    // Validate required fields
    if (!matchId || !date || !time || !venue) {
      return NextResponse.json({ 
        success: false, 
        error: 'Match ID, date, time, and venue are required' 
      }, { status: 400 })
    }

    // Find the match
    const match = await Match.findById(matchId)
    if (!match) {
      return NextResponse.json({ success: false, error: 'Match not found' }, { status: 404 })
    }

    // Get user and player from session
    const user = await User.findById(session.user.id)
    if (!user || !user.playerId) {
      return NextResponse.json({ success: false, error: 'Player not found' }, { status: 404 })
    }

    const userPlayer = await Player.findById(user.playerId)
    if (!userPlayer) {
      return NextResponse.json({ success: false, error: 'Player not found' }, { status: 404 })
    }

    const isPlayer1 = match.players.player1.equals(userPlayer._id)
    const isPlayer2 = match.players.player2.equals(userPlayer._id)
    
    if (!isPlayer1 && !isPlayer2) {
      return NextResponse.json({ success: false, error: 'You are not part of this match' }, { status: 403 })
    }

    // Create datetime string
    const datetime = new Date(`${date}T${time}`)
    
    // Validate that the date is in the future
    if (datetime <= new Date()) {
      return NextResponse.json({ 
        success: false, 
        error: 'Match date must be in the future' 
      }, { status: 400 })
    }

    // Update match schedule to match the schema
    match.schedule = {
      ...match.schedule,
      confirmedDate: datetime,
      club: venue,
      court: court || '',
      time: time
    }
    
    // Add notes if provided
    if (notes) {
      match.notes = notes
    }

    await match.save()
    
    // Populate match data for response
    await match.populate('players.player1 players.player2 league')

    return NextResponse.json({ 
      success: true, 
      message: 'Match scheduled successfully',
      match: match
    })

  } catch (error) {
    console.error('Error scheduling match:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 })
  }
} 