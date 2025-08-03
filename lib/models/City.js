import mongoose from 'mongoose'

const CitySchema = new mongoose.Schema({
  // URL-friendly identifier (lowercase, no spaces)
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens']
  },
  
  // Display names in multiple languages
  name: {
    es: {
      type: String,
      required: true
    },
    en: {
      type: String,
      required: true
    }
  },
  
  // Province/Region
  province: {
    type: String,
    default: 'Málaga'
  },
  
  // Country
  country: {
    type: String,
    default: 'Spain'
  },
  
  // Geographic coordinates (optional)
  coordinates: {
    lat: Number,
    lng: Number
  },
  
  // Status
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  
  // Display order for sorting
  displayOrder: {
    type: Number,
    default: 0
  },
  
  // Import tracking
  importSource: {
    type: String,
    enum: ['manual', 'google', 'auto'],
    default: 'manual'
  },
  
  // Stats
  clubCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
})

// Indexes
CitySchema.index({ status: 1 })
CitySchema.index({ displayOrder: 1 })
CitySchema.index({ province: 1 })

// Virtual for formatted display name
CitySchema.virtual('displayName').get(function() {
  return this.name.es || this.name.en
})

// Static method to find or create city
CitySchema.statics.findOrCreate = async function(cityData) {
  // Try to find by slug
  let city = await this.findOne({ slug: cityData.slug })
  let isNew = false
  
  if (!city) {
    // Generate names if not provided
    const displayName = cityData.name || cityData.slug.charAt(0).toUpperCase() + cityData.slug.slice(1)
    
    // Create new city with auto-generated names if needed
    city = await this.create({
      slug: cityData.slug,
      name: {
        es: cityData.nameEs || displayName,
        en: cityData.nameEn || displayName
      },
      province: cityData.province || 'Málaga',
      country: cityData.country || 'Spain',
      coordinates: cityData.coordinates || undefined,
      importSource: cityData.importSource || 'auto'
    })
    isNew = true
  }
  
  // Add isNew flag to the result
  city.isNew = isNew
  return city
}

// Static method to get active cities
CitySchema.statics.getActive = function() {
  return this.find({ status: 'active' })
    .sort({ displayOrder: 1, 'name.es': 1 })
}

// Method to update club count
CitySchema.methods.updateClubCount = async function() {
  const Club = mongoose.model('Club')
  const count = await Club.countDocuments({ 
    'location.city': this.slug,
    status: 'active'
  })
  this.clubCount = count
  return this.save()
}

const City = mongoose.models.City || mongoose.model('City', CitySchema)

export default City
