# NextAuth Migration Cleanup Tasks

## Status Update
✅ **Completed:**
- NextAuth configuration setup (`/app/api/auth/[...nextauth]/route.js`)
- Middleware updated to use `withAuth`
- Login page updated to use NextAuth `signIn`
- Player layout updated to use `useSession`
- Admin layout updated to use `useSession` and `signOut`

## 🔥 Cleanup Required

### 1. Remove Old Auth Endpoints
These endpoints are no longer needed with NextAuth:

#### Player Auth Endpoints:
- [ ] `/app/api/auth/check/route.js`
- [ ] `/app/api/auth/login/route.js`
- [ ] `/app/api/auth/logout/route.js`
- [ ] `/app/api/auth/unified-check/route.js`

#### Admin Auth Endpoints:
- [ ] `/app/api/admin/auth/check/route.js`
- [ ] `/app/api/admin/auth/login/route.js`
- [ ] `/app/api/admin/auth/logout/route.js`

#### Keep These (Still Needed):
- ✅ `/app/api/auth/activate/route.js` - Account activation flow
- ✅ `/app/api/auth/[...nextauth]/route.js` - NextAuth handler

### 2. Remove JWT Utilities
These are no longer needed:
- [ ] `/lib/utils/jwt.js`
- [ ] `/lib/utils/edgeJwt.js`
- [ ] `/lib/utils/adminAuth.js`

### 3. Update API Endpoints That Use Old Auth
Check and update these API routes to use NextAuth session:
- [ ] All `/app/api/admin/*` routes
- [ ] All `/app/api/player/*` routes

### 4. Components to Check/Update
Search for components that might still be using old auth patterns:
- [ ] Any component using `localStorage.getItem('user')`
- [ ] Any component calling old auth endpoints
- [ ] Any component manually handling tokens

## Quick Cleanup Script

Run these commands to remove old files:

```bash
# Remove old auth endpoints
rm -rf app/api/auth/check
rm -rf app/api/auth/login
rm -rf app/api/auth/logout
rm -rf app/api/auth/unified-check

# Remove admin auth endpoints
rm -rf app/api/admin/auth

# Remove JWT utilities
rm -f lib/utils/jwt.js
rm -f lib/utils/edgeJwt.js
rm -f lib/utils/adminAuth.js
```

## Migration Guide for API Routes

### Before (Old Pattern):
```javascript
import { verifyAuth } from '@/lib/utils/authMiddleware'

export async function GET(request) {
  const user = await verifyAuth(request)
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
  // ... rest of handler
}
```

### After (NextAuth Pattern):
```javascript
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function GET(request) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  // Check role if needed
  if (session.user.role !== 'admin') {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }
  
  // ... rest of handler
}
```

## Testing Checklist
After cleanup, test these flows:
- [ ] Player login/logout
- [ ] Admin login/logout
- [ ] Protected route access (player routes)
- [ ] Protected route access (admin routes)
- [ ] API endpoints authorization
- [ ] Session persistence
- [ ] Role-based access control

## Notes
- The `activate` endpoint should remain as it handles account activation via email tokens
- All components should use `useSession` hook from `next-auth/react`
- No more manual token handling or localStorage for auth
