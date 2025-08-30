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
  const setupPolygonEditListeners = useCallback((polygon, areaId, onBoundsUpdate, isCustom = false) => {
    if (!polygon || !polygon.getPath) {
      console.error('Invalid polygon for edit listeners setup')
      return []
    }

    const updateBounds = () => {
      try {
        const path = polygon.getPath()
        if (!path || typeof path.getLength !== 'function') {
          console.error('Invalid polygon path')
          return
        }

        const bounds = pathToBounds(path)
        console.log(`🔄 Bounds updated for ${areaId}:`, bounds.length, 'points')
        
        if (onBoundsUpdate && bounds.length >= 3) {
          onBoundsUpdate(areaId, bounds, isCustom)
        }
      } catch (error) {
        console.error('Error updating bounds:', error)
      }
    }

    // Listen for path changes
    const path = polygon.getPath()
    const listeners = []
    
    try {
      listeners.push(
        window.google.maps.event.addListener(path, 'set_at', updateBounds),
        window.google.maps.event.addListener(path, 'insert_at', updateBounds),
        window.google.maps.event.addListener(path, 'remove_at', updateBounds)
      )
      
      // Store listeners for cleanup
      polygon._editListeners = listeners
      
      console.log(`✅ Set up edit listeners for area: ${areaId}`)
      return listeners
    } catch (error) {
      console.error('Error setting up polygon edit listeners:', error)
      return []
    }
  }, [])

  /**
   * Remove edit listeners from a polygon
   */
  const removePolygonEditListeners = useCallback((polygon) => {
    if (polygon._editListeners) {
      polygon._editListeners.forEach(listener => {
        try {
          window.google.maps.event.removeListener(listener)
        } catch (error) {
          console.error('Error removing listener:', error)
        }
      })
      polygon._editListeners = null
    }
  }, [])

  /**
   * Draw boundaries on the map
   */
  const drawBoundaries = useCallback((options = {}) => {
    if (!mapInstance || !window.google?.maps?.Polygon) {
      console.warn('Map instance or Google Maps Polygon not available for drawing boundaries')
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
    
    // Clear existing polygons first
    polygonsRef.current.forEach((polygon, key) => {
      try {
        removePolygonEditListeners(polygon)
        if (polygon.setMap) {
          polygon.setMap(null)
        }
      } catch (error) {
        console.error(`Error clearing polygon ${key}:`, error)
      }
    })
    polygonsRef.current.clear()

    // Don't draw anything if boundaries are disabled
    if (boundaryType === 'none') {
      console.log('🚫 Boundary type is none, skipping drawing')
      return
    }

    try {
      // Draw existing league polygons (with modifications if any)
      console.log('🎨 Drawing static league boundaries...')
      Object.entries(LEAGUE_POLYGONS).forEach(([league, data]) => {
        const bounds = modifiedLeagues[league]?.bounds || data.bounds
        const isModified = !!modifiedLeagues[league]
        
        // Use appropriate styles based on edit mode
        const styles = editMode ? POLYGON_STYLES.editMode : POLYGON_STYLES.default
        
        // Ensure visibility by setting minimum opacity values
        const fillOpacity = Math.max(styles.fillOpacity || 0.1, 0.1)
        const strokeOpacity = Math.max(styles.strokeOpacity || 0.8, 0.8)
        
        console.log(`  - Creating ${league} polygon (modified: ${isModified})`)
        
        try {
          const polygon = new window.google.maps.Polygon({
            paths: bounds,
            strokeColor: data.color,
            strokeOpacity: strokeOpacity,
            strokeWeight: styles.strokeWeight || 2,
            fillColor: data.color,
            fillOpacity: fillOpacity,
            map: mapInstance,
            editable: editMode && (styles.editable !== false),
            draggable: editMode && (styles.draggable !== false),
            clickable: true
          })

          // Add click listener
          if (polygon.addListener) {
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
          }

          polygonsRef.current.set(league, polygon)
          
          // Setup edit listeners if in edit mode
          if (editMode && onBoundsUpdate) {
            setupPolygonEditListeners(polygon, league, onBoundsUpdate, false)
          }
          
          console.log(`    ✅ ${league} polygon created successfully`)
        } catch (error) {
          console.error(`    ❌ Error creating ${league} polygon:`, error)
        }
      })

      // Draw custom areas
      if (customAreas.length > 0) {
        console.log('🎨 Drawing custom areas...')
        customAreas.forEach((area, index) => {
          const styles = editMode ? POLYGON_STYLES.editMode : POLYGON_STYLES.default
          const fillOpacity = Math.max(styles.fillOpacity || 0.1, 0.1)
          const strokeOpacity = Math.max(styles.strokeOpacity || 0.8, 0.8)
          
          console.log(`  - Creating custom area: ${area.name || area.id}`)
          
          try {
            const polygon = new window.google.maps.Polygon({
              paths: area.bounds,
              strokeColor: area.color,
              strokeOpacity: strokeOpacity,
              strokeWeight: styles.strokeWeight || 2,
              fillColor: area.color,
              fillOpacity: fillOpacity,
              map: mapInstance,
              editable: editMode && (styles.editable !== false),
              draggable: editMode && (styles.draggable !== false),
              clickable: true
            })

            if (polygon.addListener) {
              polygon.addListener('click', () => {
                if (editMode && onAreaClick) {
                  onAreaClick(area.id)
                }
              })
            }

            polygonsRef.current.set(area.id, polygon)
            
            if (editMode && onBoundsUpdate) {
              setupPolygonEditListeners(polygon, area.id, onBoundsUpdate, true)
            }
            
            console.log(`    ✅ Custom area ${area.name || area.id} created successfully`)
          } catch (error) {
            console.error(`    ❌ Error creating custom area ${area.name || area.id}:`, error)
          }
        })
      }

      console.log(`✅ Successfully drew ${polygonsRef.current.size} polygons on map`)
    } catch (error) {
      console.error('❌ Error in drawBoundaries:', error)
    }
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
          if (polygon.setMap) {
            polygon.setMap(null)
          }
          polygonsRef.current.delete(id)
        }
      })
    } else {
      polygonsRef.current.forEach(polygon => {
        removePolygonEditListeners(polygon)
        if (polygon.setMap) {
          polygon.setMap(null)
        }
      })
      polygonsRef.current.clear()
    }
  }, [removePolygonEditListeners])

  /**
   * Set editability for all polygons
   */
  const setPolygonEditability = useCallback((editable) => {
    const styles = editable ? POLYGON_STYLES.editMode : POLYGON_STYLES.default
    
    // Ensure minimum visibility
    const fillOpacity = Math.max(styles.fillOpacity || 0.1, 0.1)
    const strokeOpacity = Math.max(styles.strokeOpacity || 0.8, 0.8)
    
    polygonsRef.current.forEach(polygon => {
      if (polygon.setOptions) {
        try {
          polygon.setOptions({
            editable: editable && (styles.editable !== false),
            draggable: editable && (styles.draggable !== false),
            strokeOpacity: strokeOpacity,
            fillOpacity: fillOpacity,
            strokeWeight: styles.strokeWeight || 2
          })
        } catch (error) {
          console.error('Error updating polygon options:', error)
        }
      }
    })
    
    console.log(`🔧 Updated polygon editability: ${editable}`)
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (drawingManager) {
        try {
          drawingManager.setMap(null)
        } catch (error) {
          console.error('Error cleaning up drawing manager:', error)
        }
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