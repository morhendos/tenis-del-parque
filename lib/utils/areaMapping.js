/**
 * ⚠️ LEGACY FILE - DEPRECATED ⚠️
 * 
 * This file has been completely removed in favor of GPS-based 
 * league assignments from geographicBoundaries.js
 * 
 * All area/city mappings are now determined dynamically using:
 * - GPS coordinates of clubs
 * - Polygon boundaries defined in geographicBoundaries.js
 * - Real-time league assignment functions
 * 
 * No hardcoded mappings should be used anywhere in the system.
 * 
 * For area/city functionality, use:
 * - determineLeagueByLocationWithFallback() from geographicBoundaries.js
 * - LEAGUE_NAMES and LEAGUE_POLYGONS from geographicBoundaries.js
 * - Dynamic area detection based on club GPS coordinates
 */

console.error('❌ REMOVED: lib/utils/areaMapping.js has been completely removed.')
console.error('   Use GPS-based functions from /lib/utils/geographicBoundaries.js instead.')
console.error('   No hardcoded city/area mappings should be used.')

// Throw error to prevent usage
throw new Error('areaMapping.js has been removed. Use GPS-based geographicBoundaries.js instead.')

export default {}
