import dbConnect from '../../../../../lib/db/mongoose'
import Player from '../../../../../lib/models/Player'

export async function PATCH(request, { params }) {
  try {
    await dbConnect()
    
    const { id } = params
    const body = await request.json()

    // Validate player exists
    const player = await Player.findById(id)
    if (!player) {
      return Response.json(
        { 
          success: false, 
          error: 'Player not found' 
        },
        { status: 404 }
      )
    }

    // Update allowed fields
    const allowedFields = ['status', 'notes']
    const updates = {}
    
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updates[field] = body[field]
      }
    }

    // Apply updates
    Object.assign(player, updates)
    await player.save()

    return Response.json({
      success: true,
      message: 'Player updated successfully',
      player
    })

  } catch (error) {
    console.error('Player update error:', error)
    return Response.json(
      { 
        success: false, 
        error: 'Failed to update player' 
      },
      { status: 500 }
    )
  }
}

export async function GET(request, { params }) {
  try {
    await dbConnect()
    
    const { id } = params
    
    const player = await Player
      .findById(id)
      .populate('league', 'name slug')
      .lean()
    
    if (!player) {
      return Response.json(
        { 
          success: false, 
          error: 'Player not found' 
        },
        { status: 404 }
      )
    }

    return Response.json({
      success: true,
      player
    })

  } catch (error) {
    console.error('Player fetch error:', error)
    return Response.json(
      { 
        success: false, 
        error: 'Failed to fetch player' 
      },
      { status: 500 }
    )
  }
}
