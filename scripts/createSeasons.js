const mongoose = require('mongoose')

// Season Schema (inline, no imports needed)
const SeasonSchema = new mongoose.Schema({
  year: { type: Number, required: true, min: 2024, max: 2050 },
  type: { type: String, required: true, enum: ['spring', 'summer', 'autumn', 'winter'] },
  slugs: {
    en: { type: String, required: true, lowercase: true, trim: true },
    es: { type: String, required: true, lowercase: true, trim: true }
  },
  names: {
    en: { type: String, required: true },
    es: { type: String, required: true }
  },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  registration: {
    opensAt: Date,
    closesAt: Date
  },
  status: {
    type: String,
    enum: ['upcoming', 'registration_open', 'active', 'completed'],
    default: 'upcoming'
  },
  order: { type: Number, required: true }
}, { timestamps: true })

SeasonSchema.index({ year: 1, type: 1 }, { unique: true })

const Season = mongoose.models.Season || mongoose.model('Season', SeasonSchema)

// Create seasons for a year
function createSeasonsForYear(year) {
  return [
    {
      year,
      type: 'spring',
      order: 1,
      slugs: { en: `spring${year}`, es: `primavera${year}` },
      names: { en: `Spring ${year}`, es: `Primavera ${year}` },
      startDate: new Date(year, 2, 21), // March 21
      endDate: new Date(year, 5, 20),   // June 20
      status: 'upcoming'
    },
    {
      year,
      type: 'summer',
      order: 2,
      slugs: { en: `summer${year}`, es: `verano${year}` },
      names: { en: `Summer ${year}`, es: `Verano ${year}` },
      startDate: new Date(year, 5, 21), // June 21
      endDate: new Date(year, 8, 22),   // September 22
      status: year === 2025 ? 'active' : 'upcoming'
    },
    {
      year,
      type: 'autumn',
      order: 3,
      slugs: { en: `autumn${year}`, es: `otono${year}` },
      names: { en: `Autumn ${year}`, es: `Otoño ${year}` },
      startDate: new Date(year, 8, 23), // September 23
      endDate: new Date(year, 11, 20),  // December 20
      status: 'upcoming'
    },
    {
      year,
      type: 'winter',
      order: 4,
      slugs: { en: `winter${year}`, es: `invierno${year}` },
      names: { en: `Winter ${year}`, es: `Invierno ${year}` },
      startDate: new Date(year, 11, 21), // December 21
      endDate: new Date(year + 1, 2, 20), // March 20 next year
      status: 'upcoming'
    }
  ]
}

async function seedSeasons() {
  console.log('🌱 Creating seasons...')
  
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/tenis-del-parque')
    console.log('✅ Connected to MongoDB')
    
    const years = [2024, 2025, 2026]
    
    for (const year of years) {
      console.log(`📅 Processing year ${year}...`)
      
      // Check if seasons already exist
      const existing = await Season.find({ year }).countDocuments()
      
      if (existing > 0) {
        console.log(`   ℹ️  ${existing} seasons already exist for ${year}`)
        continue
      }
      
      // Create seasons
      const seasons = createSeasonsForYear(year)
      const created = await Season.insertMany(seasons, { ordered: false })
      console.log(`   ✅ Created ${created.length} seasons for ${year}`)
    }
    
    console.log('\n🎉 All done!')
    
    // Show what we have
    const total = await Season.countDocuments()
    console.log(`📊 Total seasons in database: ${total}`)
    
  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await mongoose.connection.close()
    console.log('👋 Disconnected from MongoDB')
    process.exit(0)
  }
}

seedSeasons()