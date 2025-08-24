/**
 * Custom hook for initializing and managing Google Maps instance
 * Handles map script loading, map creation, and lifecycle
 */
import { useState, useRef, useEffect, useCallback } from 'react'
import { MAP_CONFIG, ERROR_MESSAGES } from '../constants/mapConfig'

export default function useMapInitialization() {
  const [googleMapsLoaded, setGoogleMapsLoaded] = useState(false)
  const [mapLoading, setMapLoading] = useState(true)
  const [mapError, setMapError] = useState(null)
  
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)

  /**
   * Check if Google Maps is already loaded
   */
  const checkGoogleMapsLoaded = useCallback(() => {
    return window.google && window.google.maps
  }, [])

  /**
   * Load Google Maps script
   */
  const loadGoogleMapsScript = useCallback(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    
    if (!apiKey) {
      setMapError(ERROR_MESSAGES.noApiKey)
      setMapLoading(false)
      return
    }

    // Check if already loaded
    if (checkGoogleMapsLoaded()) {
      setGoogleMapsLoaded(true)
      return
    }

    // Check if script is already loading
    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]')
    if (existingScript) {
      const checkInterval = setInterval(() => {
        if (checkGoogleMapsLoaded()) {
          setGoogleMapsLoaded(true)
          clearInterval(checkInterval)
        }
      }, 100)
      
      // Cleanup interval after 10 seconds to prevent memory leaks
      setTimeout(() => clearInterval(checkInterval), 10000)
      return
    }

    // Set up callback for when maps loads
    window.initMap = () => {
      setGoogleMapsLoaded(true)
      delete window.initMap // Clean up global callback
    }
    
    // Create and append script
    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=${MAP_CONFIG.libraries.join(',')}&callback=initMap`
    script.async = true
    script.defer = true
    
    script.onerror = () => {
      setMapError(ERROR_MESSAGES.mapLoadFailed)
      setMapLoading(false)
      delete window.initMap
    }
    
    document.head.appendChild(script)
  }, [checkGoogleMapsLoaded])

  /**
   * Initialize the map instance
   */
  const initializeMap = useCallback((containerRef) => {
    if (!googleMapsLoaded || !containerRef || mapInstanceRef.current) {
      return null
    }

    try {
      const mapInstance = new window.google.maps.Map(containerRef, {
        center: MAP_CONFIG.defaultCenter,
        zoom: MAP_CONFIG.defaultZoom,
        styles: MAP_CONFIG.styles,
        mapTypeControl: true,
        mapTypeControlOptions: {
          style: window.google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
          position: window.google.maps.ControlPosition.TOP_RIGHT
        },
        zoomControl: true,
        zoomControlOptions: {
          position: window.google.maps.ControlPosition.RIGHT_CENTER
        },
        streetViewControl: true,
        streetViewControlOptions: {
          position: window.google.maps.ControlPosition.RIGHT_BOTTOM
        },
        fullscreenControl: true,
        fullscreenControlOptions: {
          position: window.google.maps.ControlPosition.RIGHT_TOP
        }
      })

      mapInstanceRef.current = mapInstance
      setMapLoading(false)
      
      console.log('✅ Map initialized successfully')
      return mapInstance
    } catch (err) {
      console.error('❌ Error creating map:', err)
      setMapError(err.message)
      setMapLoading(false)
      return null
    }
  }, [googleMapsLoaded])

  /**
   * Center the map on specific coordinates
   */
  const centerMap = useCallback((lat, lng, zoom) => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setCenter({ lat, lng })
      if (zoom) {
        mapInstanceRef.current.setZoom(zoom)
      }
    }
  }, [])

  /**
   * Fit map bounds to show all markers/polygons
   */
  const fitBounds = useCallback((bounds) => {
    if (mapInstanceRef.current && bounds) {
      const mapBounds = new window.google.maps.LatLngBounds()
      
      bounds.forEach(coord => {
        mapBounds.extend(new window.google.maps.LatLng(coord.lat, coord.lng))
      })
      
      mapInstanceRef.current.fitBounds(mapBounds)
    }
  }, [])

  /**
   * Add a control to the map
   */
  const addMapControl = useCallback((controlElement, position = 'TOP_CENTER') => {
    if (mapInstanceRef.current && controlElement) {
      const controlPosition = window.google.maps.ControlPosition[position]
      mapInstanceRef.current.controls[controlPosition].push(controlElement)
    }
  }, [])

  /**
   * Get the current map bounds
   */
  const getMapBounds = useCallback(() => {
    if (mapInstanceRef.current) {
      const bounds = mapInstanceRef.current.getBounds()
      if (bounds) {
        return {
          north: bounds.getNorthEast().lat(),
          east: bounds.getNorthEast().lng(),
          south: bounds.getSouthWest().lat(),
          west: bounds.getSouthWest().lng()
        }
      }
    }
    return null
  }, [])

  /**
   * Get the current map center
   */
  const getMapCenter = useCallback(() => {
    if (mapInstanceRef.current) {
      const center = mapInstanceRef.current.getCenter()
      if (center) {
        return {
          lat: center.lat(),
          lng: center.lng()
        }
      }
    }
    return null
  }, [])

  /**
   * Get the current map zoom level
   */
  const getMapZoom = useCallback(() => {
    if (mapInstanceRef.current) {
      return mapInstanceRef.current.getZoom()
    }
    return null
  }, [])

  /**
   * Set map options
   */
  const setMapOptions = useCallback((options) => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setOptions(options)
    }
  }, [])

  /**
   * Add a listener to the map
   */
  const addMapListener = useCallback((eventName, handler) => {
    if (mapInstanceRef.current) {
      return window.google.maps.event.addListener(mapInstanceRef.current, eventName, handler)
    }
    return null
  }, [])

  /**
   * Remove a listener from the map
   */
  const removeMapListener = useCallback((listener) => {
    if (listener) {
      window.google.maps.event.removeListener(listener)
    }
  }, [])

  /**
   * Clean up map instance
   */
  const destroyMap = useCallback(() => {
    if (mapInstanceRef.current) {
      // Clear all event listeners
      window.google.maps.event.clearInstanceListeners(mapInstanceRef.current)
      mapInstanceRef.current = null
    }
  }, [])

  // Load Google Maps script on mount
  useEffect(() => {
    loadGoogleMapsScript()
    
    // Cleanup on unmount
    return () => {
      destroyMap()
    }
  }, [loadGoogleMapsScript, destroyMap])

  return {
    // State
    googleMapsLoaded,
    mapLoading,
    mapError,
    
    // Refs
    mapRef,
    mapInstanceRef,
    
    // Actions
    initializeMap,
    centerMap,
    fitBounds,
    addMapControl,
    getMapBounds,
    getMapCenter,
    getMapZoom,
    setMapOptions,
    addMapListener,
    removeMapListener,
    destroyMap,
    
    // Utilities
    checkGoogleMapsLoaded
  }
}