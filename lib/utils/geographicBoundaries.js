// Geographic boundary utilities for league assignment
// These functions determine which league a club belongs to based on its GPS coordinates

// Define league boundaries using polygons
export const LEAGUE_POLYGONS = {
  marbella: {
    bounds: [
      { lat: 36.6200, lng: -5.1000 }, // Northwest (includes San Pedro, Guadalmina)
      { lat: 36.6200, lng: -4.7500 }, // Northeast (includes Las Chapas)
      { lat: 36.4300, lng: -4.7500 }, // Southeast (includes Elviria)
      { lat: 36.4300, lng: -5.1000 }, // Southwest (includes El Paraiso)
    ],
    color: '#8B5CF6',
    name: 'Marbella',
    center: { lat: 36.5101, lng: -4.8824 }
  },
  malaga: {
    bounds: [
      { lat: 36.8500, lng: -4.7000 }, // Northwest
      { lat: 36.8500, lng: -4.2000 }, // Northeast
      { lat: 36.5000, lng: -4.2000 }, // Southeast
      { lat: 36.5000, lng: -4.7000 }, // Southwest (includes Torremolinos, Benalmadena, Fuengirola)
    ],
    color: '#10B981',
    name: 'Málaga',
    center: { lat: 36.7213, lng: -4.4214 }
  },
  estepona: {
    bounds: [
      { lat: 36.5500, lng: -5.3500 }, // Northwest (includes Benahavís)
      { lat: 36.5500, lng: -5.0500 }, // Northeast
      { lat: 36.3800, lng: -5.0500 }, // Southeast
      { lat: 36.3800, lng: -5.3500 }, // Southwest (includes Manilva, Sabinillas)
    ],
    color: '#F59E0B',
    name: 'Estepona',
    center: { lat: 36.4285, lng: -5.1450 }
  },
  sotogrande: {
    bounds: [
      { lat: 36.3500, lng: -5.4000 }, // Northwest
      { lat: 36.3500, lng: -5.1500 }, // Northeast
      { lat: 36.1500, lng: -5.1500 }, // Southeast
      { lat: 36.1500, lng: -5.4000 }, // Southwest (includes San Roque)
    ],
    color: '#EF4444',
    name: 'Sotogrande',
    center: { lat: 36.2847, lng: -5.2558 }
  }
}

// Function to check if point is inside polygon
export function isPointInPolygon(lat, lng, polygon) {
  let inside = false;
  const x = lat, y = lng;
  
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].lat, yi = polygon[i].lng;
    const xj = polygon[j].lat, yj = polygon[j].lng;
    
    const intersect = ((yi > y) != (yj > y))
        && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  
  return inside;
}

// Determine league based on polygon boundaries
export function determineLeagueByLocation(lat, lng) {
  for (const [league, data] of Object.entries(LEAGUE_POLYGONS)) {
    if (isPointInPolygon(lat, lng, data.bounds)) {
      return league;
    }
  }
  return null; // Outside all boundaries
}

// League display names
export const LEAGUE_NAMES = {
  'marbella': 'Marbella',
  'malaga': 'Málaga',
  'estepona': 'Estepona',
  'sotogrande': 'Sotogrande'
}
