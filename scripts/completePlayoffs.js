const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

async function completePlayoffs() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  const League = mongoose.model('League', new mongoose.Schema({}, { strict: false }));
  
  // Find Liga de Sotogrande
  const league = await League.findOne({ name: /Liga de Sotogrande/i });
  
  if (!league) {
    console.log('Liga de Sotogrande not found');
    await mongoose.disconnect();
    return;
  }
  
  console.log('\nBefore update:');
  console.log(`  Name: ${league.name}`);
  console.log(`  Status: ${league.status}`);
  console.log(`  Playoff Phase: ${league.playoffConfig?.currentPhase || 'not set'}`);
  
  // Update playoff phase to completed
  await League.updateOne(
    { _id: league._id },
    { 
      $set: { 
        'playoffConfig.currentPhase': 'completed',
        'status': 'completed'
      } 
    }
  );
  
  // Verify the update
  const updated = await League.findById(league._id);
  console.log('\nAfter update:');
  console.log(`  Status: ${updated.status}`);
  console.log(`  Playoff Phase: ${updated.playoffConfig?.currentPhase}`);
  console.log('\n✅ Liga de Sotogrande playoffs marked as completed!');
  
  await mongoose.disconnect();
}

completePlayoffs().catch(console.error);
