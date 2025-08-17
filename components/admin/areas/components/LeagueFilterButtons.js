'use client'

import React from 'react'
import { LEAGUE_POLYGONS } from '@/lib/utils/geographicBoundaries'

/**
 * League filter buttons component
 * @param {Object} props - Component props
 * @param {string} props.selectedLeague - Currently selected league ('all' or league key)
 * @param {Function} props.onFilterChange - Callback when filter changes
 * @param {Object} props.stats - Statistics object with totalClubs and byLeague
 * @param {Object} props.modifiedLeagues - Object tracking which leagues have been modified
 */
export default function LeagueFilterButtons({ 
  selectedLeague = 'all', 
  onFilterChange, 
  stats, 
  modifiedLeagues = {} 
}) {
  return (
    <div className="flex flex-wrap gap-3">
      {/* All leagues button */}
      <button
        onClick={() => onFilterChange('all')}
        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all transform hover:scale-105 ${
          selectedLeague === 'all'
            ? 'bg-gray-800 text-white shadow-lg'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
        aria-pressed={selectedLeague === 'all'}
      >
        All Leagues ({stats.totalClubs} clubs)
      </button>
      
      {/* Individual league buttons */}
      {Object.entries(LEAGUE_POLYGONS).map(([league, data]) => {
        const isSelected = selectedLeague === league
        const isModified = !!modifiedLeagues[league]
        const clubCount = stats.byLeague[league] || 0
        
        return (
          <button
            key={league}
            onClick={() => onFilterChange(league)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all transform hover:scale-105 ${
              isSelected
                ? 'text-white shadow-lg'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            style={{
              backgroundColor: isSelected ? data.color : undefined,
              borderColor: isSelected ? data.color : undefined
            }}
            aria-pressed={isSelected}
            title={`Filter by ${data.name} league${isModified ? ' (Modified)' : ''}`}
          >
            <span 
              className="inline-block mr-2"
              style={{ color: !isSelected ? data.color : undefined }}
            >
              ●
            </span>
            {data.name} ({clubCount} clubs)
            {isModified && (
              <span className="ml-1" title="This league area has been modified">
                ⚠️
              </span>
            )}
          </button>
        )
      })}
      
      {/* Unassigned button (if any unassigned clubs) */}
      {stats.unassigned > 0 && (
        <button
          onClick={() => onFilterChange('unassigned')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all transform hover:scale-105 ${
            selectedLeague === 'unassigned'
              ? 'bg-gray-600 text-white shadow-lg'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
          aria-pressed={selectedLeague === 'unassigned'}
        >
          <span className="inline-block mr-2 text-gray-400">●</span>
          Unassigned ({stats.unassigned} clubs)
        </button>
      )}
    </div>
  )
}

// Add React.memo for performance optimization
export const MemoizedLeagueFilterButtons = React.memo(LeagueFilterButtons, (prevProps, nextProps) => {
  return (
    prevProps.selectedLeague === nextProps.selectedLeague &&
    JSON.stringify(prevProps.stats) === JSON.stringify(nextProps.stats) &&
    JSON.stringify(prevProps.modifiedLeagues) === JSON.stringify(nextProps.modifiedLeagues)
  )
})
