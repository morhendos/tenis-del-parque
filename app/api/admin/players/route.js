import dbConnect from '../../../../lib/db/mongoose'
import Player from '../../../../lib/models/Player'

export async function GET() {
  try {
    await dbConnect()

    // Fetch all players with league info
    const players = await Player
      .find()
      .populate('league', 'name slug')
      .sort({ registeredAt: -1 })
      .lean()

    // Create response
    const response = Response.json({
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
    return Response.json(
      { 
        success: false, 
        error: 'Failed to fetch players' 
      },
      { status: 500 }
    )
  }
}
