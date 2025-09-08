// Script to add missing season data to legacy leagues
import dbConnect from '../lib/db/mongoose.js'
import League from '../lib/models/League.js'

async function fixLegacyLeagueSeasons() {
  try {
    await dbConnect()
    console.log('🔍 Looking for leagues without season data...')
    
    // Find leagues that don't have season data
    const legaciesWithoutSeasons = await League.find({
      $or: [
        { season: null },
        { season: { $exists: false } },
        { 'season.type': { $exists: false } },
        { 'season.year': { $exists: false } }
      ]
    })
    
    console.log(`Found ${legaciesWithoutSeasons.length} leagues without proper season data:`)
    legaciesWithoutSeasons.forEach(league => {
      console.log(`- ${league.name} (${league.slug}) - Status: ${league.status}`)
    })
    
    // Update "Liga de Sotogrande" specifically
    const sotoLeague = await League.findOne({ slug: 'liga-de-sotogrande' })
    
    if (sotoLeague) {
      console.log('🔧 Updating Liga de Sotogrande with season data...')
      
      const updatedLeague = await League.findByIdAndUpdate(
        sotoLeague._id,
        {
          $set: {
            season: {
              type: 'summer',
              year: 2025,
              number: 1
            },
            seasonConfig: {
              startDate: new Date('2025-06-01'),
              endDate: new Date('2025-08-31'),
              registrationStart: new Date('2025-05-01'),
              registrationEnd: new Date('2025-05-31'),
              maxPlayers: 24,
              minPlayers: 8,
              price: {
                amount: 0,
                currency: 'EUR',
                isFree: true
              }
            }
          }
        },
        { new: true, validateBeforeSave: false }
      )
      
      console.log('✅ Liga de Sotogrande updated with season data!')
      console.log('- Season:', updatedLeague.season)
      console.log('- Season Config:', updatedLeague.seasonConfig)
      
    } else {
      console.log('❌ Liga de Sotogrande not found')
    }
    
  } catch (error) {
    console.error('❌ Error fixing legacy leagues:', error)
  }
}

fixLegacyLeagueSeasons()
