/**
 * Quick script to activate Silver League players
 * Changes status from 'pending' to 'confirmed'
 * 
 * Usage: node scripts/activateSilverPlayers.js
 */

const mongoose = require('mongoose')
require('dotenv').config({ path: '.env.local' })

const MONGODB_URI = process.env.MONGODB_URI
const SILVER_LEAGUE_ID = '68eea90670fb0d35850af89e'

async function main() {
  try {
    console.log('🔌 Connecting to MongoDB...')
    await mongoose.connect(MONGODB_URI)
    console.log('✅ Connected\n')

    // Update all pending players in Silver League to confirmed
    const result = await mongoose.connection.db.collection('players').updateMany(
      {
        'registrations': {
          $elemMatch: {
            league: new mongoose.Types.ObjectId(SILVER_LEAGUE_ID),
            status: 'pending'
          }
        }
      },
      {
        $set: {
          'registrations.$[reg].status': 'confirmed'
        }
      },
      {
        arrayFilters: [
          { 
            'reg.league': new mongoose.Types.ObjectId(SILVER_LEAGUE_ID),
            'reg.status': 'pending'
          }
        ]
      }
    )

    console.log(`✅ Updated ${result.modifiedCount} players from 'pending' to 'confirmed'`)

    // List the updated players
    const players = await mongoose.connection.db.collection('players').find({
      'registrations.league': new mongoose.Types.ObjectId(SILVER_LEAGUE_ID)
    }).toArray()

    console.log('\n📋 Silver League Players:')
    players.forEach(p => {
      const reg = p.registrations.find(r => r.league.toString() === SILVER_LEAGUE_ID)
      console.log(`  - ${p.name} (${p.email}) - Status: ${reg?.status}`)
    })

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await mongoose.disconnect()
    console.log('\n🔌 Disconnected')
  }
}

main()
