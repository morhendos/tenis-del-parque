import { NextResponse } from 'next/server'
import dbConnect from '../../../../../lib/db/mongoose'
import League from '../../../../../lib/models/League'
import Player from '../../../../../lib/models/Player'
import Match from '../../../../../lib/models/Match'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

export async function GET(request, { params }) {
  try {
    await dbConnect()
    
    const { league: slug } = params
    const { searchParams } = new URL(request.url)
    const season = searchParams.get('season') || 'Verano 2025'
    const level = searchParams.get('level')
    
    // Find league by slug
    const league = await League.findOne({ 
      slug: slug.toLowerCase(),
      status: 'active'
    })
    
    if (!league) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'League not found' 
        },
        { status: 404 }
      )
    }
    
    // Build query for players - include ALL players, not just active ones
    const query = { 
      league: league._id, 
      season: season
      // Removed status filter to show all players
    }
    if (level) query.level = level
    
    // Get players
    let players = await Player.find(query).lean()
    
    // FALLBACK: If no players found with exact season, try without season filter
    if (players.length === 0) {
      console.log('No players found with exact season, trying without season filter...')
      const fallbackQuery = { league: league._id }
      if (level) fallbackQuery.level = level
      
      players = await Player.find(fallbackQuery).lean()
      console.log(`Fallback: Found ${players.length} players without season filter`)
    }
    
    // Get all completed matches for the league and season
    const matches = await Match.find({
      league: league._id,
      season: season,
      status: 'completed'
    }).lean()
    
    // Calculate points for each player from their matches
    const playerPointsMap = new Map()
    
    // Initialize all players with 0 points
    players.forEach(player => {
      playerPointsMap.set(player._id.toString(), 0)
    })
    
    // Calculate points from each match
    matches.forEach(match => {
      // Create a temporary Match instance to use the calculatePoints method
      const matchInstance = new Match(match)
      const points = matchInstance.calculatePoints()
      
      const player1Id = match.players.player1.toString()
      const player2Id = match.players.player2.toString()
      
      // Add points to players
      if (playerPointsMap.has(player1Id)) {
        playerPointsMap.set(player1Id, playerPointsMap.get(player1Id) + points.player1)
      }
      if (playerPointsMap.has(player2Id)) {
        playerPointsMap.set(player2Id, playerPointsMap.get(player2Id) + points.player2)
      }
    })
    
    // Create standings with calculated points
    const playersWithPoints = players.map(player => ({
      ...player,
      calculatedPoints: playerPointsMap.get(player._id.toString()) || 0
    }))
    
    // Sort players by points, then sets, then games
    playersWithPoints.sort((a, b) => {
      // Primary: total points (calculated from matches)
      if (a.calculatedPoints !== b.calculatedPoints) return b.calculatedPoints - a.calculatedPoints
      
      // Secondary: sets won
      const aSets = a.stats?.setsWon || 0
      const bSets = b.stats?.setsWon || 0
      if (aSets !== bSets) return bSets - aSets
      
      // Tertiary: games won
      const aGames = a.stats?.gamesWon || 0
      const bGames = b.stats?.gamesWon || 0
      if (aGames !== bGames) return bGames - aGames
      
      // Quaternary: alphabetical by name
      return a.name.localeCompare(b.name)
    })
    
    // Calculate additional stats for each player
    const standings = playersWithPoints.map((player, index) => {
      const winPercentage = player.stats.matchesPlayed > 0 
        ? Math.round((player.stats.matchesWon / player.stats.matchesPlayed) * 100)
        : 0
      
      const setPercentage = (player.stats.setsWon + player.stats.setsLost) > 0
        ? Math.round((player.stats.setsWon / (player.stats.setsWon + player.stats.setsLost)) * 100)
        : 0
      
      return {
        position: index + 1,
        player: {
          _id: player._id,
          name: player.name,
          level: player.level,
          status: player.status  // Include player status for frontend styling
        },
        stats: {
          matchesPlayed: player.stats.matchesPlayed || 0,
          matchesWon: player.stats.matchesWon || 0,
          matchesLost: (player.stats.matchesPlayed || 0) - (player.stats.matchesWon || 0),
          winPercentage,
          setsWon: player.stats.setsWon || 0,
          setsLost: player.stats.setsLost || 0,
          setPercentage,
          gamesWon: player.stats.gamesWon || 0,
          gamesLost: player.stats.gamesLost || 0,
          totalPoints: player.calculatedPoints, // Use calculated points instead of stored
          eloRating: player.stats.eloRating || 1200,
          eloChange: (player.stats.eloRating || 1200) - 1200 // Change from starting ELO
        }
      }
    })
    
    // Get current round info
    const latestRound = await Match.findOne({ 
      league: league._id, 
      season 
    }).sort({ round: -1 }).select('round')
    
    return NextResponse.json({
      success: true,
      league: {
        _id: league._id,
        name: league.name,
        slug: league.slug
      },
      season,
      unifiedStandings: standings,
      currentRound: latestRound?.round || 0,
      totalPlayers: players.length,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('League standings error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error' 
      },
      { status: 500 }
    )
  }
} 