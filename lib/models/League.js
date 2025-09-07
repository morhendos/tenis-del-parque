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
  
  // NEW: Skill Level Support
  skillLevel: {
    type: String,
    enum: ['all', 'beginner', 'intermediate', 'advanced'],
    default: 'all',
    required: true
  },
  
  // NEW: Season Information
  season: {
    year: {
      type: Number,
      required: true,
      min: 2024,
      max: 2030
    },
    type: {
      type: String,
      enum: ['spring', 'summer', 'autumn', 'winter', 'annual'],
      required: true
    },
    number: {
      type: Number, // For multiple seasons per year (Season 1, Season 2, etc.)
      default: 1
    }
  },
  
  // City Reference - Link to City model
  city: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'City',
    required: true
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
  
  // NEW: Enhanced Season Configuration
  seasonConfig: {
    startDate: {
      type: Date,
      required: function() { return this.status !== 'coming_soon' }
    },
    endDate: {
      type: Date,
      required: function() { return this.status !== 'coming_soon' }
    },
    registrationStart: Date,
    registrationEnd: Date,
    maxPlayers: {
      type: Number,
      default: 20
    },
    minPlayers: {
      type: Number,
      default: 8
    },
    price: {
      amount: {
        type: Number,
        default: 0
      },
      currency: {
        type: String,
        default: 'EUR'
      },
      isFree: {
        type: Boolean,
        default: false
      }
    }
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
    levels: [{ // Legacy - kept for backward compatibility
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
    enum: ['active', 'inactive', 'coming_soon', 'registration_open', 'completed'],
    default: 'coming_soon'
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
  
  // NEW: Parent League Reference (for grouping seasons of same league)
  parentLeague: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'League',
    default: null
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
    },
    registeredPlayers: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
})

// Indexes
LeagueSchema.index({ status: 1 })
LeagueSchema.index({ 'location.city': 1 })
LeagueSchema.index({ city: 1 })
LeagueSchema.index({ displayOrder: 1 })
LeagueSchema.index({ skillLevel: 1 })
LeagueSchema.index({ 'season.year': 1, 'season.type': 1 })
LeagueSchema.index({ parentLeague: 1 })

// Compound index to prevent duplicate leagues
LeagueSchema.index({ 
  city: 1, 
  skillLevel: 1, 
  'season.year': 1, 
  'season.type': 1, 
  'season.number': 1 
}, { unique: true })

// Virtual for full league name
LeagueSchema.virtual('fullName').get(function() {
  const cityName = this.getCityName()
  const skillLevelName = this.getSkillLevelName()
  const seasonName = this.getSeasonName()
  
  if (this.skillLevel === 'all') {
    return `${cityName} ${seasonName}`
  }
  return `${cityName} ${skillLevelName} ${seasonName}`
})

// Virtual for registration status
LeagueSchema.virtual('isRegistrationOpen').get(function() {
  if (this.status !== 'registration_open') return false
  
  const now = new Date()
  const regStart = this.seasonConfig?.registrationStart
  const regEnd = this.seasonConfig?.registrationEnd
  
  if (regStart && now < regStart) return false
  if (regEnd && now > regEnd) return false
  
  return true
})

// Virtual for player count
LeagueSchema.virtual('playerCount').get(function() {
  return this.stats?.registeredPlayers || 0
})

// Method to get city name for display
LeagueSchema.methods.getCityName = function() {
  if (this.city && typeof this.city === 'object' && this.city.name) {
    return this.city.name.es || this.city.name.en
  }
  return this.location?.city || 'Unknown'
}

// Method to get city slug for URLs
LeagueSchema.methods.getCitySlug = function() {
  if (this.city && typeof this.city === 'object' && this.city.slug) {
    return this.city.slug
  }
  return this.slug
}

// Method to get skill level name
LeagueSchema.methods.getSkillLevelName = function(language = 'es') {
  const skillLevelNames = {
    es: {
      all: 'General',
      beginner: 'Principiantes',
      intermediate: 'Intermedio',
      advanced: 'Avanzado'
    },
    en: {
      all: 'General',
      beginner: 'Beginners',
      intermediate: 'Intermediate', 
      advanced: 'Advanced'
    }
  }
  
  return skillLevelNames[language][this.skillLevel] || skillLevelNames['es'][this.skillLevel]
}

