import { NextResponse } from 'next/server'
import dbConnect from '../../../../../lib/db/mongoose'
import Match from '../../../../../lib/models/Match'
import Player from '../../../../../lib/models/Player'
import { verifyAdminAuth } from '../../../../../lib/utils/adminAuth'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

// GET /api/admin/matches/[id] - Get match details
export async function GET(request, { params }) {
  try {
    // Check authentication
    const auth = await verifyAdminAuth(request)
    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: 401 })
    }

    const { id } = params

    // Connect to database
    await dbConnect()

    // Fetch match with populated data
    const match = await Match.findById(id)
      .populate('players.player1', 'name email level whatsapp stats')
      .populate('players.player2', 'name email level whatsapp stats')
      .populate('league', 'name')
      .lean()

    if (!match) {
      return NextResponse.json({ error: 'Match not found' }, { status: 404 })
    }

    return NextResponse.json({ match })

  } catch (error) {
    console.error('Error fetching match:', error)
    return NextResponse.json(
      { error: 'Failed to fetch match' },
      { status: 500 }
    )
  }
}

// PATCH /api/admin/matches/[id] - Update match
export async function PATCH(request, { params }) {
  try {
    // Check authentication
    const auth = await verifyAdminAuth(request)
    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: 401 })
    }

    const { id } = params
    const body = await request.json()

    // Connect to database
    await dbConnect()

    // Find the match
    const match = await Match.findById(id)
    if (!match) {
      return NextResponse.json({ error: 'Match not found' }, { status: 404 })
    }

    // Update fields based on what's provided
    if (body.schedule) {
      match.schedule = { ...match.schedule, ...body.schedule }
    }

    if (body.status) {
      match.status = body.status
    }

    if (body.notes !== undefined) {
      match.notes = body.notes
    }

    if (body.wildCardUsed) {
      match.wildCardUsed = body.wildCardUsed
    }

    // Handle result entry
    if (body.result) {
      // Validate result data
      if (!body.result.winner) {
        return NextResponse.json(
          { error: 'Result must include a winner' },
          { status: 400 }
        )
      }

      // Verify winner is one of the players
      const winnerId = body.result.winner
      const player1Id = match.players.player1.toString()
      const player2Id = match.players.player2.toString()
      
      if (winnerId !== player1Id && winnerId !== player2Id) {
        return NextResponse.json(
          { error: 'Winner must be one of the match players' },
          { status: 400 }
        )
      }

      // Get both players
      const [player1, player2] = await Promise.all([
        Player.findById(player1Id),
        Player.findById(player2Id)
      ])

      // Calculate ELO changes (if result is being entered for the first time)
      if (!match.result || !match.result.winner) {
        const player1Won = winnerId === player1Id
        const eloChange = calculateEloChange(
          player1.stats.eloRating,
          player2.stats.eloRating,
          player1Won
        )

        // Update match with result and ELO changes
        match.result = body.result
        match.result.playedAt = new Date()
        match.status = 'completed'
        
        match.eloChanges = {
          player1: {
            before: player1.stats.eloRating,
            after: player1.stats.eloRating + (player1Won ? eloChange : -eloChange),
            change: player1Won ? eloChange : -eloChange
          },
          player2: {
            before: player2.stats.eloRating,
            after: player2.stats.eloRating + (player1Won ? -eloChange : eloChange),
            change: player1Won ? -eloChange : eloChange
          }
        }

        // Update player stats
        await Promise.all([
          player1.updateMatchStats({
            won: player1Won,
            eloChange: match.eloChanges.player1.change,
            score: match.getScoreDisplay(),
            opponent: player2Id,
            matchId: match._id,
            round: match.round,
            date: match.result.playedAt
          }),
          player2.updateMatchStats({
            won: !player1Won,
            eloChange: match.eloChanges.player2.change,
            score: match.getScoreDisplay(),
            opponent: player1Id,
            matchId: match._id,
            round: match.round,
            date: match.result.playedAt
          })
        ])

        // Handle wild card usage if specified
        if (body.wildCardUsed) {
          if (body.wildCardUsed.player1 && player1.hasWildCardsAvailable()) {
            await player1.useWildCard(match._id, 'Match scheduling')
          }
          if (body.wildCardUsed.player2 && player2.hasWildCardsAvailable()) {
            await player2.useWildCard(match._id, 'Match scheduling')
          }
        }
      }
    }

    // Save the match
    await match.save()

    // Return updated match with populated data
    await match.populate('players.player1 players.player2')

    return NextResponse.json({
      message: 'Match updated successfully',
      match
    })

  } catch (error) {
    console.error('Error updating match:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update match' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/matches/[id] - Delete/cancel match
export async function DELETE(request, { params }) {
  try {
    // Check authentication
    const auth = await verifyAdminAuth(request)
    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: 401 })
    }

    const { id } = params

    // Connect to database
    await dbConnect()

    // Find the match
    const match = await Match.findById(id)
    if (!match) {
      return NextResponse.json({ error: 'Match not found' }, { status: 404 })
    }

    // Don't allow deletion of completed matches
    if (match.status === 'completed') {
      return NextResponse.json(
        { error: 'Cannot delete completed matches' },
        { status: 400 }
      )
    }

    // Update status to cancelled instead of deleting
    match.status = 'cancelled'
    await match.save()

    return NextResponse.json({
      message: 'Match cancelled successfully'
    })

  } catch (error) {
    console.error('Error cancelling match:', error)
    return NextResponse.json(
      { error: 'Failed to cancel match' },
      { status: 500 }
    )
  }
}

// ELO calculation helper
function calculateEloChange(ratingA, ratingB, aWon) {
  const K = 32 // K-factor for ELO calculation
  const expectedA = 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400))
  const actualA = aWon ? 1 : 0
  return Math.round(K * (actualA - expectedA))
}
