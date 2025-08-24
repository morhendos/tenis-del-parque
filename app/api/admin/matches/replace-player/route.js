import { NextResponse } from 'next/server'
import dbConnect from '../../../../../lib/db/mongoose'
import Match from '../../../../../lib/models/Match'
import Player from '../../../../../lib/models/Player'

export async function POST(request) {
  try {
    await dbConnect()
    
    const { matchIds, oldPlayerId, newPlayerId } = await request.json()
    
    if (!matchIds || !Array.isArray(matchIds) || matchIds.length === 0) {
      return NextResponse.json(
        { error: 'Match IDs are required' },
        { status: 400 }
      )
    }

    if (!oldPlayerId || !newPlayerId) {
      return NextResponse.json(
        { error: 'Both old and new player IDs are required' },
        { status: 400 }
      )
    }

    if (oldPlayerId === newPlayerId) {
      return NextResponse.json(
        { error: 'Old and new player must be different' },
        { status: 400 }
      )
    }

    // Verify players exist
    const [oldPlayer, newPlayer] = await Promise.all([
      Player.findById(oldPlayerId),
      Player.findById(newPlayerId)
    ])

    if (!oldPlayer) {
      return NextResponse.json(
        { error: 'Old player not found' },
        { status: 404 }
      )
    }

    if (!newPlayer) {
      return NextResponse.json(
        { error: 'New player not found' },
        { status: 404 }
      )
    }

    // Update matches where oldPlayer is player1
    const updatePlayer1 = await Match.updateMany(
      {
        _id: { $in: matchIds },
        'players.player1': oldPlayerId
      },
      {
        $set: { 'players.player1': newPlayerId }
      }
    )

    // Update matches where oldPlayer is player2
    const updatePlayer2 = await Match.updateMany(
      {
        _id: { $in: matchIds },
        'players.player2': oldPlayerId
      },
      {
        $set: { 'players.player2': newPlayerId }
      }
    )

    const totalUpdated = updatePlayer1.modifiedCount + updatePlayer2.modifiedCount

    return NextResponse.json({
      success: true,
      updatedCount: totalUpdated,
      message: `Successfully replaced ${oldPlayer.name} with ${newPlayer.name} in ${totalUpdated} matches`
    })

  } catch (error) {
    console.error('Player replacement error:', error)
    return NextResponse.json(
      { error: 'Failed to replace player' },
      { status: 500 }
    )
  }
}