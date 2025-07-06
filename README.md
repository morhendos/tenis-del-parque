# Tenis del Parque - Sotogrande 🎾

A modern, multilingual tennis league platform built with Next.js and MongoDB, featuring ELO rankings, Swiss tournament system, multi-league support, match management, and comprehensive admin panel. Starting July 2025!

## 🚀 Overview

Tenis del Parque is a sophisticated web application that combines cutting-edge web technologies with professional tennis league management. The platform supports multiple leagues, player registration with database persistence, match scheduling and results tracking, and provides comprehensive information about league rules, ELO & Swiss systems.

### ✨ Key Features

- **🏆 Multi-League Support**: Scalable architecture supporting multiple tennis leagues
- **🎾 Match Management**: Complete match scheduling, result tracking, and ELO calculations  
- **👨‍💼 Admin Panel**: Comprehensive admin interface with player invitation system
- **👤 Player Dashboard**: Personalized player hub with league standings, matches, and profile
- **📧 Invitation System**: WhatsApp-based player invitations with activation links
- **💾 MongoDB Integration**: Complete player registration and data persistence
- **🌍 Multilingual Support**: Full Spanish/English localization with browser detection and user preferences
- **📱 Responsive Design**: Mobile-first UI optimized for all devices
- **🎯 League Management**: Swiss tournament system with ELO rankings and playoff qualification
- **📊 Player Statistics**: Track wins, losses, ELO ratings, and match history
- **📅 Flexible Registration**: No deadlines - register players anytime
- **🔄 Re-invite System**: Handle incomplete registrations and account issues
- **📱 WhatsApp Integration**: Normalized phone numbers for reliable WhatsApp links
- **🚀 Starting July 2025**: Liga de Sotogrande launches when enough players registered

## 🛠️ Tech Stack

- **Framework**: Next.js 14 with App Router
- **Database**: MongoDB with Mongoose ODM
- **Styling**: Tailwind CSS with custom design system
- **Languages**: JavaScript/JSX with modern React patterns
- **State Management**: React Hooks (useState, useEffect, custom hooks)
- **Architecture**: Component-based with clear separation of concerns
- **Authentication**: JWT-based authentication with secure HTTP-only cookies
- **Communication**: WhatsApp integration with phone number normalization
- **Internationalization**: Custom language system with localStorage and user preferences

## 🔌 Database Connection Pattern

**Important**: The codebase uses a standardized database connection pattern that all developers must follow:

### Database Connection Function
All API routes should use the **`dbConnect`** function from `lib/db/mongoose.js`:

```javascript
// ✅ CORRECT - Import and use dbConnect
import dbConnect from '../../../lib/db/mongoose'

export async function GET() {
  try {
    await dbConnect()  // Always call this before database operations
    
    // Your database operations here...
    const data = await SomeModel.find()
    
    return NextResponse.json({ data })
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
```

### ⚠️ Common Mistakes to Avoid

```javascript
// ❌ WRONG - Don't import from mongodb.js
import { connectDB } from '../../../lib/db/mongodb'

// ❌ WRONG - Don't use aliases for the function name
import connectDB from '../../../lib/db/mongoose'

// ❌ WRONG - Don't call a function that doesn't exist
await connectDB()  // This will cause import errors
```

### Database Files Overview
- **`lib/db/mongoose.js`**: Main database connection using Mongoose ODM
  - Exports: `dbConnect` (default export)
  - Use this for all API routes
- **`lib/db/mongodb.js`**: Legacy MongoDB client connection
  - Exports: `clientPromise` (default export)
  - Not used in API routes, kept for reference

### Why This Pattern?
- **Consistency**: All developers use the same connection method
- **Connection Pooling**: Mongoose handles connection reuse efficiently
- **Error Handling**: Built-in reconnection and error handling
- **Development**: Prevents connection issues during hot reloads

### Adding New API Routes
When creating new API routes, always:
1. Import `dbConnect` from `lib/db/mongoose`
2. Call `await dbConnect()` before any database operations
3. Use the exact function name `dbConnect` (no aliases)

