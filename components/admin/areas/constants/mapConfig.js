/**
 * Configuration constants for the areas map editor
 */

// Map initialization settings
export const MAP_CONFIG = {
  // Default center (Costa del Sol region)
  defaultCenter: { 
    lat: 36.5, 
    lng: -4.9 
  },
  defaultZoom: 9,
  
  // Map styling to hide POI labels
  styles: [
    {
      featureType: 'poi',
      elementType: 'labels',
      stylers: [{ visibility: 'off' }]
    }
  ],
  
  // Map container dimensions
  containerHeight: '700px',
  
  // Libraries to load
  libraries: ['places', 'drawing']
}

// Default colors for custom areas
export const AREA_COLORS = [
  '#8B5CF6', // Purple
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#3B82F6', // Blue
  '#EC4899', // Pink
  '#14B8A6', // Teal
  '#F97316'  // Orange
]

// Polygon drawing options
export const DRAWING_OPTIONS = {
  fillOpacity: 0.15,
  strokeOpacity: 0.8,
  strokeWeight: 2,
  editable: true,
  draggable: true
}

// Polygon display options
export const POLYGON_STYLES = {
  default: {
    fillOpacity: 0.15,
    strokeOpacity: 0.8,
    strokeWeight: 2,
    editable: false,
    draggable: false
  },
  editMode: {
    fillOpacity: 0.1,
    strokeOpacity: 0.8,
    strokeWeight: 3,
    editable: true,
    draggable: true
  },
  hover: {
    fillOpacity: 0.25,
    strokeOpacity: 1,
    strokeWeight: 3
  }
}

// Marker icon configuration
export const MARKER_CONFIG = {
  default: {
    scale: 8,
    fillOpacity: 0.9,
    strokeColor: '#ffffff',
    strokeWeight: 2
  },
  editMode: {
    scale: 6,
    fillOpacity: 0.6,
    strokeColor: '#ffffff',
    strokeWeight: 2
  }
}

// Notification display duration (ms)
export const NOTIFICATION_DURATION = 5000

// Auto-save configuration
export const AUTOSAVE_CONFIG = {
  enabled: false, // Set to true to enable auto-save
  interval: 30000, // Auto-save every 30 seconds
  debounceDelay: 2000 // Wait 2 seconds after last change
}

// API endpoints
export const API_ENDPOINTS = {
  areas: '/api/admin/areas',
  clubs: '/api/clubs'
}

// Limits and constraints
export const LIMITS = {
  maxCustomAreas: 50,
  maxPolygonPoints: 100,
  minPolygonPoints: 3,
  maxClubsToDisplay: 1000,
  searchDebounceMs: 300
}

// Error messages
export const ERROR_MESSAGES = {
  loadFailed: 'Failed to load saved areas',
  saveFailed: 'Failed to save areas',
  mapLoadFailed: 'Failed to load Google Maps',
  noApiKey: 'Google Maps API key not configured',
  drawingLibraryUnavailable: 'Drawing library not available',
  invalidPolygon: 'Invalid polygon - minimum 3 points required',
  maxAreasReached: 'Maximum number of custom areas reached'
}

// Success messages
export const SUCCESS_MESSAGES = {
  areaSaved: 'Successfully saved areas',
  areaCreated: 'Created new area',
  areaDeleted: 'Deleted area',
  modificationsReset: 'All league modifications have been reset',
  editModeEnabled: 'Edit mode enabled - Click and drag polygon points to modify boundaries'
}

// Feature flags
export const FEATURES = {
  enableCustomAreas: true,
  enableLeagueModification: true,
  enableAreaStats: true,
  enableClubMarkers: true,
  enableAreaLegend: true,
  enablePolygonSimplification: true,
  enableAreaCalculations: true
}

// Debug configuration
export const DEBUG = {
  enabled: process.env.NODE_ENV === 'development',
  logMapEvents: false,
  logPolygonChanges: false,
  logApiCalls: true,
  showPolygonCoordinates: false
}
