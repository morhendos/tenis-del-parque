import { NextResponse } from 'next/server'
import dbConnect from '../../../../lib/db/mongoose'
import Player from '../../../../lib/models/Player'
import User from '../../../../lib/models/User'
import { verifyToken } from '../../../../lib/utils/jwt'

// Import League model to ensure it's registered
import '../../../../lib/models/League'

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic'

export async function GET(request) {
  try {
    // Get token from cookie
    const token = request.cookies.get('auth-token')?.value

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

    await dbConnect()

    // Get user details
    const user = await User.findById(decoded.userId).select('-password')
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Get player details by email
    const player = await Player.findOne({ email: user.email })
      .populate('league', 'name slug location')
      .populate('matchHistory.opponent', 'name')

    if (!player) {
      return NextResponse.json(
        { error: 'Player profile not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      player: {
        _id: player._id,
        name: player.name,
        email: player.email,
        phone: player.whatsapp, // Map whatsapp field to phone for frontend
        whatsapp: player.whatsapp,
        level: player.level,
        league: player.league,
        season: player.season,
        status: player.status,
        stats: player.stats,
        wildCards: player.wildCards,
        emergencyContact: player.emergencyContact,
        registeredAt: player.registeredAt,
        createdAt: player.createdAt
      },
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        preferences: user.preferences
      }
    })
  } catch (error) {
    console.error('Error fetching player profile:', error)
    return NextResponse.json(
      { error: 'Failed to fetch player profile' },
      { status: 500 }
    )
  }
}

export async function PUT(request) {
  try {
    // Get token from cookie
    const token = request.cookies.get('auth-token')?.value

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

    await dbConnect()

    // Get request body
    const body = await request.json()
    const { name, email, phone, preferences } = body

    // Get current user
    const user = await User.findById(decoded.userId)
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Get current player
    const player = await Player.findOne({ email: user.email })
    if (!player) {
      return NextResponse.json(
        { error: 'Player profile not found' },
        { status: 404 }
      )
    }

    // Update player fields
    if (name) player.name = name
    if (phone) player.whatsapp = phone // Save phone to whatsapp field

    // Update user fields
    if (email && email !== user.email) {
      // Check if new email is already taken
      const existingUser = await User.findOne({ email: email.toLowerCase() })
      if (existingUser && existingUser._id.toString() !== user._id.toString()) {
        return NextResponse.json(
          { error: 'Email is already taken' },
          { status: 400 }
        )
      }
      
      // Update email in both user and player
      user.email = email.toLowerCase()
      player.email = email.toLowerCase()
    }

    if (preferences) {
      user.preferences = {
        ...user.preferences,
        ...preferences
      }
    }

    // Save both documents
    await Promise.all([
      player.save(),
      user.save()
    ])

    // Return updated data (populate league info)
    await player.populate('league', 'name slug')

    return NextResponse.json({
      player: {
        _id: player._id,
        name: player.name,
        email: player.email,
        phone: player.whatsapp, // Map whatsapp field to phone for frontend
        whatsapp: player.whatsapp,
        level: player.level,
        league: player.league,
        season: player.season,
        status: player.status,
        stats: player.stats,
        wildCards: player.wildCards,
        emergencyContact: player.emergencyContact,
        registeredAt: player.registeredAt,
        createdAt: player.createdAt
      },
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        preferences: user.preferences
      }
    })

  } catch (error) {
    console.error('Error updating player profile:', error)
    return NextResponse.json(
      { error: 'Failed to update player profile' },
      { status: 500 }
    )
  }
}
