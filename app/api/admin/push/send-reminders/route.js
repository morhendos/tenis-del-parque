import { NextResponse } from 'next/server'
import dbConnect from '@/lib/db/mongoose'
import Match from '@/lib/models/Match'
import Player from '@/lib/models/Player'
import { requireAdmin } from '@/lib/auth/apiAuth'
import { sendToPlayer, notificationTemplates } from '@/lib/services/pushNotificationService'

export const dynamic = 'force-dynamic'

/**
 * POST /api/admin/push/send-reminders
 * 
 * Send push notification reminders for upcoming match deadlines.
 * Can be called manually from admin panel or via a cron job.
 * 
 * Body options:
 *   { leagueId }                         — remind all unplayed matches in this league
 *   { leagueId, round }                  — remind unplayed matches in specific round
 *   { matchId }                          — remind players in a specific match
 *   { leagueId, daysUntilDeadline: 2 }  — remind matches with deadline in N days
 *   { ..., testPlayerId }               — only notify one player (for testing)
 *   { ..., customMessage }              — override default reminder text
 */
export async function POST(request) {
  try {
    const { session, error } = await requireAdmin(request)
    if (error) return error

    await dbConnect()

    const { leagueId, round, matchId, daysUntilDeadline, customMessage, testPlayerId } = await request.json()

    let matchQuery = {
      status: 'scheduled' // Only unplayed matches
    }

    if (matchId) {
      matchQuery._id = matchId
    } else if (leagueId) {
      matchQuery.league = leagueId
      if (round) matchQuery.round = parseInt(round)
      
      // Filter by deadline proximity if specified
      if (daysUntilDeadline !== undefined) {
        const now = new Date()
        const targetDate = new Date()
        targetDate.setDate(targetDate.getDate() + daysUntilDeadline)
        targetDate.setHours(23, 59, 59, 999)
        
        matchQuery['schedule.deadline'] = {
          $gte: now,
          $lte: targetDate
        }
      }
    } else {
      return NextResponse.json(
        { error: 'Please provide leagueId or matchId' },
        { status: 400 }
      )
    }

    // Find matches to remind about
    const matches = await Match.find(matchQuery)
      .populate('players.player1', 'name preferences')
      .populate('players.player2', 'name preferences')
      .populate('league', 'name')
      .lean()

    if (matches.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No scheduled matches found matching criteria',
        reminders: 0
      })
    }

    console.log(`[Reminders] Sending reminders for ${matches.length} matches`)
    if (testPlayerId) {
      console.log(`[Reminders] TEST MODE: Only notifying player ${testPlayerId}`)
    }

    let totalSent = 0
    let totalFailed = 0
    const details = []

    for (const match of matches) {
      // Skip BYE matches
      if (match.isBye || !match.players?.player2) continue

      const player1 = match.players.player1
      const player2 = match.players.player2
      const deadline = match.schedule?.deadline
      
      // Calculate days left
      let daysLeft = null
      if (deadline) {
        const now = new Date()
        daysLeft = Math.ceil((new Date(deadline) - now) / (1000 * 60 * 60 * 24))
        if (daysLeft < 0) daysLeft = 0
      }

      const locale1 = player1.preferences?.preferredLanguage || 'es'
      const locale2 = player2.preferences?.preferredLanguage || 'es'

      // Build notifications
      const buildNotification = (opponent, locale) => {
        if (customMessage) {
          return notificationTemplates.custom(
            '🎾 Tenis del Parque',
            customMessage,
            '/player/matches'
          )
        }
        return notificationTemplates.matchReminder(
          opponent,
          daysLeft !== null ? daysLeft : '?',
          match.round,
          locale
        )
      }

      // Send to player 1 (if not in test mode, or if they're the test player)
      if (!testPlayerId || testPlayerId === player1._id.toString()) {
        const r1 = await sendToPlayer(player1._id, buildNotification(player2.name, locale1))
        totalSent += r1.sent
        totalFailed += r1.failed
        details.push({
          player: player1.name,
          opponent: player2.name,
          round: match.round,
          daysLeft,
          sent: r1.sent > 0
        })
      }

      // Send to player 2 (if not in test mode, or if they're the test player)
      if (!testPlayerId || testPlayerId === player2._id.toString()) {
        const r2 = await sendToPlayer(player2._id, buildNotification(player1.name, locale2))
        totalSent += r2.sent
        totalFailed += r2.failed
        details.push({
          player: player2.name,
          opponent: player1.name,
          round: match.round,
          daysLeft,
          sent: r2.sent > 0
        })
      }
    }

    console.log(`[Reminders] Done: ${totalSent} sent, ${totalFailed} failed`)

    return NextResponse.json({
      success: true,
      matchesProcessed: matches.length,
      notificationsSent: totalSent,
      notificationsFailed: totalFailed,
      testMode: !!testPlayerId,
      details
    })
  } catch (error) {
    console.error('[Reminders] Error:', error)
    return NextResponse.json(
      { error: 'Failed to send reminders', details: error.message },
      { status: 500 }
    )
  }
}
