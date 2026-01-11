import { NextResponse } from 'next/server'
import dbConnect from '../../../../lib/db/mongoose'
import Player from '../../../../lib/models/Player'
import User from '../../../../lib/models/User'
import { requirePlayer } from '../../../../lib/auth/apiAuth'

// Import League model to ensure it's registered
import '../../../../lib/models/League'

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic'

export async function GET(request) {
  try {
    // Use new NextAuth authentication system
    const { session, error } = await requirePlayer(request)
    if (error) return error

    await dbConnect()

    // Get user details
    const user = await User.findById(session.user.id).select('-password')
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Get player details by email using new structure
    const player = await Player.findOne({ email: user.email })
      .populate('registrations.league', 'name slug location season status seasonConfig currentRound playoffConfig')

    if (!player) {
      return NextResponse.json(
        { error: 'Player profile not found' },
        { status: 404 }
      )
    }

    // Get the most recent/active registration for backward compatibility
    const activeRegistration = player.registrations && player.registrations.length > 0 
      ? player.registrations[0] // Use first registration as primary
      : null

    return NextResponse.json({
      player: {
        _id: player._id,
        name: player.name,
        email: player.email,
        phone: player.whatsapp, // Map whatsapp field to phone for frontend
        whatsapp: player.whatsapp,
        // Global ELO rating
        eloRating: player.eloRating || 1200,
        highestElo: player.highestElo || player.eloRating || 1200,
        lowestElo: player.lowestElo || player.eloRating || 1200,
        // Use data from active registration for backward compatibility
        level: activeRegistration?.level || 'intermediate',
        league: activeRegistration?.league || null,
        season: activeRegistration?.season || null,
        status: activeRegistration?.status || 'active',
        stats: {
          // Global ELO (not from registration)
          eloRating: player.eloRating || 1200,
          // These will be calculated from matches in the frontend
          matchesPlayed: 0,
          matchesWon: 0,
          totalPoints: 0
        },
        wildCards: activeRegistration?.wildCards || { total: 3, used: 0, history: [] },
        emergencyContact: player.emergencyContact,
        registeredAt: activeRegistration?.registeredAt || player.createdAt,
        createdAt: player.createdAt,
        // Include all registrations for multi-league support
        registrations: player.registrations || [],
        // Include player preferences (set during registration)
        preferences: player.preferences || { preferredLanguage: 'es' }
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
    // Use new NextAuth authentication system
    const { session, error } = await requirePlayer(request)
    if (error) return error

    await dbConnect()

    // Get request body
    const body = await request.json()
    const { name, email, phone, preferences } = body

    // Get current user
    const user = await User.findById(session.user.id)
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
      // Ensure user.preferences exists with proper defaults
      if (!user.preferences) {
        user.preferences = {
          language: 'es',
          hasSeenWelcomeModal: false,
          notifications: {
            email: true,
            matchReminders: true,
            resultReminders: true
          }
        }
      }
      
      // Ensure notifications object exists with defaults
      if (!user.preferences.notifications) {
        user.preferences.notifications = {
          email: true,
          matchReminders: true,
          resultReminders: true
        }
      }
      
      // Handle nested preferences properly
      if (preferences.notifications) {
        user.preferences.notifications = {
          ...user.preferences.notifications,
          ...preferences.notifications
        }
      }
      
      // Handle other preference fields
      Object.keys(preferences).forEach(key => {
        if (key !== 'notifications') {
          user.preferences[key] = preferences[key]
        }
      })
    }

    // Save both documents
    await Promise.all([
      player.save(),
      user.save()
    ])

    // Return only updated fields - no need to populate league for profile updates
    return NextResponse.json({
      success: true,
      player: {
        _id: player._id,
        name: player.name,
        email: player.email,
        phone: player.whatsapp,
        whatsapp: player.whatsapp
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
