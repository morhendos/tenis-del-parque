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

    // Get all active AND confirmed players in the league (be flexible with season)
    let players = await Player.find({ 
      league: leagueId,
      season: season,
      status: { $in: ['active', 'confirmed'] }
    }).lean()

    // If no players found with exact season, try finding active/confirmed players in the league
    if (players.length === 0) {
      console.log(`No players found for season ${season}, trying without season filter...`)
      players = await Player.find({ 
        league: leagueId,
        status: { $in: ['active', 'confirmed'] }
      }).lean()
      
      // Log what we found for debugging
      console.log(`Found ${players.length} active/confirmed players in league ${leagueId}:`, 
        players.map(p => ({ name: p.name, season: p.season, status: p.status }))
      )
    }

    if (players.length < 2) {
      return NextResponse.json(
        { error: 'Need at least 2 active or confirmed players to generate pairings' },
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

    // Log player distribution by skill level and status for debugging
    const skillDistribution = players.reduce((acc, player) => {
      const level = player.level || 'unknown'
      acc[level] = (acc[level] || 0) + 1
      return acc
    }, {})
    
    const statusDistribution = players.reduce((acc, player) => {
      const status = player.status || 'unknown'
      acc[status] = (acc[status] || 0) + 1
      return acc
    }, {})
    
    console.log(`Round ${round} - Player distribution by skill level:`, skillDistribution)
    console.log(`Round ${round} - Player distribution by status:`, statusDistribution)
    console.log(`Using ${round <= 3 ? 'skill-level priority' : 'traditional Swiss'} pairing for round ${round}`)

    // Generate pairings
    const result = generateSwissPairings(players, previousMatches, round)
    
    // Log pairing results for debugging
    console.log(`Generated ${result.pairings.length} pairings for round ${round}:`)
    result.pairings.forEach((pairing, index) => {
      const crossLevel = pairing.player1.level !== pairing.player2.level
      console.log(`  Match ${index + 1}: ${pairing.player1.name} (${pairing.player1.level}, ${pairing.player1.status}) vs ${pairing.player2.name} (${pairing.player2.level}, ${pairing.player2.status})${crossLevel ? ' [CROSS-LEVEL]' : ''}${pairing.isRematch ? ' [REMATCH - ERROR!]' : ''}`)
    })
    
    if (result.bye) {
      console.log(`  Regular Bye: ${result.bye.name} (${result.bye.level}, ${result.bye.status})`)
    }
    
    if (result.additionalByes && result.additionalByes.length > 0) {
      console.log(`  Additional Byes (to avoid rematches):`)
      result.additionalByes.forEach((player, index) => {
        console.log(`    ${index + 1}. ${player.name} (${player.level}, ${player.status})`)
      })
    }
    
    // Check for any rematches that shouldn't exist
    const rematchCount = result.pairings.filter(p => p.isRematch).length
    if (rematchCount > 0) {
      console.error(`ERROR: Found ${rematchCount} rematches that should have been avoided!`)
    }
    
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
    const deadlineDate = new Date()
    deadlineDate.setDate(deadlineDate.getDate() + 7) // 7 days from now
    deadlineDate.setHours(23, 59, 59, 999) // End of day
    
    for (const pairing of result.pairings) {
      const match = new Match({
        league: leagueId,
        season: season,
        round: round,
        players: {
          player1: pairing.player1._id,
          player2: pairing.player2._id
        },
        schedule: {
          deadline: deadlineDate
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
      const byeMatch = await createByeMatch(result.bye, leagueId, season, round)
      createdMatches.push(byeMatch)
    }

    // Handle additional byes (players who couldn't be paired without rematches)
    if (result.additionalByes && result.additionalByes.length > 0) {
      console.log(`Creating ${result.additionalByes.length} additional bye matches to avoid rematches`)
      
      for (const player of result.additionalByes) {
        const byeMatch = await createByeMatch(player, leagueId, season, round)
        createdMatches.push(byeMatch)
      }
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

    // Get active AND confirmed players count (be flexible with season)
    let activePlayers = await Player.countDocuments({
      league: leagueId,
      season: season,
      status: { $in: ['active', 'confirmed'] }
    })

    // If no players found with exact season, try without season filter
    if (activePlayers === 0) {
      console.log(`No active/confirmed players found for season ${season}, trying without season filter...`)
      activePlayers = await Player.countDocuments({
        league: leagueId,
        status: { $in: ['active', 'confirmed'] }
      })
      
      // Also get some debug info
      const playersDebug = await Player.find({
        league: leagueId,
        status: { $in: ['active', 'confirmed'] }
      }, 'name season status').lean()
      
      console.log(`Found ${activePlayers} active/confirmed players in league ${leagueId}:`, playersDebug)
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

// Helper function to create bye matches
async function createByeMatch(player, leagueId, season, round) {
  const byeMatch = new Match({
    league: leagueId,
    season: season,
    round: round,
    players: {
      player1: player._id,
      player2: null
    },
    status: 'completed',
    result: {
      winner: player._id
    },
    isBye: true,
    createdBy: 'Swiss Pairing System',
    createdAt: new Date(),
    updatedAt: new Date()
  })

  const savedByeMatch = await byeMatch.save()
  
  // Note: We don't manually update player stats here.
  // Stats are calculated from matches in standingsService.calculatePlayerStats()
  // BYE matches give 3 points but don't count toward matchesPlayed (for OpenRank)
  
  console.log(`Created BYE match for ${player.name} (Round ${round})`)

  return savedByeMatch
}
