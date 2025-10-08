# Match Import Season Fix Documentation

## Problem Description
After exporting matches from production and importing them to local environment, the public league pages show no matches, points, or standings - even though the matches are visible in the admin panel with correct results.

## Root Cause
The issue is caused by a **season field format mismatch** between imported matches and their associated leagues:

### The Season Format Problem
1. **Leagues** can use different season formats:
   - **ObjectId**: Reference to a Season document (e.g., `ObjectId("507f1f77bcf86cd799439011")`)
   - **Nested Object**: Embedded season data (e.g., `{year: 2025, type: "summer", number: 1}`)
   - **String** (legacy): Simple string format (e.g., `"summer-2025"`)

2. **Original Import Bug**: The match import function was always setting the season field as a string (`"summer-2025"`), regardless of what format the league used.

3. **Query Mismatch**: The public league page API queries for matches where `season: league.season`. If the league uses an ObjectId or nested object but the match has a string, no matches are found.

## How It Works in Production vs Local

### Production
- Matches were created through the app's normal flow, which correctly copies the season format from the league
- League and matches have matching season formats
- Public pages work correctly

### Local (After Import)
- Exported CSV contains season as a string
- Import function sets season as string
- League may have ObjectId or nested object format
- Season formats don't match = no matches found

## The Fix

### 1. Updated Match Import Route
The import route now intelligently determines the correct season format:

```javascript
// Check what format the league is using for seasons
if (league.season) {
  if (mongoose.Types.ObjectId.isValid(league.season)) {
    // League uses Season ObjectId - use the same
    season = league.season
  } else if (typeof league.season === 'object' && league.season.year && league.season.type) {
    // League uses nested object - copy it
    season = {
      year: league.season.year,
      type: league.season.type,
      number: league.season.number || 1
    }
  }
}
```

### 2. Fix Script for Existing Matches
Run this script to fix already-imported matches:

```bash
node scripts/fixImportedMatchSeasons.js
```

This script:
- Finds all matches with string seasons
- Checks their league's season format
- Updates matches to use the same format as their league
- Verifies the fix worked

## Implementation Steps

### For New Imports
The fix is already applied to `/app/api/admin/matches/import/route.js`. Just use the import functionality normally.

### For Existing Imported Matches
1. Run the fix script:
   ```bash
   cd /Users/tomaszmikolajewicz/Projects/tenis-del-parque
   node scripts/fixImportedMatchSeasons.js
   ```

2. Verify the fix:
   - Check a public league page
   - Standings and matches should now appear
   - Points should be calculated correctly

## Testing Checklist

- [ ] Export matches from production
- [ ] Import matches to local
- [ ] Check admin panel shows matches ✓
- [ ] Check public league page shows standings ✓
- [ ] Check player points are calculated ✓
- [ ] Check match history appears ✓

## Future Considerations

### Standardization Needed
The project should standardize on one season format across all collections:
1. **Recommended**: Use Season ObjectIds everywhere
2. Run migration to convert all leagues to use Season ObjectIds
3. Update all code to expect ObjectIds only

### Export Format Enhancement
Consider updating the export to include:
- League slug/ID for better matching
- Season format indicator
- More robust player identification (ID + email)

## Related Files
- `/app/api/admin/matches/import/route.js` - Fixed import route
- `/app/api/admin/matches/export/route.js` - Export route
- `/app/api/leagues/[league]/standings/route.js` - Public standings API
- `/scripts/fixImportedMatchSeasons.js` - Fix script for existing matches
- `/lib/models/Match.js` - Match model (season is Mixed type)
- `/lib/models/League.js` - League model (season can vary)
- `/lib/models/Season.js` - Season model (the proper reference)

## Debug Commands

Check season formats in your database:
```javascript
// In MongoDB shell or script
// Check league season formats
db.leagues.find({}, {name: 1, slug: 1, season: 1})

// Check match season formats  
db.matches.aggregate([
  {$group: {
    _id: {$type: "$season"},
    count: {$sum: 1}
  }}
])

// Find mismatched seasons
db.matches.aggregate([
  {$lookup: {
    from: "leagues",
    localField: "league",
    foreignField: "_id",
    as: "leagueData"
  }},
  {$unwind: "$leagueData"},
  {$match: {
    $expr: {$ne: ["$season", "$leagueData.season"]}
  }},
  {$count: "mismatched"}
])
```
