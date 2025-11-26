import { NextResponse } from 'next/server'
import dbConnect from '../../../../../lib/db/mongoose'
import Match from '../../../../../lib/models/Match'
import Player from '../../../../../lib/models/Player'
import League from '../../../../../lib/models/League'
import { requireAdmin } from '../../../../../lib/auth/apiAuth'
import mongoose from 'mongoose'
import { 
  updatePlayerStatsOnMatchComplete, 
  reversePlayerStatsOnMatchReset 
} from '../../../../../lib/services/playerStatsService'

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

      // Check if players have registrations for this league (more flexible than old league field)
      const player1HasReg = newPlayer1.registrations?.some(reg => 
        reg.league.toString() === match.league.toString()
      )
      const player2HasReg = newPlayer2.registrations?.some(reg => 
        reg.league.toString() === match.league.toString()
      )
      
      if (!player1HasReg || !player2HasReg) {
        return NextResponse.json(
          { error: 'Players must be registered for the same league as the match' },
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

    // Handle result entry/update with RETRY LOGIC for transient errors
    if (body.result) {
      const maxRetries = 3
      let lastError = null
      
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        session = await mongoose.startSession()
        const txStart = Date.now()
        
        try {
          console.log(`[ADMIN] Transaction attempt ${attempt}/${maxRetries}`)
          
          session.startTransaction({
            readPreference: 'primary',
            readConcern: { level: 'local' },
            writeConcern: { w: 'majority' }
          })
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
          await reversePlayerStatsOnMatchReset(match, player1, player2, session)
        }

        // Calculate ELO changes for the new result
        const player1Won = winnerId === player1Id
        let eloChange = 0
        
        // Get player registrations for ELO calculation
        const player1RegForElo = getPlayerRegistration(player1, match.league, match.season)
        const player2RegForElo = getPlayerRegistration(player2, match.league, match.season)
        
        // Only calculate ELO for non-walkover matches using GLOBAL player ELO
        if (!body.result.score?.walkover) {
          eloChange = calculateEloChange(
            player1.eloRating || 1200,
            player2.eloRating || 1200,
            player1Won
          )
        }

        // Update match with result and ELO changes
        match.result = body.result
        match.result.playedAt = new Date()
        match.status = 'completed'

        // Apply ELO changes to GLOBAL player ELO
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

        // Update player stats using centralized service
        await updatePlayerStatsOnMatchComplete(match, player1, player2, session)

        // If this is a playoff match, update the bracket with the winner
        if (match.matchType === 'playoff' && match.playoffInfo && body.result?.winner) {
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
                bracket.quarterfinals[qfIndex].winner = body.result.winner
                console.log(`Admin: Updated QF${qfIndex + 1} winner:`, body.result.winner.toString())
              }
            } else if (stage === 'semifinal') {
              const sfIndex = bracket.semifinals.findIndex(sf => sf.matchId?.toString() === match._id.toString())
              if (sfIndex !== -1) {
                bracket.semifinals[sfIndex].winner = body.result.winner
                console.log(`Admin: Updated SF${sfIndex + 1} winner:`, body.result.winner.toString())
              }
            } else if (stage === 'final') {
              bracket.final.winner = body.result.winner
              console.log('Admin: Updated Final winner:', body.result.winner.toString())
            } else if (stage === 'third_place') {
              bracket.thirdPlace.winner = body.result.winner
              console.log('Admin: Updated 3rd Place winner:', body.result.winner.toString())
            }
            
            await league.save({ session, validateModifiedOnly: true })
          }
        }

        await session.commitTransaction()
        const txDuration = Date.now() - txStart
        console.log(`✅ [ADMIN] Transaction succeeded on attempt ${attempt} (${txDuration}ms)`)
        
        // Success! Break out of retry loop
        await session.endSession()
        session = null
        
        // Save the match (result updates happen inside transaction, but we still need to save)
        await match.save()
        break
        
      } catch (transactionError) {
        const txDuration = Date.now() - txStart
        console.error(`❌ [ADMIN] Transaction attempt ${attempt} failed after ${txDuration}ms:`, transactionError.message)
        
        // Always abort and end session on error
        try {
          if (session.inTransaction()) {
            await session.abortTransaction()
          }
        } catch (abortErr) {
          console.warn('Error aborting transaction:', abortErr.message)
        }
        
        try {
          await session.endSession()
        } catch (endErr) {
          console.warn('Error ending session:', endErr.message)
        }
        
        session = null
        lastError = transactionError
        
        // Check if this is a transient error that we should retry
        const isTransient = transactionError.errorLabels?.includes('TransientTransactionError') ||
                           transactionError.code === 251 || // NoSuchTransaction
                           transactionError.code === 112 || // WriteConflict  
                           transactionError.code === 244    // NotWritablePrimary
        
        if (isTransient && attempt < maxRetries) {
          console.log(`⏳ [ADMIN] Retrying transaction (transient error detected)...`)
          // Wait a bit before retry (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, 100 * attempt))
          continue
        }
        
        // Not transient or out of retries
        if (attempt >= maxRetries) {
          console.error(`❌ [ADMIN] Transaction failed after ${maxRetries} attempts`)
        }
        throw new Error(`Failed to update match result: ${transactionError.message}`)
      }
    }
    }

    // Save the match for non-result updates (schedule, status, notes, etc.)
    // This runs when NOT updating result (result updates save inside the transaction)
    if (!body.result) {
      await match.save()
    }

    // AUTO-CREATE NEXT ROUND MATCHES (OUTSIDE TRANSACTION)
    // This runs after the transaction commits successfully
    if (body.result && match.matchType === 'playoff' && match.playoffInfo) {
      try {
        const League = mongoose.model('League')
        const league = await League.findById(match.league)
        
        if (league && league.playoffConfig) {
          const { group, stage } = match.playoffInfo
          const bracket = group === 'A' ? league.playoffConfig.bracket.groupA : league.playoffConfig.bracket.groupB
          
          // Create next round matches without transaction
          await autoCreateNextRoundMatchesNoTransaction(match, league, bracket, group, stage)
        }
      } catch (autoCreateError) {
        // Don't fail the whole request if auto-creation fails
        console.error('⚠️ Failed to auto-create next round matches:', autoCreateError.message)
        console.log('💡 Matches can be created manually or by re-saving any playoff match')
      }
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
      try {
        if (session.inTransaction()) {
          await session.abortTransaction()
        }
      } catch (err) {
        console.warn('Error aborting transaction:', err.message)
      } finally {
        await session.endSession()
      }
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
    session.startTransaction({
      readPreference: 'primary',
      readConcern: { level: 'local' },
      writeConcern: { w: 'majority' }
    })

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
    await reversePlayerStatsOnMatchReset(match, player1, player2, session)

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
        setsWon: 0,
        setsLost: 0,
        gamesWon: 0,
        gamesLost: 0
      },
      matchHistory: []
    }
  }
  
  // Find registration for this league/season
  let registration = null
  
  if (season) {
    // If season is provided, find matching league AND season
    registration = player.registrations.find(reg => 
      reg.league.toString() === leagueId.toString() && 
      reg.season?.toString() === season.toString()
    )
  }
  
  if (!registration) {
    // Fallback: find any registration for this league (ignore season)
    registration = player.registrations.find(reg => 
      reg.league.toString() === leagueId.toString()
    )
  }
  
  if (!registration) {
    // Use first registration as last resort
    registration = player.registrations[0]
  }
  
  return registration
}

