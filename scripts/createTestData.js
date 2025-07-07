const mongoose = require('mongoose')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

// ELO calculation function
function calculateEloChange(playerRating, opponentRating, outcome, kFactor = 32) {
  const expectedScore = 1 / (1 + Math.pow(10, (opponentRating - playerRating) / 400))
  return Math.round(kFactor * (outcome - expectedScore))
}

async function createTestData() {
  try {
    // Connect to MongoDB
    if (!process.env.MONGODB_URI) {
      throw new Error('Please add your MongoDB URI to .env.local')
    }
    
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('✅ Connected to MongoDB')
    
    // Define schemas
    const LeagueSchema = new mongoose.Schema({
      name: String,
      slug: String,
      seasons: Array,
      config: Object,
      // ... other fields
    }, { timestamps: true })
    
    const PlayerSchema = new mongoose.Schema({
      name: String,
      email: String,
      whatsapp: String,
      level: String,
      league: { type: mongoose.Schema.Types.ObjectId, ref: 'League' },
      season: String,
      status: String,
      registeredAt: Date,
      stats: {
        matchesPlayed: { type: Number, default: 0 },
        matchesWon: { type: Number, default: 0 },
        totalPoints: { type: Number, default: 0 },
        eloRating: { type: Number, default: 1200 },
        highestElo: { type: Number, default: 1200 },
        lowestElo: { type: Number, default: 1200 },
        setsWon: { type: Number, default: 0 },
        setsLost: { type: Number, default: 0 },
        gamesWon: { type: Number, default: 0 },
        gamesLost: { type: Number, default: 0 }
      },
      matchHistory: Array
    }, { timestamps: true })
    
    const MatchSchema = new mongoose.Schema({
      league: { type: mongoose.Schema.Types.ObjectId, ref: 'League' },
      season: String,
      round: Number,
      players: {
        player1: { type: mongoose.Schema.Types.ObjectId, ref: 'Player' },
        player2: { type: mongoose.Schema.Types.ObjectId, ref: 'Player' }
      },
      schedule: {
        proposedDates: [Date],
        confirmedDate: Date,
        club: String,
        court: String,
        courtNumber: String,
        time: String,
        deadline: Date
      },
      result: {
        winner: { type: mongoose.Schema.Types.ObjectId, ref: 'Player' },
        score: {
          sets: Array
        },
        playedAt: Date
      },
      eloChanges: {
        player1: { before: Number, after: Number, change: Number },
        player2: { before: Number, after: Number, change: Number }
      },
      status: String
    }, { timestamps: true })

    const League = mongoose.models.League || mongoose.model('League', LeagueSchema)
    const Player = mongoose.models.Player || mongoose.model('Player', PlayerSchema)
    const Match = mongoose.models.Match || mongoose.model('Match', MatchSchema)

    // Find Sotogrande league
    const league = await League.findOne({ slug: 'sotogrande' })
    if (!league) {
      throw new Error('Sotogrande league not found. Run seedLeagues.js first.')
    }
    
    console.log('🏆 Found league:', league.name)

    // Clear existing test data
    await Player.deleteMany({ league: league._id })
    await Match.deleteMany({ league: league._id })
    console.log('🧹 Cleared existing test data')

    // Create test players
    const testPlayers = [
      // Beginners
      { name: 'Carlos Rodriguez', email: 'carlos@example.com', whatsapp: '+34600111001', level: 'beginner', elo: 1170 },
      { name: 'Ana Martinez', email: 'ana@example.com', whatsapp: '+34600111002', level: 'beginner', elo: 1180 },
      { name: 'Luis Garcia', email: 'luis@example.com', whatsapp: '+34600111003', level: 'beginner', elo: 1160 },
      { name: 'Sofia Lopez', email: 'sofia@example.com', whatsapp: '+34600111004', level: 'beginner', elo: 1190 },
      
      // Intermediates  
      { name: 'Miguel Fernandez', email: 'miguel@example.com', whatsapp: '+34600111005', level: 'intermediate', elo: 1220 },
      { name: 'Carmen Ruiz', email: 'carmen@example.com', whatsapp: '+34600111006', level: 'intermediate', elo: 1210 },
      { name: 'David Moreno', email: 'david@example.com', whatsapp: '+34600111007', level: 'intermediate', elo: 1230 },
      { name: 'Elena Jimenez', email: 'elena@example.com', whatsapp: '+34600111008', level: 'intermediate', elo: 1240 },
      
      // Advanced
      { name: 'Roberto Sanchez', email: 'roberto@example.com', whatsapp: '+34600111009', level: 'advanced', elo: 1270 },
      { name: 'Patricia Herrera', email: 'patricia@example.com', whatsapp: '+34600111010', level: 'advanced', elo: 1300 },
      { name: 'Fernando Torres', email: 'fernando@example.com', whatsapp: '+34600111011', level: 'advanced', elo: 1320 },
      { name: 'Lucia Vargas', email: 'lucia@example.com', whatsapp: '+34600111012', level: 'advanced', elo: 1280 }
    ]

    const createdPlayers = []
    for (const playerData of testPlayers) {
      const player = new Player({
        name: playerData.name,
        email: playerData.email,
        whatsapp: playerData.whatsapp,
        level: playerData.level,
        league: league._id,
        season: 'Verano 2025',
        status: 'active',
        registeredAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Random date in last 30 days
        stats: {
          matchesPlayed: 0,
          matchesWon: 0,
          totalPoints: 0,
          eloRating: playerData.elo,
          highestElo: playerData.elo,
          lowestElo: playerData.elo,
          setsWon: 0,
          setsLost: 0,
          gamesWon: 0,
          gamesLost: 0
        }
      })
      await player.save()
      createdPlayers.push(player)
    }
    
    console.log(`✅ Created ${createdPlayers.length} test players`)

    // Create matches with results
    const matches = []
    const matchDates = []
    
    // Generate dates for last 3 weeks
    for (let i = 21; i >= 1; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      matchDates.push(date)
    }

    // Create matches for Round 1
    const round1Matches = [
      { p1: 0, p2: 1, winner: 1, score: [{ player1: 4, player2: 6 }, { player1: 3, player2: 6 }] }, // Ana beats Carlos
      { p1: 2, p2: 3, winner: 3, score: [{ player1: 2, player2: 6 }, { player1: 4, player2: 6 }] }, // Sofia beats Luis
      { p1: 4, p2: 5, winner: 5, score: [{ player1: 4, player2: 6 }, { player1: 6, player2: 4 }, { player1: 4, player2: 6 }] }, // Carmen beats Miguel
      { p1: 6, p2: 7, winner: 6, score: [{ player1: 6, player2: 4 }, { player1: 6, player2: 2 }] }, // David beats Elena
      { p1: 8, p2: 9, winner: 9, score: [{ player1: 3, player2: 6 }, { player1: 6, player2: 4 }, { player1: 4, player2: 6 }] }, // Patricia beats Roberto
      { p1: 10, p2: 11, winner: 10, score: [{ player1: 6, player2: 3 }, { player1: 6, player2: 4 }] } // Fernando beats Lucia
    ]

    // Create matches for Round 2
    const round2Matches = [
      { p1: 1, p2: 3, winner: 1, score: [{ player1: 6, player2: 4 }, { player1: 6, player2: 3 }] }, // Ana beats Sofia
      { p1: 0, p2: 2, winner: 2, score: [{ player1: 4, player2: 6 }, { player1: 5, player2: 7 }] }, // Luis beats Carlos
      { p1: 5, p2: 6, winner: 6, score: [{ player1: 4, player2: 6 }, { player1: 6, player2: 4 }, { player1: 3, player2: 6 }] }, // David beats Carmen
      { p1: 4, p2: 7, winner: 4, score: [{ player1: 6, player2: 2 }, { player1: 6, player2: 4 }] }, // Miguel beats Elena
      { p1: 9, p2: 10, winner: 10, score: [{ player1: 6, player2: 7 }, { player1: 4, player2: 6 }, { player1: 6, player2: 8 }] }, // Fernando beats Patricia
      { p1: 8, p2: 11, winner: 11, score: [{ player1: 2, player2: 6 }, { player1: 4, player2: 6 }] } // Lucia beats Roberto
    ]

    let dateIndex = 0
    
    // Process Round 1
    for (let i = 0; i < round1Matches.length; i++) {
      const matchData = round1Matches[i]
      const player1 = createdPlayers[matchData.p1]
      const player2 = createdPlayers[matchData.p2]
      const winner = createdPlayers[matchData.winner]
      const loser = winner._id.equals(player1._id) ? player2 : player1
      
      // Calculate ELO changes
      const outcome1 = winner._id.equals(player1._id) ? 1 : 0
      const outcome2 = 1 - outcome1
      
      const eloChange1 = calculateEloChange(player1.stats.eloRating, player2.stats.eloRating, outcome1)
      const eloChange2 = calculateEloChange(player2.stats.eloRating, player1.stats.eloRating, outcome2)
      
      const match = new Match({
        league: league._id,
        season: 'Verano 2025',
        round: 1,
        players: { player1: player1._id, player2: player2._id },
        schedule: {
          confirmedDate: matchDates[dateIndex],
          court: `Court ${(i % 4) + 1}`
        },
        result: {
          winner: winner._id,
          score: { sets: matchData.score },
          playedAt: matchDates[dateIndex]
        },
        eloChanges: {
          player1: { before: player1.stats.eloRating, after: player1.stats.eloRating + eloChange1, change: eloChange1 },
          player2: { before: player2.stats.eloRating, after: player2.stats.eloRating + eloChange2, change: eloChange2 }
        },
        status: 'completed'
      })
      
      await match.save()
      
      // Update player stats
      await updatePlayerStats(player1, player2, winner, matchData.score, eloChange1, match._id, 1, matchDates[dateIndex], true)
      await updatePlayerStats(player2, player1, winner, matchData.score, eloChange2, match._id, 1, matchDates[dateIndex], false)
      
      dateIndex++
    }

    // Process Round 2
    for (let i = 0; i < round2Matches.length; i++) {
      const matchData = round2Matches[i]
      const player1 = createdPlayers[matchData.p1]
      const player2 = createdPlayers[matchData.p2]
      const winner = createdPlayers[matchData.winner]
      
      // Get updated ELO ratings
      const updatedPlayer1 = await Player.findById(player1._id)
      const updatedPlayer2 = await Player.findById(player2._id)
      
      const outcome1 = winner._id.equals(player1._id) ? 1 : 0
      const outcome2 = 1 - outcome1
      
      const eloChange1 = calculateEloChange(updatedPlayer1.stats.eloRating, updatedPlayer2.stats.eloRating, outcome1)
      const eloChange2 = calculateEloChange(updatedPlayer2.stats.eloRating, updatedPlayer1.stats.eloRating, outcome2)
      
      const match = new Match({
        league: league._id,
        season: 'Verano 2025',
        round: 2,
        players: { player1: player1._id, player2: player2._id },
        schedule: {
          confirmedDate: matchDates[dateIndex],
          court: `Court ${(i % 4) + 1}`
        },
        result: {
          winner: winner._id,
          score: { sets: matchData.score },
          playedAt: matchDates[dateIndex]
        },
        eloChanges: {
          player1: { before: updatedPlayer1.stats.eloRating, after: updatedPlayer1.stats.eloRating + eloChange1, change: eloChange1 },
          player2: { before: updatedPlayer2.stats.eloRating, after: updatedPlayer2.stats.eloRating + eloChange2, change: eloChange2 }
        },
        status: 'completed'
      })
      
      await match.save()
      
      // Update player stats
      await updatePlayerStats(updatedPlayer1, updatedPlayer2, winner, matchData.score, eloChange1, match._id, 2, matchDates[dateIndex], true)
      await updatePlayerStats(updatedPlayer2, updatedPlayer1, winner, matchData.score, eloChange2, match._id, 2, matchDates[dateIndex], false)
      
      dateIndex++
    }

    console.log('✅ Created matches for Rounds 1 and 2')
    
    // Create scheduled matches for Round 3
    const round3Matches = [
      { p1: 1, p2: 6 }, // Ana vs David
      { p1: 10, p2: 11 }, // Fernando vs Lucia
      { p1: 2, p2: 4 }, // Luis vs Miguel
      { p1: 3, p2: 5 }, // Sofia vs Carmen
      { p1: 0, p2: 7 }, // Carlos vs Elena
      { p1: 8, p2: 9 } // Roberto vs Patricia
    ]

    // Create scheduled matches for next week
    const nextWeekDates = []
    for (let i = 1; i <= 6; i++) {
      const date = new Date()
      date.setDate(date.getDate() + i)
      nextWeekDates.push(date)
    }

    const clubs = [
      'Club Sotogrande',
      'La Reserva Club',
      'Real Club Valderrama',
      'Octágono Tennis Club',
      'Racket Center'
    ]
    
    const timeSlots = [
      '09:00', '10:30', '12:00', '14:00', '16:30', '18:00'
    ]

    for (let i = 0; i < round3Matches.length; i++) {
      const matchData = round3Matches[i]
      const player1 = createdPlayers[matchData.p1]
      const player2 = createdPlayers[matchData.p2]
      
      // Create deadline (7 days from now)
      const deadline = new Date()
      deadline.setDate(deadline.getDate() + 7)
      
      // Create confirmed date for some matches (2-4 days from now)
      const confirmedDate = new Date()
      confirmedDate.setDate(confirmedDate.getDate() + (2 + i % 3))
      
      const selectedClub = clubs[i % clubs.length]
      const selectedTime = timeSlots[i % timeSlots.length]
      
      const match = new Match({
        league: league._id,
        season: 'Verano 2025',
        round: 3,
        players: { player1: player1._id, player2: player2._id },
        schedule: {
          confirmedDate: confirmedDate,
          deadline: deadline,
          club: selectedClub,
          court: `Pista de Tenis`,
          courtNumber: `${(i % 4) + 1}`,
          time: selectedTime
        },
        result: null,
        eloChanges: null,
        status: 'scheduled'
      })
      
      await match.save()
    }

    console.log('✅ Created scheduled matches for Round 3')

    // Helper function to update player stats
    async function updatePlayerStats(player, opponent, winner, score, eloChange, matchId, round, date, isPlayer1) {
      const won = winner._id.equals(player._id)
      
      // Calculate sets and games
      let setsWon = 0, setsLost = 0, gamesWon = 0, gamesLost = 0
      score.forEach(set => {
        if (isPlayer1) { // This is player1
          if (set.player1 > set.player2) {
            setsWon += 1
          } else {
            setsLost += 1
          }
          gamesWon += set.player1
          gamesLost += set.player2
        } else { // This is player2
          if (set.player2 > set.player1) {
            setsWon += 1
          } else {
            setsLost += 1
          }
          gamesWon += set.player2
          gamesLost += set.player1
        }
      })
      
      // Calculate points based on new scoring system:
      // Win 2-0: 3 points, Win 2-1: 2 points, Lose 1-2: 1 point, Lose 0-2: 0 points
      let points = 0
      if (won) {
        points = setsWon === 2 && setsLost === 0 ? 3 : 2 // 2-0 = 3 pts, 2-1 = 2 pts
      } else {
        points = setsWon === 1 ? 1 : 0 // 1-2 = 1 pt, 0-2 = 0 pts
      }
      
      player.stats.matchesPlayed += 1
      if (won) player.stats.matchesWon += 1
      player.stats.totalPoints += points
      
      player.stats.eloRating += eloChange
      if (player.stats.eloRating > player.stats.highestElo) {
        player.stats.highestElo = player.stats.eloRating
      }
      if (player.stats.eloRating < player.stats.lowestElo) {
        player.stats.lowestElo = player.stats.eloRating
      }
      
      player.stats.setsWon += setsWon
      player.stats.setsLost += setsLost
      player.stats.gamesWon += gamesWon
      player.stats.gamesLost += gamesLost
      
      // Add to match history
      const scoreDisplay = score.map(set => `${set.player1}-${set.player2}`).join(', ')
      player.matchHistory.push({
        match: matchId,
        opponent: opponent._id,
        result: won ? 'won' : 'lost',
        score: scoreDisplay,
        eloChange: eloChange,
        eloAfter: player.stats.eloRating,
        round: round,
        date: date
      })
      
      await player.save()
    }

    // Get final stats
    const totalMatches = await Match.countDocuments({ league: league._id })
    const totalPlayers = await Player.countDocuments({ league: league._id })
    
    console.log(`\n🎾 Test data created successfully!`)
    console.log(`📊 Players: ${totalPlayers}`)
    console.log(`🏆 Matches: ${totalMatches}`)
    console.log(`🎯 Rounds completed: 2, Round 3 scheduled`)
    console.log(`\n🔗 View at: http://localhost:3000/sotogrande/liga/verano2025`)

  } catch (error) {
    console.error('❌ Error creating test data:', error)
  } finally {
    await mongoose.disconnect()
    console.log('👋 Disconnected from MongoDB')
    process.exit()
  }
}

// Run the script
createTestData() 