'use client'

import { useState, useEffect } from 'react'
import CityFormModal from '@/components/admin/cities/CityFormModal'

export default function AdminCitiesPage() {
  const [cities, setCities] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showFormModal, setShowFormModal] = useState(false)
  const [editingCity, setEditingCity] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortBy, setSortBy] = useState('displayOrder')

  useEffect(() => {
    fetchCities()
  }, [])

  const fetchCities = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/cities?withCounts=true')
      if (!response.ok) throw new Error('Failed to fetch cities')
      
      const data = await response.json()
      setCities(data.cities || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (cityId, cityName) => {
    if (!confirm(`Are you sure you want to delete "${cityName}"? This will only work if no clubs are associated with this city.`)) return

    try {
      const response = await fetch(`/api/admin/cities?id=${cityId}`, {
        method: 'DELETE'
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error)
      
      await fetchCities()
    } catch (err) {
      alert('Error deleting city: ' + err.message)
    }
  }

  const handleEdit = (city) => {
    setEditingCity(city)
    setShowFormModal(true)
  }

  const handleCreate = () => {
    setEditingCity(null)
    setShowFormModal(true)
  }

  const handleFormSuccess = () => {
    fetchCities()
    setShowFormModal(false)
    setEditingCity(null)
  }

  const handleUpdateClubCounts = async () => {
    try {
      setLoading(true)
      // Update club counts for all cities
      for (const city of cities) {
        await fetch('/api/admin/cities', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            id: city._id, 
            updateClubCount: true 
          })
        })
      }
      await fetchCities()
    } catch (err) {
      alert('Error updating club counts: ' + err.message)
    }
  }

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'inactive':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getImportSourceBadge = (source) => {
    switch (source) {
      case 'google':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
            Google
          </span>
        )
      case 'auto':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
            Auto
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
            Manual
          </span>
        )
    }
  }

  // Filter and sort cities
  const filteredCities = cities
    .filter(city => {
      const matchesSearch = 
        city.name.es.toLowerCase().includes(searchTerm.toLowerCase()) ||
        city.name.en.toLowerCase().includes(searchTerm.toLowerCase()) ||
        city.slug.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesStatus = statusFilter === 'all' || city.status === statusFilter
      
      return matchesSearch && matchesStatus
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'displayOrder':
          return a.displayOrder - b.displayOrder
        case 'name':
          return a.name.es.localeCompare(b.name.es)
        case 'clubCount':
          return b.clubCount - a.clubCount
        case 'created':
          return new Date(b.createdAt) - new Date(a.createdAt)
        default:
          return 0
      }
    })

  const stats = {
    total: cities.length,
    active: cities.filter(c => c.status === 'active').length,
    withClubs: cities.filter(c => c.clubCount > 0).length,
    totalClubs: cities.reduce((sum, c) => sum + c.clubCount, 0),
    provinces: [...new Set(cities.map(c => c.province))].length
  }

  if (loading && cities.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-xl text-gray-600">Loading cities...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Cities Management</h2>
          <p className="text-gray-600 mt-1">Manage cities for tennis club directory</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleUpdateClubCounts}
            disabled={loading}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Update Counts</span>
          </button>
          <button
            onClick={handleCreate}
            className="px-4 py-2 bg-parque-purple text-white rounded-lg hover:bg-parque-purple/90 flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Add City</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-3xl font-bold text-parque-purple">{stats.total}</div>
          <div className="text-sm text-gray-600">Total Cities</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-3xl font-bold text-green-600">{stats.active}</div>
          <div className="text-sm text-gray-600">Active Cities</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-3xl font-bold text-blue-600">{stats.withClubs}</div>
          <div className="text-sm text-gray-600">Cities with Clubs</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-3xl font-bold text-indigo-600">{stats.totalClubs}</div>
          <div className="text-sm text-gray-600">Total Clubs</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-3xl font-bold text-orange-600">{stats.provinces}</div>
          <div className="text-sm text-gray-600">Provinces</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Filters & Search</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search cities..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-parque-purple"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-parque-purple"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-parque-purple"
            >
              <option value="displayOrder">Display Order</option>
              <option value="name">Name (A-Z)</option>
              <option value="clubCount">Club Count</option>
              <option value="created">Recently Added</option>
            </select>
          </div>
          
          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchTerm('')
                setStatusFilter('all')
                setSortBy('displayOrder')
              }}
              className="w-full px-3 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-4">
          {error}
        </div>
      )}

      {/* Cities Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                City Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Province
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Clubs
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Source
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Order
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredCities.map((city) => (
              <tr key={city._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {city.name.es}
                      {city.name.es !== city.name.en && (
                        <span className="text-gray-500 ml-2">/ {city.name.en}</span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500">{city.slug}</div>
                    {city.coordinates?.lat && (
                      <div className="text-xs text-gray-400">
                        📍 {city.coordinates.lat.toFixed(4)}, {city.coordinates.lng.toFixed(4)}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {city.province}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {city.clubCount} clubs
                  </div>
                  {city.clubCount > 0 && (
                    <button
                      onClick={() => window.open(`/admin/clubs?city=${city.slug}`, '_blank')}
                      className="text-xs text-parque-purple hover:text-parque-purple/80"
                    >
                      View clubs →
                    </button>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(city.status)}`}>
                    {city.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getImportSourceBadge(city.importSource)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {city.displayOrder}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => handleEdit(city)}
                    className="text-indigo-600 hover:text-indigo-900 mr-4"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(city._id, city.name.es)}
                    className="text-red-600 hover:text-red-900"
                    disabled={city.clubCount > 0}
                    title={city.clubCount > 0 ? 'Cannot delete city with clubs' : 'Delete city'}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredCities.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">
              {searchTerm || statusFilter !== 'all' 
                ? 'No cities match your filters.' 
                : 'No cities found. Add your first city to get started.'
              }
            </p>
          </div>
        )}
      </div>

      {/* City Form Modal */}
      <CityFormModal
        isOpen={showFormModal}
        onClose={() => {
          setShowFormModal(false)
          setEditingCity(null)
        }}
        city={editingCity}
        onSuccess={handleFormSuccess}
      />
    </div>
  )
}