import { NextResponse } from 'next/server'
import dbConnect from '@/lib/db/mongoose'
import Match from '@/lib/models/Match'
import League from '@/lib/models/League'
import { requireAdmin } from '@/lib/auth/apiAuth'

export const dynamic = 'force-dynamic'

/**
 * POST /api/admin/matches/set-deadlines
 * 
 * Bulk set deadline for all scheduled/cancelled matches in specific rounds.
 * 
 * Body:
 * {
 *   leagueId: string,
 *   rounds: number[],           // e.g. [5, 6, 7, 8]
 *   deadline: string,            // ISO date e.g. "2025-04-12"
 *   uncancelOverdue: boolean,    // if true, restore cancelled matches to scheduled
 *   dryRun: boolean              // if true, show what would change without saving
 * }
 */
export async function POST(request) {
  try {
    const { session, error } = await requireAdmin(request)
    if (error) return error

    await dbConnect()

    const { leagueId, rounds, deadline, uncancelOverdue = true, dryRun = false } = await request.json()

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
    }).populate('players.player1', 'name')
      .populate('players.player2', 'name')

    // Also count completed matches in these rounds (for context)
    const completedCount = await Match.countDocuments({
      league: leagueId,
      round: { $in: rounds },
      status: 'completed'
    })

    if (matches.length === 0) {
      return NextResponse.json({
        success: true,
        dryRun,
        message: 'No scheduled/cancelled matches found in these rounds. ' + completedCount + ' matches already completed.',
        stats: { wouldUpdate: 0, wouldUncancel: 0, alreadyCompleted: completedCount }
      })
    }

    // Build details with player names
    let wouldUpdate = 0
    let wouldUncancel = 0
    const details = []

    for (const match of matches) {
      const oldDeadline = match.schedule?.deadline
      const wasCancelled = match.status === 'cancelled'
      const oldDeadlineStr = oldDeadline 
        ? new Date(oldDeadline).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
        : 'none'

      wouldUpdate++
      if (wasCancelled && uncancelOverdue) wouldUncancel++

      details.push({
        round: match.round,
        player1: match.players?.player1?.name || '?',
        player2: match.players?.player2?.name || '?',
        currentStatus: match.status,
        currentDeadline: oldDeadlineStr,
        willUncancel: wasCancelled && uncancelOverdue,
        newDeadline: deadlineDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
      })
    }

    // Sort by round then player name
    details.sort((a, b) => a.round - b.round || a.player1.localeCompare(b.player1))

    if (dryRun) {
      return NextResponse.json({
        success: true,
        dryRun: true,
        message: 'DRY RUN — no changes made. Review the details below, then run again with dryRun: false to apply.',
        stats: {
          wouldUpdate,
          wouldUncancel,
          alreadyCompleted: completedCount,
          rounds,
          newDeadline: deadlineDate.toISOString(),
          leagueName: league.name
        },
        details
      })
    }

    // REAL RUN — apply changes
    let updated = 0
    let uncancelled = 0

    for (const match of matches) {
      const oldDeadline = match.schedule?.deadline
      const wasCancelled = match.status === 'cancelled'

      if (!match.schedule) match.schedule = {}
      match.schedule.deadline = deadlineDate

      if (!match.schedule.extensionHistory) match.schedule.extensionHistory = []
      match.schedule.extensionHistory.push({
        player: null,
        usedAt: new Date(),
        previousDeadline: oldDeadline || null,
        newDeadline: deadlineDate,
        reason: 'bulk_admin_set'
      })

      if (wasCancelled && uncancelOverdue) {
        match.status = 'scheduled'
        uncancelled++
      }

      await match.save()
      updated++
    }

    console.log('[SetDeadlines] Updated ' + updated + ' matches (' + uncancelled + ' uncancelled) in ' + league.name + ' rounds ' + rounds.join(',') + ' to ' + deadline)

    return NextResponse.json({
      success: true,
      dryRun: false,
      message: 'Done! Updated ' + updated + ' matches' + (uncancelled > 0 ? ' (' + uncancelled + ' restored from cancelled)' : '') + '.',
      stats: {
        updated,
        uncancelled,
        alreadyCompleted: completedCount,
        rounds,
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
