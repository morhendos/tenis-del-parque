import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

const locales = ['es', 'en'];
const defaultLocale = 'es';

// Get the preferred locale from the request with improved parsing
function getLocale(request) {
  const pathname = request.nextUrl.pathname;
  
  // Check if there's a locale cookie from user preference
  const localeCookie = request.cookies.get('NEXT_LOCALE');
  console.log(`[Language Debug] Path: ${pathname}, Cookie: ${localeCookie?.value || 'none'}`);
  
  if (localeCookie && locales.includes(localeCookie.value)) {
    console.log(`[Language Debug] Using cookie language: ${localeCookie.value}`);
    return localeCookie.value;
  }
  
  // Check Accept-Language header with improved parsing
  const acceptLanguage = request.headers.get('Accept-Language');
  console.log(`[Language Debug] Accept-Language header: ${acceptLanguage || 'none'}`);
  
  if (acceptLanguage) {
    // Parse Accept-Language header properly
    // Example: "en-US,en;q=0.9,es;q=0.8" or "en-GB,en;q=0.5"
    const languages = acceptLanguage
      .split(',')
      .map(lang => {
        const parts = lang.trim().split(';');
        const code = parts[0].trim();
        const quality = parts[1] ? parseFloat(parts[1].split('=')[1]) : 1.0;
        return { code, quality };
      })
      .sort((a, b) => b.quality - a.quality); // Sort by quality (priority)
    
    console.log(`[Language Debug] Parsed languages:`, languages);
    
    // Find the first language that matches our supported locales
    for (const { code } of languages) {
      // Extract the primary language code (e.g., "en" from "en-US")
      const primaryCode = code.split('-')[0].toLowerCase();
      console.log(`[Language Debug] Checking code: ${code} -> primary: ${primaryCode}`);
      
      if (locales.includes(primaryCode)) {
        console.log(`[Language Detection] ✅ Detected language: ${primaryCode} from Accept-Language: ${acceptLanguage}`);
        return primaryCode;
      }
    }
    
    console.log(`[Language Detection] ❌ No supported language found in Accept-Language: ${acceptLanguage}, using default: ${defaultLocale}`);
  } else {
    console.log(`[Language Detection] ❌ No Accept-Language header found, using default: ${defaultLocale}`);
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

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const pathname = req.nextUrl.pathname

    // Handle authentication for protected routes
    if (token) {
      // Admin routes protection
      if (pathname.startsWith('/admin') && token.role !== 'admin') {
        const locale = getLocale(req)
        return NextResponse.redirect(new URL(`/${locale}/login`, req.url))
      }

      // Player routes - admins can access player routes too
      const playerRouteRegex = /^\/(?:es|en)\/player/;
      if (playerRouteRegex.test(pathname) && !['player', 'admin'].includes(token.role)) {
        const locale = pathname.split('/')[1]
        return NextResponse.redirect(new URL(`/${locale}/login`, req.url))
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
    
    // NEW: Handle locale-specific registration routes
    // Map /en/registro/[league] to /en/signup/[league]
    // Map /es/signup/[league] to /es/registro/[league]
    if (pathnameHasLocale) {
      const [, locale, route, ...rest] = pathname.split('/');
      
      // Handle wrong locale-route combinations
      if (locale === 'en' && route === 'registro') {
        // English users should see /signup not /registro
        const newPath = `/en/signup/${rest.join('/')}`;
        return NextResponse.redirect(new URL(newPath, req.url));
      }
      
      if (locale === 'es' && route === 'signup') {
        // Spanish users should see /registro not /signup
        const newPath = `/es/registro/${rest.join('/')}`;
        return NextResponse.redirect(new URL(newPath, req.url));
      }
    }
    
    // If pathname doesn't have locale, redirect to the same path with locale
    if (!pathnameHasLocale) {
      const locale = getLocale(req);
      
      // Special handling for existing routes to maintain compatibility
      const routeMapping = {
        '/': `/${locale}`,
        '/signup': locale === 'es' ? `/${locale}/registro` : `/${locale}/signup`,
        '/login': `/${locale}/login`,
        '/elo': `/${locale}/elo`,
        '/rules': `/${locale}/${locale === 'es' ? 'reglas' : 'rules'}`,
        '/swiss': `/${locale}/swiss`,
        '/activate': `/${locale}/activate`,
        '/leagues': `/${locale}/${locale === 'es' ? 'ligas' : 'leagues'}`,
        '/clubs': `/${locale}/${locale === 'es' ? 'clubes' : 'clubs'}`,
        '/sotogrande': `/${locale}/sotogrande`,
        '/forgot-password': `/${locale}/forgot-password`,
        '/reset-password': `/${locale}/reset-password`,
        // Add player route mappings
        '/player': `/${locale}/player/dashboard`,
        '/player/dashboard': `/${locale}/player/dashboard`,
        '/player/league': `/${locale}/player/league`,
        '/player/matches': `/${locale}/player/matches`,
        '/player/messages': `/${locale}/player/messages`,
        '/player/profile': `/${locale}/player/profile`,
        '/player/rules': `/${locale}/player/rules`,
      };
      
      // Check if it's a known route that needs mapping
      const mappedRoute = routeMapping[pathname];
      if (mappedRoute) {
        const response = NextResponse.redirect(new URL(mappedRoute, req.url));
        
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
        const response = NextResponse.redirect(new URL(newPath, req.url));
        
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
        const response = NextResponse.redirect(new URL(newPath, req.url));
        
        // Set locale cookie
        response.cookies.set('NEXT_LOCALE', locale, {
          httpOnly: true,
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 365, // 1 year
        });
        
        return response;
      }
      
      // For any other route, just add the locale
      const newUrl = new URL(`/${locale}${pathname}`, req.url);
      
      // Preserve query parameters
      newUrl.search = req.nextUrl.search;
      
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
      const currentLocaleCookie = req.cookies.get('NEXT_LOCALE');
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
  },
  {
    callbacks: {
      authorized: ({ req, token }) => {
        const pathname = req.nextUrl.pathname
        
        // Always allow API routes and static files
        if (pathname.startsWith('/api/') || pathname.startsWith('/_next/') || pathname.includes('.')) {
          return true
        }
        
        // Admin routes always require authentication and admin role
        if (pathname.startsWith('/admin')) {
          return token && token.role === 'admin'
        }
        
        // Player routes require authentication
        if (pathname.includes('/player/')) {
          return !!token
        }
        
        // Remove locale prefix for easier matching
        const pathWithoutLocale = pathname.replace(/^\/(?:es|en)/, '') || '/'
        
        // Public routes that don't require auth
        const publicRoutes = [
          '/',
          '/login',
          '/signup',
          '/activate',
          '/elo',
          '/rules',
          '/reglas',
          '/swiss',
          '/leagues',
          '/ligas',
          '/sotogrande',
          '/registro',
          '/clubs',
          '/clubes',
          '/forgot-password',
          '/reset-password'
        ]
        
        // Check if it's a public route
        const isPublicRoute = publicRoutes.includes(pathWithoutLocale) || 
                             pathWithoutLocale.startsWith('/signup/') ||
                             pathWithoutLocale.startsWith('/registro/') ||
                             pathWithoutLocale.startsWith('/clubs/') ||
                             pathWithoutLocale.startsWith('/clubes/') ||
                             pathWithoutLocale.match(/^\/[^\/]+\/liga\/[^\/]+$/)
        
        if (isPublicRoute) return true
        
        // All other routes require authentication
        return !!token
      }
    }
  }
)

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
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|logo.*\.png|players.*\.csv).*)',
  ]
}
