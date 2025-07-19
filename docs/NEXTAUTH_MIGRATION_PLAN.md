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

## Migration Progress

### ✅ Phase 1: Setup NextAuth.js (COMPLETED)
- [x] Installed dependencies
- [x] Created NextAuth configuration with credentials provider
- [x] Configured role-based authentication
- [x] Setup MongoDB adapter
- [x] Added SessionProvider to root layout
- [x] Created useAuth hook

### ✅ Phase 2: Update Authentication Flow (COMPLETED)
- [x] **Login Page**: Using `signIn` from next-auth
- [x] **Middleware**: Using NextAuth middleware with role protection
- [x] **Player Layout**: Using `useSession` hook
- [x] **Admin Layout**: Using `useSession` hook and `signOut`

### 🚧 Phase 3: Database Updates (IN PROGRESS)
- [x] User model has role field
- [x] NextAuth configuration working with existing User model
- [ ] Update all API routes to use NextAuth session

### 🔴 Phase 4: Cleanup (TODO)
1. Remove old auth endpoints:
   - `/api/auth/login`
   - `/api/admin/auth/login`
   - `/api/auth/check`
   - `/api/admin/auth/check`
   - `/api/auth/unified-check`
   - `/api/auth/logout`
   - `/api/admin/auth/logout`

2. Remove JWT utilities:
   - `lib/utils/jwt.js`
   - `lib/utils/edgeJwt.js`
   - `lib/utils/adminAuth.js`

3. Update all API routes to use new auth helpers

## Next Steps

### Immediate Actions:
1. **Run cleanup script** to remove old auth files:
   ```bash
   # Remove old auth endpoints
   rm -rf app/api/auth/check
   rm -rf app/api/auth/login
   rm -rf app/api/auth/logout
   rm -rf app/api/auth/unified-check
   rm -rf app/api/admin/auth

   # Remove JWT utilities
   rm -f lib/utils/jwt.js
   rm -f lib/utils/edgeJwt.js
   rm -f lib/utils/adminAuth.js
   ```

2. **Update API routes** to use new auth helpers from `lib/auth/apiAuth.js`:
   ```javascript
   import { requireAuth, requireAdmin } from '@/lib/auth/apiAuth'
   
   export async function GET(request) {
     const { session, error } = await requireAuth(request)
     if (error) return error
     
     // Use session.user
   }
   ```

3. **Test all flows**:
   - Player login/logout
   - Admin login/logout
   - Protected routes
   - API endpoints

## Success Criteria
- ✅ Single login page works for both roles
- ✅ No redirect loops
- ✅ Admin can access all routes
- ✅ Players can only access player routes
- ✅ Clean, maintainable code
- ✅ No manual token handling
- ⏳ All API routes using NextAuth
- ⏳ Old auth code removed

## Resources
- [NextAuth Configuration](/app/api/auth/[...nextauth]/route.js)
- [useAuth Hook](/lib/hooks/useAuth.js)
- [API Auth Helpers](/lib/auth/apiAuth.js)
- [Cleanup Checklist](/docs/NEXTAUTH_CLEANUP.md)

## Timeline Update
- Phase 1-2: ✅ Completed
- Phase 3: 🚧 In Progress (80% done)
- Phase 4: 🔴 Ready to start
- Estimated completion: 1-2 hours remaining