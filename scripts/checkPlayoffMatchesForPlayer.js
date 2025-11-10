require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

async function checkPlayoffMatches() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');
    
    // Get raw collections
    const matchesCollection = mongoose.connection.db.collection('matches');
    const playersCollection = mongoose.connection.db.collection('players');
    
    // Find all playoff matches
    const playoffMatches = await matchesCollection.find({ matchType: 'playoff' }).toArray();
    
    console.log(`📊 Found ${playoffMatches.length} playoff matches\n`);
    
    // Get all players for mapping
    const players = await playersCollection.find({}).toArray();
    const playerMap = new Map();
    players.forEach(p => playerMap.set(p._id.toString(), p));
    
    playoffMatches.forEach((match, index) => {
      const player1 = playerMap.get(match.players.player1.toString());
      const player2 = playerMap.get(match.players.player2.toString());
      
      console.log(`Match ${index + 1}:`);
      console.log(`  ID: ${match._id}`);
      console.log(`  Player 1: ${player1?.name || 'Unknown'} (${match.players.player1})`);
      console.log(`  Player 2: ${player2?.name || 'Unknown'} (${match.players.player2})`);
      console.log(`  Status: ${match.status}`);
      console.log(`  Round: ${match.round}`);
      console.log(`  Stage: ${match.playoffInfo?.stage}`);
      console.log(`  Result: ${match.result?.winner ? 'Completed' : 'Pending'}`);
      console.log('');
    });
    
    // Check if there are any matches for your email
    console.log('🔍 Checking matches for your account...\n');
    const yourPlayer = await playersCollection.findOne({ email: 'tomasz.mikolajewicz@gmail.com' });
    
    if (yourPlayer) {
      console.log(`Found your player: ${yourPlayer.name} (${yourPlayer._id})\n`);
      
      const yourPlayoffMatches = playoffMatches.filter(m => 
        m.players.player1.toString() === yourPlayer._id.toString() ||
        m.players.player2.toString() === yourPlayer._id.toString()
      );
      
      console.log(`You have ${yourPlayoffMatches.length} playoff matches`);
      yourPlayoffMatches.forEach((match, index) => {
        const opponentId = match.players.player1.toString() === yourPlayer._id.toString()
          ? match.players.player2
          : match.players.player1;
        const opponent = playerMap.get(opponentId.toString());
        console.log(`  ${index + 1}. vs ${opponent?.name} - Status: ${match.status} - Stage: ${match.playoffInfo?.stage}`);
      });
      
      // Also check all your matches (regular + playoff)
      console.log(`\n🎾 All your matches (regular + playoff):\n`);
      const allYourMatches = await matchesCollection.find({
        $or: [
          { 'players.player1': yourPlayer._id },
          { 'players.player2': yourPlayer._id }
        ]
      }).toArray();
      
      console.log(`Total matches: ${allYourMatches.length}`);
      const regularMatches = allYourMatches.filter(m => m.matchType !== 'playoff');
      const playoffMatchesForYou = allYourMatches.filter(m => m.matchType === 'playoff');
      
      console.log(`  Regular: ${regularMatches.length}`);
      console.log(`  Playoff: ${playoffMatchesForYou.length}`);
      
      console.log(`\n📋 Your upcoming matches (status === 'scheduled' && no winner):\n`);
      const upcomingMatches = allYourMatches.filter(m => m.status === 'scheduled' && !m.result?.winner);
      console.log(`Total upcoming: ${upcomingMatches.length}`);
      upcomingMatches.forEach((match, index) => {
        const opponentId = match.players.player1.toString() === yourPlayer._id.toString()
          ? match.players.player2
          : match.players.player1;
        const opponent = playerMap.get(opponentId.toString());
        console.log(`  ${index + 1}. vs ${opponent?.name} - Type: ${match.matchType || 'regular'} - Round: ${match.round} - Status: ${match.status}`);
      });
      
    } else {
      console.log('❌ Could not find your player account');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

checkPlayoffMatches();
