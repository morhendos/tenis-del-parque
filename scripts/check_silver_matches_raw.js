require('dotenv').config();
const mongoose = require('mongoose');

async function checkMatches() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const db = mongoose.connection.db;
    
    // Find the Silver league for Sotogrande Winter 2026
    const league = await db.collection('leagues').findOne({
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
    
    // Find matches for round 1 and show raw structure
    const matches = await db.collection('matches').find({
      league: league._id,
      round: 1
    }).toArray();
    
    console.log('\n📊 Round 1 matches:', matches.length);
    
    if (matches.length > 0) {
      console.log('\nFirst match structure (to see field names):');
      console.log(JSON.stringify(matches[0], null, 2));
      
      console.log('\n\nAll matches summary:');
      matches.forEach((match, i) => {
        console.log(`\n${i + 1}. Match ID: ${match._id}`);
        console.log(`   Status: ${match.status || 'scheduled'}`);
        console.log(`   Round: ${match.round}`);
        console.log(`   Players field exists: ${match.players ? 'YES' : 'NO'}`);
        console.log(`   Players: ${JSON.stringify(match.players || null)}`);
        console.log(`   HomePlayer: ${match.homePlayer || 'N/A'}`);
        console.log(`   AwayPlayer: ${match.awayPlayer || 'N/A'}`);
      });
    }
    
    await mongoose.connection.close();
    
  } catch (error) {
    console.error('Error:', error.message);
    await mongoose.connection.close();
  }
}

checkMatches();
