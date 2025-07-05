import 'dotenv/config'
import mongoose from 'mongoose'
import User from '../lib/models/User.js'
import Player from '../lib/models/Player.js'

async function checkAuth() {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('✅ Connected to MongoDB')
    
    const userCount = await User.countDocuments()
    const playerCount = await Player.countDocuments()
    
    console.log(`📊 Database Stats:`)
    console.log(`   Users: ${userCount}`)
    console.log(`   Players: ${playerCount}`)
    
    if (userCount > 0) {
      const users = await User.find({}).select('email role').limit(5)
      console.log(`\n👥 Sample users:`)
      users.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.email} (${user.role})`)
      })
    }
    
    if (playerCount > 0) {
      const players = await Player.find({}).select('name email league').populate('league', 'name').limit(5)
      console.log(`\n🎾 Sample players:`)
      players.forEach((player, index) => {
        console.log(`   ${index + 1}. ${player.name} (${player.email}) - League: ${player.league?.name || 'None'}`)
      })
    }
    
    if (userCount === 0 && playerCount === 0) {
      console.log('\n⚠️  No users or players found in database')
      console.log('💡 Try running: npm run seed:leagues')
      console.log('💡 Or create a test user by registering through the web interface')
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await mongoose.disconnect()
    console.log('🔌 Disconnected from MongoDB')
  }
}

checkAuth() 