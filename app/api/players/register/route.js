import mongoose from 'mongoose'
import dbConnect from '../../../../lib/db/mongoose'
import Player from '../../../../lib/models/Player'
import League from '../../../../lib/models/League'
import User from '../../../../lib/models/User'
import { generateWelcomeEmail } from '../../../../lib/email/templates/welcomeEmail'
import { sendEmail } from '../../../../lib/email/resend'

export async function POST(request) {
  try {
    // Connect to database
    await dbConnect()

    // Parse request body
    const body = await request.json()
    const { 
      name, 
      email, 
      whatsapp, 
      level, 
      language = 'es',
      leagueId,
      leagueSlug,
      season = '688f5d51c94f8e3b3cbfd87b' // Summer 2025 Season ObjectId
    } = body

    // Basic validation
    if (!name || !email || !whatsapp || !level) {
      return Response.json(
        { 
          success: false, 
          error: language === 'es' 
            ? 'Todos los campos son obligatorios' 
            : 'All fields are required' 
        },
        { status: 400 }
      )
    }

    // Validate league exists
    let league
    if (leagueId) {
      league = await League.findById(leagueId)
    } else if (leagueSlug) {
      league = await League.findOne({ 
        slug: leagueSlug, 
        status: { $in: ['active', 'coming_soon'] } 
      })
    } else {
      // Default to Sotogrande if no league specified
      league = await League.findOne({ slug: 'sotogrande', status: 'active' })
    }

    if (!league) {
      return Response.json(
        { 
          success: false, 
          error: language === 'es'
            ? 'Liga no encontrada o no activa'
            : 'League not found or not active'
        },
        { status: 400 }
      )
    }

    // Get additional metadata
    const headers = request.headers
    const userAgent = headers.get('user-agent') || ''
    const ipAddress = headers.get('x-forwarded-for') || 
                     headers.get('x-real-ip') || 
                     'unknown'

    // Check if player already exists (by email)
    let player = await Player.findOne({ email: email.toLowerCase() })
    
    let isNewPlayer = false
    let isExistingUser = false
    let hasUserAccount = false
    let activationLink = null
    let user = null
    
    if (player) {
      // EXISTING PLAYER - check if already registered for this league/season
      isExistingUser = true
      
      const existingRegistration = player.getLeagueRegistration(league._id, season)
      
      if (existingRegistration) {
        return Response.json(
          { 
            success: false, 
            error: language === 'es'
              ? 'Ya estás registrado en esta liga y temporada'
              : 'You are already registered for this league and season'
          },
          { status: 409 }
        )
      }
      
      // Add new league registration to existing player
      try {
        await player.addLeagueRegistration(
          league._id, 
          new mongoose.Types.ObjectId(season), 
          level, 
          league.status === 'coming_soon' ? 'waiting' : 'pending'
        )
        
        console.log(`Existing player ${email} registered for new league: ${league.name} (${season})`)
        
      } catch (registrationError) {
        return Response.json(
          { 
            success: false, 
            error: language === 'es'
              ? 'Error al registrarte en esta liga'
              : 'Error registering for this league'
          },
          { status: 400 }
        )
      }
      
      // Check if player has a user account
      if (player.userId) {
        user = await User.findById(player.userId)
        if (user && user.emailVerified) {
          hasUserAccount = true
          console.log(`Player ${email} already has an active user account`)
        }
      }
      
    } else {
      // NEW PLAYER - create new player with first league registration
      isNewPlayer = true
      
      const initialElo = getInitialEloByLevel(level)
      
      player = new Player({
        name,
        email: email.toLowerCase(),
        whatsapp,
        registrations: [{
          league: league._id,
          season: new mongoose.Types.ObjectId(season),
          level: level,
          status: league.status === 'coming_soon' ? 'waiting' : 'pending',
          stats: {
            eloRating: initialElo,
            highestElo: initialElo,
            lowestElo: initialElo
          }
        }],
        preferences: {
          preferredLanguage: language
        },
        metadata: {
          source: 'web',
          userAgent,
          ipAddress
        }
      })

      // Save new player
      await player.save()
      console.log(`New player ${email} registered for league: ${league.name} (${season})`)
    }

    // Create or update user account if needed
    if (!hasUserAccount) {
      // Check if user exists but not linked to player
      user = await User.findOne({ email: email.toLowerCase() })
      
      if (!user) {
        // Create new user account with temporary password
        console.log(`Creating new user account for ${email}`)
        
        user = new User({
          email: email.toLowerCase(),
          password: 'temporary_' + Math.random().toString(36).substring(2, 15), // Temporary password
          role: 'player',
          playerId: player._id,
          isActive: true,
          emailVerified: false
        })
        
        // Generate activation token
        const activationToken = await user.generateActivationToken()
        await user.save()
        
        // Update player with userId
        player.userId = user._id
        player.status = 'confirmed' // Player has account now
        await player.save()
        
        // Generate activation link
        const baseUrl = process.env.NEXT_PUBLIC_URL || 'https://tenisdp.es'
        activationLink = `${baseUrl}/activate?token=${encodeURIComponent(activationToken)}`
        
        console.log(`Generated activation link for ${email}: ${activationLink}`)
        
      } else if (!user.emailVerified) {
        // User exists but not verified - regenerate activation token
        console.log(`User exists but not verified, regenerating activation token for ${email}`)
        
        const activationToken = await user.generateActivationToken()
        
        // Link user to player if not already linked
        if (!user.playerId) {
          user.playerId = player._id
        }
        await user.save()
        
        // Update player with userId if not already set
        if (!player.userId) {
          player.userId = user._id
          player.status = 'confirmed'
          await player.save()
        }
        
        // Generate activation link
        const baseUrl = process.env.NEXT_PUBLIC_URL || 'https://tenisdp.es'
        activationLink = `${baseUrl}/activate?token=${encodeURIComponent(activationToken)}`
        
        console.log(`Regenerated activation link for ${email}: ${activationLink}`)
        
      } else {
        // User is already verified
        hasUserAccount = true
        console.log(`User ${email} already has a verified account`)
        
        // Link user to player if not already linked
        if (!user.playerId) {
          user.playerId = player._id
          await user.save()
        }
        if (!player.userId) {
          player.userId = user._id
          player.status = 'active'
          await player.save()
        }
      }
    }

    // Update league stats
    if (league.status === 'coming_soon') {
      await League.findByIdAndUpdate(league._id, {
        $inc: { 'waitingListCount': 1 }
      })
    } else {
      await League.findByIdAndUpdate(league._id, {
        $inc: { 'stats.totalPlayers': 1 }
      })
    }

    // Get the registration we just created
    const registration = player.getLeagueRegistration(league._id, season)

    // Send welcome email with activation link
    try {
      // Get WhatsApp group info if available
      const whatsappGroupInfo = league.getWhatsAppGroupInfo ? league.getWhatsAppGroupInfo() : null

      // Generate email content with activation link
      const emailData = generateWelcomeEmail(
        {
          playerName: player.name,
          playerEmail: player.email,
          playerWhatsApp: player.whatsapp,
          playerLevel: registration.level,
          language: language || 'es',
          hasUserAccount: hasUserAccount,
          activationLink: activationLink, // Will be null if user already has verified account
          isExistingPlayer: !isNewPlayer
        },
        {
          leagueName: league.name,
          leagueStatus: league.status,
          expectedStartDate: league.seasonConfig?.startDate || league.expectedLaunchDate,
          whatsappGroupLink: whatsappGroupInfo?.inviteLink || null,
          shareUrl: `${process.env.NEXT_PUBLIC_URL || 'https://tenisdp.es'}/${language === 'en' ? 'en/signup' : 'es/registro'}/${league.slug}`
        },
        {
          unsubscribeUrl: `${process.env.NEXT_PUBLIC_URL || 'https://tenisdp.es'}/unsubscribe?email=${encodeURIComponent(player.email)}`,
          loginUrl: `${process.env.NEXT_PUBLIC_URL || 'https://tenisdp.es'}/login`
        }
      )

      // Send the email
      const emailResult = await sendEmail({
        to: player.email,
        subject: emailData.subject,
        html: emailData.html,
        text: emailData.text
      })

      if (emailResult.success) {
        console.log(`Welcome email sent to ${player.email} ${activationLink ? 'with activation link' : 'with login link'}`)
      } else {
        console.error(`Failed to send welcome email to ${player.email}:`, emailResult.error)
      }

    } catch (emailError) {
      console.error('Error sending welcome email:', emailError)
      // Don't fail registration if email fails - just log it
    }

    // Customize success message
    let successMessage
    if (activationLink) {
      successMessage = language === 'es'
        ? '¡Registro exitoso! Te hemos enviado un email con el enlace para crear tu contraseña.'
        : 'Registration successful! We\'ve sent you an email with a link to create your password.'
    } else if (hasUserAccount) {
      successMessage = language === 'es'
        ? isNewPlayer 
          ? '¡Bienvenido! Ya tienes una cuenta activa. Puedes acceder en cualquier momento.'
          : '¡Te has registrado en una nueva liga! Ya tienes una cuenta, puedes acceder en cualquier momento.'
        : isNewPlayer
          ? 'Welcome! You already have an active account. You can login anytime.'
          : 'You\'ve registered for a new league! You already have an account, you can login anytime.'
    } else {
      successMessage = language === 'es'
        ? '¡Registro exitoso! Revisa tu email para activar tu cuenta.'
        : 'Registration successful! Check your email to activate your account.'
    }

    // Return success response with account info
    const whatsappGroupInfo = league.getWhatsAppGroupInfo ? league.getWhatsAppGroupInfo() : null
    
    return Response.json(
      {
        success: true,
        message: successMessage,
        isNewPlayer,
        isExistingUser,
        hasUserAccount,
        hasActivationLink: !!activationLink,
        player: {
          id: player._id,
          name: player.name,
          email: player.email,
          totalLeagueRegistrations: player.registrations.length,
          currentRegistration: {
            level: registration.level,
            status: registration.status,
            registeredAt: registration.registeredAt
          },
          league: {
            id: league._id,
            name: league.name,
            slug: league.slug,
            status: league.status,
            whatsappGroup: whatsappGroupInfo
          },
          accountStatus: activationLink ? 'pending_activation' : (hasUserAccount ? 'active' : 'no_account')
        }
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('Registration error:', error)

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message)
      return Response.json(
        { 
          success: false, 
          error: errors[0] || 'Validation error',
          errors: errors
        },
        { status: 400 }
      )
    }

    // Handle MongoDB duplicate key errors
    if (error.code === 11000) {
      // Check if it's email duplication (shouldn't happen with our new logic)
      if (error.keyPattern?.email) {
        return Response.json(
          { 
            success: false, 
            error: 'Email already exists - this should not happen, please contact support'
          },
          { status: 409 }
        )
      }
    }

    // Handle other errors
    return Response.json(
      { 
        success: false, 
        error: 'Internal server error. Please try again later.' 
      },
      { status: 500 }
    )
  }
}

