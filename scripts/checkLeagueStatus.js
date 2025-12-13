const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

async function checkLeagues() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  const leagues = await mongoose.connection.db.collection('leagues').find({}, {
    projection: { name: 1, slug: 1, status: 1, 'playoffConfig.enabled': 1, 'playoffConfig.currentPhase': 1 }
  }).toArray();
  
  console.log('All leagues status:');
  leagues.forEach(l => {
    console.log(`  ${l.name}:`);
    console.log(`    slug: ${l.slug}`);
    console.log(`    status: "${l.status}" (type: ${typeof l.status})`);
    console.log(`    playoffConfig.enabled: ${l.playoffConfig?.enabled}`);
    console.log(`    playoffConfig.currentPhase: ${l.playoffConfig?.currentPhase}`);
    console.log('');
  });
  
  await mongoose.disconnect();
}

checkLeagues();
