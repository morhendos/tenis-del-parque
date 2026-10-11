import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import mongoose from 'mongoose'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import dbConnect from '@/lib/db/mongoose'
import User from '@/lib/models/User'
import Player from '@/lib/models/Player'

export const dynamic = 'force-dynamic'

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const { leagueId } = await request.json()
    if (!leagueId || !mongoose.Types.ObjectId.isValid(leagueId)) {
      return NextResponse.json({ error: 'League ID is required' }, { status: 400 })
    }

    await dbConnect()

    const user = await User.findById(session.user.id).select('email').lean()
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    await Player.updateOne(
      { email: user.email, 'registrations.league': leagueId },
      { $set: { 'registrations.$.seasonStartCelebratedAt': new Date() } }
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error saving season celebration:', error)
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 })
  }
}
