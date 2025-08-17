'use client'

import React from 'react'

/**
 * Edit mode controls component
 * @param {Object} props - Component props
 * @param {boolean} props.editMode - Whether edit mode is active
 * @param {boolean} props.drawingMode - Whether drawing mode is active
 * @param {boolean} props.hasDrawingManager - Whether drawing manager is available
 * @param {boolean} props.loading - Loading state
 * @param {string} props.selectedArea - Currently selected area ID
 * @param {Object} props.modifiedLeagues - Object tracking modified leagues
 * @param {Array} props.customAreas - Array of custom areas
 * @param {boolean} props.hasUnsavedChanges - Whether there are unsaved changes
 * @param {boolean} props.saving - Whether currently saving
 * @param {Function} props.onToggleDrawing - Callback for toggling drawing mode
 * @param {Function} props.onDeleteArea - Callback for deleting selected area
 * @param {Function} props.onResetModifications - Callback for resetting modifications
 * @param {Function} props.onSaveChanges - Callback for saving all changes
 */
export default function AreaEditControls({
  editMode,
  drawingMode,
  hasDrawingManager,
  loading,
  selectedArea,
  modifiedLeagues = {},
  customAreas = [],
  hasUnsavedChanges,
  saving,
  onToggleDrawing,
  onDeleteArea,
  onResetModifications,
  onSaveChanges
}) {
  if (!editMode) return null

  const canSave = hasUnsavedChanges || customAreas.length > 0 || Object.keys(modifiedLeagues).length > 0
  const modifiedCount = Object.keys(modifiedLeagues).length
  const customCount = customAreas.length

  return (
    <div className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
      {/* Header and controls */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="font-medium text-purple-900 flex items-center gap-2">
            ✏️ Edit Mode Active
            {hasUnsavedChanges && (
              <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs rounded-full">
                Unsaved
              </span>
            )}
          </h3>
          <p className="text-sm text-purple-700 mt-1">
            Click areas to select • Drag points to edit boundaries • Draw new custom areas
          </p>
        </div>
        
        {/* Action buttons */}
        <div className="flex gap-2">
          {hasDrawingManager && (
            <button
              onClick={onToggleDrawing}
              disabled={loading}
              className={`px-3 py-1 rounded text-sm font-medium transition-all transform hover:scale-105 ${
                drawingMode 
                  ? 'bg-purple-600 text-white shadow-md' 
                  : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
              } disabled:opacity-50 disabled:transform-none`}
              title={drawingMode ? 'Stop drawing' : 'Start drawing new area'}
            >
              {drawingMode ? '✏️ Drawing...' : '➕ Draw New Area'}
            </button>
          )}
          
          {selectedArea?.startsWith('custom_') && (
            <button
              onClick={onDeleteArea}
              className="px-3 py-1 bg-red-100 text-red-700 rounded text-sm font-medium hover:bg-red-200 transition-all transform hover:scale-105"
              title="Delete selected custom area"
            >
              🗑️ Delete Area
            </button>
          )}
          
          {modifiedCount > 0 && (
            <button
              onClick={onResetModifications}
              className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded text-sm font-medium hover:bg-yellow-200 transition-all transform hover:scale-105"
              title="Reset all league modifications to original boundaries"
            >
              🔄 Reset Modifications
            </button>
          )}
        </div>
      </div>
      
      {/* Save controls section */}
      <div className="flex items-center justify-between pt-3 border-t border-purple-200">
        <div className="flex items-center space-x-4">
          {/* Status indicators */}
          <div className="flex gap-3 text-sm">
            {modifiedCount > 0 && (
              <span className="text-purple-600">
                <span className="font-medium">{modifiedCount}</span> modified league{modifiedCount !== 1 ? 's' : ''}
              </span>
            )}
            {customCount > 0 && (
              <span className="text-purple-600">
                <span className="font-medium">{customCount}</span> custom area{customCount !== 1 ? 's' : ''}
              </span>
            )}
            {!modifiedCount && !customCount && (
              <span className="text-gray-500">No changes to save</span>
            )}
          </div>
        </div>
        
        {/* Save button */}
        <button
          onClick={onSaveChanges}
          disabled={saving || !canSave}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all transform ${
            canSave
              ? 'bg-green-600 text-white hover:bg-green-700 hover:scale-105 shadow-md'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          } disabled:opacity-50 disabled:transform-none`}
          title={canSave ? 'Save all changes to database' : 'No changes to save'}
        >
          {saving ? (
            <>
              <span className="inline-block animate-spin mr-2">⏳</span>
              Saving...
            </>
          ) : (
            <>💾 Save All Changes</>
          )}
        </button>
      </div>
      
      {/* Tips section */}
      {drawingMode && (
        <div className="mt-3 p-2 bg-purple-100 rounded text-xs text-purple-700">
          💡 <strong>Tip:</strong> Click on the map to add points. Double-click to complete the polygon.
        </div>
      )}
    </div>
  )
}

// Add React.memo for performance optimization
export const MemoizedAreaEditControls = React.memo(AreaEditControls)
