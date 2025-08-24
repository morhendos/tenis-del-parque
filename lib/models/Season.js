import mongoose from 'mongoose'

const SeasonSchema = new mongoose.Schema({
  // Year this season belongs to
  year: {
    type: Number,
    required: [true, 'Year is required'],
    min: 2024,
    max: 2050
  },
  
  // Season type (spring, summer, autumn, winter)
  type: {
    type: String,
    required: [true, 'Season type is required'],
    enum: ['spring', 'summer', 'autumn', 'winter']
  },
  
  // URL slugs for different languages
  slugs: {
    en: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },
    es: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    }
  },
  
  // Display names for different languages
  names: {
    en: {
      type: String,
      required: true
    },
    es: {
      type: String,
      required: true
    }
  },
  
  // Season dates
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  
  endDate: {
    type: Date,
    required: [true, 'End date is required']
  },
  
  // Registration period
  registration: {
    opensAt: Date,
    closesAt: Date
  },
  
  // Season status
  status: {
    type: String,
    enum: ['upcoming', 'registration_open', 'active', 'completed'],
    default: 'upcoming'
  },
  
  // Metadata
  order: {
    type: Number,
    required: true // 1=Spring, 2=Summer, 3=Autumn, 4=Winter
  }
}, {
  timestamps: true
})

// Compound unique index to prevent duplicate seasons
SeasonSchema.index({ year: 1, type: 1 }, { unique: true })

// Index for slug lookups
SeasonSchema.index({ 'slugs.en': 1 })
SeasonSchema.index({ 'slugs.es': 1 })

// Virtual for generating database key (for backward compatibility)
SeasonSchema.virtual('dbKey').get(function() {
  return `${this.type}-${this.year}`
})

// Method to get name by language
SeasonSchema.methods.getName = function(language = 'en') {
  return this.names[language] || this.names.en
}

// Method to get slug by language
SeasonSchema.methods.getSlug = function(language = 'en') {
  return this.slugs[language] || this.slugs.en
}

// Static method to find by slug
SeasonSchema.statics.findBySlug = function(slug, language = 'en') {
  const query = {}
  query[`slugs.${language}`] = slug.toLowerCase()
  return this.findOne(query)
}

// Static method to get current season
SeasonSchema.statics.getCurrentSeason = function() {
  const now = new Date()
  return this.findOne({
    startDate: { $lte: now },
    endDate: { $gte: now }
  }).sort({ startDate: -1 })
}

// Static method to get seasons for a year
SeasonSchema.statics.getSeasonsForYear = function(year) {
  return this.find({ year }).sort({ order: 1 })
}

// Static method to create all seasons for a year
SeasonSchema.statics.createSeasonsForYear = function(year) {
  const seasons = [
    {
      year,
      type: 'spring',
      order: 1,
      slugs: { en: `spring${year}`, es: `primavera${year}` },
      names: { en: `Spring ${year}`, es: `Primavera ${year}` },
      startDate: new Date(year, 2, 21), // March 21
      endDate: new Date(year, 5, 20)    // June 20
    },
    {
      year,
      type: 'summer',
      order: 2,
      slugs: { en: `summer${year}`, es: `verano${year}` },
      names: { en: `Summer ${year}`, es: `Verano ${year}` },
      startDate: new Date(year, 5, 21), // June 21
      endDate: new Date(year, 8, 22)    // September 22
    },
    {
      year,
      type: 'autumn',
      order: 3,
      slugs: { en: `autumn${year}`, es: `otono${year}` },
      names: { en: `Autumn ${year}`, es: `Otoño ${year}` },
      startDate: new Date(year, 8, 23), // September 23
      endDate: new Date(year, 11, 20)   // December 20
    },
    {
      year,
      type: 'winter',
      order: 4,
      slugs: { en: `winter${year}`, es: `invierno${year}` },
      names: { en: `Winter ${year}`, es: `Invierno ${year}` },
      startDate: new Date(year, 11, 21), // December 21
      endDate: new Date(year + 1, 2, 20) // March 20 next year
    }
  ]
  
  return this.insertMany(seasons, { ordered: false })
}

const Season = mongoose.models.Season || mongoose.model('Season', SeasonSchema)

export default Season