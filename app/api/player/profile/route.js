import { NextResponse } from 'next/server'
import dbConnect from '../../../../lib/db/mongoose'
import Player from '../../../../lib/models/Player'
import User from '../../../../lib/models/User'
import { verifyToken } from '../../../../lib/utils/jwt'

export async function GET(request) {
  try {
    // Get token from cookie
    const token = request.cookies.get('player-token')?.value

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

    // Get player details by email
    const player = await Player.findOne({ email: user.email })
      .populate('league', 'name slug')
      .populate('matchHistory.opponent', 'name')

    if (!player) {
      return NextResponse.json(
        { error: 'Player profile not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      player: {
        _id: player._id,
        name: player.name,
        email: player.email,
        whatsapp: player.whatsapp,
        level: player.level,
        league: player.league,
        season: player.season,
        status: player.status,
        stats: player.stats,
        wildCards: player.wildCards,
        registeredAt: player.registeredAt
      },
      user: {
        id: user._id,
        email: user.email,
        role: user.role
      }
    })
  } catch (error) {
    console.error('Error fetching player profile:', error)
    return NextResponse.json(
      { error: 'Failed to fetch player profile' },
      { status: 500 }
    )
  }
}
