import { NextResponse } from 'next/server'
import dbConnect from '../../../../../lib/db/mongoose'
import Match from '../../../../../lib/models/Match'
import Player from '../../../../../lib/models/Player'
import { requirePlayer } from '../../../../../lib/auth/apiAuth'
import mongoose from 'mongoose'
import { updatePlayerStatsOnMatchComplete } from '../../../../../lib/services/playerStatsService'

// Helper function to get player registration for a league/season
function getPlayerRegistration(player, leagueId, season) {
  if (!player.registrations || player.registrations.length === 0) {
    // Fallback: create a default registration if none exists (no ELO - that's global)
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
  let match = null
  
  try {
    await dbConnect()
    
    // Use new NextAuth authentication system
    const { session: authSession, error } = await requirePlayer(request)
    if (error) return error

    const { matchId, sets, walkover, retiredPlayer } = await request.json()

    // Find the match
    match = await Match.findById(matchId)
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
    
    const txStart = Date.now()
    session.startTransaction({
      readPreference: 'primary',
      readConcern: { level: 'local' },
      writeConcern: { w: 'majority' }
      // Removed wtimeout to prevent transaction state mismatch errors
      // MongoDB will use default timeout which is more appropriate
    })

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

      // Update player stats using centralized service
      await updatePlayerStatsOnMatchComplete(match, player1, player2, session)

      // If this is a playoff match, update the bracket with the winner
      if (match.matchType === 'playoff' && match.playoffInfo) {
        const League = mongoose.model('League')
        const league = await League.findById(match.league).session(session)
        
        if (league && league.playoffConfig) {
          const { group, stage } = match.playoffInfo
          const bracket = group === 'A' ? league.playoffConfig.bracket.groupA : league.playoffConfig.bracket.groupB
          
          if (stage === 'quarterfinal') {
            const qfIndex = bracket.quarterfinals.findIndex(qf => 
              qf.matchId?.toString() === match._id.toString() ||
              (qf.seed1 === match.playoffInfo.seed1 && qf.seed2 === match.playoffInfo.seed2)
            )
            if (qfIndex !== -1) {
              bracket.quarterfinals[qfIndex].winner = winner
              console.log(`Updated QF${qfIndex + 1} winner:`, winner.toString())
            }
          } else if (stage === 'semifinal') {
            const sfIndex = bracket.semifinals.findIndex(sf => sf.matchId?.toString() === match._id.toString())
            if (sfIndex !== -1) {
              bracket.semifinals[sfIndex].winner = winner
              console.log(`Updated SF${sfIndex + 1} winner:`, winner.toString())
            }
          } else if (stage === 'final') {
            bracket.final.winner = winner
            console.log('Updated Final winner:', winner.toString())
          } else if (stage === 'third_place') {
            bracket.thirdPlace.winner = winner
            console.log('Updated 3rd Place winner:', winner.toString())
          }
          
          await league.save({ session, validateModifiedOnly: true })
        }
      }

      // Commit the transaction
      await session.commitTransaction()
      const txDuration = Date.now() - txStart
      console.log(`✅ Transaction completed in ${txDuration}ms`)

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
    // Always end the session and ensure it's cleaned up properly
    if (session) {
      try {
        // If transaction is still active, abort it
        if (session.inTransaction()) {
          await session.abortTransaction()
        }
      } catch (abortError) {
        console.warn('Error aborting transaction in finally:', abortError.message)
      }
      
      try {
        await session.endSession()
      } catch (endError) {
        console.warn('Error ending session in finally:', endError.message)
      }
    }
  }

  // AUTO-CREATE NEXT ROUND MATCHES AND AUTO-COMPLETE PLAYOFFS (OUTSIDE TRANSACTION - AFTER SUCCESS)
  // This runs after the transaction commits successfully
  if (match && match.matchType === 'playoff' && match.playoffInfo) {
    try {
      const League = mongoose.model('League')
      const league = await League.findById(match.league)
      
      if (league && league.playoffConfig) {
        const { group, stage } = match.playoffInfo
        const bracket = group === 'A' ? league.playoffConfig.bracket.groupA : league.playoffConfig.bracket.groupB
        
        // Create next round matches without transaction
        await autoCreateNextRoundMatchesNoTransaction(match, league, bracket, group, stage)
        
        // AUTO-COMPLETE: Check if all playoff matches are done and auto-complete
        if (stage === 'final' || stage === 'third_place') {
          await checkAndAutoCompletePlayoffs(league)
        }
      }
    } catch (autoCreateError) {
      // Don't fail the whole request if auto-creation fails
      console.error('⚠️ Failed to auto-create next round matches:', autoCreateError.message)
      console.log('💡 Matches can be created manually or by re-saving any playoff match')
    }
  }

  // Populate match data for response
  await match.populate('players.player1 players.player2 league')

  return NextResponse.json({ 
    success: true, 
    message: 'Match result submitted successfully',
    match: match
  })
}

// Auto-create next round matches when both matches are complete (NO TRANSACTION)
async function autoCreateNextRoundMatchesNoTransaction(completedMatch, league, bracket, group, stage) {
  console.log(`🎾 [PLAYER] Checking if next round matches should be created for ${stage} in Group ${group}...`)
  
  const SEASON_ID = new mongoose.Types.ObjectId('688f5d51c94f8e3b3cbfd87b')
  
  if (stage === 'quarterfinal') {
    const semifinals = bracket.semifinals
    
    for (let i = 0; i < semifinals.length; i++) {
      const sf = semifinals[i]
      
      if (sf.matchId) {
        console.log(`  SF${i + 1} already exists`)
        continue
      }
      
      const qf1 = bracket.quarterfinals[sf.fromMatch1]
      const qf2 = bracket.quarterfinals[sf.fromMatch2]
      
      if (qf1.winner && qf2.winner) {
        console.log(`  ✅ Creating SF${i + 1}`)
        
        const sfMatch = new Match({
          league: league._id,
          season: SEASON_ID,
          round: 10,
          matchType: 'playoff',
          playoffInfo: { group, stage: 'semifinal', matchNumber: i + 1 },
          players: { player1: qf1.winner, player2: qf2.winner },
          status: 'scheduled'
        })
        
        await sfMatch.save()
        semifinals[i].matchId = sfMatch._id
        await league.save({ validateModifiedOnly: true })
        
        console.log(`  🎉 Created semifinal: ${sfMatch._id}`)
      }
    }
  } else if (stage === 'semifinal') {
    const sf1 = bracket.semifinals[0]
    const sf2 = bracket.semifinals[1]
    
    if (sf1.winner && sf2.winner && !bracket.final.matchId) {
      const finalMatch = new Match({
        league: league._id,
        season: SEASON_ID,
        round: 11,
        matchType: 'playoff',
        playoffInfo: { group, stage: 'final' },
        players: { player1: sf1.winner, player2: sf2.winner },
        status: 'scheduled'
      })
      
      await finalMatch.save()
      bracket.final.matchId = finalMatch._id
      await league.save({ validateModifiedOnly: true })
      console.log(`  🎉 Created final: ${finalMatch._id}`)
    }
    
    if (sf1.winner && sf2.winner && !bracket.thirdPlace.matchId) {
      const sf1Match = await Match.findById(sf1.matchId)
      const sf2Match = await Match.findById(sf2.matchId)
      
      if (sf1Match && sf2Match) {
        const sf1Loser = sf1Match.players.player1.toString() === sf1.winner.toString()
          ? sf1Match.players.player2 : sf1Match.players.player1
        const sf2Loser = sf2Match.players.player1.toString() === sf2.winner.toString()
          ? sf2Match.players.player2 : sf2Match.players.player1
        
        const thirdPlaceMatch = new Match({
          league: league._id,
          season: SEASON_ID,
          round: 11,
          matchType: 'playoff',
          playoffInfo: { group, stage: 'third_place' },
          players: { player1: sf1Loser, player2: sf2Loser },
          status: 'scheduled'
        })
        
        await thirdPlaceMatch.save()
        bracket.thirdPlace.matchId = thirdPlaceMatch._id
        await league.save({ validateModifiedOnly: true })
        console.log(`  🎉 Created 3rd place: ${thirdPlaceMatch._id}`)
      }
    }
  }
}

// Check if all playoffs are complete and auto-complete
async function checkAndAutoCompletePlayoffs(league) {
  console.log('🏆 Checking if playoffs can be auto-completed...')
  
  if (!league.playoffConfig?.enabled) {
    console.log('  Playoffs not enabled, skipping')
    return
  }
  
  if (league.playoffConfig.currentPhase === 'completed') {
    console.log('  Playoffs already completed, skipping')
    return
  }
  
  const bracketA = league.playoffConfig.bracket?.groupA
  if (!bracketA) {
    console.log('  No bracket A found, skipping')
    return
  }
  
  // Check if Group A is complete
  const groupAComplete = bracketA.final?.winner && bracketA.thirdPlace?.winner
  console.log(`  Group A complete: ${groupAComplete} (final: ${!!bracketA.final?.winner}, 3rd: ${!!bracketA.thirdPlace?.winner})`)
  
  if (!groupAComplete) {
    console.log('  Group A not complete yet')
    return
  }
  
  // Check if Group B is complete (if it exists)
  if (league.playoffConfig.numberOfGroups === 2) {
    const bracketB = league.playoffConfig.bracket?.groupB
    if (!bracketB) {
      console.log('  No bracket B found but 2 groups configured, skipping')
      return
    }
    
    const groupBComplete = bracketB.final?.winner && bracketB.thirdPlace?.winner
    console.log(`  Group B complete: ${groupBComplete} (final: ${!!bracketB.final?.winner}, 3rd: ${!!bracketB.thirdPlace?.winner})`)
    
    if (!groupBComplete) {
      console.log('  Group B not complete yet')
      return
    }
  }
  
  // All playoff matches are complete - auto-complete the playoffs!
  console.log('  ✅ All playoff matches complete! Auto-completing playoffs...')
  
  league.playoffConfig.currentPhase = 'completed'
  league.playoffConfig.completedAt = new Date()
  league.status = 'completed'
  
  await league.save({ validateModifiedOnly: true })
  
  console.log('  🏆 Playoffs auto-completed successfully!')
}

// ELO calculation helper (same as admin)
function calculateEloChange(ratingA, ratingB, aWon) {
  const K = 32 // K-factor for ELO calculation
  const expectedA = 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400))
  const actualA = aWon ? 1 : 0
  return Math.round(K * (actualA - expectedA))
}
