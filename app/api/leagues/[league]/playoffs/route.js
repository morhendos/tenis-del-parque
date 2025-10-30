import { NextResponse } from 'next/server'
import mongoose from 'mongoose'
import dbConnect from '../../../../../lib/db/mongoose'

// Helper to convert ObjectIDs and Dates to plain values
function serialize(obj) {
  if (obj == null) return obj
  if (obj instanceof Date) return obj.toISOString()
  if (obj._bsontype === 'ObjectId' || (obj.constructor && obj.constructor.name === 'ObjectId')) {
    return obj.toString()
  }
  if (Array.isArray(obj)) return obj.map(serialize)
  if (typeof obj === 'object') {
    const result = {}
    for (const [key, value] of Object.entries(obj)) {
      result[key] = serialize(value)
    }
    return result
  }
  return obj
}

// Public GET endpoint for playoff data
export async function GET(request, { params }) {
  try {
    await dbConnect()
    
    const leagueSlug = params.league
    const SEASON_ID = '688f5d51c94f8e3b3cbfd87b' // Summer 2025
    
    console.log('🔍 PUBLIC PLAYOFF ENDPOINT - League slug:', leagueSlug)
    
    // Get league by slug
    const league = await mongoose.connection.db.collection('leagues').findOne({
      slug: leagueSlug
    })
    
    if (!league) {
      return NextResponse.json({ error: 'League not found' }, { status: 404 })
    }
    
    // Check if playoffs are enabled and active
    if (!league.playoffConfig?.enabled || league.playoffConfig?.currentPhase === 'regular_season') {
      return NextResponse.json({
        success: false,
        message: 'Playoffs not active',
        currentPhase: league.playoffConfig?.currentPhase || 'regular_season'
      })
    }
    
    // Get all players for populating names
    const players = await mongoose.connection.db.collection('players').find({}).toArray()
    const playerMap = new Map()
    players.forEach(p => playerMap.set(p._id.toString(), p))
    
    // Populate qualified players with full player data
    let populatedPlayoffConfig = { ...league.playoffConfig }
    if (populatedPlayoffConfig.qualifiedPlayers) {
      // Populate Group A players
      if (populatedPlayoffConfig.qualifiedPlayers.groupA) {
        populatedPlayoffConfig.qualifiedPlayers.groupA = populatedPlayoffConfig.qualifiedPlayers.groupA.map(qp => ({
          ...qp,
          player: playerMap.get(qp.player.toString()) || { _id: qp.player, name: 'Unknown Player' }
        }))
      }
      
      // Populate Group B players
      if (populatedPlayoffConfig.qualifiedPlayers.groupB) {
        populatedPlayoffConfig.qualifiedPlayers.groupB = populatedPlayoffConfig.qualifiedPlayers.groupB.map(qp => ({
          ...qp,
          player: playerMap.get(qp.player.toString()) || { _id: qp.player, name: 'Unknown Player' }
        }))
      }
    }
    
    // Get playoff matches
    const playoffMatches = await mongoose.connection.db.collection('matches').find({
      league: league._id,
      season: new mongoose.Types.ObjectId(SEASON_ID),
      matchType: 'playoff'
    }).toArray()
    
    // Populate player data in playoff matches
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
      leagueName: league.name,
      playoffConfig: serialize(populatedPlayoffConfig),
      matches: serialize(populatedPlayoffMatches),
      currentPhase: league.playoffConfig.currentPhase
    })
    
  } catch (error) {
    console.error('Error fetching public playoff data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch playoff data', details: error.message },
      { status: 500 }
    )
  }
}