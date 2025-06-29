import jwt from 'jsonwebtoken'

// Get JWT secret from environment variable
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-please-change-in-production'
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'

/**
 * Generate a JWT token for a user
 * @param {Object} payload - The payload to encode in the token
 * @returns {string} - The generated JWT token
 */
export function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN
  })
}

/**
 * Generate tokens for authentication (access and refresh)
 * @param {Object} user - The user object
 * @returns {Object} - Object containing access and refresh tokens
 */
export function generateAuthTokens(user) {
  const payload = {
    userId: user._id.toString(),
    email: user.email,
    role: user.role,
    playerId: user.playerId?.toString() || null
  }

  // Access token - shorter expiry
  const accessToken = jwt.sign(payload, JWT_SECRET, {
    expiresIn: '1d'
  })

  // Refresh token - longer expiry
  const refreshToken = jwt.sign(
    { userId: user._id.toString() },
    JWT_SECRET,
    { expiresIn: '30d' }
  )

  return {
    accessToken,
    refreshToken
  }
}

/**
 * Verify a JWT token
 * @param {string} token - The token to verify
 * @returns {Object|null} - The decoded payload or null if invalid
 */
export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (error) {
    return null
  }
}

/**
 * Decode a JWT token without verification
 * @param {string} token - The token to decode
 * @returns {Object|null} - The decoded payload or null if invalid
 */
export function decodeToken(token) {
  try {
    return jwt.decode(token)
  } catch (error) {
    return null
  }
}

/**
 * Extract token from Authorization header
 * @param {string} authHeader - The Authorization header value
 * @returns {string|null} - The extracted token or null
 */
export function extractTokenFromHeader(authHeader) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }
  return authHeader.substring(7)
}

/**
 * Middleware to verify JWT token in API routes
 * @param {Request} request - The request object
 * @returns {Object} - Object with user data or error
 */
export async function verifyAuth(request) {
  try {
    const authHeader = request.headers.get('authorization')
    const token = extractTokenFromHeader(authHeader)

    if (!token) {
      return {
        authenticated: false,
        error: 'No token provided'
      }
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return {
        authenticated: false,
        error: 'Invalid or expired token'
      }
    }

    return {
      authenticated: true,
      user: decoded
    }
  } catch (error) {
    return {
      authenticated: false,
      error: 'Authentication failed'
    }
  }
}

/**
 * Check if user has required role
 * @param {Object} user - The user object from token
 * @param {string|Array} requiredRoles - Required role(s)
 * @returns {boolean} - Whether user has required role
 */
export function hasRole(user, requiredRoles) {
  if (!user || !user.role) return false
  
  const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles]
  return roles.includes(user.role)
}

/**
 * Middleware to require authentication for API routes
 * @param {Function} handler - The API route handler
 * @param {Object} options - Options for auth requirement
 * @returns {Function} - The wrapped handler
 */
export function requireAuth(handler, options = {}) {
  return async (request, context) => {
    const auth = await verifyAuth(request)
    
    if (!auth.authenticated) {
      return new Response(
        JSON.stringify({ error: auth.error }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Check role if specified
    if (options.role && !hasRole(auth.user, options.role)) {
      return new Response(
        JSON.stringify({ error: 'Insufficient permissions' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Add user to request for handler to use
    request.user = auth.user
    
    return handler(request, context)
  }
}

/**
 * Get cookie options for secure cookies
 * @param {number} maxAge - Max age in seconds
 * @returns {Object} - Cookie options
 */
export function getCookieOptions(maxAge = 86400) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: maxAge,
    path: '/'
  }
}
