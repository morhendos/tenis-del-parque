const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: '.env.local' });

// Define schemas inline
const CitySchema = new mongoose.Schema({
  name: {
    es: String,
    en: String
  },
  slug: String,
  status: String
}, { timestamps: true });

const LeagueSchema = new mongoose.Schema({
  name: String,
  slug: String,
  skillLevel: String,
  season: {
    year: Number,
    type: String
  },
  city: { type: mongoose.Schema.Types.ObjectId, ref: 'City' },
  status: String,
  stats: {
    registeredPlayers: Number
  }
}, { timestamps: true });

const PlayerSchema = new mongoose.Schema({
  name: String,
  email: String,
  registrations: [{
    league: { type: mongoose.Schema.Types.ObjectId, ref: 'League' },
    status: String,
    level: String,
    registeredAt: Date
  }]
}, { timestamps: true });

const City = mongoose.models.City || mongoose.model('City', CitySchema);
const League = mongoose.models.League || mongoose.model('League', LeagueSchema);
const Player = mongoose.models.Player || mongoose.model('Player', PlayerSchema);

async function checkSotograndePlayers() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Find all Sotogrande leagues
    console.log('🔍 Finding Sotogrande leagues...');
    const leagues = await League.find({
      $or: [
        { slug: { $regex: 'sotogrande', $options: 'i' } },
        { name: { $regex: 'Sotogrande', $options: 'i' } }
      ]
    }).populate('city');

    console.log(`Found ${leagues.length} Sotogrande league(s):\n`);

    for (const league of leagues) {
      console.log('📋 League Details:');
      console.log(`  - Name: ${league.name}`);
      console.log(`  - Slug: ${league.slug}`);
      console.log(`  - Skill Level: ${league.skillLevel}`);
      console.log(`  - Season: ${league.season?.type} ${league.season?.year}`);
      console.log(`  - Status: ${league.status}`);
      console.log(`  - Stored Player Count: ${league.stats?.registeredPlayers || 0}`);

      // Count actual players
      const activePlayerCount = await Player.countDocuments({
        'registrations': {
          $elemMatch: {
            league: league._id,
            status: { $in: ['confirmed', 'active'] }
          }
        }
      });

      const allPlayerCount = await Player.countDocuments({
        'registrations.league': league._id
      });

      console.log(`  - Actual Active Players (confirmed/active): ${activePlayerCount}`);
      console.log(`  - Total Registered Players (all statuses): ${allPlayerCount}\n`);

      // Get player details
      if (allPlayerCount > 0) {
        const players = await Player.find({
          'registrations.league': league._id
        }).select('name email registrations');

        console.log('  Players:');
        players.forEach((player, index) => {
          const registration = player.registrations.find(
            reg => reg.league.toString() === league._id.toString()
          );
          console.log(`    ${index + 1}. ${player.name} (${player.email})`);
          console.log(`       Status: ${registration?.status}, Level: ${registration?.level}`);
        });
        console.log('');
      }

      console.log('─'.repeat(60) + '\n');
    }

    // Summary
    console.log('📊 Summary:');
    console.log(`Total Leagues Found: ${leagues.length}`);
    console.log(`Total Players across all Sotogrande leagues: ${
      await Player.countDocuments({
        'registrations.league': { $in: leagues.map(l => l._id) }
      })
    }`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
  }
}

// Run the check
checkSotograndePlayers();