### Database Schema Best Practices

**Avoid Duplicate Indexes**: Don't create explicit indexes on fields that already have `unique: true`:

```javascript
// ✅ CORRECT - unique: true automatically creates an index
const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true  // This creates an index automatically
  }
})

// Don't add explicit index for unique fields
// UserSchema.index({ email: 1 }) // ❌ This would create a duplicate

// ✅ CORRECT - Add indexes for non-unique fields that need them
UserSchema.index({ status: 1 })
UserSchema.index({ createdAt: -1 })
```

**Why This Matters**:
- Prevents Mongoose warnings about duplicate indexes
- Avoids unnecessary database storage overhead
- Improves database performance

### Scripts Module System

**Important**: Scripts in the `/scripts` directory use CommonJS syntax for consistency and compatibility:

```javascript
// ✅ CORRECT - Scripts use CommonJS (require/exports)
const mongoose = require('mongoose')
const dotenv = require('dotenv')

// Define schemas inline since we can't easily import ES modules
const UserSchema = new mongoose.Schema({
  // schema definition...
})

const User = mongoose.models.User || mongoose.model('User', UserSchema)
```

```javascript
// ❌ WRONG - Don't use ES modules in scripts
import mongoose from 'mongoose'  // This will cause syntax errors
import User from '../lib/models/User.js'
```

**Why Scripts Use CommonJS**:
- **Consistency**: All existing scripts use CommonJS
- **Simplicity**: No need to modify package.json or file extensions
- **Node.js Compatibility**: Works out of the box with Node.js
- **Inline Schemas**: We define schemas directly in scripts for better isolation

**Main App vs Scripts**:
- **Main Application**: Uses ES modules (`import/export`) with Next.js
- **Scripts Directory**: Uses CommonJS (`require/module.exports`) for utility scripts

### Import Path Patterns

**Important**: Different API route directories require different relative path depths:

```javascript
// ✅ 4 levels up - For routes in app/api/admin/[directory]/
// Example: app/api/admin/users/route.js, app/api/admin/matches/route.js
import dbConnect from '../../../../lib/db/mongoose'

// ✅ 5 levels up - For routes in app/api/admin/auth/[directory]/
// Example: app/api/admin/auth/login/route.js, app/api/admin/auth/check/route.js  
import dbConnect from '../../../../../lib/db/mongoose'

// ✅ 4 levels up - For routes in app/api/[directory]/
// Example: app/api/auth/login/route.js, app/api/players/register/route.js
import dbConnect from '../../../../lib/db/mongoose'
```

**Quick Path Reference**:
- `app/api/[dir]/` → `../../../../lib/` (4 levels)
- `app/api/admin/[dir]/` → `../../../../lib/` (4 levels)  
- `app/api/admin/auth/[dir]/` → `../../../../../lib/` (5 levels)

**Why This Matters**:
- **Module Resolution**: Wrong paths cause "Module not found" errors
- **Nested Routing**: Next.js file-based routing creates different nesting levels
- **Consistency**: Following the pattern prevents import errors

## 🔐 Authentication & Invitation System

The platform features a comprehensive user management system with JWT authentication and WhatsApp-based invitations:

### Player Registration Flow
1. **Public Registration**: Players sign up on `/signup/[league]` pages
2. **Admin Invitation**: Admins send WhatsApp invitations from admin panel
3. **Account Activation**: Players set passwords via secure activation links
4. **Player Dashboard**: Authenticated players access personalized hub

### Authentication Architecture

#### JWT Authentication
- **Secure Tokens**: HTTP-only cookies with JWS signing
- **Session Management**: Automatic token refresh and validation
- **Route Protection**: Middleware protects admin and player routes
- **Role-Based Access**: Admin and player role separation

