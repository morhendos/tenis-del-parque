'use client'

import React from 'react'
import PropTypes from 'prop-types'
import { LEAGUE_POLYGONS } from '@/lib/utils/geographicBoundaries'

/**
 * Legend component for area map
 * @param {Object} props - Component props
 * @param {boolean} props.editMode - Whether in edit mode
 * @param {Object} props.stats - Area statistics
 * @param {Object} props.modifiedLeagues - Modified leagues tracking
 */
const AreaLegend = ({ editMode, stats, modifiedLeagues = {} }) => {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">
        📍 Legend {editMode && '(Edit Mode)'}
      </h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(LEAGUE_POLYGONS).map(([league, data]) => (
          <div key={league} className="flex items-center space-x-2 group">
            <div 
              className="w-6 h-6 rounded-full border-2 border-gray-300 transition-transform group-hover:scale-110"
              style={{ backgroundColor: data.color }}
              title={`${data.name} League Area`}
            />
            <span className="text-sm text-gray-700">
              {data.name}
              {modifiedLeagues[league] && (
                <span className="text-amber-600 ml-1" title="Modified">*</span>
              )}
            </span>
          </div>
        ))}
        
        {stats.unassigned > 0 && (
          <div className="flex items-center space-x-2 group">
            <div 
              className="w-6 h-6 rounded-full bg-gray-400 border-2 border-gray-300 transition-transform group-hover:scale-110"
              title="Unassigned clubs"
            />
            <span className="text-sm text-gray-700">Unassigned</span>
          </div>
        )}
      </div>
      
      {editMode ? (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600 font-medium mb-2">Edit Mode Tips:</p>
          <ul className="text-xs text-gray-500 space-y-1">
            <li>• Click and drag polygon vertices to modify boundaries</li>
            <li>• Use the Draw Area button to create custom areas</li>
            <li>• Modified areas show an asterisk (*) indicator</li>
            <li>• Remember to save your changes before leaving</li>
          </ul>
        </div>
      ) : (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            <strong>Total:</strong> {stats.totalClubs} clubs across {Object.keys(LEAGUE_POLYGONS).length} leagues
            {Object.keys(modifiedLeagues).length > 0 && (
              <span className="block text-amber-600 mt-1">
                ⚠️ {Object.keys(modifiedLeagues).length} league(s) have modified boundaries
              </span>
            )}
          </p>
        </div>
      )}
    </div>
  )
}

AreaLegend.propTypes = {
  editMode: PropTypes.bool.isRequired,
  stats: PropTypes.shape({
    totalClubs: PropTypes.number,
    byLeague: PropTypes.object,
    unassigned: PropTypes.number
  }).isRequired,
  modifiedLeagues: PropTypes.object
}

// Export memoized version for performance
export default React.memo(AreaLegend)