import mongoose from 'mongoose'

const PlayerSchema = new mongoose.Schema({
  // Basic Information
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
    unique: true,
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
  
  level: {
    type: String,
    required: [true, 'Player level is required'],
    enum: {
      values: ['beginner', 'intermediate', 'advanced'],
      message: 'Level must be either beginner, intermediate, or advanced'
    }
  },
  
  // User Association (NEW!)
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  
  // League Association
  league: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'League',
    required: [true, 'League association is required']
  },
  
  season: {
    type: String,
    required: [true, 'Season is required']  // e.g., "summer-2025"
  },
  
  // Registration Details
  registeredAt: {
    type: Date,
    default: Date.now
  },
  
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'active', 'inactive'],
    default: 'pending'
  },
  
  // Admin Notes
  notes: {
    type: String,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  },
  
  // Metadata
  metadata: {
    language: {
      type: String,
      enum: ['es', 'en'],
      default: 'es'
    },
    source: {
      type: String,
      default: 'web'
    },
    userAgent: String,
    ipAddress: String
  },
  
  // League Statistics
  stats: {
    matchesPlayed: {
      type: Number,
      default: 0
    },
    matchesWon: {
      type: Number,
      default: 0
    },
    totalPoints: {
      type: Number,
      default: 0
    },
    eloRating: {
      type: Number
      // Default will be set based on level in pre-save hook
    },
    highestElo: {
      type: Number
      // Default will be set based on level in pre-save hook
    },
    lowestElo: {
      type: Number
      // Default will be set based on level in pre-save hook
    },
    setsWon: {
      type: Number,
      default: 0
    },
    setsLost: {
      type: Number,
      default: 0
    },
    gamesWon: {
      type: Number,
      default: 0
    },
    gamesLost: {
      type: Number,
      default: 0
    },
    retirements: {
      type: Number,
      default: 0
    },
    walkovers: {
      type: Number,
      default: 0
    }
  },
  
  // Match History
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
    score: {
      type: String // e.g., "6-4, 7-5"
    },
    eloChange: {
      type: Number,
      required: true
    },
    eloAfter: {
      type: Number,
      required: true
    },
    round: {
      type: Number,
      required: true
    },
    date: {
      type: Date,
      required: true
    }
  }],
  
  // Wild Cards Management
  wildCards: {
    total: {
      type: Number,
      default: 3 // Total wild cards per season
    },
    used: {
      type: Number,
      default: 0
    },
    history: [{
      match: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Match'
      },
      usedAt: {
        type: Date,
        default: Date.now
      },
      reason: String
    }]
  },
  
  // Communication preferences
  preferences: {
    emailNotifications: {
      type: Boolean,
      default: true
    },
    whatsappNotifications: {
      type: Boolean,
      default: true
    }
  }
}, {
  timestamps: true // Adds createdAt and updatedAt automatically
})

// Indexes for better performance
// Note: email index is automatically created by unique: true
PlayerSchema.index({ userId: 1 })
PlayerSchema.index({ level: 1 })
PlayerSchema.index({ status: 1 })
PlayerSchema.index({ registeredAt: -1 })
PlayerSchema.index({ league: 1, status: 1 })
PlayerSchema.index({ league: 1, level: 1 })
PlayerSchema.index({ league: 1, season: 1 })
PlayerSchema.index({ 'stats.eloRating': -1 })
PlayerSchema.index({ 'stats.matchesWon': -1 })

// Virtual for display name
PlayerSchema.virtual('displayName').get(function() {
  return this.name
})

// Virtual for win percentage
PlayerSchema.virtual('winPercentage').get(function() {
  if (this.stats.matchesPlayed === 0) return 0
  return Math.round((this.stats.matchesWon / this.stats.matchesPlayed) * 100)
})

