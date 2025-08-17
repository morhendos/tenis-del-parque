'use client'

import { useState, useEffect, useRef } from 'react'
import { CITY_DISPLAY_NAMES } from '@/lib/utils/areaMapping'
// Import from shared utility
import { 
  LEAGUE_POLYGONS,
  determineLeagueByLocation 
} from '@/lib/utils/geographicBoundaries'

// Default colors for new areas (if needed for custom areas)
const AREA_COLORS = [
  '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', 
  '#3B82F6', '#EC4899', '#14B8A6', '#F97316'
]

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
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  // Load custom areas from database
  const loadCustomAreas = async () => {
    try {
      const response = await fetch('/api/admin/areas')
      if (response.ok) {
        const data = await response.json()
        const areas = data.areas || []
        
        // Separate custom areas from modified leagues
        const custom = areas.filter(area => area.isCustom)
        const modified = {}
        areas.forEach(area => {
          if (!area.isCustom && area.leagueId) {
            modified[area.leagueId] = area
          }
        })
        
        setCustomAreas(custom)
        setModifiedLeagues(modified)
      }
    } catch (error) {
      console.error('Error loading custom areas:', error)
    }
  }

  // Save all changes to database
  const saveAllChanges = async () => {
    setSaving(true)
    setSaveSuccess(false)
    
    try {
      // Collect all areas to save (custom + modified leagues)
      const allAreas = [
        ...customAreas,
        ...Object.values(modifiedLeagues)
      ]
      
      const response = await fetch('/api/admin/areas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ areas: allAreas })
      })
      
      if (response.ok) {
        setSaveSuccess(true)
        setHasUnsavedChanges(false)
        
        // Show success message
        setTimeout(() => setSaveSuccess(false), 3000)
        
        console.log('✅ Saved areas:', {
          customAreas: customAreas.length,
          modifiedLeagues: Object.keys(modifiedLeagues).length
        })
      } else {
        throw new Error('Failed to save areas')
      }
    } catch (error) {
      console.error('Error saving areas:', error)
      alert('Failed to save areas. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  // Track changes to existing league polygons
  const trackLeagueModification = (leagueId, newBounds) => {
    const modifiedArea = {
      id: `league_${leagueId}`,
      leagueId,
      name: `Modified ${LEAGUE_POLYGONS[leagueId]?.name || leagueId}`,
      bounds: newBounds,
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
      console.warn('Drawing library not available')
      return
    }

    const drawingManager = new window.google.maps.drawing.DrawingManager({
      drawingMode: null,
      drawingControl: false,
      polygonOptions: {
        fillColor: '#8B5CF6',
        fillOpacity: 0.15,
        strokeColor: '#8B5CF6',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        editable: true,
        draggable: true
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
    const path = polygon.getPath()
    const bounds = []
    
    for (let i = 0; i < path.getLength(); i++) {
      const point = path.getAt(i)
      bounds.push({ lat: point.lat(), lng: point.lng() })
    }

    const newArea = {
      id: `custom_${Date.now()}`,
      name: `Custom Area ${customAreas.length + 1}`,
      bounds: bounds,
      color: AREA_COLORS[customAreas.length % AREA_COLORS.length],
      isCustom: true
    }

    setCustomAreas(prev => [...prev, newArea])
    setHasUnsavedChanges(true)
    
    // Style the polygon
    polygon.setOptions({
      fillColor: newArea.color,
      strokeColor: newArea.color,
      fillOpacity: 0.15,
      strokeOpacity: 0.8,
      strokeWeight: 2
    })

    // Store polygon reference
    polygonsRef.current.set(newArea.id, polygon)

    // Add edit listeners
    setupPolygonEditListeners(polygon, newArea.id, true)
  }

  // Setup polygon edit listeners
  const setupPolygonEditListeners = (polygon, areaId, isCustom) => {
    const updateBounds = () => {
      const path = polygon.getPath()
      const bounds = []
      
      for (let i = 0; i < path.getLength(); i++) {
        const point = path.getAt(i)
        bounds.push({ lat: point.lat(), lng: point.lng() })
      }

      if (isCustom) {
        // Update custom area
        setCustomAreas(prev => prev.map(area => 
          area.id === areaId ? { ...area, bounds } : area
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
        polygon.setOptions({ 
          editable: true,
          draggable: true,
          strokeWeight: 3
        })
      })
    } else {
      // Exiting edit mode - make polygons read-only
      polygonsRef.current.forEach((polygon, id) => {
        polygon.setOptions({ 
          editable: false,
          draggable: false,
          strokeWeight: 2
        })
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
    
    const polygon = polygonsRef.current.get(selectedArea)
    if (polygon) {
      polygon.setMap(null)
      polygonsRef.current.delete(selectedArea)
    }
    
    setCustomAreas(prev => prev.filter(area => area.id !== selectedArea))
    setSelectedArea(null)
    setHasUnsavedChanges(true)
  }

  // Reset league modifications
  const resetLeagueModifications = () => {
    setModifiedLeagues({})
    setHasUnsavedChanges(true)
    // Redraw polygons to show original boundaries
    if (mapInstanceRef.current) {
      drawLeagueBoundaries(mapInstanceRef.current)
    }
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
          scale: editMode ? 6 : 8,
          fillColor: leagueColor,
          fillOpacity: editMode ? 0.6 : 0.9,
          strokeColor: '#ffffff',
          strokeWeight: 2
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
    console.log('🗺️ Drawing league boundaries')
    
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
      
      const polygon = new window.google.maps.Polygon({
        paths: bounds,
        strokeColor: data.color,
        strokeOpacity: 0.8,
        strokeWeight: editMode ? 3 : 2,
        fillColor: data.color,
        fillOpacity: editMode ? 0.1 : 0.15,
        map: mapInstance,
        editable: editMode,
        draggable: editMode
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
      const polygon = new window.google.maps.Polygon({
        paths: area.bounds,
        strokeColor: area.color,
        strokeOpacity: 0.8,
        strokeWeight: editMode ? 3 : 2,
        fillColor: area.color,
        fillOpacity: editMode ? 0.1 : 0.15,
        map: mapInstance,
        editable: editMode,
        draggable: editMode
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
      const response = await fetch('/api/clubs?limit=1000')
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

    try {
      const mapInstance = new window.google.maps.Map(mapRef.current, {
        center: { lat: 36.5, lng: -4.9 },
        zoom: 9,
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
          }
        ]
      })

      mapInstanceRef.current = mapInstance
      
      // Initialize drawing manager if drawing library is available
      if (window.google?.maps?.drawing) {
        initializeDrawingManager(mapInstance)
      }
      
      // Draw league boundaries
      drawLeagueBoundaries(mapInstance)
      
      // Create markers if clubs are loaded
      if (clubs.length > 0) {
        createClubMarkers(mapInstance, clubs)
      }
      
      // Load custom areas
      loadCustomAreas()
      
      setLoading(false)
    } catch (err) {
      console.error('❌ Error creating map:', err)
      setError(err.message)
      setLoading(false)
    }
  }, [googleMapsLoaded])

  // Load Google Maps script on mount with BOTH libraries
  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    if (!apiKey) {
      setError('Google Maps API key not configured')
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
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,drawing&callback=initMap`
    script.async = true
    script.defer = true
    
    script.onerror = () => {
      setError('Failed to load Google Maps')
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

  // Get area statistics
  const getAreaStats = () => {
    const stats = {
      totalClubs: clubs.length,
      byLeague: {}
    }

    Object.keys(LEAGUE_POLYGONS).forEach(league => {
      stats.byLeague[league] = 0
    })
    stats.byLeague.unassigned = 0

    clubs.forEach(club => {
      if (club.location?.coordinates?.lat && club.location?.coordinates?.lng) {
        const league = determineLeagueByLocation(
          club.location.coordinates.lat,
          club.location.coordinates.lng
        )
        if (league) {
          stats.byLeague[league]++
        } else {
          stats.byLeague.unassigned++
        }
      }
    })

    return stats
  }

  const stats = getAreaStats()

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
        {editMode && (
          <div className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-medium text-purple-900">✏️ Edit Mode Active</h3>
                <p className="text-sm text-purple-700">
                  Click areas to select • Drag points to edit boundaries • Draw new custom areas
                </p>
              </div>
              <div className="flex gap-2">
                {drawingManagerRef.current && (
                  <button
                    onClick={toggleDrawingMode}
                    disabled={loading}
                    className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                      drawingMode 
                        ? 'bg-purple-600 text-white' 
                        : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                    } disabled:opacity-50`}
                  >
                    {drawingMode ? '✏️ Drawing...' : '➕ Draw New Area'}
                  </button>
                )}
                {selectedArea?.startsWith('custom_') && (
                  <button
                    onClick={deleteCustomArea}
                    className="px-3 py-1 bg-red-100 text-red-700 rounded text-sm font-medium hover:bg-red-200"
                  >
                    🗑️ Delete Area
                  </button>
                )}
                {Object.keys(modifiedLeagues).length > 0 && (
                  <button
                    onClick={resetLeagueModifications}
                    className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded text-sm font-medium hover:bg-yellow-200"
                  >
                    🔄 Reset Modifications
                  </button>
                )}
              </div>
            </div>
            
            {/* Save Controls */}
            <div className="flex items-center justify-between pt-3 border-t border-purple-200">
              <div className="flex items-center space-x-4">
                {hasUnsavedChanges && (
                  <span className="text-sm text-amber-600 font-medium">
                    ⚠️ You have unsaved changes
                  </span>
                )}
                {saveSuccess && (
                  <span className="text-sm text-green-600 font-medium">
                    ✅ Changes saved successfully!
                  </span>
                )}
                <span className="text-sm text-purple-600">
                  Modified leagues: {Object.keys(modifiedLeagues).length} • 
                  Custom areas: {customAreas.length}
                </span>
              </div>
              <button
                onClick={saveAllChanges}
                disabled={saving || (!hasUnsavedChanges && customAreas.length === 0 && Object.keys(modifiedLeagues).length === 0)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  hasUnsavedChanges || customAreas.length > 0 || Object.keys(modifiedLeagues).length > 0
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                } disabled:opacity-50`}
              >
                {saving ? '💾 Saving...' : '💾 Save All Changes'}
              </button>
            </div>
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-gray-600">{stats.totalClubs}</div>
            <div className="text-sm text-gray-600">Total Clubs</div>
          </div>
          {Object.entries(LEAGUE_POLYGONS).map(([league, data]) => (
            <div key={league} className="bg-gray-50 rounded-lg p-4 text-center relative">
              <div className="text-3xl font-bold" style={{ color: data.color }}>
                {stats.byLeague[league]}
              </div>
              <div className="text-sm text-gray-600">
                {data.name}
                {modifiedLeagues[league] && (
                  <span className="block text-xs text-amber-600 font-medium mt-1">Modified</span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* League Filter Buttons */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => filterByLeague('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedLeague === 'all'
                ? 'bg-gray-800 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Leagues ({stats.totalClubs} clubs)
          </button>
          
          {Object.entries(LEAGUE_POLYGONS).map(([league, data]) => (
            <button
              key={league}
              onClick={() => filterByLeague(league)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedLeague === league
                  ? 'text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              style={{
                backgroundColor: selectedLeague === league ? data.color : undefined
              }}
            >
              <span style={{ color: selectedLeague !== league ? data.color : undefined }}>
                ●
              </span>
              {' '}
              {data.name} ({stats.byLeague[league]} clubs)
              {modifiedLeagues[league] && ' ⚠️'}
            </button>
          ))}
        </div>
      </div>

      {/* Map Container */}
      <div className="bg-white rounded-lg shadow overflow-hidden relative">
        <div 
          ref={mapRef}
          className="w-full"
          style={{ height: '700px' }}
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
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          How League Assignment Works
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">📍 Automatic Assignment</h4>
            <p className="text-sm text-gray-600 mb-3">
              Clubs are automatically assigned to leagues based on their GPS coordinates. 
              When a club falls within a league's boundary, it belongs to that league.
            </p>
            <div className="space-y-2">
              {Object.entries(LEAGUE_POLYGONS).map(([league, data]) => (
                <div key={league} className="flex items-center">
                  <div 
                    className="w-4 h-4 rounded mr-2"
                    style={{ backgroundColor: data.color, opacity: 0.3 }}
                  />
                  <span className="text-sm">
                    <strong>{data.name}:</strong> {stats.byLeague[league]} clubs
                    {modifiedLeagues[league] && <span className="text-amber-600 ml-1">(Modified)</span>}
                  </span>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 mb-2">
              {editMode ? '✏️ Editing Areas' : '🗺️ Geographic Boundaries'}
            </h4>
            <p className="text-sm text-gray-600 mb-3">
              {editMode 
                ? 'Click and drag points to modify area boundaries. Draw new custom areas as needed. All changes are tracked and can be saved.'
                : 'The colored areas on the map show the geographic boundaries for each league. These boundaries automatically determine league membership.'
              }
            </p>
            <div className={`border rounded p-3 text-sm ${
              editMode ? 'bg-purple-50 border-purple-200' : 'bg-blue-50 border-blue-200'
            }`}>
              <strong className={editMode ? 'text-purple-900' : 'text-blue-900'}>
                {editMode ? 'Edit Mode Tips:' : 'Import Tip:'}
              </strong>
              <p className={`mt-1 ${editMode ? 'text-purple-700' : 'text-blue-700'}`}>
                {editMode 
                  ? '• Click areas to select them • Drag corner points to reshape boundaries • Use "Draw New Area" to create custom regions'
                  : 'When importing clubs from Google Maps, they\'ll be automatically assigned to the correct league based on their location!'
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}