import { NextResponse } from 'next/server'
import { verifyTokenEdge } from './lib/utils/edgeJwt'

// Protect admin routes
export async function middleware(request) {
  const { pathname } = request.nextUrl

  // Check if it's an admin route (excluding the index and auth endpoints)
  if (pathname.startsWith('/admin') && 
      pathname !== '/admin' && 
      !pathname.startsWith('/api/admin/auth')) {
    
    // Check for JWT token cookie
    const tokenCookie = request.cookies.get('admin-token')
    
    if (!tokenCookie?.value) {
      // Redirect to login
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // Verify the token (Edge Runtime compatible)
    const decoded = await verifyTokenEdge(tokenCookie.value, process.env.JWT_SECRET)
    
    if (!decoded || decoded.role !== 'admin') {
      // Redirect to login if token is invalid or not admin
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  // API routes protection
  if (pathname.startsWith('/api/admin') && 
      !pathname.startsWith('/api/admin/auth')) {
    
    const tokenCookie = request.cookies.get('admin-token')
    
    if (!tokenCookie?.value) {
      return Response.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Verify the token (Edge Runtime compatible)
    const decoded = await verifyTokenEdge(tokenCookie.value, process.env.JWT_SECRET)
    
    if (!decoded || decoded.role !== 'admin') {
      return Response.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
  }

  // TODO: Add player route protection when player dashboard is built
  // if (pathname.startsWith('/player') && pathname !== '/player') {
  //   const tokenCookie = request.cookies.get('player-token')
  //   ...
  // }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/admin/:path*',
    // TODO: Add player routes when built
    // '/player/:path*',
    // '/api/player/:path*'
  ]
}
