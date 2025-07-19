import { NextResponse } from 'next/server'
import dbConnect from '../../../../../lib/db/mongoose'
import Match from '../../../../../lib/models/Match'
import Player from '../../../../../lib/models/Player'
import { requirePlayer } from '../../../../../lib/auth/apiAuth'

export async function POST(request) {
  try {
    await dbConnect()
    
    // Use new NextAuth authentication system
    const { session, error } = await requirePlayer(request)
    if (error) return error

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

    // Get player from session's playerId
    if (!session.user.playerId) {
      // Try to find player by email as fallback
      const playerByEmail = await Player.findOne({ email: session.user.email.toLowerCase() })
      
      if (!playerByEmail) {
        return NextResponse.json({ 
          success: false, 
          error: 'Your user account is not linked to a player profile. Please contact support to resolve this issue.',
          details: 'No playerId found in session and no player found with your email address.'
        }, { status: 404 })
      }
      
      // If we found a player with matching email, we could link them here
      // but for now just return an error to maintain data integrity
      return NextResponse.json({ 
        success: false, 
        error: 'Your user account is not properly linked to your player profile. Please contact support.',
        details: `Found player with email ${session.user.email} but accounts are not linked.`
      }, { status: 404 })
    }

    const userPlayer = await Player.findById(session.user.playerId)
    if (!userPlayer) {
      return NextResponse.json({ 
        success: false, 
        error: 'Player profile not found. Please contact support.',
        details: `PlayerId ${session.user.playerId} not found in database.`
      }, { status: 404 })
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
      // Process and validate sets
      const isThirdSetSuperTiebreak = sets.length === 3
      
      resultSets = sets.map((set, index) => {
        const p1Score = isPlayer1 ? set.myScore : set.opponentScore
        const p2Score = isPlayer1 ? set.opponentScore : set.myScore
        
        // Validate set scores
        if (index === 2 && isThirdSetSuperTiebreak) {
          // Super tiebreak validation
          if (p1Score < 10 && p2Score < 10) {
            throw new Error('Super tiebreak: One player must reach at least 10 points')
          }
          if (Math.abs(p1Score - p2Score) < 2) {
            throw new Error('Super tiebreak must be won by 2 points difference')
          }
        } else {
          // Regular set validation
          if (p1Score === p2Score) {
            throw new Error('Set cannot end in a tie')
          }
          
          // Basic score range validation
          if (p1Score > 7 || p2Score > 7) {
            throw new Error('Maximum regular set score is 7')
          }
          
          // Validate winning conditions
          if (p1Score === 7 || p2Score === 7) {
            const winner = p1Score === 7 ? p1Score : p2Score
            const loser = p1Score === 7 ? p2Score : p1Score
            if (winner === 7 && loser !== 5 && loser !== 6 && loser < 5) {
              // Valid: 7-5, 7-6, or 7-0 through 7-4
            } else if (winner === 7 && loser > 6) {
              throw new Error('Invalid tiebreak score')
            }
          } else if (p1Score === 6 || p2Score === 6) {
            const winner = p1Score === 6 ? p1Score : p2Score
            const loser = p1Score === 6 ? p2Score : p1Score
            if (loser > 4 && winner - loser < 2) {
              throw new Error('Must win set by 2 games when opponent has 5+ games')
            }
          }
        }
        
        // Count set wins
        if (p1Score > p2Score) player1SetsWon++
        else player2SetsWon++
        
        return { player1: p1Score, player2: p2Score }
      })
      
      // Validate match format
      if (sets.length > 3) {
        return NextResponse.json({ 
          success: false, 
          error: 'Maximum 3 sets allowed (including super tiebreak)' 
        }, { status: 400 })
      }
      
      // Check for valid match outcomes
      if (sets.length === 2) {
        // If only 2 sets, one player must have won both
        if (player1SetsWon === 1 && player2SetsWon === 1) {
          return NextResponse.json({ 
            success: false, 
            error: 'Match tied 1-1, super tiebreak required' 
          }, { status: 400 })
        }
      } else if (sets.length === 3) {
        // With 3 sets, first two must be split 1-1
        let firstTwoSetsP1 = 0
        let firstTwoSetsP2 = 0
        
        for (let i = 0; i < 2; i++) {
          if (resultSets[i].player1 > resultSets[i].player2) {
            firstTwoSetsP1++
          } else {
            firstTwoSetsP2++
          }
        }
        
        if (firstTwoSetsP1 !== 1 || firstTwoSetsP2 !== 1) {
          return NextResponse.json({ 
            success: false, 
            error: 'Third set (super tiebreak) only allowed when first two sets are split 1-1' 
          }, { status: 400 })
        }
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
    
    // FIXED: Apply ELO changes correctly
    // eloChange is the amount player1's rating should change
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

    // Update sets won/lost stats
    player1.stats.setsWon = (player1.stats.setsWon || 0) + player1SetsWon
    player1.stats.setsLost = (player1.stats.setsLost || 0) + player2SetsWon
    
    player2.stats.setsWon = (player2.stats.setsWon || 0) + player2SetsWon
    player2.stats.setsLost = (player2.stats.setsLost || 0) + player1SetsWon
    
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
    
    // Return validation errors with appropriate message
    if (error.message && (
      error.message.includes('Super tiebreak') ||
      error.message.includes('Set cannot') ||
      error.message.includes('Must win') ||
      error.message.includes('Invalid') ||
      error.message.includes('Maximum') ||
      error.message.includes('Third set')
    )) {
      return NextResponse.json({ 
        success: false, 
        error: error.message 
      }, { status: 400 })
    }
    
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