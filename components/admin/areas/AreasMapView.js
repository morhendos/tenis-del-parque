'use client'

import { useState, useCallback, useMemo } from 'react'
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
  
  // Club markers management - pass the actual map instance
  const {
    clubs,
    loading: clubsLoading,
    fetchClubs,
    createMarkers,
    filterByLeague,
    updateMarkerStyles
  } = useClubMarkers(mapInstanceRef.current)
  
  // Polygon drawing management - pass the actual map instance
  const {
    drawingManager,
    initializeDrawing,
    toggleDrawing,
    drawBoundaries,
    clearPolygons,
    setPolygonEditability
  } = usePolygonDrawing(mapInstanceRef.current)
  
  // Area management orchestration
  const {
    notification,
    showNotification,
    handlePolygonComplete,
    handleBoundsUpdate
  } = useAreaManagement()

  // Initialize map when component mounts and Google Maps is loaded
  React.useEffect(() => {
    if (googleMapsLoaded && mapRef.current && !mapInstanceRef.current) {
      initializeMap(mapRef.current)
    }
  }, [googleMapsLoaded, initializeMap])

  // Initialize everything when map instance is ready
  React.useEffect(() => {
    if (!mapInstanceRef.current) return
    
    const initialize = async () => {
      // Load saved areas
      await loadCustomAreas()
      
      // Fetch clubs
      await fetchClubs()
      
      // Initialize drawing manager
      if (window.google?.maps?.drawing) {
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
          }
        })
      }
      
      // Draw initial boundaries
      drawBoundaries({
        customAreas,
        modifiedLeagues,
        boundaryType,
        editMode,
        onAreaClick: (areaId) => setSelectedArea(areaId)
      })
    }
    
    initialize()
  }, [mapInstanceRef.current])
  
  // Update map when state changes
  React.useEffect(() => {
    if (!mapInstanceRef.current) return
    
    // Redraw boundaries
    drawBoundaries({
      customAreas,
      modifiedLeagues,
      boundaryType,
      editMode,
      onAreaClick: (areaId) => setSelectedArea(areaId)
    })
    
    // Update markers
    updateMarkerStyles(editMode)
  }, [customAreas, modifiedLeagues, boundaryType, editMode])
  
  // Memoized toggle edit mode
  const toggleEditMode = useCallback(() => {
    const newEditMode = !editMode
    setEditMode(newEditMode)
    
    // Update polygon editability
    setPolygonEditability(newEditMode)
    
    // Update marker styles
    updateMarkerStyles(newEditMode)
    
    if (!newEditMode) {
      setSelectedArea(null)
      setDrawingMode(false)
      toggleDrawing(false)
    }
    
    showNotification(
      newEditMode ? 'Edit mode enabled' : 'Edit mode disabled',
      'info'
    )
  }, [
    editMode,
    setPolygonEditability,
    updateMarkerStyles,
    toggleDrawing,
    showNotification
  ])
  
  // Memoized toggle drawing mode
  const handleToggleDrawing = useCallback(() => {
    setDrawingMode(!drawingMode)
    toggleDrawing(!drawingMode)
  }, [drawingMode, toggleDrawing])
  
  // Memoized toggle boundary type
  const toggleBoundaryType = useCallback(() => {
    setBoundaryType(prev => prev === 'polygons' ? 'none' : 'polygons')
  }, [])
  
  // Memoized handle area deletion
  const handleDeleteArea = useCallback(() => {
    if (!selectedArea) return
    
    if (selectedArea.startsWith('custom_')) {
      deleteArea(selectedArea)
      clearPolygons([selectedArea])
    }
    
    setSelectedArea(null)
    showNotification('Area deleted successfully', 'success')
  }, [selectedArea, deleteArea, clearPolygons, showNotification])
  
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
    if (mapInstanceRef.current) {
      drawBoundaries({
        customAreas,
        modifiedLeagues: {},
        boundaryType,
        editMode,
        onAreaClick: (areaId) => setSelectedArea(areaId)
      })
    }
    showNotification('League modifications reset', 'info')
  }, [
    resetLeagueModifications,
    drawBoundaries,
    customAreas,
    boundaryType,
    editMode,
    showNotification
  ])
  
  // Memoized close notification
  const handleCloseNotification = useCallback(() => {
    showNotification(null)
  }, [showNotification])
  
  // Memoized statistics calculation
  const stats = useMemo(() => 
    calculateAreaStats(clubs, modifiedLeagues),
    [clubs, modifiedLeagues]
  )
  
  // Combined loading state - ensure it's always boolean
  const loading = Boolean(mapLoading || clubsLoading)
  
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
                ? 'Edit geographic boundaries and create custom areas'
                : 'Geographic boundaries and automatic league assignment'
              }
            </p>
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
          modifiedLeagues={modifiedLeagues}
          customAreas={customAreas}
          hasUnsavedChanges={hasUnsavedChanges}
          saving={saving}
          onToggleDrawing={handleToggleDrawing}
          onDeleteArea={handleDeleteArea}
          onResetModifications={handleResetModifications}
          onSaveChanges={handleSaveChanges}
        />

        {/* Area Statistics */}
        <AreaStats stats={stats} modifiedLeagues={modifiedLeagues} />

        {/* League Filter Buttons */}
        <LeagueFilterButtons
          selectedLeague={selectedLeague}
          onFilterChange={filterByLeague}
          stats={stats}
          modifiedLeagues={modifiedLeagues}
        />
      </div>

      {/* Map Container - Now using the extracted component */}
      <AreaMapCanvas 
        ref={mapRef}
        loading={loading}
        loadingText={editMode ? "Loading editor..." : "Loading map..."}
      />

      {/* Legend */}
      <AreaLegend 
        editMode={editMode} 
        stats={stats} 
        modifiedLeagues={modifiedLeagues} 
      />
    </div>
  )
}
