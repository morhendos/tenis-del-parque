/**
 * Seed Demo Data Script
 * Creates demo players and matches for PWA screenshots
 * 
 * Usage: node scripts/seedDemoData.js
 * 
 * This script:
 * 1. Creates a demo user account (demo@tenisdp.es / demo123456)
 * 2. Creates 8 demo players with realistic Spanish names
 * 3. Creates demo match results for Carlos Martínez (the main demo player)
 * 4. Sets up proper ELO ratings and match history
 */

const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

// Demo player data from plan
const DEMO_PLAYERS = [
  { name: 'Carlos Martínez', email: 'demo@tenisdp.es', whatsapp: '+34600000001', targetElo: 1247, level: 'intermediate', isMainDemo: true },
  { name: 'Ana García', email: 'demo.ana@tenisdp.es', whatsapp: '+34600000002', targetElo: 1312, level: 'advanced' },
  { name: 'Pablo Ruiz', email: 'demo.pablo@tenisdp.es', whatsapp: '+34600000003', targetElo: 1189, level: 'intermediate' },
  { name: 'María López', email: 'demo.maria@tenisdp.es', whatsapp: '+34600000004', targetElo: 1276, level: 'intermediate' },
  { name: 'Javier Torres', email: 'demo.javier@tenisdp.es', whatsapp: '+34600000005', targetElo: 1154, level: 'beginner' },
  { name: 'Elena Sánchez', email: 'demo.elena@tenisdp.es', whatsapp: '+34600000006', targetElo: 1298, level: 'intermediate' },
  { name: 'Diego Fernández', email: 'demo.diego@tenisdp.es', whatsapp: '+34600000007', targetElo: 1221, level: 'intermediate' },
  { name: 'Lucía Moreno', email: 'demo.lucia@tenisdp.es', whatsapp: '+34600000008', targetElo: 1165, level: 'beginner' }
]

// Demo match results for Carlos (index 0)
// Format: { opponentIndex, score: [[p1,p2], [p1,p2], [p1,p2]?], carlosWins }
const DEMO_MATCHES = [
  { opponentIndex: 1, score: [[4, 6], [6, 4], [6, 3]], carlosWins: true },   // vs Ana García: W
  { opponentIndex: 2, score: [[6, 2], [6, 4]], carlosWins: true },           // vs Pablo Ruiz: W
  { opponentIndex: 3, score: [[3, 6], [4, 6]], carlosWins: false },          // vs María López: L
  { opponentIndex: 4, score: [[6, 1], [6, 2]], carlosWins: true },           // vs Javier Torres: W
  { opponentIndex: 5, score: [[6, 7], [7, 5], [4, 6]], carlosWins: false }   // vs Elena Sánchez: L
]

// ELO calculation function
function calculateEloChange(playerRating, opponentRating, outcome, kFactor = 32) {
  const expectedScore = 1 / (1 + Math.pow(10, (opponentRating - playerRating) / 400))
  return Math.round(kFactor * (outcome - expectedScore))
}

// Calculate points from match score
function calculatePoints(setsWon, setsLost) {
  if (setsWon === 2 && setsLost === 0) return 3
  if (setsWon === 2 && setsLost === 1) return 2
  if (setsWon === 1 && setsLost === 2) return 1
  return 0
}

