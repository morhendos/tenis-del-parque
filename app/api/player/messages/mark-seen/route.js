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
    
    const { messageIds } = await request.json()
    
    if (!messageIds || !Array.isArray(messageIds)) {
      return NextResponse.json(
        { error: 'Message IDs are required' },
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
