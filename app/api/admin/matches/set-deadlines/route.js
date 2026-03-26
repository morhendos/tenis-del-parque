import { NextResponse } from 'next/server'
import dbConnect from '@/lib/db/mongoose'
import Match from '@/lib/models/Match'
import League from '@/lib/models/League'
import { requireAdmin } from '@/lib/auth/apiAuth'

export const dynamic = 'force-dynamic'

/**
 * POST /api/admin/matches/set-deadlines
 * 
 * Bulk set deadline for all scheduled matches in specific rounds of a league.
 * Also uncancels any cancelled matches in those rounds (restores them to scheduled).
 * 
 * Body:
 * {
 *   leagueId: string,
 *   rounds: number[],        // e.g. [5, 6, 7, 8]
 *   deadline: string,         // ISO date e.g. "2025-04-12"
 *   uncancelOverdue: boolean  // if true, also restore cancelled matches
 * }
 */
export async function POST(request) {
  try {
    const { session, error } = await requireAdmin(request)
    if (error) return error

    await dbConnect()

    const { leagueId, rounds, deadline, uncancelOverdue = true } = await request.json()

    if (!leagueId) {
      return NextResponse.json({ error: 'leagueId is required' }, { status: 400 })
    }
    if (!rounds || !Array.isArray(rounds) || rounds.length === 0) {
      return NextResponse.json({ error: 'rounds array is required' }, { status: 400 })
    }
    if (!deadline) {
      return NextResponse.json({ error: 'deadline date is required' }, { status: 400 })
    }

    const league = await League.findById(leagueId, 'name').lean()
    if (!league) {
      return NextResponse.json({ error: 'League not found' }, { status: 404 })
    }

    // Set deadline to end of day (23:59:59)
    const deadlineDate = new Date(deadline + 'T23:59:59.000Z')

    // Find all matches in these rounds that need updating
    const statusFilter = uncancelOverdue 
      ? { $in: ['scheduled', 'cancelled'] }
      : 'scheduled'

    const matches = await Match.find({
      league: leagueId,
      round: { $in: rounds },
      status: statusFilter,
      isBye: { $ne: true }
    })

    if (matches.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No matches found to update',
        stats: { updated: 0, uncancelled: 0 }
      })
    }

    let updated = 0
    let uncancelled = 0
    const details = []

    for (const match of matches) {
      const oldDeadline = match.schedule?.deadline
      const wasCancelled = match.status === 'cancelled'

      // Set new deadline
      if (!match.schedule) match.schedule = {}
      match.schedule.deadline = deadlineDate

      // Add to extension history for audit trail
      if (!match.schedule.extensionHistory) match.schedule.extensionHistory = []
      match.schedule.extensionHistory.push({
        player: null, // admin action
        usedAt: new Date(),
        previousDeadline: oldDeadline || null,
        newDeadline: deadlineDate,
        reason: 'bulk_admin_set'
      })

      // Uncancel if needed
      if (wasCancelled && uncancelOverdue) {
        match.status = 'scheduled'
        uncancelled++
      }

      await match.save()
      updated++

      details.push({
        round: match.round,
        player1: match.players?.player1?.toString().slice(-4),
        player2: match.players?.player2?.toString().slice(-4),
        wasCancelled,
        newDeadline: deadlineDate.toISOString()
      })
    }

    console.log('[SetDeadlines] Updated ' + updated + ' matches (' + uncancelled + ' uncancelled) in ' + league.name + ' rounds ' + rounds.join(',') + ' to ' + deadline)

    return NextResponse.json({
      success: true,
      stats: {
        updated,
        uncancelled,
        totalMatches: matches.length,
        rounds: rounds,
        newDeadline: deadlineDate.toISOString(),
        leagueName: league.name
      },
      details
    })
  } catch (error) {
    console.error('[SetDeadlines] Error:', error)
    return NextResponse.json(
      { error: 'Failed to set deadlines', details: error.message },
      { status: 500 }
    )
  }
}
