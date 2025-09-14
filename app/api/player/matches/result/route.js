import { NextResponse } from 'next/server'
import dbConnect from '../../../../../lib/db/mongoose'
import Match from '../../../../../lib/models/Match'
import Player from '../../../../../lib/models/Player'
import { requirePlayer } from '../../../../../lib/auth/apiAuth'
import mongoose from 'mongoose'

// Helper function to get player registration for a league/season
function getPlayerRegistration(player, leagueId, season) {
  if (!player.registrations || player.registrations.length === 0) {
    // Fallback: create a default registration if none exists
    return {
      league: leagueId,
      season: season,
      stats: {
        matchesPlayed: 0,
        matchesWon: 0,
        totalPoints: 0,
        setsWon: 0,
        setsLost: 0,
        gamesWon: 0,
        gamesLost: 0,
        retirements: 0,
        walkovers: 0
      },
      matchHistory: []
    }
  }
  
  // Find registration for this league/season
  let registration = player.registrations.find(reg => 
    reg.league.toString() === leagueId.toString() && 
    reg.season === season
  )
  
  if (!registration) {
    // Use first registration as fallback
    registration = player.registrations[0]
  }
  
  return registration
}

export async function POST(request) {
  let session = null
  
  try {
    await dbConnect()
    
    // Use new NextAuth authentication system
    const { session: authSession, error } = await requirePlayer(request)
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
    if (!authSession.user.playerId) {
      // Try to find player by email as fallback
      const playerByEmail = await Player.findOne({ email: authSession.user.email.toLowerCase() })
      
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
        details: `Found player with email ${authSession.user.email} but accounts are not linked.`
      }, { status: 404 })
    }

    const userPlayer = await Player.findById(authSession.user.playerId)
    if (!userPlayer) {
      return NextResponse.json({ 
        success: false, 
        error: 'Player profile not found. Please contact support.',
        details: `PlayerId ${authSession.user.playerId} not found in database.`
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

    // Start a database transaction to ensure all operations succeed or fail together
    session = await mongoose.startSession()
    await session.startTransaction()

    try {
      // Get both players for ELO calculation
      const [player1, player2] = await Promise.all([
        Player.findById(match.players.player1).session(session),
        Player.findById(match.players.player2).session(session)
      ])

      // Calculate ELO changes only for non-walkover matches
      const player1Won = winner.equals(match.players.player1)
      let eloChange = 0;
      
      if (!walkover) {
        eloChange = calculateEloChange(
          player1.eloRating || 1200,
          player2.eloRating || 1200,
          player1Won
        )
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
      
      // Apply ELO changes using GLOBAL ELO (will be 0 for walkovers)
      match.eloChanges = {
        player1: {
          before: player1.eloRating || 1200,
          after: (player1.eloRating || 1200) + eloChange,
          change: eloChange
        },
        player2: {
          before: player2.eloRating || 1200,
          after: (player2.eloRating || 1200) - eloChange,
          change: -eloChange
        }
      }

      // Get player registrations for league-specific stats
      const player1Reg = getPlayerRegistration(player1, match.league, match.season)
      const player2Reg = getPlayerRegistration(player2, match.league, match.season)

      // Update GLOBAL ELO (player level)
      player1.eloRating = (player1.eloRating || 1200) + eloChange
      player2.eloRating = (player2.eloRating || 1200) - eloChange
      
      // Update global highest/lowest ELO
      if (player1.eloRating > (player1.highestElo || 1200)) {
        player1.highestElo = player1.eloRating
      }
      if (player1.eloRating < (player1.lowestElo || 1200)) {
        player1.lowestElo = player1.eloRating
      }
      if (player2.eloRating > (player2.highestElo || 1200)) {
        player2.highestElo = player2.eloRating
      }
      if (player2.eloRating < (player2.lowestElo || 1200)) {
        player2.lowestElo = player2.eloRating
      }
      
      // Update LEAGUE-SPECIFIC stats (registration level)
      // Player 1 league stats
      player1Reg.stats.matchesPlayed += 1
      if (player1Won) player1Reg.stats.matchesWon += 1
      
      player1Reg.stats.setsWon = (player1Reg.stats.setsWon || 0) + player1SetsWon
      player1Reg.stats.setsLost = (player1Reg.stats.setsLost || 0) + player2SetsWon
      
      // Add to match history (limit to last 20 matches to avoid performance issues)
      if (!player1Reg.matchHistory) player1Reg.matchHistory = []
      player1Reg.matchHistory.unshift({
        match: match._id,
        opponent: player2._id,
        result: player1Won ? 'won' : 'lost',
        score: match.getScoreDisplay(),
        eloChange: eloChange,
        eloAfter: player1.eloRating, // Use global ELO
        round: match.round,
        date: match.result.playedAt
      })
      
      // Keep only last 20 matches in history to avoid bloat
      if (player1Reg.matchHistory.length > 20) {
        player1Reg.matchHistory = player1Reg.matchHistory.slice(0, 20)
      }

      // Player 2 LEAGUE-SPECIFIC stats
      player2Reg.stats.matchesPlayed += 1
      if (!player1Won) player2Reg.stats.matchesWon += 1
      
      player2Reg.stats.setsWon = (player2Reg.stats.setsWon || 0) + player2SetsWon
      player2Reg.stats.setsLost = (player2Reg.stats.setsLost || 0) + player1SetsWon
      
      // Add to match history (limit to last 20 matches to avoid performance issues)
      if (!player2Reg.matchHistory) player2Reg.matchHistory = []
      player2Reg.matchHistory.unshift({
        match: match._id,
        opponent: player1._id,
        result: player1Won ? 'lost' : 'won',
        score: match.getScoreDisplay(),
        eloChange: -eloChange,
        eloAfter: player2.eloRating, // Use global ELO
        round: match.round,
        date: match.result.playedAt
      })
      
      // Keep only last 20 matches in history to avoid bloat
      if (player2Reg.matchHistory.length > 20) {
        player2Reg.matchHistory = player2Reg.matchHistory.slice(0, 20)
      }

      // Save all documents within the transaction
      await match.save({ session })
      await player1.save({ session })
      await player2.save({ session })

      // Commit the transaction
      await session.commitTransaction()

      // Populate match data for response (outside transaction)
      await match.populate('players.player1 players.player2 league')

      return NextResponse.json({ 
        success: true, 
        message: 'Match result submitted successfully',
        match: match
      })

    } catch (transactionError) {
      // Rollback the transaction
      await session.abortTransaction()
      throw transactionError
    }

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
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 })
  } finally {
    // Always end the session
    if (session) {
      await session.endSession()
    }
  }
}

// ELO calculation helper (same as admin)
function calculateEloChange(ratingA, ratingB, aWon) {
  const K = 32 // K-factor for ELO calculation
  const expectedA = 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400))
  const actualA = aWon ? 1 : 0
  return Math.round(K * (actualA - expectedA))
}