#### User Models
```javascript
// User Schema (Authentication)
{
  email: String,               // Unique identifier
  password: String,           // Hashed with bcryptjs
  role: 'admin' | 'player',   // Access control
  playerId: ObjectId,         // Link to Player model
  emailVerified: Boolean,     // Activation status
  activationToken: String,    // Secure activation token
  activationTokenExpiry: Date, // Token expiration (7 days)
  preferences: {              // User preferences
    language: 'es' | 'en',
    hasSeenWelcomeModal: Boolean
  }
}
```

### Invitation System

#### WhatsApp Integration
- **Phone Normalization**: Automatic formatting for international numbers
- **Link Generation**: Secure activation links with domain detection
- **Message Templates**: Bilingual invitation messages (English/Spanish)
- **Re-invite Capability**: Handle failed activations and data inconsistencies

#### Invitation Workflow
1. **Admin Selection**: Choose players from admin panel
2. **Token Generation**: Create secure 7-day activation tokens
3. **WhatsApp Message**: Bilingual message with activation link
4. **Account Creation**: Players set passwords and activate accounts
5. **Player Status**: Automatic status updates (pending → confirmed → active)

#### Phone Number Normalization
```javascript
// Phone Utility Functions (lib/utils/phoneUtils.js)
normalizePhoneForWhatsApp(phone)  // Remove "00" prefix, clean format
createWhatsAppLink(phone, message) // Generate reliable WhatsApp URLs
isValidWhatsAppNumber(phone)      // Validate phone format
```

**Supported Formats**:
- `"0035358009856"` → `"35358009856"` (Remove "00" prefix)
- `"+35358009856"` → `"35358009856"` (Remove "+" prefix)
- `"35358009856"` → `"35358009856"` (Keep clean format)

### Player Dashboard Features

#### Personalized Hub
- **League Standings**: Real-time rankings with playoff qualification indicators
- **Match History**: Complete match records with results and ELO changes
- **Schedule View**: Upcoming matches with opponent contact information
- **Profile Management**: Language preferences and account settings

#### Mobile Optimization
- **Responsive Layout**: Mobile-first design with sidebar navigation
- **Touch-Friendly**: Optimized button sizes and interactions
- **Compact Cards**: Mobile-optimized standings display
- **Scroll Prevention**: Mobile menu prevents background scrolling

### Language System

#### Multi-Language Support
- **Browser Detection**: Automatic language detection from browser settings
- **User Preferences**: Stored language choices in user profiles
- **Real-Time Switching**: Dynamic language changes without page reload
- **Consistent Sync**: Language preferences sync across login sessions

#### Language Priority Order
1. **User Profile**: Stored language preference (highest priority)
2. **Manual Selection**: User-selected language in session
3. **Browser Language**: Automatic detection from browser headers
4. **Default Fallback**: Spanish (es) as default language

### Status Management

#### Player Status Flow
```
pending → confirmed → active → inactive
   ↑         ↑         ↑         ↑
Register  Invited  Activated  Manual
```

- **Pending**: Registered but not yet invited
- **Confirmed**: Invitation sent, awaiting activation
- **Active**: Account activated, can log in
- **Inactive**: Manually deactivated by admin

#### Re-invite System
- **Data Consistency**: Handle incomplete user records
- **Token Regeneration**: Fresh activation tokens for failed attempts
- **Status Reset**: Clean up orphaned user references
- **Force Re-invite**: Override existing user accounts when needed

## 📁 Project Structure

