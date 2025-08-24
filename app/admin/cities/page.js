'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import CityGoogleEnhancer from '@/components/admin/cities/CityGoogleEnhancer'

export default function AdminCitiesPage() {
  const router = useRouter()
  const [cities, setCities] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showEnhancerModal, setShowEnhancerModal] = useState(false)
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
    // Navigate to the edit page instead of opening modal
    router.push(`/admin/cities/${city._id}/edit`)
  }

  const handleCreate = () => {
    // Navigate to the new city page instead of opening modal
    router.push('/admin/cities/new')
  }

  const handleEnhancerSuccess = () => {
    fetchCities()
    setShowEnhancerModal(false)
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

  // Helper to check if city has images
  const hasImages = (city) => {
    return !!(city.images?.main || (city.images?.gallery && city.images.gallery.length > 0) || (city.googleData?.photos && city.googleData.photos.length > 0))
  }

  // Helper to get image count
  const getImageCount = (city) => {
    let count = 0
    if (city.images?.main) count++
    if (city.images?.gallery) count += city.images.gallery.length
    if (city.googleData?.photos) count += city.googleData.photos.length
    return count
  }

  // Helper to get proper fallback image
  const getFallbackImageUrl = (city, width = 100, height = 100) => {
    const seed = city?.name?.es ? city.name.es.charCodeAt(0) + city.slug.length : Math.floor(Math.random() * 1000)
    return `https://picsum.photos/${width}/${height}?random=${seed}`
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

  // Basic statistics
  const stats = {
    total: cities.length,
    active: cities.filter(c => c.status === 'active').length,
    withClubs: cities.filter(c => c.clubCount > 0).length,
    totalClubs: cities.reduce((sum, c) => sum + c.clubCount, 0),
    provinces: [...new Set(cities.map(c => c.province))].length,
    withCoordinates: cities.filter(c => c.coordinates?.lat && c.coordinates?.lng).length,
    googleEnhanced: cities.filter(c => c.importSource === 'google').length,
    withImages: cities.filter(c => hasImages(c)).length
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
          <p className="text-gray-600 mt-1">Manage cities where tennis clubs are located</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowEnhancerModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
            <span>Enhance with Google</span>
          </button>
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
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Add City</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-3xl font-bold text-purple-600">{stats.total}</div>
          <div className="text-sm text-gray-600">Total Cities</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-3xl font-bold text-green-600">{stats.active}</div>
          <div className="text-sm text-gray-600">Active</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-3xl font-bold text-blue-600">{stats.withClubs}</div>
          <div className="text-sm text-gray-600">With Clubs</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-3xl font-bold text-indigo-600">{stats.totalClubs}</div>
          <div className="text-sm text-gray-600">Total Clubs</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-3xl font-bold text-orange-600">{stats.provinces}</div>
          <div className="text-sm text-gray-600">Provinces</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-3xl font-bold text-cyan-600">{stats.withCoordinates}</div>
          <div className="text-sm text-gray-600">With GPS</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-3xl font-bold text-blue-700">{stats.googleEnhanced}</div>
          <div className="text-sm text-gray-600">Enhanced</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-3xl font-bold text-purple-600">{stats.withImages}</div>
          <div className="text-sm text-gray-600">With Images</div>
        </div>
      </div>

      {/* Info Panel about GPS Areas */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <div className="flex-1">
            <h4 className="font-medium text-blue-900">
              GPS-Based League Areas Active
            </h4>
            <p className="text-sm text-blue-800 mt-1">
              League assignment is now handled automatically through GPS-based polygon areas. 
              Cities are just reference points for club locations. View and edit league boundaries 
              in the <a href="/admin/areas/map" className="underline font-medium">Areas Map Editor</a>.
            </p>
          </div>
        </div>
      </div>

      {/* Image Management Info */}
      {stats.total > 0 && stats.withImages < stats.total && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <svg className="w-5 h-5 text-purple-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
            </svg>
            <div className="flex-1">
              <h4 className="font-medium text-purple-900">
                {stats.total - stats.withImages} cities need images
              </h4>
              <p className="text-sm text-purple-800 mt-1">
                Cities with images provide better user experience on the frontend. Edit each city to manage images or use "Enhance with Google" to automatically fetch photos.
              </p>
            </div>
          </div>
        </div>
      )}

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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                Images
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
              <tr 
                key={city._id} 
                className="hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => handleEdit(city)}
              >
                <td className="px-6 py-4">
                  <div>
                    <div className="text-sm font-medium text-gray-900 flex items-center">
                      {city.name.es}
                      {city.name.es !== city.name.en && (
                        <span className="text-gray-500 ml-2">/ {city.name.en}</span>
                      )}
                      {city.coordinates?.lat && city.coordinates?.lng && (
                        <span className="ml-2 text-green-500" title="Has GPS coordinates">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                          </svg>
                        </span>
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
                <td className="px-6 py-4">
                  <div>
                    <div className="text-sm text-gray-900 font-medium">
                      {city.clubCount} clubs
                    </div>
                    {city.clubCount > 0 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          window.open(`/admin/clubs?city=${city.slug}`, '_blank')
                        }}
                        className="text-xs text-purple-600 hover:text-purple-800"
                      >
                        View clubs →
                      </button>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {hasImages(city) ? (
                    <div className="flex items-center space-x-2">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                        </svg>
                        {getImageCount(city)}
                      </span>
                      {city.images?.main && (
                        <img
                          src={city.images.main.includes('google-photo') 
                            ? city.images.main 
                            : city.images.main
                          }
                          alt={city.name.es}
                          className="w-8 h-8 rounded object-cover"
                          onError={(e) => {
                            e.target.src = getFallbackImageUrl(city, 100, 100)
                          }}
                        />
                      )}
                    </div>
                  ) : (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      No Images
                    </span>
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
                    onClick={(e) => {
                      e.stopPropagation()
                      handleEdit(city)
                    }}
                    className="text-indigo-600 hover:text-indigo-900 mr-4"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDelete(city._id, city.name.es)
                    }}
                    className="text-red-600 hover:text-red-900"
                    disabled={city.clubCount > 0}
                    title={city.clubCount > 0 ? 'Cannot delete city with clubs' : 'Delete city'}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
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

      {/* Tip about clickable rows */}
      <div className="text-center text-sm text-gray-500">
        💡 Tip: Click on any city row to edit it
      </div>

      {/* City Google Enhancer Modal - Keep this as modal */}
      <CityGoogleEnhancer
        isOpen={showEnhancerModal}
        onClose={() => setShowEnhancerModal(false)}
        onSuccess={handleEnhancerSuccess}
      />
    </div>
  )
}
