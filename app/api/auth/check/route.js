import { NextResponse } from 'next/server'
import { verifyToken } from '../../../../lib/utils/jwt'
import dbConnect from '../../../../lib/db/mongoose'
import User from '../../../../lib/models/User'
import Player from '../../../../lib/models/Player'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

export async function GET(request) {
  try {
    // Get token from cookie
    const token = request.cookies.get('auth-token')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'No token found' },
        { status: 401 }
      )
    }

    // Verify token
    const decoded = await verifyToken(token)
    
    if (!decoded || decoded.role !== 'player') {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }

    // Connect to database
    await dbConnect()

    // Fetch user data to get seenAnnouncements
    const user = await User.findById(decoded.userId)
    const player = decoded.playerId ? await Player.findById(decoded.playerId) : null

    // Return user info
    return NextResponse.json({
      authenticated: true,
      user: {
        id: decoded.userId,
        email: decoded.email,
        role: decoded.role,
        seenAnnouncements: user?.seenAnnouncements || [],
        preferences: user?.preferences || {},
        createdAt: user?.createdAt
      },
      player: player ? {
        id: player._id,
        name: player.name,
        level: player.level
      } : null
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 401 }
    )
  }
}
