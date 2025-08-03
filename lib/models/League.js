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
  
  // City Reference - NEW: Link to City model
  city: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'City',
    required: false // Optional for backward compatibility
  },
  
  // Legacy location field - keep for backward compatibility
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
  
  // Coming Soon Fields
  expectedLaunchDate: {
    type: Date,
    required: function() { return this.status === 'coming_soon' }
  },
  
  waitingListCount: {
    type: Number,
    default: 0
  },
  
  // Display Settings
  displayOrder: {
    type: Number,
    default: 0
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
LeagueSchema.index({ city: 1 }) // NEW: Index for city reference
LeagueSchema.index({ displayOrder: 1 })

// Virtual for current season info - simplified without deadline check
LeagueSchema.virtual('isRegistrationOpen').get(function() {
  if (!this.seasons || this.seasons.length === 0) return false
  
  const currentSeason = this.seasons[this.seasons.length - 1]
  return currentSeason.status === 'registration_open'
})

// Virtual for player count
LeagueSchema.virtual('playerCount').get(function() {
  return this.stats?.totalPlayers || 0
})

// Method to get active season
LeagueSchema.methods.getActiveSeason = function() {
  if (!this.seasons || this.seasons.length === 0) return null
  
  return this.seasons.find(season => 
    season.status === 'active' || season.status === 'registration_open'
  ) || this.seasons[this.seasons.length - 1]
}

// NEW: Method to get city name for display
LeagueSchema.methods.getCityName = function() {
  // If populated city reference exists, use it
  if (this.city && typeof this.city === 'object' && this.city.name) {
    return this.city.name.es || this.city.name.en
  }
  // Fallback to legacy location field
  return this.location?.city || 'Unknown'
}

// NEW: Method to get city slug for URLs
LeagueSchema.methods.getCitySlug = function() {
  // If populated city reference exists, use it
  if (this.city && typeof this.city === 'object' && this.city.slug) {
    return this.city.slug
  }
  // Fallback to league slug (current behavior)
  return this.slug
}

// NEW: Method to get city images
LeagueSchema.methods.getCityImages = function() {
  // If populated city reference exists, use its images
  if (this.city && typeof this.city === 'object' && this.city.images) {
    return this.city.images
  }
  // No images available
  return null
}

// Static method to find by slug
LeagueSchema.statics.findBySlug = function(slug) {
  return this.findOne({ slug: slug.toLowerCase(), status: { $in: ['active', 'coming_soon'] } })
}

// Static method to find all public leagues (for homepage) with city data
LeagueSchema.statics.findPublicLeagues = function() {
  return this.find({ 
    status: { $in: ['active', 'coming_soon'] } 
  })
  .populate('city', 'slug name images coordinates googleData') // Populate city data
  .sort({ displayOrder: 1, createdAt: 1 })
}

// NEW: Static method to link league to city by city name
LeagueSchema.statics.linkToCity = async function(leagueId, citySlug) {
  const City = mongoose.model('City')
  const city = await City.findOne({ slug: citySlug })
  
  if (!city) {
    throw new Error(`City with slug '${citySlug}' not found`)
  }
  
  return this.findByIdAndUpdate(
    leagueId,
    { city: city._id },
    { new: true }
  ).populate('city')
}

// NEW: Pre-save hook to sync legacy location.city with city reference
LeagueSchema.pre('save', async function(next) {
  // If city reference is set but location.city doesn't match, update location.city
  if (this.city && this.isModified('city')) {
    try {
      const city = await mongoose.model('City').findById(this.city)
      if (city) {
        this.location.city = city.name.es || city.name.en
      }
    } catch (error) {
      console.warn('Error syncing city reference to location.city:', error)
    }
  }
  next()
})

const League = mongoose.models.League || mongoose.model('League', LeagueSchema)

export default League
