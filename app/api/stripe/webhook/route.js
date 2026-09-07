import Stripe from 'stripe'
import dbConnect from '../../../../lib/db/mongoose'
import Player from '../../../../lib/models/Player'

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
        console.log(`Payment completed for player ${playerId}, league ${leagueId}, session ${session.id}`)
      }
    } catch (error) {
      console.error('Webhook processing error:', error)
      return Response.json({ error: 'Processing failed' }, { status: 500 })
    }
  }

  return Response.json({ received: true })
}
