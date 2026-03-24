import { NextResponse } from 'next/server'
import dbConnect from '@/lib/db/mongoose'
import Match from '@/lib/models/Match'
import Player from '@/lib/models/Player'
import { requireAdmin } from '@/lib/auth/apiAuth'
import { sendToPlayer, notificationTemplates } from '@/lib/services/pushNotificationService'

export const dynamic = 'force-dynamic'

/**
 * POST /api/admin/push/notify-round
 * 
 * Notify players about their new match assignments for a specific round.
 * Used after creating matches via Swiss Pairing or manual creation.
 * 
 * Body:
 *   { leagueId, round }                  — notify all players in this round
 *   { leagueId, round, testPlayerId }    — only notify one specific player (for testing)
 */
export async function POST(request) {
  try {
    const { session, error } = await requireAdmin(request)
    if (error) return error

    await dbConnect()

    const { leagueId, round, testPlayerId } = await request.json()

    if (!leagueId || !round) {
      return NextResponse.json(
        { error: 'leagueId and round are required' },
        { status: 400 }
      )
    }

    // Find all matches in this round
    const matchQuery = {
      league: leagueId,
      round: parseInt(round),
      isBye: { $ne: true }
    }
    
    const matches = await Match.find(matchQuery)
      .populate('players.player1', 'name preferences')
      .populate('players.player2', 'name preferences')
      .lean()

    if (matches.length === 0) {
      return NextResponse.json({
        success: true,
        message: `No matches found for round ${round}`,
        notified: 0
      })
    }

    console.log(`[Notify Round] Notifying ${matches.length} matches for round ${round}`)
    if (testPlayerId) {
      console.log(`[Notify Round] TEST MODE: Only notifying player ${testPlayerId}`)
    }

    let totalSent = 0
    let totalFailed = 0
    const details = []

    for (const match of matches) {
      if (!match.players?.player1 || !match.players?.player2) continue

      const p1 = match.players.player1
      const p2 = match.players.player2
      
      const locale1 = p1.preferences?.preferredLanguage || 'es'
      const locale2 = p2.preferences?.preferredLanguage || 'es'

      // Notify player 1 (if not in test mode, or if they're the test player)
      if (!testPlayerId || testPlayerId === p1._id.toString()) {
        const r1 = await sendToPlayer(
          p1._id,
          notificationTemplates.newMatch(p2.name, round, locale1)
        )
        totalSent += r1.sent
        totalFailed += r1.failed
        details.push({ player: p1.name, opponent: p2.name, sent: r1.sent > 0 })
      }

      // Notify player 2 (if not in test mode, or if they're the test player)
      if (!testPlayerId || testPlayerId === p2._id.toString()) {
        const r2 = await sendToPlayer(
          p2._id,
          notificationTemplates.newMatch(p1.name, round, locale2)
        )
        totalSent += r2.sent
        totalFailed += r2.failed
        details.push({ player: p2.name, opponent: p1.name, sent: r2.sent > 0 })
      }
    }

    console.log(`[Notify Round] Done: ${totalSent} sent, ${totalFailed} failed`)

    return NextResponse.json({
      success: true,
      round,
      matchesProcessed: matches.length,
      notificationsSent: totalSent,
      notificationsFailed: totalFailed,
      testMode: !!testPlayerId,
      details
    })
  } catch (error) {
    console.error('[Notify Round] Error:', error)
    return NextResponse.json(
      { error: 'Failed to send notifications', details: error.message },
      { status: 500 }
    )
  }
}
