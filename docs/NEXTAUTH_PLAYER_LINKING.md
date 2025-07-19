# NextAuth Migration - Player/User Linking Issue

## Problem Description

After migrating to NextAuth, some users are experiencing a "Player not found" error when trying to schedule matches or submit results. This happens because:

1. The old authentication system stored player information directly
2. The new NextAuth system requires a link between User and Player documents
3. Existing players who had accounts before the migration don't have this link established

## Error Messages

Users may see:
- "Player not found" when scheduling matches
- "Your user account is not linked to a player profile" (with improved error handling)

## Root Cause

The database has:
- **User** documents with authentication credentials (email, password)
- **Player** documents with player information (name, email, whatsapp, stats)

These need to be linked via:
- `User.playerId` → points to the Player document
- `Player.userId` → points to the User document

## Solution

### Quick Fix (One User)

If you need to fix a single user immediately:

1. Find the user's email in both collections
2. Update the documents to link them:

```javascript
// In MongoDB console or script
const userEmail = "user@example.com";

// Find both documents
const user = db.users.findOne({ email: userEmail });
const player = db.players.findOne({ email: userEmail });

// Link them
db.users.updateOne(
  { _id: user._id },
  { $set: { playerId: player._id } }
);

db.players.updateOne(
  { _id: player._id },
  { $set: { userId: user._id } }
);
```

### Bulk Fix (All Users)

Run the migration script:

```bash
cd /path/to/project
node scripts/linkPlayersToUsers.js
```

This script will:
1. Find all Players without a linked User
2. Find all Users without a linked Player
3. Match them by email address
4. Create the bidirectional links
5. Report on the results

### Prevention

For new users, the signup/activation flow should automatically create these links. Make sure:

1. When a player activates their account, both documents are linked
2. The activation endpoint creates/updates both `User.playerId` and `Player.userId`

## Verification

To check if a user is properly linked:

```javascript
// Check from User side
const user = await User.findOne({ email: "user@example.com" });
console.log("User playerId:", user.playerId);

// Check from Player side  
const player = await Player.findOne({ email: "user@example.com" });
console.log("Player userId:", player.userId);

// Both should have valid ObjectIds pointing to each other
```

## Affected Endpoints

These endpoints require the Player/User link:
- `/api/player/matches/schedule` - Schedule a match
- `/api/player/matches/result` - Submit match results
- `/api/player/profile` - View/update profile
- Any endpoint using `requirePlayer()` middleware

## Monitoring

Add logging to track this issue:

```javascript
// In authentication callbacks
if (!user.playerId) {
  console.warn(`User ${user.email} logged in without playerId link`);
}
```

## Long-term Solution

Consider:
1. Adding a health check endpoint to identify unlinked accounts
2. Sending notifications to affected users
3. Adding auto-linking during login if emails match
4. Updating the user dashboard to show a warning if accounts aren't linked
