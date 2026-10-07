import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import dbConnect from '../../../../lib/db/mongoose'
import Player from '../../../../lib/models/Player'
import User from '../../../../lib/models/User'
import League from '../../../../lib/models/League'
import City from '../../../../lib/models/City'
import { requirePlayer } from '../../../../lib/auth/apiAuth'

export const dynamic = 'force-dynamic'

export async function POST(request) {
  try {
    const { session, error } = await requirePlayer(request)
    if (error) return error

    const { leagueId } = await request.json()
    if (!leagueId) {
      return NextResponse.json({ error: 'Missing league' }, { status: 400 })
    }

    await dbConnect()

    const user = await User.findById(session.user.id).select('email')
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const player = await Player.findOne({ email: user.email })
    const registration = player?.registrations.find(r => r.league?.toString() === leagueId)
    if (!registration) {
      return NextResponse.json({ error: 'Registration not found' }, { status: 404 })
    }
    if (registration.paymentStatus !== 'pending' || registration.status !== 'pending') {
      return NextResponse.json({ error: 'Only unpaid registrations can be changed' }, { status: 409 })
    }

    if (registration.stripeSessionId && process.env.STRIPE_SECRET_KEY) {
      try {
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
        await stripe.checkout.sessions.expire(registration.stripeSessionId)
      } catch {}
    }

    player.registrations.pull(registration._id)
    await player.save()

    const league = await League.findById(leagueId).select('city')
    const city = league?.city ? await City.findById(league.city).select('slug') : null

    return NextResponse.json({ success: true, citySlug: city?.slug || null })
  } catch (err) {
    console.error('Cancel registration error:', err)
    return NextResponse.json({ error: 'Could not cancel registration' }, { status: 500 })
  }
}
