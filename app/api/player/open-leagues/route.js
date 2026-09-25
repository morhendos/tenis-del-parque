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
    const joinedLeagues = await League.find({ _id: { $in: joinedIds } }).select('city status skillLevel seasonConfig.startDate')

    const lastLevelByCity = new Map()
    const lastStartByCity = new Map()
    for (const l of joinedLeagues) {
      const cityId = l.city?.toString()
      if (!cityId || !l.skillLevel || l.skillLevel === 'all') continue
      const start = l.seasonConfig?.startDate ? new Date(l.seasonConfig.startDate).getTime() : 0
      if (!lastStartByCity.has(cityId) || start > lastStartByCity.get(cityId)) {
        lastStartByCity.set(cityId, start)
        lastLevelByCity.set(cityId, l.skillLevel)
      }
    }

    const cityIds = [...new Set(joinedLeagues.map(l => l.city?.toString()).filter(Boolean))]
    const joinedOpenCityIds = new Set(
      joinedLeagues
        .filter(l => l.status === 'registration_open')
        .map(l => l.city?.toString())
        .filter(Boolean)
    )

    const now = new Date()
    const query = {
      status: 'registration_open',
      $and: [
        { $or: [{ 'seasonConfig.registrationStart': null }, { 'seasonConfig.registrationStart': { $lte: now } }] },
        { $or: [{ 'seasonConfig.registrationEnd': null }, { 'seasonConfig.registrationEnd': { $gte: now } }] }
      ]
    }

    const leagues = (await League.find(query)
      .populate('city', 'slug name')
      .sort({ displayOrder: 1 })
      .lean())
      .sort((a, b) =>
        Number(!cityIds.includes(a.city?._id?.toString())) - Number(!cityIds.includes(b.city?._id?.toString()))
      )

    const cityMap = new Map()
    for (const l of leagues) {
      const cityId = l.city?._id?.toString()
      if (!cityId || !l.city?.slug || joinedOpenCityIds.has(cityId)) continue

      const registrationEnd = l.seasonConfig?.registrationEnd || null
      const existing = cityMap.get(cityId)
      if (!existing) {
        cityMap.set(cityId, {
          slug: l.city.slug,
          name: l.city.name,
          registrationEnd,
          season: l.season || null,
          lastLevel: lastLevelByCity.get(cityId) || null
        })
      } else if (registrationEnd && (!existing.registrationEnd || registrationEnd > existing.registrationEnd)) {
        existing.registrationEnd = registrationEnd
      }
    }

    return NextResponse.json({ success: true, cities: [...cityMap.values()], joinedOpen: joinedOpenCityIds.size > 0 })
  } catch (error) {
    console.error('Error fetching open leagues for player:', error)
    return NextResponse.json({ error: 'Failed to fetch open leagues' }, { status: 500 })
  }
}
