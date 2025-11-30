import { NextResponse } from 'next/server'
import dbConnect from '../../../lib/db/mongoose'
import Player from '../../../lib/models/Player'
import Match from '../../../lib/models/Match'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

const MATCHES_REQUIRED = 8

export async function GET(request) {
  try {
    await dbConnect()
    
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit')) || 100
    const includeAll = searchParams.get('all') === 'true' // Include players below threshold
    
    // Get all players
    const allPlayers = await Player.find({}).lean()
    
    // Get match counts for each player from actual completed matches
    const matchCounts = await Match.aggregate([
      { $match: { status: 'completed' } },
      {
        $group: {
          _id: null,
          players: {
            $push: {
              $concatArrays: [
                [{ id: '$players.player1', isWinner: { $eq: ['$winner', 'player1'] } }],
                [{ id: '$players.player2', isWinner: { $eq: ['$winner', 'player2'] } }]
              ]
            }
          }
        }
      },
      { $unwind: '$players' },
      { $unwind: '$players' },
      {
        $group: {
          _id: '$players.id',
          matchesPlayed: { $sum: 1 },
          matchesWon: { $sum: { $cond: ['$players.isWinner', 1, 0] } }
        }
      }
    ])
    
    // Create a map of player match stats
    const matchStatsMap = {}
    matchCounts.forEach(stat => {
      if (stat._id) {
        matchStatsMap[stat._id.toString()] = {
          matchesPlayed: stat.matchesPlayed,
          matchesWon: stat.matchesWon
        }
      }
    })
    
    // Build player rankings with match data
    const playersWithStats = allPlayers.map(player => {
      const stats = matchStatsMap[player._id.toString()] || { matchesPlayed: 0, matchesWon: 0 }
      const matchesPlayed = stats.matchesPlayed
      const matchesWon = stats.matchesWon
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
