/**
 * Custom hook for managing polygon drawing and editing
 * Handles drawing manager, polygon creation, and edit listeners
 */
import { useState, useRef, useCallback, useEffect } from 'react'
import { 
  DRAWING_OPTIONS, 
  POLYGON_STYLES,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES 
} from '../constants/mapConfig'
import { pathToBounds } from '../utils/polygonHelpers'
import { LEAGUE_POLYGONS } from '@/lib/utils/geographicBoundaries'

export default function usePolygonDrawing(mapInstance) {
  const [drawingManager, setDrawingManager] = useState(null)
  const polygonsRef = useRef(new Map())
  const drawingModeRef = useRef(false)

  /**
   * Initialize the drawing manager for creating new polygons
   */
  const initializeDrawing = useCallback((options = {}) => {
    if (!mapInstance) {
      console.warn('Map instance not available for drawing manager')
      return null
    }

    if (!window.google?.maps?.drawing?.DrawingManager) {
      console.warn(ERROR_MESSAGES.drawingLibraryUnavailable)
      return null
    }

    // Clear existing drawing manager if any
    if (drawingManager) {
      drawingManager.setMap(null)
    }

    const newDrawingManager = new window.google.maps.drawing.DrawingManager({
      drawingMode: null,
      drawingControl: false,
      polygonOptions: {
        fillColor: DRAWING_OPTIONS.fillColor,
        fillOpacity: DRAWING_OPTIONS.fillOpacity,
        strokeColor: '#8B5CF6',
        strokeOpacity: DRAWING_OPTIONS.strokeOpacity,
        strokeWeight: DRAWING_OPTIONS.strokeWeight,
        editable: DRAWING_OPTIONS.editable,
        draggable: DRAWING_OPTIONS.draggable
      }
    })

    newDrawingManager.setMap(mapInstance)
    setDrawingManager(newDrawingManager)

    // Listen for polygon completion
    if (options.onPolygonComplete) {
      window.google.maps.event.addListener(newDrawingManager, 'polygoncomplete', (polygon) => {
        options.onPolygonComplete(polygon)
        drawingModeRef.current = false
        newDrawingManager.setDrawingMode(null)
      })
    }

    return newDrawingManager
  }, [mapInstance, drawingManager])

  /**
   * Toggle drawing mode
   */
  const toggleDrawing = useCallback((enabled) => {
    if (!drawingManager) {
      console.warn('Drawing manager not initialized')
      return false
    }
    
    drawingModeRef.current = enabled
    drawingManager.setDrawingMode(
      enabled ? window.google.maps.drawing.OverlayType.POLYGON : null
    )
    
    return enabled
  }, [drawingManager])

  /**
   * Setup edit listeners for a polygon
   */
  const setupPolygonEditListeners = useCallback((polygon, areaId, onBoundsUpdate) => {
    const updateBounds = () => {
      const bounds = pathToBounds(polygon.getPath())
      if (onBoundsUpdate) {
        onBoundsUpdate(areaId, bounds)
      }
    }

    // Listen for path changes
    const path = polygon.getPath()
    const listeners = []
    
    listeners.push(
      window.google.maps.event.addListener(path, 'set_at', updateBounds),
      window.google.maps.event.addListener(path, 'insert_at', updateBounds),
      window.google.maps.event.addListener(path, 'remove_at', updateBounds)
    )
    
    // Store listeners for cleanup
    polygon._editListeners = listeners
    
    return listeners
  }, [])

  /**
   * Remove edit listeners from a polygon
   */
  const removePolygonEditListeners = useCallback((polygon) => {
    if (polygon._editListeners) {
      polygon._editListeners.forEach(listener => {
        window.google.maps.event.removeListener(listener)
      })
      polygon._editListeners = null
    }
  }, [])

  /**
   * Draw boundaries on the map
   */
  const drawBoundaries = useCallback((options = {}) => {
    if (!mapInstance) {
      console.warn('Map instance not available for drawing boundaries')
      return
    }

    const {
      customAreas = [],
      modifiedLeagues = {},
      boundaryType = 'polygons',
      editMode = false,
      onAreaClick,
      onBoundsUpdate
    } = options

    console.log('🗺️ Drawing boundaries:', {
      customAreasCount: customAreas.length,
      modifiedLeaguesCount: Object.keys(modifiedLeagues).length,
      boundaryType,
      editMode
    })
    
    // Clear existing polygons
    polygonsRef.current.forEach(polygon => {
      removePolygonEditListeners(polygon)
      polygon.setMap(null)
    })
    polygonsRef.current.clear()

    if (boundaryType === 'none') return

    // Draw existing league polygons (with modifications if any)
    Object.entries(LEAGUE_POLYGONS).forEach(([league, data]) => {
      const bounds = modifiedLeagues[league]?.bounds || data.bounds
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
        if (editMode && onAreaClick) {
          onAreaClick(league)
        } else if (!editMode) {
          // Show info window in view mode
          const infoWindow = new window.google.maps.InfoWindow()
          infoWindow.setContent(`
            <div style="padding: 10px;">
              <h3 style="margin: 0; color: ${data.color};">
                🏆 ${data.name} League Area ${isModified ? '(Modified)' : ''}
              </h3>
              ${isModified ? '<small style="color: #F59E0B;">⚠️ This area has been modified</small>' : ''}
            </div>
          `)
          infoWindow.setPosition(event.latLng)
          infoWindow.open(mapInstance)
        }
      })

      polygonsRef.current.set(league, polygon)
      
      // Setup edit listeners if in edit mode
      if (editMode && onBoundsUpdate) {
        setupPolygonEditListeners(polygon, league, (id, bounds) => {
          onBoundsUpdate(id, bounds, false) // false = not custom
        })
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
        if (editMode && onAreaClick) {
          onAreaClick(area.id)
        }
      })

      polygonsRef.current.set(area.id, polygon)
      
      if (editMode && onBoundsUpdate) {
        setupPolygonEditListeners(polygon, area.id, (id, bounds) => {
          onBoundsUpdate(id, bounds, true) // true = custom
        })
      }
    })

    console.log(`✅ Drew ${polygonsRef.current.size} polygons on map`)
  }, [mapInstance, setupPolygonEditListeners, removePolygonEditListeners])

  /**
   * Clear specific polygons or all if no IDs provided
   */
  const clearPolygons = useCallback((polygonIds = null) => {
    if (polygonIds) {
      polygonIds.forEach(id => {
        const polygon = polygonsRef.current.get(id)
        if (polygon) {
          removePolygonEditListeners(polygon)
          polygon.setMap(null)
          polygonsRef.current.delete(id)
        }
      })
    } else {
      polygonsRef.current.forEach(polygon => {
        removePolygonEditListeners(polygon)
        polygon.setMap(null)
      })
      polygonsRef.current.clear()
    }
  }, [removePolygonEditListeners])

  /**
   * Set editability for all polygons
   */
  const setPolygonEditability = useCallback((editable) => {
    const styles = editable ? POLYGON_STYLES.editMode : POLYGON_STYLES.default
    polygonsRef.current.forEach(polygon => {
      polygon.setOptions({
        editable: styles.editable,
        draggable: styles.draggable,
        strokeOpacity: styles.strokeOpacity,
        fillOpacity: styles.fillOpacity
      })
    })
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (drawingManager) {
        drawingManager.setMap(null)
      }
      clearPolygons()
    }
  }, [drawingManager, clearPolygons])

  return {
    drawingManager,
    initializeDrawing,
    toggleDrawing,
    drawBoundaries,
    clearPolygons,
    setPolygonEditability
  }
}
