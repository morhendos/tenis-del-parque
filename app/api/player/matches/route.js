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

    // Get player details
    const player = await Player.findOne({ email: session.user.email })
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
    .sort('-createdAt')

    return NextResponse.json({ 
      matches: matches || [],
      player: {
        _id: player._id,
        name: player.name
      }
    })
  } catch (error) {
    console.error('Error fetching matches:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
