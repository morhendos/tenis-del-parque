import mongoose from 'mongoose'

const LeagueSchema = new mongoose.Schema({
  // Basic Information
  name: {
    type: String,
    required: [true, 'League name is required'],
    trim: true
  },
  
  slug: {
    type: String,
    required: [true, 'League slug is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens']
  },
  
  location: {
    city: {
      type: String,
      required: true
    },
    region: String,
    country: {
      type: String,
      required: true
    },
    timezone: {
      type: String,
      default: 'Europe/Madrid'
    }
  },
  
  // League Details
  description: {
    es: String,
    en: String
  },
  
  // Season Information
  seasons: [{
    name: String,
    startDate: Date,
    endDate: Date,
    maxPlayers: Number,
    price: {
      amount: Number,
      currency: {
        type: String,
        default: 'EUR'
      },
      isFree: {
        type: Boolean,
        default: false
      }
    },
    status: {
      type: String,
      enum: ['upcoming', 'registration_open', 'active', 'completed'],
      default: 'upcoming'
    }
  }],
  
  // Current Season Reference
  currentSeason: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Season'
  },
  
  // League Configuration
  config: {
    roundsPerSeason: {
      type: Number,
      default: 8
    },
    wildCardsPerPlayer: {
      type: Number,
      default: 4
    },
    playoffPlayers: {
      type: Number,
      default: 8
    },
    levels: [{
      key: String,
      name: {
        es: String,
        en: String
      },
      eloRange: {
        min: Number,
        max: Number
      }
    }]
  },
  
  // Contact Information
  contact: {
    email: String,
    whatsapp: String,
    website: String
  },
  
  // Status
  status: {
    type: String,
    enum: ['active', 'inactive', 'coming_soon'],
    default: 'active'
  },
  
  // Stats
  stats: {
    totalPlayers: {
      type: Number,
      default: 0
    },
    totalMatches: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
})

// Indexes
// Note: slug index is automatically created by unique: true
LeagueSchema.index({ status: 1 })
LeagueSchema.index({ 'location.city': 1 })

// Virtual for current season info - simplified without deadline check
LeagueSchema.virtual('isRegistrationOpen').get(function() {
  if (!this.seasons || this.seasons.length === 0) return false
  
  const currentSeason = this.seasons[this.seasons.length - 1]
  return currentSeason.status === 'registration_open'
})

// Method to get active season
LeagueSchema.methods.getActiveSeason = function() {
  if (!this.seasons || this.seasons.length === 0) return null
  
  return this.seasons.find(season => 
    season.status === 'active' || season.status === 'registration_open'
  ) || this.seasons[this.seasons.length - 1]
}

// Static method to find by slug
LeagueSchema.statics.findBySlug = function(slug) {
  return this.findOne({ slug: slug.toLowerCase(), status: 'active' })
}

const League = mongoose.models.League || mongoose.model('League', LeagueSchema)

export default League