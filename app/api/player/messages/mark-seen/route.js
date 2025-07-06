import { NextResponse } from 'next/server'
import dbConnect from '../../../../../lib/db/mongoose'
import User from '../../../../../lib/models/User'
import { authMiddleware } from '../../../../../lib/utils/authMiddleware'

export async function POST(req) {
  try {
    // Authenticate user
    const authResult = await authMiddleware(req)
    if (!authResult.authenticated) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { messageId } = await req.json()

    if (!messageId) {
      return NextResponse.json(
        { error: 'Message ID is required' },
        { status: 400 }
      )
    }

    await dbConnect()

    // Find the user and mark announcement as seen
    const user = await User.findById(authResult.userId)
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
