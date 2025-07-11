import { NextResponse } from 'next/server'
import dbConnect from '../../../../../lib/db/mongoose'
import User from '../../../../../lib/models/User'
import Player from '../../../../../lib/models/Player'

// GET /api/admin/users/[id] - Get single user
export async function GET(request, { params }) {
  try {
    await dbConnect()

    const user = await User.findById(params.id)
      .populate({
        path: 'playerId',
        populate: {
          path: 'league',
          select: 'name slug'
        }
      })
      .select('-password -resetPasswordToken -activationToken')

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      user: {
        _id: user._id,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        emailVerified: user.emailVerified,
        lastLogin: user.lastLogin,
        loginAttempts: user.loginAttempts,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        player: user.playerId ? {
          _id: user.playerId._id,
          name: user.playerId.name,
          email: user.playerId.email,
          level: user.playerId.level,
          league: user.playerId.league,
          stats: user.playerId.stats
        } : null
      }
    })

  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    )
  }
}

// PATCH /api/admin/users/[id] - Update user
export async function PATCH(request, { params }) {
  try {
    await dbConnect()

    const updates = await request.json()
    
    // Find user
    const user = await User.findById(params.id)
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Update allowed fields
    const allowedUpdates = ['isActive', 'emailVerified', 'role']
    const updateData = {}
    
    for (const field of allowedUpdates) {
      if (field in updates) {
        updateData[field] = updates[field]
      }
    }

    // Reset login attempts if reactivating user
    if (updateData.isActive === true && !user.isActive) {
      updateData.loginAttempts = 0
      updateData.lockUntil = null
    }

    // Handle manual unlock request
    if (updates.unlockAccount === true) {
      await user.unlockAccount()
      return NextResponse.json({
        success: true,
        message: 'Account unlocked successfully',
        user: {
          _id: user._id,
          email: user.email,
          role: user.role,
          isActive: user.isActive,
          emailVerified: user.emailVerified,
          loginAttempts: 0,
          isLocked: false
        }
      })
    }

    // Update user
    Object.assign(user, updateData)
    await user.save()

    return NextResponse.json({
      success: true,
      message: 'User updated successfully',
      user: {
        _id: user._id,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        emailVerified: user.emailVerified
      }
    })

  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/users/[id] - Delete user
export async function DELETE(request, { params }) {
  try {
    await dbConnect()

    const user = await User.findById(params.id)
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Don't delete admin users if they're the last admin
    if (user.role === 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin' })
      if (adminCount <= 1) {
        return NextResponse.json(
          { error: 'Cannot delete the last admin user' },
          { status: 400 }
        )
      }
    }

    // If user has a linked player, unlink it
    if (user.playerId) {
      await Player.findByIdAndUpdate(user.playerId, {
        $unset: { userId: 1 }
      })
    }

    // Delete user
    await user.deleteOne()

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    )
  }
}

// POST /api/admin/users/[id]/reset-password - Send password reset email
export async function POST(request, { params }) {
  if (request.url.includes('/reset-password')) {
    try {
      await dbConnect()

      const user = await User.findById(params.id)
      if (!user) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        )
      }

      // Generate reset token
      const resetToken = user.generatePasswordResetToken()
      await user.save()

      // TODO: Send email with reset link
      // For now, just log the token
      console.log(`Password reset token for ${user.email}: ${resetToken}`)
      
      // In production, you would send an email here
      // await sendPasswordResetEmail(user.email, resetToken)

      return NextResponse.json({
        success: true,
        message: 'Password reset email sent',
        // Remove this in production - only for development
        resetToken: process.env.NODE_ENV === 'development' ? resetToken : undefined
      })

    } catch (error) {
      console.error('Error sending reset email:', error)
      return NextResponse.json(
        { error: 'Failed to send reset email' },
        { status: 500 }
      )
    }
  }
  
  // If not a reset-password request, return 405
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  )
}
