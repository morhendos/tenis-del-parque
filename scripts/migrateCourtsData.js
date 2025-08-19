// Migration script to convert legacy courts data to new structure
import mongoose from 'mongoose'
import dbConnect from '../lib/db/mongoose.js'
import Club from '../lib/models/Club.js'

async function migrateCourtsData() {
  try {
    await dbConnect()
    console.log('Connected to database')
    
    // Find all clubs with legacy courts data
    const clubs = await Club.find({
      $or: [
        { 'courts.total': { $gt: 0 } },
        { 'courts.surfaces': { $exists: true, $ne: [] } }
      ],
      'courts.tennis': { $exists: false }
    })
    
    console.log(`Found ${clubs.length} clubs to migrate`)
    
    for (const club of clubs) {
      console.log(`\nMigrating: ${club.name}`)
      
      // Check if it's padel courts based on surfaces
      const hasPadel = club.courts.surfaces?.some(s => s.type === 'padel')
      
      if (hasPadel) {
        // Migrate to padel courts
        const padelSurfaces = club.courts.surfaces
          .filter(s => s.type === 'padel')
          .map(s => ({
            type: 'synthetic', // Default padel surface
            count: s.count
          }))
        
        const padelTotal = padelSurfaces.reduce((sum, s) => sum + s.count, 0)
        
        club.courts.padel = {
          total: padelTotal,
          indoor: club.courts.indoor || 0,
          outdoor: club.courts.outdoor || 0,
          surfaces: padelSurfaces
        }
        
        // Check for tennis courts too
        const tennisSurfaces = club.courts.surfaces
          .filter(s => s.type !== 'padel')
        
        if (tennisSurfaces.length > 0) {
          const tennisTotal = tennisSurfaces.reduce((sum, s) => sum + s.count, 0)
          club.courts.tennis = {
            total: tennisTotal,
            indoor: 0, // We can't determine this from legacy data
            outdoor: tennisTotal,
            surfaces: tennisSurfaces
          }
        }
        
        console.log(`  - Migrated to ${padelTotal} padel courts`)
      } else {
        // Migrate to tennis courts (default)
        club.courts.tennis = {
          total: club.courts.total || 0,
          indoor: club.courts.indoor || 0,
          outdoor: club.courts.outdoor || 0,
          surfaces: club.courts.surfaces || []
        }
        console.log(`  - Migrated to ${club.courts.total} tennis courts`)
      }
      
      // Initialize empty sections for other court types
      if (!club.courts.padel) {
        club.courts.padel = {
          total: 0,
          indoor: 0,
          outdoor: 0,
          surfaces: []
        }
      }
      
      club.courts.pickleball = {
        total: 0,
        indoor: 0,
        outdoor: 0,
        surfaces: []
      }
      
      // Clear legacy fields
      club.courts.total = 0
      club.courts.indoor = 0
      club.courts.outdoor = 0
      club.courts.surfaces = []
      
      // Save the updated club
      await club.save()
      console.log(`  ✓ Migration complete`)
    }
    
    console.log('\n✅ Migration completed successfully!')
    process.exit(0)
  } catch (error) {
    console.error('Migration failed:', error)
    process.exit(1)
  }
}

// Run migration
migrateCourtsData()
