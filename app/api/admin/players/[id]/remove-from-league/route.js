import { NextResponse } from 'next/server'
import dbConnect from '../../../../../../lib/db/mongoose'
import Player from '../../../../../../lib/models/Player'
import Match from '../../../../../../lib/models/Match'
import { requireAdmin } from '../../../../../../lib/auth/apiAuth'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

// POST /api/admin/players/[id]/remove-from-league - Remove player from specific league
export async function POST(request, { params }) {
  try {
    const { session, error } = await requireAdmin(request)
    if (error) return error

    const { id } = params
    const { leagueId } = await request.json()

    if (!leagueId) {
      return NextResponse.json(
        { error: 'League ID is required' },
        { status: 400 }
      )
    }

    await dbConnect()

    // Find the player
    const player = await Player.findById(id)
    if (!player) {
      return NextResponse.json(
        { error: 'Player not found' },
        { status: 404 }
      )
    }

    // Check if player has multiple registrations
    if (!player.registrations || player.registrations.length <= 1) {
      return NextResponse.json(
        { error: 'Cannot remove player from their only league. Use delete player instead.' },
        { status: 400 }
      )
    }

    // Find the registration to remove
    const registrationIndex = player.registrations.findIndex(
      reg => reg.league.toString() === leagueId.toString()
    )

    if (registrationIndex === -1) {
      return NextResponse.json(
        { error: 'Player is not registered for this league' },
        { status: 404 }
      )
    }

    const registrationToRemove = player.registrations[registrationIndex]

    // Check if player has any matches in this league
    const matchCount = await Match.countDocuments({
      league: leagueId,
      season: registrationToRemove.season,
      $or: [
        { 'players.player1': id },
        { 'players.player2': id }
      ]
    })

    if (matchCount > 0) {
      return NextResponse.json(
        { 
          error: `Cannot remove player from league. They have ${matchCount} match(es) in this league. Please delete matches first or contact admin.`,
          matchCount 
        },
        { status: 400 }
      )
    }

    // Remove the registration
    player.registrations.splice(registrationIndex, 1)

    // Save the updated player
    await player.save()

    console.log(`Player ${player.name} removed from league ${leagueId}`)

    return NextResponse.json({
      success: true,
      message: 'Player removed from league successfully',
      player: {
        id: player._id,
        name: player.name,
        email: player.email,
        remainingLeagues: player.registrations.length
      }
    })

  } catch (error) {
    console.error('Error removing player from league:', error)
    return NextResponse.json(
      { error: 'Failed to remove player from league' },
      { status: 500 }
    )
  }
}
