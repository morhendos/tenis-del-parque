import { NextResponse } from 'next/server'
import { verifyToken, extractTokenFromHeader } from './jwt'

/**
 * Middleware to verify JWT token for protected routes
 * @param {Request} request - The request object
 * @param {Object} options - Options for the middleware
 * @param {string|Array} options.role - Required role(s)
 * @returns {Object} - Object with authentication status and user data
 */
export async function verifyAuth(request, options = {}) {
  try {
    // Check for token in cookies first
    const cookieToken = request.cookies.get('admin-token')?.value || 
                       request.cookies.get('auth-token')?.value
    
    // Then check Authorization header
    const authHeader = request.headers.get('authorization')
    const headerToken = extractTokenFromHeader(authHeader)
    
    const token = cookieToken || headerToken

    if (!token) {
      return {
        authenticated: false,
        error: 'No token provided',
        response: NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        )
      }
    }

    // Verify token
    const decoded = verifyToken(token)
    
    if (!decoded) {
      return {
        authenticated: false,
        error: 'Invalid or expired token',
        response: NextResponse.json(
          { error: 'Invalid or expired token' },
          { status: 401 }
        )
      }
    }

    // Check role if specified
    if (options.role) {
      const requiredRoles = Array.isArray(options.role) ? options.role : [options.role]
      if (!requiredRoles.includes(decoded.role)) {
        return {
          authenticated: false,
          error: 'Insufficient permissions',
          response: NextResponse.json(
            { error: 'Insufficient permissions' },
            { status: 403 }
          )
        }
      }
    }

    return {
      authenticated: true,
      user: decoded
    }

  } catch (error) {
    console.error('Auth verification error:', error)
    return {
      authenticated: false,
      error: 'Authentication failed',
      response: NextResponse.json(
        { error: 'Authentication failed' },
        { status: 500 }
      )
    }
  }
}

/**
 * Higher-order function to protect API routes
 * @param {Function} handler - The API route handler
 * @param {Object} options - Options for authentication
 * @returns {Function} - The wrapped handler
 */
export function withAuth(handler, options = {}) {
  return async (request, context) => {
    const auth = await verifyAuth(request, options)
    
    if (!auth.authenticated) {
      return auth.response
    }

    // Add user to request for handler to use
    request.user = auth.user
    
    return handler(request, context)
  }
}

/**
 * Middleware specifically for admin routes
 * @param {Function} handler - The API route handler
 * @returns {Function} - The wrapped handler
 */
export function withAdminAuth(handler) {
  return withAuth(handler, { role: 'admin' })
}

/**
 * Middleware specifically for player routes
 * @param {Function} handler - The API route handler
 * @returns {Function} - The wrapped handler
 */
export function withPlayerAuth(handler) {
  return withAuth(handler, { role: 'player' })
}
