/**
 * Polygon calculation utilities for the areas map editor
 */

/**
 * Calculate the geographic center of a polygon
 * @param {Array<{lat: number, lng: number}>} bounds - Array of coordinates
 * @returns {{lat: number, lng: number}} Center point
 */
export const calculatePolygonCenter = (bounds) => {
  if (!bounds || bounds.length === 0) {
    return { lat: 0, lng: 0 }
  }
  
  let latSum = 0
  let lngSum = 0
  
  bounds.forEach(point => {
    latSum += point.lat
    lngSum += point.lng
  })
  
  return {
    lat: latSum / bounds.length,
    lng: lngSum / bounds.length
  }
}

/**
 * Convert Google Maps polygon path to bounds array
 * @param {google.maps.MVCArray} path - Google Maps path
 * @returns {Array<{lat: number, lng: number}>} Bounds array
 */
export const pathToBounds = (path) => {
  const bounds = []
  
  for (let i = 0; i < path.getLength(); i++) {
    const point = path.getAt(i)
    bounds.push({ lat: point.lat(), lng: point.lng() })
  }
  
  return bounds
}

/**
 * Calculate the area of a polygon using the Shoelace formula
 * @param {Array<{lat: number, lng: number}>} bounds - Array of coordinates
 * @returns {number} Area in square kilometers
 */
export const calculatePolygonArea = (bounds) => {
  if (!bounds || bounds.length < 3) return 0
  
  const R = 6371 // Earth's radius in km
  let area = 0
  
  for (let i = 0; i < bounds.length; i++) {
    const j = (i + 1) % bounds.length
    
    const lat1 = bounds[i].lat * Math.PI / 180
    const lat2 = bounds[j].lat * Math.PI / 180
    const lng1 = bounds[i].lng * Math.PI / 180
    const lng2 = bounds[j].lng * Math.PI / 180
    
    area += lng2 * Math.sin(lat1) - lng1 * Math.sin(lat2)
  }
  
  area = Math.abs(area * R * R / 2)
  return Math.round(area * 100) / 100 // Round to 2 decimal places
}

/**
 * Check if a point is inside a polygon using ray casting algorithm
 * @param {{lat: number, lng: number}} point - Point to check
 * @param {Array<{lat: number, lng: number}>} polygon - Polygon bounds
 * @returns {boolean} True if point is inside polygon
 */
export const isPointInPolygon = (point, polygon) => {
  if (!point || !polygon || polygon.length < 3) return false
  
  const x = point.lng
  const y = point.lat
  let inside = false
  
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].lng
    const yi = polygon[i].lat
    const xj = polygon[j].lng
    const yj = polygon[j].lat
    
    const intersect = ((yi > y) !== (yj > y)) &&
      (x < (xj - xi) * (y - yi) / (yj - yi) + xi)
    
    if (intersect) inside = !inside
  }
  
  return inside
}

/**
 * Get bounding box for a polygon
 * @param {Array<{lat: number, lng: number}>} bounds - Polygon bounds
 * @returns {{north: number, south: number, east: number, west: number}} Bounding box
 */
export const getPolygonBoundingBox = (bounds) => {
  if (!bounds || bounds.length === 0) {
    return { north: 0, south: 0, east: 0, west: 0 }
  }
  
  let north = bounds[0].lat
  let south = bounds[0].lat
  let east = bounds[0].lng
  let west = bounds[0].lng
  
  bounds.forEach(point => {
    north = Math.max(north, point.lat)
    south = Math.min(south, point.lat)
    east = Math.max(east, point.lng)
    west = Math.min(west, point.lng)
  })
  
  return { north, south, east, west }
}

/**
 * Simplify polygon by removing points that are too close
 * @param {Array<{lat: number, lng: number}>} bounds - Polygon bounds
 * @param {number} tolerance - Minimum distance between points (in degrees)
 * @returns {Array<{lat: number, lng: number}>} Simplified bounds
 */
export const simplifyPolygon = (bounds, tolerance = 0.0001) => {
  if (!bounds || bounds.length <= 3) return bounds
  
  const simplified = [bounds[0]]
  
  for (let i = 1; i < bounds.length; i++) {
    const prev = simplified[simplified.length - 1]
    const curr = bounds[i]
    
    const distance = Math.sqrt(
      Math.pow(curr.lat - prev.lat, 2) + 
      Math.pow(curr.lng - prev.lng, 2)
    )
    
    if (distance >= tolerance) {
      simplified.push(curr)
    }
  }
  
  // Ensure polygon is closed
  const first = simplified[0]
  const last = simplified[simplified.length - 1]
  if (first.lat !== last.lat || first.lng !== last.lng) {
    simplified.push(first)
  }
  
  return simplified
}
