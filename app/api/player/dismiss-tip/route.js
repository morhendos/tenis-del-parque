import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import dbConnect from '@/lib/db/mongoose'
import User from '@/lib/models/User'
import Player from '@/lib/models/Player'

export const dynamic = 'force-dynamic'

const ALLOWED_TIPS = ['court-sotogrande']

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const { tip } = await request.json()
    if (!ALLOWED_TIPS.includes(tip)) {
      return NextResponse.json({ error: 'Unknown tip' }, { status: 400 })
    }

    await dbConnect()

    const user = await User.findById(session.user.id).select('email').lean()
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    await Player.updateOne({ email: user.email }, { $addToSet: { dismissedTips: tip } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error dismissing tip:', error)
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 })
  }
}
