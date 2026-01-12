const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

async function checkPlayoffPhase() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  const League = mongoose.model('League', new mongoose.Schema({}, { strict: false }));
  
  const leagues = await League.find({}, 'name status playoffConfig.currentPhase').lean();
  
  console.log('\n=== League Status & Playoff Phase ===\n');
  leagues.forEach(league => {
    console.log(`${league.name}:`);
    console.log(`  Status: ${league.status}`);
    console.log(`  Playoff Phase: ${league.playoffConfig?.currentPhase || 'not set'}`);
    console.log('');
  });
  
  await mongoose.disconnect();
}

checkPlayoffPhase().catch(console.error);
