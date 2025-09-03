'use client'

import { useState } from 'react'
import { TennisPreloaderSmall, TennisPreloaderInline } from '@/components/ui/TennisPreloader'

// Data quality badge component
const DataQualityBadge = ({ type }) => {
  const badges = {
    verified: {
      color: 'bg-green-100 text-green-800 border-green-200',
      icon: '✓',
      text: 'From Google'
    },
    missing: {
      color: 'bg-gray-100 text-gray-600 border-gray-200',
      icon: '—',
      text: 'Not Available'
    }
  }

  const badge = badges[type] || badges.missing

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${badge.color}`}>
      <span className="mr-1">{badge.icon}</span>
      {badge.text}
    </span>
  )
}

// ✨ NEW: Club existence status badge
const ExistenceBadge = ({ club }) => {
  if (!club.alreadyExists) {
    return (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border-blue-200">
        <span className="mr-1">✨</span>
        New Club
      </span>
    )
  }

  const existing = club.existingClub
  let badgeColor = 'bg-red-100 text-red-800 border-red-200'
  let icon = '🔄'
  
  if (existing.confidence >= 90) {
    badgeColor = 'bg-red-100 text-red-800 border-red-200'
    icon = '⚠️'
  } else if (existing.confidence >= 70) {
    badgeColor = 'bg-yellow-100 text-yellow-800 border-yellow-200'
    icon = '⚠️'
  } else {
    badgeColor = 'bg-orange-100 text-orange-800 border-orange-200'
    icon = '❓'
  }

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${badgeColor}`}>
      <span className="mr-1">{icon}</span>
      Already Added ({existing.confidence}%)
    </span>
  )
}

// ✨ NEW: Existing club details component
const ExistingClubDetails = ({ club }) => {
  if (!club.alreadyExists) return null

  const existing = club.existingClub
  const matchTypeLabels = {
    'place_id': 'Google Place ID',
    'coordinates': 'Location',
    'name': 'Name similarity'
  }

  return (
    <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs">
      <div className="flex items-center justify-between mb-1">
        <span className="font-medium text-red-800">
          Matches existing club: &quot;{existing.name}&quot;
        </span>
        <span className="text-red-600">
          {existing.confidence}% confidence
        </span>
      </div>
      <div className="text-red-700 space-y-1">
        <div>Match type: {matchTypeLabels[existing.matchType] || existing.matchType}</div>
        <div>Reason: {existing.reason}</div>
        {existing.city && (
          <div>Location: {existing.area ? `${existing.area}, ` : ''}{existing.city}</div>
        )}
        {existing.distance && (
          <div>Distance: {existing.distance}m apart</div>
        )}
        <div className="text-xs text-red-500 mt-1">
          Import source: {existing.importSource || 'manual'} • 
          Added: {existing.createdAt ? new Date(existing.createdAt).toLocaleDateString() : 'unknown'}
        </div>
      </div>
    </div>
  )
}

