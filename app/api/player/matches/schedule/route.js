import { NextResponse } from 'next/server'
import dbConnect from '../../../../../lib/db/mongoose'
import Match from '../../../../../lib/models/Match'
import Player from '../../../../../lib/models/Player'
import User from '../../../../../lib/models/User'
import { verifyAuth } from '../../../../../lib/utils/authMiddleware'

export async function POST(request) {
  try {
    await dbConnect()
    
    // Use existing JWT authentication system
    const auth = await verifyAuth(request, { role: 'player' })
    if (!auth.authenticated) {
      return auth.response
    }

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

    // Get user and player from JWT token
    const user = await User.findById(auth.user.userId)
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

    // Update match schedule
    match.schedule = {
      confirmedDate: datetime,
      date: date,
      time: time,
      venue: venue,
      court: court || '',
      notes: notes || '',
      scheduledBy: userPlayer._id,
      scheduledAt: new Date()
    }

    await match.save()

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