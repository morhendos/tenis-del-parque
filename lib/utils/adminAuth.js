import { verifyToken } from './jwt'

/**
 * Verify admin authentication from request cookies or headers
 * @param {Request} request - The Next.js request object
 * @returns {Object} - Authentication result
 */
export async function verifyAdminAuth(request) {
  try {
    // Check for token in cookies first
    const cookieToken = request.cookies.get('admin-token')?.value
    
    if (!cookieToken) {
      return {
        authenticated: false,
        error: 'No authentication token provided'
      }
    }

    // Verify token
    const decoded = verifyToken(cookieToken)
    
    if (!decoded) {
      return {
        authenticated: false,
        error: 'Invalid or expired token'
      }
    }

    // Check if user is admin
    if (decoded.role !== 'admin') {
      return {
        authenticated: false,
        error: 'Insufficient permissions - admin access required'
      }
    }

    return {
      authenticated: true,
      user: {
        id: decoded.userId,
        email: decoded.email,
        role: decoded.role
      }
    }

  } catch (error) {
    console.error('Admin auth verification error:', error)
    return {
      authenticated: false,
      error: 'Authentication failed'
    }
  }
}

/**
 * Simple authentication check that returns boolean
 * @param {Request} request - The Next.js request object
 * @returns {boolean} - Whether user is authenticated admin
 */
export async function isAdminAuthenticated(request) {
  const auth = await verifyAdminAuth(request)
  return auth.authenticated
} 