// Virtual for available wild cards
PlayerSchema.virtual('availableWildCards').get(function() {
  return this.wildCards.total - this.wildCards.used
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
  return eloRatings[level] || 1200 // Fallback to intermediate if level not found
}

// Method to check if player can participate
PlayerSchema.methods.canParticipate = function() {
  return this.status === 'confirmed' || this.status === 'active'
}

// Method to check if player has wild cards available
PlayerSchema.methods.hasWildCardsAvailable = function() {
  return this.availableWildCards > 0
}

// Method to use a wild card
PlayerSchema.methods.useWildCard = async function(matchId, reason) {
  if (!this.hasWildCardsAvailable()) {
    throw new Error('No wild cards available')
  }
  
  this.wildCards.used += 1
  this.wildCards.history.push({
    match: matchId,
    reason: reason
  })
  
  return this.save()
}

// Method to update stats after a match
PlayerSchema.methods.updateMatchStats = async function(matchResult) {
  const { won, eloChange, score, opponent, matchId, round, date } = matchResult
  
  // Update basic stats
  this.stats.matchesPlayed += 1
  if (won) this.stats.matchesWon += 1
  
  // Update ELO
  this.stats.eloRating += eloChange
  if (this.stats.eloRating > this.stats.highestElo) {
    this.stats.highestElo = this.stats.eloRating
  }
  if (this.stats.eloRating < this.stats.lowestElo) {
    this.stats.lowestElo = this.stats.eloRating
  }
  
  // Add to match history
  this.matchHistory.push({
    match: matchId,
    opponent: opponent,
    result: won ? 'won' : 'lost',
    score: score,
    eloChange: eloChange,
    eloAfter: this.stats.eloRating,
    round: round,
    date: date
  })
  
  // Sort match history by date (most recent first)
  this.matchHistory.sort((a, b) => b.date - a.date)
  
  return this.save()
}

// Static method to find players by level
PlayerSchema.statics.findByLevel = function(level, leagueId) {
  return this.find({ 
    level: level, 
    league: leagueId,
    status: { $in: ['confirmed', 'active'] } 
  })
}

// Static method to find players by league
PlayerSchema.statics.findByLeague = function(leagueId, options = {}) {
  const query = { league: leagueId }
  if (options.season) query.season = options.season
  if (options.status) query.status = options.status
  if (options.level) query.level = options.level
  return this.find(query).sort({ registeredAt: -1 })
}

// Static method to find players without user accounts
PlayerSchema.statics.findWithoutUsers = function(leagueId = null) {
  const query = { 
    userId: { $exists: false },
    status: { $in: ['confirmed', 'active'] }
  }
  if (leagueId) query.league = leagueId
  return this.find(query).sort({ registeredAt: -1 })
}

// Static method to get league standings
PlayerSchema.statics.getStandings = function(leagueId, season, level) {
  const query = { 
    league: leagueId, 
    season: season,
    status: { $in: ['confirmed', 'active'] }
  }
  if (level) query.level = level
  
  return this.find(query)
    .sort({ 
      'stats.matchesWon': -1, 
      'stats.eloRating': -1,
      'stats.setsWon': -1 
    })
    .limit(50)
}

// Pre-save hook to ensure email is lowercase and set initial ELO
PlayerSchema.pre('save', function(next) {
  // Ensure email is lowercase
  if (this.email) {
    this.email = this.email.toLowerCase()
  }
  
  // Set initial ELO based on level for new players
  if (this.isNew && this.level) {
    const initialElo = getInitialEloByLevel(this.level)
    
    if (!this.stats) {
      this.stats = {}
    }
    
    // Set ELO ratings if not already set
    if (this.stats.eloRating === undefined || this.stats.eloRating === null) {
      this.stats.eloRating = initialElo
    }
    if (this.stats.highestElo === undefined || this.stats.highestElo === null) {
      this.stats.highestElo = initialElo
    }
    if (this.stats.lowestElo === undefined || this.stats.lowestElo === null) {
      this.stats.lowestElo = initialElo
    }
  }
  
  next()
})

// Avoid model recompilation in development
const Player = mongoose.models.Player || mongoose.model('Player', PlayerSchema)

export default Player
