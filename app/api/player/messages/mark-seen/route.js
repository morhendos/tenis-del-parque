import { NextResponse } from 'next/server'
import dbConnect from '../../../../../lib/db/mongoose'
import User from '../../../../../lib/models/User'
import { requirePlayer } from '../../../../../lib/auth/apiAuth'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

export async function POST(req) {
  try {
    // Use new NextAuth authentication system
    const { session, error } = await requirePlayer(req)
    if (error) return error

    const { messageId } = await req.json()

    if (!messageId) {
      return NextResponse.json(
        { error: 'Message ID is required' },
        { status: 400 }
      )
    }

    await dbConnect()

    // Find the user and mark announcement as seen
    const user = await User.findById(session.user.id)
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Mark the announcement as seen
    await user.markAnnouncementSeen(messageId)

    return NextResponse.json({
      success: true,
      message: 'Announcement marked as seen'
    })

  } catch (error) {
    console.error('Mark seen error:', error)
    return NextResponse.json(
      { error: 'Failed to mark message as seen' },
      { status: 500 }
    )
  }
}
