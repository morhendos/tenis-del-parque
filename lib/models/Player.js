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
    required: false, // Make it optional to avoid validation errors during match result updates
    trim: true,
    validate: {
      validator: function(v) {
        // Only validate if value is provided
        if (!v || v === '') return true;
        return /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,5}[-\s\.]?[0-9]{1,5}$/.test(v);
      },
      message: 'Please provide a valid phone number'
    }
  },
  
  // User Association
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  
  // Global ELO Rating (across all leagues)
  eloRating: {
    type: Number,
    default: 1200
  },
  highestElo: {
    type: Number,
    default: 1200
  },
  lowestElo: {
    type: Number,
    default: 1200
  },
  
  // LEAGUE REGISTRATIONS - One player can be in multiple leagues!
  // Note: Each league already contains season info, no need to duplicate it here
  registrations: [{
    league: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'League',
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
    // League-specific statistics (no ELO - that's global)
    stats: {
      matchesPlayed: { type: Number, default: 0 },
      matchesWon: { type: Number, default: 0 },
      totalPoints: { type: Number, default: 0 },
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
      eloAfter: { type: Number, required: true }, // This will be the global ELO after the match
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
    },
    // NEW: Discount Code Tracking
    discountCode: {
      type: String,
      default: null
    },
    discountApplied: {
      type: Number,
      default: 0
    },
    originalPrice: {
      type: Number,
      default: 0
    },
    finalPrice: {
      type: Number,
      default: 0
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'waived'],
      default: 'pending'
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
PlayerSchema.index({ 'registrations.status': 1 })
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
    'beginner': 1100,
    'intermediate': 1200,
    'advanced': 1300
  }
  return eloRatings[level] || 1200
}

// Method to add a new league registration
PlayerSchema.methods.addLeagueRegistration = function(leagueId, level, status = 'pending') {
  // Check if already registered for this league
  const existingRegistration = this.registrations.find(reg => 
    reg.league.toString() === leagueId.toString()
  )
  
  if (existingRegistration) {
    throw new Error(`Already registered for this league`)
  }
  
  const initialElo = getInitialEloByLevel(level)
  
  const newRegistration = {
    league: leagueId,
    level: level,
    status: status,
    stats: {} // No ELO here - it's global now
  }
  
  // Set initial global ELO if this is the player's first registration
  if (this.registrations.length === 0) {
    this.eloRating = initialElo
    this.highestElo = initialElo
    this.lowestElo = initialElo
  }
  
  this.registrations.push(newRegistration)
  return this.save()
}

// Method to get registration for specific league
PlayerSchema.methods.getLeagueRegistration = function(leagueId) {
  return this.registrations.find(reg => 
    reg.league.toString() === leagueId.toString()
  )
}

// Method to check if player can participate in a specific league
PlayerSchema.methods.canParticipateInLeague = function(leagueId) {
  const registration = this.getLeagueRegistration(leagueId)
  return registration && (registration.status === 'confirmed' || registration.status === 'active')
}

// Method to update match stats for a specific league
PlayerSchema.methods.updateMatchStatsForLeague = function(leagueId, matchResult) {
  const registration = this.getLeagueRegistration(leagueId)
  if (!registration) {
    throw new Error('Player not registered for this league')
  }
  
  const { won, eloChange, score, opponent, matchId, round, date } = matchResult
  
  // Update basic stats
  registration.stats.matchesPlayed += 1
  if (won) registration.stats.matchesWon += 1
  
  // Update global ELO (not league-specific)
  this.eloRating += eloChange
  if (this.eloRating > this.highestElo) {
    this.highestElo = this.eloRating
  }
  if (this.eloRating < this.lowestElo) {
    this.lowestElo = this.eloRating
  }
  
  // Add to match history
  registration.matchHistory.push({
    match: matchId,
    opponent: opponent,
    result: won ? 'won' : 'lost',
    score: score,
    eloChange: eloChange,
    eloAfter: this.eloRating, // Use global ELO
    round: round,
    date: date
  })
  
  // Sort match history by date (most recent first)
  registration.matchHistory.sort((a, b) => b.date - a.date)
  
  return this.save()
}

// Static method to find players by league
PlayerSchema.statics.findByLeague = function(leagueId, options = {}) {
  const matchQuery = { 'registrations.league': leagueId }
  if (options.status) matchQuery['registrations.status'] = options.status
  if (options.level) matchQuery['registrations.level'] = options.level
  
  return this.find({
    registrations: {
      $elemMatch: matchQuery
    }
  }).sort({ 'metadata.firstRegistrationDate': -1 })
}

// Static method to get league standings
PlayerSchema.statics.getLeagueStandings = function(leagueId, level = null) {
  const pipeline = [
    // Match players registered for this league
    {
      $match: {
        registrations: {
          $elemMatch: {
            league: leagueId,
            status: { $in: ['confirmed', 'active'] },
            ...(level && { level: level })
          }
        }
      }
    },
    // Unwind registrations to work with individual registrations
    { $unwind: '$registrations' },
    // Match only the specific league registration
    {
      $match: {
        'registrations.league': leagueId,
        'registrations.status': { $in: ['confirmed', 'active'] },
        ...(level && { 'registrations.level': level })
      }
    },
    // Sort by performance (league-specific, not global ELO!)
    {
      $sort: {
        'registrations.stats.matchesWon': -1,
        'registrations.stats.setsWon': -1,
        'registrations.stats.matchesPlayed': 1 // Fewer matches played as tiebreaker
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
  
  // Set initial global ELO for new players (only if no ELO is set)
  if (this.isNew && !this.eloRating) {
    // Use intermediate level as default if no registrations exist yet
    const defaultLevel = this.registrations.length > 0 ? this.registrations[0].level : 'intermediate'
    const initialElo = getInitialEloByLevel(defaultLevel)
    
    this.eloRating = initialElo
    this.highestElo = initialElo
    this.lowestElo = initialElo
  }
  
  next()
})

// Avoid model recompilation in development
const Player = mongoose.models.Player || mongoose.model('Player', PlayerSchema)

export default Player
