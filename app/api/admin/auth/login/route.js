import { NextResponse } from 'next/server'
import dbConnect from '../../../../../lib/db/mongoose'
import User from '../../../../../lib/models/User'
import { generateAuthTokens, getCookieOptions } from '../../../../../lib/utils/jwt'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

export async function POST(request) {
  try {
    await dbConnect()

    const { email, password } = await request.json()

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Find admin user with password field
    const user = await User.findByEmailWithPassword(email.toLowerCase())

    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Check if account is locked
    if (user.isLocked) {
      return NextResponse.json(
        { success: false, error: 'Account is locked due to too many failed attempts. Please try again later.' },
        { status: 401 }
      )
    }

    // Check if account is active
    if (!user.isActive) {
      return NextResponse.json(
        { success: false, error: 'Account is inactive. Please contact support.' },
        { status: 401 }
      )
    }

    // Verify password
    const isValidPassword = await user.comparePassword(password)

    if (!isValidPassword) {
      // Increment login attempts
      await user.incLoginAttempts()
      
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
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

    // Create response
    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user._id,
        email: user.email,
        role: user.role
      }
    })

    // Set cookies
    const cookieOptions = getCookieOptions(30 * 24 * 60 * 60) // 30 days
    
    response.cookies.set('admin-token', accessToken, {
      ...cookieOptions,
      maxAge: 24 * 60 * 60 // 1 day for access token
    })
    
    response.cookies.set('admin-refresh-token', refreshToken, cookieOptions)

    return response

  } catch (error) {
    console.error('Admin login error:', error)
    return NextResponse.json(
      { success: false, error: 'Login failed' },
      { status: 500 }
    )
  }
}
