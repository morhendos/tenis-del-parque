import { NextResponse } from 'next/server'
import dbConnect from '../../../../../lib/db/mongoose'
import Match from '../../../../../lib/models/Match'
import Player from '../../../../../lib/models/Player'
import { requireAdmin } from '../../../../../lib/auth/apiAuth'
import mongoose from 'mongoose'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

// GET /api/admin/matches/[id] - Get match details
export async function GET(request, { params }) {
  try {
    // Check authentication
    const { session, error } = await requireAdmin(request)
    if (error) return error

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
  let session = null
  
  try {
    // Check authentication
    const { session: authSession, error } = await requireAdmin(request)
    if (error) return error

    const { id } = params
    const body = await request.json()

    // Connect to database
    await dbConnect()

    // Handle special "reset to unplayed" action
    if (body.action === 'resetToUnplayed') {
      return await resetMatchToUnplayed(id)
    }

    // Find the match
    const match = await Match.findById(id)
    if (!match) {
      return NextResponse.json({ error: 'Match not found' }, { status: 404 })
    }

    // Handle player updates
    if (body.players) {
      // Don't allow changing players for completed matches
      if (match.status === 'completed') {
        return NextResponse.json(
          { error: 'Cannot change players for completed matches. Reset to unplayed first.' },
          { status: 400 }
        )
      }

      // Validate player IDs
      const { player1, player2 } = body.players
      
      if (!player1 || !player2) {
        return NextResponse.json(
          { error: 'Both player1 and player2 must be provided' },
          { status: 400 }
        )
      }

      if (player1 === player2) {
        return NextResponse.json(
          { error: 'Player 1 and Player 2 must be different' },
          { status: 400 }
        )
      }

      // Verify players exist and belong to the same league
      const [newPlayer1, newPlayer2] = await Promise.all([
        Player.findById(player1),
        Player.findById(player2)
      ])

      if (!newPlayer1 || !newPlayer2) {
        return NextResponse.json(
          { error: 'One or both players not found' },
          { status: 404 }
        )
      }

      if (newPlayer1.league.toString() !== match.league.toString() ||
          newPlayer2.league.toString() !== match.league.toString()) {
        return NextResponse.json(
          { error: 'Players must belong to the same league as the match' },
          { status: 400 }
        )
      }

      // Update the players
      match.players.player1 = player1
      match.players.player2 = player2

      // Clear any wild card usage records since players changed
      match.wildCardUsed = {
        player1: false,
        player2: false
      }
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

    // Handle result entry/update
    if (body.result) {
      // Start transaction for result updates
      session = await mongoose.startSession()
      await session.startTransaction()

      try {
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
          Player.findById(player1Id).session(session),
          Player.findById(player2Id).session(session)
        ])

        // If this match already has a result, we need to reverse the old stats first
        if (match.result && match.result.winner && match.eloChanges) {
          await reverseMatchStats(match, player1, player2, session)
        }

        // Calculate ELO changes for the new result
        const player1Won = winnerId === player1Id
        let eloChange = 0
        
        // Only calculate ELO for non-walkover matches
        if (!body.result.score?.walkover) {
          eloChange = calculateEloChange(
            player1.stats.eloRating,
            player2.stats.eloRating,
            player1Won
          )
        }

        // Update match with result and ELO changes
        match.result = body.result
        match.result.playedAt = new Date()
        match.status = 'completed'
        
        // Apply ELO changes
        match.eloChanges = {
          player1: {
            before: player1.stats.eloRating,
            after: player1.stats.eloRating + eloChange,
            change: eloChange
          },
          player2: {
            before: player2.stats.eloRating,
            after: player2.stats.eloRating - eloChange,
            change: -eloChange
          }
        }

        // Count sets for statistics
        let player1SetsWon = 0
        let player2SetsWon = 0

        if (body.result.score && body.result.score.sets && body.result.score.sets.length > 0) {
          // Count sets won
          body.result.score.sets.forEach(set => {
            if (set.player1 > set.player2) {
              player1SetsWon++
            } else {
              player2SetsWon++
            }
          })
        } else if (body.result.score && body.result.score.walkover) {
          // For walkover, winner gets 2-0
          player1SetsWon = player1Won ? 2 : 0
          player2SetsWon = player1Won ? 0 : 2
        }

        // Update player stats manually
        await updatePlayerStatsManually(match, player1, player2, player1Won, player1SetsWon, player2SetsWon, session)

        // Save all within transaction
        await match.save({ session })
        await player1.save({ session })
        await player2.save({ session })

        await session.commitTransaction()

      } catch (transactionError) {
        await session.abortTransaction()
        throw transactionError
      }
    } else {
      // Save the match for non-result updates
      await match.save()
    }

    // Return updated match with populated data
    await match.populate('players.player1 players.player2 league')

    return NextResponse.json({
      message: body.players ? 'Players updated successfully' : 'Match updated successfully',
      match
    })

  } catch (error) {
    console.error('Error updating match:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update match' },
      { status: 500 }
    )
  } finally {
    if (session) {
      await session.endSession()
    }
  }
}

