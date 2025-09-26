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
  
  // Images for the city
  images: {
    main: {
      type: String,
      default: ''
    },
    gallery: [{
      type: String
    }],
    googlePhotoReference: {
      type: String
    }
  },
  
  // Google Maps enhancement fields
  formattedAddress: {
    type: String
  },
  
  googlePlaceId: {
    type: String,
    index: true
  },
  
  googleMapsUrl: {
    type: String
  },
  
  googleData: {
    types: [String],
    addressComponents: [mongoose.Schema.Types.Mixed],
    viewport: {
      northeast: {
        lat: Number,
        lng: Number
      },
      southwest: {
        lat: Number,
        lng: Number
      }
    },
    // Google Photos data
    photos: [{
      photo_reference: String,
      width: Number,
      height: Number,
      html_attributions: [String]
    }]
  },
  
  // Enhancement tracking
  enhancedAt: {
    type: Date
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
// googlePlaceId index is defined in field definition above
CitySchema.index({ 'coordinates.lat': 1, 'coordinates.lng': 1 })

// Virtual for formatted display name
CitySchema.virtual('displayName').get(function() {
  return this.name.es || this.name.en
})

// Virtual to check if city has GPS coordinates
CitySchema.virtual('hasCoordinates').get(function() {
  return !!(this.coordinates?.lat && this.coordinates?.lng)
})

// Virtual to check if enhanced by Google
CitySchema.virtual('isGoogleEnhanced').get(function() {
  return this.importSource === 'google' && !!this.enhancedAt
})

// Virtual to check if city has images
CitySchema.virtual('hasImages').get(function() {
  return !!(this.images?.main || (this.images?.gallery && this.images.gallery.length > 0))
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
      images: {
        main: '',
        gallery: [],
        googlePhotoReference: null
      },
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

// Static method to get cities needing GPS enhancement
CitySchema.statics.getNeedingGPS = function() {
  return this.find({
    $or: [
      { 'coordinates.lat': { $exists: false } },
      { 'coordinates.lng': { $exists: false } },
      { 'coordinates.lat': null },
      { 'coordinates.lng': null }
    ]
  }).sort({ displayOrder: 1, 'name.es': 1 })
}

// Static method to get cities needing images
CitySchema.statics.getNeedingImages = function() {
  return this.find({
    $or: [
      { 'images.main': { $exists: false } },
      { 'images.main': '' },
      { 'images.main': null }
    ],
    status: 'active'
  }).sort({ displayOrder: 1, 'name.es': 1 })
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

// Method to enhance with Google Maps data
CitySchema.methods.enhanceWithGoogle = async function(googleData) {
  this.coordinates = {
    lat: googleData.geometry.location.lat,
    lng: googleData.geometry.location.lng
  }
  this.formattedAddress = googleData.formatted_address
  this.googlePlaceId = googleData.place_id
  this.googleMapsUrl = `https://maps.google.com/?q=${googleData.geometry.location.lat},${googleData.geometry.location.lng}`
  this.googleData = {
    types: googleData.types,
    addressComponents: googleData.address_components,
    viewport: googleData.geometry.viewport,
    photos: googleData.photos || []
  }
  this.importSource = 'google'
  this.enhancedAt = new Date()
  
  // Auto-set main image from first Google photo if available
  if (googleData.photos && googleData.photos.length > 0 && !this.images?.main) {
    this.images = {
      ...this.images,
      main: `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photo_reference=${googleData.photos[0].photo_reference}&key=${process.env.GOOGLE_MAPS_API_KEY}`,
      googlePhotoReference: googleData.photos[0].photo_reference
    }
  }
  
  return this.save()
}

// Method to set main image
CitySchema.methods.setMainImage = function(imageUrl, googlePhotoReference = null) {
  this.images = {
    ...this.images,
    main: imageUrl,
    googlePhotoReference: googlePhotoReference
  }
  return this.save()
}

// Method to add gallery image
CitySchema.methods.addGalleryImage = function(imageUrl) {
  if (!this.images) {
    this.images = { main: '', gallery: [], googlePhotoReference: null }
  }
  if (!this.images.gallery) {
    this.images.gallery = []
  }
  this.images.gallery.push(imageUrl)
  return this.save()
}

// Method to remove gallery image
CitySchema.methods.removeGalleryImage = function(imageUrl) {
  if (this.images?.gallery) {
    this.images.gallery = this.images.gallery.filter(url => url !== imageUrl)
  }
  return this.save()
}

const City = mongoose.models.City || mongoose.model('City', CitySchema)

export default City
