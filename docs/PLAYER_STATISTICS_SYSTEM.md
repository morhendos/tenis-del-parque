# Player Statistics System Documentation

## Overview

The Tenis del Parque platform implements a sophisticated player statistics system that tracks ELO ratings and match performance across multiple leagues. This document explains the architecture, data flow, and key principles of the system.

## Core Principles

### 1. **Matches Are the Source of Truth**
- All player statistics are derived from completed matches
- Match documents contain the definitive record of what happened
- Statistics are cached for performance but can always be recalculated from matches

### 2. **Global ELO System**
- Each player has **one global ELO rating** that applies across all leagues
- ELO is stored at the player document level (`player.eloRating`)
- When a player joins multiple leagues, their ELO carries over
- ELO changes from any league affect the player's global rating

### 3. **League-Specific Statistics**
- Match counts, wins/losses, and sets are tracked per league
- Stored in `player.registrations[].stats` for performance
- Each registration represents a player's participation in a specific league/season

## Data Architecture

### Player Document Structure

```javascript
{
  _id: ObjectId,
  name: String,
  email: String,
  
  // GLOBAL ELO (applies across all leagues)
  eloRating: Number,        // Current ELO (default based on level)
  highestElo: Number,       // Highest ELO ever achieved
  lowestElo: Number,        // Lowest ELO ever achieved
  
  // League registrations
  registrations: [{
    league: ObjectId,
    season: Mixed,          // Can be ObjectId, Object, or String
    level: String,          // 'beginner', 'intermediate', 'advanced'
    status: String,         // 'pending', 'confirmed', 'active'
    
    // LEAGUE-SPECIFIC STATS (cached for performance)
    stats: {
      matchesPlayed: Number,
      matchesWon: Number,
      setsWon: Number,
      setsLost: Number
      // Note: NO eloRating here - ELO is global only
    },
    
    // Match history (last 20 matches for performance)
    matchHistory: [{
      match: ObjectId,
      opponent: ObjectId,
      result: String,       // 'won' or 'lost'
      score: String,        // Display format
      eloChange: Number,    // ELO change from this match
      eloAfter: Number,     // Global ELO after this match
      round: Number,
      date: Date
    }],
    
    registeredAt: Date
  }]
}
```

### Match Document Structure

```javascript
{
  _id: ObjectId,
  league: ObjectId,
  season: Mixed,            // Must match league's season format
  round: Number,
  
  players: {
    player1: ObjectId,
    player2: ObjectId
  },
  
  status: String,           // 'scheduled', 'completed', etc.
  
  result: {
    winner: ObjectId,
    score: {
      sets: [{ player1: Number, player2: Number }],
      walkover: Boolean
    },
    playedAt: Date
  },
  
  // ELO changes (audit trail)
  eloChanges: {
    player1: {
      before: Number,
      after: Number,
      change: Number
    },
    player2: {
      before: Number,
      after: Number,
      change: Number
    }
  }
}
```

## ELO System Details

### Starting ELO Values
- **Beginner**: 1100 ELO
- **Intermediate**: 1200 ELO
- **Advanced**: 1300 ELO

### ELO Calculation
- Uses standard ELO formula with K-factor of 32
- Only applies to non-walkover matches
- Formula: `change = K * (actual_result - expected_result)`
- Expected result based on ELO difference between players

### ELO Ranges by Level
- **Beginner**: 1000-1199
- **Intermediate**: 1200-1299
- **Advanced**: 1300+

## Statistics Update Flow

### When a Match is Completed

1. **ELO Calculation**
   ```javascript
   // Calculate ELO change based on current ratings
   const eloChange = calculateEloChange(player1Elo, player2Elo, player1Won)
   ```

2. **Global ELO Update**
   ```javascript
   // Update global ELO for both players
   player1.eloRating += eloChange
   player2.eloRating -= eloChange
   
   // Track highest/lowest ELO
   if (player1.eloRating > player1.highestElo) {
     player1.highestElo = player1.eloRating
   }
   ```

3. **League-Specific Stats Update**
   ```javascript
   // Update cached stats in registrations
   player1Registration.stats.matchesPlayed += 1
   if (player1Won) player1Registration.stats.matchesWon += 1
   
   // Update sets won/lost
   player1Registration.stats.setsWon += player1SetsWon
   player1Registration.stats.setsLost += player2SetsWon
   ```

4. **Match History Update**
   ```javascript
   // Add to match history (keep last 20)
   player1Registration.matchHistory.unshift({
     match: matchId,
     opponent: player2Id,
     result: player1Won ? 'won' : 'lost',
     eloChange: eloChange,
     eloAfter: player1.eloRating,  // Global ELO
     // ... other fields
   })
   ```

5. **Audit Trail**
   ```javascript
   // Store ELO changes in match for audit
   match.eloChanges = {
     player1: { before: oldElo, after: newElo, change: eloChange },
     player2: { before: oldElo, after: newElo, change: -eloChange }
   }
   ```

### When a Match is Reset/Changed

1. **Reverse Statistics**
   - Subtract match from `matchesPlayed` and `matchesWon`
   - Reverse ELO changes
   - Remove from match history
   - Clear match `eloChanges`

2. **Recalculate ELO Extremes**
   - Update `highestElo` and `lowestElo` if necessary
   - May require checking match history for accuracy

## Key Components

### 1. Centralized Statistics Service
**File**: `/lib/services/playerStatsService.js`

**Purpose**: Single source of truth for all statistics operations