export default function GoogleMapsImporter({ onClose, onImportComplete }) {
  const [step, setStep] = useState('search') // search, preview, importing, complete
  const [searchQuery, setSearchQuery] = useState('')
  const [searchType, setSearchType] = useState('city') // city, url, coordinates
  const [searchRadius, setSearchRadius] = useState(5000) // meters
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [searchResults, setSearchResults] = useState([])
  const [selectedClubs, setSelectedClubs] = useState([])
  const [importProgress, setImportProgress] = useState(0)
  const [importResults, setImportResults] = useState(null)
  
  // ✨ NEW: Store existence summary
  const [existingSummary, setExistingSummary] = useState(null)

  // Search for clubs
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setError('Please enter a search query')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/admin/clubs/google-import/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query: searchQuery,
          type: searchType,
          radius: searchRadius
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to search clubs')
      }

      setSearchResults(data.clubs || [])
      setExistingSummary(data.existingSummary || null)
      
      // ✨ UPDATED: Only select new clubs by default, exclude existing ones
      const newClubs = (data.clubs || []).filter(club => !club.alreadyExists)
      setSelectedClubs(newClubs.map(club => club.place_id))
      
      setStep('preview')
    } catch (err) {
      console.error('Search error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // ✨ UPDATED: Toggle club selection (disabled for existing clubs)
  const toggleClubSelection = (placeId) => {
    const club = searchResults.find(c => c.place_id === placeId)
    if (club?.alreadyExists) {
      // Don't allow selection of existing clubs
      return
    }
    
    setSelectedClubs(prev => 
      prev.includes(placeId) 
        ? prev.filter(id => id !== placeId)
        : [...prev, placeId]
    )
  }

  // ✨ UPDATED: Select/deselect all (only new clubs)
  const toggleSelectAll = () => {
    const newClubs = searchResults.filter(club => !club.alreadyExists)
    const newClubIds = newClubs.map(club => club.place_id)
    
    if (selectedClubs.length === newClubIds.length) {
      setSelectedClubs([])
    } else {
      setSelectedClubs(newClubIds)
    }
  }

  // Import selected clubs
  const handleImport = async () => {
    if (selectedClubs.length === 0) {
      setError('Please select at least one club to import')
      return
    }

    setStep('importing')
    setLoading(true)
    setError(null)
    setImportProgress(0)

    try {
      // First, get detailed information for selected clubs
      const detailsResponse = await fetch('/api/admin/clubs/google-import/details', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          placeIds: selectedClubs
        })
      })

      const detailsData = await detailsResponse.json()

      if (!detailsResponse.ok) {
        throw new Error(detailsData.error || 'Failed to fetch club details')
      }

      setImportProgress(50)

      // Then, create the clubs
      const createResponse = await fetch('/api/admin/clubs/google-import/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          clubs: detailsData.clubs
        })
      })

      const createData = await createResponse.json()

      if (!createResponse.ok) {
        throw new Error(createData.error || 'Failed to create clubs')
      }

      setImportProgress(100)
      setImportResults(createData)
      setStep('complete')
      
      // Notify parent component
      if (onImportComplete) {
        onImportComplete(createData)
      }
    } catch (err) {
      console.error('Import error:', err)
      setError(err.message)
      setStep('preview')
    } finally {
      setLoading(false)
    }
  }

  // Enhanced club preview with data quality indicators
  const renderClubPreview = (club) => (
    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
      <div className="flex justify-between items-start">
        <div>
          <h4 className="font-medium text-gray-900">{club.name}</h4>
          <p className="text-sm text-gray-600">{club.formatted_address}</p>
        </div>
        <DataQualityBadge type="verified" />
      </div>
      
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-gray-500">Rating:</span>
          <span className="ml-2 font-medium">
            {club.rating ? `⭐ ${club.rating} (${club.user_ratings_total} reviews)` : 'No rating'}
          </span>
          <DataQualityBadge type="verified" />
        </div>
        
        <div>
          <span className="text-gray-500">Phone:</span>
          <span className="ml-2 font-medium">
            {club.formatted_phone_number || 'Not available'}
          </span>
          <DataQualityBadge type={club.formatted_phone_number ? 'verified' : 'missing'} />
        </div>
        
        <div>
          <span className="text-gray-500">Website:</span>
          <span className="ml-2 font-medium">
            {club.website ? 'Available' : 'Not listed'}
          </span>
          <DataQualityBadge type={club.website ? 'verified' : 'missing'} />
        </div>
        
        <div>
          <span className="text-gray-500">Photos:</span>
          <span className="ml-2 font-medium">
            {club.photos && club.photos.length > 0 ? `${club.photos.length} available` : 'None'}
          </span>
          <DataQualityBadge type={club.photos && club.photos.length > 0 ? 'verified' : 'missing'} />
        </div>
      </div>
    </div>
  )

  // Render search step
  const renderSearchStep = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Search Type
        </label>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => setSearchType('city')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              searchType === 'city'
                ? 'bg-parque-purple text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            City Name
          </button>
          <button
            onClick={() => setSearchType('url')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              searchType === 'url'
                ? 'bg-parque-purple text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Google Maps URL
          </button>
          <button
            onClick={() => setSearchType('coordinates')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              searchType === 'coordinates'
                ? 'bg-parque-purple text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Coordinates
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {searchType === 'city' && 'City Name'}
          {searchType === 'url' && 'Google Maps URL'}
          {searchType === 'coordinates' && 'Coordinates (lat,lng)'}
        </label>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          placeholder={
            searchType === 'city' ? 'e.g., Marbella' :
            searchType === 'url' ? 'https://maps.google.com/...' :
            '36.5099,-4.8863'
          }
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-parque-purple"
        />
      </div>

      {searchType !== 'url' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Search Radius: {(searchRadius / 1000).toFixed(1)} km
          </label>
          <input
            type="range"
            min="1000"
            max="20000"
            step="1000"
            value={searchRadius}
            onChange={(e) => setSearchRadius(parseInt(e.target.value))}
            className="w-full"
          />
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex">
          <svg className="h-5 w-5 text-blue-400 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <div className="text-sm text-blue-700">
            <p className="font-medium">Tips for better results:</p>
            <ul className="list-disc list-inside mt-1">
              <li>Use specific city names for better accuracy</li>
              <li>Adjust radius to include more clubs in surrounding areas</li>
              <li>Google Maps URLs work best for importing specific clubs</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )

  // ✨ UPDATED: Enhanced preview step with existence checking
  const renderPreviewStep = () => {
    const newClubs = searchResults.filter(club => !club.alreadyExists)
    const existingClubs = searchResults.filter(club => club.alreadyExists)
    
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            Found {searchResults.length} tennis clubs
          </h3>
          <button
            onClick={toggleSelectAll}
            disabled={newClubs.length === 0}
            className="text-sm text-parque-purple hover:text-purple-700 disabled:text-gray-400 disabled:cursor-not-allowed"
          >
            {selectedClubs.length === newClubs.length ? 'Deselect All' : 'Select All'}
          </button>
        </div>

        {/* ✨ NEW: Summary of results */}
        {existingSummary && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-2 text-sm">
            <div className="font-medium text-gray-900 mb-2">Search Results Summary:</div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-green-700 font-medium">✨ New clubs: {existingSummary.new}</span>
                <div className="text-gray-600">Ready to import</div>
              </div>
              <div>
                <span className="text-red-700 font-medium">🔄 Already added: {existingSummary.existing}</span>
                <div className="text-gray-600">Will be skipped</div>
              </div>
            </div>
            
            {existingSummary.existing > 0 && (
              <div className="mt-3 pt-2 border-t border-gray-300">
                <div className="text-gray-600">Match confidence:</div>
                <div className="flex space-x-4 mt-1">
                  {existingSummary.highConfidence > 0 && (
                    <span className="text-red-600">High: {existingSummary.highConfidence}</span>
                  )}
                  {existingSummary.mediumConfidence > 0 && (
                    <span className="text-yellow-600">Medium: {existingSummary.mediumConfidence}</span>
                  )}
                  {existingSummary.lowConfidence > 0 && (
                    <span className="text-orange-600">Low: {existingSummary.lowConfidence}</span>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Data source legend */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm">
          <span className="font-medium">Data that will be imported:</span>
          <span className="ml-4">✓ Name & Address</span>
          <span className="ml-4">✓ Coordinates</span>
          <span className="ml-4">✓ Phone & Website</span>
          <span className="ml-4">✓ Google Rating</span>
          <span className="ml-4">✓ Photos (if available)</span>
        </div>

        <div className="max-h-96 overflow-y-auto space-y-2 border border-gray-200 rounded-lg p-2">
          {searchResults.map((club) => (
            <div
              key={club.place_id}
              className={`flex items-start space-x-3 p-3 rounded-lg transition-colors ${
                club.alreadyExists 
                  ? 'bg-red-50 opacity-75' 
                  : 'hover:bg-gray-50'
              }`}
            >
              <input
                type="checkbox"
                checked={selectedClubs.includes(club.place_id)}
                onChange={() => toggleClubSelection(club.place_id)}
                disabled={club.alreadyExists}
                className={`mt-1 rounded focus:ring-parque-purple ${
                  club.alreadyExists 
                    ? 'text-gray-400 cursor-not-allowed' 
                    : 'text-parque-purple'
                }`}
              />
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 mr-2">
                    <h4 className={`font-medium ${club.alreadyExists ? 'text-gray-600' : 'text-gray-900'}`}>
                      {club.name}
                    </h4>
                    <p className="text-sm text-gray-600">{club.formatted_address}</p>
                  </div>
                  <ExistenceBadge club={club} />
                </div>
                
                <div className="flex items-center space-x-4 mt-1">
                  {club.rating && (
                    <span className="text-sm text-gray-500">
                      ⭐ {club.rating} ({club.user_ratings_total} reviews)
                    </span>
                  )}
                  {club.opening_hours && (
                    <span className="text-sm text-green-600">
                      {club.opening_hours.open_now ? '🟢 Open now' : '🔴 Closed'}
                    </span>
                  )}
                  {club.website && (
                    <span className="text-sm text-blue-600">🌐 Website</span>
                  )}
                  {club.formatted_phone_number && (
                    <span className="text-sm text-gray-600">📞 Phone</span>
                  )}
                  {club.photos && club.photos.length > 0 && (
                    <span className="text-sm text-purple-600">📷 {club.photos.length} photos</span>
                  )}
                </div>
                
                <ExistingClubDetails club={club} />
              </div>
            </div>
          ))}
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800 font-medium mb-2">
            ⚠️ Important: You&apos;ll need to add the following manually after import:
          </p>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• Club description and details</li>
            <li>• Number and type of courts</li>
            <li>• Amenities and facilities</li>
            <li>• Services offered</li>
            <li>• Pricing information</li>
            <li>• Email and social media links</li>
          </ul>
          <p className="text-sm text-yellow-800 mt-2 font-medium">
            Only verified data from Google will be imported. All other fields will remain empty until you add them.
          </p>
        </div>
      </div>
    )
  }

  // 🎾 UPDATED: Render importing step with standardized tennis preloader
  const renderImportingStep = () => (
    <div className="text-center py-8">
      <TennisPreloaderInline 
        size="xl" 
        text="Importing clubs..."
        locale="en"
        className="py-8"
      />
      <div className="w-full max-w-xs mx-auto bg-gray-200 rounded-full h-2.5 mt-6">
        <div 
          className="bg-parque-purple h-2.5 rounded-full transition-all duration-500"
          style={{ width: `${importProgress}%` }}
        ></div>
      </div>
      <p className="text-sm text-gray-500 mt-2">{importProgress}% Complete</p>
    </div>
  )

  // Enhanced complete step with data summary
  const renderCompleteStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Import Complete!</h3>
      </div>

      {importResults && (
        <div className="space-y-2 mb-6">
          <p className="text-green-600">
            ✅ Successfully imported {importResults.created} clubs
          </p>
          {importResults.failed > 0 && (
            <p className="text-red-600">
              ❌ Failed to import {importResults.failed} clubs
            </p>
          )}
          {importResults.duplicates > 0 && (
            <p className="text-yellow-600">
              ⚠️ Skipped {importResults.duplicates} duplicate clubs
            </p>
          )}
        </div>
      )}

      {/* Import summary */}
      <div className="space-y-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="font-medium text-green-900 mb-2">✓ Successfully Imported:</h4>
          <ul className="space-y-1 text-sm text-green-800">
            <li>• Club names and addresses</li>
            <li>• Exact GPS coordinates</li>
            <li>• Google ratings and review counts</li>
            <li>• Phone numbers (where available)</li>
            <li>• Websites (where available)</li>
            <li>• Google Maps links</li>
            <li>• Photos from Google (where available)</li>
          </ul>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">Next Steps:</h4>
          <ul className="space-y-1 text-sm text-blue-800">
            <li>1. Edit each club to add missing information</li>
            <li>2. Add court details (number, type, surface)</li>
            <li>3. Specify amenities and services</li>
            <li>4. Set pricing information</li>
            <li>5. Upload additional photos if needed</li>
            <li>6. Add club descriptions in Spanish/English</li>
          </ul>
        </div>
      </div>

      <div className="text-center pt-4">
        <button
          onClick={onClose}
          className="px-6 py-2 bg-parque-purple text-white rounded-lg hover:bg-parque-purple/90"
        >
          Done
        </button>
      </div>
    </div>
  )

  const newClubsCount = searchResults.filter(club => !club.alreadyExists).length

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Import from Google Maps</h2>
            </div>
            <button
              onClick={onClose}
              disabled={loading}
              className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-4 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 140px)' }}>
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg">
              {error}
            </div>
          )}

          {step === 'search' && renderSearchStep()}
          {step === 'preview' && renderPreviewStep()}
          {step === 'importing' && renderImportingStep()}
          {step === 'complete' && renderCompleteStep()}
        </div>

        {/* Footer */}
        {(step === 'search' || step === 'preview') && (
          <div className="px-6 py-4 border-t border-gray-200 flex justify-between">
            {step === 'preview' && (
              <button
                onClick={() => setStep('search')}
                disabled={loading}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50"
              >
                Back
              </button>
            )}
            <div className="flex space-x-3 ml-auto">
              <button
                onClick={onClose}
                disabled={loading}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50"
              >
                Cancel
              </button>
              {step === 'search' && (
                <button
                  onClick={handleSearch}
                  disabled={loading || !searchQuery.trim()}
                  className="px-4 py-2 bg-parque-purple text-white rounded-lg hover:bg-parque-purple/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {loading ? (
                    <TennisPreloaderSmall locale="en" />
                  ) : (
                    <span>Search</span>
                  )}
                </button>
              )}
              {step === 'preview' && (
                <button
                  onClick={handleImport}
                  disabled={loading || selectedClubs.length === 0}
                  className="px-4 py-2 bg-parque-purple text-white rounded-lg hover:bg-parque-purple/90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Import {selectedClubs.length} Club{selectedClubs.length !== 1 ? 's' : ''}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
