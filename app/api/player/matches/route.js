import { NextResponse } from 'next/server'
import dbConnect from '../../../../lib/db/mongoose'
import Match from '../../../../lib/models/Match'
import Player from '../../../../lib/models/Player'
import User from '../../../../lib/models/User'
import { verifyToken } from '../../../../lib/utils/jwt'

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic'

export async function GET(request) {
  try {
    // Get token from cookie
    const token = request.cookies.get('auth-token')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Verify token
    const decoded = await verifyToken(token)
    
    if (!decoded || decoded.role !== 'player') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    await dbConnect()

    // Get user details
    const user = await User.findById(decoded.userId).select('-password')
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
