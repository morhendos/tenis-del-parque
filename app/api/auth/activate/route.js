import { NextResponse } from 'next/server'
import dbConnect from '../../../../lib/db/mongoose'
import User from '../../../../lib/models/User'
import Player from '../../../../lib/models/Player'

// Force dynamic rendering for this API route
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
    console.log('🔐 Activation attempt:', {
      tokenLength: token.length,
      decodedLength: decodedToken.length,
      tokenChanged: token !== decodedToken
    })

    // Find user by activation token
    const user = await User.findByActivationToken(decodedToken)
      .populate({
        path: 'playerId',
        select: 'name league season level',
        populate: {
          path: 'league',
          select: 'name slug'
        }
      })

    if (!user) {
      console.log('❌ Token not found or expired:', {
        token: decodedToken,
        timestamp: new Date().toISOString()
      })
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

    // Update linked player status to active
    if (user.playerId) {
      await Player.findByIdAndUpdate(user.playerId, { 
        status: 'active' 
      })
    }

    console.log('✅ Account activated successfully:', {
      email: user.email,
      playerId: user.playerId?._id
    })

    return NextResponse.json({
      success: true,
      message: 'Account activated successfully! You can now log in.',
      user: {
        email: user.email,
        player: user.playerId ? {
          name: user.playerId.name,
          league: user.playerId.league,
          season: user.playerId.season,
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

    // Decode the token (in case it was URL encoded)
    const decodedToken = decodeURIComponent(token)
    console.log('🔍 Token validation attempt:', {
      tokenLength: token.length,
      decodedLength: decodedToken.length,
      tokenChanged: token !== decodedToken
    })

    // Find user by activation token
    const user = await User.findByActivationToken(decodedToken)
      .populate({
        path: 'playerId',
        select: 'name league season level',
        populate: {
          path: 'league',
          select: 'name slug'
        }
      })

    if (!user) {
      console.log('❌ Token validation failed:', {
        token: decodedToken,
        timestamp: new Date().toISOString()
      })
      
      // Create response with no-cache headers
      const response = NextResponse.json(
        { error: 'Invalid or expired activation token' },
        { status: 400 }
      )
      
      // Set headers to prevent caching
      response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
      response.headers.set('Pragma', 'no-cache')
      response.headers.set('Expires', '0')
      
      return response
    }

    if (user.emailVerified) {
      const response = NextResponse.json(
        { error: 'Account is already activated' },
        { status: 400 }
      )
      
      // Set headers to prevent caching
      response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
      response.headers.set('Pragma', 'no-cache')
      response.headers.set('Expires', '0')
      
      return response
    }

    console.log('✅ Token validated successfully:', {
      email: user.email,
      expiresAt: user.activationTokenExpiry
    })

    const response = NextResponse.json({
      success: true,
      user: {
        email: user.email,
        player: user.playerId ? {
          name: user.playerId.name,
          league: user.playerId.league,
          season: user.playerId.season,
          level: user.playerId.level
        } : null
      }
    })
    
    // Set headers to prevent caching
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    
    return response

  } catch (error) {
    console.error('Token validation error:', error)
    
    const response = NextResponse.json(
      { error: 'Failed to validate token' },
      { status: 500 }
    )
    
    // Set headers to prevent caching
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    
    return response
  }
}