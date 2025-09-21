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
      season = 'summer-2025'
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
          season, 
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
          season: season,
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

    // Check if player has a user account
    if (player.userId) {
      // Check if the user actually exists
      const user = await User.findById(player.userId)
      if (user && user.emailVerified) {
        hasUserAccount = true
        console.log(`Player ${email} already has an active user account`)
      } else if (user && !user.emailVerified && user.activationToken) {
        // User exists but not activated - regenerate activation link
        const baseUrl = process.env.NEXT_PUBLIC_URL || 'https://tenisdp.es'
        activationLink = `${baseUrl}/activate?token=${encodeURIComponent(user.activationToken)}`
        console.log(`Player ${email} has pending activation - regenerating link`)
      }
    } else {
      // No user account yet - they'll get activation link later via WhatsApp from admin
      console.log(`Player ${email} will receive activation link when league starts`)
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

    // Send welcome email with improved template
    try {
      // Get WhatsApp group info if available
      const whatsappGroupInfo = league.getWhatsAppGroupInfo ? league.getWhatsAppGroupInfo() : null

      // Generate email content with new parameters
      const emailData = generateWelcomeEmail(
        {
          playerName: player.name,
          playerEmail: player.email,
          playerWhatsApp: player.whatsapp,
          playerLevel: registration.level,
          language: language || 'es',
          hasUserAccount: hasUserAccount,
          activationLink: activationLink,
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
        console.log(`Welcome email sent to ${player.email}`)
      } else {
        console.error(`Failed to send welcome email to ${player.email}:`, emailResult.error)
      }

    } catch (emailError) {
      console.error('Error sending welcome email:', emailError)
      // Don't fail registration if email fails - just log it
    }

    // Customize success message
    let successMessage
    if (isNewPlayer) {
      successMessage = language === 'es'
        ? league.status === 'coming_soon' 
          ? '¡Bienvenido! Estás en la lista de espera. Te contactaremos cuando la liga esté lista.'
          : '¡Bienvenido! Registro exitoso. Te contactaremos pronto.'
        : league.status === 'coming_soon'
          ? "Welcome! You're on the waiting list. We'll contact you when the league is ready."
          : "Welcome! Registration successful. We'll contact you soon."
    } else {
      if (hasUserAccount) {
        successMessage = language === 'es'
          ? league.status === 'coming_soon' 
            ? '¡Te has registrado en una nueva liga! Ya tienes una cuenta, puedes acceder en cualquier momento.'
            : '¡Te has registrado exitosamente en una nueva liga! Accede a tu cuenta para ver los detalles.'
          : league.status === 'coming_soon'
            ? "You've registered for a new league! You already have an account, you can access it anytime."
            : "You've successfully registered for a new league! Login to your account to see details."
      } else {
        successMessage = language === 'es'
          ? league.status === 'coming_soon' 
            ? '¡Te has registrado en una nueva liga! Estás en la lista de espera.'
            : '¡Te has registrado exitosamente en una nueva liga! Te contactaremos pronto.'
          : league.status === 'coming_soon'
            ? "You've registered for a new league! You're on the waiting list."
            : "You've successfully registered for a new league! We'll contact you soon."
      }
    }

    // Return success response with WhatsApp group info
    const whatsappGroupInfo = league.getWhatsAppGroupInfo ? league.getWhatsAppGroupInfo() : null
    
    return Response.json(
      {
        success: true,
        message: successMessage,
        isNewPlayer,
        isExistingUser,
        hasUserAccount,
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
          }
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
      
      // Get WhatsApp group info if available
      const whatsappGroupInfo = league.getWhatsAppGroupInfo ? league.getWhatsAppGroupInfo() : null
      
      stats[league.slug] = {
        name: league.name,
        status: league.status,
        totalPlayers: league.status === 'active' ? playerCount : 0,
        waitingList: league.status === 'coming_soon' ? playerCount : 0,
        hasWhatsAppGroup: !!whatsappGroupInfo
      }
    }
    
    // Get total unique players across all leagues
    const totalUniquePlayers = await Player.countDocuments({})
    
    // Get total registrations across all leagues
    const totalRegistrations = await Player.aggregate([
      { $unwind: '$registrations' },
      { $count: 'total' }
    ])
    
    return Response.json({
      success: true,
      message: 'Player registration API is working with improved email integration',
      totalUniquePlayers,
      totalRegistrations: totalRegistrations[0]?.total || 0,
      stats,
      emailConfig: {
        provider: 'Resend',
        contactEmail: 'info@tenisdp.es',
        contactPhone: '+34 652 714 328',
        website: 'tenisdp.es'
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
