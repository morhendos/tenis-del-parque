/**
 * Custom hook for orchestrating area management
 * Combines functionality from other hooks and manages overall state
 */
import { useState, useCallback } from 'react'
import { pathToBounds, calculatePolygonCenter } from '../utils/polygonHelpers'
import { generateSlug } from '../utils/areaCalculations'
import { AREA_COLORS, SUCCESS_MESSAGES } from '../constants/mapConfig'

export default function useAreaManagement() {
  const [notification, setNotification] = useState(null)
  const [debugInfo, setDebugInfo] = useState('')

  /**
   * Show a notification message
   */
  const showNotification = useCallback((message, type = 'info') => {
    setNotification({ message, type })
  }, [])

  /**
   * Hide the current notification
   */
  const hideNotification = useCallback(() => {
    setNotification(null)
  }, [])

  /**
   * Create a custom area from a polygon
   */
  const createCustomAreaFromPolygon = useCallback((polygon, customAreas) => {
    const bounds = pathToBounds(polygon.getPath())
    const name = `Custom Area ${customAreas.length + 1}`
    
    const newArea = {
      id: `custom_${Date.now()}`,
      name,
      slug: generateSlug(name),
      bounds: bounds,
      center: calculatePolygonCenter(bounds),
      color: AREA_COLORS[customAreas.length % AREA_COLORS.length],
      isCustom: true
    }

    // Style the polygon
    polygon.setOptions({
      fillColor: newArea.color,
      strokeColor: newArea.color,
      fillOpacity: 0.2,
      strokeOpacity: 0.8,
      strokeWeight: 2
    })

    showNotification(`${SUCCESS_MESSAGES.areaCreated}: ${name}`, 'success')
    
    return newArea
  }, [showNotification])

  /**
   * Handle polygon completion from drawing manager
   */
  const handlePolygonComplete = useCallback((
    polygon,
    bounds,
    addCustomArea,
    polygonsRef,
    setupEditListeners
  ) => {
    const customAreas = [] // This would come from the persistence hook
    const newArea = createCustomAreaFromPolygon(polygon, customAreas)
    
    // Add the area using the persistence hook
    const addedArea = addCustomArea(newArea)
    
    // Store polygon reference
    if (polygonsRef && polygonsRef.current) {
      polygonsRef.current.set(addedArea.id, polygon)
    }
    
    // Setup edit listeners
    if (setupEditListeners) {
      setupEditListeners(polygon, addedArea.id, (id, updatedBounds) => {
        // This will be handled by the update callback
      })
    }
    
    return addedArea
  }, [createCustomAreaFromPolygon])

  /**
   * Handle bounds update for areas
   */
  const handleBoundsUpdate = useCallback((
    areaId,
    newBounds,
    isCustom,
    updateCustomArea,
    trackLeagueModification
  ) => {
    const updatedCenter = calculatePolygonCenter(newBounds)
    
    if (isCustom) {
      // Update custom area
      updateCustomArea(areaId, { 
        bounds: newBounds, 
        center: updatedCenter 
      })
    } else {
      // Track league modification
      trackLeagueModification(areaId, newBounds)
    }
  }, [])

  /**
   * Handle area deletion
   */
  const handleDeleteArea = useCallback((
    selectedArea,
    deleteCustomArea,
    deletePolygon,
    setSelectedArea
  ) => {
    if (!selectedArea || !selectedArea.startsWith('custom_')) {
      showNotification('Only custom areas can be deleted', 'warning')
      return false
    }
    
    const deletedArea = deleteCustomArea(selectedArea)
    deletePolygon(selectedArea)
    setSelectedArea(null)
    
    if (deletedArea) {
      showNotification(`${SUCCESS_MESSAGES.areaDeleted}: ${deletedArea.name}`, 'success')
    }
    
    return true
  }, [showNotification])

  /**
   * Handle reset of league modifications
   */
  const handleResetModifications = useCallback((
    resetLeagueModifications,
    drawLeagueBoundaries,
    mapInstance
  ) => {
    resetLeagueModifications()
    
    // Redraw boundaries if map instance exists
    if (mapInstance && drawLeagueBoundaries) {
      drawLeagueBoundaries(mapInstance)
    }
    
    showNotification(SUCCESS_MESSAGES.modificationsReset, 'info')
  }, [showNotification])

  /**
   * Calculate statistics for areas
   */
  const calculateStats = useCallback((clubs, modifiedLeagues) => {
    const stats = {
      marbella: 0,
      estepona: 0,
      sotogrande: 0,
      unassigned: 0,
      total: clubs.length
    }

    clubs.forEach(club => {
      if (!club.location?.coordinates?.lat || !club.location?.coordinates?.lng) {
        stats.unassigned++
        return
      }

      // Determine league based on location
      // This would use the actual determineLeagueByLocation function
      const league = null // placeholder
      
      if (league === 'marbella') stats.marbella++
      else if (league === 'estepona') stats.estepona++
      else if (league === 'sotogrande') stats.sotogrande++
      else stats.unassigned++
    })

    return stats
  }, [])

  /**
   * Handle polygon click
   */
  const handlePolygonClick = useCallback((areaId, isCustom, setSelectedArea) => {
    setSelectedArea(areaId)
    const areaType = isCustom ? 'custom' : 'league'
    setDebugInfo(`Selected ${areaType} area: ${areaId}`)
  }, [])

  /**
   * Validate area before saving
   */
  const validateArea = useCallback((area) => {
    if (!area.name || area.name.trim() === '') {
      return { valid: false, error: 'Area must have a name' }
    }
    
    if (!area.bounds || area.bounds.length < 3) {
      return { valid: false, error: 'Area must have at least 3 points' }
    }
    
    if (!area.color) {
      return { valid: false, error: 'Area must have a color' }
    }
    
    return { valid: true }
  }, [])

  /**
   * Get area by ID
   */
  const getAreaById = useCallback((areaId, customAreas, modifiedLeagues) => {
    // Check custom areas
    const customArea = customAreas.find(a => a.id === areaId)
    if (customArea) return customArea
    
    // Check modified leagues
    if (modifiedLeagues[areaId]) {
      return modifiedLeagues[areaId]
    }
    
    return null
  }, [])

  /**
   * Export areas to JSON
   */
  const exportAreas = useCallback((customAreas, modifiedLeagues) => {
    const exportData = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      customAreas,
      modifiedLeagues: Object.values(modifiedLeagues)
    }
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
      type: 'application/json' 
    })
    
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `areas-export-${Date.now()}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    
    showNotification('Areas exported successfully', 'success')
  }, [showNotification])

  /**
   * Import areas from JSON
   */
  const importAreas = useCallback(async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result)
          
          if (!data.version || !data.customAreas) {
            throw new Error('Invalid import file format')
          }
          
          resolve(data)
          showNotification('Areas imported successfully', 'success')
        } catch (error) {
          reject(error)
          showNotification(`Import failed: ${error.message}`, 'error')
        }
      }
      
      reader.onerror = () => {
        reject(new Error('Failed to read file'))
        showNotification('Failed to read file', 'error')
      }
      
      reader.readAsText(file)
    })
  }, [showNotification])

  return {
    // State
    notification,
    debugInfo,
    
    // Actions
    showNotification,
    hideNotification,
    createCustomAreaFromPolygon,
    handlePolygonComplete,
    handleBoundsUpdate,
    handleDeleteArea,
    handleResetModifications,
    calculateStats,
    handlePolygonClick,
    validateArea,
    getAreaById,
    exportAreas,
    importAreas,
    
    // Setters
    setDebugInfo
  }
}
