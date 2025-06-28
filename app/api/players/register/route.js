import dbConnect from '../../../../lib/db/mongoose'
import Player from '../../../../lib/models/Player'

export async function POST(request) {
  try {
    // Connect to database
    await dbConnect()

    // Parse request body
    const body = await request.json()
    const { name, email, whatsapp, level, language = 'es' } = body

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

    // Check if player already exists
    const existingPlayer = await Player.findOne({ email: email.toLowerCase() })
    
    if (existingPlayer) {
      return Response.json(
        { 
          success: false, 
          error: language === 'es'
            ? 'Este email ya está registrado'
            : 'This email is already registered'
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
      metadata: {
        language,
        source: 'web',
        userAgent,
        ipAddress
      }
    })

    // Save to database
    await player.save()

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
          level: player.level
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

// GET method to check API health
export async function GET() {
  try {
    await dbConnect()
    
    const playerCount = await Player.countDocuments()
    
    return Response.json({
      success: true,
      message: 'Player registration API is working',
      stats: {
        totalPlayers: playerCount
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