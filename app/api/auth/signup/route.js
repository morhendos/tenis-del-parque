import dbConnect from '../../../../lib/db/mongoose'
import Player from '../../../../lib/models/Player'
import User from '../../../../lib/models/User'
import { sendEmail } from '../../../../lib/email/resend'

// Helper function to normalize name to Title Case
function toTitleCase(str) {
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
    .trim()
}

/**
 * Account-only registration endpoint
 * Creates a player and user account WITHOUT requiring a league
 * Used for marketing funnel: Ad -> Free account -> Dashboard -> Choose league
 */
export async function POST(request) {
  try {
    await dbConnect()

    const body = await request.json()
    const { 
      name, 
      email, 
      whatsapp, 
      password,
      language = 'es',
      source = 'web' // Track where signup came from (ads, organic, etc.)
    } = body

    // Basic validation - note: NO level required since no league
    if (!name || !email || !password) {
      return Response.json(
        { 
          success: false, 
          error: language === 'es' 
            ? 'Nombre, email y contraseña son obligatorios' 
            : 'Name, email and password are required' 
        },
        { status: 400 }
      )
    }

    // Password validation
    if (password.length < 6) {
      return Response.json(
        { 
          success: false, 
          error: language === 'es' 
            ? 'La contraseña debe tener al menos 6 caracteres' 
            : 'Password must be at least 6 characters' 
        },
        { status: 400 }
      )
    }

    const normalizedName = toTitleCase(name)
    const normalizedEmail = email.toLowerCase().trim()

    // Get metadata
    const headers = request.headers
    const userAgent = headers.get('user-agent') || ''
    const ipAddress = headers.get('x-forwarded-for') || 
                     headers.get('x-real-ip') || 
                     'unknown'

    // Check if user/player already exists
    const existingUser = await User.findOne({ email: normalizedEmail })
    const existingPlayer = await Player.findOne({ email: normalizedEmail })

    if (existingUser || existingPlayer) {
      return Response.json(
        { 
          success: false, 
          error: language === 'es'
            ? 'Este email ya está registrado. ¿Quieres iniciar sesión?'
            : 'This email is already registered. Would you like to login?',
          code: 'EMAIL_EXISTS'
        },
        { status: 409 }
      )
    }

    // Create player WITHOUT any league registrations
    const player = new Player({
      name: normalizedName,
      email: normalizedEmail,
      whatsapp: whatsapp || '',
      registrations: [], // Empty - no league yet
      preferences: {
        preferredLanguage: language
      },
      metadata: {
        source: source,
        userAgent,
        ipAddress,
        signupType: 'account_only' // Track this is account-only signup
      }
    })

    await player.save()
    console.log(`New account-only player created: ${normalizedEmail}`)

    // Create user account with password (already verified since they set password)
    const user = new User({
      email: normalizedEmail,
      password: password,
      role: 'player',
      playerId: player._id,
      isActive: true,
      emailVerified: true, // Password signup = verified
      preferences: {
        language: language,
        hasSeenWelcomeModal: false,
        notifications: {
          email: true,
          matchReminders: true,
          resultReminders: true
        }
      }
    })

    await user.save()

    // Link user to player
    player.userId = user._id
    player.status = 'confirmed'
    await player.save()

    console.log(`User account created for ${normalizedEmail}`)

    // Send welcome email (simplified version for account-only)
    try {
      const baseUrl = process.env.NEXT_PUBLIC_URL || 'https://tenisdp.es'
      
      const emailHtml = generateAccountOnlyWelcomeEmail({
        playerName: normalizedName,
        language,
        loginUrl: `${baseUrl}/${language}/login`,
        leaguesUrl: `${baseUrl}/${language}/leagues`
      })

      await sendEmail({
        to: normalizedEmail,
        subject: language === 'es' 
          ? '¡Bienvenido a Tenis del Parque!' 
          : 'Welcome to Tenis del Parque!',
        html: emailHtml
      })

      console.log(`Welcome email sent to ${normalizedEmail}`)
    } catch (emailError) {
      console.error('Error sending welcome email:', emailError)
      // Don't fail registration if email fails
    }

    return Response.json(
      {
        success: true,
        message: language === 'es'
          ? '¡Cuenta creada! Ya puedes explorar las ligas disponibles.'
          : 'Account created! You can now explore available leagues.',
        player: {
          id: player._id,
          name: player.name,
          email: player.email,
          hasLeagues: false,
          accountStatus: 'active'
        }
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('Account signup error:', error)

    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message)
      return Response.json(
        { success: false, error: errors[0] || 'Validation error' },
        { status: 400 }
      )
    }

    if (error.code === 11000) {
      return Response.json(
        { 
          success: false, 
          error: 'Email already exists',
          code: 'EMAIL_EXISTS'
        },
        { status: 409 }
      )
    }

    return Response.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * Generate simple welcome email for account-only signups
 */
function generateAccountOnlyWelcomeEmail({ playerName, language, loginUrl, leaguesUrl }) {
  const isSpanish = language === 'es'
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: white; border-radius: 12px; padding: 32px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
      
      <!-- Header -->
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #7c3aed; margin: 0; font-size: 24px;">
          🎾 Tenis del Parque
        </h1>
      </div>

      <!-- Welcome Message -->
      <h2 style="color: #1f2937; margin: 0 0 16px 0; font-size: 20px;">
        ${isSpanish ? `¡Hola ${playerName}!` : `Hi ${playerName}!`}
      </h2>
      
      <p style="color: #4b5563; line-height: 1.6; margin: 0 0 16px 0;">
        ${isSpanish 
          ? 'Tu cuenta ha sido creada correctamente. Ya puedes explorar las ligas disponibles y unirte a la que mejor se adapte a tu nivel.'
          : 'Your account has been created successfully. You can now explore available leagues and join the one that best fits your level.'
        }
      </p>

      <!-- CTA Button -->
      <div style="text-align: center; margin: 32px 0;">
        <a href="${leaguesUrl}" style="display: inline-block; background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
          ${isSpanish ? 'Ver Ligas Disponibles' : 'View Available Leagues'}
        </a>
      </div>

      <!-- What's Next -->
      <div style="background: #f9fafb; border-radius: 8px; padding: 20px; margin: 24px 0;">
        <h3 style="color: #1f2937; margin: 0 0 12px 0; font-size: 16px;">
          ${isSpanish ? '¿Qué sigue?' : 'What&apos;s next?'}
        </h3>
        <ol style="color: #4b5563; margin: 0; padding-left: 20px; line-height: 1.8;">
          <li>${isSpanish ? 'Explora las ligas en tu ciudad' : 'Explore leagues in your city'}</li>
          <li>${isSpanish ? 'Elige tu nivel (Bronce, Plata u Oro)' : 'Choose your level (Bronze, Silver or Gold)'}</li>
          <li>${isSpanish ? 'Regístrate y empieza a jugar' : 'Register and start playing'}</li>
        </ol>
      </div>

      <!-- Footer -->
      <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 24px;">
        <p style="color: #9ca3af; font-size: 14px; margin: 0; text-align: center;">
          ${isSpanish ? '¿Preguntas?' : 'Questions?'} 
          <a href="https://wa.me/34652714328" style="color: #7c3aed;">WhatsApp</a> · 
          <a href="https://tenisdp.es" style="color: #7c3aed;">tenisdp.es</a>
        </p>
      </div>

    </div>
  </div>
</body>
</html>
  `
}
