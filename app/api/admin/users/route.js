import { NextResponse } from 'next/server'
import dbConnect from '../../../../lib/db/mongoose'
import User from '../../../../lib/models/User'
import Player from '../../../../lib/models/Player'
import { verifyAdminAuth } from '../../../../lib/utils/adminAuth'

// GET /api/admin/users - List all users
export async function GET(request) {
  try {
    // Check authentication
    const auth = await verifyAdminAuth(request)
    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: 401 })
    }

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
          path: 'league',
          select: 'name slug'
        }
      })
      .select('-password -resetPasswordToken -activationToken')
      .sort({ createdAt: -1 })

    // Transform data for frontend
    const transformedUsers = users.map(user => ({
      _id: user._id,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      emailVerified: user.emailVerified,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
      player: user.playerId ? {
        _id: user.playerId._id,
        name: user.playerId.name,
        email: user.playerId.email,
        level: user.playerId.level,
        league: user.playerId.league
      } : null
    }))

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
    const auth = await verifyAdminAuth(request)
    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: 401 })
    }

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
