import React from 'react'
import { useRouter } from 'next/navigation'

const field = 'w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-parque-purple/40 focus:border-parque-purple'

export default function PlayerFilters({ filters, onFilterChange, leagues, leagueParam }) {
  const router = useRouter()

  const handleLeagueChange = (leagueId) => {
    if (leagueId) {
      router.push(`/admin/players?league=${leagueId}`)
    } else {
      router.push('/admin/players')
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1.4fr_1.4fr] gap-3">
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" />
          </svg>
          <input
            type="text"
            value={filters.search}
            onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
            placeholder="Search name, email or phone"
            className={`${field} pl-9`}
          />
        </div>

        <select
          value={filters.level}
          onChange={(e) => onFilterChange({ ...filters, level: e.target.value })}
          className={field}
        >
          <option value="">All levels</option>
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>

        <select
          value={filters.status}
          onChange={(e) => onFilterChange({ ...filters, status: e.target.value })}
          className={field}
        >
          <option value="">All statuses</option>
          <option value="waiting">Waiting</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>

        <select
          value={leagueParam || ''}
          onChange={(e) => handleLeagueChange(e.target.value)}
          className={field}
        >
          <option value="">All leagues</option>
          <option value="no-league">No league (account only)</option>
          {leagues.map(league => (
            <option key={league._id} value={league._id}>
              {league.name}
            </option>
          ))}
        </select>

        <select
          value={filters.sortBy || 'name-asc'}
          onChange={(e) => onFilterChange({ ...filters, sortBy: e.target.value })}
          className={field}
        >
          <option value="name-asc">Name (A-Z)</option>
          <option value="name-desc">Name (Z-A)</option>
          <option value="email-asc">Email (A-Z)</option>
          <option value="email-desc">Email (Z-A)</option>
          <option value="level-asc">Level (low to high)</option>
          <option value="level-desc">Level (high to low)</option>
          <option value="status-asc">Status (A-Z)</option>
          <option value="status-desc">Status (Z-A)</option>
          <option value="elo-asc">ELO (low to high)</option>
          <option value="elo-desc">ELO (high to low)</option>
          <option value="created-asc">Joined (oldest first)</option>
          <option value="created-desc">Joined (newest first)</option>
        </select>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-gray-500">
          <span className="font-semibold text-gray-900">{filters.filteredCount}</span> of {filters.totalCount} players
        </p>
        <div className="flex items-center gap-1.5 text-[11px] font-medium text-gray-400">
          <span className="px-2 py-0.5 rounded-full bg-gray-50 text-gray-600 ring-1 ring-gray-200">Waiting</span>
          <span>›</span>
          <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 ring-1 ring-amber-200">Pending</span>
          <span>›</span>
          <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200">Confirmed</span>
          <span>›</span>
          <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200">Active</span>
        </div>
      </div>
    </div>
  )
}
