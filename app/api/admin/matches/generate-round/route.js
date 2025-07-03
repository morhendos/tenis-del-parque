import { NextResponse } from 'next/server'
import dbConnect from '../../../../../lib/db/mongoose'
import Match from '../../../../../lib/models/Match'
import Player from '../../../../../lib/models/Player'
import { generateSwissPairings, validatePairings, getPairingsSummary } from '../../../../../lib/utils/swissPairing'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

export async function POST(request) {
  try {
    await dbConnect()

    const { leagueId, season, round, generateMatches = false } = await request.json()

    if (!leagueId || !season || !round) {
      return NextResponse.json(
        { error: 'League ID, season, and round are required' },
        { status: 400 }
      )
    }

    // Get all active players in the league (be flexible with season)
    let players = await Player.find({ 
      league: leagueId,
      season: season,
      status: 'active'
    }).lean()

    // If no players found with exact season, try finding active players in the league
    if (players.length === 0) {
      console.log(`No players found for season ${season}, trying without season filter...`)
      players = await Player.find({ 
        league: leagueId,
        status: 'active'
      }).lean()
      
      // Log what we found for debugging
      console.log(`Found ${players.length} active players in league ${leagueId}:`, 
        players.map(p => ({ name: p.name, season: p.season, status: p.status }))
      )
    }

    if (players.length < 2) {
      return NextResponse.json(
        { error: 'Need at least 2 active players to generate pairings' },
        { status: 400 }
      )
    }

    // Get all previous matches for this league/season
    const previousMatches = await Match.find({
      league: leagueId,
      season: season,
      status: { $in: ['completed', 'scheduled'] }
    }).lean()

    // Check if matches already exist for this round
    const existingRoundMatches = previousMatches.filter(m => m.round === round)
    if (existingRoundMatches.length > 0 && !generateMatches) {
      return NextResponse.json(
        { 
          error: `Round ${round} already has ${existingRoundMatches.length} matches. Delete them first or force regeneration.`,
          existingMatches: existingRoundMatches.length
        },
        { status: 400 }
      )
    }

    // Generate pairings
    const result = generateSwissPairings(players, previousMatches, round)
    
    // Validate pairings
    const validation = validatePairings(result.pairings, players)
    if (!validation.isValid) {
      return NextResponse.json(
        { error: 'Invalid pairings generated', details: validation.errors },
        { status: 400 }
      )
    }

    // Get summary for preview
    const summary = getPairingsSummary(result)

    // If not generating matches, just return the preview
    if (!generateMatches) {
      return NextResponse.json({
        preview: true,
        summary,
        message: 'Pairing preview generated successfully'
      })
    }

    // Create the matches in the database
    const createdMatches = []
    
    for (const pairing of result.pairings) {
      const match = new Match({
        league: leagueId,
        season: season,
        round: round,
        players: {
          player1: pairing.player1._id,
          player2: pairing.player2._id
        },
        status: 'scheduled',
        createdBy: 'Swiss Pairing System',
        createdAt: new Date(),
        updatedAt: new Date()
      })

      const savedMatch = await match.save()
      createdMatches.push(savedMatch)
    }

    // Handle bye if there is one
    if (result.bye) {
      const byeMatch = new Match({
        league: leagueId,
        season: season,
        round: round,
        players: {
          player1: result.bye._id,
          player2: null
        },
        status: 'completed',
        result: {
          winner: result.bye._id,
          isBye: true
        },
        isBye: true,
        createdBy: 'Swiss Pairing System',
        createdAt: new Date(),
        updatedAt: new Date()
      })

      const savedByeMatch = await byeMatch.save()
      
      // Update player stats for bye
      await Player.findByIdAndUpdate(result.bye._id, {
        $inc: { 
          'stats.matchesPlayed': 1,
          'stats.matchesWon': 1
        },
        $push: {
          matchHistory: {
            match: savedByeMatch._id,
            opponent: null,
            result: 'won',
            isBye: true,
            eloChange: 0,
            date: new Date()
          }
        }
      })

      createdMatches.push(savedByeMatch)
    }

    return NextResponse.json({
      success: true,
      summary,
      matchesCreated: createdMatches.length,
      message: `Successfully created ${createdMatches.length} matches for round ${round}`
    })

  } catch (error) {
    console.error('Error generating Swiss pairings:', error)
    return NextResponse.json(
      { error: 'Failed to generate pairings', details: error.message },
      { status: 500 }
    )
  }
}

// GET endpoint to check what rounds have been generated
export async function GET(request) {
  try {
    await dbConnect()

    const { searchParams } = new URL(request.url)
    const leagueId = searchParams.get('league')
    const season = searchParams.get('season')

    if (!leagueId || !season) {
      return NextResponse.json(
        { error: 'League ID and season are required' },
        { status: 400 }
      )
    }

    // Get all matches for this league/season grouped by round
    const matches = await Match.find({
      league: leagueId,
      season: season
    }).populate('players.player1 players.player2', 'name')
      .sort({ round: 1 })
      .lean()

    // Group matches by round
    const roundsData = matches.reduce((acc, match) => {
      if (!acc[match.round]) {
        acc[match.round] = {
          round: match.round,
          matches: [],
          totalMatches: 0,
          completedMatches: 0
        }
      }
      
      acc[match.round].matches.push(match)
      acc[match.round].totalMatches++
      if (match.status === 'completed') {
        acc[match.round].completedMatches++
      }
      
      return acc
    }, {})

    const rounds = Object.values(roundsData).sort((a, b) => a.round - b.round)

    // Get active players count (be flexible with season)
    let activePlayers = await Player.countDocuments({
      league: leagueId,
      season: season,
      status: 'active'
    })

    // If no players found with exact season, try without season filter
    if (activePlayers === 0) {
      console.log(`No active players found for season ${season}, trying without season filter...`)
      activePlayers = await Player.countDocuments({
        league: leagueId,
        status: 'active'
      })
      
      // Also get some debug info
      const playersDebug = await Player.find({
        league: leagueId,
        status: 'active'
      }, 'name season status').lean()
      
      console.log(`Found ${activePlayers} active players in league ${leagueId}:`, playersDebug)
    }

    return NextResponse.json({
      rounds,
      totalRounds: rounds.length,
      activePlayers,
      nextRound: rounds.length + 1
    })

  } catch (error) {
    console.error('Error fetching rounds data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch rounds data', details: error.message },
      { status: 500 }
    )
  }
}
