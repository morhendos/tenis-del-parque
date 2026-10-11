import { NextResponse } from 'next/server'
import dbConnect from '../../../../../../lib/db/mongoose'
import Player from '../../../../../../lib/models/Player'
import League from '../../../../../../lib/models/League'
import Match from '../../../../../../lib/models/Match'
import { requireAdmin } from '../../../../../../lib/auth/apiAuth'

export const dynamic = 'force-dynamic'

export async function POST(request, { params }) {
  try {
    const { error } = await requireAdmin(request)
    if (error) return error

    const { id } = params
    const { fromLeagueId, toLeagueId } = await request.json()

    if (!fromLeagueId || !toLeagueId) {
      return NextResponse.json({ error: 'Both leagues are required' }, { status: 400 })
    }
    if (fromLeagueId === toLeagueId) {
      return NextResponse.json({ error: 'Player is already in this league' }, { status: 400 })
    }

    await dbConnect()

    const [player, toLeague] = await Promise.all([
      Player.findById(id),
      League.findById(toLeagueId)
    ])
    if (!player) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 })
    }
    if (!toLeague) {
      return NextResponse.json({ error: 'Target league not found' }, { status: 404 })
    }

    const registration = player.registrations.find(
      reg => reg.league.toString() === fromLeagueId.toString()
    )
    if (!registration) {
      return NextResponse.json({ error: 'Player is not registered for this league' }, { status: 404 })
    }

    const alreadyInTarget = player.registrations.some(
      reg => reg.league.toString() === toLeagueId.toString()
    )
    if (alreadyInTarget) {
      return NextResponse.json({ error: `Player is already registered in ${toLeague.name}` }, { status: 400 })
    }

    const matchCount = await Match.countDocuments({
      league: fromLeagueId,
      $or: [{ 'players.player1': id }, { 'players.player2': id }]
    })
    if (matchCount > 0) {
      return NextResponse.json(
        { error: `Cannot move player - they already have ${matchCount} match(es) in this league.` },
        { status: 400 }
      )
    }

    registration.league = toLeague._id
    if (toLeague.skillLevel && toLeague.skillLevel !== 'all') {
      registration.level = toLeague.skillLevel
    }
    await player.save()

    if (['completed', 'waived'].includes(registration.paymentStatus)) {
      await League.findByIdAndUpdate(fromLeagueId, {
        $inc: { 'stats.totalPlayers': -1, 'stats.registeredPlayers': -1 }
      })
      await League.findByIdAndUpdate(toLeagueId, {
        $inc: { 'stats.totalPlayers': 1, 'stats.registeredPlayers': 1 }
      })
    }

    return NextResponse.json({
      success: true,
      message: `${player.name} moved to ${toLeague.name}`
    })
  } catch (error) {
    console.error('Error moving player to another league:', error)
    return NextResponse.json({ error: 'Failed to move player' }, { status: 500 })
  }
}
