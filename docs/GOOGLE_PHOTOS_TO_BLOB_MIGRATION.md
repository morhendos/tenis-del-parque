# Google Photos Migration to Vercel Blob

## Overview

Google Places API `photo_reference` tokens expire after a few days/weeks. This causes Next.js Image optimization to fail with 400 errors, creating infinite retry loops that block page functionality.

**Solution:** Download images once and store them permanently in Vercel Blob storage.

## The Problem

When using Google Places photos via dynamic proxy URLs:
```
/api/clubs/photo?photo_reference=ABC123...
```

Issues encountered:
1. **Tokens expire** - `photo_reference` values become invalid after days/weeks
2. **Next.js Image fails** - The `/_next/image` endpoint can't optimize dynamic API routes
3. **Infinite loops** - Browser retries failed requests continuously
4. **Page blocking** - Console errors prevent button clicks and interactions

## The Solution

### Phase 1: Stop Rendering Google Photos (Immediate Fix)

Modified three components to skip Google Photo URLs entirely:

- `components/pages/ClubDetailPageSSG.js`
- `components/clubs/ClubCard.js`  
- `components/cities/CityCard.js`

Each component now has a helper function:
```javascript
const isGooglePhotoUrl = (url) => {
  if (!url) return false
  return String(url).includes('/api/clubs/photo') || 
         String(url).includes('/api/cities/photo') || 
         String(url).includes('photo_reference=')
}
```

### Phase 2: Migrate Existing Photos to Vercel Blob

Created migration scripts in `/scripts/`:

#### `migrate-google-photos-to-blob.js`
Migrates **main images** for clubs and cities:
```bash
# Dry run (preview what would happen)
node scripts/migrate-google-photos-to-blob.js --dry-run

# Run migration
node scripts/migrate-google-photos-to-blob.js
```

#### `migrate-google-gallery-to-blob.js`
Migrates **gallery images** for clubs:
```bash
# Dry run
node scripts/migrate-google-gallery-to-blob.js --dry-run --limit=5

# Run migration (5 photos per club)
node scripts/migrate-google-gallery-to-blob.js --limit=5
```

### Phase 3: Admin Endpoint for New Clubs

Use the new admin endpoint to properly import Google photos for new clubs:
```
POST /api/admin/clubs/import-google-photos-to-blob
```

This endpoint:
1. Fetches fresh photo references from Google Places API
2. Downloads the actual image bytes
3. Uploads to Vercel Blob storage
4. Saves permanent URLs to database

## File Locations

| File | Purpose |
|------|---------|
| `scripts/migrate-google-photos-to-blob.js` | One-time migration of main images |
| `scripts/migrate-google-gallery-to-blob.js` | One-time migration of gallery images |
| `scripts/check-google-photos.js` | Debug script to check photo status |
| `app/api/admin/clubs/import-google-photos-to-blob/route.js` | Admin endpoint for new clubs |

## Database Schema

Images are stored in the `images` field:
```javascript
images: {
  main: String,      // Vercel Blob URL (permanent)
  gallery: [String], // Array of Vercel Blob URLs
  googlePhotoReference: String  // DEPRECATED - do not use
}
```

Google data is still stored for reference:
```javascript
googleData: {
  photos: [{         // For reference only - do not render these
    photo_reference: String,
    height: Number,
    width: Number
  }]
}
```

## Environment Variables Required

```env
MONGODB_URI=...
GOOGLE_MAPS_API_KEY=...
BLOB_READ_WRITE_TOKEN=...  # Get from Vercel Dashboard > Storage > Blob
```

## Migration Results (December 2024)

| Type | Migrated | Total |
|------|----------|-------|
| Club main images | 22 | 22 |
| Club galleries | ~110 photos | 22 clubs |
| City main images | 4 | 4 |

## Best Practices Going Forward

1. **Never render `photo_reference` URLs directly** - Always use Vercel Blob URLs
2. **Use the admin import endpoint** for new clubs to store photos permanently
3. **Upload custom images** when possible - They're better quality than Google's
4. **Run migration scripts** if you notice expired photos

## Troubleshooting

### Images showing placeholders after migration
Next.js caches pages. Either:
- Wait for revalidation (set by `revalidate` in page.js)
- Trigger a redeploy: `git commit --allow-empty -m "rebuild" && git push`

### Migration script fails with "fetch is not defined"
Use Node.js 18+ which has native fetch:
```bash
nvm use 20
node scripts/migrate-google-photos-to-blob.js
```

### Checking photo status
```bash
node scripts/check-google-photos.js
```

## Related Files

- `docs/VERCEL_BLOB_STORAGE_SETUP.md` - Blob storage setup guide
- `app/api/upload/route.js` - General upload endpoint
- `lib/models/Club.js` - Club schema with images field
- `lib/models/City.js` - City schema with images field

---

**Created:** December 31, 2024  
**Status:** Migration Complete ✅
