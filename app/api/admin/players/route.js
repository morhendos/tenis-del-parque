import { NextResponse } from 'next/server'
import dbConnect from '../../../../lib/db/mongoose'
import Player from '../../../../lib/models/Player'

export const dynamic = 'force-dynamic'

export async function GET(request) {
  try {
    await dbConnect()

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const league = searchParams.get('league')
    const status = searchParams.get('status')
    const level = searchParams.get('level')

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

    // Fetch players with league info
    const players = await Player
      .find(query)
      .populate('league', 'name slug')
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
