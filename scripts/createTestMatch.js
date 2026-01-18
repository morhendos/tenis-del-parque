const mongoose = require('mongoose')
require('dotenv').config({ path: '.env.local' })

async function createTestMatch() {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('Connected to MongoDB')

    const Match = mongoose.model('Match', new mongoose.Schema({}, { strict: false }))
    const Player = mongoose.model('Player', new mongoose.Schema({}, { strict: false }))

    // Find Tomasz (you)
    const tomasz = await Player.findOne({ name: /tomasz/i })
    console.log('Found Tomasz:', tomasz?.name, tomasz?._id)

    // Find another player to be opponent (someone not already matched with you in R1)
    const opponent = await Player.findOne({ 
      name: /fernando/i  // Using Fernando as test opponent
    })
    console.log('Found opponent:', opponent?.name, opponent?._id)

    if (!tomasz || !opponent) {
      console.log('Could not find players')
      return
    }

    // Get the league ID from an existing match
    const existingMatch = await Match.findOne({ round: 1 })
    const leagueId = existingMatch?.league
    console.log('Using league:', leagueId)

    // Create deadline 2 days from now (to show urgent state)
    const deadline = new Date()
    deadline.setDate(deadline.getDate() + 1) // 1 day from now - urgent!

    // Create test match
    const testMatch = new Match({
      league: leagueId,
      season: leagueId, // Same as league for this setup
      round: 1,
      matchType: 'regular',
      players: {
        player1: tomasz._id,
        player2: opponent._id
      },
      schedule: {
        proposedDates: [],
        confirmedDate: null,
        club: null,
        court: null,
        time: null,
        deadline: deadline,
        extensionHistory: []
      },
      result: null,
      status: 'scheduled', // Not completed
      wildCardUsed: {
        player1: false,
        player2: false
      },
      notes: 'TEST MATCH - DELETE LATER',
      createdAt: new Date(),
      updatedAt: new Date()
    })

    await testMatch.save()
    console.log('\n✅ Test match created!')
    console.log('Match ID:', testMatch._id)
    console.log('Players:', tomasz.name, 'vs', opponent.name)
    console.log('Deadline:', deadline)
    console.log('\n⚠️  Remember to delete this test match later!')

  } catch (error) {
    console.error('Error:', error)
  } finally {
    await mongoose.disconnect()
    console.log('\nDisconnected from MongoDB')
  }
}

createTestMatch()
