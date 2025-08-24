# Multi-Sport Courts Implementation Summary

## Overview
We've successfully added support for tennis, padel, and pickleball courts to the club management system. This allows clubs to specify different types of courts they offer, which is especially important in Spain where padel is very popular.

## Changes Made

### 1. Database Schema (`lib/models/Club.js`)
- **New Structure**: Courts are now organized by sport type:
  ```javascript
  courts: {
    tennis: {
      total: Number,
      indoor: Number,
      outdoor: Number,
      surfaces: [{ type: String, count: Number }]
    },
    padel: {
      total: Number,
      indoor: Number,
      outdoor: Number,
      surfaces: [{ type: String, count: Number }]
    },
    pickleball: {
      total: Number,
      indoor: Number,
      outdoor: Number,
      surfaces: [{ type: String, count: Number }]
    }
  }
  ```
- **Surface Types**:
  - Tennis: clay, hard, grass, synthetic, carpet
  - Padel: synthetic, glass, concrete
  - Pickleball: hard, synthetic, wood
- **Backward Compatibility**: Legacy fields maintained for smooth migration
- **Virtual Property**: `totalAllCourts` calculates total across all sports

### 2. API Routes
- **`/api/admin/clubs/route.js`**: Updated POST route for creating clubs
- **`/api/admin/clubs/[id]/route.js`**: Updated PUT route for updating clubs
- Both routes now:
  - Handle the new court structure
  - Calculate totals automatically
  - Validate at least one court exists
  - Support legacy data migration

### 3. Admin Interface
- **New Component**: `CourtsManager.js`
  - Tabbed interface for each sport
  - Visual indicators with emojis (🎾 Tennis, 🏸 Padel, 🏓 Pickleball)
  - Separate indoor/outdoor counts for each sport
  - Sport-specific surface types
  - Total courts summary across all sports
  - Helpful tips for administrators

### 4. Migration Support
- **Script**: `scripts/migrateCourtsData.js`
  - Converts legacy court data to new structure
  - Detects padel courts from surface types
  - Preserves all existing data
  - Run with: `node scripts/migrateCourtsData.js`

## How to Use in Admin Panel

### Adding Courts to a Club:
1. Navigate to Admin → Clubs
2. Create/Edit a club
3. In Step 3 (Courts), you'll see three tabs:
   - **Tennis Tab**: Add traditional tennis courts
   - **Padel Tab**: Add padel courts (very popular in Spain)
   - **Pickleball Tab**: Add pickleball courts (growing sport)
4. For each sport:
   - Specify indoor courts
   - Specify outdoor courts
   - Optionally add surface types
5. Total is calculated automatically

### Example Configurations:
- **Tennis-only club**: 6 outdoor clay courts
- **Mixed club**: 4 tennis courts + 8 padel courts
- **Modern facility**: 2 tennis + 4 padel + 2 pickleball

## Public Display
The public club pages will need to be updated to display the new court types properly. Currently, they still show the legacy structure.

### To Update Public Pages:
1. Check for `courts.tennis`, `courts.padel`, `courts.pickleball`
2. Display each sport section if it has courts
3. Show appropriate icons and labels
4. Group surfaces by sport type

## Next Steps

### Required:
1. Update `ClubFormModal.js` to import and use `CourtsManager`
2. Update public club detail page to display new court structure
3. Run migration script on production database

### Optional Enhancements:
1. Add court availability/booking system
2. Add pricing per court type
3. Add court maintenance schedule
4. Add court photos gallery
5. Filter clubs by court type (tennis/padel/pickleball)

## Testing Checklist
- [ ] Create club with tennis courts only
- [ ] Create club with padel courts only
- [ ] Create club with mixed courts
- [ ] Edit existing club to add new court types
- [ ] Verify totals calculate correctly
- [ ] Test surface types for each sport
- [ ] Verify public page displays correctly
- [ ] Test migration script on test data

## Database Migration
Before deploying to production:
1. Backup database
2. Run migration script: `node scripts/migrateCourtsData.js`
3. Verify all clubs migrated correctly
4. Test admin panel with migrated data

## Benefits
- **Flexibility**: Clubs can specify exactly what sports they offer
- **Accuracy**: Players know what courts are available
- **SEO**: Better search results for "padel courts" or "pickleball courts"
- **Future-proof**: Easy to add more court types if needed
- **User Experience**: Clear distinction between different sports
