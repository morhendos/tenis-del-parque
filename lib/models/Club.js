import mongoose from 'mongoose'

const ClubSchema = new mongoose.Schema({
  // Basic Information
  name: {
    type: String,
    required: [true, 'Club name is required'],
    trim: true
  },
  
  slug: {
    type: String,
    required: [true, 'Club slug is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens']
  },
  
  // Enhanced Location with Geographic Areas Support
  location: {
    address: {
      type: String,
      required: true
    },
    
    // Specific area/neighborhood from Google Maps (e.g., "el-paraiso", "nueva-andalucia")
    area: {
      type: String,
      trim: true,
      lowercase: true
    },
    
    // Main city for league organization (e.g., "marbella", "estepona") 
    city: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },
    
    // Administrative city (what Google Maps originally returned)
    administrativeCity: {
      type: String,
      trim: true,
      lowercase: true
    },
    
    // For display purposes - combines area and city intelligently
    displayName: {
      type: String,
      trim: true
    },
    
    postalCode: String,
    coordinates: {
      lat: {
        type: Number,
        min: -90,
        max: 90
      },
      lng: {
        type: Number,
        min: -180,
        max: 180
      }
    },
    googleMapsUrl: String
  },
  
  // Multilingual Description - Made optional for Google imports
  description: {
    es: {
      type: String,
      default: ''
    },
    en: {
      type: String,
      default: ''
    }
  },
  
  // Enhanced Court Information - Separate sections for Tennis, Padel, and Pickleball
  courts: {
    // Tennis Courts
    tennis: {
      total: {
        type: Number,
        default: 0,
        min: 0
      },
      indoor: {
        type: Number,
        default: 0,
        min: 0
      },
      outdoor: {
        type: Number,
        default: 0,
        min: 0
      },
      surfaces: [{
        type: {
          type: String,
          enum: ['clay', 'hard', 'grass', 'synthetic', 'carpet'],
          required: true
        },
        count: {
          type: Number,
          required: true,
          min: 1
        }
      }]
    },
    
    // Padel Courts
    padel: {
      total: {
        type: Number,
        default: 0,
        min: 0
      },
      indoor: {
        type: Number,
        default: 0,
        min: 0
      },
      outdoor: {
        type: Number,
        default: 0,
        min: 0
      },
      surfaces: [{
        type: {
          type: String,
          enum: ['synthetic', 'glass', 'concrete'],
          required: true
        },
        count: {
          type: Number,
          required: true,
          min: 1
        }
      }]
    },
    
    // Pickleball Courts
    pickleball: {
      total: {
        type: Number,
        default: 0,
        min: 0
      },
      indoor: {
        type: Number,
        default: 0,
        min: 0
      },
      outdoor: {
        type: Number,
        default: 0,
        min: 0
      },
      surfaces: [{
        type: {
          type: String,
          enum: ['hard', 'synthetic', 'wood'],
          required: true
        },
        count: {
          type: Number,
          required: true,
          min: 1
        }
      }]
    },
    
    // Legacy fields for backward compatibility (will be migrated)
    total: {
      type: Number,
      default: 0
    },
    surfaces: [{
      type: {
        type: String,
        enum: ['clay', 'hard', 'grass', 'synthetic', 'carpet', 'padel'],
        required: true
      },
      count: {
        type: Number,
        required: true,
        min: 1
      }
    }],
    indoor: {
      type: Number,
      default: 0
    },
    outdoor: {
      type: Number,
      default: 0
    }
  },
  
  // Amenities and Features
  amenities: {
    parking: {
      type: Boolean,
      default: false
    },
    lighting: {
      type: Boolean,
      default: false
    },
    proShop: {
      type: Boolean,
      default: false
    },
    restaurant: {
      type: Boolean,
      default: false
    },
    changingRooms: {
      type: Boolean,
      default: false
    },
    showers: {
      type: Boolean,
      default: false
    },
    lockers: {
      type: Boolean,
      default: false
    },
    wheelchair: {
      type: Boolean,
      default: false
    },
    swimming: {
      type: Boolean,
      default: false
    },
    gym: {
      type: Boolean,
      default: false
    },
    sauna: {
      type: Boolean,
      default: false
    },
    physio: {
      type: Boolean,
      default: false
    }
  },
  
  // Services
  services: {
    lessons: {
      type: Boolean,
      default: false
    },
    coaching: {
      type: Boolean,
      default: false
    },
    stringing: {
      type: Boolean,
      default: false
    },
    tournaments: {
      type: Boolean,
      default: false
    },
    summerCamps: {
      type: Boolean,
      default: false
    }
  },
  
  // Contact Information
  contact: {
    phone: String,
    email: String,
    website: String,
    facebook: String,
    instagram: String
  },
  
  // Operating Hours
  operatingHours: {
    monday: { open: String, close: String },
    tuesday: { open: String, close: String },
    wednesday: { open: String, close: String },
    thursday: { open: String, close: String },
    friday: { open: String, close: String },
    saturday: { open: String, close: String },
    sunday: { open: String, close: String }
  },
  
  // Pricing
  pricing: {
    courtRental: {
      hourly: {
        min: Number,
        max: Number,
        currency: {
          type: String,
          default: 'EUR'
        }
      },
      membership: {
        monthly: Number,
        annual: Number,
        currency: {
          type: String,
          default: 'EUR'
        }
      }
    },
    publicAccess: {
      type: Boolean,
      default: true
    },
    membershipRequired: {
      type: Boolean,
      default: false
    }
  },
  
  // Tags for filtering
  tags: [{
    type: String,
    enum: [
      'family-friendly',
      'professional',
      'beginner-friendly',
      'tournaments',
      'social-club',
      'hotel-club',
      'municipal',
      'private',
      'academy'
    ]
  }],
  
  // Images
  images: {
    main: String,
    gallery: [String],
    googlePhotoReference: String
  },
  
  // GPS-based league assignment (cached for performance)
  assignedLeague: {
    type: String,
    index: true, // For fast queries
    default: null
  },
  
  // Timestamp when league assignment was last calculated
  leagueAssignedAt: {
    type: Date,
    default: null
  },

  // Status and SEO
  status: {
    type: String,
    enum: ['active', 'inactive', 'pending'],
    default: 'active'
  },
  
  featured: {
    type: Boolean,
    default: false
  },
  
  displayOrder: {
    type: Number,
    default: 0
  },
  
  // SEO Fields
  seo: {
    metaTitle: {
      es: String,
      en: String
    },
    metaDescription: {
      es: String,
      en: String
    },
    keywords: {
      es: [String],
      en: [String]
    }
  },
  
  // Google Maps Integration
  googlePlaceId: {
    type: String,
    unique: true,
    sparse: true // Allows null values to not conflict with unique constraint
  },
  
  googleData: {
    rating: Number,
    userRatingsTotal: Number,
    priceLevel: Number,
    types: [String],
    url: String,
    openingHours: Object,
    photos: [{
      photo_reference: String,
      height: Number,
      width: Number,
      html_attributions: [String]
    }],
    lastSynced: Date
  },
  
  // Import tracking
  importSource: {
    type: String,
    enum: ['manual', 'google', 'csv'],
    default: 'manual'
  },
  
  importedAt: Date,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Verification flags
  amenitiesVerified: {
    type: Boolean,
    default: false
  },
  
  servicesVerified: {
    type: Boolean,
    default: false
  },
  
  // Relationships
  nearbyClubs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Club'
  }],
  
  // Stats
  stats: {
    views: {
      type: Number,
      default: 0
    },
    clicks: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
})

