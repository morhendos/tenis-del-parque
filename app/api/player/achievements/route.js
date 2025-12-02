import { NextResponse } from 'next/server'
import dbConnect from '../../../../lib/db/mongoose'
import Player from '../../../../lib/models/Player'
import User from '../../../../lib/models/User'
import League from '../../../../lib/models/League'
import { requirePlayer } from '../../../../lib/auth/apiAuth'
import { calculatePlayerAchievements } from '../../../../lib/services/achievementsService'

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic'

export async function GET(request) {
  try {
    // Authenticate player
    const { session, error } = await requirePlayer(request)
    if (error) return error

    await dbConnect()

    // Get user details
    const user = await User.findById(session.user.id).select('-password')
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Get player with registrations
    const player = await Player.findOne({ email: user.email })
    if (!player) {
      return NextResponse.json(
        { error: 'Player profile not found' },
        { status: 404 }
      )
    }

    // Get all league IDs from player registrations
    const leagueIds = player.registrations
      ?.filter(reg => ['confirmed', 'active'].includes(reg.status))
      ?.map(reg => reg.league) || []

    if (leagueIds.length === 0) {
      // Player has no active registrations - return empty achievements
      return NextResponse.json({
        achievements: {
          trophies: [],
          seasonPlacements: [],
          badges: [],
          summary: {
            totalTrophies: 0,
            goldTrophies: 0,
            silverTrophies: 0,
            bronzeTrophies: 0,
            totalBadges: 0,
            seasonsPlayed: 0
          }
        }
      })
    }

    // Fetch all leagues with full playoff configuration
    const leagues = await League.find({ 
      _id: { $in: leagueIds }
    }).select('name slug season location config playoffConfig stats parentLeague updatedAt')

    // Calculate achievements
    const achievements = calculatePlayerAchievements(player, leagues)

    return NextResponse.json({
      achievements,
      player: {
        _id: player._id,
        name: player.name,
        eloRating: player.eloRating,
        highestElo: player.highestElo
      }
    })

  } catch (error) {
    console.error('Error fetching player achievements:', error)
    return NextResponse.json(
      { error: 'Failed to fetch achievements' },
      { status: 500 }
    )
  }
}
