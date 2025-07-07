import { NextResponse } from 'next/server'
import dbConnect from '../../../../../lib/db/mongoose'
import Match from '../../../../../lib/models/Match'
import Player from '../../../../../lib/models/Player'
import User from '../../../../../lib/models/User'
import { verifyAuth } from '../../../../../lib/utils/authMiddleware'

export async function POST(request) {
  try {
    await dbConnect()
    
    // Use existing JWT authentication system
    const auth = await verifyAuth(request, { role: 'player' })
    if (!auth.authenticated) {
      return auth.response
    }

    const { matchId, sets, walkover, retiredPlayer } = await request.json()

    // Find the match
    const match = await Match.findById(matchId)
    if (!match) {
      return NextResponse.json({ success: false, error: 'Match not found' }, { status: 404 })
    }

    // Check if match is already completed
    if (match.status === 'completed') {
      return NextResponse.json({ 
        success: false, 
        error: 'Match has already been completed' 
      }, { status: 400 })
    }

    // Get user and player from JWT token
    const user = await User.findById(auth.user.userId)
    if (!user || !user.playerId) {
      return NextResponse.json({ success: false, error: 'Player not found' }, { status: 404 })
    }

    const userPlayer = await Player.findById(user.playerId)
    if (!userPlayer) {
      return NextResponse.json({ success: false, error: 'Player not found' }, { status: 404 })
    }

    const isPlayer1 = match.players.player1.equals(userPlayer._id)
    const isPlayer2 = match.players.player2.equals(userPlayer._id)
    
    if (!isPlayer1 && !isPlayer2) {
      return NextResponse.json({ success: false, error: 'You are not part of this match' }, { status: 403 })
    }

    // Validate sets format
    if (!walkover && (!sets || !Array.isArray(sets) || sets.length === 0)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Sets data is required' 
      }, { status: 400 })
    }

    // Determine winner based on sets or walkover
    let winner;
    let resultSets = [];
    let player1SetsWon = 0;
    let player2SetsWon = 0;
    
    if (walkover) {
      winner = userPlayer._id
      // For walkover, winner gets 2-0
      player1SetsWon = isPlayer1 ? 2 : 0
      player2SetsWon = isPlayer1 ? 0 : 2
    } else {
      // Count sets won by each player
      resultSets = sets.map(set => {
        const p1Score = isPlayer1 ? set.myScore : set.opponentScore
        const p2Score = isPlayer1 ? set.opponentScore : set.myScore
        
        if (p1Score > p2Score) player1SetsWon++
        else player2SetsWon++
        
        return { player1: p1Score, player2: p2Score }
      })
      
      // Validate match format (best of 3)
      if (player1SetsWon + player2SetsWon > 3) {
        return NextResponse.json({ 
          success: false, 
          error: 'Invalid match format. Maximum 3 sets allowed' 
        }, { status: 400 })
      }
      
      if (player1SetsWon === player2SetsWon) {
        return NextResponse.json({ 
          success: false, 
          error: 'Match cannot end in a tie' 
        }, { status: 400 })
      }
      
      winner = player1SetsWon > player2SetsWon ? match.players.player1 : match.players.player2
    }

    // Get both players for ELO calculation
    const [player1, player2] = await Promise.all([
      Player.findById(match.players.player1),
      Player.findById(match.players.player2)
    ])

    // Calculate ELO changes
    const player1Won = winner.equals(match.players.player1)
    const eloChange = calculateEloChange(
      player1.stats.eloRating,
      player2.stats.eloRating,
      player1Won
    )

    // Calculate points based on the scoring system
    // Win 2-0: 3 points, Win 2-1: 2 points, Lose 1-2: 1 point, Lose 0-2: 0 points
    let player1Points = 0
    let player2Points = 0
    
    if (player1SetsWon === 2 && player2SetsWon === 0) {
      player1Points = 3
      player2Points = 0
    } else if (player1SetsWon === 2 && player2SetsWon === 1) {
      player1Points = 2
      player2Points = 1
    } else if (player1SetsWon === 1 && player2SetsWon === 2) {
      player1Points = 1
      player2Points = 2
    } else if (player1SetsWon === 0 && player2SetsWon === 2) {
      player1Points = 0
      player2Points = 3
    }

    // Update match with result and ELO changes
    match.result = {
      winner: winner,
      score: {
        sets: resultSets,
        walkover: walkover || false,
        retiredPlayer: retiredPlayer || null
      },
      playedAt: new Date()
    }
    
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

    // Save match first
    await match.save()

    // Update player stats using the Player model method
    await Promise.all([
      player1.updateMatchStats({
        won: player1Won,
        eloChange: match.eloChanges.player1.change,
        score: match.getScoreDisplay(),
        opponent: player2._id,
        matchId: match._id,
        round: match.round,
        date: match.result.playedAt
      }),
      player2.updateMatchStats({
        won: !player1Won,
        eloChange: match.eloChanges.player2.change,
        score: match.getScoreDisplay(),
        opponent: player1._id,
        matchId: match._id,
        round: match.round,
        date: match.result.playedAt
      })
    ])

    // Update sets won/lost and points stats
    player1.stats.setsWon = (player1.stats.setsWon || 0) + player1SetsWon
    player1.stats.setsLost = (player1.stats.setsLost || 0) + player2SetsWon
    player1.stats.totalPoints = (player1.stats.totalPoints || 0) + player1Points
    
    player2.stats.setsWon = (player2.stats.setsWon || 0) + player2SetsWon
    player2.stats.setsLost = (player2.stats.setsLost || 0) + player1SetsWon
    player2.stats.totalPoints = (player2.stats.totalPoints || 0) + player2Points
    
    // Save both players with updated stats
    await Promise.all([player1.save(), player2.save()])

    // Populate match data for response
    await match.populate('players.player1 players.player2 league')

    return NextResponse.json({ 
      success: true, 
      message: 'Match result submitted successfully',
      match: match
    })

  } catch (error) {
    console.error('Error submitting match result:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}

// ELO calculation helper (same as admin)
function calculateEloChange(ratingA, ratingB, aWon) {
  const K = 32 // K-factor for ELO calculation
  const expectedA = 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400))
  const actualA = aWon ? 1 : 0
  return Math.round(K * (actualA - expectedA))
} 