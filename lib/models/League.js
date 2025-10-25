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
  
  // NEW: Playoff Configuration
  playoffConfig: {
    enabled: {
      type: Boolean,
      default: true
    },
    numberOfGroups: {
      type: Number,
      enum: [1, 2],
      default: 1 // Can be 1 (just A) or 2 (A and B)
    },
    groupAPlayers: {
      type: Number,
      default: 8 // Top 8 players
    },
    groupBPlayers: {
      type: Number,
      default: 8 // Players 9-16
    },
    format: {
      type: String,
      enum: ['tournament', 'round-robin', 'swiss'],
      default: 'tournament' // Knockout tournament format
    },
    currentPhase: {
      type: String,
      enum: ['regular_season', 'playoffs_groupA', 'playoffs_groupB', 'completed'],
      default: 'regular_season'
    },
    playoffStartDate: Date,
    playoffEndDate: Date,
    // Store qualified players
    qualifiedPlayers: {
      groupA: [{
        player: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Player'
        },
        seed: Number,
        regularSeasonPosition: Number
      }],
      groupB: [{
        player: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Player'
        },
        seed: Number,
        regularSeasonPosition: Number
      }]
    },
    // Tournament bracket structure
    bracket: {
      groupA: {
        quarterfinals: [{
          matchId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Match'
          },
          seed1: Number,
          seed2: Number,
          winner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Player'
          }
        }],
        semifinals: [{
          matchId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Match'
          },
          fromMatch1: Number, // Index of QF match
          fromMatch2: Number, // Index of QF match
          winner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Player'
          }
        }],
        final: {
          matchId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Match'
          },
          winner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Player'
          }
        },
        thirdPlace: {
          matchId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Match'
          },
          winner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Player'
          }
        }
      },
      groupB: {
        quarterfinals: [{
          matchId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Match'
          },
          seed1: Number,
          seed2: Number,
          winner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Player'
          }
        }],
        semifinals: [{
          matchId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Match'
          },
          fromMatch1: Number,
          fromMatch2: Number,
          winner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Player'
          }
        }],
        final: {
          matchId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Match'
          },
          winner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Player'
          }
        },
        thirdPlace: {
          matchId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Match'
          },
          winner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Player'
          }
        }
      }
    }
  },
  
  // Contact Information
  contact: {
    email: String,
    whatsapp: String,
    website: String
  },
  
  // WhatsApp Group Integration for Community Building
  whatsappGroup: {
    inviteCode: {
      type: String,
      default: null
      // Extract from WhatsApp group link: https://chat.whatsapp.com/ABC123
    },
    name: {
      type: String,
      default: null
    },
    isActive: {
      type: Boolean,
      default: false
    },
    adminPhone: {
      type: String,
      default: null
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
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
  },
  
  // NEW: Discount Codes System
  discountCodes: [{
    code: {
      type: String,
      required: true,
      uppercase: true,
      trim: true
    },
    discountPercentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
      default: 100
    },
    description: {
      type: String,
      default: 'Promotional discount'
    },
    validFrom: {
      type: Date,
      default: Date.now
    },
    validUntil: {
      type: Date,
      default: () => new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // 90 days default
    },
    maxUses: {
      type: Number,
      default: null // null = unlimited
    },
    usedCount: {
      type: Number,
      default: 0
    },
    usedBy: [{
      playerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Player'
      },
      usedAt: {
        type: Date,
        default: Date.now
      },
      email: String
    }],
    isActive: {
      type: Boolean,
      default: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
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
  'season.type': 1
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

// Virtual to check if in playoffs phase
LeagueSchema.virtual('isInPlayoffs').get(function() {
  return this.playoffConfig?.currentPhase && 
         this.playoffConfig.currentPhase !== 'regular_season' &&
         this.playoffConfig.currentPhase !== 'completed'
})

// Method to get city name for display
LeagueSchema.methods.getCityName = function() {
  try {
    if (this.city && typeof this.city === 'object' && this.city.name) {
      return this.city.name.es || this.city.name.en
    }
    return this.location?.city || 'Unknown'
  } catch (error) {
    console.warn('Error in getCityName:', error)
    return this.location?.city || 'Unknown'
  }
}

// Method to get city slug for URLs
LeagueSchema.methods.getCitySlug = function() {
  try {
    if (this.city && typeof this.city === 'object' && this.city.slug) {
      return this.city.slug
    }
    return this.slug
  } catch (error) {
    console.warn('Error in getCitySlug:', error)
    return this.slug || 'unknown'
  }
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
  
  return `${seasonName} ${this.season.year}`
}

// Method to get city images
LeagueSchema.methods.getCityImages = function() {
  if (this.city && typeof this.city === 'object' && this.city.images) {
    return this.city.images
  }
  return null
}

// Method to get WhatsApp group info
LeagueSchema.methods.getWhatsAppGroupInfo = function() {
  if (!this.whatsappGroup || !this.whatsappGroup.isActive) {
    return null
  }
  
  return {
    inviteLink: this.whatsappGroup.inviteCode ? 
      `https://chat.whatsapp.com/${this.whatsappGroup.inviteCode}` : null,
    name: this.whatsappGroup.name || `${this.name} - Community`,
    adminContact: this.whatsappGroup.adminPhone
  }
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
  
  if (!baseLeague.city) {
    throw new Error('Base league does not have a city associated')
  }
  
  if (!baseLeague.city.slug) {
    throw new Error('City does not have a slug')
  }
  
  // Generate slug for new season
  const citySlug = baseLeague.city.slug
  const skillSlug = baseLeague.skillLevel === 'all' ? '' : `-${baseLeague.skillLevel}`
  let seasonSlug = `${citySlug}${skillSlug}-${seasonData.season.type}-${seasonData.season.year}`
  
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
    displayOrder: baseLeague.displayOrder,
    // Copy WhatsApp group info if exists
    whatsappGroup: baseLeague.whatsappGroup || undefined,
    // Copy playoff configuration
    playoffConfig: seasonData.playoffConfig || baseLeague.playoffConfig
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
            waitingListCount: '$waitingListCount',
            whatsappGroup: '$whatsappGroup',
            playoffConfig: '$playoffConfig'
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
