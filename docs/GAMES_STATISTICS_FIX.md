# Games Statistics Fix

## Problem

The standings page was showing "0-0" for games won/lost for all players, even when they had played matches and won/lost games.

## Root Cause

When match results were entered, the system was correctly updating:
- Match wins/losses
- Sets won/lost
- ELO ratings

However, it was **not** calculating and updating the individual games won/lost within each set.

## Solution

### 1. Updated Match Result Processing

Modified `/app/api/admin/matches/[id]/route.js` to:
- Count games from each set when a match result is entered
- Update both players' `gamesWon` and `gamesLost` statistics
- Handle walkover matches (winner gets 12-0 in games)

### 2. Recalculation Script

Created `/scripts/recalculateGamesStats.js` to:
- Recalculate games statistics for all existing completed matches
- Reset all players' games stats to 0 first
- Process each match and count games from set scores
- Update player statistics accordingly

## Implementation Details

### Code Changes

```javascript
// Count games from sets
let player1GamesWon = 0
let player2GamesWon = 0

if (body.result.score && body.result.score.sets && body.result.score.sets.length > 0) {
  // Count games from each set
  body.result.score.sets.forEach(set => {
    player1GamesWon += set.player1
    player2GamesWon += set.player2
  })
} else if (body.result.score && body.result.score.walkover) {
  // For walkover, winner gets 12-0 (6-0, 6-0)
  player1GamesWon = player1Won ? 12 : 0
  player2GamesWon = player1Won ? 0 : 12
}

// Update player statistics
player1.stats.gamesWon = (player1.stats.gamesWon || 0) + player1GamesWon
player1.stats.gamesLost = (player1.stats.gamesLost || 0) + player2GamesWon

player2.stats.gamesWon = (player2.stats.gamesWon || 0) + player2GamesWon
player2.stats.gamesLost = (player2.stats.gamesLost || 0) + player1GamesWon
```

## Usage

### For New Matches
Games statistics will be automatically calculated when match results are entered going forward.

### For Existing Matches
Run the recalculation script to update historical data:

```bash
npm run recalculate:games
```

This will:
1. Connect to the database
2. Reset all players' games statistics
3. Process all completed matches
4. Calculate and update games won/lost for each player
5. Display a summary of the update

## Testing

1. Enter a match result with scores like 6-4, 6-3
2. Check the standings page
3. Player 1 should show 12-7 games
4. Player 2 should show 7-12 games

## Files Modified

- `/app/api/admin/matches/[id]/route.js` - Added games calculation to match result processing
- `/scripts/recalculateGamesStats.js` - New script to fix existing data
- `/package.json` - Added `recalculate:games` script command
