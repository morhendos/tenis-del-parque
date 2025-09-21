import { NextResponse } from 'next/server'
import dbConnect from '../../../../lib/db/mongoose'
import User from '../../../../lib/models/User'
import Player from '../../../../lib/models/Player'
import { requireAdmin } from '../../../../lib/auth/apiAuth'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

// GET /api/admin/users - List all users
export async function GET(request) {
  try {
    // Check authentication
    const { session, error } = await requireAdmin(request)
    if (error) return error

    await dbConnect()

    const { searchParams } = new URL(request.url)
    const role = searchParams.get('role')
    const status = searchParams.get('status')
    
    // Build query
    const query = {}
    if (role && role !== 'all') {
      query.role = role
    }
    
    if (status && status !== 'all') {
      if (status === 'active') {
        query.isActive = true
        query.emailVerified = true
      } else if (status === 'inactive') {
        query.isActive = false
      } else if (status === 'unverified') {
        query.emailVerified = false
      }
    }

    // Find users with player data populated
    const users = await User.find(query)
      .populate({
        path: 'playerId',
        populate: {
          path: 'registrations.league',
          select: 'name slug'
        }
      })
      .select('-password -resetPasswordToken -activationToken')
      .sort({ createdAt: -1 })

    // Transform data for frontend
    const transformedUsers = users.map(user => {
      // Prepare player data with new structure
      let playerData = null
      
      if (user.playerId) {
        // Get the most recent registration or the first one
        const registration = user.playerId.registrations && user.playerId.registrations.length > 0
          ? user.playerId.registrations[user.playerId.registrations.length - 1]
          : null
        
        playerData = {
          _id: user.playerId._id,
          name: user.playerId.name,
          email: user.playerId.email,
          // Handle new registration structure
          level: registration ? registration.level : null,
          league: registration && registration.league ? {
            _id: registration.league._id,
            name: registration.league.name,
            slug: registration.league.slug
          } : null,
          // Include registration status if available
          status: registration ? registration.status : null,
          // Include all registrations for reference
          registrations: user.playerId.registrations ? user.playerId.registrations.map(reg => ({
            league: reg.league ? {
              _id: reg.league._id,
              name: reg.league.name,
              slug: reg.league.slug
            } : null,
            season: reg.season,
            level: reg.level,
            status: reg.status,
            registeredAt: reg.registeredAt
          })) : []
        }
      }
      
      return {
        _id: user._id,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        emailVerified: user.emailVerified,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
        // Lock information
        loginAttempts: user.loginAttempts || 0,
        lockUntil: user.lockUntil,
        isLocked: user.isLocked,
        player: playerData
      }
    })

    return NextResponse.json({ 
      success: true, 
      users: transformedUsers,
      total: transformedUsers.length 
    })

  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}

// POST /api/admin/users - Create new user (admin only)
export async function POST(request) {
  try {
    // Check authentication
    const { session, error } = await requireAdmin(request)
    if (error) return error

    await dbConnect()

    const { email, password, role } = await request.json()

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      )
    }

    if (role !== 'admin' && role !== 'player') {
      return NextResponse.json(
        { error: 'Invalid role' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() })
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      )
    }

    // Create new user
    const user = new User({
      email: email.toLowerCase(),
      password,
      role,
      isActive: true,
      emailVerified: role === 'admin' // Auto-verify admin users
    })

    await user.save()

    // If creating a player user, check if there's a matching player record
    if (role === 'player') {
      const player = await Player.findOne({ email: email.toLowerCase() })
      if (player) {
        user.playerId = player._id
        await user.save()
        
        // Update player with userId
        player.userId = user._id
        await player.save()
      }
    }

    return NextResponse.json({
      success: true,
      message: 'User created successfully',
      user: {
        _id: user._id,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        emailVerified: user.emailVerified
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    )
  }
}
