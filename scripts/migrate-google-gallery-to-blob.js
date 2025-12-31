/**
 * Migrate Google Photos GALLERY to Vercel Blob Storage
 * 
 * This script fetches ALL photos from Google Places (not just the first one)
 * and populates the images.gallery array with permanent Blob URLs.
 * 
 * Usage: node scripts/migrate-google-gallery-to-blob.js [--dry-run] [--limit=5]
 */

const mongoose = require('mongoose');
const { put } = require('@vercel/blob');
require('dotenv').config({ path: '.env.local' });

// Ensure fetch is available (Node 18+ has it globally, but let's be safe)
const fetch = globalThis.fetch || require('node-fetch');

// Configuration
const DRY_RUN = process.argv.includes('--dry-run');
const LIMIT_ARG = process.argv.find(arg => arg.startsWith('--limit='));
const MAX_PHOTOS_PER_CLUB = LIMIT_ARG ? parseInt(LIMIT_ARG.split('=')[1]) : 10;

// Validate environment
function validateEnv() {
  const required = ['MONGODB_URI', 'GOOGLE_MAPS_API_KEY', 'BLOB_READ_WRITE_TOKEN'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.error('❌ Missing environment variables:', missing.join(', '));
    process.exit(1);
  }
  console.log('✅ Environment variables validated\n');
}

// Fetch all photo references from Google Places API
async function getPhotoReferences(googlePlaceId) {
  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${googlePlaceId}&fields=photos&key=${process.env.GOOGLE_MAPS_API_KEY}`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.status !== 'OK' || !data.result?.photos?.length) {
      return [];
    }
    
    return data.result.photos.map(p => p.photo_reference);
  } catch (error) {
    console.log(`  ❌ Error fetching place details: ${error.message}`);
    return [];
  }
}

// Download image from Google Photos API
async function downloadGooglePhoto(photoReference, maxWidth = 800) {
  const url = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxWidth}&photo_reference=${photoReference}&key=${process.env.GOOGLE_MAPS_API_KEY}`;
  
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
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

// Get file extension from content type
function getExtension(contentType) {
  if (contentType.includes('png')) return 'png';
  if (contentType.includes('webp')) return 'webp';
  return 'jpg';
}

// Process a single club's gallery
async function processClubGallery(club, collection) {
  console.log(`\n📍 ${club.name}`);
  
  // Skip if already has gallery images
  const existingGallery = club.images?.gallery?.filter(url => 
    url && !url.includes('photo_reference') && !url.includes('/api/')
  ) || [];
  
  if (existingGallery.length >= 3) {
    console.log(`   ✓ Already has ${existingGallery.length} gallery images`);
    return { status: 'skipped', reason: 'has_gallery' };
  }
  
  // Get fresh photo references from Google
  console.log(`   Fetching photos from Google Places...`);
  const photoRefs = await getPhotoReferences(club.googlePlaceId);
  
  if (photoRefs.length === 0) {
    console.log(`   ⚠️  No photos available from Google`);
    return { status: 'failed', reason: 'no_photos' };
  }
  
  console.log(`   ✓ Found ${photoRefs.length} photos`);
  
  // Skip the first one if we already have a main image (it's usually the same)
  const startIndex = club.images?.main ? 1 : 0;
  const photosToProcess = photoRefs.slice(startIndex, startIndex + MAX_PHOTOS_PER_CLUB);
  
  if (photosToProcess.length === 0) {
    console.log(`   ⚠️  No additional photos to process`);
    return { status: 'skipped', reason: 'no_additional' };
  }
  
  console.log(`   Processing ${photosToProcess.length} gallery photos...`);
  
  if (DRY_RUN) {
    console.log(`   🔍 DRY RUN - Would upload ${photosToProcess.length} photos`);
    return { status: 'dry_run', count: photosToProcess.length };
  }
  
  const galleryUrls = [...existingGallery]; // Keep existing valid URLs
  let successCount = 0;
  
  for (let i = 0; i < photosToProcess.length; i++) {
    const photoRef = photosToProcess[i];
    
    // Download
    const imageData = await downloadGooglePhoto(photoRef);
    if (!imageData) {
      console.log(`   ⚠️  Failed to download photo ${i + 1}`);
      continue;
    }
    
    // Upload to Blob
    const extension = getExtension(imageData.contentType);
    const timestamp = Date.now();
    const filename = `clubs/${club.slug}_gallery_${i + 1}_${timestamp}.${extension}`;
    
    const blobUrl = await uploadToBlob(imageData.buffer, filename, imageData.contentType);
    if (!blobUrl) {
      continue;
    }
    
    galleryUrls.push(blobUrl);
    successCount++;
    console.log(`   ✓ Photo ${i + 1}: ${(imageData.size / 1024).toFixed(0)} KB`);
    
    // Small delay to avoid rate limiting
    await new Promise(r => setTimeout(r, 300));
  }
  
  if (successCount === 0) {
    return { status: 'failed', reason: 'all_uploads_failed' };
  }
  
  // Update database
  await collection.updateOne(
    { _id: club._id },
    { 
      $set: { 
        'images.gallery': galleryUrls
      }
    }
  );
  
  console.log(`   ✅ Added ${successCount} photos to gallery`);
  return { status: 'success', count: successCount };
}

// Main function
async function migrate() {
  console.log('🖼️  Google Gallery Photos to Vercel Blob Migration\n');
  console.log('='.repeat(50));
  console.log(`Max photos per club: ${MAX_PHOTOS_PER_CLUB}`);
  
  if (DRY_RUN) {
    console.log('🔍 DRY RUN MODE - No changes will be made\n');
  }
  
  validateEnv();
  
  // Connect to MongoDB
  console.log('Connecting to MongoDB...');
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ Connected');
  
  const clubsCollection = mongoose.connection.collection('clubs');
  
  // Find clubs with Google Place ID
  const clubs = await clubsCollection.find({
    googlePlaceId: { $exists: true, $ne: null, $ne: '' }
  }).toArray();
  
  console.log(`\nFound ${clubs.length} clubs with Google Place ID\n`);
  console.log('='.repeat(50));
  
  const results = { success: 0, skipped: 0, failed: 0, photosAdded: 0 };
  
  for (const club of clubs) {
    const result = await processClubGallery(club, clubsCollection);
    
    if (result.status === 'success' || result.status === 'dry_run') {
      results.success++;
      results.photosAdded += result.count || 0;
    } else if (result.status === 'skipped') {
      results.skipped++;
    } else {
      results.failed++;
    }
    
    // Delay between clubs
    await new Promise(r => setTimeout(r, 500));
  }
  
  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('MIGRATION COMPLETE');
  console.log('='.repeat(50));
  console.log(`\n✅ Processed: ${results.success}`);
  console.log(`⏭️  Skipped: ${results.skipped}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`📸 Total photos added: ${results.photosAdded}`);
  
  await mongoose.disconnect();
  console.log('\n✅ Done!');
}

// Run
migrate().catch(error => {
  console.error('\n❌ Migration failed:', error);
  process.exit(1);
});
