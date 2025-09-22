import { NextResponse } from 'next/server'
import dbConnect from '../../../../../../lib/db/mongoose'
import League from '../../../../../../lib/models/League'
import Match from '../../../../../../lib/models/Match'
import Player from '../../../../../../lib/models/Player'
import { requireAdmin } from '../../../../../../lib/auth/apiAuth'

// GET /api/admin/leagues/[id]/playoffs - Get playoff status and bracket
export async function GET(request, { params }) {
  try {
    const { session, error } = await requireAdmin(request)
    if (error) return error

    await dbConnect()
    
    const league = await League.findById(params.id)
      .populate('playoffConfig.qualifiedPlayers.groupA.player')
      .populate('playoffConfig.qualifiedPlayers.groupB.player')
      .populate('playoffConfig.bracket.groupA.quarterfinals.matchId')
      .populate('playoffConfig.bracket.groupA.semifinals.matchId')
      .populate('playoffConfig.bracket.groupA.final.matchId')
      .populate('playoffConfig.bracket.groupA.thirdPlace.matchId')
      .populate('playoffConfig.bracket.groupB.quarterfinals.matchId')
      .populate('playoffConfig.bracket.groupB.semifinals.matchId')
      .populate('playoffConfig.bracket.groupB.final.matchId')
      .populate('playoffConfig.bracket.groupB.thirdPlace.matchId')
    
    if (!league) {
      return NextResponse.json({ error: 'League not found' }, { status: 404 })
    }
    
    // Get all playoff matches for this league
    const playoffMatches = await Match.findPlayoffMatches(league._id)
    
    // Calculate current standings to show on page
    const seasonIdentifier = constructSeasonIdentifier(league)
    const standings = await calculateRegularSeasonStandings(league._id, seasonIdentifier)
    
    return NextResponse.json({
      success: true,
      playoffConfig: league.playoffConfig,
      currentPhase: league.playoffConfig?.currentPhase || 'regular_season',
      matches: playoffMatches,
      standings: standings.slice(0, 16), // Top 16 for potential Group B
      eligiblePlayerCount: standings.length,
      seasonIdentifier
    })
    
  } catch (error) {
    console.error('Error fetching playoff data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch playoff data' },
      { status: 500 }
    )
  }
}

