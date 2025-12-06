import { NextResponse } from 'next/server'
import dbConnect from '../../../lib/db/mongoose'
import Player from '../../../lib/models/Player'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

const MATCHES_REQUIRED = 8

export async function GET(request) {
  try {
    await dbConnect()
    
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit')) || 100
    const includeAll = searchParams.get('all') === 'true' // Include players below threshold
    
    // Get all players with their cached registration stats
    const allPlayers = await Player.find({}).lean()
    
    // Build player rankings using CACHED stats from registrations
    const playersWithStats = allPlayers.map(player => {
      // Sum stats across all league registrations
      const matchesPlayed = (player.registrations || []).reduce(
        (sum, reg) => sum + (reg.stats?.matchesPlayed || 0), 0
      )
      const matchesWon = (player.registrations || []).reduce(
        (sum, reg) => sum + (reg.stats?.matchesWon || 0), 0
      )
      
      const isQualified = matchesPlayed >= MATCHES_REQUIRED
      
      return {
        _id: player._id,
        name: player.name,
        eloRating: player.eloRating || 1200,
        highestElo: player.highestElo || player.eloRating || 1200,
        matchesPlayed,
        matchesWon,
        winRate: matchesPlayed > 0 ? Math.round((matchesWon / matchesPlayed) * 100) : 0,
        isQualified,
        matchesToQualify: Math.max(MATCHES_REQUIRED - matchesPlayed, 0)
      }
    })
    
    // Filter and sort
    let qualifiedPlayers = playersWithStats.filter(p => p.isQualified)
    let unqualifiedPlayers = playersWithStats.filter(p => !p.isQualified && p.matchesPlayed > 0)
    
    // Sort qualified by ELO (highest first)
    qualifiedPlayers.sort((a, b) => b.eloRating - a.eloRating)
    
    // Sort unqualified by matches played (most first), then ELO
    unqualifiedPlayers.sort((a, b) => {
      if (b.matchesPlayed !== a.matchesPlayed) {
        return b.matchesPlayed - a.matchesPlayed
      }
      return b.eloRating - a.eloRating
    })
    
    // Add positions to qualified players
    qualifiedPlayers = qualifiedPlayers.map((player, index) => ({
      ...player,
      position: index + 1
    }))
    
    // Limit results
    qualifiedPlayers = qualifiedPlayers.slice(0, limit)
    
    const response = {
      success: true,
      matchesRequired: MATCHES_REQUIRED,
      qualifiedCount: qualifiedPlayers.length,
      totalPlayers: allPlayers.length,
      rankings: qualifiedPlayers,
      timestamp: new Date().toISOString()
    }
    
    // Optionally include players working towards qualification
    if (includeAll) {
      response.almostQualified = unqualifiedPlayers.slice(0, 20)
    }
    
    return NextResponse.json(response)
    
  } catch (error) {
    console.error('OpenRank API error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch OpenRank data' },
      { status: 500 }
    )
  }
}
