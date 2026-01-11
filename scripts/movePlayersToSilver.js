/**
 * Script to move players from Bronze League Sotogrande to Silver League Sotogrande
 * 
 * Usage: node scripts/movePlayersToSilver.js
 * 
 * This script will:
 * 1. Find the Bronze and Silver leagues for Sotogrande
 * 2. Find the two players (Carolina Jiménez and Fofi SM)
 * 3. Move their registrations from Bronze to Silver
 */

const mongoose = require('mongoose')
require('dotenv').config({ path: '.env.local' })

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI not found in .env.local')
  process.exit(1)
}

// Define schemas inline for script usage
const LeagueSchema = new mongoose.Schema({
  name: String,
  slug: String,
  skillLevel: String,
  city: { type: mongoose.Schema.Types.ObjectId, ref: 'City' },
  location: {
    city: String,
    region: String,
    country: String
  },
  status: String,
  season: {
    year: Number,
    type: String
  },
  stats: {
    registeredPlayers: Number
  }
}, { collection: 'leagues' })

const PlayerSchema = new mongoose.Schema({
  name: String,
  email: String,
  whatsapp: String,
  eloRating: Number,
  registrations: [{
    league: { type: mongoose.Schema.Types.ObjectId, ref: 'League' },
    level: String,
    status: String,
    registeredAt: Date,
    stats: {
      matchesPlayed: Number,
      matchesWon: Number,
      totalPoints: Number,
      setsWon: Number,
      setsLost: Number,
      gamesWon: Number,
      gamesLost: Number
    }
  }]
}, { collection: 'players' })

const League = mongoose.model('League', LeagueSchema)
const Player = mongoose.model('Player', PlayerSchema)

async function main() {
  try {
    console.log('🔌 Connecting to MongoDB...')
    await mongoose.connect(MONGODB_URI)
    console.log('✅ Connected to MongoDB\n')

    // Step 1: Find Sotogrande leagues
    console.log('📋 Finding Sotogrande leagues...\n')
    const sotograndeLeagues = await League.find({
      $or: [
        { 'location.city': { $regex: /sotogrande/i } },
        { name: { $regex: /sotogrande/i } }
      ]
    }).sort({ skillLevel: 1 })

    console.log(`Found ${sotograndeLeagues.length} Sotogrande leagues:`)
    sotograndeLeagues.forEach(l => {
      console.log(`  - ${l.name} (${l.slug})`)
      console.log(`    Skill Level: ${l.skillLevel}`)
      console.log(`    Status: ${l.status}`)
      console.log(`    Registered Players: ${l.stats?.registeredPlayers || 0}`)
      console.log(`    ID: ${l._id}`)
      console.log('')
    })

    // Find Bronze and Silver leagues
    const bronzeLeague = sotograndeLeagues.find(l => 
      l.name.toLowerCase().includes('bronze') || 
      l.slug.toLowerCase().includes('bronze') ||
      l.skillLevel === 'beginner'
    )
    
    const silverLeague = sotograndeLeagues.find(l => 
      l.name.toLowerCase().includes('silver') || 
      l.slug.toLowerCase().includes('silver') ||
      l.skillLevel === 'intermediate'
    )

    if (!bronzeLeague) {
      console.log('❌ Bronze League Sotogrande not found!')
      console.log('\nAvailable leagues:')
      sotograndeLeagues.forEach(l => console.log(`  - ${l.name} (skillLevel: ${l.skillLevel})`))
      process.exit(1)
    }

    if (!silverLeague) {
      console.log('❌ Silver League Sotogrande not found!')
      console.log('\nAvailable leagues:')
      sotograndeLeagues.forEach(l => console.log(`  - ${l.name} (skillLevel: ${l.skillLevel})`))
      process.exit(1)
    }

    console.log('🥉 Bronze League:', bronzeLeague.name, `(${bronzeLeague._id})`)
    console.log('🥈 Silver League:', silverLeague.name, `(${silverLeague._id})\n`)

    // Step 2: Find the two players
    const playerEmails = ['cabe988@gmail.com', 'adosermon@gmail.com']
    
    console.log('👥 Finding players to move...\n')
    const players = await Player.find({
      email: { $in: playerEmails }
    })

    if (players.length === 0) {
      console.log('❌ No players found with those emails')
      process.exit(1)
    }

    console.log(`Found ${players.length} players:`)
    players.forEach(p => {
      console.log(`  - ${p.name} (${p.email})`)
      console.log(`    ELO: ${p.eloRating}`)
      console.log(`    Registrations:`)
      p.registrations.forEach(reg => {
        const leagueName = sotograndeLeagues.find(l => l._id.toString() === reg.league.toString())?.name || reg.league
        console.log(`      - ${leagueName} (${reg.status}, level: ${reg.level})`)
      })
      console.log('')
    })

    // Step 3: Move players from Bronze to Silver
    console.log('\n🔄 Moving players from Bronze to Silver...\n')

    for (const player of players) {
      // Find their Bronze registration
      const bronzeRegIndex = player.registrations.findIndex(
        reg => reg.league.toString() === bronzeLeague._id.toString()
      )

      if (bronzeRegIndex === -1) {
        console.log(`⚠️  ${player.name} is not registered in Bronze League`)
        continue
      }

      // Check if already in Silver
      const alreadyInSilver = player.registrations.some(
        reg => reg.league.toString() === silverLeague._id.toString()
      )

      if (alreadyInSilver) {
        console.log(`⚠️  ${player.name} is already registered in Silver League`)
        continue
      }

      // Move registration: change the league reference
      const bronzeReg = player.registrations[bronzeRegIndex]
      
      // Update the league reference to Silver
      player.registrations[bronzeRegIndex].league = silverLeague._id
      
      // Keep their level as intermediate (appropriate for Silver)
      player.registrations[bronzeRegIndex].level = 'intermediate'

      await player.save()
      console.log(`✅ Moved ${player.name} from Bronze to Silver`)
      console.log(`   - Previous league: ${bronzeLeague.name}`)
      console.log(`   - New league: ${silverLeague.name}`)
      console.log(`   - Status: ${bronzeReg.status}`)
      console.log(`   - Level: intermediate`)
    }

    // Step 4: Update league player counts
    console.log('\n📊 Updating league player counts...')

    // Recalculate Bronze count
    const bronzePlayerCount = await Player.countDocuments({
      'registrations': {
        $elemMatch: {
          league: bronzeLeague._id,
          status: { $in: ['pending', 'confirmed', 'active'] }
        }
      }
    })

    await League.findByIdAndUpdate(bronzeLeague._id, {
      'stats.registeredPlayers': bronzePlayerCount
    })
    console.log(`  Bronze League: ${bronzePlayerCount} players`)

    // Recalculate Silver count
    const silverPlayerCount = await Player.countDocuments({
      'registrations': {
        $elemMatch: {
          league: silverLeague._id,
          status: { $in: ['pending', 'confirmed', 'active'] }
        }
      }
    })

    await League.findByIdAndUpdate(silverLeague._id, {
      'stats.registeredPlayers': silverPlayerCount
    })
    console.log(`  Silver League: ${silverPlayerCount} players`)

    console.log('\n✅ Done!')

  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  } finally {
    await mongoose.disconnect()
    console.log('\n🔌 Disconnected from MongoDB')
  }
}

main()
