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

    return Response.json({
      success: true,
      players,
      total: players.length
    })

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
