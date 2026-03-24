import { NextResponse } from 'next/server'
import mongoose from 'mongoose'
import dbConnect from '../../../../../lib/db/mongoose'
import Match from '../../../../../lib/models/Match'
import Player from '../../../../../lib/models/Player'
import League from '../../../../../lib/models/League'
import { generateSwissPairings, validatePairings, getPairingsSummary } from '../../../../../lib/utils/swissPairing'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

/**
 * Helper: Query players using the registrations array structure
 * and flatten results so each player has top-level level, status, stats
 */
async function getLeaguePlayers(leagueId) {
  const leagueObjectId = new mongoose.Types.ObjectId(leagueId)
  
  const rawPlayers = await Player.find({
    registrations: {
      $elemMatch: {
        league: leagueObjectId,
        status: { $in: ['active', 'confirmed'] }
      }
    }
  }).lean()

  // Flatten: extract the matching registration's level/status/stats to top level
  const players = rawPlayers.map(player => {
    const reg = player.registrations.find(r => 
      r.league.toString() === leagueId.toString() &&
      ['active', 'confirmed'].includes(r.status)
    )
    
    if (!reg) return null
    
    return {
      _id: player._id,
      name: player.name,
      email: player.email,
      level: reg.level,
      status: reg.status,
      eloRating: player.eloRating || 1200,
      stats: {
        matchesPlayed: reg.stats?.matchesPlayed || 0,
        matchesWon: reg.stats?.matchesWon || 0,
        totalPoints: reg.stats?.totalPoints || 0,
        setsWon: reg.stats?.setsWon || 0,
        setsLost: reg.stats?.setsLost || 0,
        gamesWon: reg.stats?.gamesWon || 0,
        gamesLost: reg.stats?.gamesLost || 0,
        eloRating: player.eloRating || 1200
      }
    }
  }).filter(Boolean)

  return players
}

/**
 * Helper: Resolve the correct season value for a league.
 * The frontend may send the leagueId as the season (fallback when selectedLeague is null),
 * so we look up the league and construct the proper season string.
 */
async function resolveSeasonForLeague(leagueId, frontendSeason) {
  // If the frontend sent a proper season string (like "summer-2025"), use it
  if (frontendSeason && frontendSeason !== leagueId && !mongoose.Types.ObjectId.isValid(frontendSeason)) {
    return frontendSeason
  }
  
  // Otherwise, look up the league to get the actual season
  const league = await League.findById(leagueId).lean()
  if (league?.season?.type && league?.season?.year) {
    const resolved = `${league.season.type}-${league.season.year}`
    console.log(`Resolved season from league: "${resolved}" (frontend sent: "${frontendSeason}")`)
    return resolved
  }
  
  // Last resort: use what the frontend sent
  console.warn(`Could not resolve season for league ${leagueId}, using frontend value: "${frontendSeason}"`)
  return frontendSeason
}

export async function POST(request) {
  try {
    await dbConnect()

    const { leagueId, season: frontendSeason, round, generateMatches = false } = await request.json()

    if (!leagueId || !round) {
      return NextResponse.json(
        { error: 'League ID and round are required' },
        { status: 400 }
      )
    }

    // Resolve the correct season value
    const season = await resolveSeasonForLeague(leagueId, frontendSeason)
    console.log(`Swiss pairing: league=${leagueId}, season="${season}", round=${round}`)

    // Get all active AND confirmed players in the league using registrations structure
    const players = await getLeaguePlayers(leagueId)
    
    console.log(`Swiss pairing: Found ${players.length} active/confirmed players in league ${leagueId}`)
    if (players.length > 0) {
      console.log('Players:', players.map(p => ({ name: p.name, level: p.level, status: p.status })))
    }

    if (players.length < 2) {
      return NextResponse.json(
        { error: 'Need at least 2 active or confirmed players to generate pairings' },
        { status: 400 }
      )
    }

    // IMPORTANT: Fetch ALL matches for this league to build complete opponent history.
    // We do NOT filter by season here because:
    // 1. The frontend may send the wrong season value
    // 2. We want the full picture of who has played whom
    const allLeagueMatches = await Match.find({
      league: leagueId,
      status: { $in: ['completed', 'scheduled'] }
    }).lean()
    
    console.log(`Found ${allLeagueMatches.length} total matches for league (all seasons)`)
    
    // Also get season-specific matches for round existence check
    const seasonMatches = allLeagueMatches.filter(m => {
      const matchSeason = m.season?.toString()
      return matchSeason === season
    })
    console.log(`Found ${seasonMatches.length} matches for season "${season}"`)
    
    // If season filter gives 0 but there are matches, log the actual season values for debugging
    if (seasonMatches.length === 0 && allLeagueMatches.length > 0) {
      const uniqueSeasons = [...new Set(allLeagueMatches.map(m => m.season?.toString()))]
      console.log(`WARNING: No matches found for season "${season}". Actual season values in DB:`, uniqueSeasons)
      // Use all matches anyway — the season string might not match exactly
    }

    // Check if matches already exist for this round (use all league matches for robustness)
    const existingRoundMatches = allLeagueMatches.filter(m => m.round === round)
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

    // Generate pairings — pass ALL league matches for complete opponent history
    const result = generateSwissPairings(players, allLeagueMatches, round)
    
    // Log pairing results for debugging
    console.log(`Generated ${result.pairings.length} pairings for round ${round}:`)
    result.pairings.forEach((pairing, index) => {
      const crossLevel = pairing.player1.level !== pairing.player2.level
      console.log(`  Match ${index + 1}: ${pairing.player1.name} (${pairing.player1.level}, ${pairing.player1.status}) vs ${pairing.player2.name} (${pairing.player2.level}, ${pairing.player2.status})${crossLevel ? ' [CROSS-LEVEL]' : ''}${pairing.isRematch ? ' [REMATCH]' : ''}`)
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
    
    // Report rematch count
    const rematchCount = result.pairings.filter(p => p.isRematch).length
    if (rematchCount > 0) {
      console.warn(`⚠ ${rematchCount} rematch(es) were unavoidable given opponent history`)
    } else {
      console.log(`✓ All pairings are fresh matchups!`)
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

    // Get active AND confirmed players count using registrations structure
    const leagueObjectId = new mongoose.Types.ObjectId(leagueId)
    const activePlayers = await Player.countDocuments({
      registrations: {
        $elemMatch: {
          league: leagueObjectId,
          status: { $in: ['active', 'confirmed'] }
        }
      }
    })

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
  
  console.log(`Created BYE match for ${player.name} (Round ${round})`)

  return savedByeMatch
}
