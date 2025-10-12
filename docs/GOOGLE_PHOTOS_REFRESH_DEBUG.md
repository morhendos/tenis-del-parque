# Debugging Google Photos Re-import

## Common Issues and Solutions

### Error: "This club was not imported from Google Maps"
**Cause:** The club doesn't have a `googlePlaceId`  
**Solution:** This feature only works for clubs imported via Google Maps. You'll need to manually upload images for this club.

### Error: "Google Maps API key not configured"
**Cause:** Missing `GOOGLE_MAPS_API_KEY` in environment variables  
**Solution:**
```bash
# Add to .env.local
GOOGLE_MAPS_API_KEY=your_api_key_here
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key_here  # Same key
```

### Error: "Google Maps API error: INVALID_REQUEST"
**Cause:** API key doesn't have Places API enabled  
**Solution:**
1. Go to Google Cloud Console
2. Navigate to APIs & Services → Enable APIs
3. Enable "Places API" and "Maps JavaScript API"

### Error: "REQUEST_DENIED"
**Cause:** API key restrictions or quota exceeded  
**Solution:**
1. Check API key restrictions in Google Cloud Console
2. Verify billing is enabled
3. Check if you've exceeded quota limits

### Error: "ZERO_RESULTS" or "NOT_FOUND"
**Cause:** Google Place ID no longer exists or has changed  
**Solution:** The club's Google Place ID may be outdated. You'll need to:
1. Manually upload images OR
2. Re-import the club from Google Maps

## Testing the Feature

### Step 1: Check Club Data
In MongoDB or admin panel, verify the club has:
- `googlePlaceId`: Should be a string like "ChIJ..."
- `googleData.photos`: May be empty (that's ok)

### Step 2: Test API Directly
Test the endpoint manually:
```bash
curl -X POST http://localhost:3000/api/admin/clubs/refresh-google-photos \
  -H "Content-Type: application/json" \
  -d '{"clubId": "YOUR_CLUB_ID_HERE"}'
```

### Step 3: Check Server Logs
Look for detailed error messages in the server console. The error will show:
- Exact Google Maps API error
- Stack trace for debugging

## Successful Response
When it works, you'll see:
- ✅ "Successfully refreshed X photos from Google Maps" toast
- Photos appear in the Google Photos section
- Can select photos to use as main/gallery images

## Still Having Issues?

1. **Check environment variables are loaded:**
   ```bash
   # Restart your dev server
   npm run dev
   ```

2. **Verify API key permissions:**
   - Key should allow HTTP referrers from your domain
   - Places API must be enabled
   - Billing must be active

3. **Check the browser console:**
   - Look for network errors
   - Check the response body from the API

4. **Check server logs:**
   - Shows detailed error from Google Maps API
   - Stack traces for debugging

## Example Working Flow

1. Admin clicks "Re-import from Google Maps"
2. API fetches club's `googlePlaceId`
3. Calls Google Maps Places API with that ID
4. Gets back up to 10 photos with `photo_reference`
5. Saves references to `club.googleData.photos`
6. Photos immediately available in UI
7. Can click to set as main image
8. When saved, photo is downloaded and stored locally

## Need More Help?

Check the server console output - it will have the exact error from Google Maps API.
