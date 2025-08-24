'use client'

import React from 'react'
import PropTypes from 'prop-types'

/**
 * Edit mode controls component
 * @param {Object} props - Component props
 */
const AreaEditControls = ({
  editMode,
  drawingMode,
  hasDrawingManager,
  loading,
  selectedArea,
  modifiedLeagues,
  customAreas,
  hasUnsavedChanges,
  saving,
  onToggleDrawing,
  onDeleteArea,
  onResetModifications,
  onSaveChanges
}) => {
  if (!editMode) return null

  const hasModifications = Object.keys(modifiedLeagues).length > 0
  const hasCustomAreas = customAreas.length > 0

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          {/* Draw Area Button */}
          <button
            onClick={onToggleDrawing}
            disabled={!hasDrawingManager || loading}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              drawingMode
                ? 'bg-purple-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            } ${(!hasDrawingManager || loading) ? 'opacity-50 cursor-not-allowed' : ''}`}
            title={drawingMode ? 'Stop drawing' : 'Start drawing new area'}
          >
            {drawingMode ? '⏹️ Stop Drawing' : '✏️ Draw Area'}
          </button>

          {/* Delete Area Button */}
          {selectedArea && selectedArea.startsWith('custom_') && (
            <button
              onClick={onDeleteArea}
              className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
              title="Delete selected custom area"
            >
              🗑️ Delete Area
            </button>
          )}

          {/* Reset Modifications Button */}
          {hasModifications && (
            <button
              onClick={onResetModifications}
              className="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 transition-colors"
              title="Reset all league boundary modifications"
            >
              ↩️ Reset Modifications
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Status Indicators */}
          {(hasModifications || hasCustomAreas) && (
            <div className="flex items-center gap-2 text-sm">
              {hasModifications && (
                <span className="bg-amber-200 text-amber-800 px-2 py-1 rounded-full font-medium">
                  {Object.keys(modifiedLeagues).length} Modified
                </span>
              )}
              {hasCustomAreas && (
                <span className="bg-purple-200 text-purple-800 px-2 py-1 rounded-full font-medium">
                  {customAreas.length} Custom
                </span>
              )}
            </div>
          )}

          {/* Save Button */}
          {hasUnsavedChanges && (
            <button
              onClick={onSaveChanges}
              disabled={saving}
              className={`px-6 py-2 bg-green-600 text-white rounded-lg text-sm font-medium transition-all ${
                saving 
                  ? 'opacity-50 cursor-not-allowed' 
                  : 'hover:bg-green-700 animate-pulse'
              }`}
              title="Save all changes to database"
            >
              {saving ? '💾 Saving...' : '💾 Save All Changes'}
            </button>
          )}
        </div>
      </div>

      {/* Drawing Mode Tips */}
      {drawingMode && (
        <div className="mt-3 p-3 bg-purple-100 rounded-lg text-sm text-purple-800">
          <p className="font-medium mb-1">🎨 Drawing Mode Active</p>
          <ul className="space-y-1 text-xs">
            <li>• Click on the map to add points</li>
            <li>• Click the first point to close the polygon</li>
            <li>• Press ESC to cancel drawing</li>
          </ul>
        </div>
      )}
    </div>
  )
}

AreaEditControls.propTypes = {
  editMode: PropTypes.bool.isRequired,
  drawingMode: PropTypes.bool.isRequired,
  hasDrawingManager: PropTypes.bool.isRequired,
  loading: PropTypes.bool.isRequired,
  selectedArea: PropTypes.string,
  modifiedLeagues: PropTypes.object.isRequired,
  customAreas: PropTypes.array.isRequired,
  hasUnsavedChanges: PropTypes.bool.isRequired,
  saving: PropTypes.bool.isRequired,
  onToggleDrawing: PropTypes.func.isRequired,
  onDeleteArea: PropTypes.func.isRequired,
  onResetModifications: PropTypes.func.isRequired,
  onSaveChanges: PropTypes.func.isRequired
}

// Export memoized version for performance
export default React.memo(AreaEditControls)