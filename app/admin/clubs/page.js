'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import ClubFormModal from '@/components/admin/clubs/ClubFormModal'
import GoogleMapsImporter from '@/components/admin/clubs/GoogleMapsImporter'
import { 
  CITY_AREAS_MAPPING, 
  AREA_DISPLAY_NAMES, 
  CITY_DISPLAY_NAMES,
  generateDisplayName,
  getAreasForCity
} from '@/lib/utils/areaMapping'

// Google Import Legend Component
const GoogleImportLegend = () => {
  const [showDetails, setShowDetails] = useState(false)
  
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <h3 className="text-sm font-medium text-blue-900">
            Google Maps Import Data Guide
          </h3>
        </div>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          {showDetails ? 'Hide' : 'Show'} Details
        </button>
      </div>
      
      {showDetails && (
        <div className="mt-4 space-y-3">
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <span className="text-green-600">✓</span>
                <span className="font-medium text-gray-700">Verified Data</span>
              </div>
              <ul className="space-y-0.5 text-xs text-gray-600 ml-5">
                <li>• Name & Address</li>
                <li>• GPS Coordinates</li>
                <li>• Phone & Website</li>
                <li>• Ratings & Reviews</li>
                <li>• Operating Hours</li>
              </ul>
            </div>
            
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <span className="text-yellow-600">≈</span>
                <span className="font-medium text-gray-700">Estimated Data</span>
              </div>
              <ul className="space-y-0.5 text-xs text-gray-600 ml-5">
                <li>• Courts (default: 6)</li>
                <li>• Surfaces (default: clay)</li>
                <li>• Amenities (by price)</li>
                <li>• Services (by price)</li>
                <li>• Price ranges</li>
              </ul>
            </div>
            
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <span className="text-gray-500">—</span>
                <span className="font-medium text-gray-700">Not Available</span>
              </div>
              <ul className="space-y-0.5 text-xs text-gray-600 ml-5">
                <li>• Email address</li>
                <li>• Social media</li>
                <li>• Photos</li>
                <li>• Membership fees</li>
                <li>• Court specifics</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-3 pt-3 border-t border-blue-200">
            <p className="text-xs text-blue-800">
              <strong>Tip:</strong> After importing, click on each club to verify and complete the estimated data. 
              Look for the <span className="text-yellow-600">≈</span> symbol to identify fields that need verification.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

// Data quality calculation function
const getDataQualityScore = (club) => {
  let verified = 0
  let estimated = 0
  let missing = 0
  
  // Verified fields from Google
  if (club.googlePlaceId) verified += 3
  if (club.contact?.phone) verified += 1
  if (club.contact?.website) verified += 1
  if (club.googleData?.rating) verified += 1
  
  // Estimated fields (need verification)
  if (club.courts?.total === 6 && club.importSource === 'google') estimated += 2
  if (club.amenities && !club.amenitiesVerified && club.importSource === 'google') estimated += 2
  
  // Missing fields
  if (!club.contact?.email) missing += 1
  if (!club.images?.main) missing += 1
  if (!club.contact?.facebook && !club.contact?.instagram) missing += 1
  
  const total = verified + estimated + missing || 1 // Avoid division by zero
  return {
    verified: Math.round((verified / total) * 100),
    estimated: Math.round((estimated / total) * 100),
    missing: Math.round((missing / total) * 100),
    total: Math.round((verified / total) * 100) // Overall completeness
  }
}

// Helper function to get display name for club location
const getClubDisplayName = (club) => {
  // Use existing displayName if available
  if (club.location?.displayName) {
    return club.location.displayName
  }
  
  // Generate display name from area and city
  if (club.location?.area && club.location?.city) {
    return generateDisplayName(club.location.area, club.location.city)
  }
  
  // Fallback to city name
  if (club.location?.city) {
    const cityDisplay = CITY_DISPLAY_NAMES[club.location.city] || 
                       club.location.city.charAt(0).toUpperCase() + club.location.city.slice(1)
    return cityDisplay
  }
  
  return 'Unknown Location'
}

export default function AdminClubsPage() {
  const router = useRouter()
  const [clubs, setClubs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showFormModal, setShowFormModal] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [editingClub, setEditingClub] = useState(null)
  
  // Enhanced filtering state
  const [selectedCity, setSelectedCity] = useState('all')
  const [selectedArea, setSelectedArea] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

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

  // Enhanced filtering logic
  const filteredClubs = clubs.filter(club => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      const clubName = club.name?.toLowerCase() || ''
      const displayName = getClubDisplayName(club).toLowerCase()
      const address = club.location?.address?.toLowerCase() || ''
      const area = club.location?.area?.toLowerCase() || ''
      const city = club.location?.city?.toLowerCase() || ''
      
      const searchMatch = clubName.includes(query) ||
                         displayName.includes(query) ||
                         address.includes(query) ||
                         area.includes(query) ||
                         city.includes(query)
      
      if (!searchMatch) return false
    }
    
    // City filter
    if (selectedCity !== 'all') {
      // Include all areas that belong to the selected main city
      const mainCity = club.location?.city
      if (mainCity !== selectedCity) {
        return false
      }
    }
    
    // Area filter
    if (selectedArea !== 'all') {
      const clubArea = club.location?.area
      if (clubArea !== selectedArea) {
        return false
      }
    }
    
    return true
  })

  // Calculate statistics for main cities (including areas)
  const clubsByCity = clubs.reduce((acc, club) => {
    const city = club.location?.city
    if (city) {
      acc[city] = (acc[city] || 0) + 1
    }
    return acc
  }, {})

  // Get areas for currently selected city
  const availableAreas = selectedCity !== 'all' 
    ? getAreasForCity(selectedCity)
    : []

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
          <p className="text-gray-600 mt-1">Manage tennis clubs with area-based organization</p>
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

      {/* Google Import Legend - Show if any clubs are from Google */}
      {clubs.some(c => c.importSource === 'google') && <GoogleImportLegend />}

      {/* Enhanced Filters */}
      <div className="bg-white rounded-lg shadow p-4 space-y-4">
        {/* Search Bar */}
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search clubs by name, area, city, or address..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-parque-purple focus:border-parque-purple"
              />
            </div>
          </div>
          {(searchQuery || selectedCity !== 'all' || selectedArea !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('')
                setSelectedCity('all')
                setSelectedArea('all')
              }}
              className="px-3 py-2 text-sm bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200"
            >
              Clear All
            </button>
          )}
        </div>

        {/* City Filter */}
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium text-gray-700">Filter by city:</span>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                setSelectedCity('all')
                setSelectedArea('all')
              }}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                selectedCity === 'all'
                  ? 'bg-parque-purple text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Cities ({clubs.length})
            </button>
            {Object.entries(clubsByCity).map(([city, count]) => (
              <button
                key={city}
                onClick={() => {
                  setSelectedCity(city)
                  setSelectedArea('all')
                }}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  selectedCity === city
                    ? 'bg-parque-purple text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {CITY_DISPLAY_NAMES[city] || city.charAt(0).toUpperCase() + city.slice(1)} ({count})
              </button>
            ))}
          </div>
        </div>

        {/* Area Filter - Only show when a city is selected */}
        {selectedCity !== 'all' && availableAreas.length > 0 && (
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-700">Filter by area:</span>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedArea('all')}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  selectedArea === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                }`}
              >
                All Areas in {CITY_DISPLAY_NAMES[selectedCity]}
              </button>
              {availableAreas.map(area => {
                const areaClubCount = clubs.filter(club => 
                  club.location?.city === selectedCity && club.location?.area === area
                ).length
                
                if (areaClubCount === 0) return null
                
                return (
                  <button
                    key={area}
                    onClick={() => setSelectedArea(area)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      selectedArea === area
                        ? 'bg-blue-600 text-white'
                        : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                    }`}
                  >
                    {AREA_DISPLAY_NAMES[area] || area} ({areaClubCount})
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Filter Results Summary */}
        {(searchQuery || selectedCity !== 'all' || selectedArea !== 'all') && (
          <div className="text-sm text-gray-600 border-t pt-3">
            Showing {filteredClubs.length} of {clubs.length} clubs
            {searchQuery && ` matching "${searchQuery}"`}
            {selectedArea !== 'all' && ` in ${AREA_DISPLAY_NAMES[selectedArea] || selectedArea}`}
            {selectedCity !== 'all' && selectedArea === 'all' && ` in ${CITY_DISPLAY_NAMES[selectedCity] || selectedCity}`}
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-4">
          {error}
        </div>
      )}

      {/* Enhanced Clubs Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Club Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Location & Area
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
            {filteredClubs.map((club) => {
              const quality = getDataQualityScore(club)
              const displayName = getClubDisplayName(club)
              
              return (
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
                      
                      {/* Data quality mini bar for Google imports */}
                      {club.importSource === 'google' && (
                        <div className="mt-2 flex items-center space-x-1">
                          <div className="flex h-1.5 w-24 bg-gray-200 rounded overflow-hidden">
                            <div 
                              className="bg-green-500" 
                              style={{width: `${quality.verified}%`}}
                              title={`${quality.verified}% verified`}
                            />
                            <div 
                              className="bg-yellow-500" 
                              style={{width: `${quality.estimated}%`}}
                              title={`${quality.estimated}% estimated`}
                            />
                            <div 
                              className="bg-gray-400" 
                              style={{width: `${quality.missing}%`}}
                              title={`${quality.missing}% missing`}
                            />
                          </div>
                          <span className="text-xs text-gray-500">
                            {quality.total}% complete
                          </span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {displayName}
                      </div>
                      {club.location?.area && club.location?.area !== club.location?.city && (
                        <div className="text-xs text-blue-600 mt-1">
                          Area: {AREA_DISPLAY_NAMES[club.location.area] || club.location.area}
                        </div>
                      )}
                      <div className="text-sm text-gray-500 mt-1">
                        {club.location?.address}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {club.courts?.total} courts
                      {club.courts?.total === 6 && club.importSource === 'google' && (
                        <span className="ml-1 text-yellow-600" title="Default value - needs verification">≈</span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500">
                      {club.courts?.surfaces?.map(s => `${s.count} ${s.type}`).join(', ')}
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
              )
            })}
          </tbody>
        </table>

        {filteredClubs.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500">
              {searchQuery || selectedCity !== 'all' || selectedArea !== 'all' ? (
                <div>
                  <p className="text-lg mb-2">No clubs found matching your filters</p>
                  <p className="text-sm">Try adjusting your search or filter criteria</p>
                </div>
              ) : (
                <p>No clubs found. Add your first club to get started.</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
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
            {clubs.reduce((sum, club) => sum + (club.courts?.total || 0), 0)}
          </div>
          <div className="text-sm text-gray-600">Total Courts</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-3xl font-bold text-purple-600">
            {Object.keys(clubsByCity).length}
          </div>
          <div className="text-sm text-gray-600">Cities</div>
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