```
tenis-del-parque/
├── README.md
├── .env.local.example           # Environment variables example
├── app/                         # Next.js App Router pages
│   ├── admin/                   # Admin panel
│   │   ├── leagues/             # League management
│   │   ├── matches/             # Match management
│   │   ├── players/             # Player management with invitation system
│   │   ├── users/               # User account management
│   │   └── dashboard/           # Admin dashboard
│   ├── player/                  # Player dashboard area
│   │   ├── dashboard/           # Player overview
│   │   ├── league/              # League standings and schedule
│   │   ├── matches/             # Match history and results
│   │   ├── profile/             # Account settings and preferences
│   │   ├── rules/               # League rules
│   │   └── layout.js            # Player dashboard layout
│   ├── api/                     # API routes
│   │   ├── admin/               # Admin API endpoints
│   │   │   ├── auth/            # Admin authentication
│   │   │   ├── leagues/         # League operations
│   │   │   ├── matches/         # Match CRUD operations
│   │   │   ├── players/         # Player management with export/import
│   │   │   └── users/           # User invitation system
│   │   ├── auth/                # Player authentication
│   │   │   ├── login/           # Player login
│   │   │   ├── logout/          # Session termination
│   │   │   ├── check/           # Session validation
│   │   │   └── activate/        # Account activation
│   │   ├── player/              # Player API endpoints
│   │   │   ├── profile/         # Player profile management
│   │   │   └── matches/         # Match operations for players
│   │   ├── leagues/
│   │   │   └── [league]/        # Public league endpoints
│   │   │       ├── route.js     # League info
│   │   │       ├── standings/   # Public standings
│   │   │       └── matches/     # Public match data
│   │   └── players/
│   │       └── register/
│   │           └── route.js     # Player registration endpoint
│   ├── activate/                # Account activation page
│   ├── login/                   # Player login page
│   ├── admin-login/             # Admin login page
│   ├── signup/
│   │   └── [league]/
│   │       └── page.js          # Dynamic league signup page
│   ├── [location]/              # Dynamic location pages
│   │   └── liga/
│   │       └── [season]/        # Season-specific league pages
│   ├── elo/
│   │   ├── layout.js
│   │   └── page.js              # ELO & Swiss Systems page
│   ├── rules/
│   │   ├── layout.js
│   │   └── page.js              # Rules page
│   ├── swiss/                   # Swiss system information
│   ├── globals.css              # Global styles
│   ├── layout.js                # Root layout
│   ├── middleware.js            # Route protection middleware
│   └── page.js                  # Home page
├── components/                  # Reusable component library
│   ├── admin/                   # Admin panel components
│   ├── common/                  # Shared components (Navigation, Footer)
│   ├── elo/                     # ELO page components
│   ├── home/                    # Home page components
│   ├── rules/                   # Rules page components
│   ├── analytics/               # Analytics integration (GA, Clarity)
│   └── ui/                      # UI components (WelcomeModal, Icons, etc.)
├── lib/                         # Utilities and business logic
│   ├── content/                 # Centralized content management
│   │   ├── homeContent.js       # Homepage multilingual content
│   │   ├── loginContent.js      # Login page content
│   │   ├── rulesContent.js      # Rules page content
│   │   ├── eloContent.js        # ELO page content
│   │   ├── swissContent.js      # Swiss system content
│   │   ├── activateContent.js   # Activation page content
│   │   └── welcomeContent.js    # Welcome modal content
│   ├── db/                      # Database utilities
│   │   ├── mongodb.js           # MongoDB connection
│   │   └── mongoose.js          # Mongoose connection handler
│   ├── models/                  # Database models
│   │   ├── Player.js            # Player model with match history
│   │   ├── League.js            # League model
│   │   ├── Match.js             # Match model with ELO tracking
│   │   └── User.js              # User authentication model
│   ├── hooks/                   # Custom React hooks
│   │   ├── useLanguage.js       # Language detection and management
│   │   ├── useActiveSection.js  # Section scrolling for pages
│   │   └── useWelcomeModal.js   # Welcome modal state management
│   └── utils/                   # Utility functions
│       ├── phoneUtils.js        # WhatsApp phone number normalization
│       ├── authMiddleware.js    # Player authentication middleware
│       ├── adminAuth.js         # Admin authentication helpers
│       ├── jwt.js               # JWT token management
│       ├── edgeJwt.js          # Edge runtime JWT utilities
│       ├── apiHelpers.js        # API utility functions
│       ├── swissPairing.js      # Swiss tournament pairing algorithm
│       └── rulesIcons.js        # Rules page icon mappings
├── scripts/                     # Utility scripts
│   ├── seedLeagues.js           # Database seeder for leagues
│   └── tree.js                  # Project structure generator
├── docs/                        # Documentation
│   └── MATCH_MANAGEMENT_GUIDE.md # Match management implementation guide
└── public/                      # Static assets
```

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ 
- npm, yarn, or pnpm
- MongoDB (local or MongoDB Atlas)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/morhendos/tenis-del-parque.git
   cd tenis-del-parque
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.local.example .env.local
   ```
   Edit `.env.local` and add your MongoDB connection string and JWT secret:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/tenis-del-parque
   JWT_SECRET=your_jwt_secret_key
   ```

