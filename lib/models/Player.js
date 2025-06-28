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
  
  // Future fields for league management
  stats: {
    matchesPlayed: {
      type: Number,
      default: 0
    },
    matchesWon: {
      type: Number,
      default: 0
    },
    eloRating: {
      type: Number,
      default: 1200 // Starting ELO rating
    }
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
PlayerSchema.index({ email: 1 })
PlayerSchema.index({ level: 1 })
PlayerSchema.index({ status: 1 })
PlayerSchema.index({ registeredAt: -1 })
PlayerSchema.index({ league: 1, status: 1 })
PlayerSchema.index({ league: 1, level: 1 })
PlayerSchema.index({ league: 1, season: 1 })

// Virtual for display name
PlayerSchema.virtual('displayName').get(function() {
  return this.name
})

// Method to check if player can participate
PlayerSchema.methods.canParticipate = function() {
  return this.status === 'confirmed' || this.status === 'active'
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

// Pre-save hook to ensure email is lowercase
PlayerSchema.pre('save', function(next) {
  if (this.email) {
    this.email = this.email.toLowerCase()
  }
  next()
})

// Avoid model recompilation in development
const Player = mongoose.models.Player || mongoose.model('Player', PlayerSchema)

export default Player