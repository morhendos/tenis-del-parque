import { NextResponse } from 'next/server'
import { verifyTokenEdge } from './lib/utils/edgeJwt'

const locales = ['es', 'en'];
const defaultLocale = 'es';

// Get the preferred locale from the request
function getLocale(request) {
  // Check if there's a locale cookie from user preference
  const localeCookie = request.cookies.get('NEXT_LOCALE');
  if (localeCookie && locales.includes(localeCookie.value)) {
    return localeCookie.value;
  }
  
  // Check Accept-Language header
  const acceptLanguage = request.headers.get('Accept-Language');
  if (acceptLanguage) {
    // Get the first language that matches our supported locales
    const detectedLocale = acceptLanguage
      .split(',')
      .map(lang => lang.split('-')[0].trim())
      .find(lang => locales.includes(lang));
    
    if (detectedLocale) return detectedLocale;
  }
  
  return defaultLocale;
}

// Routes that should not have locale prefix
const excludedRoutes = [
  '/api',
  '/_next',
  '/static',
  '/admin',
  '/admin-login'
];

// Check if path should be excluded from locale routing
function shouldExcludeFromLocale(pathname) {
  return excludedRoutes.some(route => pathname.startsWith(route)) || pathname.includes('.');
}

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  
  // AUTHENTICATION LOGIC
  // Check if it's an admin route (excluding auth endpoints)
  if (pathname.startsWith('/admin') && 
      !pathname.startsWith('/api/admin/auth')) {
    
    // Check for admin JWT token cookie
    const tokenCookie = request.cookies.get('admin-token')
    
    if (!tokenCookie?.value) {
      // Redirect to admin login
      return NextResponse.redirect(new URL('/admin-login', request.url))
    }

    // Verify the token (Edge Runtime compatible)
    const decoded = await verifyTokenEdge(tokenCookie.value, process.env.JWT_SECRET)
    
    if (!decoded || decoded.role !== 'admin') {
      // Redirect to admin login if token is invalid or not admin
      return NextResponse.redirect(new URL('/admin-login', request.url))
    }
  }

  // Check if it's a player route (with locale support)
  const playerRouteRegex = /^\/(?:es|en)?\/player/;
  if (playerRouteRegex.test(pathname)) {
    
    // Check for player JWT token cookie
    const tokenCookie = request.cookies.get('auth-token')
    
    if (!tokenCookie?.value) {
      // Extract locale from path
      const locale = pathname.split('/')[1];
      const isValidLocale = locales.includes(locale);
      const redirectLocale = isValidLocale ? locale : getLocale(request);
      
      // Redirect to login with return URL
      const url = new URL(`/${redirectLocale}/login`, request.url)
      url.searchParams.set('return', pathname)
      return NextResponse.redirect(url)
    }

    // Verify the token (Edge Runtime compatible)
    const decoded = await verifyTokenEdge(tokenCookie.value, process.env.JWT_SECRET)
    
    if (!decoded || decoded.role !== 'player') {
      // Extract locale from path
      const locale = pathname.split('/')[1];
      const isValidLocale = locales.includes(locale);
      const redirectLocale = isValidLocale ? locale : getLocale(request);
      
      // Redirect to login if token is invalid or not player
      const url = new URL(`/${redirectLocale}/login`, request.url)
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
    
    const tokenCookie = request.cookies.get('auth-token')
    
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
  
  // INTERNATIONALIZATION LOGIC
  // Skip locale handling for excluded routes
  if (shouldExcludeFromLocale(pathname)) {
    return NextResponse.next();
  }
  
  // Check if the pathname already includes a locale
  const pathnameHasLocale = locales.some(
    locale => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );
  
  // If pathname doesn't have locale, redirect to the same path with locale
  if (!pathnameHasLocale) {
    const locale = getLocale(request);
    
    // Special handling for existing routes to maintain compatibility
    const routeMapping = {
      '/': `/${locale}`,
      '/signup': `/${locale}/registro`,
      '/login': `/${locale}/login`,
      '/elo': `/${locale}/elo`,
      '/rules': `/${locale}/${locale === 'es' ? 'reglas' : 'rules'}`,
      '/swiss': `/${locale}/swiss`,
      '/activate': `/${locale}/activate`,
      '/player': `/${locale}/player`,
      '/leagues': `/${locale}/${locale === 'es' ? 'ligas' : 'leagues'}`,
      '/sotogrande': `/${locale}/sotogrande`,
    };
    
    // Check if it's a known route that needs mapping
    const mappedRoute = routeMapping[pathname];
    if (mappedRoute) {
      const response = NextResponse.redirect(new URL(mappedRoute, request.url));
      
      // Set locale cookie
      response.cookies.set('NEXT_LOCALE', locale, {
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 365, // 1 year
      });
      
      return response;
    }
    
    // For dynamic routes like /signup/[league]
    if (pathname.startsWith('/signup/')) {
      const league = pathname.split('/')[2];
      const newPath = locale === 'es' ? `/es/registro/${league}` : `/en/signup/${league}`;
      const response = NextResponse.redirect(new URL(newPath, request.url));
      
      // Set locale cookie
      response.cookies.set('NEXT_LOCALE', locale, {
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 365, // 1 year
      });
      
      return response;
    }
    
    // For [location]/liga/[season] routes
    const locationMatch = pathname.match(/^\/([^\/]+)\/liga\/([^\/]+)$/);
    if (locationMatch) {
      const [, location, season] = locationMatch;
      const newPath = `/${locale}/${location}/liga/${season}`;
      const response = NextResponse.redirect(new URL(newPath, request.url));
      
      // Set locale cookie
      response.cookies.set('NEXT_LOCALE', locale, {
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 365, // 1 year
      });
      
      return response;
    }
    
    // For any other route, just add the locale
    const newUrl = new URL(`/${locale}${pathname}`, request.url);
    
    // Preserve query parameters
    newUrl.search = request.nextUrl.search;
    
    const response = NextResponse.redirect(newUrl);
    
    // Set cookie to remember the detected/default locale
    response.cookies.set('NEXT_LOCALE', locale, {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 365, // 1 year
    });
    
    return response;
  }
  
  // If we have a locale in the path, ensure the cookie is set
  const pathLocale = pathname.split('/')[1];
  if (locales.includes(pathLocale)) {
    const response = NextResponse.next();
    
    // Update the locale cookie if it's different
    const currentLocaleCookie = request.cookies.get('NEXT_LOCALE');
    if (!currentLocaleCookie || currentLocaleCookie.value !== pathLocale) {
      response.cookies.set('NEXT_LOCALE', pathLocale, {
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 365, // 1 year
      });
    }
    
    return response;
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - robots.txt
     * - sitemap.xml
     * - public folder files
     */
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|logo.*\\.png|players.*\\.csv).*)',
  ]
}