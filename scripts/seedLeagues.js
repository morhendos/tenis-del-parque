import dbConnect from '../lib/db/mongoose.js'
import League from '../lib/models/League.js'

async function seedLeagues() {
  try {
    await dbConnect()
    
    // Check if Sotogrande league already exists
    const existing = await League.findOne({ slug: 'sotogrande' })
    if (existing) {
      console.log('❌ Sotogrande league already exists')
      return
    }
    
    // Create Sotogrande League
    const sotogrande = new League({
      name: 'Liga de Sotogrande',
      slug: 'sotogrande',
      location: {
        city: 'Sotogrande',
        region: 'Andalucía',
        country: 'Spain',
        timezone: 'Europe/Madrid'
      },
      description: {
        es: 'La primera liga de tenis amateur en Sotogrande que combina competición seria con ambiente social.',
        en: 'The first amateur tennis league in Sotogrande combining serious competition with social atmosphere.'
      },
      seasons: [{
        name: 'Summer 2025',
        startDate: new Date('2025-06-01'),
        endDate: new Date('2025-09-30'),
        registrationDeadline: new Date('2025-05-15'),
        maxPlayers: 150,
        price: {
          amount: 0,
          currency: 'EUR',
          isFree: true
        },
        status: 'registration_open'
      }],
      config: {
        roundsPerSeason: 8,
        wildCardsPerPlayer: 4,
        playoffPlayers: 8,
        levels: [
          {
            key: 'beginner',
            name: {
              es: 'Principiante',
              en: 'Beginner'
            },
            eloRange: {
              min: 0,
              max: 1199
            }
          },
          {
            key: 'intermediate',
            name: {
              es: 'Intermedio',
              en: 'Intermediate'
            },
            eloRange: {
              min: 1200,
              max: 1299
            }
          },
          {
            key: 'advanced',
            name: {
              es: 'Avanzado',
              en: 'Advanced'
            },
            eloRange: {
              min: 1300,
              max: 9999
            }
          }
        ]
      },
      contact: {
        email: 'info@tenisdelparque.com',
        whatsapp: '+34600000000',
        website: 'https://tenisdelparque.com'
      },
      status: 'active'
    })
    
    await sotogrande.save()
    console.log('✅ Sotogrande league created successfully!')
    console.log('League ID:', sotogrande._id)
    
    // Create more leagues for testing (optional)
    const marbella = new League({
      name: 'Liga de Marbella',
      slug: 'marbella',
      location: {
        city: 'Marbella',
        region: 'Andalucía',
        country: 'Spain',
        timezone: 'Europe/Madrid'
      },
      description: {
        es: 'Liga de tenis amateur en Marbella.',
        en: 'Amateur tennis league in Marbella.'
      },
      status: 'coming_soon'
    })
    
    await marbella.save()
    console.log('✅ Marbella league created (coming soon)')
    
  } catch (error) {
    console.error('❌ Error seeding leagues:', error)
  } finally {
    process.exit()
  }
}

// Run the seeder
seedLeagues()