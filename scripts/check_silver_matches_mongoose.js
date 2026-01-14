require('dotenv').config();
const mongoose = require('mongoose');

async function checkMatches() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const League = mongoose.model('League', new mongoose.Schema({}, { strict: false, collection: 'leagues' }));
    const Match = mongoose.model('Match', new mongoose.Schema({}, { strict: false, collection: 'matches' }));
    
    // Find the Silver league for Sotogrande Winter 2026
    const league = await League.findOne({
      slug: 'silver-league-sotogrande-winter-2026'
    });
    
    if (!league) {
      console.log('League not found');
      await mongoose.connection.close();
      return;
    }
    
    console.log('✅ League found:', league.name?.es || league.name);
    console.log('League ID:', league._id);
    console.log('Status:', league.status);
    
    // Find matches for round 1
    const matches = await Match.find({
      league: league._id,
      round: 1
    });
    
    console.log('\n📊 Round 1 matches:', matches.length);
    
    if (matches.length > 0) {
      console.log('\nMatch details:');
      matches.forEach((match, i) => {
        console.log(`${i + 1}. Status: ${match.status || 'scheduled'}`);
        console.log(`   Player1: ${match.player1}`);
        console.log(`   Player2: ${match.player2}`);
        console.log(`   Venue: ${match.venue?.name || 'Not set'}`);
        console.log('');
      });
    }
    
    await mongoose.connection.close();
    
  } catch (error) {
    console.error('Error:', error.message);
    await mongoose.connection.close();
  }
}

checkMatches();
