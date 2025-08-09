'use client'

import { useState, useEffect, useRef } from 'react'
import { 
  CITY_AREAS_MAPPING, 
  AREA_DISPLAY_NAMES, 
  CITY_DISPLAY_NAMES
} from '@/lib/utils/areaMapping'

export default function AreasMapView() {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const markersRef = useRef([])
  const [loading, setLoading] = useState(true)
  const [selectedLeague, setSelectedLeague] = useState('all')
  const [clubs, setClubs] = useState([])
  const [debugInfo, setDebugInfo] = useState('')
  const [error, setError] = useState(null)

  // Area coordinates (approximate)
  const areaCoordinates = {
    // Marbella League
    'marbella': { lat: 36.5101, lng: -4.8824 },
    'el-paraiso': { lat: 36.4891, lng: -5.1547 },
    'nueva-andalucia': { lat: 36.4978, lng: -4.9548 },
    'san-pedro-de-alcantara': { lat: 36.4848, lng: -5.0304 },
    'puerto-banus': { lat: 36.4839, lng: -4.9517 },
    'aloha': { lat: 36.4956, lng: -4.9702 },
    'guadalmina': { lat: 36.4798, lng: -5.0156 },
    'las-chapas': { lat: 36.4945, lng: -4.8234 },
    'artola': { lat: 36.4712, lng: -4.7891 },
    'elviria': { lat: 36.4823, lng: -4.8156 },
    'golden-mile': { lat: 36.5023, lng: -4.9134 },
    'sierra-blanca': { lat: 36.5134, lng: -4.8956 },
    'nagüeles': { lat: 36.5167, lng: -4.8712 },
    
    // Málaga League
    'malaga': { lat: 36.7213, lng: -4.4214 },
    'pedregalejo': { lat: 36.7145, lng: -4.3456 },
    'el-palo': { lat: 36.7089, lng: -4.3234 },
    'churriana': { lat: 36.6634, lng: -4.4891 },
    'torremolinos': { lat: 36.6201, lng: -4.4998 },
    'benalmádena': { lat: 36.5989, lng: -4.5164 },
    'fuengirola': { lat: 36.5472, lng: -4.6214 },
    'mijas': { lat: 36.5989, lng: -4.6456 },
    
    // Estepona League
    'estepona': { lat: 36.4285, lng: -5.1450 },
    'cancelada': { lat: 36.4523, lng: -5.0891 },
    'sabinillas': { lat: 36.4167, lng: -5.2634 },
    'manilva': { lat: 36.4234, lng: -5.2456 },
    'duquesa': { lat: 36.4145, lng: -5.2789 },
    'benahavís': { lat: 36.5145, lng: -5.0434 },
    
    // Sotogrande League
    'sotogrande': { lat: 36.2847, lng: -5.2558 },
    'san-roque': { lat: 36.2089, lng: -5.3789 },
    'la-alcaidesa': { lat: 36.2634, lng: -5.2234 },
    'torreguadiaro': { lat: 36.2745, lng: -5.2891 }
  }

  // League colors
  const leagueColors = {
    'marbella': '#8B5CF6',
    'malaga': '#10B981', 
    'estepona': '#F59E0B',
    'sotogrande': '#EF4444'
  }

  // Create area markers
  const createAreaMarkers = (mapInstance, clubsData) => {
    console.log('📍 Creating area markers with', clubsData.length, 'clubs')
    
    // Clear existing markers
    markersRef.current.forEach(({ marker }) => {
      if (marker && marker.setMap) {
        marker.setMap(null)
      }
    })
    markersRef.current = []

    const newMarkers = []

    Object.entries(CITY_AREAS_MAPPING).forEach(([mainCity, areas]) => {
      areas.forEach(area => {
        const coords = areaCoordinates[area]
        if (!coords) return

        const areaClubs = clubsData.filter(club => 
          club.location?.city === mainCity && club.location?.area === area
        )

        // Create marker
        const marker = new window.google.maps.Marker({
          position: coords,
          map: mapInstance,
          title: AREA_DISPLAY_NAMES[area] || area,
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: areaClubs.length > 0 ? 12 : 8,
            fillColor: leagueColors[mainCity],
            fillOpacity: areaClubs.length > 0 ? 0.9 : 0.6,
            strokeColor: '#ffffff',
            strokeWeight: 2
          }
        })

        // Create info window
        const infoWindow = new window.google.maps.InfoWindow({
          content: `
            <div style="padding: 10px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
              <h3 style="margin: 0 0 8px 0; color: #374151; font-size: 16px;">
                ${AREA_DISPLAY_NAMES[area] || area}
              </h3>
              <p style="margin: 0 0 5px 0; color: #6B7280; font-size: 14px;">
                🏆 ${CITY_DISPLAY_NAMES[mainCity] || mainCity} League
              </p>
              <p style="margin: 0; color: ${leagueColors[mainCity]}; font-weight: bold; font-size: 14px;">
                ${areaClubs.length} clubs in this area
              </p>
              ${areaClubs.length > 0 ? `
                <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #E5E7EB;">
                  <small style="color: #6B7280;">Click to manage clubs in this area</small>
                </div>
              ` : ''}
            </div>
          `
        })

        marker.addListener('click', () => {
          infoWindow.open(mapInstance, marker)
        })

        newMarkers.push({ marker, area, mainCity, clubCount: areaClubs.length })
      })
    })

    console.log('✅ Created', newMarkers.length, 'markers')
    markersRef.current = newMarkers
    setDebugInfo(prev => prev + ` | Markers: ${newMarkers.length}`)
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
          createAreaMarkers(mapInstanceRef.current, data.clubs)
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
    if (!window.google || !window.google.maps || !mapRef.current || mapInstanceRef.current) {
      return
    }

    console.log('🎯 All conditions met, creating map NOW!')
    
    try {
      const mapInstance = new window.google.maps.Map(mapRef.current, {
        center: { lat: 36.5, lng: -4.8 },
        zoom: 10,
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
      setLoading(false)
      
      // Create markers if clubs are loaded
      if (clubs.length > 0) {
        createAreaMarkers(mapInstance, clubs)
      }
    } catch (err) {
      console.error('❌ Error creating map:', err)
      setError(err.message)
      setLoading(false)
    }
  }, [clubs]) // Re-run when clubs load

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

    // Load Google Maps if not already loaded
    if (window.google && window.google.maps) {
      console.log('✅ Google Maps already available')
      setDebugInfo(prev => prev + ' | Google Maps: Already loaded')
      return
    }

    // Check for existing script
    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]')
    if (existingScript) {
      console.log('⏳ Script exists, waiting for load...')
      setDebugInfo(prev => prev + ' | Google Maps: Script loading')
      return
    }

    // Create new script
    console.log('📥 Loading Google Maps script...')
    setDebugInfo(prev => prev + ' | Google Maps: Loading')
    
    // Create callback
    window.initMap = () => {
      console.log('✅ Google Maps callback fired!')
      setDebugInfo(prev => prev + ' | Google Maps: Loaded')
      // The useEffect above will handle map creation
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

  // Update markers when clubs change
  useEffect(() => {
    if (mapInstanceRef.current && clubs.length > 0) {
      createAreaMarkers(mapInstanceRef.current, clubs)
    }
  }, [clubs])

  // Filter by league
  const filterByLeague = (league) => {
    if (!mapInstanceRef.current) return
    
    markersRef.current.forEach(({ marker, mainCity }) => {
      if (marker && marker.setVisible) {
        marker.setVisible(league === 'all' || mainCity === league)
      }
    })
    
    setSelectedLeague(league)
  }

  // Get area statistics
  const getAreaStats = () => {
    const stats = {
      totalAreas: 0,
      areasWithClubs: 0,
      totalClubs: 0,
      byLeague: {}
    }

    Object.entries(CITY_AREAS_MAPPING).forEach(([mainCity, areas]) => {
      stats.totalAreas += areas.length
      stats.byLeague[mainCity] = {
        areas: areas.length,
        clubs: 0,
        areasWithClubs: 0
      }

      areas.forEach(area => {
        const areaClubs = clubs.filter(club => 
          club.location?.city === mainCity && club.location?.area === area
        )
        
        if (areaClubs.length > 0) {
          stats.areasWithClubs++
          stats.byLeague[mainCity].areasWithClubs++
        }
        
        stats.totalClubs += areaClubs.length
        stats.byLeague[mainCity].clubs += areaClubs.length
      })
    })

    return stats
  }

  const stats = getAreaStats()

  // Error state
  if (error) {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Google Maps Error</h3>
            <div className="mt-2 text-sm text-red-700">
              <p><strong>Error:</strong> {error}</p>
              <p><strong>API Key Status:</strong> {apiKey ? '✅ Found' : '❌ Not Found'}</p>
              {apiKey && <p><strong>API Key Preview:</strong> {apiKey.substring(0, 20)}...</p>}
              
              <div className="mt-3 p-2 bg-red-100 rounded">
                <strong>Debug Info:</strong><br />
                {debugInfo}
              </div>
              
              <div className="mt-3">
                <p><strong>Steps to fix:</strong></p>
                <ol className="mt-2 list-decimal list-inside space-y-1">
                  <li>Ensure <code className="bg-red-100 px-1 rounded">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> is in .env.local</li>
                  <li>Enable Maps JavaScript API in Google Cloud Console</li>
                  <li>Check browser console for errors</li>
                  <li>Restart your development server</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Main render - ALWAYS render the map container
  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              🗺️ Tennis Areas Map
            </h2>
            <p className="text-gray-600">
              Geographic overview of all {stats.totalAreas} tennis areas across Costa del Sol
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-parque-purple">{stats.totalAreas}</div>
            <div className="text-sm text-gray-600">Total Areas</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-green-600">{stats.areasWithClubs}</div>
            <div className="text-sm text-gray-600">Areas with Clubs</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-blue-600">{stats.totalClubs}</div>
            <div className="text-sm text-gray-600">Total Clubs</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-indigo-600">4</div>
            <div className="text-sm text-gray-600">League Cities</div>
          </div>
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
            All Areas ({stats.totalAreas})
          </button>
          
          {Object.entries(stats.byLeague).map(([league, data]) => (
            <button
              key={league}
              onClick={() => filterByLeague(league)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedLeague === league
                  ? 'text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              style={{
                backgroundColor: selectedLeague === league ? leagueColors[league] : undefined
              }}
            >
              <span style={{ color: selectedLeague !== league ? leagueColors[league] : undefined }}>
                ●
              </span>
              {' '}
              {CITY_DISPLAY_NAMES[league]} ({data.areas} areas, {data.clubs} clubs)
            </button>
          ))}
        </div>
      </div>

      {/* Map Container - ALWAYS RENDERED with loading overlay */}
      <div className="bg-white rounded-lg shadow overflow-hidden relative">
        {/* Map div - always present */}
        <div 
          ref={mapRef}
          className="w-full"
          style={{ height: '600px' }}
        />
        
        {/* Loading overlay - shown only when loading */}
        {loading && (
          <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center z-10">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-parque-purple mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading map...</p>
              <div className="mt-4 p-3 bg-gray-100 rounded text-xs max-w-md">
                <strong>Debug:</strong> {debugInfo || 'Initializing...'}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          League Areas Breakdown
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(stats.byLeague).map(([league, data]) => (
            <div key={league} className="border rounded-lg p-4">
              <div className="flex items-center mb-3">
                <div 
                  className="w-4 h-4 rounded-full mr-3"
                  style={{ backgroundColor: leagueColors[league] }}
                />
                <h4 className="font-semibold text-gray-900">
                  🏆 {CITY_DISPLAY_NAMES[league]} League
                </h4>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Areas:</span>
                  <span className="font-medium">{data.areas}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">With Clubs:</span>
                  <span className="font-medium text-green-600">{data.areasWithClubs}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Clubs:</span>
                  <span className="font-medium text-blue-600">{data.clubs}</span>
                </div>
              </div>
              
              <div className="mt-3 pt-3 border-t">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${(data.areasWithClubs / data.areas) * 100}%`,
                      backgroundColor: leagueColors[league]
                    }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {Math.round((data.areasWithClubs / data.areas) * 100)}% areas with clubs
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Usage Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <div className="flex-1">
            <h4 className="font-medium text-blue-900">
              How to Use This Map
            </h4>
            <div className="text-sm text-blue-800 mt-1 space-y-1">
              <p>• <strong>Click markers</strong> to see area details and club counts</p>
              <p>• <strong>Filter by league</strong> using the colored buttons above</p>
              <p>• <strong>Larger markers</strong> indicate areas with tennis clubs</p>
              <p>• <strong>Colors represent leagues</strong>: Purple (Marbella), Green (Málaga), Orange (Estepona), Red (Sotogrande)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
