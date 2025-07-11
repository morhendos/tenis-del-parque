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
    
    // Calculate points and games for each player from their matches
    const playerStatsMap = new Map()
    
    // Initialize all players with 0 points and games
    players.forEach(player => {
      playerStatsMap.set(player._id.toString(), {
        points: 0,
        gamesWon: 0,
        gamesLost: 0
      })
    })
    
    // Calculate points and games from each match
    matches.forEach(match => {
      // Create a temporary Match instance to use the calculatePoints method
      const matchInstance = new Match(match)
      const points = matchInstance.calculatePoints()
      
      const player1Id = match.players.player1.toString()
      const player2Id = match.players.player2.toString()
      
      // Calculate games from match score
      let player1GamesWon = 0
      let player2GamesWon = 0
      
      if (match.result && match.result.score) {
        if (match.result.score.sets && match.result.score.sets.length > 0) {
          // Count games from each set
          match.result.score.sets.forEach((set, index) => {
            const p1Games = set.player1 || 0
            const p2Games = set.player2 || 0
            
            // Check if this is a super tiebreak (third set with scores >= 10)
            const isThirdSet = index === 2
            const isSuperTiebreak = isThirdSet && (p1Games >= 10 || p2Games >= 10)
            
            if (isSuperTiebreak) {
              // Super tiebreak counts as 1 game for the winner
              if (p1Games > p2Games) {
                player1GamesWon += 1
                player2GamesWon += 0
              } else {
                player1GamesWon += 0
                player2GamesWon += 1
              }
            } else {
              // Regular set - count actual games
              player1GamesWon += p1Games
              player2GamesWon += p2Games
            }
          })
        } else if (match.result.score.walkover) {
          // For walkover, winner gets 12-0 (6-0, 6-0)
          const player1Won = match.result.winner.toString() === player1Id
          player1GamesWon = player1Won ? 12 : 0
          player2GamesWon = player1Won ? 0 : 12
        }
      }
      
      // Update player stats
      if (playerStatsMap.has(player1Id)) {
        const stats = playerStatsMap.get(player1Id)
        stats.points += points.player1
        stats.gamesWon += player1GamesWon
        stats.gamesLost += player2GamesWon
      }
      if (playerStatsMap.has(player2Id)) {
        const stats = playerStatsMap.get(player2Id)
        stats.points += points.player2
        stats.gamesWon += player2GamesWon
        stats.gamesLost += player1GamesWon
      }
    })
    
    // Create standings with calculated points and games
    const playersWithStats = players.map(player => {
      const stats = playerStatsMap.get(player._id.toString()) || { points: 0, gamesWon: 0, gamesLost: 0 }
      return {
        ...player,
        calculatedPoints: stats.points,
        calculatedGamesWon: stats.gamesWon,
        calculatedGamesLost: stats.gamesLost
      }
    })
    
    // Sort players with active status first, then by points
    playersWithStats.sort((a, b) => {
      // Primary: Active status (active players first)
      const statusPriority = {
        'active': 0,
        'confirmed': 1,
        'pending': 2,
        'inactive': 3
      }
      
      const aStatusPriority = statusPriority[a.status] ?? 99
      const bStatusPriority = statusPriority[b.status] ?? 99
      
      if (aStatusPriority !== bStatusPriority) {
        return aStatusPriority - bStatusPriority
      }
      
      // Secondary: total points (calculated from matches)
      if (a.calculatedPoints !== b.calculatedPoints) return b.calculatedPoints - a.calculatedPoints
      
      // Tertiary: sets won
      const aSets = a.stats?.setsWon || 0
      const bSets = b.stats?.setsWon || 0
      if (aSets !== bSets) return bSets - aSets
      
      // Quaternary: games won (calculated from matches)
      if (a.calculatedGamesWon !== b.calculatedGamesWon) return b.calculatedGamesWon - a.calculatedGamesWon
      
      // Quinary: alphabetical by name
      return a.name.localeCompare(b.name)
    })
    
    // Calculate additional stats for each player
    const standings = playersWithStats.map((player, index) => {
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
          gamesWon: player.calculatedGamesWon,    // Use calculated games
          gamesLost: player.calculatedGamesLost,  // Use calculated games
          totalPoints: player.calculatedPoints,    // Use calculated points
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