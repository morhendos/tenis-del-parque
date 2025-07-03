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

    const { playerIds } = await request.json()

    if (!playerIds || !Array.isArray(playerIds) || playerIds.length === 0) {
      return NextResponse.json(
        { error: 'Player IDs are required' },
        { status: 400 }
      )
    }

    // Find players without users
    const players = await Player.find({
      _id: { $in: playerIds },
      userId: { $exists: false }
    }).populate('league', 'name')

    if (players.length === 0) {
      return NextResponse.json(
        { error: 'No valid players found to invite' },
        { status: 400 }
      )
    }

    const invitations = []
    const errors = []

    for (const player of players) {
      try {
        // Check if user already exists with this email
        const existingUser = await User.findOne({ email: player.email.toLowerCase() })
        if (existingUser) {
          errors.push(`User already exists for ${player.email}`)
          continue
        }

        // Create user account with temporary password
        const user = new User({
          email: player.email.toLowerCase(),
          password: Math.random().toString(36).substring(2, 15), // Temporary password
          role: 'player',
          playerId: player._id,
          isActive: true,
          emailVerified: false
        })

        // Generate activation token
        const activationToken = user.generateActivationToken()
        await user.save()

        // Update player with userId
        player.userId = user._id
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
          whatsappMessage,
          activationToken: process.env.NODE_ENV === 'development' ? activationToken : undefined
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
      invitations: process.env.NODE_ENV === 'development' ? invitations : undefined,
      errors: errors.length > 0 ? errors : undefined
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
