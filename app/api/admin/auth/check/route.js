import { cookies } from 'next/headers'

const SESSION_NAME = 'admin_session'

export async function GET() {
  try {
    const cookieStore = cookies()
    const sessionToken = cookieStore.get(SESSION_NAME)

    // For MVP, simple session check
    // In production, validate token against database or cache
    const authenticated = !!sessionToken?.value

    return Response.json({
      authenticated,
      session: authenticated ? { token: sessionToken.value } : null
    })

  } catch (error) {
    console.error('Auth check error:', error)
    return Response.json(
      { authenticated: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
