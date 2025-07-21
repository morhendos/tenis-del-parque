'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [recentPlayers, setRecentPlayers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/admin/dashboard', {
        cache: 'no-store'
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data')
      }

      const data = await response.json()
      setStats(data.stats)
      setRecentPlayers(data.recentPlayers)
    } catch (error) {
      console.error('Dashboard error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-xl text-gray-600">Loading dashboard...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
        <p className="text-gray-600 mt-1">Welcome to Tennis del Parque Admin</p>
      </div>

      {/* Quick Actions - First Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          href="/admin/leagues"
          className="group relative bg-gradient-to-br from-purple-600 to-purple-700 p-6 rounded-lg shadow-md hover:shadow-lg transition-all"
        >
          <div className="text-white">
            <div className="text-4xl mb-2">🏆</div>
            <h3 className="text-lg font-semibold">Manage Leagues</h3>
            <p className="text-sm opacity-90 mt-1">View and manage tennis leagues</p>
          </div>
          <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 rounded-lg transition-opacity" />
        </Link>
        
        <Link
          href="/admin/players"
          className="group relative bg-gradient-to-br from-green-600 to-green-700 p-6 rounded-lg shadow-md hover:shadow-lg transition-all"
        >
          <div className="text-white">
            <div className="text-4xl mb-2">👥</div>
            <h3 className="text-lg font-semibold">Manage Players</h3>
            <p className="text-sm opacity-90 mt-1">View all registered players</p>
          </div>
          <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 rounded-lg transition-opacity" />
        </Link>
        
        <Link
          href="/admin/matches"
          className="group relative bg-gradient-to-br from-yellow-600 to-yellow-700 p-6 rounded-lg shadow-md hover:shadow-lg transition-all"
        >
          <div className="text-white">
            <div className="text-4xl mb-2">🎾</div>
            <h3 className="text-lg font-semibold">Manage Matches</h3>
            <p className="text-sm opacity-90 mt-1">Schedule and track matches</p>
          </div>
          <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 rounded-lg transition-opacity" />
        </Link>

        <Link
          href="/admin/clubs"
          className="group relative bg-gradient-to-br from-blue-600 to-blue-700 p-6 rounded-lg shadow-md hover:shadow-lg transition-all"
        >
          <div className="text-white">
            <div className="text-4xl mb-2">🏢</div>
            <h3 className="text-lg font-semibold">Manage Clubs</h3>
            <p className="text-sm opacity-90 mt-1">Tennis clubs directory</p>
          </div>
          <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 rounded-lg transition-opacity" />
        </Link>
      </div>

      {/* Quick Actions - Second Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          href="/admin/users"
          className="group relative bg-gradient-to-br from-indigo-600 to-indigo-700 p-6 rounded-lg shadow-md hover:shadow-lg transition-all"
        >
          <div className="text-white">
            <div className="text-4xl mb-2">🔐</div>
            <h3 className="text-lg font-semibold">Manage Users</h3>
            <p className="text-sm opacity-90 mt-1">User accounts & invitations</p>
          </div>
          <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 rounded-lg transition-opacity" />
        </Link>
        
        <Link
          href="/admin/docs"
          className="group relative bg-gradient-to-br from-pink-600 to-pink-700 p-6 rounded-lg shadow-md hover:shadow-lg transition-all"
        >
          <div className="text-white">
            <div className="text-4xl mb-2">📚</div>
            <h3 className="text-lg font-semibold">Documentation</h3>
            <p className="text-sm opacity-90 mt-1">View project documentation</p>
          </div>
          <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 rounded-lg transition-opacity" />
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Total Players</p>
              <p className="mt-1 text-3xl font-semibold text-gray-900">
                {stats?.totalPlayers || 0}
              </p>
            </div>
            <div className="text-3xl text-purple-600">👤</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Beginners</p>
              <p className="mt-1 text-3xl font-semibold text-green-600">
                {stats?.byLevel?.beginner || 0}
              </p>
            </div>
            <div className="text-3xl">🟢</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Intermediate</p>
              <p className="mt-1 text-3xl font-semibold text-yellow-600">
                {stats?.byLevel?.intermediate || 0}
              </p>
            </div>
            <div className="text-3xl">🟡</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Advanced</p>
              <p className="mt-1 text-3xl font-semibold text-purple-600">
                {stats?.byLevel?.advanced || 0}
              </p>
            </div>
            <div className="text-3xl">🟣</div>
          </div>
        </div>
      </div>

      {/* Recent Registrations */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">
              Recent Registrations
            </h3>
            <Link
              href="/admin/players"
              className="text-sm text-purple-600 hover:text-purple-800"
            >
              View all →
            </Link>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Level
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  League
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentPlayers.map((player) => (
                <tr key={player._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {player.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {player.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      player.level === 'beginner' ? 'bg-green-100 text-green-800' :
                      player.level === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-purple-100 text-purple-800'
                    }`}>
                      {player.level}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {player.league?.name || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(player.registeredAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {recentPlayers.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No players registered yet
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
