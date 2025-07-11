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
      match.result.score.sets.forEach((set, index) => {
        const p1Games = set.player1 || 0
        const p2Games = set.player2 || 0
        
        // Check if this is a super tiebreak (third set with scores >= 10)
        const isThirdSet = index === 2
        const isSuperTiebreak = isThirdSet && (p1Games >= 10 || p2Games >= 10)
        
        if (isSuperTiebreak) {
          // Super tiebreak counts as 1 game for the winner
          if (p1Games > p2Games) {
            player1GamesWon += 1
            player2GamesWon += 0
          } else {
            player1GamesWon += 0
            player2GamesWon += 1
          }
        } else {
          // Regular set - count actual games
          player1GamesWon += p1Games
          player2GamesWon += p2Games
        }
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

## Super Tiebreak Handling

The fix includes special handling for super tiebreaks:
- A third set with scores >= 10 is detected as a super tiebreak
- Super tiebreaks count as 1 game for the winner, 0 for the loser
- Regular sets count actual games played

### Example
Match result: 5-7, 7-5, 10-8
- Set 1: 5 games (player 1) + 7 games (player 2) = 12 games
- Set 2: 7 games (player 1) + 5 games (player 2) = 12 games  
- Set 3: 1 game (player 1 wins super tiebreak) = 1 game
- Total: Player 1: 13 games won, 12 games lost

## Benefits

1. **Single Source of Truth**: Match data is the only source for game statistics
2. **Always Accurate**: No sync issues between stored and actual data
3. **Consistent Pattern**: Games are calculated the same way as points
4. **No Migration Needed**: Works immediately for all existing matches
5. **Correct Tennis Scoring**: Super tiebreaks properly counted as 1 game

## Testing

1. Enter a match result with super tiebreak (e.g., 5-7, 7-5, 10-8)
2. Check the standings page
3. Games should show correctly (13-12, not 22-20)

## Files Changed

- `/app/api/leagues/[league]/standings/route.js` - Modified to calculate games dynamically with super tiebreak handling

This is a much cleaner solution that follows the existing pattern of calculating statistics on-the-fly from match data while properly handling tennis scoring conventions.
