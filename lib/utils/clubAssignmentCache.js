/**
 * Club Assignment Cache System
 * Precomputes and caches GPS-based league assignments for performance
 */

import Club from '@/lib/models/Club'
import dbConnect from '@/lib/db/mongoose'
import { loadAreaBoundaries, determineClubLeague } from './areaLoader'

/**
 * Recalculate and cache league assignments for all clubs
 * This should be called whenever area boundaries are modified
 */
export async function recalculateAllClubAssignments() {
  console.log('🔄 Starting club assignment recalculation...')
  
  try {
    await dbConnect()
    
    // Get all clubs with coordinates
    const clubs = await Club.find({
      'location.coordinates.lat': { $exists: true, $ne: null },
      'location.coordinates.lng': { $exists: true, $ne: null }
    }).select('_id name location.coordinates assignedLeague')
    
    console.log(`📍 Found ${clubs.length} clubs with GPS coordinates`)
    
    let updated = 0
    let unchanged = 0
    const startTime = Date.now()
    
    // Process clubs in batches for better performance
    const batchSize = 10
    for (let i = 0; i < clubs.length; i += batchSize) {
      const batch = clubs.slice(i, i + batchSize)
      
      const updates = await Promise.all(
        batch.map(async (club) => {
          try {
            const newAssignment = await determineClubLeague(
              club.location.coordinates.lat,
              club.location.coordinates.lng
            )
            
            // Only update if assignment changed
            if (newAssignment !== club.assignedLeague) {
              await Club.findByIdAndUpdate(club._id, {
                assignedLeague: newAssignment,
                leagueAssignedAt: new Date()
              })
              
              console.log(`  ✅ ${club.name}: ${club.assignedLeague || 'null'} → ${newAssignment || 'null'}`)
              return { updated: true, club: club.name, from: club.assignedLeague, to: newAssignment }
            } else {
              return { updated: false }
            }
          } catch (error) {
            console.error(`  ❌ Error processing ${club.name}:`, error.message)
            return { updated: false, error: error.message }
          }
        })
      )
      
      updated += updates.filter(u => u.updated).length
      unchanged += updates.filter(u => !u.updated && !u.error).length
    }
    
    const duration = Date.now() - startTime
    
    console.log('🎉 Club assignment recalculation complete!')
    console.log(`  ✅ Updated: ${updated} clubs`)
    console.log(`  ➡️  Unchanged: ${unchanged} clubs`)
    console.log(`  ⏱️  Duration: ${duration}ms`)
    
    return {
      success: true,
      totalClubs: clubs.length,
      updated,
      unchanged,
      duration
    }
    
  } catch (error) {
    console.error('❌ Error in club assignment recalculation:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * Recalculate assignment for a single club
 * Useful when adding/updating individual clubs
 */
export async function recalculateClubAssignment(clubId) {
  try {
    await dbConnect()
    
    const club = await Club.findById(clubId).select('name location.coordinates')
    if (!club) {
      throw new Error('Club not found')
    }
    
    if (!club.location?.coordinates?.lat || !club.location?.coordinates?.lng) {
      throw new Error('Club missing GPS coordinates')
    }
    
    const newAssignment = await determineClubLeague(
      club.location.coordinates.lat,
      club.location.coordinates.lng
    )
    
    await Club.findByIdAndUpdate(clubId, {
      assignedLeague: newAssignment,
      leagueAssignedAt: new Date()
    })
    
    console.log(`✅ Updated ${club.name}: assigned to ${newAssignment || 'none'}`)
    
    return {
      success: true,
      clubName: club.name,
      assignment: newAssignment
    }
    
  } catch (error) {
    console.error('❌ Error recalculating club assignment:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * Get clubs by cached league assignment (fast!)
 */
export async function getClubsByLeague(league) {
  await dbConnect()
  
  return Club.find({
    assignedLeague: league,
    status: 'active'
  }).sort({ featured: -1, displayOrder: 1, name: 1 })
}

/**
 * Get league statistics from cached assignments (fast!)
 */
export async function getCachedLeagueStats() {
  await dbConnect()
  
  const stats = await Club.aggregate([
    { $match: { status: 'active' } },
    {
      $group: {
        _id: '$assignedLeague',
        count: { $sum: 1 }
      }
    }
  ])
  
  const result = {}
  stats.forEach(({ _id, count }) => {
    if (_id) { // Only include assigned leagues
      result[_id] = count
    }
  })
  
  return result
}

/**
 * Check if club assignments need updating
 * Returns clubs that haven't been assigned or were assigned before the last area update
 */
export async function getOutdatedAssignments(lastAreaUpdate = null) {
  await dbConnect()
  
  const query = {
    'location.coordinates.lat': { $exists: true, $ne: null },
    'location.coordinates.lng': { $exists: true, $ne: null },
    $or: [
      { assignedLeague: { $exists: false } },
      { assignedLeague: null },
      { leagueAssignedAt: { $exists: false } },
      { leagueAssignedAt: null }
    ]
  }
  
  if (lastAreaUpdate) {
    query.$or.push({ leagueAssignedAt: { $lt: lastAreaUpdate } })
  }
  
  return Club.find(query).select('_id name assignedLeague leagueAssignedAt')
}
