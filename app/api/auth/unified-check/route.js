import { NextResponse } from 'next/server'
import { verifyToken } from '../../../../lib/utils/jwt'
import dbConnect from '../../../../lib/db/mongoose'
import User from '../../../../lib/models/User'
import Player from '../../../../lib/models/Player'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

export async function GET(request) {
  try {
    // First check for admin token
    const adminToken = request.cookies.get('admin-token')?.value
    if (adminToken) {
      try {
        const decoded = await verifyToken(adminToken)
        if (decoded && decoded.role === 'admin') {
          return NextResponse.json({
            authenticated: true,
            user: {
              id: decoded.userId,
              email: decoded.email,
              role: 'admin',
              isAdmin: true
            }
          })
        }
      } catch (e) {
        // Admin token invalid, continue to check player token
      }
    }

    // Then check for player token
    const playerToken = request.cookies.get('auth-token')?.value
    if (playerToken) {
      try {
        const decoded = await verifyToken(playerToken)
        if (decoded && decoded.role === 'player') {
          // Connect to database
          await dbConnect()

          // Fetch user data
          const user = await User.findById(decoded.userId)
          const player = decoded.playerId ? await Player.findById(decoded.playerId) : null

          return NextResponse.json({
            authenticated: true,
            user: {
              id: decoded.userId,
              email: decoded.email,
              role: 'player',
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
        }
      } catch (e) {
        // Player token invalid
      }
    }

    // No valid tokens found
    return NextResponse.json(
      { error: 'No valid authentication found' },
      { status: 401 }
    )
  } catch (error) {
    return NextResponse.json(
      { error: 'Authentication check failed' },
      { status: 401 }
    )
  }
}