// Enhanced Indexes for Geographic Areas
ClubSchema.index({ 'location.city': 1 })
ClubSchema.index({ 'location.area': 1 })
ClubSchema.index({ 'location.city': 1, 'location.area': 1 })
ClubSchema.index({ status: 1 })
ClubSchema.index({ featured: 1 })
ClubSchema.index({ displayOrder: 1 })
ClubSchema.index({ 'location.coordinates': '2dsphere' })
ClubSchema.index({ tags: 1 })
ClubSchema.index({ 'courts.tennis.total': 1 })
ClubSchema.index({ 'courts.padel.total': 1 })
ClubSchema.index({ 'courts.pickleball.total': 1 })
ClubSchema.index({ importSource: 1 })

// Virtual for full address (enhanced with area)
ClubSchema.virtual('fullAddress').get(function() {
  const parts = [this.location.address]
  if (this.location.postalCode) {
    parts.push(this.location.postalCode)
  }
  
  // Use displayName if available, otherwise fall back to city
  const locationName = this.location.displayName || 
    (this.location.city.charAt(0).toUpperCase() + this.location.city.slice(1))
  parts.push(locationName)
  
  return parts.join(', ')
})

// Virtual for total number of all courts
ClubSchema.virtual('totalAllCourts').get(function() {
  const tennisTotal = this.courts?.tennis?.total || 0
  const padelTotal = this.courts?.padel?.total || 0
  const pickleballTotal = this.courts?.pickleball?.total || 0
  const legacyTotal = this.courts?.total || 0
  
  // If we have new structure data, use it; otherwise use legacy
  if (tennisTotal > 0 || padelTotal > 0 || pickleballTotal > 0) {
    return tennisTotal + padelTotal + pickleballTotal
  }
  return legacyTotal
})

// Method to generate display name intelligently
ClubSchema.methods.generateDisplayName = function() {
  if (!this.location.area || this.location.area === this.location.city) {
    // No area or area same as city - just show city
    return this.location.city.charAt(0).toUpperCase() + this.location.city.slice(1)
  }
  
  // Area different from city - show "Area (City)"
  const areaFormatted = this.location.area
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
  
  const cityFormatted = this.location.city.charAt(0).toUpperCase() + this.location.city.slice(1)
  
  return `${areaFormatted} (${cityFormatted})`
}

