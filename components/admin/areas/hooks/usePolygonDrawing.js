/**
 * Custom hook for managing polygon drawing and editing
 * Handles drawing manager, polygon creation, and edit listeners
 */
import { useState, useRef, useCallback } from 'react'
import { 
  DRAWING_OPTIONS, 
  POLYGON_STYLES,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES 
} from '../constants/mapConfig'
import { pathToBounds } from '../utils/polygonHelpers'
import { LEAGUE_POLYGONS } from '@/lib/utils/geographicBoundaries'

export default function usePolygonDrawing() {
  const [editMode, setEditMode] = useState(false)
  const [drawingMode, setDrawingMode] = useState(false)
  const [selectedArea, setSelectedArea] = useState(null)
  const [boundaryType, setBoundaryType] = useState('polygons')
  
  const drawingManagerRef = useRef(null)
  const polygonsRef = useRef(new Map())

  /**
   * Initialize the drawing manager for creating new polygons
   */
  const initializeDrawingManager = useCallback((mapInstance, onPolygonComplete) => {
    if (!window.google?.maps?.drawing?.DrawingManager) {
      console.warn(ERROR_MESSAGES.drawingLibraryUnavailable)
      return null
    }

    const drawingManager = new window.google.maps.drawing.DrawingManager({
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

    drawingManager.setMap(mapInstance)
    drawingManagerRef.current = drawingManager

    // Listen for polygon completion
    window.google.maps.event.addListener(drawingManager, 'polygoncomplete', (polygon) => {
      const bounds = pathToBounds(polygon.getPath())
      if (onPolygonComplete) {
        onPolygonComplete(polygon, bounds)
      }
      setDrawingMode(false)
      drawingManager.setDrawingMode(null)
    })

    return drawingManager
  }, [])

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
   * Draw league boundaries as polygons on the map
   */
  const drawLeagueBoundaries = useCallback((
    mapInstance, 
    customAreas = [], 
    modifiedLeagues = {},
    onPolygonClick,
    onBoundsUpdate
  ) => {
    console.log('🗺️ Drawing league boundaries with modifications:', modifiedLeagues)
    
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
        if (editMode) {
          setSelectedArea(league)
          if (onPolygonClick) {
            onPolygonClick(league, false)
          }
        } else {
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
        if (editMode) {
          setSelectedArea(area.id)
          if (onPolygonClick) {
            onPolygonClick(area.id, true)
          }
        }
      })

      polygonsRef.current.set(area.id, polygon)
      
      if (editMode && onBoundsUpdate) {
        setupPolygonEditListeners(polygon, area.id, (id, bounds) => {
          onBoundsUpdate(id, bounds, true) // true = custom
        })
      }
    })
  }, [editMode, boundaryType, setupPolygonEditListeners, removePolygonEditListeners])

  /**
   * Style a polygon with specific options
   */
  const stylePolygon = useCallback((polygon, options) => {
    if (polygon && polygon.setOptions) {
      polygon.setOptions(options)
    }
  }, [])

  /**
   * Delete a polygon from the map
   */
  const deletePolygon = useCallback((areaId) => {
    const polygon = polygonsRef.current.get(areaId)
    if (polygon) {
      removePolygonEditListeners(polygon)
      polygon.setMap(null)
      polygonsRef.current.delete(areaId)
    }
  }, [removePolygonEditListeners])

  /**
   * Toggle drawing mode
   */
  const toggleDrawingMode = useCallback(() => {
    if (!drawingManagerRef.current) return false
    
    const newDrawingMode = !drawingMode
    setDrawingMode(newDrawingMode)
    drawingManagerRef.current.setDrawingMode(
      newDrawingMode ? window.google.maps.drawing.OverlayType.POLYGON : null
    )
    
    return newDrawingMode
  }, [drawingMode])

  /**
   * Toggle edit mode for all polygons
   */
  const toggleEditMode = useCallback((showNotification) => {
    const newEditMode = !editMode
    setEditMode(newEditMode)
    
    if (newEditMode) {
      // Entering edit mode - make polygons editable
      polygonsRef.current.forEach((polygon) => {
        polygon.setOptions(POLYGON_STYLES.editMode)
      })
      if (showNotification) {
        showNotification(SUCCESS_MESSAGES.editModeEnabled, 'info')
      }
    } else {
      // Exiting edit mode - make polygons read-only
      polygonsRef.current.forEach((polygon) => {
        polygon.setOptions(POLYGON_STYLES.default)
      })
      setSelectedArea(null)
      setDrawingMode(false)
      if (drawingManagerRef.current) {
        drawingManagerRef.current.setDrawingMode(null)
      }
    }
    
    return newEditMode
  }, [editMode])

  /**
   * Update polygon styles based on edit mode
   */
  const updatePolygonStyles = useCallback(() => {
    const styles = editMode ? POLYGON_STYLES.editMode : POLYGON_STYLES.default
    polygonsRef.current.forEach(polygon => {
      polygon.setOptions({
        editable: styles.editable,
        draggable: styles.draggable,
        strokeOpacity: styles.strokeOpacity,
        fillOpacity: styles.fillOpacity
      })
    })
  }, [editMode])

  /**
   * Get a polygon by area ID
   */
  const getPolygon = useCallback((areaId) => {
    return polygonsRef.current.get(areaId)
  }, [])

  /**
   * Clear all polygons from the map
   */
  const clearPolygons = useCallback(() => {
    polygonsRef.current.forEach(polygon => {
      removePolygonEditListeners(polygon)
      polygon.setMap(null)
    })
    polygonsRef.current.clear()
  }, [removePolygonEditListeners])

  return {
    // State
    editMode,
    drawingMode,
    selectedArea,
    boundaryType,
    
    // Refs
    drawingManagerRef,
    polygonsRef,
    
    // Actions
    initializeDrawingManager,
    setupPolygonEditListeners,
    removePolygonEditListeners,
    drawLeagueBoundaries,
    stylePolygon,
    deletePolygon,
    toggleDrawingMode,
    toggleEditMode,
    updatePolygonStyles,
    getPolygon,
    clearPolygons,
    
    // Setters
    setEditMode,
    setDrawingMode,
    setSelectedArea,
    setBoundaryType
  }
}