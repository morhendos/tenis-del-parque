import { NextResponse } from 'next/server'
import dbConnect from '../../../../lib/db/mongoose'
import Player from '../../../../lib/models/Player'
import User from '../../../../lib/models/User'
import { requirePlayer } from '../../../../lib/auth/apiAuth'

export const dynamic = 'force-dynamic'

// GET /api/player/injury - Get current injury status
export async function GET(request) {
  try {
    const { session, error } = await requirePlayer(request)
    if (error) return error

    await dbConnect()

    const user = await User.findById(session.user.id)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const player = await Player.findOne({ email: user.email })
    if (!player) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 })
    }

    return NextResponse.json({
      injury: player.injury || { active: false }
    })
  } catch (error) {
    console.error('Error fetching injury status:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/player/injury - Report or clear injury
export async function POST(request) {
  try {
    const { session, error } = await requirePlayer(request)
    if (error) return error

    await dbConnect()

    const user = await User.findById(session.user.id)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const player = await Player.findOne({ email: user.email })
    if (!player) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 })
    }

    const body = await request.json()
    const { action, estimatedReturnDate, reason } = body

    if (action === 'report') {
      if (!estimatedReturnDate) {
        return NextResponse.json(
          { error: 'Estimated return date is required' },
          { status: 400 }
        )
      }

      const returnDate = new Date(estimatedReturnDate)
      if (returnDate <= new Date()) {
        return NextResponse.json(
          { error: 'Return date must be in the future' },
          { status: 400 }
        )
      }

      player.injury = {
        active: true,
        reportedAt: new Date(),
        estimatedReturnDate: returnDate,
        reason: reason || '',
        reportedBy: 'player'
      }

      await player.save()

      console.log(`🤕 Player ${player.name} reported injury until ${returnDate.toISOString()}`)

      return NextResponse.json({
        success: true,
        message: 'Injury reported successfully',
        injury: player.injury
      })
    } else if (action === 'clear') {
      player.injury = {
        active: false,
        reportedAt: player.injury?.reportedAt,
        estimatedReturnDate: player.injury?.estimatedReturnDate,
        reason: player.injury?.reason,
        reportedBy: player.injury?.reportedBy
      }

      await player.save()

      console.log(`💪 Player ${player.name} cleared injury status`)

      return NextResponse.json({
        success: true,
        message: 'Injury cleared — welcome back!',
        injury: player.injury
      })
    } else {
      return NextResponse.json(
        { error: 'Invalid action. Use "report" or "clear"' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Error updating injury status:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
