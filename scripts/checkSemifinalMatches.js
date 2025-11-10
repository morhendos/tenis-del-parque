require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

async function checkSemifinalMatches() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');
    
    const matchesCollection = mongoose.connection.db.collection('matches');
    const playersCollection = mongoose.connection.db.collection('players');
    const leaguesCollection = mongoose.connection.db.collection('leagues');
    
    // Find your player
    const yourPlayer = await playersCollection.findOne({ email: 'tomasz@skilling.com' });
    console.log(`Your player: ${yourPlayer.name} (${yourPlayer._id})\n`);
    
    // Get all playoff matches
    const allPlayoffMatches = await matchesCollection.find({ 
      matchType: 'playoff' 
    }).toArray();
    
    console.log(`📊 Total playoff matches: ${allPlayoffMatches.length}\n`);
    
    // Group by stage
    const byStage = {};
    allPlayoffMatches.forEach(m => {
      const stage = m.playoffInfo?.stage || 'unknown';
      if (!byStage[stage]) byStage[stage] = [];
      byStage[stage].push(m);
    });
    
    console.log('Matches by stage:');
    Object.keys(byStage).forEach(stage => {
      console.log(`  ${stage}: ${byStage[stage].length} matches`);
    });
    console.log('');
    
    // Check quarterfinal winners
    const quarterfinals = allPlayoffMatches.filter(m => m.playoffInfo?.stage === 'quarterfinal');
    console.log('🏆 Quarterfinal Results:\n');
    
    const playerMap = new Map();
    const players = await playersCollection.find({}).toArray();
    players.forEach(p => playerMap.set(p._id.toString(), p));
    
    quarterfinals.forEach((match, index) => {
      const player1 = playerMap.get(match.players.player1.toString());
      const player2 = playerMap.get(match.players.player2.toString());
      const winner = match.result?.winner ? playerMap.get(match.result.winner.toString()) : null;
      
      console.log(`  QF${index + 1}: ${player1?.name} vs ${player2?.name}`);
      console.log(`       Winner: ${winner?.name || 'TBD'}`);
      console.log(`       Status: ${match.status}`);
      console.log('');
    });
    
    // Check for semifinal matches
    const semifinals = allPlayoffMatches.filter(m => m.playoffInfo?.stage === 'semifinal');
    console.log(`\n🎾 Semifinal matches found: ${semifinals.length}\n`);
    
    if (semifinals.length === 0) {
      console.log('❌ NO SEMIFINAL MATCHES EXIST IN DATABASE!\n');
      console.log('This is why your next match is not showing up.\n');
      console.log('Semifinals need to be created in the admin panel.\n');
      
      // Check league playoff config
      const league = await leaguesCollection.findOne({ 
        'playoffConfig.enabled': true 
      });
      
      if (league) {
        console.log(`League: ${league.name}`);
        console.log(`Current Phase: ${league.playoffConfig?.currentPhase}`);
        console.log(`\nPlayoff Config:`);
        console.log(JSON.stringify(league.playoffConfig, null, 2));
      }
    } else {
      semifinals.forEach((match, index) => {
        const player1 = playerMap.get(match.players.player1.toString());
        const player2 = playerMap.get(match.players.player2.toString());
        console.log(`  SF${index + 1}: ${player1?.name} vs ${player2?.name}`);
        console.log(`       Status: ${match.status}`);
        console.log('');
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

checkSemifinalMatches();
