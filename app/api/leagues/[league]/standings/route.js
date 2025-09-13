import { NextResponse } from 'next/server'
import dbConnect from '../../../../../lib/db/mongoose'
import League from '../../../../../lib/models/League'
import Player from '../../../../../lib/models/Player'
import Match from '../../../../../lib/models/Match'
import mongoose from 'mongoose'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

export async function GET(request, { params }) {
  try {
    await dbConnect()
    
    const { league: identifier } = params
    const { searchParams } = new URL(request.url)
    const season = searchParams.get('season') || 'summer-2025'  // Use database format
    const level = searchParams.get('level')
    
    // Build query to support both ID and slug
    let query = { status: 'active' }
    
    // Check if identifier is a valid MongoDB ObjectId
    if (mongoose.Types.ObjectId.isValid(identifier)) {
      query._id = identifier
    } else {
      // Otherwise, treat it as a slug
      query.slug = identifier
    }
    
    // Find league by ID or slug
    const league = await League.findOne(query)
    
    if (!league) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'League not found' 
        },
        { status: 404 }
      )
    }
    
    // Build query for players using new registrations structure
    const playerQuery = {
      'registrations.league': league._id,
      'registrations.season': season
    }
    if (level) playerQuery['registrations.level'] = level
    
    // Get players with matching registrations
    let players = await Player.find(playerQuery).lean()
    
    // Transform players to match the expected structure
    // Extract the relevant registration data for each player
    players = players.map(player => {
      const registration = player.registrations.find(reg => 
        reg.league.toString() === league._id.toString() && 
        reg.season === season &&
        (!level || reg.level === level)
      )
      
      if (!registration) return null
      
      return {
        _id: player._id,
        name: player.name,
        email: player.email,
        whatsapp: player.whatsapp,
        userId: player.userId,
        level: registration.level,
        status: registration.status,
        registeredAt: registration.registeredAt,
        stats: registration.stats,
        matchHistory: registration.matchHistory,
        wildCards: registration.wildCards,
        notes: registration.notes,
        // Keep player-level data
        preferences: player.preferences,
        metadata: player.metadata
      }
    }).filter(Boolean) // Remove null entries
    
    // FALLBACK: If no players found with exact season, try without season filter
    if (players.length === 0) {
      console.log('No players found with exact season, trying without season filter...')
      const fallbackQuery = { 'registrations.league': league._id }
      if (level) fallbackQuery['registrations.level'] = level
      
      const fallbackPlayers = await Player.find(fallbackQuery).lean()
      
      players = fallbackPlayers.map(player => {
        const registration = player.registrations.find(reg => 
          reg.league.toString() === league._id.toString() &&
          (!level || reg.level === level)
        )
        
        if (!registration) return null
        
        return {
          _id: player._id,
          name: player.name,
          email: player.email,
          whatsapp: player.whatsapp,
          userId: player.userId,
          level: registration.level,
          status: registration.status,
          registeredAt: registration.registeredAt,
          stats: registration.stats,
          matchHistory: registration.matchHistory,
          wildCards: registration.wildCards,
          notes: registration.notes,
          preferences: player.preferences,
          metadata: player.metadata
        }
      }).filter(Boolean)
      
      console.log(`Fallback: Found ${players.length} players without season filter`)
    }
    
    // Get all completed matches for the league and season
    const matches = await Match.find({
      league: league._id,
      season: season,
      status: 'completed'
    }).lean()
    
    // Calculate ALL stats for each player from their matches
    const playerStatsMap = new Map()
    
    // Initialize all players with 0 stats
    players.forEach(player => {
      playerStatsMap.set(player._id.toString(), {
        points: 0,
        matchesPlayed: 0,
        matchesWon: 0,
        setsWon: 0,
        setsLost: 0,
        gamesWon: 0,
        gamesLost: 0
      })
    })
    
    // Calculate stats from each match
    matches.forEach(match => {
      // Create a temporary Match instance to use the calculatePoints method
      const matchInstance = new Match(match)
      const points = matchInstance.calculatePoints()
      
      const player1Id = match.players.player1.toString()
      const player2Id = match.players.player2.toString()
      
      // Determine winner
      const player1Won = match.result?.winner?.toString() === player1Id
      
      // Calculate sets won/lost
      let player1SetsWon = 0
      let player2SetsWon = 0
      
      if (match.result?.score?.sets && match.result.score.sets.length > 0) {
        match.result.score.sets.forEach(set => {
          const p1Games = set.player1 || 0
          const p2Games = set.player2 || 0
          
          if (p1Games > p2Games) {
            player1SetsWon++
          } else if (p2Games > p1Games) {
            player2SetsWon++
          }
        })
      } else if (match.result?.score?.walkover) {
        // For walkover, winner gets 2-0 in sets
        player1SetsWon = player1Won ? 2 : 0
        player2SetsWon = player1Won ? 0 : 2
      }
      
      // Calculate games won/lost
      let player1GamesWon = 0
      let player2GamesWon = 0
      
      if (match.result?.score?.sets && match.result.score.sets.length > 0) {
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
      } else if (match.result?.score?.walkover) {
        // For walkover, winner gets 12-0 (6-0, 6-0)
        player1GamesWon = player1Won ? 12 : 0
        player2GamesWon = player1Won ? 0 : 12
      }
      
      // Update player 1 stats
      if (playerStatsMap.has(player1Id)) {
        const stats = playerStatsMap.get(player1Id)
        stats.points += points.player1
        stats.matchesPlayed += 1
        stats.matchesWon += player1Won ? 1 : 0
        stats.setsWon += player1SetsWon
        stats.setsLost += player2SetsWon
        stats.gamesWon += player1GamesWon
        stats.gamesLost += player2GamesWon
      }
      
      // Update player 2 stats
      if (playerStatsMap.has(player2Id)) {
        const stats = playerStatsMap.get(player2Id)
        stats.points += points.player2
        stats.matchesPlayed += 1
        stats.matchesWon += player1Won ? 0 : 1
        stats.setsWon += player2SetsWon
        stats.setsLost += player1SetsWon
        stats.gamesWon += player2GamesWon
        stats.gamesLost += player1GamesWon
      }
    })
    
    // Create standings with calculated stats
    const playersWithStats = players.map(player => {
      const stats = playerStatsMap.get(player._id.toString()) || {
        points: 0,
        matchesPlayed: 0,
        matchesWon: 0,
        setsWon: 0,
        setsLost: 0,
        gamesWon: 0,
        gamesLost: 0
      }
      return {
        ...player,
        calculatedStats: stats
      }
    })
    
    // Sort players with proper tiebreakers
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
      
      // Secondary: Has played matches (players with matches first)
      const aHasPlayed = a.calculatedStats.matchesPlayed > 0
      const bHasPlayed = b.calculatedStats.matchesPlayed > 0
      
      if (aHasPlayed !== bHasPlayed) {
        return bHasPlayed ? 1 : -1  // Players who have played come first
      }
      
      // Tertiary: total points
      if (a.calculatedStats.points !== b.calculatedStats.points) {
        return b.calculatedStats.points - a.calculatedStats.points
      }
      
      // Quaternary: set difference
      const aSetDiff = a.calculatedStats.setsWon - a.calculatedStats.setsLost
      const bSetDiff = b.calculatedStats.setsWon - b.calculatedStats.setsLost
      if (aSetDiff !== bSetDiff) return bSetDiff - aSetDiff
      
      // Quinary: game difference
      const aGameDiff = a.calculatedStats.gamesWon - a.calculatedStats.gamesLost
      const bGameDiff = b.calculatedStats.gamesWon - b.calculatedStats.gamesLost
      if (aGameDiff !== bGameDiff) return bGameDiff - aGameDiff
      
      // Senary: alphabetical by name
      return a.name.localeCompare(b.name)
    })
    
    // Create final standings
    const standings = playersWithStats.map((player, index) => {
      const stats = player.calculatedStats
      const winPercentage = stats.matchesPlayed > 0 
        ? Math.round((stats.matchesWon / stats.matchesPlayed) * 100)
        : 0
      
      const setPercentage = (stats.setsWon + stats.setsLost) > 0
        ? Math.round((stats.setsWon / (stats.setsWon + stats.setsLost)) * 100)
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
          matchesPlayed: stats.matchesPlayed,
          matchesWon: stats.matchesWon,
          matchesLost: stats.matchesPlayed - stats.matchesWon,
          winPercentage,
          setsWon: stats.setsWon,
          setsLost: stats.setsLost,
          setPercentage,
          gamesWon: stats.gamesWon,
          gamesLost: stats.gamesLost,
          totalPoints: stats.points,
          eloRating: player.eloRating || 1200, // Use global ELO rating
          eloChange: (player.eloRating || 1200) - 1200 // Change from starting ELO
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