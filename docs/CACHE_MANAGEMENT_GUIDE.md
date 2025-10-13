# Cache Management Guide

## Understanding Caching in Tenis del Parque

Your club pages use **Incremental Static Regeneration (ISR)** which caches pages for performance but can cause updates to not appear immediately.

### Current Cache Settings

**Club Pages:** Revalidate every **6 hours** (21600 seconds)
- Location: `app/[locale]/clubs/[city]/[slug]/page.js`
- Setting: `export const revalidate = 21600`

This means:
- ✅ Super fast page loads (cached)
- ⚠️ Changes may not show for up to 6 hours
- ✅ Automatic refresh every 6 hours

## When Cache is Automatically Cleared

The system now **automatically clears cache** when you:

1. **Update a club via admin panel** → Both ES and EN pages revalidated
2. **Refresh Google Photos** → Club pages revalidated
3. **Save club changes** → Cache cleared immediately

You should see this in server logs:
```
🔄 Auto-revalidating club pages: sotogrande/racquet-leisure-la-reserva-club
✅ Club pages revalidated
```

## Manual Cache Clearing Methods

### Method 1: Via API (Quick Fix)

Use the revalidate API endpoint:

```bash
# Clear cache for a specific club
curl -X PUT https://tenisdp.es/api/revalidate \
  -H "Content-Type: application/json" \
  -d '{
    "city": "sotogrande",
    "slug": "racquet-leisure-la-reserva-club"
  }'

# Or clear a specific path
curl -X POST https://tenisdp.es/api/revalidate \
  -H "Content-Type: application/json" \
  -d '{
    "path": "/es/clubs/sotogrande/racquet-leisure-la-reserva-club"
  }'
```

### Method 2: Via Code

Use the utility function in your admin components:

```javascript
import { clearClubCache } from '@/lib/utils/cacheUtils'
import { toast } from '@/components/ui/Toast'

// In your component
const handleClearCache = async () => {
  try {
    await clearClubCache('sotogrande', 'racquet-leisure-la-reserva-club')
    toast.success('Cache cleared! Page will refresh on next visit.')
  } catch (error) {
    toast.error('Failed to clear cache')
  }
}
```

### Method 3: Force Refresh (Vercel)

If deployed on Vercel:

1. Go to Vercel Dashboard
2. Navigate to your deployment
3. Click "Redeploy" to force rebuild all pages

### Method 4: Update the Club Again

Simple trick:
1. Go to admin panel
2. Edit the club
3. Make a tiny change (e.g., add a space to description)
4. Save
5. Cache is auto-cleared!

## Verifying Cache is Cleared

### Check Server Logs
When cache is cleared, you'll see:
```
🔄 Auto-revalidating club pages: sotogrande/racquet-leisure-la-reserva-club
✅ Club pages revalidated
```

### Test the Page
1. Open the club page in **incognito mode** (to avoid browser cache)
2. Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
3. Check if changes appear

### Browser Cache vs Server Cache

**Server Cache (ISR):** What we just fixed
- Cleared automatically on updates
- Can force clear via API

**Browser Cache:** Still separate
- Users may see old images due to browser cache
- Solution: Hard refresh or incognito mode

## For Your Specific Issue

For the club: `https://www.tenisdp.es/es/clubes/sotogrande/racquet-leisure-la-reserva-club`

### Quick Fix (Right Now):

**Option A - Via API:**
```bash
curl -X PUT https://tenisdp.es/api/revalidate \
  -H "Content-Type: application/json" \
  -d '{"city": "sotogrande", "slug": "racquet-leisure-la-reserva-club"}'
```

**Option B - Via Admin:**
1. Go to admin panel → Clubs
2. Find "Racquet Leisure La Reserva Club"
3. Click Edit
4. Go to Images tab
5. Click "Re-import from Google Maps" (this auto-clears cache)
6. Save

**Option C - Via Browser Console:**
```javascript
// Run this in browser console on tenisdp.es (when logged in as admin)
fetch('/api/revalidate', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    city: 'sotogrande',
    slug: 'racquet-leisure-la-reserva-club'
  })
}).then(r => r.json()).then(console.log)
```

## Long-term Solutions

### Option 1: Reduce Revalidation Time
Edit `app/[locale]/clubs/[city]/[slug]/page.js`:

```javascript
// Change from 6 hours to 1 hour
export const revalidate = 3600  // 1 hour

// Or even shorter for testing
export const revalidate = 300   // 5 minutes
```

**Pros:** Changes appear faster  
**Cons:** More database queries, slightly slower first visits

### Option 2: On-Demand Revalidation Only
```javascript
export const revalidate = false  // Never auto-revalidate
```

Rely entirely on manual revalidation when you update clubs.

**Pros:** Full control, fewer queries  
**Cons:** Must remember to clear cache

### Option 3: Hybrid Approach
```javascript
export const revalidate = 43200  // 12 hours
```

Plus auto-revalidation on updates (already implemented).

**Pros:** Balance of performance and freshness  
**Cons:** Still some delay for external changes

## Recommended Setup

**Current (Best for Production):**
- ISR: 6 hours
- Auto-revalidate on admin updates ✅
- Manual revalidate API available ✅

This gives you:
- Fast page loads
- Automatic cache clearing when YOU make changes
- Manual override when needed

## Debugging Cache Issues

### 1. Check if it's ISR cache or browser cache

**Test A:** Open in incognito
- If updated → It was browser cache
- If not updated → It's ISR cache

**Test B:** Check different device/browser
- If updated → It was browser cache
- If not updated → It's ISR cache

### 2. Verify auto-revalidation is working

After updating a club, check server logs for:
```
🔄 Auto-revalidating club pages: [city]/[slug]
✅ Club pages revalidated
```

If missing → Auto-revalidation failed

### 3. Force revalidate and test

```bash
curl -X PUT https://tenisdp.es/api/revalidate \
  -H "Content-Type: application/json" \
  -d '{"city": "your-city", "slug": "your-club-slug"}'
```

Then test in incognito mode.

## Common Issues

**"I updated 2 hours ago but page still shows old content"**
- ISR cache hasn't expired yet (6 hour window)
- Solution: Force revalidate via API or re-save the club

**"I cleared cache but still seeing old images"**
- Browser cache (not ISR cache)
- Solution: Hard refresh or incognito mode

**"Auto-revalidation not working"**
- Check server logs for errors
- Verify `revalidatePath` is being called
- Check API response includes `revalidated: true`

**"Some clubs update immediately, others don't"**
- Auto-revalidation only works when YOU update via admin
- External changes (direct DB edits) won't trigger it
- Solution: Use manual API revalidation

## Best Practices

1. **Always check logs** after updating clubs to confirm revalidation
2. **Test in incognito** to avoid browser cache confusion
3. **Document cache times** so others know the delay
4. **Use manual revalidate API** for urgent fixes
5. **Consider shorter revalidation times** for frequently updated clubs

## Need Immediate Fix?

Run this now for your problematic club:

```bash
curl -X PUT https://tenisdp.es/api/revalidate \
  -H "Content-Type: application/json" \
  -d '{"city": "sotogrande", "slug": "racquet-leisure-la-reserva-club"}'
```

Then check in incognito: https://www.tenisdp.es/es/clubes/sotogrande/racquet-leisure-la-reserva-club

Should be updated immediately! 🎾
