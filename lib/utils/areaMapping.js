/**
 * Geographic Area Mapping Utilities
 * 
 * This replaces the legacy hardcoded area mapping system with dynamic
 * GPS-based league assignments from geographicBoundaries.js
 * 
 * This file provides backward compatibility for components that still
 * reference area mapping functions while transitioning to the new system.
 */

import { LEAGUE_NAMES, LEAGUE_POLYGONS } from '@/lib/utils/geographicBoundaries'

// City to league mapping for backward compatibility
export const CITY_TO_LEAGUE_MAPPING = {
  'marbella': 'marbella',
  'malaga': 'malaga', 
  'estepona': 'estepona',
  'sotogrande': 'sotogrande'
}

// League to city mapping (reverse)
export const LEAGUE_TO_CITY_MAPPING = {
  'marbella': 'marbella',
  'malaga': 'malaga',
  'estepona': 'estepona', 
  'sotogrande': 'sotogrande'
}

// Area display names (now using league names)
export const AREA_DISPLAY_NAMES = LEAGUE_NAMES

// City display names  
export const CITY_DISPLAY_NAMES = {
  'marbella': 'Marbella',
  'malaga': 'Málaga',
  'estepona': 'Estepona',
  'sotogrande': 'Sotogrande'
}

// Legacy mapping for compatibility - maps cities to their league areas
export const CITY_AREAS_MAPPING = {
  'marbella': ['marbella'],
  'malaga': ['malaga'],
  'estepona': ['estepona'], 
  'sotogrande': ['sotogrande']
}

/**
 * Get available areas (leagues) for a city
 * @param {string} citySlug - The city slug
 * @returns {string[]} Array of area/league identifiers
 */
export function getAreasForCity(citySlug) {
  if (!citySlug) return []
  
  const league = CITY_TO_LEAGUE_MAPPING[citySlug.toLowerCase()]
  return league ? [league] : []
}

/**
 * Get city for a given area/league
 * @param {string} area - The area/league identifier  
 * @returns {string|null} City slug or null
 */
export function getCityForArea(area) {
  return LEAGUE_TO_CITY_MAPPING[area] || null
}

/**
 * Check if an area belongs to a city
 * @param {string} citySlug - The city slug
 * @param {string} area - The area identifier
 * @returns {boolean} True if area belongs to city
 */
export function areaInCity(citySlug, area) {
  const cityAreas = getAreasForCity(citySlug)
  return cityAreas.includes(area)
}

/**
 * Get display name for area
 * @param {string} area - The area identifier
 * @returns {string} Display name
 */
export function getAreaDisplayName(area) {
  return AREA_DISPLAY_NAMES[area] || area
}

/**
 * Get all available cities
 * @returns {Object} Object with city info
 */
export function getAllCities() {
  return Object.keys(CITY_TO_LEAGUE_MAPPING).map(city => ({
    slug: city,
    name: CITY_DISPLAY_NAMES[city] || city,
    league: CITY_TO_LEAGUE_MAPPING[city],
    areas: getAreasForCity(city)
  }))
}

// Log deprecation warning when this file is imported
console.warn('⚠️  DEPRECATION: Area mapping utilities are being transitioned to GPS-based league assignments.')
console.warn('   Consider using functions from /lib/utils/geographicBoundaries.js for new code.')

export default {
  CITY_TO_LEAGUE_MAPPING,
  LEAGUE_TO_CITY_MAPPING,
  AREA_DISPLAY_NAMES,
  CITY_DISPLAY_NAMES,
  CITY_AREAS_MAPPING,
  getAreasForCity,
  getCityForArea,
  areaInCity,
  getAreaDisplayName,
  getAllCities
}
