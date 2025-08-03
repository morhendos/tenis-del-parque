# Season System Refactor

## Overview

We've completely refactored the chaotic season naming system to use a proper, clean, database-driven approach.

## The Problem (Before)

The old system was a mess:
- **URL slugs**: `verano2025`, `summer2025`, `otono2025`, etc.
- **Display names**: Manual mapping in components
- **Database keys**: `summer-2025`, inconsistent with URLs
- **No internationalization**: Hardcoded translations
- **No structure**: 4 seasons per year not standardized

## The Solution (After)

### 1. New Season Model (`lib/models/Season.js`)

```javascript
{
  year: 2025,
  type: 'summer', // spring, summer, autumn, winter
  slugs: {
    en: 'summer2025',
    es: 'verano2025'
  },
  names: {
    en: 'Summer 2025',
    es: 'Verano 2025'
  },
  startDate: Date,
  endDate: Date,
  status: 'active', // upcoming, registration_open, active, completed
  order: 2 // 1=Spring, 2=Summer, 3=Autumn, 4=Winter
}
```

### 2. Season Utils (`lib/utils/seasonUtils.js`)

- `findSeasonBySlug(slug, language)` - Find season by URL slug
- `getSeasonDisplayName(season, language)` - Get translated name
- `initializeSeasons(years)` - Create all seasons for given years
- `getCurrentSeason()` - Get currently active season
- Legacy support during migration

### 3. Updated League Page

- Uses proper Season objects instead of manual mapping
- Cleaner season name display with proper translations
- Backward compatibility during migration

## Migration Steps

### 1. Seed the Database

```bash
node scripts/seedSeasons.mjs
```

This creates standardized seasons for 2024, 2025, 2026.

### 2. Update Existing Code

**Before:**
```javascript
const seasonMap = {
  'verano2025': 'Summer 2025',
  // ... messy manual mapping
}
const displayName = seasonMap[seasonKey]
```

**After:**
```javascript
import { findSeasonBySlug, getSeasonDisplayName } from '@/lib/utils/seasonUtils'

const season = await findSeasonBySlug(seasonSlug, language)
const displayName = season.getName(language)
```

### 3. URL Structure

**Clean URLs maintained:**
- English: `/en/sotogrande/liga/summer2025`
- Spanish: `/es/sotogrande/liga/verano2025`

**Database references:**
- Season objects with proper IDs
- Backward compatible `dbKey` virtual field

## Benefits

✅ **Clean & Consistent**: One source of truth for seasons  
✅ **Internationalized**: Proper translations for all languages  
✅ **Scalable**: Easy to add new years/seasons  
✅ **Type Safe**: Proper validation and structure  
✅ **SEO Friendly**: Clean, consistent URLs  
✅ **Maintainable**: No more hardcoded mappings  

## Standard Seasons

Each year has 4 standardized seasons:

| Season | Order | English Slug | Spanish Slug | Start Date | End Date |
|--------|-------|--------------|--------------|------------|----------|
| Spring | 1 | spring2025 | primavera2025 | Mar 21 | Jun 20 |
| Summer | 2 | summer2025 | verano2025 | Jun 21 | Sep 22 |
| Autumn | 3 | autumn2025 | otono2025 | Sep 23 | Dec 20 |
| Winter | 4 | winter2025 | invierno2025 | Dec 21 | Mar 20 |

## Implementation Status

- ✅ Season model created
- ✅ Season utilities implemented  
- ✅ League page updated
- ✅ Seeding script ready
- ⏳ API routes need updating
- ⏳ Player/Match models need migration
- ⏳ Admin interface needs updating

## Next Steps

1. **Run seeding script** to populate seasons (`node scripts/seedSeasons.mjs`)
2. **Update API routes** to use new Season model
3. **Migrate existing data** from old format to new
4. **Update admin interface** to manage seasons properly
5. **Add season management UI** for administrators

This refactor eliminates the season naming chaos and provides a solid foundation for scalable season management! 🎉