// Method to get season name
LeagueSchema.methods.getSeasonName = function(language = 'es') {
  const seasonNames = {
    es: {
      spring: 'Primavera',
      summer: 'Verano',
      autumn: 'Otoño',
      winter: 'Invierno',
      annual: 'Anual'
    },
    en: {
      spring: 'Spring',
      summer: 'Summer',
      autumn: 'Autumn',
      winter: 'Winter',
      annual: 'Annual'
    }
  }
  
  const seasonName = seasonNames[language][this.season.type] || this.season.type
  const seasonNumber = this.season.number > 1 ? ` ${this.season.number}` : ''
  
  return `${seasonName} ${this.season.year}${seasonNumber}`
}

// Method to get city images
LeagueSchema.methods.getCityImages = function() {
  if (this.city && typeof this.city === 'object' && this.city.images) {
    return this.city.images
  }
  return null
}

// Static method to find by slug
LeagueSchema.statics.findBySlug = function(slug) {
  return this.findOne({ slug: slug.toLowerCase(), status: { $in: ['active', 'coming_soon', 'registration_open'] } })
}

// Static method to find all public leagues with city data
LeagueSchema.statics.findPublicLeagues = function() {
  return this.find({ 
    status: { $in: ['active', 'coming_soon', 'registration_open', 'completed'] } 
  })
  .populate('city', 'slug name images coordinates googleData')
  .sort({ displayOrder: 1, 'season.year': -1, 'season.type': 1, createdAt: 1 })
}

// NEW: Static method to find leagues by city and skill level
LeagueSchema.statics.findByCityAndSkill = function(cityId, skillLevel = null) {
  const query = { city: cityId, status: { $in: ['active', 'coming_soon', 'registration_open'] } }
  if (skillLevel) {
    query.skillLevel = skillLevel
  }
  return this.find(query)
    .populate('city', 'slug name images')
    .sort({ 'season.year': -1, 'season.type': 1, skillLevel: 1 })
}

// NEW: Static method to create new season for existing league
LeagueSchema.statics.createNewSeason = async function(baseLeagueId, seasonData) {
  const baseLeague = await this.findById(baseLeagueId).populate('city')
  if (!baseLeague) {
    throw new Error('Base league not found')
  }
  
  // Generate slug for new season
  const citySlug = baseLeague.city.slug
  const skillSlug = baseLeague.skillLevel === 'all' ? '' : `-${baseLeague.skillLevel}`
  const seasonSlug = `${citySlug}${skillSlug}-${seasonData.season.type}-${seasonData.season.year}`
  if (seasonData.season.number > 1) {
    seasonSlug += `-${seasonData.season.number}`
  }
  
  const newLeague = new this({
    name: seasonData.name || baseLeague.name,
    slug: seasonSlug,
    skillLevel: baseLeague.skillLevel,
    season: seasonData.season,
    city: baseLeague.city._id,
    location: baseLeague.location,
    description: baseLeague.description,
    seasonConfig: seasonData.seasonConfig,
    config: baseLeague.config,
    contact: baseLeague.contact,
    status: seasonData.status || 'coming_soon',
    expectedLaunchDate: seasonData.expectedLaunchDate,
    parentLeague: baseLeagueId,
    displayOrder: baseLeague.displayOrder
  })
  
  await newLeague.save()
  return newLeague.populate('city')
}

// NEW: Static method to get league groups (grouped by city and skill level)
LeagueSchema.statics.getLeagueGroups = function() {
  return this.aggregate([
    {
      $match: { 
        status: { $in: ['active', 'coming_soon', 'registration_open', 'completed'] }
      }
    },
    {
      $lookup: {
        from: 'cities',
        localField: 'city',
        foreignField: '_id',
        as: 'cityData'
      }
    },
    {
      $unwind: '$cityData'
    },
    {
      $group: {
        _id: {
          city: '$city',
          skillLevel: '$skillLevel'
        },
        cityName: { $first: '$cityData.name' },
        citySlug: { $first: '$cityData.slug' },
        cityImages: { $first: '$cityData.images' },
        skillLevel: { $first: '$skillLevel' },
        leagues: { 
          $push: {
            _id: '$_id',
            name: '$name',
            slug: '$slug',
            season: '$season',
            status: '$status',
            expectedLaunchDate: '$expectedLaunchDate',
            seasonConfig: '$seasonConfig',
            stats: '$stats',
            waitingListCount: '$waitingListCount'
          }
        },
        totalPlayers: { $sum: '$stats.registeredPlayers' },
        latestSeason: { $max: '$season.year' }
      }
    },
    {
      $sort: {
        'cityName.es': 1,
        skillLevel: 1
      }
    }
  ])
}

// Pre-save hook to sync legacy location.city with city reference
LeagueSchema.pre('save', async function(next) {
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