// POST /api/admin/leagues/[id]/playoffs - Initialize or update playoffs
export async function POST(request, { params }) {
  try {
    console.log('🏆 POST /api/admin/leagues/[id]/playoffs - Starting request')
    console.log('📋 Params:', params)
    
    const { session, error } = await requireAdmin(request)
    if (error) return error

    await dbConnect()
    console.log('✅ Database connected')
    
    const body = await request.json()
    console.log('📦 Request body:', body)
    const { action } = body
    
    const league = await League.findById(params.id)
    if (!league) {
      console.error('❌ League not found for ID:', params.id)
      return NextResponse.json({ error: 'League not found' }, { status: 404 })
    }
    console.log('✅ League found:', league.name)
    console.log('📅 League season:', league.season)
    
    // Handle different playoff actions
    switch (action) {
      case 'initialize':
        console.log('🚀 Initializing playoffs')
        return await initializePlayoffs(league, body)
      case 'updateConfig':
        console.log('⚙️ Updating playoff config')
        return await updatePlayoffConfig(league, body)
      case 'createMatches':
        console.log('🎾 Creating playoff matches')
        return await createPlayoffMatches(league, body)
      case 'advanceWinner':
        console.log('🏅 Advancing winner')
        return await advanceWinner(league, body)
      case 'completePhase':
        console.log('🏁 Completing playoff phase')
        return await completePlayoffPhase(league, body)
      default:
        console.error('❌ Invalid action:', action)
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
    
  } catch (error) {
    console.error('❌ Error managing playoffs:', error)
    console.error('Stack trace:', error.stack)
    return NextResponse.json(
      { error: 'Failed to manage playoffs', details: error.message },
      { status: 500 }
    )
  }
}

// Helper function to construct season identifier
function constructSeasonIdentifier(league) {
  // Construct season identifier like 'summer-2025' or 'summer-2025-2'
  let seasonId = `${league.season.type}-${league.season.year}`
  if (league.season.number > 1) {
    seasonId += `-${league.season.number}`
  }
  return seasonId
}

// Initialize playoffs from regular season standings
async function initializePlayoffs(league, data) {
  const { numberOfGroups = 1 } = data
  
  const seasonIdentifier = constructSeasonIdentifier(league)
  console.log('📊 Calculating regular season standings for season:', seasonIdentifier)
  
  // Get regular season standings
  const standings = await calculateRegularSeasonStandings(league._id, seasonIdentifier)
  
  console.log(`👥 Found ${standings.length} eligible players for playoffs`)
  if (standings.length > 0) {
    console.log('Top players:', standings.slice(0, 8).map(s => ({ 
      name: s.player.name, 
      points: s.stats.totalPoints, 
      matches: s.stats.matchesPlayed 
    })))
  }
  
  if (standings.length < 8) {
    console.error(`❌ Not enough players: ${standings.length} < 8`)
    return NextResponse.json(
      { error: `Need at least 8 players to start playoffs. Found only ${standings.length} eligible players.` },
      { status: 400 }
    )
  }
  
  // Prepare qualified players for Group A (top 8)
  const groupAPlayers = standings.slice(0, 8).map((standing, index) => ({
    player: standing.player._id,
    seed: index + 1,
    regularSeasonPosition: standing.position
  }))
  
  // Prepare qualified players for Group B (9-16) if enabled
  const groupBPlayers = numberOfGroups === 2 && standings.length >= 16
    ? standings.slice(8, 16).map((standing, index) => ({
        player: standing.player._id,
        seed: index + 1,
        regularSeasonPosition: standing.position
      }))
    : []
  
  // Update league with playoff configuration
  league.playoffConfig = {
    enabled: true,
    numberOfGroups,
    groupAPlayers: 8,
    groupBPlayers: numberOfGroups === 2 ? 8 : 0,
    format: 'tournament',
    currentPhase: 'playoffs_groupA',
    playoffStartDate: new Date(),
    qualifiedPlayers: {
      groupA: groupAPlayers,
      groupB: groupBPlayers
    },
    bracket: {
      groupA: {
        quarterfinals: [
          { seed1: 1, seed2: 8 },
          { seed1: 4, seed2: 5 },
          { seed1: 3, seed2: 6 },
          { seed1: 2, seed2: 7 }
        ],
        semifinals: [
          { fromMatch1: 0, fromMatch2: 1 },
          { fromMatch1: 2, fromMatch2: 3 }
        ],
        final: {},
        thirdPlace: {}
      },
      groupB: numberOfGroups === 2 ? {
        quarterfinals: [
          { seed1: 1, seed2: 8 },
          { seed1: 4, seed2: 5 },
          { seed1: 3, seed2: 6 },
          { seed1: 2, seed2: 7 }
        ],
        semifinals: [
          { fromMatch1: 0, fromMatch2: 1 },
          { fromMatch1: 2, fromMatch2: 3 }
        ],
        final: {},
        thirdPlace: {}
      } : {}
    }
  }
  
  await league.save({ validateModifiedOnly: true })
  
  // Create quarterfinal matches
  await createQuarterfinalMatches(league, 'A', seasonIdentifier)
  if (numberOfGroups === 2) {
    await createQuarterfinalMatches(league, 'B', seasonIdentifier)
  }
  
  console.log('✅ Playoffs initialized successfully!')
  
  return NextResponse.json({
    success: true,
    message: 'Playoffs initialized successfully',
    playoffConfig: league.playoffConfig
  })
}

// Create quarterfinal matches
async function createQuarterfinalMatches(league, group, seasonIdentifier) {
  const bracket = group === 'A' ? league.playoffConfig.bracket.groupA : league.playoffConfig.bracket.groupB
  const qualifiedPlayers = group === 'A' ? 
    league.playoffConfig.qualifiedPlayers.groupA : 
    league.playoffConfig.qualifiedPlayers.groupB
  
  for (let i = 0; i < 4; i++) {
    const qf = bracket.quarterfinals[i]
    const player1 = qualifiedPlayers.find(p => p.seed === qf.seed1)
    const player2 = qualifiedPlayers.find(p => p.seed === qf.seed2)
    
    if (player1 && player2) {
      const match = new Match({
        league: league._id,
        season: seasonIdentifier,
        round: 9, // Use round 9 for quarterfinals
        matchType: 'playoff',
        playoffInfo: {
          group,
          stage: 'quarterfinal',
          matchNumber: i + 1,
          seed1: qf.seed1,
          seed2: qf.seed2
        },
        players: {
          player1: player1.player,
          player2: player2.player
        },
        status: 'scheduled'
      })
      
      await match.save()
      
      // Update bracket with match ID
      bracket.quarterfinals[i].matchId = match._id
    }
  }
  
  await league.save({ validateModifiedOnly: true })
}

// Update playoff configuration
async function updatePlayoffConfig(league, data) {
  console.log('⚙️ updatePlayoffConfig - Starting')
  console.log('📊 League:', league.name, 'ID:', league._id)
  console.log('📦 Data:', data)
  
  const { numberOfGroups } = data
  console.log('🔢 numberOfGroups:', numberOfGroups)
  
  // Initialize playoffConfig if it doesn't exist
  if (!league.playoffConfig) {
    console.log('🆕 Initializing new playoffConfig')
    league.playoffConfig = {
      enabled: false,
      numberOfGroups: 1,
      groupAPlayers: 8,
      groupBPlayers: 0,
      format: 'tournament',
      currentPhase: 'regular_season'
    }
  } else {
    console.log('✅ Existing playoffConfig found:', league.playoffConfig)
  }
  
  if (numberOfGroups !== undefined) {
    console.log('🔄 Updating numberOfGroups from', league.playoffConfig.numberOfGroups, 'to', numberOfGroups)
    league.playoffConfig.numberOfGroups = numberOfGroups
    // Adjust groupBPlayers based on numberOfGroups
    league.playoffConfig.groupBPlayers = numberOfGroups === 2 ? 8 : 0
    console.log('👥 groupBPlayers set to:', league.playoffConfig.groupBPlayers)
  }
  
  console.log('💾 Saving league...')
  await league.save({ validateModifiedOnly: true })
  console.log('✅ League saved successfully')
  
  return NextResponse.json({
    success: true,
    message: 'Playoff configuration updated',
    playoffConfig: league.playoffConfig
  })
}

// Create playoff matches for next stage
async function createPlayoffMatches(league, data) {
  const { group, stage } = data
  const seasonIdentifier = constructSeasonIdentifier(league)
  
  if (!['A', 'B'].includes(group) || !['semifinal', 'final', 'third_place'].includes(stage)) {
    return NextResponse.json({ error: 'Invalid group or stage' }, { status: 400 })
  }
  
  const bracket = group === 'A' ? league.playoffConfig.bracket.groupA : league.playoffConfig.bracket.groupB
  
  if (stage === 'semifinal') {
    // Create semifinal matches based on quarterfinal winners
    for (let i = 0; i < 2; i++) {
      const sf = bracket.semifinals[i]
      const qf1 = bracket.quarterfinals[sf.fromMatch1]
      const qf2 = bracket.quarterfinals[sf.fromMatch2]
      
      if (qf1.winner && qf2.winner) {
        const match = new Match({
          league: league._id,
          season: seasonIdentifier,
          round: 10, // Use round 10 for semifinals
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
        
        await match.save()
        bracket.semifinals[i].matchId = match._id
      }
    }
  } else if (stage === 'final') {
    // Create final match based on semifinal winners
    const sf1 = bracket.semifinals[0]
    const sf2 = bracket.semifinals[1]
    
    if (sf1.winner && sf2.winner) {
      const match = new Match({
        league: league._id,
        season: seasonIdentifier,
        round: 11, // Use round 11 for final
        matchType: 'playoff',
        playoffInfo: {
          group,
          stage: 'final'
        },
        players: {
          player1: sf1.winner,
          player2: sf2.winner
        },
        status: 'scheduled'
      })
      
      await match.save()
      bracket.final.matchId = match._id
    }
  }
  
  await league.save({ validateModifiedOnly: true })
  
  return NextResponse.json({
    success: true,
    message: `${stage} matches created for Group ${group}`
  })
}

// Advance winner to next stage
async function advanceWinner(league, data) {
  const { matchId, winnerId, group, stage } = data
  
  const bracket = group === 'A' ? league.playoffConfig.bracket.groupA : league.playoffConfig.bracket.groupB
  
  if (stage === 'quarterfinal') {
    const qfIndex = bracket.quarterfinals.findIndex(qf => qf.matchId?.toString() === matchId)
    if (qfIndex !== -1) {
      bracket.quarterfinals[qfIndex].winner = winnerId
    }
  } else if (stage === 'semifinal') {
    const sfIndex = bracket.semifinals.findIndex(sf => sf.matchId?.toString() === matchId)
    if (sfIndex !== -1) {
      bracket.semifinals[sfIndex].winner = winnerId
    }
  } else if (stage === 'final') {
    bracket.final.winner = winnerId
  }
  
  await league.save({ validateModifiedOnly: true })
  
  return NextResponse.json({
    success: true,
    message: 'Winner advanced to next stage'
  })
}

// Complete playoff phase
async function completePlayoffPhase(league, data) {
  const { phase } = data
  
  if (phase === 'groupA') {
    if (league.playoffConfig.numberOfGroups === 2) {
      league.playoffConfig.currentPhase = 'playoffs_groupB'
    } else {
      league.playoffConfig.currentPhase = 'completed'
    }
  } else if (phase === 'groupB') {
    league.playoffConfig.currentPhase = 'completed'
  }
  
  await league.save({ validateModifiedOnly: true })
  
  return NextResponse.json({
    success: true,
    message: 'Playoff phase completed',
    currentPhase: league.playoffConfig.currentPhase
  })
}

// Helper function to calculate regular season standings
async function calculateRegularSeasonStandings(leagueId, season) {
  console.log('📊 calculateRegularSeasonStandings - Starting')
  console.log('🏆 League ID:', leagueId)
  console.log('📅 Season identifier:', season)
  
  // Get all regular season matches
  const matches = await Match.find({
    league: leagueId,
    season,
    matchType: { $ne: 'playoff' },
    status: 'completed'
  }).populate('players.player1 players.player2')
  
  console.log(`🎾 Found ${matches.length} completed matches for season ${season}`)
  
  // Get all players in the league - no status filter
  const players = await Player.findByLeague(leagueId, season)
  
  console.log(`👥 Found ${players.length} total players registered for league and season`)
  if (players.length > 0) {
    console.log('Sample players:', players.slice(0, 3).map(p => ({
      name: p.name,
      registrations: p.registrations.filter(r => 
        r.league.toString() === leagueId.toString() && r.season === season
      ).map(r => ({ season: r.season, status: r.status }))
    })))
  }
  
  // Filter to only players who have played at least one match
  const playersWithMatches = players.filter(player => {
    const hasMatches = matches.some(m => m.hasPlayer(player._id))
    if (!hasMatches) {
      console.log(`⚠️ Player ${player.name} has no matches in season ${season}`)
    }
    return hasMatches
  })
  
  console.log(`🎯 ${playersWithMatches.length} players have played matches`)
  
  // Calculate standings
  const standings = playersWithMatches.map(player => {
    const playerMatches = matches.filter(m => 
      m.hasPlayer(player._id)
    )
    
    const stats = {
      matchesPlayed: playerMatches.length,
      matchesWon: 0,
      matchesLost: 0,
      totalPoints: 0,
      setsWon: 0,
      setsLost: 0,
      gamesWon: 0,
      gamesLost: 0
    }
    
    playerMatches.forEach(match => {
      const points = match.getPointsForPlayer(player._id)
      stats.totalPoints += points
      
      if (match.result?.winner?.equals(player._id)) {
        stats.matchesWon++
      } else {
        stats.matchesLost++
      }
      
      // Calculate sets
      if (match.result?.score?.sets) {
        match.result.score.sets.forEach(set => {
          const isPlayer1 = match.players.player1.equals(player._id)
          const playerGames = isPlayer1 ? set.player1 : set.player2
          const opponentGames = isPlayer1 ? set.player2 : set.player1
          
          stats.gamesWon += playerGames || 0
          stats.gamesLost += opponentGames || 0
          
          if (playerGames > opponentGames) {
            stats.setsWon++
          } else {
            stats.setsLost++
          }
        })
      }
    })
    
    return {
      player,
      stats,
      position: 0
    }
  })
  
  // Sort by points, then by matches won, then by sets difference
  standings.sort((a, b) => {
    if (b.stats.totalPoints !== a.stats.totalPoints) {
      return b.stats.totalPoints - a.stats.totalPoints
    }
    if (b.stats.matchesWon !== a.stats.matchesWon) {
      return b.stats.matchesWon - a.stats.matchesWon
    }
    const setsDiffA = a.stats.setsWon - a.stats.setsLost
    const setsDiffB = b.stats.setsWon - b.stats.setsLost
    return setsDiffB - setsDiffA
  })
  
  // Assign positions
  standings.forEach((standing, index) => {
    standing.position = index + 1
  })
  
  console.log('✅ Standings calculated successfully')
  if (standings.length > 0) {
    console.log('Top 8 players:', standings.slice(0, 8).map(s => ({
      position: s.position,
      name: s.player.name,
      points: s.stats.totalPoints,
      matches: s.stats.matchesPlayed
    })))
  }
  
  return standings
}
