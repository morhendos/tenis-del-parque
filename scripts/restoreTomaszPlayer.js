/**
 * Script to restore Tomasz's player profile
 */

const mongoose = require('mongoose')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

// Define Player schema inline
const PlayerSchema = new mongoose.Schema({
  name: String,
  email: String,
  whatsapp: String,
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  eloRating: {
    type: Number,
    default: 1200
  },
  registrations: [{
    league: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'League'
    },
    season: mongoose.Schema.Types.Mixed,
    level: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'intermediate'
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'pending'],
      default: 'active'
    },
    registeredAt: {
      type: Date,
      default: Date.now
    },
    stats: {
      matchesPlayed: { type: Number, default: 0 },
      matchesWon: { type: Number, default: 0 },
      points: { type: Number, default: 0 }
    }
  }],
  preferences: {
    language: {
      type: String,
      enum: ['es', 'en'],
      default: 'en'
    },
    notifications: {
      email: { type: Boolean, default: true },
      whatsapp: { type: Boolean, default: true }
    }
  }
}, { timestamps: true })

// Create model
const Player = mongoose.models.Player || mongoose.model('Player', PlayerSchema)

async function restoreTomaszPlayer() {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('✅ Connected to MongoDB')
    
    const tomaszId = new mongoose.Types.ObjectId('68c5d0fda95ec4a58f0b6700')
    const leagueId = new mongoose.Types.ObjectId('685fe21ae838c557d2be4b5b')
    const seasonId = new mongoose.Types.ObjectId('688f5d51c94f8e3b3cbfd87b')
    
    // Check if player already exists
    const existingPlayer = await Player.findById(tomaszId)
    if (existingPlayer) {
      console.log('✅ Player already exists:')
      console.log(`   Name: ${existingPlayer.name}`)
      console.log(`   Email: ${existingPlayer.email}`)
      console.log(`   ELO: ${existingPlayer.eloRating}`)
      return
    }
    
    console.log('🔧 Creating/restoring Tomasz player profile...')
    
    // Create the player with the exact ID from the match
    const tomaszPlayer = new Player({
      _id: tomaszId,
      name: 'Tomasz Mikolajewicz',
      email: 'tomasz@skilling.com',
      whatsapp: '', // You can add this later
      eloRating: 1200, // Default ELO, will be updated based on matches
      registrations: [{
        league: leagueId,
        season: seasonId,
        level: 'intermediate', // You can change this if needed
        status: 'active',
        registeredAt: new Date('2025-01-01'), // Approximate registration date
        stats: {
          matchesPlayed: 0, // Will be calculated from actual matches
          matchesWon: 0,
          points: 0
        }
      }],
      preferences: {
        language: 'en', // Based on your preference for English content
        notifications: {
          email: true,
          whatsapp: true
        }
      }
    })
    
    await tomaszPlayer.save()
    
    console.log('🎉 Successfully restored Tomasz player profile!')
    console.log(`   Player ID: ${tomaszPlayer._id}`)
    console.log(`   Name: ${tomaszPlayer.name}`)
    console.log(`   Email: ${tomaszPlayer.email}`)
    console.log(`   ELO Rating: ${tomaszPlayer.eloRating}`)
    console.log(`   League: Liga de Sotogrande`)
    console.log(`   Season: Summer 2025`)
    console.log(`   Level: ${tomaszPlayer.registrations[0].level}`)
    
    // Now let's count his actual matches to verify
    const Match = mongoose.connection.collection('matches')
    const tomaszMatches = await Match.find({
      $or: [
        { 'players.player1': tomaszId },
        { 'players.player2': tomaszId }
      ]
    }).toArray()
    
    const completedMatches = tomaszMatches.filter(m => m.result && m.result.winner)
    const wonMatches = completedMatches.filter(m => 
      m.result.winner.toString() === tomaszId.toString()
    )
    
    console.log('\n📊 Match Statistics:')
    console.log(`   Total matches: ${tomaszMatches.length}`)
    console.log(`   Completed matches: ${completedMatches.length}`)
    console.log(`   Won matches: ${wonMatches.length}`)
    console.log(`   Win rate: ${completedMatches.length > 0 ? Math.round((wonMatches.length / completedMatches.length) * 100) : 0}%`)
    
    console.log('\n✅ Player restoration complete!')
    console.log('💡 Your matches should now be visible in the league standings!')
    
  } catch (error) {
    console.error('❌ Error restoring player:', error)
  } finally {
    await mongoose.disconnect()
    console.log('\n🔌 Disconnected from MongoDB')
    process.exit(0)
  }
}

// Run the script
restoreTomaszPlayer()
