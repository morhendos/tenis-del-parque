import { NextResponse } from 'next/server'
import dbConnect from '../../../../lib/db/mongoose'
import User from '../../../../lib/models/User'
import { generateAuthTokens, getCookieOptions } from '../../../../lib/utils/jwt'

export async function POST(request) {
  try {
    await dbConnect()

    const { email, password } = await request.json()

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Find user with password field
    const user = await User.findByEmailWithPassword(email.toLowerCase())

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Check if account is locked
    if (user.isLocked) {
      const lockInfo = user.getLockInfo()
      const remainingMinutes = lockInfo.remainingMinutes
      const timeMessage = remainingMinutes > 1 ? 
        `${remainingMinutes} minutes` : 'less than 1 minute'
      
      return NextResponse.json(
        { 
          error: `Account is locked due to too many failed attempts. Please try again in ${timeMessage}.`,
          lockInfo: {
            remainingMinutes: lockInfo.remainingMinutes,
            attempts: lockInfo.attempts
          }
        },
        { status: 401 }
      )
    }

    // Check if account is active
    if (!user.isActive) {
      return NextResponse.json(
        { error: 'Account is inactive. Please contact support.' },
        { status: 401 }
      )
    }

    // Verify password
    const isValidPassword = await user.comparePassword(password)

    if (!isValidPassword) {
      // Increment login attempts
      await user.incLoginAttempts()
      
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Reset login attempts on successful login
    await user.resetLoginAttempts()

    // Update last login
    user.lastLogin = new Date()
    await user.save()

    // Generate tokens
    const { accessToken, refreshToken } = generateAuthTokens(user)

    // Populate player data if linked
    let playerData = null
    if (user.playerId) {
      await user.populate('playerId')
      playerData = user.playerId
    }

    // Create response
    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        emailVerified: user.emailVerified,
        preferences: user.preferences,
        player: playerData ? {
          id: playerData._id,
          name: playerData.name,
          league: playerData.league,
          level: playerData.level,
          stats: playerData.stats
        } : null
      },
      tokens: {
        accessToken,
        refreshToken
      }
    })

    // Set cookies
    const cookieOptions = getCookieOptions(30 * 24 * 60 * 60) // 30 days
    
    response.cookies.set('auth-token', accessToken, {
      ...cookieOptions,
      maxAge: 24 * 60 * 60 // 1 day for access token
    })
    
    response.cookies.set('refresh-token', refreshToken, cookieOptions)

    return response

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Login failed', details: error.message },
      { status: 500 }
    )
  }
}
