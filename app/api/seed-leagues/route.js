import dbConnect from '../../../lib/db/mongoose'
import League from '../../../lib/models/League'

// IMPORTANT: Remove this file after seeding your production database!
// This is a one-time setup endpoint

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

export async function GET(request) {
  try {
    // Add a secret key check for security
    const { searchParams } = new URL(request.url)
    const secret = searchParams.get('secret')
    
    if (secret !== 'your-secret-key-here') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    await dbConnect()
    
    // Check if Sotogrande already exists
    const existing = await League.findOne({ slug: 'sotogrande' })
    if (existing) {
      return Response.json({ 
        message: 'Sotogrande league already exists',
        league: existing 
      })
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
        es: 'La primera liga de tenis amateur en Sotogrande que combina competición seria con ambiente social. Comenzamos en julio 2025.',
        en: 'The first amateur tennis league in Sotogrande combining serious competition with social atmosphere. Starting July 2025.'
      },
      seasons: [{
                    name: 'Verano 2025',
        startDate: new Date('2025-07-01'),
        endDate: new Date('2025-10-31'),
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
      status: 'active',
      stats: {
        totalPlayers: 0,
        totalMatches: 0
      }
    })
    
    await sotogrande.save()
    
    return Response.json({ 
      success: true,
      message: 'Sotogrande league created successfully!',
      league: sotogrande
    })
    
  } catch (error) {
    console.error('Seed error:', error)
    return Response.json({ 
      error: 'Failed to seed database',
      details: error.message 
    }, { status: 500 })
  }
}
