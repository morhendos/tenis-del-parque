require('dotenv').config();
const mongoose = require('mongoose');

async function checkMatchScheduling() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const db = mongoose.connection.db;
    
    // Find the Silver league
    const league = await db.collection('leagues').findOne({
      slug: 'silver-league-sotogrande-winter-2026'
    });
    
    if (!league) {
      console.log('League not found');
      await mongoose.connection.close();
      return;
    }
    
    console.log('✅ League:', league.name?.es || league.name);
    
    // Find all round 1 matches
    const matches = await db.collection('matches').find({
      league: league._id,
      round: 1
    }).toArray();
    
    console.log('\n📊 Total Round 1 matches:', matches.length);
    
    // Check for ANY scheduling-related fields
    console.log('\n🔍 Checking for scheduling information:\n');
    
    matches.forEach((match, i) => {
      console.log(`Match ${i + 1}:`);
      console.log(`  - scheduledDate: ${match.scheduledDate || 'NOT SET'}`);
      console.log(`  - matchDate: ${match.matchDate || 'NOT SET'}`);
      console.log(`  - date: ${match.date || 'NOT SET'}`);
      console.log(`  - time: ${match.time || 'NOT SET'}`);
      console.log(`  - venue: ${match.venue ? JSON.stringify(match.venue) : 'NOT SET'}`);
      console.log(`  - schedule.proposedDates: ${match.schedule?.proposedDates?.length || 0} dates`);
      console.log(`  - schedule.confirmedDate: ${match.schedule?.confirmedDate || 'NOT SET'}`);
      console.log(`  - schedule.deadline: ${match.schedule?.deadline || 'NOT SET'}`);
      
      // Show if ANY scheduling field is set
      const hasScheduling = match.scheduledDate || match.matchDate || match.date || 
                           match.venue || (match.schedule?.proposedDates?.length > 0) ||
                           match.schedule?.confirmedDate;
      console.log(`  ✅ HAS SCHEDULING: ${hasScheduling ? 'YES' : 'NO'}\n`);
    });
    
    await mongoose.connection.close();
    
  } catch (error) {
    console.error('Error:', error.message);
    await mongoose.connection.close();
  }
}

checkMatchScheduling();
