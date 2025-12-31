/**
 * Migrate Google Photos to Vercel Blob Storage
 * 
 * This script:
 * 1. Finds all clubs/cities with googlePlaceId
 * 2. Fetches fresh photo from Google Places API
 * 3. Downloads the actual image
 * 4. Uploads to Vercel Blob
 * 5. Updates the database with permanent URL
 * 
 * Usage: node scripts/migrate-google-photos-to-blob.js [--dry-run] [--clubs-only] [--cities-only]
 */

const mongoose = require('mongoose');
const { put } = require('@vercel/blob');
require('dotenv').config({ path: '.env.local' });

// Configuration
const DRY_RUN = process.argv.includes('--dry-run');
const CLUBS_ONLY = process.argv.includes('--clubs-only');
const CITIES_ONLY = process.argv.includes('--cities-only');

// Validate environment
function validateEnv() {
  const required = ['MONGODB_URI', 'GOOGLE_MAPS_API_KEY', 'BLOB_READ_WRITE_TOKEN'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.error('❌ Missing environment variables:', missing.join(', '));
    console.error('\nMake sure these are set in .env.local');
    process.exit(1);
  }
  
  console.log('✅ Environment variables validated\n');
}

// Fetch fresh photo reference from Google Places API
async function getFreshPhotoReference(googlePlaceId, name) {
  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${googlePlaceId}&fields=photos&key=${process.env.GOOGLE_MAPS_API_KEY}`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.status !== 'OK') {
      console.log(`  ⚠️  Google API status: ${data.status}`);
      return null;
    }
    
    if (!data.result?.photos?.length) {
      console.log(`  ⚠️  No photos found in Google Places`);
      return null;
    }
    
    // Return the first (best) photo reference
    return data.result.photos[0].photo_reference;
  } catch (error) {
    console.log(`  ❌ Error fetching place details: ${error.message}`);
    return null;
  }
}

// Download image from Google Photos API
async function downloadGooglePhoto(photoReference, maxWidth = 800) {
  const url = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxWidth}&photo_reference=${photoReference}&key=${process.env.GOOGLE_MAPS_API_KEY}`;
  
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      console.log(`  ❌ Photo download failed: ${response.status}`);
      return null;
    }
    
    const contentType = response.headers.get('content-type') || 'image/jpeg';
    const buffer = await response.arrayBuffer();
    
    return {
      buffer: Buffer.from(buffer),
      contentType,
      size: buffer.byteLength
    };
  } catch (error) {
    console.log(`  ❌ Error downloading photo: ${error.message}`);
    return null;
  }
}

// Upload to Vercel Blob
async function uploadToBlob(buffer, filename, contentType) {
  try {
    const blob = await put(filename, buffer, {
      access: 'public',
      contentType,
      addRandomSuffix: false
    });
    
    return blob.url;
  } catch (error) {
    console.log(`  ❌ Blob upload failed: ${error.message}`);
    return null;
  }
}

// Generate filename
function generateFilename(type, slug, extension = 'jpg') {
  const timestamp = Date.now();
  return `${type}/${slug}_google_${timestamp}.${extension}`;
}

// Get file extension from content type
function getExtension(contentType) {
  if (contentType.includes('png')) return 'png';
  if (contentType.includes('webp')) return 'webp';
  return 'jpg';
}

// Process a single club
async function processClub(club, collection) {
  console.log(`\n📍 ${club.name}`);
  console.log(`   Place ID: ${club.googlePlaceId}`);
  
  // Skip if already has a main image that's not a Google photo reference
  if (club.images?.main && !club.images.main.includes('photo_reference') && !club.images.main.includes('/api/')) {
    console.log(`   ✓ Already has main image: ${club.images.main.substring(0, 50)}...`);
    return { status: 'skipped', reason: 'has_image' };
  }
  
  // Get fresh photo reference
  console.log(`   Fetching fresh photo from Google...`);
  const photoRef = await getFreshPhotoReference(club.googlePlaceId, club.name);
  
  if (!photoRef) {
    return { status: 'failed', reason: 'no_photo_ref' };
  }
  
  console.log(`   ✓ Got photo reference`);
  
  // Download the image
  console.log(`   Downloading image...`);
  const imageData = await downloadGooglePhoto(photoRef);
  
  if (!imageData) {
    return { status: 'failed', reason: 'download_failed' };
  }
  
  console.log(`   ✓ Downloaded ${(imageData.size / 1024).toFixed(1)} KB`);
  
  if (DRY_RUN) {
    console.log(`   🔍 DRY RUN - Would upload to Vercel Blob`);
    return { status: 'dry_run', reason: 'success' };
  }
  
  // Upload to Blob
  const extension = getExtension(imageData.contentType);
  const filename = generateFilename('clubs', club.slug, extension);
  
  console.log(`   Uploading to Vercel Blob...`);
  const blobUrl = await uploadToBlob(imageData.buffer, filename, imageData.contentType);
  
  if (!blobUrl) {
    return { status: 'failed', reason: 'upload_failed' };
  }
  
  console.log(`   ✓ Uploaded: ${blobUrl}`);
  
  // Update database
  console.log(`   Updating database...`);
  await collection.updateOne(
    { _id: club._id },
    { 
      $set: { 
        'images.main': blobUrl,
        'images.googlePhotoReference': '' // Clear the old reference
      }
    }
  );
  
  console.log(`   ✅ SUCCESS!`);
  return { status: 'success', url: blobUrl };
}

