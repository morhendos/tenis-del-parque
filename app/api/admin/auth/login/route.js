import { cookies } from 'next/headers'
import crypto from 'crypto'

// In production, use environment variable
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || 
  // Default password: "admin123" (CHANGE THIS IN PRODUCTION!)
  crypto.createHash('sha256').update('admin123').digest('hex')

const SESSION_NAME = 'admin_session'
const SESSION_SECRET = process.env.SESSION_SECRET || 'your-session-secret-here'

export async function POST(request) {
  try {
    const { password } = await request.json()

    if (!password) {
      return Response.json(
        { success: false, error: 'Password is required' },
        { status: 400 }
      )
    }

    // Hash the provided password
    const passwordHash = crypto.createHash('sha256').update(password).digest('hex')

    // Check if password is correct
    if (passwordHash !== ADMIN_PASSWORD_HASH) {
      return Response.json(
        { success: false, error: 'Invalid password' },
        { status: 401 }
      )
    }

    // Create session token
    const sessionToken = crypto
      .createHash('sha256')
      .update(`${Date.now()}-${SESSION_SECRET}`)
      .digest('hex')

    // Set secure cookie
    cookies().set(SESSION_NAME, sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/'
    })

    return Response.json({
      success: true,
      message: 'Login successful'
    })

  } catch (error) {
    console.error('Login error:', error)
    return Response.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
