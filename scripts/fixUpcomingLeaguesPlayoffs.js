const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

async function fixUpcomingLeaguesPlayoffs() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  // Find leagues that are upcoming (registration_open or coming_soon) but have playoff data
  const upcomingLeaguesWithBadPlayoffs = await mongoose.connection.db.collection('leagues').find({
    status: { $in: ['registration_open', 'coming_soon'] },
    'playoffConfig.currentPhase': { $ne: 'regular_season', $exists: true }
  }).toArray();
  
  console.log(`Found ${upcomingLeaguesWithBadPlayoffs.length} upcoming leagues with incorrect playoff config:\n`);
  
  for (const league of upcomingLeaguesWithBadPlayoffs) {
    console.log(`Fixing: ${league.name} (${league.slug})`);
    console.log(`  Current phase: ${league.playoffConfig?.currentPhase} -> regular_season`);
    console.log(`  Clearing qualified players and bracket data...`);
    
    await mongoose.connection.db.collection('leagues').updateOne(
      { _id: league._id },
      {
        $set: {
          'playoffConfig.currentPhase': 'regular_season',
          'playoffConfig.qualifiedPlayers': { groupA: [], groupB: [] },
          'playoffConfig.bracket': { groupA: null, groupB: null }
        }
      }
    );
    
    console.log(`  ✓ Fixed\n`);
  }
  
  console.log('Done!');
  await mongoose.disconnect();
}

fixUpcomingLeaguesPlayoffs();
