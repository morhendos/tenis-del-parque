require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

async function checkSemifinals() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');
    
    const matchesCollection = mongoose.connection.db.collection('matches');
    const playersCollection = mongoose.connection.db.collection('players');
    
    // Get all playoff matches
    const allPlayoffMatches = await matchesCollection.find({ 
      matchType: 'playoff' 
    }).sort({ 'playoffInfo.stage': 1, 'playoffInfo.matchNumber': 1 }).toArray();
    
    // Get player names
    const players = await playersCollection.find({}).toArray();
    const playerMap = new Map();
    players.forEach(p => playerMap.set(p._id.toString(), p));
    
    // Group by stage
    const stages = {
      quarterfinal: [],
      semifinal: [],
      final: [],
      third_place: []
    };
    
    allPlayoffMatches.forEach(m => {
      const stage = m.playoffInfo?.stage;
      if (stages[stage]) {
        stages[stage].push(m);
      }
    });
    
    console.log('📊 PLAYOFF MATCHES STATUS:\n');
    
    // Quarterfinals
    console.log('🎾 QUARTERFINALS:');
    stages.quarterfinal.forEach((match, i) => {
      const p1 = playerMap.get(match.players.player1.toString());
      const p2 = playerMap.get(match.players.player2.toString());
      const winner = match.result?.winner ? playerMap.get(match.result.winner.toString()) : null;
      console.log(`  QF${i + 1}: ${p1?.name} vs ${p2?.name}`);
      console.log(`        Winner: ${winner?.name || 'TBD'} - Status: ${match.status}`);
    });
    
    console.log('\n');
    
    // Semifinals
    if (stages.semifinal.length > 0) {
      console.log('🏆 SEMIFINALS (✅ CREATED!):');
      stages.semifinal.forEach((match, i) => {
        const p1 = playerMap.get(match.players.player1.toString());
        const p2 = playerMap.get(match.players.player2.toString());
        const winner = match.result?.winner ? playerMap.get(match.result.winner.toString()) : null;
        console.log(`  SF${i + 1}: ${p1?.name} vs ${p2?.name}`);
        console.log(`        Match ID: ${match._id}`);
        console.log(`        Winner: ${winner?.name || 'TBD'} - Status: ${match.status}`);
      });
    } else {
      console.log('❌ SEMIFINALS: NOT CREATED YET');
    }
    
    console.log('\n');
    
    // Finals
    if (stages.final.length > 0) {
      console.log('🥇 FINAL:');
      stages.final.forEach((match) => {
        const p1 = playerMap.get(match.players.player1.toString());
        const p2 = playerMap.get(match.players.player2.toString());
        console.log(`  ${p1?.name} vs ${p2?.name}`);
        console.log(`  Status: ${match.status}`);
      });
    }
    
    if (stages.third_place.length > 0) {
      console.log('\n🥉 THIRD PLACE:');
      stages.third_place.forEach((match) => {
        const p1 = playerMap.get(match.players.player1.toString());
        const p2 = playerMap.get(match.players.player2.toString());
        console.log(`  ${p1?.name} vs ${p2?.name}`);
        console.log(`  Status: ${match.status}`);
      });
    }
    
    console.log('\n');
    console.log('=' .repeat(60));
    console.log(`TOTAL PLAYOFF MATCHES: ${allPlayoffMatches.length}`);
    console.log(`  Quarterfinals: ${stages.quarterfinal.length}/4`);
    console.log(`  Semifinals: ${stages.semifinal.length}/2 ${stages.semifinal.length === 2 ? '✅' : '❌'}`);
    console.log(`  Final: ${stages.final.length}/1`);
    console.log(`  Third Place: ${stages.third_place.length}/1`);
    console.log('=' .repeat(60));
    
    if (stages.semifinal.length === 2) {
      console.log('\n✅ SUCCESS! Semifinals have been created!');
      console.log('\nYou should now see your semifinal match at:');
      console.log('http://localhost:3000/en/player/matches');
    } else {
      console.log('\n⏳ Semifinals not created yet. Try editing a QF match from admin panel.');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

checkSemifinals();
