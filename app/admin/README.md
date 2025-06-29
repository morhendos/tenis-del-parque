# Admin Panel

A comprehensive admin panel for managing tennis leagues, players, and matches.

## Features

### 🔐 Authentication
- Password-based login with secure session management
- SHA-256 password hashing
- HTTP-only cookies for session storage
- Automatic session expiry (24 hours)

### 🏆 League Management
- View all leagues with player counts
- League-specific management context
- Quick navigation to league-specific players and matches
- Support for multiple concurrent leagues

### 📊 Dashboard
- Quick action cards for leagues, players, and matches
- Total player count across all leagues
- Players by level (Beginner, Intermediate, Advanced)
- Recent registrations list
- Quick stats overview

### 👥 Player Management
- View all registered players
- Filter by league, status, and level
- Search by name, email, or phone
- Sort by date, name, or level
- Update player status (Pending → Confirmed → Active)
- View player statistics (ELO, matches played, win rate)
- Export to CSV

### 🎾 Match Management
- Create matches between players
- League-scoped match listings
- Filter by round, status, and player
- Enter match results with score tracking
- Automatic ELO calculation and updates
- Player statistics update after matches
- Support for retirements and walkovers
- Match scheduling with court assignments

## Setup

### 1. Environment Variables

Add these to your `.env.local`:

```bash
# Admin password hash (default: "admin123")
# Generate your own: echo -n "your-password" | sha256sum
ADMIN_PASSWORD_HASH=240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9

# Session secret
SESSION_SECRET=your-secret-key-here

# MongoDB connection
MONGODB_URI=your_mongodb_connection_string
```

### 2. Generate Password Hash

To create your own admin password:

```bash
# On Mac/Linux
echo -n "your-secure-password" | shasum -a 256

# Or using Node.js
node -e "console.log(require('crypto').createHash('sha256').update('your-secure-password').digest('hex'))"
```

### 3. Access Admin Panel

Navigate to `/admin` and login with your password.

## Routes

### Authentication
- `/admin` - Login page
- `/admin/dashboard` - Main dashboard

### League Management
- `/admin/leagues` - League selection and overview
- `/admin/leagues/[id]` - Specific league management

### Player Management
- `/admin/players` - All players view
- `/admin/players?league=[id]` - League-specific players

### Match Management
- `/admin/matches?league=[id]` - League matches list
- `/admin/matches/create?league=[id]` - Create new match
- `/admin/matches/[id]` - Match details and result entry

## API Endpoints

All admin API endpoints are protected by session authentication.

### Authentication
- `POST /api/admin/auth/login` - Login
- `GET /api/admin/auth/check` - Check authentication
- `POST /api/admin/auth/logout` - Logout

### Dashboard & Stats
- `GET /api/admin/dashboard` - Dashboard statistics

### League Management
- `GET /api/admin/leagues` - List all leagues with stats

### Player Management
- `GET /api/admin/players` - List players (supports filtering)
- `GET /api/admin/players/export` - Export players to CSV
- `PATCH /api/admin/players/[id]` - Update player

### Match Management
- `GET /api/admin/matches` - List matches (supports filtering)
- `POST /api/admin/matches` - Create new match
- `GET /api/admin/matches/[id]` - Get match details
- `PATCH /api/admin/matches/[id]` - Update match/enter result
- `DELETE /api/admin/matches/[id]` - Cancel match

## Match Management Features

### Creating Matches
1. Select a league from the leagues page
2. Navigate to matches
3. Click "Create Match"
4. Select two players (grouped by level)
5. Set round number and optional schedule details
6. Save the match

### Entering Results
1. Click on a scheduled match
2. Enter set scores
3. Winner is auto-determined or can be manually selected
4. Support for special cases (walkover, retirement)
5. ELO ratings update automatically
6. Player statistics update in real-time

### ELO System
- Starting ELO: 1200
- K-factor: 32
- Updates after each match result
- Tracks highest/lowest ratings
- Visible in player listings and match details

## Security Considerations

1. **Change the default password** - Never use "admin123" in production
2. **Use strong session secrets** - Generate random, long strings
3. **HTTPS only** - Always use HTTPS in production
4. **Regular updates** - Update dependencies regularly
5. **Access logs** - Monitor admin access in production
6. **Database security** - Secure MongoDB connection

## Upcoming Features

- [x] League management
- [x] Match management with ELO
- [ ] Swiss tournament pairing algorithm
- [ ] Automated round generation
- [ ] Email/WhatsApp notifications
- [ ] Tournament bracket visualization
- [ ] Advanced analytics and reports
- [ ] Multiple admin users with roles
- [ ] Activity logs
- [ ] Public match schedule
- [ ] Player profiles

## Development

```bash
# Run locally
npm run dev

# Access admin panel
http://localhost:3000/admin

# Seed leagues (if needed)
npm run seed:leagues
```

Default credentials for development:
- Password: `admin123`

Remember to change this in production!

## Tips

- Always select a league context before managing matches
- Players must be "confirmed" or "active" to be paired
- ELO changes are permanent once a result is entered
- Use the league filter to manage multiple leagues efficiently
- Export player data regularly for backups
