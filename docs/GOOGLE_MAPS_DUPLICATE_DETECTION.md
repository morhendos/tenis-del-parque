# Google Maps Import Duplicate Detection

This feature enhances the Google Maps import functionality in the admin panel by automatically detecting and marking clubs that already exist in the database before import.

## Features

### 🎯 Intelligent Duplicate Detection
- **Google Place ID matching** (100% accuracy) - Most reliable method
- **Coordinate proximity detection** (within 100m radius) - Catches renamed or slightly moved clubs  
- **Name similarity analysis** (80%+ similarity) - Identifies clubs with similar names in same area
- **Multi-layered confidence scoring** - High/Medium/Low confidence levels

### 🔍 Visual Indicators
- **Existing clubs** are marked with warning badges showing confidence percentage
- **New clubs** display with "New Club" badges 
- **Color-coded status**: Red (high confidence), Yellow (medium), Orange (low)
- **Detailed match information** showing why a club was detected as existing

### 🚫 Import Prevention
- **Disabled checkboxes** for existing clubs to prevent accidental imports
- **Automatic exclusion** from "Select All" functionality
- **Smart pre-selection** - only new clubs are selected by default
- **Clear summary statistics** showing new vs existing counts

### 📊 Match Details
For each detected duplicate, shows:
- **Match type**: Place ID, Coordinates, or Name similarity
- **Confidence percentage**: How certain the system is about the match
- **Distance**: For coordinate-based matches, shows distance in meters
- **Existing club info**: Name, location, import source, creation date
- **Match reason**: Human-readable explanation of why it was flagged

## How It Works

### 1. Search Phase
When user searches for clubs via Google Maps API, the system:
1. Retrieves clubs from Google Maps (as before)
2. **NEW**: Runs duplicate detection against existing database clubs
3. **NEW**: Adds existence flags and match details to each result

### 2. Preview Phase  
The import modal now shows:
- **Enhanced club list** with visual status badges
- **Summary statistics** of new vs existing clubs
- **Detailed match information** for existing clubs
- **Disabled selection** for duplicates

### 3. Import Phase
- Only processes selected (new) clubs
- Existing clubs are automatically skipped
- No changes to actual import logic

## Implementation Files

### Core Logic
- `lib/utils/duplicateDetection.js` - Main duplicate detection utility
- `app/api/admin/clubs/google-import/search/route.js` - Enhanced search API
- `components/admin/clubs/GoogleMapsImporter.js` - Updated UI component

### Detection Methods

#### Method 1: Google Place ID (Highest Priority)
```javascript
// Exact match on Google Place ID - 100% confidence
if (googleClub.place_id === existingClub.googlePlaceId) {
  return { matchType: 'place_id', confidence: 100 }
}
```

#### Method 2: Coordinate Proximity  
```javascript
// Within 100m radius - confidence decreases with distance
const distance = calculateDistance(lat1, lng1, lat2, lng2)
if (distance <= 100) {
  return { 
    matchType: 'coordinates', 
    confidence: Math.max(0, 95 - Math.floor(distance / 10)),
    distance: Math.round(distance)
  }
}
```

#### Method 3: Name Similarity
```javascript
// 80%+ text similarity in same general area
const similarity = calculateTextSimilarity(name1, name2)
if (similarity >= 0.8 && locationMatch) {
  return { 
    matchType: 'name', 
    confidence: Math.round(similarity * 100) 
  }
}
```

## User Experience

### Before Import
❌ **Previous behavior**: Users could import duplicate clubs unknowingly
❌ **Discovery**: Duplicates only detected during actual import (too late)  
❌ **Confusion**: No guidance on which clubs were new vs existing

### After Enhancement  
✅ **Proactive detection**: Duplicates identified before import attempt  
✅ **Visual clarity**: Clear badges show new vs existing status
✅ **Informed decisions**: Users see exactly why a club was flagged as existing
✅ **Prevention**: Impossible to accidentally import duplicates
✅ **Transparency**: Shows match confidence and detection method

## Benefits

### For Administrators
- **Prevents database pollution** with duplicate entries  
- **Saves time** by highlighting only new clubs to import
- **Builds confidence** with transparent match explanations
- **Reduces errors** through automatic duplicate prevention

### For System Integrity
- **Maintains data quality** by preventing duplicates at source
- **Preserves relationships** by not creating conflicting records
- **Reduces cleanup work** by preventing issues rather than fixing them
- **Scales better** as club database grows

## Future Enhancements

### Planned Improvements
- **Bulk edit existing clubs** directly from import modal
- **Merge suggestions** for legitimate duplicates with different data
- **Area-based duplicate detection** using geographic boundaries
- **Machine learning** to improve name similarity detection
- **Import history tracking** to show previous import attempts

### Configuration Options
- **Adjustable confidence thresholds** for different match types
- **Distance radius configuration** for coordinate-based matching
- **Custom similarity algorithms** for different languages/regions
- **Override options** for admin users in special cases

## Testing Scenarios

### High Confidence Matches (90%+)
- ✅ Exact Google Place ID match
- ✅ Same coordinates (0-10m apart)
- ✅ Identical names, same address

### Medium Confidence Matches (70-89%)
- ✅ Very close coordinates (10-50m apart) 
- ✅ Very similar names (90%+ similarity)
- ✅ Same phone number or website

### Low Confidence Matches (50-69%)
- ✅ Moderate coordinate distance (50-100m)
- ✅ Similar names (80-89% similarity)
- ✅ Same general area, similar business type

### Should NOT Match
- ❌ Different cities entirely
- ❌ Completely different names and locations  
- ❌ Different business types (restaurant vs tennis club)
- ❌ Very low name similarity (<80%)

## API Changes

### Search Endpoint Response
```json
{
  "clubs": [
    {
      "place_id": "ChIJ...",
      "name": "Club Example",
      "alreadyExists": true,
      "existingClub": {
        "id": "507f1f77bcf86cd799439011",
        "name": "Club Ejemplo", 
        "slug": "club-ejemplo",
        "matchType": "coordinates",
        "confidence": 92,
        "reason": "Same location (15m apart)",
        "distance": 15
      }
    }
  ],
  "existingSummary": {
    "total": 5,
    "existing": 2, 
    "new": 3,
    "highConfidence": 1,
    "mediumConfidence": 1,
    "lowConfidence": 0
  }
}
```

This enhancement significantly improves the admin experience and system data quality by providing intelligent duplicate detection with clear visual feedback and prevention mechanisms.
