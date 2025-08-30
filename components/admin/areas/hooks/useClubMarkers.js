/**
 * Custom hook for managing club markers on the map
 * Handles fetching clubs, creating markers, and filtering
 */
import { useState, useRef, useCallback, useEffect } from 'react'
import { API_ENDPOINTS, MARKER_CONFIG } from '../constants/mapConfig'
import { LEAGUE_POLYGONS, determineLeagueByLocation, isPointInPolygon } from '@/lib/utils/geographicBoundaries'

export default function useClubMarkers() {
  const [clubs, setClubs] = useState([])
  const [selectedLeague, setSelectedLeague] = useState('all')
  const [loadingClubs, setLoadingClubs] = useState(false)
  const markersRef = useRef([])

  /**
   * Determine league based on modified boundaries (if any) or static boundaries
   */
  const determineLeagueByModifiedLocation = useCallback((lat, lng, modifiedLeagues = {}) => {
    // First check modified league boundaries
    for (const [league, modifiedBounds] of Object.entries(modifiedLeagues)) {
      if (modifiedBounds && modifiedBounds.length >= 3) {
        const polygon = modifiedBounds.map(point => ({ lat: point.lat(), lng: point.lng() }))
        if (isPointInPolygon(lat, lng, polygon)) {
          return league
        }
      }
    }
    
    // Fallback to static boundaries
    return determineLeagueByLocation(lat, lng)
  }, [])

  /**
   * Fetch clubs from the API
   */
  const fetchClubs = useCallback(async () => {
    setLoadingClubs(true)
    try {
      const response = await fetch(`${API_ENDPOINTS.clubs}?limit=1000`)
      if (response.ok) {
        const data = await response.json()
        setClubs(data.clubs || [])
        return data.clubs || []
      }
      return []
    } catch (error) {
      console.error('❌ Error fetching clubs:', error)
      return []
    } finally {
      setLoadingClubs(false)
    }
  }, [])

  /**
   * Create club markers on the map
   */
  const createClubMarkers = useCallback((mapInstance, clubsData, editMode = false, modifiedLeagues = {}) => {
    console.log('📍 Creating club markers with', clubsData.length, 'clubs, modified leagues:', Object.keys(modifiedLeagues).length)
    
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

      // Determine which league this club belongs to based on coordinates (including modified boundaries)
      const league = determineLeagueByModifiedLocation(
        club.location.coordinates.lat,
        club.location.coordinates.lng,
        modifiedLeagues
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
                ${Object.keys(modifiedLeagues).length > 0 ? ' • Using modified boundaries' : ''}
              </small>
            </div>
          </div>
        `
      })

      marker.addListener('click', () => {
        infoWindow.open(mapInstance, marker)
      })

      newMarkers.push({ marker, club, league, originalLeague: league })
    })

    console.log('✅ Created', newMarkers.length, 'club markers')
    markersRef.current = newMarkers
    
    return newMarkers
  }, [determineLeagueByModifiedLocation])

  /**
   * Update marker assignments and colors when boundaries change
   */
  const updateMarkerAssignments = useCallback((modifiedLeagues = {}) => {
    console.log('🔄 Updating marker assignments with modified leagues:', Object.keys(modifiedLeagues))
    
    let changedCount = 0
    
    markersRef.current.forEach(({ marker, club }, index) => {
      if (!marker || !club.location?.coordinates?.lat || !club.location?.coordinates?.lng) return

      // Re-determine league assignment
      const newLeague = determineLeagueByModifiedLocation(
        club.location.coordinates.lat,
        club.location.coordinates.lng,
        modifiedLeagues
      )

      const oldLeague = markersRef.current[index].league
      
      // Update if league assignment changed
      if (newLeague !== oldLeague) {
        changedCount++
        console.log(`📍 Club "${club.name}" moved from ${oldLeague || 'unassigned'} to ${newLeague || 'unassigned'}`)
        
        // Update marker reference
        markersRef.current[index].league = newLeague
        
        // Update marker color
        const leagueColor = newLeague ? LEAGUE_POLYGONS[newLeague].color : '#6B7280'
        const leagueName = newLeague ? LEAGUE_POLYGONS[newLeague].name : 'Unassigned'
        
        if (marker.setIcon) {
          const currentIcon = marker.getIcon()
          marker.setIcon({
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: currentIcon.scale || MARKER_CONFIG.default.scale,
            fillColor: leagueColor,
            fillOpacity: currentIcon.fillOpacity || MARKER_CONFIG.default.fillOpacity,
            strokeColor: MARKER_CONFIG.default.strokeColor,
            strokeWeight: MARKER_CONFIG.default.strokeWeight
          })
        }

        // Update info window content
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
                  Updated assignment based on modified boundaries
                </small>
              </div>
            </div>
          `
        })

        // Remove old click listener and add new one
        marker.addListener('click', () => {
          infoWindow.open(marker.getMap(), marker)
        })
      }
    })
    
    console.log(`✅ Updated ${changedCount} club assignments`)
    return changedCount
  }, [determineLeagueByModifiedLocation])

  /**
   * Update marker icons (e.g., when edit mode changes)
   */
  const updateMarkerIcons = useCallback((editMode = false) => {
    markersRef.current.forEach(({ marker, league }) => {
      if (marker && marker.setIcon) {
        const leagueColor = league ? LEAGUE_POLYGONS[league].color : '#6B7280'
        
        marker.setIcon({
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: editMode ? MARKER_CONFIG.editMode.scale : MARKER_CONFIG.default.scale,
          fillColor: leagueColor,
          fillOpacity: editMode ? MARKER_CONFIG.editMode.fillOpacity : MARKER_CONFIG.default.fillOpacity,
          strokeColor: MARKER_CONFIG.default.strokeColor,
          strokeWeight: MARKER_CONFIG.default.strokeWeight
        })
      }
    })
  }, [])

  /**
   * Filter markers by league
   */
  const filterByLeague = useCallback((league) => {
    markersRef.current.forEach(({ marker, league: markerLeague }) => {
      if (marker && marker.setVisible) {
        marker.setVisible(league === 'all' || markerLeague === league)
      }
    })
    
    setSelectedLeague(league)
  }, [])

  /**
   * Clear all markers from the map
   */
  const clearMarkers = useCallback(() => {
    markersRef.current.forEach(({ marker }) => {
      if (marker && marker.setMap) {
        marker.setMap(null)
      }
    })
    markersRef.current = []
  }, [])

  /**
   * Get markers within a specific area/polygon
   */
  const getMarkersInArea = useCallback((polygonPath) => {
    if (!window.google?.maps?.geometry) {
      console.warn('Google Maps geometry library not loaded')
      return []
    }

    return markersRef.current.filter(({ marker }) => {
      if (!marker || !marker.getPosition) return false
      
      const position = marker.getPosition()
      return window.google.maps.geometry.poly.containsLocation(position, polygonPath)
    })
  }, [])

  /**
   * Get club count by league
   */
  const getClubCountByLeague = useCallback(() => {
    const counts = {}
    
    markersRef.current.forEach(({ league }) => {
      if (league) {
        counts[league] = (counts[league] || 0) + 1
      } else {
        counts.unassigned = (counts.unassigned || 0) + 1
      }
    })
    
    return counts
  }, [])

  return {
    // State
    clubs,
    selectedLeague,
    loadingClubs,
    
    // Refs
    markersRef,
    
    // Actions
    fetchClubs,
    createClubMarkers,
    updateMarkerAssignments,
    updateMarkerIcons,
    filterByLeague,
    clearMarkers,
    getMarkersInArea,
    getClubCountByLeague,
    
    // Setters
    setClubs
  }
}
