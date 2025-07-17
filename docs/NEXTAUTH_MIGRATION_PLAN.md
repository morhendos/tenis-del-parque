# NextAuth.js Migration Plan

## Overview
Migrate from the current fragmented authentication system to NextAuth.js for a clean, maintainable solution.

## Current Problems
1. **Multiple auth endpoints**: `/api/auth/check`, `/api/admin/auth/check`, `/api/auth/unified-check`
2. **Different token names**: `auth-token` for players, `admin-token` for admins
3. **Conflicting auth logic** in middleware, layouts, and pages
4. **Redirect loops** due to inconsistent auth checks
5. **Manual JWT handling** with edge runtime compatibility issues

## Benefits of NextAuth.js
- **Single source of truth** for authentication
- **Built-in role support** (admin/player)
- **Session management** out of the box
- **No manual token handling**
- **Middleware integration** that just works
- **TypeScript support**
- **Multiple provider support** (future expansion)

## Migration Steps

### Phase 1: Setup NextAuth.js
1. Install dependencies:
   ```bash
   npm install next-auth
   npm install @auth/mongodb-adapter mongodb
   ```

2. Create NextAuth configuration:
   - `/app/api/auth/[...nextauth]/route.js`
   - Configure credentials provider for email/password
   - Add role-based authentication
   - Setup MongoDB adapter

3. Create auth context provider:
   - Wrap app in SessionProvider
   - Create useAuth hook

### Phase 2: Update Authentication Flow
1. **Login Page**:
   - Use `signIn` from next-auth
   - Remove manual token handling
   - Single login form for both roles

2. **Middleware**:
   - Use NextAuth middleware
   - Simple role-based route protection
   - Remove all manual JWT verification

3. **Layouts**:
   - Use `useSession` hook
   - Remove manual auth checks
   - Clean role detection

### Phase 3: Database Updates
1. Update User model:
   - Add role field if missing
   - Ensure email uniqueness
   - Add NextAuth required fields

2. Create unified auth check:
   - Single API endpoint using NextAuth session
   - Return user with role

### Phase 4: Cleanup
1. Remove old auth endpoints:
   - `/api/auth/login`
   - `/api/admin/auth/login`
   - `/api/auth/check`
   - `/api/admin/auth/check`
   - `/api/auth/unified-check`

2. Remove JWT utilities:
   - `lib/utils/jwt.js`
   - `lib/utils/edgeJwt.js`
   - `lib/utils/adminAuth.js`

3. Update all components:
   - Replace manual auth checks with `useSession`
   - Remove localStorage user storage
   - Update logout to use `signOut`

## Implementation Order

### Step 1: Basic NextAuth Setup (30 mins)
- Create NextAuth route handler
- Configure credentials provider
- Add MongoDB adapter
- Set up environment variables

### Step 2: Update Login Flow (20 mins)
- Update login page to use NextAuth
- Test both admin and player login
- Verify session creation

### Step 3: Update Middleware (15 mins)
- Replace current middleware with NextAuth middleware
- Configure role-based protection
- Test route protection

### Step 4: Update Layouts (20 mins)
- Player layout: use useSession
- Admin layout: use useSession
- Remove manual auth API calls

### Step 5: Cleanup & Testing (30 mins)
- Remove old endpoints
- Test all auth flows
- Update any remaining components

## Code Examples

### NextAuth Configuration
```javascript
// app/api/auth/[...nextauth]/route.js
import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { MongoDBAdapter } from '@auth/mongodb-adapter'
import bcrypt from 'bcryptjs'
import dbConnect from '@/lib/db/mongoose'
import User from '@/lib/models/User'

const handler = NextAuth({
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        await dbConnect()
        
        const user = await User.findOne({ email: credentials.email })
        if (!user) return null
        
        const isValid = await bcrypt.compare(credentials.password, user.password)
        if (!isValid) return null
        
        return {
          id: user._id.toString(),
          email: user.email,
          role: user.role,
          name: user.name
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      session.user.role = token.role
      session.user.id = token.id
      return session
    }
  },
  pages: {
    signIn: '/login',
    error: '/login',
  }
})

export { handler as GET, handler as POST }
```

### Middleware Example
```javascript
// middleware.js
import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const path = req.nextUrl.pathname

    // Admin routes
    if (path.startsWith('/admin') && token?.role !== 'admin') {
      return NextResponse.redirect(new URL('/login', req.url))
    }

    // Player routes
    if (path.includes('/player') && !['player', 'admin'].includes(token?.role)) {
      return NextResponse.redirect(new URL('/login', req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token
    }
  }
)

export const config = {
  matcher: [
    '/admin/:path*',
    '/player/:path*',
    '/:locale/player/:path*'
  ]
}
```

### useAuth Hook Example
```javascript
// lib/hooks/useAuth.js
import { useSession, signIn, signOut } from 'next-auth/react'

export function useAuth() {
  const { data: session, status } = useSession()
  
  return {
    user: session?.user,
    isAdmin: session?.user?.role === 'admin',
    isPlayer: session?.user?.role === 'player',
    isLoading: status === 'loading',
    isAuthenticated: status === 'authenticated',
    signIn,
    signOut
  }
}
```

## Timeline
- Total estimated time: 2-3 hours
- Can be done incrementally
- Each phase can be tested independently

## Risks & Mitigation
1. **Session persistence**: NextAuth handles this automatically
2. **Role management**: Stored in JWT token
3. **Database migration**: Minimal changes needed
4. **Breaking changes**: Old endpoints can coexist temporarily

## Success Criteria
- ✅ Single login page works for both roles
- ✅ No redirect loops
- ✅ Admin can access all routes
- ✅ Players can only access player routes
- ✅ Clean, maintainable code
- ✅ No manual token handling

## Let's Start!
Ready to implement this step by step. No more auth nightmares!