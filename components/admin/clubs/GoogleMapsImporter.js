'use client'

import { useState } from 'react'

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
      setSelectedClubs(data.clubs?.map(club => club.place_id) || [])
      setStep('preview')
    } catch (err) {
      console.error('Search error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Toggle club selection
  const toggleClubSelection = (placeId) => {
    setSelectedClubs(prev => 
      prev.includes(placeId) 
        ? prev.filter(id => id !== placeId)
        : [...prev, placeId]
    )
  }

  // Select/deselect all
  const toggleSelectAll = () => {
    if (selectedClubs.length === searchResults.length) {
      setSelectedClubs([])
    } else {
      setSelectedClubs(searchResults.map(club => club.place_id))
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

  // Render preview step
  const renderPreviewStep = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">
          Found {searchResults.length} tennis clubs
        </h3>
        <button
          onClick={toggleSelectAll}
          className="text-sm text-parque-purple hover:text-purple-700"
        >
          {selectedClubs.length === searchResults.length ? 'Deselect All' : 'Select All'}
        </button>
      </div>

      <div className="max-h-96 overflow-y-auto space-y-2 border border-gray-200 rounded-lg p-2">
        {searchResults.map((club) => (
          <div
            key={club.place_id}
            className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <input
              type="checkbox"
              checked={selectedClubs.includes(club.place_id)}
              onChange={() => toggleClubSelection(club.place_id)}
              className="mt-1 rounded text-parque-purple focus:ring-parque-purple"
            />
            <div className="flex-1">
              <h4 className="font-medium text-gray-900">{club.name}</h4>
              <p className="text-sm text-gray-600">{club.formatted_address}</p>
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
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-sm text-yellow-800">
          <strong>Note:</strong> After import, you'll need to manually add court information and verify other details.
        </p>
      </div>
    </div>
  )

  // Render importing step
  const renderImportingStep = () => (
    <div className="text-center py-8">
      <div className="inline-flex items-center justify-center w-16 h-16 bg-parque-purple rounded-full mb-4">
        <svg className="w-8 h-8 text-white animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">Importing Clubs...</h3>
      <p className="text-gray-600 mb-4">This may take a few moments</p>
      <div className="w-full max-w-xs mx-auto bg-gray-200 rounded-full h-2.5">
        <div 
          className="bg-parque-purple h-2.5 rounded-full transition-all duration-500"
          style={{ width: `${importProgress}%` }}
        ></div>
      </div>
      <p className="text-sm text-gray-500 mt-2">{importProgress}% Complete</p>
    </div>
  )

  // Render complete step
  const renderCompleteStep = () => (
    <div className="text-center py-8">
      <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">Import Complete!</h3>
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
      <button
        onClick={onClose}
        className="px-6 py-2 bg-parque-purple text-white rounded-lg hover:bg-parque-purple/90"
      >
        Done
      </button>
    </div>
  )

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
        <div className="px-6 py-4">
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
                  {loading && (
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  )}
                  <span>Search</span>
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
