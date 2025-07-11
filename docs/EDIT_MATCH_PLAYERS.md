# Edit Match Players Feature

This document describes the implementation of the match player editing feature for the admin panel.

## Overview

The match player editing feature allows administrators to change the players assigned to a match after it has been created, as long as the match has not been completed yet.

## Components

### 1. **MatchPlayersTab Component** (`components/admin/matches/MatchPlayersTab.js`)
- Provides the UI for editing players in a match
- Fetches available players from the same league
- Validates player selections (no duplicate players)
- Prevents editing of completed matches
- Shows current players and allows selection of new ones

### 2. **API Endpoint Update** (`app/api/admin/matches/[id]/route.js`)
- Added support for updating players via PATCH method
- Validates that:
  - Match is not completed
  - Both players are provided
  - Players are different
  - Players exist and belong to the same league as the match
- Clears wild card usage records when players change

### 3. **useMatchDetail Hook** (`lib/hooks/useMatchDetail.js`)
- Added `updatePlayers` function to handle player updates
- Manages success/error states for player updates
- Refreshes match data after successful update

### 4. **Match Detail Page** (`app/admin/matches/[id]/page.js`)
- Added "Players" tab to the tab navigation
- Integrated MatchPlayersTab component
- Passes `updatePlayers` function to handle updates

### 5. **MatchPlayersCard Component** (`components/admin/matches/MatchPlayersCard.js`)
- Added visual indicator showing when players can be edited
- Only shows for non-completed matches

### 6. **MatchOverviewTab Component** (`components/admin/matches/MatchOverviewTab.js`)
- Added "Edit Players" button to quick actions
- Only visible for non-completed matches
- Navigates to the Players tab when clicked

## Usage

1. Navigate to a match detail page in the admin panel
2. If the match is not completed, you'll see:
   - An "Edit Players" indicator on the players card
   - A "Players" tab in the navigation
   - An "Edit Players" button in the quick actions
3. Click on the "Players" tab
4. Select new players from the dropdowns
5. Click "Update Players" to save changes

## Restrictions

- Players can only be edited for matches with status "scheduled"
- Completed matches cannot have their players changed
- Both players must belong to the same league as the match
- The same player cannot be selected for both positions

## API Usage

To update players via the API:

```bash
PATCH /api/admin/matches/{matchId}
Content-Type: application/json

{
  "players": {
    "player1": "player1Id",
    "player2": "player2Id"
  }
}
```

Response:
```json
{
  "message": "Players updated successfully",
  "match": { /* updated match object */ }
}
```

## Error Handling

The feature includes comprehensive error handling for:
- Invalid player selections
- Attempting to edit completed matches
- Players not found
- Players from different leagues
- Duplicate player selection

## Notes

- When players are changed, any wild card usage records are cleared
- The match maintains all other data (schedule, round, etc.)
- Player statistics and ELO ratings are not affected by player changes