// Process a single city
async function processCity(city, collection) {
  console.log(`\n🏙️  ${city.name?.en || city.slug}`);
  console.log(`   Place ID: ${city.googlePlaceId}`);
  
  // Skip if already has a main image that's not a Google photo reference
  if (city.images?.main && !city.images.main.includes('photo_reference') && !city.images.main.includes('/api/')) {
    console.log(`   ✓ Already has main image: ${city.images.main.substring(0, 50)}...`);
    return { status: 'skipped', reason: 'has_image' };
  }
  
  // Get fresh photo reference
  console.log(`   Fetching fresh photo from Google...`);
  const photoRef = await getFreshPhotoReference(city.googlePlaceId, city.name?.en);
  
  if (!photoRef) {
    return { status: 'failed', reason: 'no_photo_ref' };
  }
  
  console.log(`   ✓ Got photo reference`);
  
  // Download the image
  console.log(`   Downloading image...`);
  const imageData = await downloadGooglePhoto(photoRef);
  
  if (!imageData) {
    return { status: 'failed', reason: 'download_failed' };
  }
  
  console.log(`   ✓ Downloaded ${(imageData.size / 1024).toFixed(1)} KB`);
  
  if (DRY_RUN) {
    console.log(`   🔍 DRY RUN - Would upload to Vercel Blob`);
    return { status: 'dry_run', reason: 'success' };
  }
  
  // Upload to Blob
  const extension = getExtension(imageData.contentType);
  const filename = generateFilename('cities', city.slug, extension);
  
  console.log(`   Uploading to Vercel Blob...`);
  const blobUrl = await uploadToBlob(imageData.buffer, filename, imageData.contentType);
  
  if (!blobUrl) {
    return { status: 'failed', reason: 'upload_failed' };
  }
  
  console.log(`   ✓ Uploaded: ${blobUrl}`);
  
  // Update database
  console.log(`   Updating database...`);
  await collection.updateOne(
    { _id: city._id },
    { 
      $set: { 
        'images.main': blobUrl,
        'images.googlePhotoReference': '' // Clear the old reference
      }
    }
  );
  
  console.log(`   ✅ SUCCESS!`);
  return { status: 'success', url: blobUrl };
}

// Main function
async function migrate() {
  console.log('🚀 Google Photos to Vercel Blob Migration\n');
  console.log('='.repeat(50));
  
  if (DRY_RUN) {
    console.log('🔍 DRY RUN MODE - No changes will be made\n');
  }
  
  validateEnv();
  
  // Connect to MongoDB
  console.log('Connecting to MongoDB...');
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ Connected\n');
  
  const clubsCollection = mongoose.connection.collection('clubs');
  const citiesCollection = mongoose.connection.collection('cities');
  
  const results = {
    clubs: { success: 0, skipped: 0, failed: 0 },
    cities: { success: 0, skipped: 0, failed: 0 }
  };
  
  // Process clubs
  if (!CITIES_ONLY) {
    console.log('\n' + '='.repeat(50));
    console.log('PROCESSING CLUBS');
    console.log('='.repeat(50));
    
    const clubs = await clubsCollection.find({
      googlePlaceId: { $exists: true, $ne: null, $ne: '' }
    }).toArray();
    
    console.log(`Found ${clubs.length} clubs with Google Place ID`);
    
    for (const club of clubs) {
      const result = await processClub(club, clubsCollection);
      
      if (result.status === 'success' || result.status === 'dry_run') {
        results.clubs.success++;
      } else if (result.status === 'skipped') {
        results.clubs.skipped++;
      } else {
        results.clubs.failed++;
      }
      
      // Small delay to avoid rate limiting
      await new Promise(r => setTimeout(r, 500));
    }
  }
  
  // Process cities
  if (!CLUBS_ONLY) {
    console.log('\n' + '='.repeat(50));
    console.log('PROCESSING CITIES');
    console.log('='.repeat(50));
    
    const cities = await citiesCollection.find({
      googlePlaceId: { $exists: true, $ne: null, $ne: '' }
    }).toArray();
    
    console.log(`Found ${cities.length} cities with Google Place ID`);
    
    for (const city of cities) {
      const result = await processCity(city, citiesCollection);
      
      if (result.status === 'success' || result.status === 'dry_run') {
        results.cities.success++;
      } else if (result.status === 'skipped') {
        results.cities.skipped++;
      } else {
        results.cities.failed++;
      }
      
      // Small delay to avoid rate limiting
      await new Promise(r => setTimeout(r, 500));
    }
  }
  
  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('MIGRATION COMPLETE');
  console.log('='.repeat(50));
  console.log('\nClubs:');
  console.log(`  ✅ Success: ${results.clubs.success}`);
  console.log(`  ⏭️  Skipped: ${results.clubs.skipped}`);
  console.log(`  ❌ Failed: ${results.clubs.failed}`);
  console.log('\nCities:');
  console.log(`  ✅ Success: ${results.cities.success}`);
  console.log(`  ⏭️  Skipped: ${results.cities.skipped}`);
  console.log(`  ❌ Failed: ${results.cities.failed}`);
  
  await mongoose.disconnect();
  console.log('\n✅ Done!');
}

// Run
migrate().catch(error => {
  console.error('\n❌ Migration failed:', error);
  process.exit(1);
});