// Helper function (should match the one in Player model)
function getInitialEloByLevel(level) {
  const eloRatings = {
    'beginner': 1180,
    'intermediate': 1200,
    'advanced': 1250
  }
  return eloRatings[level] || 1200
}

// GET method to check API health and get stats
export async function GET() {
  try {
    await dbConnect()
    
    // Get stats for all leagues
    const leagues = await League.find({ status: { $in: ['active', 'coming_soon'] } })
    const stats = {}
    
    for (const league of leagues) {
      // Count unique players registered for this league (using new aggregation)
      const playerCount = await Player.countDocuments({
        'registrations.league': league._id
      })
      
      // Count users with accounts
      const playersWithAccounts = await Player.countDocuments({
        'registrations.league': league._id,
        userId: { $exists: true, $ne: null }
      })
      
      // Get WhatsApp group info if available
      const whatsappGroupInfo = league.getWhatsAppGroupInfo ? league.getWhatsAppGroupInfo() : null
      
      stats[league.slug] = {
        name: league.name,
        status: league.status,
        totalPlayers: league.status === 'active' ? playerCount : 0,
        waitingList: league.status === 'coming_soon' ? playerCount : 0,
        playersWithAccounts,
        hasWhatsAppGroup: !!whatsappGroupInfo
      }
    }
    
    // Get total unique players across all leagues
    const totalUniquePlayers = await Player.countDocuments({})
    
    // Get total users with accounts
    const totalUsersWithAccounts = await User.countDocuments({ role: 'player' })
    const totalVerifiedAccounts = await User.countDocuments({ role: 'player', emailVerified: true })
    
    // Get total registrations across all leagues
    const totalRegistrations = await Player.aggregate([
      { $unwind: '$registrations' },
      { $count: 'total' }
    ])
    
    return Response.json({
      success: true,
      message: 'Player registration API with automatic account creation',
      totalUniquePlayers,
      totalUsersWithAccounts,
      totalVerifiedAccounts,
      totalRegistrations: totalRegistrations[0]?.total || 0,
      stats,
      emailConfig: {
        provider: 'Resend',
        contactEmail: 'info@tenisdp.es',
        contactPhone: '+34 652 714 328',
        website: 'tenisdp.es',
        features: ['automatic_account_creation', 'instant_activation_links', 'welcome_emails']
      }
    })
  } catch (error) {
    return Response.json(
      { 
        success: false, 
        error: 'Database connection error' 
      },
      { status: 500 }
    )
  }
}
