require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

async function checkPlayers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');
    
    const playersCollection = mongoose.connection.db.collection('players');
    
    // Search for player with Tomasz
    const tomaszPlayers = await playersCollection.find({ 
      name: /Tomasz/i 
    }).toArray();
    
    console.log(`Found ${tomaszPlayers.length} players with "Tomasz" in name:\n`);
    tomaszPlayers.forEach(p => {
      console.log(`  - ${p.name}`);
      console.log(`    Email: ${p.email}`);
      console.log(`    ID: ${p._id}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

checkPlayers();
