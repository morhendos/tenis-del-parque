/**
 * Area-specific calculation utilities
 */

import { LEAGUE_POLYGONS, determineLeagueByLocation } from '@/lib/utils/geographicBoundaries'
import { isPointInPolygon } from './polygonHelpers'

/**
 * Generate a URL-safe slug from a name
 * @param {string} name - Name to convert to slug
 * @returns {string} URL-safe slug
 */
export const generateSlug = (name) => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * Generate a unique area ID
 * @param {string} prefix - Prefix for the ID (e.g., 'custom', 'league')
 * @returns {string} Unique ID
 */
export const generateAreaId = (prefix = 'area') => {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Calculate statistics for areas and clubs
 * @param {Array} clubs - Array of club objects
 * @param {Object} modifiedLeagues - Modified league boundaries
 * @returns {Object} Statistics object
 */
export const calculateAreaStats = (clubs, modifiedLeagues = {}) => {
  const stats = {
    totalClubs: clubs.length,
    byLeague: {},
    unassigned: 0
  }

  // Initialize league counters
  Object.keys(LEAGUE_POLYGONS).forEach(league => {
    stats.byLeague[league] = 0
  })

  // Count clubs per league
  clubs.forEach(club => {
    if (club.location?.coordinates?.lat && club.location?.coordinates?.lng) {
      const point = {
        lat: club.location.coordinates.lat,
        lng: club.location.coordinates.lng
      }
      
      // Check modified leagues first
      let assigned = false
      for (const [leagueId, modifiedArea] of Object.entries(modifiedLeagues)) {
        if (modifiedArea.bounds && isPointInPolygon(point, modifiedArea.bounds)) {
          stats.byLeague[leagueId]++
          assigned = true
          break
        }
      }
      
      // If not in modified area, check original leagues
      if (!assigned) {
        const league = determineLeagueByLocation(point.lat, point.lng)
        if (league) {
          stats.byLeague[league]++
        } else {
          stats.unassigned++
        }
      }
    }
  })

  return stats
}

/**
 * Get clubs within a specific area
 * @param {Array} clubs - Array of club objects
 * @param {Array} bounds - Area boundary coordinates
 * @returns {Array} Clubs within the area
 */
export const getClubsInArea = (clubs, bounds) => {
  if (!bounds || bounds.length < 3) return []
  
  return clubs.filter(club => {
    if (!club.location?.coordinates?.lat || !club.location?.coordinates?.lng) {
      return false
    }
    
    const point = {
      lat: club.location.coordinates.lat,
      lng: club.location.coordinates.lng
    }
    
    return isPointInPolygon(point, bounds)
  })
}

/**
 * Prepare area for saving to database
 * @param {Object} area - Area object
 * @param {string} type - Type of area ('custom' or 'modified')
 * @returns {Object} Prepared area object
 */
export const prepareAreaForSave = (area, type = 'custom') => {
  const prepared = {
    ...area,
    active: area.active !== undefined ? area.active : true
  }
  
  if (type === 'custom') {
    prepared.isCustom = true
    prepared.isModified = false
  } else if (type === 'modified') {
    prepared.isCustom = false
    prepared.isModified = true
  }
  
  // Ensure required fields
  if (!prepared.id) {
    prepared.id = generateAreaId(type)
  }
  if (!prepared.slug) {
    prepared.slug = generateSlug(prepared.name || `${type} Area`)
  }
  
  return prepared
}

/**
 * Validate area data
 * @param {Object} area - Area to validate
 * @returns {{valid: boolean, errors: Array<string>}} Validation result
 */
export const validateArea = (area) => {
  const errors = []
  
  if (!area.id) {
    errors.push('Area ID is required')
  }
  
  if (!area.name) {
    errors.push('Area name is required')
  }
  
  if (!area.slug) {
    errors.push('Area slug is required')
  }
  
  if (!area.bounds || !Array.isArray(area.bounds)) {
    errors.push('Area bounds must be an array')
  } else if (area.bounds.length < 3) {
    errors.push('Area must have at least 3 boundary points')
  }
  
  if (!area.center || typeof area.center.lat !== 'number' || typeof area.center.lng !== 'number') {
    errors.push('Area center coordinates are required')
  }
  
  if (!area.color) {
    errors.push('Area color is required')
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * Get display name for an area
 * @param {Object} area - Area object
 * @param {string} leagueId - League ID for modified areas
 * @returns {string} Display name
 */
export const getAreaDisplayName = (area, leagueId = null) => {
  if (area.name) return area.name
  
  if (leagueId && LEAGUE_POLYGONS[leagueId]) {
    return `${LEAGUE_POLYGONS[leagueId].name} (Modified)`
  }
  
  if (area.isCustom) {
    return `Custom Area ${area.id.split('_')[1] || ''}`
  }
  
  return 'Unnamed Area'
}

/**
 * Get color for an area
 * @param {Object} area - Area object
 * @param {string} leagueId - League ID for modified areas
 * @param {Array} colorPalette - Available colors for custom areas
 * @param {number} index - Index for color selection
 * @returns {string} Hex color code
 */
export const getAreaColor = (area, leagueId = null, colorPalette = [], index = 0) => {
  // Use area's own color if available
  if (area.color) return area.color
  
  // Use league color for modified leagues
  if (leagueId && LEAGUE_POLYGONS[leagueId]) {
    return LEAGUE_POLYGONS[leagueId].color
  }
  
  // Use palette color for custom areas
  if (colorPalette.length > 0) {
    return colorPalette[index % colorPalette.length]
  }
  
  // Default color
  return '#8B5CF6'
}

/**
 * Sort areas by type and name
 * @param {Array} areas - Array of areas
 * @returns {Array} Sorted areas
 */
export const sortAreas = (areas) => {
  return areas.sort((a, b) => {
    // Modified leagues first
    if (a.isModified && !b.isModified) return -1
    if (!a.isModified && b.isModified) return 1
    
    // Then custom areas
    if (a.isCustom && !b.isCustom) return 1
    if (!a.isCustom && b.isCustom) return -1
    
    // Finally by name
    return (a.name || '').localeCompare(b.name || '')
  })
}
