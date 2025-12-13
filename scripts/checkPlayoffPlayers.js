const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

async function checkPlayoffPlayers() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  const leagues = await mongoose.connection.db.collection('leagues').find({
    name: { $in: ['Liga de Sotogrande', 'Gold League', 'Silver League'] }
  }).toArray();
  
  const playerIds = new Set();
  leagues.forEach(l => {
    if (l.playoffConfig?.qualifiedPlayers?.groupA) {
      l.playoffConfig.qualifiedPlayers.groupA.forEach(qp => {
        if (qp.player) playerIds.add(qp.player.toString());
      });
    }
  });

  const players = await mongoose.connection.db.collection('players')
    .find({ _id: { $in: Array.from(playerIds).map(id => new mongoose.Types.ObjectId(id)) } })
    .toArray();
  
  const playerMap = {};
  players.forEach(p => { playerMap[p._id.toString()] = p.name; });
  
  leagues.forEach(l => {
    console.log(`\n${l.name} (${l.slug}):`);
    console.log(`  status: ${l.status}`);
    console.log(`  currentPhase: ${l.playoffConfig?.currentPhase}`);
    console.log(`  qualifiedPlayers.groupA:`);
    if (l.playoffConfig?.qualifiedPlayers?.groupA) {
      l.playoffConfig.qualifiedPlayers.groupA.slice(0, 5).forEach(qp => {
        console.log(`    Seed ${qp.seed}: ${playerMap[qp.player?.toString()] || 'Unknown'}`);
      });
      console.log(`    ... (${l.playoffConfig.qualifiedPlayers.groupA.length} total)`);
    } else {
      console.log('    (none)');
    }
  });
  
  await mongoose.disconnect();
}

checkPlayoffPlayers();
