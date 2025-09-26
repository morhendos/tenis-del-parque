/**
 * Script to check what season format existing matches are using
 * This will help us understand why matches aren't connecting to leagues
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
  season: {
    type: mongoose.Schema.Types.Mixed // Can be String or ObjectId
  },
  round: Number,
  matchType: {
    type: String,
    enum: ['regular', 'playoff'],
    default: 'regular'
  },
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
    }
  },
  status: {
    type: String,
    enum: ['scheduled', 'completed', 'cancelled'],
    default: 'scheduled'
  }
}, { timestamps: true })

// Define League schema inline
const LeagueSchema = new mongoose.Schema({
  name: String,
  slug: String,
  season: {
    year: Number,
    type: String,
    number: Number
  }
}, { timestamps: true })

// Create models
const Match = mongoose.models.Match || mongoose.model('Match', MatchSchema)
const League = mongoose.models.League || mongoose.model('League', LeagueSchema)

async function checkMatchSeasons() {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('✅ Connected to MongoDB')
    
    // Get the Sotogrande league ID
    const sotograndeLeague = await League.findOne({ slug: 'liga-de-sotogrande' })
    if (!sotograndeLeague) {
      console.log('❌ Liga de Sotogrande not found')
      return
    }
    
    console.log(`🔍 Checking matches for Liga de Sotogrande (${sotograndeLeague._id})`)
    console.log(`   League season: ${JSON.stringify(sotograndeLeague.season)}`)
    
    // Find all matches for this league
    const allMatches = await Match.find({ league: sotograndeLeague._id })
    
    console.log(`📊 Found ${allMatches.length} total matches for this league`)
    
    if (allMatches.length === 0) {
      console.log('⚠️  No matches found - this explains why standings show 0 matches')
      return
    }
    
    // Group matches by season format
    const seasonFormats = {}
    const statusCounts = { scheduled: 0, completed: 0, cancelled: 0 }
    
    allMatches.forEach(match => {
      const seasonStr = JSON.stringify(match.season)
      seasonFormats[seasonStr] = (seasonFormats[seasonStr] || 0) + 1
      
      // Check match status
      const status = match.result?.winner ? 'completed' : 'scheduled'
      statusCounts[status]++
    })
    
    console.log('\n📋 Season formats found in matches:')
    Object.entries(seasonFormats).forEach(([format, count]) => {
      console.log(`   ${format}: ${count} matches`)
    })
    
    console.log('\n📈 Match status breakdown:')
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`   ${status}: ${count} matches`)
    })
    
    // Show sample matches
    console.log('\n🔍 Sample matches:')
    allMatches.slice(0, 3).forEach((match, index) => {
      console.log(`   ${index + 1}. Player ${match.players.player1} vs Player ${match.players.player2}`)
      console.log(`      Season: ${JSON.stringify(match.season)}`)
      console.log(`      Round: ${match.round}`)
      console.log(`      Status: ${match.result?.winner ? 'completed' : 'scheduled'}`)
      console.log(`      Match ID: ${match._id}`)
    })
    
    // Check what the API query should be
    console.log('\n🔧 API Query Analysis:')
    console.log(`   League is looking for season: "summer-2025"`)
    console.log(`   Matches have seasons like: ${Object.keys(seasonFormats).join(', ')}`)
    
    if (!Object.keys(seasonFormats).includes('"summer-2025"')) {
      console.log('❌ MISMATCH: Matches don\'t use "summer-2025" format!')
      console.log('💡 Need to update matches to use the same season format as leagues')
    } else {
      console.log('✅ Season formats match!')
    }
    
  } catch (error) {
    console.error('❌ Error checking match seasons:', error)
  } finally {
    await mongoose.disconnect()
    console.log('\n🔌 Disconnected from MongoDB')
    process.exit(0)
  }
}

// Run the script
checkMatchSeasons()
