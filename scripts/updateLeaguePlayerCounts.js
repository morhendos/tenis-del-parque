const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: '.env.local' });

async function updateLeaguePlayerCounts() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const db = mongoose.connection.db;
    const leaguesCollection = db.collection('leagues');
    const playersCollection = db.collection('players');

    console.log('🔍 Finding all leagues...');
    const leagues = await leaguesCollection.find({}).toArray();
    console.log(`Found ${leagues.length} league(s)\n`);

    let updatedCount = 0;

    for (const league of leagues) {
      // Count active/confirmed players
      const activePlayerCount = await playersCollection.countDocuments({
        'registrations': {
          $elemMatch: {
            league: league._id,
            status: { $in: ['confirmed', 'active'] }
          }
        }
      });

      // Count all registered players (any status)
      const totalPlayerCount = await playersCollection.countDocuments({
        'registrations.league': league._id
      });

      const oldCount = league.stats?.registeredPlayers;
      const oldTotal = league.stats?.totalPlayers;

      // Update the league stats directly
      await leaguesCollection.updateOne(
        { _id: league._id },
        {
          $set: {
            'stats.registeredPlayers': activePlayerCount,
            'stats.totalPlayers': totalPlayerCount
          }
        }
      );

      updatedCount++;

      console.log(`✅ Updated: ${league.name} (${league.slug})`);
      console.log(`   Old registered: ${oldCount} → New: ${activePlayerCount}`);
      console.log(`   Old total: ${oldTotal} → New: ${totalPlayerCount}`);
      console.log('');
    }

    console.log('─'.repeat(60));
    console.log(`\n✅ Successfully updated ${updatedCount} league(s)!`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
  }
}

// Run the update
updateLeaguePlayerCounts();
