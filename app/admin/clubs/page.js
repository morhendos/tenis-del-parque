'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import ClubFormModal from '@/components/admin/clubs/ClubFormModal'
import GoogleMapsImporter from '@/components/admin/clubs/GoogleMapsImporter'

export default function AdminClubsPage() {
  const router = useRouter()
  const [clubs, setClubs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showFormModal, setShowFormModal] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [editingClub, setEditingClub] = useState(null)
  const [selectedCity, setSelectedCity] = useState('all')

  useEffect(() => {
    fetchClubs()
  }, [])

  const fetchClubs = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/clubs')
      if (!response.ok) throw new Error('Failed to fetch clubs')
      
      const data = await response.json()
      setClubs(data.clubs || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (clubId) => {
    if (!confirm('Are you sure you want to delete this club?')) return

    try {
      const response = await fetch(`/api/admin/clubs/${clubId}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Failed to delete club')
      
      await fetchClubs()
    } catch (err) {
      alert('Error deleting club: ' + err.message)
    }
  }

  const handleEdit = (club) => {
    setEditingClub(club)
    setShowFormModal(true)
  }

  const handleCreate = () => {
    setEditingClub(null)
    setShowFormModal(true)
  }

  const handleFormSuccess = (savedClub) => {
    fetchClubs()
    setShowFormModal(false)
    setEditingClub(null)
  }

  const handleImportComplete = (results) => {
    console.log('Import completed:', results)
    fetchClubs()
    setShowImportModal(false)
  }

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
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
      case 'csv':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
            CSV
          </span>
        )
      default:
        return null
    }
  }

  const filteredClubs = selectedCity === 'all' 
    ? clubs 
    : clubs.filter(club => club.location.city === selectedCity)

  const clubsByCity = clubs.reduce((acc, club) => {
    const city = club.location.city
    acc[city] = (acc[city] || 0) + 1
    return acc
  }, {})

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-xl text-gray-600">Loading clubs...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Tennis Clubs Directory</h2>
          <p className="text-gray-600 mt-1">Manage tennis clubs for SEO directory</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleCreate}
            className="px-4 py-2 bg-parque-purple text-white rounded-lg hover:bg-parque-purple/90 flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Add Club</span>
          </button>
          <button
            onClick={() => setShowImportModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
            <span>Import from Google Maps</span>
          </button>
          <button
            onClick={() => alert('CSV import functionality coming soon')}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <span>Import CSV</span>
          </button>
        </div>
      </div>

      {/* City Filter */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium text-gray-700">Filter by city:</span>
          <div className="flex space-x-2">
            <button
              onClick={() => setSelectedCity('all')}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                selectedCity === 'all'
                  ? 'bg-parque-purple text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All ({clubs.length})
            </button>
            <button
              onClick={() => setSelectedCity('malaga')}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                selectedCity === 'malaga'
                  ? 'bg-parque-purple text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Málaga ({clubsByCity.malaga || 0})
            </button>
            <button
              onClick={() => setSelectedCity('marbella')}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                selectedCity === 'marbella'
                  ? 'bg-parque-purple text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Marbella ({clubsByCity.marbella || 0})
            </button>
            <button
              onClick={() => setSelectedCity('estepona')}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                selectedCity === 'estepona'
                  ? 'bg-parque-purple text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Estepona ({clubsByCity.estepona || 0})
            </button>
            <button
              onClick={() => setSelectedCity('sotogrande')}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                selectedCity === 'sotogrande'
                  ? 'bg-parque-purple text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Sotogrande ({clubsByCity.sotogrande || 0})
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-4">
          {error}
        </div>
      )}

      {/* Clubs Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Club Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                City
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Courts
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Source
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Featured
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredClubs.map((club) => (
              <tr key={club._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{club.name}</div>
                    <div className="text-sm text-gray-500">{club.slug}</div>
                    {club.googleData?.rating && (
                      <div className="text-xs text-gray-500 mt-1">
                        ⭐ {club.googleData.rating} ({club.googleData.userRatingsTotal} reviews)
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 capitalize">{club.location.city}</div>
                  <div className="text-sm text-gray-500">{club.location.address}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{club.courts.total} courts</div>
                  <div className="text-sm text-gray-500">
                    {club.courts.surfaces.map(s => `${s.count} ${s.type}`).join(', ')}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(club.status)}`}>
                    {club.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getImportSourceBadge(club.importSource)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  {club.featured && (
                    <span className="text-yellow-400">⭐</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => handleEdit(club)}
                    className="text-indigo-600 hover:text-indigo-900 mr-4"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(club._id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredClubs.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">
              {selectedCity === 'all' 
                ? 'No clubs found. Add your first club to get started.'
                : `No clubs found in ${selectedCity.charAt(0).toUpperCase() + selectedCity.slice(1)}.`
              }
            </p>
          </div>
        )}
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-3xl font-bold text-parque-purple">{clubs.length}</div>
          <div className="text-sm text-gray-600">Total Clubs</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-3xl font-bold text-green-600">
            {clubs.filter(c => c.status === 'active').length}
          </div>
          <div className="text-sm text-gray-600">Active Clubs</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-3xl font-bold text-blue-600">
            {clubs.filter(c => c.importSource === 'google').length}
          </div>
          <div className="text-sm text-gray-600">From Google</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-3xl font-bold text-yellow-600">
            {clubs.filter(c => c.featured).length}
          </div>
          <div className="text-sm text-gray-600">Featured Clubs</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-3xl font-bold text-indigo-600">
            {clubs.reduce((sum, club) => sum + club.courts.total, 0)}
          </div>
          <div className="text-sm text-gray-600">Total Courts</div>
        </div>
      </div>

      {/* Club Form Modal */}
      <ClubFormModal
        isOpen={showFormModal}
        onClose={() => {
          setShowFormModal(false)
          setEditingClub(null)
        }}
        club={editingClub}
        onSuccess={handleFormSuccess}
      />

      {/* Google Maps Import Modal */}
      {showImportModal && (
        <GoogleMapsImporter
          onClose={() => setShowImportModal(false)}
          onImportComplete={handleImportComplete}
        />
      )}
    </div>
  )
}