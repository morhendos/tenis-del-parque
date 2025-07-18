import { NextResponse } from 'next/server'
import { requirePlayer } from '@/lib/auth/apiAuth'
import dbConnect from '@/lib/db/mongoose'
import User from '@/lib/models/User'

export async function POST(request) {
  try {
    // Use requirePlayer helper for authentication
    const { session, error } = await requirePlayer(request)
    if (error) return error
    
    const { messageIds } = await request.json()
    
    if (!messageIds || !Array.isArray(messageIds)) {
      return NextResponse.json(
        { error: 'Message IDs are required' },
        { status: 400 }
      )
    }

    await dbConnect()

    // Find the user and update their seen announcements
    const user = await User.findById(session.userId)
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Initialize preferences if not exists
    if (!user.preferences) {
      user.preferences = {}
    }
    if (!user.preferences.seenAnnouncements) {
      user.preferences.seenAnnouncements = []
    }

    // Add message IDs to seen announcements
    for (const messageId of messageIds) {
      if (!user.preferences.seenAnnouncements.includes(messageId)) {
        user.preferences.seenAnnouncements.push(messageId)
      }
    }

    // Save the user
    await user.save()

    return NextResponse.json({ 
      success: true,
      seenAnnouncements: user.preferences.seenAnnouncements
    })
  } catch (error) {
    console.error('Error marking messages as seen:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
