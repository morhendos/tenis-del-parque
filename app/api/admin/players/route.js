import { NextResponse } from 'next/server'
import dbConnect from '../../../../lib/db/mongoose'
import Player from '../../../../lib/models/Player'
import User from '../../../../lib/models/User'
import { requireAdmin } from '../../../../lib/auth/apiAuth'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

export async function GET(request) {
  try {
    // Check authentication
    const { session, error } = await requireAdmin(request)
    if (error) return error

    await dbConnect()

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const league = searchParams.get('league')
    const status = searchParams.get('status')
    const level = searchParams.get('level')
    const hasUser = searchParams.get('hasUser')

    // Build query
    const query = {}
    if (league) {
      query.league = league
    }
    if (status) {
      // Support comma-separated status values
      const statusValues = status.split(',')
      query.status = { $in: statusValues }
    }
    if (level) {
      query.level = level
    }
    
    // Filter by user account status
    if (hasUser === 'true') {
      query.userId = { $exists: true, $ne: null }
    } else if (hasUser === 'false') {
      query.$or = [
        { userId: { $exists: false } },
        { userId: null }
      ]
    }

    // Fetch players with league info
    const players = await Player
      .find(query)
      .populate('league', 'name slug')
      .populate('userId', 'email role isActive emailVerified')
      .sort({ registeredAt: -1 })
      .lean()

    // Create response
    const response = NextResponse.json({
      success: true,
      players,
      total: players.length,
      timestamp: new Date().toISOString() // Add timestamp to verify freshness
    })

    // Set headers to prevent ANY caching
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    response.headers.set('Surrogate-Control', 'no-store')
    
    return response

  } catch (error) {
    console.error('Players fetch error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch players' 
      },
      { status: 500 }
    )
  }
}
