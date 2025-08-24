'use client'

import React from 'react'
import PropTypes from 'prop-types'
import { LEAGUE_POLYGONS } from '@/lib/utils/geographicBoundaries'

/**
 * League filter buttons component
 * @param {Object} props - Component props
 * @param {string} props.selectedLeague - Currently selected league filter
 * @param {Function} props.onFilterChange - Callback when filter changes
 * @param {Object} props.stats - Statistics object with league counts
 * @param {Object} props.modifiedLeagues - Object tracking modified leagues
 */
const LeagueFilterButtons = ({ 
  selectedLeague = 'all', 
  onFilterChange, 
  stats, 
  modifiedLeagues = {} 
}) => {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onFilterChange('all')}
        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all transform hover:scale-105 ${
          selectedLeague === 'all'
            ? 'bg-gray-800 text-white'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`}
        aria-pressed={selectedLeague === 'all'}
        title="Show all clubs"
      >
        All ({stats.totalClubs})
      </button>
      
      {Object.entries(LEAGUE_POLYGONS).map(([league, data]) => (
        <button
          key={league}
          onClick={() => onFilterChange(league)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all transform hover:scale-105 ${
            selectedLeague === league
              ? 'text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
          style={{
            backgroundColor: selectedLeague === league ? data.color : undefined
          }}
          aria-pressed={selectedLeague === league}
          title={`Show ${data.name} clubs`}
        >
          {data.name} ({stats.byLeague[league] || 0})
          {modifiedLeagues[league] && (
            <span className="ml-1" title="Modified area">📝</span>
          )}
        </button>
      ))}
      
      {stats.unassigned > 0 && (
        <button
          onClick={() => onFilterChange('unassigned')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all transform hover:scale-105 ${
            selectedLeague === 'unassigned'
              ? 'bg-gray-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
          aria-pressed={selectedLeague === 'unassigned'}
          title="Show unassigned clubs"
        >
          Unassigned ({stats.unassigned})
        </button>
      )}
    </div>
  )
}

LeagueFilterButtons.propTypes = {
  selectedLeague: PropTypes.string,
  onFilterChange: PropTypes.func.isRequired,
  stats: PropTypes.shape({
    totalClubs: PropTypes.number,
    byLeague: PropTypes.object,
    unassigned: PropTypes.number
  }).isRequired,
  modifiedLeagues: PropTypes.object
}

// Export memoized version for performance
export default React.memo(LeagueFilterButtons)