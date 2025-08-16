'use client'

import { useState, useEffect, useRef } from 'react'

// Default colors for new areas
const AREA_COLORS = [
  '#8B5CF6', // Purple
  '#10B981', // Green
  '#F59E0B', // Orange
  '#EF4444', // Red
  '#3B82F6', // Blue
  '#EC4899', // Pink
  '#14B8A6', // Teal
  '#F97316', // Orange
]

export default function AreasMapEditor() {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const drawingManagerRef = useRef(null)
  const [loading, setLoading] = useState(true)
  const [googleMapsLoaded, setGoogleMapsLoaded] = useState(false)
  const [areas, setAreas] = useState([])
  const [selectedArea, setSelectedArea] = useState(null)
  const [editMode, setEditMode] = useState(false)
  const [drawingMode, setDrawingMode] = useState(false)
  const [clubs, setClubs] = useState([])
  const [showClubs, setShowClubs] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const markersRef = useRef([])
  const polygonsRef = useRef(new Map())

  // Load areas from database
  const loadAreas = async () => {
    try {
      const response = await fetch('/api/admin/areas')
      if (response.ok) {
        const data = await response.json()
        setAreas(data.areas || [])
      }
    } catch (error) {
      console.error('Error loading areas:', error)
    }
  }

  // Save areas to database
  const saveAreas = async () => {
    setSaving(true)
    try {
      const response = await fetch('/api/admin/areas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ areas })
      })
      
      if (response.ok) {
        alert('Areas saved successfully!')
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

  // Create a new area
  const createArea = (polygon) => {
    const path = polygon.getPath()
    const bounds = []
    
    for (let i = 0; i < path.getLength(); i++) {
      const point = path.getAt(i)
      bounds.push({
        lat: point.lat(),
        lng: point.lng()
      })
    }

    const newArea = {
      id: `area_${Date.now()}`,
      name: `New Area ${areas.length + 1}`,
      slug: `new-area-${areas.length + 1}`,
      bounds: bounds,
      color: AREA_COLORS[areas.length % AREA_COLORS.length],
      center: calculateCenter(bounds)
    }

    setAreas([...areas, newArea])
    
    // Style the polygon
    polygon.setOptions({
      fillColor: newArea.color,
      strokeColor: newArea.color,
      fillOpacity: 0.15,
      strokeOpacity: 0.8,
      strokeWeight: 2,
      editable: true,
      draggable: true
    })

    // Store polygon reference
    polygonsRef.current.set(newArea.id, polygon)

    // Add listeners for editing
    setupPolygonListeners(polygon, newArea.id)
    
    return newArea
  }

  // Calculate center of polygon
  const calculateCenter = (bounds) => {
    const lat = bounds.reduce((sum, point) => sum + point.lat, 0) / bounds.length
    const lng = bounds.reduce((sum, point) => sum + point.lng, 0) / bounds.length
    return { lat, lng }
  }

  // Setup polygon listeners
  const setupPolygonListeners = (polygon, areaId) => {
    // Listen for path changes
    window.google.maps.event.addListener(polygon.getPath(), 'set_at', () => {
      updateAreaBounds(areaId, polygon)
    })
    
    window.google.maps.event.addListener(polygon.getPath(), 'insert_at', () => {
      updateAreaBounds(areaId, polygon)
    })
    
    window.google.maps.event.addListener(polygon.getPath(), 'remove_at', () => {
      updateAreaBounds(areaId, polygon)
    })

    // Click to select
    polygon.addListener('click', () => {
      selectArea(areaId)
    })
  }

  // Update area bounds when polygon is edited
  const updateAreaBounds = (areaId, polygon) => {
    const path = polygon.getPath()
    const bounds = []
    
    for (let i = 0; i < path.getLength(); i++) {
      const point = path.getAt(i)
      bounds.push({
        lat: point.lat(),
        lng: point.lng()
      })
    }

    setAreas(prevAreas => 
      prevAreas.map(area => 
        area.id === areaId 
          ? { ...area, bounds, center: calculateCenter(bounds) }
          : area
      )
    )
  }

  // Select an area
  const selectArea = (areaId) => {
    setSelectedArea(areaId)
    
    // Update polygon styles
    polygonsRef.current.forEach((polygon, id) => {
      if (id === areaId) {
        polygon.setOptions({ strokeWeight: 4, editable: editMode })
      } else {
        polygon.setOptions({ strokeWeight: 2, editable: false })
      }
    })
  }

  // Delete selected area
  const deleteSelectedArea = () => {
    if (!selectedArea) return
    
    const polygon = polygonsRef.current.get(selectedArea)
    if (polygon) {
      polygon.setMap(null)
      polygonsRef.current.delete(selectedArea)
    }
    
    setAreas(areas.filter(area => area.id !== selectedArea))
    setSelectedArea(null)
  }

  // Update area properties
  const updateArea = (areaId, updates) => {
    setAreas(prevAreas => 
      prevAreas.map(area => 
        area.id === areaId ? { ...area, ...updates } : area
      )
    )

    // Update polygon style if color changed
    if (updates.color) {
      const polygon = polygonsRef.current.get(areaId)
      if (polygon) {
        polygon.setOptions({
          fillColor: updates.color,
          strokeColor: updates.color
        })
      }
    }
  }

  // Generate slug from name
  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '')
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
    
    polygonsRef.current.forEach((polygon, id) => {
      polygon.setOptions({ 
        editable: newEditMode && id === selectedArea,
        draggable: newEditMode && id === selectedArea
      })
    })
  }

  // Render areas on map
  const renderAreas = (mapInstance) => {
    // Clear existing polygons
    polygonsRef.current.forEach(polygon => polygon.setMap(null))
    polygonsRef.current.clear()

    areas.forEach(area => {
      const polygon = new window.google.maps.Polygon({
        paths: area.bounds,
        fillColor: area.color,
        strokeColor: area.color,
        fillOpacity: 0.15,
        strokeOpacity: 0.8,
        strokeWeight: 2,
        editable: false,
        draggable: false,
        map: mapInstance
      })

      polygonsRef.current.set(area.id, polygon)
      setupPolygonListeners(polygon, area.id)
    })
  }

  // Render club markers
  const renderClubMarkers = (mapInstance) => {
    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null))
    markersRef.current = []

    if (!showClubs) return

    clubs.forEach(club => {
      if (!club.location?.coordinates?.lat || !club.location?.coordinates?.lng) return

      // Find which area this club belongs to
      let assignedArea = null
      for (const area of areas) {
        if (isPointInPolygon(
          club.location.coordinates.lat,
          club.location.coordinates.lng,
          area.bounds
        )) {
          assignedArea = area
          break
        }
      }

      const marker = new window.google.maps.Marker({
        position: {
          lat: club.location.coordinates.lat,
          lng: club.location.coordinates.lng
        },
        map: mapInstance,
        title: club.name,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 6,
          fillColor: assignedArea ? assignedArea.color : '#6B7280',
          fillOpacity: 0.9,
          strokeColor: '#ffffff',
          strokeWeight: 2
        }
      })

      markersRef.current.push(marker)
    })
  }

  // Check if point is in polygon
  const isPointInPolygon = (lat, lng, bounds) => {
    let inside = false
    const x = lat, y = lng
    
    for (let i = 0, j = bounds.length - 1; i < bounds.length; j = i++) {
      const xi = bounds[i].lat, yi = bounds[i].lng
      const xj = bounds[j].lat, yj = bounds[j].lng
      
      const intersect = ((yi > y) != (yj > y))
          && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)
      if (intersect) inside = !inside
    }
    
    return inside
  }

  // Check if Google Maps Drawing library is available
  const isDrawingLibraryLoaded = () => {
    return window.google && 
           window.google.maps && 
           window.google.maps.drawing && 
           window.google.maps.drawing.DrawingManager
  }

  // Initialize drawing manager with retry logic
  const initializeDrawingManager = (mapInstance, retryCount = 0) => {
    const maxRetries = 10
    
    if (!isDrawingLibraryLoaded()) {
      if (retryCount < maxRetries) {
        console.log(`Drawing library not ready, retrying... (${retryCount + 1}/${maxRetries})`)
        setTimeout(() => {
          initializeDrawingManager(mapInstance, retryCount + 1)
        }, 500)
        return
      } else {
        setError('Google Maps Drawing library failed to load. Please refresh the page.')
        setLoading(false)
        return
      }
    }

    try {
      // Initialize drawing manager
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
        const newArea = createArea(polygon)
        selectArea(newArea.id)
        setDrawingMode(false)
        drawingManager.setDrawingMode(null)
      })

      console.log('Drawing manager initialized successfully')
      setLoading(false)
    } catch (error) {
      console.error('Error initializing drawing manager:', error)
      setError('Failed to initialize drawing manager. Please refresh the page.')
      setLoading(false)
    }
  }

  // Initialize map
  useEffect(() => {
    if (!googleMapsLoaded || !mapRef.current || mapInstanceRef.current) return

    try {
      const mapInstance = new window.google.maps.Map(mapRef.current, {
        center: { lat: 36.5, lng: -4.9 },
        zoom: 9,
        mapTypeControl: true,
        streetViewControl: false
      })

      mapInstanceRef.current = mapInstance

      // Initialize drawing manager with retry logic
      initializeDrawingManager(mapInstance)

      // Load initial data
      loadAreas()
      
      // Fetch clubs
      fetch('/api/clubs?limit=1000')
        .then(res => res.json())
        .then(data => setClubs(data.clubs || []))
        .catch(console.error)

    } catch (error) {
      console.error('Error initializing map:', error)
      setError('Failed to initialize map. Please refresh the page.')
      setLoading(false)
    }
  }, [googleMapsLoaded])

  // Update map when areas or clubs change
  useEffect(() => {
    if (mapInstanceRef.current) {
      renderAreas(mapInstanceRef.current)
      renderClubMarkers(mapInstanceRef.current)
    }
  }, [areas, clubs, showClubs])

  // Load Google Maps with proper library loading
  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    if (!apiKey) {
      setError('Google Maps API key not configured')
      setLoading(false)
      return
    }

    // Check if already loaded
    if (window.google && window.google.maps) {
      setGoogleMapsLoaded(true)
      return
    }

    // Prevent multiple script loading
    if (document.querySelector('script[src*="maps.googleapis.com"]')) {
      // Script already exists, wait for it to load
      const checkLoaded = () => {
        if (window.google && window.google.maps) {
          setGoogleMapsLoaded(true)
        } else {
          setTimeout(checkLoaded, 100)
        }
      }
      checkLoaded()
      return
    }

    // Create global callback
    window.initMapEditor = () => {
      console.log('Google Maps loaded successfully')
      setGoogleMapsLoaded(true)
    }

    // Load Google Maps script with drawing library
    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=drawing,places&callback=initMapEditor`
    script.async = true
    script.defer = true
    script.onerror = () => {
      setError('Failed to load Google Maps. Please check your internet connection and try again.')
      setLoading(false)
    }
    document.head.appendChild(script)

    return () => {
      // Cleanup
      if (window.initMapEditor) {
        delete window.initMapEditor
      }
    }
  }, [])

  const selectedAreaData = areas.find(a => a.id === selectedArea)

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center mb-2">
          <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-red-800 font-medium">Error Loading Map</h3>
        </div>
        <p className="text-red-600">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Refresh Page
        </button>
      </div>
    )
  }

  // Get area statistics
  const getAreaStats = () => {
    const stats = {}
    areas.forEach(area => {
      stats[area.id] = 0
    })
    
    clubs.forEach(club => {
      if (!club.location?.coordinates?.lat || !club.location?.coordinates?.lng) return
      
      for (const area of areas) {
        if (isPointInPolygon(
          club.location.coordinates.lat,
          club.location.coordinates.lng,
          area.bounds
        )) {
          stats[area.id]++
          break
        }
      }
    })
    
    return stats
  }

  const areaStats = getAreaStats()

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">League Areas Editor</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setShowClubs(!showClubs)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                showClubs 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {showClubs ? '📍 Hide Clubs' : '📍 Show Clubs'}
            </button>
            <button
              onClick={toggleDrawingMode}
              disabled={loading}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                drawingMode 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {drawingMode ? '✏️ Drawing...' : '✏️ Draw Area'}
            </button>
            <button
              onClick={toggleEditMode}
              disabled={!selectedArea || loading}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                editMode 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {editMode ? '🔒 Lock' : '✏️ Edit'}
            </button>
            <button
              onClick={deleteSelectedArea}
              disabled={!selectedArea || loading}
              className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              🗑️ Delete
            </button>
            <button
              onClick={saveAreas}
              disabled={saving || loading}
              className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50"
            >
              {saving ? 'Saving...' : '💾 Save All'}
            </button>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
          <strong className="text-blue-900">How to use:</strong>
          <ul className="text-blue-700 mt-1 space-y-1">
            <li>• Click "Draw Area" and draw a polygon on the map to create a new league area</li>
            <li>• Select an area and click "Edit" to modify its boundaries by dragging points</li>
            <li>• Use the property panel on the right to rename areas and change colors</li>
            <li>• Click "Save All" to persist your changes to the database</li>
          </ul>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Map */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg shadow overflow-hidden relative">
            <div 
              ref={mapRef}
              className="w-full"
              style={{ height: '600px' }}
            />
            {loading && (
              <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                  <p className="mt-3 text-gray-600">Loading Google Maps...</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Properties Panel */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="font-semibold text-gray-900 mb-4">Area Properties</h3>
            
            {selectedAreaData ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    value={selectedAreaData.name}
                    onChange={(e) => {
                      const newName = e.target.value
                      const newSlug = generateSlug(newName)
                      updateArea(selectedArea, { name: newName, slug: newSlug })
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Slug
                  </label>
                  <input
                    type="text"
                    value={selectedAreaData.slug}
                    disabled
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Color
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {AREA_COLORS.map(color => (
                      <button
                        key={color}
                        onClick={() => updateArea(selectedArea, { color })}
                        className={`w-full h-10 rounded border-2 ${
                          selectedAreaData.color === color
                            ? 'border-gray-800'
                            : 'border-gray-300'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Statistics
                  </label>
                  <div className="bg-gray-50 rounded-lg p-3 space-y-2 text-sm">
                    <div>Clubs in area: <strong>{areaStats[selectedArea] || 0}</strong></div>
                    <div>Vertices: <strong>{selectedAreaData.bounds.length}</strong></div>
                    <div>Center: <strong>{selectedAreaData.center.lat.toFixed(4)}, {selectedAreaData.center.lng.toFixed(4)}</strong></div>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 text-sm">Select an area to edit its properties</p>
            )}
          </div>

          {/* Areas List */}
          <div className="bg-white rounded-lg shadow p-4 mt-4">
            <h3 className="font-semibold text-gray-900 mb-4">All Areas ({areas.length})</h3>
            <div className="space-y-2">
              {areas.map(area => (
                <div
                  key={area.id}
                  onClick={() => selectArea(area.id)}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedArea === area.id
                      ? 'bg-purple-50 border-2 border-purple-500'
                      : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div
                        className="w-4 h-4 rounded mr-2"
                        style={{ backgroundColor: area.color }}
                      />
                      <span className="font-medium">{area.name}</span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {areaStats[area.id] || 0} clubs
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}