import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import dbConnect from '@/lib/db/mongoose'
import Player from '@/lib/models/Player'
import User from '@/lib/models/User'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

/**
 * GET /api/player/elo-history
 * 
 * Returns ELO progression chart data from cached matchHistory
 * (populated by match result submissions and rebuild scripts)
 */
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await dbConnect()

    // Find the user and their linked player
    const user = await User.findOne({ email: session.user.email })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get player with populated opponent names in matchHistory
    const player = await Player.findOne({ userId: user._id })
      .populate('registrations.matchHistory.opponent', 'name')
      .lean()
    
    if (!player) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 })
    }

    // Get starting ELO based on player's registration level
    const getInitialEloByLevel = (level) => {
      const eloRatings = {
        'beginner': 1100,
        'intermediate': 1200,
        'advanced': 1300
      }
      return eloRatings[level] || 1200
    }

    const primaryLevel = player.registrations?.[0]?.level || 'intermediate'
    const startingElo = getInitialEloByLevel(primaryLevel)

    // Collect ALL matchHistory entries from ALL registrations
    const allMatches = []
    
    for (const registration of (player.registrations || [])) {
      if (registration.matchHistory && registration.matchHistory.length > 0) {
        for (const entry of registration.matchHistory) {
          allMatches.push({
            ...entry,
            leagueId: registration.league
          })
        }
      }
    }

    // Sort by date ascending (oldest first) for chart progression
    allMatches.sort((a, b) => new Date(a.date) - new Date(b.date))

    console.log(`ELO History: Found ${allMatches.length} matches in matchHistory cache for ${player.name}`)

    // Build chart data from matchHistory
    const chartData = [{
      matchNumber: 0,
      elo: startingElo,
      label: 'Start',
      isStart: true
    }]

    let wins = 0
    let losses = 0
    let peakElo = startingElo
    let lowestElo = startingElo

    // Process each match in chronological order
    allMatches.forEach((match, index) => {
      const eloAfter = match.eloAfter || startingElo
      const eloChange = match.eloChange || 0
      const playerWon = match.result === 'won'

      // Track peak and lowest
      if (eloAfter > peakElo) peakElo = eloAfter
      if (eloAfter < lowestElo) lowestElo = eloAfter

      // Track wins/losses
      if (playerWon) {
        wins++
      } else {
        losses++
      }

      chartData.push({
        matchNumber: index + 1,
        elo: eloAfter,
        eloChange: eloChange,
        result: match.result,
        opponent: match.opponent?.name || 'Unknown',
        score: match.score || 'N/A',
        date: match.date,
        round: match.round
      })
    })

    const totalMatches = allMatches.length
    const lastMatchChange = totalMatches > 0 ? chartData[chartData.length - 1].eloChange : 0

    // Use player's stored ELO values (authoritative)
    const finalCurrentElo = player.eloRating || startingElo
    const finalPeakElo = player.highestElo || peakElo
    const finalLowestElo = player.lowestElo || lowestElo

    return NextResponse.json({
      chartData,
      stats: {
        startingElo,
        currentElo: finalCurrentElo,
        peakElo: finalPeakElo,
        lowestElo: finalLowestElo,
        totalChange: finalCurrentElo - startingElo,
        lastMatchChange,
        totalMatches,
        wins,
        losses,
        winRate: totalMatches > 0 ? Math.round((wins / totalMatches) * 100) : 0
      }
    })

  } catch (error) {
    console.error('Error fetching ELO history:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
