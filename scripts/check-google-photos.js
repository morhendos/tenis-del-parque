// Script to check Google photo_references in database
const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

async function checkGooglePhotos() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB\n');
    
    const Club = mongoose.connection.collection('clubs');
    const City = mongoose.connection.collection('cities');
    
    // Check clubs
    const clubsWithPhotos = await Club.find({
      $or: [
        { 'images.googlePhotoReference': { $exists: true, $ne: '', $ne: null } },
        { 'googleData.photos.0': { $exists: true } }
      ]
    }).project({
      name: 1,
      'images.googlePhotoReference': 1,
      'googleData.photos': { $slice: 2 }
    }).toArray();
    
    console.log(`=== CLUBS with Google Photos: ${clubsWithPhotos.length} ===`);
    
    const photoRefs = [];
    
    for (const club of clubsWithPhotos.slice(0, 5)) {
      const ref = club.images?.googlePhotoReference || club.googleData?.photos?.[0]?.photo_reference;
      console.log(`\nClub: ${club.name}`);
      console.log(`  Ref: ${ref ? ref.substring(0, 60) + '...' : 'none'}`);
      if (ref) photoRefs.push({ name: club.name, ref });
    }
    
    // Check cities
    const citiesWithPhotos = await City.find({
      $or: [
        { 'images.googlePhotoReference': { $exists: true, $ne: '', $ne: null } },
        { 'googleData.photos.0': { $exists: true } }
      ]
    }).project({
      'name.en': 1,
      'images.googlePhotoReference': 1,
      'googleData.photos': { $slice: 2 }
    }).toArray();
    
    console.log(`\n\n=== CITIES with Google Photos: ${citiesWithPhotos.length} ===`);
    
    for (const city of citiesWithPhotos.slice(0, 5)) {
      const ref = city.images?.googlePhotoReference || city.googleData?.photos?.[0]?.photo_reference;
      console.log(`\nCity: ${city.name?.en}`);
      console.log(`  Ref: ${ref ? ref.substring(0, 60) + '...' : 'none'}`);
      if (ref) photoRefs.push({ name: city.name?.en, ref });
    }
    
    // Test if any photo_references still work
    if (photoRefs.length > 0 && process.env.GOOGLE_MAPS_API_KEY) {
      console.log('\n\n=== TESTING PHOTO REFERENCES ===');
      
      for (const { name, ref } of photoRefs.slice(0, 3)) {
        const url = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${ref}&key=${process.env.GOOGLE_MAPS_API_KEY}`;
        
        try {
          const response = await fetch(url, { method: 'HEAD' });
          const status = response.ok ? '✅ WORKS' : `❌ FAILED (${response.status})`;
          console.log(`\n${name}: ${status}`);
        } catch (err) {
          console.log(`\n${name}: ❌ ERROR - ${err.message}`);
        }
      }
    } else {
      console.log('\n\nNo photo refs to test or missing API key');
    }
    
    await mongoose.disconnect();
    console.log('\n\nDone!');
    
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkGooglePhotos();
