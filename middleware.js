import { NextResponse } from 'next/server'
import { verifyTokenEdge } from './lib/utils/edgeJwt'

// Protect admin and player routes
export async function middleware(request) {
  const { pathname } = request.nextUrl

  // Check if it's an admin route (excluding auth endpoints)
  if (pathname.startsWith('/admin') && 
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

  // Check if it's a player route
  if (pathname.startsWith('/player')) {
    
    // Check for JWT token cookie
    const tokenCookie = request.cookies.get('player-token')
    
    if (!tokenCookie?.value) {
      // Redirect to login with return URL
      const url = new URL('/login', request.url)
      url.searchParams.set('return', pathname)
      return NextResponse.redirect(url)
    }

    // Verify the token (Edge Runtime compatible)
    const decoded = await verifyTokenEdge(tokenCookie.value, process.env.JWT_SECRET)
    
    if (!decoded || decoded.role !== 'player') {
      // Redirect to login if token is invalid or not player
      const url = new URL('/login', request.url)
      url.searchParams.set('return', pathname)
      return NextResponse.redirect(url)
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

  // Player API routes protection
  if (pathname.startsWith('/api/player')) {
    
    const tokenCookie = request.cookies.get('player-token')
    
    if (!tokenCookie?.value) {
      return Response.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Verify the token (Edge Runtime compatible)
    const decoded = await verifyTokenEdge(tokenCookie.value, process.env.JWT_SECRET)
    
    if (!decoded || decoded.role !== 'player') {
      return Response.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/admin/:path*',
    '/player/:path*',
    '/api/player/:path*'
  ]
}
