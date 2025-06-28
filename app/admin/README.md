# Admin Panel - MVP

A simple, secure admin panel for managing tennis league registrations.

## Features

### 🔐 Authentication
- Password-based login with secure session management
- SHA-256 password hashing
- HTTP-only cookies for session storage
- Automatic session expiry (24 hours)

### 📊 Dashboard
- Total player count
- Players by level (Beginner, Intermediate, Advanced)
- Recent registrations list
- Quick stats overview

### 👥 Player Management
- View all registered players
- Search by name, email, or phone
- Filter by level
- Sort by date, name, or level
- Update player status (Pending → Confirmed → Active)
- Export to CSV

## Setup

### 1. Environment Variables

Add these to your `.env.local`:

```bash
# Admin password hash (default: "admin123")
# Generate your own: echo -n "your-password" | sha256sum
ADMIN_PASSWORD_HASH=240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9

# Session secret
SESSION_SECRET=your-secret-key-here
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

- `/admin` - Login page
- `/admin/dashboard` - Statistics overview
- `/admin/players` - Player management

## API Endpoints

All admin API endpoints are protected by middleware that checks for valid session cookies.

- `POST /api/admin/auth/login` - Login
- `GET /api/admin/auth/check` - Check authentication
- `POST /api/admin/auth/logout` - Logout
- `GET /api/admin/dashboard` - Dashboard stats
- `GET /api/admin/players` - List all players
- `GET /api/admin/players/export` - Export CSV
- `PATCH /api/admin/players/[id]` - Update player

## Security Considerations

1. **Change the default password** - Never use "admin123" in production
2. **Use strong session secrets** - Generate random, long strings
3. **HTTPS only** - Always use HTTPS in production
4. **Regular updates** - Update dependencies regularly
5. **Access logs** - Monitor admin access in production

## Future Enhancements

- [ ] Two-factor authentication
- [ ] Multiple admin users with roles
- [ ] Activity logs
- [ ] Email notifications to players
- [ ] Match management
- [ ] Tournament bracket creation
- [ ] Advanced analytics

## Development

```bash
# Run locally
npm run dev

# Access admin panel
http://localhost:3000/admin
```

Default credentials for development:
- Password: `admin123`

Remember to change this in production!
