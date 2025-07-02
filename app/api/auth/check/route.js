import { NextResponse } from 'next/server'
import { verifyToken } from '../../../../lib/utils/jwt'

export async function GET(request) {
  try {
    // Get token from cookie
    const token = request.cookies.get('player-token')?.value

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

    // Return user info
    return NextResponse.json({
      user: {
        id: decoded.userId,
        email: decoded.email,
        role: decoded.role
      }
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 401 }
    )
  }
}
