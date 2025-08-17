/**
 * Custom hook for managing area persistence (loading and saving)
 * Handles database operations for custom areas and modified leagues
 */
import { useState, useCallback } from 'react'
import { API_ENDPOINTS, ERROR_MESSAGES, SUCCESS_MESSAGES } from '../constants/mapConfig'
import { LEAGUE_POLYGONS } from '@/lib/utils/geographicBoundaries'
import { generateSlug, calculatePolygonCenter } from '../utils/areaCalculations'
import { AREA_COLORS } from '../constants/mapConfig'

export default function useAreaPersistence() {
  const [customAreas, setCustomAreas] = useState([])
  const [modifiedLeagues, setModifiedLeagues] = useState({})
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [saving, setSaving] = useState(false)
  const [loadingAreas, setLoadingAreas] = useState(false)

  /**
   * Load custom areas and modified leagues from database
   */
  const loadCustomAreas = useCallback(async () => {
    setLoadingAreas(true)
    try {
      const response = await fetch(API_ENDPOINTS.areas)
      if (response.ok) {
        const data = await response.json()
        const areas = data.areas || []
        
        console.log('Loaded areas from database:', areas)
        
        // Separate custom areas from modified leagues
        const custom = []
        const modified = {}
        
        areas.forEach(area => {
          // Check if it's a modified league (has originalLeagueId)
          if (area.originalLeagueId) {
            // This is a modified league, restore it
            modified[area.originalLeagueId] = {
              ...area,
              leagueId: area.originalLeagueId,
              bounds: area.bounds,
              center: area.center,
              color: LEAGUE_POLYGONS[area.originalLeagueId]?.color || area.color,
              name: LEAGUE_POLYGONS[area.originalLeagueId]?.name || area.name,
              isModified: true
            }
          } else if (area.isCustom) {
            // This is a custom area
            custom.push(area)
          }
        })
        
        console.log('Restored modified leagues:', modified)
        console.log('Restored custom areas:', custom)
        
        setCustomAreas(custom)
        setModifiedLeagues(modified)
        
        return { success: true, custom, modified }
      }
      return { success: false, error: 'Failed to load areas' }
    } catch (error) {
      console.error('Error loading custom areas:', error)
      return { success: false, error: error.message }
    } finally {
      setLoadingAreas(false)
    }
  }, [])

  /**
   * Save all changes to database
   */
  const saveAllChanges = useCallback(async (showNotification) => {
    setSaving(true)
    
    try {
      // Prepare custom areas with all required fields
      const preparedCustomAreas = customAreas.map(area => ({
        ...area,
        slug: area.slug || generateSlug(area.name),
        center: area.center || calculatePolygonCenter(area.bounds),
        isCustom: true
      }))
      
      // Prepare modified leagues with proper tracking
      const preparedModifiedLeagues = Object.entries(modifiedLeagues).map(([leagueId, area]) => ({
        id: `league_${leagueId}_modified`,
        name: `${LEAGUE_POLYGONS[leagueId]?.name || leagueId} (Modified)`,
        slug: `league-${leagueId}-modified`,
        bounds: area.bounds,
        center: area.center || calculatePolygonCenter(area.bounds),
        color: area.color || LEAGUE_POLYGONS[leagueId]?.color || '#8B5CF6',
        originalLeagueId: leagueId, // IMPORTANT: Track which league this modifies
        isCustom: false,
        isModified: true
      }))
      
      // Collect all areas to save
      const allAreas = [
        ...preparedCustomAreas,
        ...preparedModifiedLeagues
      ]
      
      console.log('Saving areas with tracking:', allAreas)
      
      const response = await fetch(API_ENDPOINTS.areas, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ areas: allAreas })
      })
      
      const result = await response.json()
      
      if (response.ok) {
        setHasUnsavedChanges(false)
        if (showNotification) {
          showNotification(
            `Successfully saved ${preparedCustomAreas.length} custom areas and ${preparedModifiedLeagues.length} league modifications`,
            'success'
          )
        }
        
        console.log('✅ Saved areas:', {
          customAreas: preparedCustomAreas.length,
          modifiedLeagues: preparedModifiedLeagues.length
        })
        
        return { success: true }
      } else {
        throw new Error(result.error || ERROR_MESSAGES.saveFailed)
      }
    } catch (error) {
      console.error('Error saving areas:', error)
      if (showNotification) {
        showNotification(
          `${ERROR_MESSAGES.saveFailed}: ${error.message}`,
          'error'
        )
      }
      return { success: false, error: error.message }
    } finally {
      setSaving(false)
    }
  }, [customAreas, modifiedLeagues])

  /**
   * Track modifications to existing league polygons
   */
  const trackLeagueModification = useCallback((leagueId, newBounds) => {
    const modifiedArea = {
      id: `league_${leagueId}`,
      leagueId,
      originalLeagueId: leagueId,
      name: LEAGUE_POLYGONS[leagueId]?.name || leagueId,
      bounds: newBounds,
      center: calculatePolygonCenter(newBounds),
      color: LEAGUE_POLYGONS[leagueId]?.color || '#8B5CF6',
      isCustom: false,
      isModified: true
    }
    
    setModifiedLeagues(prev => ({
      ...prev,
      [leagueId]: modifiedArea
    }))
    setHasUnsavedChanges(true)
  }, [])

  /**
   * Add a new custom area
   */
  const addCustomArea = useCallback((newArea) => {
    const areaWithDefaults = {
      ...newArea,
      id: newArea.id || `custom_${Date.now()}`,
      name: newArea.name || `Custom Area ${customAreas.length + 1}`,
      slug: newArea.slug || generateSlug(newArea.name || `Custom Area ${customAreas.length + 1}`),
      color: newArea.color || AREA_COLORS[customAreas.length % AREA_COLORS.length],
      isCustom: true
    }
    
    setCustomAreas(prev => [...prev, areaWithDefaults])
    setHasUnsavedChanges(true)
    
    return areaWithDefaults
  }, [customAreas.length])

  /**
   * Update an existing custom area
   */
  const updateCustomArea = useCallback((areaId, updates) => {
    setCustomAreas(prev => prev.map(area => 
      area.id === areaId 
        ? { ...area, ...updates } 
        : area
    ))
    setHasUnsavedChanges(true)
  }, [])

  /**
   * Delete a custom area
   */
  const deleteCustomArea = useCallback((areaId) => {
    const areaToDelete = customAreas.find(a => a.id === areaId)
    setCustomAreas(prev => prev.filter(area => area.id !== areaId))
    setHasUnsavedChanges(true)
    return areaToDelete
  }, [customAreas])

  /**
   * Reset all league modifications
   */
  const resetLeagueModifications = useCallback(() => {
    setModifiedLeagues({})
    setHasUnsavedChanges(true)
  }, [])

  /**
   * Get current bounds for a league (modified or original)
   */
  const getLeagueBounds = useCallback((leagueId) => {
    if (modifiedLeagues[leagueId]) {
      return modifiedLeagues[leagueId].bounds
    }
    return LEAGUE_POLYGONS[leagueId]?.bounds || []
  }, [modifiedLeagues])

  return {
    // State
    customAreas,
    modifiedLeagues,
    hasUnsavedChanges,
    saving,
    loadingAreas,
    
    // Actions
    loadCustomAreas,
    saveAllChanges,
    trackLeagueModification,
    addCustomArea,
    updateCustomArea,
    deleteCustomArea,
    resetLeagueModifications,
    getLeagueBounds,
    
    // Setters (for direct manipulation if needed)
    setHasUnsavedChanges
  }
}