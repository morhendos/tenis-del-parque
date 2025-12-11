import { NextResponse } from 'next/server'
import dbConnect from '../../../../../lib/db/mongoose'
import League from '../../../../../lib/models/League'
import Player from '../../../../../lib/models/Player'
import Match from '../../../../../lib/models/Match'
import Season from '../../../../../lib/models/Season'
import mongoose from 'mongoose'

// IMPORT THE SINGLE SOURCE OF TRUTH FOR STANDINGS
import { calculateLeagueStandings } from '../../../../../lib/services/standingsService'

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
    let query = {}
    
    // Check if identifier is a valid MongoDB ObjectId
    if (mongoose.Types.ObjectId.isValid(identifier)) {
      // When fetching by ID, allow any status (player might be viewing their own league)
      query._id = identifier
    } else {
      // When fetching by slug (public), only show active leagues
      query.slug = identifier
      query.status = { $in: ['active', 'registration_open', 'coming_soon', 'completed'] }
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
    
    // Find the Season ObjectId that matches the league's season
    console.log('API: League season:', league.season)
    const seasonDoc = await Season.findOne({
      year: league.season.year,
      type: league.season.type
    })
    
    if (!seasonDoc) {
      console.error(`Season not found for year: ${league.season.year}, type: ${league.season.type}`)
      return NextResponse.json(
        { 
          success: false, 
          error: 'Season not found' 
        },
        { status: 404 }
      )
    }
    
    console.log('API: Found Season ObjectId:', seasonDoc._id)
    
    // Build query for players using new registrations structure
    const playerQuery = {
      'registrations.league': league._id,
      'registrations.season': league.season // Use league's Season ObjectId, not URL parameter
    }
    if (level) playerQuery['registrations.level'] = level
    
    // Get players with matching registrations
    let players = await Player.find(playerQuery).lean()
    
    // Transform players to match the expected structure
    // Extract the relevant registration data for each player
    players = players.map(player => {
      const registration = player.registrations.find(reg => 
        reg.league.toString() === league._id.toString() && 
        reg.season.toString() === league.season.toString() && // Compare ObjectIds properly
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
    // IMPORTANT: Query by season ObjectId (matches store season as ObjectId reference)
    const matches = await Match.find({
      league: league._id,
      season: seasonDoc._id,
      status: 'completed',
      matchType: { $ne: 'playoff' } // Exclude playoff matches from regular standings
    }).lean()
    
    console.log(`API: Found ${matches.length} matches for league ${league.name} (${league.season.type} ${league.season.year})`)
    
    console.log(`📊 PUBLIC STANDINGS: ${players.length} players, ${matches.length} matches`)
    
    // USE THE SINGLE SOURCE OF TRUTH SERVICE!
    const sortedStandings = calculateLeagueStandings(players, matches, true) // include status sort for public
    
    // Create final standings with additional calculated fields
    const standings = sortedStandings.map((standing) => {
      const stats = standing.stats
      const winPercentage = stats.matchesPlayed > 0 
        ? Math.round((stats.matchesWon / stats.matchesPlayed) * 100)
        : 0
      
      const setPercentage = (stats.setsWon + stats.setsLost) > 0
        ? Math.round((stats.setsWon / (stats.setsWon + stats.setsLost)) * 100)
        : 0
      
      return {
        position: standing.position,
        player: {
          _id: standing.player._id,
          name: standing.player.name,
          level: level || 'all',
          status: standing.player.status
        },
        stats: {
          matchesPlayed: stats.matchesPlayed,
          matchesWon: stats.matchesWon,
          matchesLost: stats.matchesLost,
          winPercentage,
          setsWon: stats.setsWon,
          setsLost: stats.setsLost,
          setPercentage,
          gamesWon: stats.gamesWon,
          gamesLost: stats.gamesLost,
          totalPoints: stats.totalPoints,
          eloRating: 1200, // Default ELO if not tracked
          eloChange: 0
        }
      }
    })
    
    // Get current round info
    const latestRound = await Match.findOne({ 
      league: league._id, 
      'season.year': league.season.year,
      'season.type': league.season.type
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
      timestamp: new Date().toISOString(),
      usingSingleSourceOfTruth: true // Flag to confirm we're using the service
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
