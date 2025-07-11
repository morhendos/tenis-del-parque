const mongoose = require('mongoose')
const dotenv = require('dotenv')

// Load environment variables
dotenv.config({ path: '.env.local' })

// Define schemas inline
const PlayerSchema = new mongoose.Schema({
  name: String,
  email: String,
  stats: {
    matchesPlayed: { type: Number, default: 0 },
    matchesWon: { type: Number, default: 0 },
    totalPoints: { type: Number, default: 0 },
    eloRating: { type: Number },
    setsWon: { type: Number, default: 0 },
    setsLost: { type: Number, default: 0 },
    gamesWon: { type: Number, default: 0 },
    gamesLost: { type: Number, default: 0 }
  }
})

const MatchSchema = new mongoose.Schema({
  players: {
    player1: { type: mongoose.Schema.Types.ObjectId, ref: 'Player' },
    player2: { type: mongoose.Schema.Types.ObjectId, ref: 'Player' }
  },
  result: {
    winner: mongoose.Schema.Types.ObjectId,
    score: {
      sets: [{
        player1: Number,
        player2: Number
      }],
      walkover: Boolean
    }
  },
  status: String
})

// Create models
const Player = mongoose.models.Player || mongoose.model('Player', PlayerSchema)
const Match = mongoose.models.Match || mongoose.model('Match', MatchSchema)

async function recalculateGamesStatistics() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('Connected to MongoDB')

    // Reset all players' games statistics
    const resetResult = await Player.updateMany(
      {},
      { 
        $set: { 
          'stats.gamesWon': 0, 
          'stats.gamesLost': 0 
        } 
      }
    )
    console.log(`Reset games statistics for ${resetResult.modifiedCount} players`)

    // Get all completed matches
    const matches = await Match.find({ 
      status: 'completed',
      'result.winner': { $exists: true }
    }).populate('players.player1 players.player2')

    console.log(`Found ${matches.length} completed matches to process`)

    let processedCount = 0
    let errorCount = 0

    // Process each match
    for (const match of matches) {
      try {
        const player1Id = match.players.player1._id.toString()
        const player2Id = match.players.player2._id.toString()
        const player1Won = match.result.winner.toString() === player1Id

        let player1GamesWon = 0
        let player2GamesWon = 0

        if (match.result.score && match.result.score.sets && match.result.score.sets.length > 0) {
          // Count games from sets
          match.result.score.sets.forEach(set => {
            player1GamesWon += set.player1 || 0
            player2GamesWon += set.player2 || 0
          })
        } else if (match.result.score && match.result.score.walkover) {
          // For walkover, winner gets 12-0 (6-0, 6-0)
          player1GamesWon = player1Won ? 12 : 0
          player2GamesWon = player1Won ? 0 : 12
        }

        // Update player statistics
        await Player.findByIdAndUpdate(player1Id, {
          $inc: {
            'stats.gamesWon': player1GamesWon,
            'stats.gamesLost': player2GamesWon
          }
        })

        await Player.findByIdAndUpdate(player2Id, {
          $inc: {
            'stats.gamesWon': player2GamesWon,
            'stats.gamesLost': player1GamesWon
          }
        })

        processedCount++
        
        if (processedCount % 10 === 0) {
          console.log(`Processed ${processedCount} matches...`)
        }
      } catch (error) {
        console.error(`Error processing match ${match._id}:`, error.message)
        errorCount++
      }
    }

    console.log('\n✅ Recalculation complete!')
    console.log(`- Processed: ${processedCount} matches`)
    console.log(`- Errors: ${errorCount} matches`)

    // Show sample of updated players
    const samplePlayers = await Player.find({
      $or: [
        { 'stats.gamesWon': { $gt: 0 } },
        { 'stats.gamesLost': { $gt: 0 } }
      ]
    }).limit(5).select('name stats.gamesWon stats.gamesLost')

    console.log('\nSample of updated players:')
    samplePlayers.forEach(player => {
      console.log(`- ${player.name}: ${player.stats.gamesWon}-${player.stats.gamesLost} games`)
    })

  } catch (error) {
    console.error('Script error:', error)
  } finally {
    await mongoose.connection.close()
    console.log('\nDatabase connection closed')
  }
}

// Run the script
recalculateGamesStatistics()
