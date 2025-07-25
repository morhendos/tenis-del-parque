import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import dbConnect from '@/lib/db/mongoose'
import User from '@/lib/models/User'

export async function POST(request) {
  try {
    // Get session using NextAuth
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    const body = await request.json()
    
    // Support both single messageId and array of messageIds for backward compatibility
    let messageIds = []
    if (body.messageId) {
      messageIds = [body.messageId]
    } else if (body.messageIds && Array.isArray(body.messageIds)) {
      messageIds = body.messageIds
    } else {
      return NextResponse.json(
        { error: 'Message ID(s) are required' },
        { status: 400 }
      )
    }

    await dbConnect()

    // Find the user and update their seen announcements
    const user = await User.findById(session.user.id)
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Initialize seenAnnouncements if not exists
    if (!user.seenAnnouncements) {
      user.seenAnnouncements = []
    }

    // Add message IDs to seen announcements
    for (const messageId of messageIds) {
      if (!user.seenAnnouncements.includes(messageId)) {
        user.seenAnnouncements.push(messageId)
      }
    }

    // Save the user
    await user.save()

    return NextResponse.json({ 
      success: true,
      seenAnnouncements: user.seenAnnouncements
    })
  } catch (error) {
    console.error('Error marking messages as seen:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