4. **Seed the database**
   ```bash
   npm run seed:leagues
   ```
   This creates the Sotogrande league (and a test Marbella league).

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   - Homepage: [http://localhost:3000](http://localhost:3000)
   - Signup page: [http://localhost:3000/signup/sotogrande](http://localhost:3000/signup/sotogrande)
   - Admin panel: [http://localhost:3000/admin](http://localhost:3000/admin)

### Available Scripts

```bash
npm run dev           # Start development server
npm run build         # Build for production
npm run start         # Start production server
npm run lint          # Run ESLint
npm run seed:leagues  # Seed database with initial leagues
npm run create-admin  # Create an admin user for the admin panel
```

### Admin Setup

Before using the admin panel, you need to create an admin user:

```bash
npm run create-admin
```

This will prompt you for:
- Admin email address
- Password (minimum 8 characters)
- Password confirmation

The script will:
- Connect to your MongoDB database
- Check for existing admin users
- Create a new admin user with hashed password
- Provide the admin user ID for reference

Once created, you can access the admin panel at [http://localhost:3000/admin](http://localhost:3000/admin)

## 📊 Database Models

### Player Model
```javascript
{
  name: String,              // Player's full name
  email: String,             // Unique email address
  whatsapp: String,          // WhatsApp contact number
  level: String,             // 'beginner', 'intermediate', or 'advanced'
  league: ObjectId,          // Reference to League
  season: String,            // e.g., 'summer-2025'
  status: String,            // 'pending', 'confirmed', 'active', 'inactive'
  registeredAt: Date,        // Registration timestamp
  stats: {                   // League statistics
    matchesPlayed: Number,
    matchesWon: Number,
    eloRating: Number,
    highestElo: Number,
    lowestElo: Number,
    setsWon: Number,
    setsLost: Number
  },
  matchHistory: [{           // Match history tracking
    match: ObjectId,
    opponent: ObjectId,
    result: 'won' | 'lost',
    eloChange: Number,
    date: Date
  }],
  wildCards: {               // Wild card management
    total: Number,
    used: Number,
    history: Array
  }
}
```

### League Model
```javascript
{
  name: String,              // e.g., 'Liga de Sotogrande'
  slug: String,              // URL-friendly identifier
  location: {                // League location details
    city: String,
    region: String,
    country: String,
    timezone: String
  },
  seasons: [{                // League seasons
    name: String,
    startDate: Date,         // July 1, 2025 for Sotogrande
    endDate: Date,
    maxPlayers: Number,
    price: Object,
    status: String           // 'registration_open', 'active', etc.
  }],
  config: {                  // League configuration
    roundsPerSeason: Number,
    wildCardsPerPlayer: Number,
    playoffPlayers: Number,
    levels: Array
  }
}
```

### Match Model
```javascript
{
  league: ObjectId,          // Reference to League
  season: String,            // Season identifier
  round: Number,             // Round number
  players: {
    player1: ObjectId,
    player2: ObjectId
  },
  schedule: {
    confirmedDate: Date,
    court: String
  },
  result: {
    winner: ObjectId,
    score: {
      sets: Array,           // Set scores
      walkover: Boolean,
      retiredPlayer: ObjectId
    }
  },
  eloChanges: {              // ELO tracking
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
  },
  status: String             // 'scheduled', 'completed', 'cancelled'
}
```

## 🎯 Features

### Core Features
- **🏆 Multi-League Architecture**: Support for multiple tennis leagues across different locations
- **📊 Player Registration**: Complete signup flow with MongoDB persistence
- **🎾 Match Management**: Schedule matches, track results, calculate ELO ratings
- **👨‍💼 Admin Panel**: Protected admin interface for complete league control
- **🌐 Dynamic League Pages**: Each league has its own signup page (`/signup/[league-slug]`)
- **📅 Flexible Timeline**: League starts July 2025, no registration deadline
- **💾 Data Persistence**: All player and match data saved in MongoDB

### Admin Panel Features
- **League Management**: View and manage multiple leagues
- **Player Management**: Update player status, view statistics, export/import data
- **Invitation System**: Send WhatsApp invitations with bilingual messages
- **Re-invite Capability**: Handle failed activations and incomplete registrations  
- **User Management**: View user accounts, activation status, and pending invitations
- **Match Scheduling**: Create matches between players
- **Result Entry**: Enter match scores and automatic ELO calculation
- **Dashboard**: Overview of league statistics and recent activity
- **Data Export**: CSV export for player data and league analytics

### Technical Features
- **🌍 Multilingual**: Spanish/English with browser detection, user preferences, and real-time switching
- **📱 Responsive Design**: Mobile-first approach with touch-optimized interactions
- **⚡ API Routes**: RESTful API with comprehensive error handling and debugging
- **🔒 Data Validation**: Server-side validation with detailed error responses
- **🎨 Design System**: Consistent branding with Tailwind CSS and custom components
- **🔐 Authentication**: JWT-based auth with secure HTTP-only cookies and role separation
- **📱 WhatsApp Integration**: Phone number normalization and reliable message links
- **🔄 State Management**: Custom React hooks for language, authentication, and UI state
- **🏗️ Route Protection**: Middleware-based authentication for admin and player areas
- **📊 Debugging**: Comprehensive logging and error tracking for production issues

### League Features
- **🎯 Swiss Tournament System**: Fair pairing system
- **📈 ELO Rankings**: Dynamic skill-based rating system (K-factor: 32)
- **🏅 Three Levels**: Beginner, Intermediate, and Advanced divisions
- **⚡ Wild Cards**: Flexible scheduling system
- **💰 Free First Season**: No cost for inaugural season

## 🎨 Design System

### Brand Colors
```css
--parque-purple: #563380    /* Primary brand color */
--parque-green: #8FBF60     /* Secondary brand color */
--parque-yellow: #E6E94E    /* Accent color */
--parque-bg: #D5D3C3        /* Background color */
```

## 🌍 Multi-League Support

The platform is designed to support multiple tennis leagues:

1. **Liga de Sotogrande** (Active)
   - URL: `/signup/sotogrande`
   - Starting: July 2025
   - Status: Registration Open

2. **Liga de Marbella** (Coming Soon)
   - URL: `/signup/marbella`
   - Status: Coming Soon

### Adding a New League

1. Edit `scripts/seedLeagues.js` to add your league
2. Run `npm run seed:leagues`
3. Access at `/signup/your-league-slug`

## 🚀 API Endpoints

### Public API

#### Player Registration
```
POST /api/players/register
Body: {
  name: string,
  email: string,
  whatsapp: string,
  level: 'beginner' | 'intermediate' | 'advanced',
  leagueId: string,
  language: 'es' | 'en'
}
```

#### League Information
```
GET /api/leagues/[slug]
Returns: League details and registration status

GET /api/leagues/[slug]/standings?season=string
Returns: Public league standings

GET /api/leagues/[slug]/matches?season=string&status=string
Returns: Public match data
```

### Authentication API

#### Player Authentication
```
POST /api/auth/login
Body: { email: string, password: string }
Returns: JWT token in HTTP-only cookie

POST /api/auth/logout
Returns: Clears authentication cookie

GET /api/auth/check
Returns: Current session status

POST /api/auth/activate
Body: { token: string, password: string, confirmPassword: string }
Returns: Account activation result
```

### Player Dashboard API (Protected)

#### Player Profile
```
GET /api/player/profile
Returns: Player profile with league and user data

PUT /api/player/profile
Body: { preferences: { language: 'es' | 'en' } }
Returns: Updated profile
```

#### Player Matches
```
GET /api/player/matches/schedule
Returns: Upcoming matches for logged-in player

POST /api/player/matches/result
Body: { matchId: string, score: object }
Returns: Match result submission
```

### Admin API (Protected)

#### User Management
```
POST /api/admin/users/invite
Body: { playerIds: string[], forceReinvite?: boolean }
Returns: WhatsApp invitation links and activation tokens

GET /api/admin/users/invite
Returns: Pending invitations list

GET /api/admin/users
Returns: All user accounts with status
```

#### Player Management
```
GET /api/admin/players?hasUser=boolean&status=string
Returns: Filtered player list

GET /api/admin/players/export
Returns: CSV export of player data

POST /api/admin/players/import
Body: FormData with CSV file
Returns: Import results
```

See the [Admin Panel Documentation](./app/admin/README.md) for complete API reference.

## 🔧 Environment Variables

Create a `.env.local` file with:

```env
# MongoDB Connection String
MONGODB_URI=your_mongodb_connection_string

# Optional: Specific database name
MONGODB_DB=tenis-del-parque

# JWT Authentication
JWT_SECRET=your_jwt_secret_key

# Application URL (for activation links)
NEXT_PUBLIC_URL=https://yourdomain.com

# Analytics (optional)
NEXT_PUBLIC_GA_ID=your_google_analytics_id
NEXT_PUBLIC_CLARITY_ID=your_microsoft_clarity_id
```

## 🐛 Troubleshooting

### Common Issues and Solutions

#### Activation Token Issues
- **Invalid Token Error**: Try opening activation link in incognito/private browser mode
- **Expired Token**: Request a new invitation from admin panel (tokens expire after 7 days)
- **Browser Cache**: Clear browser cache or hard refresh (Ctrl+F5 / Cmd+Shift+R)

#### WhatsApp Link Problems
- **Phone Format**: The system automatically normalizes phone numbers (removes "00" and "+" prefixes)
- **International Numbers**: Use clean international format (e.g., "34652714328" for Spain)
- **Link Not Opening**: Copy URL manually instead of clicking if WhatsApp doesn't open

#### Language Issues
- **Wrong Language**: Language preference is saved in user profile and localStorage
- **Language Flickering**: The system waits for language detection before rendering to prevent flicker
- **Browser Detection**: System respects browser language settings for new users

#### Mobile Display Issues
- **Standings Wrapping**: Mobile standings use compact card layout optimized for small screens
- **Menu Scrolling**: Mobile menu prevents background scrolling when open
- **Touch Issues**: All interactive elements are optimized for touch with 44px minimum size

#### Database Connection Issues
- **Always use `dbConnect`**: Import from `lib/db/mongoose.js` in all API routes
- **Path Issues**: Check relative import paths based on route depth
- **Connection Errors**: Verify MongoDB URI and network connectivity

### Performance Optimization
- **Mobile-First Design**: UI optimized for mobile devices with responsive breakpoints
- **Lazy Loading**: Components load only when needed
- **Optimized Images**: Using Next.js Image component for automatic optimization
- **Database Indexing**: Proper indexes on frequently queried fields

## 📅 Timeline

- **Now - June 2025**: Open registration period
- **June 2025**: Contact registered players with details
- **July 2025**: Liga de Sotogrande begins!
- **October 2025**: Season ends with playoffs

## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Import project to [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy automatically on every push

### Environment Variables for Production
- `MONGODB_URI`: Your production MongoDB connection string
- `JWT_SECRET`: Strong JWT signing secret

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

© 2025 Tenis del Parque - Sotogrande. All rights reserved.

---

Built with ❤️ for the tennis community
