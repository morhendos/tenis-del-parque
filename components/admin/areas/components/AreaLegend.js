'use client'

import React from 'react'
import { LEAGUE_POLYGONS } from '@/lib/utils/geographicBoundaries'

/**
 * Area legend component explaining how league assignment works
 * @param {Object} props - Component props
 * @param {boolean} props.editMode - Whether edit mode is active
 * @param {Object} props.stats - Statistics object with totalClubs and byLeague
 * @param {Object} props.modifiedLeagues - Object tracking modified leagues
 */
export default function AreaLegend({ editMode = false, stats, modifiedLeagues = {} }) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        How League Assignment Works
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Automatic Assignment Section */}
        <div>
          <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
            📍 Automatic Assignment
          </h4>
          <p className="text-sm text-gray-600 mb-3">
            Clubs are automatically assigned to leagues based on their GPS coordinates. 
            When a club falls within a league's boundary, it belongs to that league.
          </p>
          
          {/* League color legend */}
          <div className="space-y-2">
            {Object.entries(LEAGUE_POLYGONS).map(([league, data]) => {
              const clubCount = stats.byLeague[league] || 0
              const isModified = !!modifiedLeagues[league]
              
              return (
                <div key={league} className="flex items-center group">
                  <div 
                    className="w-4 h-4 rounded mr-3 transition-transform group-hover:scale-110"
                    style={{ 
                      backgroundColor: data.color, 
                      opacity: 0.3,
                      border: `2px solid ${data.color}`
                    }}
                  />
                  <span className="text-sm flex-1">
                    <strong className="text-gray-700">{data.name}:</strong>
                    <span className="ml-2 text-gray-600">
                      {clubCount} {clubCount === 1 ? 'club' : 'clubs'}
                    </span>
                    {isModified && (
                      <span className="text-amber-600 ml-2 text-xs font-medium">
                        (Modified)
                      </span>
                    )}
                  </span>
                </div>
              )
            })}
            
            {/* Unassigned clubs */}
            {stats.unassigned > 0 && (
              <div className="flex items-center group">
                <div className="w-4 h-4 rounded mr-3 bg-gray-200 border-2 border-gray-400 transition-transform group-hover:scale-110" />
                <span className="text-sm flex-1">
                  <strong className="text-gray-700">Unassigned:</strong>
                  <span className="ml-2 text-gray-600">
                    {stats.unassigned} {stats.unassigned === 1 ? 'club' : 'clubs'}
                  </span>
                </span>
              </div>
            )}
          </div>
        </div>
        
        {/* Geographic Boundaries Section */}
        <div>
          <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
            {editMode ? '✏️ Editing Areas' : '🗺️ Geographic Boundaries'}
          </h4>
          <p className="text-sm text-gray-600 mb-3">
            {editMode 
              ? 'Click and drag points to modify area boundaries. Draw new custom areas as needed. All changes are tracked and can be saved.'
              : 'The colored areas on the map show the geographic boundaries for each league. These boundaries automatically determine league membership.'
            }
          </p>
          
          {/* Tips box */}
          <div className={`border rounded-lg p-3 text-sm ${
            editMode ? 'bg-purple-50 border-purple-200' : 'bg-blue-50 border-blue-200'
          }`}>
            <strong className={`block mb-1 ${editMode ? 'text-purple-900' : 'text-blue-900'}`}>
              {editMode ? '💡 Edit Mode Tips:' : '💡 Import Tip:'}
            </strong>
            <ul className={`space-y-1 ${editMode ? 'text-purple-700' : 'text-blue-700'}`}>
              {editMode ? (
                <>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Click areas to select them</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Drag corner points to reshape boundaries</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Use "Draw New Area" to create custom regions</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Save changes to persist modifications</span>
                  </li>
                </>
              ) : (
                <li>
                  When importing clubs from Google Maps, they'll be automatically assigned to the correct league based on their location!
                </li>
              )}
            </ul>
          </div>
          
          {/* Statistics summary */}
          {!editMode && (
            <div className="mt-3 p-2 bg-gray-50 rounded text-xs text-gray-600">
              <strong>Summary:</strong> {stats.totalClubs} total clubs across {Object.keys(LEAGUE_POLYGONS).length} leagues
              {stats.unassigned > 0 && `, with ${stats.unassigned} unassigned`}.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Add React.memo for performance optimization
export const MemoizedAreaLegend = React.memo(AreaLegend, (prevProps, nextProps) => {
  return (
    prevProps.editMode === nextProps.editMode &&
    JSON.stringify(prevProps.stats) === JSON.stringify(nextProps.stats) &&
    JSON.stringify(prevProps.modifiedLeagues) === JSON.stringify(nextProps.modifiedLeagues)
  )
})
