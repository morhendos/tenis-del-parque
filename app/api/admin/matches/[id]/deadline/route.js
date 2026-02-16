import { NextResponse } from 'next/server'
import dbConnect from '../../../../../../lib/db/mongoose'
import Match from '../../../../../../lib/models/Match'
import { requireAdmin } from '../../../../../../lib/auth/apiAuth'

export const dynamic = 'force-dynamic'

// PATCH /api/admin/matches/[id]/deadline - Admin extend/set deadline & uncancel
export async function PATCH(request, { params }) {
  try {
    const { session, error } = await requireAdmin(request)
    if (error) return error

    const { id } = params
    const body = await request.json()
    const { action, days, customDeadline } = body

    await dbConnect()

    const match = await Match.findById(id)
    if (!match) {
      return NextResponse.json({ error: 'Match not found' }, { status: 404 })
    }

    // Calculate new deadline
    let newDeadline
    if (customDeadline) {
      newDeadline = new Date(customDeadline)
      newDeadline.setHours(23, 59, 59, 999)
    } else if (days) {
      // Extend from NOW (not from old deadline) so the players get actual new time
      newDeadline = new Date()
      newDeadline.setDate(newDeadline.getDate() + days)
      newDeadline.setHours(23, 59, 59, 999)
    } else {
      return NextResponse.json({ error: 'Provide days or customDeadline' }, { status: 400 })
    }

    const previousDeadline = match.schedule?.deadline
    const previousStatus = match.status

    // Initialize schedule if needed
    if (!match.schedule) match.schedule = {}
    if (!match.schedule.extensionHistory) match.schedule.extensionHistory = []

    // Set new deadline
    match.schedule.deadline = newDeadline

    // Record admin extension in history
    match.schedule.extensionHistory.push({
      player: null, // null indicates admin action
      usedAt: new Date(),
      previousDeadline: previousDeadline || new Date(),
      newDeadline: newDeadline
    })

    // Handle uncancel: restore to scheduled if currently cancelled
    if (action === 'uncancel' && match.status === 'cancelled') {
      match.status = 'scheduled'
      // Clear the auto-cancel note if present
      if (match.notes?.includes('Auto-cancelled')) {
        match.notes = `Admin restored: new deadline set (${new Date().toISOString().split('T')[0]})`
      } else {
        match.notes = match.notes 
          ? `${match.notes} | Admin restored: new deadline set (${new Date().toISOString().split('T')[0]})`
          : `Admin restored: new deadline set (${new Date().toISOString().split('T')[0]})`
      }
    }

    // Handle simple extend for scheduled matches
    if (action === 'extend' && match.status === 'scheduled') {
      const existingNote = match.notes || ''
      const extendNote = `Admin extended deadline +${days}d (${new Date().toISOString().split('T')[0]})`
      match.notes = existingNote ? `${existingNote} | ${extendNote}` : extendNote
    }

    await match.save()

    // Return populated match
    await match.populate('players.player1 players.player2 league')

    return NextResponse.json({
      success: true,
      message: action === 'uncancel' 
        ? 'Match uncancelled and deadline set' 
        : 'Deadline updated',
      match,
      previousStatus,
      newDeadline
    })

  } catch (error) {
    console.error('Error updating match deadline:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update deadline' },
      { status: 500 }
    )
  }
}
