import { NextResponse } from 'next/server'
import dbConnect from '../../../../../../lib/db/mongoose'
import Player from '../../../../../../lib/models/Player'
import Match from '../../../../../../lib/models/Match'
import League from '../../../../../../lib/models/League'
import { requireAdmin } from '../../../../../../lib/auth/apiAuth'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

// GET /api/admin/players/[id]/details - Get comprehensive player details
export async function GET(request, { params }) {
  try {
    const { session, error } = await requireAdmin(request)
    if (error) return error

    const { id } = params

    await dbConnect()

    // Find the player with all registrations populated
    const player = await Player.findById(id)
      .populate('userId', 'email role isActive emailVerified')
      .lean()

    if (!player) {
      return NextResponse.json(
        { error: 'Player not found' },
        { status: 404 }
      )
    }

    // Populate league information for each registration
    const populatedRegistrations = await Promise.all(
      (player.registrations || []).map(async (registration) => {
        const league = await League.findById(registration.league).lean()
        return {
          ...registration,
          league: league
        }
      })
    )

    // Get recent matches across all leagues
    const recentMatches = await Match.find({
      $or: [
        { 'players.player1': id },
        { 'players.player2': id }
      ],
      status: 'completed',
      'result.playedAt': { $exists: true }
    })
    .populate('players.player1 players.player2', 'name email')
    .populate('league', 'name slug')
    .sort({ 'result.playedAt': -1 })
    .limit(20)
    .lean()

    // Format recent matches for display
    const formattedMatches = recentMatches.map(match => {
      const isPlayer1 = match.players.player1._id.toString() === id
      const opponent = isPlayer1 ? match.players.player2 : match.players.player1
      const won = match.result.winner.toString() === id
      
      // Get ELO change for this player
      let eloChange = 0
      if (match.eloChanges) {
        if (isPlayer1 && match.eloChanges.player1) {
          eloChange = match.eloChanges.player1.change || 0
        } else if (!isPlayer1 && match.eloChanges.player2) {
          eloChange = match.eloChanges.player2.change || 0
        }
      }

      // Format score
      let scoreDisplay = 'N/A'
      if (match.result.score?.walkover) {
        scoreDisplay = 'Walkover'
      } else if (match.result.score?.sets) {
        scoreDisplay = match.result.score.sets
          .map(set => `${set.player1}-${set.player2}`)
          .join(', ')
      }

      return {
        matchId: match._id,
        date: match.result.playedAt,
        opponentName: opponent.name,
        opponentEmail: opponent.email,
        result: won ? 'won' : 'lost',
        score: scoreDisplay,
        eloChange: eloChange,
        round: match.round,
        league: match.league.name
      }
    })

    // Calculate overall statistics
    const totalMatches = recentMatches.length
    const totalWins = formattedMatches.filter(m => m.result === 'won').length
    const winRate = totalMatches > 0 ? Math.round((totalWins / totalMatches) * 100) : 0

    const playerWithDetails = {
      ...player,
      registrations: populatedRegistrations,
      recentMatches: formattedMatches,
      overallStats: {
        totalMatches,
        totalWins,
        totalLosses: totalMatches - totalWins,
        winRate
      }
    }

    return NextResponse.json({
      success: true,
      player: playerWithDetails
    })

  } catch (error) {
    console.error('Error fetching player details:', error)
    return NextResponse.json(
      { error: 'Failed to fetch player details' },
      { status: 500 }
    )
  }
}
