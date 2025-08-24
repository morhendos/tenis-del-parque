'use client'

import React from 'react'
import { LEAGUE_POLYGONS } from '@/lib/utils/geographicBoundaries'

/**
 * Area statistics display component
 * @param {Object} props - Component props
 * @param {Object} props.stats - Statistics object with totalClubs and byLeague
 * @param {Object} props.modifiedLeagues - Object tracking which leagues have been modified
 */
export default function AreaStats({ stats, modifiedLeagues = {} }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
      {/* Total clubs card */}
      <div className="bg-gray-50 rounded-lg p-4 text-center">
        <div className="text-3xl font-bold text-gray-600">
          {stats.totalClubs}
        </div>
        <div className="text-sm text-gray-600">Total Clubs</div>
      </div>
      
      {/* League-specific cards */}
      {Object.entries(LEAGUE_POLYGONS).map(([league, data]) => (
        <div 
          key={league} 
          className="bg-gray-50 rounded-lg p-4 text-center relative hover:bg-gray-100 transition-colors"
        >
          <div 
            className="text-3xl font-bold" 
            style={{ color: data.color }}
          >
            {stats.byLeague[league] || 0}
          </div>
          <div className="text-sm text-gray-600">
            {data.name}
            {modifiedLeagues[league] && (
              <span className="block text-xs text-amber-600 font-medium mt-1">
                Modified
              </span>
            )}
          </div>
          
          {/* Visual indicator for modified leagues */}
          {modifiedLeagues[league] && (
            <div 
              className="absolute top-2 right-2 w-2 h-2 rounded-full bg-amber-500"
              title="This league area has been modified"
            />
          )}
        </div>
      ))}
      
      {/* Unassigned clubs card (if any) */}
      {stats.unassigned > 0 && (
        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-gray-400">
            {stats.unassigned}
          </div>
          <div className="text-sm text-gray-600">Unassigned</div>
        </div>
      )}
    </div>
  )
}

// Add React.memo for performance optimization
export const MemoizedAreaStats = React.memo(AreaStats, (prevProps, nextProps) => {
  // Only re-render if stats or modifiedLeagues actually changed
  return (
    JSON.stringify(prevProps.stats) === JSON.stringify(nextProps.stats) &&
    JSON.stringify(prevProps.modifiedLeagues) === JSON.stringify(nextProps.modifiedLeagues)
  )
})
