import { NextResponse } from 'next/server'
import dbConnect from '../../../../../lib/db/mongoose'
import User from '../../../../../lib/models/User'
import { verifyToken } from '../../../../../lib/utils/jwt'

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic'

export async function POST(req) {
  try {
    // Get token from cookie
    const token = req.cookies.get('auth-token')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Verify token
    const decoded = await verifyToken(token)
    
    if (!decoded || decoded.role !== 'player') {
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
    const user = await User.findById(decoded.userId)
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
