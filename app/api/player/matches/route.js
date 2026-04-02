import { NextResponse } from 'next/server'
import { requirePlayer } from '@/lib/auth/apiAuth'
import dbConnect from '@/lib/db/mongoose'
import Match from '@/lib/models/Match'
import Player from '@/lib/models/Player'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

export async function GET(request) {
  try {
    const { session, error } = await requirePlayer(request)
    if (error) return error

    await dbConnect()

    // Get player details with registrations populated
    const player = await Player.findOne({ email: session.user.email })
      .populate('registrations.league', 'name slug location')
    if (!player) {
      return NextResponse.json({ matches: [] })
    }

    // Fetch matches for this player
    const matches = await Match.find({
      $or: [
        { 'players.player1': player._id },
        { 'players.player2': player._id }
      ]
    })
    .populate('players.player1', 'name email whatsapp')
    .populate('players.player2', 'name email whatsapp')
    .populate('league', 'name slug location') // Add league data with location object for multi-league support
    .sort('-createdAt')

    return NextResponse.json({ 
      matches: matches || [],
      player: {
        _id: player._id,
        name: player.name,
        registrations: player.registrations || [] // Include registrations for multi-league support
      }
    })
  } catch (error) {
    // On transient DB errors (stale connection after cold start), retry once with fresh connection
    console.error('Error fetching matches (attempt 1):', error.message)
    try {
      // Force fresh MongoDB connection
      const cached = global.mongoose
      if (cached) { cached.conn = null; cached.promise = null }
      await dbConnect()

      const { session: retrySession } = await requirePlayer(request)
      if (!retrySession) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
      }

      const player = await Player.findOne({ email: retrySession.user.email })
        .populate('registrations.league', 'name slug location')
      if (!player) {
        return NextResponse.json({ matches: [] })
      }

      const matches = await Match.find({
        $or: [
          { 'players.player1': player._id },
          { 'players.player2': player._id }
        ]
      })
      .populate('players.player1', 'name email whatsapp')
      .populate('players.player2', 'name email whatsapp')
      .populate('league', 'name slug location')
      .sort('-createdAt')

      console.log('✅ Matches retry succeeded after reconnect')
      return NextResponse.json({ 
        matches: matches || [],
        player: {
          _id: player._id,
          name: player.name,
          registrations: player.registrations || []
        }
      })
    } catch (retryError) {
      console.error('Error fetching matches (attempt 2 - giving up):', retryError.message)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
  }
}
