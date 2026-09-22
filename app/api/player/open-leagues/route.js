import { NextResponse } from 'next/server'
import dbConnect from '../../../../lib/db/mongoose'
import Player from '../../../../lib/models/Player'
import User from '../../../../lib/models/User'
import League from '../../../../lib/models/League'
import '../../../../lib/models/City'
import { requirePlayer } from '../../../../lib/auth/apiAuth'

export const dynamic = 'force-dynamic'

export async function GET(request) {
  try {
    const { session, error } = await requirePlayer(request)
    if (error) return error

    await dbConnect()

    const user = await User.findById(session.user.id).select('email')
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const player = await Player.findOne({ email: user.email }).select('registrations.league')
    const joinedIds = (player?.registrations || []).map(r => r.league)

    const joinedLeagues = await League.find({ _id: { $in: joinedIds } }).select('city')
    const cityIds = [...new Set(joinedLeagues.map(l => l.city?.toString()).filter(Boolean))]

    const now = new Date()
    const query = {
      status: 'registration_open',
      _id: { $nin: joinedIds },
      $and: [
        { $or: [{ 'seasonConfig.registrationStart': null }, { 'seasonConfig.registrationStart': { $lte: now } }] },
        { $or: [{ 'seasonConfig.registrationEnd': null }, { 'seasonConfig.registrationEnd': { $gte: now } }] }
      ]
    }
    if (cityIds.length > 0) {
      query.city = { $in: cityIds }
    }

    const leagues = await League.find(query)
      .populate('city', 'slug name')
      .sort({ displayOrder: 1 })
      .lean()

    const counts = await Player.aggregate([
      { $unwind: '$registrations' },
      {
        $match: {
          'registrations.league': { $in: leagues.map(l => l._id) },
          'registrations.status': { $in: ['confirmed', 'active'] }
        }
      },
      { $group: { _id: '$registrations.league', count: { $sum: 1 } } }
    ])
    const countMap = Object.fromEntries(counts.map(c => [c._id.toString(), c.count]))

    const result = leagues.map(l => {
      const registered = countMap[l._id.toString()] || 0
      const maxPlayers = l.seasonConfig?.maxPlayers || null
      return {
        _id: l._id.toString(),
        name: l.name,
        slug: l.slug,
        skillLevel: l.skillLevel,
        city: {
          slug: l.city?.slug || null,
          name: l.city?.name || { es: l.location?.city, en: l.location?.city }
        },
        startDate: l.seasonConfig?.startDate || null,
        registrationEnd: l.seasonConfig?.registrationEnd || null,
        price: l.seasonConfig?.price || null,
        spotsLeft: maxPlayers ? Math.max(maxPlayers - registered, 0) : null
      }
    })

    return NextResponse.json({ success: true, leagues: result })
  } catch (error) {
    console.error('Error fetching open leagues for player:', error)
    return NextResponse.json({ error: 'Failed to fetch open leagues' }, { status: 500 })
  }
}