async function seedDemoData() {
  try {
    // Connect to MongoDB
    if (!process.env.MONGODB_URI) {
      throw new Error('Please add your MongoDB URI to .env.local')
    }
    
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('✅ Connected to MongoDB')
    
    // =====================
    // Define Schemas
    // =====================
    
    const UserSchema = new mongoose.Schema({
      email: { type: String, required: true, unique: true, lowercase: true },
      password: { type: String, required: true, select: false },
      role: { type: String, enum: ['admin', 'player'], default: 'player' },
      playerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Player' },
      isActive: { type: Boolean, default: true },
      emailVerified: { type: Boolean, default: true },
      lastLogin: Date,
      isFirstLogin: { type: Boolean, default: false },
      preferences: {
        language: { type: String, default: 'es' },
        hasSeenWelcomeModal: { type: Boolean, default: true }
      }
    }, { timestamps: true })
    
    const PlayerSchema = new mongoose.Schema({
      name: { type: String, required: true },
      email: { type: String, required: true, unique: true, lowercase: true },
      whatsapp: String,
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      eloRating: { type: Number, default: 1200 },
      highestElo: { type: Number, default: 1200 },
      lowestElo: { type: Number, default: 1200 },
      registrations: [{
        league: { type: mongoose.Schema.Types.ObjectId, ref: 'League', required: true },
        level: { type: String, required: true },
        registeredAt: { type: Date, default: Date.now },
        status: { type: String, default: 'active' },
        stats: {
          matchesPlayed: { type: Number, default: 0 },
          matchesWon: { type: Number, default: 0 },
          totalPoints: { type: Number, default: 0 },
          setsWon: { type: Number, default: 0 },
          setsLost: { type: Number, default: 0 },
          gamesWon: { type: Number, default: 0 },
          gamesLost: { type: Number, default: 0 }
        },
        matchHistory: [{
          match: { type: mongoose.Schema.Types.ObjectId, ref: 'Match' },
          opponent: { type: mongoose.Schema.Types.ObjectId, ref: 'Player' },
          result: { type: String, enum: ['won', 'lost'] },
          score: String,
          eloChange: Number,
          eloAfter: Number,
          round: Number,
          date: Date
        }]
      }],
      metadata: {
        source: { type: String, default: 'demo' },
        firstRegistrationDate: { type: Date, default: Date.now }
      }
    }, { timestamps: true })
    
    const LeagueSchema = new mongoose.Schema({
      name: String,
      slug: { type: String, unique: true },
      skillLevel: String,
      season: { year: Number, type: String },
      city: { type: mongoose.Schema.Types.ObjectId, ref: 'City' },
      location: { city: String, region: String, country: String },
      status: String,
      stats: { totalPlayers: Number, totalMatches: Number, registeredPlayers: Number }
    }, { timestamps: true })
    
    const MatchSchema = new mongoose.Schema({
      league: { type: mongoose.Schema.Types.ObjectId, ref: 'League', required: true },
      season: mongoose.Schema.Types.Mixed,
      round: { type: Number, required: true },
      matchType: { type: String, enum: ['regular', 'playoff'], default: 'regular' },
      players: {
        player1: { type: mongoose.Schema.Types.ObjectId, ref: 'Player', required: true },
        player2: { type: mongoose.Schema.Types.ObjectId, ref: 'Player', required: true }
      },
      schedule: {
        confirmedDate: Date,
        club: String,
        court: String,
        time: String,
        deadline: Date
      },
      result: {
        winner: { type: mongoose.Schema.Types.ObjectId, ref: 'Player' },
        score: { sets: [{ player1: Number, player2: Number }] },
        playedAt: Date
      },
      eloChanges: {
        player1: { before: Number, after: Number, change: Number },
        player2: { before: Number, after: Number, change: Number }
      },
      status: { type: String, default: 'scheduled' }
    }, { timestamps: true })
    
    // Get or create models
    const User = mongoose.models.User || mongoose.model('User', UserSchema)
    const Player = mongoose.models.Player || mongoose.model('Player', PlayerSchema)
    const League = mongoose.models.League || mongoose.model('League', LeagueSchema)
    const Match = mongoose.models.Match || mongoose.model('Match', MatchSchema)
    
    // =====================
    // Find suitable league
    // =====================
    
    // Find a league with registration_open status, preferably Sotogrande
    let league = await League.findOne({ 
      slug: { $regex: /sotogrande/i },
      status: { $in: ['active', 'registration_open'] }
    })
    
    if (!league) {
      // Try any active league
      league = await League.findOne({ 
        status: { $in: ['active', 'registration_open'] }
      })
    }
    
    if (!league) {
      console.log('❌ No active league found. Please create a league first.')
      console.log('   Run: node scripts/seedLeagues.js')
      process.exit(1)
    }
    
    console.log(`🏆 Using league: ${league.name} (${league.slug})`)
    
    // =====================
    // Clean existing demo data
    // =====================
    
    console.log('\n🧹 Cleaning existing demo data...')
    
    // Find and delete existing demo players
    const demoEmails = DEMO_PLAYERS.map(p => p.email)
    const existingPlayers = await Player.find({ email: { $in: demoEmails } })
    const existingPlayerIds = existingPlayers.map(p => p._id)
    
    // Delete matches involving demo players
    if (existingPlayerIds.length > 0) {
      await Match.deleteMany({
        $or: [
          { 'players.player1': { $in: existingPlayerIds } },
          { 'players.player2': { $in: existingPlayerIds } }
        ]
      })
      console.log('   Deleted demo matches')
    }
    
    // Delete demo players
    await Player.deleteMany({ email: { $in: demoEmails } })
    console.log('   Deleted demo players')
    
    // Delete demo user
    await User.deleteMany({ email: 'demo@tenisdp.es' })
    console.log('   Deleted demo user')
    
    // =====================
    // Create demo user account
    // =====================
    
    console.log('\n👤 Creating demo user account...')
    
    const hashedPassword = await bcrypt.hash('demo123456', 10)
    const demoUser = new User({
      email: 'demo@tenisdp.es',
      password: hashedPassword,
      role: 'player',
      isActive: true,
      emailVerified: true,
      isFirstLogin: false,
      preferences: {
        language: 'es',
        hasSeenWelcomeModal: true
      }
    })
    await demoUser.save()
    console.log(`   ✅ Created user: demo@tenisdp.es / demo123456`)
    
    // =====================
    // Create demo players
    // =====================
    
    console.log('\n🎾 Creating demo players...')
    
    const createdPlayers = []
    
    for (const playerData of DEMO_PLAYERS) {
      // Start all players at 1200 ELO (we'll adjust through matches)
      const initialElo = 1200
      
      const player = new Player({
        name: playerData.name,
        email: playerData.email,
        whatsapp: playerData.whatsapp,
        userId: playerData.isMainDemo ? demoUser._id : null,
        eloRating: initialElo,
        highestElo: initialElo,
        lowestElo: initialElo,
        registrations: [{
          league: league._id,
          level: playerData.level,
          status: 'active',
          registeredAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
          stats: {
            matchesPlayed: 0,
            matchesWon: 0,
            totalPoints: 0,
            setsWon: 0,
            setsLost: 0,
            gamesWon: 0,
            gamesLost: 0
          },
          matchHistory: []
        }],
        metadata: {
          source: 'demo',
          firstRegistrationDate: new Date()
        }
      })
      
      await player.save()
      createdPlayers.push(player)
      console.log(`   ✅ ${playerData.name} (${playerData.level})`)
    }
    
    // Link demo user to Carlos
    demoUser.playerId = createdPlayers[0]._id
    await demoUser.save()
    
    // =====================
    // Create demo matches
    // =====================
    
    console.log('\n📊 Creating demo matches...')
    
    const clubs = [
      'Club de Tenis Sotogrande',
      'La Reserva Club',
      'Real Club de Golf Sotogrande'
    ]
    
    const carlos = createdPlayers[0]
    
    // Create matches with dates spread over past 3 weeks
    for (let i = 0; i < DEMO_MATCHES.length; i++) {
      const matchData = DEMO_MATCHES[i]
      const opponent = createdPlayers[matchData.opponentIndex]
      
      // Calculate date (spread over past 3 weeks)
      const daysAgo = 21 - (i * 4)
      const matchDate = new Date()
      matchDate.setDate(matchDate.getDate() - daysAgo)
      
      // Determine player1 and player2 (Carlos is always player1 for simplicity)
      const player1 = carlos
      const player2 = opponent
      
      // Build score
      const score = matchData.score.map(set => ({
        player1: matchData.carlosWins ? set[0] : set[1],
        player2: matchData.carlosWins ? set[1] : set[0]
      }))
      
      // Calculate sets and games
      let p1Sets = 0, p2Sets = 0, p1Games = 0, p2Games = 0
      score.forEach(set => {
        if (set.player1 > set.player2) p1Sets++
        else p2Sets++
        p1Games += set.player1
        p2Games += set.player2
      })
      
      // Get current ELO ratings
      const p1Elo = player1.eloRating
      const p2Elo = player2.eloRating
      
      // Calculate ELO changes
      const p1Outcome = matchData.carlosWins ? 1 : 0
      const p2Outcome = 1 - p1Outcome
      const p1EloChange = calculateEloChange(p1Elo, p2Elo, p1Outcome)
      const p2EloChange = calculateEloChange(p2Elo, p1Elo, p2Outcome)
      
      const winner = matchData.carlosWins ? player1 : player2
      
      // Create match
      const match = new Match({
        league: league._id,
        season: `${league.season?.type || 'summer'}-${league.season?.year || 2025}`,
        round: i + 1,
        matchType: 'regular',
        players: {
          player1: player1._id,
          player2: player2._id
        },
        schedule: {
          confirmedDate: matchDate,
          club: clubs[i % clubs.length],
          court: 'Pista de Tenis',
          time: ['10:00', '11:30', '16:00', '17:30', '19:00'][i % 5]
        },
        result: {
          winner: winner._id,
          score: { sets: score },
          playedAt: matchDate
        },
        eloChanges: {
          player1: { before: p1Elo, after: p1Elo + p1EloChange, change: p1EloChange },
          player2: { before: p2Elo, after: p2Elo + p2EloChange, change: p2EloChange }
        },
        status: 'completed'
      })
      
      await match.save()
      
      // Update player1 (Carlos) stats
      const p1Points = calculatePoints(p1Sets, p2Sets)
      const p1Reg = player1.registrations[0]
      p1Reg.stats.matchesPlayed++
      if (matchData.carlosWins) p1Reg.stats.matchesWon++
      p1Reg.stats.totalPoints += p1Points
      p1Reg.stats.setsWon += p1Sets
      p1Reg.stats.setsLost += p2Sets
      p1Reg.stats.gamesWon += p1Games
      p1Reg.stats.gamesLost += p2Games
      p1Reg.matchHistory.push({
        match: match._id,
        opponent: player2._id,
        result: matchData.carlosWins ? 'won' : 'lost',
        score: score.map(s => `${s.player1}-${s.player2}`).join(', '),
        eloChange: p1EloChange,
        eloAfter: p1Elo + p1EloChange,
        round: i + 1,
        date: matchDate
      })
      
      // Update ELO
      player1.eloRating += p1EloChange
      if (player1.eloRating > player1.highestElo) player1.highestElo = player1.eloRating
      if (player1.eloRating < player1.lowestElo) player1.lowestElo = player1.eloRating
      
      await player1.save()
      
      // Update player2 (opponent) stats
      const p2Points = calculatePoints(p2Sets, p1Sets)
      const p2Reg = player2.registrations[0]
      p2Reg.stats.matchesPlayed++
      if (!matchData.carlosWins) p2Reg.stats.matchesWon++
      p2Reg.stats.totalPoints += p2Points
      p2Reg.stats.setsWon += p2Sets
      p2Reg.stats.setsLost += p1Sets
      p2Reg.stats.gamesWon += p2Games
      p2Reg.stats.gamesLost += p1Games
      p2Reg.matchHistory.push({
        match: match._id,
        opponent: player1._id,
        result: matchData.carlosWins ? 'lost' : 'won',
        score: score.map(s => `${s.player2}-${s.player1}`).join(', '),
        eloChange: p2EloChange,
        eloAfter: p2Elo + p2EloChange,
        round: i + 1,
        date: matchDate
      })
      
      // Update ELO
      player2.eloRating += p2EloChange
      if (player2.eloRating > player2.highestElo) player2.highestElo = player2.eloRating
      if (player2.eloRating < player2.lowestElo) player2.lowestElo = player2.eloRating
      
      await player2.save()
      
      const resultStr = matchData.carlosWins ? 'W' : 'L'
      const scoreStr = score.map(s => `${s.player1}-${s.player2}`).join(', ')
      console.log(`   ✅ R${i + 1}: Carlos vs ${opponent.name} - ${resultStr} (${scoreStr})`)
    }
    
    // =====================
    // Create upcoming matches for Carlos
    // =====================
    
    console.log('\n📅 Creating upcoming matches...')
    
    // Create 2 scheduled matches
    const upcomingOpponents = [createdPlayers[6], createdPlayers[7]] // Diego and Lucía
    
    for (let i = 0; i < upcomingOpponents.length; i++) {
      const opponent = upcomingOpponents[i]
      const daysUntil = 3 + (i * 4)
      const matchDate = new Date()
      matchDate.setDate(matchDate.getDate() + daysUntil)
      
      const deadline = new Date(matchDate)
      deadline.setDate(deadline.getDate() + 7)
      
      const match = new Match({
        league: league._id,
        season: `${league.season?.type || 'summer'}-${league.season?.year || 2025}`,
        round: DEMO_MATCHES.length + i + 1,
        matchType: 'regular',
        players: {
          player1: carlos._id,
          player2: opponent._id
        },
        schedule: {
          confirmedDate: matchDate,
          club: clubs[i % clubs.length],
          court: 'Pista de Tenis',
          courtNumber: String(i + 1),
          time: ['17:30', '19:00'][i % 2],
          deadline: deadline
        },
        status: 'scheduled'
      })
      
      await match.save()
      console.log(`   ✅ R${DEMO_MATCHES.length + i + 1}: Carlos vs ${opponent.name} (${matchDate.toLocaleDateString()})`)
    }
    
    // =====================
    // Summary
    // =====================
    
    // Reload Carlos to get final stats
    const finalCarlos = await Player.findById(carlos._id)
    const carlosReg = finalCarlos.registrations[0]
    
    console.log('\n' + '='.repeat(50))
    console.log('🎉 DEMO DATA CREATED SUCCESSFULLY!')
    console.log('='.repeat(50))
    console.log('\n📱 Demo Account:')
    console.log(`   Email: demo@tenisdp.es`)
    console.log(`   Password: demo123456`)
    console.log('\n📊 Carlos Martínez Stats:')
    console.log(`   ELO Rating: ${finalCarlos.eloRating}`)
    console.log(`   Matches: ${carlosReg.stats.matchesPlayed} played, ${carlosReg.stats.matchesWon} won`)
    console.log(`   Win Rate: ${Math.round(carlosReg.stats.matchesWon / carlosReg.stats.matchesPlayed * 100)}%`)
    console.log(`   Points: ${carlosReg.stats.totalPoints}`)
    console.log(`   Sets: ${carlosReg.stats.setsWon}W - ${carlosReg.stats.setsLost}L`)
    console.log('\n👥 All Demo Players:')
    
    for (const player of createdPlayers) {
      const reg = player.registrations[0]
      const stats = `${reg.stats.matchesPlayed}P ${reg.stats.matchesWon}W`
      console.log(`   ${player.name}: ELO ${player.eloRating} (${stats})`)
    }
    
    console.log('\n🔗 Login at: http://localhost:3000/es/login')
    console.log('   Dashboard: http://localhost:3000/es/player/dashboard')
    
  } catch (error) {
    console.error('❌ Error seeding demo data:', error)
  } finally {
    await mongoose.disconnect()
    console.log('\n👋 Disconnected from MongoDB')
    process.exit()
  }
}

// Run the script
seedDemoData()
