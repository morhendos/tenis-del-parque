// Migration script to convert legacy courts data to new structure
import dotenv from 'dotenv'
import mongoose from 'mongoose'

// Load .env.local first to override .env (for local development)
dotenv.config({ path: '.env.local' })

// Define Club schema inline to avoid import issues
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

// Create the model
const Club = mongoose.models.Club || mongoose.model('Club', ClubSchema)

async function migrateCourtsData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('✅ Connected to MongoDB')
    
    // Find all clubs with legacy courts data
    const clubs = await Club.find({
      $or: [
        { 'courts.total': { $gt: 0 } },
        { 'courts.surfaces': { $exists: true, $ne: [] } }
      ],
      'courts.tennis': { $exists: false }
    })
    
    console.log(`Found ${clubs.length} clubs to migrate`)
    
    for (const club of clubs) {
      console.log(`\nMigrating: ${club.name}`)
      
      // Check if it's padel courts based on surfaces
      const hasPadel = club.courts.surfaces?.some(s => s.type === 'padel')
      
      if (hasPadel) {
        // Migrate to padel courts
        const padelSurfaces = club.courts.surfaces
          .filter(s => s.type === 'padel')
          .map(s => ({
            type: 'synthetic', // Default padel surface
            count: s.count
          }))
        
        const padelTotal = padelSurfaces.reduce((sum, s) => sum + s.count, 0)
        
        club.courts.padel = {
          total: padelTotal,
          indoor: club.courts.indoor || 0,
          outdoor: club.courts.outdoor || 0,
          surfaces: padelSurfaces
        }
        
        // Check for tennis courts too
        const tennisSurfaces = club.courts.surfaces
          .filter(s => s.type !== 'padel')
        
        if (tennisSurfaces.length > 0) {
          const tennisTotal = tennisSurfaces.reduce((sum, s) => sum + s.count, 0)
          club.courts.tennis = {
            total: tennisTotal,
            indoor: 0, // We can't determine this from legacy data
            outdoor: tennisTotal,
            surfaces: tennisSurfaces
          }
        }
        
        console.log(`  - Migrated to ${padelTotal} padel courts`)
      } else {
        // Migrate to tennis courts (default)
        club.courts.tennis = {
          total: club.courts.total || 0,
          indoor: club.courts.indoor || 0,
          outdoor: club.courts.outdoor || 0,
          surfaces: club.courts.surfaces || []
        }
        console.log(`  - Migrated to ${club.courts.total} tennis courts`)
      }
      
      // Initialize empty sections for other court types
      if (!club.courts.padel) {
        club.courts.padel = {
          total: 0,
          indoor: 0,
          outdoor: 0,
          surfaces: []
        }
      }
      
      club.courts.pickleball = {
        total: 0,
        indoor: 0,
        outdoor: 0,
        surfaces: []
      }
      
      // Clear legacy fields
      club.courts.total = 0
      club.courts.indoor = 0
      club.courts.outdoor = 0
      club.courts.surfaces = []
      
      // Save the updated club
      await club.save()
      console.log(`  ✓ Migration complete`)
    }
    
    console.log('\n✅ Migration completed successfully!')
  } catch (error) {
    console.error('❌ Migration failed:', error)
  } finally {
    await mongoose.disconnect()
    console.log('🔌 Disconnected from MongoDB')
  }
}

// Run migration
migrateCourtsData()