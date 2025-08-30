/**
 * Shared utility for loading area boundaries (both static and modified)
 * Used by both admin and public APIs to ensure consistency
 */

import Area from '@/lib/models/Area'
import dbConnect from '@/lib/db/mongoose'
import { LEAGUE_POLYGONS, isPointInPolygon } from './geographicBoundaries'

/**
 * Load all area boundaries (static + modified) from database
 * Returns combined boundaries that should be used for club assignment
 */
export async function loadAreaBoundaries() {
  try {
    await dbConnect()
    
    // Load modified areas from database
    const areas = await Area.find({ active: true }).lean()
    
    // Start with static boundaries
    const combinedBoundaries = { ...LEAGUE_POLYGONS }
    
    // Override with any modified league boundaries
    const modifiedLeagues = {}
    const customAreas = []
    
    areas.forEach(area => {
      if (area.originalLeagueId) {
        // This is a modified league boundary - override the static one
        combinedBoundaries[area.originalLeagueId] = {
          bounds: area.bounds,
          color: area.color,
          name: area.name,
          center: area.center,
          isModified: true
        }
        modifiedLeagues[area.originalLeagueId] = area
      } else if (area.isCustom) {
        // This is a custom area - add it as new
        combinedBoundaries[area.slug] = {
          bounds: area.bounds,
          color: area.color,
          name: area.name,
          center: area.center,
          isCustom: true
        }
        customAreas.push(area)
      }
    })
    
    console.log('🗺️ Loaded area boundaries:', {
      total: Object.keys(combinedBoundaries).length,
      static: Object.keys(LEAGUE_POLYGONS).length,
      modified: Object.keys(modifiedLeagues).length,
      custom: customAreas.length
    })
    
    return {
      boundaries: combinedBoundaries,
      modifiedLeagues,
      customAreas
    }
  } catch (error) {
    console.error('Error loading area boundaries:', error)
    // Fallback to static boundaries
    return {
      boundaries: LEAGUE_POLYGONS,
      modifiedLeagues: {},
      customAreas: []
    }
  }
}

/**
 * Determine which league/area a club belongs to using current boundaries
 * Uses modified boundaries if available, falls back to static boundaries
 */
export async function determineClubLeague(lat, lng) {
  if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
    return null
  }

  const { boundaries } = await loadAreaBoundaries()
  
  // Check all boundaries (modified + static + custom)
  for (const [leagueId, data] of Object.entries(boundaries)) {
    if (isPointInPolygon(lat, lng, data.bounds)) {
      return leagueId
    }
  }
  
  return null // Outside all boundaries
}

/**
 * Enhanced club assignment with current area boundaries
 * This replaces the static enhanceClubWithLeague function
 */
export async function enhanceClubWithCurrentLeague(club) {
  const enhancedClub = { ...club }
  
  if (club.location?.coordinates?.lat && club.location?.coordinates?.lng) {
    const league = await determineClubLeague(
      club.location.coordinates.lat,
      club.location.coordinates.lng
    )
    
    if (league) {
      enhancedClub.league = league
    }
  }
  
  return enhancedClub
}

/**
 * Get area statistics using current boundaries
 * Used by both admin and public APIs for consistency
 */
export async function calculateCurrentAreaStats(clubs) {
  const { boundaries } = await loadAreaBoundaries()
  
  const stats = {
    totalClubs: clubs.length,
    byLeague: {},
    unassigned: 0
  }

  // Initialize counters for all areas
  Object.keys(boundaries).forEach(league => {
    stats.byLeague[league] = 0
  })

  // Count clubs per area using current boundaries
  for (const club of clubs) {
    if (club.location?.coordinates?.lat && club.location?.coordinates?.lng) {
      const league = await determineClubLeague(
        club.location.coordinates.lat,
        club.location.coordinates.lng
      )
      
      if (league && stats.byLeague[league] !== undefined) {
        stats.byLeague[league]++
      } else {
        stats.unassigned++
      }
    } else {
      stats.unassigned++
    }
  }

  return stats
}

/**
 * Get clubs in a specific area using current boundaries
 */
export async function getClubsInCurrentArea(clubs, areaId) {
  const { boundaries } = await loadAreaBoundaries()
  const areaBounds = boundaries[areaId]
  
  if (!areaBounds || !areaBounds.bounds) {
    return []
  }
  
  return clubs.filter(club => {
    if (!club.location?.coordinates?.lat || !club.location?.coordinates?.lng) {
      return false
    }
    
    return isPointInPolygon(
      club.location.coordinates.lat,
      club.location.coordinates.lng,
      areaBounds.bounds
    )
  })
}
