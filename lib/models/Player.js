import mongoose from 'mongoose'

const PlayerSchema = new mongoose.Schema({
  // Basic Information (UNIQUE PER PERSON)
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters long'],
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true, // KEEP THIS - one email = one person globally
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
  },
  
  whatsapp: {
    type: String,
    required: [true, 'WhatsApp number is required'],
    trim: true,
    match: [/^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,5}[-\s\.]?[0-9]{1,5}$/, 'Please provide a valid phone number']
  },
  
  // User Association
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  
  // LEAGUE REGISTRATIONS - One player can be in multiple leagues!
  registrations: [{
    league: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'League',
      required: true
    },
    season: {
      type: mongoose.Schema.Types.Mixed, // Allow both String and ObjectId
      required: true
    },
    level: {
      type: String,
      required: true,
      enum: ['beginner', 'intermediate', 'advanced']
    },
    registeredAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['waiting', 'pending', 'confirmed', 'active', 'inactive'],
      default: 'pending'
    },
    // League-specific statistics
    stats: {
      matchesPlayed: { type: Number, default: 0 },
      matchesWon: { type: Number, default: 0 },
      totalPoints: { type: Number, default: 0 },
      eloRating: { type: Number }, // Set in pre-save hook
      highestElo: { type: Number },
      lowestElo: { type: Number },
      setsWon: { type: Number, default: 0 },
      setsLost: { type: Number, default: 0 },
      gamesWon: { type: Number, default: 0 },
      gamesLost: { type: Number, default: 0 },
      retirements: { type: Number, default: 0 },
      walkovers: { type: Number, default: 0 }
    },
    // League-specific match history
    matchHistory: [{
      match: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Match',
        required: true
      },
      opponent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Player',
        required: true
      },
      result: {
        type: String,
        enum: ['won', 'lost'],
        required: true
      },
      score: { type: String },
      eloChange: { type: Number, required: true },
      eloAfter: { type: Number, required: true },
      round: { type: Number, required: true },
      date: { type: Date, required: true }
    }],
    // League-specific wild cards
    wildCards: {
      total: { type: Number, default: 3 },
      used: { type: Number, default: 0 },
      history: [{
        match: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Match'
        },
        usedAt: { type: Date, default: Date.now },
        reason: String
      }]
    },
    // Admin Notes for this league
    notes: {
      type: String,
      maxlength: [1000, 'Notes cannot exceed 1000 characters']
    }
  }],
  
  // Global player preferences
  preferences: {
    emailNotifications: { type: Boolean, default: true },
    whatsappNotifications: { type: Boolean, default: true },
    preferredLanguage: { type: String, enum: ['es', 'en'], default: 'es' }
  },
  
  // Registration metadata
  metadata: {
    source: { type: String, default: 'web' },
    userAgent: String,
    ipAddress: String,
    firstRegistrationDate: { type: Date, default: Date.now }
  }
}, {
  timestamps: true
})

// Indexes for better performance
// email index with unique constraint is created automatically by field definition above
PlayerSchema.index({ 'registrations.league': 1 })
PlayerSchema.index({ 'registrations.season': 1 })
PlayerSchema.index({ 'registrations.status': 1 })
PlayerSchema.index({ 'registrations.league': 1, 'registrations.season': 1 })
PlayerSchema.index({ 'registrations.stats.eloRating': -1 })

// Virtual for display name
PlayerSchema.virtual('displayName').get(function() {
  return this.name
})

// Virtual to check if player has user account
PlayerSchema.virtual('hasUserAccount').get(function() {
  return !!this.userId
})

// Helper function to get initial ELO based on level
function getInitialEloByLevel(level) {
  const eloRatings = {
    'beginner': 1180,
    'intermediate': 1200,
    'advanced': 1250
  }
  return eloRatings[level] || 1200
}

// Method to add a new league registration
PlayerSchema.methods.addLeagueRegistration = function(leagueId, season, level, status = 'pending') {
  // Check if already registered for this league+season
  const existingRegistration = this.registrations.find(reg => 
    reg.league.toString() === leagueId.toString() && reg.season === season
  )
  
  if (existingRegistration) {
    throw new Error(`Already registered for ${season} season of this league`)
  }
  
  const initialElo = getInitialEloByLevel(level)
  
  const newRegistration = {
    league: leagueId,
    season: season,
    level: level,
    status: status,
    stats: {
      eloRating: initialElo,
      highestElo: initialElo,
      lowestElo: initialElo
    }
  }
  
  this.registrations.push(newRegistration)
  return this.save()
}

