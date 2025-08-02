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
  
  // Coordinates for city center (optional)
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
  
  // SEO fields
  seo: {
    metaTitle: {
      es: String,
      en: String
    },
    metaDescription: {
      es: String,
      en: String
    }
  },
  
  // Statistics
  stats: {
    clubCount: {
      type: Number,
      default: 0
    },
    lastUpdated: Date
  }
}, {
  timestamps: true
})

// Indexes
CitySchema.index({ slug: 1 })
CitySchema.index({ status: 1 })
CitySchema.index({ displayOrder: 1 })
CitySchema.index({ 'stats.clubCount': -1 })

// Static method to find or create city
CitySchema.statics.findOrCreate = async function(cityData) {
  const slug = cityData.slug || generateSlug(cityData.name)
  
  let city = await this.findOne({ slug })
  
  if (!city) {
    city = await this.create({
      slug,
      name: {
        es: cityData.nameEs || cityData.name || capitalizeFirst(slug.replace(/-/g, ' ')),
        en: cityData.nameEn || cityData.name || capitalizeFirst(slug.replace(/-/g, ' '))
      },
      province: cityData.province || 'Málaga',
      country: cityData.country || 'Spain',
      coordinates: cityData.coordinates || {},
      status: 'active'
    })
  }
  
  return city
}

// Helper to generate slug
function generateSlug(name) {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// Helper to capitalize first letter
function capitalizeFirst(str) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

// Static method to update club count
CitySchema.statics.updateClubCount = async function(citySlug) {
  const Club = mongoose.models.Club || require('./Club').default
  
  const count = await Club.countDocuments({
    'location.city': citySlug,
    status: 'active'
  })
  
  await this.findOneAndUpdate(
    { slug: citySlug },
    { 
      'stats.clubCount': count,
      'stats.lastUpdated': new Date()
    }
  )
  
  return count
}

const City = mongoose.models.City || mongoose.model('City', CitySchema)

export default City