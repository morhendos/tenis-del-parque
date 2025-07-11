import { NextResponse } from 'next/server'
import dbConnect from '../../../../../../lib/db/mongoose'
import Player from '../../../../../../lib/models/Player'
import Match from '../../../../../../lib/models/Match'
import { verifyAdminAuth } from '../../../../../../lib/utils/adminAuth'

// POST /api/admin/players/[id]/recalculate-elo - Recalculate ELO for a player
export async function POST(request, { params }) {
  try {
    // Check authentication
    const auth = await verifyAdminAuth(request)
    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: 401 })
    }

    await dbConnect()

    const { id: playerId } = params

    // Find the player
    const player = await Player.findById(playerId)
    if (!player) {
      return NextResponse.json(
        { error: 'Player not found' },
        { status: 404 }
      )
    }

    // Get initial ELO based on player level
    const getInitialEloByLevel = (level) => {
      const eloRatings = {
        'beginner': 1180,
        'intermediate': 1200,
        'advanced': 1250
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

    // Reset player to initial ELO
    const initialElo = getInitialEloByLevel(player.level)
    let currentElo = initialElo
    let highestElo = initialElo
    let lowestElo = initialElo

    // Get all completed matches for this player in chronological order
    const matches = await Match.find({
      $or: [
        { 'players.player1': playerId },
        { 'players.player2': playerId }
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
      const isPlayer1 = match.players.player1._id.toString() === playerId
      const isPlayer2 = match.players.player2._id.toString() === playerId
      
      if (!isPlayer1 && !isPlayer2) continue

      const opponent = isPlayer1 ? match.players.player2 : match.players.player1
      const playerWon = match.result.winner.toString() === playerId

      // Get opponent's current ELO (we need to recalculate in proper order)
      // For now, use their stored ELO rating - in a full system recompute, 
      // we'd need to process all players together
      const opponentElo = opponent.stats?.eloRating || 1200

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

    // Update player's ELO statistics
    player.stats.eloRating = currentElo
    player.stats.highestElo = highestElo
    player.stats.lowestElo = lowestElo

    // Update match history with correct ELO values
    const updatedMatchHistory = []
    for (let i = 0; i < eloHistory.length; i++) {
      const historyEntry = eloHistory[i]
      updatedMatchHistory.push({
        match: historyEntry.matchId,
        opponent: matches[i].players.player1._id.toString() === playerId ? 
                  matches[i].players.player2._id : matches[i].players.player1._id,
        result: historyEntry.won ? 'won' : 'lost',
        score: matches[i].getScoreDisplay ? matches[i].getScoreDisplay() : 'N/A',
        eloChange: historyEntry.eloChange,
        eloAfter: historyEntry.eloAfter,
        round: historyEntry.round,
        date: historyEntry.playedAt
      })
    }
    
    player.matchHistory = updatedMatchHistory
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
        level: player.level
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