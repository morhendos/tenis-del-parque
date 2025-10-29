import { NextResponse } from 'next/server'
import dbConnect from '@/lib/db/mongoose'
import Player from '@/lib/models/Player'
import Match from '@/lib/models/Match'
import { calculateEloChange, getInitialEloByLevel } from '@/lib/services/playerStatsService'
import { requireAdmin } from '@/lib/auth/apiAuth'
import { calculatePlayerStats } from '@/lib/services/standingsService'

export const dynamic = 'force-dynamic'

export async function POST(request) {
  try {
    const { session, error } = await requireAdmin(request)
    if (error) return error

    await dbConnect()

    const { playerIds, leagueId } = await request.json()

    const results = {
      playersProcessed: 0,
      totalMatches: 0,
      errors: [],
      summary: []
    }

    // Get the list of players to process
    const playerIdsToProcess = playerIds && playerIds.length > 0 
      ? playerIds 
      : (await Player.find(leagueId ? { 'registrations.league': leagueId } : {}).select('_id')).map(p => p._id.toString())

    // Process each player
    for (const playerId of playerIdsToProcess) {
      try {
        const player = await Player.findById(playerId).populate('registrations.league', 'name')
        if (!player) continue

        // Build match query - EXCLUDE PLAYOFF MATCHES!
        const matchQuery = {
          status: 'completed',
          'result.winner': { $exists: true },
          matchType: { $ne: 'playoff' }, // ← CRITICAL: Only regular season matches!
          $or: [
            { 'players.player1': playerId },
            { 'players.player2': playerId }
          ]
        }

        if (leagueId) {
          matchQuery.league = leagueId
        }

        // Get matches - DON'T populate players (standingsService needs raw ObjectIds)
        const matches = await Match.find(matchQuery)
          .populate('league')  // Only populate league, NOT players!
          .sort({ 'result.playedAt': 1 })
          .lean()

        // Reset league stats
        const leaguesToProcess = leagueId 
          ? player.registrations.filter(reg => reg.league._id.toString() === leagueId.toString())
          : player.registrations

        leaguesToProcess.forEach(reg => {
          reg.stats = {
            matchesPlayed: 0,
            matchesWon: 0,
            totalPoints: 0,
            setsWon: 0,
            setsLost: 0,
            gamesWon: 0,
            gamesLost: 0,
            retirements: 0,
            walkovers: 0
          }
          reg.matchHistory = []
        })

        // Group matches by league for proper calculation
        const matchesByLeague = {}
        matches.forEach(match => {
          const leagueId = match.league._id.toString()
          if (!matchesByLeague[leagueId]) {
            matchesByLeague[leagueId] = []
          }
          matchesByLeague[leagueId].push(match)
        })

        // Process each league's matches using SAME LOGIC as standings
        Object.entries(matchesByLeague).forEach(([leagueId, leagueMatches]) => {
          const registration = player.registrations.find(reg => 
            reg.league._id.toString() === leagueId  // Use _id since league is populated
          )

          if (registration) {
            // Use the SINGLE SOURCE OF TRUTH from standingsService!
            const calculatedStats = calculatePlayerStats(playerId, leagueMatches)
            
            // Update registration stats with correct values
            registration.stats = {
              matchesPlayed: calculatedStats.matchesPlayed,
              matchesWon: calculatedStats.matchesWon,
              totalPoints: calculatedStats.totalPoints,
              setsWon: calculatedStats.setsWon,
              setsLost: calculatedStats.setsLost,
              gamesWon: calculatedStats.gamesWon,
              gamesLost: calculatedStats.gamesLost,
              retirements: registration.stats?.retirements || 0,
              walkovers: registration.stats?.walkovers || 0
            }
          }
        })

        await player.save()

        results.playersProcessed++
        results.totalMatches += matches.length
        
        // Build detailed stats for this player
        const playerDetail = {
          playerId: player._id,
          playerName: player.name,
          email: player.email,
          eloRating: player.eloRating,
          totalMatchesProcessed: matches.length,
          leagues: []
        }
        
        // Add stats for each league registration
        player.registrations.forEach(reg => {
          playerDetail.leagues.push({
            leagueId: reg.league,
            leagueName: reg.league.name || 'Unknown League',
            level: reg.level,
            stats: {
              matchesPlayed: reg.stats.matchesPlayed || 0,
              matchesWon: reg.stats.matchesWon || 0,
              matchesLost: (reg.stats.matchesPlayed || 0) - (reg.stats.matchesWon || 0),
              totalPoints: reg.stats.totalPoints || 0,
              setsWon: reg.stats.setsWon || 0,
              setsLost: reg.stats.setsLost || 0,
              setDiff: (reg.stats.setsWon || 0) - (reg.stats.setsLost || 0),
              gamesWon: reg.stats.gamesWon || 0,
              gamesLost: reg.stats.gamesLost || 0,
              gameDiff: (reg.stats.gamesWon || 0) - (reg.stats.gamesLost || 0)
            }
          })
        })
        
        results.summary.push(playerDetail)
      } catch (error) {
        console.error(`Error processing player ${playerId}:`, error)
        results.errors.push({
          playerId,
          error: error.message
        })
      }
    }

    // Sort by player name alphabetically
    results.summary.sort((a, b) => a.playerName.localeCompare(b.playerName))

    return NextResponse.json({
      success: true,
      message: 'Successfully recalculated stats',
      data: results
    })

  } catch (error) {
    console.error('Error recalculating player stats:', error)
    return NextResponse.json(
      { 
        success: false,
        error: error.message || 'Failed to recalculate player stats' 
      },
      { status: 500 }
    )
  }
}
