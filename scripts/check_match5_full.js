require('dotenv').config();
const mongoose = require('mongoose');

async function checkMatch5() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const db = mongoose.connection.db;
    
    // Find the Silver league
    const league = await db.collection('leagues').findOne({
      slug: 'silver-league-sotogrande-winter-2026'
    });
    
    // Get match 5 (the scheduled one)
    const matches = await db.collection('matches').find({
      league: league._id,
      round: 1
    }).sort({ _id: 1 }).toArray();
    
    const match5 = matches[4]; // 5th match (0-indexed)
    
    console.log('📋 FULL MATCH 5 DOCUMENT:\n');
    console.log(JSON.stringify(match5, null, 2));
    
    await mongoose.connection.close();
    
  } catch (error) {
    console.error('Error:', error.message);
    await mongoose.connection.close();
  }
}

checkMatch5();
