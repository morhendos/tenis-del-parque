const mongoose = require('mongoose')
const dotenv = require('dotenv')

// Load environment variables
dotenv.config({ path: '.env.local' })

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
  }
}, {
  timestamps: true
})

const City = mongoose.models.City || mongoose.model('City', CitySchema)

// Initial cities for Costa del Sol
const initialCities = [
  // Main cities
  { slug: 'malaga', name: { es: 'Málaga', en: 'Malaga' }, displayOrder: 1, coordinates: { lat: 36.7213, lng: -4.4214 } },
  { slug: 'marbella', name: { es: 'Marbella', en: 'Marbella' }, displayOrder: 2, coordinates: { lat: 36.5099, lng: -4.8863 } },
  { slug: 'estepona', name: { es: 'Estepona', en: 'Estepona' }, displayOrder: 3, coordinates: { lat: 36.4276, lng: -5.1463 } },
  { slug: 'sotogrande', name: { es: 'Sotogrande', en: 'Sotogrande' }, displayOrder: 4, province: 'Cádiz', coordinates: { lat: 36.2874, lng: -5.2687 } },
  { slug: 'mijas', name: { es: 'Mijas', en: 'Mijas' }, displayOrder: 5, coordinates: { lat: 36.5959, lng: -4.6372 } },
  { slug: 'benalmadena', name: { es: 'Benalmádena', en: 'Benalmadena' }, displayOrder: 6, coordinates: { lat: 36.5991, lng: -4.5161 } },
  { slug: 'fuengirola', name: { es: 'Fuengirola', en: 'Fuengirola' }, displayOrder: 7, coordinates: { lat: 36.5397, lng: -4.6249 } },
  { slug: 'torremolinos', name: { es: 'Torremolinos', en: 'Torremolinos' }, displayOrder: 8, coordinates: { lat: 36.6239, lng: -4.4993 } },
  { slug: 'manilva', name: { es: 'Manilva', en: 'Manilva' }, displayOrder: 9, coordinates: { lat: 36.3819, lng: -5.2491 } },
  { slug: 'casares', name: { es: 'Casares', en: 'Casares' }, displayOrder: 10, coordinates: { lat: 36.4436, lng: -5.2726 } },
  
  // Additional important areas
  { slug: 'san-pedro-de-alcantara', name: { es: 'San Pedro de Alcántara', en: 'San Pedro de Alcantara' }, displayOrder: 11, coordinates: { lat: 36.4872, lng: -4.9916 } },
  { slug: 'nueva-andalucia', name: { es: 'Nueva Andalucía', en: 'Nueva Andalucia' }, displayOrder: 12, coordinates: { lat: 36.4920, lng: -4.9544 } },
  { slug: 'puerto-banus', name: { es: 'Puerto Banús', en: 'Puerto Banus' }, displayOrder: 13, coordinates: { lat: 36.4851, lng: -4.9524 } },
  { slug: 'benahavis', name: { es: 'Benahavís', en: 'Benahavis' }, displayOrder: 14, coordinates: { lat: 36.5201, lng: -5.0498 } },
  { slug: 'la-linea', name: { es: 'La Línea de la Concepción', en: 'La Linea' }, displayOrder: 15, province: 'Cádiz', coordinates: { lat: 36.1683, lng: -5.3475 } },
  { slug: 'san-roque', name: { es: 'San Roque', en: 'San Roque' }, displayOrder: 16, province: 'Cádiz', coordinates: { lat: 36.2108, lng: -5.3844 } },
  { slug: 'elviria', name: { es: 'Elviria', en: 'Elviria' }, displayOrder: 17, coordinates: { lat: 36.4890, lng: -4.7875 } },
  { slug: 'las-chapas', name: { es: 'Las Chapas', en: 'Las Chapas' }, displayOrder: 18, coordinates: { lat: 36.4894, lng: -4.7438 } },
  { slug: 'la-cala-de-mijas', name: { es: 'La Cala de Mijas', en: 'La Cala de Mijas' }, displayOrder: 19, coordinates: { lat: 36.5138, lng: -4.6971 } },
  { slug: 'calahonda', name: { es: 'Calahonda', en: 'Calahonda' }, displayOrder: 20, coordinates: { lat: 36.4889, lng: -4.6854 } },
  
  // Interior towns
  { slug: 'ojen', name: { es: 'Ojén', en: 'Ojen' }, displayOrder: 21, coordinates: { lat: 36.5654, lng: -4.8534 } },
  { slug: 'istan', name: { es: 'Istán', en: 'Istan' }, displayOrder: 22, coordinates: { lat: 36.5839, lng: -4.9447 } },
  { slug: 'coin', name: { es: 'Coín', en: 'Coin' }, displayOrder: 23, coordinates: { lat: 36.6595, lng: -4.7565 } },
  { slug: 'alhaurin-el-grande', name: { es: 'Alhaurín el Grande', en: 'Alhaurin el Grande' }, displayOrder: 24, coordinates: { lat: 36.6415, lng: -4.6872 } },
  { slug: 'alhaurin-de-la-torre', name: { es: 'Alhaurín de la Torre', en: 'Alhaurin de la Torre' }, displayOrder: 25, coordinates: { lat: 36.6658, lng: -4.5619 } }
]

async function seedCities() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    })
    
    console.log('Connected to MongoDB')
    
    // Clear existing cities (optional - comment out if you want to keep existing)
    // await City.deleteMany({})
    // console.log('Cleared existing cities')
    
    // Insert cities
    for (const cityData of initialCities) {
      try {
        // Check if city already exists
        const existing = await City.findOne({ slug: cityData.slug })
        
        if (existing) {
          console.log(`City already exists: ${cityData.name.es}`)
        } else {
          const city = new City(cityData)
          await city.save()
          console.log(`Created city: ${cityData.name.es}`)
        }
      } catch (error) {
        console.error(`Error creating city ${cityData.name.es}:`, error.message)
      }
    }
    
    // Update club counts for all cities
    const allCities = await City.find({})
    console.log('\nUpdating club counts...')
    
    for (const city of allCities) {
      await city.updateClubCount()
      console.log(`${city.name.es}: ${city.clubCount} clubs`)
    }
    
    console.log('\nCity seeding completed!')
    
  } catch (error) {
    console.error('Error seeding cities:', error)
  } finally {
    await mongoose.disconnect()
    console.log('Disconnected from MongoDB')
  }
}

// Run the seeder
seedCities()
