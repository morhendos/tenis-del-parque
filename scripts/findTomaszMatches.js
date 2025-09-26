/**
 * Script to find Tomasz's matches and restore his player profile
 */

const mongoose = require('mongoose')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

// Define Match schema inline
const MatchSchema = new mongoose.Schema({
  league: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'League'
  },
  season: mongoose.Schema.Types.Mixed,
  round: Number,
  players: {
    player1: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Player'
    },
    player2: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Player'
    }
  },
  result: {
    winner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Player'
    },
    score: {
      sets: [{
        player1: Number,
        player2: Number
      }]
    }
  },
  status: String
}, { timestamps: true })

// Define Player schema inline
const PlayerSchema = new mongoose.Schema({
  name: String,
  email: String,
  whatsapp: String,
  userId: mongoose.Schema.Types.ObjectId,
  eloRating: Number,
  registrations: [{
    league: mongoose.Schema.Types.ObjectId,
    season: mongoose.Schema.Types.Mixed,
    level: String,
    status: String
  }]
}, { timestamps: true })

// Define League schema inline
const LeagueSchema = new mongoose.Schema({
  name: String,
  slug: String,
  season: mongoose.Schema.Types.Mixed
}, { timestamps: true })

// Create models
const Match = mongoose.models.Match || mongoose.model('Match', MatchSchema)
const Player = mongoose.models.Player || mongoose.model('Player', PlayerSchema)
const League = mongoose.models.League || mongoose.model('League', LeagueSchema)

async function findTomaszMatches() {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('✅ Connected to MongoDB')
    
    // First, let's search for Dirk Lennertz to find the match
    console.log('🔍 Looking for Dirk Lennertz...')
    const dirk = await Player.findOne({ 
      $or: [
        { name: /Dirk.*Lennertz/i },
        { name: /Lennertz.*Dirk/i }
      ]
    })
    
    if (!dirk) {
      console.log('❌ Dirk Lennertz not found')
      return
    }
    
    console.log(`✅ Found Dirk: ${dirk.name} (${dirk.email}) - ID: ${dirk._id}`)
    
    // Find matches with Dirk in round 5
    console.log('\n🔍 Looking for matches with Dirk in round 5...')
    const dirkMatches = await Match.find({
      $or: [
        { 'players.player1': dirk._id },
        { 'players.player2': dirk._id }
      ],
      round: 5
    }).populate('players.player1').populate('players.player2').populate('result.winner')
    
    console.log(`📊 Found ${dirkMatches.length} matches with Dirk in round 5`)
    
    if (dirkMatches.length === 0) {
      console.log('❌ No matches found with Dirk in round 5')
      // Let's try all rounds
      console.log('\n🔍 Searching all rounds for Dirk matches...')
      const allDirkMatches = await Match.find({
        $or: [
          { 'players.player1': dirk._id },
          { 'players.player2': dirk._id }
        ]
      }).populate('players.player1').populate('players.player2').populate('result.winner').sort({ round: 1 })
      
      console.log(`📊 Found ${allDirkMatches.length} total matches with Dirk`)
      allDirkMatches.forEach((match, index) => {
        const opponent = match.players.player1._id.toString() === dirk._id.toString() ? 
          match.players.player2 : match.players.player1
        console.log(`   ${index + 1}. Round ${match.round}: ${dirk.name} vs ${opponent?.name || 'Unknown'} (${opponent?._id})`)
        if (match.result?.winner) {
          console.log(`      Winner: ${match.result.winner.name}`)
        }
      })
      return
    }
    
    // Show matches with Dirk in round 5
    dirkMatches.forEach((match, index) => {
      const opponent = match.players.player1._id.toString() === dirk._id.toString() ? 
        match.players.player2 : match.players.player1
      
      console.log(`\n🎾 Match ${index + 1} (Round ${match.round}):`)
      console.log(`   ${match.players.player1?.name || 'MISSING PLAYER'} vs ${match.players.player2?.name || 'MISSING PLAYER'}`)
      console.log(`   Player 1 ID: ${match.players.player1}`)
      console.log(`   Player 2 ID: ${match.players.player2}`)
      console.log(`   Match ID: ${match._id}`)
      
      if (match.result?.winner) {
        console.log(`   Winner: ${match.result.winner.name}`)
      }
      
      // Check if one player is missing (likely Tomasz)
      if (!match.players.player1 || !match.players.player2) {
        console.log('   ⚠️  One player is missing - likely Tomasz!')
      }
      
      if (opponent && (!opponent.name || opponent.name === 'Unknown')) {
        console.log('   ⚠️  Opponent has no name - likely Tomasz!')
        console.log(`   🔧 Tomasz's Player ID would be: ${opponent._id}`)
        console.log(`   📧 Should restore with email: tomasz@skilling.com`)
      }
    })
    
    // Let's also search for any matches with missing players
    console.log('\n🔍 Looking for matches with null/missing players...')
    const brokenMatches = await Match.find({
      $or: [
        { 'players.player1': null },
        { 'players.player2': null },
        { 'players.player1': { $exists: false } },
        { 'players.player2': { $exists: false } }
      ]
    }).populate('players.player1').populate('players.player2')
    
    console.log(`📊 Found ${brokenMatches.length} matches with missing players`)
    
    if (brokenMatches.length > 0) {
      brokenMatches.forEach((match, index) => {
        console.log(`   ${index + 1}. Round ${match.round}: Match ID ${match._id}`)
        console.log(`      Player 1: ${match.players.player1?.name || 'NULL/MISSING'}`)
        console.log(`      Player 2: ${match.players.player2?.name || 'NULL/MISSING'}`)
      })
    }
    
  } catch (error) {
    console.error('❌ Error finding Tomasz matches:', error)
  } finally {
    await mongoose.disconnect()
    console.log('\n🔌 Disconnected from MongoDB')
    process.exit(0)
  }
}

// Run the script
findTomaszMatches()
