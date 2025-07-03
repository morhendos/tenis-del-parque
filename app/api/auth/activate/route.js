import { NextResponse } from 'next/server'
import dbConnect from '../../../../lib/db/mongoose'
import User from '../../../../lib/models/User'

export async function POST(request) {
  try {
    await dbConnect()

    const { token, password, confirmPassword } = await request.json()

    // Validate input
    if (!token || !password || !confirmPassword) {
      return NextResponse.json(
        { error: 'Token, password, and password confirmation are required' },
        { status: 400 }
      )
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: 'Passwords do not match' },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      )
    }

    // Find user by activation token
    const user = await User.findByActivationToken(token)
      .populate('playerId', 'name league level')

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid or expired activation token' },
        { status: 400 }
      )
    }

    // Check if already activated
    if (user.emailVerified) {
      return NextResponse.json(
        { error: 'Account is already activated' },
        { status: 400 }
      )
    }

    // Update user with new password and activate account
    user.password = password
    user.emailVerified = true
    user.isActive = true
    user.activationToken = undefined
    user.activationTokenExpiry = undefined
    await user.save()

    return NextResponse.json({
      success: true,
      message: 'Account activated successfully! You can now log in.',
      user: {
        email: user.email,
        player: user.playerId ? {
          name: user.playerId.name,
          league: user.playerId.league,
          level: user.playerId.level
        } : null
      }
    })

  } catch (error) {
    console.error('Activation error:', error)
    return NextResponse.json(
      { error: 'Failed to activate account', details: error.message },
      { status: 500 }
    )
  }
}

// GET route to validate token without activation
export async function GET(request) {
  try {
    await dbConnect()

    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      )
    }

    // Find user by activation token
    const user = await User.findByActivationToken(token)
      .populate('playerId', 'name league level')

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid or expired activation token' },
        { status: 400 }
      )
    }

    if (user.emailVerified) {
      return NextResponse.json(
        { error: 'Account is already activated' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      user: {
        email: user.email,
        player: user.playerId ? {
          name: user.playerId.name,
          league: user.playerId.league,
          level: user.playerId.level
        } : null
      }
    })

  } catch (error) {
    console.error('Token validation error:', error)
    return NextResponse.json(
      { error: 'Failed to validate token' },
      { status: 500 }
    )
  }
}