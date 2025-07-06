import { NextResponse } from 'next/server'
import dbConnect from '../../../../../lib/db/mongoose'
import User from '../../../../../lib/models/User'
import Player from '../../../../../lib/models/Player'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

// POST /api/admin/users/invite - Send invitations to players
export async function POST(request) {
  try {
    await dbConnect()

    const { playerIds, forceReinvite = false } = await request.json()

    if (!playerIds || !Array.isArray(playerIds) || playerIds.length === 0) {
      return NextResponse.json(
        { error: 'Player IDs are required' },
        { status: 400 }
      )
    }

    // Debug: Check what we received
    console.log('🔍 Invitation request for player IDs:', playerIds)
    
    // Find ALL requested players first for debugging
    const allRequestedPlayers = await Player.find({
      _id: { $in: playerIds }
    }).populate('league', 'name').populate('userId', 'email role')

    console.log('📊 All requested players:', allRequestedPlayers.map(p => ({
      id: p._id,
      name: p.name,
      email: p.email,
      status: p.status,
      hasUserId: !!p.userId,
      userIdValue: p.userId,
      userDetails: p.userId ? { 
        id: p.userId._id,
        email: p.userId.email, 
        role: p.userId.role,
        isActive: p.userId.isActive,
        emailVerified: p.userId.emailVerified
      } : null
    })))

    // Also check if any users exist with these emails
    const playerEmails = allRequestedPlayers.map(p => p.email?.toLowerCase()).filter(Boolean)
    const existingUsers = await User.find({ 
      email: { $in: playerEmails } 
    }).select('email _id isActive emailVerified role')
    
    console.log('📧 Existing users with these emails:', existingUsers)

    // Find players without users (or force re-invite)
    let players
    if (forceReinvite) {
      // If force re-invite, get all requested players
      players = await Player.find({
        _id: { $in: playerIds }
      }).populate('league', 'name').populate('userId')
      
      console.log('🔄 Force re-invite mode: including players with existing users')
    } else {
      // Normal mode: only players without users
      players = await Player.find({
        _id: { $in: playerIds },
        $or: [
          { userId: { $exists: false } },
          { userId: null }
        ]
      }).populate('league', 'name')
    }

    console.log('✅ Valid players for invitation:', players.map(p => ({
      id: p._id,
      name: p.name,
      email: p.email,
      status: p.status
    })))

    if (players.length === 0) {
      const invalidReasons = allRequestedPlayers.map(p => 
        `${p.name} (${p.email}): ${p.userId ? 'Already has user account' : 'Unknown issue'}`
      )
      
      return NextResponse.json(
        { 
          error: 'No valid players found to invite',
          details: 'All selected players already have user accounts',
          invalidPlayers: invalidReasons
        },
        { status: 400 }
      )
    }

    const invitations = []
    const errors = []

    for (const player of players) {
      try {
        // Check if user already exists with this email
        let existingUser = await User.findOne({ email: player.email.toLowerCase() })
        
        if (existingUser && !forceReinvite) {
          errors.push(`User already exists for ${player.email}`)
          continue
        }
        
        // Handle existing user for re-invite or create new user
        let user
        let activationToken
        
        if (existingUser && forceReinvite) {
          console.log(`🔄 Re-inviting existing user: ${player.email}`)
          user = existingUser
          
          // Reset activation if needed
          if (!user.emailVerified) {
            activationToken = user.generateActivationToken()
            console.log(`📧 Regenerated activation token for ${player.email}`)
          } else {
            // User is already verified, generate new token anyway for re-invite
            activationToken = user.generateActivationToken()
            user.emailVerified = false // Reset verification status
            console.log(`📧 Generated new activation token for verified user: ${player.email}`)
          }
        } else {
          console.log(`✨ Creating new user for: ${player.email}`)
          
          // Create user account with temporary password
          user = new User({
            email: player.email.toLowerCase(),
            password: Math.random().toString(36).substring(2, 15), // Temporary password
            role: 'player',
            playerId: player._id,
            isActive: true,
            emailVerified: false
          })

          // Generate activation token
          activationToken = user.generateActivationToken()
        }
        
        await user.save()

        // Update player with userId and change status to confirmed
        player.userId = user._id
        player.status = 'confirmed' // Player has been invited
        await player.save()

        // Generate activation link
        const activationLink = `${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/activate?token=${activationToken}`
        
        // Generate WhatsApp message and link
        const whatsappMessage = `🎾 ¡Hola ${player.name}! 

Tu cuenta de usuario para la Liga de Tenis está lista. 

✅ Activa tu cuenta aquí: ${activationLink}

Una vez activada podrás:
• Ver tus partidos
• Consultar tu ranking 
• Acceder a tu dashboard personal

¡Nos vemos en la pista! 🏆`

        const whatsappLink = `https://wa.me/${player.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(whatsappMessage)}`

        invitations.push({
          playerId: player._id,
          playerName: player.name,
          email: player.email,
          whatsapp: player.whatsapp,
          userId: user._id,
          activationLink,
          whatsappLink,
          whatsappMessage
          // activationToken excluded from response for security
        })

        console.log(`\n📱 WhatsApp invitation for ${player.name}:`)
        console.log(`WhatsApp: ${player.whatsapp}`)
        console.log(`Link: ${whatsappLink}`)
        console.log(`Activation: ${activationLink}`)

      } catch (error) {
        console.error(`Error inviting player ${player.email}:`, error)
        errors.push(`Failed to invite ${player.email}: ${error.message}`)
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully sent ${invitations.length} invitations`,
      sent: invitations.length,
      failed: errors.length,
      invitations: invitations, // Always send invitations data for frontend popup
      errors: errors.length > 0 ? errors : undefined,
      // Only include sensitive activation tokens in development
      debug: process.env.NODE_ENV === 'development' ? {
        detailedInvitations: invitations.map(inv => ({
          ...inv,
          activationToken: inv.activationToken
        }))
      } : undefined
    })

  } catch (error) {
    console.error('Error sending invitations:', error)
    return NextResponse.json(
      { error: 'Failed to send invitations' },
      { status: 500 }
    )
  }
}

// GET /api/admin/users/invite - Get pending invitations
export async function GET(request) {
  try {
    await dbConnect()

    // Find users with pending activation
    const pendingUsers = await User.find({
      emailVerified: false,
      role: 'player',
      activationTokenExpiry: { $gt: new Date() }
    })
    .populate({
      path: 'playerId',
      populate: {
        path: 'league',
        select: 'name slug'
      }
    })
    .select('-password -resetPasswordToken -activationToken')
    .sort({ createdAt: -1 })

    const invitations = pendingUsers.map(user => ({
      _id: user._id,
      email: user.email,
      createdAt: user.createdAt,
      expiresAt: user.activationTokenExpiry,
      player: user.playerId ? {
        name: user.playerId.name,
        league: user.playerId.league,
        level: user.playerId.level
      } : null
    }))

    return NextResponse.json({
      success: true,
      invitations,
      total: invitations.length
    })

  } catch (error) {
    console.error('Error fetching invitations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch invitations' },
      { status: 500 }
    )
  }
}
