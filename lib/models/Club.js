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
  
  // Location
  location: {
    address: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true,
      enum: ['malaga', 'marbella', 'estepona', 'sotogrande']
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
  
  // Multilingual Description
  description: {
    es: {
      type: String,
      required: true
    },
    en: {
      type: String,
      required: true
    }
  },
  
  // Court Information
  courts: {
    total: {
      type: Number,
      required: true,
      min: 1
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
    gallery: [String]
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

// Indexes (slug already has unique index from schema definition)
ClubSchema.index({ 'location.city': 1 })
ClubSchema.index({ status: 1 })
ClubSchema.index({ featured: 1 })
ClubSchema.index({ displayOrder: 1 })
ClubSchema.index({ 'location.coordinates': '2dsphere' })
ClubSchema.index({ tags: 1 })
ClubSchema.index({ 'courts.surfaces.type': 1 })

// Virtual for full address
ClubSchema.virtual('fullAddress').get(function() {
  const parts = [this.location.address]
  if (this.location.postalCode) {
    parts.push(this.location.postalCode)
  }
  parts.push(this.location.city.charAt(0).toUpperCase() + this.location.city.slice(1))
  return parts.join(', ')
})

// Virtual for court types
ClubSchema.virtual('courtTypes').get(function() {
  return this.courts.surfaces.map(s => s.type)
})

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

// Static method to find clubs by city
ClubSchema.statics.findByCity = function(city) {
  return this.find({ 
    'location.city': city.toLowerCase(),
    status: 'active' 
  }).sort({ featured: -1, displayOrder: 1, name: 1 })
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

// Static method for search
ClubSchema.statics.search = function(query, city = null) {
  const searchQuery = {
    status: 'active',
    $or: [
      { name: new RegExp(query, 'i') },
      { 'description.es': new RegExp(query, 'i') },
      { 'description.en': new RegExp(query, 'i') },
      { tags: new RegExp(query, 'i') }
    ]
  }
  
  if (city) {
    searchQuery['location.city'] = city.toLowerCase()
  }
  
  return this.find(searchQuery).sort({ featured: -1, displayOrder: 1 })
}

const Club = mongoose.models.Club || mongoose.model('Club', ClubSchema)

export default Club