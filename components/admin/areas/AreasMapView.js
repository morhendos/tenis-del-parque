'use client'

import { useState, useCallback, useMemo, useEffect, useRef } from 'react'
import React from 'react'

// Import custom hooks
import useMapInitialization from './hooks/useMapInitialization'
import useAreaPersistence from './hooks/useAreaPersistence'
import useClubMarkers from './hooks/useClubMarkers'
import usePolygonDrawing from './hooks/usePolygonDrawing'
import useAreaManagement from './hooks/useAreaManagement'

// Import UI components
import AreaNotification from './components/AreaNotification'
import AreaStats from './components/AreaStats'
import LeagueFilterButtons from './components/LeagueFilterButtons'
import AreaEditControls from './components/AreaEditControls'
import AreaLegend from './components/AreaLegend'
import AreaMapCanvas from './components/AreaMapCanvas'

// Import utilities
import { calculateAreaStats } from './utils/areaCalculations'

export default function AreasMapView() {
  // State
  const [editMode, setEditMode] = useState(false)
  const [drawingMode, setDrawingMode] = useState(false)
  const [selectedArea, setSelectedArea] = useState(null)
  const [selectedLeague, setSelectedLeague] = useState('all')
  const [boundaryType, setBoundaryType] = useState('polygons')
  const [isInitialized, setIsInitialized] = useState(false)
  
  // Track if areas have been loaded once the map is ready
  const areasLoadedRef = useRef(false)
  const forceUpdateRef = useRef(0)
  
  // Initialize map - hook manages its own refs
  const {
    mapRef,
    mapInstanceRef,
    googleMapsLoaded,
    mapLoading,
    mapError,
    initializeMap
  } = useMapInitialization()
  
  // Area persistence management
  const {
    customAreas,
    modifiedLeagues,
    hasUnsavedChanges,
    saving,
    loadCustomAreas,
    saveAllChanges,
    addCustomArea,
    updateCustomArea,
    deleteCustomArea: deleteArea,
    trackLeagueModification,
    resetLeagueModifications
  } = useAreaPersistence()
  
  // Get the actual map instance (might be null initially)
  const mapInstance = mapInstanceRef?.current || null
  
  // Club markers management - will handle null map instance
  const {
    clubs,
    loadingClubs = false,
    fetchClubs,
    createClubMarkers,
    updateMarkerAssignments,
    filterByLeague,
    updateMarkerIcons,
    refreshAllAssignments
  } = useClubMarkers()
  
  // Polygon drawing management - will handle null map instance
  const {
    drawingManager,
    initializeDrawing,
    toggleDrawing,
    drawBoundaries,
    clearPolygons,
    setPolygonEditability
  } = usePolygonDrawing(mapInstance)
  
  // Area management orchestration
  const {
    notification,
    showNotification,
    handlePolygonComplete,
    handleBoundsUpdate
  } = useAreaManagement()

  // Force update function to trigger re-renders when needed
  const forceUpdate = useCallback(() => {
    forceUpdateRef.current += 1
    console.log('🔄 Forcing component update:', forceUpdateRef.current)
  }, [])

  // Initialize map when component mounts and Google Maps is loaded
  useEffect(() => {
    if (googleMapsLoaded && mapRef.current && !mapInstanceRef.current) {
      const instance = initializeMap(mapRef.current)
      if (instance) {
        console.log('✅ Map instance created successfully')
      }
    }
  }, [googleMapsLoaded, initializeMap, mapRef, mapInstanceRef])

  // Initialize everything when map instance is ready
  useEffect(() => {
    if (!mapInstance || isInitialized) return
    
    const initialize = async () => {
      console.log('🚀 Initializing map components...')
      
      // Load saved areas first
      if (!areasLoadedRef.current) {
        const result = await loadCustomAreas()
        if (result.success) {
          console.log('✅ Loaded areas:', {
            custom: result.custom?.length || 0,
            modified: Object.keys(result.modified || {}).length
          })
          areasLoadedRef.current = true
        }
      }
      
      // Fetch clubs and create markers
      if (fetchClubs) {
        const clubsData = await fetchClubs()
        console.log('✅ Fetched clubs:', clubsData.length)
        
        // Create club markers on the map
        if (clubsData.length > 0 && createClubMarkers) {
          createClubMarkers(mapInstance, clubsData, editMode, modifiedLeagues || {})
          console.log('✅ Created club markers on map')
        }
      }
      
      // Initialize drawing manager
      if (window.google?.maps?.drawing && initializeDrawing) {
        initializeDrawing({
          onPolygonComplete: (polygon) => {
            const newArea = handlePolygonComplete(
              polygon,
              polygon.getPath(),
              addCustomArea,
              { current: new Map() },
              null
            )
            setDrawingMode(false)
            console.log('✅ Created new area:', newArea)
            forceUpdate()
          }
        })
        console.log('✅ Initialized drawing manager')
      }
      
      setIsInitialized(true)
      console.log('✅ Map initialization complete')
    }
    
    initialize()
  }, [mapInstance, isInitialized, loadCustomAreas, fetchClubs, createClubMarkers, editMode, modifiedLeagues, initializeDrawing, handlePolygonComplete, addCustomArea, forceUpdate])
  
  // Create/update club markers when clubs data changes or edit mode changes
  useEffect(() => {
    if (!mapInstance || !clubs || clubs.length === 0 || !createClubMarkers) return
    
    console.log('🎯 Creating/updating club markers:', { 
      clubsCount: clubs.length, 
      editMode,
      modifiedLeagues: Object.keys(modifiedLeagues || {}).length,
      isInitialized 
    })
    
    createClubMarkers(mapInstance, clubs, editMode, modifiedLeagues || {})
  }, [mapInstance, clubs, editMode, createClubMarkers, modifiedLeagues, isInitialized])
  
  // Update club assignments when modified leagues change
  useEffect(() => {
    if (!mapInstance || !clubs || clubs.length === 0 || !updateMarkerAssignments || !isInitialized) return
    
    console.log('🔄 Updating club assignments due to boundary changes:', {
      modifiedLeagues: Object.keys(modifiedLeagues || {}).length
    })
    
    const changedCount = updateMarkerAssignments(modifiedLeagues || {})
    
    if (changedCount > 0) {
      showNotification(`Updated ${changedCount} club assignments based on modified boundaries`, 'success')
    }
  }, [modifiedLeagues, mapInstance, clubs, updateMarkerAssignments, isInitialized, showNotification])
  
  // Draw boundaries whenever relevant state changes
  useEffect(() => {
    if (!mapInstance || !drawBoundaries || !isInitialized) return
    
    console.log('🎨 Redrawing boundaries with:', {
      customAreas: customAreas?.length || 0,
      modifiedLeagues: Object.keys(modifiedLeagues || {}).length,
      boundaryType,
      editMode
    })
    
    // Always draw boundaries to fix the disappearing issue
    drawBoundaries({
      customAreas: customAreas || [],
      modifiedLeagues: modifiedLeagues || {},
      boundaryType,
      editMode,
      onAreaClick: (areaId) => {
        console.log('Area clicked:', areaId)
        setSelectedArea(areaId)
      },
      onBoundsUpdate: (areaId, newBounds, isCustom) => {
        console.log('Bounds updated:', areaId, isCustom, 'points:', newBounds?.length)
        
        if (!isCustom) {
          // This is a league modification
          trackLeagueModification(areaId, newBounds)
          console.log('✅ Tracked league modification for:', areaId)
          
          // Force refresh club assignments after boundary change
          if (refreshAllAssignments) {
            setTimeout(() => {
              const updatedModifiedLeagues = { ...modifiedLeagues, [areaId]: { bounds: newBounds } }
              const changedCount = refreshAllAssignments(updatedModifiedLeagues)
              if (changedCount > 0) {
                showNotification(`${changedCount} clubs reassigned due to boundary changes`, 'success')
              }
            }, 100) // Small delay to ensure state update
          }
        } else {
          // This is a custom area update
          updateCustomArea(areaId, { bounds: newBounds })
          console.log('✅ Updated custom area:', areaId)
        }
      }
    })
  }, [
    mapInstance,
    customAreas,
    modifiedLeagues,
    boundaryType,
    editMode,
    isInitialized,
    drawBoundaries,
    trackLeagueModification,
    updateCustomArea,
    refreshAllAssignments,
    showNotification,
    forceUpdateRef.current // Include force update counter to trigger re-draws
  ])
  
  // Memoized toggle edit mode
  const toggleEditMode = useCallback(() => {
    const newEditMode = !editMode
    setEditMode(newEditMode)
    
    // Update polygon editability
    if (setPolygonEditability) {
      setPolygonEditability(newEditMode)
    }
    
    // Update marker styles
    if (updateMarkerIcons) {
      updateMarkerIcons(newEditMode)
    }
    
    if (!newEditMode) {
      setSelectedArea(null)
      setDrawingMode(false)
      if (toggleDrawing) {
        toggleDrawing(false)
      }
    }
    
    showNotification(
      newEditMode ? 'Edit mode enabled - Drag area boundaries to reassign clubs' : 'Edit mode disabled',
      'info'
    )
    
    // Force update to ensure proper rendering
    setTimeout(() => forceUpdate(), 100)
  }, [
    editMode,
    setPolygonEditability,
    updateMarkerIcons,
    toggleDrawing,
    showNotification,
    forceUpdate
  ])
  
  // Memoized toggle drawing mode
  const handleToggleDrawing = useCallback(() => {
    if (!toggleDrawing) {
      showNotification('Drawing manager not initialized', 'warning')
      return
    }
    setDrawingMode(!drawingMode)
    toggleDrawing(!drawingMode)
  }, [drawingMode, toggleDrawing, showNotification])
  
  // Memoized toggle boundary type
  const toggleBoundaryType = useCallback(() => {
    const newBoundaryType = boundaryType === 'polygons' ? 'none' : 'polygons'
    setBoundaryType(newBoundaryType)
    
    // Force a redraw when boundaries are toggled
    setTimeout(() => forceUpdate(), 50)
    
    console.log('🔄 Toggled boundary type to:', newBoundaryType)
  }, [boundaryType, forceUpdate])
  
  // Memoized handle area deletion
  const handleDeleteArea = useCallback(() => {
    if (!selectedArea) return
    
    if (selectedArea.startsWith('custom_')) {
      deleteArea(selectedArea)
      if (clearPolygons) {
        clearPolygons([selectedArea])
      }
    }
    
    setSelectedArea(null)
    showNotification('Area deleted successfully', 'success')
    forceUpdate()
  }, [selectedArea, deleteArea, clearPolygons, showNotification, forceUpdate])
  
  // Memoized handle save
  const handleSaveChanges = useCallback(async () => {
    const result = await saveAllChanges(showNotification)
    if (!result.success) {
      showNotification(result.error || 'Failed to save changes', 'error')
    }
  }, [saveAllChanges, showNotification])
  
  // Memoized handle reset modifications
  const handleResetModifications = useCallback(() => {
    resetLeagueModifications()
    
    // Reset club assignments to original boundaries
    if (updateMarkerAssignments && clubs.length > 0) {
      updateMarkerAssignments({}) // Pass empty object to use only static boundaries
    }
    
    showNotification('League modifications reset - Club assignments restored', 'info')
    
    // Force redraw after reset
    setTimeout(() => forceUpdate(), 100)
  }, [resetLeagueModifications, updateMarkerAssignments, clubs.length, showNotification, forceUpdate])
  
  // Memoized close notification
  const handleCloseNotification = useCallback(() => {
    showNotification(null)
  }, [showNotification])
  
  // Handle league filtering
  const handleLeagueFilter = useCallback((league) => {
    setSelectedLeague(league)
    if (filterByLeague) {
      filterByLeague(league)
    }
  }, [filterByLeague])
  
  // Memoized statistics calculation
  const stats = useMemo(() => 
    calculateAreaStats(clubs || [], modifiedLeagues || {}),
    [clubs, modifiedLeagues]
  )
  
  // Combined loading state - ensure it's always boolean
  const loading = Boolean(mapLoading || loadingClubs)
  
  // Error state
  if (mapError) {
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
              <p>{mapError}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Notification */}
      {notification && (
        <AreaNotification
          message={notification.message}
          type={notification.type}
          onClose={handleCloseNotification}
        />
      )}

      {/* Header with Mode Toggle */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              🗺️ League Areas {editMode ? 'Editor' : 'Map'}
            </h2>
            <p className="text-gray-600">
              {editMode 
                ? 'Edit geographic boundaries and create custom areas - Club assignments update automatically'
                : 'Geographic boundaries and automatic league assignment'
              }
            </p>
            {clubs && clubs.length > 0 && (
              <p className="text-sm text-blue-600 mt-1">
                📍 Showing {clubs.length} clubs on the map
                {Object.keys(modifiedLeagues || {}).length > 0 && (
                  <span className="text-orange-600 ml-2">
                    • {Object.keys(modifiedLeagues).length} modified area{Object.keys(modifiedLeagues).length !== 1 ? 's' : ''}
                  </span>
                )}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={toggleEditMode}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                editMode
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {editMode ? '👁️ View Mode' : '✏️ Edit Mode'}
            </button>
            <button
              onClick={toggleBoundaryType}
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
        <AreaEditControls
          editMode={editMode}
          drawingMode={drawingMode}
          hasDrawingManager={!!drawingManager}
          loading={loading}
          selectedArea={selectedArea}
          modifiedLeagues={modifiedLeagues || {}}
          customAreas={customAreas || []}
          hasUnsavedChanges={hasUnsavedChanges || false}
          saving={saving || false}
          onToggleDrawing={handleToggleDrawing}
          onDeleteArea={handleDeleteArea}
          onResetModifications={handleResetModifications}
          onSaveChanges={handleSaveChanges}
        />

        {/* Area Statistics */}
        <AreaStats stats={stats} modifiedLeagues={modifiedLeagues || {}} />

        {/* League Filter Buttons */}
        <LeagueFilterButtons
          selectedLeague={selectedLeague}
          onFilterChange={handleLeagueFilter}
          stats={stats}
          modifiedLeagues={modifiedLeagues || {}}
        />
      </div>

      {/* Map Container - Now using the extracted component */}
      <AreaMapCanvas 
        ref={mapRef}
        loading={loading || !isInitialized}
        loadingText={editMode ? "Loading editor..." : "Loading map..."}
      />

      {/* Legend */}
      <AreaLegend 
        editMode={editMode} 
        stats={stats} 
        modifiedLeagues={modifiedLeagues || {}} 
      />
    </div>
  )
}