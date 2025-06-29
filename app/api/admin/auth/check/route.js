import { NextResponse } from 'next/server'
import { verifyToken, extractTokenFromHeader } from '../../../../../lib/utils/jwt'

export async function GET(request) {
  try {
    // Check for token in cookies first
    const cookieToken = request.cookies.get('admin-token')?.value
    
    // Then check Authorization header
    const authHeader = request.headers.get('authorization')
    const headerToken = extractTokenFromHeader(authHeader)
    
    const token = cookieToken || headerToken

    if (!token) {
      return NextResponse.json(
        { authenticated: false, error: 'No token provided' },
        { status: 401 }
      )
    }

    // Verify token
    const decoded = verifyToken(token)
    
    if (!decoded) {
      return NextResponse.json(
        { authenticated: false, error: 'Invalid or expired token' },
        { status: 401 }
      )
    }

    // Check if user is admin
    if (decoded.role !== 'admin') {
      return NextResponse.json(
        { authenticated: false, error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: decoded.userId,
        email: decoded.email,
        role: decoded.role
      }
    })

  } catch (error) {
    console.error('Auth check error:', error)
    return NextResponse.json(
      { authenticated: false, error: 'Authentication failed' },
      { status: 401 }
    )
  }
}
