import { NextResponse } from 'next/server'
import dbConnect from '../../../../../lib/db/mongoose'
import Match from '../../../../../lib/models/Match'
import Player from '../../../../../lib/models/Player'
import { getServerSession } from 'next-auth'

export async function POST(request) {
  try {
    await dbConnect()
    
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { matchId, myScore, opponentScore } = await request.json()

    // Validate scores
    if (myScore < 0 || myScore > 2 || opponentScore < 0 || opponentScore > 2) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid scores. Sets must be between 0 and 2' 
      }, { status: 400 })
    }

    if (myScore === opponentScore) {
      return NextResponse.json({ 
        success: false, 
        error: 'Match cannot end in a tie' 
      }, { status: 400 })
    }

    // Find the match
    const match = await Match.findById(matchId)
    if (!match) {
      return NextResponse.json({ success: false, error: 'Match not found' }, { status: 404 })
    }

    // Check if user is part of this match
    const userEmail = session.user.email
    const userPlayer = await Player.findOne({ email: userEmail })
    
    if (!userPlayer) {
      return NextResponse.json({ success: false, error: 'Player not found' }, { status: 404 })
    }

    const isPlayer1 = match.players.player1.equals(userPlayer._id)
    const isPlayer2 = match.players.player2.equals(userPlayer._id)
    
    if (!isPlayer1 && !isPlayer2) {
      return NextResponse.json({ success: false, error: 'You are not part of this match' }, { status: 403 })
    }

    // Calculate points based on score
    const getPoints = (playerScore, opponentScore) => {
      if (playerScore > opponentScore) {
        return playerScore === 2 && opponentScore === 0 ? 3 : 2 // 2-0 win = 3 points, 2-1 win = 2 points
      } else {
        return playerScore === 1 && opponentScore === 2 ? 1 : 0 // 1-2 loss = 1 point, 0-2 loss = 0 points
      }
    }

    const myPoints = getPoints(myScore, opponentScore)
    const opponentPoints = getPoints(opponentScore, myScore)

    // Update match result
    const winner = myScore > opponentScore ? userPlayer._id : (isPlayer1 ? match.players.player2 : match.players.player1)
    const loser = myScore > opponentScore ? (isPlayer1 ? match.players.player2 : match.players.player1) : userPlayer._id

    match.result = {
      winner: winner,
      loser: loser,
      score: isPlayer1 ? 
        { player1: myScore, player2: opponentScore } : 
        { player1: opponentScore, player2: myScore },
      points: isPlayer1 ? 
        { player1: myPoints, player2: opponentPoints } : 
        { player1: opponentPoints, player2: myPoints },
      playedAt: new Date(),
      reportedBy: userPlayer._id
    }

    match.status = 'completed'
    await match.save()

    // Update player statistics
    const updatePlayerStats = async (playerId, won, points, setsWon, setsLost) => {
      const player = await Player.findById(playerId)
      if (player) {
        player.stats.matchesPlayed = (player.stats.matchesPlayed || 0) + 1
        player.stats.matchesWon = (player.stats.matchesWon || 0) + (won ? 1 : 0)
        player.stats.setsWon = (player.stats.setsWon || 0) + setsWon
        player.stats.setsLost = (player.stats.setsLost || 0) + setsLost
        player.stats.totalPoints = (player.stats.totalPoints || 0) + points
        
        // Update ELO rating (simplified calculation)
        const opponent = await Player.findById(playerId === match.players.player1 ? match.players.player2 : match.players.player1)
        if (opponent) {
          const myElo = player.stats.eloRating || 1200
          const opponentElo = opponent.stats.eloRating || 1200
          const expected = 1 / (1 + Math.pow(10, (opponentElo - myElo) / 400))
          const kFactor = 32
          const actual = won ? 1 : 0
          const newElo = Math.round(myElo + kFactor * (actual - expected))
          
          player.stats.eloRating = Math.max(800, Math.min(2400, newElo)) // Clamp between 800-2400
        }
        
        await player.save()
      }
    }

    // Update both players' stats
    if (isPlayer1) {
      await updatePlayerStats(match.players.player1, myScore > opponentScore, myPoints, myScore, opponentScore)
      await updatePlayerStats(match.players.player2, opponentScore > myScore, opponentPoints, opponentScore, myScore)
    } else {
      await updatePlayerStats(match.players.player2, myScore > opponentScore, myPoints, myScore, opponentScore)
      await updatePlayerStats(match.players.player1, opponentScore > myScore, opponentPoints, opponentScore, myScore)
    }

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