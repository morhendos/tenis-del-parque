'use client'

import { useState, useEffect, useRef } from 'react'
import { 
  CITY_DISPLAY_NAMES
} from '@/lib/utils/areaMapping'

// Define league boundaries using polygons
const LEAGUE_POLYGONS = {
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
function isPointInPolygon(lat, lng, polygon) {
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

export default function AreasMapView() {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const markersRef = useRef([])
  const polygonsRef = useRef([])
  const [loading, setLoading] = useState(true)
  const [googleMapsLoaded, setGoogleMapsLoaded] = useState(false)
  const [selectedLeague, setSelectedLeague] = useState('all')
  const [clubs, setClubs] = useState([])
  const [debugInfo, setDebugInfo] = useState('')
  const [error, setError] = useState(null)
  const [boundaryType, setBoundaryType] = useState('polygons') // 'polygons' or 'none'

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

    Object.entries(LEAGUE_POLYGONS).forEach(([league, data]) => {
      const polygon = new window.google.maps.Polygon({
        paths: data.bounds,
        strokeColor: data.color,
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: data.color,
        fillOpacity: 0.15,
        map: mapInstance
      })

      // Add click listener
      const infoWindow = new window.google.maps.InfoWindow()
      polygon.addListener('click', (event) => {
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
      
      // Draw league boundaries
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
  }, [googleMapsLoaded, clubs, boundaryType])

  // Load Google Maps script on mount
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

    // Create new script
    console.log('📥 Loading Google Maps script...')
    setDebugInfo(prev => prev + ' | Google Maps: Loading')
    
    // Create callback
    window.initMap = () => {
      console.log('✅ Google Maps callback fired!')
      setGoogleMapsLoaded(true)
      setDebugInfo(prev => prev + ' | Google Maps: Loaded')
    }
    
    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initMap`
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
  }, [clubs, boundaryType])

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
      polygon.setVisible(league === 'all' || polygonLeague === league)
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
      {/* Header with Stats */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              🗺️ League Areas Map
            </h2>
            <p className="text-gray-600">
              Geographic boundaries and automatic league assignment
            </p>
          </div>
          <div className="flex gap-2">
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
              <strong className="text-blue-900">Import Tip:</strong>
              <p className="text-blue-700 mt-1">
                When importing clubs from Google Maps, they'll be automatically assigned 
                to the correct league based on their location!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
