import { NextResponse } from 'next/server'
import dbConnect from '../../../../../../lib/db/mongoose'
import Player from '../../../../../../lib/models/Player'
import Match from '../../../../../../lib/models/Match'
import { requireAdmin } from '../../../../../../lib/auth/apiAuth'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

// POST /api/admin/players/[id]/recalculate-elo - Recalculate ELO for a player
export async function POST(request, { params }) {
  try {
    const { session, error } = await requireAdmin(request)
    if (error) return error

    const { id } = params

    await dbConnect()

    // Find the player
    const player = await Player.findById(id)
    if (!player) {
      return NextResponse.json(
        { error: 'Player not found' },
        { status: 404 }
      )
    }

    // Get initial ELO based on player level
    const getInitialEloByLevel = (level) => {
      const eloRatings = {
        'beginner': 1100,
        'intermediate': 1200,
        'advanced': 1300
      }
      return eloRatings[level] || 1200
    }

    // ELO calculation function
    const calculateEloChange = (ratingA, ratingB, aWon) => {
      const K = 32 // K-factor for ELO calculation
      const expectedA = 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400))
      const actualA = aWon ? 1 : 0
      return Math.round(K * (actualA - expectedA))
    }

    // Reset player to initial ELO based on their primary registration level
    const primaryLevel = player.registrations?.[0]?.level || 'intermediate'
    const initialElo = getInitialEloByLevel(primaryLevel)
    let currentElo = initialElo
    let highestElo = initialElo
    let lowestElo = initialElo

    // Get all completed matches for this player in chronological order
    const matches = await Match.find({
      $or: [
        { 'players.player1': id },
        { 'players.player2': id }
      ],
      status: 'completed',
      'result.playedAt': { $exists: true }
    })
    .populate('players.player1 players.player2')
    .sort({ 'result.playedAt': 1 }) // Chronological order
    .lean()

    console.log(`Recalculating ELO for ${player.name} - Found ${matches.length} completed matches`)

    // Track ELO changes for response
    const eloHistory = []
    let updatedMatches = 0

    // Process each match in chronological order
    for (const match of matches) {
      const isPlayer1 = match.players.player1._id.toString() === id
      const isPlayer2 = match.players.player2._id.toString() === id
      
      if (!isPlayer1 && !isPlayer2) continue

      const opponent = isPlayer1 ? match.players.player2 : match.players.player1
      const playerWon = match.result.winner.toString() === id

      // Get opponent's current ELO (we need to recalculate in proper order)
      // For now, use their stored ELO rating - in a full system recompute, 
      // we'd need to process all players together
      const opponentElo = opponent.eloRating || 1200

      // Calculate ELO change for this player
      const eloChange = calculateEloChange(currentElo, opponentElo, playerWon)
      
      const beforeElo = currentElo
      currentElo += eloChange
      
      // Track highest and lowest
      if (currentElo > highestElo) highestElo = currentElo
      if (currentElo < lowestElo) lowestElo = currentElo

      // Update the match's ELO changes
      const updatedEloChanges = {
        ...match.eloChanges
      }

      if (isPlayer1) {
        updatedEloChanges.player1 = {
          before: beforeElo,
          after: currentElo,
          change: eloChange
        }
      } else {
        updatedEloChanges.player2 = {
          before: beforeElo,
          after: currentElo,
          change: eloChange
        }
      }

      // Update the match in database
      await Match.findByIdAndUpdate(match._id, {
        eloChanges: updatedEloChanges
      })

      // Track for response
      eloHistory.push({
        matchId: match._id,
        round: match.round,
        opponent: opponent.name,
        won: playerWon,
        eloBefore: beforeElo,
        eloAfter: currentElo,
        eloChange: eloChange,
        playedAt: match.result.playedAt
      })

      updatedMatches++
    }

    // Update player's GLOBAL ELO statistics
    player.eloRating = currentElo
    player.highestElo = highestElo
    player.lowestElo = lowestElo

    // Update match history with correct ELO values
    const updatedMatchHistory = []
    for (let i = 0; i < eloHistory.length; i++) {
      const historyEntry = eloHistory[i]
      updatedMatchHistory.push({
        match: historyEntry.matchId,
        opponent: matches[i].players.player1._id.toString() === id ? 
                  matches[i].players.player2._id : matches[i].players.player1._id,
        result: historyEntry.won ? 'won' : 'lost',
        score: matches[i].getScoreDisplay ? matches[i].getScoreDisplay() : 'N/A',
        eloChange: historyEntry.eloChange,
        eloAfter: historyEntry.eloAfter,
        round: historyEntry.round,
        date: historyEntry.playedAt
      })
    }
    
    // Update match history in the primary registration
    if (player.registrations && player.registrations.length > 0) {
      player.registrations[0].matchHistory = updatedMatchHistory
    }
    
    await player.save()

    console.log(`ELO recalculation complete for ${player.name}:`)
    console.log(`Initial: ${initialElo} → Final: ${currentElo}`)
    console.log(`Highest: ${highestElo}, Lowest: ${lowestElo}`)
    console.log(`Updated ${updatedMatches} matches`)

    return NextResponse.json({
      success: true,
      message: 'ELO recalculated successfully',
      player: {
        id: player._id,
        name: player.name,
        level: primaryLevel
      },
      elo: {
        initial: initialElo,
        final: currentElo,
        highest: highestElo,
        lowest: lowestElo,
        change: currentElo - initialElo
      },
      matches: {
        processed: updatedMatches,
        total: matches.length
      },
      history: eloHistory
    })

  } catch (error) {
    console.error('Error recalculating ELO:', error)
    return NextResponse.json(
      { error: 'Failed to recalculate ELO' },
      { status: 500 }
    )
  }
} 