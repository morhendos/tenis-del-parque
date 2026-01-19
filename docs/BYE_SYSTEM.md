# BYE Match System

## Overview

The BYE system handles situations when a league has an **odd number of players**, ensuring everyone can participate in each round even when perfect pairings aren't possible. A player receiving a BYE advances without playing a match and receives automatic points.

The term "BYE" comes from the old English word "by" meaning "aside" - the player stands "by" (aside) while others play.

## How It Works

### Automatic BYE Assignment (Swiss Pairing)
When the Swiss pairing algorithm runs for a round with an odd number of players:
1. One player cannot be paired
2. The algorithm assigns a BYE to the lowest-ranked player who hasn't had a BYE yet
3. The BYE match is created automatically as a completed match

### Manual BYE Creation (Admin Panel)
Admins can manually create BYE matches from the Match Creation page:
1. Navigate to Admin → Matches → Create Matches
2. Select a single player from the available players list
3. Click the "Create BYE" button (emerald colored)
4. The BYE appears in the match pairings list
5. Submit to create the BYE match

## BYE Match Properties

### Points & Scoring
- **Points**: 3 points (equivalent to a 2-0 win)
- **Sets**: 2-0 (virtual score)
- **Games**: 12-0 (6-0, 6-0 virtual score)
- **Status**: Immediately marked as "completed"

### Match Data Structure
```javascript
{
  league: ObjectId,
  season: String,
  round: Number,
  isBye: true,                    // BYE flag
  matchType: 'regular',           // Still counts as regular season
  players: {
    player1: ObjectId,            // Player receiving BYE
    player2: null                 // No opponent
  },
  status: 'completed',            // Immediately completed
  result: {
    winner: ObjectId,             // Same as player1
    score: {
      sets: [
        { player1: 6, player2: 0 },
        { player1: 6, player2: 0 }
      ]
    }
  }
}
```

## Standings Calculation

BYE matches are handled specially in standings:

| Metric | BYE Contribution | Notes |
|--------|------------------|-------|
| Matches Played | 0 | BYEs don't count toward OpenRank matches |
| Matches Won | +1 | Counts as a win |
| Points | +3 | Full points for 2-0 win |
| Sets Won | +2 | Virtual 2-0 score |
| Sets Lost | 0 | - |
| Games Won | +12 | Virtual 6-0, 6-0 score |
| Games Lost | 0 | - |

### Why BYEs Don't Count as "Matches Played"
For ranking systems like OpenRank that require a minimum number of matches, BYEs shouldn't count because:
- No actual tennis was played
- The player didn't face competition
- It would unfairly benefit players who get BYEs

## UI Display

### Player Matches Tab
BYE matches display with:
- Emerald green header and theme
- "BYE · +3 points" label
- Checkmark icon indicating auto-win
- Score shows 6-0, 6-0

### Admin Matches List
BYE matches display with:
- Emerald gradient background
- "BYE" badge instead of status
- "+3 pts" indicator
- "Auto Win" label with checkmark

### Admin Match Creation
When creating a BYE:
- Single player selection triggers BYE option
- Emerald-colored "Create BYE" button
- Special pairing card shows player vs "BYE"
- Dashed border box with checkmark on opponent side

## Validation Rules

### Creating BYE Matches
1. **One BYE per round**: A player cannot have multiple BYEs in the same round
2. **No existing match**: A player cannot receive a BYE if they already have a match in that round
3. **League registration**: Player must be registered in the league

### Model Validation
The Match model pre-save validation handles BYE matches:
- Skips player2 requirement check when `isBye: true`
- Winner validation only checks player1 for BYE matches
- Status can be 'completed' without player2

## API Endpoints

### Create BYE Match
```
POST /api/admin/matches
Body: {
  league: "leagueId",
  season: "winter-2026",
  round: 1,
  player1Id: "playerId",
  isBye: true
}
```

### Response
```json
{
  "message": "BYE match created successfully",
  "match": {
    "_id": "matchId",
    "isBye": true,
    "status": "completed",
    "players": {
      "player1": { "name": "Player Name", ... },
      "player2": null
    },
    "result": {
      "winner": "playerId",
      "score": {
        "sets": [
          { "player1": 6, "player2": 0 },
          { "player1": 6, "player2": 0 }
        ]
      }
    }
  }
}
```

## Files Modified for BYE System

### Models
- `lib/models/Match.js` - Added `isBye` field, conditional validation

### API Routes
- `app/api/admin/matches/route.js` - BYE match creation logic
- `app/api/leagues/[league]/matches/route.js` - Include BYE matches in response

### Components
- `components/admin/matches/MatchCard.js` - BYE display in admin
- `components/player/MatchCardUnified.js` - BYE display for players
- `app/admin/matches/create/page.js` - Manual BYE creation UI

### Services
- `lib/services/standingsService.js` - BYE stats calculation
- `lib/utils/swissPairing.js` - Automatic BYE assignment

## Best Practices

### For League Admins
1. **Odd player counts**: Consider if a BYE is needed before generating rounds
2. **Fairness**: Track who has received BYEs to ensure rotation
3. **Manual assignment**: Use manual BYE creation when Swiss pairing isn't suitable

### For Development
1. **Always check `isBye`**: When filtering or displaying matches
2. **Null safety**: Always handle `player2: null` in BYE matches
3. **Consistent styling**: Use emerald theme for BYE-related UI
4. **Include in queries**: Don't filter out matches where `player2 === null && isBye === true`

## Troubleshooting

### BYE Match Not Appearing
- Check if the API query filters include `isBye` flag
- Verify the match wasn't filtered out due to `player2 === null`

### Wrong Score Display
- Ensure the component reads from `match.result.score.sets`
- Fallback to 6-0, 6-0 if no score data exists

### Standings Not Counting BYE
- Verify `standingsService.js` includes BYE matches in calculation
- Check if `isBye` flag is set correctly on the match