// Method to get registration for specific league/season
PlayerSchema.methods.getLeagueRegistration = function(leagueId, season) {
  return this.registrations.find(reg => 
    reg.league.toString() === leagueId.toString() && 
    reg.season.toString() === season.toString()
  )
}

// Method to check if player can participate in a specific league
PlayerSchema.methods.canParticipateInLeague = function(leagueId, season) {
  const registration = this.getLeagueRegistration(leagueId, season)
  return registration && (registration.status === 'confirmed' || registration.status === 'active')
}

// Method to update match stats for a specific league
PlayerSchema.methods.updateMatchStatsForLeague = function(leagueId, season, matchResult) {
  const registration = this.getLeagueRegistration(leagueId, season)
  if (!registration) {
    throw new Error('Player not registered for this league/season')
  }
  
  const { won, eloChange, score, opponent, matchId, round, date } = matchResult
  
  // Update basic stats
  registration.stats.matchesPlayed += 1
  if (won) registration.stats.matchesWon += 1
  
  // Update ELO
  registration.stats.eloRating += eloChange
  if (registration.stats.eloRating > registration.stats.highestElo) {
    registration.stats.highestElo = registration.stats.eloRating
  }
  if (registration.stats.eloRating < registration.stats.lowestElo) {
    registration.stats.lowestElo = registration.stats.eloRating
  }
  
  // Add to match history
  registration.matchHistory.push({
    match: matchId,
    opponent: opponent,
    result: won ? 'won' : 'lost',
    score: score,
    eloChange: eloChange,
    eloAfter: registration.stats.eloRating,
    round: round,
    date: date
  })
  
  // Sort match history by date (most recent first)
  registration.matchHistory.sort((a, b) => b.date - a.date)
  
  return this.save()
}

// Static method to find players by league
PlayerSchema.statics.findByLeague = function(leagueId, season = null, options = {}) {
  const matchQuery = { 'registrations.league': leagueId }
  if (season) {
    // Handle both string and ObjectId season values
    matchQuery['registrations.season'] = season
  }
  if (options.status) matchQuery['registrations.status'] = options.status
  if (options.level) matchQuery['registrations.level'] = options.level
  
  return this.find({
    registrations: {
      $elemMatch: matchQuery
    }
  }).sort({ 'metadata.firstRegistrationDate': -1 })
}

// Static method to get league standings
PlayerSchema.statics.getLeagueStandings = function(leagueId, season, level = null) {
  const pipeline = [
    // Match players registered for this league/season
    {
      $match: {
        registrations: {
          $elemMatch: {
            league: leagueId,
            season: season, // MongoDB will handle ObjectId comparison automatically
            status: { $in: ['confirmed', 'active'] },
            ...(level && { level: level })
          }
        }
      }
    },
    // Unwind registrations to work with individual registrations
    { $unwind: '$registrations' },
    // Match only the specific league/season registration
    {
      $match: {
        'registrations.league': leagueId,
        'registrations.season': season, // MongoDB will handle ObjectId comparison automatically
        'registrations.status': { $in: ['confirmed', 'active'] },
        ...(level && { 'registrations.level': level })
      }
    },
    // Sort by performance
    {
      $sort: {
        'registrations.stats.matchesWon': -1,
        'registrations.stats.eloRating': -1,
        'registrations.stats.setsWon': -1
      }
    },
    { $limit: 50 }
  ]
  
  return this.aggregate(pipeline)
}

// Pre-save hook to ensure email is lowercase
PlayerSchema.pre('save', function(next) {
  // Ensure email is lowercase
  if (this.email) {
    this.email = this.email.toLowerCase()
  }
  
  // Set initial ELO for new registrations
  this.registrations.forEach(registration => {
    if (registration.isNew && registration.level) {
      const initialElo = getInitialEloByLevel(registration.level)
      
      if (!registration.stats.eloRating) {
        registration.stats.eloRating = initialElo
        registration.stats.highestElo = initialElo
        registration.stats.lowestElo = initialElo
      }
    }
  })
  
  next()
})

// Avoid model recompilation in development
const Player = mongoose.models.Player || mongoose.model('Player', PlayerSchema)

export default Player
