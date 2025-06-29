# Tenis del Parque - Sotogrande 🎾

A modern, multilingual tennis league platform built with Next.js and MongoDB, featuring ELO rankings, Swiss tournament system, multi-league support, match management, and comprehensive admin panel. Starting July 2025!

## 🚀 Overview

Tenis del Parque is a sophisticated web application that combines cutting-edge web technologies with professional tennis league management. The platform supports multiple leagues, player registration with database persistence, match scheduling and results tracking, and provides comprehensive information about league rules, ELO & Swiss systems.

### ✨ Key Features

- **🏆 Multi-League Support**: Scalable architecture supporting multiple tennis leagues
- **🎾 Match Management**: Complete match scheduling, result tracking, and ELO calculations
- **👨‍💼 Admin Panel**: Comprehensive admin interface for league operations
- **💾 MongoDB Integration**: Complete player registration and data persistence
- **🌍 Multilingual Support**: Full Spanish/English localization with automatic browser detection
- **📱 Responsive Design**: Beautiful, modern UI that works on all devices
- **🎯 League Management**: Swiss tournament system with ELO rankings
- **📊 Player Statistics**: Track wins, losses, ELO ratings, and match history
- **📅 Flexible Registration**: No deadlines - register players anytime
- **🚀 Starting July 2025**: Liga de Sotogrande launches when enough players registered

## 🛠️ Tech Stack

- **Framework**: Next.js 14 with App Router
- **Database**: MongoDB with Mongoose ODM
- **Styling**: Tailwind CSS with custom design system
- **Languages**: JavaScript/JSX with modern React patterns
- **State Management**: React Hooks (useState, useEffect, custom hooks)
- **Architecture**: Component-based with clear separation of concerns
- **Authentication**: Session-based admin authentication

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

## 📁 Project Structure

```
tenis-del-parque/
├── README.md
├── .env.local.example           # Environment variables example
├── app/                         # Next.js App Router pages
│   ├── admin/                   # Admin panel
│   │   ├── leagues/             # League management
│   │   ├── matches/             # Match management
│   │   ├── players/             # Player management
│   │   └── dashboard/           # Admin dashboard
│   ├── api/                     # API routes
│   │   ├── admin/               # Admin API endpoints
│   │   │   ├── auth/            # Authentication
│   │   │   ├── leagues/         # League operations
│   │   │   ├── matches/         # Match CRUD operations
│   │   │   └── players/         # Player management
│   │   ├── leagues/
│   │   │   └── [league]/
│   │   │       └── route.js     # League info endpoint
│   │   └── players/
│   │       └── register/
│   │           └── route.js     # Player registration endpoint
│   ├── signup/
│   │   └── [league]/
│   │       └── page.js          # Dynamic league signup page
│   ├── elo/
│   │   ├── layout.js
│   │   └── page.js              # ELO & Swiss Systems page
│   ├── rules/
│   │   ├── layout.js
│   │   └── page.js              # Rules page
│   ├── globals.css              # Global styles
│   ├── layout.js                # Root layout
│   └── page.js                  # Home page
├── components/                  # Reusable component library
│   ├── admin/                   # Admin panel components
│   ├── common/                  # Shared components
│   ├── elo/                     # ELO page components
│   ├── home/                    # Home page components
│   └── rules/                   # Rules page components
├── lib/                         # Utilities and business logic
│   ├── content/                 # Centralized content management
│   ├── db/                      # Database utilities
│   │   ├── mongodb.js           # MongoDB connection
│   │   └── mongoose.js          # Mongoose connection handler
│   ├── models/                  # Database models
│   │   ├── Player.js            # Player model with match history
│   │   ├── League.js            # League model
│   │   └── Match.js             # Match model with ELO tracking
│   ├── hooks/                   # Custom React hooks
│   └── utils/                   # Utility functions
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
   Edit `.env.local` and add your MongoDB connection string and admin credentials:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/tenis-del-parque
   ADMIN_PASSWORD_HASH=your_password_hash
   SESSION_SECRET=your_session_secret
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
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run seed:leagues # Seed database with initial leagues
```

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
- **Player Management**: Update player status, view statistics, export data
- **Match Scheduling**: Create matches between players
- **Result Entry**: Enter match scores and automatic ELO calculation
- **Dashboard**: Overview of league statistics and recent activity

### Technical Features
- **🌍 Multilingual**: Spanish/English with automatic browser detection
- **📱 Responsive Design**: Mobile-first approach
- **⚡ API Routes**: RESTful API for all operations
- **🔒 Data Validation**: Server-side validation for all inputs
- **🎨 Design System**: Consistent branding with Tailwind CSS
- **🔐 Authentication**: Secure admin panel with session management

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
```

### Admin API (Protected)

See the [Admin Panel Documentation](./app/admin/README.md) for complete API reference.

## 🔧 Environment Variables

Create a `.env.local` file with:

```env
# MongoDB Connection String
MONGODB_URI=your_mongodb_connection_string

# Optional: Specific database name
MONGODB_DB=tenis-del-parque

# Admin Panel
ADMIN_PASSWORD_HASH=your_password_hash
SESSION_SECRET=your_session_secret

# Analytics (optional)
NEXT_PUBLIC_GA_ID=your_google_analytics_id
NEXT_PUBLIC_CLARITY_ID=your_microsoft_clarity_id
```

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
- `ADMIN_PASSWORD_HASH`: Secure admin password hash
- `SESSION_SECRET`: Strong session secret

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
