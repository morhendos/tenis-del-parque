# City Photo Refresh in Edit Mode

## 🎯 Feature Overview
This feature allows administrators to refresh Google Photos for existing cities directly from the edit interface. Previously, Google Photos could only be fetched when creating a new city.

## ✨ What's New

### 1. **Refresh Google Photos Button**
- Located in the **Images** section when editing an existing city
- Blue information panel with "Refresh Photos from Google" button
- Shows the current Google Place ID if available

### 2. **Automatic Place ID Detection**
- If a city doesn't have a Google Place ID, the system will:
  1. Search for the city by name on Google Maps
  2. Automatically detect and save the Place ID
  3. Update coordinates and formatted address

### 3. **Photo Fetching Process**
- Fetches fresh photos from Google Places API
- Automatically sets the first photo as the main city image
- Updates the gallery with all available Google Photos
- Shows success message with photo count

## 📸 How to Use

### For Cities WITH Google Place ID:
1. Navigate to **Admin → Cities**
2. Click **Edit** on any city
3. Go to the **Images** tab
4. Click **"Refresh Photos from Google"**
5. Wait for photos to load
6. Click **"Update City"** to save

### For Cities WITHOUT Google Place ID:
1. Navigate to **Admin → Cities**
2. Click **Edit** on any city
3. Go to the **Images** tab
4. Click **"Refresh Photos from Google"**
5. System will automatically:
   - Search for the city on Google Maps
   - Find and save the Place ID
   - Fetch available photos
6. Click **"Update City"** to save

## 🔄 What Gets Updated

When refreshing photos, the following data is updated:
- ✅ Main city image
- ✅ Google Photo Reference
- ✅ Gallery of all available photos
- ✅ Google Place ID (if missing)
- ✅ GPS Coordinates (if missing or outdated)
- ✅ Formatted Address (if missing)
- ✅ Google Data (types, address components, viewport)

## 💡 Benefits

1. **Keep Photos Current**: Refresh photos anytime to get the latest from Google
2. **Fix Missing Data**: Automatically fills in missing Place IDs and coordinates
3. **Batch Processing**: Can quickly update multiple cities with fresh photos
4. **Data Consistency**: Ensures all cities have proper Google data

## ⚠️ Important Notes

- **Save Required**: After refreshing photos, you must click "Update City" to save changes
- **Unsaved Changes**: The orange indicator will show when photos have been refreshed but not saved
- **API Limits**: Google Places API has rate limits, avoid refreshing too many cities at once
- **Photo Availability**: Not all cities have photos on Google Maps

## 🛠️ Technical Details

### API Endpoints Used:
- `/api/admin/cities/search-google` - Find city and Place ID
- `/api/admin/cities/fetch-photos` - Get photos for a Place ID
- `/api/admin/cities/google-photo` - Proxy for displaying Google Photos

### Data Flow:
1. Click refresh → Search for city (if no Place ID)
2. Get Place ID → Fetch photos from Google
3. Update form data → Show success message
4. Save changes → Update database

## 🐛 Troubleshooting

### "City needs a Google Place ID or name to fetch photos"
- Ensure the city has a Spanish name set in Basic Info

### "Could not find city on Google Maps"
- Check the city name spelling
- Try searching with a more common name variation

### "No photos found for this city on Google Maps"
- Some smaller cities may not have photos on Google
- Try uploading custom photos instead

## 📝 Testing Checklist

- [ ] Test refreshing photos for a city WITH Place ID
- [ ] Test refreshing photos for a city WITHOUT Place ID
- [ ] Verify coordinates are updated if missing
- [ ] Verify formatted address is updated
- [ ] Check that photos display correctly
- [ ] Confirm save functionality works
- [ ] Test error handling for invalid cities

## 🚀 Next Steps

### For File Upload Issues in Production:
The companion issue about file uploads failing in production requires a separate solution:
1. Implement cloud storage (Cloudinary/S3)
2. Update `/api/upload` endpoint
3. See separate documentation for cloud storage setup

## 📊 Impact

This feature improves the city management workflow by:
- Reducing manual work to update city photos
- Ensuring data consistency across all cities
- Making it easy to keep city information current
- Providing a seamless way to enhance existing cities with Google data

---

**Branch**: `feature/city-photo-refresh-edit-mode`
**Status**: ✅ Ready for Testing
**Author**: Assistant
**Date**: August 24, 2025
