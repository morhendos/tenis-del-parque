# Games Statistics Fix - Dynamic Calculation

## Problem

The standings page was showing "0-0" for games won/lost because it was using stored values from the Player model (`player.stats.gamesWon` and `player.stats.gamesLost`) which were not being populated.

## Initial Approach (Incorrect)

Initially, I tried to:
1. Update games statistics when match results are entered
2. Store games won/lost in the Player model
3. Create a recalculation script for existing data

However, this approach was wrong because the standings are already calculating points dynamically from match data, so games should be calculated the same way.

## Correct Solution

Modified the standings endpoint (`/app/api/leagues/[league]/standings/route.js`) to calculate games dynamically from match scores, just like it calculates points.

### Implementation

```javascript
// Calculate points and games from each match
matches.forEach(match => {
  // ... existing point calculation ...
  
  // Calculate games from match score
  let player1GamesWon = 0
  let player2GamesWon = 0
  
  if (match.result && match.result.score) {
    if (match.result.score.sets && match.result.score.sets.length > 0) {
      // Count games from each set
      match.result.score.sets.forEach(set => {
        player1GamesWon += (set.player1 || 0)
        player2GamesWon += (set.player2 || 0)
      })
    } else if (match.result.score.walkover) {
      // For walkover, winner gets 12-0 (6-0, 6-0)
      const player1Won = match.result.winner.toString() === player1Id
      player1GamesWon = player1Won ? 12 : 0
      player2GamesWon = player1Won ? 0 : 12
    }
  }
  
  // Update calculated stats
  stats.gamesWon += player1GamesWon
  stats.gamesLost += player2GamesWon
})
```

## Benefits

1. **Single Source of Truth**: Match data is the only source for game statistics
2. **Always Accurate**: No sync issues between stored and actual data
3. **Consistent Pattern**: Games are calculated the same way as points
4. **No Migration Needed**: Works immediately for all existing matches

## Testing

1. Enter a match result (e.g., 6-4, 7-5)
2. Check the standings page
3. Games should show correctly calculated values (13-9 and 9-13)

## Files Changed

- `/app/api/leagues/[league]/standings/route.js` - Modified to calculate games dynamically

This is a much cleaner solution that follows the existing pattern of calculating statistics on-the-fly from match data.
