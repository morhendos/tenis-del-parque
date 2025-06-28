import { cookies } from 'next/headers'

const SESSION_NAME = 'admin_session'

export async function POST() {
  try {
    // Remove the session cookie
    cookies().delete(SESSION_NAME)

    return Response.json({
      success: true,
      message: 'Logged out successfully'
    })

  } catch (error) {
    console.error('Logout error:', error)
    return Response.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
