const mongoose = require('mongoose')
const dotenv = require('dotenv')
const Club = require('../lib/models/Club.js')

dotenv.config({ path: '.env.local' })

const SAMPLE_CLUBS = [
  // Málaga Clubs
  {
    name: 'Club de Tenis Málaga',
    slug: 'club-tenis-malaga',
    location: {
      address: 'Calle Pacífico, 54',
      city: 'malaga',
      postalCode: '29004',
      coordinates: { lat: 36.7101, lng: -4.4396 },
      googleMapsUrl: 'https://maps.google.com/?q=Club+de+Tenis+Málaga'
    },
    description: {
      es: 'El Club de Tenis Málaga es uno de los clubes más prestigiosos de la ciudad, con más de 50 años de historia. Cuenta con excelentes instalaciones y una escuela de tenis reconocida.',
      en: 'Club de Tenis Málaga is one of the most prestigious clubs in the city, with over 50 years of history. It features excellent facilities and a renowned tennis school.'
    },
    courts: {
      total: 12,
      surfaces: [
        { type: 'clay', count: 8 },
        { type: 'hard', count: 4 }
      ],
      indoor: 2,
      outdoor: 10
    },
    amenities: {
      parking: true,
      lighting: true,
      proShop: true,
      restaurant: true,
      changingRooms: true,
      showers: true,
      lockers: true,
      wheelchair: true,
      swimming: true,
      gym: true
    },
    services: {
      lessons: true,
      coaching: true,
      stringing: true,
      tournaments: true,
      summerCamps: true
    },
    contact: {
      phone: '+34 952 23 45 67',
      email: 'info@clubtenismalaga.com',
      website: 'https://www.clubtenismalaga.com',
      instagram: '@clubtenismalaga'
    },
    pricing: {
      courtRental: {
        hourly: { min: 12, max: 20, currency: 'EUR' }
      },
      publicAccess: true,
      membershipRequired: false
    },
    tags: ['professional', 'tournaments', 'social-club', 'academy'],
    featured: true,
    status: 'active'
  },
  {
    name: 'Inacua Málaga Sport Club',
    slug: 'inacua-malaga-sport-club',
    location: {
      address: 'Calle Córdoba, 9',
      city: 'malaga',
      postalCode: '29001',
      coordinates: { lat: 36.7213, lng: -4.4214 },
      googleMapsUrl: 'https://maps.google.com/?q=Inacua+Málaga'
    },
    description: {
      es: 'Moderno centro deportivo con pistas de tenis de alta calidad, gimnasio y piscina. Ideal para jugadores que buscan instalaciones completas.',
      en: 'Modern sports center with high-quality tennis courts, gym, and pool. Ideal for players looking for complete facilities.'
    },
    courts: {
      total: 6,
      surfaces: [
        { type: 'hard', count: 4 },
        { type: 'padel', count: 2 }
      ],
      indoor: 6,
      outdoor: 0
    },
    amenities: {
      parking: true,
      lighting: true,
      changingRooms: true,
      showers: true,
      lockers: true,
      swimming: true,
      gym: true,
      sauna: true
    },
    services: {
      lessons: true,
      coaching: true
    },
    contact: {
      phone: '+34 952 21 88 99',
      email: 'malaga@inacua.com',
      website: 'https://www.inacua.com'
    },
    pricing: {
      courtRental: {
        hourly: { min: 15, max: 25, currency: 'EUR' }
      },
      publicAccess: true,
      membershipRequired: false
    },
    tags: ['family-friendly', 'beginner-friendly'],
    status: 'active'
  },

  // Marbella Clubs
  {
    name: 'Real Club de Tenis Marbella',
    slug: 'real-club-tenis-marbella',
    location: {
      address: 'Avenida del Calvario, 4',
      city: 'marbella',
      postalCode: '29602',
      coordinates: { lat: 36.5099, lng: -4.8901 },
      googleMapsUrl: 'https://maps.google.com/?q=Real+Club+de+Tenis+Marbella'
    },
    description: {
      es: 'Club emblemático de Marbella con tradición desde 1958. Ofrece un ambiente exclusivo con vistas al mar y torneos de alto nivel.',
      en: 'Emblematic Marbella club with tradition since 1958. Offers an exclusive atmosphere with sea views and high-level tournaments.'
    },
    courts: {
      total: 10,
      surfaces: [
        { type: 'clay', count: 8 },
        { type: 'grass', count: 2 }
      ],
      indoor: 0,
      outdoor: 10
    },
    amenities: {
      parking: true,
      lighting: true,
      proShop: true,
      restaurant: true,
      changingRooms: true,
      showers: true,
      lockers: true,
      swimming: true
    },
    services: {
      lessons: true,
      coaching: true,
      stringing: true,
      tournaments: true
    },
    contact: {
      phone: '+34 952 77 88 99',
      email: 'info@rctmarbella.com',
      website: 'https://www.rctmarbella.com'
    },
    pricing: {
      courtRental: {
        hourly: { min: 20, max: 35, currency: 'EUR' },
        membership: { annual: 1200, currency: 'EUR' }
      },
      publicAccess: false,
      membershipRequired: true
    },
    tags: ['professional', 'tournaments', 'private', 'social-club'],
    featured: true,
    status: 'active'
  },
  {
    name: 'Manolo Santana Racquets Club',
    slug: 'manolo-santana-racquets-club',
    location: {
      address: 'Calle Azahar s/n, Urb. La Quinta',
      city: 'marbella',
      postalCode: '29660',
      coordinates: { lat: 36.4851, lng: -5.0086 },
      googleMapsUrl: 'https://maps.google.com/?q=Manolo+Santana+Racquets+Club'
    },
    description: {
      es: 'Complejo deportivo de primer nivel con academia profesional. Centro de alto rendimiento con entrenadores internacionales.',
      en: 'Top-level sports complex with professional academy. High-performance center with international coaches.'
    },
    courts: {
      total: 14,
      surfaces: [
        { type: 'clay', count: 10 },
        { type: 'hard', count: 4 }
      ],
      indoor: 2,
      outdoor: 12
    },
    amenities: {
      parking: true,
      lighting: true,
      proShop: true,
      restaurant: true,
      changingRooms: true,
      showers: true,
      lockers: true,
      wheelchair: true,
      gym: true,
      physio: true
    },
    services: {
      lessons: true,
      coaching: true,
      stringing: true,
      tournaments: true,
      summerCamps: true
    },
    contact: {
      phone: '+34 952 83 24 52',
      email: 'info@manolosantanaracquetsclub.com',
      website: 'https://www.manolosantanaracquetsclub.com'
    },
    pricing: {
      courtRental: {
        hourly: { min: 25, max: 40, currency: 'EUR' }
      },
      publicAccess: true,
      membershipRequired: false
    },
    tags: ['professional', 'academy', 'tournaments'],
    featured: true,
    status: 'active'
  },

  // Estepona Clubs
  {
    name: 'Club de Tenis Estepona',
    slug: 'club-tenis-estepona',
    location: {
      address: 'Avenida Juan Carlos I, s/n',
      city: 'estepona',
      postalCode: '29680',
      coordinates: { lat: 36.4226, lng: -5.1463 },
      googleMapsUrl: 'https://maps.google.com/?q=Club+de+Tenis+Estepona'
    },
    description: {
      es: 'Club municipal con excelentes instalaciones y precios asequibles. Perfecto para jugadores de todos los niveles.',
      en: 'Municipal club with excellent facilities and affordable prices. Perfect for players of all levels.'
    },
    courts: {
      total: 8,
      surfaces: [
        { type: 'clay', count: 4 },
        { type: 'hard', count: 2 },
        { type: 'synthetic', count: 2 }
      ],
      indoor: 0,
      outdoor: 8
    },
    amenities: {
      parking: true,
      lighting: true,
      changingRooms: true,
      showers: true,
      restaurant: true
    },
    services: {
      lessons: true,
      coaching: true,
      tournaments: true,
      summerCamps: true
    },
    contact: {
      phone: '+34 952 80 34 56',
      email: 'info@clubtenisestepona.com'
    },
    pricing: {
      courtRental: {
        hourly: { min: 8, max: 15, currency: 'EUR' }
      },
      publicAccess: true,
      membershipRequired: false
    },
    tags: ['municipal', 'family-friendly', 'beginner-friendly'],
    status: 'active'
  },
  {
    name: 'Valle Romano Golf & Resort Tennis',
    slug: 'valle-romano-tennis',
    location: {
      address: 'Carretera N340, km 164',
      city: 'estepona',
      postalCode: '29680',
      coordinates: { lat: 36.4302, lng: -5.1028 },
      googleMapsUrl: 'https://maps.google.com/?q=Valle+Romano+Golf'
    },
    description: {
      es: 'Pistas de tenis en un resort de golf de lujo. Ambiente tranquilo con vistas espectaculares.',
      en: 'Tennis courts in a luxury golf resort. Peaceful atmosphere with spectacular views.'
    },
    courts: {
      total: 4,
      surfaces: [
        { type: 'clay', count: 2 },
        { type: 'hard', count: 2 }
      ],
      indoor: 0,
      outdoor: 4
    },
    amenities: {
      parking: true,
      lighting: true,
      changingRooms: true,
      showers: true,
      lockers: true,
      restaurant: true,
      swimming: true
    },
    services: {
      lessons: true,
      coaching: true
    },
    contact: {
      phone: '+34 952 80 08 30',
      email: 'tennis@valleromano.com',
      website: 'https://www.valleromano.com'
    },
    pricing: {
      courtRental: {
        hourly: { min: 18, max: 30, currency: 'EUR' }
      },
      publicAccess: true,
      membershipRequired: false
    },
    tags: ['hotel-club', 'beginner-friendly'],
    status: 'active'
  }
]

async function seedClubs() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || process.env.DATABASE_URL)
    console.log('Connected to MongoDB')

    // Clear existing clubs
    await Club.deleteMany({})
    console.log('Cleared existing clubs')

    // Insert sample clubs
    const clubs = await Club.insertMany(SAMPLE_CLUBS)
    console.log(`Inserted ${clubs.length} clubs:`)
    clubs.forEach(club => {
      console.log(`- ${club.name} (${club.location.city})`)
    })

    console.log('\nSeeding completed successfully!')
  } catch (error) {
    console.error('Error seeding clubs:', error)
  } finally {
    await mongoose.disconnect()
  }
}

// Run the seed function
seedClubs()