import { NextResponse } from 'next/server'
import dbConnect from '../../../../../lib/db/mongoose'
import Match from '../../../../../lib/models/Match'
import Player from '../../../../../lib/models/Player'
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

    // Get player from session's playerId
    if (!session.user.playerId) {
      // Try to find player by email as fallback
      const playerByEmail = await Player.findOne({ email: session.user.email.toLowerCase() })
      
      if (!playerByEmail) {
        return NextResponse.json({ 
          success: false, 
          error: 'Your user account is not linked to a player profile. Please contact support to resolve this issue.',
          details: 'No playerId found in session and no player found with your email address.'
        }, { status: 404 })
      }
      
      // If we found a player with matching email, we could link them here
      // but for now just return an error to maintain data integrity
      return NextResponse.json({ 
        success: false, 
        error: 'Your user account is not properly linked to your player profile. Please contact support.',
        details: `Found player with email ${session.user.email} but accounts are not linked.`
      }, { status: 404 })
    }

    const userPlayer = await Player.findById(session.user.playerId)
    if (!userPlayer) {
      return NextResponse.json({ 
        success: false, 
        error: 'Player profile not found. Please contact support.',
        details: `PlayerId ${session.user.playerId} not found in database.`
      }, { status: 404 })
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