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
  const polygonsRef = useRef([])
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
  const [saving, setSaving] = useState(false)

  // Load custom areas from database
  const loadCustomAreas = async () => {
    try {
      const response = await fetch('/api/admin/areas')
      if (response.ok) {
        const data = await response.json()
        setCustomAreas(data.areas || [])
      }
    } catch (error) {
      console.error('Error loading custom areas:', error)
    }
  }

  // Save custom areas to database
  const saveCustomAreas = async () => {
    setSaving(true)
    try {
      const response = await fetch('/api/admin/areas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ areas: customAreas })
      })
      
      if (response.ok) {
        alert('Custom areas saved successfully!')
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

    setCustomAreas([...customAreas, newArea])
    
    // Style the polygon
    polygon.setOptions({
      fillColor: newArea.color,
      strokeColor: newArea.color,
      fillOpacity: 0.15,
      strokeOpacity: 0.8,
      strokeWeight: 2
    })
  }

  // Toggle drawing mode
  const toggleDrawingMode = () => {
    if (!drawingManagerRef.current) return
    
    setDrawingMode(!drawingMode)
    drawingManagerRef.current.setDrawingMode(
      !drawingMode ? window.google.maps.drawing.OverlayType.POLYGON : null
    )
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
          scale: 8,
          fillColor: leagueColor,
          fillOpacity: 0.9,
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
                Automatically assigned based on location
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
    setDebugInfo(prev => prev + ` | Markers: ${newMarkers.length}`)
  }

  // Draw league boundaries as polygons
  const drawLeagueBoundaries = (mapInstance) => {
    console.log('🗺️ Drawing league boundaries')
    
    // Clear existing polygons
    polygonsRef.current.forEach(polygon => {
      polygon.setMap(null)
    })
    polygonsRef.current = []

    if (boundaryType === 'none') return

    // Draw existing league polygons
    Object.entries(LEAGUE_POLYGONS).forEach(([league, data]) => {
      const polygon = new window.google.maps.Polygon({
        paths: data.bounds,
        strokeColor: data.color,
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: data.color,
        fillOpacity: 0.15,
        map: mapInstance,
        editable: editMode && selectedArea === league,
        draggable: editMode && selectedArea === league
      })

      // Add click listener
      const infoWindow = new window.google.maps.InfoWindow()
      polygon.addListener('click', (event) => {
        if (editMode) {
          setSelectedArea(league)
          // Update all polygons' editability
          polygonsRef.current.forEach((p, index) => {
            const leagues = Object.keys(LEAGUE_POLYGONS)
            const isSelected = leagues[index] === league
            p.setOptions({ 
              editable: isSelected,
              draggable: isSelected,
              strokeWeight: isSelected ? 4 : 2
            })
          })
        } else {
          const clubsInArea = markersRef.current.filter(m => m.league === league).length
          infoWindow.setContent(`
            <div style="padding: 10px;">
              <h3 style="margin: 0; color: ${data.color};">
                🏆 ${data.name} League Area
              </h3>
              <p style="margin: 5px 0;">
                ${clubsInArea} clubs in this area
              </p>
            </div>
          `)
          infoWindow.setPosition(event.latLng)
          infoWindow.open(mapInstance)
        }
      })

      polygonsRef.current.push(polygon)
    })

    // Draw custom areas
    customAreas.forEach(area => {
      const polygon = new window.google.maps.Polygon({
        paths: area.bounds,
        strokeColor: area.color,
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: area.color,
        fillOpacity: 0.15,
        map: mapInstance,
        editable: editMode && selectedArea === area.id,
        draggable: editMode && selectedArea === area.id
      })

      polygon.addListener('click', () => {
        if (editMode) {
          setSelectedArea(area.id)
        }
      })

      polygonsRef.current.push(polygon)
    })
  }

  // Fetch clubs
  const fetchClubs = async () => {
    console.log('📊 Fetching clubs...')
    try {
      const response = await fetch('/api/clubs?limit=1000')
      if (response.ok) {
        const data = await response.json()
        console.log('✅ Clubs fetched:', data.clubs?.length || 0)
        setClubs(data.clubs || [])
        setDebugInfo(prev => prev + ` | Clubs: ${data.clubs?.length || 0}`)
        
        // If map is ready, create markers
        if (mapInstanceRef.current && data.clubs?.length > 0) {
          createClubMarkers(mapInstanceRef.current, data.clubs)
        }
      } else {
        console.error('❌ Failed to fetch clubs')
        setDebugInfo(prev => prev + ' | ERROR: Clubs fetch failed')
      }
    } catch (error) {
      console.error('❌ Error fetching clubs:', error)
      setDebugInfo(prev => prev + ' | ERROR: ' + error.message)
    }
  }

  // Initialize the map when Google Maps is ready
  useEffect(() => {
    if (!googleMapsLoaded || !mapRef.current || mapInstanceRef.current) {
      return
    }

    console.log('🎯 Creating map with boundaries!')
    
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

      console.log('✅ Map created successfully!')
      mapInstanceRef.current = mapInstance
      setDebugInfo(prev => prev + ' | Map: Created')
      
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
  }, [googleMapsLoaded, clubs, boundaryType, editMode, customAreas])

  // Load Google Maps script on mount with BOTH libraries
  useEffect(() => {
    console.log('🗺️ AreasMapView mounting...')
    
    // Check API key
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    if (!apiKey) {
      console.error('❌ No API key')
      setError('Google Maps API key not configured')
      setDebugInfo('ERROR: No API key')
      setLoading(false)
      return
    }

    console.log('🔑 API Key: Found')
    setDebugInfo(`API Key: Found`)

    // Start fetching clubs
    fetchClubs()

    // Check if Google Maps is already loaded
    if (window.google && window.google.maps) {
      console.log('✅ Google Maps already available')
      setDebugInfo(prev => prev + ' | Google Maps: Already loaded')
      setGoogleMapsLoaded(true)
      return
    }

    // Check for existing script
    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]')
    if (existingScript) {
      console.log('⏳ Script exists, waiting for load...')
      setDebugInfo(prev => prev + ' | Google Maps: Script loading')
      
      // Wait for it to load
      const checkInterval = setInterval(() => {
        if (window.google && window.google.maps) {
          console.log('✅ Google Maps is now available!')
          setGoogleMapsLoaded(true)
          setDebugInfo(prev => prev + ' | Google Maps: Loaded')
          clearInterval(checkInterval)
        }
      }, 100)
      
      return () => clearInterval(checkInterval)
    }

    // Create new script with BOTH places AND drawing libraries
    console.log('📥 Loading Google Maps script with drawing library...')
    setDebugInfo(prev => prev + ' | Google Maps: Loading with drawing')
    
    // Create callback
    window.initMap = () => {
      console.log('✅ Google Maps callback fired!')
      setGoogleMapsLoaded(true)
      setDebugInfo(prev => prev + ' | Google Maps: Loaded')
    }
    
    const script = document.createElement('script')
    // FIXED: Include BOTH places AND drawing libraries
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,drawing&callback=initMap`
    script.async = true
    script.defer = true
    
    script.onerror = () => {
      console.error('❌ Failed to load Google Maps')
      setError('Failed to load Google Maps')
      setLoading(false)
    }
    
    document.head.appendChild(script)
  }, [])

  // Update when clubs or boundaries change
  useEffect(() => {
    if (mapInstanceRef.current) {
      if (clubs.length > 0) {
        createClubMarkers(mapInstanceRef.current, clubs)
      }
      drawLeagueBoundaries(mapInstanceRef.current)
    }
  }, [clubs, boundaryType, editMode, selectedArea, customAreas])

  // Filter by league
  const filterByLeague = (league) => {
    if (!mapInstanceRef.current) return
    
    markersRef.current.forEach(({ marker, league: markerLeague }) => {
      if (marker && marker.setVisible) {
        marker.setVisible(league === 'all' || markerLeague === league)
      }
    })
    
    // Also show/hide polygons
    polygonsRef.current.forEach((polygon, index) => {
      const leagues = Object.keys(LEAGUE_POLYGONS)
      const polygonLeague = leagues[index]
      if (polygonLeague) {
        polygon.setVisible(league === 'all' || polygonLeague === league)
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

    // Initialize league stats
    Object.keys(LEAGUE_POLYGONS).forEach(league => {
      stats.byLeague[league] = 0
    })
    stats.byLeague.unassigned = 0

    // Count clubs per league based on their coordinates
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
              onClick={() => setEditMode(!editMode)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                editMode
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {editMode ? '🔒 View Mode' : '✏️ Edit Mode'}
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
              <h3 className="font-medium text-purple-900">Edit Mode Active</h3>
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
                    {drawingMode ? '✏️ Drawing...' : '✏️ Draw Custom Area'}
                  </button>
                )}
                <button
                  onClick={saveCustomAreas}
                  disabled={saving || loading}
                  className="px-3 py-1 bg-green-600 text-white rounded text-sm font-medium hover:bg-green-700 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : '💾 Save Changes'}
                </button>
              </div>
            </div>
            <p className="text-sm text-purple-700">
              • Click areas to select and edit • Draw new custom areas • Existing league boundaries are read-only
            </p>
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-gray-600">{stats.totalClubs}</div>
            <div className="text-sm text-gray-600">Total Clubs</div>
          </div>
          {Object.entries(LEAGUE_POLYGONS).map(([league, data]) => (
            <div key={league} className="bg-gray-50 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold" style={{ color: data.color }}>
                {stats.byLeague[league]}
              </div>
              <div className="text-sm text-gray-600">{data.name}</div>
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
                  </span>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 mb-2">🗺️ Geographic Boundaries</h4>
            <p className="text-sm text-gray-600 mb-3">
              The colored areas on the map show the geographic boundaries for each league. 
              These boundaries automatically determine league membership.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm">
              <strong className="text-blue-900">
                {editMode ? 'Edit Mode:' : 'Import Tip:'}
              </strong>
              <p className="text-blue-700 mt-1">
                {editMode 
                  ? 'Click areas to select and edit them. Draw new custom areas as needed.'
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