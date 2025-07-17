import { NextResponse } from 'next/server'
import dbConnect from '../../../../lib/db/mongoose'
import User from '../../../../lib/models/User'
import Player from '../../../../lib/models/Player'
import Match from '../../../../lib/models/Match'
import { requirePlayer } from '../../../../lib/auth/apiAuth'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

export async function GET(request) {
  try {
    // Use new NextAuth authentication system
    const { session, error } = await requirePlayer(request)
    if (error) return error

    await dbConnect()

    // Get user details
    const user = await User.findById(session.user.id).select('-password')
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Get player by email
    const player = await Player.findOne({ email: user.email })
    if (!player) {
      return NextResponse.json(
        { error: 'Player profile not found' },
        { status: 404 }
      )
    }

    // Get matches where the player is involved
    const matches = await Match.find({
      $or: [
        { 'players.player1': player._id },
        { 'players.player2': player._id }
      ]
    })
    .populate('players.player1', 'name level whatsapp stats.eloRating')
    .populate('players.player2', 'name level whatsapp stats.eloRating')
    .populate('league', 'name')
    .sort({ createdAt: -1 })

    return NextResponse.json({
      matches: matches.map(match => ({
        _id: match._id,
        league: match.league,
        season: match.season,
        round: match.round,
        players: match.players,
        schedule: match.schedule,
        result: match.result,
        status: match.status,
        eloChanges: match.eloChanges,
        createdAt: match.createdAt,
        updatedAt: match.updatedAt
      }))
    })
  } catch (error) {
    console.error('Error fetching player matches:', error)
    return NextResponse.json(
      { error: 'Failed to fetch matches' },
      { status: 500 }
    )
  }
}
