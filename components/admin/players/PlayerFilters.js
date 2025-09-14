import React from 'react'

export default function PlayerFilters({ filters, onFilterChange, leagues, leagueParam }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Search
          </label>
          <input
            type="text"
            value={filters.search}
            onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
            placeholder="Name, email, or phone..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-parque-purple focus:border-transparent"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Level
          </label>
          <select
            value={filters.level}
            onChange={(e) => onFilterChange({ ...filters, level: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-parque-purple focus:border-transparent"
          >
            <option value="">All Levels</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <select
            value={filters.status}
            onChange={(e) => onFilterChange({ ...filters, status: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-parque-purple focus:border-transparent"
          >
            <option value="">All Status</option>
            <option value="waiting">Waiting</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            League
          </label>
          <select
            value={filters.league || leagueParam || ''}
            onChange={(e) => onFilterChange({ ...filters, league: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-parque-purple focus:border-transparent"
          >
            <option value="">All Leagues</option>
            {leagues.map(league => (
              <option key={league._id} value={league._id}>
                {league.name}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sort By
          </label>
          <select
            value={filters.sortBy || 'name-asc'}
            onChange={(e) => onFilterChange({ ...filters, sortBy: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-parque-purple focus:border-transparent"
          >
            <option value="name-asc">Name (A-Z)</option>
            <option value="name-desc">Name (Z-A)</option>
            <option value="email-asc">Email (A-Z)</option>
            <option value="email-desc">Email (Z-A)</option>
            <option value="level-asc">Level (Beginner → Advanced)</option>
            <option value="level-desc">Level (Advanced → Beginner)</option>
            <option value="status-asc">Status (A-Z)</option>
            <option value="status-desc">Status (Z-A)</option>
            <option value="elo-asc">ELO (Low to High)</option>
            <option value="elo-desc">ELO (High to Low)</option>
            <option value="created-asc">Date Added (Oldest First)</option>
            <option value="created-desc">Date Added (Newest First)</option>
          </select>
        </div>
      </div>
      
      <div className="mt-4 flex justify-between items-center">
        <div className="text-sm text-gray-600">
          Showing {filters.filteredCount} of {filters.totalCount} players
        </div>
        <div className="text-xs text-gray-500">
          <strong>Status:</strong> 
          <span className="mx-1 px-2 py-1 bg-orange-100 text-orange-800 rounded">waiting</span> → 
          <span className="mx-1 px-2 py-1 bg-yellow-100 text-yellow-800 rounded">pending</span> → 
          <span className="mx-1 px-2 py-1 bg-blue-100 text-blue-800 rounded">confirmed</span> → 
          <span className="mx-1 px-2 py-1 bg-green-100 text-green-800 rounded">active</span>
        </div>
      </div>
    </div>
  )
}
