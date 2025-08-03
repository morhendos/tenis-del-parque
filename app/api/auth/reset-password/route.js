import { NextResponse } from 'next/server'
import dbConnect from '@/lib/db/mongoose'
import User from '@/lib/models/User'

export const dynamic = 'force-dynamic'

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

    // Decode the token (in case it was URL encoded)
    const decodedToken = decodeURIComponent(token)
    
    // Find user by reset token
    const user = await User.findByResetToken(decodedToken)

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid or expired reset token' },
        { status: 400 }
      )
    }

    // Check if user is active 
    if (!user.isActive) {
      return NextResponse.json(
        { error: 'Account is inactive' },
        { status: 400 }
      )
    }

    // Update user password and clear reset token
    user.password = password
    user.resetPasswordToken = undefined
    user.resetPasswordExpiry = undefined
    
    // Reset login attempts when password is successfully changed
    user.loginAttempts = 0
    user.lockUntil = undefined
    
    await user.save()

    console.log(`Password successfully reset for user: ${user.email}`)

    return NextResponse.json({
      success: true,
      message: 'Password has been reset successfully'
    })

  } catch (error) {
    console.error('Error in reset password:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}