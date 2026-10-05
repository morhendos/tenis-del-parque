import Stripe from 'stripe'
import dbConnect from '../../../../lib/db/mongoose'
import Player from '../../../../lib/models/Player'
import League from '../../../../lib/models/League'
import { sendLeagueWelcomeEmail } from '../../../../lib/email/sendLeagueWelcomeEmail'

export async function POST(request) {
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    return Response.json({ error: 'Payments not configured' }, { status: 503 })
  }
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

  const payload = await request.text()
  const signature = request.headers.get('stripe-signature')

  let event
  try {
    event = stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message)
    return Response.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object
    const { playerId, leagueId } = session.metadata || {}

    if (!playerId || !leagueId) {
      console.error('Webhook session missing metadata:', session.id)
      return Response.json({ received: true })
    }

    try {
      await dbConnect()

      const player = await Player.findById(playerId)
      if (!player) {
        console.error('Webhook: player not found:', playerId)
        return Response.json({ received: true })
      }

      const registration = player.getLeagueRegistration(leagueId)
      if (!registration) {
        console.error('Webhook: registration not found for league:', leagueId)
        return Response.json({ received: true })
      }

      if (registration.paymentStatus !== 'completed') {
        registration.paymentStatus = 'completed'
        registration.paidAt = new Date()
        registration.stripeSessionId = session.id
        if (registration.status === 'pending') {
          registration.status = 'confirmed'
        }
        await player.save()
        await League.findByIdAndUpdate(leagueId, {
          $inc: { 'stats.totalPlayers': 1, 'stats.registeredPlayers': 1 }
        })
        console.log(`Payment completed for player ${playerId}, league ${leagueId}, session ${session.id}`)
        try {
          const league = await League.findById(leagueId)
          if (league) {
            const result = await sendLeagueWelcomeEmail({ player, league, registration, language: session.locale })
            if (!result?.success) console.error('Webhook: welcome email failed:', result?.error)
          }
        } catch (emailError) {
          console.error('Webhook: welcome email error:', emailError)
        }
      }
    } catch (error) {
      console.error('Webhook processing error:', error)
      return Response.json({ error: 'Processing failed' }, { status: 500 })
    }
  }

  return Response.json({ received: true })
}
