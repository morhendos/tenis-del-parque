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

    // Validate league exists
    let league
    if (leagueId) {
      league = await League.findById(leagueId)
    } else if (leagueSlug) {
      league = await League.findOne({ slug: leagueSlug, status: 'active' })
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

    // Check if player already exists in this league
    const existingPlayer = await Player.findOne({ 
      email: email.toLowerCase(),
      league: league._id 
    })
    
    if (existingPlayer) {
      return Response.json(
        { 
          success: false, 
          error: language === 'es'
            ? 'Este email ya está registrado en esta liga'
            : 'This email is already registered in this league'
        },
        { status: 409 }
      )
    }

    // Get additional metadata
    const headers = request.headers
    const userAgent = headers.get('user-agent') || ''
    const ipAddress = headers.get('x-forwarded-for') || 
                     headers.get('x-real-ip') || 
                     'unknown'

    // Create new player
    const player = new Player({
      name,
      email,
      whatsapp,
      level,
      league: league._id,
      season,
      metadata: {
        language,
        source: 'web',
        userAgent,
        ipAddress
      }
    })

    // Save to database
    await player.save()

    // Update league stats
    await League.findByIdAndUpdate(league._id, {
      $inc: { 'stats.totalPlayers': 1 }
    })

    // Return success response
    return Response.json(
      {
        success: true,
        message: language === 'es'
          ? '¡Registro exitoso! Te contactaremos pronto.'
          : 'Registration successful! We\'ll contact you soon.',
        player: {
          id: player._id,
          name: player.name,
          email: player.email,
          level: player.level,
          league: {
            id: league._id,
            name: league.name,
            slug: league.slug
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
    
    // Get stats for all leagues
    const leagues = await League.find({ status: 'active' })
    const stats = {}
    
    for (const league of leagues) {
      const playerCount = await Player.countDocuments({ league: league._id })
      stats[league.slug] = {
        name: league.name,
        totalPlayers: playerCount
      }
    }
    
    return Response.json({
      success: true,
      message: 'Player registration API is working',
      stats
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