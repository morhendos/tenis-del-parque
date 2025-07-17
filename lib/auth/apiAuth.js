import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

/**
 * Get authenticated session for API routes
 * @param {Request} request - The request object (optional for App Router)
 * @returns {Promise<{user: {id: string, email: string, role: string, playerId: string}}>}
 */
export async function getAuthSession(request) {
  return await getServerSession(authOptions)
}

/**
 * Require authentication for API routes
 * @param {Request} request - The request object
 * @returns {Promise<{session: object, error?: Response}>}
 */
export async function requireAuth(request) {
  const session = await getAuthSession(request)
  
  if (!session) {
    return {
      error: Response.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
  }
  
  return { session }
}

/**
 * Require admin role for API routes
 * @param {Request} request - The request object
 * @returns {Promise<{session: object, error?: Response}>}
 */
export async function requireAdmin(request) {
  const { session, error } = await requireAuth(request)
  
  if (error) return { error }
  
  if (session.user.role !== 'admin') {
    return {
      error: Response.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }
  }
  
  return { session }
}

/**
 * Require player role for API routes (admins also allowed)
 * @param {Request} request - The request object
 * @returns {Promise<{session: object, error?: Response}>}
 */
export async function requirePlayer(request) {
  const { session, error } = await requireAuth(request)
  
  if (error) return { error }
  
  if (!['player', 'admin'].includes(session.user.role)) {
    return {
      error: Response.json(
        { error: 'Player access required' },
        { status: 403 }
      )
    }
  }
  
  return { session }
}

/**
 * Example usage in API route:
 * 
 * export async function GET(request) {
 *   const { session, error } = await requireAuth(request)
 *   if (error) return error
 * 
 *   // Use session.user.id, session.user.email, etc.
 *   return Response.json({ user: session.user })
 * }
 */
