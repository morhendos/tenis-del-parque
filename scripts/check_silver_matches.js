const { MongoClient } = require('mongodb');

async function checkMatches() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/tenis-del-parque';
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    const db = client.db();
    
    // Find the Silver league for Sotogrande Winter 2026
    const league = await db.collection('leagues').findOne({
      slug: 'silver-league-sotogrande-winter-2026'
    });
    
    if (!league) {
      console.log('League not found');
      return;
    }
    
    console.log('League found:', league.name);
    console.log('League ID:', league._id);
    
    // Find matches for round 1
    const matches = await db.collection('matches').find({
      league: league._id,
      round: 1
    }).toArray();
    
    console.log('\nRound 1 matches:', matches.length);
    console.log('\nMatches:');
    matches.forEach((match, i) => {
      console.log(`${i + 1}. Match ID: ${match._id}, Status: ${match.status || 'scheduled'}, Player1: ${match.player1}, Player2: ${match.player2}`);
    });
    
  } finally {
    await client.close();
  }
}

checkMatches().catch(console.error);
