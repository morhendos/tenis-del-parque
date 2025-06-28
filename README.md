# Tenis del Parque - Sotogrande 🎾

A modern, multilingual tennis league platform built with Next.js and MongoDB, featuring ELO rankings, Swiss tournament system, multi-league support, and comprehensive player management. Starting July 2025!

## 🚀 Overview

Tenis del Parque is a sophisticated web application that combines cutting-edge web technologies with professional tennis league management. The platform supports multiple leagues, player registration with database persistence, and provides comprehensive information about league rules, ELO & Swiss systems.

### ✨ Key Features

- **🏆 Multi-League Support**: Scalable architecture supporting multiple tennis leagues
- **💾 MongoDB Integration**: Complete player registration and data persistence
- **🌍 Multilingual Support**: Full Spanish/English localization with automatic browser detection
- **📱 Responsive Design**: Beautiful, modern UI that works on all devices
- **🎯 League Management**: Swiss tournament system with ELO rankings
- **📅 Flexible Registration**: No deadlines - register players anytime
- **🚀 Starting July 2025**: Liga de Sotogrande launches when enough players registered

## 🛠️ Tech Stack

- **Framework**: Next.js 14 with App Router
- **Database**: MongoDB with Mongoose ODM
- **Styling**: Tailwind CSS with custom design system
- **Languages**: JavaScript/JSX with modern React patterns
- **State Management**: React Hooks (useState, useEffect, custom hooks)
- **Architecture**: Component-based with clear separation of concerns

## 📁 Project Structure

```
tenis-del-parque/
├── README.md
├── .env.local.example           # Environment variables example
├── app/                         # Next.js App Router pages
│   ├── api/                     # API routes
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
│   │   ├── Player.js            # Player model
│   │   └── League.js            # League model
│   ├── hooks/                   # Custom React hooks
│   └── utils/                   # Utility functions
├── scripts/                     # Utility scripts
│   ├── seedLeagues.js           # Database seeder for leagues
│   └── tree.js                  # Project structure generator
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
   Edit `.env.local` and add your MongoDB connection string:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/tenis-del-parque
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
  stats: {                   // Future league stats
    matchesPlayed: Number,
    matchesWon: Number,
    eloRating: Number
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

## 🎯 Features

### Core Features
- **🏆 Multi-League Architecture**: Support for multiple tennis leagues across different locations
- **📊 Player Registration**: Complete signup flow with MongoDB persistence
- **🌐 Dynamic League Pages**: Each league has its own signup page (`/signup/[league-slug]`)
- **📅 Flexible Timeline**: League starts July 2025, no registration deadline
- **💾 Data Persistence**: All player data saved in MongoDB

### Technical Features
- **🌍 Multilingual**: Spanish/English with automatic browser detection
- **📱 Responsive Design**: Mobile-first approach
- **⚡ API Routes**: RESTful API for player registration and league data
- **🔒 Data Validation**: Server-side validation for all inputs
- **🎨 Design System**: Consistent branding with Tailwind CSS

### League Features
- **🎯 Swiss Tournament System**: Fair pairing system
- **📈 ELO Rankings**: Dynamic skill-based rating system
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

### Player Registration
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

### League Information
```
GET /api/leagues/[slug]
Returns: League details and registration status
```

## 🔧 Environment Variables

Create a `.env.local` file with:

```env
# MongoDB Connection String
MONGODB_URI=your_mongodb_connection_string

# Optional: Specific database name
MONGODB_DB=tenis-del-parque
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