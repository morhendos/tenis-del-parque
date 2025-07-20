import { NextResponse } from 'next/server'
import dbConnect from '../../../../../lib/db/mongoose'
import Player from '../../../../../lib/models/Player'
import Match from '../../../../../lib/models/Match'
import { requireAdmin } from '../../../../../lib/auth/apiAuth'

export const dynamic = 'force-dynamic'

// GET /api/admin/players/[id] - Get player details
export async function GET(request, { params }) {
  try {
    const { session, error } = await requireAdmin(request)
    if (error) return error

    const { id } = params
    await dbConnect()

    const player = await Player.findById(id)
      .populate('league', 'name slug')
      .lean()

    if (!player) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 })
    }

    return NextResponse.json({ player })

  } catch (error) {
    console.error('Error fetching player:', error)
    return NextResponse.json(
      { error: 'Failed to fetch player' },
      { status: 500 }
    )
  }
}

// PATCH /api/admin/players/[id] - Update player
export async function PATCH(request, { params }) {
  try {
    const { session, error } = await requireAdmin(request)
    if (error) return error

    const { id } = params
    const body = await request.json()
    
    await dbConnect()

    const player = await Player.findById(id)
    if (!player) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 })
    }

    // Update allowed fields
    const allowedFields = ['status', 'level', 'notes', 'name', 'email', 'whatsapp']
    allowedFields.forEach(field => {
      if (body[field] !== undefined) {
        player[field] = body[field]
      }
    })

    await player.save()

    return NextResponse.json({
      message: 'Player updated successfully',
      player
    })

  } catch (error) {
    console.error('Error updating player:', error)
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    })
    return NextResponse.json(
      { error: 'Failed to update player', details: error.message },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/players/[id] - Delete player
export async function DELETE(request, { params }) {
  try {
    const { session, error } = await requireAdmin(request)
    if (error) return error

    const { id } = params
    await dbConnect()

    // Check if player has any matches
    const matchCount = await Match.countDocuments({
      $or: [
        { 'players.player1': id },
        { 'players.player2': id }
      ]
    })

    if (matchCount > 0) {
      return NextResponse.json(
        { 
          error: 'Cannot delete player with match history. Please cancel or reassign their matches first.',
          matchCount 
        },
        { status: 400 }
      )
    }

    // Delete the player
    const result = await Player.findByIdAndDelete(id)
    
    if (!result) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 })
    }

    return NextResponse.json({
      message: 'Player deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting player:', error)
    return NextResponse.json(
      { error: 'Failed to delete player' },
      { status: 500 }
    )
  }
}
