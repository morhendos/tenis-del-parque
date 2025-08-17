'use client'

import { useState, useEffect, useRef } from 'react'
import { CITY_DISPLAY_NAMES } from '@/lib/utils/areaMapping'
import { LEAGUE_POLYGONS, determineLeagueByLocation } from '@/lib/utils/geographicBoundaries'

// Import utilities
import { calculatePolygonCenter, pathToBounds } from './utils/polygonHelpers'
import { generateSlug, calculateAreaStats } from './utils/areaCalculations'
import { 
  MAP_CONFIG, 
  AREA_COLORS, 
  DRAWING_OPTIONS, 
  POLYGON_STYLES, 
  MARKER_CONFIG,
  API_ENDPOINTS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES 
} from './constants/mapConfig'

// Import UI components
import AreaNotification from './components/AreaNotification'
import AreaStats from './components/AreaStats'
import LeagueFilterButtons from './components/LeagueFilterButtons'
import AreaEditControls from './components/AreaEditControls'
import AreaLegend from './components/AreaLegend'

export default function AreasMapView() {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const markersRef = useRef([])
  const polygonsRef = useRef(new Map())
  const drawingManagerRef = useRef(null)
  
  const [loading, setLoading] = useState(true)
  const [googleMapsLoaded, setGoogleMapsLoaded] = useState(false)
  const [selectedLeague, setSelectedLeague] = useState('all')
  const [clubs, setClubs] = useState([])
  const [debugInfo, setDebugInfo] = useState('')
  const [error, setError] = useState(null)
  const [boundaryType, setBoundaryType] = useState('polygons')
  
  // Edit mode states
  const [editMode, setEditMode] = useState(false)
  const [drawingMode, setDrawingMode] = useState(false)
  const [selectedArea, setSelectedArea] = useState(null)
  const [customAreas, setCustomAreas] = useState([])
  const [modifiedLeagues, setModifiedLeagues] = useState({}) // Track modifications to existing leagues
  const [saving, setSaving] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  
  // Notification state
  const [notification, setNotification] = useState(null)
  
  // Show notification helper
  const showNotification = (message, type = 'info') => {
    setNotification({ message, type })
  }

  // Load custom areas from database
  const loadCustomAreas = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.areas)
      if (response.ok) {
        const data = await response.json()
        const areas = data.areas || []
        
        console.log('Loaded areas from database:', areas)
        
        // Separate custom areas from modified leagues
        const custom = []
        const modified = {}
        
        areas.forEach(area => {
          // Check if it's a modified league (has originalLeagueId or matches a league pattern)
          if (area.originalLeagueId) {
            // This is a modified league, restore it
            modified[area.originalLeagueId] = {
              ...area,
              leagueId: area.originalLeagueId,
              bounds: area.bounds,
              center: area.center,
              color: LEAGUE_POLYGONS[area.originalLeagueId]?.color || area.color,
              name: LEAGUE_POLYGONS[area.originalLeagueId]?.name || area.name,
              isModified: true
            }
          } else if (area.isCustom) {
            // This is a custom area
            custom.push(area)
          }
        })
        
        console.log('Restored modified leagues:', modified)
        console.log('Restored custom areas:', custom)
        
        setCustomAreas(custom)
        setModifiedLeagues(modified)
      }
    } catch (error) {
      console.error('Error loading custom areas:', error)
      showNotification(ERROR_MESSAGES.loadFailed, 'error')
    }
  }

  // Save all changes to database
  const saveAllChanges = async () => {
    setSaving(true)
    
    try {
      // Prepare custom areas with all required fields
      const preparedCustomAreas = customAreas.map(area => ({
        ...area,
        slug: area.slug || generateSlug(area.name),
        center: area.center || calculatePolygonCenter(area.bounds),
        isCustom: true
      }))
      
      // Prepare modified leagues with proper tracking
      const preparedModifiedLeagues = Object.entries(modifiedLeagues).map(([leagueId, area]) => ({
        id: `league_${leagueId}_modified`,
        name: `${LEAGUE_POLYGONS[leagueId]?.name || leagueId} (Modified)`,
        slug: `league-${leagueId}-modified`,
        bounds: area.bounds,
        center: area.center || calculatePolygonCenter(area.bounds),
        color: area.color || LEAGUE_POLYGONS[leagueId]?.color || '#8B5CF6',
        originalLeagueId: leagueId, // IMPORTANT: Track which league this modifies
        isCustom: false,
        isModified: true
      }))
      
      // Collect all areas to save
      const allAreas = [
        ...preparedCustomAreas,
        ...preparedModifiedLeagues
      ]
      
      console.log('Saving areas with tracking:', allAreas)
      
      const response = await fetch(API_ENDPOINTS.areas, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ areas: allAreas })
      })
      
      const result = await response.json()
      
      if (response.ok) {
        setHasUnsavedChanges(false)
        showNotification(
          `Successfully saved ${preparedCustomAreas.length} custom areas and ${preparedModifiedLeagues.length} league modifications`,
          'success'
        )
        
        console.log('✅ Saved areas:', {
          customAreas: preparedCustomAreas.length,
          modifiedLeagues: preparedModifiedLeagues.length
        })
      } else {
        throw new Error(result.error || ERROR_MESSAGES.saveFailed)
      }
    } catch (error) {
      console.error('Error saving areas:', error)
      showNotification(
        `${ERROR_MESSAGES.saveFailed}: ${error.message}`,
        'error'
      )
    } finally {
      setSaving(false)
    }
  }

  // Track changes to existing league polygons
  const trackLeagueModification = (leagueId, newBounds) => {
    const modifiedArea = {
      id: `league_${leagueId}`,
      leagueId,
      originalLeagueId: leagueId, // Keep track of original league
      name: LEAGUE_POLYGONS[leagueId]?.name || leagueId,
      bounds: newBounds,
      center: calculatePolygonCenter(newBounds),
      color: LEAGUE_POLYGONS[leagueId]?.color || '#8B5CF6',
      isCustom: false,
      isModified: true
    }
    
    setModifiedLeagues(prev => ({
      ...prev,
      [leagueId]: modifiedArea
    }))
    setHasUnsavedChanges(true)
  }

  // Initialize drawing manager (only in edit mode)
  const initializeDrawingManager = (mapInstance) => {
    if (!window.google?.maps?.drawing?.DrawingManager) {
      console.warn(ERROR_MESSAGES.drawingLibraryUnavailable)
      return
    }

    const drawingManager = new window.google.maps.drawing.DrawingManager({
      drawingMode: null,
      drawingControl: false,
      polygonOptions: {
        fillColor: DRAWING_OPTIONS.fillOpacity,
        fillOpacity: DRAWING_OPTIONS.fillOpacity,
        strokeColor: '#8B5CF6',
        strokeOpacity: DRAWING_OPTIONS.strokeOpacity,
        strokeWeight: DRAWING_OPTIONS.strokeWeight,
        editable: DRAWING_OPTIONS.editable,
        draggable: DRAWING_OPTIONS.draggable
      }
    })

    drawingManager.setMap(mapInstance)
    drawingManagerRef.current = drawingManager

    // Listen for polygon completion
    window.google.maps.event.addListener(drawingManager, 'polygoncomplete', (polygon) => {
      createCustomArea(polygon)
      setDrawingMode(false)
      drawingManager.setDrawingMode(null)
    })
  }

  // Create custom area from polygon
  const createCustomArea = (polygon) => {
    const bounds = pathToBounds(polygon.getPath())
    const name = `Custom Area ${customAreas.length + 1}`
    
    const newArea = {
      id: `custom_${Date.now()}`,
      name,
      slug: generateSlug(name),
      bounds: bounds,
      center: calculatePolygonCenter(bounds),
      color: AREA_COLORS[customAreas.length % AREA_COLORS.length],
      isCustom: true
    }

    setCustomAreas(prev => [...prev, newArea])
    setHasUnsavedChanges(true)
    showNotification(`${SUCCESS_MESSAGES.areaCreated}: ${name}`, 'success')
    
    // Style the polygon
    polygon.setOptions({
      fillColor: newArea.color,
      strokeColor: newArea.color,
      fillOpacity: POLYGON_STYLES.default.fillOpacity,
      strokeOpacity: POLYGON_STYLES.default.strokeOpacity,
      strokeWeight: POLYGON_STYLES.default.strokeWeight
    })

    // Store polygon reference
    polygonsRef.current.set(newArea.id, polygon)

    // Add edit listeners
    setupPolygonEditListeners(polygon, newArea.id, true)
  }

  // Setup polygon edit listeners
  const setupPolygonEditListeners = (polygon, areaId, isCustom) => {
    const updateBounds = () => {
      const bounds = pathToBounds(polygon.getPath())

      if (isCustom) {
        // Update custom area with new center
        setCustomAreas(prev => prev.map(area => 
          area.id === areaId 
            ? { ...area, bounds, center: calculatePolygonCenter(bounds) } 
            : area
        ))
      } else {
        // Track league modification
        trackLeagueModification(areaId, bounds)
      }
      setHasUnsavedChanges(true)
    }

    // Listen for path changes
    const path = polygon.getPath()
    window.google.maps.event.addListener(path, 'set_at', updateBounds)
    window.google.maps.event.addListener(path, 'insert_at', updateBounds)
    window.google.maps.event.addListener(path, 'remove_at', updateBounds)
  }

  // Toggle drawing mode
  const toggleDrawingMode = () => {
    if (!drawingManagerRef.current) return
    
    setDrawingMode(!drawingMode)
    drawingManagerRef.current.setDrawingMode(
      !drawingMode ? window.google.maps.drawing.OverlayType.POLYGON : null
    )
  }

  // Toggle edit mode
  const toggleEditMode = () => {
    const newEditMode = !editMode
    setEditMode(newEditMode)
    
    if (newEditMode) {
      // Entering edit mode - make polygons editable
      polygonsRef.current.forEach((polygon, id) => {
        polygon.setOptions(POLYGON_STYLES.editMode)
      })
      showNotification(SUCCESS_MESSAGES.editModeEnabled, 'info')
    } else {
      // Exiting edit mode - make polygons read-only
      polygonsRef.current.forEach((polygon, id) => {
        polygon.setOptions(POLYGON_STYLES.default)
      })
      setSelectedArea(null)
      setDrawingMode(false)
      if (drawingManagerRef.current) {
        drawingManagerRef.current.setDrawingMode(null)
      }
    }
  }

  // Delete custom area
  const deleteCustomArea = () => {
    if (!selectedArea || !selectedArea.startsWith('custom_')) return
    
    const areaToDelete = customAreas.find(a => a.id === selectedArea)
    const polygon = polygonsRef.current.get(selectedArea)
    if (polygon) {
      polygon.setMap(null)
      polygonsRef.current.delete(selectedArea)
    }
    
    setCustomAreas(prev => prev.filter(area => area.id !== selectedArea))
    setSelectedArea(null)
    setHasUnsavedChanges(true)
    showNotification(`${SUCCESS_MESSAGES.areaDeleted}: ${areaToDelete?.name || 'Custom Area'}`, 'success')
  }

  // Reset league modifications
  const resetLeagueModifications = () => {
    setModifiedLeagues({})
    setHasUnsavedChanges(true)
    // Redraw polygons to show original boundaries
    if (mapInstanceRef.current) {
      drawLeagueBoundaries(mapInstanceRef.current)
    }
    showNotification(SUCCESS_MESSAGES.modificationsReset, 'info')
  }

  // Create club markers
  const createClubMarkers = (mapInstance, clubsData) => {
    console.log('📍 Creating club markers with', clubsData.length, 'clubs')
    
    // Clear existing markers
    markersRef.current.forEach(({ marker }) => {
      if (marker && marker.setMap) {
        marker.setMap(null)
      }
    })
    markersRef.current = []

    const newMarkers = []

    clubsData.forEach(club => {
      if (!club.location?.coordinates?.lat || !club.location?.coordinates?.lng) return

      // Determine which league this club belongs to based on coordinates
      const league = determineLeagueByLocation(
        club.location.coordinates.lat,
        club.location.coordinates.lng
      )

      const leagueColor = league ? LEAGUE_POLYGONS[league].color : '#6B7280'
      const leagueName = league ? LEAGUE_POLYGONS[league].name : 'Unassigned'

      // Create marker
      const marker = new window.google.maps.Marker({
        position: {
          lat: club.location.coordinates.lat,
          lng: club.location.coordinates.lng
        },
        map: mapInstance,
        title: club.name,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: editMode ? MARKER_CONFIG.editMode.scale : MARKER_CONFIG.default.scale,
          fillColor: leagueColor,
          fillOpacity: editMode ? MARKER_CONFIG.editMode.fillOpacity : MARKER_CONFIG.default.fillOpacity,
          strokeColor: MARKER_CONFIG.default.strokeColor,
          strokeWeight: MARKER_CONFIG.default.strokeWeight
        }
      })

      // Create info window
      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="padding: 10px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
            <h3 style="margin: 0 0 8px 0; color: #374151; font-size: 16px;">
              ${club.name}
            </h3>
            <p style="margin: 0 0 5px 0; color: #6B7280; font-size: 14px;">
              📍 ${club.location.address || club.location.city}
            </p>
            <p style="margin: 0; color: ${leagueColor}; font-weight: bold; font-size: 14px;">
              🏆 ${leagueName} League
            </p>
            <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #E5E7EB;">
              <small style="color: #6B7280;">
                ${editMode ? 'Edit mode: Areas can be modified' : 'Automatically assigned based on location'}
              </small>
            </div>
          </div>
        `
      })

      marker.addListener('click', () => {
        infoWindow.open(mapInstance, marker)
      })

      newMarkers.push({ marker, club, league })
    })

    console.log('✅ Created', newMarkers.length, 'club markers')
    markersRef.current = newMarkers
  }

  // Get current bounds for a league (modified or original)
  const getLeagueBounds = (leagueId) => {
    if (modifiedLeagues[leagueId]) {
      return modifiedLeagues[leagueId].bounds
    }
    return LEAGUE_POLYGONS[leagueId]?.bounds || []
  }

  // Draw league boundaries as polygons
  const drawLeagueBoundaries = (mapInstance) => {
    console.log('🗺️ Drawing league boundaries with modifications:', modifiedLeagues)
    
    // Clear existing polygons
    polygonsRef.current.forEach(polygon => {
      polygon.setMap(null)
    })
    polygonsRef.current.clear()

    if (boundaryType === 'none') return

    // Draw existing league polygons (with modifications if any)
    Object.entries(LEAGUE_POLYGONS).forEach(([league, data]) => {
      const bounds = getLeagueBounds(league)
      const isModified = !!modifiedLeagues[league]
      const styles = editMode ? POLYGON_STYLES.editMode : POLYGON_STYLES.default
      
      const polygon = new window.google.maps.Polygon({
        paths: bounds,
        strokeColor: data.color,
        strokeOpacity: styles.strokeOpacity,
        strokeWeight: styles.strokeWeight,
        fillColor: data.color,
        fillOpacity: styles.fillOpacity,
        map: mapInstance,
        editable: styles.editable,
        draggable: styles.draggable
      })

      // Add click listener
      polygon.addListener('click', (event) => {
        if (editMode) {
          setSelectedArea(league)
        } else {
          const clubsInArea = markersRef.current.filter(m => m.league === league).length
          const infoWindow = new window.google.maps.InfoWindow()
          infoWindow.setContent(`
            <div style="padding: 10px;">
              <h3 style="margin: 0; color: ${data.color};">
                🏆 ${data.name} League Area ${isModified ? '(Modified)' : ''}
              </h3>
              <p style="margin: 5px 0;">
                ${clubsInArea} clubs in this area
              </p>
              ${isModified ? '<small style="color: #F59E0B;">⚠️ This area has been modified</small>' : ''}
            </div>
          `)
          infoWindow.setPosition(event.latLng)
          infoWindow.open(mapInstance)
        }
      })

      polygonsRef.current.set(league, polygon)
      
      // Setup edit listeners if in edit mode
      if (editMode) {
        setupPolygonEditListeners(polygon, league, false)
      }
    })

    // Draw custom areas
    customAreas.forEach(area => {
      const styles = editMode ? POLYGON_STYLES.editMode : POLYGON_STYLES.default
      
      const polygon = new window.google.maps.Polygon({
        paths: area.bounds,
        strokeColor: area.color,
        strokeOpacity: styles.strokeOpacity,
        strokeWeight: styles.strokeWeight,
        fillColor: area.color,
        fillOpacity: styles.fillOpacity,
        map: mapInstance,
        editable: styles.editable,
        draggable: styles.draggable
      })

      polygon.addListener('click', () => {
        if (editMode) {
          setSelectedArea(area.id)
        }
      })

      polygonsRef.current.set(area.id, polygon)
      
      if (editMode) {
        setupPolygonEditListeners(polygon, area.id, true)
      }
    })
  }

  // Fetch clubs
  const fetchClubs = async () => {
    try {
      const response = await fetch(`${API_ENDPOINTS.clubs}?limit=1000`)
      if (response.ok) {
        const data = await response.json()
        setClubs(data.clubs || [])
        
        if (mapInstanceRef.current && data.clubs?.length > 0) {
          createClubMarkers(mapInstanceRef.current, data.clubs)
        }
      }
    } catch (error) {
      console.error('❌ Error fetching clubs:', error)
    }
  }

  // Initialize the map when Google Maps is ready
  useEffect(() => {
    if (!googleMapsLoaded || !mapRef.current || mapInstanceRef.current) {
      return
    }

    const initMap = async () => {
      try {
        const mapInstance = new window.google.maps.Map(mapRef.current, {
          center: MAP_CONFIG.defaultCenter,
          zoom: MAP_CONFIG.defaultZoom,
          styles: MAP_CONFIG.styles
        })

        mapInstanceRef.current = mapInstance
        
        // Initialize drawing manager if drawing library is available
        if (window.google?.maps?.drawing) {
          initializeDrawingManager(mapInstance)
        }
        
        // Load custom areas FIRST
        await loadCustomAreas()
        
        // Then draw league boundaries
        drawLeagueBoundaries(mapInstance)
        
        // Create markers if clubs are loaded
        if (clubs.length > 0) {
          createClubMarkers(mapInstance, clubs)
        }
        
        setLoading(false)
      } catch (err) {
        console.error('❌ Error creating map:', err)
        setError(err.message)
        setLoading(false)
      }
    }
    
    initMap()
  }, [googleMapsLoaded])

  // Load Google Maps script on mount with BOTH libraries
  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    if (!apiKey) {
      setError(ERROR_MESSAGES.noApiKey)
      setLoading(false)
      return
    }

    fetchClubs()

    if (window.google && window.google.maps) {
      setGoogleMapsLoaded(true)
      return
    }

    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]')
    if (existingScript) {
      const checkInterval = setInterval(() => {
        if (window.google && window.google.maps) {
          setGoogleMapsLoaded(true)
          clearInterval(checkInterval)
        }
      }, 100)
      
      return () => clearInterval(checkInterval)
    }

    window.initMap = () => {
      setGoogleMapsLoaded(true)
    }
    
    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=${MAP_CONFIG.libraries.join(',')}&callback=initMap`
    script.async = true
    script.defer = true
    
    script.onerror = () => {
      setError(ERROR_MESSAGES.mapLoadFailed)
      setLoading(false)
    }
    
    document.head.appendChild(script)
  }, [])

  // Update when relevant state changes
  useEffect(() => {
    if (mapInstanceRef.current) {
      drawLeagueBoundaries(mapInstanceRef.current)
      if (clubs.length > 0) {
        createClubMarkers(mapInstanceRef.current, clubs)
      }
    }
  }, [clubs, boundaryType, editMode, customAreas, modifiedLeagues])

  // Filter by league
  const filterByLeague = (league) => {
    if (!mapInstanceRef.current) return
    
    markersRef.current.forEach(({ marker, league: markerLeague }) => {
      if (marker && marker.setVisible) {
        marker.setVisible(league === 'all' || markerLeague === league)
      }
    })
    
    setSelectedLeague(league)
  }

  // Get area statistics using the utility function
  const stats = calculateAreaStats(clubs, modifiedLeagues)

  // Error state
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{error}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Notification */}
      {notification && (
        <AreaNotification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      {/* Header with Mode Toggle */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              🗺️ League Areas {editMode ? 'Editor' : 'Map'}
            </h2>
            <p className="text-gray-600">
              {editMode 
                ? 'Edit geographic boundaries and create custom areas'
                : 'Geographic boundaries and automatic league assignment'
              }
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={toggleEditMode}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                editMode
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {editMode ? '👁️ View Mode' : '✏️ Edit Mode'}
            </button>
            <button
              onClick={() => setBoundaryType(boundaryType === 'polygons' ? 'none' : 'polygons')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                boundaryType === 'polygons'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {boundaryType === 'polygons' ? '🗺️ Hide Boundaries' : '🗺️ Show Boundaries'}
            </button>
          </div>
        </div>

        {/* Edit Mode Controls */}
        <AreaEditControls
          editMode={editMode}
          drawingMode={drawingMode}
          hasDrawingManager={!!drawingManagerRef.current}
          loading={loading}
          selectedArea={selectedArea}
          modifiedLeagues={modifiedLeagues}
          customAreas={customAreas}
          hasUnsavedChanges={hasUnsavedChanges}
          saving={saving}
          onToggleDrawing={toggleDrawingMode}
          onDeleteArea={deleteCustomArea}
          onResetModifications={resetLeagueModifications}
          onSaveChanges={saveAllChanges}
        />

        {/* Area Statistics */}
        <AreaStats stats={stats} modifiedLeagues={modifiedLeagues} />

        {/* League Filter Buttons */}
        <LeagueFilterButtons
          selectedLeague={selectedLeague}
          onFilterChange={filterByLeague}
          stats={stats}
          modifiedLeagues={modifiedLeagues}
        />
      </div>

      {/* Map Container */}
      <div className="bg-white rounded-lg shadow overflow-hidden relative">
        <div 
          ref={mapRef}
          className="w-full"
          style={{ height: MAP_CONFIG.containerHeight }}
        />
        
        {loading && (
          <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center z-10">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-parque-purple mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading map...</p>
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <AreaLegend 
        editMode={editMode} 
        stats={stats} 
        modifiedLeagues={modifiedLeagues} 
      />
    </div>
  )
}