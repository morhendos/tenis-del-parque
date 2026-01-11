/**
 * Quick script to check Silver League playoff configuration
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

    const league = await mongoose.connection.db.collection('leagues').findOne({
      _id: new mongoose.Types.ObjectId(SILVER_LEAGUE_ID)
    })

    if (!league) {
      console.log('❌ League not found')
      return
    }

    console.log('📋 Silver League Configuration:')
    console.log(`   Name: ${league.name}`)
    console.log(`   Skill Level: ${league.skillLevel}`)
    console.log(`   Status: ${league.status}`)
    console.log('')
    console.log('🏆 Playoff Config:')
    console.log(JSON.stringify(league.playoffConfig, null, 2))

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await mongoose.disconnect()
    console.log('\n🔌 Disconnected')
  }
}

main()