// Method to migrate legacy courts data to new structure
ClubSchema.methods.migrateCourtsData = function() {
  // Only migrate if we have legacy data and no new structure data
  if (this.courts.total > 0 && !this.courts.tennis) {
    // Check if it's padel courts based on surfaces
    const hasPadel = this.courts.surfaces?.some(s => s.type === 'padel')
    
    if (hasPadel) {
      // Migrate to padel courts
      this.courts.padel = {
        total: this.courts.total,
        indoor: this.courts.indoor || 0,
        outdoor: this.courts.outdoor || 0,
        surfaces: this.courts.surfaces.filter(s => s.type === 'padel').map(s => ({
          type: 'synthetic', // Default padel surface
          count: s.count
        }))
      }
    } else {
      // Migrate to tennis courts (default)
      this.courts.tennis = {
        total: this.courts.total,
        indoor: this.courts.indoor || 0,
        outdoor: this.courts.outdoor || 0,
        surfaces: this.courts.surfaces || []
      }
    }
    
    // Clear legacy fields after migration
    this.courts.total = 0
    this.courts.indoor = 0
    this.courts.outdoor = 0
    this.courts.surfaces = []
  }
}

// Method to check if open at given time
ClubSchema.methods.isOpenAt = function(date = new Date()) {
  const day = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][date.getDay()]
  const hours = this.operatingHours[day]
  
  if (!hours || !hours.open || !hours.close) return false
  
  const time = date.getHours() * 100 + date.getMinutes()
  const open = parseInt(hours.open.replace(':', ''))
  const close = parseInt(hours.close.replace(':', ''))
  
  return time >= open && time <= close
}

// Static method to find by slug and city
ClubSchema.statics.findBySlugAndCity = function(slug, city) {
  return this.findOne({ 
    slug: slug.toLowerCase(), 
    'location.city': city.toLowerCase(),
    status: 'active' 
  })
}

// Enhanced static method to find clubs by main city (includes all areas)
ClubSchema.statics.findByMainCity = function(city) {
  return this.find({ 
    'location.city': city.toLowerCase(),
    status: 'active' 
  }).sort({ 
    'location.area': 1,  // Group by area first
    featured: -1, 
    displayOrder: 1, 
    name: 1 
  })
}

// Static method to find clubs by specific area
ClubSchema.statics.findByArea = function(area, city = null) {
  const query = {
    'location.area': area.toLowerCase(),
    status: 'active'
  }
  
  if (city) {
    query['location.city'] = city.toLowerCase()
  }
  
  return this.find(query).sort({ featured: -1, displayOrder: 1, name: 1 })
}

// Enhanced static method to find clubs in city region (main city + surrounding areas)
ClubSchema.statics.findInCityRegion = async function(mainCity, radius = 15000) {
  // First try to find clubs by main city
  const cityClubs = await this.find({
    'location.city': mainCity.toLowerCase(),
    status: 'active'
  })
  
  if (cityClubs.length > 0) {
    return cityClubs.sort({ 
      'location.area': 1, 
      featured: -1, 
      displayOrder: 1, 
      name: 1 
    })
  }
  
  // Fallback to coordinate-based search if no clubs found by city
  // This would require city coordinates - for now return empty array
  return []
}

// Static method to find nearby clubs
ClubSchema.statics.findNearby = function(coordinates, maxDistance = 10000) {
  return this.find({
    status: 'active',
    'location.coordinates': {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [coordinates.lng, coordinates.lat]
        },
        $maxDistance: maxDistance
      }
    }
  })
}

// Enhanced static method for search (includes area)
ClubSchema.statics.search = function(query, city = null) {
  const searchQuery = {
    status: 'active',
    $or: [
      { name: new RegExp(query, 'i') },
      { 'description.es': new RegExp(query, 'i') },
      { 'description.en': new RegExp(query, 'i') },
      { 'location.area': new RegExp(query, 'i') },
      { 'location.displayName': new RegExp(query, 'i') },
      { tags: new RegExp(query, 'i') }
    ]
  }
  
  if (city) {
    searchQuery['location.city'] = city.toLowerCase()
  }
  
  return this.find(searchQuery).sort({ featured: -1, displayOrder: 1 })
}

// Pre-save hook to auto-generate display name and migrate data
ClubSchema.pre('save', function(next) {
  // Auto-generate display name
  if (this.location.city && (this.isNew || this.isModified('location.area') || this.isModified('location.city'))) {
    this.location.displayName = this.generateDisplayName()
  }
  
  // Migrate legacy courts data if needed
  if (this.isModified('courts')) {
    this.migrateCourtsData()
  }
  
  next()
})

// Post save hook to update city club count
ClubSchema.post('save', async function(doc) {
  const City = mongoose.model('City')
  const city = await City.findOne({ slug: doc.location.city })
  if (city) {
    await city.updateClubCount()
  }
})

// Post remove hook to update city club count
ClubSchema.post('remove', async function(doc) {
  const City = mongoose.model('City')
  const city = await City.findOne({ slug: doc.location.city })
  if (city) {
    await city.updateClubCount()
  }
})

const Club = mongoose.models.Club || mongoose.model('Club', ClubSchema)

export default Club