**Key Functions**:
- `updatePlayerStatsOnMatchComplete()` - Updates stats when match is completed
- `reversePlayerStatsOnMatchReset()` - Reverses stats when match is reset
- `calculateEloChange()` - ELO calculation logic
- `getInitialEloByLevel()` - Starting ELO based on player level

### 2. Match Result APIs
**Files**: 
- `/app/api/player/matches/result/route.js` - Player-facing match result submission
- `/app/api/admin/matches/[id]/route.js` - Admin match management

**Integration**: Both APIs use the centralized statistics service for consistency

### 3. Admin Players API
**File**: `/app/api/admin/players/route.js`

**Key Feature**: Aggregation pipeline that combines:
- Global ELO fields from player document
- League-specific stats from registrations
- League and user information

### 4. Recalculation Tools
**Files**:
- `/app/api/admin/players/[id]/recalculate-elo/route.js` - Single player recalculation
- `/scripts/recalculateAllPlayerStats.js` - Mass recalculation script

**Purpose**: Fix statistics when data inconsistencies occur

## Season Format Compatibility

### The Problem
Different leagues may use different season formats:
- **ObjectId**: Reference to Season document
- **Nested Object**: `{year: 2025, type: "summer", number: 1}`
- **String**: Legacy format like `"summer-2025"`

### The Solution
The statistics service automatically detects and uses the same season format as the target league:

```javascript
// Check league's season format
if (mongoose.Types.ObjectId.isValid(league.season)) {
  // Use ObjectId format
  matchSeason = league.season
} else if (typeof league.season === 'object') {
  // Use nested object format
  matchSeason = { ...league.season }
} else {
  // Handle string format or create default
}
```

## Performance Considerations

### 1. Statistics Caching
- League-specific stats are cached in `player.registrations[].stats`
- Avoids expensive aggregations on every page load
- Stats are updated in real-time when matches change

### 2. Match History Limits
- Only last 20 matches stored per registration
- Prevents document bloat while maintaining recent history
- Full history can be reconstructed from match documents if needed

### 3. Transaction Safety
- All statistics updates use MongoDB transactions
- Ensures consistency between player and match documents
- Prevents partial updates during failures

## Display Logic

### Admin Panel
```javascript
// Shows global ELO
<div>ELO: {player.eloRating || 1200}</div>

// Shows league-specific W/L
<div>W/L: {player.stats?.matchesWon || 0}/{(player.stats?.matchesPlayed || 0) - (player.stats?.matchesWon || 0)}</div>
```

### Public Pages
Uses `standingsService.js` to calculate stats from matches in real-time for accuracy.

## Common Operations

### Adding a New Player
1. Create player document with appropriate starting ELO
2. Add registration with empty stats
3. Stats will be populated as matches are played

### Importing Matches
1. Use centralized statistics service
2. Ensure season format matches league
3. Process matches chronologically for accurate ELO progression

### Recalculating Statistics
1. Reset all cached stats to defaults
2. Process all matches chronologically
3. Update both global ELO and league-specific stats

## Troubleshooting

### Players Show Default ELO (1200)
- Check if admin API includes `eloRating` field in projection
- Verify player documents have `eloRating` field populated

### Matches Not Appearing on Public Pages
- Check season format compatibility between league and matches
- Use diagnostic script: `node scripts/diagnoseSeasonIssue.js`

### Statistics Don't Match Reality
- Run recalculation: `node scripts/recalculateAllPlayerStats.js`
- Check for matches with inconsistent season formats

## Future Improvements

### 1. ELO Standardization
- Migrate all leagues to use Season ObjectIds
- Eliminate season format compatibility complexity

### 2. Performance Optimization
- Consider separate statistics collection for complex queries
- Implement background statistics recalculation

### 3. Advanced Analytics
- Track ELO progression over time
- Implement rating confidence intervals
- Add head-to-head statistics

## Related Files

### Core System
- `/lib/services/playerStatsService.js` - Centralized statistics service
- `/lib/models/Player.js` - Player data model
- `/lib/models/Match.js` - Match data model

### APIs
- `/app/api/admin/players/route.js` - Admin players listing
- `/app/api/admin/matches/[id]/route.js` - Admin match management
- `/app/api/player/matches/result/route.js` - Player match results

### UI Components
- `/components/admin/players/PlayerTableRow.js` - Admin player display
- `/components/admin/matches/MatchOverviewTab.js` - Match ELO display

### Utilities
- `/scripts/recalculateAllPlayerStats.js` - Mass recalculation
- `/scripts/diagnoseSeasonIssue.js` - Season format diagnostics
- `/scripts/updatePlayerEloStartingPoints.js` - ELO starting point updates

### Content
- `/lib/content/eloContent.js` - User-facing ELO explanations
- `/lib/content/rulesContent.js` - Rules and categories

---

## Quick Reference

### ELO Starting Points
```javascript
const eloRatings = {
  'beginner': 1100,
  'intermediate': 1200,
  'advanced': 1300
}
```

### Statistics Update Pattern
```javascript
// 1. Calculate ELO change
const eloChange = calculateEloChange(player1Elo, player2Elo, player1Won)

// 2. Update global ELO
player1.eloRating += eloChange

// 3. Update league stats
registration.stats.matchesPlayed += 1
if (won) registration.stats.matchesWon += 1

// 4. Update match history
registration.matchHistory.unshift(matchEntry)

// 5. Save with transaction
await player.save({ session })
```

### Key Principles to Remember
1. **ELO is global** - one rating across all leagues
2. **Match stats are league-specific** - cached in registrations
3. **Matches are source of truth** - stats can be recalculated
4. **Use centralized service** - don't duplicate statistics logic
5. **Season formats must match** - between leagues and matches
