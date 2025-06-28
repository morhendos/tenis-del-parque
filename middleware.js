import { NextResponse } from 'next/server'

// Protect admin routes
export function middleware(request) {
  const { pathname } = request.nextUrl

  // Check if it's an admin route (excluding login and auth endpoints)
  if (pathname.startsWith('/admin') && 
      pathname !== '/admin' && 
      !pathname.startsWith('/api/admin/auth')) {
    
    // Check for session cookie
    const sessionCookie = request.cookies.get('admin_session')
    
    if (!sessionCookie) {
      // Redirect to login
      return NextResponse.redirect(new URL('/admin', request.url))
    }
  }

  // API routes protection
  if (pathname.startsWith('/api/admin') && 
      !pathname.startsWith('/api/admin/auth')) {
    
    const sessionCookie = request.cookies.get('admin_session')
    
    if (!sessionCookie) {
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
    '/api/admin/:path*'
  ]
}
