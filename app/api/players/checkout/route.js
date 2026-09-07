import Stripe from 'stripe'
import dbConnect from '../../../../lib/db/mongoose'
import Player from '../../../../lib/models/Player'
import League from '../../../../lib/models/League'

export async function POST(request) {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return Response.json(
        { success: false, error: 'Payments not configured' },
        { status: 503 }
      )
    }
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

    await dbConnect()

    const body = await request.json()
    const { email, leagueId, leagueSlug, language = 'es' } = body

    if (!email || (!leagueId && !leagueSlug)) {
      return Response.json(
        { success: false, error: 'Missing email or league' },
        { status: 400 }
      )
    }

    const player = await Player.findOne({ email: email.toLowerCase() })
    if (!player) {
      return Response.json(
        { success: false, error: 'Player not found' },
        { status: 404 }
      )
    }

    const league = leagueId
      ? await League.findById(leagueId)
      : await League.findOne({ slug: leagueSlug })

    if (!league) {
      return Response.json(
        { success: false, error: 'League not found' },
        { status: 404 }
      )
    }

    const registration = player.getLeagueRegistration(league._id)
    if (!registration) {
      return Response.json(
        { success: false, error: 'No registration found for this league' },
        { status: 404 }
      )
    }

    if (registration.paymentStatus === 'completed' || registration.paymentStatus === 'waived') {
      return Response.json(
        { success: false, error: 'Already paid', alreadyPaid: true },
        { status: 409 }
      )
    }

    const amount = Math.round((registration.finalPrice || 0) * 100)
    if (amount <= 0) {
      return Response.json(
        { success: false, error: 'Nothing to pay', alreadyPaid: true },
        { status: 409 }
      )
    }

    const baseUrl = process.env.NEXT_PUBLIC_URL || 'https://tenisdp.es'
    const signupPath = language === 'es' ? 'es/registro' : 'en/signup'

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: player.email,
      line_items: [
        {
          price_data: {
            currency: 'eur',
            unit_amount: amount,
            product_data: {
              name: language === 'es'
                ? `Cuota de temporada - ${league.name}`
                : `Season fee - ${league.name}`
            }
          },
          quantity: 1
        }
      ],
      metadata: {
        playerId: player._id.toString(),
        leagueId: league._id.toString()
      },
      success_url: `${baseUrl}/${signupPath}/${league.slug}?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/${signupPath}/${league.slug}?payment=cancelled`
    })

    registration.stripeSessionId = session.id
    await player.save()

    return Response.json({ success: true, url: session.url })
  } catch (error) {
    console.error('Checkout error:', error)
    return Response.json(
      { success: false, error: 'Could not create checkout session' },
      { status: 500 }
    )
  }
}
