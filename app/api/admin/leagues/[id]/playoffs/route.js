import { NextResponse } from 'next/server'
import mongoose from 'mongoose'
import dbConnect from '../../../../../../lib/db/mongoose'
import League from '../../../../../../lib/models/League'
import Match from '../../../../../../lib/models/Match'
import Player from '../../../../../../lib/models/Player'
import { requireAdmin } from '../../../../../../lib/auth/apiAuth'

// IMPORT THE SINGLE SOURCE OF TRUTH FOR STANDINGS
import { calculatePlayoffStandings } from '../../../../../../lib/services/standingsService'

// GET /api/admin/leagues/[id]/playoffs - Get playoff status and bracket
export async function GET(request, { params }) {
  try {
    const { session, error } = await requireAdmin(request)
    if (error) return error

    await dbConnect()
    
    const LEAGUE_ID = params.id
    const SEASON_ID = '688f5d51c94f8e3b3cbfd87b'
    
    console.log('🔍 PLAYOFF ENDPOINT - League:', LEAGUE_ID, 'Season:', SEASON_ID)
    
    // Get league with direct query
    const league = await mongoose.connection.db.collection('leagues').findOne({
      _id: new mongoose.Types.ObjectId(LEAGUE_ID)
    })
    
    if (!league) {
      return NextResponse.json({ error: 'League not found' }, { status: 404 })
    }
    
    // Get players directly from database
    const players = await mongoose.connection.db.collection('players').find({
      registrations: {
        $elemMatch: {
          league: new mongoose.Types.ObjectId(LEAGUE_ID),
          season: new mongoose.Types.ObjectId(SEASON_ID),
          status: { $in: ['active', 'confirmed'] }
        }
      }
    }).toArray()
    
    console.log(`✅ Found ${players.length} eligible players`)
    
    // Get matches directly from database
    const matches = await mongoose.connection.db.collection('matches').find({
      league: new mongoose.Types.ObjectId(LEAGUE_ID),
      season: new mongoose.Types.ObjectId(SEASON_ID),
      status: 'completed',
      matchType: { $ne: 'playoff' }
    }).toArray()
    
    console.log(`✅ Found ${matches.length} completed matches`)
    
    let standings = []
    let populatedPlayoffConfig = league.playoffConfig || {}
    
    // CRITICAL FIX: Check if playoffs are already initialized
    const playoffsInitialized = populatedPlayoffConfig.enabled && 
                                populatedPlayoffConfig.qualifiedPlayers?.groupA?.length > 0
    
    if (playoffsInitialized) {
      console.log('🏆 Playoffs already initialized - using stored qualified players')
      
      // Create a map for quick player lookups
      const playerMap = new Map()
      players.forEach(p => playerMap.set(p._id.toString(), p))
      
      // Build standings from the STORED qualified players
      const qualifiedGroupA = populatedPlayoffConfig.qualifiedPlayers.groupA || []
      const qualifiedGroupB = populatedPlayoffConfig.qualifiedPlayers.groupB || []
      
      // Combine both groups for standings display
      const allQualified = [
        ...qualifiedGroupA.map(qp => ({
          ...qp,
          group: 'A'
        })),
        ...qualifiedGroupB.map(qp => ({
          ...qp,
          group: 'B'
        }))
      ]
      
      // Create standings based on the stored qualified players
      standings = allQualified.map(qp => {
        const player = playerMap.get(qp.player.toString())
        if (!player) {
          console.warn(`Player ${qp.player} not found in current players list`)
          return {
            position: qp.regularSeasonPosition || qp.seed,
            player: { _id: qp.player, name: 'Unknown Player' },
            stats: qp.qualificationStats || { totalPoints: 0, matchesPlayed: 0 },
            group: qp.group,
            seed: qp.seed
          }
        }
        
        // Use stored qualification stats if available
        const stats = qp.qualificationStats || {
          totalPoints: 0,
          matchesPlayed: 0,
          matchesWon: 0,
          matchesLost: 0,
          setsWon: 0,
          setsLost: 0,
          gamesWon: 0,
          gamesLost: 0
        }
        
        return {
          position: qp.regularSeasonPosition || qp.seed,
          player: {
            _id: player._id,
            name: player.name
          },
          stats,
          group: qp.group,
          seed: qp.seed
        }
      })
      
      // Sort by original qualification position
      standings.sort((a, b) => a.position - b.position)
      
      console.log('✅ Using stored playoff qualifiers:', standings.length, 'players')
      
      // Populate qualified players with full player data
      if (populatedPlayoffConfig.qualifiedPlayers.groupA) {
        populatedPlayoffConfig.qualifiedPlayers.groupA = populatedPlayoffConfig.qualifiedPlayers.groupA.map(qp => ({
          ...qp,
          player: playerMap.get(qp.player.toString()) || { _id: qp.player, name: 'Unknown Player' }
        }))
      }
      
      if (populatedPlayoffConfig.qualifiedPlayers.groupB) {
        populatedPlayoffConfig.qualifiedPlayers.groupB = populatedPlayoffConfig.qualifiedPlayers.groupB.map(qp => ({
          ...qp,
          player: playerMap.get(qp.player.toString()) || { _id: qp.player, name: 'Unknown Player' }
        }))
      }
      
    } else {
      console.log('📊 Playoffs not initialized - calculating current standings using SINGLE SOURCE OF TRUTH')
      
      // Filter to only players who have played matches
      const playersWithMatches = players.filter(player => {
        return matches.some(match => 
          match.players.player1.toString() === player._id.toString() ||
          match.players.player2.toString() === player._id.toString()
        )
      })
      
      // USE THE SINGLE SOURCE OF TRUTH SERVICE!
      standings = calculatePlayoffStandings(playersWithMatches, matches)
      
      console.log(`✅ Generated fresh standings for ${standings.length} players with matches using SINGLE SERVICE`)
    }
    
    // Get playoff matches
    const playoffMatches = await mongoose.connection.db.collection('matches').find({
      league: new mongoose.Types.ObjectId(LEAGUE_ID),
      season: new mongoose.Types.ObjectId(SEASON_ID),
      matchType: 'playoff'
    }).toArray()
    
    // Populate player data in playoff matches
    const playerMap = new Map()
    players.forEach(p => playerMap.set(p._id.toString(), p))
    
    const populatedPlayoffMatches = playoffMatches.map(match => {
      return {
        ...match,
        players: {
          player1: playerMap.get(match.players.player1.toString()) || { _id: match.players.player1, name: 'Unknown' },
          player2: playerMap.get(match.players.player2.toString()) || { _id: match.players.player2, name: 'Unknown' }
        },
        result: match.result ? {
          ...match.result,
          winner: playerMap.get(match.result.winner?.toString()) || match.result.winner
        } : null
      }
    })
    
    return NextResponse.json({
      success: true,
      playoffConfig: populatedPlayoffConfig,
      currentPhase: league.playoffConfig?.currentPhase || 'regular_season',
      matches: populatedPlayoffMatches,
      standings: standings.slice(0, 16), // Show top 16 for display
      eligiblePlayerCount: playoffsInitialized ? standings.length : standings.filter(s => s.stats.matchesPlayed > 0).length,
      seasonIdentifier: SEASON_ID,
      leagueSlug: league.slug,
      leagueName: league.name,
      playoffsInitialized // Let the frontend know if playoffs are locked in
    })
    
  } catch (error) {
    console.error('Error fetching playoff data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch playoff data', details: error.message },
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
    console.log('📅 League slug:', league.slug)
    console.log('📅 League season object:', league.season)
    
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

// Initialize playoffs from regular season standings
async function initializePlayoffs(league, data) {
  const { numberOfGroups = 1 } = data
  
  // PROPER FIX: Use the Summer 2025 Season ObjectId
  const seasonId = new mongoose.Types.ObjectId('688f5d51c94f8e3b3cbfd87b') // Summer 2025
  console.log('📊 Initializing playoffs for season ID:', seasonId)
  
  // Get players and matches
  const playerObjects = await mongoose.connection.db.collection('players').find({
    registrations: {
      $elemMatch: {
        league: league._id,
        season: seasonId,
        status: { $in: ['confirmed', 'active'] }
      }
    }
  }).toArray()
  
  const matches = await mongoose.connection.db.collection('matches').find({
    league: league._id,
    season: seasonId,
    status: 'completed',
    matchType: { $ne: 'playoff' }
  }).toArray()
  
  console.log(`📊 Found ${playerObjects.length} eligible players and ${matches.length} completed matches`)
  
  // Filter to only players who have played matches
  const playersWithMatches = playerObjects.filter(player => {
    return matches.some(match => 
      match.players.player1.toString() === player._id.toString() ||
      match.players.player2.toString() === player._id.toString()
    )
  })
  
  console.log(`🎾 ${playersWithMatches.length} players have played matches`)
  
  // USE THE SINGLE SOURCE OF TRUTH SERVICE!
  const standings = calculatePlayoffStandings(playersWithMatches, matches)
  
  console.log(`👥 Calculated standings for ${standings.length} eligible players using SINGLE SOURCE OF TRUTH`)
  if (standings.length > 0) {
    console.log('🔒 TOP 8 PLAYERS THAT WILL BE LOCKED IN:', standings.slice(0, 8).map(s => ({ 
      position: s.position,
      name: s.player.name, 
      points: s.stats.totalPoints, 
      matches: s.stats.matchesPlayed,
      setDiff: s.stats.setsWon - s.stats.setsLost,
      gameDiff: s.stats.gamesWon - s.stats.gamesLost
    })))
  }
  
  if (standings.length < 8) {
    console.error(`❌ Not enough players: ${standings.length} < 8`)
    return NextResponse.json(
      { error: `Need at least 8 players to start playoffs. Found only ${standings.length} eligible players.` },
      { status: 400 }
    )
  }
  
  // CRITICAL: Store the qualified players with their qualification-time stats
  const groupAPlayers = standings.slice(0, 8).map((standing, index) => ({
    player: standing.player._id,
    seed: index + 1,
    regularSeasonPosition: standing.position,
    // Store their qualification stats for reference
    qualificationStats: {
      totalPoints: standing.stats.totalPoints,
      matchesPlayed: standing.stats.matchesPlayed,
      matchesWon: standing.stats.matchesWon,
      matchesLost: standing.stats.matchesLost,
      setsWon: standing.stats.setsWon,
      setsLost: standing.stats.setsLost,
      gamesWon: standing.stats.gamesWon,
      gamesLost: standing.stats.gamesLost
    }
  }))
  
  // Prepare qualified players for Group B (9-16) if enabled
  const groupBPlayers = numberOfGroups === 2 && standings.length >= 16
    ? standings.slice(8, 16).map((standing, index) => ({
        player: standing.player._id,
        seed: index + 1,
        regularSeasonPosition: standing.position,
        qualificationStats: {
          totalPoints: standing.stats.totalPoints,
          matchesPlayed: standing.stats.matchesPlayed,
          matchesWon: standing.stats.matchesWon,
          matchesLost: standing.stats.matchesLost,
          setsWon: standing.stats.setsWon,
          setsLost: standing.stats.setsLost,
          gamesWon: standing.stats.gamesWon,
          gamesLost: standing.stats.gamesLost
        }
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
    // This is the key: Store the qualified players permanently
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
  await createQuarterfinalMatches(league, 'A', seasonId)
  if (numberOfGroups === 2) {
    await createQuarterfinalMatches(league, 'B', seasonId)
  }
  
  console.log('✅ Playoffs initialized successfully with SINGLE SOURCE OF TRUTH!')
  console.log('🔒 Qualified players locked in:', {
    groupA: groupAPlayers.map(p => ({ seed: p.seed, position: p.regularSeasonPosition })),
    groupB: groupBPlayers.map(p => ({ seed: p.seed, position: p.regularSeasonPosition }))
  })
  
  return NextResponse.json({
    success: true,
    message: 'Playoffs initialized successfully',
    playoffConfig: league.playoffConfig
  })
}

// Create quarterfinal matches
async function createQuarterfinalMatches(league, group, seasonId) {
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
        season: seasonId,
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
  // Use the Summer 2025 Season ObjectId
  const seasonId = new mongoose.Types.ObjectId('688f5d51c94f8e3b3cbfd87b')
  
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
          season: seasonId,
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
        season: seasonId,
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
    
    // Also create 3rd place match with semifinal losers
    // Need to find the losers from semifinals
    const sf1Match = await Match.findById(sf1.matchId)
    const sf2Match = await Match.findById(sf2.matchId)
    
    if (sf1Match?.result?.winner && sf2Match?.result?.winner) {
      const sf1Loser = sf1Match.players.player1.toString() === sf1.winner.toString() 
        ? sf1Match.players.player2 
        : sf1Match.players.player1
      const sf2Loser = sf2Match.players.player1.toString() === sf2.winner.toString()
        ? sf2Match.players.player2
        : sf2Match.players.player1
      
      const thirdPlaceMatch = new Match({
        league: league._id,
        season: seasonId,
        round: 11, // Same round as final
        matchType: 'playoff',
        playoffInfo: {
          group,
          stage: 'third_place'
        },
        players: {
          player1: sf1Loser,
          player2: sf2Loser
        },
        status: 'scheduled'
      })
      
      await thirdPlaceMatch.save()
      bracket.thirdPlace.matchId = thirdPlaceMatch._id
    }
  } else if (stage === 'third_place') {
    // Create third place match only (if not created with finals)
    const sf1 = bracket.semifinals[0]
    const sf2 = bracket.semifinals[1]
    
    // Get semifinal matches to find losers
    const sf1Match = await Match.findById(sf1.matchId)
    const sf2Match = await Match.findById(sf2.matchId)
    
    if (sf1Match?.result?.winner && sf2Match?.result?.winner) {
      const sf1Loser = sf1Match.players.player1.toString() === sf1Match.result.winner.toString() 
        ? sf1Match.players.player2 
        : sf1Match.players.player1
      const sf2Loser = sf2Match.players.player1.toString() === sf2Match.result.winner.toString()
        ? sf2Match.players.player2
        : sf2Match.players.player1
      
      const match = new Match({
        league: league._id,
        season: seasonId,
        round: 11,
        matchType: 'playoff',
        playoffInfo: {
          group,
          stage: 'third_place'
        },
        players: {
          player1: sf1Loser,
          player2: sf2Loser
        },
        status: 'scheduled'
      })
      
      await match.save()
      bracket.thirdPlace.matchId = match._id
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
  } else if (stage === 'third_place') {
    bracket.thirdPlace.winner = winnerId
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