// DELETE /api/admin/matches/[id] - Delete/cancel match
export async function DELETE(request, { params }) {
  try {
    // Check authentication
    const { session, error } = await requireAdmin(request)
    if (error) return error

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
        { error: 'Cannot delete completed matches. Reset to unplayed first.' },
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

// Helper function to reset match to unplayed state
async function resetMatchToUnplayed(matchId) {
  let session = null
  
  try {
    session = await mongoose.startSession()
    await session.startTransaction()

    // Find the match
    const match = await Match.findById(matchId).session(session)
    if (!match) {
      await session.abortTransaction()
      return NextResponse.json({ error: 'Match not found' }, { status: 404 })
    }

    // Only allow resetting completed matches
    if (match.status !== 'completed' || !match.result) {
      await session.abortTransaction()
      return NextResponse.json(
        { error: 'Can only reset completed matches' },
        { status: 400 }
      )
    }

    // Get both players
    const [player1, player2] = await Promise.all([
      Player.findById(match.players.player1).session(session),
      Player.findById(match.players.player2).session(session)
    ])

    if (!player1 || !player2) {
      await session.abortTransaction()
      return NextResponse.json({ error: 'Players not found' }, { status: 404 })
    }

    // Reverse the match stats
    await reverseMatchStats(match, player1, player2, session)

    // Reset match to unplayed state
    match.result = undefined
    match.eloChanges = undefined
    match.status = 'scheduled'

    // Save all changes
    await match.save({ session })
    await player1.save({ session })
    await player2.save({ session })

    await session.commitTransaction()

    // Return updated match with populated data
    await match.populate('players.player1 players.player2 league')

    return NextResponse.json({
      message: 'Match reset to unplayed successfully',
      match
    })

  } catch (error) {
    if (session) {
      await session.abortTransaction()
    }
    console.error('Error resetting match:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to reset match' },
      { status: 500 }
    )
  } finally {
    if (session) {
      await session.endSession()
    }
  }
}

// Helper function to reverse match statistics
async function reverseMatchStats(match, player1, player2, session) {
  if (!match.eloChanges || !match.result) return

  // Reverse ELO changes
  player1.stats.eloRating -= match.eloChanges.player1.change
  player2.stats.eloRating -= match.eloChanges.player2.change

  // Recalculate highest/lowest ELO (simplified - just check current)
  if (player1.stats.eloRating > player1.stats.highestElo) {
    player1.stats.highestElo = player1.stats.eloRating
  }
  if (player1.stats.eloRating < player1.stats.lowestElo) {
    player1.stats.lowestElo = player1.stats.eloRating
  }
  if (player2.stats.eloRating > player2.stats.highestElo) {
    player2.stats.highestElo = player2.stats.eloRating
  }
  if (player2.stats.eloRating < player2.stats.lowestElo) {
    player2.stats.lowestElo = player2.stats.eloRating
  }

  // Reverse match count and wins
  player1.stats.matchesPlayed = Math.max(0, player1.stats.matchesPlayed - 1)
  player2.stats.matchesPlayed = Math.max(0, player2.stats.matchesPlayed - 1)

  const player1Won = match.result.winner.toString() === match.players.player1.toString()
  if (player1Won) {
    player1.stats.matchesWon = Math.max(0, player1.stats.matchesWon - 1)
  } else {
    player2.stats.matchesWon = Math.max(0, player2.stats.matchesWon - 1)
  }

  // Reverse sets won/lost
  if (match.result.score && match.result.score.sets) {
    let player1SetsWon = 0
    let player2SetsWon = 0

    match.result.score.sets.forEach(set => {
      if (set.player1 > set.player2) {
        player1SetsWon++
      } else {
        player2SetsWon++
      }
    })

    player1.stats.setsWon = Math.max(0, (player1.stats.setsWon || 0) - player1SetsWon)
    player1.stats.setsLost = Math.max(0, (player1.stats.setsLost || 0) - player2SetsWon)
    player2.stats.setsWon = Math.max(0, (player2.stats.setsWon || 0) - player2SetsWon)
    player2.stats.setsLost = Math.max(0, (player2.stats.setsLost || 0) - player1SetsWon)
  } else if (match.result.score?.walkover) {
    // Reverse walkover sets (winner had 2-0)
    if (player1Won) {
      player1.stats.setsWon = Math.max(0, (player1.stats.setsWon || 0) - 2)
      player2.stats.setsLost = Math.max(0, (player2.stats.setsLost || 0) - 2)
    } else {
      player2.stats.setsWon = Math.max(0, (player2.stats.setsWon || 0) - 2)
      player1.stats.setsLost = Math.max(0, (player1.stats.setsLost || 0) - 2)
    }
  }

  // Remove this match from both players' match history
  player1.matchHistory = player1.matchHistory.filter(
    h => h.match && !h.match.equals(match._id)
  )
  player2.matchHistory = player2.matchHistory.filter(
    h => h.match && !h.match.equals(match._id)
  )
}

// Helper function to update player stats manually (same as player API)
async function updatePlayerStatsManually(match, player1, player2, player1Won, player1SetsWon, player2SetsWon, session) {
  // Player 1 stats
  player1.stats.matchesPlayed += 1
  if (player1Won) player1.stats.matchesWon += 1
  
  // Update ELO
  player1.stats.eloRating += match.eloChanges.player1.change
  if (player1.stats.eloRating > player1.stats.highestElo) {
    player1.stats.highestElo = player1.stats.eloRating
  }
  if (player1.stats.eloRating < player1.stats.lowestElo) {
    player1.stats.lowestElo = player1.stats.eloRating
  }
  
  // Update sets won/lost stats
  player1.stats.setsWon = (player1.stats.setsWon || 0) + player1SetsWon
  player1.stats.setsLost = (player1.stats.setsLost || 0) + player2SetsWon
  
  // Add to match history (limit to last 20 matches to avoid performance issues)
  player1.matchHistory.unshift({
    match: match._id,
    opponent: player2._id,
    result: player1Won ? 'won' : 'lost',
    score: match.getScoreDisplay(),
    eloChange: match.eloChanges.player1.change,
    eloAfter: player1.stats.eloRating,
    round: match.round,
    date: match.result.playedAt
  })
  
  // Keep only last 20 matches in history to avoid bloat
  if (player1.matchHistory.length > 20) {
    player1.matchHistory = player1.matchHistory.slice(0, 20)
  }

  // Player 2 stats
  player2.stats.matchesPlayed += 1
  if (!player1Won) player2.stats.matchesWon += 1
  
  // Update ELO
  player2.stats.eloRating -= match.eloChanges.player1.change
  if (player2.stats.eloRating > player2.stats.highestElo) {
    player2.stats.highestElo = player2.stats.eloRating
  }
  if (player2.stats.eloRating < player2.stats.lowestElo) {
    player2.stats.lowestElo = player2.stats.eloRating
  }
  
  // Update sets won/lost stats
  player2.stats.setsWon = (player2.stats.setsWon || 0) + player2SetsWon
  player2.stats.setsLost = (player2.stats.setsLost || 0) + player1SetsWon
  
  // Add to match history (limit to last 20 matches to avoid performance issues)
  player2.matchHistory.unshift({
    match: match._id,
    opponent: player1._id,
    result: player1Won ? 'lost' : 'won',
    score: match.getScoreDisplay(),
    eloChange: -match.eloChanges.player1.change,
    eloAfter: player2.stats.eloRating,
    round: match.round,
    date: match.result.playedAt
  })
  
  // Keep only last 20 matches in history to avoid bloat
  if (player2.matchHistory.length > 20) {
    player2.matchHistory = player2.matchHistory.slice(0, 20)
  }
}

// ELO calculation helper
function calculateEloChange(ratingA, ratingB, aWon) {
  const K = 32 // K-factor for ELO calculation
  const expectedA = 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400))
  const actualA = aWon ? 1 : 0
  return Math.round(K * (actualA - expectedA))
}