// Note: reverseMatchStats function has been replaced by centralized playerStatsService

// Note: updatePlayerStatsManually function has been replaced by centralized playerStatsService

// Auto-create next round matches when both matches are complete (NO TRANSACTION)
async function autoCreateNextRoundMatchesNoTransaction(completedMatch, league, bracket, group, stage) {
  console.log(`🎾 [ADMIN] Checking if next round matches should be created for ${stage} in Group ${group}...`)
  
  const SEASON_ID = new mongoose.Types.ObjectId('688f5d51c94f8e3b3cbfd87b') // Summer 2025
  
  if (stage === 'quarterfinal') {
    const semifinals = bracket.semifinals
    
    for (let i = 0; i < semifinals.length; i++) {
      const sf = semifinals[i]
      
      if (sf.matchId) {
        console.log(`  SF${i + 1} already exists (matchId: ${sf.matchId})`)
        continue
      }
      
      const qf1 = bracket.quarterfinals[sf.fromMatch1]
      const qf2 = bracket.quarterfinals[sf.fromMatch2]
      
      if (qf1.winner && qf2.winner) {
        console.log(`  ✅ Both QF${sf.fromMatch1 + 1} and QF${sf.fromMatch2 + 1} are complete!`)
        console.log(`  Creating SF${i + 1}: ${qf1.winner} vs ${qf2.winner}`)
        
        const sfMatch = new Match({
          league: league._id,
          season: SEASON_ID,
          round: 10,
          matchType: 'playoff',
          playoffInfo: {
            group,
            stage: 'semifinal',
            matchNumber: i + 1
          },
          players: {
            player1: qf1.winner,
            player2: qf2.winner
          },
          status: 'scheduled'
        })
        
        await sfMatch.save()
        semifinals[i].matchId = sfMatch._id
        await league.save({ validateModifiedOnly: true })
        
        console.log(`  🎉 Created semifinal match: ${sfMatch._id}`)
      } else {
        console.log(`  ⏳ Waiting for QF${sf.fromMatch1 + 1} and QF${sf.fromMatch2 + 1} to complete`)
      }
    }
  } else if (stage === 'semifinal') {
    const sf1 = bracket.semifinals[0]
    const sf2 = bracket.semifinals[1]
    
    if (sf1.winner && sf2.winner && !bracket.final.matchId) {
      console.log(`  ✅ Both semifinals complete! Creating FINAL`)
      
      const finalMatch = new Match({
        league: league._id,
        season: SEASON_ID,
        round: 11,
        matchType: 'playoff',
        playoffInfo: { group, stage: 'final' },
        players: {
          player1: sf1.winner,
          player2: sf2.winner
        },
        status: 'scheduled'
      })
      
      await finalMatch.save()
      bracket.final.matchId = finalMatch._id
      await league.save({ validateModifiedOnly: true })
      
      console.log(`  🎉 Created final match: ${finalMatch._id}`)
    }
    
    if (sf1.winner && sf2.winner && !bracket.thirdPlace.matchId) {
      console.log(`  ✅ Creating 3RD PLACE match`)
      
      const sf1Match = await Match.findById(sf1.matchId)
      const sf2Match = await Match.findById(sf2.matchId)
      
      if (sf1Match && sf2Match) {
        const sf1Loser = sf1Match.players.player1.toString() === sf1.winner.toString()
          ? sf1Match.players.player2
          : sf1Match.players.player1
        const sf2Loser = sf2Match.players.player1.toString() === sf2.winner.toString()
          ? sf2Match.players.player2
          : sf2Match.players.player1
        
        const thirdPlaceMatch = new Match({
          league: league._id,
          season: SEASON_ID,
          round: 11,
          matchType: 'playoff',
          playoffInfo: { group, stage: 'third_place' },
          players: {
            player1: sf1Loser,
            player2: sf2Loser
          },
          status: 'scheduled'
        })
        
        await thirdPlaceMatch.save()
        bracket.thirdPlace.matchId = thirdPlaceMatch._id
        await league.save({ validateModifiedOnly: true })
        
        console.log(`  🎉 Created 3rd place match: ${thirdPlaceMatch._id}`)
      }
    }
  }
}

// ELO calculation helper
function calculateEloChange(ratingA, ratingB, aWon) {
  const K = 32 // K-factor for ELO calculation
  const expectedA = 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400))
  const actualA = aWon ? 1 : 0
  return Math.round(K * (actualA - expectedA))
}
