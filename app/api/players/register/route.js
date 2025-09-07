import dbConnect from '../../../../lib/db/mongoose'
import Player from '../../../../lib/models/Player'
import League from '../../../../lib/models/League'

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

    // Validate league exists (include both active and coming_soon leagues)
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

    // 🔧 UPDATED: Check if player already exists in this specific league AND season
    const existingPlayer = await Player.findOne({ 
      email: email.toLowerCase(),
      league: league._id,
      season: season  // Now checking season too!
    })
    
    if (existingPlayer) {
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

    // 🔧 NEW: Check if this email exists in other leagues (for better UX messaging)
    const existingPlayerElsewhere = await Player.findOne({ 
      email: email.toLowerCase()
    }).populate('league', 'name slug')
    
    let isExistingUser = false
    if (existingPlayerElsewhere) {
      isExistingUser = true
      console.log(`Existing player ${email} registering for new league: ${league.name} (${season})`)
    }

    // Get additional metadata
    const headers = request.headers
    const userAgent = headers.get('user-agent') || ''
    const ipAddress = headers.get('x-forwarded-for') || 
                     headers.get('x-real-ip') || 
                     'unknown'

    // Create new player record for this league/season
    const player = new Player({
      name,
      email: email.toLowerCase(),
      whatsapp,
      level,
      league: league._id,
      season,
      // For coming soon leagues, set status to 'waiting'
      status: league.status === 'coming_soon' ? 'waiting' : 'pending',
      metadata: {
        language,
        source: 'web',
        userAgent,
        ipAddress
      }
    })

    // Save to database
    await player.save()

    // Update league stats based on league status
    if (league.status === 'coming_soon') {
      // For coming soon leagues, increment waiting list count
      await League.findByIdAndUpdate(league._id, {
        $inc: { 'waitingListCount': 1 }
      })
    } else {
      // For active leagues, increment total players
      await League.findByIdAndUpdate(league._id, {
        $inc: { 'stats.totalPlayers': 1 }
      })
    }

    // 🔧 IMPROVED: Customize success message for existing vs new users
    let successMessage
    if (isExistingUser) {
      successMessage = language === 'es'
        ? league.status === 'coming_soon' 
          ? '¡Te has registrado en una nueva liga! Estás en la lista de espera.'
          : '¡Te has registrado exitosamente en una nueva liga! Te contactaremos pronto.'
        : league.status === 'coming_soon'
          ? 'You\'ve registered for a new league! You\'re on the waiting list.'
          : 'You\'ve successfully registered for a new league! We\'ll contact you soon.'
    } else {
      successMessage = language === 'es'
        ? league.status === 'coming_soon' 
          ? '¡Bienvenido! Estás en la lista de espera. Te contactaremos cuando la liga esté lista.'
          : '¡Bienvenido! Registro exitoso. Te contactaremos pronto.'
        : league.status === 'coming_soon'
          ? 'Welcome! You\'re on the waiting list. We\'ll contact you when the league is ready.'
          : 'Welcome! Registration successful. We\'ll contact you soon.'
    }

    // Return success response
    return Response.json(
      {
        success: true,
        message: successMessage,
        isExistingUser, // 🔧 NEW: Flag to indicate if this was an existing user
        player: {
          id: player._id,
          name: player.name,
          email: player.email,
          level: player.level,
          league: {
            id: league._id,
            name: league.name,
            slug: league.slug,
            status: league.status
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

    // 🔧 NEW: Handle MongoDB duplicate key errors (from compound unique index)
    if (error.code === 11000) {
      // This happens when the compound unique index (email + league + season) is violated
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

// GET method to check API health and get stats
export async function GET() {
  try {
    await dbConnect()
    
    // Get stats for all leagues (including coming soon)
    const leagues = await League.find({ status: { $in: ['active', 'coming_soon'] } })
    const stats = {}
    
    for (const league of leagues) {
      const playerCount = await Player.countDocuments({ league: league._id })
      stats[league.slug] = {
        name: league.name,
        status: league.status,
        totalPlayers: league.status === 'active' ? playerCount : 0,
        waitingList: league.status === 'coming_soon' ? playerCount : 0
      }
    }
    
    // 🔧 NEW: Also get total unique email addresses for insights
    const uniqueEmails = await Player.distinct('email')
    
    return Response.json({
      success: true,
      message: 'Player registration API is working',
      stats,
      totalUniqueEmails: uniqueEmails.length
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
