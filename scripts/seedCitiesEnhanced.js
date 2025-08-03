const mongoose = require('mongoose')
const dotenv = require('dotenv')

// Load environment variables
dotenv.config({ path: '.env.local' })

// Google Maps API client (you'll need to install @googlemaps/google-maps-services-js)
let googleMapsClient = null

try {
  const { Client } = require('@googlemaps/google-maps-services-js')
  if (process.env.GOOGLE_MAPS_API_KEY) {
    googleMapsClient = new Client({})
  }
} catch (error) {
  console.log('Google Maps client not available (install @googlemaps/google-maps-services-js for enhanced features)')
}

// Define City schema (since we're using CommonJS in scripts)
const CitySchema = new mongoose.Schema({
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
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
  province: {
    type: String,
    default: 'Málaga'
  },
  country: {
    type: String,
    default: 'Spain'
  },
  coordinates: {
    lat: Number,
    lng: Number
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  displayOrder: {
    type: Number,
    default: 0
  },
  importSource: {
    type: String,
    enum: ['manual', 'google', 'auto'],
    default: 'manual'
  },
  clubCount: {
    type: Number,
    default: 0
  },
  // Enhanced Google data
  googleData: {
    placeId: String,
    formattedAddress: String,
    types: [String],
    viewport: {
      northeast: { lat: Number, lng: Number },
      southwest: { lat: Number, lng: Number }
    },
    population: Number,
    timezone: String
  }
}, {
  timestamps: true
})

const City = mongoose.models.City || mongoose.model('City', CitySchema)

// Enhanced city data with better structure
const citiesData = [
  // Main Costa del Sol cities
  { 
    slug: 'malaga', 
    name: { es: 'Málaga', en: 'Malaga' }, 
    displayOrder: 1, 
    province: 'Málaga',
    importance: 'major'
  },
  { 
    slug: 'marbella', 
    name: { es: 'Marbella', en: 'Marbella' }, 
    displayOrder: 2, 
    province: 'Málaga',
    importance: 'major'
  },
  { 
    slug: 'estepona', 
    name: { es: 'Estepona', en: 'Estepona' }, 
    displayOrder: 3, 
    province: 'Málaga',
    importance: 'major'
  },
  { 
    slug: 'sotogrande', 
    name: { es: 'Sotogrande', en: 'Sotogrande' }, 
    displayOrder: 4, 
    province: 'Cádiz',
    importance: 'major'
  },
  { 
    slug: 'mijas', 
    name: { es: 'Mijas', en: 'Mijas' }, 
    displayOrder: 5, 
    province: 'Málaga',
    importance: 'major'
  },

  // Secondary cities
  { 
    slug: 'benalmadena', 
    name: { es: 'Benalmádena', en: 'Benalmadena' }, 
    displayOrder: 6, 
    province: 'Málaga',
    importance: 'secondary'
  },
  { 
    slug: 'fuengirola', 
    name: { es: 'Fuengirola', en: 'Fuengirola' }, 
    displayOrder: 7, 
    province: 'Málaga',
    importance: 'secondary'
  },
  { 
    slug: 'torremolinos', 
    name: { es: 'Torremolinos', en: 'Torremolinos' }, 
    displayOrder: 8, 
    province: 'Málaga',
    importance: 'secondary'
  },
  { 
    slug: 'manilva', 
    name: { es: 'Manilva', en: 'Manilva' }, 
    displayOrder: 9, 
    province: 'Málaga',
    importance: 'secondary'
  },
  { 
    slug: 'casares', 
    name: { es: 'Casares', en: 'Casares' }, 
    displayOrder: 10, 
    province: 'Málaga',
    importance: 'secondary'
  },

  // Marbella areas
  { 
    slug: 'san-pedro-de-alcantara', 
    name: { es: 'San Pedro de Alcántara', en: 'San Pedro de Alcantara' }, 
    displayOrder: 11, 
    province: 'Málaga',
    importance: 'neighborhood'
  },
  { 
    slug: 'nueva-andalucia', 
    name: { es: 'Nueva Andalucía', en: 'Nueva Andalucia' }, 
    displayOrder: 12, 
    province: 'Málaga',
    importance: 'neighborhood'
  },
  { 
    slug: 'puerto-banus', 
    name: { es: 'Puerto Banús', en: 'Puerto Banus' }, 
    displayOrder: 13, 
    province: 'Málaga',
    importance: 'neighborhood'
  },
  { 
    slug: 'benahavis', 
    name: { es: 'Benahavís', en: 'Benahavis' }, 
    displayOrder: 14, 
    province: 'Málaga',
    importance: 'secondary'
  },

  // Cádiz area
  { 
    slug: 'la-linea', 
    name: { es: 'La Línea de la Concepción', en: 'La Linea' }, 
    displayOrder: 15, 
    province: 'Cádiz',
    importance: 'secondary'
  },
  { 
    slug: 'san-roque', 
    name: { es: 'San Roque', en: 'San Roque' }, 
    displayOrder: 16, 
    province: 'Cádiz',
    importance: 'secondary'
  },

  // Additional areas
  { 
    slug: 'elviria', 
    name: { es: 'Elviria', en: 'Elviria' }, 
    displayOrder: 17, 
    province: 'Málaga',
    importance: 'neighborhood'
  },
  { 
    slug: 'las-chapas', 
    name: { es: 'Las Chapas', en: 'Las Chapas' }, 
    displayOrder: 18, 
    province: 'Málaga',
    importance: 'neighborhood'
  },
  { 
    slug: 'la-cala-de-mijas', 
    name: { es: 'La Cala de Mijas', en: 'La Cala de Mijas' }, 
    displayOrder: 19, 
    province: 'Málaga',
    importance: 'neighborhood'
  },
  { 
    slug: 'calahonda', 
    name: { es: 'Calahonda', en: 'Calahonda' }, 
    displayOrder: 20, 
    province: 'Málaga',
    importance: 'neighborhood'
  },

  // Interior towns
  { 
    slug: 'ojen', 
    name: { es: 'Ojén', en: 'Ojen' }, 
    displayOrder: 21, 
    province: 'Málaga',
    importance: 'small'
  },
  { 
    slug: 'istan', 
    name: { es: 'Istán', en: 'Istan' }, 
    displayOrder: 22, 
    province: 'Málaga',
    importance: 'small'
  },
  { 
    slug: 'coin', 
    name: { es: 'Coín', en: 'Coin' }, 
    displayOrder: 23, 
    province: 'Málaga',
    importance: 'secondary'
  },
  { 
    slug: 'alhaurin-el-grande', 
    name: { es: 'Alhaurín el Grande', en: 'Alhaurin el Grande' }, 
    displayOrder: 24, 
    province: 'Málaga',
    importance: 'secondary'
  },
  { 
    slug: 'alhaurin-de-la-torre', 
    name: { es: 'Alhaurín de la Torre', en: 'Alhaurin de la Torre' }, 
    displayOrder: 25, 
    province: 'Málaga',
    importance: 'secondary'
  }
]

// Enhance city data with Google Maps API
async function enhanceCityWithGoogleData(cityData) {
  if (!googleMapsClient || !process.env.GOOGLE_MAPS_API_KEY) {
    console.log(`⚠️  Skipping Google enhancement for ${cityData.name.es} (no API key)`)
    return cityData
  }

  try {
    console.log(`🔍 Fetching Google data for ${cityData.name.es}...`)
    
    // Construct search query
    const query = `${cityData.name.es}, ${cityData.province}, Spain`
    
    // Geocode the city
    const geocodeResponse = await googleMapsClient.geocode({
      params: {
        address: query,
        key: process.env.GOOGLE_MAPS_API_KEY,
        language: 'es',
        region: 'es'
      }
    })

    if (geocodeResponse.data.results.length > 0) {
      const result = geocodeResponse.data.results[0]
      
      // Extract coordinates
      const location = result.geometry.location
      cityData.coordinates = {
        lat: location.lat,
        lng: location.lng
      }

      // Store Google data
      cityData.googleData = {
        placeId: result.place_id,
        formattedAddress: result.formatted_address,
        types: result.types,
        viewport: result.geometry.viewport
      }

      // Try to get more details from Places API
      try {
        const placeResponse = await googleMapsClient.placeDetails({
          params: {
            place_id: result.place_id,
            key: process.env.GOOGLE_MAPS_API_KEY,
            fields: ['name', 'formatted_address', 'geometry', 'types', 'url']
          }
        })

        if (placeResponse.data.result) {
          const placeResult = placeResponse.data.result
          cityData.googleData.url = placeResult.url
        }
      } catch (placeError) {
        console.log(`⚠️  Could not fetch place details for ${cityData.name.es}`)
      }

      cityData.importSource = 'google'
      console.log(`✅ Enhanced ${cityData.name.es} with Google data`)
      
      // Add small delay to respect rate limits
      await new Promise(resolve => setTimeout(resolve, 100))
      
    } else {
      console.log(`⚠️  No Google results found for ${cityData.name.es}`)
    }
  } catch (error) {
    console.log(`❌ Error fetching Google data for ${cityData.name.es}:`, error.message)
  }

  return cityData
}

async function seedCities() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    })
    
    console.log('🚀 Connected to MongoDB')
    console.log(`📍 Starting enhanced city seeding with ${citiesData.length} cities`)
    
    if (googleMapsClient && process.env.GOOGLE_MAPS_API_KEY) {
      console.log('🗺️  Google Maps API available - will enhance with real coordinates')
    } else {
      console.log('⚠️  Google Maps API not available - using basic data only')
      console.log('   Add GOOGLE_MAPS_API_KEY to .env.local for enhanced features')
      console.log('   Install: npm install @googlemaps/google-maps-services-js')
    }
    console.log()

    const results = {
      created: 0,
      updated: 0,
      enhanced: 0,
      errors: 0
    }

    // Process each city
    for (const cityData of citiesData) {
      try {
        // Check if city already exists
        const existing = await City.findOne({ slug: cityData.slug })
        
        // Enhance with Google data if API is available
        const enhancedCityData = await enhanceCityWithGoogleData({ ...cityData })
        
        if (existing) {
          // Update existing city with new data (including Google enhancements)
          await City.findOneAndUpdate(
            { slug: cityData.slug },
            { $set: enhancedCityData },
            { new: true }
          )
          console.log(`🔄 Updated: ${enhancedCityData.name.es}`)
          results.updated++
          if (enhancedCityData.coordinates) results.enhanced++
        } else {
          // Create new city
          const city = new City(enhancedCityData)
          await city.save()
          console.log(`✨ Created: ${enhancedCityData.name.es}`)
          results.created++
          if (enhancedCityData.coordinates) results.enhanced++
        }
        
      } catch (error) {
        console.error(`❌ Error processing ${cityData.name.es}:`, error.message)
        results.errors++
      }
    }
    
    console.log()
    console.log('📊 Seeding Results:')
    console.log(`   ✨ Created: ${results.created} cities`)
    console.log(`   🔄 Updated: ${results.updated} cities`)
    console.log(`   🗺️  Enhanced with coordinates: ${results.enhanced} cities`)
    console.log(`   ❌ Errors: ${results.errors}`)
    
    // Update club counts for all cities
    console.log()
    console.log('🔢 Updating club counts...')
    const allCities = await City.find({})
    
    for (const city of allCities) {
      try {
        await city.updateClubCount()
        console.log(`📊 ${city.name.es}: ${city.clubCount} clubs`)
      } catch (error) {
        console.log(`⚠️  Could not update club count for ${city.name.es}`)
      }
    }
    
    console.log()
    console.log('🎉 Enhanced city seeding completed successfully!')
    console.log(`📍 ${allCities.length} total cities in database`)
    console.log(`🗺️  ${allCities.filter(c => c.coordinates?.lat).length} cities with GPS coordinates`)
    
  } catch (error) {
    console.error('💥 Error in enhanced city seeding:', error)
  } finally {
    await mongoose.disconnect()
    console.log('👋 Disconnected from MongoDB')
  }
}

// Run the enhanced seeder
seedCities()
