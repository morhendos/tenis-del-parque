# Club Images Fix Guide

## Problem
Some clubs have broken Google images in their gallery because they were imported using the old system that referenced Google URLs directly instead of downloading and saving them locally.

## Solution

We now have **two ways** to fix broken club images:

### Option 1: Admin Panel UI (Recommended for Individual Clubs)

1. Go to Admin Panel → Clubs
2. Click "Edit" on a club with broken images
3. Navigate to the "Images" tab
4. If the club was imported from Google Maps, you'll see a **"Re-import from Google Maps"** button
5. Click the button to fetch fresh photos from Google Maps API
6. The photos will be downloaded and saved locally
7. You can then select which photos to use as main image or gallery

**Features:**
- ✅ Fetches latest photos from Google Maps
- ✅ Downloads up to 10 photos
- ✅ Works for any club with a `googlePlaceId`
- ✅ Safe to run multiple times
- ✅ Shows progress indicator

### Option 2: Run Fix Scripts (For Bulk Operations)

We have 3 scripts available:

#### 1. Check Script (Diagnostic)
Check how many clubs have Google images that need fixing:

\`\`\`bash
cd /Users/tomaszmikolajewicz/Projects/tenis-del-parque
node scripts/checkGoogleImages.mjs
\`\`\`

**What it does:**
- Counts clubs with Google photo references
- Counts clubs with Google URLs in images
- Shows examples of affected clubs
- Does NOT make any changes

#### 2. Fix One Club (Testing)
Test the fix on a single club first:

\`\`\`bash
node scripts/fixOneClub.mjs
\`\`\`

**What it does:**
- Finds ONE club with Google images
- Downloads up to 3 photos as a test
- Saves them locally in `/public/uploads/clubs/`
- Updates the club's images in the database
- Marks the club as fixed with `googleData.imagesFixed: true`

#### 3. Fix All Clubs (Production)
Fix ALL clubs with broken Google images:

\`\`\`bash
node scripts/fixBrokenImages.mjs
\`\`\`

⚠️ **Important:**
- This will process ALL clubs with Google images
- Downloads up to 10 images per club
- Can take several minutes depending on number of clubs
- Requires `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` in `.env.local`
- Safe to run multiple times (skips already fixed clubs)

**What it does:**
- Finds all clubs with Google images
- Downloads images from Google Maps API
- Saves them locally in `/public/uploads/clubs/`
- Updates club images in database
- Shows progress and statistics

**Example output:**
\`\`\`
Found 25 clubs with Google images to fix

Processing: Real Club Padel Marbella
  Found 8 Google photo references
  ✅ Downloaded 8 images
  ✅ Club images updated successfully

Processing: Tennis Club Costa del Sol
  Found 5 Google photo references
  ✅ Downloaded 5 images
  ✅ Club images updated successfully

========================================
✅ Fixed: 25 clubs
❌ Failed: 0 clubs
📷 Total images downloaded: 156
========================================
\`\`\`

## Prerequisites

Make sure you have:
1. `.env.local` file with `MONGODB_URI` and `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
2. Node.js and npm installed
3. All dependencies installed: `npm install`

## Environment Variables Required

\`\`\`bash
# .env.local
MONGODB_URI=mongodb+srv://your-connection-string
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-google-maps-api-key
GOOGLE_MAPS_API_KEY=your-google-maps-api-key  # Same as above
\`\`\`

## How the Fix Works

1. **Detection**: Scripts find clubs with:
   - `googleData.photos` containing photo references
   - `images.main` or `images.gallery` containing Google URLs
   
2. **Download**: For each club:
   - Fetches image from Google Maps API using photo reference
   - Downloads image as JPEG
   - Saves to `/public/uploads/clubs/[slug]-[timestamp]-[random].jpg`
   
3. **Update**: Updates club record:
   - Sets `images.main` to first downloaded image
   - Sets `images.gallery` to array of downloaded images
   - Adds `googleData.imagesFixed: true` flag
   - Adds `googleData.imagesFixedAt: [timestamp]`

4. **Verification**: You can verify by checking:
   - Images load correctly in admin panel
   - Image URLs start with `/uploads/clubs/` instead of `googleapis.com`
   - No broken image icons

## Best Practice Workflow

### For Testing (before running on production):
1. Run `checkGoogleImages.mjs` to see what needs fixing
2. Run `fixOneClub.mjs` to test on one club
3. Check the club in admin panel to verify
4. If successful, proceed to bulk fix

### For Production:
1. Backup your database first!
2. Run `checkGoogleImages.mjs` to see scope
3. Run `fixBrokenImages.mjs` to fix all clubs
4. Verify a few clubs in admin panel
5. For any new issues, use the UI "Re-import" button

## Troubleshooting

**"MONGODB_URI not found"**
- Add `MONGODB_URI` to your `.env.local` file

**"NEXT_PUBLIC_GOOGLE_MAPS_API_KEY not found"**
- Add the API key to `.env.local`

**"Download failed"**
- Check your Google Maps API key is valid
- Ensure Photos API is enabled in Google Cloud Console
- Check if you've hit API quota limits

**"Re-import button not showing"**
- Club must have been imported from Google Maps (has `googlePlaceId`)
- Make sure you're in edit mode (not read-only)

**Images still broken after fix**
- Clear browser cache
- Check `/public/uploads/clubs/` folder has the images
- Verify file permissions
- Re-run the fix script

## Migration Steps for Production

\`\`\`bash
# 1. SSH into production server
ssh your-server

# 2. Navigate to project
cd /path/to/tenis-del-parque

# 3. Check current state
node scripts/checkGoogleImages.mjs

# 4. Test on one club
node scripts/fixOneClub.mjs

# 5. If successful, fix all
node scripts/fixBrokenImages.mjs

# 6. Verify results
# - Check admin panel
# - View a few club pages
# - Ensure images load correctly
\`\`\`

## Notes

- Scripts use ES modules (.mjs) for consistency
- All downloaded images are saved as JPEG
- Original Google photo references are preserved in `googleData.photos`
- You can re-run scripts safely - they won't duplicate images
- Images are named with timestamp and random string to prevent conflicts
- Maximum 10 photos per club (configurable in script)

## Support

If you encounter issues:
1. Check the script logs for specific error messages
2. Verify API keys are correct
3. Ensure database connection works
4. Check file system permissions for uploads directory
5. Use the admin UI for single club fixes
